// Librerías externas
import mongoose from "mongoose"; // Librería para modelar objetos de MongoDB
import express from "express"; // Framework web para Node.js
import nunjucks from "nunjucks"; // Motor de plantillas
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// Configuración para obtener __dirname en módulos ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Imports de rutas del proyecto
import cuadrosRouter from "./routes/cuadros.route.js";
import exposicionesRouter from "./routes/exposiciones.route.js";
import museosRouter from "./routes/museos.route.js";
import pintoresRouter from "./routes/pintores.route.js";
import authRouter from "./routes/auth.route.js";

import methodOverride from "method-override"; // Middleware para soportar PUT y DELETE en formularios HTML
import { initializeDB } from "./lib/db.js";

// Conexión a la base de datos MongoDB
initializeDB();

// Inicialización de la aplicación Express
let app = express();

// Configuración del motor de plantillas Nunjucks
nunjucks.configure(join(__dirname, "views"), {
  autoescape: true, // Escapar HTML automáticamente por seguridad
  express: app, // Asignar la instancia de express
});

// Establecer 'njk' como el motor de vistas predeterminado
app.set("view engine", "njk");

// Middleware para parsear JSON y datos de formularios
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware para parsear cookies
import cookieParser from "cookie-parser";
app.use(cookieParser());

// Middleware para sobreescribir métodos HTTP (para usar PUT y DELETE desde formularios)
app.use(
  methodOverride(function (req, res) {
    if (req.body && typeof req.body === "object" && "_method" in req.body) {
      // Busca la propiedad _method en el cuerpo de la petición y la usa como método HTTP
      let method = req.body._method;
      delete req.body._method;
      return method;
    }
  })
);

// Configuración de archivos estáticos (CSS, imágenes, JS del cliente)
app.use("/public", express.static(__dirname + "/public"));
app.use(express.static(__dirname + "/node_modules/bootstrap/dist")); // Servir Bootstrap

// Middleware para cargar info del usuario en las vistas
import { loadUserForViews } from "./lib/auth.js";
app.use(loadUserForViews);

// Asociación de rutas a la aplicación
app.use("/cuadros", cuadrosRouter);
app.use("/exposiciones", exposicionesRouter);
app.use("/museos", museosRouter);
app.use("/pintores", pintoresRouter);
app.use("/auth", authRouter);

// Iniciar el servidor solo en entorno local (no en Vercel)
if (!process.env.VERCEL) {
  app.listen(8080);
  console.log("Aplicación escuchando en el puerto 8080");
}

export default app;