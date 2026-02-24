import mongoose from "mongoose";

// Definición del esquema para la colección 'exposiciones'
const exposicionSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true, // Nombre de la exposición obligatorio
    trim: true,
    minlength: 1,
    trim: true
  },
  tema: {
    type: String,
    trim: true,
    default: null // Puede ser nulo si no se especifica
  }, //hola
  fechaInicio: {
    type: Date,
    required: true // Fecha de inicio obligatoria
  },
  fechaFin: {
    type: Date,
    required: true, // Fecha de fin obligatoria
  },
  museo: {
    type: mongoose.Schema.Types.ObjectId, // Referencia al museo donde se realiza
    ref: "museos",
    required: true
  },
  cuadros: [{
    type: mongoose.Schema.Types.ObjectId, // Lista de cuadros en la exposición
    ref: "cuadros"
  }]
});

// Exportar el modelo 'Exposicion'
export const Exposicion = mongoose.model("exposiciones", exposicionSchema);
