/**
 * Repositorio de Encuestas
 * 
 * SOLID aplicado:
 * ─ SRP: responsabilidad única → acceso a datos de encuestas.
 * ─ OCP: ISurveyRepository define el contrato; nuevas implementaciones
 *         (p.ej. MongoDB, cache) no modifican el contrato ni los servicios.
 * ─ LSP: StudentSurveyRepository y TeacherSurveyRepository son
 *         intercambiables donde se espera ISurveyRepository.
 * ─ ISP: la interfaz expone solo lo que necesita cada consumidor.
 * ─ DIP: los servicios/controladores dependen de la abstracción (interfaz),
 *         no de las clases concretas StudentSurvey / TeacherSurvey.
 *
 * PATRÓN: Repository — encapsula la lógica de acceso a datos
 *         separándola de la lógica de negocio.
 */

import StudentSurvey from '../models/StudentSurvey.js';
import TeacherSurvey from '../models/TeacherSurvey.js';

// Interfaz base (contrato del Repository)
/**
 * ISurveyRepository — contrato que deben cumplir todos los repositorios
 * de encuestas. Garantiza LSP: cualquier implementación es intercambiable.
 */
class ISurveyRepository {
    async create(data) { throw new Error('Not implemented'); }
    async findAll() { throw new Error('Not implemented'); }
    async findById(id) { throw new Error('Not implemented'); }
    async findByUserId(userId) { throw new Error('Not implemented'); }
    async update(id, data) { throw new Error('Not implemented'); }
    async delete(id) { throw new Error('Not implemented'); }
    async getStatistics() { throw new Error('Not implemented'); }
    async getUserStatistics(userId) { throw new Error('Not implemented'); }
    async userHasSurveys(userId) { throw new Error('Not implemented'); }
};

// Implementación concreta: Estudiantes
class StudentSurveyRepository extends ISurveyRepository {
    async create(data) { return StudentSurvey.create(data); }
    async findAll() { return StudentSurvey.findAll(); }
    async findById(id) { return StudentSurvey.findById(id); }
    async findByUserId(userId) { return StudentSurvey.findByUserId(userId); }
    async update(id, data) { return StudentSurvey.update(id, data); }
    async delete(id) { return StudentSurvey.delete(id); }
    async getStatistics() { return StudentSurvey.getStatistics(); }
    async getUserStatistics(userId) { return StudentSurvey.getUserStatistics(userId); }
    async userHasSurveys(userId) { return StudentSurvey.userHasSurveys(userId); }

    // Métodos específicos del dominio estudiantil
    async getMostUsedChatbots() { return StudentSurvey.getMostUsedChatbots(); }
    async getMostCommonTasks() { return StudentSurvey.getMostCommonTasks(); }
    async getUsageFrequencyDistribution() { return StudentSurvey.getUsageFrequencyDistribution(); }
};

// Implementación concreta: Profesores
class TeacherSurveyRepository extends ISurveyRepository {
    async create(data) { return TeacherSurvey.create(data); }
    async findAll() { return TeacherSurvey.findAll(); }
    async findById(id) { return TeacherSurvey.findById(id); }
    async findByUserId(userId) { return TeacherSurvey.findByUserId(userId); }
    async update(id, data) { return TeacherSurvey.update(id, data); }
    async delete(id) { return TeacherSurvey.delete(id); }
    async getStatistics() { return TeacherSurvey.getStatistics(); }
    async getUserStatistics(userId) { return TeacherSurvey.getUserStatistics(userId); }
    async userHasSurveys(userId) { return TeacherSurvey.userHasSurveys(userId); }

    // Métodos específicos del dominio docente
    async getCountryDistribution() { return TeacherSurvey.getCountryDistribution(); }
    async getInstitutionDistribution() { return TeacherSurvey.getInstitutionDistribution(); }
    async getMostCommonPurposes() { return TeacherSurvey.getMostCommonPurposes(); }
    async getMostCommonChallenges() { return TeacherSurvey.getMostCommonChallenges(); }
    async getMostRequestedResources() { return TeacherSurvey.getMostRequestedResources(); }
}

// Factory (DIP: los consumidores piden una abstracción, no una clase)
/**
 * SurveyRepositoryFactory
 * PATRÓN: Factory Method — crea la instancia correcta según el tipo.
 * DIP: los controladores llaman a la fábrica y trabajan con ISurveyRepository.
 */
class SurveyRepositoryFactory {
    static create(type) {
        switch (type) {
            case 'student': return new StudentSurveyRepository();
            case 'teacher': return new TeacherSurveyRepository();
            default:
                throw new Error(`Tipo de repositorio desconocido: "${type}"`);
        }
    }
};

export {
    ISurveyRepository,
    StudentSurveyRepository,
    TeacherSurveyRepository,
    SurveyRepositoryFactory,
};