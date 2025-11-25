import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  MapPin,
  Route,
  Download,
  Trash2,
  Sparkles,
  Clock,
  DollarSign,
  Navigation,
  Loader2,
  Cloud,
  CloudRain,
  Umbrella,
} from "lucide-react";
import LocationsSearchBox from "../componentes/LocationsSearchBox";
import { i18n } from "../i18n";

import { API_URL } from "../config/env.js";

export default function Planificar() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [stops, setStops] = useState([
    { name: "Santiago, Región Metropolitana, Chile", id: "santiago" },
  ]);
  const [itinerary, setItinerary] = useState(null);
  const [loadingItinerary, setLoadingItinerary] = useState(false);
  const [errorItinerary, setErrorItinerary] = useState(null);

  // Manejar el parámetro ?add= desde el home
  useEffect(() => {
    const locationFromUrl = searchParams.get("add");
    if (locationFromUrl && locationFromUrl.trim()) {
      // Agregar la localidad desde la URL
      const newLocation = {
        name: locationFromUrl,
        id: locationFromUrl.toLowerCase().replace(/\s+/g, "-"),
      };
      
      // Evitar duplicados
      setStops((prevStops) => {
        const isDuplicate = prevStops.some(
          (s) => s.name.toLowerCase() === locationFromUrl.toLowerCase()
        );
        if (!isDuplicate) {
          return [...prevStops, newLocation];
        }
        return prevStops;
      });

      // Limpiar el parámetro de la URL
      navigate("/planificar", { replace: true });
    }
  }, [searchParams, navigate]);

  const addStop = (location) => {
    if (!location || !location.name) return;

    const locationName = location.name.toLowerCase();
    if (stops.some((s) => s.name.toLowerCase() === locationName)) {
      return;
    }

    const formattedName = location.region
      ? `${location.name}, ${location.region}, Chile`
      : `${location.name}, Chile`;

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

  const deleteStop = (index) => {
    setStops(stops.filter((_, idx) => idx !== index));
    if (itinerary) setItinerary(null);
  };

  const generateItinerary = async () => {
    const validStops = stops.length >= 2 && stops.length <= 5;
    if (!validStops) {
      setErrorItinerary(i18n.t("plan_warning_too_few"));
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
          language: i18n.lang, // Enviar el idioma actual
        }),
      }).catch((fetchError) => {
        // Capturar errores de red (servidor no disponible, CORS, etc.)
        console.error("Error de red al generar itinerario:", fetchError);
        console.error("URL intentada:", `${API_URL}/api/itinerary/generate`);
        console.error("Tipo de error:", fetchError.name);
        console.error("Mensaje:", fetchError.message);
        
        // Mensaje más específico según el tipo de error
        if (fetchError.name === 'TypeError' && fetchError.message.includes('Failed to fetch')) {
          throw new Error(
            `No se pudo conectar con el servidor. Verifica que el backend esté corriendo en ${API_URL}. Error: ${fetchError.message}`
          );
        }
        throw fetchError;
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || errorData.error ||
            `Error ${response.status}: ${response.statusText}`
        );
      }

      const data = await response.json();
      setItinerary(data);
    } catch (error) {
      console.error("Error al generar itinerario:", error);
      setErrorItinerary(
        error.message ||
          "No se pudo generar el itinerario. Por favor, intenta nuevamente."
      );
    } finally {
      setLoadingItinerary(false);
    }
  };

  const validDestinationsCount = stops.length;
  const canGenerateItinerary =
    validDestinationsCount >= 2 && validDestinationsCount <= 5;

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-10">
      {/* Encabezado */}
      <header className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-bold text-emerald-700 mb-3">
          {i18n.t("plan_title")}
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          {i18n.t("plan_subtitle")}
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* PARADAS */}
        <section className="rounded-2xl border bg-white shadow-md p-6">
          <div className="flex items-center gap-2 mb-4">
            <Route className="text-emerald-600" />
            <h2 className="text-lg font-semibold text-gray-800">
              {i18n.t("plan_stops_title")}
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
              placeholder={i18n.t("plan_search_placeholder")}
              size="md"
              onSelect={addStop}
            />
            <p className="text-xs text-gray-500 mt-2">
              {i18n.t("plan_search_hint")}
            </p>
          </div>
        </section>

        {/* ACCIONES */}
        <section className="rounded-2xl border bg-white shadow-md p-6">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="text-emerald-600" />
            <h2 className="text-lg font-semibold text-gray-800">
              {i18n.t("plan_actions_title")}
            </h2>
          </div>

          <div className="flex flex-wrap gap-3">
            {/* Calcular costos */}
            <button
              type="button"
              onClick={() => navigate("/costos")}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 text-sm font-medium"
            >
              <DollarSign className="w-4 h-4" />
              <span>{i18n.t("plan_calc_costs")}</span>
            </button>

            {canGenerateItinerary && (
              <button
                type="button"
                onClick={generateItinerary}
                disabled={loadingItinerary}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loadingItinerary ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />{" "}
                    {i18n.t("plan_generating")}
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />{" "}
                    {i18n.t("plan_generate_button")}
                  </>
                )}
              </button>
            )}

            {/* Exportar ruta */}
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
              <Download className="w-4 h-4" /> {i18n.t("plan_export_json")}
            </button>
          </div>

          {!canGenerateItinerary && stops.length > 0 && (
            <p className="text-xs text-gray-500 mt-2">
              {i18n.t("plan_warning_too_few")}
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
              {i18n.t("itinerary_title")}
            </h2>
          </div>

          <div className="space-y-6">
            {itinerary.segments &&
              itinerary.segments.map((segment, index) => (
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
                          <span>{i18n.t("itinerary_departure")}: {segment.departureTime}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Navigation className="w-4 h-4" />
                          <span>{i18n.t("itinerary_time")}: {segment.estimatedTime}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          <span>
                            {i18n.t("itinerary_cost")}: $
                            {segment.estimatedCost?.total?.toLocaleString(
                              i18n.lang === "es" ? "es-CL" : i18n.lang === "de" ? "de-DE" : "en-US"
                            ) || 0}{" "}
                            {segment.estimatedCost?.currency || "CLP"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {segment.stops && segment.stops.length > 0 && (
                    <div className="mt-3 ml-4">
                      <p className="text-sm font-medium text-gray-700 mb-1">
                        {i18n.t("itinerary_interesting_stops")}:
                      </p>
                      <ul className="space-y-1">
                        {segment.stops.map((stop, stopIndex) => (
                          <li
                            key={stopIndex}
                            className="text-sm text-gray-600 flex items-start gap-2"
                          >
                            <MapPin className="w-3 h-3 mt-1 text-purple-500 shrink-0" />
                            <div>
                              <span className="font-medium">{stop.name}</span>
                              {stop.description && (
                                <span className="text-gray-500">
                                  {" "}
                                  — {stop.description}
                                </span>
                              )}
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {segment.estimatedCost && (
                    <div className="mt-2 ml-4 text-xs text-gray-500">
                      {i18n.t("itinerary_cost_detail")}: {i18n.t("itinerary_tolls")} $
                      {segment.estimatedCost.tolls?.toLocaleString(
                        i18n.lang === "es" ? "es-CL" : i18n.lang === "de" ? "de-DE" : "en-US"
                      ) || 0}{" "}
                      • {i18n.t("itinerary_fuel")} $
                      {segment.estimatedCost.fuel?.toLocaleString(
                        i18n.lang === "es" ? "es-CL" : i18n.lang === "de" ? "de-DE" : "en-US"
                      ) || 0}{" "}
                      • {i18n.t("itinerary_other")} $
                      {segment.estimatedCost.other?.toLocaleString(
                        i18n.lang === "es" ? "es-CL" : i18n.lang === "de" ? "de-DE" : "en-US"
                      ) || 0}
                    </div>
                  )}

                  {segment.rainAlternatives &&
                    segment.rainAlternatives.length > 0 && (
                      <div className="mt-4 ml-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <CloudRain className="w-4 h-4 text-blue-600" />
                          <p className="text-sm font-medium text-blue-900">
                            {i18n.t("itinerary_rain_alternatives")}
                          </p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {segment.rainAlternatives.map((alt, altIdx) => (
                            <div
                              key={altIdx}
                              className="bg-white p-2 rounded border border-blue-100"
                            >
                              <div className="flex items-start gap-2">
                                {alt.type === "indoor" && (
                                  <Umbrella className="w-3 h-3 text-blue-600 mt-0.5 shrink-0" />
                                )}
                                {alt.type === "covered" && (
                                  <Cloud className="w-3 h-3 text-blue-600 mt-0.5 shrink-0" />
                                )}
                                {alt.type === "alternative" && (
                                  <Route className="w-3 h-3 text-blue-600 mt-0.5 shrink-0" />
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-medium text-gray-800">
                                    {alt.name}
                                  </p>
                                  <p className="text-xs text-gray-600 mt-0.5">
                                    {alt.description}
                                  </p>
                                  {alt.locations && alt.locations.length > 0 && (
                                    <ul className="mt-1 space-y-0.5">
                                      {alt.locations.map((loc, locIdx) => (
                                        <li
                                          key={locIdx}
                                          className="text-xs text-gray-500 flex items-center gap-1"
                                        >
                                          <MapPin className="w-2.5 h-2.5" />
                                          {loc}
                                        </li>
                                      ))}
                                    </ul>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                </div>
              ))}

            {itinerary.summary && (
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      {i18n.t("itinerary_summary")}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {i18n.t("itinerary_total_time")}: {itinerary.summary.totalEstimatedTime}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-emerald-700">
                      $
                      {itinerary.summary.totalEstimatedCost?.toLocaleString(
                        i18n.lang === "es" ? "es-CL" : i18n.lang === "de" ? "de-DE" : "en-US"
                      ) || 0}{" "}
                      {itinerary.summary.currency || "CLP"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {i18n.t("itinerary_total_cost")}
                    </p>
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
