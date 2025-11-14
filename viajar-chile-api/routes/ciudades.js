import express from "express";
import axios from "axios";

const router = express.Router();

/**
 * GET /api/ciudades?query=san
 * Devuelve sugerencias de ciudades o pueblos en Chile que coincidan con el texto buscado.
 */
router.get("/", async (req, res) => {
  const { query } = req.query;

  if (!query || query.length < 2) {
    return res
      .status(400)
      .json({ error: "Falta parámetro 'query' o es muy corto" });
  }

  try {
    // Intentar buscar en la API de RapidAPI
    const response = await axios.get(
      "https://wft-geo-db.p.rapidapi.com/v1/geo/cities",
      {
        params: {
          namePrefix: query,
          countryIds: "CL", // Solo Chile
          limit: 20, // Aumentar límite para obtener más resultados
          sort: "-population",
          types: "CITY,TOWN", // Incluir ciudades y pueblos
        },
        headers: {
          "x-rapidapi-key": process.env.RAPIDAPI_KEY,
          "x-rapidapi-host": "wft-geo-db.p.rapidapi.com",
        },
      }
    );

    // Mapear resultados de la API
    const ciudades = (response.data.data || []).map((c) => ({
      id: c.id,
      nombre: c.name,
      region: c.region || c.regionCode || "Chile",
      lat: c.latitude,
      lon: c.longitude,
      tipo: c.type === "CITY" ? "Ciudad" : c.type === "TOWN" ? "Pueblo" : "Localidad",
    }));

    // Si hay pocos resultados de la API, complementar con datos locales
    if (ciudades.length < 5) {
      const localidadesAdicionales = getLocalidadesChilenas(query);
      // Combinar resultados, evitando duplicados
      const nombresExistentes = new Set(ciudades.map(c => c.nombre.toLowerCase()));
      const adicionales = localidadesAdicionales.filter(
        loc => !nombresExistentes.has(loc.nombre.toLowerCase())
      );
      ciudades.push(...adicionales);
    }

    // Ordenar: primero los que empiezan con la búsqueda, luego los que la contienen
    const queryLower = query.toLowerCase();
    ciudades.sort((a, b) => {
      const aStarts = a.nombre.toLowerCase().startsWith(queryLower);
      const bStarts = b.nombre.toLowerCase().startsWith(queryLower);
      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;
      return a.nombre.localeCompare(b.nombre);
    });

    res.json(ciudades.slice(0, 15)); // Devolver hasta 15 resultados
  } catch (error) {
    console.error(
      "❌ Error en /api/ciudades:",
      error.response?.data || error.message
    );
    
    // Si falla la API, usar datos locales como fallback
    console.log("⚠️ Usando datos locales como fallback");
    const localidades = getLocalidadesChilenas(query);
    res.json(localidades.slice(0, 15));
  }
});

/**
 * Base de datos local de localidades chilenas (ciudades, pueblos, localidades)
 * Se usa como complemento y fallback cuando la API externa no tiene suficientes resultados
 */
function getLocalidadesChilenas(query) {
  const queryLower = query.toLowerCase();
  
  const localidades = [
    // Región de Arica y Parinacota
    { nombre: "Arica", region: "Arica y Parinacota", tipo: "Ciudad", lat: -18.4783, lon: -70.3126 },
    { nombre: "Putre", region: "Arica y Parinacota", tipo: "Pueblo", lat: -18.1967, lon: -69.5567 },
    { nombre: "Camarones", region: "Arica y Parinacota", tipo: "Localidad", lat: -19.0167, lon: -70.0833 },
    
    // Región de Tarapacá
    { nombre: "Iquique", region: "Tarapacá", tipo: "Ciudad", lat: -20.2208, lon: -70.1431 },
    { nombre: "Pica", region: "Tarapacá", tipo: "Pueblo", lat: -20.4833, lon: -69.3333 },
    { nombre: "Pozo Almonte", region: "Tarapacá", tipo: "Pueblo", lat: -20.2667, lon: -69.7833 },
    { nombre: "Huara", region: "Tarapacá", tipo: "Pueblo", lat: -19.9333, lon: -69.7667 },
    
    // Región de Antofagasta
    { nombre: "Antofagasta", region: "Antofagasta", tipo: "Ciudad", lat: -23.6509, lon: -70.3975 },
    { nombre: "Calama", region: "Antofagasta", tipo: "Ciudad", lat: -22.4569, lon: -68.9236 },
    { nombre: "San Pedro de Atacama", region: "Antofagasta", tipo: "Pueblo", lat: -22.9103, lon: -68.2017 },
    { nombre: "Tocopilla", region: "Antofagasta", tipo: "Ciudad", lat: -22.0920, lon: -70.1979 },
    { nombre: "Mejillones", region: "Antofagasta", tipo: "Pueblo", lat: -23.1000, lon: -70.4500 },
    { nombre: "Taltal", region: "Antofagasta", tipo: "Pueblo", lat: -25.4000, lon: -70.4833 },
    { nombre: "Sierra Gorda", region: "Antofagasta", tipo: "Localidad", lat: -22.8833, lon: -69.3167 },
    
    // Región de Atacama
    { nombre: "Copiapó", region: "Atacama", tipo: "Ciudad", lat: -27.3667, lon: -70.3333 },
    { nombre: "Vallenar", region: "Atacama", tipo: "Ciudad", lat: -28.5708, lon: -70.7581 },
    { nombre: "Caldera", region: "Atacama", tipo: "Pueblo", lat: -27.0667, lon: -70.8167 },
    { nombre: "Chañaral", region: "Atacama", tipo: "Pueblo", lat: -26.3500, lon: -70.6167 },
    { nombre: "Huasco", region: "Atacama", tipo: "Pueblo", lat: -28.4667, lon: -71.2167 },
    { nombre: "El Salvador", region: "Atacama", tipo: "Pueblo", lat: -26.2500, lon: -69.6333 },
    { nombre: "Diego de Almagro", region: "Atacama", tipo: "Pueblo", lat: -26.3833, lon: -70.0500 },
    
    // Región de Coquimbo
    { nombre: "La Serena", region: "Coquimbo", tipo: "Ciudad", lat: -29.9027, lon: -71.2519 },
    { nombre: "Coquimbo", region: "Coquimbo", tipo: "Ciudad", lat: -29.9533, lon: -71.3436 },
    { nombre: "Ovalle", region: "Coquimbo", tipo: "Ciudad", lat: -30.6019, lon: -71.1992 },
    { nombre: "Illapel", region: "Coquimbo", tipo: "Ciudad", lat: -31.6333, lon: -71.1667 },
    { nombre: "Vicuña", region: "Coquimbo", tipo: "Pueblo", lat: -30.0333, lon: -70.7167 },
    { nombre: "Pisco Elqui", region: "Coquimbo", tipo: "Pueblo", lat: -30.0833, lon: -70.5167 },
    { nombre: "Andacollo", region: "Coquimbo", tipo: "Pueblo", lat: -30.2333, lon: -71.0833 },
    { nombre: "Monte Patria", region: "Coquimbo", tipo: "Pueblo", lat: -30.7000, lon: -70.9500 },
    { nombre: "Combarbalá", region: "Coquimbo", tipo: "Pueblo", lat: -31.1833, lon: -71.0500 },
    
    // Región de Valparaíso
    { nombre: "Valparaíso", region: "Valparaíso", tipo: "Ciudad", lat: -33.0472, lon: -71.6127 },
    { nombre: "Viña del Mar", region: "Valparaíso", tipo: "Ciudad", lat: -33.0246, lon: -71.5518 },
    { nombre: "Quilpué", region: "Valparaíso", tipo: "Ciudad", lat: -33.0472, lon: -71.4425 },
    { nombre: "Villa Alemana", region: "Valparaíso", tipo: "Ciudad", lat: -33.0422, lon: -71.3733 },
    { nombre: "San Antonio", region: "Valparaíso", tipo: "Ciudad", lat: -33.5833, lon: -71.6167 },
    { nombre: "Los Andes", region: "Valparaíso", tipo: "Ciudad", lat: -32.8333, lon: -70.6000 },
    { nombre: "San Felipe", region: "Valparaíso", tipo: "Ciudad", lat: -32.7500, lon: -70.7167 },
    { nombre: "Quillota", region: "Valparaíso", tipo: "Ciudad", lat: -32.8833, lon: -71.2500 },
    { nombre: "La Calera", region: "Valparaíso", tipo: "Ciudad", lat: -32.7833, lon: -71.2167 },
    { nombre: "Limache", region: "Valparaíso", tipo: "Ciudad", lat: -33.0167, lon: -71.2667 },
    { nombre: "Olmué", region: "Valparaíso", tipo: "Pueblo", lat: -33.0000, lon: -71.1833 },
    { nombre: "Calle Larga", region: "Valparaíso", tipo: "Pueblo", lat: -32.8500, lon: -70.6333 },
    { nombre: "Rinconada", region: "Valparaíso", tipo: "Pueblo", lat: -32.8333, lon: -70.7000 },
    
    // Región Metropolitana
    { nombre: "Santiago", region: "Región Metropolitana", tipo: "Ciudad", lat: -33.4489, lon: -70.6693 },
    { nombre: "Puente Alto", region: "Región Metropolitana", tipo: "Ciudad", lat: -33.6103, lon: -70.5758 },
    { nombre: "Maipú", region: "Región Metropolitana", tipo: "Ciudad", lat: -33.5111, lon: -70.7586 },
    { nombre: "San Bernardo", region: "Región Metropolitana", tipo: "Ciudad", lat: -33.5925, lon: -70.7000 },
    { nombre: "La Florida", region: "Región Metropolitana", tipo: "Ciudad", lat: -33.5167, lon: -70.6000 },
    { nombre: "Las Condes", region: "Región Metropolitana", tipo: "Ciudad", lat: -33.4167, lon: -70.5500 },
    { nombre: "Providencia", region: "Región Metropolitana", tipo: "Ciudad", lat: -33.4333, lon: -70.6167 },
    { nombre: "Ñuñoa", region: "Región Metropolitana", tipo: "Ciudad", lat: -33.4500, lon: -70.6000 },
    { nombre: "San Miguel", region: "Región Metropolitana", tipo: "Ciudad", lat: -33.5000, lon: -70.6500 },
    { nombre: "La Reina", region: "Región Metropolitana", tipo: "Ciudad", lat: -33.4500, lon: -70.5500 },
    { nombre: "Colina", region: "Región Metropolitana", tipo: "Pueblo", lat: -33.2000, lon: -70.6833 },
    { nombre: "Lampa", region: "Región Metropolitana", tipo: "Pueblo", lat: -33.2833, lon: -70.9000 },
    { nombre: "Pirque", region: "Región Metropolitana", tipo: "Pueblo", lat: -33.6333, lon: -70.5500 },
    { nombre: "San José de Maipo", region: "Región Metropolitana", tipo: "Pueblo", lat: -33.6333, lon: -70.3667 },
    
    // Región de O'Higgins
    { nombre: "Rancagua", region: "O'Higgins", tipo: "Ciudad", lat: -34.1708, lon: -70.7444 },
    { nombre: "San Fernando", region: "O'Higgins", tipo: "Ciudad", lat: -34.5833, lon: -70.9833 },
    { nombre: "Rengo", region: "O'Higgins", tipo: "Ciudad", lat: -34.4167, lon: -70.8667 },
    { nombre: "Santa Cruz", region: "O'Higgins", tipo: "Pueblo", lat: -34.6333, lon: -71.3667 },
    { nombre: "Pichilemu", region: "O'Higgins", tipo: "Pueblo", lat: -34.3833, lon: -72.0167 },
    { nombre: "Machalí", region: "O'Higgins", tipo: "Pueblo", lat: -34.1833, lon: -70.6500 },
    { nombre: "Graneros", region: "O'Higgins", tipo: "Pueblo", lat: -34.0667, lon: -70.7333 },
    { nombre: "Codegua", region: "O'Higgins", tipo: "Pueblo", lat: -34.0333, lon: -70.6667 },
    { nombre: "Requínoa", region: "O'Higgins", tipo: "Pueblo", lat: -34.2833, lon: -70.8167 },
    
    // Región del Maule
    { nombre: "Talca", region: "Maule", tipo: "Ciudad", lat: -35.4267, lon: -71.6556 },
    { nombre: "Curicó", region: "Maule", tipo: "Ciudad", lat: -34.9833, lon: -71.2333 },
    { nombre: "Linares", region: "Maule", tipo: "Ciudad", lat: -35.8500, lon: -71.6000 },
    { nombre: "Constitución", region: "Maule", tipo: "Ciudad", lat: -35.3333, lon: -72.4167 },
    { nombre: "Cauquenes", region: "Maule", tipo: "Ciudad", lat: -35.9667, lon: -72.3167 },
    { nombre: "Molina", region: "Maule", tipo: "Pueblo", lat: -35.1167, lon: -71.2833 },
    { nombre: "San Clemente", region: "Maule", tipo: "Pueblo", lat: -35.5333, lon: -71.4833 },
    { nombre: "Villa Alegre", region: "Maule", tipo: "Pueblo", lat: -35.6667, lon: -71.7333 },
    { nombre: "Yerbas Buenas", region: "Maule", tipo: "Pueblo", lat: -35.7500, lon: -71.5833 },
    
    // Región de Ñuble
    { nombre: "Chillán", region: "Ñuble", tipo: "Ciudad", lat: -36.6067, lon: -72.1033 },
    { nombre: "Bulnes", region: "Ñuble", tipo: "Pueblo", lat: -36.7333, lon: -72.3000 },
    { nombre: "Quirihue", region: "Ñuble", tipo: "Pueblo", lat: -36.2833, lon: -72.5333 },
    { nombre: "Cobquecura", region: "Ñuble", tipo: "Pueblo", lat: -36.1333, lon: -72.7833 },
    { nombre: "Coelemu", region: "Ñuble", tipo: "Pueblo", lat: -36.4833, lon: -72.7000 },
    
    // Región del Biobío
    { nombre: "Concepción", region: "Biobío", tipo: "Ciudad", lat: -36.8201, lon: -73.0444 },
    { nombre: "Talcahuano", region: "Biobío", tipo: "Ciudad", lat: -36.7249, lon: -73.1169 },
    { nombre: "Los Ángeles", region: "Biobío", tipo: "Ciudad", lat: -37.4667, lon: -72.3500 },
    { nombre: "Coronel", region: "Biobío", tipo: "Ciudad", lat: -37.0167, lon: -73.1333 },
    { nombre: "Lota", region: "Biobío", tipo: "Ciudad", lat: -37.0833, lon: -73.1667 },
    { nombre: "Penco", region: "Biobío", tipo: "Pueblo", lat: -36.7333, lon: -72.9833 },
    { nombre: "Tomé", region: "Biobío", tipo: "Pueblo", lat: -36.6167, lon: -72.9667 },
    { nombre: "Arauco", region: "Biobío", tipo: "Pueblo", lat: -37.2500, lon: -73.3167 },
    { nombre: "Lebu", region: "Biobío", tipo: "Pueblo", lat: -37.6167, lon: -73.6500 },
    { nombre: "Cañete", region: "Biobío", tipo: "Pueblo", lat: -37.8000, lon: -73.4000 },
    { nombre: "Yumbel", region: "Biobío", tipo: "Pueblo", lat: -37.0833, lon: -72.5667 },
    
    // Región de La Araucanía
    { nombre: "Temuco", region: "La Araucanía", tipo: "Ciudad", lat: -38.7359, lon: -72.5904 },
    { nombre: "Villarrica", region: "La Araucanía", tipo: "Ciudad", lat: -39.2833, lon: -72.2333 },
    { nombre: "Pucón", region: "La Araucanía", tipo: "Pueblo", lat: -39.2833, lon: -71.9667 },
    { nombre: "Angol", region: "La Araucanía", tipo: "Ciudad", lat: -37.8000, lon: -72.7167 },
    { nombre: "Victoria", region: "La Araucanía", tipo: "Ciudad", lat: -38.2167, lon: -72.3333 },
    { nombre: "Lautaro", region: "La Araucanía", tipo: "Pueblo", lat: -38.5167, lon: -72.4500 },
    { nombre: "Nueva Imperial", region: "La Araucanía", tipo: "Pueblo", lat: -38.7333, lon: -72.9500 },
    { nombre: "Carahue", region: "La Araucanía", tipo: "Pueblo", lat: -38.7000, lon: -73.1667 },
    { nombre: "Cunco", region: "La Araucanía", tipo: "Pueblo", lat: -38.9333, lon: -72.0333 },
    { nombre: "Curarrehue", region: "La Araucanía", tipo: "Pueblo", lat: -39.3500, lon: -71.5833 },
    { nombre: "Melipeuco", region: "La Araucanía", tipo: "Pueblo", lat: -38.8500, lon: -71.6833 },
    { nombre: "Lonquimay", region: "La Araucanía", tipo: "Pueblo", lat: -38.4333, lon: -71.2333 },
    
    // Región de Los Ríos
    { nombre: "Valdivia", region: "Los Ríos", tipo: "Ciudad", lat: -39.8142, lon: -73.2459 },
    { nombre: "La Unión", region: "Los Ríos", tipo: "Ciudad", lat: -40.2833, lon: -73.0833 },
    { nombre: "Río Bueno", region: "Los Ríos", tipo: "Pueblo", lat: -40.3167, lon: -72.9667 },
    { nombre: "Panguipulli", region: "Los Ríos", tipo: "Pueblo", lat: -39.6500, lon: -72.3333 },
    { nombre: "Los Lagos", region: "Los Ríos", tipo: "Pueblo", lat: -39.8667, lon: -72.8333 },
    { nombre: "Futrono", region: "Los Ríos", tipo: "Pueblo", lat: -40.1333, lon: -72.4000 },
    { nombre: "Lago Ranco", region: "Los Ríos", tipo: "Pueblo", lat: -40.3167, lon: -72.5000 },
    { nombre: "Mariquina", region: "Los Ríos", tipo: "Pueblo", lat: -39.5167, lon: -73.0000 },
    
    // Región de Los Lagos
    { nombre: "Puerto Montt", region: "Los Lagos", tipo: "Ciudad", lat: -41.4717, lon: -72.9369 },
    { nombre: "Osorno", region: "Los Lagos", tipo: "Ciudad", lat: -40.5769, lon: -73.1142 },
    { nombre: "Castro", region: "Los Lagos", tipo: "Ciudad", lat: -42.4833, lon: -73.7667 },
    { nombre: "Ancud", region: "Los Lagos", tipo: "Ciudad", lat: -41.8667, lon: -73.8167 },
    { nombre: "Puerto Varas", region: "Los Lagos", tipo: "Pueblo", lat: -41.3167, lon: -72.9833 },
    { nombre: "Frutillar", region: "Los Lagos", tipo: "Pueblo", lat: -41.1167, lon: -73.0500 },
    { nombre: "Calbuco", region: "Los Lagos", tipo: "Pueblo", lat: -41.7667, lon: -73.1333 },
    { nombre: "Maullín", region: "Los Lagos", tipo: "Pueblo", lat: -41.6167, lon: -73.6000 },
    { nombre: "Chonchi", region: "Los Lagos", tipo: "Pueblo", lat: -42.6167, lon: -73.7833 },
    { nombre: "Quellón", region: "Los Lagos", tipo: "Pueblo", lat: -43.1167, lon: -73.6167 },
    { nombre: "Dalcahue", region: "Los Lagos", tipo: "Pueblo", lat: -42.3667, lon: -73.6500 },
    { nombre: "Quemchi", region: "Los Lagos", tipo: "Pueblo", lat: -42.1333, lon: -73.4833 },
    { nombre: "Achao", region: "Los Lagos", tipo: "Pueblo", lat: -42.4833, lon: -73.4833 },
    
    // Región de Aysén
    { nombre: "Coyhaique", region: "Aysén", tipo: "Ciudad", lat: -45.5752, lon: -72.0662 },
    { nombre: "Puerto Aysén", region: "Aysén", tipo: "Pueblo", lat: -45.4000, lon: -72.7000 },
    { nombre: "Puerto Chacabuco", region: "Aysén", tipo: "Pueblo", lat: -45.4667, lon: -72.8167 },
    { nombre: "Chile Chico", region: "Aysén", tipo: "Pueblo", lat: -46.5500, lon: -71.7000 },
    { nombre: "Cochrane", region: "Aysén", tipo: "Pueblo", lat: -47.2500, lon: -72.5667 },
    { nombre: "Villa O'Higgins", region: "Aysén", tipo: "Pueblo", lat: -48.4667, lon: -72.5667 },
    { nombre: "Tortel", region: "Aysén", tipo: "Pueblo", lat: -47.8000, lon: -73.5333 },
    { nombre: "Puerto Cisnes", region: "Aysén", tipo: "Pueblo", lat: -44.7500, lon: -72.7000 },
    
    // Región de Magallanes
    { nombre: "Punta Arenas", region: "Magallanes", tipo: "Ciudad", lat: -53.1638, lon: -70.9171 },
    { nombre: "Puerto Natales", region: "Magallanes", tipo: "Ciudad", lat: -51.7333, lon: -72.5167 },
    { nombre: "Porvenir", region: "Magallanes", tipo: "Pueblo", lat: -53.3000, lon: -70.3667 },
    { nombre: "Puerto Williams", region: "Magallanes", tipo: "Pueblo", lat: -54.9333, lon: -67.6167 },
    { nombre: "Puerto Edén", region: "Magallanes", tipo: "Pueblo", lat: -49.1333, lon: -74.4167 },
    { nombre: "Torres del Paine", region: "Magallanes", tipo: "Localidad", lat: -50.9423, lon: -73.4068 },
  ];

  // Filtrar localidades que coincidan con la búsqueda
  return localidades
    .filter(loc => 
      loc.nombre.toLowerCase().includes(queryLower) ||
      loc.region.toLowerCase().includes(queryLower) ||
      loc.tipo.toLowerCase().includes(queryLower)
    )
    .map(loc => ({
      id: loc.nombre.toLowerCase().replace(/\s+/g, "-"),
      nombre: loc.nombre,
      region: loc.region,
      tipo: loc.tipo,
      lat: loc.lat,
      lon: loc.lon,
    }));
}

export default router;
