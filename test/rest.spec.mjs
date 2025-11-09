import * as chaiModule from "chai";
import chaiHttp from "chai-http";
const chai = chaiModule.use(chaiHttp);
const assert = chai.assert;

const URL = '/api';

import { app } from "../app.mjs";
import { crearLibro, crearCliente, crearAdmin } from "../model/seeder.mjs";

const ISBNS = ['978-3-16-148410-0', '978-3-16-148410-1', '978-3-16-148410-2', '978-3-16-148410-3', '978-3-16-148410-4'];
const DNIS = ['00000000C', '00000001C', '00000002C'];
const DNIS_ADMINS = ['00000000A', '00000001A', '00000002A'];



describe("REST libreria", function () {

  // ============================================
  // PRUEBAS DE LIBROS
  // ============================================

  describe("Libros", function () {

    it(`PUT ${URL}/libros`, async () => {
      let requester = chai.request.execute(app).keepOpen();
      let request = requester.get(`${URL}/libros`);
      let response = await request.send();
      assert.equal(response.status, 200);
      assert.isTrue(response.ok);
      let libros = response.body;
      assert.equal(0, libros.length); //espera que no haya libros, COMENTAMOS EL SEED DE app.mjs

      let libros_esperados = ISBNS.map(isbn => crearLibro(isbn));
      libros_esperados.forEach((l, i) => l._id = i + 1);

      request = requester.put(`${URL}/libros`);
      response = await request.send(libros_esperados);
      assert.equal(response.status, 200);
      assert.isTrue(response.ok);
      libros = response.body;
      assert.equal(libros_esperados.length, libros.length);

      libros_esperados.forEach(esperado => {
        let actual = libros.find(l => l.isbn == esperado.isbn);
        assert.equal(esperado.isbn, actual.isbn, "El isbn no coincide");
        assert.equal(esperado.titulo, actual.titulo, "El titulo no coincide");
        assert.equal(esperado.resumen, actual.resumen, "El resumen no coincide");
        assert.equal(esperado.autores, actual.autores, "Los autores no coinciden");
        assert.equal(esperado.portada, actual.portada, "La portada no coincide");
        assert.equal(esperado.stock, actual.stock, "El stock no coincide");
        assert.equal(esperado.precio, actual.precio, "El precio no coincide");
        assert.equal(esperado._id, actual._id, "El _id no coincide");
      });
      requester.close();
    });

    beforeEach(async function () {
      let requester = chai.request.execute(app).keepOpen();
      let request = requester.put(`${URL}/libros`);
      let response = await request.send([]);
      assert.equal(response.status, 200);
      assert.isTrue(response.ok);
      requester.close();
    });

    it(`GET ${URL}/libros`, async () => {
      let requester = chai.request.execute(app).keepOpen();
      let request = requester.get(`${URL}/libros`);
      let response = await request.send();
      assert.equal(response.status, 200);
      assert.isTrue(response.ok);
      let libros = response.body;
      assert.equal(0, libros.length);

      let libros_esperados = ISBNS.map(isbn => crearLibro(isbn));
      request = requester.put(`${URL}/libros`);
      await request.send(libros_esperados);

      request = requester.get(`${URL}/libros`);
      response = await request.send();
      assert.equal(response.status, 200);
      assert.isTrue(response.ok);
      libros = response.body;
      assert.equal(libros_esperados.length, libros.length);

      libros_esperados.forEach(esperado => {
        let actual = libros.find(l => l.isbn == esperado.isbn);
        assert.equal(esperado.isbn, actual.isbn, "El isbn no coincide");
        assert.equal(esperado.titulo, actual.titulo, "El titulo no coincide");
        assert.equal(esperado.resumen, actual.resumen, "El resumen no coincide");
        assert.equal(esperado.autores, actual.autores, "Los autores no coinciden");
        assert.equal(esperado.portada, actual.portada, "La portada no coincide");
        assert.equal(esperado.stock, actual.stock, "El stock no coincide");
        assert.equal(esperado.precio, actual.precio, "El precio no coincide");
        assert.isDefined(actual._id, "El _id no esta definido");
      });
      requester.close();
    });



    it(`GET ${URL}/libros/:id`, async () => {
      let requester = chai.request.execute(app).keepOpen();
      let libros = ISBNS.map(isbn => crearLibro(isbn));

      let request = requester.put(`${URL}/libros`);
      let response = await request.send(libros);
      assert.equal(response.status, 200);
      assert.isTrue(response.ok);
      libros = response.body;

      let responses = libros.map(async esperado => {
        request = requester.get(`${URL}/libros/${esperado._id}`);
        response = await request.send();
        assert.equal(response.status, 200);
        assert.isTrue(response.ok);
        let actual = response.body;
        assert.equal(esperado.isbn, actual.isbn, "El isbn no coincide");
        assert.equal(esperado.titulo, actual.titulo, "El titulo no coincide");
        assert.equal(esperado.resumen, actual.resumen, "El resumen no coincide");
        assert.equal(esperado.autores, actual.autores, "Los autores no coinciden");
        assert.equal(esperado.portada, actual.portada, "La portada no coincide");
        assert.equal(esperado.stock, actual.stock, "El stock no coincide");
        assert.equal(esperado.precio, actual.precio, "El precio no coincide");
        assert.equal(esperado._id, actual._id, "El _id no coincide");
      });
      await Promise.all(responses);
      requester.close();
    });

    it(`POST ${URL}/libros`, async () => {
      let requester = chai.request.execute(app).keepOpen();
      let libro_nuevo = crearLibro('978-NEW-BOOK-1');

      let request = requester.post(`${URL}/libros`);
      let response = await request.send(libro_nuevo);
      assert.equal(response.status, 200);
      assert.isTrue(response.ok);
      let libro = response.body;
      assert.isDefined(libro._id, "El _id debe estar definido");
      assert.equal(libro.isbn, libro_nuevo.isbn, "El isbn no coincide");
      assert.equal(libro.titulo, libro_nuevo.titulo, "El titulo no coincide");
      requester.close();
    });

    it(`PUT ${URL}/libros/:id`, async () => {
      let requester = chai.request.execute(app).keepOpen();
      let libro_original = crearLibro('978-UPDATE-1');

      let request = requester.post(`${URL}/libros`);
      let response = await request.send(libro_original);
      let libro = response.body;
      let id = libro._id;

      request = requester.put(`${URL}/libros/${id}`);
      response = await request.send({ precio: 99.99, stock: 100 });
      assert.equal(response.status, 200);
      assert.isTrue(response.ok);
      let libro_actualizado = response.body;
      assert.equal(libro_actualizado.precio, 99.99, "El precio no se actualizó");
      assert.equal(libro_actualizado.stock, 100, "El stock no se actualizó");
      requester.close();
    });

    it(`DELETE ${URL}/libros/:id`, async () => {
      let requester = chai.request.execute(app).keepOpen();
      let libro_nuevo = crearLibro('978-DELETE-1');

      let request = requester.post(`${URL}/libros`);
      let response = await request.send(libro_nuevo);
      let id = response.body._id;

      request = requester.delete(`${URL}/libros/${id}`);
      response = await request.send();
      assert.equal(response.status, 200);
      assert.isTrue(response.ok);
      assert.equal(response.body.ok, true);

      request = requester.get(`${URL}/libros/${id}`);
      response = await request.send();
      assert.equal(response.status, 404);
      requester.close();
    });

    it(`GET ${URL}/libros?isbn=...`, async () => {
      let requester = chai.request.execute(app).keepOpen();
      let libro = crearLibro('978-SEARCH-ISBN');

      let request = requester.post(`${URL}/libros`);
      await request.send(libro);

      request = requester.get(`${URL}/libros`).query({ isbn: '978-SEARCH-ISBN' });
      let response = await request.send();
      assert.equal(response.status, 200);
      assert.equal(response.body.isbn, '978-SEARCH-ISBN');
      requester.close();
    });

    it(`GET ${URL}/libros?titulo=...`, async () => {
      let requester = chai.request.execute(app).keepOpen();
      let libro = crearLibro('978-SEARCH-TITLE');

      let request = requester.post(`${URL}/libros`);
      await request.send(libro);

      request = requester.get(`${URL}/libros`).query({ titulo: libro.titulo.substring(0, 5) });
      let response = await request.send();
      assert.equal(response.status, 200);
      assert.include(response.body.titulo, libro.titulo.substring(0, 5));
      requester.close();
    });

    it(`DELETE ${URL}/libros`, async () => {
      let requester = chai.request.execute(app).keepOpen();
      let libros = ISBNS.slice(0, 3).map(isbn => crearLibro(isbn));

      let request = requester.put(`${URL}/libros`);
      await request.send(libros);

      request = requester.delete(`${URL}/libros`);
      let response = await request.send();
      assert.equal(response.status, 200);
      assert.equal(response.body.ok, true);

      request = requester.get(`${URL}/libros`);
      response = await request.send();
      assert.equal(response.body.length, 0);
      requester.close();
    });
  });

  // ============================================
  // PRUEBAS DE CLIENTES
  // ============================================

  describe("Clientes", function () {

    beforeEach(async function () {
      let requester = chai.request.execute(app).keepOpen();
      let request = requester.delete(`${URL}/clientes`);
      await request.send();
      requester.close();
    });

    it(`GET ${URL}/clientes`, async () => {
      let requester = chai.request.execute(app).keepOpen();
      let request = requester.get(`${URL}/clientes`);
      let response = await request.send();
      assert.equal(response.status, 200);
      assert.isArray(response.body);
      requester.close();
    });

    it(`POST ${URL}/clientes`, async () => {
      let requester = chai.request.execute(app).keepOpen();
      let cliente_nuevo = crearCliente('12345678A');

      let request = requester.post(`${URL}/clientes`);
      let response = await request.send(cliente_nuevo);
      assert.equal(response.status, 200);
      assert.isDefined(response.body._id);
      assert.equal(response.body.email, cliente_nuevo.email);
      assert.equal(response.body.rol, 'CLIENTE');
      requester.close();
    });

    it(`DELETE ${URL}/clientes`, async () => {
      let requester = chai.request.execute(app).keepOpen();
      let cliente_nuevo = crearCliente('12345679A');

      let request = requester.put(`${URL}/clientes`);
      await request.send(cliente_nuevo);

      request = requester.delete(`${URL}/clientes`);
      let response = await request.send();
      assert.equal(response.status, 200);
      assert.equal(response.body.ok, true);

      request = requester.get(`${URL}/clientes`);
      response = await request.send();
      assert.equal(response.body.length, 0);
      requester.close();
    });

    it(`PUT ${URL}/clientes`, async () => {
      let requester = chai.request.execute(app).keepOpen();

      let request = requester.get(`${URL}/clientes`);
      let response = await request.send();
      assert.equal(response.status, 200);
      assert.isTrue(response.ok);

      let clientes = response.body;
      assert.equal(0, clientes.length, "La lista de clientes debería estar vacía al inicio");

      let clientes_esperados = DNIS.map(dni => crearCliente(dni));

      request = requester.put(`${URL}/clientes`);
      response = await request.send(clientes_esperados);
      assert.equal(response.status, 200);
      assert.isTrue(response.ok);

      clientes = response.body;
      assert.equal(clientes_esperados.length, clientes.length, "Número de clientes incorrecto");

      clientes_esperados.forEach(esperado => {
        let actual = clientes.find(c => c.dni === esperado.dni);
        assert.isOk(actual, `No se encontró el cliente con dni ${esperado.dni}`);

        assert.equal(esperado.dni, actual.dni, "El DNI no coincide");
        assert.equal(esperado.nombre, actual.nombre, "El nombre no coincide");
        assert.equal(esperado.apellidos, actual.apellidos, "Los apellidos no coinciden");
        assert.equal(esperado.direccion, actual.direccion, "La dirección no coincide");
        assert.equal(esperado.email, actual.email, "El email no coincide");
        assert.equal(esperado.password, actual.password, "La contraseña no coincide");
        assert.equal(esperado.rol, actual.rol, "El rol no coincide");
        assert.exists(actual._id, "Falta _id en la respuesta");
      });

      requester.close();
    });


    it(`GET ${URL}/clientes/:id`, async () => {
      let requester = chai.request.execute(app).keepOpen();
      let cliente = crearCliente('12345678B');

      let request = requester.post(`${URL}/clientes`);
      let response = await request.send(cliente);
      let id = response.body._id;

      request = requester.get(`${URL}/clientes/${id}`);
      response = await request.send();
      assert.equal(response.status, 200);
      assert.equal(response.body._id, id);
      assert.equal(response.body.email, cliente.email);
      requester.close();
    });

    it(`GET ${URL}/clientes?email=...`, async () => {
      let requester = chai.request.execute(app).keepOpen();
      let cliente = crearCliente('12345678C');

      let request = requester.post(`${URL}/clientes`);
      await request.send(cliente);

      request = requester.get(`${URL}/clientes`).query({ email: cliente.email });
      let response = await request.send();
      assert.equal(response.status, 200);
      assert.equal(response.body.email, cliente.email);
      requester.close();
    });

    it(`GET ${URL}/clientes?dni=...`, async () => {
      let requester = chai.request.execute(app).keepOpen();
      let cliente = crearCliente('12345678C');

      let request = requester.post(`${URL}/clientes`);
      await request.send(cliente);

      request = requester.get(`${URL}/clientes`).query({ dni: cliente.dni });
      let response = await request.send();
      assert.equal(response.status, 200);
      assert.equal(response.body.dni, cliente.dni);
      requester.close();
    });

    it(`POST ${URL}/clientes/autenticar`, async () => {
      let requester = chai.request.execute(app).keepOpen();
      let cliente = crearCliente('12345678D');

      let request = requester.post(`${URL}/clientes`);
      await request.send(cliente);

      request = requester.post(`${URL}/clientes/autenticar`);
      let response = await request.send({ email: cliente.email, password: cliente.password });
      assert.equal(response.status, 200);
      assert.equal(response.body.email, cliente.email);
      requester.close();
    });

    it(`PUT ${URL}/clientes/:id`, async () => {
      let requester = chai.request.execute(app).keepOpen();
      let cliente = crearCliente('12345678E');

      let request = requester.post(`${URL}/clientes`);
      let response = await request.send(cliente);
      let id = response.body._id;

      request = requester.put(`${URL}/clientes/${id}`);
      response = await request.send({ nombre: 'NuevoNombre' });
      assert.equal(response.status, 200);
      assert.equal(response.body.nombre, 'NuevoNombre');
      requester.close();
    });

    it(`DELETE ${URL}/clientes/:id`, async () => {
      let requester = chai.request.execute(app).keepOpen();
      let cliente = crearCliente('12345678P');

      let request = requester.post(`${URL}/clientes`);
      let response = await request.send(cliente);
      let id = response.body._id;

      request = requester.delete(`${URL}/clientes/${id}`);
      response = await request.send();
      assert.equal(response.status, 200);
      assert.equal(response.body.ok, true);
      requester.close();
    });

    it(`GET ${URL}/clientes/:id/carro`, async () => {
      let requester = chai.request.execute(app).keepOpen();
      let cliente = crearCliente('12345678F');

      let request = requester.post(`${URL}/clientes`);
      let response = await request.send(cliente);
      let id = response.body._id;

      request = requester.get(`${URL}/clientes/${id}/carro`);
      response = await request.send();
      assert.equal(response.status, 200);
      assert.isArray(response.body.items);
      assert.equal(response.body.total, 0);
      requester.close();
    });

    it(`POST ${URL}/clientes/:id/carro/items`, async () => {
      let requester = chai.request.execute(app).keepOpen();
      let cliente = crearCliente('12345678G');
      let libro = crearLibro('978-CARRO-1');

      let request = requester.post(`${URL}/clientes`);
      let response = await request.send(cliente);
      let clienteId = response.body._id;

      request = requester.post(`${URL}/libros`);
      response = await request.send(libro);
      let libroId = response.body._id;

      request = requester.post(`${URL}/clientes/${clienteId}/carro/items`);
      response = await request.send({ libro: libroId, cantidad: 2 });
      assert.equal(response.status, 200);
      assert.equal(response.body.items.length, 1);
      assert.equal(response.body.items[0].cantidad, 2);
      requester.close();
    });

    it(`PUT ${URL}/clientes/:id/carro/items/:index`, async () => {
      let requester = chai.request.execute(app).keepOpen();
      let cliente = crearCliente('12345678H');
      let libro = crearLibro('978-CARRO-UPDATE');

      let request = requester.post(`${URL}/clientes`);
      let response = await request.send(cliente);
      let clienteId = response.body._id;

      request = requester.post(`${URL}/libros`);
      response = await request.send(libro);
      let libroId = response.body._id;

      request = requester.post(`${URL}/clientes/${clienteId}/carro/items`);
      await request.send({ libro: libroId, cantidad: 2 });

      request = requester.put(`${URL}/clientes/${clienteId}/carro/items/0`);
      response = await request.send({ cantidad: 5 });
      assert.equal(response.status, 200);
      assert.equal(response.body.items[0].cantidad, 5);
      requester.close();
    });

    it(`DELETE ${URL}/clientes/:id/carro/items/:index`, async () => {
      let requester = chai.request.execute(app).keepOpen();
      let cliente = crearCliente('12345678I');
      let libro = crearLibro('978-CARRO-DELETE');

      let request = requester.post(`${URL}/clientes`);
      let response = await request.send(cliente);
      let clienteId = response.body._id;

      request = requester.post(`${URL}/libros`);
      response = await request.send(libro);
      let libroId = response.body._id;

      request = requester.post(`${URL}/clientes/${clienteId}/carro/items`);
      await request.send({ libro: libroId, cantidad: 2 });

      request = requester.delete(`${URL}/clientes/${clienteId}/carro/items/0`);
      response = await request.send();
      assert.equal(response.status, 200);
      assert.equal(response.body.items.length, 0);
      requester.close();
    });
  });

  // ============================================
  // PRUEBAS DE ADMINISTRADORES
  // ============================================

  describe("Administradores", function () {

    beforeEach(async function () {
      let requester = chai.request.execute(app).keepOpen();
      let request = requester.delete(`${URL}/admins`);
      await request.send();
      requester.close();
    });

    it(`GET ${URL}/admins`, async () => {
      let requester = chai.request.execute(app).keepOpen();
      let request = requester.get(`${URL}/admins`);
      let response = await request.send();
      assert.equal(response.status, 200);
      assert.isArray(response.body);
      requester.close();
    });

    it(`POST ${URL}/admins`, async () => {
      let requester = chai.request.execute(app).keepOpen();
      let admin = crearAdmin('12345611F');

      let request = requester.post(`${URL}/admins`);
      let response = await request.send(admin);
      assert.equal(response.status, 200);
      assert.isDefined(response.body._id);
      assert.equal(response.body.email, admin.email);
      assert.equal(response.body.rol, 'ADMIN');
      requester.close();
    });

    it(`DELETE ${URL}/admins`, async () => {
      let requester = chai.request.execute(app).keepOpen();
      let cliente_nuevo = crearAdmin('12345671A');

      let request = requester.put(`${URL}/admins`);
      await request.send(cliente_nuevo);

      request = requester.delete(`${URL}/admins`);
      let response = await request.send();
      assert.equal(response.status, 200);
      assert.equal(response.body.ok, true);

      request = requester.get(`${URL}/admins`);
      response = await request.send();
      assert.equal(response.body.length, 0);
      requester.close();
    });

    it(`PUT ${URL}/admins`, async () => {
      let requester = chai.request.execute(app).keepOpen();

      let request = requester.get(`${URL}/admins`);
      let response = await request.send();
      assert.equal(response.status, 200);
      assert.isTrue(response.ok);

      let admins = response.body;
      assert.equal(0, admins.length, "La lista de admins debería estar vacía al inicio");

      let admins_esperados = DNIS_ADMINS.map(dni => crearAdmin(dni));

      request = requester.put(`${URL}/admins`);
      response = await request.send(admins_esperados);
      assert.equal(response.status, 200);
      assert.isTrue(response.ok);

      admins = response.body;
      assert.equal(admins_esperados.length, admins.length, "Número de admins incorrecto");

      admins_esperados.forEach(esperado => {
        let actual = admins.find(c => c.dni === esperado.dni);
        assert.isOk(actual, `No se encontró el admin con dni ${esperado.dni}`);

        assert.equal(esperado.dni, actual.dni, "El DNI no coincide");
        assert.equal(esperado.nombre, actual.nombre, "El nombre no coincide");
        assert.equal(esperado.apellidos, actual.apellidos, "Los apellidos no coinciden");
        assert.equal(esperado.direccion, actual.direccion, "La dirección no coincide");
        assert.equal(esperado.email, actual.email, "El email no coincide");
        assert.equal(esperado.password, actual.password, "La contraseña no coincide");
        assert.equal(esperado.rol, actual.rol, "El rol no coincide");
        assert.exists(actual._id, "Falta _id en la respuesta");
      });

      requester.close();
    });

    it(`GET ${URL}/admins?email=...`, async () => {
      let requester = chai.request.execute(app).keepOpen();
      let admin = crearAdmin('12341234A');

      let request = requester.post(`${URL}/admins`);
      await request.send(admin);

      request = requester.get(`${URL}/admins`).query({ email: admin.email });
      let response = await request.send();
      assert.equal(response.status, 200);
      assert.equal(response.body.email, admin.email);
      requester.close();
    });

    it(`GET ${URL}/admins?dni=...`, async () => {
      let requester = chai.request.execute(app).keepOpen();
      let admin = crearAdmin('12341234B');

      let request = requester.post(`${URL}/admins`);
      await request.send(admin);

      request = requester.get(`${URL}/admins`).query({ dni: admin.dni });
      let response = await request.send();
      assert.equal(response.status, 200);
      assert.equal(response.body.dni, admin.dni);
      requester.close();
    });


    it(`GET ${URL}/admins/:id`, async () => {
      let requester = chai.request.execute(app).keepOpen();
      let admin = crearAdmin('12345111F');

      let request = requester.post(`${URL}/admins`);
      let response = await request.send(admin);
      let id = response.body._id;

      request = requester.get(`${URL}/admins/${id}`);
      response = await request.send();
      assert.equal(response.status, 200);
      assert.equal(response.body._id, id);
      requester.close();
    });

    it(`POST ${URL}/admins/autenticar`, async () => {
      let requester = chai.request.execute(app).keepOpen();
      let admin = crearAdmin('12341111F');

      let request = requester.post(`${URL}/admins`);
      await request.send(admin);

      request = requester.post(`${URL}/admins/autenticar`);
      let response = await request.send({ email: admin.email, password: admin.password });
      assert.equal(response.status, 200);
      assert.equal(response.body.email, admin.email);
      requester.close();
    });

    it(`PUT ${URL}/admins/:id`, async () => {
      let requester = chai.request.execute(app).keepOpen();
      let admin = crearAdmin('12311111F');

      let request = requester.post(`${URL}/admins`);
      let response = await request.send(admin);
      let id = response.body._id;

      request = requester.put(`${URL}/admins/${id}`);
      response = await request.send({ nombre: 'AdminModificado' });
      assert.equal(response.status, 200);
      assert.equal(response.body.nombre, 'AdminModificado');
      requester.close();
    });

    it(`DELETE ${URL}/admins/:id`, async () => {
      let requester = chai.request.execute(app).keepOpen();
      let admin = crearAdmin('12111111F');

      let request = requester.post(`${URL}/admins`);
      let response = await request.send(admin);
      let id = response.body._id;

      request = requester.delete(`${URL}/admins/${id}`);
      response = await request.send();
      assert.equal(response.status, 200);
      assert.equal(response.body.ok, true);
      requester.close();
    });
  });

  // ============================================
  // PRUEBAS DE FACTURAS
  // ============================================

  describe("Facturas", function () {

    beforeEach(async function () {
      let requester = chai.request.execute(app).keepOpen();
      let request = requester.delete(`${URL}/facturas`);
      await request.send();
      request = requester.delete(`${URL}/clientes`);
      await request.send();
      request = requester.put(`${URL}/libros`);
      await request.send([]);
      requester.close();
    });

    it(`GET ${URL}/facturas`, async () => {
      let requester = chai.request.execute(app).keepOpen();
      let request = requester.get(`${URL}/facturas`);
      let response = await request.send();
      assert.equal(response.status, 200);
      assert.isArray(response.body);
      requester.close();
    });

    it(`POST ${URL}/facturas`, async () => {
      let requester = chai.request.execute(app).keepOpen();
      let cliente = crearCliente('12345678J');
      let libro = crearLibro('978-FACTURA-1');

      let request = requester.post(`${URL}/clientes`);
      let response = await request.send(cliente);
      let clienteId = response.body._id;

      request = requester.post(`${URL}/libros`);
      response = await request.send(libro);
      let libroId = response.body._id;

      request = requester.post(`${URL}/clientes/${clienteId}/carro/items`);
      await request.send({ libro: libroId, cantidad: 2 });

      request = requester.post(`${URL}/facturas`);
      response = await request.send({
        cliente: clienteId,
        razonSocial: cliente.nombre,
        direccion: cliente.direccion,
        email: cliente.email,
        dni: cliente.dni,
        fecha: new Date()
      });
      assert.equal(response.status, 200);
      assert.isDefined(response.body._id);
      assert.isDefined(response.body.numero);
      assert.isArray(response.body.items);
      requester.close();
    });

    


    it(`GET ${URL}/facturas/:id`, async () => {
      let requester = chai.request.execute(app).keepOpen();
      let cliente = crearCliente('12345678K');
      let libro = crearLibro('978-FACT-GET-1');

      let request = requester.post(`${URL}/clientes`);
      let response = await request.send(cliente);
      let clienteId = response.body._id;

      request = requester.post(`${URL}/libros`);
      response = await request.send(libro);
      let libroId = response.body._id;

      request = requester.post(`${URL}/clientes/${clienteId}/carro/items`);
      await request.send({ libro: libroId, cantidad: 1 });

      request = requester.post(`${URL}/facturas`);
      response = await request.send({ cliente: clienteId });
      let facturaId = response.body._id;

      request = requester.get(`${URL}/facturas/${facturaId}`);
      response = await request.send();
      assert.equal(response.status, 200);
      assert.equal(response.body._id, facturaId);
      requester.close();
    });

    it(`GET ${URL}/facturas?cliente=...`, async () => {
      let requester = chai.request.execute(app).keepOpen();
      let cliente = crearCliente('12345678L');
      let libro = crearLibro('978-FACT-CLIENTE');

      let request = requester.post(`${URL}/clientes`);
      let response = await request.send(cliente);
      let clienteId = response.body._id;

      request = requester.post(`${URL}/libros`);
      response = await request.send(libro);
      let libroId = response.body._id;

      request = requester.post(`${URL}/clientes/${clienteId}/carro/items`);
      await request.send({ libro: libroId, cantidad: 1 });

      request = requester.post(`${URL}/facturas`);
      await request.send({ cliente: clienteId });

      request = requester.get(`${URL}/facturas`).query({ cliente: clienteId });
      response = await request.send();
      assert.equal(response.status, 200);
      assert.isArray(response.body);
      assert.isAtLeast(response.body.length, 1);
      requester.close();
    });

     it(`GET ${URL}/facturas?numero=...`, async () => {
      let requester = chai.request.execute(app).keepOpen();
      let cliente = crearCliente('12345678Ñ');
      let libro = crearLibro('978-FACT-CLIENTE');

      let request = requester.post(`${URL}/clientes`);
      let response = await request.send(cliente);
      let clienteId = response.body._id;

      request = requester.post(`${URL}/libros`);
      response = await request.send(libro);
      let libroId = response.body._id;

      request = requester.post(`${URL}/clientes/${clienteId}/carro/items`);
      await request.send({ libro: libroId, cantidad: 1 });

      request = requester.post(`${URL}/facturas`);
      await request.send({ cliente: clienteId });
      let facturaNumero = response.body.numero;

      request = requester.get(`${URL}/facturas`).query({ numero: facturaNumero });
      response = await request.send();
      assert.equal(response.status, 200);
      assert.isArray(response.body);
      assert.isAtLeast(response.body.length, 1);
      requester.close();
    });


    it(`DELETE ${URL}/facturas/:id`, async () => {
      let requester = chai.request.execute(app).keepOpen();
      let cliente = crearCliente('12345678M');
      let libro = crearLibro('978-FACT-DELETE');

      let request = requester.post(`${URL}/clientes`);
      let response = await request.send(cliente);
      let clienteId = response.body._id;

      request = requester.post(`${URL}/libros`);
      response = await request.send(libro);
      let libroId = response.body._id;

      request = requester.post(`${URL}/clientes/${clienteId}/carro/items`);
      await request.send({ libro: libroId, cantidad: 1 });

      request = requester.post(`${URL}/facturas`);
      response = await request.send({ cliente: clienteId });
      let facturaId = response.body._id;

      request = requester.delete(`${URL}/facturas/${facturaId}`);
      response = await request.send();
      assert.equal(response.status, 200);
      assert.equal(response.body.ok, true);
      requester.close();
    });
  });
});
