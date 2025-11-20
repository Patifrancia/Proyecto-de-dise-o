import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { i18n } from "../i18n";
import logo from "../assets/rutacl.png";

export default function Home() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const images = [
    {
      url: "https://images.unsplash.com/photo-1558517286-6b7b81953cb5?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      credit: "📸 Torres del Paine — Unsplash",
    },
    {
      url: "https://images.unsplash.com/photo-1494783435443-c15feee0a80a?auto=format&fit=crop&q=80&w=1600",
      credit: "📸 Desierto de Atacama — Unsplash",
    },
    {
      url: "https://images.unsplash.com/photo-1617173205830-95d15d469996?auto=format&fit=crop&q=80&w=1600",
      credit: "📸 Valparaíso — Unsplash",
    },
    {
      url: "https://images.unsplash.com/photo-1724250385111-3e06c1429b29?auto=format&fit=crop&q=80&w=1600",
      credit: "📸 Lagos del Sur — Unsplash",
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  useEffect(() => {
    const id = setInterval(
      () => setCurrentIndex((i) => (i + 1) % images.length),
      5000
    );
    return () => clearInterval(id);
  }, [images.length]);

  return (
    <div className="font-sans text-gray-900 overflow-x-hidden">
      {/* ===== HERO ===== */}
      <div className="relative w-screen h-[90vh] overflow-hidden">
        {/* Fondo de imágenes */}
        {images.map((img, idx) => (
          <img
            key={idx}
            src={img.url}
            alt={`Slide ${idx}`}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 pointer-events-none ${
              idx === currentIndex ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}

        {/* Capa oscura */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent pointer-events-none" />

        {/* Créditos de la imagen */}
        <div className="absolute bottom-2 right-4 text-xs text-gray-200 bg-black/30 px-3 py-1 rounded-lg backdrop-blur-sm">
          {images[currentIndex].credit}
        </div>

        {/* Contenido central con logo */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white px-6">
          <img
            src={logo}
            alt="RutaCL"
            className="h-32 md:h-40 w-auto mb-6 drop-shadow-2xl select-none pointer-events-none"
          />

          <p className="mt-2 text-lg md:text-xl text-gray-200 opacity-90">
            {i18n.t("tagline")} 🇨🇱
          </p>

          {/* Buscador */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const q = query.trim();
              navigate(q ? `/buscar?q=${encodeURIComponent(q)}` : `/buscar`);
            }}
            className="mt-8 flex w-full max-w-md items-center rounded-2xl bg-white/90 p-1 shadow-lg backdrop-blur-sm"
          >
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={i18n.t("searchPlaceholder")}
              className="flex-1 px-4 py-2 rounded-l-2xl bg-transparent text-gray-900 focus:outline-none"
              aria-label={i18n.t("searchPlaceholder")}
            />
            <button
              className="rounded-2xl bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700 transition"
              type="submit"
            >
              {i18n.t("search")}
            </button>
          </form>
        </div>
      </div>

      {/* ===== SECCIÓN EXPLICATIVA ===== */}
      <section className="bg-white py-16 text-gray-800">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {i18n.t("whatYouCanDo", { brand: i18n.t("brand") })}
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto mb-12">
            RutaCL te ayuda a organizar tus aventuras por Chile de forma simple y visual.
          </p>

          <div className="grid gap-8 md:grid-cols-3">
            <Link
              to="/planificar"
              className="rounded-2xl border bg-gray-50 p-6 shadow-sm hover:shadow-md transition block"
            >
              <div className="text-4xl mb-4">🗺️</div>
              <h3 className="text-xl font-semibold mb-2">{i18n.t("plan")}</h3>
              <p className="text-sm text-gray-700">{i18n.t("plan_desc")}</p>
            </Link>

            <Link
              to="/favoritos"
              className="rounded-2xl border bg-gray-50 p-6 shadow-sm hover:shadow-md transition block"
            >
              <div className="text-4xl mb-4">❤️</div>
              <h3 className="text-xl font-semibold mb-2">{i18n.t("save")}</h3>
              <p className="text-sm text-gray-700">{i18n.t("save_desc")}</p>
            </Link>

            <Link
              to="/costos"
              className="rounded-2xl border bg-gray-50 p-6 shadow-sm hover:shadow-md transition block"
            >
              <div className="text-4xl mb-4">💰</div>
              <h3 className="text-xl font-semibold mb-2">{i18n.t("costs")}</h3>
              <p className="text-sm text-gray-700">{i18n.t("costs_desc")}</p>
            </Link>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="bg-neutral-900 text-neutral-300 py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col gap-6 text-sm">
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <p>© {new Date().getFullYear()} RutaCL — Todos los derechos reservados.</p>
          </div>
          
          <div className="flex flex-col md:flex-row gap-6 border-t border-neutral-800 pt-6">
            <div className="flex-1">
              <h3 className="font-semibold text-white mb-2">Sobre nosotros</h3>
              <p className="text-neutral-400">
                Proyecto desarrollado por Josefa Juica y Patricia Francia en Diseño de Software para el proyecto semestral de la Universidad Adolfo Ibáñez.
              </p>
            </div>
            
            <div className="flex-1">
              <h3 className="font-semibold text-white mb-2">Contacto</h3>
              <p className="text-neutral-400">
                pfrancia@alumnos.uai.cl jojuica@alumnos.uai.cl
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
