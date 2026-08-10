/**
 * Modelo de Usuario — PostgreSQL (pg)
 *
 * Equivalencias con la versión MongoDB:
 *  - unique: true (schema)     → UNIQUE en la tabla + captura del código 23505
 *  - error 11000 (duplicate)   → error.code === '23505' (unique_violation)
 *  - findOneAndUpdate(upsert)  → INSERT ... ON CONFLICT DO UPDATE
 *  - pre('save') hash          → hash explícito antes del INSERT/UPDATE
 *  - toSafeObject()            → _toSafe() (misma forma de salida)
 *
 * SOLID: SRP — solo define el acceso a datos del usuario. La misma API
 * estática (create, findByEmail, findById, ...) se mantiene para que
 * UserRepository y los controladores no necesiten ningún cambio.
 */

import bcrypt from 'bcrypt';
import { pool } from '../config/database.js';

const SALT_ROUNDS = 10;

class User {

    // ── create ─────────────────────────────────────────────────────────────
    static async create({ username, email, password, role = 'student' }) {
        const hashed = await bcrypt.hash(password, SALT_ROUNDS);
        try {
            const { rows } = await pool.query(
                `INSERT INTO users (username, email, password, role)
                 VALUES ($1, $2, $3, $4)
                 RETURNING id, username, email, role, created_at`,
                [username, email, hashed, role]
            );
            return rows[0];
        } catch (error) {
            if (error.code === '23505') {
                if (error.constraint?.includes('email')) throw new Error('El email ya está registrado');
                if (error.constraint?.includes('username')) throw new Error('El nombre de usuario ya está en uso');
            }
            throw error;
        }
    }

    // ── findOrCreate ──────────────────────────────────────────────────────
    static async findOrCreate({ username, email, password, role = 'student' }) {
        const existing = await User.findByEmail(email);
        if (existing) {
            return { user: _toSafe(existing), created: false };
        }
        const user = await User.create({ username, email, password, role });
        return { user, created: true };
    }

    // ── Búsquedas ─────────────────────────────────────────────────────────
    static async findByEmail(email) {
        // Incluimos password para la verificación de login
        const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        return rows[0] || null;
    }

    static async findById(id) {
        try {
            const { rows } = await pool.query(
                'SELECT id, username, email, role, created_at FROM users WHERE id = $1',
                [id]
            );
            return rows[0] || null;
        } catch {
            return null; // id inválido
        }
    }

    static async findByUsername(username) {
        const { rows } = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
        return rows[0] || null;
    }

    static async findAll() {
        const { rows } = await pool.query(
            'SELECT id, username, email, role, created_at FROM users ORDER BY created_at DESC'
        );
        return rows;
    }

    static async findByRole(role) {
        const { rows } = await pool.query(
            'SELECT id, username, email, role, created_at FROM users WHERE role = $1 ORDER BY created_at DESC',
            [role]
        );
        return rows;
    }

    // ── Verificar contraseña ─────────────────────────────────────────────
    static async verifyPassword(plainPassword, hashedPassword) {
        return bcrypt.compare(plainPassword, hashedPassword);
    }

    // ── Actualizar usuario ────────────────────────────────────────────────
    static async update(id, { username, email, role }) {
        try {
            // Verificar colisiones de email/username con otros usuarios
            if (email) {
                const { rows } = await pool.query(
                    'SELECT id FROM users WHERE email = $1 AND id != $2', [email, id]
                );
                if (rows.length) throw new Error('El email ya está en uso');
            }
            if (username) {
                const { rows } = await pool.query(
                    'SELECT id FROM users WHERE username = $1 AND id != $2', [username, id]
                );
                if (rows.length) throw new Error('El nombre de usuario ya está en uso');
            }

            const fields = [];
            const values = [];
            let i = 1;
            if (username !== undefined) { fields.push(`username = $${i++}`); values.push(username); }
            if (email !== undefined) { fields.push(`email = $${i++}`); values.push(email); }
            if (role !== undefined) { fields.push(`role = $${i++}`); values.push(role); }

            if (!fields.length) return User.findById(id);

            values.push(id);
            const { rows } = await pool.query(
                `UPDATE users SET ${fields.join(', ')} WHERE id = $${i}
                 RETURNING id, username, email, role, created_at`,
                values
            );
            return rows[0] || null;
        } catch (error) {
            if (error.code === '23505') {
                throw new Error(
                    error.constraint?.includes('email')
                        ? 'El email ya está en uso'
                        : 'El nombre de usuario ya está en uso'
                );
            }
            throw error;
        }
    }

    // ── Actualizar contraseña ───────────────────────────────────────────────
    static async updatePassword(id, newPassword) {
        const hashed = await bcrypt.hash(newPassword, SALT_ROUNDS);
        const { rows } = await pool.query(
            'UPDATE users SET password = $1 WHERE id = $2 RETURNING id',
            [hashed, id]
        );
        return rows[0] || null;
    }

    // ── Eliminar ─────────────────────────────────────────────────────────
    static async delete(id) {
        try {
            const { rows } = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);
            return rows[0] || null;
        } catch {
            return null;
        }
    }

    // ── Estadísticas ─────────────────────────────────────────────────────
    static async getStatistics() {
        const { rows } = await pool.query(`
            SELECT
                COUNT(*)::int                                                            AS total_users,
                COUNT(*) FILTER (WHERE role = 'admin')::int                               AS admins,
                COUNT(*) FILTER (WHERE role = 'teacher')::int                             AS teachers,
                COUNT(*) FILTER (WHERE role = 'student')::int                             AS students,
                COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days')::int      AS new_this_week,
                COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days')::int     AS new_this_month
            FROM users
        `);
        return rows[0];
    }

    static async countByRole() {
        const { rows } = await pool.query(
            'SELECT role, COUNT(*)::int AS count FROM users GROUP BY role'
        );
        return rows;
    }
}

// ─── Helper interno: serialización segura (sin password) ────────────────────
function _toSafe(user) {
    if (!user) return null;
    const { password, ...safe } = user;
    return safe;
}

export default User;
