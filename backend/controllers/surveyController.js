/**
 * Controlador de Encuestas (NUEVO — reemplaza los dos controladores)
 *
 * SOLID aplicado:
 * ─ SRP: solo maneja HTTP. La lógica de negocio está en SurveyService.
 * ─ OCP: un único controlador sirve para estudiantes Y profesores; el tipo
 *         se inyecta en el router sin modificar este archivo.
 * ─ DIP: depende de SurveyServiceFactory (abstracción).
 *
 * PATRÓN: Thin Controller + Template Method implícito
 *         (el comportamiento varía según el tipo inyectado).
 */

import { SurveyServiceFactory } from '../services/SurveyService.js';

/**
 * Crea un conjunto de handlers para un tipo de encuesta dado.
 * @param {'student'|'teacher'} type
 */
const createSurveyController = (type) => {
    const service = SurveyServiceFactory.create(type);

    const create = async (req, res) => {
        try {
            const survey = await service.create(req.user.id, req.body);
            res.status(201).json({ success: true, message: 'Encuesta creada exitosamente', survey });
        } catch (error) {
            res.status(error.statusCode || 500).json({ success: false, message: error.message });
        }
    };

    const getAll = async (req, res) => {
        try {
            const surveys = await service.getAll();
            res.json({ success: true, count: surveys.length, surveys });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    };

    const getById = async (req, res) => {
        try {
            const survey = await service.getById(req.params.id, req.user);
            if (!survey) return res.status(404).json({ success: false, message: 'Encuesta no encontrada' });
            res.json({ success: true, survey });
        } catch (error) {
            res.status(error.statusCode || 500).json({ success: false, message: error.message });
        }
    };

    const getMySurveys = async (req, res) => {
        try {
            const surveys = await service.getMySurveys(req.user.id);
            res.json({ success: true, count: surveys.length, surveys });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    };

    const update = async (req, res) => {
        try {
            const survey = await service.update(req.params.id, req.body, req.user);
            if (!survey) return res.status(404).json({ success: false, message: 'Encuesta no encontrada' });
            res.json({ success: true, message: 'Encuesta actualizada exitosamente', survey });
        } catch (error) {
            res.status(error.statusCode || 500).json({ success: false, message: error.message });
        }
    };

    const remove = async (req, res) => {
        try {
            const deleted = await service.delete(req.params.id, req.user);
            if (!deleted) return res.status(404).json({ success: false, message: 'Encuesta no encontrada' });
            res.json({ success: true, message: 'Encuesta eliminada exitosamente' });
        } catch (error) {
            res.status(error.statusCode || 500).json({ success: false, message: error.message });
        }
    };

    const getStatistics = async (req, res) => {
        try {
            // Admin → estadísticas globales; usuario normal → estadísticas personales
            const stats = req.user.role === 'admin'
                ? await service.getEnrichedStatistics()
                : await service.getUserStatistics(req.user.id);
            res.json({ success: true, statistics: stats });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    };

    const getMyStatistics = async (req, res) => {
        try {
            const stats = await service.getUserStatistics(req.user.id);
            res.json({ success: true, statistics: stats });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    };

    // "Mi Progreso" — evolución personal en el tiempo + comparación anónima
    // contra el promedio de la cohorte (mismo rol).
    const getMyProgress = async (req, res) => {
        try {
            const progress = await service.getMyProgress(req.user.id);
            res.json({ success: true, progress });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    };

    return { create, getAll, getById, getMySurveys, update, remove, getStatistics, getMyStatistics, getMyProgress };
};

export default createSurveyController;