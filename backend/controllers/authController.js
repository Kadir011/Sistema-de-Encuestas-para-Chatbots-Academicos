/**
 * Controlador de Autenticación — Thin Controller (SRP + DIP)
 * Toda la lógica de negocio vive en AuthService.
 * Este archivo solo traduce HTTP ↔ Service.
 */

import AuthService from '../services/AuthService.js';

const authService = new AuthService();

// ─── Registro ────────────────────────────────────────────────────────────────
export const register = async (req, res) => {
    try {
        const { username, email, password, role } = req.body;
        const result = await authService.register({ username, email, password, role });
        res.status(201).json({
            success: true,
            message: 'Usuario registrado exitosamente',
            user: result.user,
            token: result.token
        });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        res.status(statusCode).json({
            success: false,
            message: error.message
        });
    }
};

// ─── Login ────────────────────────────────────────────────────────────────────
export const login = async (req, res) => {
    try {
        const { email, password, role } = req.body;
        const result = await authService.login({ email, password, role });
        res.json({
            success: true,
            message: 'Inicio de sesión exitoso',
            user: result.user,
            token: result.token
        });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        res.status(statusCode).json({
            success: false,
            message: error.message
        });
    }
};

// ─── Perfil ───────────────────────────────────────────────────────────────────
export const getProfile = async (req, res) => {
    try {
        const user = await authService.getProfile(req.user.id);
        res.json({ success: true, user });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        res.status(statusCode).json({ success: false, message: error.message });
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
        await authService.updatePassword(req.user.id, req.user.email, currentPassword, newPassword);
        res.json({ success: true, message: 'Contraseña actualizada exitosamente' });
    } catch (error) {
        const statusCode = error.statusCode || 500;
        res.status(statusCode).json({ success: false, message: error.message });
    }
};

// ─── Logout ───────────────────────────────────────────────────────────────────
export const logout = async (req, res) => {
    await authService.logout(req.user.id);
    res.json({ success: true, message: 'Sesión cerrada exitosamente' });
};

export default { register, login, getProfile, updatePassword, logout };