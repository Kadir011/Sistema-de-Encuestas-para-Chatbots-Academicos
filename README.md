<div align="center">

# 🤖 ChatBot Survey Platform

### Plataforma full‑stack para recopilar y analizar datos sobre el uso de chatbots de IA en contextos educativos

<br/>

[![React](https://img.shields.io/badge/React-19.2.0-61dafb?style=for-the-badge&logo=react&logoColor=white&labelColor=0d1117)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-22.x-6cc24a?style=for-the-badge&logo=node.js&logoColor=white&labelColor=0d1117)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.2.1-ffffff?style=for-the-badge&logo=express&logoColor=white&labelColor=0d1117)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB_Atlas-8.x-47A248?style=for-the-badge&logo=mongodb&logoColor=white&labelColor=0d1117)](https://www.mongodb.com/atlas)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.x-38bdf8?style=for-the-badge&logo=tailwindcss&logoColor=white&labelColor=0d1117)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-Proprietary-ef4444?style=for-the-badge&labelColor=0d1117)](.)

<br/>

![SOLID](https://img.shields.io/badge/Architecture-SOLID-6366f1?style=flat-square&labelColor=0d1117)
![Repository](https://img.shields.io/badge/Pattern-Repository-0ea5e9?style=flat-square&labelColor=0d1117)
![Observer](https://img.shields.io/badge/Pattern-Observer-10b981?style=flat-square&labelColor=0d1117)
![Strategy](https://img.shields.io/badge/Pattern-Strategy-f59e0b?style=flat-square&labelColor=0d1117)
![Factory](https://img.shields.io/badge/Pattern-Factory-ec4899?style=flat-square&labelColor=0d1117)

<br/>

> **Recopila · Analiza · Visualiza** el uso de IA en la educación
>
> *Backend con principios **SOLID**, patrones de diseño profesionales y base de datos **MongoDB Atlas** — v3.0*

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
| ![MongoDB](https://img.shields.io/badge/-MongoDB_Atlas-47A248?logo=mongodb&logoColor=white&style=flat-square) Mongoose | `9.6.0` | ODM + MongoDB Atlas |
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
│  │    Models    │  ← Mongoose Schemas · Unique Indexes · Aggregation│
│  └──────────────┘                                                   │
└────────────────────────────┬────────────────────────────────────────┘
                             │  Mongoose ODM
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        MONGODB ATLAS                                │
│   Cloud  ·  Connection Pool  ·  Unique Indexes  ·  Aggregation      │
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
| **D** — Dependency Inversion | `AuthService` depende de `IUserRepository`. `SurveyService` depende de `ISurveyRepository`. Las factories crean las implementaciones concretas; el código de alto nivel nunca las instancia directamente. |

---

## Patrones de Diseño

| Patrón | Implementación |
|---|---|
| 🏭 **Factory Method** | `SurveyRepositoryFactory.create(type)` y `SurveyServiceFactory.create(type)` encapsulan la creación de objetos según el tipo (`student` / `teacher`). |
| 📦 **Repository** | `StudentSurveyRepository`, `TeacherSurveyRepository` y `UserRepository` abstraen el acceso a datos. Los servicios trabajan contra la interfaz; sustituir MongoDB no requiere tocar la lógica de negocio. |
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
│   │   └── database.js              ← connectDB · transaction · queryParallel (Mongoose)
│   ├── 📂 controllers/
│   │   ├── authController.js        ← Thin Controller → AuthService
│   │   ├── surveyController.js      ← Thin Controller genérico (OCP)
│   │   ├── userController.js
│   │   └── exportController.js      ← Aggregations paralelas con Promise.all
│   ├── 📂 databases/
│   │   └── seed.js                  ← Crea el usuario admin (idempotente)
│   ├── 📂 listeners/
│   │   └── domainEventListeners.js  ← Observer: AuditListener + MetricsListener
│   ├── 📂 middlewares/
│   │   ├── authMiddleware.js        ← JWT · roles · ownership (ObjectId)
│   │   ├── idempotencyMiddleware.js ← Cache HTTP por Idempotency-Key
│   │   └── validationMiddleware.js  ← Strategy: ValidatorFactory
│   ├── 📂 models/
│   │   ├── User.js                  ← Mongoose Schema · unique indexes · bcrypt hook
│   │   ├── StudentSurvey.js         ← Schema · unique(user_id, survey_date) · aggregation
│   │   └── TeacherSurvey.js         ← Schema · unique(user_id, survey_date) · aggregation
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
> No se necesita ninguna base de datos local. MongoDB Atlas es completamente cloud.

- **Node.js** `18.x+`
- **npm**
- Cuenta gratuita en [MongoDB Atlas](https://www.mongodb.com/atlas) (o usar el connection string ya configurado)

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
# ─── MongoDB Atlas ────────────────────────────────────────────
DATABASE_URL=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/?appName=MyCluster
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

**4. Crear el usuario administrador**

```bash
cd backend && npm run seed
```

Este comando es idempotente: si el admin ya existe, no hace nada.

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
| `GET` | `/statistics` | Estadísticas con aggregations paralelas (`Promise.all`) |

### Métricas — `/api/metrics`

| Método | Endpoint | Descripción |
|:---:|---|---|
| `GET` | `/metrics` | Contadores en tiempo real del patrón Observer |

---

## Esquema de Base de Datos

Los modelos están definidos como **Mongoose Schemas** sobre **MongoDB Atlas** (base de datos `chatbots_system`).

<details>
<summary><b>👤 Collection <code>users</code></b></summary>

```js
{
  username:   String  // unique, 3-50 chars
  email:      String  // unique, lowercase
  password:   String  // bcrypt, 10 rounds (pre-save hook)
  role:       String  // enum: 'student' | 'teacher' | 'admin'
  created_at: Date    // auto (timestamps)
}
```

</details>

<details>
<summary><b>🎓 Collection <code>student_surveys</code></b></summary>

```js
{
  user_id:                  ObjectId  // ref: User
  survey_date:              String    // YYYY-MM-DD (índice de idempotencia)
  has_used_chatbot:         Boolean
  chatbots_used:            [String]
  usage_frequency:          String
  usefulness_rating:        Number    // 1-5
  tasks_used_for:           [String]
  overall_experience:       Number    // 1-5
  preferred_chatbot:        String
  effectiveness_comparison: String
  will_continue_using:      Boolean
  would_recommend:          Boolean
  additional_comments:      String
  created_at:               Date
}
```

</details>

<details>
<summary><b>👨‍🏫 Collection <code>teacher_surveys</code></b></summary>

```js
{
  user_id:              ObjectId  // ref: User
  survey_date:          String    // YYYY-MM-DD (índice de idempotencia)
  has_used_chatbot:     Boolean
  chatbots_used:        [String]
  courses_used:         [String]
  purposes:             [String]
  outcomes:             [String]
  challenges:           [String]
  likelihood_future_use: String
  advantages:           [String]
  concerns:             [String]
  resources_needed:     [String]
  would_recommend:      Boolean
  age_range:            String
  institution_type:     String
  countries:            [String]
  years_experience:     String
  additional_comments:  String
  created_at:           Date
}
```

</details>

**Índices de rendimiento:**

```js
// users
{ email: 1 }
{ role: 1 }

// student_surveys
{ user_id: 1 }
{ created_at: -1 }

// teacher_surveys
{ user_id: 1 }
{ created_at: -1 }
```

**Índices de idempotencia** (una encuesta por usuario por día):

```js
// student_surveys — equivalente al UNIQUE INDEX idx_student_survey_user_day de PostgreSQL
{ user_id: 1, survey_date: 1 }  unique: true

// teacher_surveys
{ user_id: 1, survey_date: 1 }  unique: true
```

---

## Seguridad e Idempotencia

| Mecanismo | Descripción |
|---|---|
| 🔑 **JWT** | Tokens firmados con `JWT_SECRET`, expiración configurable (por defecto 7 días). |
| 🔐 **Bcrypt** | Hash de contraseñas con 10 rondas de salt mediante pre-save hook de Mongoose. Sin almacenamiento en texto plano. |
| 🛡️ **CORS** | Orígenes permitidos configurables vía variable de entorno `FRONTEND_URL`. |
| 👮 **Role-Based Access** | Middlewares `verifyAdmin`, `verifyTeacher`, `verifyStudent` y `verifyOwnership`. IDs comparados como strings de ObjectId. |
| ✅ **Input Validation** | Strategy Pattern: reglas composables e independientes. Sanitización XSS en todos los endpoints. |
| 💉 **NoSQL Injection** | Consultas con Mongoose (parameterizadas por diseño). Sin concatenación de strings en queries. |
| 🔁 **Idempotency-Key** | Header HTTP opcional en POST críticos. Cachea la respuesta 24 h y devuelve el mismo resultado ante reintentos o doble-clic. |
| 🗃️ **Unique Index** | `{ user_id, survey_date }` en las colecciones de encuestas. Error `11000` capturado en la capa de modelo. |

---

## Concurrencia

| Mecanismo | Descripción |
|---|---|
| **Pool de conexiones** | Hasta `DB_POOL_MAX` (por defecto 10) conexiones simultáneas gestionadas por Mongoose internamente. |
| **Transacciones con reintentos** | `transaction(callback, maxRetries)` usa `session.withTransaction()`. Detecta `WriteConflict` (código `112`) y `TransientTransactionError` y reintenta con backoff exponencial: 100 ms → 200 ms → 400 ms. |
| **Aggregations paralelas** | `exportStatistics`, `AuthService.register` y `SurveyService.getEnrichedStatistics` usan `Promise.all` para lanzar múltiples operaciones simultáneamente. |
| **Unique index por día** | `{ user_id, survey_date }` previene encuestas duplicadas incluso si dos requests con los mismos datos llegan en el mismo milisegundo. |

---

## Despliegue

### Backend — Render + MongoDB Atlas

```
1. Crear cluster gratuito en MongoDB Atlas (https://cloud.mongodb.com)
2. Crear un Web Service en Render (https://render.com)
3. Configurar las variables de entorno en el dashboard de Render
4. En el primer deploy, ejecutar el seed manualmente:
   cd backend && npm run seed
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
| `DATABASE_URL` | MongoDB Atlas connection string |
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

<sub>Made with ❤️ by Kadir Barquet · ChatBot Survey Platform © 2025 · v3.0 — SOLID + Repository + Strategy + Observer + Factory + MongoDB Atlas</sub>

</div>
