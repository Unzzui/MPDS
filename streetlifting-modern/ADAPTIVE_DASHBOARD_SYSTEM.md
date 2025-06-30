# Sistema de Dashboard Adaptativo - StreetLifting

## 🎯 Visión General

Este sistema implementa un dashboard que se adapta automáticamente al nivel de experiencia y necesidades del usuario, con **salvaguardas críticas contra sesgos** que previenen el encasillamiento de usuarios.

## 🛡️ Soluciones a Riesgos Identificados

### 1. Problema del Sesgo y Encasillamiento

**Riesgo**: Usuarios casuales nunca descubren funcionalidades avanzadas.

**Soluciones Implementadas**:

- **Botón "Advanced View"** siempre visible que permite acceso inmediato a todas las funciones
- **Sistema de Discovery Hints** que sugiere activamente características no utilizadas
- **Feature Discovery Modal** que muestra funciones disponibles con descripciones
- **Override Manual** permite a cualquier usuario cambiar su nivel manualmente

### 2. Problema de Clasificación Estática

**Riesgo**: Usuario mejora pero el sistema lo mantiene en vista simplificada.

**Soluciones Implementadas**:

- **Recálculo Automático Semanal** del nivel de experiencia
- **Degradación Protegida** que evita downgrades injustos por inactividad temporal
- **Progresión Visible** muestra al usuario su progreso hacia el siguiente nivel
- **Transiciones Documentadas** registra todos los cambios de nivel con razones

## 🏗️ Arquitectura del Sistema

### Backend (FastAPI)

```
backend/app/
├── models/
│   └── user_profile.py          # Modelos de perfil adaptativo
├── schemas/
│   └── user_profile.py          # Esquemas Pydantic
├── services/
│   └── user_adaptation.py       # Lógica principal de adaptación
└── api/v1/
    └── user_adaptation.py       # Endpoints de la API
```

### Frontend (React + TypeScript)

```
frontend/src/
├── contexts/
│   └── AdaptationContext.tsx    # Context para estado adaptativo
├── components/
│   ├── AdaptiveDashboard.tsx    # Dashboard principal
│   ├── AdvancedModeToggle.tsx   # Toggle anti-sesgo crítico
│   ├── DiscoveryHints.tsx       # Sugerencias de descubrimiento
│   ├── LevelIndicator.tsx       # Indicador de nivel
│   └── DashboardWidget.tsx      # Widgets adaptativos
└── pages/
    └── AdaptiveDashboardPage.tsx # Página del dashboard
```

## 📊 Niveles de Experiencia

### 1. Absolute Beginner (0-20 puntos)

- **Objetivo**: Establecer hábito de entrenamiento
- **Widgets**: Start Workout, Progress Summary básico
- **Navegación**: Dashboard, Workouts, Progress
- **Características**: Interfaz ultra-simple, botones grandes

### 2. Committed Beginner (20-40 puntos)

- **Objetivo**: Introducir periodización básica
- **Widgets**: + Recent Workouts, Proyecciones 1RM
- **Navegación**: + Routines
- **Características**: Conceptos de periodización gradual

### 3. Intermediate (40-65 puntos)

- **Objetivo**: Tracking detallado y análisis
- **Widgets**: + Analytics, Training Blocks
- **Navegación**: + Analytics
- **Características**: Métricas avanzadas, manejo de carga

### 4. Advanced (65-85 puntos)

- **Objetivo**: Herramientas comprensivas de atleta serio
- **Widgets**: Reordenados por prioridad analítica
- **Navegación**: + Settings con overrides manuales
- **Características**: Programación manual, auto-regulación

### 5. Elite Athlete (85-100 puntos)

- **Objetivo**: Personalización completa y herramientas de investigación
- **Widgets**: Analytics first, máxima customización
- **Navegación**: + Export, acceso completo a API
- **Características**: Fórmulas custom, análisis poblacional

## 🧮 Sistema de Puntuación

### Experiencia Técnica (35% del peso total)

- **Uso de terminología** (0-25 pts): Términos técnicos en notas
- **Ajustes manuales** (0-25 pts): Overrides de sugerencias del sistema
- **Diversidad de características** (0-25 pts): Variedad de funciones utilizadas
- **Independencia de ayuda** (0-25 pts): Menos solicitudes de ayuda básica

### Compromiso con Entrenamiento (35% del peso total)

- **Frecuencia semanal** (0-30 pts): Entrenamientos por semana
- **Consistencia mensual** (0-25 pts): Regularidad en 30 días
- **Calidad de datos** (0-25 pts): Completitud de logs (RPE, notas)
- **Engagement de sesión** (0-20 pts): Duración promedio de uso

### Sofisticación de Necesidades (30% del peso total)

- **Navegación avanzada** (0-30 pts): Uso de secciones analíticas
- **Características complejas** (0-35 pts): Uso de herramientas avanzadas
- **Profundidad de análisis** (0-35 pts): Tiempo en análisis detallado

## 🚀 Características Anti-Sesgo

### 1. Advanced Mode Toggle

```tsx
// CRÍTICO: Siempre visible, permite escape inmediato
<button className="advanced-mode-toggle">Show Advanced Features</button>
```

### 2. Feature Discovery

```tsx
// Sugiere activamente funciones no utilizadas
const unusedFeatures = identifyUnusedFeatures(profile);
return <DiscoveryHints features={unusedFeatures} />;
```

### 3. Manual Override

```tsx
// Usuario puede anular clasificación automática
await setManualLevel(UserExperienceLevel.ADVANCED, "user_preference");
```

### 4. Progressive Disclosure

```tsx
// Muestra progreso hacia siguiente nivel
<ProgressIndicator
  current={currentScore}
  nextLevel={nextLevel}
  canAdvance={canAdvance}
/>
```

## 🔄 Flujo de Adaptación

### 1. Inicialización

```python
# Crear perfil con nivel principiante por defecto
profile = UserProfile(
    user_id=user_id,
    experience_level=UserExperienceLevel.ABSOLUTE_BEGINNER,
    auto_adaptation_enabled=True
)
```

### 2. Tracking de Interacciones

```python
# Cada interacción actualiza el perfil
interaction = track_user_interaction(
    user_id=user_id,
    interaction_type=InteractionType.FEATURE_USE,
    interaction_data={'feature': 'advanced_analytics'}
)
```

### 3. Recálculo Periódico

```python
# Cada 7 días, recalcular nivel si no hay override manual
if should_recalculate_level(profile):
    new_level = calculate_experience_level(profile)
    if new_level != profile.experience_level:
        transition_user_level(profile, new_level)
```

### 4. Dashboard Adaptativo

```python
# Generar configuración personalizada
dashboard = generate_adaptive_dashboard(
    user_profile=profile,
    include_discovery_hints=True,
    include_escape_hatch=True
)
```

## 📈 Métricas de Éxito

### Métricas de Engagement

- Tiempo promedio de sesión por nivel
- Frecuencia de uso de funciones avanzadas
- Tasa de utilización de discovery hints

### Métricas Anti-Sesgo

- Frecuencia de uso del Advanced Mode Toggle
- Tasa de manual overrides por nivel
- Distribución de transiciones de nivel (up vs down)

### Métricas de Satisfacción

- Feedback de usuarios sobre relevancia del dashboard
- Tasa de descubrimiento de nuevas funciones
- Tiempo hasta adopción de funciones sugeridas

## 🛠️ Implementación y Despliegue

### 1. Inicialización del Sistema

```bash
# Ejecutar script de inicialización
python backend/initialize_adaptive_system.py
```

### 2. Configuración Frontend

```tsx
// Envolver aplicación con contexto adaptativo
<AdaptationProvider>
  <App />
</AdaptationProvider>
```

### 3. Monitoreo

```python
# Dashboard administrativo para monitorear adaptación
admin_metrics = get_adaptation_metrics()
print(f"Usuarios por nivel: {admin_metrics.distribution}")
print(f"Transiciones recientes: {admin_metrics.recent_transitions}")
```

## 🚨 Consideraciones Críticas

### Privacidad y Transparencia

- Usuario siempre puede ver su puntuación y criterios
- Datos de comportamiento se usan solo para personalización
- Usuario puede deshabilitar adaptación automática

### Equidad y Accesibilidad

- Ninguna funcionalidad es permanentemente inaccesible
- Sistema favorece revealing over hiding
- Considerar usuarios con diferentes patrones de uso

### Mantenimiento y Evolución

- Algoritmo de puntuación debe ser ajustable
- Nuevas funciones deben incluir criterios de visibilidad
- Feedback loop continuo para mejorar clasificación

## 📚 Documentación para Desarrolladores

### Añadir Nueva Funcionalidad

```python
# 1. Definir criterios de visibilidad
def should_show_new_feature(profile: UserProfile) -> bool:
    return profile.experience_level in [
        UserExperienceLevel.ADVANCED,
        UserExperienceLevel.ELITE_ATHLETE
    ]

# 2. Registrar en configuraciones de dashboard
feature_config = {
    'feature_id': 'new_advanced_feature',
    'min_level': UserExperienceLevel.ADVANCED,
    'discovery_hint': 'Try the new advanced feature for deeper insights'
}
```

### Personalizar Algoritmo de Scoring

```python
# Modificar pesos en UserAdaptationService
SCORING_WEIGHTS = {
    "technical_experience": 0.40,  # Aumentar peso técnico
    "training_commitment": 0.30,   # Reducir peso de compromiso
    "needs_sophistication": 0.30,
}
```

Este sistema garantiza que **nunca** un usuario quede atrapado en una vista que no satisfaga sus necesidades, mientras que simultáneamente proporciona una experiencia optimizada para su nivel de experiencia actual.
