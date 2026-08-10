/**
 * Servicio de Autenticación
 *
 * SOLID aplicado:
 * ─ SRP: responsabilidad única → lógica de autenticación y tokens.
 * ─ DIP: depende de IUserRepository, no del modelo User directamente.
 *
 * PATRÓN: Service Layer - separa la lógica de negocio de la capa HTTP.
 * PATRÓN: Observer — publica eventos de login/registro/logout.
 */

import jwt from 'jsonwebtoken';
import { UserRepository } from '../repositories/UserRepository.js';
import eventBus, { DOMAIN_EVENTS } from './EventEmitterService.js';

class AuthService {
    constructor(userRepository = new UserRepository()) {
        this.userRepo = userRepository;
    }

    // Token 
    generateToken(userId) {
        return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRE || '7d',
        });
    }

    verifyToken(token) {
        return jwt.verify(token, process.env.JWT_SECRET);
    }

    // Registro
    async register({ username, email, password, role }) {
        // Regla de negocio: no registrar admins vía endpoint público
        if (role === 'admin') {
            const err = new Error('No se permite el registro de administradores por esta vía');
            err.statusCode = 403;
            throw err;
        }

        // Verificar duplicados en paralelo (concurrencia)
        const [existingEmail, existingUsername] = await Promise.all([
            this.userRepo.findByEmail(email),
            this.userRepo.findByUsername(username),
        ]);

        if (existingEmail) {
            const err = new Error('El correo electrónico ya está registrado');
            err.statusCode = 400;
            throw err;
        }
        if (existingUsername) {
            const err = new Error('El nombre de usuario ya está en uso');
            err.statusCode = 400;
            throw err;
        }

        const newUser = await this.userRepo.create({ username, email, password, role: role || 'student' });
        const token = this.generateToken(newUser.id);

        // Observer: notifica el registro
        eventBus.publish(DOMAIN_EVENTS.USER_REGISTERED, { userId: newUser.id, role: newUser.role });

        return { user: this._sanitize(newUser), token };
    }

    // Login 
    async login({ email, password, role }) {
        const user = await this.userRepo.findByEmail(email);

        if (!user || user.role !== role) {
            const err = new Error(this._roleErrorMessage(role));
            err.statusCode = 401;
            throw err;
        }

        const isValid = await this.userRepo.verifyPassword(password, user.password);
        if (!isValid) {
            const err = new Error(this._roleErrorMessage(role));
            err.statusCode = 401;
            throw err;
        }

        const token = this.generateToken(user.id);
        eventBus.publish(DOMAIN_EVENTS.USER_LOGIN, { userId: user.id, role: user.role });

        return { user: this._sanitize(user), token };
    }

    // Logout 
    async logout(userId) {
        eventBus.publish(DOMAIN_EVENTS.USER_LOGOUT, { userId });
    }

    // Perfil 
    async getProfile(userId) {
        const user = await this.userRepo.findById(userId);
        if (!user) {
            const err = new Error('Usuario no encontrado');
            err.statusCode = 404;
            throw err;
        }
        return this._sanitize(user);
    }

    // Cambio de contraseña 
    async updatePassword(userId, userEmail, currentPassword, newPassword) {
        const user = await this.userRepo.findByEmail(userEmail);
        if (!user) {
            const err = new Error('Usuario no encontrado');
            err.statusCode = 404;
            throw err;
        }
        const isValid = await this.userRepo.verifyPassword(currentPassword, user.password);

        if (!isValid) {
            const err = new Error('La contraseña actual es incorrecta');
            err.statusCode = 401;
            throw err;
        }

        await this.userRepo.updatePassword(userId, newPassword);
        eventBus.publish(DOMAIN_EVENTS.USER_PASSWORD_CHANGED, { userId });
    }

    // Actualizar datos propios (username/email) 
    // Cualquier usuario, sin importar su rol, puede editar sus propios datos
    // siempre que confirme su contraseña actual. No permite cambiar el rol
    // (eso sigue siendo exclusivo de administradores vía /api/users/:id).
    async updateProfile(userId, userEmail, currentPassword, { username, email }) {
        const user = await this.userRepo.findByEmail(userEmail);
        if (!user) {
            const err = new Error('Usuario no encontrado');
            err.statusCode = 404;
            throw err;
        }

        const isValid = await this.userRepo.verifyPassword(currentPassword, user.password);
        if (!isValid) {
            const err = new Error('La contraseña actual es incorrecta');
            err.statusCode = 401;
            throw err;
        }

        // El propio User.update ya valida colisiones de email/username únicos
        const updatedUser = await this.userRepo.update(userId, { username, email });
        eventBus.publish(DOMAIN_EVENTS.USER_UPDATED, { userId });

        return this._sanitize(updatedUser);
    }

    // Helpers privados 

    _sanitize(user) {
        return {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
            created_at: user.created_at,
        };
    }

    _roleErrorMessage(role) {
        const messages = {
            student: 'Solo acceso a estudiantes',
            teacher: 'Solo acceso a docentes',
            admin: 'Solo acceso a administradores',
        };
        return messages[role] || 'Credenciales inválidas';
    }
}

export default AuthService;