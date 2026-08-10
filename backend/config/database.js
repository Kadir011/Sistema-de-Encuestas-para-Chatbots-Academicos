/**
 * Conexión a PostgreSQL (Neon) con pg
 *
 * Reemplaza la conexión Mongoose/MongoDB Atlas. Se usa un Pool de `pg`
 * apuntando al connection string "pooler" de Neon (PgBouncer en modo
 * transaction), por lo que cada query toma y libera una conexión corta.
 *
 * Equivalencias con la versión MongoDB:
 *  - mongoose.connect()          → new Pool() + pool.connect()
 *  - maxPoolSize                 → max
 *  - session.withTransaction()   → BEGIN / COMMIT / ROLLBACK sobre un client dedicado
 *  - Promise.all()                → queryParallel() (sin cambios)
 */

import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// ─── Pool de conexiones ─────────────────────────────────────────────────────
export const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    // Neon exige SSL; con el pooler basta con no verificar el certificado local.
    ssl: { rejectUnauthorized: false },
    max: process.env.DB_POOL_MAX ? parseInt(process.env.DB_POOL_MAX) : 10,
    connectionTimeoutMillis: process.env.DB_CONN_TIMEOUT
        ? parseInt(process.env.DB_CONN_TIMEOUT)
        : 5000,
    idleTimeoutMillis: process.env.DB_IDLE_TIMEOUT
        ? parseInt(process.env.DB_IDLE_TIMEOUT)
        : 30000,
});

pool.on('error', (err) => {
    // Errores en clientes ociosos del pool (p.ej. el servidor cierra la conexión).
    console.error('Error inesperado en el pool de PostgreSQL:', err.message);
});

// ─── Conexión inicial (equivalente a connectDB() de Mongoose) ────────────────
export const connectDB = async () => {
    try {
        const { rows } = await pool.query('SELECT current_database() AS db, NOW() AS now');
        console.log(`PostgreSQL (Neon) conectado`);
        console.log(`Base de datos: ${rows[0].db}`);
        return true;
    } catch (error) {
        console.error('Error al conectar con PostgreSQL:', error.message);
        return false;
    }
};

// ─── Test de conexión ─────────────────────────────────────────────────────────
export const testConnection = async () => {
    try {
        await pool.query('SELECT 1');
        return true;
    } catch (error) {
        console.error('Error al verificar conexión:', error.message);
        return false;
    }
};

// ─── Query simple con un client del pool (helper interno para los modelos) ───
export const query = (text, params) => pool.query(text, params);

// ─── Transacción con reintentos ante conflictos de escritura ─────────────────
/**
 * Ejecuta una función dentro de una transacción usando un client dedicado.
 * Reintenta automáticamente ante errores transitorios de serialización
 * (40001) o deadlock (40P01), igual que el manejo de WriteConflict de Mongo.
 *
 * @param {Function} callback - async (client) => result
 * @param {number}   maxRetries
 */
export const transaction = async (callback, maxRetries = 3) => {
    let attempt = 0;

    while (attempt < maxRetries) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            const result = await callback(client);
            await client.query('COMMIT');
            return result;
        } catch (error) {
            await client.query('ROLLBACK').catch(() => {});

            const isRetriable = error.code === '40001' || error.code === '40P01';
            attempt++;

            if (isRetriable && attempt < maxRetries) {
                const delay = Math.pow(2, attempt) * 100;
                console.warn(
                    `Conflicto de escritura detectado, reintentando en ${delay}ms ` +
                    `(intento ${attempt}/${maxRetries})`
                );
                await new Promise(resolve => setTimeout(resolve, delay));
                continue;
            }

            throw error;
        } finally {
            client.release();
        }
    }
};

// ─── Queries paralelas (sin cambio, sigue usando Promise.all) ────────────────
export const queryParallel = async (queries) => Promise.all(queries);

// ─── Cerrar pool ───────────────────────────────────────────────────────────
export const closePool = async () => {
    try {
        await pool.end();
        console.log('Pool de PostgreSQL cerrado correctamente');
    } catch (error) {
        console.error('Error al cerrar el pool:', error.message);
    }
};

export default pool;
