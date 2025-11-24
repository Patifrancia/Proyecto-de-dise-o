// src/componentes/HomeSearchPlace.jsx
import { useState, useRef, useEffect } from "react";
import { Search, MapPin, Loader2, X } from "lucide-react";
import { i18n } from "../i18n";

const GOOGLE_PLACES_API_KEY = import.meta.env.VITE_GOOGLE_PLACES_API_KEY;

export default function HomeSearchPlace({ onPlaceSelect }) {
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

  // Cargar Google Maps API
  useEffect(() => {
    if (!GOOGLE_PLACES_API_KEY) {
      console.error("VITE_GOOGLE_PLACES_API_KEY no está configurado");
      setError("API Key no configurada");
      return;
    }

    // Si ya existe el script
    if (window.google?.maps?.places?.AutocompleteService) {
      initializeAutocomplete();
      return;
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_PLACES_API_KEY}&libraries=places&language=es`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      console.log("✓ Google Maps script cargado");
      setTimeout(initializeAutocomplete, 100);
    };
    script.onerror = () => {
      console.error("✗ Error cargando Google Maps script");
      setError("Error cargando API de Google Maps");
    };
    document.head.appendChild(script);
  }, []);

  const initializeAutocomplete = () => {
    try {
      if (!window.google?.maps?.places?.AutocompleteService) {
        console.error("✗ AutocompleteService no disponible");
        setError("AutocompleteService no disponible");
        return;
      }
      
      autocompleteServiceRef.current =
        new window.google.maps.places.AutocompleteService();
      
      if (window.google.maps.places.PlacesService) {
        placesServiceRef.current = new window.google.maps.places.PlacesService(
          document.createElement("div")
        );
      }
      
      setIsGoogleLoaded(true);
      setError("");
      console.log("✓ Google Autocomplete inicializado correctamente");
    } catch (err) {
      console.error("✗ Error inicializando Autocomplete:", err);
      setError("Error inicializando API: " + err.message);
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
        console.log("Buscando:", query);
        autocompleteServiceRef.current.getPlacePredictions(
          {
            input: query,
            componentRestrictions: { country: "cl" },
            language: "es",
            types: ["geocode"],
          },
          (predictions, status) => {
            setLoading(false);

            console.log("Estado:", status, "Predicciones:", predictions?.length || 0);

            if (status === "OK" && predictions) {
              console.log("✓ Búsqueda exitosa");
              setSuggestions(predictions);
              setShowSuggestions(true);
              setError("");
            } else if (status === "ZERO_RESULTS") {
              console.log("Sin resultados para:", query);
              setSuggestions([]);
              setShowSuggestions(true);
              setError("");
            } else if (status === "REQUEST_DENIED") {
              console.error("✗ REQUEST_DENIED - Verifica la API key y que Places API esté activada");
              setError("API Key no válida o Places API no activada");
              setSuggestions([]);
            } else if (status === "OVER_QUERY_LIMIT") {
              console.error("✗ OVER_QUERY_LIMIT");
              setError("Límite de búsquedas excedido");
              setSuggestions([]);
            } else {
              console.warn("Estado desconocido:", status);
              setError("Error en la búsqueda: " + status);
              setSuggestions([]);
            }
          }
        );
      } catch (err) {
        console.error("✗ Error en getPlacePredictions:", err);
        setError("Error: " + err.message);
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

  // Manejo de teclado
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        
        // Si hay sugerencias y una seleccionada, usarla
        if (showSuggestions && selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSelect(suggestions[selectedIndex]);
          return;
        }
        
        // Si hay sugerencias pero ninguna seleccionada, seleccionar la primera
        if (showSuggestions && suggestions.length > 0) {
          handleSelect(suggestions[0]);
          return;
        }
        
        // Si el usuario escribió algo pero no hay sugerencias, intentar buscar igual
        if (query.trim() && !showSuggestions) {
          const placeData = {
            id: query.toLowerCase().replace(/\s+/g, "-"),
            name: query,
            address: query,
            location: query,
          };
          console.log("Lugar buscado sin sugerencias:", query);
          if (onPlaceSelect) {
            onPlaceSelect(placeData);
          }
        }
        return;
      }

      if (!showSuggestions || suggestions.length === 0) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev < suggestions.length - 1 ? prev + 1 : 0
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev > 0 ? prev - 1 : suggestions.length - 1
          );
          break;
        case "Escape":
          setShowSuggestions(false);
          break;
        default:
          break;
      }
    };

    inputRef.current?.addEventListener("keydown", handleKeyDown);
    return () => inputRef.current?.removeEventListener("keydown", handleKeyDown);
  }, [showSuggestions, suggestions, selectedIndex, query, onPlaceSelect]);

  const handleSelect = (prediction) => {
    console.log("Lugar seleccionado:", prediction.description);
    setQuery(prediction.description);
    setShowSuggestions(false);
    setSelectedIndex(-1);

    // Crear objeto de lugar con datos básicos
    const placeData = {
      id: prediction.place_id,
      name: prediction.structured_formatting?.main_text || prediction.description,
      address: prediction.description,
      location: prediction.description,
    };

    // Si tenemos PlacesService, obtener detalles adicionales
    if (placesServiceRef.current && prediction.place_id) {
      try {
        placesServiceRef.current.getDetails(
          {
            placeId: prediction.place_id,
            fields: ["name", "formatted_address", "geometry", "place_id", "photos", "types", "url"],
          },
          (place, status) => {
            if (status === "OK" && place) {
              console.log("✓ Detalles obtenidos:", place);
              
              // Crear descripción basada en los types
              let placeType = "Lugar";
              if (place.types) {
                if (place.types.includes("locality")) placeType = "Ciudad";
                else if (place.types.includes("administrative_area_level_1")) placeType = "Región";
                else if (place.types.includes("country")) placeType = "País";
                else if (place.types.includes("tourist_attraction")) placeType = "Atracción turística";
              }
              
              // Crear descripción breve con la dirección
              const addressParts = place.formatted_address.split(",").map(s => s.trim());
              let description = "";
              if (addressParts.length >= 2) {
                // "Ciudad, Región, País" o similar
                description = `${place.name} es ${placeType.toLowerCase()} ubicado en ${addressParts.slice(1).join(", ")}`;
              } else {
                description = `${place.name} es un ${placeType.toLowerCase()} en Chile`;
              }
              
              const detailedData = {
                ...placeData,
                address: place.formatted_address || prediction.description,
                location: place.formatted_address || prediction.description,
                lat: place.geometry?.location?.lat(),
                lng: place.geometry?.location?.lng(),
                photos: place.photos || [],
                placeType: placeType,
                description: description,
                mapsUrl: place.url || `https://maps.google.com/?q=${encodeURIComponent(place.name)}`,
              };
              if (onPlaceSelect) {
                onPlaceSelect(detailedData);
              }
            } else {
              console.warn("No se pudieron obtener detalles del lugar, usando datos básicos");
              if (onPlaceSelect) {
                onPlaceSelect(placeData);
              }
            }
          }
        );
      } catch (err) {
        console.error("Error obteniendo detalles:", err);
        if (onPlaceSelect) {
          onPlaceSelect(placeData);
        }
      }
    } else {
      // Sin PlacesService, usar solo datos básicos
      console.log("PlacesService no disponible, usando datos básicos");
      if (onPlaceSelect) {
        onPlaceSelect(placeData);
      }
    }
  };

  const handleClear = () => {
    setQuery("");
    setSuggestions([]);
    setShowSuggestions(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query && setSuggestions.length > 0 && setShowSuggestions(true)}
          placeholder={i18n.t("search_placeholder")}
          className="w-full pl-10 pr-10 py-3 bg-white text-gray-900 placeholder-gray-500 border border-gray-300 rounded-2xl shadow-lg backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {loading && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <Loader2 className="w-5 h-5 text-teal-500 animate-spin" />
        </div>
      )}

      {error && (
        <p className="mt-2 text-sm text-red-500">{error}</p>
      )}

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-64 overflow-y-auto">
          {suggestions.map((suggestion, idx) => (
            <button
              key={suggestion.place_id}
              onClick={() => handleSelect(suggestion)}
              className={`w-full text-left px-4 py-3 flex items-start gap-3 border-b last:border-b-0 hover:bg-gray-50 transition ${
                idx === selectedIndex ? "bg-teal-50" : ""
              }`}
            >
              <MapPin className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 truncate">
                  {suggestion.structured_formatting?.main_text || suggestion.description}
                </p>
                <p className="text-sm text-gray-600 truncate">
                  {suggestion.structured_formatting?.secondary_text}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

      {showSuggestions && query && suggestions.length === 0 && !loading && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-50 p-4">
          <p className="text-center text-gray-500 text-sm">
            {i18n.t("search.no_results")}
          </p>
        </div>
      )}
    </div>
  );
}
