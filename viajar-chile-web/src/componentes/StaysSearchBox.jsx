import { useState, useRef, useEffect } from "react";
import { Search, MapPin, Loader2, Hotel } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useStaysSearch } from "../hooks/useStaysSearch";

/**
 * Componente de búsqueda especializado para estadías (hoteles, cabañas, hostales, airbnbs)
 * 
 * Este componente se conecta al endpoint /api/stays/search y muestra sugerencias
 * de alojamientos mientras el usuario escribe.
 * 
 * @param {string} placeholder - Texto del placeholder
 * @param {Function} onSelect - Callback cuando se selecciona un alojamiento
 * @param {string} className - Clases CSS adicionales
 * @param {string} size - Tamaño del input ("lg" o "md")
 */
export default function StaysSearchBox({ 
  placeholder = "Busca hoteles, cabañas, hostales...", 
  onSelect,
  className = "",
  size = "lg"
}) {
  const [query, setQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  // Usar el hook personalizado para búsqueda de estadías
  const { suggestions, loading, error } = useStaysSearch(query);

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
   * Maneja la selección de un alojamiento
   * @param {Object} stay - Objeto del alojamiento seleccionado
   */
  const handleSelect = (stay) => {
    setQuery(stay.name || "");
    setShowSuggestions(false);
    setSelectedIndex(-1);
    
    // Llamar al callback si existe
    if (onSelect) {
      onSelect(stay);
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
            aria-label="Buscar alojamiento"
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
                <p className="text-sm">Buscando alojamientos...</p>
              </div>
            ) : error ? (
              <div className="px-4 py-8 text-center text-red-500">
                <p className="text-sm">{error}</p>
              </div>
            ) : suggestions.length > 0 ? (
              <div className="max-h-96 overflow-y-auto">
                {suggestions.map((stay, idx) => (
                  <button
                    key={stay.id || idx}
                    type="button"
                    onClick={() => handleSelect(stay)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-emerald-50 transition-colors ${
                      selectedIndex === idx ? "bg-emerald-50" : ""
                    }`}
                  >
                    <Hotel className="text-emerald-600 w-5 h-5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate">
                        {stay.name}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center gap-2">
                        <MapPin className="w-3 h-3" />
                        <span className="truncate">{stay.location || stay.region}</span>
                        {stay.type && (
                          <span className="text-xs px-2 py-0.5 bg-gray-100 rounded">
                            {stay.type}
                          </span>
                        )}
                      </div>
                      {stay.price && (
                        <div className="text-xs text-emerald-600 font-medium mt-1">
                          {new Intl.NumberFormat("es-CL", {
                            style: "currency",
                            currency: stay.currency || "CLP",
                            maximumFractionDigits: 0,
                          }).format(stay.price)}
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="px-4 py-8 text-center text-gray-500">
                <p className="text-sm">No se encontraron alojamientos</p>
                <p className="text-xs mt-1">Intenta con otro término de búsqueda</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

