import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MapPin, 
  Heart, 
  Route, 
  ArrowLeft, 
  Navigation,
  Cloud,
  Calendar,
  DollarSign,
  Loader2
} from "lucide-react";

export default function Destino() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [destination, setDestination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Datos de ejemplo (reemplazar con API real)
  const destinationsData = {
    "torres-del-paine": {
      id: "torres-del-paine",
      name: "Torres del Paine",
      region: "Magallanes y la Antártica Chilena",
      type: "Parque Nacional",
      description: "El Parque Nacional Torres del Paine es uno de los destinos más impresionantes de Chile. Con sus icónicas torres de granito, glaciares milenarios y lagos turquesa, ofrece una experiencia única en la Patagonia. Es un paraíso para los amantes del trekking y la naturaleza.",
      longDescription: "Ubicado en la Región de Magallanes, este parque nacional es reconocido internacionalmente por su belleza escénica. El circuito W y el circuito O son las rutas de trekking más populares, ofreciendo vistas espectaculares de las Torres del Paine, el Cuerno del Paine y el Glaciar Grey.",
      images: [
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=800&fit=crop",
        "https://images.unsplash.com/photo-1511497584788-876760111969?w=1200&h=800&fit=crop",
        "https://images.unsplash.com/photo-1539650116574-75c0c6d73a6e?w=1200&h=800&fit=crop",
      ],
      coordinates: { lat: -50.9423, lng: -73.4068 },
      clima: "Templado frío, vientos fuertes. Mejor época: octubre a abril",
      comoLlegar: "Desde Punta Arenas: 3 horas en auto. Desde Puerto Natales: 1.5 horas",
      distancia: "A 112 km de Puerto Natales",
      precioEntrada: "Desde $21.000 CLP (extranjeros) / $6.000 CLP (nacionales)",
    },
    "valparaiso": {
      id: "valparaiso",
      name: "Valparaíso",
      region: "Valparaíso",
      type: "Ciudad Patrimonial",
      description: "Valparaíso es una ciudad portuaria única, declarada Patrimonio de la Humanidad por la UNESCO. Sus coloridos cerros, ascensores históricos y arte callejero la convierten en un destino cultural imperdible.",
      longDescription: "Conocida como 'La Joya del Pacífico', Valparaíso se caracteriza por su arquitectura única, sus cerros que se elevan desde el mar y su rica historia marítima. Los ascensores, el arte urbano y los miradores ofrecen vistas espectaculares del puerto.",
      images: [
        "https://images.unsplash.com/photo-1617173205830-95d15d469996?w=1200&h=800&fit=crop",
        "https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=1200&h=800&fit=crop",
        "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&h=800&fit=crop",
      ],
      coordinates: { lat: -33.0472, lng: -71.6127 },
      clima: "Mediterráneo. Veranos cálidos, inviernos suaves",
      comoLlegar: "Desde Santiago: 1.5 horas en auto o bus",
      distancia: "A 120 km de Santiago",
      precioEntrada: "Gratis (algunos museos tienen costo)",
    },
  };

  useEffect(() => {
    // Simular carga de datos
    setTimeout(() => {
      const data = destinationsData[id] || destinationsData["torres-del-paine"];
      setDestination(data);
      setLoading(false);
    }, 500);

    // Verificar favoritos
    const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
    setIsFavorite(favorites.some(f => f.id === id));
  }, [id]);

  const toggleFavorite = () => {
    const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
    if (isFavorite) {
      const newFavorites = favorites.filter(f => f.id !== id);
      localStorage.setItem("favorites", JSON.stringify(newFavorites));
    } else {
      localStorage.setItem("favorites", JSON.stringify([...favorites, destination]));
    }
    setIsFavorite(!isFavorite);
  };

  const addToRoute = () => {
    const route = JSON.parse(localStorage.getItem("currentRoute") || "[]");
    if (!route.some(r => r.id === destination.id)) {
      localStorage.setItem("currentRoute", JSON.stringify([...route, destination]));
      navigate("/planificar");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
      </div>
    );
  }

  if (!destination) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Destino no encontrado</h2>
          <Link to="/" className="text-emerald-600 hover:text-emerald-700">
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-tierra-50">
      {/* Botón volver */}
      <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Volver</span>
          </button>
        </div>
      </div>

      {/* Carrusel de imágenes */}
      <div className="relative h-[60vh] min-h-[400px] overflow-hidden bg-gray-200">
        <AnimatePresence mode="wait">
          <motion.img
            key={currentImageIndex}
            src={destination.images[currentImageIndex]}
            alt={destination.name}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 w-full h-full object-cover"
          />
        </AnimatePresence>

        {/* Indicadores */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {destination.images.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentImageIndex(idx)}
              className={`w-2 h-2 rounded-full transition-all ${
                idx === currentImageIndex ? "bg-white w-8" : "bg-white/50"
              }`}
            />
          ))}
        </div>

        {/* Botones de acción flotantes */}
        <div className="absolute top-4 right-4 flex gap-2">
          <button
            onClick={toggleFavorite}
            className="p-3 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors shadow-lg"
            aria-label={isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"}
          >
            <Heart
              className={`w-6 h-6 ${
                isFavorite ? "fill-red-500 text-red-500" : "text-gray-700"
              }`}
            />
          </button>
          <button
            onClick={addToRoute}
            className="p-3 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors shadow-lg"
            aria-label="Agregar a ruta"
          >
            <Route className="w-6 h-6 text-gray-700" />
          </button>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Columna principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Título y región */}
            <div>
              <div className="flex items-center gap-2 text-sm text-emerald-600 mb-2">
                <span className="px-3 py-1 bg-emerald-100 rounded-full font-medium">
                  {destination.type}
                </span>
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                {destination.name}
              </h1>
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="w-5 h-5" />
                <span>{destination.region}</span>
              </div>
            </div>

            {/* Descripción */}
            <div className="bg-white rounded-2xl p-6 shadow-soft">
              <h2 className="text-xl font-semibold mb-3">Sobre este lugar</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                {destination.description}
              </p>
              <p className="text-gray-600 leading-relaxed">
                {destination.longDescription}
              </p>
            </div>

            {/* Información práctica */}
            <div className="bg-white rounded-2xl p-6 shadow-soft">
              <h2 className="text-xl font-semibold mb-4">Información práctica</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <Cloud className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                  <div>
                    <div className="font-medium text-gray-900 mb-1">Clima</div>
                    <div className="text-sm text-gray-600">{destination.clima}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Navigation className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                  <div>
                    <div className="font-medium text-gray-900 mb-1">Cómo llegar</div>
                    <div className="text-sm text-gray-600">{destination.comoLlegar}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                  <div>
                    <div className="font-medium text-gray-900 mb-1">Distancia</div>
                    <div className="text-sm text-gray-600">{destination.distancia}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <DollarSign className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                  <div>
                    <div className="font-medium text-gray-900 mb-1">Precio entrada</div>
                    <div className="text-sm text-gray-600">{destination.precioEntrada}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar con mapa */}
          <div className="space-y-6">
            {/* Mapa */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-soft">
              <div className="h-64 bg-gray-200 relative">
                {!mapLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
                  </div>
                )}
                <iframe
                  src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6d-s6Y4c3uGzJ0&q=${destination.coordinates.lat},${destination.coordinates.lng}&zoom=12`}
                  className="w-full h-full"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  onLoad={() => setMapLoaded(true)}
                />
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Ubicación</h3>
                <p className="text-sm text-gray-600">{destination.region}</p>
                <a
                  href={`https://www.google.com/maps?q=${destination.coordinates.lat},${destination.coordinates.lng}`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex items-center gap-2 text-sm text-emerald-600 hover:text-emerald-700"
                >
                  <Navigation className="w-4 h-4" />
                  Abrir en Google Maps
                </a>
              </div>
            </div>

            {/* Acciones rápidas */}
            <div className="bg-white rounded-2xl p-6 shadow-soft space-y-3">
              <h3 className="font-semibold text-gray-900 mb-4">Acciones rápidas</h3>
              <button
                onClick={addToRoute}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-medium"
              >
                <Route className="w-5 h-5" />
                Agregar a mi ruta
              </button>
              <Link
                to="/planificar"
                className="block w-full text-center px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-medium"
              >
                Ver planificador
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

