#!/bin/bash

echo "======================================"
echo "  Chatbots Education Survey Setup"
echo "======================================"
echo ""

# Colores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

print_success() { echo -e "${GREEN}✓ $1${NC}"; }
print_info()    { echo -e "${BLUE}ℹ $1${NC}"; }
print_error()   { echo -e "${RED}✗ $1${NC}"; }

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

if ! command -v psql &> /dev/null; then
    print_error "PostgreSQL no está instalado. Por favor instala PostgreSQL 14+ primero."
    exit 1
fi
print_success "PostgreSQL encontrado"

echo ""
print_info "Iniciando instalación del proyecto..."
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
    print_success "Dependencias del backend instaladas"
else
    print_error "Error al instalar dependencias del backend"
    exit 1
fi

if [ ! -f ".env" ]; then
    print_info "Creando archivo .env..."
    cp .env.example .env
    print_success "Archivo .env creado. Por favor configura tus credenciales."
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
    print_info "Creando archivo .env..."
    cp .env.example .env
    print_success "Archivo .env creado"
fi

cd ..

# ──────────────────────────────────────────────────────────────
# BASE DE DATOS
# ──────────────────────────────────────────────────────────────
echo ""
echo "🗄️  Configurando Base de Datos..."
print_info "Asegúrate de tener PostgreSQL corriendo"

read -p "Ingresa el nombre de usuario de PostgreSQL (default: postgres): " DB_USER
DB_USER=${DB_USER:-postgres}

read -p "Ingresa el nombre de la base de datos (default: chatbots_system): " DB_NAME
DB_NAME=${DB_NAME:-chatbots_system}

# Verificar si la base de datos ya existe
print_info "Verificando si la base de datos '$DB_NAME' existe..."
DB_EXISTS=$(psql -U "$DB_USER" -tAc "SELECT 1 FROM pg_database WHERE datname='$DB_NAME'")

if [ "$DB_EXISTS" = "1" ]; then
    print_info "La base de datos '$DB_NAME' ya existe."
    read -p "¿Deseas eliminarla y crear una nueva? (s/n, default: s): " RECREATE
    RECREATE=${RECREATE:-s}

    if [ "$RECREATE" = "s" ] || [ "$RECREATE" = "S" ]; then
        print_info "Eliminando base de datos existente '$DB_NAME'..."
        dropdb -U "$DB_USER" "$DB_NAME" 2>/dev/null
        if [ $? -eq 0 ]; then
            print_success "Base de datos '$DB_NAME' eliminada"
        else
            print_error "Error al eliminar la base de datos"
            exit 1
        fi
    else
        print_info "Se mantendrá la base de datos existente. Finalizando."
        exit 0
    fi
fi

print_info "Creando base de datos '$DB_NAME'..."
createdb -U "$DB_USER" "$DB_NAME"
if [ $? -ne 0 ]; then
    print_error "Error al crear la base de datos"
    exit 1
fi
print_success "Base de datos '$DB_NAME' creada"

# ──────────────────────────────────────────────────────────────
# EJECUTAR init.sql (tablas + índices de rendimiento + índices
# de idempotencia + usuario admin)
# Todo está unificado en un solo archivo; no se necesita ejecutar
# migration_idempotency_concurrency.sql por separado.
# ──────────────────────────────────────────────────────────────
INIT_SQL="backend/database/init.sql"

if [ ! -f "$INIT_SQL" ]; then
    print_error "No se encontró $INIT_SQL"
    exit 1
fi

print_info "Ejecutando $INIT_SQL..."
psql -U "$DB_USER" -d "$DB_NAME" -f "$INIT_SQL"
if [ $? -eq 0 ]; then
    print_success "Base de datos inicializada correctamente"
    print_success "Tablas, índices de rendimiento e idempotencia creados"
    print_success "Usuario administrador creado: admin@gmail.com / admin123"
else
    print_error "Error al inicializar la base de datos"
    exit 1
fi

# ──────────────────────────────────────────────────────────────
# FINALIZACIÓN
# ──────────────────────────────────────────────────────────────
echo ""
echo "======================================"
print_success "¡Instalación completada!"
echo "======================================"
echo ""
print_info "Próximos pasos:"
echo ""
echo "  1. Configura las variables de entorno en backend/.env"
echo ""
echo "  2. Para iniciar el proyecto:"
echo ""
echo "     Terminal 1 — Backend:"
echo "     cd backend && npm run dev"
echo ""
echo "     Terminal 2 — Frontend:"
echo "     cd frontend && npm run dev"
echo ""
print_success "¡Disfruta del sistema de encuestas!"
echo ""