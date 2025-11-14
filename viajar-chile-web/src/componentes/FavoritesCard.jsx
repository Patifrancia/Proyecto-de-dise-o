import { Link } from "react-router-dom";
import { MapPin, Heart, Route, Trash2, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

export default function FavoritesCard({ favorite, onRemove, onPlanRoute }) {
  const [imageLoaded, setImageLoaded] = useState(false);
  
  const imageUrl = favorite.photo || favorite.image || 
    `https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop`;

  const destinationId = favorite.id || favorite.name?.toLowerCase().replace(/\s+/g, "-");

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="group"
    >
      <div className="rounded-2xl bg-white border border-gray-200 overflow-hidden shadow-soft hover:shadow-lg transition-all duration-300">
        {/* Imagen */}
        <Link to={`/destino/${destinationId}`} className="block relative aspect-video overflow-hidden bg-gray-200">
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gradient-to-br from-tierra-200 to-tierra-300 animate-pulse" />
          )}
          <img
            src={imageUrl}
            alt={favorite.name || "Destino"}
            onLoad={() => setImageLoaded(true)}
            className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 ${
              imageLoaded ? "opacity-100" : "opacity-0"
            }`}
            loading="lazy"
          />
          
          {favorite.type && (
            <div className="absolute top-3 left-3 px-2.5 py-1 bg-white/90 backdrop-blur-sm rounded-lg text-xs font-medium text-gray-700">
              {favorite.type}
            </div>
          )}

          <div className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full">
            <Heart className="w-5 h-5 fill-red-500 text-red-500" />
          </div>
        </Link>

        {/* Contenido */}
        <div className="p-4">
          <Link to={`/destino/${destinationId}`}>
            <h3 className="font-semibold text-lg text-gray-900 mb-1 line-clamp-1 hover:text-emerald-600 transition-colors">
              {favorite.name || "Destino"}
            </h3>
          </Link>
          
          {favorite.region && (
            <div className="flex items-center gap-1 text-sm text-gray-600 mb-3">
              <MapPin className="w-4 h-4" />
              <span>{favorite.region}</span>
            </div>
          )}

          {/* Acciones */}
          <div className="flex items-center gap-2 mt-4">
            <button
              onClick={() => onPlanRoute?.(favorite)}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium"
            >
              <Route className="w-4 h-4" />
              Planificar ruta
            </button>
            
            <Link
              to={`/destino/${destinationId}`}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              title="Ver detalles"
            >
              <ExternalLink className="w-4 h-4 text-gray-600" />
            </Link>

            <button
              onClick={() => onRemove?.(favorite)}
              className="p-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
              title="Eliminar de favoritos"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

