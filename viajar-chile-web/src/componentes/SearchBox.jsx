import { useState, useEffect, useRef } from "react";
import { Search, MapPin, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

export default function SearchBox({ 
  placeholder = "¿A dónde quieres ir?", 
  onSelect,
  className = "",
  size = "lg"
}) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef(null);
  const containerRef = useRef(null);
  const navigate = useNavigate();

  // Destinos destacados para mostrar cuando no hay query
  const destacados = [
    { name: "Torres del Paine", region: "Magallanes", type: "Montañas", id: "torres-del-paine" },
    { name: "Valparaíso", region: "Valparaíso", type: "Ciudades", id: "valparaiso" },
    { name: "San Pedro de Atacama", region: "Antofagasta", type: "Desierto", id: "san-pedro-atacama" },
    { name: "Isla de Pascua", region: "Valparaíso", type: "Islas", id: "isla-de-pascua" },
    { name: "Chiloé", region: "Los Lagos", type: "Islas", id: "chiloe" },
    { name: "Pucón", region: "La Araucanía", type: "Montañas", id: "pucon" },
  ];

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const timeoutId = setTimeout(() => {
      // Simular búsqueda (reemplazar con API real)
      fetch(`/api/search?q=${encodeURIComponent(query)}`)
        .then(r => r.json())
        .then(data => {
          const items = Array.isArray(data?.items) ? data.items : [];
          setSuggestions(items.slice(0, 6));
          setLoading(false);
        })
        .catch(() => {
          // Fallback: buscar en destacados
          const filtered = destacados.filter(d => 
            d.name.toLowerCase().includes(query.toLowerCase()) ||
            d.region.toLowerCase().includes(query.toLowerCase())
          );
          setSuggestions(filtered);
          setLoading(false);
        });
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  const handleSelect = (item) => {
    setQuery(item.name || item);
    setShowSuggestions(false);
    if (onSelect) {
      onSelect(item);
    } else {
      navigate(`/destino/${item.id || item.name.toLowerCase().replace(/\s+/g, "-")}`);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedIndex >= 0 && suggestions[selectedIndex]) {
      handleSelect(suggestions[selectedIndex]);
    } else if (query.trim()) {
      navigate(`/buscar?q=${encodeURIComponent(query)}`);
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
          />
          {loading && (
            <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-600 w-5 h-5 animate-spin" />
          )}
        </div>
      </form>

      <AnimatePresence>
        {showSuggestions && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 w-full mt-2 bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden"
          >
            {query.trim() ? (
              suggestions.length > 0 ? (
                <div className="max-h-96 overflow-y-auto">
                  {suggestions.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelect(item)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-emerald-50 transition-colors ${
                        selectedIndex === idx ? "bg-emerald-50" : ""
                      }`}
                    >
                      <MapPin className="text-emerald-600 w-5 h-5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 truncate">
                          {item.name || item}
                        </div>
                        {item.region && (
                          <div className="text-sm text-gray-500">
                            {item.region}
                            {item.type && ` • ${item.type}`}
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              ) : !loading && (
                <div className="px-4 py-8 text-center text-gray-500">
                  No se encontraron resultados
                </div>
              )
            ) : (
              <div className="p-4">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 px-2">
                  Destinos destacados
                </div>
                <div className="space-y-1">
                  {destacados.map((destino, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelect(destino)}
                      className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-emerald-50 rounded-lg transition-colors"
                    >
                      <MapPin className="text-emerald-600 w-5 h-5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900">
                          {destino.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {destino.region} • {destino.type}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

