import { GripVertical, MapPin, Trash2 } from "lucide-react";
import { motion } from "framer-motion";

export default function RouteItem({ 
  stop, 
  index, 
  onDelete, 
  onDragStart, 
  onDragOver, 
  onDrop,
  isDragging = false 
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      draggable
      onDragStart={(e) => onDragStart?.(e, index)}
      onDragOver={(e) => onDragOver?.(e, index)}
      onDrop={(e) => onDrop?.(e, index)}
      className={`flex items-center gap-3 p-3 rounded-xl bg-white border border-gray-200 hover:border-emerald-300 transition-all cursor-move ${
        isDragging ? "opacity-50" : ""
      }`}
    >
      <GripVertical className="text-gray-400 w-5 h-5 shrink-0" />
      
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 font-semibold text-sm shrink-0">
          {index + 1}
        </div>
        <MapPin className="text-emerald-600 w-4 h-4 shrink-0" />
        <span className="text-gray-900 font-medium truncate">
          {stop.name || stop}
        </span>
      </div>

      {stop.distance && (
        <div className="text-sm text-gray-500 shrink-0">
          {stop.distance > 0 && (
            <span>{stop.distance.toFixed(0)} km</span>
          )}
        </div>
      )}

      <button
        onClick={() => onDelete?.(index)}
        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0"
        title="Eliminar"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </motion.div>
  );
}

