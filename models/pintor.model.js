import mongoose from "mongoose";

// Definición del esquema para la colección 'pintores'
const pintorSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre es obligatorio'], // Mensaje de error personalizado
    minlength: [3, 'El nombre debe tener al menos 3 caracteres'],
    trim: true
  },
  fechaNacimiento: {
    type: String,
    required: [true, 'La fecha de nacimiento es obligatoria'],
    trim: true
  },
  estiloArtistico: {
    type: String,
    required: [true, 'El estilo artístico es obligatorio'],
    trim: true,
    enum: [ // Lista de estilos permitidos
      "Impresionismo",
      "Realismo",
      "Expresionismo",
      "Cubismo",
      "Surrealismo",
      "Abstracto",
      "Renacimiento",
      "Otro"
    ],
    default: "Otro"
  }
});

// Creación del modelo 'Pintor' asociado a la colección 'pintor'
const Pintor = mongoose.model('pintor', pintorSchema);

export default Pintor;
