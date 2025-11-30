import mongoose from 'mongoose';

const Schema = mongoose.Schema;
const schema = Schema({
  numero: { type: Number, required: true, unique: true },
  fecha: { type: Date, default: Date.now },
  razonSocial: { type: String },
  direccion: { type: String },
  email: { type: String },
  dni: { type: String },
  items: [{ type: Schema.Types.ObjectId, ref: 'Item' }],
  subtotal: { type: Number, default: 0 },
  iva: { type: Number, default: 0 },
  total: { type: Number, default: 0 },
  cliente: { type: Schema.Types.Mixed }, // Guardamos datos del cliente como objeto
});

export const Factura = mongoose.model('Factura', schema);