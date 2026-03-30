/**
 * Rutas de autenticación con middleware de idempotencia en rutas críticas
 * 
 * La idempotencia se aplica en /register:
 * Si el cliente envía el header "Idempotency-Key", peticiones repetidas
 * con la misma clave retornan el resultado cacheado sin crear usuarios duplicados.
 */

import express from 'express';
import { register, login, getProfile, updatePassword, logout } from '../controllers/authController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';
import { validateRegister, validateLogin, sanitizeInput } from '../middlewares/validationMiddleware.js';
import { idempotencyMiddleware } from '../middlewares/idempotencyMiddleware.js';

const router = express.Router();

// Rutas públicas
router.post('/register',
    idempotencyMiddleware,   // Capa 1: cache HTTP por Idempotency-Key
    sanitizeInput,
    validateRegister,
    register                 // Capa 2: ON CONFLICT DO NOTHING en BD
);

router.post('/login', sanitizeInput, validateLogin, login);

// Rutas protegidas
router.get('/profile', verifyToken, getProfile);
router.put('/password', verifyToken, sanitizeInput, updatePassword);
router.post('/logout', verifyToken, logout);

export default router;