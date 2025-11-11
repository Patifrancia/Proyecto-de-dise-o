import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    nombre:      { type: String, required: true, trim: true },
    correo:      { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash:{ type: String, required: true }
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
