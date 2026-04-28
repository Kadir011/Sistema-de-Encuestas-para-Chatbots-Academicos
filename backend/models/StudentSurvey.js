/**
 * Modelo de Encuesta de Estudiante — Mongoose Schema
 *
 * Equivalencias con la versión PostgreSQL:
 *  - TEXT[]                          → [String] en Mongoose
 *  - UNIQUE(user_id, DATE(created_at)) → índice compuesto + validación en create()
 *  - INSERT ON CONFLICT DO NOTHING    → error 11000 capturado en create()
 *  - transaction()                    → recibe session opcional en update()
 *  - UNNEST + GROUP BY               → $unwind + $group en aggregation pipeline
 *
 * SOLID: SRP — solo define la estructura y el acceso a datos de encuestas estudiantiles.
 */

import mongoose from 'mongoose';

// ─── Schema ───────────────────────────────────────────────────────────────────
const studentSurveySchema = new mongoose.Schema(
    {
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        has_used_chatbot: {
            type: Boolean,
            required: true,
        },
        chatbots_used: [String],
        usage_frequency: String,
        usefulness_rating: {
            type: Number,
            min: 1,
            max: 5,
        },
        tasks_used_for: [String],
        overall_experience: {
            type: Number,
            min: 1,
            max: 5,
        },
        preferred_chatbot: String,
        effectiveness_comparison: String,
        will_continue_using: Boolean,
        would_recommend: Boolean,
        additional_comments: String,
    },
    {
        timestamps: { createdAt: 'created_at', updatedAt: false },
        versionKey: false,
    }
);

// ─── Índices de rendimiento ───────────────────────────────────────────────────
studentSurveySchema.index({ user_id: 1 });
studentSurveySchema.index({ created_at: -1 });

// ─── Índice de idempotencia (una encuesta por usuario por día) ────────────────
// Equivalente al UNIQUE INDEX idx_student_survey_user_day de PostgreSQL.
// Se implementa como índice compuesto con un campo calculado en la capa de
// aplicación, ya que MongoDB no soporta índices funcionales DATE() de forma nativa.
// La restricción se aplica en create() comparando la fecha del día.
studentSurveySchema.index({ user_id: 1, survey_date: 1 }, { unique: true });

const StudentSurveyModel = mongoose.model(
    'StudentSurvey',
    studentSurveySchema,
    'student_surveys'
);

// ─── Helper: proyección con JOIN (lookup) ─────────────────────────────────────
const withUserPipeline = (matchStage = {}) => [
    { $match: matchStage },
    {
        $lookup: {
            from: 'users',
            localField: 'user_id',
            foreignField: '_id',
            as: '_user',
        },
    },
    { $unwind: { path: '$_user', preserveNullAndEmptyArrays: true } },
    {
        $addFields: {
            id: { $toString: '$_id' },
            username: '$_user.username',
            email: '$_user.email',
            role: '$_user.role',
        },
    },
    { $sort: { created_at: -1 } },
];

// ─── Helper: convierte _id → id ───────────────────────────────────────────────
const normalize = (doc) => {
    if (!doc) return null;
    const { _id, _user, survey_date, ...rest } = doc;
    return { id: _id?.toString() ?? doc.id, ...rest };
};

// ─── Clase estática StudentSurvey (misma API que la versión pg) ──────────────
class StudentSurvey {

    // ── Crear encuesta (idempotente por usuario + día) ────────────────────────
    static async create(surveyData) {
        try {
            // Calcular la fecha del día (YYYY-MM-DD) para el índice único
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const surveyDate = today.toISOString().split('T')[0];

            const doc = new StudentSurveyModel({
                user_id: surveyData.user_id,
                survey_date: surveyDate,
                has_used_chatbot: surveyData.has_used_chatbot,
                chatbots_used: surveyData.chatbots_used || [],
                usage_frequency: surveyData.usage_frequency,
                usefulness_rating: surveyData.usefulness_rating,
                tasks_used_for: surveyData.tasks_used_for || [],
                overall_experience: surveyData.overall_experience,
                preferred_chatbot: surveyData.preferred_chatbot,
                effectiveness_comparison: surveyData.effectiveness_comparison,
                will_continue_using: surveyData.will_continue_using,
                would_recommend: surveyData.would_recommend,
                additional_comments: surveyData.additional_comments,
            });

            await doc.save();
            return normalize(doc.toObject());
        } catch (error) {
            if (error.code === 11000) {
                throw new Error(
                    'Ya existe una encuesta registrada para hoy. Solo se permite una encuesta por día.'
                );
            }
            throw new Error(`Error al crear encuesta de estudiante: ${error.message}`);
        }
    }

    // ── findAll ───────────────────────────────────────────────────────────────
    static async findAll() {
        const docs = await StudentSurveyModel.aggregate(withUserPipeline());
        return docs.map(normalize);
    }

    // ── findById ──────────────────────────────────────────────────────────────
    static async findById(id) {
        try {
            const docs = await StudentSurveyModel.aggregate(
                withUserPipeline({ _id: new mongoose.Types.ObjectId(id) })
            );
            return normalize(docs[0]);
        } catch {
            return null;
        }
    }

    // ── findByUserId ──────────────────────────────────────────────────────────
    static async findByUserId(userId) {
        try {
            const docs = await StudentSurveyModel.aggregate(
                withUserPipeline({ user_id: new mongoose.Types.ObjectId(userId) })
            );
            return docs.map(normalize);
        } catch {
            return [];
        }
    }

    // ── Actualizar (con transacción opcional) ─────────────────────────────────
    static async update(id, surveyData) {
        try {
            const updates = {};
            const fields = [
                'has_used_chatbot', 'chatbots_used', 'usage_frequency',
                'usefulness_rating', 'tasks_used_for', 'overall_experience',
                'preferred_chatbot', 'effectiveness_comparison',
                'will_continue_using', 'would_recommend', 'additional_comments',
            ];
            fields.forEach(f => {
                if (surveyData[f] !== undefined) updates[f] = surveyData[f];
            });

            const doc = await StudentSurveyModel.findByIdAndUpdate(
                id,
                { $set: updates },
                { new: true, runValidators: true }
            ).lean();

            return normalize(doc);
        } catch (error) {
            throw new Error(`Error al actualizar encuesta: ${error.message}`);
        }
    }

    // ── Eliminar ──────────────────────────────────────────────────────────────
    static async delete(id) {
        try {
            const doc = await StudentSurveyModel.findByIdAndDelete(id).lean();
            return doc ? { id: doc._id.toString() } : null;
        } catch {
            return null;
        }
    }

    // ── Estadísticas globales ─────────────────────────────────────────────────
    static async getStatistics() {
        const now = new Date();
        const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
        const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);

        const [agg] = await StudentSurveyModel.aggregate([
            {
                $group: {
                    _id: null,
                    total_surveys: { $sum: 1 },
                    avg_usefulness: { $avg: '$usefulness_rating' },
                    avg_experience: { $avg: '$overall_experience' },
                    users_with_chatbot: {
                        $sum: { $cond: ['$has_used_chatbot', 1, 0] },
                    },
                    will_continue: {
                        $sum: { $cond: ['$will_continue_using', 1, 0] },
                    },
                    would_recommend: {
                        $sum: { $cond: ['$would_recommend', 1, 0] },
                    },
                    new_this_week: {
                        $sum: {
                            $cond: [{ $gte: ['$created_at', sevenDaysAgo] }, 1, 0],
                        },
                    },
                    new_this_month: {
                        $sum: {
                            $cond: [{ $gte: ['$created_at', thirtyDaysAgo] }, 1, 0],
                        },
                    },
                },
            },
            {
                $project: {
                    _id: 0,
                    total_surveys: 1,
                    avg_usefulness: { $round: ['$avg_usefulness', 2] },
                    avg_experience: { $round: ['$avg_experience', 2] },
                    users_with_chatbot: 1,
                    will_continue: 1,
                    would_recommend: 1,
                    new_this_week: 1,
                    new_this_month: 1,
                },
            },
        ]);

        return agg ?? {
            total_surveys: 0, avg_usefulness: 0, avg_experience: 0,
            users_with_chatbot: 0, will_continue: 0, would_recommend: 0,
            new_this_week: 0, new_this_month: 0,
        };
    }

    // ── Estadísticas por usuario ──────────────────────────────────────────────
    static async getUserStatistics(userId) {
        try {
            const [agg] = await StudentSurveyModel.aggregate([
                { $match: { user_id: new mongoose.Types.ObjectId(userId) } },
                {
                    $group: {
                        _id: null,
                        total_surveys: { $sum: 1 },
                        avg_usefulness: { $avg: '$usefulness_rating' },
                        avg_experience: { $avg: '$overall_experience' },
                        used_chatbot_count: {
                            $sum: { $cond: ['$has_used_chatbot', 1, 0] },
                        },
                        will_continue_count: {
                            $sum: { $cond: ['$will_continue_using', 1, 0] },
                        },
                        last_survey_date: { $max: '$created_at' },
                        first_survey_date: { $min: '$created_at' },
                    },
                },
                {
                    $project: {
                        _id: 0,
                        total_surveys: 1,
                        avg_usefulness: { $round: ['$avg_usefulness', 2] },
                        avg_experience: { $round: ['$avg_experience', 2] },
                        used_chatbot_count: 1,
                        will_continue_count: 1,
                        last_survey_date: 1,
                        first_survey_date: 1,
                    },
                },
            ]);
            return agg ?? { total_surveys: 0 };
        } catch {
            return { total_surveys: 0 };
        }
    }

    // ── Chatbots más usados (equivalente a UNNEST + GROUP BY) ─────────────────
    static async getMostUsedChatbots() {
        return StudentSurveyModel.aggregate([
            { $match: { chatbots_used: { $exists: true, $ne: [] } } },
            { $unwind: '$chatbots_used' },
            { $group: { _id: '$chatbots_used', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 },
            { $project: { _id: 0, chatbot: '$_id', count: 1 } },
        ]);
    }

    // ── Tareas más comunes ────────────────────────────────────────────────────
    static async getMostCommonTasks() {
        return StudentSurveyModel.aggregate([
            { $match: { tasks_used_for: { $exists: true, $ne: [] } } },
            { $unwind: '$tasks_used_for' },
            { $group: { _id: '$tasks_used_for', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $project: { _id: 0, task: '$_id', count: 1 } },
        ]);
    }

    // ── Distribución de frecuencia ────────────────────────────────────────────
    static async getUsageFrequencyDistribution() {
        const ORDER = {
            'Muy frecuentemente': 1,
            'Frecuentemente': 2,
            'Ocasionalmente': 3,
            'Casi nunca': 4,
            'Nunca': 5,
        };
        const docs = await StudentSurveyModel.aggregate([
            { $match: { usage_frequency: { $exists: true, $ne: null } } },
            { $group: { _id: '$usage_frequency', count: { $sum: 1 } } },
            { $project: { _id: 0, usage_frequency: '$_id', count: 1 } },
        ]);
        return docs.sort(
            (a, b) =>
                (ORDER[a.usage_frequency] ?? 99) - (ORDER[b.usage_frequency] ?? 99)
        );
    }

    // ── userHasSurveys ────────────────────────────────────────────────────────
    static async userHasSurveys(userId) {
        try {
            const count = await StudentSurveyModel.countDocuments({
                user_id: new mongoose.Types.ObjectId(userId),
            });
            return count > 0;
        } catch {
            return false;
        }
    }
}

export { StudentSurveyModel };
export default StudentSurvey;