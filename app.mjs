import express from 'express';
import path from 'path';
import url from 'url';
import mongoose from 'mongoose';


import { model } from './model/model.mjs';
import { seed } from './model/seeder.mjs';


//seed(); //para que aparezcan los libros y usuarios iniciales

const STATIC_DIR = url.fileURLToPath(new URL('.', import.meta.url));
const PORT = 3000;

export const app = express();
app.use('/', express.static(path.join(STATIC_DIR, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


const uri = 'mongodb://127.0.0.1/libreria';
// Conectar a MongoDB
mongoose.connect(uri)
  .then(async() => {
    console.log('MongoDB connected');
    //await seed();
  })
  .catch(err => console.error('MongoDB connection error:', err));
// ============================================
// RUTAS PARA LIBROS
// ============================================

// GET /api/libros - Obtener todos los libros o buscar por isbn/titulo
app.get('/api/libros', async function (req, res, next) {
  let isbn = req.query.isbn;
  let titulo = req.query.titulo;

  if (isbn) {
    let libro = await model.getLibroPorIsbn(isbn);
    if (!libro) res.status(404).json({ error: 'Libro no encontrado' });
    else res.json(libro);
  } else if (titulo) {
    let libro = await model.getLibroPorTitulo(titulo);
    if (!libro) res.status(404).json({ error: 'Libro no encontrado' });
    else res.json(libro);
  } else {
    let libros = await model.getLibros();
    res.json(libros);
  }
});

// GET /api/libros/:id - Obtener libro por ID
app.get('/api/libros/:id', async function (req, res, next) {
  try {
    let id = req.params.id;
    if (!id) res.status(400).json({ error: 'Id no definido' });
    else {
      let libro = await model.getLibroPorId(id);
      if (!libro) res.status(404).json({ error: 'Libro no encontrado' });
      else res.json(libro);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/libros - Agregar un libro
app.post('/api/libros', async function (req, res, next) {
  try {
    let libro = await model.addLibro(req.body);
    res.json(libro);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/libros - Reemplazar todos los libros
// PUT /api/libros - Reemplazar todos los libros
app.put('/api/libros', async function (req, res, next) {
  try {
    let libros = await model.setLibros(req.body);
    res.json(libros);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/libros/:id - Actualizar un libro específico
app.put('/api/libros/:id', async function (req, res, next) {
  try {
    let id = req.params.id;
    if (!id) res.status(400).json({ error: 'ID no definido' });
    else {
      let libro = await model.getLibroPorId(id);
      if (!libro) res.status(404).json({ error: 'Libro no encontrado' });
      else {
        Object.assign(req.body, { _id: id });
        let libroActualizado = await model.updateLibro(req.body);
        res.json(libroActualizado);
      }
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/libros - Eliminar todos los libros
app.delete('/api/libros', async function (req, res, next) {
  try {
    await model.setLibros([]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/libros/:id - Eliminar un libro específico
app.delete('/api/libros/:id', async function (req, res, next) {
  try {
    let id = req.params.id;
    if (!id) res.status(400).json({ error: 'Id no definido' });
    else {
      await model.removeLibro(id);
      res.json({ ok: true });
    }
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});


// ============================================
// RUTAS PARA CLIENTES
// ============================================


// GET /api/clientes - Obtener todos los clientes o buscar por email/dni
app.get('/api/clientes', async function (req, res, next) {
  try {
    if (req.query.email) {
      let cliente = await model.getClientePorEmail(req.query.email);
      if (!cliente) res.status(404).json({ error: 'Cliente no encontrado' });
      else res.json(cliente);
    } else if (req.query.dni) {
      let cliente = await model.getUsuarioPorDni(req.query.dni);
      if (!cliente || cliente.rol !== 'CLIENTE') res.status(404).json({ error: 'Cliente no encontrado' });
      else res.json(cliente);
    } else {
      let clientes = await model.getClientes();
      res.json(clientes);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/clientes/:id - Obtener cliente por ID
app.get('/api/clientes/:id', async function (req, res, next) {
  try {
    let id = req.params.id;
    if (!id) res.status(400).json({ error: 'Id no definido' });
    else {
      let cliente = await model.getClientePorId(id);
      if (!cliente) res.status(404).json({ error: 'Cliente no encontrado' });
      else res.json(cliente);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/clientes - Agregar un cliente (registro)
app.post('/api/clientes',async function (req, res, next) {
  try {
    let cliente = await model.addCliente(req.body);
    res.json(cliente);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST /api/clientes/autenticar - Autenticar un cliente (login)
app.post('/api/clientes/autenticar', async function (req, res, next) {
  try {
    let obj = req.body;
    obj.rol = 'CLIENTE';
    let usuario = await model.autenticar(obj);
    res.json(usuario);
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
});

// POST /api/clientes/signin - Alias para autenticar (login)
app.post('/api/clientes/signin', async function (req, res, next) {
  try {
    let obj = req.body;
    obj.rol = 'CLIENTE';
    let usuario = await model.autenticar(obj);
    res.json(usuario);
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
});

/*
app.post('/api/usuarios', function (req, res, next) {
  console.log('/api/usuarios')
  try {
    let usuario = model.addUsuario(req.body);
    console.log(usuario);
    res.json(usuario);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message })
  }
});

app.post('/api/usuarios/autenticar', function (req, res, next) {
  console.log('/api/usuarios/autenticar')
  try {
    let usuario = model.autenticar(req.body);
    res.json(usuario);
  } catch (err) {
    res.status(401).json({ error: err.message })
  }
});
*/

// PUT /api/clientes - Reemplazar todos los clientes
app.put('/api/clientes', async function (req, res, next) {
  try {
    // OBTENER todos los clientes
    const clientes = await model.getClientes();
    
    // ELIMINAR cada cliente de la BD
    await Promise.all(
      clientes.map(c => 
        model.getUsuarioPorId(c._id)  // Buscar en BD
          .then(u => u.deleteOne())    // Eliminar documento
      )
    );
    
    // AGREGAR los nuevos clientes
    const data = req.body;
    if (Array.isArray(data)) {
      await Promise.all(data.map(c => model.addCliente(c)));
    } else {
      await model.addCliente(data);
    }
    
    // DEVOLVER los clientes actualizados
    let clientesNuevos = await model.getClientes();
    res.json(clientesNuevos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/clientes/:id - Actualizar un cliente específico
app.put('/api/clientes/:id', async function (req, res, next) {
  try {
    let id = req.params.id;
    if (!id) res.status(400).json({ error: 'ID no definido' });
    else {
      let cliente = await model.getClientePorId(id);
      if (!cliente) res.status(404).json({ error: 'Cliente no encontrado' });
      else {
        Object.assign(req.body, { _id: id, rol: 'CLIENTE' });
        let clienteActualizado = await model.updateUsuario(req.body);
        res.json(clienteActualizado);
      }
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/clientes - Eliminar todos los clientes
app.delete('/api/clientes', async function (req, res, next) {
  try {
    const clientes = await model.getClientes();
    await Promise.all(clientes.map(c => model.getUsuarioPorId(c._id).then(u => u.deleteOne())));
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/clientes/:id - Eliminar un cliente específico
app.delete('/api/clientes/:id', async function (req, res, next) {
  try {
    let id = req.params.id;
    if (!id) res.status(400).json({ error: 'Id no definido' });
    else {
      let cliente = await model.getClientePorId(id);
      if (!cliente) res.status(404).json({ error: 'Cliente no encontrado' });
      else {
        await cliente.deleteOne();
        res.json({ ok: true });
      }
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/clientes/:id/carro - Obtener el carro de un cliente
app.get('/api/clientes/:id/carro', async function (req, res, next) {
  try {
    let id = req.params.id;
    if (!id) res.status(400).json({ error: 'Id no definido' });
    else {
      let carro = await model.getCarroCliente(id);
      res.json(carro);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/clientes/:id/carro/items - Agregar item al carro
app.post('/api/clientes/:id/carro/items', async function (req, res, next) {
  try {
    let id = req.params.id;
    let item = req.body;
    await model.addClienteCarroItem(id, item);
    let carro = await model.getCarroCliente(id);
    res.json(carro);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/clientes/:id/carro/items/:index - Actualizar cantidad de item del carro
app.put('/api/clientes/:id/carro/items/:index', async function (req, res, next) {
  try {
    let id = req.params.id;
    let index = req.params.index;
    let cantidad = req.body.cantidad;
    await model.setClienteCarroItemCantidad(id, index, cantidad);
    let carro = await model.getCarroCliente(id);
    res.json(carro);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/clientes/:id/carro/items/:index - Eliminar un item del carro
app.delete('/api/clientes/:id/carro/items/:index', async function (req, res, next) {
  try {
    let id = req.params.id;
    let index = req.params.index;
    if (!id) res.status(400).json({ error: 'Id no definido' });
    else if (index === undefined) res.status(400).json({ error: 'Index no definido' });
    else {
      await model.setClienteCarroItemCantidad(id, index, 0);
      let carro = await model.getCarroCliente(id);
      res.json(carro);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ============================================
// RUTAS PARA ADMINISTRADORES
// ============================================

// GET /api/admins - Obtener todos los administradores o buscar por email/dni
app.get('/api/admins', async function (req, res, next) {
  try {
    if (req.query.email) {
      let admin = await model.getAdministradorPorEmail(req.query.email);
      if (!admin) res.status(404).json({ error: 'Administrador no encontrado' });
      else res.json(admin);
    } else if (req.query.dni) {
      let admin = await model.getUsuarioPorDni(req.query.dni);
      if (!admin || admin.rol !== 'ADMIN') res.status(404).json({ error: 'Administrador no encontrado' });
      else res.json(admin);
    } else {
      let admins = await model.getAdmins();
      res.json(admins);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admins/:id - Obtener administrador por ID
app.get('/api/admins/:id', async function (req, res, next) {
  try {
    let id = req.params.id;
    if (!id) res.status(400).json({ error: 'Id no definido' });
    else {
      let admin = await model.getUsuarioPorId(id);
      if (!admin || admin.rol !== 'ADMIN') res.status(404).json({ error: 'Administrador no encontrado' });
      else res.json(admin);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/admins - Agregar un administrador
app.post('/api/admins', async function (req, res, next) {
  try {
    let admin = await model.addAdmin(req.body);
    res.json(admin);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST /api/admins/autenticar - Autenticar un administrador (login)
app.post('/api/admins/autenticar', async function (req, res, next) {
  try {
    let obj = req.body;
    obj.rol = 'ADMIN';
    let usuario = await model.autenticar(obj);
    res.json(usuario);
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
});

// POST /api/admins/signin - Alias para autenticar (login)
app.post('/api/admins/signin', async function (req, res, next) {
  try {
    let obj = req.body;
    obj.rol = 'ADMIN';
    let usuario = await model.autenticar(obj);
    res.json(usuario);
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
});

// PUT /api/admins - Reemplazar todos los administradores
app.put('/api/admins', async function (req, res, next) {
  try {
    const admins = await model.getAdmins();
    await Promise.all(admins.map(a => model.getUsuarioPorId(a._id).then(u => u.deleteOne())));

    const data = req.body;
    if (Array.isArray(data)) {
      await Promise.all(data.map(a => model.addAdmin(a)));
    } else {
      await model.addAdmin(data);
    }
    
    let adminsNuevos = await model.getAdmins();
    res.json(adminsNuevos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/admins/:id - Actualizar un administrador específico
app.put('/api/admins/:id', async function (req, res, next) {
  try {
    let id = req.params.id;
    if (!id) res.status(400).json({ error: 'ID no definido' });
    else {
      let admin = await model.getUsuarioPorId(id);
      if (!admin || admin.rol !== 'ADMIN') res.status(404).json({ error: 'Administrador no encontrado' });
      else {
        Object.assign(req.body, { _id: id, rol: 'ADMIN' });
        let adminActualizado = await model.updateUsuario(req.body);
        res.json(adminActualizado);
      }
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/admins - Eliminar todos los administradores
app.delete('/api/admins', async function (req, res, next) {
  try {
    const admins = await model.getAdmins();
    await Promise.all(admins.map(a => model.getUsuarioPorId(a._id).then(u => u.deleteOne())));
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/admins/:id - Eliminar un administrador específico
app.delete('/api/admins/:id', async function (req, res, next) {
  try {
    let id = req.params.id;
    if (!id) res.status(400).json({ error: 'Id no definido' });
    else {
      let admin = await model.getUsuarioPorId(id);
      if (!admin || admin.rol !== 'ADMIN') res.status(404).json({ error: 'Administrador no encontrado' });
      else {
        await admin.deleteOne();
        res.json({ ok: true });
      }
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



// ============================================
// RUTAS PARA FACTURAS
// ============================================

// GET /api/facturas - Obtener todas las facturas o buscar por número/cliente
app.get('/api/facturas', async function (req, res, next) {
  try {
    if (req.query.numero) {
      let factura = await model.getFacturaPorNumero(req.query.numero);
      if (!factura) res.status(404).json({ error: 'Factura no encontrada' });
      else res.json(factura);
    } else if (req.query.cliente) {
      let facturas = await model.getFacturas();
      let facturasCliente = facturas.filter(f => f.cliente._id.toString() === req.query.cliente);
      res.json(facturasCliente);
    } else {
      let facturas = await model.getFacturas();
      res.json(facturas);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/facturas/:id - Obtener factura por ID
app.get('/api/facturas/:id', async function (req, res, next) {
  try {
    let id = req.params.id;
    if (!id) res.status(400).json({ error: 'Id no definido' });
    else {
      let factura = await model.getFacturaPorId(id);
      if (!factura) res.status(404).json({ error: 'Factura no encontrada' });
      else res.json(factura);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/facturas - Crear una factura (facturar compra del cliente)
app.post('/api/facturas', async function (req, res, next) {
  try {
    let factura = await model.facturarCompraCliente(req.body);
    res.json(factura);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/facturas - Reemplazar todas las facturas
app.put('/api/facturas', async function (req, res, next) {
  try {
    const facturas = await model.getFacturas();
    await Promise.all(facturas.map(f => model.removeFactura(f._id)));
    // Aquí podrías agregar las nuevas si req.body tiene facturas
    res.json([]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/facturas - Eliminar todas las facturas
app.delete('/api/facturas', async function (req, res, next) {
  try {
    const facturas = await model.getFacturas();
    await Promise.all(facturas.map(f => model.removeFactura(f._id)));
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// DELETE /api/facturas/:id - Eliminar una factura específica
app.delete('/api/facturas/:id', async function (req, res, next) {
  try {
    let id = req.params.id;
    if (!id) res.status(400).json({ error: 'Id no definido' });
    else {
      await model.removeFactura(id);
      res.json({ ok: true });
    }
  } catch (err) {
    res.status(404).json({ error: err.message });
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