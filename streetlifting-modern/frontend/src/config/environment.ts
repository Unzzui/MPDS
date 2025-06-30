// Configuración automática del entorno
export interface EnvironmentConfig {
  apiBaseUrl: string;
  isDevelopment: boolean;
}

// Detectar si estamos en desarrollo
const isDevelopment = import.meta.env.DEV;

// Configurar la URL de la API
let apiBaseUrl: string;

if (isDevelopment) {
  // Desarrollo local - usar la IP específica del usuario para móvil
  const hostname = window.location.hostname;
  
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    // Si estamos en localhost, usar la IP específica para móvil
    apiBaseUrl = 'http://192.168.18.63:8000'; // IP específica del usuario
    console.log('Desarrollo local detectado, usando IP para móvil:', apiBaseUrl);
  } else {
    // Si ya estamos usando una IP, usar la misma
    apiBaseUrl = `http://${hostname}:8000`;
    console.log('Desarrollo con IP detectado:', apiBaseUrl);
  }
} else {
  // Producción (ajustar según tu dominio)
  apiBaseUrl = 'https://api.tudominio.com';
}

export const environment: EnvironmentConfig = {
  apiBaseUrl,
  isDevelopment
};

// Función para actualizar la URL de la API manualmente
export const updateApiBaseUrl = (newUrl: string) => {
  environment.apiBaseUrl = newUrl;
  console.log(`API Base URL actualizada a: ${newUrl}`);
};

// Función para obtener la URL actual
export const getCurrentApiUrl = () => environment.apiBaseUrl; 