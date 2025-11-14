// routes/stays.js
// Endpoint específico para búsqueda de estadías (hoteles, cabañas, hostales, airbnbs)
import { Router } from "express";
import { searchBooking, searchAirbnb, searchTripadvisor } from "../services/providers.js";

const router = Router();

/**
 * GET /api/stays/search?q=...
 * 
 * Busca estadías (hoteles, cabañas, hostales, airbnbs) en múltiples proveedores.
 * 
 * Query params:
 * - q: término de búsqueda (nombre del alojamiento, ciudad o región)
 * 
 * Returns:
 * - items: array de estadías encontradas
 */
router.get("/search", async (req, res) => {
  const q = (req.query.q || "").trim();
  
  // Validar que haya un término de búsqueda
  if (!q || q.length < 2) {
    return res.json({ items: [] });
  }

  try {
    // Ejecutar búsquedas en paralelo en todos los proveedores
    // Usamos Promise.allSettled para que si uno falla, los otros sigan funcionando
    const results = await Promise.allSettled([
      searchBooking(q).catch(() => []),
      searchAirbnb(q).catch(() => []),
      searchTripadvisor(q).catch(() => []),
    ]);

    // Extraer solo los resultados exitosos y que sean arrays
    const items = results
      .map(r => (r.status === "fulfilled" && Array.isArray(r.value) ? r.value : []))
      .flat();

    // Si no hay resultados, devolver array vacío (no fallback demo)
    // El frontend puede manejar esto mostrando un mensaje apropiado
    res.json({ items });
  } catch (error) {
    console.error("❌ Error en /api/stays/search:", error);
    res.status(500).json({ 
      error: "Error al buscar estadías",
      items: [] 
    });
  }
});

export default router;

