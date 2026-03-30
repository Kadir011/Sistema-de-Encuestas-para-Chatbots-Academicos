/**
 * Repositorio de Usuarios
 *
 * SOLID aplicado:
 * ─ SRP: responsabilidad única → acceso a datos de usuarios.
 * ─ DIP: controladores y servicios dependen de IUserRepository,
 *         no del modelo User directamente.
 *
 * PATRÓN: Repository
 */

import User from '../models/User.js';

class IUserRepository {
    async create(data) { throw new Error('Not implemented'); }
    async findByEmail(email) { throw new Error('Not implemented'); }
    async findById(id) { throw new Error('Not implemented'); }
    async findByUsername(username) { throw new Error('Not implemented'); }
    async findAll() { throw new Error('Not implemented'); }
    async findByRole(role) { throw new Error('Not implemented'); }
    async update(id, data) { throw new Error('Not implemented'); }
    async updatePassword(id, pw) { throw new Error('Not implemented'); }
    async delete(id) { throw new Error('Not implemented'); }
    async getStatistics() { throw new Error('Not implemented'); }
    async verifyPassword(plain, hash) { throw new Error('Not implemented'); }
}

class UserRepository extends IUserRepository {
    async create(data) { return User.create(data); }
    async findByEmail(email) { return User.findByEmail(email); }
    async findById(id) { return User.findById(id); }
    async findByUsername(username) { return User.findByUsername(username); }
    async findAll() { return User.findAll(); }
    async findByRole(role) { return User.findByRole(role); }
    async update(id, data) { return User.update(id, data); }
    async updatePassword(id, pw) { return User.updatePassword(id, pw); }
    async delete(id) { return User.delete(id); }
    async getStatistics() { return User.getStatistics(); }
    async verifyPassword(plain, hash) { return User.verifyPassword(plain, hash); }
    async findOrCreate(data) { return User.findOrCreate(data); }
}

export { IUserRepository, UserRepository };