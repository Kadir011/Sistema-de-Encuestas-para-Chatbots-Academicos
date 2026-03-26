/** 
 * Garantiza que peticiones POST con el mismo Idempotency-Key
 * devuelvan exactamente el mismo resultado sin ejecutar la operación de nuevo.
 * 
 * Uso del cliente:
 *   POST /api/auth/register
 *   Headers: { "Idempotency-Key": "uuid-único-por-operación" }
 */

// Cache en memoria (en producción usa Redis)
const idempotencyCache = new Map();
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 horas

/**
 * Limpia entradas expiradas del cache periódicamente
 */
const cleanExpiredEntries = () => {
    const now = Date.now();
    for (const [key, entry] of idempotencyCache.entries()) {
        if (now - entry.createdAt > CACHE_TTL_MS) {
            idempotencyCache.delete(key);
        }
    }
};

// Ejecutar limpieza cada hora
setInterval(cleanExpiredEntries, 60 * 60 * 1000);

/**
 * Middleware de idempotencia para operaciones POST críticas.
 * Si la petición ya fue procesada, retorna el resultado cacheado.
 */
export const idempotencyMiddleware = (req, res, next) => {
    const idempotencyKey = req.headers['idempotency-key'];

    // Si no viene la clave, continuar normalmente (no es obligatoria)
    if (!idempotencyKey) {
        return next();
    }

    // Validar formato básico de la clave
    if (typeof idempotencyKey !== 'string' || idempotencyKey.length > 255) {
        return res.status(400).json({
            success: false,
            message: 'Idempotency-Key inválida: debe ser un string de máximo 255 caracteres'
        });
    }

    // Clave compuesta: ruta + key (para evitar colisiones entre endpoints)
    const cacheKey = `${req.method}:${req.path}:${idempotencyKey}`;
    const cached = idempotencyCache.get(cacheKey);

    if (cached) {
        // Petición repetida: devolver resultado cacheado
        return res
            .status(cached.statusCode)
            .set('Idempotent-Replayed', 'true')
            .json(cached.body);
    }

    // Primera vez: interceptar la respuesta para cachearla
    const originalJson = res.json.bind(res);
    res.json = (body) => {
        // Solo cachear respuestas exitosas (2xx)
        if (res.statusCode >= 200 && res.statusCode < 300) {
            idempotencyCache.set(cacheKey, {
                statusCode: res.statusCode,
                body,
                createdAt: Date.now()
            });
        }
        return originalJson(body);
    };

    next();
};

export default idempotencyMiddleware;