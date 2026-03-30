/**
 * Servicio para las Encuestas
 *
 * SOLID aplicado:
 * ─ SRP: responsabilidad única → lógica de negocio de encuestas.
 *        Los controladores solo orquestan HTTP; este servicio ejecuta las reglas.
 * ─ OCP: nuevas operaciones se añaden aquí sin tocar controladores ni modelos.
 * ─ DIP: depende de ISurveyRepository (abstracción), no de clases concretas.
 *
 * PATRÓN: Service Layer — separa la lógica de negocio de la capa HTTP.
 * PATRÓN: Observer — publica eventos de dominio para desacoplar efectos secundarios.
 */

import { SurveyRepositoryFactory } from '../repositories/SurveyRepository.js';
import eventBus, { DOMAIN_EVENTS } from './EventEmitterService.js';

class SurveyService {
    /**
     * DIP: recibe el tipo como string; la fábrica crea la implementación correcta.
     * @param {'student'|'teacher'} type
     */
    constructor(type) {
        this.type = type;
        this.repo = SurveyRepositoryFactory.create(type);
        this._eventCreated = type === 'student'
            ? DOMAIN_EVENTS.STUDENT_SURVEY_CREATED
            : DOMAIN_EVENTS.TEACHER_SURVEY_CREATED;
        this._eventUpdated = type === 'student'
            ? DOMAIN_EVENTS.STUDENT_SURVEY_UPDATED
            : DOMAIN_EVENTS.TEACHER_SURVEY_UPDATED;
        this._eventDeleted = type === 'student'
            ? DOMAIN_EVENTS.STUDENT_SURVEY_DELETED
            : DOMAIN_EVENTS.TEACHER_SURVEY_DELETED;
    }

    // Operaciones CRUD con reglas de negocio 

    async create(userId, surveyData) {
        const survey = await this.repo.create({ user_id: userId, ...surveyData });
        // Observer: notifica a cualquier listener suscrito (métricas, logs, etc.)
        eventBus.publish(this._eventCreated, { surveyId: survey.id, userId });
        return survey;
    }

    async getAll() {
        return this.repo.findAll();
    }

    async getById(id, requestingUser) {
        const survey = await this.repo.findById(id);
        if (!survey) return null;

        // Regla de negocio: solo el dueño o admin pueden ver la encuesta
        if (requestingUser.role !== 'admin' && survey.user_id !== requestingUser.id) {
            const err = new Error('No tienes permiso para ver esta encuesta');
            err.statusCode = 403;
            throw err;
        }

        return survey;
    }

    async getMySurveys(userId) {
        return this.repo.findByUserId(userId);
    }

    async update(id, surveyData, requestingUser) {
        const survey = await this.repo.findById(id);
        if (!survey) return null;

        if (requestingUser.role !== 'admin' && survey.user_id !== requestingUser.id) {
            const err = new Error('No tienes permiso para editar esta encuesta');
            err.statusCode = 403;
            throw err;
        }

        const updated = await this.repo.update(id, surveyData);
        eventBus.publish(this._eventUpdated, { surveyId: id, userId: requestingUser.id });
        return updated;
    }

    async delete(id, requestingUser) {
        const survey = await this.repo.findById(id);
        if (!survey) return null;

        if (requestingUser.role !== 'admin' && survey.user_id !== requestingUser.id) {
            const err = new Error('No tienes permiso para eliminar esta encuesta');
            err.statusCode = 403;
            throw err;
        }

        await this.repo.delete(id);
        eventBus.publish(this._eventDeleted, { surveyId: id, userId: requestingUser.id });
        return true;
    }

    // Estadísticas 

    async getGlobalStatistics() {
        return this.repo.getStatistics();
    }

    async getUserStatistics(userId) {
        const [stats, surveys] = await Promise.all([
            this.repo.getUserStatistics(userId),
            this.repo.findByUserId(userId),
        ]);

        // Calcular métricas en memoria (no requiere query extra)
        const chatbotCounts = {};
        const taskCounts = {};

        surveys.forEach(survey => {
            (survey.chatbots_used || []).forEach(c => {
                chatbotCounts[c] = (chatbotCounts[c] || 0) + 1;
            });
            const tasks = survey.tasks_used_for || survey.purposes || [];
            tasks.forEach(t => {
                taskCounts[t] = (taskCounts[t] || 0) + 1;
            });
        });

        return {
            ...stats,
            unique_chatbots: Object.keys(chatbotCounts).length,
            chatbots_usage: chatbotCounts,
            tasks_usage: taskCounts,
            surveys,
        };
    }

    // Métodos específicos expuestos solo si el tipo los soporta 

    async getEnrichedStatistics() {
        if (this.type === 'student') {
            const [stats, chatbots, tasks, frequency] = await Promise.all([
                this.repo.getStatistics(),
                this.repo.getMostUsedChatbots(),
                this.repo.getMostCommonTasks(),
                this.repo.getUsageFrequencyDistribution(),
            ]);
            return { 
                ...stats, 
                most_used_chatbots: chatbots, 
                most_common_tasks: tasks, 
                frequency_distribution: frequency 
            };
        }

        if (this.type === 'teacher') {
            const [stats, countries, institutions, purposes, challenges] = await Promise.all([
                this.repo.getStatistics(),
                this.repo.getCountryDistribution(),
                this.repo.getInstitutionDistribution(),
                this.repo.getMostCommonPurposes(),
                this.repo.getMostCommonChallenges(),
            ]);
            return { 
                ...stats, 
                countries, 
                institutions, 
                purposes, 
                challenges 
            };
        }

        throw new Error(`getEnrichedStatistics no está disponible para el tipo "${this.type}"`);
    }
}

// Factory de servicios (DIP) 
class SurveyServiceFactory {
    static create(type) {
        return new SurveyService(type);
    }
}

export { SurveyService, SurveyServiceFactory };