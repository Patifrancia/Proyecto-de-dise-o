import { Router } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = Router();

// Middleware: requiere JWT
function authRequired(req, res, next) {
  try {
    const h = req.headers.authorization || "";
    const [, token] = h.split(" ");
    if (!token) return res.status(401).json({ error: "Token requerido" });
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.uid = payload.uid;
    next();
  } catch {
    return res.status(401).json({ error: "Token inválido" });
  }
}

// ===== Obtener todos los favoritos del usuario =====
router.get("/", authRequired, async (req, res) => {
  try {
    const user = await User.findById(req.uid);
    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }
    res.json({ favorites: user.favorites || [] });
  } catch (err) {
    console.error("Error obteniendo favoritos:", err);
    res.status(500).json({ error: "Error al obtener favoritos" });
  }
});

// ===== Agregar un favorito =====
router.post("/add", authRequired, async (req, res) => {
  try {
    const { favorite } = req.body;
    
    if (!favorite || !favorite.id) {
      return res.status(400).json({ error: "Falta información del lugar" });
    }

    const user = await User.findById(req.uid);
    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    // Verificar si ya existe
    const exists = user.favorites.some(fav => fav.id === favorite.id);
    if (exists) {
      return res.status(400).json({ error: "Este lugar ya está en favoritos" });
    }

    // Agregar a favoritos
    user.favorites.push(favorite);
    await user.save();

    res.json({ message: "Lugar agregado a favoritos", favorites: user.favorites });
  } catch (err) {
    console.error("Error agregando favorito:", err);
    res.status(500).json({ error: "Error al agregar favorito" });
  }
});

// ===== Eliminar un favorito =====
router.delete("/:id", authRequired, async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(req.uid);
    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    // Filtrar para remover el favorito
    user.favorites = user.favorites.filter(fav => fav.id !== id);
    await user.save();

    res.json({ message: "Lugar eliminado de favoritos", favorites: user.favorites });
  } catch (err) {
    console.error("Error eliminando favorito:", err);
    res.status(500).json({ error: "Error al eliminar favorito" });
  }
});

// ===== Verificar si un lugar es favorito =====
router.get("/check/:id", authRequired, async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(req.uid);
    
    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    const isFavorite = user.favorites.some(fav => fav.id === id);
    res.json({ isFavorite });
  } catch (err) {
    console.error("Error verificando favorito:", err);
    res.status(500).json({ error: "Error al verificar favorito" });
  }
});

export default router;
