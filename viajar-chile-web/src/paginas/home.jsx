import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { i18n } from "../i18n";
import PlacesSearchBox from "../componentes/PlacesSearchBox";

export default function Home() {
  const navigate = useNavigate();

  const images = [
    {
      url: "https://images.unsplash.com/photo-1558517286-6b7b81953cb5?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      credit: "Torres del Paine — Unsplash",
    },
    {
      url: "https://images.unsplash.com/photo-1494783435443-c15feee0a80a?auto=format&fit=crop&q=80&w=1600",
      credit: "Desierto de Atacama — Unsplash",
    },
    {
      url: "https://images.unsplash.com/photo-1617173205830-95d15d469996?auto=format&fit=crop&q=80&w=1600",
      credit: "Valparaíso — Unsplash",
    },
    {
      url: "https://images.unsplash.com/photo-1724250385111-3e06c1429b29?auto=format&fit=crop&q=80&w=1600",
      credit: "Lagos del Sur — Unsplash",
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  // estados para los desplegables del footer
  const [showAbout, setShowAbout] = useState(false);
  const [showContact, setShowContact] = useState(false);

  useEffect(() => {
    const id = setInterval(
      () => setCurrentIndex((i) => (i + 1) % images.length),
      5000
    );
    return () => clearInterval(id);
  }, [images.length]);

  return (
    <div className="text-gray-900 overflow-x-hidden">
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

        {/* Contenido central */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white px-6">
          <h1 className="text-5xl md:text-6xl font-semibold drop-shadow-2xl mb-6 font-raleway">
            {i18n.t("hero_title")}
          </h1>

          {/* Buscador */}
          <div className="mt-2 w-full max-w-md">
            <PlacesSearchBox
              placeholder={i18n.t("search_placeholder")}
              size="lg"
              onSelect={(place) => {
                const label = place?.name || place?.location;
                if (!label) {
                  navigate("/planificar");
                  return;
                }
                navigate(`/planificar?add=${encodeURIComponent(label)}`);
              }}
              className="bg-white border border-gray-300 rounded-2xl shadow-lg backdrop-blur-sm"
            />
          </div>
        </div>
      </div>

      {/* ===== SECCIÓN EXPLICATIVA ===== */}
      <section className="bg-white py-16 text-gray-800">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {i18n.t("whatYouCanDo", { brand: i18n.t("brand") })}
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto mb-12">
            {i18n.t("hero_description")}
          </p>

          <div className="grid gap-8 md:grid-cols-3">
            <Link
              to="/planificar"
              className="rounded-2xl border bg-gray-50 p-6 shadow-sm hover:shadow-md transition block"
            >
              <div className="text-4xl mb-4">🗺️</div>
              <h3 className="text-xl font-semibold mb-2">
                {i18n.t("plan")}
              </h3>
              <p className="text-sm text-gray-700">{i18n.t("plan_desc")}</p>
            </Link>

            <Link
              to="/favoritos"
              className="rounded-2xl border bg-gray-50 p-6 shadow-sm hover:shadow-md transition block"
            >
              <div className="text-4xl mb-4">💚</div>
              <h3 className="text-xl font-semibold mb-2">
                {i18n.t("save")}
              </h3>
              <p className="text-sm text-gray-700">{i18n.t("save_desc")}</p>
            </Link>

            <Link
              to="/costos"
              className="rounded-2xl border bg-gray-50 p-6 shadow-sm hover:shadow-md transition block"
            >
              <div className="text-4xl mb-4">💲</div>
              <h3 className="text-xl font-semibold mb-2">
                {i18n.t("costs")}
              </h3>
              <p className="text-sm text-gray-700">{i18n.t("costs_desc")}</p>
            </Link>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="bg-neutral-900 text-neutral-300 pt-8 pb-4">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
          <p>
            © {new Date().getFullYear()} {i18n.t("brand")} —{" "}
            {i18n.t("footerRights")}
          </p>

          <div className="flex gap-6">
            {/* Botón Sobre nosotros */}
            <button
              type="button"
              onClick={() => {
                setShowAbout((v) => !v);
                if (!showAbout) setShowContact(false);
              }}
              className="text-teal-500 hover:text-teal-400 transition border-0 bg-transparent p-0 cursor-pointer"
            >
              {i18n.t("footerAboutLink")}
            </button>

            {/* Botón Contacto */}
            <button
              type="button"
              onClick={() => {
                setShowContact((v) => !v);
                if (!showContact) setShowAbout(false);
              }}
              className="text-teal-500 hover:text-teal-400 transition border-0 bg-transparent p-0 cursor-pointer"
            >
              {i18n.t("footerContactLink")}
            </button>

            {/* GitHub */}
            <a
              href="https://github.com/Patifrancia/Proyecto-de-dise-o.git"
              target="_blank"
              rel="noreferrer"
              className="hover:text-white transition"
            >
              GitHub
            </a>
          </div>
        </div>

        {/* Panel desplegable */}
        {(showAbout || showContact) && (
          <div className="max-w-6xl mx-auto px-6 mt-4 text-sm text-neutral-200">
            {showAbout && (
              <div className="border-t border-neutral-700 pt-4">
                <h3 className="font-semibold mb-2">
                  {i18n.t("footerAboutTitle")}
                </h3>
                <p className="text-neutral-300 text-justify leading-relaxed">
                  {i18n.t("footerAboutText")}
                </p>
              </div>
            )}

            {showContact && (
              <div className="border-t border-neutral-700 pt-4">
                <h3 className="font-semibold mb-2">
                  {i18n.t("footerContactTitle")}
                </h3>
                <p className="text-neutral-300">
                  {i18n.t("footerContactText")}
                </p>
              </div>
            )}
          </div>
        )}
      </footer>
    </div>
  );
}
