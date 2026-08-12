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

    // Mi Progreso — línea de tiempo personal + promedio de la cohorte 
    /**
     * Combina el historial personal (para graficar la evolución en el tiempo)
     * con el promedio agregado de todos los usuarios del mismo rol (cohorte),
     * de forma 100% anónima: solo se exponen promedios/porcentajes agregados,
     * nunca encuestas ni identidades de otros usuarios.
     */
    async getMyProgress(userId) {
        const [personal, cohort] = await Promise.all([
            this.getUserStatistics(userId),
            this.repo.getStatistics(),
        ]);

        const surveys = personal.surveys || [];

        // Línea de tiempo ordenada cronológicamente (más antigua primero)
        const timeline = [...surveys]
            .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
            .map(s => this._toTimelinePoint(s));

        const personalRecommendCount = surveys.filter(s => s.would_recommend).length;

        const base = {
            type: this.type,
            personal: {
                total_surveys: personal.total_surveys || 0,
                first_survey_date: personal.first_survey_date,
                last_survey_date: personal.last_survey_date,
                unique_chatbots: personal.unique_chatbots || 0,
                chatbots_usage: personal.chatbots_usage || {},
                would_recommend_rate: surveys.length
                    ? Math.round((personalRecommendCount / surveys.length) * 100)
                    : null,
            },
            cohort: {
                total_surveys: cohort.total_surveys || 0,
            },
            timeline,
        };

        if (this.type === 'student') {
            base.personal.avg_usefulness = personal.avg_usefulness !== undefined
                ? Number(personal.avg_usefulness) : null;
            base.personal.avg_experience = personal.avg_experience !== undefined
                ? Number(personal.avg_experience) : null;
            base.cohort.avg_usefulness = cohort.avg_usefulness !== null ? Number(cohort.avg_usefulness) : null;
            base.cohort.avg_experience = cohort.avg_experience !== null ? Number(cohort.avg_experience) : null;
            base.cohort.would_recommend_rate = cohort.total_surveys
                ? Math.round((cohort.would_recommend / cohort.total_surveys) * 100)
                : null;
        }

        if (this.type === 'teacher') {
            const personalLikelihoodScores = surveys
                .map(s => this._likelihoodToScore(s.likelihood_future_use))
                .filter(v => v !== null);
            base.personal.avg_likelihood_score = personalLikelihoodScores.length
                ? Number((personalLikelihoodScores.reduce((a, b) => a + b, 0) / personalLikelihoodScores.length).toFixed(2))
                : null;

            const cohortLikelihoodTotal = (cohort.very_likely_continue || 0)
                + (cohort.likely_continue || 0) + (cohort.unlikely_continue || 0);
            base.cohort.avg_likelihood_score = cohortLikelihoodTotal
                ? Number((((cohort.very_likely_continue || 0) * 3
                    + (cohort.likely_continue || 0) * 2
                    + (cohort.unlikely_continue || 0) * 1) / cohortLikelihoodTotal).toFixed(2))
                : null;
            base.cohort.would_recommend_rate = cohort.total_surveys
                ? Math.round((cohort.would_recommend_count / cohort.total_surveys) * 100)
                : null;
        }

        return base;
    }

    // Convierte una encuesta cruda en un punto de la línea de tiempo,
    // seleccionando solo los campos relevantes para graficar según el tipo.
    _toTimelinePoint(survey) {
        const point = {
            date: survey.created_at,
            would_recommend: survey.would_recommend,
        };
        if (this.type === 'student') {
            point.usefulness_rating = survey.usefulness_rating;
            point.overall_experience = survey.overall_experience;
        }
        if (this.type === 'teacher') {
            point.likelihood_future_use = survey.likelihood_future_use;
            point.likelihood_score = this._likelihoodToScore(survey.likelihood_future_use);
        }
        return point;
    }

    _likelihoodToScore(label) {
        const map = { 'Muy probable': 3, 'Probable': 2, 'Imposible': 1 };
        return map[label] ?? null;
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