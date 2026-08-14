/**
 * Migrate — Aplica databases/init.sql sobre la base de datos indicada en
 * DATABASE_URL. Es seguro ejecutarlo varias veces: todas las sentencias
 * usan IF NOT EXISTS / CREATE TABLE IF NOT EXISTS.
 *
 * Ejecutar:
 *   node databases/migrate.js
 *   o con npm:
 *   npm run migrate
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';
import { pool, closePool } from '../config/database.js';

dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));

const migrate = async () => {
    try {
        const sql = readFileSync(join(__dirname, 'init.sql'), 'utf-8');
        await pool.query(sql);
        console.log('✓ Esquema aplicado correctamente.');
    } catch (error) {
        console.error('Error al aplicar el esquema:', error.message);
        process.exitCode = 1;
    } finally {
        await closePool();
    }
};

migrate();
