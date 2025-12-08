import mongoose from 'mongoose';
import { Libro } from './libro.mjs';
import { Usuario } from './usuario.mjs';
import { Cliente } from './cliente.mjs';
import { Admin } from './admin.mjs';
import { Factura } from './factura.mjs';
import { Carro } from './carro.mjs';
import { Item } from './item.mjs';

export const ROL = {
  ADMIN: "ADMIN",
  CLIENTE: "CLIENTE",
};

export class Libreria {
  constructor() { }

  /**
   * LIBROS
   */

  async getLibros() {
    return await Libro.find();
  }

  async setLibros(array) {
    await Libro.deleteMany({});
    const promises = array.map((l) => new Libro(l).save());
    await Promise.all(promises);
    return await this.getLibros();
  }

  async addLibro(obj) {
    if (!obj.isbn) throw new Error('El libro no tiene ISBN');
    const libro = await this.getLibroPorIsbn(obj.isbn);
    if (libro) throw new Error(`El ISBN ${obj.isbn} ya existe`);
    const nuevoLibro = new Libro(obj);
    return await nuevoLibro.save();
  }

  async getLibroPorId(id) {
    return await Libro.findById(id);
  }

  async getLibroPorIsbn(isbn) {
    return await Libro.findOne({ isbn: isbn });
  }

  async getLibroPorTitulo(titulo) {
    titulo = titulo.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return await Libro.findOne({ titulo: { $regex: titulo, $options: 'i' } });
  }

  async removeLibro(id) {
    const libro = await this.getLibroPorId(id);
    if (!libro) throw new Error('Libro no encontrado');
    await Libro.findByIdAndDelete(id);
    return libro;
  }

  async updateLibro(obj) {
    const libro = await this.getLibroPorId(obj._id);
    if (!libro) throw new Error('Libro no encontrado');
    return await Libro.findByIdAndUpdate(obj._id, obj, { new: true });
  }

  /**
   * USUARIOS
   */

  async addUsuario(obj) {
    if (obj.rol === ROL.CLIENTE) {
      return await this.addCliente(obj);
    } else if (obj.rol === ROL.ADMIN) {
      return await this.addAdmin(obj);
    } else {
      throw new Error('Rol desconocido');
    }
  }

  async addCliente(obj) {
    const clienteExistente = await this.getClientePorEmail(obj.email);
    if (clienteExistente) throw new Error('Correo electrónico registrado');
    
    // Crear carro vacío primero
    const carro = new Carro({ items: [] });
    await carro.save();
    
    // Crear cliente con referencia al carro
    const cliente = new Cliente({
      ...obj,
      rol: ROL.CLIENTE,
      carro: carro._id
    });
    return await cliente.save();
  }

  async addAdmin(obj) {
    const admin = new Admin({
      ...obj,
      rol: ROL.ADMIN
    });
    return await admin.save();
  }

  async getClientes() {
    return await Cliente.find();
  }

  async getAdmins() {
    return await Admin.find();
  }

  async getUsuarioPorId(_id) {
    let usuario = await Cliente.findById(_id);
    if (!usuario) usuario = await Admin.findById(_id);
    return usuario;
  }

  async getUsuarioPorEmail(email) {
    let usuario = await Cliente.findOne({ email });
    if (!usuario) usuario = await Admin.findOne({ email });
    return usuario;
  }

  async getUsuarioPorDni(dni) {
    let usuario = await Cliente.findOne({ dni });
    if (!usuario) usuario = await Admin.findOne({ dni });
    return usuario;
  }

  async updateUsuario(obj) {
    if (obj.rol === ROL.CLIENTE) {
      return await Cliente.findByIdAndUpdate(obj._id, obj, { new: true });
    } else if (obj.rol === ROL.ADMIN) {
      return await Admin.findByIdAndUpdate(obj._id, obj, { new: true });
    }
    throw new Error('Rol no válido');
  }

  async getClientePorEmail(email) {
    return await Cliente.findOne({ email });
  }

  async getClientePorId(id) {
    return await Cliente.findById(id).populate('carro');
  }

  async getAdminPorId(id) {
    return await Admin.findById(id);
  }

  async getAdministradorPorEmail(email) {
    return await Admin.findOne({ email });
  }

  async autenticar(obj) {
    const { email, password, rol } = obj;
    let usuario;

    if (rol === ROL.CLIENTE) {
      usuario = await this.getClientePorEmail(email);
    } else if (rol === ROL.ADMIN) {
      usuario = await this.getAdministradorPorEmail(email);
    } else {
      throw new Error('Rol no encontrado');
    }

    if (!usuario) throw new Error('Usuario no encontrado');
    if (usuario.password !== password) throw new Error('Error en la contraseña');
    
    return usuario;
  }

  /**
   * CARRO
   */

  async getCarroCliente(id) {
    const cliente = await Cliente.findById(id).populate({
      path: 'carro',
      populate: {
        path: 'items',
        populate: {
          path: 'libro'
        }
      }
    });
    
    if (!cliente || !cliente.carro) {
      throw new Error('Cliente o carro no encontrado');
    }
    
    return cliente.carro;
  }

async addClienteCarroItem(id, itemData) {
    const cliente = await Cliente.findById(id);
    if (!cliente) throw new Error('Cliente no encontrado');
    
    const libro = await Libro.findById(itemData.libro);
    if (!libro) throw new Error('Libro no encontrado');

    const carro = await Carro.findById(cliente.carro._id).populate({
      path: 'items',
      populate: { path: 'libro' }
    });
    
    // Buscar si el libro ya está en el carro
    const itemExistente = carro.items.find(item => item.libro._id.toString() === libro._id.toString());
    
    if (itemExistente) {
        // Incrementar cantidad del item existente
        itemExistente.cantidad += itemData.cantidad;
        itemExistente.total = itemExistente.cantidad * libro.precio;
        await Item.findByIdAndUpdate(itemExistente._id, {
        cantidad: itemExistente.cantidad,
        total: itemExistente.total
    });
    } else {
        // Crear nuevo item
        const nuevoItem = new Item({
            libro: libro._id,
            cantidad: itemData.cantidad,
            total: itemData.cantidad * libro.precio
        });
        await nuevoItem.save();
        
        // Añadir el ID al array en memoria
        carro.items.push(nuevoItem._id);

        // Persistir el array actualizado en la DB
        await Carro.findByIdAndUpdate(carro._id, { items: carro.items });
    }
    
    // Recalcular totales del carro
    await this.recalcularCarro(carro._id);
    
    return await this.getCarroCliente(id);
}

  async setClienteCarroItemCantidad(id, index, cantidad) {
    if (cantidad < 0) throw new Error('Cantidad inferior a 0');
    
    const carro = await Carro.findById((await Cliente.findById(id)).carro)
      .populate({ path: 'items', populate: { path: 'libro' } });
    
    if (cantidad === 0) {
      // Eliminar item
      const itemId = carro.items[index]._id;
      await Item.findByIdAndDelete(itemId);
      carro.items.splice(index, 1);
      await Carro.findByIdAndUpdate(carro._id, { items: carro.items });
    } else {
      // Actualizar cantidad
      const item = carro.items[index];
      item.cantidad = cantidad;
      item.total = cantidad * item.libro.precio;
      await Item.findByIdAndUpdate(item._id, {
        cantidad: item.cantidad,
        total: item.total
      });
    }
    
    await this.recalcularCarro(carro._id);
    return await this.getCarroCliente(id);
  }

  async recalcularCarro(carroId) {
    const carro = await Carro.findById(carroId)
      .populate({ path: 'items', populate: { path: 'libro' } });
    
    const subtotal = carro.items.reduce((total, item) => total + item.total, 0);
    const iva = subtotal * 0.21;
    const total = subtotal + iva;
    
    await Carro.findByIdAndUpdate(carroId, { subtotal, iva, total });
  }

  /**
   * FACTURAS
   */

  async getFacturas() {
    return await Factura.find().populate({
      path: 'items',
      populate: { path: 'libro' }
    });
  }

  async getFacturaPorId(id) {
    return await Factura.findById(id).populate({
      path: 'items',
      populate: { path: 'libro' }
    });
  }

  async getFacturaPorNumero(numero) {
    return await Factura.findOne({ numero }).populate({
      path: 'items',
      populate: { path: 'libro' }
    });
  }

  async facturarCompraCliente(obj) {
    if (!obj.cliente) throw new Error('Cliente no definido');
    
    const cliente = await this.getClientePorId(obj.cliente);
    const carro = await Carro.findById(cliente.carro._id)
      .populate({ path: 'items', populate: { path: 'libro' } });
    
    if (!carro.items || carro.items.length === 0) {
      throw new Error('No hay que comprar');
    }
    
    // Obtener el último número de factura
    const ultimaFactura = await Factura.findOne().sort({ numero: -1 });
    const numeroFactura = ultimaFactura ? ultimaFactura.numero + 1 : 1;
    
    // Copiar items del carro (clonar para la factura)
    const itemsFactura = await Promise.all(
      carro.items.map(async (item) => {
        const nuevoItem = new Item({
          libro: item.libro._id,
          cantidad: item.cantidad,
          total: item.total
        });
        return await nuevoItem.save();
      })
    );
    
    // Crear factura
    const factura = new Factura({
      numero: numeroFactura,
      fecha: obj.fecha || new Date(),
      razonSocial: obj.razonSocial || cliente.nombre,
      direccion: obj.direccion || cliente.direccion,
      email: obj.email || cliente.email,
      dni: obj.dni || cliente.dni,
      items: itemsFactura.map(i => i._id),
      subtotal: carro.subtotal,
      iva: carro.iva,
      total: carro.total,
      cliente: {
        _id: cliente._id,
        nombre: cliente.nombre,
        email: cliente.email,
        dni: cliente.dni
      }
    });
    
    await factura.save();
    
    // Vaciar carro
    await Promise.all(carro.items.map(item => Item.findByIdAndDelete(item._id)));
    await Carro.findByIdAndUpdate(carro._id, {
      items: [],
      subtotal: 0,
      iva: 0,
      total: 0
    });
    
    return factura;
  }

  async removeFactura(id) {
    const factura = await Factura.findById(id);
    if (!factura) throw new Error('Factura no encontrada');
    
    // Eliminar items de la factura
    await Promise.all(factura.items.map(itemId => Item.findByIdAndDelete(itemId)));
    
    await Factura.findByIdAndDelete(id);
    return factura;
  }
}

export const model = new Libreria();