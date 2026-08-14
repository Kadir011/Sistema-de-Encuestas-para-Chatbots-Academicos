/**
 * Servicio de Insights de IA
 *
 * Genera un análisis personalizado en lenguaje natural a partir del propio
 * historial de encuestas de un usuario ("Notamos que usás X sobre todo
 * para...", + 2-3 recomendaciones concretas). Es la pieza "meta" del
 * producto: usa IA para dar valor inmediato sobre el propio uso de IA.
 *
 * SOLID aplicado:
 * ─ SRP: esta clase solo sabe generar el insight (armar el prompt, llamar
 *         al proveedor de IA, parsear la respuesta). No sabe nada de HTTP
 *         ni de cuándo debe dispararse — eso lo decide el listener.
 * ─ DIP: depende de SurveyRepositoryFactory (abstracción) para leer el
 *         historial, igual que SurveyService.
 * ─ OCP: cambiar de proveedor de IA (Gemini → otro) es tocar solo
 *         _callProvider(); el resto del pipeline no cambia.
 *
 * PATRÓN: se invoca desde un listener del Observer (domainEventListeners.js)
 *         de forma "fire and forget" — nunca bloquea la creación de la
 *         encuesta ni puede hacer fallar el submit del usuario.
 *
 * Proveedor de IA: Google Gemini (gemini-2.5-flash), capa gratuita —
 * https://ai.google.dev/gemini-api/docs/pricing — no requiere tarjeta.
 * Se llama por REST directa (fetch nativo de Node 18+), sin SDK adicional,
 * para no sumar dependencias al proyecto.
 */

import { SurveyRepositoryFactory } from '../repositories/SurveyRepository.js';
import AIInsight from '../models/AIInsight.js';

// gemini-3.1-flash-lite: modelo GA (estable), capa gratuita, soporta salida
// estructurada (responseSchema) y sin fecha de retiro anunciada al momento
// de escribir esto. Evitar "gemini-2.5-flash": Google lo está retirando
// activamente y hay reportes de fallos antes de su fecha oficial de baja.
// Si en el futuro este modelo también se deprecara, cambiarlo acá es el
// único lugar que hay que tocar — correr scripts/check-gemini.py primero
// para confirmar qué modelos están disponibles con tu API key.
const GEMINI_MODEL = 'gemini-3.1-flash-lite';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;
const REQUEST_TIMEOUT_MS = 20000;
const MAX_SURVEYS_IN_PROMPT = 10; // acota tokens/costo; alcanza para detectar patrones

// Reintentos solo para errores transitorios del lado de Google (capa
// gratuita: es común recibir 503 "high demand" o 429 "quota" momentáneos).
// Un 404 (modelo inexistente) o 400 (request mal formado) NO se reintenta:
// reintentar no lo va a arreglar, solo gasta cuota gratuita para nada.
const MAX_ATTEMPTS = 3; // intento inicial + 2 reintentos
const RETRYABLE_STATUS = new Set([429, 503]);
const RETRY_DELAYS_MS = [1500, 3000];

// Esquema de salida estructurada — evita depender de parsear texto libre.
const RESPONSE_SCHEMA = {
    type: 'OBJECT',
    properties: {
        summary: {
            type: 'STRING',
            description: 'Análisis personalizado de 2 a 4 oraciones, en español, tono cercano.',
        },
        recommendations: {
            type: 'ARRAY',
            items: { type: 'STRING' },
            minItems: 2,
            maxItems: 3,
            description: 'Entre 2 y 3 recomendaciones concretas y accionables.',
        },
    },
    required: ['summary', 'recommendations'],
};

class AIInsightService {

    /**
     * Genera (o regenera) el insight de un usuario a partir de su propio
     * historial. Nunca lanza hacia afuera: cualquier error se guarda como
     * status='failed' para que el endpoint de lectura lo refleje, en vez de
     * tumbar al listener que lo invoca.
     *
     * @param {number} userId
     * @param {'student'|'teacher'} surveyType
     */
    static async generateForUser(userId, surveyType) {
        try {
            const apiKey = process.env.GEMINI_API_KEY;
            if (!apiKey) {
                await AIInsight.markFailed(userId, 'IA no configurada (falta GEMINI_API_KEY)');
                return;
            }

            const repo = SurveyRepositoryFactory.create(surveyType);
            const surveys = await repo.findByUserId(userId);

            if (!surveys.length) {
                await AIInsight.markFailed(userId, 'Sin encuestas para analizar');
                return;
            }

            const prompt = this._buildPrompt(surveyType, surveys.slice(0, MAX_SURVEYS_IN_PROMPT));
            const result = await this._callProvider(prompt, apiKey);

            await AIInsight.markReady(userId, {
                summary: result.summary,
                recommendations: result.recommendations,
                model: GEMINI_MODEL,
            });
        } catch (error) {
            const message = `[${GEMINI_MODEL}] ${error.message}`;
            console.error('[AIInsightService] Error generando insight:', message);
            await AIInsight.markFailed(userId, message).catch(() => {});
        }
    }

    // ── Construcción del prompt ─────────────────────────────────────────────
    // IMPORTANTE (privacidad): solo se envían las respuestas del propio
    // usuario a sus propias encuestas. Nunca username, email, ni datos de
    // otros usuarios.
    static _buildPrompt(surveyType, surveys) {
        const compact = surveys.map(s => surveyType === 'student'
            ? {
                fecha: s.created_at,
                uso_chatbot: s.has_used_chatbot,
                herramientas: s.chatbots_used,
                frecuencia: s.usage_frequency,
                utilidad_1_a_5: s.usefulness_rating,
                tareas: s.tasks_used_for,
                experiencia_general_1_a_5: s.overall_experience,
                seguira_usando: s.will_continue_using,
                recomendaria: s.would_recommend,
                comentario: s.additional_comments || null,
            }
            : {
                fecha: s.created_at,
                uso_chatbot: s.has_used_chatbot,
                herramientas: s.chatbots_used,
                cursos: s.courses_used,
                propositos: s.purposes,
                desafios: s.challenges,
                probabilidad_seguir_usando: s.likelihood_future_use,
                preocupaciones: s.concerns,
                recomendaria: s.would_recommend,
                comentario: s.additional_comments || null,
            }
        );

        const role = surveyType === 'student' ? 'estudiante' : 'docente';

        const instructions = `Sos un asistente educativo que analiza el historial de encuestas de ` +
            `un ${role} sobre su propio uso de chatbots de IA en contextos académicos, y le devuelve ` +
            `un análisis personalizado, breve y accionable.\n\n` +
            `Reglas:\n` +
            `- Escribí en español, en tono cercano y directo, dirigiéndote a la persona como "vos" o "tu".\n` +
            `- Basate ÚNICAMENTE en los datos provistos abajo; no inventes hechos ni cites herramientas/datos que no aparezcan.\n` +
            `- "summary": 2 a 4 oraciones. Identificá un patrón concreto (qué usa, para qué, y algo notable como una ` +
            `calificación baja/alta o un cambio en el tiempo). Ejemplo de tono: "Notamos que usás ChatGPT sobre todo ` +
            `para resumir lecturas, pero calificaste bajo la confianza en los resultados."\n` +
            `- "recommendations": 2 o 3 sugerencias concretas y accionables (buenas prácticas de verificación, ` +
            `formas de sacarle más provecho a la herramienta, o hábitos de estudio/enseñanza relacionados). ` +
            `Nada de consejos médicos, legales o sensibles — el foco es exclusivamente el uso académico de chatbots de IA.\n` +
            `- Si los datos son muy escasos (una sola encuesta, sin comentarios), el análisis puede ser más general, ` +
            `pero seguí siendo específico a lo que sí hay.\n\n` +
            `Historial de encuestas (más reciente primero), en JSON:\n${JSON.stringify(compact, null, 2)}`;

        return instructions;
    }

    // ── Llamada al proveedor (Gemini, capa gratuita), con reintentos ────────
    // ante errores transitorios (503/429). Un 404/400 falla en el primer
    // intento sin reintentar.
    static async _callProvider(prompt, apiKey) {
        let lastError;

        for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

            try {
                const response = await fetch(GEMINI_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-goog-api-key': apiKey,
                    },
                    signal: controller.signal,
                    body: JSON.stringify({
                        contents: [{ role: 'user', parts: [{ text: prompt }] }],
                        generationConfig: {
                            responseMimeType: 'application/json',
                            responseSchema: RESPONSE_SCHEMA,
                            temperature: 0.6,
                            maxOutputTokens: 500,
                        },
                    }),
                });

                if (!response.ok) {
                    const errBody = await response.text().catch(() => '');
                    const error = new Error(`Gemini respondió ${response.status}: ${errBody.slice(0, 300)}`);
                    error.status = response.status;
                    throw error;
                }

                const data = await response.json();
                const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
                if (!text) {
                    throw new Error('Respuesta de Gemini sin contenido utilizable');
                }

                const parsed = JSON.parse(text);
                if (!parsed.summary || !Array.isArray(parsed.recommendations)) {
                    throw new Error('Respuesta de Gemini con forma inesperada');
                }

                return {
                    summary: String(parsed.summary).trim(),
                    recommendations: parsed.recommendations.map(r => String(r).trim()).slice(0, 3),
                };
            } catch (error) {
                lastError = error;
                const isRetryable = RETRYABLE_STATUS.has(error.status);
                const hasMoreAttempts = attempt < MAX_ATTEMPTS;

                if (isRetryable && hasMoreAttempts) {
                    const delay = RETRY_DELAYS_MS[attempt - 1] ?? 3000;
                    console.warn(
                        `[AIInsightService] Intento ${attempt}/${MAX_ATTEMPTS} falló ` +
                        `(HTTP ${error.status}), reintentando en ${delay}ms...`
                    );
                    await new Promise(resolve => setTimeout(resolve, delay));
                    continue;
                }

                throw lastError;
            } finally {
                clearTimeout(timeout);
            }
        }

        throw lastError;
    }
}

export default AIInsightService;