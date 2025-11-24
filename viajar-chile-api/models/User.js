import mongoose from "mongoose";

const favoriteSchema = new mongoose.Schema(
  {
    id: String,
    name: String,
    address: String,
    location: String,
    placeType: String,
    description: String,
    lat: Number,
    lng: Number,
    mapsUrl: String,
  },
  { timestamps: true }
);

const userSchema = new mongoose.Schema(
  {
    nombre:      { type: String, required: true, trim: true },
    correo:      { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash:{ type: String, required: false }, // Opcional para usuarios de Google
    googleId:    { type: String, unique: true, sparse: true }, // ID de Google OAuth
    avatar:      { type: String }, // URL del avatar de Google
    favorites:   [favoriteSchema], // Array de lugares guardados
  },
  { timestamps: true }
);

// Validación: debe tener passwordHash O googleId
userSchema.pre('validate', function(next) {
  if (!this.passwordHash && !this.googleId) {
    return next(new Error('El usuario debe tener passwordHash o googleId'));
  }
  next();
});

export default mongoose.model("User", userSchema);
