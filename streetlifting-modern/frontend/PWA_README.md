# MPDS Streetlifting - Progressive Web App (PWA)

## ¿Qué es una PWA?

Una Progressive Web App (PWA) es una aplicación web que puede instalarse en dispositivos móviles y funcionar como una aplicación nativa, con características como:

- **Instalación**: Se puede agregar al escritorio o pantalla de inicio
- **Funcionamiento offline**: Funciona sin conexión a internet
- **Notificaciones push**: Recibe notificaciones como una app nativa
- **Actualizaciones automáticas**: Se actualiza automáticamente
- **Experiencia nativa**: Se ve y se siente como una aplicación móvil

## Características PWA de MPDS

### 🎯 Instalación

- **Android**: Aparecerá un banner de instalación automáticamente
- **iOS**: Usar el botón "Compartir" y seleccionar "Agregar a pantalla de inicio"
- **Desktop**: Aparecerá un botón de instalación en la barra de direcciones

### 📱 Funcionamiento Offline

- La aplicación funciona completamente sin conexión después de la primera carga
- Los datos se sincronizan automáticamente cuando vuelve la conexión
- Cache inteligente de recursos estáticos

### 🔔 Notificaciones

- Notificaciones de recordatorios de entrenamiento
- Notificaciones de logros y récords
- Notificaciones de actualizaciones de la aplicación

### ⚡ Rendimiento

- Carga instantánea después de la instalación
- Actualizaciones automáticas en segundo plano
- Optimización de recursos para dispositivos móviles

## Instalación en Dispositivos

### Android (Chrome)

1. Abre la aplicación en Chrome
2. Aparecerá un banner "Instalar MPDS"
3. Toca "Instalar"
4. La app se agregará a tu pantalla de inicio

### iOS (Safari)

1. Abre la aplicación en Safari
2. Toca el botón "Compartir" (cuadrado con flecha)
3. Selecciona "Agregar a pantalla de inicio"
4. Confirma la instalación

### Desktop (Chrome/Edge)

1. Abre la aplicación en el navegador
2. Aparecerá un icono de instalación en la barra de direcciones
3. Haz clic en el icono para instalar

## Características Técnicas

### Service Worker

- Cache de recursos estáticos
- Sincronización en segundo plano
- Manejo de conexiones offline

### Manifest

- Configuración de la aplicación
- Iconos en múltiples tamaños
- Colores de tema y fondo
- Orientación preferida

### Cache Strategy

- **Network First**: Para datos de API
- **Cache First**: Para recursos estáticos
- **Stale While Revalidate**: Para contenido dinámico

## Desarrollo y Testing

### Generar Iconos

```bash
npm run generate-icons
```

### Testing PWA

1. Usa Chrome DevTools > Application > Manifest
2. Verifica el Service Worker en Application > Service Workers
3. Prueba el funcionamiento offline
4. Testea la instalación en dispositivos reales

### Lighthouse Audit

1. Abre Chrome DevTools
2. Ve a la pestaña Lighthouse
3. Selecciona "Progressive Web App"
4. Ejecuta el audit

## Troubleshooting

### La app no se instala

- Verifica que estés usando HTTPS (requerido para PWA)
- Asegúrate de que el manifest esté correctamente configurado
- Revisa que el Service Worker esté registrado

### No funciona offline

- Verifica que el Service Worker esté activo
- Revisa la estrategia de cache
- Asegúrate de que los recursos estén siendo cacheados

### Las notificaciones no aparecen

- Verifica los permisos del navegador
- Asegúrate de que el Service Worker maneje los eventos de push
- Revisa la configuración de notificaciones

## Recursos Adicionales

- [MDN Web Docs - Progressive Web Apps](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
- [Web.dev - PWA](https://web.dev/progressive-web-apps/)
- [Chrome DevTools - PWA](https://developers.google.com/web/tools/chrome-devtools/progressive-web-apps)

## Soporte

Para problemas específicos de PWA:

1. Revisa la consola del navegador para errores
2. Verifica el estado del Service Worker
3. Comprueba la configuración del manifest
4. Testea en diferentes dispositivos y navegadores
