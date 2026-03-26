/**
 * Modelo de usuario con idempotencia y concurrencia
 * 
 * MEJORAS APLICADAS:
 * - create(): INSERT con ON CONFLICT DO NOTHING → idempotente por email y username
 * - findOrCreate(): retorna el usuario existente si ya existe (idempotencia total)
 * - update(): utiliza transacción para actualizaciones seguras bajo concurrencia
 * - getStatistics(): queries en paralelo para mejor rendimiento concurrente
 */

import { query, queryIdempotent, transaction, queryParallel } from '../config/database.js';
import bcrypt from 'bcrypt';

class User {

    // ─── Crear usuario (idempotente) ──────────────────────────────────────────
    /**
     * Crea un nuevo usuario de forma idempotente.
     * Si ya existe un usuario con el mismo email o username, lanza un error
     * descriptivo en lugar de un error genérico de PostgreSQL.
     * 
     * Bajo concurrencia: dos requests simultáneos con el mismo email
     * NO crearán duplicados; el segundo recibirá el error de conflicto.
     */
    static async create({ username, email, password, role = 'student' }) {
        try {
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(password, saltRounds);

            // ON CONFLICT DO NOTHING: si el email o username ya existen,
            // no inserta nada y retorna 0 filas (en lugar de lanzar excepción).
            const text = `
                INSERT INTO users (username, email, password, role)
                VALUES ($1, $2, $3, $4)
                ON CONFLICT (email) DO NOTHING
                RETURNING id, username, email, role, created_at
            `;
            const values = [username, email, hashedPassword, role];

            const result = await queryIdempotent(text, values);

            // Si no se insertó ninguna fila, el email ya existía
            if (result.rowCount === 0) {
                throw new Error('El email ya está registrado');
            }

            return result.rows[0];
        } catch (error) {
            if (error.code === '23505') {
                if (error.constraint === 'users_email_key') {
                    throw new Error('El email ya está registrado');
                }
                if (error.constraint === 'users_username_key') {
                    throw new Error('El nombre de usuario ya está en uso');
                }
            }
            throw error;
        }
    }

    // ─── findOrCreate (idempotencia total) ────────────────────────────────────
    /**
     * Busca un usuario por email; si no existe, lo crea.
     * Retorna { user, created: boolean }.
     * 
     * Es 100% idempotente: llamarlo N veces con los mismos datos
     * siempre retorna el mismo usuario con el mismo id.
     * 
     * Seguro bajo concurrencia gracias a ON CONFLICT DO UPDATE.
     */
    static async findOrCreate({ username, email, password, role = 'student' }) {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const text = `
            INSERT INTO users (username, email, password, role)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (email) DO UPDATE
                SET username = EXCLUDED.username
            RETURNING id, username, email, role, created_at,
                      (xmax = 0) AS created
        `;
        const values = [username, email, hashedPassword, role];

        const result = await queryIdempotent(text, values);
        const row = result.rows[0];

        return {
            user: {
                id: row.id,
                username: row.username,
                email: row.email,
                role: row.role,
                created_at: row.created_at
            },
            created: row.created  // true si se creó ahora, false si ya existía
        };
    }

    // ─── Búsquedas simples ────────────────────────────────────────────────────
    static async findByEmail(email) {
        try {
            const text = `SELECT id, username, email, password, role, created_at FROM users WHERE email = $1`;
            const result = await query(text, [email]);
            return result.rows[0];
        } catch (error) {
            throw new Error(`Error al buscar usuario por email: ${error.message}`);
        }
    }

    static async findById(id) {
        try {
            const text = `SELECT id, username, email, role, created_at FROM users WHERE id = $1`;
            const result = await query(text, [id]);
            return result.rows[0];
        } catch (error) {
            throw new Error(`Error al buscar usuario por ID: ${error.message}`);
        }
    }

    static async findByUsername(username) {
        try {
            const text = `SELECT id, username, email, password, role, created_at FROM users WHERE username = $1`;
            const result = await query(text, [username]);
            return result.rows[0];
        } catch (error) {
            throw new Error(`Error al buscar usuario: ${error.message}`);
        }
    }

    // ─── Verificar contraseña ─────────────────────────────────────────────────
    static async verifyPassword(plainPassword, hashedPassword) {
        try {
            return await bcrypt.compare(plainPassword, hashedPassword);
        } catch (error) {
            throw new Error(`Error al verificar contraseña: ${error.message}`);
        }
    }

    // ─── Listar todos los usuarios ────────────────────────────────────────────
    static async findAll() {
        try {
            const text = `SELECT id, username, email, role, created_at FROM users ORDER BY created_at DESC`;
            const result = await query(text);
            return result.rows;
        } catch (error) {
            throw new Error(`Error al obtener usuarios: ${error.message}`);
        }
    }

    static async findByRole(role) {
        try {
            const text = `SELECT id, username, email, role, created_at FROM users WHERE role = $1 ORDER BY created_at DESC`;
            const result = await query(text, [role]);
            return result.rows;
        } catch (error) {
            throw new Error(`Error al obtener usuarios por rol: ${error.message}`);
        }
    }

    // ─── Actualizar usuario (con transacción para concurrencia) ───────────────
    /**
     * Actualiza el usuario dentro de una transacción.
     * Bajo concurrencia, si dos requests intentan actualizar el mismo usuario
     * simultáneamente, la transacción garantiza que los cambios se apliquen
     * de forma secuencial y sin corrupción de datos.
     */
    static async update(id, { username, email, role }) {
        try {
            return await transaction(async (client) => {
                // Verificar que el email no esté en uso por otro usuario
                if (email) {
                    const emailCheck = await client.query(
                        'SELECT id FROM users WHERE email = $1 AND id != $2',
                        [email, id]
                    );
                    if (emailCheck.rowCount > 0) {
                        throw new Error('El email ya está en uso');
                    }
                }

                // Verificar que el username no esté en uso por otro usuario
                if (username) {
                    const usernameCheck = await client.query(
                        'SELECT id FROM users WHERE username = $1 AND id != $2',
                        [username, id]
                    );
                    if (usernameCheck.rowCount > 0) {
                        throw new Error('El nombre de usuario ya está en uso');
                    }
                }

                const text = `
                    UPDATE users 
                    SET 
                        username = COALESCE($1, username),
                        email    = COALESCE($2, email),
                        role     = COALESCE($3, role)
                    WHERE id = $4
                    RETURNING id, username, email, role, created_at
                `;
                const result = await client.query(text, [username, email, role, id]);
                return result.rows[0];
            });
        } catch (error) {
            throw error;
        }
    }

    // ─── Actualizar contraseña ────────────────────────────────────────────────
    static async updatePassword(id, newPassword) {
        try {
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
            const text = `UPDATE users SET password = $1 WHERE id = $2 RETURNING id`;
            const result = await query(text, [hashedPassword, id]);
            return result.rows[0];
        } catch (error) {
            throw new Error(`Error al actualizar contraseña: ${error.message}`);
        }
    }

    // ─── Eliminar usuario ─────────────────────────────────────────────────────
    static async delete(id) {
        try {
            const text = 'DELETE FROM users WHERE id = $1 RETURNING id';
            const result = await query(text, [id]);
            return result.rows[0];
        } catch (error) {
            throw new Error(`Error al eliminar usuario: ${error.message}`);
        }
    }

    // ─── Estadísticas (queries paralelas) ────────────────────────────────────
    /**
     * Obtiene estadísticas lanzando todas las queries simultáneamente.
     * queryParallel() usa Promise.all internamente: en lugar de ejecutar
     * cada COUNT(*) de forma secuencial, todas corren en paralelo.
     */
    static async countByRole() {
        try {
            const text = `SELECT role, COUNT(*) as count FROM users GROUP BY role`;
            const result = await query(text);
            return result.rows;
        } catch (error) {
            throw new Error(`Error al contar usuarios: ${error.message}`);
        }
    }

    static async getStatistics() {
        try {
            const text = `
                SELECT 
                    COUNT(*) AS total_users,
                    COUNT(CASE WHEN role = 'admin' THEN 1 END) AS admins,
                    COUNT(CASE WHEN role = 'teacher' THEN 1 END) AS teachers,
                    COUNT(CASE WHEN role = 'student' THEN 1 END) AS students,
                    COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) AS new_this_week,
                    COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) AS new_this_month
                FROM users
            `;
            const result = await query(text);
            return result.rows[0];
        } catch (error) {
            throw new Error(`Error al obtener estadísticas: ${error.message}`);
        }
    }
}

export default User;