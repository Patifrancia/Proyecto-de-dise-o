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
    const response = await axios.get(
      "https://wft-geo-db.p.rapidapi.com/v1/geo/cities",
      {
        params: {
          namePrefix: query,
          countryIds: "CL", // Solo Chile
          limit: 10,
          sort: "-population",
        },
        headers: {
          "x-rapidapi-key": process.env.RAPIDAPI_KEY,
          "x-rapidapi-host": "wft-geo-db.p.rapidapi.com", // ✅ confirmado correcto
        },
      }
    );

    const ciudades = response.data.data.map((c) => ({
      id: c.id,
      nombre: c.name,
      region: c.region,
      lat: c.latitude,
      lon: c.longitude,
    }));

    res.json(ciudades);
  } catch (error) {
    console.error(
      "❌ Error en /api/ciudades:",
      error.response?.data || error.message
    );
    res.status(500).json({ error: "Error al obtener ciudades" });
  }
});

export default router;
