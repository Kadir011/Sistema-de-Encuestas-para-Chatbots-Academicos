/**
 * Modelo de Encuesta de Profesor — PostgreSQL (pg)
 *
 * Equivalencias con la versión MongoDB: ver StudentSurvey.js (mismos patrones:
 * TEXT[] en lugar de [String], JOIN SQL en lugar de $lookup, UNNEST + GROUP BY
 * en lugar de $unwind + $group).
 *
 * SOLID: SRP — solo define el acceso a datos de encuestas docentes.
 * Misma API estática que la versión Mongo para no tocar TeacherSurveyRepository.
 */

import { pool } from '../config/database.js';

const SELECT_WITH_USER = `
    SELECT
        t.id, t.user_id, t.has_used_chatbot, t.chatbots_used, t.courses_used,
        t.purposes, t.outcomes, t.challenges, t.likelihood_future_use,
        t.advantages, t.concerns, t.resources_needed, t.would_recommend,
        t.age_range, t.institution_type, t.countries, t.years_experience,
        t.additional_comments, t.created_at,
        u.username, u.email, u.role
    FROM teacher_surveys t
    LEFT JOIN users u ON u.id = t.user_id
`;

// Columnas devueltas por INSERT/UPDATE (sin survey_date: es un campo interno
// para el índice de idempotencia, igual que en la versión Mongo original).
const RETURNING_COLUMNS = `
    id, user_id, has_used_chatbot, chatbots_used, courses_used, purposes,
    outcomes, challenges, likelihood_future_use, advantages, concerns,
    resources_needed, would_recommend, age_range, institution_type,
    countries, years_experience, additional_comments, created_at
`;

class TeacherSurvey {

    // ── Crear encuesta (idempotente por usuario + día) ───────────────────────
    static async create(surveyData) {
        try {
            const { rows } = await pool.query(
                `INSERT INTO teacher_surveys (
                    user_id, has_used_chatbot, chatbots_used, courses_used, purposes,
                    outcomes, challenges, likelihood_future_use, advantages, concerns,
                    resources_needed, would_recommend, age_range, institution_type,
                    countries, years_experience, additional_comments
                 ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
                 RETURNING ${RETURNING_COLUMNS}`,
                [
                    surveyData.user_id,
                    surveyData.has_used_chatbot,
                    surveyData.chatbots_used || [],
                    surveyData.courses_used || [],
                    surveyData.purposes || [],
                    surveyData.outcomes || [],
                    surveyData.challenges || [],
                    surveyData.likelihood_future_use,
                    surveyData.advantages || [],
                    surveyData.concerns || [],
                    surveyData.resources_needed || [],
                    surveyData.would_recommend,
                    surveyData.age_range,
                    surveyData.institution_type,
                    surveyData.countries || [],
                    surveyData.years_experience,
                    surveyData.additional_comments,
                ]
            );
            return rows[0];
        } catch (error) {
            if (error.code === '23505') {
                throw new Error(
                    'Ya existe una encuesta registrada para hoy. Solo se permite una encuesta por día.'
                );
            }
            throw new Error(`Error al crear encuesta de profesor: ${error.message}`);
        }
    }

    // ── findAll ──────────────────────────────────────────────────────────
    static async findAll() {
        const { rows } = await pool.query(`${SELECT_WITH_USER} ORDER BY t.created_at DESC`);
        return rows;
    }

    // ── findById ─────────────────────────────────────────────────────────
    static async findById(id) {
        try {
            const { rows } = await pool.query(`${SELECT_WITH_USER} WHERE t.id = $1`, [id]);
            return rows[0] || null;
        } catch {
            return null;
        }
    }

    // ── findByUserId ─────────────────────────────────────────────────────
    static async findByUserId(userId) {
        try {
            const { rows } = await pool.query(
                `${SELECT_WITH_USER} WHERE t.user_id = $1 ORDER BY t.created_at DESC`,
                [userId]
            );
            return rows;
        } catch {
            return [];
        }
    }

    // ── Actualizar ───────────────────────────────────────────────────────
    static async update(id, surveyData) {
        try {
            const fields = [
                'has_used_chatbot', 'chatbots_used', 'courses_used', 'purposes',
                'outcomes', 'challenges', 'likelihood_future_use', 'advantages',
                'concerns', 'resources_needed', 'would_recommend', 'age_range',
                'institution_type', 'countries', 'years_experience', 'additional_comments',
            ];

            const setClauses = [];
            const values = [];
            let i = 1;
            fields.forEach(f => {
                if (surveyData[f] !== undefined) {
                    setClauses.push(`${f} = $${i++}`);
                    values.push(surveyData[f]);
                }
            });

            if (!setClauses.length) return TeacherSurvey.findById(id);

            values.push(id);
            const { rows } = await pool.query(
                `UPDATE teacher_surveys SET ${setClauses.join(', ')} WHERE id = $${i} RETURNING ${RETURNING_COLUMNS}`,
                values
            );
            return rows[0] || null;
        } catch (error) {
            throw new Error(`Error al actualizar encuesta: ${error.message}`);
        }
    }

    // ── Eliminar ─────────────────────────────────────────────────────────
    static async delete(id) {
        try {
            const { rows } = await pool.query(
                'DELETE FROM teacher_surveys WHERE id = $1 RETURNING id', [id]
            );
            return rows[0] || null;
        } catch {
            return null;
        }
    }

    // ── Estadísticas globales ───────────────────────────────────────────────
    static async getStatistics() {
        const { rows } = await pool.query(`
            SELECT
                COUNT(*)::int                                                                              AS total_surveys,
                COUNT(*) FILTER (WHERE has_used_chatbot)::int                                              AS teachers_using_chatbots,
                COUNT(*) FILTER (WHERE likelihood_future_use = 'Muy probable')::int                        AS very_likely_continue,
                COUNT(*) FILTER (WHERE likelihood_future_use = 'Probable')::int                            AS likely_continue,
                COUNT(*) FILTER (WHERE likelihood_future_use = 'Imposible')::int                           AS unlikely_continue,
                COUNT(*) FILTER (WHERE would_recommend)::int                                               AS would_recommend_count,
                COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days')::int                       AS new_this_week,
                COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days')::int                      AS new_this_month
            FROM teacher_surveys
        `);
        return rows[0] ?? {
            total_surveys: 0, teachers_using_chatbots: 0,
            very_likely_continue: 0, likely_continue: 0, unlikely_continue: 0,
            would_recommend_count: 0, new_this_week: 0, new_this_month: 0,
        };
    }

    // ── Estadísticas por usuario ─────────────────────────────────────────
    static async getUserStatistics(userId) {
        try {
            const { rows } = await pool.query(`
                SELECT
                    COUNT(*)::int                                    AS total_surveys,
                    COUNT(*) FILTER (WHERE has_used_chatbot)::int    AS used_chatbot_count,
                    MAX(created_at)                                  AS last_survey_date,
                    MIN(created_at)                                  AS first_survey_date,
                    (ARRAY_AGG(likelihood_future_use ORDER BY created_at DESC))[1] AS current_likelihood
                FROM teacher_surveys
                WHERE user_id = $1
            `, [userId]);
            return rows[0] ?? { total_surveys: 0 };
        } catch {
            return { total_surveys: 0 };
        }
    }

    // ── Distribución por país ─────────────────────────────────────────────
    static async getCountryDistribution() {
        const { rows } = await pool.query(`
            SELECT country, COUNT(*)::int AS count
            FROM teacher_surveys, UNNEST(countries) AS country
            GROUP BY country
            ORDER BY count DESC
        `);
        return rows;
    }

    // ── Distribución por institución ───────────────────────────────────────
    static async getInstitutionDistribution() {
        const { rows } = await pool.query(`
            SELECT institution_type, COUNT(*)::int AS count
            FROM teacher_surveys
            WHERE institution_type IS NOT NULL
            GROUP BY institution_type
            ORDER BY count DESC
        `);
        return rows;
    }

    // ── Propósitos más comunes ─────────────────────────────────────────────
    static async getMostCommonPurposes() {
        const { rows } = await pool.query(`
            SELECT purpose, COUNT(*)::int AS count
            FROM teacher_surveys, UNNEST(purposes) AS purpose
            GROUP BY purpose
            ORDER BY count DESC
        `);
        return rows;
    }

    // ── Desafíos más comunes ────────────────────────────────────────────────
    static async getMostCommonChallenges() {
        const { rows } = await pool.query(`
            SELECT challenge, COUNT(*)::int AS count
            FROM teacher_surveys, UNNEST(challenges) AS challenge
            GROUP BY challenge
            ORDER BY count DESC
        `);
        return rows;
    }

    // ── Recursos más solicitados ────────────────────────────────────────────
    static async getMostRequestedResources() {
        const { rows } = await pool.query(`
            SELECT resource, COUNT(*)::int AS count
            FROM teacher_surveys, UNNEST(resources_needed) AS resource
            GROUP BY resource
            ORDER BY count DESC
        `);
        return rows;
    }

    // ── userHasSurveys ───────────────────────────────────────────────────
    static async userHasSurveys(userId) {
        try {
            const { rows } = await pool.query(
                'SELECT 1 FROM teacher_surveys WHERE user_id = $1 LIMIT 1', [userId]
            );
            return rows.length > 0;
        } catch {
            return false;
        }
    }
}

export default TeacherSurvey;