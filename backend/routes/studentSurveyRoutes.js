/**
 * Rutas de encuentas de estudiantes con idempotencia en creación de encuestas
 */

import express from 'express';
import {
    createStudentSurvey,
    getAllStudentSurveys,
    getStudentSurveyById,
    getMyStudentSurveys,
    updateStudentSurvey,
    deleteStudentSurvey,
    getStudentSurveyStatistics,
    getMyStatistics
} from '../controllers/studentSurveyController.js';
import { verifyToken, verifyAdmin } from '../middlewares/authMiddleware.js';
import { validateStudentSurvey, sanitizeInput } from '../middlewares/validationMiddleware.js';
import { idempotencyMiddleware } from '../middlewares/idempotencyMiddleware.js';

const router = express.Router();

router.use(verifyToken);

// POST: idempotente — si el cliente reintenta con la misma Idempotency-Key,
// no se crea una segunda encuesta.
router.post('/',
    idempotencyMiddleware,
    sanitizeInput,
    validateStudentSurvey,
    createStudentSurvey
);

router.get('/my-surveys', getMyStudentSurveys);
router.get('/statistics', getStudentSurveyStatistics);
router.get('/my-statistics', getMyStatistics);
router.get('/:id', getStudentSurveyById);
router.put('/:id', sanitizeInput, validateStudentSurvey, updateStudentSurvey);
router.delete('/:id', deleteStudentSurvey);

// Solo admin
router.get('/', verifyAdmin, getAllStudentSurveys);

export default router;