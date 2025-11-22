// services/ai.js
// Servicio para generar itinerarios usando OpenAI o Google Gemini
import axios from "axios";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Log de diagnóstico (sin mostrar la key completa)
if (OPENAI_API_KEY) {
  console.log("✅ OPENAI_API_KEY configurada:", OPENAI_API_KEY.substring(0, 7) + "...");
} else if (GEMINI_API_KEY) {
  console.log("✅ GEMINI_API_KEY configurada:", GEMINI_API_KEY.substring(0, 7) + "...");
} else {
  console.warn("⚠️ No hay API de IA configurada");
}

/**
 * Genera un itinerario usando IA (OpenAI o Gemini)
 */
export async function generateItineraryWithAI(destinations) {
  // Verificar que hay API key
  if (!OPENAI_API_KEY && !GEMINI_API_KEY) {
    throw new Error("No hay API de IA configurada. Configura OPENAI_API_KEY o GEMINI_API_KEY en .env");
  }

  if (OPENAI_API_KEY) {
    console.log("🔵 Usando OpenAI para generar itinerario");
  } else if (GEMINI_API_KEY) {
    console.log("🔵 Usando Gemini para generar itinerario");
  }

  const destinationsList = destinations.map(d => d.name).join(" → ");
  
  const prompt = `Eres un experto planificador de viajes en Chile. Genera un itinerario detallado para un viaje por carretera entre estos destinos: ${destinationsList}

Para cada segmento entre destinos consecutivos, proporciona:
1. Hora de salida recomendada (formato HH:MM, considera evitar salir muy temprano o muy tarde)
2. Tiempo estimado de viaje (en formato legible como "2 horas 30 minutos")
3. Distancia aproximada en km
4. Paradas interesantes en el camino (2-3 lugares reales y específicos de Chile con descripción breve)
5. Costo estimado en CLP (desglosado en: combustible, peajes, otros gastos)
6. Alternativas si llueve (4 opciones: museos/centros culturales, mercados/comercios cubiertos, restaurantes/cafés, actividades bajo techo)

Responde SOLO con un JSON válido en este formato exacto:
{
  "segments": [
    {
      "from": "nombre origen",
      "to": "nombre destino",
      "distance": número en km,
      "departureTime": "HH:MM",
      "estimatedTime": "X horas Y minutos",
      "estimatedCost": {
        "total": número,
        "currency": "CLP",
        "fuel": número,
        "tolls": número,
        "other": número
      },
      "stops": [
        {
          "name": "nombre lugar",
          "description": "descripción breve",
          "type": "tipo (gastronomía, mirador, naturaleza, cultura, etc.)"
        }
      ],
      "rainAlternatives": [
        {
          "type": "indoor|covered|alternative",
          "name": "nombre alternativa",
          "description": "descripción",
          "locations": ["ubicación 1", "ubicación 2"]
        }
      ]
    }
  ],
  "summary": {
    "totalDestinations": número,
    "totalEstimatedTime": "X horas Y minutos",
    "totalEstimatedCost": número,
    "currency": "CLP",
    "estimatedDays": número
  }
}

Sé específico con lugares reales de Chile. Usa información precisa sobre distancias y tiempos de viaje en carreteras chilenas.`;

  try {
    // Intentar con OpenAI primero
    if (OPENAI_API_KEY) {
      return await generateWithOpenAI(prompt);
    }
    
    // Si no hay OpenAI, usar Gemini
    if (GEMINI_API_KEY) {
      return await generateWithGemini(prompt);
    }
    
    throw new Error("No hay API de IA configurada. Configura OPENAI_API_KEY o GEMINI_API_KEY en .env");
  } catch (error) {
    console.error("Error al generar con IA:", error.message);
    throw error;
  }
}

/**
 * Genera itinerario usando OpenAI
 */
async function generateWithOpenAI(prompt) {
  try {
    console.log("🔵 Llamando a OpenAI...");
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o-mini", // o "gpt-3.5-turbo" para más económico
        messages: [
          {
            role: "system",
            content: "Eres un experto planificador de viajes en Chile. Responde siempre en formato JSON válido.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
        response_format: { type: "json_object" },
      },
      {
        headers: {
          "Authorization": `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.data?.choices?.[0]?.message?.content) {
      throw new Error("OpenAI no devolvió contenido válido");
    }

    const content = response.data.choices[0].message.content;
    console.log("✅ Respuesta recibida de OpenAI");
    
    try {
      return JSON.parse(content);
    } catch (parseError) {
      console.error("❌ Error al parsear JSON de OpenAI:", parseError);
      console.error("Contenido recibido:", content.substring(0, 200));
      throw new Error("La respuesta de OpenAI no es JSON válido");
    }
  } catch (error) {
    if (error.response) {
      console.error("❌ Error de OpenAI API:", error.response.status, error.response.data);
      throw new Error(`Error de OpenAI: ${error.response.data?.error?.message || error.response.statusText}`);
    }
    throw error;
  }
}

/**
 * Genera itinerario usando Google Gemini
 */
async function generateWithGemini(prompt) {
  try {
    console.log("🔵 Llamando a Gemini...");
    
    // Primero listar modelos disponibles para ver cuál usar
    try {
      const modelsResponse = await axios.get(
        `https://generativelanguage.googleapis.com/v1/models?key=${GEMINI_API_KEY}`
      );
      const availableModels = modelsResponse.data?.models?.filter(m => 
        m.supportedGenerationMethods?.includes("generateContent")
      ) || [];
      console.log("📋 Modelos disponibles:", availableModels.map(m => m.name).join(", "));
    } catch (listError) {
      console.log("⚠️ No se pudieron listar modelos, usando modelo por defecto");
    }
    
    // Usar v1 con gemini-2.5-flash (modelo más reciente)
    const model = "gemini-2.5-flash";
    const url = `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
    
    const response = await axios.post(
      url,
      {
        contents: [
          {
            parts: [
              {
                text: `Eres un experto planificador de viajes en Chile. Responde SOLO con un JSON válido, sin texto adicional, sin markdown, sin explicaciones. Solo el JSON.\n\n${prompt}`,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.7,
        },
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new Error("Gemini no devolvió contenido válido");
    }

    const content = response.data.candidates[0].content.parts[0].text;
    console.log("✅ Respuesta recibida de Gemini");
    
    // Limpiar markdown si viene con ```
    const cleanedContent = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    
    try {
      return JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error("❌ Error al parsear JSON de Gemini:", parseError);
      console.error("Contenido recibido:", cleanedContent.substring(0, 200));
      throw new Error("La respuesta de Gemini no es JSON válido");
    }
  } catch (error) {
    if (error.response) {
      console.error("❌ Error de Gemini API:", error.response.status, error.response.data);
      throw new Error(`Error de Gemini: ${error.response.data?.error?.message || error.response.statusText}`);
    }
    throw error;
  }
}

