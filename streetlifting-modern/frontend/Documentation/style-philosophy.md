# Filosofía de Estilos de la App Streetlifting

## Enfoque General

La aplicación Streetlifting adopta una estética inspirada en terminales modernas, combinando la simplicidad y contraste de los entornos de consola con detalles visuales actuales. El objetivo es ofrecer una experiencia visual única, profesional y funcional, que transmita tecnología, claridad y energía.

## Principios Clave

- **Terminal Moderno:**

  - Paleta oscura predominante, con acentos neón verde (#00ff88) para resaltar acciones y datos clave.
  - Tipografías monoespaciadas y sans-serif para reforzar la sensación "tech" y mejorar la legibilidad.
  - Bordes, sombras y efectos sutiles para dar profundidad sin perder la limpieza visual.

- **Mobile-First:**

  - Todos los estilos y layouts están diseñados primero para dispositivos móviles.
  - Uso extensivo de `rem`, `vw`, y variables CSS para asegurar escalabilidad y adaptabilidad.
  - Grillas y flexbox para layouts responsivos y adaptables a cualquier pantalla.
  - **Optimización para pantallas pequeñas:** Para anchos menores a `480px`, se deben aplicar reglas `@media` específicas para asegurar la usabilidad. Esto incluye:
    - Forzar layouts de 2 columnas (`grid-template-columns: repeat(2, 1fr)`).
    - Reducir el tamaño de las fuentes, paddings y gaps.
    - Simplificar componentes complejos.

- **Consistencia y Modularidad:**

  - Variables CSS globales para colores, tipografías, espaciados y radios.
  - Componentes reutilizables y clases utilitarias para botones, tarjetas, inputs y tablas.
  - Animaciones y transiciones suaves para mejorar la experiencia sin distraer.

- **Accesibilidad:**

  - Contrastes altos y fuentes legibles.
  - Estados de foco y selección bien definidos.
  - Navegación clara y botones grandes para interacción táctil.

- **Sin Emojis:**
  - Para mantener la estética profesional y de terminal, **no se deben utilizar emojis** en los textos, botones, iconos o cualquier elemento visual de la interfaz.
  - Se recomienda el uso de iconografía SVG o tipográfica minimalista si se requiere reforzar visualmente alguna acción o sección.

## Estructura de Estilos

- **global.css:** Variables, resets y utilidades globales.
- **[Page].css:** Estilos específicos para cada página, siguiendo la misma paleta y principios.
- **Componentes:** Cada componente importante puede tener su propio archivo de estilos si es necesario.

## Ejemplo de Variables CSS

```css
:root {
  --bg-primary: #0a0a0a;
  --bg-secondary: #1a1a1a;
  --accent-primary: #00ff88;
  --text-primary: #e0e0e0;
  --font-mono: "JetBrains Mono", monospace;
  --font-sans: "Inter", sans-serif;
  /* ... */
}
```

## Inspiración Visual

- Consolas modernas, terminales de desarrollador, dashboards de sistemas.
- Apps de productividad y monitoreo con enfoque "dark mode".

## Buenas Prácticas

- Mantener la coherencia visual en todos los componentes.
- Priorizar la legibilidad y la usabilidad.
- Usar las utilidades y variables antes de crear nuevos estilos.
- Probar siempre en móvil y desktop.

---

Streetlifting App — Diseño terminal, moderno y funcional para atletas urbanos.
