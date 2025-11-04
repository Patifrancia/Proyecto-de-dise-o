import React from "react";

// Home sencillo sin dependencias externas (solo Tailwind opcional)
// Colócalo como src/paginas/home.jsx (o ajusta la ruta según tu estructura)
// y enrutalo desde App.jsx o main.jsx.

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Navbar */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-block h-8 w-8 rounded-xl bg-gray-900" />
            <h1 className="text-lg font-semibold tracking-tight">Viajar Chile</h1>
          </div>
          <nav className="hidden sm:flex items-center gap-5 text-sm">
            <a className="hover:opacity-80" href="#destinos">Destinos</a>
            <a className="hover:opacity-80" href="#rutas">Rutas</a>
            <a className="hover:opacity-80" href="#wishlist">Wishlist</a>
          </nav>
          <button className="sm:hidden rounded-xl border px-3 py-1.5 text-sm">Menú</button>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid gap-6 md:grid-cols-2 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold leading-tight">
              Explora Chile con un plan simple
            </h2>
            <p className="mt-3 text-gray-600">
              Arma tu ruta, guarda tus lugares y calcula costos básicos del viaje.
            </p>

            {/* Buscador simple */}
            <div className="mt-6 flex gap-2">
              <input
                type="text"
                placeholder="Buscar destino (ej: Valdivia)"
                className="w-full rounded-xl border px-4 py-2 focus:outline-none focus:ring"
              />
              <button className="rounded-xl bg-gray-900 px-4 py-2 text-white hover:opacity-90">
                Buscar
              </button>
            </div>

            {/* Acciones rápidas */}
            <div className="mt-4 flex flex-wrap gap-2 text-sm">
              <button className="rounded-full border px-3 py-1 hover:bg-gray-100">Cerca de mí</button>
              <button className="rounded-full border px-3 py-1 hover:bg-gray-100">Naturaleza</button>
              <button className="rounded-full border px-3 py-1 hover:bg-gray-100">Playas</button>
              <button className="rounded-full border px-3 py-1 hover:bg-gray-100">Patagonia</button>
            </div>
          </div>

          {/* Imagen/placeholder */}
          <div className="aspect-video rounded-2xl bg-gradient-to-br from-gray-200 to-gray-300" />
        </div>
      </section>

      {/* Tarjetas simples */}
      <section id="destinos" className="mx-auto max-w-6xl px-4 pb-12">
        <h3 className="text-xl font-semibold mb-4">Empieza por algo rápido</h3>
        <div className="grid gap-4 md:grid-cols-3">
          <Card title="Armar Ruta" desc="Agrega paradas y ordena el recorrido." actionText="Crear" />
          <Card title="Wishlist" desc="Guarda lugares para otro día." actionText="Abrir" />
          <Card title="Costos" desc="Estimación básica: peajes, bencina o bus." actionText="Calcular" />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-6">
        <div className="mx-auto max-w-6xl px-4 text-sm text-gray-600 flex items-center justify-between">
          <p>© {new Date().getFullYear()} Viajar Chile</p>
          <a className="hover:opacity-80" href="#">Contacto</a>
        </div>
      </footer>
    </div>
  );
}

function Card({ title, desc, actionText }) {
  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm">
      <h4 className="font-medium">{title}</h4>
      <p className="mt-1 text-sm text-gray-600">{desc}</p>
      <div className="mt-3">
        <button className="rounded-xl bg-gray-900 px-3 py-2 text-white text-sm hover:opacity-90">
          {actionText}
        </button>
      </div>
    </div>
  );
}