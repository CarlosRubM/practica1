import express from 'express';
import path from 'path';
import url from 'url';

import { model } from './model/model.mjs';
import { seed } from './model/seeder.mjs';
//seed();

const STATIC_DIR = url.fileURLToPath(new URL('.', import.meta.url));
const PORT = 3000;

export const app = express();
app.use('/', express.static(path.join(STATIC_DIR, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============================================
// RUTAS PARA LIBROS
// ============================================

// ============================================
// RUTAS PARA LIBROS
// ============================================

// GET /api/libros - Obtener todos los libros o buscar por isbn/titulo
app.get('/api/libros', function (req, res, next) {
  let isbn = req.query.isbn;
  let titulo = req.query.titulo;
  
  if (isbn) {
    let libro = model.getLibroPorIsbn(isbn);
    if (!libro) res.status(404).json({ error: 'Libro no encontrado' });
    else res.json(libro);
  } else if (titulo) {
    let libro = model.getLibroPorTitulo(titulo);
    if (!libro) res.status(404).json({ error: 'Libro no encontrado' });
    else res.json(libro);
  } else {
    res.json(model.getLibros());
  }
});

// GET /api/libros/:id - Obtener libro por ID
app.get('/api/libros/:id', function (req, res, next) {
  let id = req.params.id;
  if (!id) res.status(400).json({ error: 'Id no definido' });
  else {
    let libro = model.getLibroPorId(id);
    if (!libro) res.status(404).json({ error: 'Libro no encontrado' });
    else res.json(libro);
  }
});

// POST /api/libros - Agregar un libro
app.post('/api/libros', function (req, res, next) {
  let libro = model.addLibro(req.body);
  res.json(libro);
});

// PUT /api/libros - Reemplazar todos los libros
app.put('/api/libros', function (req, res, next) {
  model.libros = [];  // Vaciar el array directamente
  req.body.forEach(l => model.addLibro(l));
  res.json(model.getLibros());
});

// PUT /api/libros/:id - Actualizar un libro específico
app.put('/api/libros/:id', function (req, res, next) {
  let id = req.params.id;
  if (!id) res.status(400).json({ error: 'ID no definido' });
  else {
    let libro = model.getLibroPorId(id);
    if (!libro) res.status(404).json({ error: 'Libro no encontrado' });
    else {
      Object.assign(libro, req.body);
      model.updateLibro(libro);
      res.json(libro);
    }
  }
});

// DELETE /api/libros - Eliminar todos los libros
app.delete('/api/libros', function (req, res, next) {
  model.libros = [];
  res.json({ ok: true });
});

// DELETE /api/libros/:id - Eliminar un libro específico
app.delete('/api/libros/:id', function (req, res, next) {
  let id = req.params.id;
  if (!id) res.status(400).json({ error: 'Id no definido' });
  else {
    let libro = model.getLibroPorId(id);
    if (!libro) res.status(404).json({ error: 'Libro no encontrado' });
    else {
      model.removeLibro(id);
      res.json({ ok: true });
    }
  }
});


// ============================================
// RUTAS PARA CLIENTES
// ============================================

// ============================================
// RUTAS PARA CLIENTES
// ============================================

// GET /api/clientes - Obtener todos los clientes o buscar por email/dni
app.get('/api/clientes', function (req, res, next) {
  if (req.query.email) {
    let cliente = model.getClientePorEmail(req.query.email);
    if (!cliente) res.status(404).json({ error: 'Cliente no encontrado' });
    else res.json(cliente);
  } else if (req.query.dni) {
    let cliente = model.getUsuarioPorDni(req.query.dni);
    if (!cliente || cliente.rol !== 'CLIENTE') res.status(404).json({ error: 'Cliente no encontrado' });
    else res.json(cliente);
  } else {
    res.json(model.getClientes());
  }
});

// GET /api/clientes/:id - Obtener cliente por ID
app.get('/api/clientes/:id', function (req, res, next) {
  let id = req.params.id;
  if (!id) res.status(400).json({ error: 'Id no definido' });
  else {
    let cliente = model.getClientePorId(id);
    if (!cliente) res.status(404).json({ error: 'Cliente no encontrado' });
    else res.json(cliente);
  }
});

// POST /api/clientes - Agregar un cliente (registro)
app.post('/api/clientes', function (req, res, next) {
  let cliente = model.addCliente(req.body);
  res.json(cliente);
});

// POST /api/clientes/autenticar - Autenticar un cliente (login)
app.post('/api/clientes/autenticar', function (req, res, next) {
  let obj = req.body;
  obj.rol = 'CLIENTE';
  let usuario = model.autenticar(obj);
  res.json(usuario);
});

// POST /api/clientes/signin - Alias para autenticar (login)
app.post('/api/clientes/signin', function (req, res, next) {
  let obj = req.body;
  obj.rol = 'CLIENTE';
  let usuario = model.autenticar(obj);
  res.json(usuario);
});

// PUT /api/clientes - Reemplazar todos los clientes
app.put('/api/clientes', function (req, res, next) {
  model.usuarios = model.usuarios.filter(u => u.rol !== 'CLIENTE');
  req.body.forEach(c => model.addCliente(c));
  res.json(model.getClientes());
});

// PUT /api/clientes/:id - Actualizar un cliente específico
app.put('/api/clientes/:id', function (req, res, next) {
  let id = req.params.id;
  if (!id) res.status(400).json({ error: 'ID no definido' });
  else {
    let cliente = model.getClientePorId(id);
    if (!cliente) res.status(404).json({ error: 'Cliente no encontrado' });
    else {
      Object.assign(cliente, req.body);
      model.updateUsuario(cliente);
      res.json(cliente);
    }
  }
});

// DELETE /api/clientes - Eliminar todos los clientes
app.delete('/api/clientes', function (req, res, next) {
  model.usuarios = model.usuarios.filter(u => u.rol !== 'CLIENTE');
  res.json({ ok: true });
});

// DELETE /api/clientes/:id - Eliminar un cliente específico
app.delete('/api/clientes/:id', function (req, res, next) {
  let id = req.params.id;
  if (!id) res.status(400).json({ error: 'Id no definido' });
  else {
    let cliente = model.getClientePorId(id);
    if (!cliente) res.status(404).json({ error: 'Cliente no encontrado' });
    else {
      model.usuarios = model.usuarios.filter(u => u._id != id);
      res.json({ ok: true });
    }
  }
});

// GET /api/clientes/:id/carro - Obtener el carro de un cliente
app.get('/api/clientes/:id/carro', function (req, res, next) {
  let id = req.params.id;
  if (!id) res.status(400).json({ error: 'Id no definido' });
  else {
    let carro = model.getCarroCliente(id);
    res.json(carro);
  }
});

// POST /api/clientes/:id/carro/items - Agregar item al carro
app.post('/api/clientes/:id/carro/items', function (req, res, next) {
  let id = req.params.id;
  let item = req.body;
  model.addClienteCarroItem(id, item);
  res.json(model.getCarroCliente(id));
});

// PUT /api/clientes/:id/carro/items/:index - Actualizar cantidad de item del carro
app.put('/api/clientes/:id/carro/items/:index', function (req, res, next) {
  let id = req.params.id;
  let index = req.params.index;
  let cantidad = req.body.cantidad;
  model.setClienteCarroItemCantidad(id, index, cantidad);
  res.json(model.getCarroCliente(id));
});

// DELETE /api/clientes/:id/carro/items/:index - Eliminar un item del carro
app.delete('/api/clientes/:id/carro/items/:index', function (req, res, next) {
  let id = req.params.id;
  let index = req.params.index;
  if (!id) res.status(400).json({ error: 'Id no definido' });
  else if (index === undefined) res.status(400).json({ error: 'Index no definido' });
  else {
    let cliente = model.getClientePorId(id);
    if (!cliente) res.status(404).json({ error: 'Cliente no encontrado' });
    else {
      cliente.borrarCarroItem(index);
      res.json(model.getCarroCliente(id));
    }
  }
});


// ============================================
// RUTAS PARA ADMINISTRADORES
// ============================================

// ============================================
// RUTAS PARA ADMINISTRADORES
// ============================================

// GET /api/admins - Obtener todos los administradores o buscar por email/dni
app.get('/api/admins', function (req, res, next) {
  if (req.query.email) {
    let admin = model.getAdministradorPorEmail(req.query.email);
    if (!admin) res.status(404).json({ error: 'Administrador no encontrado' });
    else res.json(admin);
  } else if (req.query.dni) {
    let admin = model.getUsuarioPorDni(req.query.dni);
    if (!admin || admin.rol !== 'ADMIN') res.status(404).json({ error: 'Administrador no encontrado' });
    else res.json(admin);
  } else {
    res.json(model.getAdmins());
  }
});

// GET /api/admins/:id - Obtener administrador por ID
app.get('/api/admins/:id', function (req, res, next) {
  let id = req.params.id;
  if (!id) res.status(400).json({ error: 'Id no definido' });
  else {
    let admin = model.getUsuarioPorId(id);
    if (!admin || admin.rol !== 'ADMIN') res.status(404).json({ error: 'Administrador no encontrado' });
    else res.json(admin);
  }
});

// POST /api/admins - Agregar un administrador
app.post('/api/admins', function (req, res, next) {
  let admin = model.addAdmin(req.body);
  res.json(admin);
});

// POST /api/admins/autenticar - Autenticar un administrador (login)
app.post('/api/admins/autenticar', function (req, res, next) {
  let obj = req.body;
  obj.rol = 'ADMIN';
  let usuario = model.autenticar(obj);
  res.json(usuario);
});

// POST /api/admins/signin - Alias para autenticar (login)
app.post('/api/admins/signin', function (req, res, next) {
  let obj = req.body;
  obj.rol = 'ADMIN';
  let usuario = model.autenticar(obj);
  res.json(usuario);
});

// PUT /api/admins - Reemplazar todos los administradores
app.put('/api/admins', function (req, res, next) {
  model.usuarios = model.usuarios.filter(u => u.rol !== 'ADMIN');
  req.body.forEach(a => model.addAdmin(a));
  res.json(model.getAdmins());
});

// PUT /api/admins/:id - Actualizar un administrador específico
app.put('/api/admins/:id', function (req, res, next) {
  let id = req.params.id;
  if (!id) res.status(400).json({ error: 'ID no definido' });
  else {
    let admin = model.getUsuarioPorId(id);
    if (!admin || admin.rol !== 'ADMIN') res.status(404).json({ error: 'Administrador no encontrado' });
    else {
      Object.assign(admin, req.body);
      model.updateUsuario(admin);
      res.json(admin);
    }
  }
});

// DELETE /api/admins - Eliminar todos los administradores
app.delete('/api/admins', function (req, res, next) {
  model.usuarios = model.usuarios.filter(u => u.rol !== 'ADMIN');
  res.json({ ok: true });
});

// DELETE /api/admins/:id - Eliminar un administrador específico
app.delete('/api/admins/:id', function (req, res, next) {
  let id = req.params.id;
  if (!id) res.status(400).json({ error: 'Id no definido' });
  else {
    let admin = model.getUsuarioPorId(id);
    if (!admin || admin.rol !== 'ADMIN') res.status(404).json({ error: 'Administrador no encontrado' });
    else {
      model.usuarios = model.usuarios.filter(u => u._id != id);
      res.json({ ok: true });
    }
  }
});

// ============================================
// RUTAS PARA FACTURAS
// ============================================

// ============================================
// RUTAS PARA FACTURAS
// ============================================

// GET /api/facturas - Obtener todas las facturas o buscar por número/cliente
app.get('/api/facturas', function (req, res, next) {
  if (req.query.numero) {
    let factura = model.getFacturaPorNumero(req.query.numero);
    if (!factura) res.status(404).json({ error: 'Factura no encontrada' });
    else res.json(factura);
  } else if (req.query.cliente) {
    let facturas = model.getFacturas().filter(f => f.cliente._id == req.query.cliente);
    res.json(facturas);
  } else {
    res.json(model.getFacturas());
  }
});

// GET /api/facturas/:id - Obtener factura por ID
app.get('/api/facturas/:id', function (req, res, next) {
  let id = req.params.id;
  if (!id) res.status(400).json({ error: 'Id no definido' });
  else {
    let factura = model.getFacturaPorId(id);
    if (!factura) res.status(404).json({ error: 'Factura no encontrada' });
    else res.json(factura);
  }
});

// POST /api/facturas - Crear una factura (facturar compra del cliente)
app.post('/api/facturas', function (req, res, next) {
  model.facturarCompraCliente(req.body);
  let facturas = model.getFacturas();
  res.json(facturas[facturas.length - 1]);
});

// PUT /api/facturas - Reemplazar todas las facturas
app.put('/api/facturas', function (req, res, next) {
  model.facturas = req.body;
  res.json(model.getFacturas());
});

// DELETE /api/facturas - Eliminar todas las facturas
app.delete('/api/facturas', function (req, res, next) {
  model.facturas = [];
  res.json({ ok: true });
});

// DELETE /api/facturas/:id - Eliminar una factura específica
app.delete('/api/facturas/:id', function (req, res, next) {
  let id = req.params.id;
  if (!id) res.status(400).json({ error: 'Id no definido' });
  else {
    model.removeFactura(id);
    res.json({ ok: true });
  }
});

// ============================================
// CONFIGURACIÓN PARA SPA
// ============================================

app.use('/libreria*', (req, res) => {
  res.sendFile(path.join(STATIC_DIR, 'public/libreria/index.html'));
});

app.all('*', function (req, res, next) {
  console.error(req.originalUrl + ' not found!');
  res.status(404).send('<html><head><title>Not Found</title></head><body><h1>Not found!</h1></body></html>');
});

// ============================================
// INICIAR SERVIDOR
// ============================================

app.listen(PORT, function () {
  console.log(`Static HTTP server listening on ${PORT}`);
});
