// routes/itinerary.js
// Endpoint para generar itinerarios de viaje con IA (OpenAI o Gemini)
import { Router } from "express";
import { generateItineraryWithAI } from "../services/ai.js";

const router = Router();

// Ruta de prueba para verificar que el router funciona
router.get("/test", (_req, res) => {
  res.json({ message: "Itinerary route is working!" });
});

/**
 * POST /api/itinerary/generate
 * 
 * Genera un itinerario inteligente para una ruta con múltiples destinos en Chile usando IA.
 * Incluye: horas de salida recomendadas, tiempos estimados, paradas interesantes,
 * costos aproximados y alternativas si llueve.
 * 
 * Body:
 * - destinations: array de destinos [{ name, id, region, coordinates? }]
 * 
 * Returns:
 * - segments: array de segmentos del viaje
 * - summary: resumen del viaje completo
 */
router.post("/generate", async (req, res) => {
  const { destinations, language = "es" } = req.body;

  // Validar que haya entre 2 y 5 destinos
  if (!Array.isArray(destinations) || destinations.length < 2 || destinations.length > 5) {
    return res.status(400).json({
      error: "Se requieren entre 2 y 5 destinos para generar un itinerario",
    });
  }

  // Validar idioma (solo permitir es, en, de)
  const validLanguages = ["es", "en", "de"];
  const lang = validLanguages.includes(language) ? language : "es";

  try {
    console.log(`🤖 Generando itinerario con IA para ${destinations.length} destinos en idioma: ${lang}...`);
    console.log(`📍 Destinos: ${destinations.map(d => d.name).join(" → ")}`);
    
    // Verificar que haya API key configurada
    if (!process.env.OPENAI_API_KEY && !process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: "No hay API de IA configurada",
        message: "Configura OPENAI_API_KEY o GEMINI_API_KEY en tu archivo .env",
      });
    }
    
    // Generar itinerario usando IA con el idioma especificado
    const itinerary = await generateItineraryWithAI(destinations, lang);
    
    // Validar estructura básica
    if (!itinerary.segments || !itinerary.summary) {
      console.error("❌ Estructura inválida:", itinerary);
      throw new Error("La IA no generó un formato válido");
    }

    // Agregar timestamp
    itinerary.generatedAt = new Date().toISOString();
    
    console.log(`✅ Itinerario generado exitosamente con ${itinerary.segments.length} segmentos`);
    res.json(itinerary);
  } catch (error) {
    console.error("❌ Error al generar itinerario:", error.message);
    console.error("Stack:", error.stack);
    res.status(500).json({
      error: "Error al generar el itinerario",
      message: error.message,
      hint: "Asegúrate de tener configurado OPENAI_API_KEY o GEMINI_API_KEY en tu archivo .env",
    });
  }
});

export default router;
