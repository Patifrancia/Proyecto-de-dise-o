import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { i18n } from "../i18n";
import HomeSearchPlace from "../componentes/HomeSearchPlace";
import { MapPin, Heart } from "lucide-react";
import { API_URL } from "../config/env.js";

export default function Home() {
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lang, setLang] = useState(i18n.lang);
  const navigate = useNavigate();

  // Obtener token del usuario
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const token = user?.token;

  // Mapeo de nombres de lugares a claves de traducción
  const placeDescriptionMap = {
    // Playas y Zona Costera Norte
    "arica": "place_desc_arica",
    "iquique": "place_desc_iquique",
    "antofagasta": "place_desc_antofagasta",
    "calama": "place_desc_calama",
    "copiapó": "place_desc_copiapo",
    "la serena": "place_desc_la_serena",
    "coquimbo": "place_desc_coquimbo",
    "ovalle": "place_desc_ovalle",
    
    // Zona Central
    "valparaiso": "place_desc_valparaiso",
    "valparaíso": "place_desc_valparaiso",
    "viña del mar": "place_desc_vina_del_mar",
    "concon": "place_desc_concon",
    "maitencillo": "place_desc_maitencillo",
    "papudo": "place_desc_papudo",
    "zapallar": "place_desc_zapallar",
    "cachagua": "place_desc_cachagua",
    "quintero": "place_desc_quintero",
    "algarrobo": "place_desc_algarrobo",
    "el quisco": "place_desc_el_quisco",
    "cartagena": "place_desc_cartagena",
    "san antonio": "place_desc_san_antonio",
    "santiago": "place_desc_santiago",
    "rancagua": "place_desc_rancagua",
    "san fernando": "place_desc_san_fernando",
    
    // Zona Sur Central
    "talca": "place_desc_talca",
    "curicó": "place_desc_curico",
    "chillan": "place_desc_chillan",
    "mulchén": "place_desc_mulchen",
    "concepción": "place_desc_concepcion",
    "talcahuano": "place_desc_talcahuano",
    "tome": "place_desc_tome",
    "lota": "place_desc_lota",
    "tirúa": "place_desc_tirua",
    
    // Zona Sur
    "temuco": "place_desc_temuco",
    "pucón": "place_desc_pucon",
    "villarrica": "place_desc_villarrica",
    "los ángeles": "place_desc_los_angeles",
    "nacimiento": "place_desc_nacimiento",
    "valdivia": "place_desc_valdivia",
    "corral": "place_desc_corral",
    "niebla": "place_desc_niebla",
    "pucatrihue": "place_desc_pucatrihue",
    "puerto montt": "place_desc_puerto_montt",
    "puerto varas": "place_desc_puerto_varas",
    "osorno": "place_desc_osorno",
    "puerto octay": "place_desc_puerto_octay",
    "frutillar": "place_desc_frutillar",
    "llanquihue": "place_desc_llanquihue",
    "piedras blancas": "place_desc_piedras_blancas",
    "puyehue": "place_desc_puyehue",
    
    // Zona Sur Austral
    "ancud": "place_desc_ancud",
    "dalcahue": "place_desc_dalcahue",
    "castro": "place_desc_castro",
    "quellon": "place_desc_quellon",
    "puerto natales": "place_desc_puerto_natales",
    "torres del paine": "place_desc_torres_del_paine",
    "punta arenas": "place_desc_punta_arenas",
    "puerto williams": "place_desc_puerto_williams",
    
    // Islas
    "isla de pascua": "place_desc_moai",
    "easter island": "place_desc_moai",
    "juan fernández": "place_desc_juan_fernandez",
    "archipiélago": "place_desc_archipelago",
    
    // Atacama y Desierto
    "atacama": "place_desc_atacama",
    "san pedro de atacama": "place_desc_san_pedro_atacama",
    "punta de choros": "place_desc_punta_choros",
    "el pan de azúcar": "place_desc_pan_azucar",
  };

  // Función para obtener descripción traducida
  const getTranslatedDescription = (placeName) => {
    if (!placeName) return null;
    const normalizedName = placeName.toLowerCase().trim();
    
    // Buscar coincidencias exactas primero
    for (const [key, descKey] of Object.entries(placeDescriptionMap)) {
      if (normalizedName === key) {
        const translated = i18n.t(descKey);
        if (translated && translated !== descKey) {
          return translated;
        }
      }
    }
    
    // Buscar coincidencias parciales
    for (const [key, descKey] of Object.entries(placeDescriptionMap)) {
      if (normalizedName.includes(key) || key.includes(normalizedName)) {
        const translated = i18n.t(descKey);
        if (translated && translated !== descKey) {
          return translated;
        }
      }
    }
    
    return null;
  };

  // Función para traducir el tipo de lugar
  const getTranslatedPlaceType = (placeType) => {
    if (!placeType) return placeType;
    const typeMap = {
      "Ciudad": "place_type_city",
      "City": "place_type_city",
      "Stadt": "place_type_city",
      "Región": "place_type_region",
      "Region": "place_type_region",
    };
    const key = typeMap[placeType];
    if (key) {
      const translated = i18n.t(key);
      return translated !== key ? translated : placeType;
    }
    return placeType;
  };

  // Actualizar si el lugar actual es favorito
  useEffect(() => {
    if (selectedPlace && token) {
      checkIfFavorite(selectedPlace.id);
    }
  }, [selectedPlace, token]);

  // Escuchar cambios de idioma
  useEffect(() => {
    const handleLanguageChange = () => {
      setLang(i18n.lang);
    };
    window.addEventListener("langchange", handleLanguageChange);
    return () => window.removeEventListener("langchange", handleLanguageChange);
  }, []);

  const checkIfFavorite = async (placeId) => {
    try {
      const res = await fetch(`${API_URL}/api/favorites/check/${placeId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setIsFavorite(data.isFavorite);
      }
    } catch (err) {
      console.error("Error verificando favorito:", err);
    }
  };

  const toggleFavorite = async () => {
    if (!selectedPlace) return;

    setLoading(true);
    try {
      if (token) {
        // Si estamos autenticados, guardar en MongoDB
        if (isFavorite) {
          // Eliminar favorito
          const res = await fetch(`${API_URL}/api/favorites/${selectedPlace.id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            setIsFavorite(false);
          } else {
            console.error("Error eliminando favorito");
          }
        } else {
          // Agregar favorito
          const res = await fetch(`${API_URL}/api/favorites/add`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ favorite: selectedPlace }),
          });
          if (res.ok) {
            setIsFavorite(true);
          } else {
            console.error("Error agregando favorito");
          }
        }
      } else {
        // Si no estamos autenticados, guardar en localStorage como fallback
        const savedFavorites = JSON.parse(localStorage.getItem("favorites_temp") || "[]");
        if (isFavorite) {
          const updated = savedFavorites.filter(fav => fav.id !== selectedPlace.id);
          localStorage.setItem("favorites_temp", JSON.stringify(updated));
          setIsFavorite(false);
        } else {
          const updated = [...savedFavorites, selectedPlace];
          localStorage.setItem("favorites_temp", JSON.stringify(updated));
          setIsFavorite(true);
        }
      }
    } catch (err) {
      console.error("Error toggling favorite:", err);
    } finally {
      setLoading(false);
    }
  };

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
            <HomeSearchPlace onPlaceSelect={setSelectedPlace} />
          </div>
        </div>
      </div>

      {/* ===== SECCIÓN DE LUGAR BUSCADO ===== */}
      {selectedPlace && (
        <section className="bg-gradient-to-b from-teal-50 to-white py-12 border-b border-teal-200">
          <div className="max-w-4xl mx-auto px-6">
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-gray-800">
              {selectedPlace.name}
            </h2>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Imagen del lugar */}
              {selectedPlace.photos && selectedPlace.photos.length > 0 ? (
                <div className="rounded-xl overflow-hidden shadow-lg h-64 md:h-full">
                  <img
                    src={selectedPlace.photos[0].getUrl({ maxWidth: 400, maxHeight: 400 })}
                    alt={selectedPlace.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="rounded-xl overflow-hidden shadow-lg h-64 md:h-full bg-gray-200 flex items-center justify-center">
                  <MapPin className="w-16 h-16 text-gray-400" />
                </div>
              )}

              {/* Información del lugar */}
              <div className="flex flex-col justify-center space-y-4">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {selectedPlace.name}
                  </h3>
                  <div className="flex items-start gap-2 mb-3">
                    <MapPin className="w-5 h-5 text-teal-600 flex-shrink-0 mt-1" />
                    <p className="text-gray-700">
                      {selectedPlace.address}
                    </p>
                  </div>

                  {/* Tipo de lugar */}
                  {selectedPlace.placeType && (
                    <div className="inline-block bg-teal-100 text-teal-700 px-3 py-1 rounded-full text-sm font-medium mb-3">
                      {getTranslatedPlaceType(selectedPlace.placeType)}
                    </div>
                  )}

                  {/* Descripción */}
                  {selectedPlace.description && (
                    <p className="text-gray-700 text-sm leading-relaxed mb-4">
                      {getTranslatedDescription(selectedPlace.name) || selectedPlace.description}
                    </p>
                  )}
                  {/* Hidden div to trigger re-render on lang change */}
                  <div style={{ display: "none" }}>{lang}</div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => navigate(`/planificar?add=${encodeURIComponent(selectedPlace.name)}`)}
                    className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 px-6 rounded-lg transition text-center"
                  >
                    {i18n.t("plan_trip")}
                  </button>
                  <button
                    onClick={toggleFavorite}
                    disabled={loading}
                    className={`flex-1 flex items-center justify-center gap-2 font-semibold py-3 px-6 rounded-lg transition ${
                      isFavorite
                        ? "bg-red-100 text-red-600 hover:bg-red-200"
                        : "border border-gray-300 text-gray-700 hover:bg-gray-100"
                    } disabled:opacity-50`}
                  >
                    <Heart className={`w-5 h-5 ${isFavorite ? "fill-current" : ""}`} />
                    {loading ? "..." : isFavorite ? i18n.t("saved") : i18n.t("save_button")}
                  </button>
                  <button
                    onClick={() => setSelectedPlace(null)}
                    className="flex-1 border border-gray-300 hover:bg-gray-100 text-gray-800 font-semibold py-3 px-6 rounded-lg transition"
                  >
                    {i18n.t("search_again")}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

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
