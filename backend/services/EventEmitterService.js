/**
 * Servicio de eventos
 *
 * SOLID aplicado:
 * ─ SRP: responsabilidad única → gestionar eventos del dominio.
 * ─ OCP: nuevos listeners se registran sin modificar el emisor.
 * ─ DIP: los controladores dependen de esta abstracción,
 *         no de efectos secundarios directos (logs, métricas, etc.).
 *
 * PATRÓN: Observer — los componentes se suscriben a eventos de dominio
 *         sin acoplarse entre sí.
 */

import { EventEmitter } from 'events';

// Catálogo de eventos del dominio
export const DOMAIN_EVENTS = Object.freeze({
    // Usuarios
    USER_REGISTERED: 'user.registered',
    USER_UPDATED: 'user.updated',
    USER_DELETED: 'user.deleted',
    USER_LOGIN: 'user.login',
    USER_LOGOUT: 'user.logout',
    USER_PASSWORD_CHANGED: 'user.passwordChanged',

    // Encuestas de estudiantes
    STUDENT_SURVEY_CREATED: 'studentSurvey.created',
    STUDENT_SURVEY_UPDATED: 'studentSurvey.updated',
    STUDENT_SURVEY_DELETED: 'studentSurvey.deleted',

    // Encuestas de profesores
    TEACHER_SURVEY_CREATED: 'teacherSurvey.created',
    TEACHER_SURVEY_UPDATED: 'teacherSurvey.updated',
    TEACHER_SURVEY_DELETED: 'teacherSurvey.deleted',
});

// Singleton del bus de eventos
class DomainEventBus extends EventEmitter {
    constructor() {
        super();
        // Aumentar el límite para evitar warning en entornos con muchos listeners
        this.setMaxListeners(50);
    }
 
    /**
     * Emite un evento con un payload estructurado.
     * @param {string} eventName - Usar DOMAIN_EVENTS.*
     * @param {Object} payload
     */
    publish(eventName, payload = {}) {
        const event = {
            name:      eventName,
            timestamp: new Date().toISOString(),
            payload,
        };
 
        if (process.env.NODE_ENV === 'development') {
            console.log(`[DomainEvent] ${eventName}`, payload);
        }
 
        this.emit(eventName, event);
    }
 
    /**
     * Suscribirse a un evento de dominio.
     * @param {string} eventName
     * @param {Function} handler - ({ name, timestamp, payload }) => void
     */
    subscribe(eventName, handler) {
        this.on(eventName, handler);
    }
 
    /**
     * Suscribirse una sola vez.
     */
    subscribeOnce(eventName, handler) {
        this.once(eventName, handler);
    }
};

// Exportar instancia única (Singleton)
const eventBus = new DomainEventBus();
export default eventBus;