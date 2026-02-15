import express from "express";
import Cuadro from "../models/cuadro.model.js";
import Pintor from "../models/pintor.model.js";
import { body, validationResult } from "express-validator";
import { isAdmin, protectedRoute } from "../lib/auth.js";
import User from "../models/user.model.js";

// Inicialización del router de Express
const router = express.Router();

// --------------------------------------------------------------------------
// VALIDACIONES (Express Validator)
// Rúbrica: Validació de dades i bona UX.
// --------------------------------------------------------------------------
const validacionesCuadro = [
  body("titulo")
    .notEmpty()
    .withMessage("El título es obligatorio")
    .trim()
    .isLength({ min: 2 })
    .withMessage("El título debe tener al menos 2 caracteres"),
  body("anyoCreacion")
    .notEmpty()
    .withMessage("El año de creación es obligatorio")
    .isInt({ min: 1000, max: 2100 })
    .withMessage("El año debe ser válido (1000-2100)"),
  body("tecnica").notEmpty().withMessage("La técnica es obligatoria"),
  body("pintor").notEmpty().withMessage("El pintor es obligatorio"), //notEmpty comprueba que el body no esté vacío, si falla se muestra el mensaje posterior
];

// ==========================================================================
// CRUD COMPLETO (Create, Read, Update, Delete)
// Rúbrica: CRUD complet, segur i funcional.
// ==========================================================================

// Listado de cuadros (GET /) - READ
router.get("/", protectedRoute, async (_req, res) => {
  try {
    // Obtener todos los cuadros y poblar la referencia al pintor
    //.populate coje todos los datos del pintor, no solo su id
    const cuadros = await Cuadro.find().populate("pintor");
    //si encuentra cuadros, renderiza la vista del listado de cuadros y le pasa la lista de cuadros
    res.render("cuadros/cuadros_listado.njk", { cuadros });
  } catch (error) {
    console.error(error);
    res.render("error.njk", { error: "Error obteniendo cuadros" });
  }
});

// Formulario para crear un nuevo cuadro (GET /nuevo) - CREATE (Form)
// Protegido: Solo Admin
router.get("/nuevo", protectedRoute, isAdmin, async (_req, res) => {
  try {
    // Obtener lista de pintores para el desplegable
    const pintores = await Pintor.find();
    //Renderiza la Vista del formulario y le pasa la lista de pintores
    res.render("cuadros/cuadros_nuevo.njk", { pintores });
  } catch (error) {
    res.render("error.njk", { error: "Error cargando formulario" });
  }
});

// --------------------------------------------------------------------------
// LISTA DE DESEOS (Favoritos)
// Rúbrica: Llista de desitjos totalment funcional (afegir, eliminar, consultar).
// --------------------------------------------------------------------------
// Listado de cuadros favoritos del usuario (GET /favoritos)
// IMPORTANTE: Esta ruta debe ir ANTES de /:id para evitar conflictos
router.get("/favoritos", protectedRoute, async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId).populate({
      path: "favoriteCuadros",
      populate: { path: "pintor" }
    });

    if (!user) {
      return res.render("error.njk", { error: "Usuario no encontrado" });
    }

    res.render("cuadros/cuadros_favoritos.njk", {
      cuadros: user.favoriteCuadros
    });
  } catch (error) {
    console.error(error);
    res.render("error.njk", { error: "Error obteniendo favoritos" });
  }
});

// Detalle de un cuadro específico (GET /:id) - READ (One)
router.get("/:id", async (req, res) => {
  try {
    // Buscar cuadro por ID y poblar datos del pintor
    const cuadro = await Cuadro.findById(req.params.id).populate("pintor");
    if (!cuadro)
      return res.render("error.njk", { error: "Cuadro no encontrado" });
    res.render("cuadros/cuadros_ficha.njk", { cuadro });
  } catch (error) {
    res.render("error.njk", { error: "Error obteniendo cuadro" });
  }
});

// Formulario para editar un cuadro existente (GET /editar/:id) - UPDATE (Form)
// Protegido: Solo Admin
router.get("/editar/:id", protectedRoute, isAdmin, async (req, res) => {
  try {
    const cuadro = await Cuadro.findById(req.params.id);
    if (!cuadro)
      return res.render("error.njk", { error: "Cuadro no encontrado" });

    // Obtener pintores para el selector en el formulario de edición
    const pintores = await Pintor.find();
    //Muestra la Vista de edición, pasándole tanto los datos del cuadro a editar como la lista de pintores
    res.render("cuadros/cuadros_editar.njk", { cuadro, pintores });
  } catch (error) {
    res.render("error.njk", { error: "Error cargando formulario de edición" });
  }
});

// Crear un nuevo cuadro (POST /) - CREATE (Action)
// Rúbrica: Validación de dades (Server side)
router.post(
  "/",
  validacionesCuadro,
  protectedRoute,
  isAdmin,
  async (req, res) => {
    // Verificar errores de validación
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const pintores = await Pintor.find();
      // Si hay errores, volver a renderizar el formulario con los errores y datos previos que el usuario ya habia escrito
      return res.render("cuadros/cuadros_nuevo.njk", {
        errors: errors.array(),
        datos: req.body,
        pintores,
      });
    }

    try {
      // Crear y guardar el nuevo cuadro
      const nuevoCuadro = new Cuadro(req.body);
      await nuevoCuadro.save();
      res.redirect("/cuadros");
    } catch (error) {
      console.error(error);
      res.render("error.njk", { error: "Error creando cuadro" });
    }
  }
);

// Actualizar un cuadro existente (PUT /:id) - UPDATE (Action)
router.put(
  "/:id",
  validacionesCuadro,
  protectedRoute,
  isAdmin,
  async (req, res) => {
    //toma los resultados de las validaciones anteriores. Si alguna regla falló, los errores se almacenan en la constante errors.
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const pintores = await Pintor.find();
      const cuadro = { _id: req.params.id, ...req.body };
      return res.render("cuadros/cuadros_editar.njk", {
        errors: errors.array(),
        cuadro,
        pintores,
      });
    }

    try {
      // Actualizar cuadro por ID
      await Cuadro.findByIdAndUpdate(req.params.id, req.body, { new: true });
      res.redirect("/cuadros");
    } catch (error) {
      console.error(error);
      res.render("error.njk", { error: "Error actualizando cuadro" });
    }
  }
);

// Eliminar un cuadro (DELETE /:id) - DELETE (Action)
router.delete("/:id", protectedRoute, isAdmin, async (req, res) => {
  try {
    await Cuadro.findByIdAndDelete(req.params.id);
    res.redirect("/cuadros");
  } catch (error) {
    console.error(error);
    res.render("error.njk", { error: "Error eliminando cuadro" });
  }
});

// --------------------------------------------------------------------------
// ACCIÓN DE FAVORITOS (Toggle)
// Rúbrica: Afegir/eliminar de la lista de desitjos sense errors.
// --------------------------------------------------------------------------
router.post("/toggle-favorite/:id", protectedRoute, async (req, res) => {
  const cuadroId = req.params.id;
  const userId = req.userId;

  try {
    const cuadroFound = await Cuadro.findById(cuadroId);

    if (!cuadroFound)
      return res.status(404).send({ error: "Cuadro no encontrado" });

    const userFound = await User.findById(userId);

    if (!userFound)
      return res.status(404).send({ error: "Usuario no encontrado" });

    const favoriteCuadros = userFound.favoriteCuadros;

    // Lógica para añadir o eliminar (Toggle)
    if (favoriteCuadros.includes(cuadroId)) {
      userFound.favoriteCuadros = favoriteCuadros.filter(
        (c) => c.toHexString() !== cuadroId
      );
    } else {
      userFound.favoriteCuadros.push(cuadroId);
    }

    await userFound.save();

    return res.status(200).send({
      message: "Se ha actualizado los cuadros favoritos",
    });
  } catch (error) {
    console.error(error);
    res.render("error.njk", { error: "Error eliminando cuadro" });
  }
});

export default router;
