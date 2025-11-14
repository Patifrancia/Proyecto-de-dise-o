import { useState } from "react";
import { Calculator, Car, Bus, Plane, Plus, Trash2, DollarSign } from "lucide-react";
import { motion } from "framer-motion";

const TRANSPORT_MODES = {
  auto: {
    icon: Car,
    label: "Auto",
    defaultRendimiento: 12,
    defaultPrecio: 1400,
  },
  bus: {
    icon: Bus,
    label: "Bus",
    defaultRendimiento: 0,
    defaultPrecio: 0,
    precioPorKm: 150,
  },
  avion: {
    icon: Plane,
    label: "Avión",
    defaultRendimiento: 0,
    defaultPrecio: 0,
    precioPorKm: 500,
  },
};

export default function CostCalculator({ initialDistance = 0, onCalculate }) {
  const [mode, setMode] = useState("auto");
  const [distance, setDistance] = useState(initialDistance.toString());
  const [rendimiento, setRendimiento] = useState("12");
  const [precioCombustible, setPrecioCombustible] = useState("1400");
  const [peajes, setPeajes] = useState([]);
  const [nuevoPeaje, setNuevoPeaje] = useState("");
  const [alojamiento, setAlojamiento] = useState("");
  const [comida, setComida] = useState("");
  const [entradas, setEntradas] = useState("");

  const currentMode = TRANSPORT_MODES[mode];
  const dist = Number(distance) || 0;

  // Calcular costos según modo
  let costoTransporte = 0;
  if (mode === "auto") {
    const litros = dist && rendimiento ? dist / Number(rendimiento) : 0;
    costoTransporte = litros * Number(precioCombustible);
  } else if (mode === "bus") {
    costoTransporte = dist * (currentMode.precioPorKm || 0);
  } else if (mode === "avion") {
    costoTransporte = dist * (currentMode.precioPorKm || 0);
  }

  const totalPeajes = peajes.reduce((acc, p) => acc + p, 0);
  const totalAdicionales = 
    (Number(alojamiento) || 0) + 
    (Number(comida) || 0) + 
    (Number(entradas) || 0);
  const total = costoTransporte + totalPeajes + totalAdicionales;

  const agregarPeaje = () => {
    const valor = Number(nuevoPeaje);
    if (!valor || valor <= 0) return;
    setPeajes([...peajes, valor]);
    setNuevoPeaje("");
  };

  const eliminarPeaje = (i) => {
    setPeajes(peajes.filter((_, idx) => idx !== i));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-gray-200 shadow-soft p-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-emerald-100 rounded-lg">
          <Calculator className="w-6 h-6 text-emerald-700" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-gray-900">Calculador de Costos</h3>
          <p className="text-sm text-gray-600">Estima los gastos de tu viaje</p>
        </div>
      </div>

      {/* Modo de transporte */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Modo de transporte
        </label>
        <div className="grid grid-cols-3 gap-2">
          {Object.entries(TRANSPORT_MODES).map(([key, config]) => {
            const Icon = config.icon;
            return (
              <button
                key={key}
                type="button"
                onClick={() => {
                  setMode(key);
                  if (key === "auto") {
                    setRendimiento(config.defaultRendimiento.toString());
                    setPrecioCombustible(config.defaultPrecio.toString());
                  }
                }}
                className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                  mode === key
                    ? "border-emerald-500 bg-emerald-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <Icon className={`w-5 h-5 ${mode === key ? "text-emerald-600" : "text-gray-600"}`} />
                <span className={`text-xs font-medium ${mode === key ? "text-emerald-700" : "text-gray-700"}`}>
                  {config.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Distancia */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Distancia total (km)
        </label>
        <input
          type="number"
          value={distance}
          onChange={(e) => setDistance(e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
          placeholder="Ej: 350"
        />
      </div>

      {/* Configuración según modo */}
      {mode === "auto" && (
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rendimiento (km/l)
            </label>
            <input
              type="number"
              value={rendimiento}
              onChange={(e) => setRendimiento(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Precio combustible ($/l)
            </label>
            <input
              type="number"
              value={precioCombustible}
              onChange={(e) => setPrecioCombustible(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
            />
          </div>
        </div>
      )}

      {/* Peajes */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Peajes
        </label>
        <div className="flex gap-2 mb-2">
          <input
            type="number"
            value={nuevoPeaje}
            onChange={(e) => setNuevoPeaje(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), agregarPeaje())}
            placeholder="Monto del peaje"
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
          />
          <button
            type="button"
            onClick={agregarPeaje}
            className="px-4 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
        {peajes.length > 0 && (
          <div className="space-y-2">
            {peajes.map((p, i) => (
              <div
                key={i}
                className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg"
              >
                <span className="text-sm text-gray-700">
                  ${p.toLocaleString("es-CL")}
                </span>
                <button
                  onClick={() => eliminarPeaje(i)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Costos adicionales */}
      <div className="mb-6 space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          Costos adicionales (opcional)
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Alojamiento</label>
            <input
              type="number"
              value={alojamiento}
              onChange={(e) => setAlojamiento(e.target.value)}
              placeholder="$0"
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Comida</label>
            <input
              type="number"
              value={comida}
              onChange={(e) => setComida(e.target.value)}
              placeholder="$0"
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Entradas</label>
            <input
              type="number"
              value={entradas}
              onChange={(e) => setEntradas(e.target.value)}
              placeholder="$0"
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none text-sm"
            />
          </div>
        </div>
      </div>

      {/* Resumen */}
      <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-5 space-y-2">
        <div className="flex items-center gap-2 mb-3">
          <DollarSign className="w-5 h-5 text-emerald-700" />
          <h4 className="font-semibold text-emerald-900">Resumen de costos</h4>
        </div>
        
        {mode === "auto" && dist > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-700">Combustible:</span>
            <span className="font-medium">${Math.round(costoTransporte).toLocaleString("es-CL")}</span>
          </div>
        )}
        {(mode === "bus" || mode === "avion") && dist > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-700">Transporte:</span>
            <span className="font-medium">${Math.round(costoTransporte).toLocaleString("es-CL")}</span>
          </div>
        )}
        
        {totalPeajes > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-700">Peajes:</span>
            <span className="font-medium">${Math.round(totalPeajes).toLocaleString("es-CL")}</span>
          </div>
        )}
        
        {totalAdicionales > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-700">Adicionales:</span>
            <span className="font-medium">${Math.round(totalAdicionales).toLocaleString("es-CL")}</span>
          </div>
        )}
        
        <div className="pt-2 mt-2 border-t border-emerald-300 flex justify-between">
          <span className="font-semibold text-emerald-900">Total estimado:</span>
          <span className="font-bold text-lg text-emerald-700">
            ${Math.round(total).toLocaleString("es-CL")}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

