import express from "express";
import { Exposicion } from "../models/exposicion.model.js";
import { body, validationResult } from "express-validator";

// Creamos un router de Express para definir las rutas específicas de "exposiciones"
const router = express.Router();

// Listado de exposiciones (GET /)
// Esta ruta devuelve una lista de todas las exposiciones almacenadas en la base de datos
router.get("/", async (_req, res) => {
  try {
    // Busca todas las exposiciones y "populate" rellena los datos del museo y los cuadros relacionados
    const exposiciones = await Exposicion.find().populate("museo").populate("cuadros");
    res.status(200).send(exposiciones);
  } catch (error) {
    console.error(error);
    res.status(503).send({ error: "Error obteniendo exposiciones" });
  }
});

// Detalle de una exposición (GET /:id)
// Devuelve una exposición concreta según su ID
router.get("/:id", async (req, res) => {
  // Extraemos el parámetro 'id' de la URL
  const { id } = req.params;

  try {
    // Buscamos la exposición por su ID y también rellenamos sus referencias
    const exposicion = await Exposicion.findById(id).populate("museo").populate("cuadros");

    if (!exposicion)
      return res.status(400).send({ error: "Exposición no encontrada" });

    res.status(200).send(exposicion);
  } catch (error) {
    res.status(503).send({ error: "Error obteniendo exposición" });
  }
});

// Validaciones para exposiciones
const validacionesExposicion = [
  body('nombre').notEmpty().withMessage('El nombre es obligatorio').trim().isLength({ min: 1 }),
  body('fechaInicio').notEmpty().withMessage('La fecha de inicio es obligatoria').isISO8601().withMessage('Formato de fecha inválido'),
  body('fechaFin').notEmpty().withMessage('La fecha de fin es obligatoria').isISO8601().withMessage('Formato de fecha inválido'),
  body('museo').notEmpty().withMessage('El museo es obligatorio').isMongoId().withMessage('ID de museo inválido')
];

// Crear exposición (POST /)
// Crea una nueva exposición en la base de datos
router.post("/", validacionesExposicion, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).send({ errors: errors.array() });
  }

  try {
    // Obtenemos el cuerpo (body) del request
    const { body } = req;

    // Creamos una nueva instancia del modelo "Exposicion" con los datos recibidos
    const exposicionCreada = new Exposicion({ ...body });
    // Guardamos la nueva exposición en la base de datos
    const exposicion = await exposicionCreada.save();

    res.status(200).send(exposicion);
  } catch (error) {
    console.error(error);
    res.status(503).send({ error: "Error creando exposición" });
  }
});

// Actualizar exposición (PUT /:id)
// Modifica una exposición existente (según su ID)
router.put("/:id", validacionesExposicion, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).send({ errors: errors.array() });
  }

  try {
    const { body } = req;
    const { id } = req.params;

    // Comprobamos si la exposición existe
    const exposicionFound = await Exposicion.findById(id);

    if (!exposicionFound)
      return res.status(400).send({ error: "Exposición no encontrada" });

    // Actualizamos la exposición con los nuevos datos y devolvemos el documento actualizado
    const exposicion = await Exposicion.findByIdAndUpdate(id, { ...body }, { new: true });

    res.status(200).send(exposicion);
  } catch (error) {
    console.error(error);
    res.status(503).send({ error: "Error modificando la exposición" });
  }
});

// Eliminar exposición (DELETE /:id)
// Elimina una exposición por su ID
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Comprobamos si la exposición existe antes de eliminarla
    const exposicionFound = await Exposicion.findById(id);

    if (!exposicionFound)
      return res.status(400).send({ error: "Exposición no encontrada" });

    // Eliminamos la exposición de la base de datos
    await Exposicion.findByIdAndDelete(id);

    res.status(200).send({ success: true });
  } catch (error) {
    console.error(error);
    res.status(503).send({ error: "Error eliminando la exposición" });
  }
});

// Exportamos el router para usarlo en el archivo principal (index.js)
export default router;

