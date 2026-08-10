/**
 * Middleware de Validación (refactorizado)
 *
 * SOLID aplicado:
 * ─ SRP: solo conecta el middleware con el ValidatorFactory.
 * ─ DIP: depende de la abstracción ValidatorFactory, no de reglas inline.
 * ─ OCP: para cambiar reglas, se modifica ValidatorFactory, no este archivo.
 *
 * PATRÓN: Strategy — el middleware invoca la estrategia de validación correcta.
 */

import { ValidatorFactory } from '../services/ValidationService.js';

// ─── Helper genérico ──────────────────────────────────────────────────────────
const makeValidator = (validatorFn) => (req, res, next) => {
    try {
        const validator = validatorFn();
        const errors = validator.validate(req.body);
        if (errors.length > 0) {
            return res.status(400).json({ success: false, message: 'Errores de validación', errors });
        }
        next();
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Error en validación', error: error.message });
    }
};

export const validateRegister = makeValidator(() => ValidatorFactory.createRegisterValidator());
export const validateLogin = makeValidator(() => ValidatorFactory.createLoginValidator());
export const validateUserUpdate = makeValidator(() => ValidatorFactory.createUserUpdateValidator());
export const validateProfileUpdate = makeValidator(() => ValidatorFactory.createProfileUpdateValidator());
export const validatePasswordChange = makeValidator(() => ValidatorFactory.createPasswordChangeValidator());
export const validateStudentSurvey = makeValidator(() => ValidatorFactory.createStudentSurveyValidator());
export const validateTeacherSurvey = makeValidator(() => ValidatorFactory.createTeacherSurveyValidator());

// ─── Sanitización XSS ─────────────────────────────────────────────────────────
export const sanitizeInput = (req, res, next) => {
    try {
        const sanitize = (obj) => {
            for (const key in obj) {
                if (typeof obj[key] === 'string') {
                    obj[key] = obj[key]
                        .replace(/<script.*?>.*?<\/script>/gi, '')
                        .replace(/<.*?>/g, '');
                } else if (typeof obj[key] === 'object' && obj[key] !== null) {
                    sanitize(obj[key]);
                }
            }
        };
        if (req.body) sanitize(req.body);
        next();
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Error al sanitizar entrada', error: error.message });
    }
};

export default { validateRegister, validateLogin, validateUserUpdate, validateProfileUpdate, validatePasswordChange, validateStudentSurvey, validateTeacherSurvey, sanitizeInput };