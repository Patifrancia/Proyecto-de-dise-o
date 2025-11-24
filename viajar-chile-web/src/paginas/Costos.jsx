import { useState, useEffect } from "react";
import { i18n } from "../i18n";
import { Calculator, Plus, Trash2 } from "lucide-react";


export default function Costos() {
  const [km, setKm] = useState("");
  const [rend, setRend] = useState("12"); // km/l
  const [precio, setPrecio] = useState("1400"); // $/l
  const [nuevoPeaje, setNuevoPeaje] = useState("");
  const [peajes, setPeajes] = useState([]);
  const [, setLang] = useState(i18n.lang);

  useEffect(() => {
    const onChange = () => setLang(i18n.lang);
    window.addEventListener("langchange", onChange);
    return () => window.removeEventListener("langchange", onChange);
  }, []);

  // Calcular litros y totales
  const litros = km && rend ? Number(km) / Number(rend) : 0;
  const combustible = litros * Number(precio);
  const totalPeajes = peajes.reduce((acc, p) => acc + p, 0);
  const total = combustible + totalPeajes;

  // Funciones
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
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 p-8 text-gray-800">
        {/* Encabezado */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="bg-emerald-100 text-emerald-700 p-3 rounded-full mb-3">
            <Calculator className="w-6 h-6" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            {i18n.t("costs_title")}
          </h1>
          <p className="text-gray-600 mt-2 text-sm sm:text-base">
            {i18n.t("costs_subtitle")}
          </p>
        </div>

        {/* Formulario */}
        <form className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              {i18n.t("costs_distance_label")}
            </label>
            <input
              value={km}
              onChange={(e) => setKm(e.target.value)}
              type="number"
              className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-2 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition"
              placeholder={i18n.t("costs_distance_placeholder")}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                {i18n.t("costs_efficiency_label")}
              </label>
              <input
                value={rend}
                onChange={(e) => setRend(e.target.value)}
                type="number"
                className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-2 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                {i18n.t("costs_price_label")}
              </label>
              <input
                value={precio}
                onChange={(e) => setPrecio(e.target.value)}
                type="number"
                className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-2 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition"
              />
            </div>
          </div>

          {/* Peajes dinámicos */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {i18n.t("costs_tolls_label")}
            </label>

            {/* Input + botón agregar */}
            <div className="flex gap-2 mb-3">
              <input
                type="number"
                value={nuevoPeaje}
                onChange={(e) => setNuevoPeaje(e.target.value)}
                placeholder={i18n.t("costs_tolls_placeholder")}
                className="flex-1 rounded-xl border border-gray-300 px-3 py-2 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition"
              />
              <button
                type="button"
                onClick={agregarPeaje}
                className="rounded-xl bg-emerald-600 text-white px-3 py-2 hover:bg-emerald-700 transition flex items-center justify-center"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Lista de peajes agregados */}
            {peajes.length > 0 && (
              <ul className="space-y-2">
                {peajes.map((p, i) => (
                  <li
                    key={i}
                    className="flex justify-between items-center bg-gray-50 border rounded-xl px-3 py-2 text-sm"
                  >
                    <span>${p.toLocaleString("es-CL")}</span>
                    <button
                      onClick={() => eliminarPeaje(i)}
                      className="text-red-500 hover:text-red-700 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </form>

        {/* Resultados */}
        <div className="mt-8 rounded-2xl bg-emerald-50 p-5 border border-emerald-100 text-gray-800">
          <p className="text-sm mb-1">
            {i18n.t("costs_estimated_liters")}:{" "}
            <b>{litros ? litros.toFixed(1) : "0.0"} L</b>
          </p>
          <p className="text-sm mb-1">
            {i18n.t("costs_estimated_fuel")}:{" "}
            <b>${Math.round(combustible).toLocaleString("es-CL")}</b>
          </p>
          <p className="text-sm mb-1">
            {i18n.t("costs_estimated_tolls")}:{" "}
            <b>${Math.round(totalPeajes).toLocaleString("es-CL")}</b>
          </p>
          <p className="text-lg font-semibold text-emerald-700 mt-2">
            {i18n.t("costs_total_estimated")}:{" "}
            <b>${Math.round(total).toLocaleString("es-CL")}</b>
          </p>
        </div>
      </div>
    </div>
  );
}
