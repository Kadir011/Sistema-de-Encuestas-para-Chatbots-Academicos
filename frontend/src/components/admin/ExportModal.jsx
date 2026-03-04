import { useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Input from '../common/Input';
import Select from '../common/Select';
import Alert from '../common/Alert';
import { Download, FileSpreadsheet, BarChart3, Filter, Calendar, Users } from 'lucide-react';
import * as XLSX from 'xlsx';
import exportService from '../../services/exportService';
import { COLORS } from '../../utils/constants';

const ExportModal = ({ isOpen, onClose }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [filters, setFilters] = useState({
        type: 'student',
        startDate: '',
        endDate: '',
        hasExperience: 'all',
        country: '',
    });

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const applyHeaderStyle = (worksheet) => {
        if (!worksheet['!ref']) return;
        const range = XLSX.utils.decode_range(worksheet['!ref']);
        
        for (let col = range.s.c; col <= range.e.c; col++) {
            const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
            if (worksheet[cellAddress]) {
                worksheet[cellAddress].s = {
                    fill: { fgColor: { rgb: COLORS.headerBg }, patternType: 'solid' },
                    font: { color: { rgb: COLORS.headerText }, bold: true, sz: 12 },
                    alignment: { horizontal: 'center', vertical: 'center' },
                    border: { bottom: { style: 'thin', color: { rgb: COLORS.border } } }
                };
            }
        }
    };

    const applyStyledSheet = (worksheet, data) => {
        if (!data || data.length === 0) return;
        applyHeaderStyle(worksheet);
        
        const range = XLSX.utils.decode_range(worksheet['!ref']);
        for (let row = 1; row <= range.e.r; row++) {
            for (let col = 0; col <= range.e.c; col++) {
                const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
                if (worksheet[cellAddress]) {
                    const isEvenRow = row % 2 === 0;
                    worksheet[cellAddress].s = {
                        fill: { fgColor: { rgb: isEvenRow ? 'F9FAFB' : 'FFFFFF' }, patternType: 'solid' },
                        font: { color: { rgb: COLORS.text }, sz: 11 },
                        alignment: { vertical: 'center', horizontal: col === 0 ? 'left' : 'center' },
                        border: {
                            right: { style: 'thin', color: { rgb: COLORS.border } },
                            left: { style: 'thin', color: { rgb: COLORS.border } }
                        }
                    };
                }
            }
        }
    };

    const addStyledSheet = (workbook, data, sheetName) => {
        if (!data || data.length === 0) return null;
        const worksheet = XLSX.utils.json_to_sheet(data);
        
        const maxWidth = 40;
        const colWidths = Object.keys(data[0] || {}).map(key => ({
            wch: Math.min(Math.max(key.length + 5, ...data.map(row => String(row[key] || '').length)), maxWidth)
        }));
        worksheet['!cols'] = colWidths;
        
        applyStyledSheet(worksheet, data);
        XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
        return worksheet;
    };

    const addSummarySheet = (workbook, summaryData) => {
        const summaryWs = XLSX.utils.json_to_sheet(summaryData.map(item => ({
            'Métrica': item.metric,
            'Valor': item.value,
            'Descripción': item.description || ''
        })));
        
        summaryWs['!cols'] = [{ wch: 25 }, { wch: 15 }, { wch: 50 }];
        
        const range = XLSX.utils.decode_range(summaryWs['!ref']);
        for (let row = range.s.r; row <= range.e.r; row++) {
            for (let col = range.s.c; col <= range.e.c; col++) {
                const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
                if (summaryWs[cellAddress]) {
                    if (row === 0) {
                        summaryWs[cellAddress].s = {
                            fill: { fgColor: { rgb: COLORS.headerBg }, patternType: 'solid' },
                            font: { color: { rgb: COLORS.headerText }, bold: true, sz: 13 },
                            alignment: { horizontal: 'center', vertical: 'center' }
                        };
                    } else {
                        summaryWs[cellAddress].s = {
                            fill: { fgColor: { rgb: row % 2 === 0 ? 'F3F4F6' : 'FFFFFF' }, patternType: 'solid' },
                            font: { color: { rgb: COLORS.text }, sz: 11 },
                            alignment: { vertical: 'center' }
                        };
                    }
                }
            }
        }
        
        XLSX.utils.book_append_sheet(workbook, summaryWs, 'Resumen');
    };

    const handleExportSurveys = async () => {
        try {
            setLoading(true);
            setError('');
            
            const queryParams = new URLSearchParams();
            if (filters.startDate) queryParams.append('startDate', filters.startDate);
            if (filters.endDate) queryParams.append('endDate', filters.endDate);
            if (filters.hasExperience !== 'all') {
                queryParams.append('hasExperience', filters.hasExperience);
            }
            if (filters.country) queryParams.append('country', filters.country);
            
            let response;
            if (filters.type === 'student') {
                response = await exportService.exportStudentSurveys(queryParams.toString());
            } else {
                response = await exportService.exportTeacherSurveys(queryParams.toString());
            }
            
            if (response.data && response.data.length > 0) {
                const timestamp = new Date().toISOString().split('T')[0];
                const filename = `encuestas_${filters.type}_${timestamp}.xlsx`;
                const workbook = XLSX.utils.book_new();
                
                addStyledSheet(workbook, response.data, 'Datos Completos');
                
                const summaryData = [
                    { metric: 'Total de Registros', value: response.data.length, description: 'Cantidad total de encuestas exportadas' },
                    { metric: 'Tipo de Encuesta', value: filters.type === 'student' ? 'Estudiantes' : 'Profesores', description: 'Tipo de datos exportados' },
                    { metric: 'Fecha Desde', value: filters.startDate || 'Sin límite', description: 'Fecha inicial del filtro' },
                    { metric: 'Fecha Hasta', value: filters.endDate || 'Sin límite', description: 'Fecha final del filtro' },
                ];
                addSummarySheet(workbook, summaryData);
                
                XLSX.writeFile(workbook, filename);
                onClose();
            } else {
                setError('No hay datos para exportar con los filtros seleccionados');
            }
        } catch (err) {
            setError('Error al exportar datos: ' + (err.message || 'Error desconocido'));
        } finally {
            setLoading(false);
        }
    };

    const handleExportStatistics = async () => {
        try {
            setLoading(true);
            setError('');
            
            const response = await exportService.exportStatistics(filters.type);
            
            if (response.statistics) {
                const workbook = XLSX.utils.book_new();
                const timestamp = new Date().toISOString().split('T')[0];
                
                if (filters.type === 'student' && response.statistics.student) {
                    const stats = response.statistics.student;
                    
                    const generalData = [
                        { Métrica: 'Total de Encuestas', Valor: stats.general.total_surveys || 0 },
                        { Métrica: 'Promedio Utilidad', Valor: (stats.general.avg_usefulness || 0).toFixed(2) },
                        { Métrica: 'Promedio Experiencia', Valor: (stats.general.avg_experience || 0).toFixed(2) },
                        { Métrica: 'Usuarios con Chatbot', Valor: stats.general.users_with_chatbot || 0 },
                        { Métrica: 'Continuarán Usando', Valor: stats.general.will_continue || 0 },
                        { Métrica: 'Recomendarían', Valor: stats.general.would_recommend || 0 },
                    ];
                    addStyledSheet(workbook, generalData, 'Estadísticas Generales');
                    
                    if (stats.chatbots && stats.chatbots.length > 0) {
                        const chatbotData = stats.chatbots.map(c => ({
                            Chatbot: c.chatbot,
                            'Cantidad de Usos': c.count,
                            'Porcentaje': ((c.count / (stats.chatbots.reduce((a, b) => a + b.count, 0))) * 100).toFixed(1) + '%'
                        }));
                        addStyledSheet(workbook, chatbotData, 'Chatbots');
                    }
                    
                    if (stats.tasks && stats.tasks.length > 0) {
                        const taskData = stats.tasks.map(t => ({
                            Tarea: t.task,
                            'Cantidad de Usos': t.count,
                            'Porcentaje': ((t.count / (stats.tasks.reduce((a, b) => a + b.count, 0))) * 100).toFixed(1) + '%'
                        }));
                        addStyledSheet(workbook, taskData, 'Tareas');
                    }
                    
                    if (stats.frequency && stats.frequency.length > 0) {
                        const freqData = stats.frequency.map(f => ({
                            Frecuencia: f.usage_frequency,
                            Cantidad: f.count,
                            'Porcentaje': ((f.count / (stats.frequency.reduce((a, b) => a + b.count, 0))) * 100).toFixed(1) + '%'
                        }));
                        addStyledSheet(workbook, freqData, 'Frecuencia de Uso');
                    }
                    
                    const summaryData = [
                        { metric: 'Total Encuestas', value: stats.general.total_surveys || 0, description: 'Número total de encuestas de estudiantes' },
                        { metric: 'Uso de Chatbots', value: stats.general.users_with_chatbot || 0, description: 'Estudiantes que han usado chatbots' },
                        { metric: 'Satisfacción General', value: (stats.general.avg_usefulness || 0).toFixed(2) + '/5', description: 'Promedio de utilidad percibida' },
                    ];
                    addSummarySheet(workbook, summaryData);
                    
                    const filename = `estadisticas_estudiantes_${timestamp}.xlsx`;
                    XLSX.writeFile(workbook, filename);
                } else if (filters.type === 'teacher' && response.statistics.teacher) {
                    const stats = response.statistics.teacher;
                    
                    const generalData = [
                        { Métrica: 'Total de Encuestas', Valor: stats.general.total_surveys || 0 },
                        { Métrica: 'Profesores Usando Chatbots', Valor: stats.general.teachers_using_chatbots || 0 },
                        { Métrica: 'Muy Probable Continuar', Valor: stats.general.very_likely_continue || 0 },
                        { Métrica: 'Probable Continuar', Valor: stats.general.likely_continue || 0 },
                    ];
                    addStyledSheet(workbook, generalData, 'Estadísticas Generales');
                    
                    if (stats.countries && stats.countries.length > 0) {
                        const countryData = stats.countries.map(c => ({
                            País: c.country,
                            Cantidad: c.count,
                            'Porcentaje': ((c.count / (stats.countries.reduce((a, b) => a + b.count, 0))) * 100).toFixed(1) + '%'
                        }));
                        addStyledSheet(workbook, countryData, 'Países');
                    }
                    
                    if (stats.purposes && stats.purposes.length > 0) {
                        const purposeData = stats.purposes.map(p => ({
                            Propósito: p.purpose,
                            Cantidad: p.count,
                            'Porcentaje': ((p.count / (stats.purposes.reduce((a, b) => a + b.count, 0))) * 100).toFixed(1) + '%'
                        }));
                        addStyledSheet(workbook, purposeData, 'Propósitos');
                    }
                    
                    if (stats.challenges && stats.challenges.length > 0) {
                        const challengeData = stats.challenges.map(ch => ({
                            Desafío: ch.challenge,
                            Cantidad: ch.count,
                            'Porcentaje': ((ch.count / (stats.challenges.reduce((a, b) => a + b.count, 0))) * 100).toFixed(1) + '%'
                        }));
                        addStyledSheet(workbook, challengeData, 'Desafíos');
                    }
                    
                    const summaryData = [
                        { metric: 'Total Encuestas', value: stats.general.total_surveys || 0, description: 'Número total de encuestas de profesores' },
                        { metric: 'Usando Chatbots', value: stats.general.teachers_using_chatbots || 0, description: 'Profesores que han usado chatbots' },
                        { metric: 'Tendencia Positiva', value: (stats.general.very_likely_continue || 0) + (stats.general.likely_continue || 0), description: 'Profesores que continuarían usándolos' },
                    ];
                    addSummarySheet(workbook, summaryData);
                    
                    const filename = `estadisticas_profesores_${timestamp}.xlsx`;
                    XLSX.writeFile(workbook, filename);
                }
                
                onClose();
            } else {
                setError('No hay estadísticas disponibles');
            }
        } catch (err) {
            setError('Error al exportar estadísticas: ' + (err.message || 'Error desconocido'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Exportar Datos a Excel"
            size="md"
        >
            <div className="space-y-6">
                {error && (
                    <Alert type="error" message={error} onClose={() => setError('')} />
                )}

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
                                <Input
                                    type="date"
                                    name="startDate"
                                    value={filters.startDate}
                                    onChange={handleFilterChange}
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-blue-600" />
                                    Fecha Hasta
                                </label>
                                <Input
                                    type="date"
                                    name="endDate"
                                    value={filters.endDate}
                                    onChange={handleFilterChange}
                                />
                            </div>
                        </div>

                        <Select
                            label="Filtrar por Experiencia"
                            name="hasExperience"
                            value={filters.hasExperience}
                            onChange={handleFilterChange}
                            options={[
                                { value: 'all', label: 'Todos' },
                                { value: 'true', label: 'Solo con experiencia' },
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
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <FileSpreadsheet className="w-5 h-5" />
                            )}
                            Exportar Encuestas Completas
                        </button>

                        <button
                            onClick={handleExportStatistics}
                            disabled={loading}
                            className="flex items-center justify-center gap-3 w-full px-4 py-3 bg-white border-2 border-blue-600 text-blue-700 rounded-lg hover:bg-blue-50 hover:border-blue-700 transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <Download className="w-5 h-5" />
                            )}
                            Exportar Estadísticas y Análisis
                        </button>
                    </div>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-100">
                    <div className="flex items-start gap-3">
                        <Users className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div className="text-sm text-gray-700">
                            <p className="font-semibold text-blue-900 mb-1">Información importante</p>
                            <ul className="text-xs text-gray-600 space-y-1">
                                <li>• <strong>Encuestas completas:</strong> Datos detallados de cada respuesta</li>
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