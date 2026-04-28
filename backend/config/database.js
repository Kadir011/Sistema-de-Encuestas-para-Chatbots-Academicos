/**
 * Conexión a MongoDB Atlas con Mongoose
 *
 * Reemplaza el pool de pg. Mongoose gestiona su propio pool de conexiones
 * internamente a través del driver nativo de MongoDB.
 *
 * Equivalencias con la versión PostgreSQL:
 *  - pool de conexiones  → opción maxPoolSize en Mongoose
 *  - transaction()       → mongoose.startSession() + session.withTransaction()
 *  - queryParallel()     → Promise.all (sin cambios, igual que antes)
 *  - queryIdempotent()   → unique indexes en los schemas + { upsert } en queries
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// ─── Conexión ─────────────────────────────────────────────────────────────────
export const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.DATABASE_URL, {
            dbName: 'chatbots_system',
            maxPoolSize: process.env.DB_POOL_MAX ? parseInt(process.env.DB_POOL_MAX) : 10,
            serverSelectionTimeoutMS: process.env.DB_CONN_TIMEOUT
                ? parseInt(process.env.DB_CONN_TIMEOUT)
                : 5000,
            socketTimeoutMS: process.env.DB_IDLE_TIMEOUT
                ? parseInt(process.env.DB_IDLE_TIMEOUT)
                : 30000,
        });

        console.log(`MongoDB Atlas conectado: ${conn.connection.host}`);
        console.log(`Base de datos: ${conn.connection.name}`);
        return true;
    } catch (error) {
        console.error('Error al conectar con MongoDB Atlas:', error.message);
        return false;
    }
};

// ─── Test de conexión (equivalente al testConnection() de pg) ─────────────────
export const testConnection = async () => {
    try {
        if (mongoose.connection.readyState === 1) {
            console.log('Conexión activa a MongoDB Atlas');
            return true;
        }
        return await connectDB();
    } catch (error) {
        console.error('Error al verificar conexión:', error.message);
        return false;
    }
};

// ─── Transacción con reintentos (equivalente a transaction() de pg) ───────────
/**
 * Ejecuta una función dentro de una sesión transaccional de MongoDB.
 * Reintenta automáticamente ante errores de escritura transitoria (código 112)
 * o fallos de transacción (código 251).
 *
 * @param {Function} callback - async (session) => result
 * @param {number}   maxRetries
 */
export const transaction = async (callback, maxRetries = 3) => {
    let attempt = 0;

    while (attempt < maxRetries) {
        const session = await mongoose.startSession();
        try {
            let result;
            await session.withTransaction(async () => {
                result = await callback(session);
            });
            session.endSession();
            return result;
        } catch (error) {
            session.endSession();

            // Códigos de error transitorio de MongoDB
            const isRetriable =
                error.code === 112 ||   // WriteConflict
                error.code === 251 ||   // NoSuchTransaction
                error.errorLabels?.includes('TransientTransactionError');

            attempt++;

            if (isRetriable && attempt < maxRetries) {
                const delay = Math.pow(2, attempt) * 100;
                console.warn(
                    `WriteConflict detectado, reintentando en ${delay}ms ` +
                    `(intento ${attempt}/${maxRetries})`
                );
                await new Promise(resolve => setTimeout(resolve, delay));
                continue;
            }

            throw error;
        }
    }
};

// ─── Queries paralelas (sin cambio, sigue usando Promise.all) ─────────────────
export const queryParallel = async (queries) => Promise.all(queries);

// ─── Cerrar conexión ──────────────────────────────────────────────────────────
export const closePool = async () => {
    try {
        await mongoose.disconnect();
        console.log('Conexión a MongoDB cerrada correctamente');
    } catch (error) {
        console.error('Error al cerrar la conexión:', error.message);
    }
};

export default mongoose;