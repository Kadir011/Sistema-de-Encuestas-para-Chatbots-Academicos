<div align="center">

<!-- ═══════════════════════ HEADER BANNER ═══════════════════════ -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 280" width="900" height="280">
  <defs>
    <!-- Main gradient -->
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0f172a"/>
      <stop offset="50%" style="stop-color:#1e3a8a"/>
      <stop offset="100%" style="stop-color:#1d4ed8"/>
    </linearGradient>
    <!-- Accent gradient -->
    <linearGradient id="accentGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#60a5fa"/>
      <stop offset="100%" style="stop-color:#a5f3fc"/>
    </linearGradient>
    <!-- Glow filter -->
    <filter id="glow">
      <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
    <!-- Subtle grid pattern -->
    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.04)" stroke-width="1"/>
    </pattern>
  </defs>

  <!-- Background -->
  <rect width="900" height="280" fill="url(#bgGrad)" rx="14"/>
  <rect width="900" height="280" fill="url(#grid)" rx="14"/>

  <!-- Decorative circles -->
  <circle cx="820" cy="50" r="120" fill="rgba(59,130,246,0.12)"/>
  <circle cx="80" cy="230" r="90" fill="rgba(16,185,129,0.08)"/>
  <circle cx="450" cy="-30" r="80" fill="rgba(99,179,237,0.07)"/>

  <!-- Top accent line -->
  <rect x="0" y="0" width="900" height="3" fill="url(#accentGrad)" rx="14"/>

  <!-- Icon: Chat bubble with brain/circuit -->
  <g transform="translate(60, 85)">
    <!-- Outer glow ring -->
    <circle cx="55" cy="55" r="52" fill="rgba(96,165,250,0.10)" filter="url(#glow)"/>
    <!-- Icon background -->
    <circle cx="55" cy="55" r="46" fill="rgba(30,58,138,0.7)" stroke="rgba(96,165,250,0.4)" stroke-width="1.5"/>
    <!-- Chat bubble main -->
    <rect x="22" y="28" width="66" height="46" rx="10" fill="none" stroke="url(#accentGrad)" stroke-width="2"/>
    <!-- Chat tail -->
    <path d="M 35 74 L 28 86 L 48 74 Z" fill="url(#accentGrad)"/>
    <!-- Circuit dots inside bubble -->
    <circle cx="40" cy="51" r="4" fill="#60a5fa"/>
    <circle cx="55" cy="51" r="4" fill="#34d399"/>
    <circle cx="70" cy="51" r="4" fill="#a5f3fc"/>
    <!-- Connecting lines -->
    <line x1="44" y1="51" x2="51" y2="51" stroke="rgba(255,255,255,0.3)" stroke-width="1.5"/>
    <line x1="59" y1="51" x2="66" y2="51" stroke="rgba(255,255,255,0.3)" stroke-width="1.5"/>
    <!-- Survey checkmarks at top -->
    <circle cx="40" cy="38" r="2.5" fill="rgba(165,243,252,0.7)"/>
    <circle cx="55" cy="38" r="2.5" fill="rgba(165,243,252,0.7)"/>
    <circle cx="70" cy="38" r="2.5" fill="rgba(165,243,252,0.7)"/>
  </g>

  <!-- Main title -->
  <text x="175" y="115" font-family="'Segoe UI', system-ui, sans-serif" font-size="36" font-weight="800" fill="white" letter-spacing="-0.5">ChatBot</text>
  <text x="175" y="115" font-family="'Segoe UI', system-ui, sans-serif" font-size="36" font-weight="800" fill="url(#accentGrad)" letter-spacing="-0.5">
    <tspan dx="152">Survey</tspan>
  </text>
  <text x="175" y="155" font-family="'Segoe UI', system-ui, sans-serif" font-size="36" font-weight="800" fill="white" letter-spacing="-0.5">Education Platform</text>

  <!-- Subtitle -->
  <text x="175" y="188" font-family="'Segoe UI', system-ui, sans-serif" font-size="15" fill="rgba(186,230,253,0.85)" letter-spacing="0.3">Recopila · Analiza · Visualiza el uso de IA en la educación</text>

  <!-- Divider line -->
  <line x1="175" y1="205" x2="720" y2="205" stroke="rgba(96,165,250,0.25)" stroke-width="1"/>

  <!-- Stats row -->
  <g transform="translate(175, 225)">
    <!-- React -->
    <circle cx="10" cy="10" r="8" fill="rgba(97,218,251,0.2)"/>
    <text x="24" y="15" font-family="'Segoe UI', sans-serif" font-size="13" fill="#93c5fd" font-weight="600">React 19</text>
    <!-- separator -->
    <text x="90" y="15" font-family="sans-serif" font-size="13" fill="rgba(255,255,255,0.2)">|</text>
    <!-- Node -->
    <circle cx="104" cy="10" r="8" fill="rgba(52,211,153,0.2)"/>
    <text x="118" y="15" font-family="'Segoe UI', sans-serif" font-size="13" fill="#6ee7b7" font-weight="600">Node.js 22</text>
    <!-- separator -->
    <text x="198" y="15" font-family="sans-serif" font-size="13" fill="rgba(255,255,255,0.2)">|</text>
    <!-- Express -->
    <circle cx="212" cy="10" r="8" fill="rgba(251,191,36,0.2)"/>
    <text x="226" y="15" font-family="'Segoe UI', sans-serif" font-size="13" fill="#fcd34d" font-weight="600">Express 5</text>
    <!-- separator -->
    <text x="296" y="15" font-family="sans-serif" font-size="13" fill="rgba(255,255,255,0.2)">|</text>
    <!-- PostgreSQL -->
    <circle cx="310" cy="10" r="8" fill="rgba(167,139,250,0.2)"/>
    <text x="324" y="15" font-family="'Segoe UI', sans-serif" font-size="13" fill="#c4b5fd" font-weight="600">PostgreSQL</text>
    <!-- separator -->
    <text x="408" y="15" font-family="sans-serif" font-size="13" fill="rgba(255,255,255,0.2)">|</text>
    <!-- JWT -->
    <circle cx="422" cy="10" r="8" fill="rgba(251,113,133,0.2)"/>
    <text x="436" y="15" font-family="'Segoe UI', sans-serif" font-size="13" fill="#fda4af" font-weight="600">JWT Auth</text>
  </g>

  <!-- Bottom right decoration -->
  <g transform="translate(750, 80)" opacity="0.15">
    <rect x="0" y="0" width="100" height="8" rx="4" fill="white"/>
    <rect x="0" y="18" width="75" height="8" rx="4" fill="white"/>
    <rect x="0" y="36" width="90" height="8" rx="4" fill="white"/>
    <rect x="0" y="54" width="60" height="8" rx="4" fill="white"/>
    <rect x="0" y="72" width="85" height="8" rx="4" fill="white"/>
  </g>
</svg>

<br/>

[![React](https://img.shields.io/badge/React-19.2.0-61dafb?style=for-the-badge&logo=react&logoColor=white&labelColor=0d1117)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-22.x-6cc24a?style=for-the-badge&logo=node.js&logoColor=white&labelColor=0d1117)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.2.1-ffffff?style=for-the-badge&logo=express&logoColor=white&labelColor=0d1117)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-336791?style=for-the-badge&logo=postgresql&logoColor=white&labelColor=0d1117)](https://postgresql.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.x-38bdf8?style=for-the-badge&logo=tailwindcss&logoColor=white&labelColor=0d1117)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-Proprietary-ef4444?style=for-the-badge&labelColor=0d1117)](.)

<p>
  <strong>Plataforma full‑stack para recopilar y analizar datos sobre el uso de chatbots de IA en contextos educativos</strong>
</p>

</div>

---

## Demo en Producción

<div align="center">

| Ambiente | URL | Estado |
|:---:|:---:|:---:|
| 🖥️ **Frontend** | [chatbot-surveys-frontend.vercel.app](https://chatbot-surveys-frontend.vercel.app/) | ![Active](https://img.shields.io/badge/Activo-22c55e?style=flat-square) |
| ⚙️ **Backend API** | [chatbot-surveys-backend.onrender.com](https://chatbot-surveys-backend.onrender.com) | ![Active](https://img.shields.io/badge/Activo-22c55e?style=flat-square) |

</div>

---

## Tabla de Contenidos

<div>

- [Stack Tecnológico](#-stack-tecnológico)
- [Arquitectura](#-arquitectura)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Configuración Local](#-configuración-local)
- [API Reference](#-api-reference)
- [Esquema de Base de Datos](#-esquema-de-base-de-datos)
- [Seguridad](#-seguridad)
- [Despliegue](#-despliegue)
- [Contacto](#-contacto)

</div>

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
| ![XLSX](https://img.shields.io/badge/-XLSX-217346?logo=microsoftexcel&logoColor=white&style=flat-square) XLSX | `0.18.5` | Exportación a Excel |
| ![Vite](https://img.shields.io/badge/-Vite-646cff?logo=vite&logoColor=white&style=flat-square) Vite | `7.2.4` | Build tool |

</td>
<td width="50%" valign="top">

### Backend

| Tecnología | Versión | Propósito |
|---|---|---|
| ![Node.js](https://img.shields.io/badge/-Node.js-6cc24a?logo=node.js&logoColor=white&style=flat-square) Node.js | `≥ 18.x` | Runtime |
| ![Express](https://img.shields.io/badge/-Express-ffffff?logo=express&logoColor=black&style=flat-square) Express | `5.2.1` | Web framework |
| ![PostgreSQL](https://img.shields.io/badge/-PostgreSQL-336791?logo=postgresql&logoColor=white&style=flat-square) PostgreSQL | `≥ 14.x` | Base de datos relacional |
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
│                           FRONTEND                                   │
│              React SPA  ·  Context API  ·  Custom Hooks             │
│           Tailwind CSS  ·  Chart.js  ·  React Router DOM            │
└────────────────────────────┬────────────────────────────────────────┘
                             │  REST API  (HTTPS / JSON)
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                            BACKEND                                   │
│                    Express.js  ·  MVC Pattern                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐  │
│  │ Controllers  │  │ Middlewares  │  │         Routes           │  │
│  └──────────────┘  └──────────────┘  └──────────────────────────┘  │
│  ┌──────────────┐  ┌──────────────┐                                 │
│  │   Models     │  │  Services    │                                 │
│  └──────────────┘  └──────────────┘                                 │
└────────────────────────────┬────────────────────────────────────────┘
                             │  PostgreSQL Queries
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                          POSTGRESQL                                   │
│              Render — Managed PostgreSQL Instance (Neon)             │
└─────────────────────────────────────────────────────────────────────┘
```

### Patrones de Diseño

<table>
<tr>
<td align="center" width="20%"><b>MVC</b><br/><sub>Separación clara de responsabilidades</sub></td>
<td align="center" width="20%"><b>Repository</b><br/><sub>Capa de acceso a datos abstraída</sub></td>
<td align="center" width="20%"><b>Middleware Pipeline</b><br/><sub>Procesamiento de requests</sub></td>
<td align="center" width="20%"><b>Context API</b><br/><sub>Estado global en React</sub></td>
<td align="center" width="20%"><b>Custom Hooks</b><br/><sub>Lógica reutilizable</sub></td>
</tr>
</table>

---

## Estructura del Proyecto

```
chatbots-survey-platform/
│
├── 📂 backend/
│   ├── 📂 config/
│   │   └── database.js              ← Pool de conexiones PostgreSQL
│   ├── 📂 controllers/
│   │   ├── authController.js        ← Registro, login, perfil
│   │   ├── studentSurveyController.js
│   │   ├── teacherSurveyController.js
│   │   ├── userController.js
│   │   └── exportController.js      ← Exportación a Excel / estadísticas
│   ├── 📂 database/
│   │   └── init.sql                 ← Esquema + seed inicial
│   ├── 📂 middlewares/
│   │   ├── authMiddleware.js        ← JWT, roles, ownership
│   │   └── validationMiddleware.js  ← Sanitización, validaciones
│   ├── 📂 models/
│   │   ├── User.js
│   │   ├── StudentSurvey.js
│   │   └── TeacherSurvey.js
│   ├── 📂 routes/
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── studentSurveyRoutes.js
│   │   ├── teacherSurveyRoutes.js
│   │   └── exportRoutes.js
│   ├── .env.example
│   ├── package.json
│   └── server.js                    ← Entry point
│
├── 📂 frontend/
│   └── 📂 src/
│       ├── 📂 components/
│       │   ├── admin/               ← ExportModal
│       │   ├── auth/                ← LoginForm, RegisterForm, ProtectedRoute
│       │   ├── common/              ← Button, Modal, Alert, Table…
│       │   ├── dashboard/           ← Chart, StatsCard, RecentActivity
│       │   ├── layout/              ← Navbar, Sidebar, Footer, Layout
│       │   └── surveys/             ← StudentSurveyForm, TeacherSurveyForm…
│       ├── 📂 contexts/             ← AuthContext, ThemeContext, SurveyContext
│       ├── 📂 hooks/                ← useAuth, useForm, usePagination…
│       ├── 📂 pages/                ← Dashboard, Statistics, MySurveys…
│       ├── 📂 services/             ← api.js, surveyService, authService…
│       └── 📂 utils/                ← validators, formatters, constants
│
├── setup.sh
└── README.md
```

---

## Configuración Local

### Requisitos Previos

> [!IMPORTANT]
> Asegúrate de tener instalados los siguientes requisitos antes de continuar.

- **Node.js** `18.x+`
- **PostgreSQL** `14.x+` (local) o cuenta en [Neon](https://neon.tech)
- **npm** o **yarn**

### Instalación

**1. Clonar el repositorio**

```bash
git clone https://github.com/Kadir011/Sistema-de-Encuestas-para-Chatbots-Acad-micos.git
cd Sistema-de-Encuestas-para-Chatbots-Acad-micos
```

**2. Instalar dependencias**

```bash
# Backend
cd backend && npm install

# Frontend
cd ../frontend && npm install
```

**3. Configurar variables de entorno**

<details>
<summary><b>🔐 Backend — <code>backend/.env</code></b></summary>

```env
PORT=5000
NODE_ENV=development

# PostgreSQL (Neon)
DATABASE_URL=postgresql://[user]:[password]@[host]/[database]?sslmode=require
DB_POOL_MAX=10
DB_IDLE_TIMEOUT=30000
DB_CONN_TIMEOUT=5000

# JWT
JWT_SECRET=[tu_jwt_secret_seguro]
JWT_EXPIRE=7d

# CORS
FRONTEND_URL=https://chatbot-surveys-frontend.vercel.app
```

</details>

<details>
<summary><b>🌐 Frontend — <code>frontend/.env</code></b></summary>

```env
VITE_API_URL=https://chatbot-surveys-backend.onrender.com/api
```

</details>

**4. Inicializar la base de datos**

```bash
psql -U postgres -d tu_database -f backend/database/init.sql
```

**5. Ejecutar en desarrollo**

```bash
# Terminal 1 — Backend
cd backend && npm run dev

# Terminal 2 — Frontend
cd frontend && npm run dev
```

### Credenciales por Defecto

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
| `POST` | `/register` | ❌ | Registrar nuevo usuario |
| `POST` | `/login` | ❌ | Iniciar sesión (devuelve JWT) |
| `GET` | `/profile` | ✅ | Obtener perfil del usuario autenticado |
| `PUT` | `/password` | ✅ | Cambiar contraseña |
| `POST` | `/logout` | ✅ | Cerrar sesión |

### Encuestas Estudiantes — `/api/student-surveys`

| Método | Endpoint | Roles | Descripción |
|:---:|---|:---:|---|
| `POST` | `/` | `student` `admin` | Crear encuesta |
| `GET` | `/` | `admin` | Listar todas las encuestas |
| `GET` | `/my-surveys` | `student` `admin` | Mis encuestas |
| `GET` | `/statistics` | `student` `admin` | Estadísticas globales / personales |
| `GET` | `/my-statistics` | `student` | Estadísticas detalladas personales |
| `GET` | `/:id` | `student` `admin` | Obtener encuesta por ID |
| `PUT` | `/:id` | `student` `admin` | Actualizar encuesta |
| `DELETE` | `/:id` | `student` `admin` | Eliminar encuesta |

### Encuestas Profesores — `/api/teacher-surveys`

| Método | Endpoint | Roles | Descripción |
|:---:|---|:---:|---|
| `POST` | `/` | `teacher` `admin` | Crear encuesta |
| `GET` | `/` | `admin` | Listar todas las encuestas |
| `GET` | `/my-surveys` | `teacher` `admin` | Mis encuestas |
| `GET` | `/statistics` | `teacher` `admin` | Estadísticas globales / personales |
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
| `GET` | `/student-surveys` | Exportar encuestas de estudiantes (Excel) |
| `GET` | `/teacher-surveys` | Exportar encuestas de profesores (Excel) |
| `GET` | `/statistics` | Exportar estadísticas y análisis (Excel) |

---

## Esquema de Base de Datos

<details>
<summary><b>👤 Tabla <code>users</code></b></summary>

```sql
CREATE TABLE users (
    id          SERIAL PRIMARY KEY,
    username    VARCHAR(50)  UNIQUE NOT NULL,
    email       VARCHAR(255) UNIQUE NOT NULL,
    password    VARCHAR(255) NOT NULL,
    role        VARCHAR(20)  NOT NULL CHECK (role IN ('student', 'teacher', 'admin')),
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

</details>

<details>
<summary><b>🎓 Tabla <code>student_surveys</code></b></summary>

```sql
CREATE TABLE student_surveys (
    id                      SERIAL PRIMARY KEY,
    user_id                 INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    has_used_chatbot        BOOLEAN NOT NULL,
    chatbots_used           TEXT[],
    usage_frequency         VARCHAR(50),
    usefulness_rating       INTEGER CHECK (usefulness_rating BETWEEN 1 AND 5),
    tasks_used_for          TEXT[],
    overall_experience      INTEGER CHECK (overall_experience BETWEEN 1 AND 5),
    preferred_chatbot       VARCHAR(100),
    effectiveness_comparison VARCHAR(100),
    will_continue_using     BOOLEAN,
    would_recommend         BOOLEAN,
    additional_comments     TEXT,
    created_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

</details>

<details>
<summary><b>👨‍🏫 Tabla <code>teacher_surveys</code></b></summary>

```sql
CREATE TABLE teacher_surveys (
    id                    SERIAL PRIMARY KEY,
    user_id               INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    has_used_chatbot      BOOLEAN NOT NULL,
    chatbots_used         TEXT[],
    courses_used          TEXT[],
    purposes              TEXT[],
    outcomes              TEXT[],
    challenges            TEXT[],
    likelihood_future_use VARCHAR(50),
    advantages            TEXT[],
    concerns              TEXT[],
    resources_needed      TEXT[],
    would_recommend       BOOLEAN,
    age_range             VARCHAR(50),
    institution_type      VARCHAR(100),
    countries             TEXT[],
    years_experience      VARCHAR(50),
    additional_comments   TEXT,
    created_at            TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

</details>

**Índices para optimización de rendimiento:**

```sql
CREATE INDEX idx_users_email            ON users(email);
CREATE INDEX idx_users_role             ON users(role);
CREATE INDEX idx_student_surveys_user   ON student_surveys(user_id);
CREATE INDEX idx_teacher_surveys_user   ON teacher_surveys(user_id);
CREATE INDEX idx_student_surveys_date   ON student_surveys(created_at DESC);
CREATE INDEX idx_teacher_surveys_date   ON teacher_surveys(created_at DESC);
```

---

## Seguridad

<table>
<tr>
<td align="center" width="33%">

**🔑 JWT**

Tokens con expiración configurable (default: 7 días). Firmados con `JWT_SECRET`.

</td>
<td align="center" width="33%">

**🔐 Bcrypt**

Hash de contraseñas con **10 rondas de salt**. Sin almacenamiento de texto plano.

</td>
<td align="center" width="33%">

**🛡️ CORS**

Orígenes permitidos configurables vía variable de entorno `FRONTEND_URL`.

</td>
</tr>
<tr>
<td align="center">

**✅ Input Validation**

Sanitización en todos los endpoints. Middleware de validación dedicado.

</td>
<td align="center">

**💉 SQL Injection**

Prevención mediante **Parameterized Queries** en todas las consultas a PostgreSQL.

</td>
<td align="center">

**👮 Role-Based Access**

Middlewares `verifyAdmin`, `verifyTeacher`, `verifyStudent` y `verifyOwnership`.

</td>
</tr>
</table>

---

## Despliegue

### Backend — Render + Neon

```
1. Crear base de datos PostgreSQL en Neon (https://neon.tech)
2. Crear un Web Service en Render (https://render.com)
3. Configurar DATABASE_URL en el dashboard de Render
4. Ejecutar init.sql en la base de datos Neon
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
| `DATABASE_URL` | PostgreSQL connection string (Neon) |
| `JWT_SECRET` | Clave secreta para firmar JWT |
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

<sub>Made with ❤️ by Kadir Barquet · ChatBot Survey Platform © 2024</sub>

</div>
