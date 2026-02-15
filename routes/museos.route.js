import express from "express";
import { Museo } from "../models/museo.model.js";
import { body, validationResult } from "express-validator";

// Creamos un router de Express para definir las rutas específicas de "museos"
const router = express.Router();

// Listado de museos (GET /)
// Esta ruta devuelve una lista de todos los museos almacenados en la base de datos
router.get("/", async (_req, res) => {
  try {
    // Busca todos los museos en la base de datos
    const museos = await Museo.find();
    res.status(200).send(museos);
  } catch (error) {
    console.error(error);
    res.status(503).send({ error: "Error obteniendo museos" });
  }
});

// Detalle de un museo (GET /:id)
// Devuelve un museo concreto según su ID
router.get("/:id", async (req, res) => {
  // Extraemos el parámetro 'id' de la URL
  const { id } = req.params;

  try {
    // Buscamos el museo por su ID
    const museo = await Museo.findById(id);

    if (!museo) return res.status(400).send({ error: "Museo no encontrado" });

    res.status(200).send(museo);
  } catch (error) {
    res.status(503).send({ error: "Error obteniendo museo" });
  }
});

// Validaciones para museos
const validacionesMuseo = [
  body("nombre")
    .notEmpty()
    .withMessage("El nombre es obligatorio")
    .trim()
    .isLength({ min: 1 }),
  body("ciudad")
    .notEmpty()
    .withMessage("La ciudad es obligatoria")
    .trim()
    .isLength({ min: 1 }),
];

// Crear museo (POST /)
// Crea un nuevo museo en la base de datos
router.post("/", validacionesMuseo, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).send({ errors: errors.array() });
  }

  try {
    // Obtenemos el cuerpo (body) del request
    const { body } = req;

    // Creamos una nueva instancia del modelo "Museo" con los datos recibidos
    const museoCreado = new Museo({ ...body });
    // Guardamos el nuevo museo en la base de datos
    const museo = await museoCreado.save();

    res.status(200).send(museo);
  } catch (error) {
    console.error(error);
    res.status(503).send({ error: "Error creando museo" });
  }
});

// Actualizar museo (PUT /:id)
// Modifica un museo existente (según su ID)
router.put("/:id", validacionesMuseo, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).send({ errors: errors.array() });
  }

  try {
    const { body } = req;
    const { id } = req.params;

    // Comprobamos si el museo existe
    const museoFound = await Museo.findById(id);

    if (!museoFound)
      return res.status(400).send({ error: "Museo no encontrado" });

    // Actualizamos el museo con los nuevos datos y devolvemos el documento actualizado
    const museo = await Museo.findByIdAndUpdate(id, { ...body }, { new: true });

    res.status(200).send(museo);
  } catch (error) {
    console.error(error);
    res.status(503).send({ error: "Error modificando el museo" });
  }
});

// Eliminar museo (DELETE /:id)
// Elimina un museo por su ID
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Comprobamos si el museo existe antes de eliminarlo
    const museoFound = await Museo.findById(id);

    if (!museoFound)
      return res.status(400).send({ error: "Museo no encontrado" });

    // Eliminamos el museo de la base de datos
    await Museo.findByIdAndDelete(id);

    res.status(200).send({ success: true });
  } catch (error) {
    console.error(error);
    res.status(503).send({ error: "Error eliminando el museo" });
  }
});

// Exportamos el router para usarlo en el archivo principal (index.js)
export default router;
