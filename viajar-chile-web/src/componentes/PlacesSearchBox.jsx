import { useState, useRef, useEffect } from "react";
import { Search, MapPin, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const GOOGLE_PLACES_API_KEY = import.meta.env.VITE_GOOGLE_PLACES_API_KEY;

/**
 * Componente de búsqueda con Google Places Autocomplete
 * 
 * @param {string} placeholder - Texto del placeholder
 * @param {Function} onSelect - Callback cuando se selecciona un lugar
 * @param {string} className - Clases CSS adicionales
 * @param {string} size - Tamaño del input ("lg" o "md")
 */
export default function PlacesSearchBox({ 
  placeholder = "Busca lugares en Chile...", 
  onSelect,
  className = "",
  size = "lg"
}) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);
  const inputRef = useRef(null);
  const containerRef = useRef(null);
  const autocompleteServiceRef = useRef(null);
  const placesServiceRef = useRef(null);
  const navigate = useNavigate();

  // Cargar Google Maps API
  useEffect(() => {
    if (!GOOGLE_PLACES_API_KEY) {
      console.warn("VITE_GOOGLE_PLACES_API_KEY no está configurado");
      setError("API key de Google Places no configurada");
      return;
    }

    // Verificar si ya está cargado
    if (window.google?.maps?.places) {
      initializeAutocomplete();
      return;
    }

    // Verificar si el script ya existe
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
    if (existingScript) {
      existingScript.addEventListener('load', initializeAutocomplete);
      if (window.google?.maps?.places) {
        initializeAutocomplete();
      }
      return;
    }

    // Cargar el script de Google Maps
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_PLACES_API_KEY}&libraries=places&language=es&region=cl`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      initializeAutocomplete();
    };
    script.onerror = () => {
      setError("Error al cargar Google Maps API");
      setLoading(false);
    };
    document.head.appendChild(script);

    return () => {
      // Limpiar si es necesario
    };
  }, []);

  const initializeAutocomplete = () => {
    try {
      if (window.google?.maps?.places) {
        autocompleteServiceRef.current = new window.google.maps.places.AutocompleteService();
        placesServiceRef.current = new window.google.maps.places.PlacesService(
          document.createElement("div")
        );
        setIsGoogleLoaded(true);
        setError("");
      } else {
        setError("Google Maps API no se cargó correctamente");
      }
    } catch (err) {
      console.error("Error inicializando Autocomplete:", err);
      setError("Error al inicializar el servicio de búsqueda");
    }
  };

  // Buscar lugares cuando cambia el query
  useEffect(() => {
    if (!isGoogleLoaded || !autocompleteServiceRef.current || !query.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");
    const timeoutId = setTimeout(() => {
      if (!autocompleteServiceRef.current) {
        setLoading(false);
        return;
      }

      try {
        autocompleteServiceRef.current.getPlacePredictions(
          {
            input: query,
            componentRestrictions: { country: "cl" }, // Solo Chile
            language: "es",
            types: ["(cities)", "geocode"], // Ciudades y direcciones
          },
          (predictions, status) => {
            setLoading(false);
            
            if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
              setSuggestions(predictions);
              setShowSuggestions(true);
              setError("");
            } else if (status === window.google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
              setSuggestions([]);
              setShowSuggestions(true);
              setError("");
            } else if (status === window.google.maps.places.PlacesServiceStatus.REQUEST_DENIED) {
              setError("Acceso denegado. Verifica tu API key de Google Places");
              setSuggestions([]);
            } else if (status === window.google.maps.places.PlacesServiceStatus.OVER_QUERY_LIMIT) {
              setError("Límite de consultas excedido");
              setSuggestions([]);
            } else {
              console.warn("Estado de Places API:", status);
              setSuggestions([]);
            }
          }
        );
      } catch (err) {
        console.error("Error en getPlacePredictions:", err);
        setError("Error al buscar lugares");
        setLoading(false);
        setSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, isGoogleLoaded]);

  // Cerrar sugerencias al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (prediction) => {
    setQuery(prediction.description);
    setShowSuggestions(false);
    setSelectedIndex(-1);

    // Obtener detalles del lugar
    if (placesServiceRef.current && prediction.place_id) {
      placesServiceRef.current.getDetails(
        {
          placeId: prediction.place_id,
          fields: ["name", "formatted_address", "geometry", "place_id"],
        },
        (place, status) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK && place) {
            const placeData = {
              id: place.place_id,
              name: place.name || prediction.description,
              address: place.formatted_address || prediction.description,
              location: place.formatted_address || prediction.description,
              lat: place.geometry?.location?.lat(),
              lng: place.geometry?.location?.lng(),
            };

            if (onSelect) {
              onSelect(placeData);
            } else {
              navigate(`/buscar?q=${encodeURIComponent(placeData.name)}`);
            }
          } else {
            // Fallback: usar solo la predicción
            const placeData = {
              id: prediction.place_id,
              name: prediction.description,
              address: prediction.description,
              location: prediction.description,
            };

            if (onSelect) {
              onSelect(placeData);
            } else {
              navigate(`/buscar?q=${encodeURIComponent(prediction.description)}`);
            }
          }
        }
      );
    } else {
      // Fallback sin detalles
      const placeData = {
        id: prediction.place_id || `place-${Date.now()}`,
        name: prediction.description,
        address: prediction.description,
        location: prediction.description,
      };

      if (onSelect) {
        onSelect(placeData);
      } else {
        navigate(`/buscar?q=${encodeURIComponent(prediction.description)}`);
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      return;
    }

    if (selectedIndex >= 0 && suggestions[selectedIndex]) {
      handleSelect(suggestions[selectedIndex]);
    } else if (suggestions.length > 0) {
      handleSelect(suggestions[0]);
    } else {
      setShowSuggestions(false);
      if (onSelect) {
        onSelect({
          name: trimmedQuery,
          location: trimmedQuery,
          id: `search-${trimmedQuery.toLowerCase().replace(/\s+/g, "-")}`,
        });
      } else {
        navigate(`/buscar?q=${encodeURIComponent(trimmedQuery)}`);
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex(prev =>
        prev < suggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
      setSelectedIndex(-1);
    } else if (e.key === "Enter") {
      if (query.trim()) {
        return; // Let the form handle the submit
      }
    }
  };

  const inputSizeClasses = size === "lg" 
    ? "px-6 py-4 text-lg" 
    : "px-4 py-2.5 text-base";

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowSuggestions(true);
              setSelectedIndex(-1);
            }}
            onFocus={() => {
              if (suggestions.length > 0) {
                setShowSuggestions(true);
              }
            }}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className={`w-full pl-12 pr-14 ${inputSizeClasses} rounded-2xl border-2 border-gray-200 bg-white text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 transition-all shadow-lg`}
            aria-label="Buscar lugar"
          />
          {loading && (
            <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-600 w-5 h-5 animate-spin z-10" />
          )}
        </div>
      </form>

      {showSuggestions && (
        <div className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="px-4 py-8 text-center text-gray-500">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
              <p className="text-sm">Buscando lugares...</p>
            </div>
          ) : error ? (
            <div className="px-4 py-8 text-center text-red-500">
              <p className="text-sm">{error}</p>
            </div>
          ) : suggestions.length > 0 ? (
            <div className="max-h-96 overflow-y-auto">
              {suggestions.map((prediction, idx) => (
                <button
                  key={prediction.place_id || idx}
                  type="button"
                  onClick={() => handleSelect(prediction)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-emerald-50 transition-colors ${
                    selectedIndex === idx ? "bg-emerald-50" : ""
                  }`}
                >
                  <MapPin className="text-emerald-600 w-5 h-5 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 truncate">
                      {prediction.structured_formatting?.main_text || prediction.description}
                    </div>
                    {prediction.structured_formatting?.secondary_text && (
                      <div className="text-sm text-gray-500 truncate">
                        {prediction.structured_formatting.secondary_text}
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          ) : query.trim() ? (
            <div className="px-4 py-8 text-center text-gray-500">
              <p className="text-sm">No se encontraron lugares</p>
              <p className="text-xs mt-1">Intenta con otro término de búsqueda</p>
            </div>
          ) : null}
        </div>
      )}

      {!GOOGLE_PLACES_API_KEY && (
        <div className="mt-2 text-xs text-yellow-600 bg-yellow-50 px-3 py-2 rounded-lg">
          ⚠️ Google Places API no configurada. Agrega VITE_GOOGLE_PLACES_API_KEY en .env
        </div>
      )}
    </div>
  );
}

