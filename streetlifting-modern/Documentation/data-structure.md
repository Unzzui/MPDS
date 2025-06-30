# Estructura de Datos - MPDS Streetlifting

## 📊 Resumen General

La aplicación MPDS utiliza una arquitectura de datos relacional basada en SQLAlchemy con las siguientes entidades principales:

- **Usuario y Perfil**: Información básica del usuario y datos de adaptación
- **Rutinas**: Programas de entrenamiento personalizados
- **Entrenamientos**: Logs de sesiones de entrenamiento
- **1RM**: Registros de máximos de una repetición
- **Bloques de Entrenamiento**: Programas estructurados de progresión
- **Interacciones**: Datos de comportamiento para adaptación

---

## 👤 USUARIO Y PERFIL

### User (users)

```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(120) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP
);
```

**Propósito**: Información básica de autenticación y identificación del usuario.

**Relaciones**:

- `training_blocks` → TrainingBlock (1:N)
- `workouts` → Workout (1:N)
- `one_rep_maxes` → OneRepMax (1:N)
- `routines` → Routine (1:N)
- `profile` → UserProfile (1:1)

---

### UserProfile (user_profiles)

```sql
CREATE TABLE user_profiles (
    id INTEGER PRIMARY KEY,
    user_id INTEGER UNIQUE NOT NULL,

    -- Core profile data
    experience_level VARCHAR(50) DEFAULT 'absolute_beginner',
    manual_override_level VARCHAR(50),

    -- Adaptation metrics
    technical_experience_score FLOAT DEFAULT 0.0,
    training_commitment_score FLOAT DEFAULT 0.0,
    needs_sophistication_score FLOAT DEFAULT 0.0,

    -- Behavioral tracking
    navigation_patterns JSON DEFAULT '{}',
    feature_usage_frequency JSON DEFAULT '{}',
    session_duration_avg FLOAT DEFAULT 0.0,

    -- Learning and progression
    terminology_usage JSON DEFAULT '{}',
    manual_adjustments_count INTEGER DEFAULT 0,
    help_requests JSON DEFAULT '{}',

    -- Training consistency
    workout_frequency_7d FLOAT DEFAULT 0.0,
    workout_frequency_30d FLOAT DEFAULT 0.0,
    data_quality_score FLOAT DEFAULT 0.0,

    -- Preferences
    preferred_dashboard_layout VARCHAR(50) DEFAULT 'auto',
    feature_discovery_enabled BOOLEAN DEFAULT TRUE,
    auto_adaptation_enabled BOOLEAN DEFAULT TRUE,

    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP,
    last_level_calculation TIMESTAMP DEFAULT NOW()
);
```

**Niveles de Experiencia**:

- `absolute_beginner`: Principiante absoluto
- `committed_beginner`: Principiante comprometido
- `intermediate`: Intermedio
- `advanced`: Avanzado
- `elite_athlete`: Atleta de élite

**Métricas de Adaptación**:

- `technical_experience_score`: Conocimiento técnico (0-100)
- `training_commitment_score`: Compromiso con el entrenamiento (0-100)
- `needs_sophistication_score`: Necesidad de características avanzadas (0-100)

---

### UserInteraction (user_interactions)

```sql
CREATE TABLE user_interactions (
    id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL,
    interaction_type VARCHAR(100) NOT NULL,
    interaction_data JSON DEFAULT '{}',
    duration_seconds FLOAT,
    session_id VARCHAR(100),
    user_level_at_time VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW()
);
```

**Tipos de Interacción**:

- `page_visit`: Visita a página
- `feature_use`: Uso de característica
- `help_request`: Solicitud de ayuda
- `settings_change`: Cambio de configuración
- `workout_completion`: Completación de entrenamiento

---

### DashboardConfiguration (dashboard_configurations)

```sql
CREATE TABLE dashboard_configurations (
    id INTEGER PRIMARY KEY,
    experience_level VARCHAR(50) UNIQUE NOT NULL,

    -- Widget configuration
    visible_widgets JSON DEFAULT '[]',
    widget_order JSON DEFAULT '[]',
    widget_settings JSON DEFAULT '{}',

    -- Navigation configuration
    visible_nav_items JSON DEFAULT '[]',
    featured_actions JSON DEFAULT '[]',

    -- Complexity settings
    show_advanced_metrics BOOLEAN DEFAULT FALSE,
    show_projections BOOLEAN DEFAULT FALSE,
    show_analytics BOOLEAN DEFAULT FALSE,
    enable_manual_overrides BOOLEAN DEFAULT FALSE,

    -- Feature discovery
    suggested_features JSON DEFAULT '[]',
    onboarding_flow JSON DEFAULT '[]',

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP
);
```

---

## 🏋️ RUTINAS Y EJERCICIOS

### Routine (routines)

```sql
CREATE TABLE routines (
    id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    exercises JSON NOT NULL,  -- Lista de nombres de ejercicios
    days JSON NOT NULL,       -- Días de la semana [1,2,3,4,5,6,7]
    main_lifts JSON NOT NULL, -- Ejercicios principales
    is_active BOOLEAN DEFAULT TRUE,
    is_template BOOLEAN DEFAULT FALSE,  -- Para plantillas del sistema
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP
);
```

**Ejemplo de datos JSON**:

```json
{
  "exercises": ["Pull-ups", "Dips", "Squats", "Push-ups"],
  "days": [1, 3, 5],
  "main_lifts": ["Pull-ups", "Dips"]
}
```

---

### RoutineExercise (routine_exercises)

```sql
CREATE TABLE routine_exercises (
    id INTEGER PRIMARY KEY,
    routine_id INTEGER NOT NULL,
    exercise_name VARCHAR(255) NOT NULL,
    order_index INTEGER DEFAULT 0,
    sets INTEGER DEFAULT 3,
    reps VARCHAR(50) DEFAULT '8-12',  -- "8-12", "5x5", "AMRAP"
    weight_percentage INTEGER,         -- Porcentaje del 1RM
    rest_time INTEGER,                 -- Tiempo de descanso en segundos
    is_main_lift BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
```

**Formatos de Repeticiones**:

- `"8-12"`: Rango de repeticiones
- `"5x5"`: Series x repeticiones fijas
- `"AMRAP"`: As Many Reps As Possible
- `"3-5"`: Rango para fuerza

---

## 📝 ENTRENAMIENTOS Y LOGS

### Workout (workouts)

```sql
CREATE TABLE workouts (
    id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL,
    routine_id INTEGER,  -- Referencia opcional a rutina
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    day_type VARCHAR(50) NOT NULL,  -- "push", "pull", "legs", etc.
    success BOOLEAN DEFAULT TRUE,
    in_progress BOOLEAN DEFAULT FALSE,
    completed BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP
);
```

**Tipos de Día**:

- `push`: Empuje (pecho, hombros, tríceps)
- `pull`: Tracción (espalda, bíceps)
- `legs`: Piernas
- `full_body`: Cuerpo completo
- `cardio`: Cardiovascular
- `rest`: Descanso

---

### Exercise (exercises)

```sql
CREATE TABLE exercises (
    id INTEGER PRIMARY KEY,
    workout_id INTEGER NOT NULL,
    name VARCHAR(100) NOT NULL,
    weight FLOAT NOT NULL,
    reps INTEGER NOT NULL,
    rpe FLOAT,  -- Rate of Perceived Exertion (1-10)
    notes VARCHAR(200),
    completed BOOLEAN DEFAULT TRUE,
    set_number INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT NOW()
);
```

**RPE (Rate of Perceived Exertion)**:

- `1-3`: Muy fácil
- `4-6`: Moderado
- `7-8`: Difícil
- `9-10`: Máximo esfuerzo

---

## 🏆 1RM Y MÁXIMOS

### OneRepMax (one_rep_maxes)

```sql
CREATE TABLE one_rep_maxes (
    id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL,
    exercise VARCHAR(100) NOT NULL,
    one_rm FLOAT NOT NULL,
    date_achieved DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP
);
```

**Ejercicios Principales**:

- `Pull-up`: Dominadas
- `Dip`: Fondos
- `Muscle-up`: Muscle-up
- `Squat`: Sentadillas
- `Bench Press`: Press de banca
- `Deadlift`: Peso muerto

---

## 📈 BLOQUES DE ENTRENAMIENTO

### TrainingBlock (training_blocks)

```sql
CREATE TABLE training_blocks (
    id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL,
    name VARCHAR(100) NOT NULL,
    duration INTEGER NOT NULL,  -- semanas
    total_weeks INTEGER NOT NULL,
    current_stage VARCHAR(50) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    current_week INTEGER DEFAULT 1,

    -- 1RM al inicio del bloque
    rm_pullups FLOAT DEFAULT 0.0,
    rm_dips FLOAT DEFAULT 0.0,
    rm_muscleups FLOAT DEFAULT 0.0,
    rm_squats FLOAT DEFAULT 0.0,

    -- Configuración de progresión
    strategy VARCHAR(50) DEFAULT 'default',
    weekly_increment FLOAT DEFAULT 3.0,
    deload_week INTEGER,
    increment_type VARCHAR(20) DEFAULT 'percentage',  -- 'percentage' o 'absolute'

    -- Estado
    is_active BOOLEAN DEFAULT TRUE,
    status VARCHAR(20) DEFAULT 'planned',  -- 'planned', 'in_progress', 'completed'
    routines_by_day TEXT,  -- JSON string

    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP
);
```

**Estrategias de Progresión**:

- `default`: Incremento lineal
- `wave`: Progresión ondulante
- `step`: Incrementos escalonados
- `deload`: Incluye semanas de descarga

---

### BlockStage (block_stages)

```sql
CREATE TABLE block_stages (
    id INTEGER PRIMARY KEY,
    block_id INTEGER NOT NULL,
    name VARCHAR(50) NOT NULL,
    week_number INTEGER NOT NULL,
    load_percentage FLOAT NOT NULL,  -- Porcentaje del 1RM
    description VARCHAR(200),
    created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🔄 RELACIONES ENTRE ENTIDADES

### Diagrama de Relaciones

```
User (1) ←→ (1) UserProfile
User (1) ←→ (N) TrainingBlock
User (1) ←→ (N) Workout
User (1) ←→ (N) OneRepMax
User (1) ←→ (N) Routine
User (1) ←→ (N) UserInteraction

Routine (1) ←→ (N) RoutineExercise
Routine (1) ←→ (N) Workout

Workout (1) ←→ (N) Exercise

TrainingBlock (1) ←→ (N) BlockStage
```

---

## 📊 FLUJO DE DATOS TÍPICO

### 1. Registro de Usuario

```
User → UserProfile (creación automática)
```

### 2. Configuración Inicial

```
UserProfile → OneRepMax (datos iniciales)
UserProfile → Routine (rutina básica)
```

### 3. Entrenamiento Diario

```
Workout → Exercise (logs de ejercicios)
Exercise → OneRepMax (actualización si es necesario)
```

### 4. Adaptación del Sistema

```
UserInteraction → UserProfile (actualización de métricas)
UserProfile → DashboardConfiguration (ajuste de interfaz)
```

---

## 🎯 CASOS DE USO DE DATOS

### Dashboard Principal

- **UserProfile**: Nivel de experiencia, preferencias
- **OneRepMax**: Máximos actuales para cálculos
- **Workout**: Entrenamientos recientes
- **Routine**: Rutina activa

### Logging de Entrenamiento

- **Routine**: Ejercicios del día
- **OneRepMax**: Para calcular porcentajes
- **Exercise**: Logs de series y repeticiones

### Progreso y Análisis

- **Workout**: Historial de entrenamientos
- **OneRepMax**: Evolución de máximos
- **UserInteraction**: Patrones de comportamiento

### Adaptación del Sistema

- **UserProfile**: Métricas de adaptación
- **UserInteraction**: Comportamiento del usuario
- **DashboardConfiguration**: Configuración personalizada

---

## 🔧 CONSIDERACIONES TÉCNICAS

### Índices Recomendados

```sql
-- Usuario
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);

-- Entrenamientos
CREATE INDEX idx_workouts_user_date ON workouts(user_id, date);
CREATE INDEX idx_workouts_routine ON workouts(routine_id);

-- 1RM
CREATE INDEX idx_onerm_user_exercise ON one_rep_maxes(user_id, exercise);
CREATE INDEX idx_onerm_date ON one_rep_maxes(date_achieved);

-- Interacciones
CREATE INDEX idx_interactions_user_time ON user_interactions(user_id, created_at);
```

### Optimizaciones de Consulta

- Usar `lazy="selectin"` para relaciones frecuentemente accedidas
- Implementar cache para datos de 1RM
- Paginar resultados de historial de entrenamientos
- Usar JSONB para datos flexibles (PostgreSQL)

### Backup y Recuperación

- Backup diario de tablas críticas (users, workouts, one_rep_maxes)
- Backup semanal completo
- Versionado de esquemas de base de datos
- Migraciones automáticas

---

## 📈 MÉTRICAS Y KPIs

### Métricas de Usuario

- Frecuencia de entrenamiento (7d, 30d)
- Consistencia de logging
- Progreso en 1RM
- Nivel de experiencia

### Métricas de Sistema

- Tiempo de sesión promedio
- Características más utilizadas
- Tasa de retención
- Satisfacción del usuario

### Métricas de Negocio

- Usuarios activos diarios/mensuales
- Tiempo promedio en la app
- Tasa de completación de entrenamientos
- Progreso promedio de usuarios

---

_Documentación actualizada: Diciembre 2024_
_Versión: 1.0_
