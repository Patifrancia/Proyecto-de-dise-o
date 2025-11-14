import { useState, useRef, useEffect } from "react";
import { Search, MapPin, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocationsSearch } from "../hooks/useLocationsSearch";

/**
 * Componente de búsqueda especializado para ciudades, localidades y pueblos de Chile
 * 
 * Este componente se conecta al endpoint /api/locations/search o /api/ciudades
 * y muestra sugerencias de lugares geográficos mientras el usuario escribe.
 * NO muestra alojamientos, solo lugares geográficos.
 * 
 * @param {string} placeholder - Texto del placeholder
 * @param {Function} onSelect - Callback cuando se selecciona una localidad
 * @param {string} className - Clases CSS adicionales
 * @param {string} size - Tamaño del input ("lg" o "md")
 */
export default function LocationsSearchBox({ 
  placeholder = "Busca ciudades, pueblos, localidades...", 
  onSelect,
  className = "",
  size = "md"
}) {
  const [query, setQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  // Usar el hook personalizado para búsqueda de localidades
  const { suggestions, loading, error } = useLocationsSearch(query);

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

  /**
   * Maneja la selección de una localidad
   * @param {Object} location - Objeto de la localidad seleccionada
   */
  const handleSelect = (location) => {
    setQuery(location.name || "");
    setShowSuggestions(false);
    setSelectedIndex(-1);
    
    // Llamar al callback si existe
    if (onSelect) {
      onSelect(location);
    }
  };

  /**
   * Maneja el submit del formulario
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedIndex >= 0 && suggestions[selectedIndex]) {
      handleSelect(suggestions[selectedIndex]);
    } else if (query.trim() && suggestions.length > 0) {
      // Si hay sugerencias pero no se seleccionó ninguna, tomar la primera
      handleSelect(suggestions[0]);
    }
  };

  /**
   * Maneja las teclas de navegación (flechas, escape)
   */
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
    } else if (e.key === "Enter" && selectedIndex >= 0 && suggestions[selectedIndex]) {
      e.preventDefault();
      handleSelect(suggestions[selectedIndex]);
    }
  };

  const inputSizeClasses = size === "lg" 
    ? "px-6 py-4 text-lg" 
    : "px-4 py-2.5 text-base";

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowSuggestions(true);
              setSelectedIndex(-1);
            }}
            onFocus={() => setShowSuggestions(true)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className={`w-full pl-12 pr-14 ${inputSizeClasses} rounded-2xl border-2 border-gray-200 bg-white focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 transition-all shadow-soft`}
            aria-label="Buscar localidad"
          />
          {loading && (
            <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-600 w-5 h-5 animate-spin" />
          )}
        </div>
      </form>

      {/* Mostrar sugerencias */}
      <AnimatePresence>
        {showSuggestions && query.trim() && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 w-full mt-2 bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden"
          >
            {loading ? (
              <div className="px-4 py-8 text-center text-gray-500">
                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                <p className="text-sm">Buscando localidades...</p>
              </div>
            ) : error ? (
              <div className="px-4 py-8 text-center text-red-500">
                <p className="text-sm">{error}</p>
              </div>
            ) : suggestions.length > 0 ? (
              <div className="max-h-[500px] overflow-y-auto">
                <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-200">
                  {suggestions.length} {suggestions.length === 1 ? "resultado" : "resultados"} encontrado{suggestions.length === 1 ? "" : "s"}
                </div>
                {suggestions.map((location, idx) => (
                  <button
                    key={location.id || idx}
                    type="button"
                    onClick={() => handleSelect(location)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-emerald-50 transition-colors ${
                      selectedIndex === idx ? "bg-emerald-50" : ""
                    }`}
                  >
                    <MapPin className="text-emerald-600 w-5 h-5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate flex items-center gap-2">
                        <span>{location.name}</span>
                        {location.type && (
                          <span className="text-xs px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full font-medium shrink-0">
                            {location.type}
                          </span>
                        )}
                      </div>
                      {location.region && (
                        <div className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                          <span>{location.region}</span>
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="px-4 py-8 text-center text-gray-500">
                <p className="text-sm">No se encontraron localidades</p>
                <p className="text-xs mt-1">Intenta con otro término de búsqueda</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

