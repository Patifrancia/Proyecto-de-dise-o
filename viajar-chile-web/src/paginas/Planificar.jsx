import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  MapPin,
  PlusCircle,
  Route,
  Download,
  Trash2,
  Sparkles,
  Clock,
  DollarSign,
  Navigation,
  Loader2,
} from "lucide-react";
import LocationsSearchBox from "../componentes/LocationsSearchBox";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export default function Planificar() {
  const [stops, setStops] = useState([
    { name: "Santiago, Región Metropolitana, Chile", id: "santiago" },
  ]);
  const [itinerary, setItinerary] = useState(null);
  const [loadingItinerary, setLoadingItinerary] = useState(false);
  const [errorItinerary, setErrorItinerary] = useState(null);

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
    // Limpiar itinerario si cambia la ruta
    if (itinerary) setItinerary(null);
  };

  /**
   * Genera un itinerario automático usando IA
   */
  const generateItinerary = async () => {
    // Validar que haya entre 2 y 5 destinos (excluyendo Santiago si es solo uno)
    const validStops = stops.length >= 2 && stops.length <= 5;
    if (!validStops) {
      setErrorItinerary("Se requieren entre 2 y 5 destinos para generar un itinerario");
      return;
    }

    setLoadingItinerary(true);
    setErrorItinerary(null);
    setItinerary(null);

    try {
      const response = await fetch(`${API_URL}/api/itinerary/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          destinations: stops,
        }),
      });

      if (!response.ok) {
        throw new Error("Error al generar el itinerario");
      }

      const data = await response.json();
      setItinerary(data);
    } catch (error) {
      console.error("Error al generar itinerario:", error);
      setErrorItinerary("No se pudo generar el itinerario. Por favor, intenta nuevamente.");
    } finally {
      setLoadingItinerary(false);
    }
  };

  // Contar destinos válidos (excluyendo Santiago inicial si es el único)
  const validDestinationsCount = stops.length;
  const canGenerateItinerary = validDestinationsCount >= 2 && validDestinationsCount <= 5;

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

            {canGenerateItinerary && (
              <button
                type="button"
                onClick={generateItinerary}
                disabled={loadingItinerary}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loadingItinerary ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Generando...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" /> Generar itinerario
                  </>
                )}
              </button>
            )}

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

          {!canGenerateItinerary && stops.length > 0 && (
            <p className="text-xs text-gray-500 mt-2">
              {stops.length < 2 
                ? "Agrega al menos 2 destinos para generar un itinerario automático"
                : "El máximo de destinos para generar un itinerario es 5"}
            </p>
          )}

          {errorItinerary && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {errorItinerary}
            </div>
          )}
        </section>
      </div>

      {/* ITINERARIO GENERADO */}
      {itinerary && (
        <section className="mt-6 rounded-2xl border bg-white shadow-md p-6">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="text-purple-600" />
            <h2 className="text-lg font-semibold text-gray-800">
              Itinerario Generado
            </h2>
          </div>

          <div className="space-y-6">
            {itinerary.segments && itinerary.segments.map((segment, index) => (
              <div
                key={index}
                className="border-l-4 border-purple-500 pl-4 pb-4 last:pb-0"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800 mb-1">
                      {segment.from} → {segment.to}
                    </h3>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>Salida: {segment.departureTime}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Navigation className="w-4 h-4" />
                        <span>Tiempo: {segment.estimatedTime}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        <span>Costo: ${segment.estimatedCost?.total?.toLocaleString("es-CL") || 0} {segment.estimatedCost?.currency || "CLP"}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {segment.stops && segment.stops.length > 0 && (
                  <div className="mt-3 ml-4">
                    <p className="text-sm font-medium text-gray-700 mb-1">Paradas interesantes:</p>
                    <ul className="space-y-1">
                      {segment.stops.map((stop, stopIndex) => (
                        <li key={stopIndex} className="text-sm text-gray-600 flex items-start gap-2">
                          <MapPin className="w-3 h-3 mt-1 text-purple-500 shrink-0" />
                          <div>
                            <span className="font-medium">{stop.name}</span>
                            {stop.description && (
                              <span className="text-gray-500"> — {stop.description}</span>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {segment.estimatedCost && (
                  <div className="mt-2 ml-4 text-xs text-gray-500">
                    Detalle: Peajes ${segment.estimatedCost.tolls?.toLocaleString("es-CL") || 0} • 
                    Combustible ${segment.estimatedCost.fuel?.toLocaleString("es-CL") || 0} • 
                    Otros ${segment.estimatedCost.other?.toLocaleString("es-CL") || 0}
                  </div>
                )}
              </div>
            ))}

            {itinerary.summary && (
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Resumen del viaje</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Tiempo total: {itinerary.summary.totalEstimatedTime}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-emerald-700">
                      ${itinerary.summary.totalEstimatedCost?.toLocaleString("es-CL") || 0} {itinerary.summary.currency || "CLP"}
                    </p>
                    <p className="text-xs text-gray-500">Costo total estimado</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}

