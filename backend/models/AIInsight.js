/**
 * Modelo de Insight de IA — PostgreSQL (pg)
 *
 * Guarda un único análisis "vivo" por usuario (upsert por user_id), generado
 * a partir de su propio historial de encuestas. No es un registro histórico:
 * cada nueva encuesta reemplaza el insight anterior con uno recalculado.
 *
 * SOLID: SRP — solo define el acceso a datos de ai_insights. La lógica de
 * cuándo/cómo generar el contenido vive en AIInsightService.
 */

import { pool } from '../config/database.js';

class AIInsight {

    // ── Crear/reiniciar como "pendiente" (se llama al recibir una encuesta) ──
    static async markPending(userId, surveyType, sourceSurveyId) {
        const { rows } = await pool.query(
            `INSERT INTO ai_insights (user_id, survey_type, status, source_survey_id, summary, recommendations, error_message)
             VALUES ($1, $2, 'pending', $3, NULL, '{}', NULL)
             ON CONFLICT (user_id) DO UPDATE SET
                survey_type = EXCLUDED.survey_type,
                status = 'pending',
                source_survey_id = EXCLUDED.source_survey_id,
                error_message = NULL,
                updated_at = NOW()
             RETURNING *`,
            [userId, surveyType, sourceSurveyId]
        );
        return rows[0];
    }

    // ── Marcar como listo, con el contenido generado ─────────────────────────
    static async markReady(userId, { summary, recommendations, model }) {
        const { rows } = await pool.query(
            `UPDATE ai_insights
             SET status = 'ready', summary = $2, recommendations = $3,
                 model = $4, error_message = NULL, updated_at = NOW()
             WHERE user_id = $1
             RETURNING *`,
            [userId, summary, recommendations || [], model || null]
        );
        return rows[0] || null;
    }

    // ── Marcar como fallido ────────────────────────────────────────────────
    static async markFailed(userId, errorMessage) {
        const { rows } = await pool.query(
            `UPDATE ai_insights
             SET status = 'failed', error_message = $2, updated_at = NOW()
             WHERE user_id = $1
             RETURNING *`,
            [userId, (errorMessage || '').slice(0, 500)]
        );
        return rows[0] || null;
    }

    // ── Obtener el insight de un usuario ─────────────────────────────────────
    static async findByUserId(userId) {
        const { rows } = await pool.query(
            `SELECT status, summary, recommendations, survey_type, error_message, updated_at
             FROM ai_insights WHERE user_id = $1`,
            [userId]
        );
        return rows[0] || null;
    }
}

export default AIInsight;
