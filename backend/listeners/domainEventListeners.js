/**
 * Listeners de dominio de eventos (refactorizado)
 *
 * PATRÓN: Observer — listeners concretos suscritos al bus de eventos.
 *
 * SOLID aplicado:
 * ─ SRP: cada listener tiene una sola responsabilidad (log, métricas, etc.).
 * ─ OCP: agregar un nuevo efecto secundario = agregar un nuevo listener aquí,
 *         sin tocar controladores ni servicios.
 * ─ DIP: los servicios publican en el bus; los listeners consumen del bus.
 *         Ninguno conoce al otro directamente.
 *
 * Para registrar todos los listeners, llama a registerAllListeners() en server.js.
 */

import eventBus, { DOMAIN_EVENTS } from '../services/EventEmitterService.js';
import AIInsightService from '../services/AIInsightService.js';
import AIInsight from '../models/AIInsight.js';

// ─── Listener de auditoría / logging ─────────────────────────────────────────
const AuditListener = {
    onUserRegistered({ payload }) {
        console.log(`[Audit] Nuevo usuario registrado: id=${payload.userId} role=${payload.role}`);
    },
    onUserLogin({ payload }) {
        console.log(`[Audit] Login exitoso: id=${payload.userId}`);
    },
    onUserLogout({ payload }) {
        console.log(`[Audit] Logout: id=${payload.userId}`);
    },
    onPasswordChanged({ payload }) {
        console.log(`[Audit] Contraseña cambiada: id=${payload.userId}`);
    },
    onSurveyCreated({ name, payload }) {
        console.log(`[Audit] Encuesta creada [${name}]: surveyId=${payload.surveyId} userId=${payload.userId}`);
    },
    onSurveyDeleted({ name, payload }) {
        console.log(`[Audit] Encuesta eliminada [${name}]: surveyId=${payload.surveyId}`);
    },
};

// ─── Listener de métricas (extensible a Prometheus, Datadog, etc.) ─────────
const MetricsListener = {
    counters: {
        usersRegistered: 0,
        logins: 0,
        surveysCreated: 0,
        surveysDeleted: 0,
    },
    onUserRegistered() { this.counters.usersRegistered++; },
    onLogin() { this.counters.logins++; },
    onSurveyCreated() { this.counters.surveysCreated++; },
    onSurveyDeleted() { this.counters.surveysDeleted++; },
    getSnapshot() { return { ...this.counters }; },
};

// ─── Listener de Insights de IA ─────────────────────────────────────────────
// Se dispara al crear una encuesta (estudiante o docente). Marca el insight
// como "pendiente" y dispara la generación con IA de forma fire-and-forget:
// nunca se espera (await) desde acá, por lo que jamás retrasa ni puede
// hacer fallar la respuesta HTTP del submit de la encuesta.
const InsightListener = {
    async onSurveyCreated({ name, payload }) {
        const surveyType = name === DOMAIN_EVENTS.STUDENT_SURVEY_CREATED ? 'student' : 'teacher';
        try {
            await AIInsight.markPending(payload.userId, surveyType, payload.surveyId);
        } catch (error) {
            console.error('[InsightListener] No se pudo marcar el insight como pendiente:', error.message);
            return;
        }
        // No se hace await a propósito: corre en background.
        AIInsightService.generateForUser(payload.userId, surveyType);
    },
};

// ─── Registro de todos los listeners ─────────────────────────────────────────
export const registerAllListeners = () => {
    // Usuarios
    eventBus.subscribe(DOMAIN_EVENTS.USER_REGISTERED, (e) => { AuditListener.onUserRegistered(e); MetricsListener.onUserRegistered(); });
    eventBus.subscribe(DOMAIN_EVENTS.USER_LOGIN, (e) => { AuditListener.onUserLogin(e); MetricsListener.onLogin(); });
    eventBus.subscribe(DOMAIN_EVENTS.USER_LOGOUT, (e) => AuditListener.onUserLogout(e));
    eventBus.subscribe(DOMAIN_EVENTS.USER_PASSWORD_CHANGED, (e) => AuditListener.onPasswordChanged(e));

    // Encuestas de estudiantes
    eventBus.subscribe(DOMAIN_EVENTS.STUDENT_SURVEY_CREATED, (e) => { AuditListener.onSurveyCreated(e); MetricsListener.onSurveyCreated(); InsightListener.onSurveyCreated(e); });
    eventBus.subscribe(DOMAIN_EVENTS.STUDENT_SURVEY_DELETED, (e) => { AuditListener.onSurveyDeleted(e); MetricsListener.onSurveyDeleted(); });

    // Encuestas de profesores
    eventBus.subscribe(DOMAIN_EVENTS.TEACHER_SURVEY_CREATED, (e) => { AuditListener.onSurveyCreated(e); MetricsListener.onSurveyCreated(); InsightListener.onSurveyCreated(e); });
    eventBus.subscribe(DOMAIN_EVENTS.TEACHER_SURVEY_DELETED, (e) => { AuditListener.onSurveyDeleted(e); MetricsListener.onSurveyDeleted(); });

    if (process.env.NODE_ENV === 'development') {
        console.log('[EventBus] Todos los listeners registrados');
    }
};

// Exportar MetricsListener para exponerlo en /api/health si se desea
export { MetricsListener };