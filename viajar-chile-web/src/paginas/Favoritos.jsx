import { i18n } from "../i18n";
import { useEffect, useState } from "react";
import { MapPin, Heart, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../config/env.js";

export default function Favoritos() {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const [favorites, setFavorites] = useState([]);
  const [lang, setLang] = useState(i18n.lang);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Cargar favoritos desde la API o localStorage
  useEffect(() => {
    if (user?.token) {
      // Si autenticado, cargar de MongoDB
      const fetchFavorites = async () => {
        try {
          const res = await fetch(`${API_URL}/api/favorites`, {
            headers: { Authorization: `Bearer ${user.token}` },
          });
          if (res.ok) {
            const data = await res.json();
            setFavorites(data.favorites || []);
          }
        } catch (err) {
          console.error("Error cargando favoritos:", err);
        } finally {
          setLoading(false);
        }
      };

      fetchFavorites();
    } else {
      // Si no autenticado, cargar de localStorage (favoritos temporales)
      const tempFavorites = JSON.parse(localStorage.getItem("favorites_temp") || "[]");
      setFavorites(tempFavorites);
      setLoading(false);
    }
  }, [user]);

  // Escuchar cambios de idioma
  useEffect(() => {
    const onChange = () => setLang(i18n.lang);
    window.addEventListener("langchange", onChange);
    return () => window.removeEventListener("langchange", onChange);
  }, []);

  const deleteFavorite = async (id) => {
    try {
      if (user?.token) {
        // Si autenticado, eliminar de MongoDB
        const res = await fetch(`${API_URL}/api/favorites/${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${user.token}` },
        });
        if (res.ok) {
          setFavorites(favorites.filter((fav) => fav.id !== id));
        }
      } else {
        // Si no autenticado, eliminar de localStorage
        const updated = favorites.filter((fav) => fav.id !== id);
        localStorage.setItem("favorites_temp", JSON.stringify(updated));
        setFavorites(updated);
      }
    } catch (err) {
      console.error("Error eliminando favorito:", err);
    }
  };

  const userName = user?.nombre || user?.correo || "Usuario";
  const title = i18n.t("favorites_title");
  const greeting = user ? i18n.t("favorites_greeting", { name: userName }) : i18n.t("favorites_temp_title");

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-screen-xl px-4 py-8">
        <h1 className="text-3xl font-bold mb-2">{title}</h1>
        <p className="text-gray-600">Cargando favoritos...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-screen-xl px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">{title}</h1>
      <p className="text-gray-600 mb-8">{greeting}</p>

      {favorites.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed bg-gray-50 p-8 text-center">
          <Heart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Aún no tienes lugares guardados</p>
          <p className="text-gray-500 text-sm mt-2">Agrega algunos lugares desde la búsqueda del inicio</p>
          <button
            onClick={() => navigate("/")}
            className="mt-4 bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2 px-6 rounded-lg transition"
          >
            Ir a buscar lugares
          </button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {favorites.map((place) => (
            <div key={place.id} className="rounded-lg border bg-white overflow-hidden shadow-sm hover:shadow-md transition">
              {/* Imagen */}
              <div className="w-full h-40 bg-gradient-to-br from-teal-100 to-teal-200 flex items-center justify-center">
                <MapPin className="w-8 h-8 text-teal-600" />
              </div>

              {/* Contenido */}
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{place.name}</h3>
                
                {place.placeType && (
                  <span className="inline-block bg-teal-100 text-teal-700 px-2 py-1 rounded-full text-xs font-medium mb-2">
                    {place.placeType}
                  </span>
                )}

                <div className="flex items-start gap-2 mb-3">
                  <MapPin className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-600">{place.address}</p>
                </div>

                {place.description && (
                  <p className="text-xs text-gray-500 mb-4 line-clamp-2">{place.description}</p>
                )}

                <button
                  onClick={() => deleteFavorite(place.id)}
                  className="w-full flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 font-medium py-2 px-3 rounded-lg transition text-sm"
                >
                  <Trash2 className="w-4 h-4" />
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
