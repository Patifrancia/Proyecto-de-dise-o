import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  MapPin,
  PlusCircle,
  Route,
  Download,
  Trash2,
} from "lucide-react";
import LocationsSearchBox from "../componentes/LocationsSearchBox";

export default function Planificar() {
  const [stops, setStops] = useState([
    { name: "Santiago, Región Metropolitana, Chile", id: "santiago" },
  ]);

  /**
   * Agrega una localidad a la lista de paradas
   * @param {Object} location - Objeto de la localidad seleccionada
   */
  const addStop = (location) => {
    if (!location || !location.name) return;
    
    // Verificar que no esté ya en la lista
    const locationName = location.name.toLowerCase();
    if (stops.some((s) => s.name.toLowerCase() === locationName)) {
      return; // Ya existe, no agregar
    }

    // Formatear el nombre con región si está disponible
    const formattedName = location.region
      ? `${location.name}, ${location.region}, Chile`
      : `${location.name}, Chile`;

    // Agregar a la lista
    setStops([
      ...stops,
      {
        name: formattedName,
        id: location.id || location.name.toLowerCase().replace(/\s+/g, "-"),
        region: location.region,
        coordinates: location.coordinates,
      },
    ]);
  };

  /**
   * Elimina una parada de la lista
   * @param {number} index - Índice de la parada a eliminar
   */
  const deleteStop = (index) => {
    setStops(stops.filter((_, idx) => idx !== index));
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-10">
      {/* Encabezado */}
      <header className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-bold text-emerald-700 mb-3">
          Planifica tu ruta de viaje
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Busca y agrega ciudades, pueblos y localidades de Chile para planificar tu ruta.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* PARADAS */}
        <section className="rounded-2xl border bg-white shadow-md p-6">
          <div className="flex items-center gap-2 mb-4">
            <Route className="text-emerald-600" />
            <h2 className="text-lg font-semibold text-gray-800">
              Paradas del viaje
            </h2>
          </div>

          <ul className="text-gray-700 text-sm space-y-2 pl-1">
            {stops.map((stop, index) => (
              <li
                key={index}
                className="flex justify-between items-center bg-gray-50 px-3 py-2 rounded-lg hover:bg-gray-100"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <MapPin className="text-emerald-600 w-4 h-4 shrink-0" />
                  <span className="truncate">{stop.name}</span>
                </div>
                <button
                  onClick={() => deleteStop(index)}
                  className="p-1 rounded hover:bg-gray-200"
                  title="Eliminar"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
              </li>
            ))}
          </ul>

          {/* Buscador de localidades */}
          <div className="mt-4">
            <LocationsSearchBox
              placeholder="Busca ciudades, pueblos, localidades..."
              size="md"
              onSelect={addStop}
            />
            <p className="text-xs text-gray-500 mt-2">
              Solo se muestran lugares geográficos de Chile, no alojamientos
            </p>
          </div>
        </section>

        {/* ACCIONES */}
        <section className="rounded-2xl border bg-white shadow-md p-6">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="text-emerald-600" />
            <h2 className="text-lg font-semibold text-gray-800">
              Acciones rápidas
            </h2>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              to="/buscar"
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-sm font-medium"
            >
              <PlusCircle className="w-4 h-4" /> Buscar destino
            </Link>

            <Link
              to="/costos"
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 text-sm font-medium"
            >
              <Route className="w-4 h-4" /> Calcular costos
            </Link>

            <button
              type="button"
              onClick={() => {
                const data = JSON.stringify(stops, null, 2);
                const blob = new Blob([data], { type: "application/json" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "ruta-chile.json";
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-sm font-medium"
            >
              <Download className="w-4 h-4" /> Exportar ruta (JSON)
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

