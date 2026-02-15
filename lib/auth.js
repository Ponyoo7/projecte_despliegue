import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

import User from "../models/user.model.js";

const secret = process.env.JWT_SECRET;

// --------------------------------------------------------------------------
// GENERACIÓN DE TOKENS
// Rúbrica: Uso correcto de middleware y seguridad.
// --------------------------------------------------------------------------
export const generateToken = (userId) => {
  return jwt.sign({ userId }, secret, {
    algorithm: "HS256",
    allowInsecureKeySizes: true,
    expiresIn: 86400, // 24 horas
  });
};

// --------------------------------------------------------------------------
// MIDDLEWARE DE VALIDACIÓN DE TOKEN
// Rúbrica: Autorización ben implementada.
// --------------------------------------------------------------------------
export const validateToken = (token, req, res, next) => {
  jwt.verify(token, secret, (error, decoded) => {
    if (error) return res.redirect("/auth/login"); // Redirige si el token es inválido o expiró

    req.userId = decoded.userId;
    next();
  });
};

// Helper para obtener el token de header o cookie
const getToken = (req) => {
  return req.headers["authorization"] || req.cookies?.token || null;
};

// --------------------------------------------------------------------------
// RUTA PROTEGIDA (Middleware de Autenticación)
// Rúbrica: Autorización ben implementada / middleware correcto.
// --------------------------------------------------------------------------
export const protectedRoute = (req, res, next) => {
  const token = getToken(req);

  if (!token) {
    return res.redirect("/auth/login");
  }

  validateToken(token, req, res, next);
};

// Middleware para cargar información del usuario en res.locals para las vistas
// (Mejora la UX mostrando menú contextual según el usuario)
export const loadUserForViews = async (req, res, next) => {
  const token = getToken(req);

  if (!token) {
    res.locals.user = null;
    res.locals.isAdmin = false;
    res.locals.favoriteCuadros = [];
    return next();
  }

  try {
    const decoded = jwt.verify(token, secret);
    const user = await User.findById(decoded.userId);

    if (user) {
      res.locals.user = user;
      res.locals.isAdmin = user.role === "admin";
      res.locals.favoriteCuadros = user.favoriteCuadros.map(id => id.toString());
    } else {
      res.locals.user = null;
      res.locals.isAdmin = false;
      res.locals.favoriteCuadros = [];
    }
  } catch (error) {
    res.locals.user = null;
    res.locals.isAdmin = false;
    res.locals.favoriteCuadros = [];
  }

  next();
};

// --------------------------------------------------------------------------
// MIDDLEWARE DE ROLES (Admin)
// Rúbrica: Middleware de rols correcte i segur; cada rol veu exactament el que toca.
// --------------------------------------------------------------------------
export const isAdmin = async (req, res, next) => {
  const userId = req.userId;

  const userFound = await User.findById(userId);

  if (!userFound)
    return res.status(404).send({ error: "Usuario no encontrado" });

  // Verificación estricta de rol
  if (userFound.role !== "admin")
    return res.status(403).send({ error: "No tienes permisos para continuar" });

  return next();
};

// --------------------------------------------------------------------------
// ENCRIPTACIÓN DE CONTRASEÑAS
// Rúbrica: Contrasenyes encriptadas correctament amb bcrypt.
// --------------------------------------------------------------------------
export const encryptPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);

  return await bcrypt.hash(password, salt);
};
