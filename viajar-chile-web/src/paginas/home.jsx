import React, { useState, useEffect } from "react";
console.log("Cargando nuevo Home RutaCL");
export default function Home() {
  const images = [
    "https://plus.unsplash.com/premium_photo-1697729940854-0f73aadaff88?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=872", // Torres del Paine
    "https://images.unsplash.com/photo-1494783435443-c15feee0a80a?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=872", // Desierto de Atacama
    "https://images.unsplash.com/photo-1617173205830-95d15d469996?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=871", // Valparaíso
    "https://images.unsplash.com/photo-1724250385111-3e06c1429b29?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=870", // Lagos del Sur
  ];

 const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <div className="font-sans text-gray-900 overflow-x-hidden">
      {/* ===== HERO CON CARRUSEL ===== */}
      <div className="relative w-screen h-[90vh] overflow-hidden">
        {images.map((src, index) => (
          <img
            key={index}
            src={src}
            alt={`Slide ${index}`}
            className={`absolute top-0 left-0 h-full w-screen object-cover transition-opacity duration-1000 ${
              index === currentIndex ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}

        {/* Capa oscura */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent"></div>

        {/* Logo superior */}
        <div className="absolute top-6 left-6 flex items-center gap-2 text-white">
          <div className="h-8 w-8 rounded-xl bg-emerald-500/80"></div>
          <span className="text-lg font-semibold tracking-tight">RutaCL</span>
        </div>

        {/* Texto principal */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white px-6">
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight drop-shadow-xl">
            Ruta<span className="text-emerald-400">CL</span>
          </h1>
          <p className="mt-2 text-lg md:text-xl text-gray-200 opacity-90">
            Explora Chile a tu manera 🇨🇱
          </p>

          {/* Buscador */}
          <div className="mt-8 flex w-full max-w-md items-center rounded-2xl bg-white/90 p-1 shadow-lg backdrop-blur-sm">
            <input
              type="text"
              placeholder="¿A dónde quieres ir?"
              className="flex-1 px-4 py-2 rounded-l-2xl bg-transparent text-gray-900 focus:outline-none"
            />
            <button className="rounded-2xl bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700 transition">
              Buscar
            </button>
          </div>
        </div>
      </div>

      {/* ===== SECCIÓN EXPLICATIVA ===== */}
      <section className="bg-white py-16 text-gray-800">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            ¿Qué puedes hacer en <span className="text-emerald-600">RutaCL</span>?
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto mb-12">
            RutaCL te ayuda a organizar tus aventuras por Chile de forma simple y visual. 
            Diseñada para viajeros que quieren explorar sin perder tiempo en planillas ni mapas complicados.
          </p>

          <div className="grid gap-8 md:grid-cols-3">
            <div className="rounded-2xl border bg-gray-50 p-6 shadow-sm hover:shadow-md transition">
              <div className="text-4xl mb-4">🗺️</div>
              <h3 className="text-xl font-semibold mb-2">Planifica tus rutas</h3>
              <p className="text-sm text-gray-700">
                Agrega destinos, ajusta el orden y visualiza el recorrido completo en el mapa.
              </p>
            </div>

            <div className="rounded-2xl border bg-gray-50 p-6 shadow-sm hover:shadow-md transition">
              <div className="text-4xl mb-4">❤️</div>
              <h3 className="text-xl font-semibold mb-2">Guarda tus lugares</h3>
              <p className="text-sm text-gray-700">
                Crea una lista de tus destinos favoritos o pendientes, y retómalos cuando quieras.
              </p>
            </div>

            <div className="rounded-2xl border bg-gray-50 p-6 shadow-sm hover:shadow-md transition">
              <div className="text-4xl mb-4">💰</div>
              <h3 className="text-xl font-semibold mb-2">Calcula los costos</h3>
              <p className="text-sm text-gray-700">
                Estima peajes, bencina o transporte público para organizar tu presupuesto fácilmente.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}