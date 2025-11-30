import mongoose from 'mongoose';
import { Usuario } from './usuario.mjs';

const Schema = mongoose.Schema;
const schema = Schema({});

export const Admin = Usuario.discriminator('ADMIN', schema);