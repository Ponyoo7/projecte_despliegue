import mongoose from "mongoose";

// --------------------------------------------------------------------------
// MODELO DE USUARIO
// Rúbrica: Validació de dades estricta (Schema Mongoose).
// --------------------------------------------------------------------------
const userSchema = new mongoose.Schema({
  // Validación de nombre de usuario
  username: {
    type: String,
    required: [true, "El nombre de usuario es obligatorio"],
    minlength: [5, "El nombre debe contener al menos 5 caracteres"],
    unique: true, // Integridad: No permitir duplicados (Rúbrica)
    trim: true,
  },
  // Validación email
  email: {
    type: String,
    required: [true, "El email es obligatorio"],
    minlength: [7, "El email debe contener al menos 7 caracteres"],
    unique: true, // Integridad: No permitir email duplicados
    trim: true,
  },
  password: {
    type: String,
    required: [true, "La contraseña es obligatoria"],
    minlength: [5, "La contraseña debe contener al menos 5 caracteres"],
  },
  // Gestión de Roles
  role: {
    type: String,
    required: [true, "Se debe seleccionar un rol"],
    trim: true,
    enum: ["user", "admin"], // Roles permitidos
  },
  // Lista de deseos (Referencia a otros documentos)
  favoriteCuadros: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "cuadros",
    },
  ],
});

const User = mongoose.model("user", userSchema);

export default User;
