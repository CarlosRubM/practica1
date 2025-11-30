import mongoose from 'mongoose';

const Schema = mongoose.Schema;
const schema = Schema({
  libro: { type: Schema.Types.ObjectId, ref: 'Libro', required: true },
  cantidad: { type: Number, required: true, default: 1 },
  total: { type: Number, required: true, default: 0 },
});

export const Item = mongoose.model('Item', schema);