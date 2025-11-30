import mongoose from 'mongoose';

const Schema = mongoose.Schema;
const schema = Schema({
  dni: { type: String, required: true },
  nombre: { type: String },
  apellidos: { type: String },
  direccion: { type: String },
  rol: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
}, { discriminatorKey: 'rol' });

export const Usuario = mongoose.model('Usuario', schema);