/**
 * Rutas de encuestas de profesores con idempotencia en creación de encuestas
 */

import express from 'express';
import {
    createTeacherSurvey,
    getAllTeacherSurveys,
    getTeacherSurveyById,
    getMyTeacherSurveys,
    updateTeacherSurvey,
    deleteTeacherSurvey,
    getTeacherSurveyStatistics,
    getMyStatistics
} from '../controllers/teacherSurveyController.js';
import { verifyToken, verifyAdmin, verifyTeacher } from '../middlewares/authMiddleware.js';
import { validateTeacherSurvey, sanitizeInput } from '../middlewares/validationMiddleware.js';
import { idempotencyMiddleware } from '../middlewares/idempotencyMiddleware.js';

const router = express.Router();
router.use(verifyToken);

// POST: idempotente — dos envíos con la misma Idempotency-Key retornan
// el mismo resultado sin crear encuestas duplicadas.
router.post('/',
    verifyTeacher,
    idempotencyMiddleware,
    sanitizeInput,
    validateTeacherSurvey,
    createTeacherSurvey
);

router.get('/my-surveys', verifyTeacher, getMyTeacherSurveys);
router.get('/statistics', getTeacherSurveyStatistics);
router.get('/my-statistics', getMyStatistics);
router.get('/:id', getTeacherSurveyById);
router.put('/:id', sanitizeInput, validateTeacherSurvey, updateTeacherSurvey);
router.delete('/:id', deleteTeacherSurvey);

// Solo admin
router.get('/', verifyAdmin, getAllTeacherSurveys);

export default router;