import { Link } from "react-router-dom";

export default function Planificar() {
  return (
    <div className="mx-auto w-full max-w-screen-xl px-4 py-8">
      <h1 className="text-2xl font-bold">Planificar rutas</h1>
      <p className="text-gray-600 mb-6">Crea y organiza una ruta con múltiples paradas.</p>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <h2 className="font-semibold mb-2">Paradas</h2>
          <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
            <li>Agregar: Santiago → Valparaíso → La Serena</li>
            <li>Reordenar paradas (pronto)</li>
            <li>Exportar (pronto)</li>
          </ul>
        </div>

        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <h2 className="font-semibold mb-2">Acciones</h2>
          <div className="flex flex-wrap gap-2">
            <Link to="/buscar" className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-sm">Buscar destino</Link>
            <Link to="/costos" className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 text-sm">Calcular costos</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
