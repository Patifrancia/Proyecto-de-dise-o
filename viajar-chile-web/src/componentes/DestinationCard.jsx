import { Link } from "react-router-dom";
import { MapPin, Heart, Route } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

export default function DestinationCard({ destination, onFavorite, onAddToRoute }) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
    setIsFavorite(favorites.some(f => f.id === destination.id || f.name === destination.name));
  }, [destination]);

  const handleFavorite = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
    const newFavorites = isFavorite
      ? favorites.filter(f => (f.id || f.name) !== (destination.id || destination.name))
      : [...favorites, { ...destination, addedAt: new Date().toISOString() }];
    localStorage.setItem("favorites", JSON.stringify(newFavorites));
    setIsFavorite(!isFavorite);
    if (onFavorite) onFavorite(!isFavorite);
  };

  const handleAddToRoute = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onAddToRoute) {
      onAddToRoute(destination);
    } else {
      const route = JSON.parse(localStorage.getItem("currentRoute") || "[]");
      if (!route.some(r => (r.id || r.name) === (destination.id || destination.name))) {
        localStorage.setItem("currentRoute", JSON.stringify([...route, destination]));
      }
    }
  };

  const destinationId = destination.id || destination.name?.toLowerCase().replace(/\s+/g, "-");
  const imageUrl = destination.photo || destination.image || 
    `https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -4 }}
      className="group"
    >
      <Link
        to={`/destino/${destinationId}`}
        className="block rounded-2xl bg-white border border-gray-200 overflow-hidden shadow-soft hover:shadow-lg transition-all duration-300"
      >
        {/* Imagen */}
        <div className="relative aspect-video overflow-hidden bg-gray-200">
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gradient-to-br from-tierra-200 to-tierra-300 animate-pulse" />
          )}
          <img
            src={imageUrl}
            alt={destination.name || "Destino"}
            onLoad={() => setImageLoaded(true)}
            className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 ${
              imageLoaded ? "opacity-100" : "opacity-0"
            }`}
            loading="lazy"
          />
          
          {/* Badge de tipo */}
          {destination.type && (
            <div className="absolute top-3 left-3 px-2.5 py-1 bg-white/90 backdrop-blur-sm rounded-lg text-xs font-medium text-gray-700">
              {destination.type}
            </div>
          )}

          {/* Botón favorito */}
          <button
            onClick={handleFavorite}
            className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
            aria-label={isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"}
          >
            <Heart
              className={`w-5 h-5 transition-colors ${
                isFavorite ? "fill-red-500 text-red-500" : "text-gray-600"
              }`}
            />
          </button>
        </div>

        {/* Contenido */}
        <div className="p-4">
          <h3 className="font-semibold text-lg text-gray-900 mb-1 line-clamp-1">
            {destination.name || "Destino"}
          </h3>
          
          {destination.region && (
            <div className="flex items-center gap-1 text-sm text-gray-600 mb-3">
              <MapPin className="w-4 h-4" />
              <span>{destination.region}</span>
            </div>
          )}

          {destination.description && (
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
              {destination.description}
            </p>
          )}

          {/* Acciones */}
          <div className="flex items-center gap-2 mt-4">
            <button
              onClick={handleAddToRoute}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors text-sm font-medium"
            >
              <Route className="w-4 h-4" />
              Agregar a ruta
            </button>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

