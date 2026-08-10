/**
 * Seed — Crea el usuario administrador por defecto en PostgreSQL.
 *
 * Idempotente: si el admin ya existe, no hace nada (ON CONFLICT DO NOTHING).
 * Requiere que init.sql ya se haya ejecutado sobre la base de datos.
 *
 * Ejecutar una sola vez:
 *   node databases/seed.js
 *   o con npm:
 *   npm run seed
 */

import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import { pool, closePool } from '../config/database.js';

dotenv.config();

const seed = async () => {
    try {
        const { rows: existing } = await pool.query(
            'SELECT id FROM users WHERE email = $1', ['admin@gmail.com']
        );

        if (existing.length) {
            console.log('✓ El usuario admin ya existe. No se realizaron cambios.');
            return;
        }

        const hashedPassword = await bcrypt.hash('admin123', 10);
        await pool.query(
            `INSERT INTO users (username, email, password, role)
             VALUES ($1, $2, $3, $4)
             ON CONFLICT (email) DO NOTHING`,
            ['admin', 'admin@gmail.com', hashedPassword, 'admin']
        );

        console.log('✓ Usuario administrador creado:');
        console.log('  Email:    admin@gmail.com');
        console.log('  Password: admin123');
        console.log('  ⚠️  Cambia la contraseña en producción.');
    } catch (error) {
        console.error('Error en seed:', error.message);
    } finally {
        await closePool();
    }
};

seed();
