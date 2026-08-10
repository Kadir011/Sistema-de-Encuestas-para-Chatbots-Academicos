import express from 'express';
import {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    getUserStatistics
} from '../controllers/userController.js';
import { verifyToken, verifyAdmin, verifyOwnership } from '../middlewares/authMiddleware.js';
import { 
    validateRegister, 
    validateUserUpdate, 
    sanitizeInput 
} from '../middlewares/validationMiddleware.js';

const router = express.Router();

// =====================================
// TODAS LAS RUTAS REQUIEREN AUTENTICACIÓN
// =====================================
router.use(verifyToken);

// =====================================
// RUTAS SOLO PARA ADMIN
// =====================================
router.get('/statistics', verifyAdmin, getUserStatistics);
router.get('/', verifyAdmin, getAllUsers);
router.post('/', verifyAdmin, sanitizeInput, validateRegister, createUser);
router.delete('/:id', verifyAdmin, deleteUser);

// =====================================
// RUTAS PARA USUARIOS AUTENTICADOS
// =====================================
router.get('/:id', getUserById);
router.put('/:id', verifyOwnership('id'), sanitizeInput, validateUserUpdate, updateUser);

export default router;
