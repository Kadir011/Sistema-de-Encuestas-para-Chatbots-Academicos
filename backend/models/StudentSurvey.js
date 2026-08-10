/**
 * Modelo de Encuesta de Estudiante — PostgreSQL (pg)
 *
 * Equivalencias con la versión MongoDB:
 *  - [String] (Mongoose)                → TEXT[] de PostgreSQL
 *  - índice único { user_id, survey_date } → UNIQUE INDEX (user_id, created_at::date)
 *  - error 11000                        → error.code === '23505' (unique_violation)
 *  - $lookup + $unwind (JOIN a users)   → JOIN SQL directo
 *  - $unwind + $group (UNNEST)          → UNNEST(columna) + GROUP BY
 *
 * SOLID: SRP — solo define el acceso a datos de encuestas estudiantiles.
 * Misma API estática que la versión Mongo para no tocar StudentSurveyRepository.
 */

import { pool } from '../config/database.js';

const SELECT_WITH_USER = `
    SELECT
        s.id, s.user_id, s.has_used_chatbot, s.chatbots_used, s.usage_frequency,
        s.usefulness_rating, s.tasks_used_for, s.overall_experience,
        s.preferred_chatbot, s.effectiveness_comparison, s.will_continue_using,
        s.would_recommend, s.additional_comments, s.created_at,
        u.username, u.email, u.role
    FROM student_surveys s
    LEFT JOIN users u ON u.id = s.user_id
`;

class StudentSurvey {

    // ── Crear encuesta (idempotente por usuario + día) ───────────────────────
    static async create(surveyData) {
        try {
            const { rows } = await pool.query(
                `INSERT INTO student_surveys (
                    user_id, has_used_chatbot, chatbots_used, usage_frequency,
                    usefulness_rating, tasks_used_for, overall_experience,
                    preferred_chatbot, effectiveness_comparison, will_continue_using,
                    would_recommend, additional_comments
                 ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
                 RETURNING *`,
                [
                    surveyData.user_id,
                    surveyData.has_used_chatbot,
                    surveyData.chatbots_used || [],
                    surveyData.usage_frequency,
                    surveyData.usefulness_rating,
                    surveyData.tasks_used_for || [],
                    surveyData.overall_experience,
                    surveyData.preferred_chatbot,
                    surveyData.effectiveness_comparison,
                    surveyData.will_continue_using,
                    surveyData.would_recommend,
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
            throw new Error(`Error al crear encuesta de estudiante: ${error.message}`);
        }
    }

    // ── findAll ──────────────────────────────────────────────────────────
    static async findAll() {
        const { rows } = await pool.query(`${SELECT_WITH_USER} ORDER BY s.created_at DESC`);
        return rows;
    }

    // ── findById ─────────────────────────────────────────────────────────
    static async findById(id) {
        try {
            const { rows } = await pool.query(`${SELECT_WITH_USER} WHERE s.id = $1`, [id]);
            return rows[0] || null;
        } catch {
            return null;
        }
    }

    // ── findByUserId ─────────────────────────────────────────────────────
    static async findByUserId(userId) {
        try {
            const { rows } = await pool.query(
                `${SELECT_WITH_USER} WHERE s.user_id = $1 ORDER BY s.created_at DESC`,
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
                'has_used_chatbot', 'chatbots_used', 'usage_frequency',
                'usefulness_rating', 'tasks_used_for', 'overall_experience',
                'preferred_chatbot', 'effectiveness_comparison',
                'will_continue_using', 'would_recommend', 'additional_comments',
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

            if (!setClauses.length) return StudentSurvey.findById(id);

            values.push(id);
            const { rows } = await pool.query(
                `UPDATE student_surveys SET ${setClauses.join(', ')} WHERE id = $${i} RETURNING *`,
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
                'DELETE FROM student_surveys WHERE id = $1 RETURNING id', [id]
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
                COUNT(*)::int                                                          AS total_surveys,
                ROUND(AVG(usefulness_rating)::numeric, 2)                              AS avg_usefulness,
                ROUND(AVG(overall_experience)::numeric, 2)                             AS avg_experience,
                COUNT(*) FILTER (WHERE has_used_chatbot)::int                          AS users_with_chatbot,
                COUNT(*) FILTER (WHERE will_continue_using)::int                       AS will_continue,
                COUNT(*) FILTER (WHERE would_recommend)::int                           AS would_recommend,
                COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days')::int   AS new_this_week,
                COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days')::int  AS new_this_month
            FROM student_surveys
        `);
        return rows[0] ?? {
            total_surveys: 0, avg_usefulness: 0, avg_experience: 0,
            users_with_chatbot: 0, will_continue: 0, would_recommend: 0,
            new_this_week: 0, new_this_month: 0,
        };
    }

    // ── Estadísticas por usuario ─────────────────────────────────────────
    static async getUserStatistics(userId) {
        try {
            const { rows } = await pool.query(`
                SELECT
                    COUNT(*)::int                                       AS total_surveys,
                    ROUND(AVG(usefulness_rating)::numeric, 2)           AS avg_usefulness,
                    ROUND(AVG(overall_experience)::numeric, 2)          AS avg_experience,
                    COUNT(*) FILTER (WHERE has_used_chatbot)::int       AS used_chatbot_count,
                    COUNT(*) FILTER (WHERE will_continue_using)::int    AS will_continue_count,
                    MAX(created_at)                                     AS last_survey_date,
                    MIN(created_at)                                     AS first_survey_date
                FROM student_surveys
                WHERE user_id = $1
            `, [userId]);
            return rows[0] ?? { total_surveys: 0 };
        } catch {
            return { total_surveys: 0 };
        }
    }

    // ── Chatbots más usados (equivalente a UNNEST + GROUP BY) ────────────
    static async getMostUsedChatbots() {
        const { rows } = await pool.query(`
            SELECT chatbot, COUNT(*)::int AS count
            FROM student_surveys, UNNEST(chatbots_used) AS chatbot
            GROUP BY chatbot
            ORDER BY count DESC
            LIMIT 10
        `);
        return rows;
    }

    // ── Tareas más comunes ─────────────────────────────────────────────────
    static async getMostCommonTasks() {
        const { rows } = await pool.query(`
            SELECT task, COUNT(*)::int AS count
            FROM student_surveys, UNNEST(tasks_used_for) AS task
            GROUP BY task
            ORDER BY count DESC
        `);
        return rows;
    }

    // ── Distribución de frecuencia ────────────────────────────────────────
    static async getUsageFrequencyDistribution() {
        const ORDER = {
            'Muy frecuentemente': 1,
            'Frecuentemente': 2,
            'Ocasionalmente': 3,
            'Casi nunca': 4,
            'Nunca': 5,
        };
        const { rows } = await pool.query(`
            SELECT usage_frequency, COUNT(*)::int AS count
            FROM student_surveys
            WHERE usage_frequency IS NOT NULL
            GROUP BY usage_frequency
        `);
        return rows.sort(
            (a, b) => (ORDER[a.usage_frequency] ?? 99) - (ORDER[b.usage_frequency] ?? 99)
        );
    }

    // ── userHasSurveys ───────────────────────────────────────────────────
    static async userHasSurveys(userId) {
        try {
            const { rows } = await pool.query(
                'SELECT 1 FROM student_surveys WHERE user_id = $1 LIMIT 1', [userId]
            );
            return rows.length > 0;
        } catch {
            return false;
        }
    }
}

export default StudentSurvey;