# StreetLifting - Modern App

Una aplicación moderna para el seguimiento de entrenamientos de calistenia y streetlifting, construida con **FastAPI + React + TypeScript** con enfoque **mobile-first**.

## 🚀 Características

### Backend (FastAPI)

- **API RESTful** con documentación automática (OpenAPI/Swagger)
- **Autenticación JWT** segura
- **Base de datos SQLite** con SQLAlchemy
- **Validación de datos** con Pydantic
- **Cálculo automático de 1RM** con fórmulas Epley
- **Gestión de bloques de entrenamiento**
- **Estadísticas y progreso**

### Frontend (React + TypeScript)

- **Diseño mobile-first** con Tailwind CSS
- **Navegación responsive** con sidebar y bottom nav
- **Estado global** con React Query
- **Componentes reutilizables**
- **TypeScript** para type safety
- **PWA ready** para funcionalidad offline

## 🏗️ Arquitectura

```
streetlifting-modern/
├── backend/                 # FastAPI Backend
│   ├── app/
│   │   ├── api/v1/         # Endpoints de la API
│   │   ├── core/           # Configuración y base de datos
│   │   ├── models/         # Modelos SQLAlchemy
│   │   ├── schemas/        # Esquemas Pydantic
│   │   └── services/       # Lógica de negocio
│   ├── requirements.txt
│   └── main.py
├── frontend/               # React Frontend
│   ├── src/
│   │   ├── components/     # Componentes reutilizables
│   │   ├── pages/          # Páginas de la aplicación
│   │   ├── hooks/          # Custom hooks
│   │   ├── services/       # Servicios de API
│   │   └── types/          # Tipos TypeScript
│   ├── package.json
│   └── tailwind.config.js
└── README.md
```

## 🛠️ Instalación

### Prerrequisitos

- Python 3.8+
- Node.js 16+
- npm o yarn

### Backend

1. **Navegar al directorio del backend:**

```bash
cd streetlifting-modern/backend
```

2. **Crear entorno virtual:**

```bash
python -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate
```

3. **Instalar dependencias:**

```bash
pip install -r requirements.txt
```

4. **Ejecutar el servidor:**

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

El backend estará disponible en `http://localhost:8000`

- API Docs: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

### Frontend

1. **Navegar al directorio del frontend:**

```bash
cd streetlifting-modern/frontend
```

2. **Instalar dependencias:**

```bash
npm install
```

3. **Ejecutar en modo desarrollo:**

```bash
npm run dev
```

El frontend estará disponible en `http://localhost:5173`

## 📱 Características Mobile-First

### Diseño Responsive

- **Breakpoints optimizados** para móviles, tablets y desktop
- **Navegación adaptativa** con sidebar en desktop y bottom nav en móvil
- **Touch-friendly** con botones de 44px mínimo
- **Gestos táctiles** para navegación

### Componentes Mobile-Optimized

- **Cards apiladas** verticalmente en móvil
- **Formularios optimizados** para teclado móvil
- **Botones de acción** en la parte inferior para fácil acceso
- **Loading states** con spinners apropiados

## 🔧 Configuración

### Variables de Entorno

Crear archivo `.env` en el directorio backend:

```env
# App settings
APP_NAME=StreetLifting API
DEBUG=true

# Database
DATABASE_URL=sqlite:///./streetlifting.db

# Security
SECRET_KEY=your-secret-key-change-in-production
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS
ALLOWED_ORIGINS=["http://localhost:3000", "http://localhost:5173"]
```

### Frontend Environment

Crear archivo `.env` en el directorio frontend:

```env
VITE_API_URL=http://localhost:8000
```

## 📊 Funcionalidades Principales

### Gestión de Entrenamientos

- ✅ Crear y editar entrenamientos
- ✅ Guardar progreso en tiempo real
- ✅ Historial de entrenamientos
- ✅ Estadísticas de progreso

### Cálculos Automáticos

- ✅ Estimación de 1RM con fórmula Epley
- ✅ Ajustes por RPE (Rate of Perceived Exertion)
- ✅ Pesos sugeridos por porcentaje de 1RM
- ✅ Progresión semanal automática

### Bloques de Entrenamiento

- ✅ Crear bloques de entrenamiento
- ✅ Seguimiento de semanas
- ✅ Diferentes estrategias de progresión
- ✅ Deload automático

## 🎨 Diseño y UX

### Paleta de Colores

- **Primary**: `#ff6f61` (Naranja vibrante)
- **Background**: `#0d0d0d` (Negro profundo)
- **Surface**: `#1a1a1a` (Gris oscuro)
- **Text**: `#e0e0e0` (Gris claro)

### Tipografía

- **Inter** para texto general
- **Chopsic** para títulos de marca

### Componentes

- **Cards** con bordes redondeados y sombras
- **Botones** con estados hover y focus
- **Inputs** con validación visual
- **Loading states** con animaciones suaves

## 🔒 Seguridad

- **JWT tokens** para autenticación
- **Password hashing** con bcrypt
- **CORS** configurado apropiadamente
- **Validación de datos** en frontend y backend
- **Rate limiting** (configurable)

## 🚀 Despliegue

### Backend (Producción)

```bash
# Usar Gunicorn para producción
pip install gunicorn
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker
```

### Frontend (Producción)

```bash
npm run build
# Servir archivos estáticos desde nginx o similar
```

## 📈 Roadmap

### Próximas Funcionalidades

- [ ] **PWA** con Service Workers
- [ ] **Notificaciones push** para recordatorios
- [ ] **Sincronización offline** de datos
- [ ] **Gráficos avanzados** con Recharts
- [ ] **Social features** (compartir entrenamientos)
- [ ] **Exportación de datos** (CSV, PDF)
- [ ] **Integración con wearables**

### Mejoras Técnicas

- [ ] **Tests unitarios** y de integración
- [ ] **CI/CD pipeline** con GitHub Actions
- [ ] **Docker** para containerización
- [ ] **PostgreSQL** para producción
- [ ] **Redis** para caché
- [ ] **WebSockets** para tiempo real

## 🤝 Contribución

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🆘 Soporte

Si tienes problemas o preguntas:

1. Revisa la documentación de la API en `/docs`
2. Abre un issue en GitHub
3. Contacta al equipo de desarrollo

---

**¡Construido con ❤️ para la comunidad de StreetLifting!**
