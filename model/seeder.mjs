import mongoose from 'mongoose';
import { Libro } from './libro.mjs';
import { Usuario } from './usuario.mjs';
import { Cliente } from './cliente.mjs';
import { Admin } from './admin.mjs';
import { Carro } from './carro.mjs';
import { Item } from './item.mjs';
import { Factura } from './factura.mjs';

var uri = 'mongodb://127.0.0.1/libreria';
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on('connecting', function () { console.log('Connecting to ', uri); });
db.on('connected', function () { console.log('Connected to ', uri); });
db.on('disconnecting', function () { console.log('Disconnecting from ', uri); });
db.on('disconnected', function () { console.log('Disconnected from ', uri); });
db.on('error', function (err) { console.error('Error ', err.message); });

// Funciones para crear datos de prueba
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
  cliente.rol = 'CLIENTE';
  return cliente;
}

export function crearAdmin(dni) {
  let admin = crearPersona(dni);
  admin.rol = 'ADMIN';
  return admin;
}

// Funciones de seed
async function seedLibros() {
  const ISBNS = [
    '978-3-16-148410-0',
    '978-3-16-148410-1',
    '978-3-16-148410-2',
    '978-3-16-148410-3',
    '978-3-16-148410-4'
  ];
  
  let libros = ISBNS.map(isbn => crearLibro(isbn));
  let promises = libros.map((l) => {
    let libro = new Libro(l);
    return libro.save();
  });
  
  await Promise.all(promises);
}

async function seedAdmins() {
  const A_DNIS = ['00000000A', '00000001A', '00000002A'];
  
  let admins = A_DNIS.map(dni => crearAdmin(dni));
  let promises = admins.map((a) => {
    let admin = new Admin(a);
    return admin.save();
  });
  
  await Promise.all(promises);
}

async function seedClientes() {
  const C_DNIS = ['00000000C', '00000001C', '00000002C'];
  
  let clientes = C_DNIS.map(dni => crearCliente(dni));
  let promises = clientes.map(async (c) => {
    // Crear carro vacío primero
    let carro = await new Carro({ items: [] }).save();
    
    // Crear cliente con referencia al carro
    let cliente = new Cliente({
      ...c,
      carro: carro._id
    });
    
    return cliente.save();
  });
  
  await Promise.all(promises);
}
export async function seed() {

  // Limpiar colecciones existentes
  await Libro.deleteMany();
  await Cliente.deleteMany();
  await Admin.deleteMany();
  await Carro.deleteMany();
  await Item.deleteMany();
  await Factura.deleteMany();

  
  // Crear datos de prueba
  await seedLibros();
  await seedAdmins();
  await seedClientes();
  
  console.log('Seed completado con éxito\n');
}

// Ejecución del seed (solo si se ejecuta directamente este archivo)
if (process.argv[1].includes('seeder.mjs')) {
  try {
    await mongoose.connect(uri);
    await seed();
    
    // Ejemplos de consultas (comentados por defecto)
    /*
    // Consultar todos los libros
    let libros = await Libro.find();
    console.log('Libros:', libros);
    
    // Buscar un libro por ISBN
    let libro = await Libro.findOne({ isbn: '978-3-16-148410-1' });
    console.log('Libro encontrado:', libro);
    
    // Ejemplo de populate con cliente y carro
    let cliente = await Cliente.findOne().populate({
      path: 'carro',
      populate: {
        path: 'items',
        populate: {
          path: 'libro'
        }
      }
    });
    console.log('Cliente con carro poblado:', JSON.stringify(cliente, null, 2));
    */
    
  } catch (err) {
    console.error('Error en seed:', err.message);
  } finally {
    await mongoose.disconnect();
  }
}


