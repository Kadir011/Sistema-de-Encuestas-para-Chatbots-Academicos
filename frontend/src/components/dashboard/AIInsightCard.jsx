import { useEffect, useRef, useState } from 'react';
import surveyService from '../../services/surveyService';
import { Sparkles, Lightbulb, RefreshCw } from 'lucide-react';
import { formatRelativeDate } from '../../utils/formatters';

const POLL_INTERVAL_MS = 4000;
const MAX_POLL_ATTEMPTS = 15; // ~1 minuto de espera total

/**
 * Tarjeta de "Análisis con IA" — se auto-gestiona por completo:
 * - Si todavía no hay ningún insight (usuario sin encuestas) → no renderiza nada.
 * - Si está "pending" (se está generando) → muestra estado de carga y
 *   reintenta cada POLL_INTERVAL_MS hasta MAX_POLL_ATTEMPTS.
 * - Si está "ready" → muestra el resumen + recomendaciones.
 * - Si está "failed" → no renderiza nada (falla silenciosa: puede ser que
 *   el servidor no tenga configurada la API key, y eso no es un problema
 *   del usuario ni algo que deba interrumpir el resto de la página).
 *
 * @param {'student'|'teacher'} surveyType
 */
const AIInsightCard = ({ surveyType }) => {
    const [insight, setInsight] = useState(null);
    const [status, setStatus] = useState('loading'); // loading | pending | ready | hidden
    const attemptsRef = useRef(0);
    const timeoutRef = useRef(null);
    const mountedRef = useRef(true);

    useEffect(() => {
        mountedRef.current = true;
        fetchInsight();
        return () => {
            mountedRef.current = false;
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [surveyType]);

    const fetchInsight = async () => {
        try {
            const service = surveyType === 'student' ? surveyService.student : surveyService.teacher;
            const response = await service.getMyInsight();
            if (!mountedRef.current) return;

            const data = response.insight;
            if (data.status === 'ready') {
                setInsight(data);
                setStatus('ready');
                return;
            }

            if (data.status === 'pending') {
                setStatus('pending');
                attemptsRef.current += 1;
                if (attemptsRef.current < MAX_POLL_ATTEMPTS) {
                    timeoutRef.current = setTimeout(fetchInsight, POLL_INTERVAL_MS);
                } else {
                    setStatus('hidden'); // se tardó demasiado; no lo dejamos cargando para siempre
                }
                return;
            }

            // status === 'failed' u otro caso no manejado
            setStatus('hidden');
        } catch {
            // 404 (sin insight todavía) u otro error de red — falla silenciosa
            if (mountedRef.current) setStatus('hidden');
        }
    };

    if (status === 'hidden') return null;

    if (status === 'loading' || status === 'pending') {
        return (
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-100 rounded-lg shadow p-6 mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <Sparkles size={18} className="text-blue-600 animate-pulse" />
                    </div>
                    <div>
                        <p className="font-medium text-gray-800">Generando tu análisis personalizado...</p>
                        <p className="text-sm text-gray-500">
                            Estamos leyendo tus respuestas para armarte una recomendación a medida.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // status === 'ready'
    return (
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-100 rounded-lg shadow p-6 mb-6">
            <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <Sparkles size={18} className="text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                            <Sparkles size={12} /> Análisis generado con IA
                        </span>
                        {insight?.updated_at && (
                            <span className="text-xs text-gray-400">
                                Actualizado {formatRelativeDate(insight.updated_at).toLowerCase()}
                            </span>
                        )}
                    </div>

                    <p className="text-gray-800 leading-relaxed">{insight.summary}</p>

                    {insight.recommendations?.length > 0 && (
                        <ul className="mt-4 space-y-2">
                            {insight.recommendations.map((rec, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                                    <Lightbulb size={15} className="text-amber-500 flex-shrink-0 mt-0.5" />
                                    <span>{rec}</span>
                                </li>
                            ))}
                        </ul>
                    )}

                    <p className="mt-4 text-xs text-gray-400 flex items-center gap-1">
                        <RefreshCw size={11} />
                        Se actualiza automáticamente con cada encuesta nueva que completes.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AIInsightCard;
