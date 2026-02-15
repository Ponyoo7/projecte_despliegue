import mongoose from "mongoose";

// Definición del esquema para la colección 'cuadros'
const cuadroSchema = new mongoose.Schema({
  titulo: {
    type: String,
    required: true, // El título es obligatorio
    trim: true, // Elimina espacios en blanco al inicio y final
    minlength: 2 // Longitud mínima de 2 caracteres
  },
  anyoCreacion: {
    type: Number,
    required: true, // El año de creación es obligatorio
    min: 1000, // Año mínimo permitido
    max: 2100 // Año máximo permitido
  },
  tecnica: {
    type: String,
    required: true, // La técnica es obligatoria
    enum: ["Óleo", "Acuarela", "Acrílico", "Carboncillo", "Otra"], // Valores permitidos
    default: "Óleo" // Valor por defecto si no se especifica
  },
  pintor: {
    type: mongoose.Schema.Types.ObjectId, // Referencia a un ID de otro documento
    ref: "pintor", // Nombre del modelo referenciado (Pintor)
    required: true // Todo cuadro debe tener un pintor asociado
  },
  exposicion: [{
    type: mongoose.Schema.Types.ObjectId, // Referencia a IDs de documentos
    ref: "exposiciones" // Nombre del modelo referenciado (Exposicion)
    // Es un array, por lo que un cuadro puede estar en múltiples exposiciones
  }]
});

// Creación del modelo 'Cuadro' basado en el esquema definido
//cuadros, nombre de la colección de la base de datos en MongoDB
const Cuadro = mongoose.model("cuadros", cuadroSchema);
// Cuadro conté el modelo de mongoose
export default Cuadro;
