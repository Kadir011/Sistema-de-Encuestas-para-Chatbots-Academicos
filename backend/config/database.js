import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Configuración del pool de conexiones a PostgreSQL
const pool = new Pool({
    user: process.env.DB_USERNAME || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_DATABASE || 'postgres',
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT || 5432,
    max: process.env.DB_POOL_MAX ? parseInt(process.env.DB_POOL_MAX, 10) : 10,
    idleTimeoutMillis: process.env.DB_IDLE_TIMEOUT ? parseInt(process.env.DB_IDLE_TIMEOUT, 10) : 30000,
    connectionTimeoutMillis: process.env.DB_CONN_TIMEOUT ? parseInt(process.env.DB_CONN_TIMEOUT, 10) : 5000,
    ssl: { rejectUnauthorized: false }
});

// Manejo de errores del pool
pool.on('error', (err) => {
    console.error('Error inesperado en el pool de PostgreSQL:', err);
    process.exit(-1);
});

// Función para probar la conexión
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

// Función para ejecutar queries con manejo de errores y logging
export const query = async (text, params) => {
    const start = Date.now();
    try {
        const result = await pool.query(text, params);
        const duration = Date.now() - start;
        
        // Log solo en desarrollo
        if (process.env.NODE_ENV === 'development') {
            console.log('Query ejecutada:', {
                text: text.substring(0, 100) + '...',
                duration: `${duration}ms`,
                rows: result.rowCount
            });
        }
        
        return result;
    } catch (error) {
        console.error('❌ Error en query:', {
            error: error.message,
            query: text.substring(0, 100)
        });
        throw error;
    }
};

// Función para transacciones
export const transaction = async (callback) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const result = await callback(client);
        await client.query('COMMIT');
        return result;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

// Cerrar el pool de conexiones de forma segura
export const closePool = async () => {
    try {
        await pool.end();
        console.log('🔌 Pool de conexiones cerrado correctamente');
    } catch (error) {
        console.error('❌ Error al cerrar el pool:', error.message);
    }
};

export default pool;