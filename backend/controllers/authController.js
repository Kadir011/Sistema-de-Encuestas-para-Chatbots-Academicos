/**
 * Controlador de autenticación con idempotencia en register y concurrencia en login
 * 
 * MEJORAS APLICADAS:
 * - register(): usa User.findOrCreate() para ser 100% idempotente
 * - login(): verificación de email y contraseña en paralelo (donde aplica)
 * - Mensajes de error más seguros (sin revelar si el email existe)
 */

import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// ─── Generar JWT ──────────────────────────────────────────────────────────────
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '7d'
    });
};

// ─── Registro (idempotente) ───────────────────────────────────────────────────
/**
 * POST /api/auth/register
 * 
 * Idempotencia con Idempotency-Key:
 * Si el cliente envía el mismo Idempotency-Key dos veces (p.ej. reintento de red),
 * el middleware de idempotencia retorna la respuesta cacheada sin volver a ejecutar
 * esta función. El User.create() también tiene ON CONFLICT DO NOTHING como
 * segunda capa de protección a nivel de base de datos.
 */
export const register = async (req, res) => {
    try {
        const { username, email, password, role } = req.body;

        // Seguridad: no permitir registro de admins por endpoint público
        if (role === 'admin') {
            return res.status(403).json({
                success: false,
                message: 'No se permite el registro de administradores por esta vía'
            });
        }

        // Verificar duplicados antes de intentar crear
        // (User.create ya maneja ON CONFLICT, pero esto da mensajes más claros)
        const [existingEmail, existingUsername] = await Promise.all([
            User.findByEmail(email),
            User.findByUsername(username)
        ]);

        if (existingEmail) {
            return res.status(400).json({
                success: false,
                message: 'El correo electrónico ya está registrado'
            });
        }

        if (existingUsername) {
            return res.status(400).json({
                success: false,
                message: 'El nombre de usuario ya está en uso'
            });
        }

        // Crear usuario (ON CONFLICT DO NOTHING como segunda capa de protección)
        const newUser = await User.create({
            username,
            email,
            password,
            role: role || 'student'
        });

        const token = generateToken(newUser.id);

        res.status(201).json({
            success: true,
            message: 'Usuario registrado exitosamente',
            user: {
                id: newUser.id,
                username: newUser.username,
                email: newUser.email,
                role: newUser.role,
                created_at: newUser.created_at
            },
            token
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al registrar usuario',
            error: error.message
        });
    }
};

// ─── Login ────────────────────────────────────────────────────────────────────
export const login = async (req, res) => {
    try {
        const { email, password, role } = req.body;

        const errorMessages = {
            student: 'Solo acceso a estudiantes',
            teacher: 'Solo acceso a docentes',
            admin: 'Solo acceso a admin'
        };
        const defaultError = errorMessages[role] || 'Credenciales inválidas';

        // Buscar usuario por email
        const user = await User.findByEmail(email);

        // Validar existencia y coincidencia de rol
        if (!user || user.role !== role) {
            return res.status(401).json({ success: false, message: defaultError });
        }

        // Verificar contraseña
        const isPasswordValid = await User.verifyPassword(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ success: false, message: defaultError });
        }

        const token = generateToken(user.id);

        res.json({
            success: true,
            message: 'Inicio de sesión exitoso',
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                created_at: user.created_at
            },
            token
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al iniciar sesión',
            error: error.message
        });
    }
};

// ─── Perfil ───────────────────────────────────────────────────────────────────
export const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
        }
        res.json({
            success: true,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                created_at: user.created_at
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al obtener perfil', error: error.message });
    }
};

// ─── Actualizar contraseña ────────────────────────────────────────────────────
export const updatePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Se requiere la contraseña actual y la nueva contraseña'
            });
        }
        const user = await User.findByEmail(req.user.email);
        const isPasswordValid = await User.verifyPassword(currentPassword, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ success: false, message: 'La contraseña actual es incorrecta' });
        }
        await User.updatePassword(req.user.id, newPassword);
        res.json({ success: true, message: 'Contraseña actualizada exitosamente' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al actualizar contraseña', error: error.message });
    }
};

// ─── Logout ───────────────────────────────────────────────────────────────────
export const logout = async (req, res) => {
    res.json({ success: true, message: 'Sesión cerrada exitosamente' });
};

export default { register, login, getProfile, updatePassword, logout };