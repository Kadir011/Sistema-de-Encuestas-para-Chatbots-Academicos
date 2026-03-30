/**
 * Servidor Principal
 *
 * CAMBIOS SOLID/Patrones:
 * ─ Se llama a registerAllListeners() al arrancar → activa el patrón Observer.
 * ─ Se expone GET /api/metrics para ver contadores en tiempo real (Observer).
 * ─ El resto de la lógica HTTP no cambia.
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { testConnection, closePool } from './config/database.js';
import { registerAllListeners, MetricsListener } from './listeners/domainEventListeners.js';

// Importar rutas
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import studentSurveyRoutes from './routes/studentSurveyRoutes.js';
import teacherSurveyRoutes from './routes/teacherSurveyRoutes.js';
import exportRoutes from './routes/exportRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Middlewares ──────────────────────────────────────────────────────────────
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (process.env.NODE_ENV === 'development') {
    app.use((req, res, next) => {
        console.log(`${req.method} ${req.path}`);
        next();
    });
}

// ─── Rutas principales ────────────────────────────────────────────────────────
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'API de Chatbots Education Survey',
        version: '2.0.0',
        status: 'running',
        architecture: 'SOLID + Repository + Strategy + Observer + Factory',
    });
});

app.get('/api/health', async (req, res) => {
    try {
        const dbConnected = await testConnection();
        res.json({
            success: true,
            status: 'OK',
            database: dbConnected ? 'conectada' : 'desconectada',
            environment: process.env.NODE_ENV || 'development',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            memory: {
                used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
                total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB',
            },
        });
    } catch (error) {
        res.status(500).json({ success: false, status: 'ERROR', message: error.message });
    }
});

// Endpoint de métricas (Observer Pattern — expone los contadores de eventos)
app.get('/api/metrics', (req, res) => {
    res.json({ success: true, metrics: MetricsListener.getSnapshot() });
});

// ─── Rutas de la API ──────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/student-surveys', studentSurveyRoutes);
app.use('/api/teacher-surveys', teacherSurveyRoutes);
app.use('/api/export', exportRoutes);

// ─── Manejo de errores ────────────────────────────────────────────────────────
app.use((req, res) => {
    res.status(404).json({ success: false, message: `Ruta no encontrada: ${req.method} ${req.path}` });
});

app.use((err, req, res, next) => {
    console.error('Error no manejado:', err);
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        return res.status(400).json({ success: false, message: 'JSON inválido', error: err.message });
    }
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Error interno del servidor',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
});

// ─── Inicio del servidor ──────────────────────────────────────────────────────
const startServer = async () => {
    try {
        // Observer: registrar todos los listeners ANTES de abrir el puerto
        registerAllListeners();

        const dbConnected = await testConnection();
        if (!dbConnected) {
            console.warn('Advertencia: Servidor iniciado sin conexión a BD');
        }

        const server = app.listen(PORT, () => {
            console.log('\n' + '='.repeat(60));
            console.log('   SERVIDOR CORRIENDO');
            console.log('='.repeat(60));
            console.log(`   Puerto:        ${PORT}`);
            console.log(`   URL:           http://localhost:${PORT}`);
            console.log(`   Base de datos: ${dbConnected ? 'Conectada' : 'Desconectada'}`);
            console.log(`   Modo:          ${process.env.NODE_ENV || 'development'}`);
            console.log(`   Arquitectura:  SOLID + Repository + Strategy + Observer + Factory`);
            console.log('='.repeat(60) + '\n');
        });

        const gracefulShutdown = async (signal) => {
            console.log(`\nSeñal ${signal} recibida. Cerrando servidor...`);
            server.close(async () => {
                await closePool();
                process.exit(0);
            });
            setTimeout(() => process.exit(1), 10000);
        };

        process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
        process.on('SIGINT', () => gracefulShutdown('SIGINT'));
        process.on('unhandledRejection', (err) => { console.error('unhandledRejection:', err); gracefulShutdown('unhandledRejection'); });
        process.on('uncaughtException', (err) => { console.error('uncaughtException:', err); gracefulShutdown('uncaughtException'); });

    } catch (error) {
        console.error('Error al iniciar el servidor:', error);
        process.exit(1);
    }
};

startServer();
export default app;