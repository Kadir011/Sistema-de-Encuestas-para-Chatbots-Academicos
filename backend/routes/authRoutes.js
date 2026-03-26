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

// ─── Rutas públicas ───────────────────────────────────────────────────────────

// Registro: idempotente con Idempotency-Key opcional en el header.
// Si el cliente lo envía, dos registros con la misma clave retornan el mismo resultado.
router.post('/register',
    idempotencyMiddleware,   // Primera capa: cache de respuesta por Idempotency-Key
    sanitizeInput,
    validateRegister,
    register                 // Segunda capa: ON CONFLICT DO NOTHING en la BD
);

router.post('/login', sanitizeInput, validateLogin, login);

// ─── Rutas protegidas ─────────────────────────────────────────────────────────
router.get('/profile', verifyToken, getProfile);
router.put('/password', verifyToken, sanitizeInput, updatePassword);
router.post('/logout', verifyToken, logout);

export default router;