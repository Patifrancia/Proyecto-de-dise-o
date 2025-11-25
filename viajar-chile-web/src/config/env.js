/**
 * Configuración de variables de entorno
 * 
 * Para desarrollo local, crea un archivo .env en la raíz del proyecto con:
 * VITE_API_URL=http://localhost:3000
 * VITE_GOOGLE_CLIENT_ID=tu-google-client-id
 * VITE_GOOGLE_PLACES_API_KEY=tu-google-places-api-key
 * 
 * Para producción (Vercel), configura estas variables en el dashboard de Vercel
 */

// Normalizar la URL de la API (remover barras finales)
export const getApiUrl = () => {
  const url = import.meta.env.VITE_API_URL;
  if (!url) {
    // En desarrollo, usar localhost por defecto
    if (import.meta.env.DEV) {
      return "http://localhost:3000";
    }
    // En producción, lanzar error si no está configurado
    throw new Error("VITE_API_URL no está configurada. Configúrala en las variables de entorno de Vercel.");
  }
  return url.replace(/\/+$/, ""); // Remover barras finales
};

export const API_URL = getApiUrl();

export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
export const GOOGLE_PLACES_API_KEY = import.meta.env.VITE_GOOGLE_PLACES_API_KEY;

