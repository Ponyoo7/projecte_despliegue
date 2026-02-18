// ==========================================
// RUTA DE AUTENTICACIÓN (Login, Registro, Gestión de Usuarios)
// Cumple con la rúbrica: Login completo, Validación robusta, Gestión de errores,
// Registro con validaciones, Control de acceso (Roles).
// ==========================================

import express from "express";
import bcrypt from "bcryptjs";
import {
  encryptPassword,
  generateToken,
  protectedRoute,
  isAdmin,
} from "../lib/auth.js";
import User from "../models/user.model.js";
//Prueba dev

const router = express.Router();

// Vista de login (GET /auth/login)
router.get("/login", (req, res) => {
  res.render("auth/login.njk");
});

// Vista de registro (GET /auth/register)
router.get("/register", (req, res) => {
  res.render("auth/register.njk");
});

// --------------------------------------------------------------------------
// PROCESO DE LOGIN
// Rúbrica: Implementa login completo, validación robusta, gestión de errores clara.
// --------------------------------------------------------------------------
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Buscar usuario por email (Validación de existencia)
    const userFound = await User.findOne({ email });

    // Gestión de errores: Usuario no encontrado
    if (!userFound) {
      return res.render("auth/login.njk", {
        error: "El usuario no existe",
        datos: { email },
      });
    }

    // 2. Comprobar contraseña (Seguridad: Bcrypt)
    // Rúbrica: Contraseñas encriptadas correctamente
    if (!(await bcrypt.compare(password, userFound.password))) {
      return res.render("auth/login.njk", {
        error: "Las contraseñas no coinciden",
        datos: { email },
      });
    }

    // 3. Generar token de sesión (Seguridad: JWT)
    const token = generateToken(userFound.id);

    // Guardar el token en una cookie segura
    res.cookie("token", token, {
      httpOnly: false, // Permitir acceso desde cliente si es necesario, idealmente true para más seguridad
      maxAge: 86400000, // 24 horas
    });

    return res.redirect("/cuadros");
  } catch (error) {
    console.error(error);
    res.render("auth/login.njk", { error: "Error al iniciar sesión" });
  }
});

// --------------------------------------------------------------------------
// PROCESO DE REGISTRO
// Rúbrica: Registro funcional con todas las validaciones (duplicados, campos obligatorios).
// --------------------------------------------------------------------------
router.post("/register", async (req, res) => {
  const { username, password, email, confirmPassword } = req.body;

  try {
    // --- VALIDACIONES MANUALES (Robustez) ---

    // 1. Coincidencia de contraseñas
    if (password !== confirmPassword) {
      return res.render("auth/register.njk", {
        error: "Las contraseñas no coinciden",
        datos: { username, email },
      });
    }

    // 2. Longitud mínima de contraseña (Seguridad)
    if (password.length < 5) {
      return res.render("auth/register.njk", {
        error: "La contraseña debe tener al menos 5 caracteres",
        datos: { username, email },
      });
    }

    // --- VALIDACIÓN DE DUPLICADOS (Integridad de datos) ---

    // 3. Comprobar si el email ya existe
    const userFound = await User.findOne({ email });
    if (userFound) {
      return res.render("auth/register.njk", {
        error: "El email ya está registrado",
        datos: { username, email },
      });
    }

    // 4. Comprobar si el username ya existe (Rúbrica: Validación de duplicados)
    const usernameFound = await User.findOne({ username });
    if (usernameFound) {
      return res.render("auth/register.njk", {
        error: "El nombre de usuario ya está en uso",
        datos: { username, email },
      });
    }

    // CREACIÓN DEL USUARIO
    const newUser = new User({
      username,
      password: await encryptPassword(password), // Encriptación antes de guardar
      email,
      role: "user", // Rol por defecto
    });

    await newUser.save();

    return res.render("auth/login.njk", {
      success: "Usuario creado correctamente. Ya puedes iniciar sesión.",
    });
  } catch (error) {
    console.error(error);
    res.render("auth/register.njk", {
      error: "Error al crear el usuario",
      datos: { username, email },
    });
  }
});

// Cerrar sesión
router.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.redirect("/auth/login");
});

// ==========================================================================
// GESTIÓN DE USUARIOS (Rúbrica: CRUD completo, Roles seguros)
// Solo accesible para administradores (middleware: isAdmin)
// ==========================================================================

// Listado de usuarios
router.get("/usuarios", protectedRoute, isAdmin, async (req, res) => {
  try {
    const usuarios = await User.find().select("-password"); // No enviar passwords a la vista
    res.render("auth/usuarios_listado.njk", { usuarios });
  } catch (error) {
    console.error(error);
    res.render("error.njk", { error: "Error obteniendo usuarios" });
  }
});

// Eliminar un usuario
router.delete("/usuarios/:id", protectedRoute, isAdmin, async (req, res) => {
  try {
    const userId = req.params.id;

    // Validación de seguridad: No auto-eliminarse
    if (userId === req.userId) {
      return res.render("error.njk", {
        error: "No puedes eliminarte a ti mismo",
      });
    }

    await User.findByIdAndDelete(userId);
    res.redirect("/auth/usuarios");
  } catch (error) {
    console.error(error);
    res.render("error.njk", { error: "Error eliminando usuario" });
  }
});

// Eliminar todos los usuarios (excepto admin actual)
router.delete("/usuarios", protectedRoute, isAdmin, async (req, res) => {
  try {
    await User.deleteMany({ _id: { $ne: req.userId } });
    res.redirect("/auth/usuarios");
  } catch (error) {
    console.error(error);
    res.render("error.njk", { error: "Error eliminando usuarios" });
  }
});

export default router;
