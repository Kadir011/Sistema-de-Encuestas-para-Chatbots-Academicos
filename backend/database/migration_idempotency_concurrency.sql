-- ============================================================
-- migration_idempotency_concurrency.sql
-- Índices y restricciones para garantizar idempotencia en BD
-- ============================================================
-- Ejecutar una sola vez contra la base de datos de producción/desarrollo:
--   psql -U postgres -d tu_database -f migration_idempotency_concurrency.sql
-- ============================================================

-- ──────────────────────────────────────────────────────────────
-- 1. IDEMPOTENCIA DE USUARIOS
--    Los índices UNIQUE ya existían en init.sql.
--    Aquí los confirmamos con IF NOT EXISTS para idempotencia
--    de la propia migración.
-- ──────────────────────────────────────────────────────────────
CREATE UNIQUE INDEX IF NOT EXISTS users_email_key
    ON users (email);

CREATE UNIQUE INDEX IF NOT EXISTS users_username_key
    ON users (username);

-- ──────────────────────────────────────────────────────────────
-- 2. IDEMPOTENCIA DE ENCUESTAS DE ESTUDIANTES
--    Restringe a una encuesta por usuario por día.
--    Protege contra doble-clic, reintentos de red y formularios
--    enviados dos veces.
--
--    NOTA: Si tu negocio permite múltiples encuestas por día,
--    elimina este índice. El middleware Idempotency-Key en la
--    capa HTTP sigue siendo suficiente protección.
-- ──────────────────────────────────────────────────────────────
CREATE UNIQUE INDEX IF NOT EXISTS idx_student_survey_user_day
    ON student_surveys (user_id, DATE(created_at));


-- ──────────────────────────────────────────────────────────────
-- 3. IDEMPOTENCIA DE ENCUESTAS DE PROFESORES
--    Misma restricción: una encuesta por docente por día.
-- ──────────────────────────────────────────────────────────────
CREATE UNIQUE INDEX IF NOT EXISTS idx_teacher_survey_user_day
    ON teacher_surveys (user_id, DATE(created_at));


-- ──────────────────────────────────────────────────────────────
-- 4. ÍNDICES DE RENDIMIENTO (ya existían, idempotentes)
--    Mejoran el rendimiento de queries concurrentes al reducir
--    el tiempo de bloqueo de cada conexión del pool.
-- ──────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_users_email
    ON users (email);

CREATE INDEX IF NOT EXISTS idx_users_role
    ON users (role);

CREATE INDEX IF NOT EXISTS idx_student_surveys_user
    ON student_surveys (user_id);

CREATE INDEX IF NOT EXISTS idx_teacher_surveys_user
    ON teacher_surveys (user_id);

CREATE INDEX IF NOT EXISTS idx_student_surveys_date
    ON student_surveys (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_teacher_surveys_date
    ON teacher_surveys (created_at DESC);


-- ──────────────────────────────────────────────────────────────
-- 5. NIVEL DE AISLAMIENTO DE TRANSACCIONES
--    READ COMMITTED es el default de PostgreSQL y es adecuado
--    para este sistema. Si necesitas mayor protección contra
--    lecturas fantasma, puedes usar REPEATABLE READ:
--
--    ALTER DATABASE tu_database SET default_transaction_isolation TO 'repeatable read';
--
--    Para este proyecto, READ COMMITTED + ON CONFLICT es suficiente.
-- ──────────────────────────────────────────────────────────────

-- Verificar que los índices se crearon correctamente
SELECT
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename IN ('users', 'student_surveys', 'teacher_surveys')
ORDER BY tablename, indexname;