# 🤖 ChatBot Survey Platform

### Plataforma full‑stack para recopilar y analizar datos sobre el uso de chatbots de IA en contextos educativos

[![React](https://img.shields.io/badge/React-19.2.0-61dafb?style=for-the-badge&logo=react&logoColor=white&labelColor=0d1117)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-22.x-6cc24a?style=for-the-badge&logo=node.js&logoColor=white&labelColor=0d1117)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.2.1-ffffff?style=for-the-badge&logo=express&logoColor=white&labelColor=0d1117)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-336791?style=for-the-badge&logo=postgresql&logoColor=white&labelColor=0d1117)](https://neon.tech/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.x-38bdf8?style=for-the-badge&logo=tailwindcss&logoColor=white&labelColor=0d1117)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-Proprietary-ef4444?style=for-the-badge&labelColor=0d1117)](.)

![SOLID](https://img.shields.io/badge/Architecture-SOLID-6366f1?style=flat-square&labelColor=0d1117)
![Repository](https://img.shields.io/badge/Pattern-Repository-0ea5e9?style=flat-square&labelColor=0d1117)
![Observer](https://img.shields.io/badge/Pattern-Observer-10b981?style=flat-square&labelColor=0d1117)
![Strategy](https://img.shields.io/badge/Pattern-Strategy-f59e0b?style=flat-square&labelColor=0d1117)
![Factory](https://img.shields.io/badge/Pattern-Factory-ec4899?style=flat-square&labelColor=0d1117)
![Serverless Postgres](https://img.shields.io/badge/Serverless-Postgres-00e599?style=flat-square&labelColor=0d1117)

> **Recopila · Analiza · Visualiza** el uso de IA en la educación
>
> *Backend con principios **SOLID**, patrones de diseño profesionales y base de datos **PostgreSQL serverless (Neon)** — v4.0*

---

## Demo en Producción

<div align="center">

| Ambiente | URL | Estado |
|:---:|:---:|:---:|
| 🖥️ **Frontend** | [chatbot-surveys-frontend.vercel.app](https://chatbot-surveys-frontend.vercel.app/) | ![Active](https://img.shields.io/badge/Activo-22c55e?style=flat-square) |
| ⚙️ **Backend API** | [chatbot-surveys-backend.onrender.com](https://chatbot-surveys-backend.onrender.com) | ![Active](https://img.shields.io/badge/Activo-22c55e?style=flat-square) |
| 🗄️ **Base de datos** | Neon (PostgreSQL serverless) | ![Active](https://img.shields.io/badge/Activo-22c55e?style=flat-square) |

</div>

---

## Tabla de Contenidos

- [Stack Tecnológico](#-stack-tecnológico)
- [Arquitectura](#-arquitectura)
- [Principios SOLID aplicados](#-principios-solid-aplicados)
- [Patrones de Diseño](#-patrones-de-diseño)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Configuración Local](#-configuración-local)
- [API Reference](#-api-reference)
- [Esquema de Base de Datos](#-esquema-de-base-de-datos)
- [Seguridad e Idempotencia](#-seguridad-e-idempotencia)
- [Concurrencia](#-concurrencia)
- [Despliegue](#-despliegue)
- [Contacto](#-contacto)

---

## Stack Tecnológico

<table>
<tr>
<td width="50%" valign="top">

### Frontend

| Tecnología | Versión | Propósito |
|---|---|---|
| ![React](https://img.shields.io/badge/-React-61dafb?logo=react&logoColor=black&style=flat-square) React | `19.2.0` | UI Library |
| ![React Router](https://img.shields.io/badge/-Router-ca4245?logo=reactrouter&logoColor=white&style=flat-square) React Router DOM | `7.12.0` | Client-side routing |
| ![Tailwind](https://img.shields.io/badge/-Tailwind-38bdf8?logo=tailwindcss&logoColor=white&style=flat-square) Tailwind CSS | `4.1.18` | Utility-first CSS |
| ![Chart.js](https://img.shields.io/badge/-Chart.js-ff6384?logo=chartdotjs&logoColor=white&style=flat-square) Chart.js | `4.5.1` | Visualización de datos |
| ![Axios](https://img.shields.io/badge/-Axios-5a29e4?logo=axios&logoColor=white&style=flat-square) Axios | `1.13.2` | HTTP client |
| ![Lucide](https://img.shields.io/badge/-Lucide-f97316?style=flat-square) Lucide React | `0.562.0` | Iconografía |
| ![XLSX](https://img.shields.io/badge/-XLSX-217346?logo=microsoftexcel&logoColor=white&style=flat-square) XLSX JS Style | `1.2.0` | Exportación a Excel |
| ![Vite](https://img.shields.io/badge/-Vite-646cff?logo=vite&logoColor=white&style=flat-square) Vite | `7.2.4` | Build tool |

</td>
<td width="50%" valign="top">

### Backend

| Tecnología | Versión | Propósito |
|---|---|---|
| ![Node.js](https://img.shields.io/badge/-Node.js-6cc24a?logo=node.js&logoColor=white&style=flat-square) Node.js | `≥ 18.x` | Runtime |
| ![Express](https://img.shields.io/badge/-Express-ffffff?logo=express&logoColor=black&style=flat-square) Express | `5.2.1` | Web framework |
| ![PostgreSQL](https://img.shields.io/badge/-PostgreSQL-336791?logo=postgresql&logoColor=white&style=flat-square) node-postgres (`pg`) | `8.13.x` | Driver + Pool sobre Neon |
| ![Neon](https://img.shields.io/badge/-Neon-00e599?style=flat-square) Neon | — | Postgres serverless con pooler (PgBouncer) |
| ![JWT](https://img.shields.io/badge/-JWT-000000?logo=jsonwebtokens&logoColor=white&style=flat-square) JWT | `9.0.3` | Autenticación |
| ![bcrypt](https://img.shields.io/badge/-bcrypt-f97316?style=flat-square) Bcrypt | `6.0.0` | Hash de contraseñas |
| ![CORS](https://img.shields.io/badge/-CORS-3b82f6?style=flat-square) CORS | `2.8.5` | Cross-origin requests |
| ![dotenv](https://img.shields.io/badge/-dotenv-ecd53f?logo=dotenv&logoColor=black&style=flat-square) Dotenv | `17.2.3` | Variables de entorno |

</td>
</tr>
</table>

---

## Arquitectura

```
┌─────────────────────────────────────────────────────────────────────┐
│                           FRONTEND                                  │
│              React SPA  ·  Context API  ·  Custom Hooks             │
│           Tailwind CSS  ·  Chart.js  ·  React Router DOM            │
└────────────────────────────┬────────────────────────────────────────┘
                             │  REST API  (HTTPS / JSON)
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                   BACKEND  (SOLID + Design Patterns)                │
│                                                                     │
│  ┌──────────────┐  ┌──────────────────┐  ┌──────────────────────┐   │
│  │  Controllers │  │   Middlewares    │  │       Routes         │   │
│  │  (Thin)      │  │ auth · validate  │  │  idempotency layer   │   │
│  └──────┬───────┘  └──────────────────┘  └──────────────────────┘   │
│         │ calls                                                     │
│  ┌──────▼───────┐  ┌──────────────────┐                             │
│  │   Services   │  │  EventEmitterBus │  ← Observer Pattern         │
│  │  AuthService │  │  (Domain Events) │                             │
│  │ SurveyService│  └──────────────────┘                             │
│  └──────┬───────┘                                                   │
│         │ depends on (DIP)                                          │
│  ┌──────▼───────┐  ┌──────────────────┐                             │
│  │ Repositories │  │  Validators      │  ← Strategy Pattern         │
│  │  (Interface) │  │ ValidatorFactory │                             │
│  └──────┬───────┘  └──────────────────┘                             │
│         │                                                           │
│  ┌──────▼───────┐                                                   │
│  │    Models    │  ← SQL parametrizado · UNIQUE INDEX · UNNEST      │
│  └──────────────┘                                                   │
└────────────────────────────┬────────────────────────────────────────┘
                             │  pg.Pool  (pooler / PgBouncer)
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    POSTGRESQL SERVERLESS (NEON)                     │
│   Cloud  ·  Connection Pooler  ·  Unique Indexes  ·  GROUP BY/UNNEST│
└─────────────────────────────────────────────────────────────────────┘
```

---

## Principios SOLID aplicados

| Principio | Dónde se aplica |
|---|---|
| **S** — Single Responsibility | Los **Thin Controllers** (`surveyController.js`, `authController.js`) solo traducen HTTP ↔ Service. Toda la lógica de negocio vive en los servicios correspondientes. |
| **O** — Open/Closed | `createSurveyController(type)` sirve para estudiantes y profesores sin modificar el controlador. `ValidatorFactory` permite agregar nuevas reglas sin tocar las existentes. |
| **L** — Liskov Substitution | `StudentSurveyRepository` y `TeacherSurveyRepository` implementan `ISurveyRepository` y son intercambiables donde se espere la interfaz base. |
| **I** — Interface Segregation | `ISurveyRepository` e `IUserRepository` exponen solo los métodos que cada consumidor necesita, sin interfaces infladas. |
| **D** — Dependency Inversion | `AuthService` depende de `IUserRepository`. `SurveyService` depende de `ISurveyRepository`. Las factories crean las implementaciones concretas; el código de alto nivel nunca las instancia directamente — por eso migrar de MongoDB a PostgreSQL no tocó controladores ni servicios. |

---

## Patrones de Diseño

| Patrón | Implementación |
|---|---|
| 🏭 **Factory Method** | `SurveyRepositoryFactory.create(type)` y `SurveyServiceFactory.create(type)` encapsulan la creación de objetos según el tipo (`student` / `teacher`). |
| 📦 **Repository** | `StudentSurveyRepository`, `TeacherSurveyRepository` y `UserRepository` abstraen el acceso a datos. Los servicios trabajan contra la interfaz; el cambio de motor de base de datos vivió por completo dentro de `models/`. |
| 🔔 **Observer** | `DomainEventBus` (singleton `EventEmitter`) actúa como bus central. Los servicios publican eventos (`USER_REGISTERED`, `STUDENT_SURVEY_CREATED`…) sin saber quién escucha. `AuditListener` y `MetricsListener` se suscriben al arranque. `GET /api/metrics` expone los contadores en tiempo real. |
| 🎯 **Strategy** | `ValidationService` define reglas intercambiables (`RequiredFieldRule`, `EmailFormatRule`, `RangeRule`, `ConditionalRule`…) con interfaz `{ validate(data) }`. `ValidatorFactory` compone las estrategias correctas por caso de uso. |
| 🔗 **Middleware Pipeline** | Cada request atraviesa: `verifyToken` → `idempotencyMiddleware` → `sanitizeInput` → `validateXxx` → `ctrl.action`. Cada middleware tiene una sola responsabilidad y es reutilizable. |
| 🧩 **Context API + Custom Hooks** | `AuthContext`, `ThemeContext` y `SurveyContext` gestionan el estado global del frontend. `useAuth`, `useForm`, `usePagination`, `useDebounce` y `useToast` encapsulan lógica reutilizable. |

---

## Estructura del Proyecto

```
chatbots-survey-platform/
│
├── 📂 backend/
│   ├── 📂 config/
│   │   └── database.js              ← Pool de pg · connectDB · transaction (BEGIN/COMMIT) · queryParallel
│   ├── 📂 controllers/
│   │   ├── authController.js        ← Thin Controller → AuthService
│   │   ├── surveyController.js      ← Thin Controller genérico (OCP)
│   │   ├── userController.js
│   │   └── exportController.js      ← Queries paralelas con Promise.all
│   ├── 📂 databases/
│   │   ├── init.sql                 ← DDL: tablas, índices únicos, checks
│   │   ├── migrate.js               ← Aplica init.sql sobre DATABASE_URL
│   │   └── seed.js                  ← Crea el usuario admin (idempotente, ON CONFLICT)
│   ├── 📂 listeners/
│   │   └── domainEventListeners.js  ← Observer: AuditListener + MetricsListener
│   ├── 📂 middlewares/
│   │   ├── authMiddleware.js        ← JWT · roles · ownership
│   │   ├── idempotencyMiddleware.js ← Cache HTTP por Idempotency-Key
│   │   └── validationMiddleware.js  ← Strategy: ValidatorFactory
│   ├── 📂 models/
│   │   ├── User.js                  ← SQL parametrizado · UNIQUE (23505) · bcrypt
│   │   ├── StudentSurvey.js         ← SQL · UNIQUE(user_id, created_at::date) · UNNEST
│   │   └── TeacherSurvey.js         ← SQL · UNIQUE(user_id, created_at::date) · UNNEST
│   ├── 📂 repositories/
│   │   ├── SurveyRepository.js      ← ISurveyRepository · Factory (LSP + DIP)
│   │   └── UserRepository.js        ← IUserRepository (DIP)
│   ├── 📂 routes/
│   │   ├── authRoutes.js            ← idempotencyMiddleware en /register
│   │   ├── studentSurveyRoutes.js
│   │   ├── teacherSurveyRoutes.js
│   │   ├── userRoutes.js
│   │   └── exportRoutes.js
│   ├── 📂 services/
│   │   ├── AuthService.js           ← SRP · DIP · Observer (publica eventos)
│   │   ├── SurveyService.js         ← SRP · OCP · Observer · Factory
│   │   ├── ValidationService.js     ← Strategy · Factory · OCP
│   │   └── EventEmitterService.js   ← Observer: DomainEventBus singleton
│   └── server.js                    ← Arranque · connectDB · registerAllListeners · /api/metrics
│
├── 📂 frontend/
│   └── 📂 src/
│       ├── 📂 components/           ← Atomic design: common · layout · surveys · dashboard
│       ├── 📂 contexts/             ← AuthContext · ThemeContext · SurveyContext
│       ├── 📂 hooks/                ← useAuth · useForm · usePagination · useDebounce…
│       ├── 📂 pages/                ← Dashboard · Statistics · MySurveys…
│       ├── 📂 services/             ← api.js · surveyService · authService · exportService
│       └── 📂 utils/                ← validators · formatters · constants · helpers
│
└── README.md
```

---

## Configuración Local

### Requisitos Previos

> [!IMPORTANT]
> No se necesita instalar PostgreSQL localmente. Neon es 100% serverless: alcanza con el connection string.

- **Node.js** `18.x+`
- **npm**
- Cuenta gratuita en [Neon](https://neon.tech/) (o usar el connection string ya configurado)

### Instalación

**1. Clonar el repositorio**

```bash
git clone https://github.com/Kadir011/Sistema-de-Encuestas-para-Chatbots-Acad-micos.git
cd Sistema-de-Encuestas-para-Chatbots-Acad-micos
```

**2. Instalar dependencias**

```bash
cd backend  && npm install
cd ../frontend && npm install
```

**3. Configurar variables de entorno**

<details>
<summary><b>🔐 Backend — <code>backend/.env</code></b></summary>

```env
# ─── PostgreSQL (Neon) ────────────────────────────────────────
# Usa el connection string "pooled" (PgBouncer) de tu proyecto en Neon
DATABASE_URL=postgresql://<user>:<password>@<endpoint>-pooler.<region>.aws.neon.tech/<db>?sslmode=require&channel_binding=require
DB_POOL_MAX=10
DB_IDLE_TIMEOUT=30000
DB_CONN_TIMEOUT=5000

# ─── JWT ──────────────────────────────────────────────────────
JWT_SECRET=tu_jwt_secret_seguro
JWT_EXPIRE=7d

# ─── Servidor ─────────────────────────────────────────────────
PORT=5000
NODE_ENV=development

# ─── CORS ─────────────────────────────────────────────────────
FRONTEND_URL=http://localhost:5173
```

</details>

<details>
<summary><b>🌐 Frontend — <code>frontend/.env</code></b></summary>

```env
VITE_API_URL=http://localhost:5000/api
```

</details>

**4. Crear el esquema y el usuario administrador**

```bash
cd backend
npm run migrate   # aplica databases/init.sql (tablas + índices, idempotente)
npm run seed       # crea el admin (idempotente, ON CONFLICT DO NOTHING)
```

**5. Ejecutar en desarrollo**

```bash
# Terminal 1 — Backend
cd backend && npm run dev

# Terminal 2 — Frontend
cd frontend && npm run dev
```

### Credenciales por defecto

```
Email:    admin@gmail.com
Password: admin123
Role:     Administrador
```

> [!WARNING]
> Cambia estas credenciales inmediatamente en producción.

---

## API Reference

### Autenticación — `/api/auth`

| Método | Endpoint | Auth | Descripción |
|:---:|---|:---:|---|
| `POST` | `/register` | ❌ | Registrar nuevo usuario (soporta `Idempotency-Key`) |
| `POST` | `/login` | ❌ | Iniciar sesión — devuelve JWT |
| `GET` | `/profile` | ✅ | Perfil del usuario autenticado |
| `PUT` | `/password` | ✅ | Cambiar contraseña |
| `POST` | `/logout` | ✅ | Cerrar sesión (publica evento `user.logout`) |

### Encuestas Estudiantes — `/api/student-surveys`

| Método | Endpoint | Roles | Descripción |
|:---:|---|:---:|---|
| `POST` | `/` | `student` `admin` | Crear encuesta (idempotente por usuario+día) |
| `GET` | `/` | `admin` | Listar todas las encuestas |
| `GET` | `/my-surveys` | `student` `admin` | Mis encuestas |
| `GET` | `/statistics` | `student` `admin` | Estadísticas enriquecidas |
| `GET` | `/my-statistics` | `student` | Estadísticas personales detalladas |
| `GET` | `/:id` | `student` `admin` | Obtener encuesta por ID |
| `PUT` | `/:id` | `student` `admin` | Actualizar encuesta |
| `DELETE` | `/:id` | `student` `admin` | Eliminar encuesta |

### Encuestas Profesores — `/api/teacher-surveys`

| Método | Endpoint | Roles | Descripción |
|:---:|---|:---:|---|
| `POST` | `/` | `teacher` `admin` | Crear encuesta (idempotente por usuario+día) |
| `GET` | `/` | `admin` | Listar todas las encuestas |
| `GET` | `/my-surveys` | `teacher` `admin` | Mis encuestas |
| `GET` | `/statistics` | `teacher` `admin` | Estadísticas enriquecidas |
| `GET` | `/:id` | `teacher` `admin` | Obtener encuesta por ID |
| `PUT` | `/:id` | `teacher` `admin` | Actualizar encuesta |
| `DELETE` | `/:id` | `teacher` `admin` | Eliminar encuesta |

### Usuarios — `/api/users`

| Método | Endpoint | Roles | Descripción |
|:---:|---|:---:|---|
| `GET` | `/` | `admin` | Listar todos los usuarios |
| `GET` | `/statistics` | `admin` | Estadísticas de usuarios |
| `GET` | `/:id` | `any` | Obtener usuario por ID |
| `POST` | `/` | `admin` | Crear usuario |
| `PUT` | `/:id` | `any` | Actualizar usuario |
| `DELETE` | `/:id` | `admin` | Eliminar usuario |

### Exportación — `/api/export`

| Método | Endpoint | Descripción |
|:---:|---|---|
| `GET` | `/student-surveys` | Datos de encuestas de estudiantes (JSON → Excel en cliente) |
| `GET` | `/teacher-surveys` | Datos de encuestas de profesores (JSON → Excel en cliente) |
| `GET` | `/statistics` | Estadísticas con queries paralelas (`Promise.all`) |

### Métricas — `/api/metrics`

| Método | Endpoint | Descripción |
|:---:|---|---|
| `GET` | `/metrics` | Contadores en tiempo real del patrón Observer |

---

## Esquema de Base de Datos

El esquema vive en [`backend/databases/init.sql`](./backend/databases/init.sql) y corre sobre **PostgreSQL serverless (Neon)**. Se aplica con `npm run migrate` y es idempotente (`CREATE TABLE IF NOT EXISTS`).

<details>
<summary><b>👤 Tabla <code>users</code></b></summary>

```sql
CREATE TABLE users (
    id            SERIAL PRIMARY KEY,
    username      VARCHAR(50)  NOT NULL UNIQUE,
    email         VARCHAR(255) NOT NULL UNIQUE,
    password      VARCHAR(255) NOT NULL,             -- bcrypt, 10 rondas
    role          VARCHAR(20)  NOT NULL DEFAULT 'student'
                  CHECK (role IN ('student', 'teacher', 'admin')),
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
```

</details>

<details>
<summary><b>🎓 Tabla <code>student_surveys</code></b></summary>

```sql
CREATE TABLE student_surveys (
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
    created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

</details>

<details>
<summary><b>👨‍🏫 Tabla <code>teacher_surveys</code></b></summary>

```sql
CREATE TABLE teacher_surveys (
    id                      SERIAL PRIMARY KEY,
    user_id                 INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    has_used_chatbot        BOOLEAN NOT NULL,
    chatbots_used           TEXT[] DEFAULT '{}',
    courses_used            TEXT[] DEFAULT '{}',
    purposes                TEXT[] DEFAULT '{}',
    outcomes                TEXT[] DEFAULT '{}',
    challenges               TEXT[] DEFAULT '{}',
    likelihood_future_use   VARCHAR(50),
    advantages               TEXT[] DEFAULT '{}',
    concerns                 TEXT[] DEFAULT '{}',
    resources_needed         TEXT[] DEFAULT '{}',
    would_recommend          BOOLEAN,
    age_range                VARCHAR(50),
    institution_type         VARCHAR(100),
    countries                TEXT[] DEFAULT '{}',
    years_experience         VARCHAR(50),
    additional_comments      TEXT,
    created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

</details>

**Índices de rendimiento:**

```sql
-- users
CREATE INDEX idx_users_email ON users (email);
CREATE INDEX idx_users_role  ON users (role);

-- student_surveys / teacher_surveys
CREATE INDEX idx_student_surveys_user_id    ON student_surveys (user_id);
CREATE INDEX idx_student_surveys_created_at ON student_surveys (created_at DESC);
CREATE INDEX idx_teacher_surveys_user_id    ON teacher_surveys (user_id);
CREATE INDEX idx_teacher_surveys_created_at ON teacher_surveys (created_at DESC);
```

**Índices de idempotencia** (una encuesta por usuario por día):

```sql
CREATE UNIQUE INDEX idx_student_survey_user_day
    ON student_surveys (user_id, (created_at::date));

CREATE UNIQUE INDEX idx_teacher_survey_user_day
    ON teacher_surveys (user_id, (created_at::date));
```

---

## Seguridad e Idempotencia

| Mecanismo | Descripción |
|---|---|
| 🔑 **JWT** | Tokens firmados con `JWT_SECRET`, expiración configurable (por defecto 7 días). |
| 🔐 **Bcrypt** | Hash de contraseñas con 10 rondas de salt antes de cada `INSERT`/`UPDATE`. Sin almacenamiento en texto plano. |
| 🛡️ **CORS** | Orígenes permitidos configurables vía variable de entorno `FRONTEND_URL`. |
| 👮 **Role-Based Access** | Middlewares `verifyAdmin`, `verifyTeacher`, `verifyStudent` y `verifyOwnership`, comparando IDs numéricos (`SERIAL`). |
| ✅ **Input Validation** | Strategy Pattern: reglas composables e independientes. Sanitización XSS en todos los endpoints. |
| 💉 **SQL Injection** | Todas las consultas usan parámetros posicionales (`$1, $2…`) del driver `pg`. Sin concatenación de strings en queries. |
| 🔁 **Idempotency-Key** | Header HTTP opcional en POST críticos. Cachea la respuesta 24 h y devuelve el mismo resultado ante reintentos o doble-clic. |
| 🗃️ **Unique Index** | `(user_id, created_at::date)` en las tablas de encuestas. Violación `23505` (unique_violation) capturada en la capa de modelo. |

---

## Concurrencia

| Mecanismo | Descripción |
|---|---|
| **Pool de conexiones** | Hasta `DB_POOL_MAX` (por defecto 10) conexiones simultáneas gestionadas por `pg.Pool` sobre el pooler (PgBouncer) de Neon. |
| **Transacciones con reintentos** | `transaction(callback, maxRetries)` abre `BEGIN`/`COMMIT`/`ROLLBACK` sobre un client dedicado. Detecta `serialization_failure` (`40001`) y `deadlock_detected` (`40P01`) y reintenta con backoff exponencial: 100 ms → 200 ms → 400 ms. |
| **Queries paralelas** | `exportStatistics`, `AuthService.register` y `SurveyService.getEnrichedStatistics` usan `Promise.all` para lanzar múltiples queries simultáneamente. |
| **Unique index por día** | `(user_id, created_at::date)` previene encuestas duplicadas incluso si dos requests con los mismos datos llegan en el mismo milisegundo. |

---

## Despliegue

### Backend — Render + Neon

```
1. Crear un proyecto gratuito en Neon (https://neon.tech) y copiar el
   connection string "pooled" (con -pooler en el host)
2. Crear un Web Service en Render (https://render.com)
3. Configurar las variables de entorno en el dashboard de Render
4. En el primer deploy, aplicar el esquema y el seed manualmente:
   cd backend && npm run migrate && npm run seed
5. Deploy automático desde la rama main
```

### Frontend — Vercel

```
1. Importar el repositorio en Vercel (https://vercel.com)
2. Configurar VITE_API_URL con la URL del backend en producción
3. Deploy automático en cada push a main
```

### Variables de Producción

| Variable | Descripción |
|---|---|
| `DATABASE_URL` | Connection string "pooled" de Neon (PostgreSQL) |
| `JWT_SECRET` | Clave secreta para firmar JWT |
| `DB_POOL_MAX` | Máximo de conexiones del pool (recomendado: 10) |
| `FRONTEND_URL` | URL del frontend (CORS) |
| `VITE_API_URL` | URL del backend en producción |

---

## Contacto

<div align="center">

<br/>

**Kadir Barquet**

[![LinkedIn](https://img.shields.io/badge/LinkedIn-kadir--barquet--bravo-0a66c2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/kadir-barquet-bravo/)
[![GitHub](https://img.shields.io/badge/GitHub-Kadir011-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/Kadir011)
[![Email](https://img.shields.io/badge/Email-barquetbravokadir@gmail.com-ea4335?style=for-the-badge&logo=gmail&logoColor=white)](mailto:barquetbravokadir@gmail.com)

<br/>

<sub>*Plataforma desarrollada para investigación educativa sobre adopción de IA en contextos académicos.*</sub>

<br/>

---

<sub>Made with ❤️ by Kadir Barquet · ChatBot Survey Platform © 2025 · v4.0 — SOLID + Repository + Strategy + Observer + Factory + PostgreSQL (Neon)</sub>

</div>
