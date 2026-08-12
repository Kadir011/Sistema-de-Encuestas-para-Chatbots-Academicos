/**
 * Rutas de Encuestas de Estudiantes (refactorizado)
 *
 * OCP: usa createSurveyController('student') — el controlador genérico
 *      no necesita modificarse para agregar funcionalidad a este tipo.
 */

import express from 'express';
import createSurveyController from '../controllers/surveyController.js';
import { verifyToken, verifyAdmin } from '../middlewares/authMiddleware.js';
import { validateStudentSurvey, sanitizeInput } from '../middlewares/validationMiddleware.js';
import { idempotencyMiddleware } from '../middlewares/idempotencyMiddleware.js';

const router = express.Router();
const ctrl = createSurveyController('student');

router.use(verifyToken);

router.post('/', idempotencyMiddleware, sanitizeInput, validateStudentSurvey, ctrl.create);
router.get('/my-surveys', ctrl.getMySurveys);
router.get('/statistics', ctrl.getStatistics);
router.get('/my-statistics', ctrl.getMyStatistics);
router.get('/my-progress', ctrl.getMyProgress);
router.get('/:id', ctrl.getById);
router.put('/:id', sanitizeInput, validateStudentSurvey, ctrl.update);
router.delete('/:id', ctrl.remove);

// Solo admin
router.get('/', verifyAdmin, ctrl.getAll);

export default router;