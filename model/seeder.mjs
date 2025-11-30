import mongoose from 'mongoose';
import { model, ROL } from './model.mjs';

const uri = 'mongodb://127.0.0.1/libreria';

export function crearLibro(isbn) {
  return {
    isbn: `${isbn}`,
    titulo: `TITULO_${isbn}`,
    autores: `AUTOR_A${isbn}; AUTOR_B${isbn}`,
    resumen: `Lorem ipsum dolor sit amet..._[${isbn}]`,
    portada: `http://google.com/${isbn}`,
    stock: 5,
    precio: parseFloat((Math.random() * 100).toFixed(2)),
  };
}

export function crearPersona(dni) {
  return {
    dni: `${dni}`,
    nombre: `Nombre ${dni}`,
    apellidos: `Apellido_1${dni} Apellido_2${dni}`,
    direccion: `Direccion ${dni}`,
    email: `${dni}@tsw.uclm.es`,
    password: `${dni}`,
  };
}

export function crearCliente(dni) {
  let cliente = crearPersona(dni);
  cliente.rol = ROL.CLIENTE;
  return cliente;
}

export function crearAdmin(dni) {
  let admin = crearPersona(dni);
  admin.rol = ROL.ADMIN;
  return admin;
}

export async function seed() {
  try {
    await mongoose.connect(uri);
    console.log('Connected to MongoDB');

    // Limpiar colecciones
    await model.setLibros([]);
    const clientes = await model.getClientes();
    await Promise.all(clientes.map(c => model.getUsuarioPorId(c._id).then(u => u.deleteOne())));
    const admins = await model.getAdmins();
    await Promise.all(admins.map(a => model.getUsuarioPorId(a._id).then(u => u.deleteOne())));

    // Crear libros
    const ISBNS = ['978-3-16-148410-0', '978-3-16-148410-1', '978-3-16-148410-2', 
                   '978-3-16-148410-3', '978-3-16-148410-4'];
    const libros = ISBNS.map(isbn => crearLibro(isbn));
    await Promise.all(libros.map(l => model.addLibro(l)));

    // Crear admins
    const A_DNIS = ['00000000A', '00000001A', '00000002A'];
    const admins_data = A_DNIS.map(dni => crearAdmin(dni));
    await Promise.all(admins_data.map(a => model.addUsuario(a)));

    // Crear clientes
    const C_DNIS = ['00000000C', '00000001C', '00000002C'];
    const clientes_data = C_DNIS.map(dni => crearCliente(dni));
    await Promise.all(clientes_data.map(c => model.addUsuario(c)));

    console.log('Seed completed successfully');
  } catch (err) {
    console.error('Seed error:', err);
  }
}