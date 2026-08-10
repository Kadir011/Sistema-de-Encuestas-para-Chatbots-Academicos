#!/bin/bash

echo "======================================"
echo "  Chatbots Education Survey Setup"
echo "  PostgreSQL (Neon) Edition"
echo "======================================"
echo ""

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_success() { echo -e "${GREEN}✓ $1${NC}"; }
print_info()    { echo -e "${BLUE}ℹ $1${NC}"; }
print_error()   { echo -e "${RED}✗ $1${NC}"; }
print_warn()    { echo -e "${YELLOW}⚠ $1${NC}"; }

# ──────────────────────────────────────────────────────────────
# VERIFICAR REQUISITOS
# ──────────────────────────────────────────────────────────────
if ! command -v node &> /dev/null; then
    print_error "Node.js no está instalado. Por favor instala Node.js 18+ primero."
    exit 1
fi
print_success "Node.js encontrado: $(node --version)"

if ! command -v npm &> /dev/null; then
    print_error "npm no está instalado."
    exit 1
fi
print_success "npm encontrado: $(npm --version)"

# No se necesita psql local — Neon es Postgres serverless en la nube
echo ""
print_info "Base de datos: PostgreSQL en Neon (cloud). No se requiere instalación local."
echo ""

# ──────────────────────────────────────────────────────────────
# BACKEND
# ──────────────────────────────────────────────────────────────
echo "📦 Instalando dependencias del Backend..."
cd backend

if [ ! -f "package.json" ]; then
    print_error "No se encontró package.json en backend/"
    exit 1
fi

npm install
if [ $? -eq 0 ]; then
    print_success "Dependencias del backend instaladas (incluye pg)"
else
    print_error "Error al instalar dependencias del backend"
    exit 1
fi

# Crear .env si no existe
if [ ! -f ".env" ]; then
    print_info "Creando archivo .env del backend..."

    read -p "Ingresa tu connection string de Neon (con pooler): " NEON_URL
    NEON_URL=${NEON_URL:-"postgresql://user:password@ep-example-pooler.region.aws.neon.tech/dbname?sslmode=require&channel_binding=require"}

    read -p "Ingresa tu JWT_SECRET (o presiona Enter para usar uno por defecto): " JWT_SECRET_INPUT
    JWT_SECRET_INPUT=${JWT_SECRET_INPUT:-"cambiar_este_secreto_en_produccion_$(openssl rand -hex 16 2>/dev/null || echo '12345')"}

    cat > .env <<EOF
# ─── PostgreSQL (Neon) ────────────────────────────────────────
DATABASE_URL=${NEON_URL}
DB_POOL_MAX=10
DB_IDLE_TIMEOUT=30000
DB_CONN_TIMEOUT=5000

# ─── JWT ──────────────────────────────────────────────────────
JWT_SECRET=${JWT_SECRET_INPUT}
JWT_EXPIRE=7d

# ─── Servidor ─────────────────────────────────────────────────
PORT=5000
NODE_ENV=development

# ─── CORS ─────────────────────────────────────────────────────
FRONTEND_URL=http://localhost:5173
EOF

    print_success "Archivo .env creado."
else
    print_info ".env ya existe, no se sobreescribe."
fi

cd ..

# ──────────────────────────────────────────────────────────────
# FRONTEND
# ──────────────────────────────────────────────────────────────
echo ""
echo "📦 Instalando dependencias del Frontend..."
cd frontend

if [ ! -f "package.json" ]; then
    print_error "No se encontró package.json en frontend/"
    exit 1
fi

npm install
if [ $? -eq 0 ]; then
    print_success "Dependencias del frontend instaladas"
else
    print_error "Error al instalar dependencias del frontend"
    exit 1
fi

if [ ! -f ".env" ]; then
    print_info "Creando archivo .env del frontend..."
    echo "VITE_API_URL=http://localhost:5000/api" > .env
    print_success "Archivo .env del frontend creado."
else
    print_info ".env del frontend ya existe, no se sobreescribe."
fi

cd ..

# ──────────────────────────────────────────────────────────────
# MIGRATE — Crear tablas en PostgreSQL (Neon)
# ──────────────────────────────────────────────────────────────
echo ""
echo "🗄️  Aplicando esquema (users, student_surveys, teacher_surveys)..."
print_info "Esto requiere que DATABASE_URL en backend/.env sea válida."

cd backend
node databases/migrate.js
MIGRATE_EXIT=$?
cd ..

if [ $MIGRATE_EXIT -eq 0 ]; then
    print_success "Esquema aplicado correctamente"
else
    print_warn "La migración falló. Verifica tu DATABASE_URL."
fi

# ──────────────────────────────────────────────────────────────
# SEED — Usuario administrador en PostgreSQL
# ──────────────────────────────────────────────────────────────
echo ""
echo "🌱 Creando usuario administrador..."

cd backend
node databases/seed.js
SEED_EXIT=$?
cd ..

if [ $SEED_EXIT -eq 0 ]; then
    print_success "Seed ejecutado correctamente"
else
    print_warn "El seed falló o ya existía el admin. Verifica tu DATABASE_URL."
    print_info "Puedes ejecutarlo manualmente: cd backend && npm run seed"
fi

# ──────────────────────────────────────────────────────────────
# FINALIZACIÓN
# ──────────────────────────────────────────────────────────────
echo ""
echo "======================================"
print_success "¡Instalación completada!"
echo "======================================"
echo ""
print_info "Credenciales de administrador:"
echo "  Email:    admin@gmail.com"
echo "  Password: admin123"
print_warn "Cambia la contraseña en producción."
echo ""
print_info "Para iniciar el proyecto:"
echo ""
echo "  Terminal 1 — Backend:"
echo "  cd backend && npm run dev"
echo ""
echo "  Terminal 2 — Frontend:"
echo "  cd frontend && npm run dev"
echo ""
print_success "¡Disfruta del sistema de encuestas!"
echo ""