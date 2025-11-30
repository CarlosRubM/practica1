import mongoose from 'mongoose';
import { Usuario } from './usuario.mjs';

const Schema = mongoose.Schema;
const schema = Schema({
  carro: { type: Schema.Types.ObjectId, ref: 'Carro' },
});

export const Cliente = Usuario.discriminator('CLIENTE', schema);