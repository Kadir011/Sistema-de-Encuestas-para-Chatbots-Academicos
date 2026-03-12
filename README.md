# ChatBots Education Survey Platform

![React](https://img.shields.io/badge/React-19.2.0-blue?logo=react&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-22.17.0-green?logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-5.21-lightgrey?logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Ready-blue?logo=postgresql&logoColor=white)
![License](https://img.shields.io/badge/License-Proprietary-red)

Plataforma full-stack para recopilar y analizar datos sobre el uso de chatbots de IA en contextos educativos.

## Demo en Producción

| Ambiente | URL | Estado |
|----------|-----|--------|
| Frontend | https://chatbot-surveys-frontend.vercel.app/ | Activo |
| Backend API | https://chatbot-surveys-backend.onrender.com | Activo |

## Tabla de Contenidos

- [Stack Tecnológico](#stack-tecnológico)
- [Arquitectura](#arquitectura)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Configuración Local](#configuración-local)
- [API Reference](#api-reference)
- [Esquema de Base de Datos](#esquema-de-base-de-datos)
- [Seguridad](#seguridad)
- [Despliegue](#despliegue)

---

## Stack Tecnológico

### Frontend
| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| React | 19.2.0 | UI Library |
| React Router DOM | 7.12.0 | Client-side routing |
| Tailwind CSS | 4.1.18 | Utility-first CSS |
| Chart.js | 4.5.1 | Data visualization |
| Axios | 1.13.2 | HTTP client |
| Lucide React | 0.562.0 | Icon library |
| XLSX | 0.18.5 | Excel export |
| Vite | 7.2.4 | Build tool & dev server |

### Backend
| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| Node.js | ≥18.x | Runtime |
| Express | 5.2.1 | Web framework |
| PostgreSQL | ≥14.x | Relational database |
| JWT (jsonwebtoken) | 9.0.3 | Authentication |
| Bcrypt | 6.0.0 | Password hashing |
| CORS | 2.8.5 | Cross-origin resource sharing |
| Dotenv | 17.2.3 | Environment variables |

---

## Arquitectura

```
┌─────────────────────────────────────────────────────────┐
│                      Frontend                            │
│         React SPA + Context API + Custom Hooks          │
└────────────────────────┬────────────────────────────────┘
                         │ REST API (HTTPS)
┌────────────────────────▼────────────────────────────────┐
│                       Backend                           │
│              Express.js + MVC Pattern                   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │
│  │ Controllers │  │ Middlewares │  │      Routes     │  │
│  └─────────────┘  └─────────────┘  └─────────────────┘  │
│  ┌─────────────┐  ┌─────────────┐                       │
│  │   Models    │  │  Services   │                       │
│  └─────────────┘  └─────────────┘                       │
└────────────────────────┬────────────────────────────────┘
                         │ PostgreSQL Queries
┌────────────────────────▼────────────────────────────────┐
│                    PostgreSQL                            │
│         (Render - Managed PostgreSQL Instance)          │
└─────────────────────────────────────────────────────────┘
```

### Patrones de Diseño
- **MVC** - Separación clara de responsabilidades
- **Repository Pattern** - Capa de acceso a datos abstraída
- **Middleware Pipeline** - Procesamiento de requests
- **Context API** - Estado global en React
- **Custom Hooks** - Lógica reutilizable

---

## Estructura del Proyecto

```
chatbots-survey-platform/
├── backend/
│   ├── config/database.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── studentSurveyController.js
│   │   ├── teacherSurveyController.js
│   │   ├── userController.js
│   │   └── exportController.js
│   ├── database/init.sql
│   ├── middlewares/
│   │   ├── authMiddleware.js
│   │   └── validationMiddleware.js
│   ├── models/
│   ├── routes/
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── admin/
│   │   │   ├── auth/
│   │   │   ├── common/
│   │   │   ├── dashboard/
│   │   │   ├── layout/
│   │   │   └── surveys/
│   │   ├── contexts/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── services/
│   │   └── utils/
│   ├── .env.example
│   ├── package.json
│   └── vite.config.js
│
├── setup.sh
└── README.md
```

---

## Configuración Local

### Requisitos Previos
- Node.js 18.x+
- PostgreSQL (local) o Neon (cloud)

### Instalación

```bash
git clone https://github.com/Kadir011/Sistema-de-Encuestas-para-Chatbots-Acad-micos.git
cd Sistema-de-Encuestas-para-Chatbots-Acad-micos
```

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### Variables de Entorno

**Backend** (`backend/.env`):
```env
PORT=5000
NODE_ENV=development

# PostgreSQL (Neon)
DATABASE_URL=postgresql://[user]:[password]@[host]/[database]?sslmode=require
DB_POOL_MAX=10
DB_IDLE_TIMEOUT=30000
DB_CONN_TIMEOUT=5000

# JWT
JWT_SECRET=[tu_jwt_secret]
JWT_EXPIRE=7d

# CORS
FRONTEND_URL=https://chatbot-surveys-frontend.vercel.app
```

**Frontend** (`frontend/.env`):
```env
VITE_API_URL=https://chatbot-surveys-backend.onrender.com/api
```

### Ejecución

```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
cd frontend && npm run dev
```

### Credenciales por Defecto
```
Email: admin@gmail.com
Password: admin123
```

---

## API Reference

### Autenticación

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/auth/register` | Registrar usuario |
| POST | `/api/auth/login` | Iniciar sesión |
| GET | `/api/auth/profile` | Obtener perfil |

### Encuestas

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/student-surveys` | Crear encuesta estudiante |
| GET | `/api/student-surveys/my-surveys` | Mis encuestas |
| GET | `/api/student-surveys/statistics` | Estadísticas |
| POST | `/api/teacher-surveys` | Crear encuesta profesor |
| GET | `/api/teacher-surveys/my-surveys` | Mis encuestas |
| GET | `/api/teacher-surveys/statistics` | Estadísticas |

### Usuarios (Admin)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/users` | Listar usuarios |
| PUT | `/api/users/:id/role` | Actualizar rol |
| DELETE | `/api/users/:id` | Eliminar usuario |

### Exportación

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/export/student-surveys` | Exportar a Excel |
| GET | `/api/export/teacher-surveys` | Exportar a Excel |

---

## Esquema de Base de Datos

### Users
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('student', 'teacher', 'admin')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Student Surveys
```sql
CREATE TABLE student_surveys (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    has_used_chatbot BOOLEAN NOT NULL,
    chatbots_used TEXT[],
    usage_frequency VARCHAR(50),
    usefulness_rating INTEGER CHECK (usefulness_rating BETWEEN 1 AND 5),
    tasks_used_for TEXT[],
    overall_experience INTEGER CHECK (overall_experience BETWEEN 1 AND 5),
    preferred_chatbot VARCHAR(100),
    effectiveness_comparison VARCHAR(100),
    will_continue_using BOOLEAN,
    would_recommend BOOLEAN,
    additional_comments TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Teacher Surveys
```sql
CREATE TABLE teacher_surveys (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    has_used_chatbot BOOLEAN NOT NULL,
    chatbots_used TEXT[],
    courses_used TEXT[],
    purposes TEXT[],
    outcomes TEXT[],
    challenges TEXT[],
    likelihood_future_use VARCHAR(50),
    advantages TEXT[],
    concerns TEXT[],
    resources_needed TEXT[],
    would_recommend BOOLEAN,
    age_range VARCHAR(50),
    institution_type VARCHAR(100),
    countries TEXT[],
    years_experience VARCHAR(50),
    additional_comments TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## Seguridad

- **JWT**: Tokens con expiración configurable (default: 7 días)
- **Bcrypt**: Hash de contraseñas con 10 rondas de salt
- **CORS**: Orígenes permitidos configurables
- **Input Validation**: Sanitización en todos los endpoints
- **Parameterized Queries**: Prevención de SQL injection

---

## Despliegue

### Backend (Render + Neon)
1. Crear PostgreSQL database en [Neon](https://neon.tech)
2. Crear servicio web en [Render](https://render.com)
3. Configurar `DATABASE_URL` en el dashboard de Render
4. Ejecutar `init.sql` en la base de datos Neon

### Frontend (Vercel)
1. Importar repositorio en [Vercel](https://vercel.com)
2. Configurar `VITE_API_URL` con la URL de producción del backend
3. Deploy automático en cada push a main

### Variables de Producción

| Variable | Descripción |
|----------|-------------|
| DATABASE_URL | PostgreSQL connection string (Neon) |
| JWT_SECRET | Clave secreta para JWT |
| VITE_API_URL | URL del backend en producción |

---

## Contacto

**Kadir Barquet**
- LinkedIn: [linkedin.com/in/kadir-barquet-bravo](https://www.linkedin.com/in/kadir-barquet-bravo/)
- Email: barquetbravokadir@gmail.com
- GitHub: [github.com/Kadir011](https://github.com/Kadir011)

---

*Plataforma desarrollada para investigación educativa sobre adopción de IA en contextos académicos.*
