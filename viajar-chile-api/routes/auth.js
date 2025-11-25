import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import User from "../models/User.js";

const router = Router();

// Nombre de la cookie donde se guardará el JWT
const COOKIE_NAME = "auth_token";

// Función para firmar el JWT
const sign = (id) =>
  jwt.sign({ uid: id }, process.env.JWT_SECRET, { expiresIn: "7d" });

// Función para setear la cookie de autenticación
function setAuthCookie(res, token) {
  const isProd = process.env.NODE_ENV === "production";

  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,                     // no accesible desde JS (más seguro)
    secure: isProd,                     // solo HTTPS en producción
    sameSite: isProd ? "none" : "lax",  // para front/back en dominios distintos
    maxAge: 7 * 24 * 60 * 60 * 1000,    // 7 días
  });
}

// ===== Middleware: requiere JWT (Authorization: Bearer <token> o cookie) =====
function authRequired(req, res, next) {
  try {
    let token;

    // 1) Intentar sacar el token del header Authorization
    const h = req.headers.authorization || "";
    const parts = h.split(" ");
    if (parts[0] === "Bearer" && parts[1]) {
      token = parts[1];
    }

    // 2) Si no hay en el header, intentar desde la cookie
    if (!token && req.cookies && req.cookies[COOKIE_NAME]) {
      token = req.cookies[COOKIE_NAME];
    }

    if (!token) return res.status(401).json({ error: "Token requerido" });

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.uid = payload.uid;
    next();
  } catch {
    return res.status(401).json({ error: "Token inválido" });
  }
}

// ===== Registro =====
router.post("/register", async (req, res) => {
  try {
    const { nombre = "", correo, password } = req.body || {};
    if (!correo || !password) {
      return res.status(400).json({ error: "Correo y password requeridos" });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: "La contraseña debe tener al menos 6 caracteres",
      });
    }

    const existe = await User.findOne({ correo });
    if (existe)
      return res.status(409).json({ error: "El correo ya está registrado" });

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ nombre, correo, passwordHash });

    const token = sign(user.id);
    // Guardamos el token en cookie
    setAuthCookie(res, token);

    return res.status(201).json({
      user: { id: user.id, nombre: user.nombre, correo: user.correo },
      token, // mantenemos también el token en el JSON para compatibilidad
    });
  } catch (e) {
    console.error("Error en registro:", e);
    if (e.code === 11000) {
      return res.status(409).json({ error: "El correo ya está registrado" });
    }
    return res.status(500).json({ error: "Error en el servidor" });
  }
});

// ===== Login =====
router.post("/login", async (req, res) => {
  try {
    const { correo, password } = req.body || {};
    const user = await User.findOne({ correo });
    if (!user) return res.status(401).json({ error: "Credenciales inválidas" });

    // Si el usuario se registró con Google, no tiene passwordHash
    if (!user.passwordHash) {
      return res.status(401).json({
        error:
          "Esta cuenta se registró con Google. Usa el botón de Google para iniciar sesión.",
      });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: "Credenciales inválidas" });

    const token = sign(user.id);
    // Guardamos el token en cookie
    setAuthCookie(res, token);

    return res.json({
      user: { id: user.id, nombre: user.nombre, correo: user.correo },
      token, // también lo devolvemos como antes
    });
  } catch (e) {
    return res.status(500).json({ error: "Error en el servidor" });
  }
});

// ===== Login/Registro con Google =====
router.post("/google/callback", async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({ error: "Token de Google requerido" });
    }

    // Verificar el token de Google usando google-auth-library
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

    let ticket;
    try {
      ticket = await client.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
    } catch (verifyError) {
      console.error("Error verificando token de Google:", verifyError);
      return res.status(401).json({ error: "Token de Google inválido" });
    }

    const payload = ticket.getPayload();
    const { email, name, picture, sub: googleId } = payload;

    if (!email) {
      return res
        .status(400)
        .json({ error: "No se pudo obtener el correo de Google" });
    }

    // Buscar o crear usuario
    let user = await User.findOne({ correo: email.toLowerCase() });

    if (user) {
      // Si existe, actualizar googleId y avatar si no los tiene
      if (!user.googleId) {
        user.googleId = googleId;
      }
      if (!user.avatar && picture) {
        user.avatar = picture;
      }
      await user.save();
    } else {
      // Crear nuevo usuario
      user = await User.create({
        nombre: name || email.split("@")[0],
        correo: email.toLowerCase(),
        googleId: googleId,
        avatar: picture,
        passwordHash: null, // No tiene contraseña
      });
    }

    const token = sign(user.id);
    // Guardamos el token en cookie
    setAuthCookie(res, token);

    return res.json({
      user: {
        id: user.id,
        nombre: user.nombre,
        correo: user.correo,
        avatar: user.avatar,
      },
      token, // también en cuerpo por compatibilidad
    });
  } catch (e) {
    console.error("Error en Google callback:", e);
    return res.status(500).json({ error: "Error al autenticar con Google" });
  }
});

// ===== Read (lista) — solo para probar, sin password =====
router.get("/users", authRequired, async (_req, res) => {
  const users = await User.find().select("nombre correo createdAt");
  return res.json(users);
});

// ===== Read (by id) =====
router.get("/users/:id", authRequired, async (req, res) => {
  try {
    const u = await User.findById(req.params.id).select(
      "nombre correo createdAt updatedAt"
    );
    if (!u) return res.status(404).json({ error: "Usuario no encontrado" });
    return res.json(u);
  } catch {
    return res.status(400).json({ error: "ID inválido" });
  }
});

// ===== Update (nombre/correo y opcional password) =====
router.put("/users/:id", authRequired, async (req, res) => {
  try {
    const { nombre, correo, password } = req.body || {};

    const data = {};
    if (typeof nombre === "string") data.nombre = nombre;
    if (typeof correo === "string") data.correo = correo;
    if (typeof password === "string" && password.trim()) {
      data.passwordHash = await bcrypt.hash(password, 12);
    }

    // si cambia el correo, validar que no esté usado por otro
    if (data.correo) {
      const repetido = await User.findOne({
        correo: data.correo,
        _id: { $ne: req.params.id },
      });
      if (repetido)
        return res.status(409).json({ error: "El correo ya está en uso" });
    }

    const u = await User.findByIdAndUpdate(req.params.id, data, {
      new: true,
    }).select("nombre correo updatedAt");
    if (!u) return res.status(404).json({ error: "Usuario no encontrado" });

    return res.json(u);
  } catch (e) {
    return res.status(400).json({ error: "Solicitud inválida" });
  }
});

// ===== Delete =====
router.delete("/users/:id", authRequired, async (req, res) => {
  try {
    const u = await User.findByIdAndDelete(req.params.id);
    if (!u) return res.status(404).json({ error: "Usuario no encontrado" });
    return res.json({ ok: true, msg: "Usuario eliminado" });
  } catch {
    return res.status(400).json({ error: "Solicitud inválida" });
  }
});

export default router;
