-- ═══════════════════════════════════════════════════════════════════════════
-- Esquema PostgreSQL — Sistema de Encuestas para Chatbots Académicos
-- Diseñado para Neon (serverless Postgres). Ejecutar una sola vez sobre
-- la base de datos indicada en DATABASE_URL antes de arrancar el backend
-- o correr el seed.
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── users ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id            SERIAL PRIMARY KEY,
    username      VARCHAR(50) NOT NULL UNIQUE,
    email         VARCHAR(255) NOT NULL UNIQUE,
    password      VARCHAR(255) NOT NULL,
    role          VARCHAR(20) NOT NULL DEFAULT 'student'
                  CHECK (role IN ('student', 'teacher', 'admin')),
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);
CREATE INDEX IF NOT EXISTS idx_users_role  ON users (role);

-- ─── student_surveys ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS student_surveys (
    id                        SERIAL PRIMARY KEY,
    user_id                   INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    has_used_chatbot          BOOLEAN NOT NULL,
    chatbots_used             TEXT[] DEFAULT '{}',
    usage_frequency           VARCHAR(50),
    usefulness_rating         SMALLINT CHECK (usefulness_rating BETWEEN 1 AND 5),
    tasks_used_for            TEXT[] DEFAULT '{}',
    overall_experience        SMALLINT CHECK (overall_experience BETWEEN 1 AND 5),
    preferred_chatbot         VARCHAR(100),
    effectiveness_comparison  VARCHAR(100),
    will_continue_using       BOOLEAN,
    would_recommend           BOOLEAN,
    additional_comments       TEXT,
    -- Fecha del día (sin hora), calculada en el servidor al insertar.
    -- Se guarda en una columna propia (no como expresión indexada) porque
    -- PostgreSQL no permite indexar CAST(timestamptz AS date): depende de
    -- la zona horaria de la sesión y no se considera IMMUTABLE.
    survey_date               DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_student_surveys_user_id     ON student_surveys (user_id);
CREATE INDEX IF NOT EXISTS idx_student_surveys_created_at  ON student_surveys (created_at DESC);

-- Una encuesta por usuario por día (equivalente al índice único compuesto
-- con survey_date usado en la versión Mongo).
CREATE UNIQUE INDEX IF NOT EXISTS idx_student_survey_user_day
    ON student_surveys (user_id, survey_date);

-- ─── teacher_surveys ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS teacher_surveys (
    id                       SERIAL PRIMARY KEY,
    user_id                  INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    has_used_chatbot         BOOLEAN NOT NULL,
    chatbots_used            TEXT[] DEFAULT '{}',
    courses_used             TEXT[] DEFAULT '{}',
    purposes                 TEXT[] DEFAULT '{}',
    outcomes                 TEXT[] DEFAULT '{}',
    challenges                TEXT[] DEFAULT '{}',
    likelihood_future_use    VARCHAR(50),
    advantages                TEXT[] DEFAULT '{}',
    concerns                  TEXT[] DEFAULT '{}',
    resources_needed          TEXT[] DEFAULT '{}',
    would_recommend           BOOLEAN,
    age_range                 VARCHAR(50),
    institution_type          VARCHAR(100),
    countries                 TEXT[] DEFAULT '{}',
    years_experience          VARCHAR(50),
    additional_comments       TEXT,
    survey_date               DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_teacher_surveys_user_id    ON teacher_surveys (user_id);
CREATE INDEX IF NOT EXISTS idx_teacher_surveys_created_at ON teacher_surveys (created_at DESC);

CREATE UNIQUE INDEX IF NOT EXISTS idx_teacher_survey_user_day
    ON teacher_surveys (user_id, survey_date);

-- ─── ai_insights ────────────────────────────────────────────────────────────
-- Un análisis personalizado por usuario, generado con IA a partir de su
-- propio historial de encuestas. Se recalcula (upsert) cada vez que el
-- usuario envía una encuesta nueva; no guarda histórico, solo el más
-- reciente. 100% opt-in en cuanto a datos: solo se envían al modelo las
-- respuestas del propio usuario, nunca username/email ni datos de terceros.
CREATE TABLE IF NOT EXISTS ai_insights (
    id                   SERIAL PRIMARY KEY,
    user_id              INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    survey_type          VARCHAR(20) NOT NULL CHECK (survey_type IN ('student', 'teacher')),
    status               VARCHAR(20) NOT NULL DEFAULT 'pending'
                         CHECK (status IN ('pending', 'ready', 'failed')),
    summary              TEXT,
    recommendations      TEXT[] DEFAULT '{}',
    error_message        TEXT,
    source_survey_id     INTEGER,
    model                VARCHAR(50),
    created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Un solo insight "vivo" por usuario (se actualiza in-place, no se acumula)
CREATE UNIQUE INDEX IF NOT EXISTS idx_ai_insights_user ON ai_insights (user_id);