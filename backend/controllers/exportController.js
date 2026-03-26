/**
 * Controlador de exportación de encuestas con queries paralelas para mayor rendimiento
 * 
 * MEJORA DE CONCURRENCIA:
 * - exportStatistics(): antes ejecutaba 4-5 queries de forma secuencial.
 *   Ahora usa Promise.all() para lanzarlas simultáneamente, reduciendo el
 *   tiempo de respuesta al de la query más lenta (no la suma de todas).
 */

import StudentSurvey from '../models/StudentSurvey.js';
import TeacherSurvey from '../models/TeacherSurvey.js';

// ─── Helper: convierte valores a número de forma segura ──────────────────────
const toNum = (val, decimals = null) => {
    const n = parseFloat(val ?? 0);
    const result = Number.isFinite(n) ? n : 0;
    return decimals !== null ? parseFloat(result.toFixed(decimals)) : result;
};

// ─── Exportar encuestas de estudiantes ───────────────────────────────────────
export const exportStudentSurveys = async (req, res) => {
    try {
        const { startDate, endDate, hasExperience } = req.query;

        let surveys = await StudentSurvey.findAll();

        if (startDate) surveys = surveys.filter(s => new Date(s.created_at) >= new Date(startDate));
        if (endDate) surveys = surveys.filter(s => new Date(s.created_at) <= new Date(endDate));
        if (hasExperience !== undefined) {
            const experienceFilter = hasExperience === 'true';
            surveys = surveys.filter(s => s.has_used_chatbot === experienceFilter);
        }

        const excelData = surveys.map(survey => ({
            'ID': survey.id,
            'Usuario': survey.username,
            'Email': survey.email,
            'Ha Usado Chatbot': survey.has_used_chatbot ? 'Sí' : 'No',
            'Chatbots Usados': Array.isArray(survey.chatbots_used) ? survey.chatbots_used.join(', ') : survey.chatbots_used || 'N/A',
            'Frecuencia de Uso': survey.usage_frequency || 'N/A',
            'Calificación Utilidad': survey.usefulness_rating || 'N/A',
            'Tareas': Array.isArray(survey.tasks_used_for) ? survey.tasks_used_for.join(', ') : survey.tasks_used_for || 'N/A',
            'Experiencia General': survey.overall_experience || 'N/A',
            'Chatbot Preferido': survey.preferred_chatbot || 'N/A',
            'Comparación con Google': survey.effectiveness_comparison || 'N/A',
            'Continuará Usando': survey.will_continue_using ? 'Sí' : 'No',
            'Recomendaría': survey.would_recommend ? 'Sí' : 'No',
            'Comentarios': survey.additional_comments || '',
            'Fecha de Creación': new Date(survey.created_at).toLocaleDateString('es-ES')
        }));

        res.json({ success: true, data: excelData, count: excelData.length });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al exportar encuestas de estudiantes', error: error.message });
    }
};

// ─── Exportar encuestas de profesores ────────────────────────────────────────
export const exportTeacherSurveys = async (req, res) => {
    try {
        const { startDate, endDate, hasExperience, country } = req.query;

        let surveys = await TeacherSurvey.findAll();

        if (startDate) surveys = surveys.filter(s => new Date(s.created_at) >= new Date(startDate));
        if (endDate) surveys = surveys.filter(s => new Date(s.created_at) <= new Date(endDate));
        if (hasExperience !== undefined) {
            const experienceFilter = hasExperience === 'true';
            surveys = surveys.filter(s => s.has_used_chatbot === experienceFilter);
        }
        if (country) {
            surveys = surveys.filter(s =>
                s.country && s.country.toLowerCase().includes(country.toLowerCase())
            );
        }

        const excelData = surveys.map(survey => ({
            'ID': survey.id,
            'Usuario': survey.username,
            'Email': survey.email,
            'Ha Usado Chatbot': survey.has_used_chatbot ? 'Sí' : 'No',
            'Chatbots Usados': Array.isArray(survey.chatbots_used) ? survey.chatbots_used.join(', ') : survey.chatbots_used || 'N/A',
            'Cursos': Array.isArray(survey.courses_used) ? survey.courses_used.join(', ') : survey.courses_used || 'N/A',
            'Propósitos': Array.isArray(survey.purposes) ? survey.purposes.join(', ') : survey.purposes || 'N/A',
            'Resultados': Array.isArray(survey.outcomes) ? survey.outcomes.join(', ') : survey.outcomes || 'N/A',
            'Desafíos': Array.isArray(survey.challenges) ? survey.challenges.join(', ') : survey.challenges || 'N/A',
            'Probabilidad Uso Futuro': survey.likelihood_future_use || 'N/A',
            'Ventajas': Array.isArray(survey.advantages) ? survey.advantages.join(', ') : survey.advantages || 'N/A',
            'Preocupaciones': Array.isArray(survey.concerns) ? survey.concerns.join(', ') : survey.concerns || 'N/A',
            'Recursos Necesarios': Array.isArray(survey.resources_needed) ? survey.resources_needed.join(', ') : survey.resources_needed || 'N/A',
            'Recomendaría': survey.would_recommend ? 'Sí' : 'No',
            'Rango de Edad': survey.age_range || 'N/A',
            'Tipo de Institución': survey.institution_type || 'N/A',
            'País': Array.isArray(survey.countries) ? survey.countries.join(', ') : survey.country || 'N/A',
            'Años de Experiencia': survey.years_experience || 'N/A',
            'Comentarios': survey.additional_comments || '',
            'Fecha de Creación': new Date(survey.created_at).toLocaleDateString('es-ES')
        }));

        res.json({ success: true, data: excelData, count: excelData.length });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al exportar encuestas de profesores', error: error.message });
    }
};

// ─── Exportar estadísticas (queries en paralelo) ──────────────────────────────
/**
 * CONCURRENCIA: antes las 8-10 queries para estadísticas de estudiantes y
 * profesores se ejecutaban en secuencia. Ahora se lanzan simultáneamente
 * con Promise.all, reduciendo el tiempo de respuesta significativamente.
 */
export const exportStatistics = async (req, res) => {
    try {
        const { type } = req.query;
        const statistics = {};

        if (type === 'student' || !type) {
            // Todas las queries de estadísticas de estudiante en paralelo
            const [
                studentStats,
                mostUsedChatbots,
                mostCommonTasks,
                frequencyDistribution
            ] = await Promise.all([
                StudentSurvey.getStatistics(),
                StudentSurvey.getMostUsedChatbots(),
                StudentSurvey.getMostCommonTasks(),
                StudentSurvey.getUsageFrequencyDistribution()
            ]);

            const general = {
                total_surveys: parseInt(studentStats?.total_surveys ?? 0) || 0,
                avg_usefulness: toNum(studentStats?.avg_usefulness, 2),
                avg_experience: toNum(studentStats?.avg_experience, 2),
                users_with_chatbot: parseInt(studentStats?.users_with_chatbot ?? 0) || 0,
                will_continue: parseInt(studentStats?.will_continue ?? 0) || 0,
                would_recommend: parseInt(studentStats?.would_recommend ?? 0) || 0,
                new_this_week: parseInt(studentStats?.new_this_week ?? 0) || 0,
                new_this_month: parseInt(studentStats?.new_this_month ?? 0) || 0,
            };

            statistics.student = {
                general,
                chatbots: mostUsedChatbots,
                tasks: mostCommonTasks,
                frequency: frequencyDistribution
            };
        }

        if (type === 'teacher' || !type) {
            // Todas las queries de estadísticas de profesor en paralelo
            const [
                teacherStats,
                countryDist,
                institutionDist,
                commonPurposes,
                commonChallenges
            ] = await Promise.all([
                TeacherSurvey.getStatistics(),
                TeacherSurvey.getCountryDistribution(),
                TeacherSurvey.getInstitutionDistribution(),
                TeacherSurvey.getMostCommonPurposes(),
                TeacherSurvey.getMostCommonChallenges()
            ]);

            const general = {
                total_surveys: parseInt(teacherStats?.total_surveys ?? 0) || 0,
                teachers_using_chatbots: parseInt(teacherStats?.teachers_using_chatbots ?? 0) || 0,
                very_likely_continue: parseInt(teacherStats?.very_likely_continue ?? 0) || 0,
                likely_continue: parseInt(teacherStats?.likely_continue ?? 0) || 0,
                unlikely_continue: parseInt(teacherStats?.unlikely_continue ?? 0) || 0,
                new_this_week: parseInt(teacherStats?.new_this_week ?? 0) || 0,
                new_this_month: parseInt(teacherStats?.new_this_month ?? 0) || 0,
            };

            statistics.teacher = {
                general,
                countries: countryDist,
                institutions: institutionDist,
                purposes: commonPurposes,
                challenges: commonChallenges
            };
        }

        res.json({ success: true, statistics });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al exportar estadísticas', error: error.message });
    }
};

export default { exportStudentSurveys, exportTeacherSurveys, exportStatistics };