/**
 * Middleware de Autenticación
 * PostgreSQL: los IDs son enteros (SERIAL). Los params/body de Express
 * siempre llegan como string, por eso las comparaciones de "ownership"
 * normalizan ambos lados con String() antes de comparar.
 */

import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// ─── Verificar token JWT ──────────────────────────────────────────────────────
export const verifyToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'No se proporcionó token de autenticación',
            });
        }

        const token = authHeader.substring(7);
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Usuario no encontrado o token inválido',
            });
        }

        req.user = {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
        };

        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ success: false, message: 'Token inválido' });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expirado. Por favor inicia sesión nuevamente',
            });
        }
        return res.status(500).json({
            success: false,
            message: 'Error al verificar token',
            error: error.message,
        });
    }
};

// ─── Verificar rol de administrador ──────────────────────────────────────────
export const verifyAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ success: false, message: 'No autenticado' });
    }
    if (req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Acceso denegado. Se requiere rol de administrador',
        });
    }
    next();
};

// ─── Verificar rol de profesor (incluye admin) ────────────────────────────────
export const verifyTeacher = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ success: false, message: 'No autenticado' });
    }
    if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Acceso denegado. Se requiere rol de profesor o administrador',
        });
    }
    next();
};

// ─── Verificar rol de estudiante (incluye admin) ──────────────────────────────
export const verifyStudent = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ success: false, message: 'No autenticado' });
    }
    if (req.user.role !== 'student' && req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Acceso denegado. Se requiere rol de estudiante o administrador',
        });
    }
    next();
};

// ─── Verificar propiedad de un recurso ───────────────────────────────────────
export const verifyOwnership = (paramName = 'userId') => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'No autenticado' });
        }
        if (req.user.role === 'admin') return next();

        const resourceUserId = req.params[paramName] || req.body.user_id;

        // req.user.id es numérico (SERIAL de Postgres); los params de ruta y
        // body siempre llegan como string, así que se comparan como string.
        if (String(req.user.id) !== String(resourceUserId)) {
            return res.status(403).json({
                success: false,
                message: 'No tienes permiso para acceder a este recurso',
            });
        }
        next();
    };
};

// ─── Verificar propiedad de una encuesta ─────────────────────────────────────
export const verifySurveyOwnership = (Model) => {
    return async (req, res, next) => {
        try {
            const surveyId = req.params.id;
            const survey = await Model.findById(surveyId);

            if (!survey) {
                return res.status(404).json({ success: false, message: 'Encuesta no encontrada' });
            }
            if (req.user.role === 'admin') return next();

            if (String(survey.user_id) !== String(req.user.id)) {
                return res.status(403).json({
                    success: false,
                    message: 'No tienes permiso para acceder a esta encuesta',
                });
            }
            next();
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: 'Error al verificar propiedad de la encuesta',
                error: error.message,
            });
        }
    };
};

// ─── Auth opcional (no falla si no hay token) ─────────────────────────────────
export const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.id);
            if (user) {
                req.user = {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    role: user.role,
                };
            }
        }
        next();
    } catch {
        next();
    }
};

export default {
    verifyToken, verifyAdmin, verifyTeacher, verifyStudent,
    verifyOwnership, verifySurveyOwnership, optionalAuth,
};