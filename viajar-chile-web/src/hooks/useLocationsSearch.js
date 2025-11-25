import { useState, useEffect, useRef } from "react";
import { API_URL } from "../config/env.js";

/**
 * Hook personalizado para búsqueda de ciudades, localidades y pueblos de Chile
 * 
 * Este hook se conecta al endpoint /api/locations/search o /api/ciudades
 * y maneja el estado de carga, errores y resultados de búsqueda.
 * Solo devuelve lugares geográficos, NO alojamientos.
 * 
 * @param {string} query - Texto de búsqueda
 * @param {number} debounceMs - Tiempo de espera antes de buscar (default: 300ms)
 * @returns {Object} - { suggestions, loading, error }
 */
export function useLocationsSearch(query, debounceMs = 300) {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const abortControllerRef = useRef(null);

  useEffect(() => {
    // Limpiar búsqueda anterior si existe
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Si no hay query, limpiar resultados
    if (!query.trim()) {
      setSuggestions([]);
      setLoading(false);
      setError(null);
      return;
    }

    // Crear nuevo AbortController para esta búsqueda
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    // Función asíncrona para realizar la búsqueda
    const performSearch = async () => {
      setLoading(true);
      setError(null);

      try {
        // Usar directamente el endpoint de ciudades (el endpoint /api/locations/search no existe)
        const response = await fetch(
          `${API_URL}/api/ciudades?query=${encodeURIComponent(query)}`,
          { signal }
        );
        
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        // Verificar que la respuesta tenga contenido antes de parsear
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          console.warn("Respuesta no es JSON, usando datos mock");
          const mockLocations = getMockLocations(query);
          if (!signal.aborted) {
            setSuggestions(mockLocations);
            setLoading(false);
          }
          return;
        }

        // Obtener el texto de la respuesta primero para verificar que no esté vacío
        const text = await response.text();
        
        // Si la respuesta está vacía, usar datos mock
        if (!text || text.trim() === "") {
          const mockLocations = getMockLocations(query);
          if (!signal.aborted) {
            setSuggestions(mockLocations);
            setLoading(false);
          }
          return;
        }

        // Intentar parsear el JSON
        let data;
        try {
          data = JSON.parse(text);
        } catch (parseError) {
          console.error("Error al parsear JSON:", parseError);
          console.error("Respuesta recibida:", text.substring(0, 200));
          // Si falla el parsing, usar datos mock
          const mockLocations = getMockLocations(query);
          if (!signal.aborted) {
            setSuggestions(mockLocations);
            setLoading(false);
          }
          return;
        }
        
        // El endpoint /api/ciudades devuelve un array directo
        // El endpoint /api/locations/search podría devolver { items: [...] }
        const items = Array.isArray(data) 
          ? data 
          : (Array.isArray(data?.items) ? data.items : []);

        // Normalizar los datos para el formato esperado
        const normalized = items.map(item => ({
          id: item.id || item.nombre?.toLowerCase().replace(/\s+/g, "-") || `location-${Math.random().toString(36).substr(2, 9)}`,
          name: item.nombre || item.name,
          region: item.region || item.región,
          type: item.tipo || item.type || "Localidad", // Usar el tipo del backend si está disponible
          coordinates: item.lat && item.lon 
            ? { lat: item.lat, lng: item.lon }
            : (item.latitude && item.longitude
              ? { lat: item.latitude, lng: item.longitude }
              : null),
        }));

        // Si hay pocos resultados, complementar con datos mock
        if (normalized.length < 5) {
          const mockLocations = getMockLocations(query);
          const nombresExistentes = new Set(normalized.map(n => n.name.toLowerCase()));
          const adicionales = mockLocations.filter(
            loc => !nombresExistentes.has(loc.name.toLowerCase())
          );
          normalized.push(...adicionales);
        }

        // Ordenar: primero los que empiezan con la búsqueda
        const queryLower = query.toLowerCase();
        normalized.sort((a, b) => {
          const aStarts = a.name.toLowerCase().startsWith(queryLower);
          const bStarts = b.name.toLowerCase().startsWith(queryLower);
          if (aStarts && !bStarts) return -1;
          if (!aStarts && bStarts) return 1;
          return a.name.localeCompare(b.name);
        });

        if (!signal.aborted) {
          setSuggestions(normalized.slice(0, 15)); // Mostrar hasta 15 resultados
          setLoading(false);
        }
      } catch (err) {
        // Ignorar errores de aborto (cuando se cancela la búsqueda)
        if (err.name === "AbortError") {
          return;
        }

        // Si hay error, usar datos mock como fallback
        if (!signal.aborted) {
          console.warn("Error en búsqueda de localidades, usando datos mock:", err);
          
          // Datos mock de ciudades chilenas comunes
          const mockLocations = getMockLocations(query);
          setSuggestions(mockLocations);
          setLoading(false);
          setError(null); // No mostrar error si tenemos datos mock
        }
      }
    };

    // Debounce: esperar antes de buscar
    const timeoutId = setTimeout(performSearch, debounceMs);

    // Cleanup: cancelar timeout y búsqueda si el componente se desmonta o cambia el query
    return () => {
      clearTimeout(timeoutId);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [query, debounceMs]);

  return { suggestions, loading, error };
}

/**
 * Datos mock de ciudades chilenas para usar como fallback
 * @param {string} query - Texto de búsqueda
 * @returns {Array} - Array de localidades que coinciden con la búsqueda
 */
function getMockLocations(query) {
  const queryLower = query.toLowerCase();
  
  // Base de datos expandida con más localidades y pueblos
  const allLocations = [
    // Ciudades principales
    { name: "Santiago", region: "Región Metropolitana", type: "Ciudad", id: "santiago" },
    { name: "Valparaíso", region: "Valparaíso", type: "Ciudad", id: "valparaiso" },
    { name: "Viña del Mar", region: "Valparaíso", type: "Ciudad", id: "vina-del-mar" },
    { name: "Concepción", region: "Biobío", type: "Ciudad", id: "concepcion" },
    { name: "La Serena", region: "Coquimbo", type: "Ciudad", id: "la-serena" },
    { name: "Antofagasta", region: "Antofagasta", type: "Ciudad", id: "antofagasta" },
    { name: "Temuco", region: "La Araucanía", type: "Ciudad", id: "temuco" },
    { name: "Puerto Montt", region: "Los Lagos", type: "Ciudad", id: "puerto-montt" },
    { name: "Punta Arenas", region: "Magallanes", type: "Ciudad", id: "punta-arenas" },
    { name: "Arica", region: "Arica y Parinacota", type: "Ciudad", id: "arica" },
    { name: "Iquique", region: "Tarapacá", type: "Ciudad", id: "iquique" },
    { name: "Calama", region: "Antofagasta", type: "Ciudad", id: "calama" },
    { name: "Valdivia", region: "Los Ríos", type: "Ciudad", id: "valdivia" },
    { name: "Coyhaique", region: "Aysén", type: "Ciudad", id: "coyhaique" },
    
    // Pueblos y localidades turísticas
    { name: "San Pedro de Atacama", region: "Antofagasta", type: "Pueblo", id: "san-pedro-atacama" },
    { name: "Pucón", region: "La Araucanía", type: "Pueblo", id: "pucon" },
    { name: "Villarrica", region: "La Araucanía", type: "Ciudad", id: "villarrica" },
    { name: "Castro", region: "Los Lagos", type: "Ciudad", id: "castro" },
    { name: "Puerto Varas", region: "Los Lagos", type: "Pueblo", id: "puerto-varas" },
    { name: "Frutillar", region: "Los Lagos", type: "Pueblo", id: "frutillar" },
    { name: "Ancud", region: "Los Lagos", type: "Ciudad", id: "ancud" },
    { name: "Puerto Natales", region: "Magallanes", type: "Ciudad", id: "puerto-natales" },
    { name: "Torres del Paine", region: "Magallanes", type: "Localidad", id: "torres-del-paine" },
    { name: "Pichilemu", region: "O'Higgins", type: "Pueblo", id: "pichilemu" },
    { name: "Vicuña", region: "Coquimbo", type: "Pueblo", id: "vicuna" },
    { name: "Pisco Elqui", region: "Coquimbo", type: "Pueblo", id: "pisco-elqui" },
    { name: "Olmué", region: "Valparaíso", type: "Pueblo", id: "olmue" },
    { name: "Zapallar", region: "Valparaíso", type: "Pueblo", id: "zapallar" },
    { name: "Pirque", region: "Región Metropolitana", type: "Pueblo", id: "pirque" },
    { name: "San José de Maipo", region: "Región Metropolitana", type: "Pueblo", id: "san-jose-de-maipo" },
    { name: "Colina", region: "Región Metropolitana", type: "Pueblo", id: "colina" },
    { name: "Santa Cruz", region: "O'Higgins", type: "Pueblo", id: "santa-cruz" },
    { name: "Constitución", region: "Maule", type: "Ciudad", id: "constitucion" },
    { name: "Curicó", region: "Maule", type: "Ciudad", id: "curico" },
    { name: "Talca", region: "Maule", type: "Ciudad", id: "talca" },
    { name: "Chillán", region: "Ñuble", type: "Ciudad", id: "chillan" },
    { name: "Los Ángeles", region: "Biobío", type: "Ciudad", id: "los-angeles" },
    { name: "Angol", region: "La Araucanía", type: "Ciudad", id: "angol" },
    { name: "Lautaro", region: "La Araucanía", type: "Pueblo", id: "lautaro" },
    { name: "Panguipulli", region: "Los Ríos", type: "Pueblo", id: "panguipulli" },
    { name: "Río Bueno", region: "Los Ríos", type: "Pueblo", id: "rio-bueno" },
    { name: "Chonchi", region: "Los Lagos", type: "Pueblo", id: "chonchi" },
    { name: "Quellón", region: "Los Lagos", type: "Pueblo", id: "quellon" },
    { name: "Dalcahue", region: "Los Lagos", type: "Pueblo", id: "dalcahue" },
    { name: "Achao", region: "Los Lagos", type: "Pueblo", id: "achao" },
    { name: "Puerto Aysén", region: "Aysén", type: "Pueblo", id: "puerto-aysen" },
    { name: "Chile Chico", region: "Aysén", type: "Pueblo", id: "chile-chico" },
    { name: "Cochrane", region: "Aysén", type: "Pueblo", id: "cochrane" },
    { name: "Villa O'Higgins", region: "Aysén", type: "Pueblo", id: "villa-ohiggins" },
    { name: "Tortel", region: "Aysén", type: "Pueblo", id: "tortel" },
    { name: "Porvenir", region: "Magallanes", type: "Pueblo", id: "porvenir" },
    { name: "Puerto Williams", region: "Magallanes", type: "Pueblo", id: "puerto-williams" },
  ];

  // Filtrar y ordenar resultados
  const filtered = allLocations
    .filter(loc => 
      loc.name.toLowerCase().includes(queryLower) ||
      loc.region.toLowerCase().includes(queryLower) ||
      loc.type.toLowerCase().includes(queryLower)
    )
    .sort((a, b) => {
      // Priorizar los que empiezan con la búsqueda
      const aStarts = a.name.toLowerCase().startsWith(queryLower);
      const bStarts = b.name.toLowerCase().startsWith(queryLower);
      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;
      return a.name.localeCompare(b.name);
    })
    .map(loc => ({
      id: loc.id,
      name: loc.name,
      region: loc.region,
      type: loc.type,
    }));

  return filtered.slice(0, 15); // Devolver hasta 15 resultados
}

