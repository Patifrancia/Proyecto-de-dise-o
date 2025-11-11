import { useState } from "react";

export default function Costos() {
  const [km, setKm] = useState("");
  const [rend, setRend] = useState("12"); // km/l
  const [precio, setPrecio] = useState("1400"); // $/l
  const [peajes, setPeajes] = useState("0");

  const litros = km && rend ? Number(km) / Number(rend) : 0;
  const combustible = litros * Number(precio);
  const total = combustible + Number(peajes || 0);

  return (
    <div className="mx-auto w-full max-w-screen-sm px-4 py-8">
      <h1 className="text-2xl font-bold">Calcula los costos</h1>
      <p className="text-gray-600 mb-6">Estima combustible y peajes de tu viaje.</p>

      <div className="rounded-xl border bg-white p-5 shadow-sm space-y-4">
        <div>
          <label className="block text-sm font-medium">Distancia (km)</label>
          <input value={km} onChange={e => setKm(e.target.value)} type="number"
                 className="mt-1 w-full rounded-lg border px-3 py-2" />
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Rendimiento (km/l)</label>
            <input value={rend} onChange={e => setRend(e.target.value)} type="number"
                   className="mt-1 w-full rounded-lg border px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium">Precio bencina ($/l)</label>
            <input value={precio} onChange={e => setPrecio(e.target.value)} type="number"
                   className="mt-1 w-full rounded-lg border px-3 py-2" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium">Peajes ($)</label>
          <input value={peajes} onChange={e => setPeajes(e.target.value)} type="number"
                 className="mt-1 w-full rounded-lg border px-3 py-2" />
        </div>

        <div className="mt-2 rounded-lg bg-gray-50 p-4">
          <p className="text-sm">Litros estimados: <b>{litros.toFixed(1)} L</b></p>
          <p className="text-sm">Combustible: <b>${Math.round(combustible).toLocaleString()}</b></p>
          <p className="text-lg font-semibold">Total estimado: <b>${Math.round(total).toLocaleString()}</b></p>
        </div>
      </div>
    </div>
  );
}
