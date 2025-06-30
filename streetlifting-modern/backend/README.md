# MPDS Backend - Streetlifting API

## 🚀 Configuración Rápida

### 1. **Instalar Dependencias**

```bash
# Opción A: Entorno virtual (recomendado)
chmod +x setup-venv.sh
./setup-venv.sh

# Opción B: Instalación directa
pip install -r requirements.txt
```

### 2. **Iniciar el Backend**

```bash
# Si usaste entorno virtual
source venv/bin/activate
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

# Si instalaste directamente
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

## 🔧 Solución de Problemas

### **Error: "bcrypt version" o "passlib"**

Si encuentras este error:

```
AttributeError: module 'bcrypt' has no attribute '__about__'
```

**Solución:**

```bash
# Opción 1: Script automático
chmod +x fix-bcrypt.sh
./fix-bcrypt.sh

# Opción 2: Manual
pip uninstall -y bcrypt passlib
pip install bcrypt==4.0.1
pip install passlib==1.7.4
```

### **Error: "Module not found"**

```bash
# Verificar que estés en el directorio correcto
cd streetlifting-modern/backend

# Reinstalar dependencias
pip install -r requirements.txt
```

## 📁 Estructura del Proyecto

```
backend/
├── app/
│   ├── api/
│   │   └── v1/
│   │       ├── auth.py
│   │       ├── workouts.py
│   │       ├── blocks.py
│   │       ├── routines.py
│   │       ├── one_rep_maxes.py
│   │       ├── user_adaptation.py
│   │       └── setup.py
│   ├── core/
│   │   ├── config.py
│   │   ├── database.py
│   │   ├── deps.py
│   │   ├── init_admin.py
│   │   └── init_routines.py
│   ├── models/
│   │   └── __init__.py
│   └── schemas/
│       └── __init__.py
├── main.py
├── requirements.txt
├── setup-venv.sh
├── fix-bcrypt.sh
└── README.md
```

## 🌐 Endpoints Disponibles

### **Autenticación**

- `POST /api/v1/auth/register` - Registrar usuario
- `POST /api/v1/auth/login` - Iniciar sesión
- `GET /api/v1/auth/me` - Obtener usuario actual

### **Workouts**

- `GET /api/v1/workouts/` - Listar workouts
- `POST /api/v1/workouts/` - Crear workout
- `GET /api/v1/workouts/{id}` - Obtener workout
- `PUT /api/v1/workouts/{id}` - Actualizar workout
- `DELETE /api/v1/workouts/{id}` - Eliminar workout

### **One Rep Maxes**

- `GET /api/v1/one-rep-maxes/` - Listar 1RM
- `POST /api/v1/one-rep-maxes/` - Crear 1RM
- `PUT /api/v1/one-rep-maxes/{id}` - Actualizar 1RM

### **Routines**

- `GET /api/v1/routines/` - Listar rutinas
- `POST /api/v1/routines/` - Crear rutina
- `GET /api/v1/routines/{id}` - Obtener rutina

### **Training Blocks**

- `GET /api/v1/blocks/` - Listar bloques
- `POST /api/v1/blocks/` - Crear bloque
- `GET /api/v1/blocks/current/` - Bloque actual

### **User Adaptation**

- `GET /api/v1/adaptation/dashboard` - Dashboard adaptativo
- `POST /api/v1/adaptation/interaction` - Registrar interacción
- `POST /api/v1/adaptation/level` - Establecer nivel manual

## 🔐 Configuración de Base de Datos

### **Variables de Entorno**

Crear archivo `.env` en el directorio backend:

```env
DATABASE_URL=postgresql://usuario:password@localhost:5432/mpds_db
SECRET_KEY=tu_clave_secreta_aqui
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

### **Inicializar Base de Datos**

```bash
# Crear tablas
python -c "from app.core.database import engine; from app.core.base import Base; Base.metadata.create_all(bind=engine)"

# Crear usuario admin y rutinas de ejemplo
# Se ejecuta automáticamente al iniciar la aplicación
```

## 🧪 Testing

```bash
# Ejecutar tests
pytest

# Tests con coverage
pytest --cov=app
```

## 📊 Monitoreo

### **Health Check**

```bash
curl http://localhost:8000/health
```

### **Documentación API**

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## 🔄 Scripts Útiles

### **setup-venv.sh**

Configura un entorno virtual limpio con todas las dependencias.

### **fix-bcrypt.sh**

Soluciona problemas de compatibilidad entre bcrypt y passlib.

### **start-ngrok.sh** (en directorio raíz)

Inicia el backend con ngrok para pruebas móviles.

## 🚨 Troubleshooting

### **Problema: Puerto 8000 ocupado**

```bash
# Cambiar puerto
python -m uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload
```

### **Problema: Base de datos no conecta**

```bash
# Verificar que PostgreSQL esté corriendo
sudo systemctl status postgresql

# Verificar conexión
psql -h localhost -U usuario -d mpds_db
```

### **Problema: Dependencias desactualizadas**

```bash
# Actualizar todas las dependencias
pip install --upgrade -r requirements.txt
```

---

_Backend MPDS Streetlifting - FastAPI + PostgreSQL_
_Configuración actualizada: Diciembre 2024_
