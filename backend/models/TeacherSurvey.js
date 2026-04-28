/**
 * Modelo de Encuesta de Profesor — Mongoose Schema
 *
 * Equivalencias con la versión PostgreSQL:
 *  - TEXT[]                          → [String]
 *  - UNIQUE(user_id, DATE(created_at)) → índice compuesto + survey_date
 *  - UNNEST + GROUP BY               → $unwind + $group en aggregation pipeline
 *
 * SOLID: SRP — solo define la estructura y el acceso a datos de encuestas docentes.
 */

import mongoose from 'mongoose';

// ─── Schema ───────────────────────────────────────────────────────────────────
const teacherSurveySchema = new mongoose.Schema(
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
        courses_used: [String],
        purposes: [String],
        outcomes: [String],
        challenges: [String],
        likelihood_future_use: String,
        advantages: [String],
        concerns: [String],
        resources_needed: [String],
        would_recommend: Boolean,
        age_range: String,
        institution_type: String,
        countries: [String],
        years_experience: String,
        additional_comments: String,
        // Campo auxiliar para el índice de idempotencia (una encuesta por día)
        survey_date: String,
    },
    {
        timestamps: { createdAt: 'created_at', updatedAt: false },
        versionKey: false,
    }
);

// ─── Índices de rendimiento ───────────────────────────────────────────────────
teacherSurveySchema.index({ user_id: 1 });
teacherSurveySchema.index({ created_at: -1 });

// ─── Índice de idempotencia ───────────────────────────────────────────────────
teacherSurveySchema.index({ user_id: 1, survey_date: 1 }, { unique: true });

const TeacherSurveyModel = mongoose.model(
    'TeacherSurvey',
    teacherSurveySchema,
    'teacher_surveys'
);

// ─── Helper: pipeline con JOIN al usuario ─────────────────────────────────────
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

const normalize = (doc) => {
    if (!doc) return null;
    const { _id, _user, survey_date, ...rest } = doc;
    return { id: _id?.toString() ?? doc.id, ...rest };
};

// ─── Clase estática TeacherSurvey (misma API que la versión pg) ───────────────
class TeacherSurvey {

    // ── Crear encuesta (idempotente por usuario + día) ────────────────────────
    static async create(surveyData) {
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const surveyDate = today.toISOString().split('T')[0];

            const doc = new TeacherSurveyModel({
                user_id: surveyData.user_id,
                survey_date: surveyDate,
                has_used_chatbot: surveyData.has_used_chatbot,
                chatbots_used: surveyData.chatbots_used || [],
                courses_used: surveyData.courses_used || [],
                purposes: surveyData.purposes || [],
                outcomes: surveyData.outcomes || [],
                challenges: surveyData.challenges || [],
                likelihood_future_use: surveyData.likelihood_future_use,
                advantages: surveyData.advantages || [],
                concerns: surveyData.concerns || [],
                resources_needed: surveyData.resources_needed || [],
                would_recommend: surveyData.would_recommend,
                age_range: surveyData.age_range,
                institution_type: surveyData.institution_type,
                countries: surveyData.countries || [],
                years_experience: surveyData.years_experience,
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
            throw new Error(`Error al crear encuesta de profesor: ${error.message}`);
        }
    }

    // ── findAll ───────────────────────────────────────────────────────────────
    static async findAll() {
        const docs = await TeacherSurveyModel.aggregate(withUserPipeline());
        return docs.map(normalize);
    }

    // ── findById ──────────────────────────────────────────────────────────────
    static async findById(id) {
        try {
            const docs = await TeacherSurveyModel.aggregate(
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
            const docs = await TeacherSurveyModel.aggregate(
                withUserPipeline({ user_id: new mongoose.Types.ObjectId(userId) })
            );
            return docs.map(normalize);
        } catch {
            return [];
        }
    }

    // ── Actualizar ────────────────────────────────────────────────────────────
    static async update(id, surveyData) {
        try {
            const fields = [
                'has_used_chatbot', 'chatbots_used', 'courses_used', 'purposes',
                'outcomes', 'challenges', 'likelihood_future_use', 'advantages',
                'concerns', 'resources_needed', 'would_recommend', 'age_range',
                'institution_type', 'countries', 'years_experience', 'additional_comments',
            ];
            const updates = {};
            fields.forEach(f => {
                if (surveyData[f] !== undefined) updates[f] = surveyData[f];
            });

            const doc = await TeacherSurveyModel.findByIdAndUpdate(
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
            const doc = await TeacherSurveyModel.findByIdAndDelete(id).lean();
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

        const [agg] = await TeacherSurveyModel.aggregate([
            {
                $group: {
                    _id: null,
                    total_surveys: { $sum: 1 },
                    teachers_using_chatbots: {
                        $sum: { $cond: ['$has_used_chatbot', 1, 0] },
                    },
                    very_likely_continue: {
                        $sum: {
                            $cond: [{ $eq: ['$likelihood_future_use', 'Muy probable'] }, 1, 0],
                        },
                    },
                    likely_continue: {
                        $sum: {
                            $cond: [{ $eq: ['$likelihood_future_use', 'Probable'] }, 1, 0],
                        },
                    },
                    unlikely_continue: {
                        $sum: {
                            $cond: [{ $eq: ['$likelihood_future_use', 'Imposible'] }, 1, 0],
                        },
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
            { $project: { _id: 0 } },
        ]);

        return agg ?? {
            total_surveys: 0, teachers_using_chatbots: 0,
            very_likely_continue: 0, likely_continue: 0, unlikely_continue: 0,
            new_this_week: 0, new_this_month: 0,
        };
    }

    // ── Estadísticas por usuario ──────────────────────────────────────────────
    static async getUserStatistics(userId) {
        try {
            const [agg] = await TeacherSurveyModel.aggregate([
                { $match: { user_id: new mongoose.Types.ObjectId(userId) } },
                { $sort: { created_at: -1 } },
                {
                    $group: {
                        _id: null,
                        total_surveys: { $sum: 1 },
                        used_chatbot_count: {
                            $sum: { $cond: ['$has_used_chatbot', 1, 0] },
                        },
                        last_survey_date: { $max: '$created_at' },
                        first_survey_date: { $min: '$created_at' },
                        current_likelihood: { $first: '$likelihood_future_use' },
                    },
                },
                { $project: { _id: 0 } },
            ]);
            return agg ?? { total_surveys: 0 };
        } catch {
            return { total_surveys: 0 };
        }
    }

    // ── Distribución por país ─────────────────────────────────────────────────
    static async getCountryDistribution() {
        return TeacherSurveyModel.aggregate([
            { $match: { countries: { $exists: true, $ne: [] } } },
            { $unwind: '$countries' },
            { $group: { _id: '$countries', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $project: { _id: 0, country: '$_id', count: 1 } },
        ]);
    }

    // ── Distribución por institución ──────────────────────────────────────────
    static async getInstitutionDistribution() {
        return TeacherSurveyModel.aggregate([
            { $match: { institution_type: { $exists: true, $ne: null } } },
            { $group: { _id: '$institution_type', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $project: { _id: 0, institution_type: '$_id', count: 1 } },
        ]);
    }

    // ── Propósitos más comunes ────────────────────────────────────────────────
    static async getMostCommonPurposes() {
        return TeacherSurveyModel.aggregate([
            { $match: { purposes: { $exists: true, $ne: [] } } },
            { $unwind: '$purposes' },
            { $group: { _id: '$purposes', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $project: { _id: 0, purpose: '$_id', count: 1 } },
        ]);
    }

    // ── Desafíos más comunes ──────────────────────────────────────────────────
    static async getMostCommonChallenges() {
        return TeacherSurveyModel.aggregate([
            { $match: { challenges: { $exists: true, $ne: [] } } },
            { $unwind: '$challenges' },
            { $group: { _id: '$challenges', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $project: { _id: 0, challenge: '$_id', count: 1 } },
        ]);
    }

    // ── Recursos más solicitados ──────────────────────────────────────────────
    static async getMostRequestedResources() {
        return TeacherSurveyModel.aggregate([
            { $match: { resources_needed: { $exists: true, $ne: [] } } },
            { $unwind: '$resources_needed' },
            { $group: { _id: '$resources_needed', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $project: { _id: 0, resource: '$_id', count: 1 } },
        ]);
    }

    // ── userHasSurveys ────────────────────────────────────────────────────────
    static async userHasSurveys(userId) {
        try {
            const count = await TeacherSurveyModel.countDocuments({
                user_id: new mongoose.Types.ObjectId(userId),
            });
            return count > 0;
        } catch {
            return false;
        }
    }
}

export { TeacherSurveyModel };
export default TeacherSurvey;