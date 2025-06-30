#!/bin/bash

echo "🐍 Configurando entorno virtual para MPDS Backend..."

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar que estamos en el directorio correcto
if [ ! -f "requirements.txt" ]; then
    print_error "Este script debe ejecutarse desde el directorio backend"
    exit 1
fi

# Verificar que Python esté instalado
if ! command -v python3 &> /dev/null; then
    print_error "Python3 no está instalado"
    exit 1
fi

# Crear entorno virtual
print_status "Creando entorno virtual..."
python3 -m venv venv

# Activar entorno virtual
print_status "Activando entorno virtual..."
source venv/bin/activate

# Actualizar pip
print_status "Actualizando pip..."
pip install --upgrade pip

# Instalar dependencias
print_status "Instalando dependencias..."
pip install -r requirements.txt

# Verificar instalación
print_status "Verificando instalación..."
python -c "
import bcrypt
import passlib
import fastapi
import sqlalchemy
print('✅ Todas las dependencias instaladas correctamente')
"

print_success "Entorno virtual configurado exitosamente!"
echo ""
print_status "Para activar el entorno virtual:"
echo "source venv/bin/activate"
echo ""
print_status "Para iniciar el backend:"
echo "python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"
echo ""
print_status "Para desactivar el entorno virtual:"
echo "deactivate" 