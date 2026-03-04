import { useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Input from '../common/Input';
import Select from '../common/Select';
import Alert from '../common/Alert';
import { Download, FileSpreadsheet, BarChart3, Filter, Calendar, Users } from 'lucide-react';
import * as XLSX from 'xlsx-js-style';
import exportService from '../../services/exportService';

// ─── Paleta de colores corporativa ───────────────────────────────────────────
const THEME = {
    headerFill:   { fgColor: { rgb: '1E3A8A' } },   // Azul oscuro
    headerFont:   { color: { rgb: 'FFFFFF' }, bold: true, sz: 11, name: 'Calibri' },
    titleFill:    { fgColor: { rgb: '1D4ED8' } },    // Azul medio
    titleFont:    { color: { rgb: 'FFFFFF' }, bold: true, sz: 13, name: 'Calibri' },
    evenFill:     { fgColor: { rgb: 'EFF6FF' } },    // Azul muy claro
    oddFill:      { fgColor: { rgb: 'FFFFFF' } },
    bodyFont:     { sz: 10, name: 'Calibri' },
    numberFont:   { sz: 10, name: 'Calibri', color: { rgb: '1E40AF' } },
    accentFill:   { fgColor: { rgb: 'DBEAFE' } },
    border: {
        top:    { style: 'thin', color: { rgb: 'BFDBFE' } },
        bottom: { style: 'thin', color: { rgb: 'BFDBFE' } },
        left:   { style: 'thin', color: { rgb: 'BFDBFE' } },
        right:  { style: 'thin', color: { rgb: 'BFDBFE' } },
    },
    headerBorder: {
        top:    { style: 'medium', color: { rgb: '1E3A8A' } },
        bottom: { style: 'medium', color: { rgb: '1E3A8A' } },
        left:   { style: 'thin',   color: { rgb: '3B82F6' } },
        right:  { style: 'thin',   color: { rgb: '3B82F6' } },
    },
};

// ─── Helpers de estilo ────────────────────────────────────────────────────────
const cellStyle = (fill, font, isNumber = false) => ({
    fill,
    font: isNumber ? THEME.numberFont : font,
    border: THEME.border,
    alignment: { vertical: 'center', horizontal: isNumber ? 'center' : 'left', wrapText: true },
});

const headerStyle = () => ({
    fill: THEME.headerFill,
    font: THEME.headerFont,
    border: THEME.headerBorder,
    alignment: { vertical: 'center', horizontal: 'center', wrapText: true },
});

// ─── Construir hoja estilizada desde array de objetos ────────────────────────
const buildStyledSheet = (data) => {
    if (!data || data.length === 0) return null;

    const headers = Object.keys(data[0]);
    const ws = {};
    const range = { s: { r: 0, c: 0 }, e: { r: data.length, c: headers.length - 1 } };

    // Fila de encabezados
    headers.forEach((h, c) => {
        const addr = XLSX.utils.encode_cell({ r: 0, c });
        ws[addr] = { v: h, t: 's', s: headerStyle() };
    });

    // Filas de datos
    data.forEach((row, ri) => {
        const isEven = ri % 2 === 0;
        const fill = isEven ? THEME.evenFill : THEME.oddFill;

        headers.forEach((h, c) => {
            const addr = XLSX.utils.encode_cell({ r: ri + 1, c });
            const raw = row[h];
            const isNum = typeof raw === 'number';
            ws[addr] = {
                v: raw ?? '',
                t: isNum ? 'n' : 's',
                s: cellStyle(fill, THEME.bodyFont, isNum),
            };
        });
    });

    // Ancho de columnas automático
    ws['!ref'] = XLSX.utils.encode_range(range);
    ws['!cols'] = headers.map(h => ({
        wch: Math.min(
            40,
            Math.max(
                h.length + 4,
                ...data.map(r => String(r[h] ?? '').length)
            )
        ),
    }));
    ws['!rows'] = [{ hpt: 22 }]; // altura encabezado

    return ws;
};

// ─── Hoja de resumen ejecutivo ────────────────────────────────────────────────
const buildSummarySheet = (items) => {
    // items: [{ metric, value, description }]
    const titleRow = [{ Métrica: '📊 RESUMEN EJECUTIVO', Valor: '', Descripción: '' }];
    const rows = items.map(i => ({
        Métrica: i.metric,
        Valor: i.value,
        Descripción: i.description || '',
    }));

    const ws = {};
    const allRows = [...titleRow, ...rows];
    const headers = ['Métrica', 'Valor', 'Descripción'];

    // Título fusionado
    const titleAddr = XLSX.utils.encode_cell({ r: 0, c: 0 });
    ws[titleAddr] = {
        v: '📊 RESUMEN EJECUTIVO',
        t: 's',
        s: {
            fill: THEME.titleFill,
            font: THEME.titleFont,
            alignment: { horizontal: 'center', vertical: 'center' },
            border: THEME.headerBorder,
        },
    };
    // Rellenar celdas fusionadas vacías
    [1, 2].forEach(c => {
        const addr = XLSX.utils.encode_cell({ r: 0, c });
        ws[addr] = { v: '', t: 's', s: { fill: THEME.titleFill, border: THEME.headerBorder } };
    });
    ws['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 2 } }];

    // Encabezados de columna
    headers.forEach((h, c) => {
        const addr = XLSX.utils.encode_cell({ r: 1, c });
        ws[addr] = { v: h, t: 's', s: headerStyle() };
    });

    // Datos
    rows.forEach((row, ri) => {
        const isEven = ri % 2 === 0;
        const fill = isEven ? THEME.evenFill : THEME.oddFill;
        const r = ri + 2;
        ws[XLSX.utils.encode_cell({ r, c: 0 })] = { v: row.Métrica,     t: 's', s: cellStyle(fill, THEME.bodyFont) };
        ws[XLSX.utils.encode_cell({ r, c: 1 })] = { v: row.Valor,       t: typeof row.Valor === 'number' ? 'n' : 's', s: cellStyle(fill, THEME.bodyFont, typeof row.Valor === 'number') };
        ws[XLSX.utils.encode_cell({ r, c: 2 })] = { v: row.Descripción, t: 's', s: cellStyle(fill, THEME.bodyFont) };
    });

    ws['!ref'] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: rows.length + 1, c: 2 } });
    ws['!cols'] = [{ wch: 30 }, { wch: 18 }, { wch: 55 }];
    ws['!rows'] = [{ hpt: 28 }, { hpt: 20 }];

    return ws;
};

// ─── Añadir hoja al workbook ──────────────────────────────────────────────────
const addSheet = (wb, data, name) => {
    if (!data || data.length === 0) return;
    const ws = buildStyledSheet(data);
    if (ws) XLSX.utils.book_append_sheet(wb, ws, name);
};

const addSummary = (wb, items) => {
    const ws = buildSummarySheet(items);
    XLSX.utils.book_append_sheet(wb, ws, 'Resumen');
};

// ─── Guardar helper ───────────────────────────────────────────────────────────
const saveWorkbook = (wb, filename) => {
    XLSX.writeFile(wb, filename, { bookType: 'xlsx', type: 'binary', cellStyles: true });
};

// ─── Componente principal ─────────────────────────────────────────────────────
const ExportModal = ({ isOpen, onClose }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError]     = useState('');
    const [filters, setFilters] = useState({
        type: 'student',
        startDate: '',
        endDate: '',
        hasExperience: 'all',
        country: '',
    });

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    // ── Exportar encuestas completas ──────────────────────────────────────────
    const handleExportSurveys = async () => {
        try {
            setLoading(true);
            setError('');

            const qp = new URLSearchParams();
            if (filters.startDate) qp.append('startDate', filters.startDate);
            if (filters.endDate)   qp.append('endDate',   filters.endDate);
            if (filters.hasExperience !== 'all') qp.append('hasExperience', filters.hasExperience);
            if (filters.country)   qp.append('country', filters.country);

            const response = filters.type === 'student'
                ? await exportService.exportStudentSurveys(qp.toString())
                : await exportService.exportTeacherSurveys(qp.toString());

            if (!response.data || response.data.length === 0) {
                setError('No hay datos para exportar con los filtros seleccionados');
                return;
            }

            const timestamp = new Date().toISOString().split('T')[0];
            const wb = XLSX.utils.book_new();

            addSheet(wb, response.data, 'Encuestas Completas');
            addSummary(wb, [
                { metric: 'Total de Registros',  value: response.data.length, description: 'Cantidad total de encuestas exportadas' },
                { metric: 'Tipo de Encuesta',     value: filters.type === 'student' ? 'Estudiantes' : 'Profesores', description: '' },
                { metric: 'Fecha Desde',          value: filters.startDate || 'Sin límite', description: '' },
                { metric: 'Fecha Hasta',          value: filters.endDate   || 'Sin límite', description: '' },
                { metric: 'Generado el',          value: new Date().toLocaleDateString('es-ES'), description: '' },
            ]);

            saveWorkbook(wb, `encuestas_${filters.type}_${timestamp}.xlsx`);
            onClose();
        } catch (err) {
            setError('Error al exportar datos: ' + (err.message || 'Error desconocido'));
        } finally {
            setLoading(false);
        }
    };

    // ── Exportar estadísticas ─────────────────────────────────────────────────
    const handleExportStatistics = async () => {
        try {
            setLoading(true);
            setError('');

            const response = await exportService.exportStatistics(filters.type);

            if (!response.statistics) {
                setError('No hay estadísticas disponibles');
                return;
            }

            const wb = XLSX.utils.book_new();
            const timestamp = new Date().toISOString().split('T')[0];

            // ── Estadísticas de ESTUDIANTES ───────────────────────────────────
            if (filters.type === 'student' && response.statistics.student) {
                const { general, chatbots, tasks, frequency } = response.statistics.student;

                // Convertir campos numéricos que llegan como string desde PostgreSQL
                const avgUsefulness  = parseFloat(general?.avg_usefulness  ?? 0) || 0;
                const avgExperience  = parseFloat(general?.avg_experience   ?? 0) || 0;
                const totalSurveys   = parseInt(general?.total_surveys      ?? 0) || 0;
                const withChatbot    = parseInt(general?.users_with_chatbot ?? 0) || 0;
                const willContinue   = parseInt(general?.will_continue      ?? 0) || 0;
                const wouldRecommend = parseInt(general?.would_recommend    ?? 0) || 0;
                const newWeek        = parseInt(general?.new_this_week      ?? 0) || 0;
                const newMonth       = parseInt(general?.new_this_month     ?? 0) || 0;

                addSheet(wb, [
                    { Métrica: 'Total de Encuestas',       Valor: totalSurveys,                        Descripción: 'Número total de respuestas' },
                    { Métrica: 'Promedio Utilidad (1-5)',   Valor: avgUsefulness.toFixed(2),            Descripción: 'Promedio de utilidad percibida' },
                    { Métrica: 'Promedio Experiencia (1-5)',Valor: avgExperience.toFixed(2),            Descripción: 'Promedio de experiencia general' },
                    { Métrica: 'Usuarios con Chatbot',      Valor: withChatbot,                         Descripción: 'Estudiantes que han usado chatbots' },
                    { Métrica: 'Continuarán Usando',        Valor: willContinue,                        Descripción: '' },
                    { Métrica: 'Recomendarían',             Valor: wouldRecommend,                      Descripción: '' },
                    { Métrica: 'Nuevos esta semana',        Valor: newWeek,                             Descripción: '' },
                    { Métrica: 'Nuevos este mes',           Valor: newMonth,                            Descripción: '' },
                ], 'Estadísticas Generales');

                if (chatbots?.length > 0) {
                    const total = chatbots.reduce((a, b) => a + parseInt(b.count || 0), 0) || 1;
                    addSheet(wb, chatbots.map(c => ({
                        Chatbot:          c.chatbot,
                        'Usos':           parseInt(c.count || 0),
                        'Porcentaje (%)': ((parseInt(c.count || 0) / total) * 100).toFixed(1),
                    })), 'Chatbots Más Usados');
                }

                if (tasks?.length > 0) {
                    const total = tasks.reduce((a, b) => a + parseInt(b.count || 0), 0) || 1;
                    addSheet(wb, tasks.map(t => ({
                        Tarea:            t.task,
                        'Usos':           parseInt(t.count || 0),
                        'Porcentaje (%)': ((parseInt(t.count || 0) / total) * 100).toFixed(1),
                    })), 'Tareas Frecuentes');
                }

                if (frequency?.length > 0) {
                    const total = frequency.reduce((a, b) => a + parseInt(b.count || 0), 0) || 1;
                    addSheet(wb, frequency.map(f => ({
                        'Frecuencia de Uso': f.usage_frequency,
                        'Cantidad':          parseInt(f.count || 0),
                        'Porcentaje (%)':    ((parseInt(f.count || 0) / total) * 100).toFixed(1),
                    })), 'Frecuencia de Uso');
                }

                addSummary(wb, [
                    { metric: 'Total Encuestas',       value: totalSurveys,              description: 'Número total de encuestas de estudiantes' },
                    { metric: 'Usan Chatbots',          value: withChatbot,               description: 'Estudiantes que han usado chatbots' },
                    { metric: 'Satisfacción Promedio',  value: avgUsefulness.toFixed(2) + '/5', description: 'Promedio de utilidad percibida' },
                    { metric: 'Tasa de Recomendación',  value: totalSurveys > 0 ? ((wouldRecommend / totalSurveys) * 100).toFixed(1) + '%' : '0%', description: '' },
                    { metric: 'Generado el',            value: new Date().toLocaleDateString('es-ES'), description: '' },
                ]);

                saveWorkbook(wb, `estadisticas_estudiantes_${timestamp}.xlsx`);
            }

            // ── Estadísticas de PROFESORES ────────────────────────────────────
            else if (filters.type === 'teacher' && response.statistics.teacher) {
                const { general, countries, institutions, purposes, challenges } = response.statistics.teacher;

                const totalSurveys    = parseInt(general?.total_surveys          ?? 0) || 0;
                const usingChatbots   = parseInt(general?.teachers_using_chatbots?? 0) || 0;
                const veryLikely      = parseInt(general?.very_likely_continue   ?? 0) || 0;
                const likelyContinue  = parseInt(general?.likely_continue        ?? 0) || 0;
                const unlikely        = parseInt(general?.unlikely_continue      ?? 0) || 0;
                const newWeek         = parseInt(general?.new_this_week          ?? 0) || 0;
                const newMonth        = parseInt(general?.new_this_month         ?? 0) || 0;

                addSheet(wb, [
                    { Métrica: 'Total de Encuestas',         Valor: totalSurveys,   Descripción: '' },
                    { Métrica: 'Profesores Usando Chatbots', Valor: usingChatbots,  Descripción: '' },
                    { Métrica: 'Muy Probable Continuar',     Valor: veryLikely,     Descripción: '' },
                    { Métrica: 'Probable Continuar',         Valor: likelyContinue, Descripción: '' },
                    { Métrica: 'Poco Probable Continuar',    Valor: unlikely,       Descripción: '' },
                    { Métrica: 'Nuevos esta semana',         Valor: newWeek,        Descripción: '' },
                    { Métrica: 'Nuevos este mes',            Valor: newMonth,       Descripción: '' },
                ], 'Estadísticas Generales');

                if (countries?.length > 0) {
                    const total = countries.reduce((a, b) => a + parseInt(b.count || 0), 0) || 1;
                    addSheet(wb, countries.map(c => ({
                        País:             c.country,
                        'Cantidad':       parseInt(c.count || 0),
                        'Porcentaje (%)': ((parseInt(c.count || 0) / total) * 100).toFixed(1),
                    })), 'Distribución por País');
                }

                if (institutions?.length > 0) {
                    const total = institutions.reduce((a, b) => a + parseInt(b.count || 0), 0) || 1;
                    addSheet(wb, institutions.map(i => ({
                        'Tipo de Institución': i.institution_type,
                        'Cantidad':            parseInt(i.count || 0),
                        'Porcentaje (%)':      ((parseInt(i.count || 0) / total) * 100).toFixed(1),
                    })), 'Tipos de Institución');
                }

                if (purposes?.length > 0) {
                    const total = purposes.reduce((a, b) => a + parseInt(b.count || 0), 0) || 1;
                    addSheet(wb, purposes.map(p => ({
                        Propósito:        p.purpose,
                        'Cantidad':       parseInt(p.count || 0),
                        'Porcentaje (%)': ((parseInt(p.count || 0) / total) * 100).toFixed(1),
                    })), 'Propósitos de Uso');
                }

                if (challenges?.length > 0) {
                    const total = challenges.reduce((a, b) => a + parseInt(b.count || 0), 0) || 1;
                    addSheet(wb, challenges.map(ch => ({
                        Desafío:          ch.challenge,
                        'Cantidad':       parseInt(ch.count || 0),
                        'Porcentaje (%)': ((parseInt(ch.count || 0) / total) * 100).toFixed(1),
                    })), 'Principales Desafíos');
                }

                addSummary(wb, [
                    { metric: 'Total Encuestas',       value: totalSurveys,   description: 'Número total de encuestas de profesores' },
                    { metric: 'Usando Chatbots',        value: usingChatbots,  description: 'Profesores que han usado chatbots' },
                    { metric: 'Tendencia Positiva',     value: veryLikely + likelyContinue, description: 'Profesores que continuarían usándolos' },
                    { metric: 'Tasa de Adopción',       value: totalSurveys > 0 ? ((usingChatbots / totalSurveys) * 100).toFixed(1) + '%' : '0%', description: '' },
                    { metric: 'Generado el',            value: new Date().toLocaleDateString('es-ES'), description: '' },
                ]);

                saveWorkbook(wb, `estadisticas_profesores_${timestamp}.xlsx`);
            } else {
                setError('No hay estadísticas disponibles para el tipo seleccionado');
                return;
            }

            onClose();
        } catch (err) {
            setError('Error al exportar estadísticas: ' + (err.message || 'Error desconocido'));
        } finally {
            setLoading(false);
        }
    };

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Exportar Datos a Excel" size="md">
            <div className="space-y-6">
                {error && <Alert type="error" message={error} onClose={() => setError('')} />}

                {/* Filtros */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                            <Filter className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-blue-900">Configura tu exportación</h3>
                            <p className="text-xs text-blue-700">Aplica filtros para refinar los datos</p>
                        </div>
                    </div>

                    <div className="space-y-4 mt-4">
                        <Select
                            label="Tipo de Encuesta"
                            name="type"
                            value={filters.type}
                            onChange={handleFilterChange}
                            options={[
                                { value: 'student', label: 'Encuestas de Estudiantes' },
                                { value: 'teacher', label: 'Encuestas de Profesores' },
                            ]}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-blue-600" />
                                    Fecha Desde
                                </label>
                                <Input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-blue-600" />
                                    Fecha Hasta
                                </label>
                                <Input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} />
                            </div>
                        </div>

                        <Select
                            label="Filtrar por Experiencia"
                            name="hasExperience"
                            value={filters.hasExperience}
                            onChange={handleFilterChange}
                            options={[
                                { value: 'all',   label: 'Todos' },
                                { value: 'true',  label: 'Solo con experiencia' },
                                { value: 'false', label: 'Solo sin experiencia' },
                            ]}
                        />

                        {filters.type === 'teacher' && (
                            <Input
                                label="Filtrar por País"
                                name="country"
                                value={filters.country}
                                onChange={handleFilterChange}
                                placeholder="Ej: Ecuador"
                            />
                        )}
                    </div>
                </div>

                {/* Botones de exportación */}
                <div className="space-y-3">
                    <p className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-blue-600" />
                        Selecciona el tipo de exportación:
                    </p>

                    <div className="grid grid-cols-1 gap-3">
                        <button
                            onClick={handleExportSurveys}
                            disabled={loading}
                            className="flex items-center justify-center gap-3 w-full px-4 py-3 bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                        >
                            {loading
                                ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                : <FileSpreadsheet className="w-5 h-5" />
                            }
                            Exportar Encuestas Completas
                        </button>

                        <button
                            onClick={handleExportStatistics}
                            disabled={loading}
                            className="flex items-center justify-center gap-3 w-full px-4 py-3 bg-white border-2 border-blue-600 text-blue-700 rounded-lg hover:bg-blue-50 hover:border-blue-700 transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading
                                ? <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                                : <Download className="w-5 h-5" />
                            }
                            Exportar Estadísticas y Análisis
                        </button>
                    </div>
                </div>

                {/* Info */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-100">
                    <div className="flex items-start gap-3">
                        <Users className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div className="text-sm text-gray-700">
                            <p className="font-semibold text-blue-900 mb-1">Información importante</p>
                            <ul className="text-xs text-gray-600 space-y-1">
                                <li>• <strong>Encuestas completas:</strong> Datos detallados con diseño y colores</li>
                                <li>• <strong>Estadísticas:</strong> Resúmenes y análisis en múltiples hojas</li>
                                <li>• Los archivos se nombran con la fecha actual automáticamente</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default ExportModal;