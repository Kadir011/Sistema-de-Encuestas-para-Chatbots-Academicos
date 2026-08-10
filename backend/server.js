/**
 * Servidor Principal
 *
 * Conexión a PostgreSQL (Neon) vía pool de `pg`. connectDB()/testConnection()/
 * closePool() vienen de config/database.js. El resto de la lógica HTTP y los
 * patrones SOLID/Observer no cambian respecto a la versión MongoDB.
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { connectDB, testConnection, closePool } from './config/database.js';
import { registerAllListeners, MetricsListener } from './listeners/domainEventListeners.js';

// Importar rutas
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import studentSurveyRoutes from './routes/studentSurveyRoutes.js';
import teacherSurveyRoutes from './routes/teacherSurveyRoutes.js';
import exportRoutes from './routes/exportRoutes.js';

dotenv.config({ path: fileURLToPath(new URL('./.env', import.meta.url)) });

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
        version: '3.0.0',
        status: 'running',
        database: 'PostgreSQL (Neon)',
        architecture: 'SOLID + Repository + Strategy + Observer + Factory',
    });
});

app.get('/api/health', async (req, res) => {
    try {
        const dbConnected = await testConnection();
        res.json({
            success: true,
            status: 'OK',
            database: dbConnected ? 'conectada (PostgreSQL / Neon)' : 'desconectada',
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

// Endpoint de métricas (Observer Pattern)
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
    res.status(404).json({
        success: false,
        message: `Ruta no encontrada: ${req.method} ${req.path}`,
    });
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
        // Observer: registrar listeners ANTES de abrir el puerto
        registerAllListeners();

        const server = app.listen(PORT, '0.0.0.0', () => {
            console.log('\n' + '='.repeat(60));
            console.log('   SERVIDOR CORRIENDO');
            console.log('='.repeat(60));
            console.log(`   Puerto:        ${PORT}`);
            console.log(`   URL:           http://localhost:${PORT}`);
            console.log(`   Base de datos: comprobación asíncrona en segundo plano`);
            console.log(`   Modo:          ${process.env.NODE_ENV || 'development'}`);
            console.log(`   Arquitectura:  SOLID + Repository + Strategy + Observer + Factory`);
            console.log('='.repeat(60) + '\n');
        });

        // Conectar a PostgreSQL (Neon) sin bloquear la apertura del socket HTTP.
        // Si la conexión externa está caída, el proceso seguirá escuchando y
        // la API de salud podrá responder con estado desconectado.
        connectDB()
            .then((dbConnected) => {
                if (dbConnected) {
                    console.log('PostgreSQL (Neon) conectada al iniciar el servidor');
                } else {
                    console.warn('Advertencia: Servidor iniciado sin conexión a BD');
                }
            })
            .catch((error) => {
                console.error('Error al conectar con PostgreSQL en arranque:', error.message);
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
        process.on('unhandledRejection', (err) => {
            console.error('unhandledRejection:', err);
            gracefulShutdown('unhandledRejection');
        });
        process.on('uncaughtException', (err) => {
            console.error('uncaughtException:', err);
            gracefulShutdown('uncaughtException');
        });

    } catch (error) {
        console.error('Error al iniciar el servidor:', error);
        process.exit(1);
    }
};

startServer();
export default app;