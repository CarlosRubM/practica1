
import { assert } from "chai";
import mongoose from 'mongoose';
import { Libreria, ROL } from '../model/model.mjs';

const ISBNS = ['978-3-16-148410-0', '978-3-16-148410-1', '978-3-16-148410-2',
  '978-3-16-148410-3', '978-3-16-148410-4'];

describe("Libreria model test suite con MongoDB", function () {
  let libreria;

  // Conectar a MongoDB antes de todas las pruebas
  before('Conectar a MongoDB', async function () {
    const uri = 'mongodb://127.0.0.1/libreria_test';
    mongoose.Promise = global.Promise;

    const db = mongoose.connection;
    db.on('error', (err) => console.error('MongoDB Error:', err.message));

    await mongoose.connect(uri);
    console.log('Conectado a MongoDB para pruebas');

    libreria = new Libreria();
  });

  // Desconectar después de todas las pruebas
  after('Desconectar de MongoDB', async function () {
    await mongoose.disconnect();
    console.log('Desconectado de MongoDB');
  });

  // Limpiar la base de datos antes de cada test
  beforeEach('Limpiar base de datos', async function () {
    await libreria.setLibros([]);

    const clientes = await libreria.getClientes();
    await Promise.all(clientes.map(c =>
      libreria.getUsuarioPorId(c._id).then(u => u?.deleteOne())
    ));

    const admins = await libreria.getAdmins();
    await Promise.all(admins.map(a =>
      libreria.getUsuarioPorId(a._id).then(u => u?.deleteOne())
    ));

    // Limpiar facturas directamente desde la colección
    const db = mongoose.connection.db;
    if (db) {
      await db.collection('facturas').deleteMany({});
    }
  });
  // ============================================
  // GETTERS Y SETTERS
  // ============================================

  describe("GETTERS Y SETTERS", function () {

    describe("Getters de Libros", function () {
      it("getLibros() debe retornar array de libros", async function () {
        let libros = await libreria.getLibros();
        assert.isArray(libros);
      });

      it("getLibroPorId() debe retornar libro correcto", async function () {
        let libroData = {
          isbn: "123",
          titulo: "Test Libro",
          precio: 10,
          stock: 5,
          autores: "Autor Test",
          resumen: "Resumen del libro de test"
        };
        let libro = await libreria.addLibro(libroData);
        let encontrado = await libreria.getLibroPorId(libro._id);

        assert.equal(encontrado._id.toString(), libro._id.toString());
        assert.equal(encontrado.isbn, libroData.isbn);
        assert.equal(encontrado.titulo, libroData.titulo);
        assert.equal(encontrado.precio, libroData.precio);
        assert.equal(encontrado.stock, libroData.stock);
        assert.equal(encontrado.autores, libroData.autores);
        assert.equal(encontrado.resumen, libroData.resumen);
      });

      it("getLibroPorIsbn() debe retornar libro correcto", async function () {
        await libreria.addLibro({
          isbn: "ABC123", titulo: "Test", precio: 10, stock: 5,
          autores: "Autor", resumen: "Resumen"
        });
        let encontrado = await libreria.getLibroPorIsbn("ABC123");
        assert.equal(encontrado.isbn, "ABC123");
      });

      it("getLibroPorTitulo() debe retornar libro correcto", async function () {
        await libreria.addLibro({
          isbn: "XYZ", titulo: "JavaScript Avanzado", precio: 20, stock: 3,
          autores: "Autor", resumen: "Resumen"
        });
        let encontrado = await libreria.getLibroPorTitulo("JavaScript");
        assert.equal(encontrado.titulo, "JavaScript Avanzado");
      });
    });

    describe("Getters de Usuarios", function () {
      it("getClientes() debe retornar solo clientes", async function () {
        await libreria.addCliente({
          email: "cliente@test.com",
          password: "pass123",
          dni: "11111111A",
          nombre: "Cliente",
          apellidos: "Test",
          direccion: "Calle Test 123"
        });
        await libreria.addAdmin({
          email: "admin@test.com",
          password: "admin123",
          dni: "22222222B",
          nombre: "Admin",
          apellidos: "Test",
          direccion: "Calle Admin 456"
        });

        let clientes = await libreria.getClientes();
        assert.equal(clientes.length, 1);
        assert.equal(clientes[0].rol, ROL.CLIENTE);
        assert.equal(clientes[0].email, "cliente@test.com");
        assert.equal(clientes[0].dni, "11111111A");
        assert.equal(clientes[0].nombre, "Cliente");
        assert.equal(clientes[0].apellidos, "Test");
        assert.equal(clientes[0].direccion, "Calle Test 123");
      });

      it("getAdmins() debe retornar solo administradores", async function () {
        await libreria.addCliente({
          email: "cliente@test.com",
          password: "pass123",
          dni: "11111111C",
          nombre: "Cliente",
          apellidos: "Prueba",
          direccion: "Calle Cliente 789"
        });
        await libreria.addAdmin({
          email: "admin@test.com",
          password: "admin123",
          dni: "22222222D",
          nombre: "Administrador",
          apellidos: "Prueba",
          direccion: "Calle Admin 321"
        });

        let admins = await libreria.getAdmins();
        assert.equal(admins.length, 1);
        assert.equal(admins[0].rol, ROL.ADMIN);
        assert.equal(admins[0].email, "admin@test.com");
        assert.equal(admins[0].dni, "22222222D");
        assert.equal(admins[0].nombre, "Administrador");
        assert.equal(admins[0].apellidos, "Prueba");
        assert.equal(admins[0].direccion, "Calle Admin 321");
      });

      it("getUsuarioPorId() debe retornar usuario correcto", async function () {
        let cliente = await libreria.addCliente({
          email: "test@test.com", password: "123", dni: "111"
        });
        let encontrado = await libreria.getUsuarioPorId(cliente._id);
        assert.equal(encontrado._id.toString(), cliente._id.toString());
      });

      it("getClientePorEmail() debe retornar solo cliente", async function () {
        await libreria.addCliente({ email: "cliente@test.com", password: "123", dni: "111" });
        let cliente = await libreria.getClientePorEmail("cliente@test.com");
        assert.equal(cliente.rol, ROL.CLIENTE);
      });

      it("getAdministradorPorEmail() debe retornar solo admin", async function () {
        await libreria.addAdmin({ email: "admin@test.com", password: "123", dni: "222" });
        let admin = await libreria.getAdministradorPorEmail("admin@test.com");
        assert.equal(admin.rol, ROL.ADMIN);
      });
    });

    describe("Getter de Carro", function () {
      it("getCarroCliente() debe retornar carro del cliente", async function () {
        let cliente = await libreria.addCliente({
          email: "test@test.com", password: "123", dni: "111"
        });
        let carro = await libreria.getCarroCliente(cliente._id);
        assert.isObject(carro);
        assert.isArray(carro.items);
      });
    });
    describe("Getters de Facturas", function () {
      it("getFacturaPorId() debe retornar factura correcta", async function () {
        let cliente = await libreria.addCliente({
          email: "test@test.com",
          password: "123",
          dni: "111",
          nombre: "Test",
          apellidos: "Usuario",
          direccion: "Calle Test"
        });
        let libro = await libreria.addLibro({
          isbn: "123",
          titulo: "Test",
          precio: 10,
          stock: 5,
          autores: "Autor",
          resumen: "Resumen"
        });

        await libreria.addClienteCarroItem(cliente._id, {
          libro: libro._id,
          cantidad: 2
        });
        await libreria.facturarCompraCliente({ cliente: cliente._id });

        let facturas = await libreria.getFacturas();
        let factura = facturas[0];
        let encontrada = await libreria.getFacturaPorId(factura._id);

        assert.equal(encontrada._id.toString(), factura._id.toString());
        assert.equal(encontrada.numero, factura.numero);
      });

      it("getFacturaPorNumero() debe retornar factura correcta", async function () {
        let cliente = await libreria.addCliente({
          email: "test@test.com",
          password: "123",
          dni: "111",
          nombre: "Test",
          apellidos: "Usuario",
          direccion: "Calle Test"
        });
        let libro = await libreria.addLibro({
          isbn: "123",
          titulo: "Test",
          precio: 10,
          stock: 5,
          autores: "Autor",
          resumen: "Resumen"
        });

        await libreria.addClienteCarroItem(cliente._id, {
          libro: libro._id,
          cantidad: 1
        });
        await libreria.facturarCompraCliente({ cliente: cliente._id });

        let facturas = await libreria.getFacturas();
        let encontrada = await libreria.getFacturaPorNumero(facturas[0].numero);

        assert.equal(encontrada.numero, facturas[0].numero);
      });
    });

  });

  // ============================================
  // EXCEPCIONES
  // ============================================

  describe("EXCEPCIONES", function () {

    describe("Excepciones en Libros", function () {
      it("addLibro() debe lanzar error si no tiene ISBN", async function () {
        try {
          await libreria.addLibro({
            titulo: "Sin ISBN", precio: 10, stock: 5,
            autores: "Autor", resumen: "Resumen"
          });
          assert.fail("Debería haber lanzado un error");
        } catch (err) {
          assert.include(err.message, 'ISBN');
        }
      });

      it("addLibro() debe lanzar error si ISBN ya existe", async function () {
        await libreria.addLibro({
          isbn: "123", titulo: "Libro 1", precio: 10, stock: 5,
          autores: "Autor", resumen: "Resumen"
        });

        try {
          await libreria.addLibro({
            isbn: "123", titulo: "Libro 2", precio: 15, stock: 3,
            autores: "Autor", resumen: "Resumen"
          });
          assert.fail("Debería haber lanzado un error");
        } catch (err) {
          assert.include(err.message, '123');
        }
      });

      it("removeLibro() debe lanzar error si libro no existe", async function () {
        try {
          await libreria.removeLibro(new mongoose.Types.ObjectId());
          assert.fail("Debería haber lanzado un error");
        } catch (err) {
          assert.include(err.message.toLowerCase(), 'encontrado');
        }
      });
    });

    describe("Excepciones en Usuarios", function () {
      it("addCliente() debe lanzar error si email ya existe", async function () {
        await libreria.addCliente({
          email: "cliente@test.com", password: "123", dni: "111"
        });

        try {
          await libreria.addCliente({
            email: "cliente@test.com", password: "456", dni: "222"
          });
          assert.fail("Debería haber lanzado un error");
        } catch (err) {
          assert.include(err.message.toLowerCase(), 'correo');
        }
      });

      it("autenticar() debe lanzar error si usuario no existe", async function () {
        try {
          await libreria.autenticar({
            email: "noexiste@test.com",
            password: "123",
            rol: ROL.CLIENTE
          });
          assert.fail("Debería haber lanzado un error");
        } catch (err) {
          assert.include(err.message.toLowerCase(), 'usuario');
        }
      });

      it("autenticar() debe lanzar error si contraseña incorrecta", async function () {
        await libreria.addCliente({
          email: "cliente@test.com", password: "correcta", dni: "111"
        });

        try {
          await libreria.autenticar({
            email: "cliente@test.com",
            password: "incorrecta",
            rol: ROL.CLIENTE
          });
          assert.fail("Debería haber lanzado un error");
        } catch (err) {
          assert.include(err.message.toLowerCase(), 'contraseña');
        }
      });
    });

    describe("Excepciones en Carro", function () {
      it("setClienteCarroItemCantidad() debe lanzar error si cantidad negativa", async function () {
        let cliente = await libreria.addCliente({
          email: "test@test.com", password: "123", dni: "111"
        });
        let libro = await libreria.addLibro({
          isbn: "123", titulo: "Test", precio: 10, stock: 5,
          autores: "Autor", resumen: "Resumen"
        });

        await libreria.addClienteCarroItem(cliente._id, {
          libro: libro._id, cantidad: 1
        });

        try {
          await libreria.setClienteCarroItemCantidad(cliente._id, 0, -5);
          assert.fail("Debería haber lanzado un error");
        } catch (err) {
          assert.include(err.message.toLowerCase(), 'cantidad');
        }
      });
    });

    describe("Excepciones en Facturas", function () {
      it("facturarCompraCliente() debe lanzar error si carro vacío", async function () {
        let cliente = await libreria.addCliente({
          email: "test@test.com", password: "123", dni: "111"
        });

        try {
          await libreria.facturarCompraCliente({ cliente: cliente._id });
          assert.fail("Debería haber lanzado un error");
        } catch (err) {
          assert.include(err.message.toLowerCase(), 'comprar');
        }
      });
    });
  });

  // ============================================
  // AGREGAR, MODIFICAR Y ELIMINAR
  // ============================================

  describe("AGREGAR, MODIFICAR Y ELIMINAR", function () {

    describe("CRUD de Libros", function () {
      it("addLibro() debe agregar libro correctamente", async function () {
        let libroData = {
          isbn: "978-3-16-148410-0",
          titulo: "JavaScript: The Good Parts",
          autores: "Douglas Crockford",
          resumen: "Un libro excelente sobre las mejores partes de JavaScript",
          portada: "http://example.com/portada.jpg",
          precio: 29.99,
          stock: 10
        };

        let libro = await libreria.addLibro(libroData);

        // Verificar que se creó correctamente
        assert.equal(libro.isbn, libroData.isbn);
        assert.equal(libro.titulo, libroData.titulo);
        assert.equal(libro.autores, libroData.autores);
        assert.equal(libro.resumen, libroData.resumen);
        assert.equal(libro.portada, libroData.portada);
        assert.equal(libro.precio, libroData.precio);
        assert.equal(libro.stock, libroData.stock);
        assert.exists(libro._id);

        let libros = await libreria.getLibros();
        assert.equal(libros.length, 1);
      });

      it("updateLibro() debe modificar libro correctamente", async function () {
        let libro = await libreria.addLibro({
          isbn: "123",
          titulo: "Original",
          precio: 10,
          stock: 5,
          autores: "Autor Original",
          resumen: "Resumen Original",
          portada: "http://example.com/original.jpg"
        });

        let actualizado = await libreria.updateLibro({
          _id: libro._id,
          isbn: "123",
          titulo: "Modificado",
          autores: "Autor Modificado",
          resumen: "Resumen Modificado",
          portada: "http://example.com/modificado.jpg",
          precio: 15,
          stock: 8
        });

        // ✅ VERIFICAR TODOS LOS CAMPOS
        assert.equal(actualizado._id.toString(), libro._id.toString());
        assert.equal(actualizado.isbn, "123");
        assert.equal(actualizado.titulo, "Modificado");
        assert.equal(actualizado.autores, "Autor Modificado");
        assert.equal(actualizado.resumen, "Resumen Modificado");
        assert.equal(actualizado.portada, "http://example.com/modificado.jpg");
        assert.equal(actualizado.precio, 15);
        assert.equal(actualizado.stock, 8);
      });

      it("removeLibro() debe eliminar libro correctamente", async function () {
        let libro = await libreria.addLibro({
          isbn: "123", titulo: "Test", precio: 10, stock: 5,
          autores: "Autor", resumen: "Resumen"
        });

        await libreria.removeLibro(libro._id);

        let libros = await libreria.getLibros();
        assert.equal(libros.length, 0);
      });
    });

    describe("CRUD de Usuarios", function () {
      it("addCliente() debe agregar cliente correctamente", async function () {
        let clienteData = {
          email: "cliente@test.com",
          password: "123456",
          dni: "12345678A",
          nombre: "Juan",
          apellidos: "Pérez García",
          direccion: "Calle Mayor 123, Madrid"
        };

        let cliente = await libreria.addCliente(clienteData);

        // Verificar todos los campos
        assert.equal(cliente.email, clienteData.email);
        assert.equal(cliente.password, clienteData.password);
        assert.equal(cliente.dni, clienteData.dni);
        assert.equal(cliente.nombre, clienteData.nombre);
        assert.equal(cliente.apellidos, clienteData.apellidos);
        assert.equal(cliente.direccion, clienteData.direccion);
        assert.equal(cliente.rol, ROL.CLIENTE);
        assert.exists(cliente._id);
        assert.exists(cliente.carro);
      });

      it("addAdmin() debe agregar administrador correctamente", async function () {
        let adminData = {
          email: "admin@test.com",
          password: "admin123",
          dni: "87654321B",
          nombre: "María",
          apellidos: "García López",
          direccion: "Avenida Principal 456, Barcelona"
        };

        let admin = await libreria.addAdmin(adminData);

        // Verificar todos los campos
        assert.equal(admin.email, adminData.email);
        assert.equal(admin.password, adminData.password);
        assert.equal(admin.dni, adminData.dni);
        assert.equal(admin.nombre, adminData.nombre);
        assert.equal(admin.apellidos, adminData.apellidos);
        assert.equal(admin.direccion, adminData.direccion);
        assert.equal(admin.rol, ROL.ADMIN);
        assert.exists(admin._id);
      });

      it("autenticar() debe retornar usuario si credenciales correctas", async function () {
        await libreria.addCliente({
          email: "cliente@test.com", password: "pass123", dni: "111"
        });

        let usuario = await libreria.autenticar({
          email: "cliente@test.com",
          password: "pass123",
          rol: ROL.CLIENTE
        });

        assert.equal(usuario.email, "cliente@test.com");
      });
      describe("Actualizar Usuarios", function () {
        it("updateUsuario() debe modificar cliente correctamente", async function () {
          let cliente = await libreria.addCliente({
            email: "cliente@test.com",
            password: "pass123",
            dni: "12345678A",
            nombre: "Juan",
            apellidos: "Pérez García",
            direccion: "Calle Mayor 123"
          });

          let actualizado = await libreria.updateUsuario({
            _id: cliente._id,
            rol: ROL.CLIENTE,
            email: "cliente@test.com",
            password: "nuevapass",
            dni: "12345678A",
            nombre: "Juan Modificado",
            apellidos: "Pérez López",
            direccion: "Avenida Nueva 456"
          });

          // Verificar todos los campos
          assert.equal(actualizado._id.toString(), cliente._id.toString());
          assert.equal(actualizado.email, "cliente@test.com");
          assert.equal(actualizado.password, "nuevapass");
          assert.equal(actualizado.dni, "12345678A");
          assert.equal(actualizado.nombre, "Juan Modificado");
          assert.equal(actualizado.apellidos, "Pérez López");
          assert.equal(actualizado.direccion, "Avenida Nueva 456");
          assert.equal(actualizado.rol, ROL.CLIENTE);
        });

        it("updateUsuario() debe modificar admin correctamente", async function () {
          let admin = await libreria.addAdmin({
            email: "admin@test.com",
            password: "admin123",
            dni: "87654321B",
            nombre: "María",
            apellidos: "García López",
            direccion: "Avenida Principal 456"
          });

          let actualizado = await libreria.updateUsuario({
            _id: admin._id,
            rol: ROL.ADMIN,
            email: "admin@test.com",
            password: "newadmin",
            dni: "87654321B",
            nombre: "María Modificada",
            apellidos: "García Martínez",
            direccion: "Calle Nueva 789"
          });

          assert.equal(actualizado._id.toString(), admin._id.toString());
          assert.equal(actualizado.email, "admin@test.com");
          assert.equal(actualizado.password, "newadmin");
          assert.equal(actualizado.dni, "87654321B");
          assert.equal(actualizado.nombre, "María Modificada");
          assert.equal(actualizado.apellidos, "García Martínez");
          assert.equal(actualizado.direccion, "Calle Nueva 789");
          assert.equal(actualizado.rol, ROL.ADMIN);
        });
      });
    });

    describe("CRUD de Items del Carro", function () {
      it("addClienteCarroItem() debe agregar item al carro", async function () {
        let cliente = await libreria.addCliente({
          email: "test@test.com", password: "123", dni: "111"
        });
        let libro = await libreria.addLibro({
          isbn: "123", titulo: "Test", precio: 10, stock: 5,
          autores: "Autor", resumen: "Resumen"
        });

        await libreria.addClienteCarroItem(cliente._id, {
          libro: libro._id, cantidad: 2
        });

        let carro = await libreria.getCarroCliente(cliente._id);
        assert.equal(carro.items.length, 1);
        assert.equal(carro.items[0].cantidad, 2);
      });

      it("setClienteCarroItemCantidad() debe modificar cantidad", async function () {
        let cliente = await libreria.addCliente({
          email: "test@test.com", password: "123", dni: "111"
        });
        let libro = await libreria.addLibro({
          isbn: "123", titulo: "Test", precio: 10, stock: 5,
          autores: "Autor", resumen: "Resumen"
        });

        await libreria.addClienteCarroItem(cliente._id, {
          libro: libro._id, cantidad: 2
        });
        await libreria.setClienteCarroItemCantidad(cliente._id, 0, 5);

        let carro = await libreria.getCarroCliente(cliente._id);
        assert.equal(carro.items[0].cantidad, 5);
      });

      it("setClienteCarroItemCantidad() con 0 debe eliminar item", async function () {
        let cliente = await libreria.addCliente({
          email: "test@test.com", password: "123", dni: "111"
        });
        let libro = await libreria.addLibro({
          isbn: "123", titulo: "Test", precio: 10, stock: 5,
          autores: "Autor", resumen: "Resumen"
        });

        await libreria.addClienteCarroItem(cliente._id, {
          libro: libro._id, cantidad: 2
        });
        await libreria.setClienteCarroItemCantidad(cliente._id, 0, 0);

        let carro = await libreria.getCarroCliente(cliente._id);
        assert.equal(carro.items.length, 0);
      });
    });

    describe("CRUD de Facturas", function () {
      it("facturarCompraCliente() debe crear factura correctamente", async function () {
        let cliente = await libreria.addCliente({
          email: "test@test.com",
          password: "123",
          dni: "111",
          nombre: "Test",
          apellidos: "Usuario"
        });
        let libro = await libreria.addLibro({
          isbn: "123", titulo: "Test", precio: 10, stock: 5,
          autores: "Autor", resumen: "Resumen"
        });

        await libreria.addClienteCarroItem(cliente._id, {
          libro: libro._id, cantidad: 2
        });
        await libreria.facturarCompraCliente({ cliente: cliente._id });

        let facturas = await libreria.getFacturas();
        assert.equal(facturas.length, 1);

        let carro = await libreria.getCarroCliente(cliente._id);
        assert.equal(carro.items.length, 0);
      });


      it("facturarCompraCliente() debe verificar todos los campos de la factura", async function () {
        let cliente = await libreria.addCliente({
          email: "test@test.com",
          password: "123",
          dni: "12345678A",
          nombre: "Juan",
          apellidos: "Pérez",
          direccion: "Calle Test 123"
        });
        let libro = await libreria.addLibro({
          isbn: "123",
          titulo: "Test Libro",
          precio: 10,
          stock: 5,
          autores: "Autor Test",
          resumen: "Resumen Test"
        });

        await libreria.addClienteCarroItem(cliente._id, {
          libro: libro._id,
          cantidad: 2
        });

        let factura = await libreria.facturarCompraCliente({
          cliente: cliente._id,
          razonSocial: "Juan Pérez S.L.",
          direccion: "Calle Factura 456",
          email: "factura@test.com",
          dni: "87654321B"
        });

        // Verificar todos los campos
        assert.exists(factura._id);
        assert.isNumber(factura.numero);
        assert.exists(factura.fecha);
        assert.equal(factura.razonSocial, "Juan Pérez S.L.");
        assert.equal(factura.direccion, "Calle Factura 456");
        assert.equal(factura.email, "factura@test.com");
        assert.equal(factura.dni, "87654321B");
        assert.isArray(factura.items);
        assert.equal(factura.items.length, 1);
        assert.equal(factura.subtotal, 20);
        assert.equal(factura.iva, 4.2);
        assert.equal(factura.total, 24.2);
        assert.exists(factura.cliente);
        assert.equal(factura.cliente._id.toString(), cliente._id.toString());
      });

      it("removeFactura() debe eliminar factura correctamente", async function () {
        let cliente = await libreria.addCliente({
          email: "test@test.com", password: "123", dni: "111"
        });
        let libro = await libreria.addLibro({
          isbn: "123", titulo: "Test", precio: 10, stock: 5,
          autores: "Autor", resumen: "Resumen"
        });

        await libreria.addClienteCarroItem(cliente._id, {
          libro: libro._id, cantidad: 1
        });
        await libreria.facturarCompraCliente({ cliente: cliente._id });

        let facturas = await libreria.getFacturas();
        let factura = facturas[0];
        await libreria.removeFactura(factura._id);

        facturas = await libreria.getFacturas();
        assert.equal(facturas.length, 0);
      });
    });
  });

  // ============================================
  // CÁLCULOS
  // ============================================

  describe("CÁLCULOS", function () {

    describe("Cálculos de Item", function () {
      it("Item.calcular() debe calcular total correctamente", async function () {
        let cliente = await libreria.addCliente({
          email: "test@test.com", password: "123", dni: "111"
        });
        let libro = await libreria.addLibro({
          isbn: "123", titulo: "Test", precio: 15.50, stock: 5,
          autores: "Autor", resumen: "Resumen"
        });

        await libreria.addClienteCarroItem(cliente._id, {
          libro: libro._id, cantidad: 3
        });

        let carro = await libreria.getCarroCliente(cliente._id);
        let item = carro.items[0];
        assert.equal(item.total, 46.50);
      });
    });

    describe("Cálculos del Carro", function () {
      it("Carro.calcular() debe calcular subtotal correctamente", async function () {
        let cliente = await libreria.addCliente({
          email: "test@test.com", password: "123", dni: "111"
        });
        let libro1 = await libreria.addLibro({
          isbn: "123", titulo: "Test 1", precio: 10, stock: 5,
          autores: "Autor", resumen: "Resumen"
        });
        let libro2 = await libreria.addLibro({
          isbn: "456", titulo: "Test 2", precio: 20, stock: 3,
          autores: "Autor", resumen: "Resumen"
        });

        await libreria.addClienteCarroItem(cliente._id, {
          libro: libro1._id, cantidad: 2
        });
        await libreria.addClienteCarroItem(cliente._id, {
          libro: libro2._id, cantidad: 3
        });

        let carro = await libreria.getCarroCliente(cliente._id);
        assert.equal(carro.subtotal, 80);
      });

      it("Carro.calcular() debe calcular IVA correctamente (21%)", async function () {
        let cliente = await libreria.addCliente({
          email: "test@test.com", password: "123", dni: "111"
        });
        let libro = await libreria.addLibro({
          isbn: "123", titulo: "Test", precio: 100, stock: 5,
          autores: "Autor", resumen: "Resumen"
        });

        await libreria.addClienteCarroItem(cliente._id, {
          libro: libro._id, cantidad: 1
        });

        let carro = await libreria.getCarroCliente(cliente._id);
        assert.equal(carro.subtotal, 100);
        assert.equal(carro.iva, 21);
      });

      it("Carro.calcular() debe calcular total correctamente", async function () {
        let cliente = await libreria.addCliente({
          email: "test@test.com", password: "123", dni: "111"
        });
        let libro = await libreria.addLibro({
          isbn: "123", titulo: "Test", precio: 100, stock: 5,
          autores: "Autor", resumen: "Resumen"
        });

        await libreria.addClienteCarroItem(cliente._id, {
          libro: libro._id, cantidad: 1
        });

        let carro = await libreria.getCarroCliente(cliente._id);
        assert.equal(carro.total, 121);
      });

      it("Carro.calcular() debe recalcular al modificar cantidad", async function () {
        let cliente = await libreria.addCliente({
          email: "test@test.com", password: "123", dni: "111"
        });
        let libro = await libreria.addLibro({
          isbn: "123", titulo: "Test", precio: 10, stock: 5,
          autores: "Autor", resumen: "Resumen"
        });

        await libreria.addClienteCarroItem(cliente._id, {
          libro: libro._id, cantidad: 2
        });
        let carro = await libreria.getCarroCliente(cliente._id);
        assert.equal(carro.total, 24.2);

        await libreria.setClienteCarroItemCantidad(cliente._id, 0, 5);
        carro = await libreria.getCarroCliente(cliente._id);
        assert.equal(carro.subtotal, 50);
        assert.equal(carro.iva, 10.5);
        assert.equal(carro.total, 60.5);
      });

      it("Carro.calcular() debe ser 0 cuando está vacío", async function () {
        let cliente = await libreria.addCliente({
          email: "test@test.com", password: "123", dni: "111"
        });
        let carro = await libreria.getCarroCliente(cliente._id);

        assert.equal(carro.subtotal, 0);
        assert.equal(carro.iva, 0);
        assert.equal(carro.total, 0);
      });
    });

    describe("Casos de cálculo complejos", function () {
      it("Debe calcular correctamente con decimales", async function () {
        let cliente = await libreria.addCliente({
          email: "test@test.com", password: "123", dni: "111"
        });
        let libro = await libreria.addLibro({
          isbn: "123", titulo: "Test", precio: 19.99, stock: 5,
          autores: "Autor", resumen: "Resumen"
        });

        await libreria.addClienteCarroItem(cliente._id, {
          libro: libro._id, cantidad: 3
        });

        let carro = await libreria.getCarroCliente(cliente._id);
        assert.approximately(carro.subtotal, 59.97, 0.01);
        assert.approximately(carro.iva, 12.59, 0.01);
        assert.approximately(carro.total, 72.56, 0.01);
      });
    });
  });
});