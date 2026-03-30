/**
 * Rutas de Encuestas de Docentes (refactorizado)
 *
 * OCP: usa createSurveyController('teacher') — mismo controlador genérico,
 *      diferente tipo inyectado. No se modifica el controlador.
 */

import express from 'express';
import createSurveyController from '../controllers/surveyController.js';
import { verifyToken, verifyAdmin, verifyTeacher } from '../middlewares/authMiddleware.js';
import { validateTeacherSurvey, sanitizeInput } from '../middlewares/validationMiddleware.js';
import { idempotencyMiddleware } from '../middlewares/idempotencyMiddleware.js';

const router = express.Router();
const ctrl = createSurveyController('teacher');

router.use(verifyToken);

router.post('/', verifyTeacher, idempotencyMiddleware, sanitizeInput, validateTeacherSurvey, ctrl.create);
router.get('/my-surveys', verifyTeacher, ctrl.getMySurveys);
router.get('/statistics', ctrl.getStatistics);
router.get('/my-statistics', ctrl.getMyStatistics);
router.get('/:id', ctrl.getById);
router.put('/:id', sanitizeInput, validateTeacherSurvey, ctrl.update);
router.delete('/:id', ctrl.remove);

// Solo admin
router.get('/', verifyAdmin, ctrl.getAll);

export default router;