import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

export default function Buscar() {
  const [params] = useSearchParams();
  const q = params.get("q") || "";
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true); setErr("");
    fetch(`/api/search?q=${encodeURIComponent(q)}`)
      .then(r => r.json())
      .then(data => {
        if (!active) return;
        const arr = Array.isArray(data?.items)
          ? data.items
          : Array.isArray(Object.values(data?.items ?? {}))
          ? Object.values(data.items)
          : [];
        setItems(arr);
      })
      .catch(() => active && setErr("Error buscando resultados"))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [q]);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Resultados para “{q}”</h1>
      {loading && <p>Cargando…</p>}
      {err && <p className="text-red-600">{err}</p>}
      {!loading && items.length === 0 && <p>Sin resultados.</p>}

      <div className="grid gap-4 md:grid-cols-3">
        {items.map((it, i) => (
          <a key={`${it.provider}-${it.id}-${i}`}
             href={it.url || "#"}
             target="_blank"
             rel="noreferrer"
             className="rounded-xl border bg-white p-4 hover:shadow-md transition block">
            <div className="text-xs mb-1 opacity-70">{it.provider}</div>
            <div className="font-semibold">{it.name}</div>
            {!!it.city && <div className="text-sm text-gray-600">{it.city}</div>}
            {!!it.photo && <img src={it.photo} alt={it.name} className="rounded-lg mt-2 aspect-video object-cover" />}
            {(it.price ?? null) !== null && (
              <div className="mt-2 font-medium">
                {new Intl.NumberFormat("es-CL", { style: "currency", currency: it.currency || "CLP" }).format(it.price)}
              </div>
            )}
          </a>
        ))}
      </div>
    </div>
  );
}
