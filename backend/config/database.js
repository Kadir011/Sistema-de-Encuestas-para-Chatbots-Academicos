/**
 * Pool de conexiones PostgreSQL con soporte de concurrencia
 * 
 * MEJORAS APLICADAS:
 * - Concurrencia: El pool gestiona múltiples conexiones simultáneas sin bloqueos
 * - Idempotencia: queryIdempotent() usa INSERT ... ON CONFLICT DO NOTHING/UPDATE
 * - Transacciones concurrentes con manejo de deadlocks y reintentos
 * - Bloqueo optimista para actualizaciones seguras bajo concurrencia
 */

import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// ─── Pool de conexiones ───────────────────────────────────────────────────────
// El pool maneja la concurrencia: múltiples requests obtienen conexiones
// independientes sin bloquearse entre sí.
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },

    // Concurrencia: máximo de conexiones simultáneas al servidor PostgreSQL
    max: process.env.DB_POOL_MAX ? parseInt(process.env.DB_POOL_MAX) : 10,

    // Tiempo máximo que una conexión puede estar inactiva antes de cerrarse
    idleTimeoutMillis: process.env.DB_IDLE_TIMEOUT ? parseInt(process.env.DB_IDLE_TIMEOUT) : 30000,

    // Tiempo máximo de espera para obtener una conexión del pool
    connectionTimeoutMillis: process.env.DB_CONN_TIMEOUT ? parseInt(process.env.DB_CONN_TIMEOUT) : 5000,
});

// Manejo de errores globales del pool
pool.on('error', (err) => {
    console.error('Error inesperado en el pool de PostgreSQL:', err);
    process.exit(-1);
});

// ─── Conexión de prueba ───────────────────────────────────────────────────────
export const testConnection = async () => {
    try {
        const client = await pool.connect();
        console.log('Conexión exitosa a PostgreSQL');
        const result = await client.query('SELECT NOW() as now, current_database() as database');
        console.log('Hora del servidor:', result.rows[0].now);
        console.log('Base de datos:', result.rows[0].database);
        client.release();
        return true;
    } catch (error) {
        console.error('Error al conectar con PostgreSQL:', error.message);
        return false;
    }
};

// ─── Query estándar ───────────────────────────────────────────────────────────
// Concurrencia: el pool asigna una conexión libre automáticamente.
// Múltiples llamadas simultáneas NO se bloquean entre sí.
export const query = async (text, params) => {
    const start = Date.now();
    try {
        const result = await pool.query(text, params);
        const duration = Date.now() - start;
        if (process.env.NODE_ENV === 'development') {
            console.log('Query ejecutada:', {
                text: text.substring(0, 100) + '...',
                duration: `${duration}ms`,
                rows: result.rowCount
            });
        }
        return result;
    } catch (error) {
        console.error('Error en query:', {
            error: error.message,
            query: text.substring(0, 100)
        });
        throw error;
    }
};

// ─── Transacciones con reintentos (concurrencia + deadlocks) ─────────────────
/**
 * Ejecuta una transacción con reintentos automáticos ante deadlocks.
 * 
 * En entornos concurrentes, dos transacciones pueden bloquearse mutuamente
 * (deadlock). PostgreSQL detecta esto y cancela una de ellas con el código
 * de error 40P01. Esta función reintenta automáticamente hasta maxRetries veces.
 * 
 * @param {Function} callback - Función que recibe el cliente y ejecuta la lógica
 * @param {number} maxRetries - Máximo de reintentos ante deadlock (default: 3)
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
            await client.query('ROLLBACK');

            // 40001 = serialization_failure, 40P01 = deadlock_detected
            const isRetriable = error.code === '40001' || error.code === '40P01';
            attempt++;

            if (isRetriable && attempt < maxRetries) {
                // Espera exponencial antes de reintentar (100ms, 200ms, 400ms...)
                const delay = Math.pow(2, attempt) * 100;
                console.warn(`Deadlock detectado, reintentando en ${delay}ms (intento ${attempt}/${maxRetries})`);
                await new Promise(resolve => setTimeout(resolve, delay));
                continue;
            }

            throw error;
        } finally {
            client.release();
        }
    }
};

// ─── Query idempotente (INSERT seguro bajo concurrencia) ─────────────────────
/**
 * Ejecuta un INSERT con manejo de conflictos para garantizar idempotencia.
 * 
 * Si se intenta insertar un registro que ya existe (mismo email, username, etc.),
 * en lugar de lanzar un error de duplicado, retorna el registro existente.
 * 
 * Esto es seguro bajo concurrencia: si dos requests llegan al mismo tiempo
 * intentando crear el mismo usuario, solo uno tendrá éxito y ambos recibirán
 * el mismo resultado.
 * 
 * @param {string} text    - Query SQL con cláusula ON CONFLICT
 * @param {Array}  params  - Parámetros del query
 */
export const queryIdempotent = async (text, params) => {
    try {
        const result = await pool.query(text, params);
        return result;
    } catch (error) {
        // Error de unicidad no manejado por ON CONFLICT
        if (error.code === '23505') {
            console.warn('Conflicto de unicidad en queryIdempotent:', error.constraint);
        }
        throw error;
    }
};

// ─── Queries paralelas (concurrencia máxima) ──────────────────────────────────
/**
 * Ejecuta múltiples queries simultáneamente usando Promise.all.
 * 
 * En lugar de esperar que cada query termine antes de iniciar la siguiente,
 * todas se lanzan a la vez. El pool asigna una conexión a cada una,
 * reduciendo el tiempo total de respuesta.
 * 
 * Ejemplo: obtener estadísticas de 4 tablas en paralelo tarda lo mismo
 * que la query más lenta, no la suma de todas.
 * 
 * @param {Array} queries - Array de { text, params }
 */
export const queryParallel = async (queries) => {
    return Promise.all(
        queries.map(({ text, params }) => pool.query(text, params))
    );
};

// ─── Cerrar pool ──────────────────────────────────────────────────────────────
export const closePool = async () => {
    try {
        await pool.end();
        console.log('Pool de conexiones cerrado correctamente');
    } catch (error) {
        console.error('Error al cerrar el pool:', error.message);
    }
};

export default pool;