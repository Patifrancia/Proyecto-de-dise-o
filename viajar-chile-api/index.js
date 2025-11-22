// index.js (ES Modules) — backend Viajar Chile
import "dotenv/config.js";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";

// 🔹 Importar routers
import authRoutes from "./routes/auth.js";
import hotelsRoutes from "./routes/hotels.js";
import searchRoutes from "./routes/search.js";
import staysRoutes from "./routes/stays.js";
import ciudadesRoutes from "./routes/ciudades.js";
import itineraryRoutes from "./routes/itinerary.js";



const app = express();

/* ========= Validaciones de entorno ========= */
const { PORT = 3000, CLIENT_ORIGIN, MONGODB_URI, MONGODB_DB = "rutacl" } = process.env;

if (!MONGODB_URI) {
  console.error("❌ Falta MONGODB_URI en tu archivo .env");
  process.exit(1);
}
if (!CLIENT_ORIGIN) {
  console.warn("⚠️  No se definió CLIENT_ORIGIN en .env (usando http://localhost:5173 por defecto)");
}

/* ========= Diagnóstico de la URI ========= */
const safeUri = MONGODB_URI.replace(/\/\/([^:]+):[^@]+@/, "//$1:<hidden>@");
const schemeOk = MONGODB_URI.startsWith("mongodb://") || MONGODB_URI.startsWith("mongodb+srv://");
console.log("🔎 MONGODB_URI leída:", JSON.stringify(safeUri));
console.log("🔎 Esquema válido (mongodb/mongodb+srv):", schemeOk);

/* ========= Middlewares ========= */
app.use(
  cors({
    origin: CLIENT_ORIGIN || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());

/* ========= Rutas ========= */
app.get("/", (_req, res) => {
  res.send("🚀 API de Viajar Chile funcionando correctamente");
});

app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.use("/api/auth", authRoutes);

// 👇 Endpoints de búsqueda
app.use("/api/search", searchRoutes); // Búsqueda genérica (compatibilidad)
app.use("/api/stays", staysRoutes); // Búsqueda específica de estadías
app.use("/api/ciudades", ciudadesRoutes); // Búsqueda de ciudades/localidades
app.use("/api/hotels", hotelsRoutes); // Búsqueda de hoteles (Booking específico)
app.use("/api/itinerary", itineraryRoutes); // Generación de itinerarios con IA


/* ========= Conexión a MongoDB y arranque ========= */
async function startServer() {
  try {
    mongoose.set("strictQuery", true);
    await mongoose.connect(MONGODB_URI, { dbName: MONGODB_DB });
    console.log("✅ MongoDB conectado:", mongoose.connection.host);

    app.listen(PORT, () =>
      console.log(`🚀 Servidor escuchando en http://localhost:${PORT}`)
    );
  } catch (err) {
    console.error("❌ Error al conectar con MongoDB:", err?.message || err);
    console.error("💡 Tips:");
    console.error("   • Verifica usuario/contraseña del Database User en Atlas.");
    console.error("   • Si tu contraseña tiene símbolos (@ / ? &), usa encodeURIComponent.");
    console.error("   • Revisa Network Access en Atlas (0.0.0.0/0 o tu IP).");
    console.error("   • Confirma que la URI tenga el formato: mongodb+srv://user:pass@host.mongodb.net/rutacl?...");
    process.exit(1);
  }
}

/* ========= Manejo de errores no capturados ========= */
process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Rejection:", reason);
});
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  process.exit(1);
});

startServer();
