import mongoose from "mongoose";

// Definición del esquema para la colección 'museos'
const museoSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true, // Nombre del museo obligatorio
    minlength: 1,
    unique: true, // El nombre debe ser único en la base de datos
    trim: true
  },
  ciudad: {
    type: String,
    minlength: 1,
    required: true, // Ciudad obligatoria
    trim: true
  }
});

// Exportar el modelo 'Museo'
export const Museo = mongoose.model("museos", museoSchema);
