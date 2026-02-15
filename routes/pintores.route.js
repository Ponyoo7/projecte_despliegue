import express from "express";
import Pintor from "../models/pintor.model.js";
import { body, validationResult } from "express-validator";
import { isAdmin, protectedRoute } from "../lib/auth.js";

// Creamos un router de Express para definir las rutas específicas de "pintores"
const router = express.Router();

// Validaciones para el formulario de pintores
const validacionesPintor = [
  body("nombre")
    .notEmpty()
    .withMessage("El nombre es obligatorio")
    .trim()
    .isLength({ min: 3 })
    .withMessage("El nombre debe tener al menos 3 caracteres"),
  body("estiloArtistico")
    .notEmpty()
    .withMessage("El estilo artístico es obligatorio")
    .trim(),
  body("fechaNacimiento")
    .notEmpty()
    .withMessage("La fecha de nacimiento es obligatoria")
    .trim(),
];

// Listado de pintores (GET /)
// Esta ruta devuelve una lista de todos los pintores almacenados en la base de datos
router.get("/", async (_req, res) => {
  try {
    // Busca todos los pintores en la base de datos
    const pintores = await Pintor.find();
    res.render("pintores/pintores_listado.njk", { pintores: pintores });
  } catch (error) {
    console.error(error);
    res.render("error.njk", { error: "Error obteniendo pintores" });
  }
});

// Formulario de nuevo pintor (GET /nuevo)
// Ruta para mostrar el formulario de creación
router.get("/nuevo", protectedRoute, isAdmin, (_req, res) => {
  res.render("pintores/pintores_nuevo.njk");
});

// Detalle de un pintor (GET /:id)
// Devuelve un pintor concreto según su ID
router.get("/:id", async (req, res) => {
  // Extraemos el parámetro 'id' de la URL
  const { id } = req.params;

  try {
    // Buscamos el pintor por su ID
    const pintor = await Pintor.findById(id);

    if (!pintor)
      return res.render("error.njk", { error: "Pintor no encontrado" });

    res.render("pintores/pintores_ficha.njk", { pintor: pintor });
  } catch (error) {
    res.render("error.njk", { error: "Error obteniendo pintor" });
  }
});

// Formulario de edición (GET /editar/:id)
// Ruta para mostrar el formulario de edición
router.get("/editar/:id", protectedRoute, isAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const pintor = await Pintor.findById(id);
    if (!pintor)
      return res.render("error.njk", { error: "Pintor no encontrado" });
    res.render("pintores/pintores_editar.njk", { pintor });
  } catch (error) {
    res.render("error.njk", {
      error: "Error al cargar el formulario de edición",
    });
  }
});

// Crear pintor (POST /)
// Crea un nuevo pintor en la base de datos
router.post(
  "/",
  validacionesPintor,
  protectedRoute,
  isAdmin,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render("pintores/pintores_nuevo.njk", {
        errors: errors.array(),
        datos: req.body,
      });
    }

    try {
      const { body } = req;

      // Creamos una nueva instancia del modelo "Pintor" con los datos recibidos
      const pintorCreado = new Pintor({ ...body });
      // Guardamos el nuevo pintor en la base de datos
      await pintorCreado.save();

      res.redirect("/pintores");
    } catch (error) {
      console.error(error);
      res.render("error.njk", { error: "Error creando pintor" });
    }
  }
);

// Actualizar pintor (PUT /:id)
// Modifica un pintor existente (PUT)
router.put(
  "/:id",
  validacionesPintor,
  protectedRoute,
  isAdmin,
  async (req, res) => {
    const { id } = req.params;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      // Si hay errores, volvemos a renderizar el formulario de edición
      // Necesitamos pasar el id y los datos del body para repoblar el formulario
      const pintor = { _id: id, ...req.body };
      return res.render("pintores/pintores_editar.njk", {
        errors: errors.array(),
        pintor: pintor,
      });
    }

    try {
      const { body } = req;

      // Comprobamos si el pintor existe
      const pintorFound = await Pintor.findById(id);

      if (!pintorFound)
        return res.render("error.njk", { error: "Pintor no encontrado" });

      // Actualizamos el pintor con los nuevos datos y devolvemos el documento actualizado
      await Pintor.findByIdAndUpdate(id, { ...body }, { new: true });

      res.redirect("/pintores");
    } catch (error) {
      console.error(error);
      res.render("error.njk", { error: "Error modificando el pintor" });
    }
  }
);

// Eliminar pintor (DELETE /:id)
// Elimina un pintor por su ID
router.delete("/:id", protectedRoute, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Comprobamos si el pintor existe antes de eliminarlo
    const pintorFound = await Pintor.findById(id);

    if (!pintorFound)
      return res.render("error.njk", { error: "Pintor no encontrado" });

    // Eliminamos el pintor de la base de datos
    await Pintor.findByIdAndDelete(id);

    res.redirect("/pintores");
  } catch (error) {
    console.error(error);
    res.render("error.njk", { error: "Error eliminando el pintor" });
  }
});

// Exportamos el router para usarlo en el archivo principal (index.js)
export default router;
