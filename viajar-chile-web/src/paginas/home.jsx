import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { i18n } from "../i18n"; // ⬅️ import del i18n

export default function Home() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const images = [
    "https://plus.unsplash.com/premium_photo-1697729940854-0f73aadaff88?auto=format&fit=crop&q=80&w=1600",
    "https://images.unsplash.com/photo-1494783435443-c15feee0a80a?auto=format&fit=crop&q=80&w=1600",
    "https://images.unsplash.com/photo-1617173205830-95d15d469996?auto=format&fit=crop&q=80&w=1600",
    "https://images.unsplash.com/photo-1724250385111-3e06c1429b29?auto=format&fit=crop&q=80&w=1600",
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setCurrentIndex((i) => (i + 1) % images.length), 5000);
    return () => clearInterval(id);
  }, [images.length]);

  return (
    <div className="font-sans text-gray-900 overflow-x-hidden">
      {/* HERO */}
      <div className="relative w-screen h-[86vh] overflow-hidden">
        {/* ⬇️ render de las imágenes */}
        {images.map((src, idx) => (
          <img
            key={idx}
            src={src}
            alt={`Slide ${idx}`}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${
              idx === currentIndex ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white px-6">
          {/* Marca/título */}
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight drop-shadow-xl">
            {i18n.t("brand")}
          </h1>
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

      {/* SECCIÓN EXPLICATIVA */}
      <section className="bg-white py-16 text-gray-800">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {i18n.t("whatYouCanDo", { brand: i18n.t("brand") })}
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto mb-12">
            {/* Puedes mantener este texto estático o llevarlo a i18n si quieres */}
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
    </div>
  );
}
