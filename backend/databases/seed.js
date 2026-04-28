/**
 * Seed — Crea el usuario administrador por defecto en MongoDB.
 *
 * Equivale al INSERT INTO users del init.sql de PostgreSQL.
 * Es idempotente: si el admin ya existe, no hace nada.
 *
 * Ejecutar una sola vez:
 *   node database/seed.js
 *   o con npm:
 *   npm run seed
 */

import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

const userSchema = new mongoose.Schema(
    {
        username: String,
        email: { type: String, unique: true },
        password: String,
        role: String,
    },
    { timestamps: { createdAt: 'created_at', updatedAt: false }, versionKey: false }
);

const User = mongoose.model('User', userSchema, 'users');

const seed = async () => {
    try {
        await mongoose.connect(process.env.DATABASE_URL, { dbName: 'chatbots_system' });
        console.log('Conectado a MongoDB Atlas');

        const existing = await User.findOne({ email: 'admin@gmail.com' });
        if (existing) {
            console.log('✓ El usuario admin ya existe. No se realizaron cambios.');
            await mongoose.disconnect();
            return;
        }

        const hashedPassword = await bcrypt.hash('admin123', 10);
        await User.create({
            username: 'admin',
            email: 'admin@gmail.com',
            password: hashedPassword,
            role: 'admin',
        });

        console.log('✓ Usuario administrador creado:');
        console.log('  Email:    admin@gmail.com');
        console.log('  Password: admin123');
        console.log('  ⚠️  Cambia la contraseña en producción.');
    } catch (error) {
        console.error('Error en seed:', error.message);
    } finally {
        await mongoose.disconnect();
    }
};

seed();