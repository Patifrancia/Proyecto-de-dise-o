import { useState, useEffect, useRef } from "react";

/**
 * Hook personalizado para búsqueda de estadías (hoteles, cabañas, hostales, airbnbs)
 * 
 * Este hook se conecta al endpoint /api/stays/search (o /api/search como fallback)
 * y maneja el estado de carga, errores y resultados de búsqueda.
 * 
 * @param {string} query - Texto de búsqueda
 * @param {number} debounceMs - Tiempo de espera antes de buscar (default: 300ms)
 * @returns {Object} - { suggestions, loading, error }
 */
export function useStaysSearch(query, debounceMs = 300) {
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
        // Intentar primero con el endpoint específico de estadías
        // Si no existe, usar /api/search como fallback
        let response = await fetch(
          `/api/stays/search?q=${encodeURIComponent(query)}`,
          { signal }
        );

        // Si el endpoint no existe (404) o hay otro error, usar el endpoint genérico
        if (!response.ok) {
          // Intentar con el endpoint genérico como fallback
          response = await fetch(
            `/api/search?q=${encodeURIComponent(query)}`,
            { signal }
          );
          
          // Si el fallback también falla, lanzar error
          if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
          }
        }

        // Verificar que la respuesta tenga contenido antes de parsear
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          console.warn("Respuesta no es JSON, usando datos vacíos");
          if (!signal.aborted) {
            setSuggestions([]);
            setLoading(false);
          }
          return;
        }

        // Obtener el texto de la respuesta primero para verificar que no esté vacío
        const text = await response.text();
        
        // Si la respuesta está vacía, usar array vacío
        if (!text || text.trim() === "") {
          if (!signal.aborted) {
            setSuggestions([]);
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
          throw new Error("Respuesta del servidor no es JSON válido");
        }

        // Extraer items del response
        const items = Array.isArray(data?.items) ? data.items : [];
        
        // Normalizar los datos para el formato esperado
        const normalized = items.map(item => ({
          id: item.id || `${item.provider || "stay"}-${item.name?.toLowerCase().replace(/\s+/g, "-")}`,
          name: item.name,
          location: item.city || item.address || item.location || item.region,
          region: item.region || item.city,
          type: item.type || getStayType(item.provider),
          provider: item.provider,
          price: item.price,
          currency: item.currency || "CLP",
          photo: item.photo,
          score: item.score || item.rating,
          url: item.url,
        }));

        if (!signal.aborted) {
          setSuggestions(normalized.slice(0, 8)); // Limitar a 8 resultados
          setLoading(false);
        }
      } catch (err) {
        // Ignorar errores de aborto (cuando se cancela la búsqueda)
        if (err.name === "AbortError") {
          return;
        }

        // Manejar otros errores
        if (!signal.aborted) {
          console.error("Error en búsqueda de estadías:", err);
          
          // Si es un error de red, mostrar mensaje más amigable
          const errorMessage = err.message?.includes("JSON") 
            ? "Error al procesar la respuesta del servidor"
            : err.message || "Error al buscar estadías";
          
          setError(errorMessage);
          setSuggestions([]);
          setLoading(false);
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
 * Determina el tipo de estadía basado en el proveedor
 * @param {string} provider - Nombre del proveedor (booking, airbnb, tripadvisor, etc.)
 * @returns {string} - Tipo de estadía
 */
function getStayType(provider) {
  const typeMap = {
    booking: "Hotel",
    airbnb: "Airbnb",
    tripadvisor: "Hotel",
    demo: "Hotel",
  };
  return typeMap[provider?.toLowerCase()] || "Alojamiento";
}

