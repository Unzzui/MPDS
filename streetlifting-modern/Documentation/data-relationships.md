# Diagrama de Relaciones de Datos - MPDS Streetlifting

## 🔗 Diagrama de Entidades y Relaciones

```mermaid
erDiagram
    User {
        int id PK
        string username UK
        string email UK
        string hashed_password
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }

    UserProfile {
        int id PK
        int user_id FK
        string experience_level
        string manual_override_level
        float technical_experience_score
        float training_commitment_score
        float needs_sophistication_score
        json navigation_patterns
        json feature_usage_frequency
        float session_duration_avg
        json terminology_usage
        int manual_adjustments_count
        json help_requests
        float workout_frequency_7d
        float workout_frequency_30d
        float data_quality_score
        string preferred_dashboard_layout
        boolean feature_discovery_enabled
        boolean auto_adaptation_enabled
        timestamp created_at
        timestamp updated_at
        timestamp last_level_calculation
    }

    UserInteraction {
        int id PK
        int user_id FK
        string interaction_type
        json interaction_data
        float duration_seconds
        string session_id
        string user_level_at_time
        timestamp created_at
    }

    DashboardConfiguration {
        int id PK
        string experience_level UK
        json visible_widgets
        json widget_order
        json widget_settings
        json visible_nav_items
        json featured_actions
        boolean show_advanced_metrics
        boolean show_projections
        boolean show_analytics
        boolean enable_manual_overrides
        json suggested_features
        json onboarding_flow
        timestamp created_at
        timestamp updated_at
    }

    Routine {
        int id PK
        int user_id FK
        string name
        text description
        json exercises
        json days
        json main_lifts
        boolean is_active
        boolean is_template
        timestamp created_at
        timestamp updated_at
    }

    RoutineExercise {
        int id PK
        int routine_id FK
        string exercise_name
        int order_index
        int sets
        string reps
        int weight_percentage
        int rest_time
        boolean is_main_lift
        text notes
        timestamp created_at
    }

    Workout {
        int id PK
        int user_id FK
        int routine_id FK
        date date
        string day_type
        boolean success
        boolean in_progress
        boolean completed
        text notes
        timestamp created_at
        timestamp updated_at
    }

    Exercise {
        int id PK
        int workout_id FK
        string name
        float weight
        int reps
        float rpe
        string notes
        boolean completed
        int set_number
        timestamp created_at
    }

    OneRepMax {
        int id PK
        int user_id FK
        string exercise
        float one_rm
        date date_achieved
        timestamp created_at
        timestamp updated_at
    }

    TrainingBlock {
        int id PK
        int user_id FK
        string name
        int duration
        int total_weeks
        string current_stage
        date start_date
        date end_date
        int current_week
        float rm_pullups
        float rm_dips
        float rm_muscleups
        float rm_squats
        string strategy
        float weekly_increment
        int deload_week
        boolean is_active
        string status
        text routines_by_day
        string increment_type
        timestamp created_at
        timestamp updated_at
    }

    BlockStage {
        int id PK
        int block_id FK
        string name
        int week_number
        float load_percentage
        string description
        timestamp created_at
    }

    %% Relaciones principales
    User ||--|| UserProfile : "1:1"
    User ||--o{ UserInteraction : "1:N"
    User ||--o{ Routine : "1:N"
    User ||--o{ Workout : "1:N"
    User ||--o{ OneRepMax : "1:N"
    User ||--o{ TrainingBlock : "1:N"

    %% Relaciones de rutinas
    Routine ||--o{ RoutineExercise : "1:N"
    Routine ||--o{ Workout : "1:N"

    %% Relaciones de entrenamientos
    Workout ||--o{ Exercise : "1:N"

    %% Relaciones de bloques de entrenamiento
    TrainingBlock ||--o{ BlockStage : "1:N"

    %% Relaciones de configuración
    UserProfile }o--|| DashboardConfiguration : "experience_level"
```

## 📊 Flujo de Datos por Funcionalidad

### 1. **Registro y Onboarding**

```mermaid
graph TD
    A[Usuario se registra] --> B[Crear User]
    B --> C[Crear UserProfile automáticamente]
    C --> D[Configurar nivel beginner]
    D --> E[Crear DashboardConfiguration]
    E --> F[Redirigir a Setup]
    F --> G[Ingresar 1RM iniciales]
    G --> H[Crear OneRepMax records]
    H --> I[Crear rutina básica]
    I --> J[Dashboard funcional]
```

### 2. **Entrenamiento Diario**

```mermaid
graph TD
    A[Usuario inicia entrenamiento] --> B[Seleccionar rutina]
    B --> C[Crear Workout]
    C --> D[Mostrar ejercicios del día]
    D --> E[Usuario logea series]
    E --> F[Crear Exercise records]
    F --> G[Calcular RPE automático]
    G --> H[Verificar si es nuevo 1RM]
    H --> I[Actualizar OneRepMax si es necesario]
    I --> J[Completar Workout]
    J --> K[Trackear UserInteraction]
    K --> L[Actualizar UserProfile metrics]
```

### 3. **Adaptación del Sistema**

```mermaid
graph TD
    A[Usuario interactúa con la app] --> B[Trackear UserInteraction]
    B --> C[Analizar patrones de comportamiento]
    C --> D[Calcular métricas de adaptación]
    D --> E[Determinar si cambiar nivel]
    E --> F[Actualizar UserProfile]
    F --> G[Ajustar DashboardConfiguration]
    G --> H[Mostrar características apropiadas]
```

## 🎯 Casos de Uso Específicos

### **Dashboard Principal**

```sql
-- Datos necesarios para el dashboard
SELECT
    u.username,
    up.experience_level,
    up.workout_frequency_7d,
    up.data_quality_score,
    orm.exercise,
    orm.one_rm,
    orm.date_achieved,
    w.date as last_workout,
    w.day_type as last_workout_type,
    r.name as active_routine
FROM users u
JOIN user_profiles up ON u.id = up.user_id
LEFT JOIN one_rep_maxes orm ON u.id = orm.user_id
LEFT JOIN workouts w ON u.id = w.user_id
LEFT JOIN routines r ON u.id = r.user_id AND r.is_active = true
WHERE u.id = :user_id
ORDER BY orm.date_achieved DESC, w.date DESC
LIMIT 10;
```

### **Logging de Entrenamiento**

```sql
-- Obtener rutina del día
SELECT
    re.exercise_name,
    re.sets,
    re.reps,
    re.weight_percentage,
    re.rest_time,
    re.is_main_lift,
    orm.one_rm
FROM routine_exercises re
JOIN routines r ON re.routine_id = r.id
LEFT JOIN one_rep_maxes orm ON r.user_id = orm.user_id
    AND orm.exercise = re.exercise_name
WHERE r.user_id = :user_id
    AND r.is_active = true
    AND :current_day = ANY(r.days)
ORDER BY re.order_index;
```

### **Análisis de Progreso**

```sql
-- Progreso de 1RM por ejercicio
SELECT
    exercise,
    one_rm,
    date_achieved,
    LAG(one_rm) OVER (PARTITION BY exercise ORDER BY date_achieved) as previous_rm,
    (one_rm - LAG(one_rm) OVER (PARTITION BY exercise ORDER BY date_achieved)) as improvement
FROM one_rep_maxes
WHERE user_id = :user_id
ORDER BY exercise, date_achieved;
```

## 🔄 Estados y Transiciones

### **Estados de Workout**

```
planned → in_progress → completed
     ↓         ↓          ↓
   success   success    success
     ↓         ↓          ↓
   notes     notes      notes
```

### **Estados de TrainingBlock**

```
planned → in_progress → completed
     ↓         ↓          ↓
   current_week = 1    current_week = total_weeks
     ↓         ↓          ↓
   is_active = true   is_active = false
```

### **Niveles de Experiencia**

```
absolute_beginner → committed_beginner → intermediate → advanced → elite_athlete
       ↓                    ↓                ↓            ↓           ↓
   basic_features      more_features    advanced_features
       ↓                    ↓                ↓
   simple_ui            standard_ui      complex_ui
```

## 📈 Métricas Clave

### **Métricas de Usuario**

- **Frecuencia**: `workout_frequency_7d`, `workout_frequency_30d`
- **Consistencia**: `data_quality_score`
- **Progreso**: Evolución de `one_rm` por ejercicio
- **Experiencia**: `experience_level`, `technical_experience_score`

### **Métricas de Sistema**

- **Engagement**: `session_duration_avg`, `feature_usage_frequency`
- **Adaptación**: `manual_adjustments_count`, `help_requests`
- **Retención**: Patrones de `navigation_patterns`

### **Métricas de Negocio**

- **Usuarios Activos**: Conteo de usuarios con `workouts` en últimos 7/30 días
- **Completación**: Porcentaje de `workouts.completed = true`
- **Progreso**: Promedio de mejora en `one_rm` por usuario

---

_Diagrama actualizado: Diciembre 2024_
_Versión: 1.0_
