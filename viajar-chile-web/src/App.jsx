import './App.css';
import './index.css';

export default function App() {
  return (
    <div className="min-h-dvh bg-gray-50 text-gray-900">
      {/* Contenedor centrado y fluido */}
      <div className="mx-auto w-[92%] max-w-5xl">

        {/* Banner */}
        <header className="mt-8 rounded-xl bg-gradient-to-r from-cyan-600 to-emerald-500 px-5 py-8 text-white shadow-md
                           sm:px-8 md:py-10">
          <h1 className="text-center text-3xl font-extrabold tracking-tight md:text-4xl lg:text-5xl">
            Ruta CL
          </h1>
          <p className="mt-2 text-center text-base/relaxed opacity-95 md:text-lg">
            Explora, comparte y organiza tus viajes por todo Chile 🇨🇱
          </p>
        </header>

        {/* Contenido */}
        <main className="my-6 space-y-4 sm:my-8 md:my-10">
          {/* Card 1 */}
          <section className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-black/5
                              sm:p-6 md:p-8">
            <h2 className="mb-2 text-xl font-semibold text-emerald-800 sm:text-2xl">Sobre la plataforma</h2>
            <p className="text-sm text-gray-700 md:text-base">
              Viajar Chile conecta viajeros y facilita la planificación de rutas por zonas. 
              Nuestra meta es ayudarte a compartir transporte y descubrir nuevos destinos de forma colaborativa.
            </p>
          </section>

          {/* Card 2 */}
          <section className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-black/5
                              sm:p-6 md:p-8">
            <h2 className="mb-3 text-xl font-semibold text-emerald-800 sm:text-2xl">Próximos pasos</h2>
            <ul className="list-disc space-y-2 pl-5 text-sm text-gray-700 md:text-base">
              <li>🔍 Buscar viajes disponibles</li>
              <li>🚗 Crear una nueva ruta</li>
              <li>📅 Gestionar tus viajes planificados</li>
            </ul>
          </section>
        </main>

        {/* Footer */}
        <footer className="mb-8 rounded-b-xl bg-neutral-800 px-4 py-4 text-center text-xs text-neutral-200
                           sm:text-sm">
          © {new Date().getFullYear()} Viajar Chile — Todos los derechos reservados.
        </footer>
      </div>
    </div>
  );
}
