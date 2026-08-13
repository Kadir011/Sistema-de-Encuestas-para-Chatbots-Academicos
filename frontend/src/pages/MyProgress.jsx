import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import surveyService from '../services/surveyService';
import Header from '../components/layout/Header';
import Chart from '../components/dashboard/Chart';
import StatsCard from '../components/dashboard/StatsCard';
import Loading from '../components/common/Loading';
import Alert from '../components/common/Alert';
import Button from '../components/common/Button';
import { TrendingUp, Sparkles, ThumbsUp, Bot, ClipboardList } from 'lucide-react';
import { formatDate } from '../utils/formatters';

// Colores consistentes con el resto del dashboard (ver components/dashboard/Chart.jsx)
const PERSONAL_COLOR = '#2563eb'; // blue-600
const COHORT_COLOR = '#9ca3af';   // gray-400

const MyProgress = () => {
    const { user, isStudent, isTeacher } = useAuth();
    const [progress, setProgress] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // userIsStudent/userIsTeacher son funciones (ver AuthContext.jsx) — hay que
    // invocarlas. Se resuelven una sola vez acá para no repetir la llamada
    // en cada uso a lo largo del componente.
    const userIsStudent = isStudent();
    const userIsTeacher = isTeacher();

    useEffect(() => {
        if (userIsStudent || userIsTeacher) {
            loadProgress();
        } else {
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const loadProgress = async () => {
        try {
            setLoading(true);
            setError('');
            const service = userIsStudent ? surveyService.student : surveyService.teacher;
            const response = await service.getMyProgress();
            setProgress(response.progress);
        } catch (err) {
            setError(err.message || 'No se pudo cargar tu progreso');
        } finally {
            setLoading(false);
        }
    };

    // Admin no completa encuestas — no tiene progreso personal que mostrar
    if (!userIsStudent && !userIsTeacher) {
        return (
            <div>
                <Header title="Mi Progreso" subtitle="Evolución personal de tus respuestas" />
                <div className="bg-white rounded-lg shadow p-8 text-center">
                    <TrendingUp size={40} className="mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-600">
                        Los administradores no completan encuestas, por lo que no hay progreso
                        personal que mostrar aquí.
                    </p>
                    <Link to="/statistics" className="inline-block mt-4">
                        <Button variant="secondary">Ver estadísticas globales</Button>
                    </Link>
                </div>
            </div>
        );
    }

    if (loading) return <Loading fullScreen text="Cargando tu progreso..." />;

    if (error) {
        return (
            <div>
                <Header title="Mi Progreso" subtitle="Evolución personal de tus respuestas" />
                <Alert type="error" message={error} />
            </div>
        );
    }

    const timeline = progress?.timeline || [];
    const hasEnoughData = timeline.length >= 2;

    // Sin ninguna encuesta todavía
    if (!timeline.length) {
        return (
            <div>
                <Header title="Mi Progreso" subtitle="Evolución personal de tus respuestas" />
                <div className="bg-white rounded-lg shadow p-8 text-center">
                    <ClipboardList size={40} className="mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-600 mb-4">
                        Todavía no completaste ninguna encuesta. Apenas envíes la primera,
                        vas a poder ver acá cómo evoluciona tu experiencia con el tiempo.
                    </p>
                    <Link to={userIsStudent ? '/student-survey' : '/teacher-survey'}>
                        <Button>Completar mi primera encuesta</Button>
                    </Link>
                </div>
            </div>
        );
    }

    const labels = timeline.map(p => formatDate(p.date));

    // ── Dataset según el tipo de usuario ────────────────────────────────────
    let lineChartData;
    let metricTitle;

    if (userIsStudent) {
        metricTitle = 'Utilidad percibida (1-5)';
        lineChartData = {
            labels,
            datasets: [
                {
                    label: 'Tu calificación',
                    data: timeline.map(p => p.usefulness_rating),
                    borderColor: PERSONAL_COLOR,
                    backgroundColor: `${PERSONAL_COLOR}33`,
                    tension: 0.3,
                    fill: true,
                },
                {
                    label: 'Promedio de otros estudiantes',
                    data: timeline.map(() => progress.cohort.avg_usefulness),
                    borderColor: COHORT_COLOR,
                    borderDash: [6, 6],
                    pointRadius: 0,
                    tension: 0,
                    fill: false,
                },
            ],
        };
    } else {
        metricTitle = 'Probabilidad de seguir usando chatbots (1-3)';
        lineChartData = {
            labels,
            datasets: [
                {
                    label: 'Tu respuesta',
                    data: timeline.map(p => p.likelihood_score),
                    borderColor: PERSONAL_COLOR,
                    backgroundColor: `${PERSONAL_COLOR}33`,
                    tension: 0.3,
                    fill: true,
                },
                {
                    label: 'Promedio de otros docentes',
                    data: timeline.map(() => progress.cohort.avg_likelihood_score),
                    borderColor: COHORT_COLOR,
                    borderDash: [6, 6],
                    pointRadius: 0,
                    tension: 0,
                    fill: false,
                },
            ],
        };
    }

    const chatbotsUsage = progress?.personal?.chatbots_usage || {};
    const topChatbots = Object.entries(chatbotsUsage)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    const barChartData = {
        labels: topChatbots.map(([name]) => name),
        datasets: [
            {
                label: 'Veces mencionado en tus encuestas',
                data: topChatbots.map(([, count]) => count),
                backgroundColor: PERSONAL_COLOR,
                borderRadius: 6,
            },
        ],
    };

    const personalRate = progress.personal.would_recommend_rate;
    const cohortRate = progress.cohort.would_recommend_rate;
    const rateDiff = personalRate !== null && cohortRate !== null
        ? personalRate - cohortRate
        : null;

    return (
        <div>
            <Header
                title="Mi Progreso"
                subtitle={`Tu evolución personal, comparada de forma anónima con el promedio de ${userIsStudent ? 'otros estudiantes' : 'otros docentes'}`}
            />

            {/* Resumen rápido */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <StatsCard
                    title="Encuestas completadas"
                    value={progress.personal.total_surveys}
                    icon={ClipboardList}
                    color="blue"
                />
                <StatsCard
                    title="Herramientas distintas usadas"
                    value={progress.personal.unique_chatbots}
                    icon={Bot}
                    color="purple"
                />
                <StatsCard
                    title="Tasa de recomendación"
                    value={personalRate !== null ? `${personalRate}%` : '—'}
                    icon={ThumbsUp}
                    color="green"
                    trend={rateDiff}
                    trendLabel={rateDiff !== null ? 'vs. la cohorte' : ''}
                />
            </div>

            {/* Gráfico principal: evolución vs cohorte */}
            {hasEnoughData ? (
                <Chart
                    type="line"
                    data={lineChartData}
                    title={`${metricTitle} — tu evolución vs. el promedio de tu cohorte`}
                    className="mb-6"
                    height={320}
                    options={{
                        scales: {
                            y: {
                                min: userIsStudent ? 1 : 1,
                                max: userIsStudent ? 5 : 3,
                                ticks: { stepSize: 1 },
                            },
                        },
                    }}
                />
            ) : (
                <div className="bg-white rounded-lg shadow p-6 mb-6 flex items-start gap-3">
                    <Sparkles className="text-blue-500 flex-shrink-0 mt-1" size={22} />
                    <p className="text-gray-600 text-sm">
                        Todavía tenés solo una encuesta registrada. Completá otra (podés hacer una
                        por día) para empezar a ver tu línea de evolución en el tiempo, comparada
                        contra el promedio de {userIsStudent ? 'otros estudiantes' : 'otros docentes'}.
                    </p>
                </div>
            )}

            {/* Herramientas más usadas por vos */}
            {topChatbots.length > 0 && (
                <Chart
                    type="bar"
                    data={barChartData}
                    title="Tus herramientas más usadas"
                    height={260}
                    options={{
                        indexAxis: 'y',
                        scales: { x: { ticks: { stepSize: 1 } } },
                    }}
                />
            )}

            <div className="mt-4 text-xs text-gray-400 text-center">
                La comparación con "otros {userIsStudent ? 'estudiantes' : 'docentes'}" es siempre
                anónima y agregada — nunca se muestran encuestas ni identidades de otras personas.
            </div>
        </div>
    );
};

export default MyProgress;