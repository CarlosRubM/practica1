import * as chaiModule from "chai";
const chai = chaiModule; 
const assert = chai.assert;
import { Libreria, ROL } from '../model/model.mjs';

const model = new Libreria();

describe("GETTERS Y SETTERS", function () {

    beforeEach(function () {
        // Limpiar el modelo antes de cada test para que no haya problemas con las pruebas
        model.libros = [];
        model.usuarios = [];
        model.facturas = [];
        Libreria.lastId = 0;
        Libreria.lastFacturaNumero = 0;
    });

    describe("Getters de Libros", function () {
        it("getLibros() debe retornar array de libros", function () {
            let libros = model.getLibros();
            assert.isArray(libros);
        });

        it("getLibroPorId() debe retornar libro correcto", function () {
            let libro = model.addLibro({ isbn: "123", titulo: "Test", precio: 10, stock: 5 });
            let encontrado = model.getLibroPorId(libro._id);
            assert.equal(encontrado._id, libro._id);
        });

        it("getLibroPorIsbn() debe retornar libro correcto", function () {
            model.addLibro({ isbn: "ABC123", titulo: "Test", precio: 10, stock: 5 });
            let encontrado = model.getLibroPorIsbn("ABC123");
            assert.equal(encontrado.isbn, "ABC123");
        });

        it("getLibroPorTitulo() debe retornar libro correcto", function () {
            model.addLibro({ isbn: "XYZ", titulo: "JavaScript Avanzado", precio: 20, stock: 3 });
            let encontrado = model.getLibroPorTitulo("JavaScript");
            assert.equal(encontrado.titulo, "JavaScript Avanzado");
        });
    });

    describe("Getters de Usuarios", function () {
        it("getClientes() debe retornar solo clientes", function () {
            model.addCliente({ email: "cliente@test.com", password: "123", dni: "111" });
            model.addAdmin({ email: "admin@test.com", password: "123", dni: "222" });
            let clientes = model.getClientes();
            assert.equal(clientes.length, 1);
            assert.equal(clientes[0].rol, ROL.CLIENTE);
        });

        it("getAdmins() debe retornar solo administradores", function () {
            model.addCliente({ email: "cliente@test.com", password: "123", dni: "111" });
            model.addAdmin({ email: "admin@test.com", password: "123", dni: "222" });
            let admins = model.getAdmins();
            assert.equal(admins.length, 1);
            assert.equal(admins[0].rol, ROL.ADMIN);
        });

        it("getUsuarioPorId() debe retornar usuario correcto", function () {
            let cliente = model.addCliente({ email: "test@test.com", password: "123", dni: "111" });
            let encontrado = model.getUsuarioPorId(cliente._id);
            assert.equal(encontrado._id, cliente._id);
        });

        it("getUsuarioPorEmail() debe retornar usuario correcto", function () {
            model.addCliente({ email: "usuario@test.com", password: "123", dni: "111" });
            let encontrado = model.getUsuarioPorEmail("usuario@test.com");
            assert.equal(encontrado.email, "usuario@test.com");
        });

        it("getUsuarioPorDni() debe retornar usuario correcto", function () {
            model.addCliente({ email: "test@test.com", password: "123", dni: "12345678A" });
            let encontrado = model.getUsuarioPorDni("12345678A");
            assert.equal(encontrado.dni, "12345678A");
        });

        it("getClientePorEmail() debe retornar solo cliente", function () {
            model.addCliente({ email: "cliente@test.com", password: "123", dni: "111" });
            let cliente = model.getClientePorEmail("cliente@test.com");
            assert.equal(cliente.rol, ROL.CLIENTE);
        });

        it("getClientePorId() debe retornar cliente correcto", function () {
            let cliente = model.addCliente({ email: "test@test.com", password: "123", dni: "111" });
            let encontrado = model.getClientePorId(cliente._id);
            assert.equal(encontrado._id, cliente._id);
            assert.equal(encontrado.rol, ROL.CLIENTE);
        });

        it("getAdministradorPorEmail() debe retornar solo admin", function () {
            model.addAdmin({ email: "admin@test.com", password: "123", dni: "222" });
            let admin = model.getAdministradorPorEmail("admin@test.com");
            assert.equal(admin.rol, ROL.ADMIN);
        });
    });

    describe("Getters de Facturas", function () {
        it("getFacturas() debe retornar array de facturas", function () {
            let facturas = model.getFacturas();
            assert.isArray(facturas);
        });

        it("getFacturaPorId() debe retornar factura correcta", function () {
            // 1. Preparación
            let cliente = model.addCliente({ email: "test@test.com", password: "123", dni: "111" });
            let libro = model.addLibro({ isbn: "123", titulo: "Test", precio: 10, stock: 5 });
            cliente.addCarroItem({ libro: libro, cantidad: 1 });
            model.facturarCompraCliente({ cliente: cliente._id });
            // Sabemos que solo hay una, así que podemos tomar la primera del array.
            let facturaCreada = model.getFacturas()[0];
            // Ahora usamos el ID de esa factura para probar el método getFacturaPorId
            let facturaEncontrada = model.getFacturaPorId(facturaCreada._id);
            assert.isObject(facturaEncontrada);
            assert.equal(facturaEncontrada._id, facturaCreada._id);
        });

        it("getFacturaPorNumero() debe retornar factura correcta", function () {
            let cliente = model.addCliente({ email: "test@test.com", password: "123", dni: "111" });
            let libro = model.addLibro({ isbn: "123", titulo: "Test", precio: 10, stock: 5 });
            cliente.addCarroItem({ libro: libro, cantidad: 1 });
            model.facturarCompraCliente({ cliente: cliente._id });
            let facturas = model.getFacturaPorNumero(1);
            let factura = model.getFacturaPorNumero(1);
            assert.isObject(factura);
            assert.equal(factura.numero, 1);
        });
    });

    describe("Getter de Carro", function () {
        it("getCarroCliente() debe retornar carro del cliente", function () {
            let cliente = model.addCliente({ email: "test@test.com", password: "123", dni: "111" });
            let carro = model.getCarroCliente(cliente._id);
            assert.isObject(carro);
            assert.isArray(carro.items);
        });

        it("getCarro() del cliente debe retornar su carro", function () {
            let cliente = model.addCliente({ email: "test@test.com", password: "123", dni: "111" });
            let carro = cliente.getCarro();
            assert.isObject(carro);
            assert.equal(carro.subtotal, 0);
        });
    });
});

describe("EXCEPCIONES", function () {

    beforeEach(function () {
        model.libros = [];
        model.usuarios = [];
        model.facturas = [];
        Libreria.lastId = 0;
        Libreria.lastFacturaNumero = 0;
    });

    describe("Excepciones en Libros", function () {
        it("addLibro() debe lanzar error si no tiene ISBN", function () {
            assert.throws(() => {
                model.addLibro({ titulo: "Sin ISBN", precio: 10, stock: 5 });
            }, Error, 'El libro no tiene ISBN');
        });

        it("addLibro() debe lanzar error si ISBN ya existe", function () {
            model.addLibro({ isbn: "123", titulo: "Libro 1", precio: 10, stock: 5 });
            assert.throws(() => {
                model.addLibro({ isbn: "123", titulo: "Libro 2", precio: 15, stock: 3 });
            }, Error, 'El ISBN 123 ya existe');
        });

        it("removeLibro() debe lanzar error si libro no existe", function () {
            assert.throws(() => {
                model.removeLibro(999);
            }, Error, 'Libro no encontrado');
        });
    });

    describe("Excepciones en Usuarios", function () {
        it("addCliente() debe lanzar error si email ya existe", function () {
            model.addCliente({ email: "cliente@test.com", password: "123", dni: "111" });
            assert.throws(() => {
                model.addCliente({ email: "cliente@test.com", password: "456", dni: "222" });
            }, Error, 'Correo electrónico registrado');
        });

        it("addUsuario() debe lanzar error si rol es desconocido", function () {
            assert.throws(() => {
                model.addUsuario({ email: "test@test.com", password: "123", rol: "SUPERUSER" });
            }, Error, 'Rol desconocido');
        });

        it("autenticar() debe lanzar error si rol no existe", function () {
            assert.throws(() => {
                model.autenticar({ email: "test@test.com", password: "123", rol: "INVALID" });
            }, Error, 'Rol no encontrado');
        });

        it("autenticar() debe lanzar error si usuario no existe", function () {
            assert.throws(() => {
                model.autenticar({ email: "noexiste@test.com", password: "123", rol: ROL.CLIENTE });
            }, Error, 'Usuario no encontrado');
        });

        it("autenticar() debe lanzar error si contraseña es incorrecta", function () {
            model.addCliente({ email: "cliente@test.com", password: "correcta", dni: "111" });
            assert.throws(() => {
                model.autenticar({ email: "cliente@test.com", password: "incorrecta", rol: ROL.CLIENTE });
            }, Error, 'Error en la contraseña');
        });
    });

    describe("Excepciones en Carro", function () {
        it("setItemCantidad() debe lanzar error si cantidad es negativa", function () {
            let cliente = model.addCliente({ email: "test@test.com", password: "123", dni: "111" });
            let libro = model.addLibro({ isbn: "123", titulo: "Test", precio: 10, stock: 5 });
            cliente.addCarroItem({ libro: libro, cantidad: 1 });
            assert.throws(() => {
                cliente.carro.setItemCantidad(0, -5);
            }, Error, 'Cantidad inferior a 0');
        });
    });

    describe("Excepciones en Facturas", function () {
        it("facturarCompraCliente() debe lanzar error si no hay cliente", function () {
            assert.throws(() => {
                model.facturarCompraCliente({});
            }, Error, 'Cliente no definido');
        });

        it("facturarCompraCliente() debe lanzar error si carro está vacío", function () {
            let cliente = model.addCliente({ email: "test@test.com", password: "123", dni: "111" });
            assert.throws(() => {
                model.facturarCompraCliente({ cliente: cliente._id });
            }, Error, 'No hay que comprar');
        });

        it("removeFactura() debe lanzar error si factura no existe", function () {
            assert.throws(() => {
                model.removeFactura(999);
            }, Error, 'Factura no encontrada');
        });
    });
});

describe("AGREGAR, MODIFICAR Y ELIMINAR", function () {

    beforeEach(function () {
        model.libros = [];
        model.usuarios = [];
        model.facturas = [];
        Libreria.lastId = 0;
        Libreria.lastFacturaNumero = 0;
    });

    describe("CRUD de Libros", function () {
        it("addLibro() debe agregar libro correctamente", function () {
            let libro = model.addLibro({
                isbn: "978-3-16-148410-0",
                titulo: "JavaScript: The Good Parts",
                autores: "Douglas Crockford",
                precio: 29.99,
                stock: 10
            });
            assert.equal(libro.isbn, "978-3-16-148410-0");
            assert.equal(libro.titulo, "JavaScript: The Good Parts");
            assert.isNumber(libro._id);
            assert.equal(model.getLibros().length, 1);
        });

        it("updateLibro() debe modificar libro correctamente", function () {
            let libro = model.addLibro({ isbn: "123", titulo: "Original", precio: 10, stock: 5 });
            let actualizado = model.updateLibro({
                _id: libro._id,
                isbn: "123",
                titulo: "Modificado",
                precio: 15,
                stock: 8
            });
            assert.equal(actualizado.titulo, "Modificado");
            assert.equal(actualizado.precio, 15);
            assert.equal(actualizado.stock, 8);
        });

        it("removeLibro() debe eliminar libro correctamente", function () {
            let libro = model.addLibro({ isbn: "123", titulo: "Test", precio: 10, stock: 5 });
            let eliminado = model.removeLibro(libro._id);
            assert.equal(eliminado._id, libro._id);
            assert.equal(model.getLibros().length, 0);
        });
    });

    describe("CRUD de Usuarios", function () {
        it("addCliente() debe agregar cliente correctamente", function () {
            let cliente = model.addCliente({
                email: "cliente@test.com",
                password: "123456",
                dni: "12345678A",
                nombre: "Juan",
                apellidos: "Pérez"
            });
            assert.equal(cliente.email, "cliente@test.com");
            assert.equal(cliente.rol, ROL.CLIENTE);
            assert.isObject(cliente.carro);
            assert.isNumber(cliente._id);
        });

        it("addAdmin() debe agregar administrador correctamente", function () {
            let admin = model.addAdmin({
                email: "admin@test.com",
                password: "admin123",
                dni: "87654321B",
                nombre: "María",
                apellidos: "García"
            });
            assert.equal(admin.email, "admin@test.com");
            assert.equal(admin.rol, ROL.ADMIN);
            assert.isNumber(admin._id);
        });

        it("updateUsuario() debe modificar usuario correctamente", function () {
            let cliente = model.addCliente({ email: "test@test.com", password: "123", dni: "111" });
            let actualizado = model.updateUsuario({
                _id: cliente._id,
                email: "nuevo@test.com",
                nombre: "Nombre Nuevo"
            });
            assert.equal(actualizado.email, "nuevo@test.com");
            assert.equal(actualizado.nombre, "Nombre Nuevo");
        });

        it("autenticar() debe retornar usuario si credenciales correctas", function () {
            model.addCliente({ email: "cliente@test.com", password: "pass123", dni: "111" });
            let usuario = model.autenticar({
                email: "cliente@test.com",
                password: "pass123",
                rol: ROL.CLIENTE
            });
            assert.equal(usuario.email, "cliente@test.com");
        });
    });

    describe("CRUD de Items del Carro", function () {
        it("addCarroItem() debe agregar item al carro", function () {
            let cliente = model.addCliente({ email: "test@test.com", password: "123", dni: "111" });
            let libro = model.addLibro({ isbn: "123", titulo: "Test", precio: 10, stock: 5 });
            cliente.addCarroItem({ libro: libro, cantidad: 2 });
            assert.equal(cliente.carro.items.length, 1);
            assert.equal(cliente.carro.items[0].cantidad, 2);
        });

        it("addCarroItem() debe incrementar cantidad si libro ya existe", function () {
            let cliente = model.addCliente({ email: "test@test.com", password: "123", dni: "111" });
            let libro = model.addLibro({ isbn: "123", titulo: "Test", precio: 10, stock: 5 });
            cliente.addCarroItem({ libro: libro, cantidad: 2 });
            cliente.addCarroItem({ libro: libro, cantidad: 3 });
            assert.equal(cliente.carro.items.length, 1);
            assert.equal(cliente.carro.items[0].cantidad, 5);
        });

        it("setCarroItemCantidad() debe modificar cantidad de item", function () {
            let cliente = model.addCliente({ email: "test@test.com", password: "123", dni: "111" });
            let libro = model.addLibro({ isbn: "123", titulo: "Test", precio: 10, stock: 5 });
            cliente.addCarroItem({ libro: libro, cantidad: 2 });
            cliente.setCarroItemCantidad(0, 5);
            assert.equal(cliente.carro.items[0].cantidad, 5);
        });

        it("setCarroItemCantidad() con 0 debe eliminar item", function () {
            let cliente = model.addCliente({ email: "test@test.com", password: "123", dni: "111" });
            let libro = model.addLibro({ isbn: "123", titulo: "Test", precio: 10, stock: 5 });
            cliente.addCarroItem({ libro: libro, cantidad: 2 });
            cliente.carro.setItemCantidad(0, 0);
            assert.equal(cliente.carro.items.length, 0);
        });

        it("borrarCarroItem() debe eliminar item del carro", function () {
            let cliente = model.addCliente({ email: "test@test.com", password: "123", dni: "111" });
            let libro = model.addLibro({ isbn: "123", titulo: "Test", precio: 10, stock: 5 });
            cliente.addCarroItem({ libro: libro, cantidad: 2 });
            cliente.borrarCarroItem(0);
            assert.equal(cliente.carro.items.length, 0);
        });

        it("removeItems() debe vaciar el carro", function () {
            let cliente = model.addCliente({ email: "test@test.com", password: "123", dni: "111" });
            let libro1 = model.addLibro({ isbn: "123", titulo: "Test 1", precio: 10, stock: 5 });
            let libro2 = model.addLibro({ isbn: "456", titulo: "Test 2", precio: 20, stock: 3 });
            cliente.addCarroItem({ libro: libro1, cantidad: 2 });
            cliente.addCarroItem({ libro: libro2, cantidad: 1 });
            cliente.removeItems();
            assert.equal(cliente.carro.items.length, 0);
            assert.equal(cliente.carro.total, 0);
        });
    });

    describe("CRUD de Facturas", function () {
        it("facturarCompraCliente() debe crear factura correctamente", function () {
            let cliente = model.addCliente({
                email: "test@test.com",
                password: "123",
                dni: "111",
                nombre: "Test",
                apellidos: "Usuario"
            });
            let libro = model.addLibro({ isbn: "123", titulo: "Test", precio: 10, stock: 5 });
            cliente.addCarroItem({ libro: libro, cantidad: 2 });

            model.facturarCompraCliente({ cliente: cliente._id });

            assert.equal(model.getFacturas().length, 1);
            assert.equal(cliente.carro.items.length, 0);
        });

        it("facturarCompraCliente() debe generar número de factura", function () {
            let cliente = model.addCliente({ email: "test@test.com", password: "123", dni: "111" });
            let libro = model.addLibro({ isbn: "123", titulo: "Test", precio: 10, stock: 5 });
            cliente.addCarroItem({ libro: libro, cantidad: 1 });

            model.facturarCompraCliente({ cliente: cliente._id });

            let factura = model.getFacturas()[0];
            assert.isNumber(factura.numero);
            assert.equal(factura.numero, 1);
        });

        it("removeFactura() debe eliminar factura correctamente", function () {
            let cliente = model.addCliente({ email: "test@test.com", password: "123", dni: "111" });
            let libro = model.addLibro({ isbn: "123", titulo: "Test", precio: 10, stock: 5 });
            cliente.addCarroItem({ libro: libro, cantidad: 1 });
            model.facturarCompraCliente({ cliente: cliente._id });

            let factura = model.getFacturas()[0];
            model.removeFactura(factura._id);

            assert.equal(model.getFacturas().length, 0);
        });
        
    });
});

describe("CÁLCULOS", function () {

    beforeEach(function () {
        model.libros = [];
        model.usuarios = [];
        model.facturas = [];
        Libreria.lastId = 0;
        Libreria.lastFacturaNumero = 0;
    });

    describe("Cálculos de Stock y Precio", function () {
        it("incStockN() debe incrementar stock correctamente", function () {
            let libro = model.addLibro({ isbn: "123", titulo: "Test", precio: 10, stock: 5 });
            libro.incStockN(3);
            assert.equal(libro.stock, 8);
        });

        it("decStockN() debe decrementar stock correctamente", function () {
            let libro = model.addLibro({ isbn: "123", titulo: "Test", precio: 10, stock: 10 });
            libro.decStockN(4);
            assert.equal(libro.stock, 6);
        });

        it("incPrecioP() debe incrementar precio por porcentaje", function () {
            let libro = model.addLibro({ isbn: "123", titulo: "Test", precio: 100, stock: 5 });
            libro.incPrecioP(10); // incrementar 10%
            assert.approximately(libro.precio, 110, 0.01);
        });

        it("dexPrecioP() debe calcular precio con porcentaje", function () {
            let libro = model.addLibro({ isbn: "123", titulo: "Test", precio: 100, stock: 5 });
            libro.dexPrecioP(50); // 50% del precio
            assert.equal(libro.precio, 50);
        });
    });

    describe("Cálculos de Item", function () {
        it("Item.calcular() debe calcular total correctamente", function () {
            let cliente = model.addCliente({ email: "test@test.com", password: "123", dni: "111" });
            let libro = model.addLibro({ isbn: "123", titulo: "Test", precio: 15.50, stock: 5 });
            cliente.addCarroItem({ libro: libro, cantidad: 3 });

            let item = cliente.carro.items[0];
            assert.equal(item.total, 46.50); // 15.50 * 3
        });

        it("Item.calcular() debe actualizarse al cambiar cantidad", function () {
            let cliente = model.addCliente({ email: "test@test.com", password: "123", dni: "111" });
            let libro = model.addLibro({ isbn: "123", titulo: "Test", precio: 20, stock: 5 });
            cliente.addCarroItem({ libro: libro, cantidad: 2 });

            let item = cliente.carro.items[0];
            item.cantidad = 5;
            item.calcular();

            assert.equal(item.total, 100); // 20 * 5
        });
    });

    describe("Cálculos del Carro", function () {
        it("Carro.calcular() debe calcular subtotal correctamente", function () {
            let cliente = model.addCliente({ email: "test@test.com", password: "123", dni: "111" });
            let libro1 = model.addLibro({ isbn: "123", titulo: "Test 1", precio: 10, stock: 5 });
            let libro2 = model.addLibro({ isbn: "456", titulo: "Test 2", precio: 20, stock: 3 });

            cliente.addCarroItem({ libro: libro1, cantidad: 2 }); // 20
            cliente.addCarroItem({ libro: libro2, cantidad: 3 }); // 60

            assert.equal(cliente.carro.subtotal, 80);
        });

        it("Carro.calcular() debe calcular IVA correctamente (21%)", function () {
            let cliente = model.addCliente({ email: "test@test.com", password: "123", dni: "111" });
            let libro = model.addLibro({ isbn: "123", titulo: "Test", precio: 100, stock: 5 });

            cliente.addCarroItem({ libro: libro, cantidad: 1 });

            assert.equal(cliente.carro.subtotal, 100);
            assert.equal(cliente.carro.iva, 21); // 21% de 100
        });

        it("Carro.calcular() debe calcular total correctamente", function () {
            let cliente = model.addCliente({ email: "test@test.com", password: "123", dni: "111" });
            let libro = model.addLibro({ isbn: "123", titulo: "Test", precio: 100, stock: 5 });

            cliente.addCarroItem({ libro: libro, cantidad: 1 });

            assert.equal(cliente.carro.total, 121); // 100 + 21
        });

        it("Carro.calcular() debe manejar múltiples items", function () {
            let cliente = model.addCliente({ email: "test@test.com", password: "123", dni: "111" });
            let libro1 = model.addLibro({ isbn: "123", titulo: "Test 1", precio: 50, stock: 5 });
            let libro2 = model.addLibro({ isbn: "456", titulo: "Test 2", precio: 30, stock: 3 });
            let libro3 = model.addLibro({ isbn: "789", titulo: "Test 3", precio: 20, stock: 2 });

            cliente.addCarroItem({ libro: libro1, cantidad: 2 }); // 100
            cliente.addCarroItem({ libro: libro2, cantidad: 1 }); // 30
            cliente.addCarroItem({ libro: libro3, cantidad: 3 }); // 60

            // Subtotal: 190
            // IVA: 39.9 (21% de 190)
            // Total: 229.9
            assert.equal(cliente.carro.subtotal, 190);
            assert.equal(cliente.carro.iva, 39.9);
            assert.equal(cliente.carro.total, 229.9);
        });

        it("Carro.calcular() debe recalcular al modificar cantidad", function () {
            let cliente = model.addCliente({ email: "test@test.com", password: "123", dni: "111" });
            let libro = model.addLibro({ isbn: "123", titulo: "Test", precio: 10, stock: 5 });

            cliente.addCarroItem({ libro: libro, cantidad: 2 }); // 20
            assert.equal(cliente.carro.total, 24.2); // 20 + 4.2

            cliente.setCarroItemCantidad(0, 5); // cambiar a 5 unidades
            assert.equal(cliente.carro.subtotal, 50);
            assert.equal(cliente.carro.iva, 10.5);
            assert.equal(cliente.carro.total, 60.5);
        });

        it("Carro.calcular() debe ser 0 cuando está vacío", function () {
            let cliente = model.addCliente({ email: "test@test.com", password: "123", dni: "111" });

            assert.equal(cliente.carro.subtotal, 0);
            assert.equal(cliente.carro.iva, 0);
            assert.equal(cliente.carro.total, 0);
        });

        it("Carro.calcular() debe recalcular al eliminar items", function () {
            let cliente = model.addCliente({ email: "test@test.com", password: "123", dni: "111" });
            let libro1 = model.addLibro({ isbn: "123", titulo: "Test 1", precio: 10, stock: 5 });
            let libro2 = model.addLibro({ isbn: "456", titulo: "Test 2", precio: 20, stock: 3 });

            cliente.addCarroItem({ libro: libro1, cantidad: 2 });
            cliente.addCarroItem({ libro: libro2, cantidad: 1 });

            assert.equal(cliente.carro.subtotal, 40); // 20 + 20

            cliente.borrarCarroItem(0);

            assert.equal(cliente.carro.subtotal, 20);
            assert.equal(cliente.carro.iva, 4.2);
            assert.equal(cliente.carro.total, 24.2);
        });
    });

    describe("Cálculos de Factura", function () {
        it("Factura debe tener los cálculos del carro", function () {
            let cliente = model.addCliente({
                email: "test@test.com",
                password: "123",
                dni: "111",
                nombre: "Test"
            });
            let libro = model.addLibro({ isbn: "123", titulo: "Test", precio: 100, stock: 5 });

            cliente.addCarroItem({ libro: libro, cantidad: 2 });
            model.facturarCompraCliente({ cliente: cliente._id });

            let factura = model.getFacturas()[0];
            assert.equal(factura.items.length, 1);
            assert.equal(factura.items[0].cantidad, 2);
        });
        it("Factura.calcular() debe recalcular totales correctamente al añadir un item", function () {

            let cliente = model.addCliente({ email: "test@test.com", password: "123", dni: "111" });
            let libro1 = model.addLibro({ isbn: "123", titulo: "Test 1", precio: 100, stock: 5 });
            cliente.addCarroItem({ libro: libro1, cantidad: 1 }); // Carro: total 121
            model.facturarCompraCliente({ cliente: cliente._id });

            let factura = model.getFacturaPorNumero(1);
            assert.equal(factura.total, 121, "El total inicial copiado del carro es 121");

            // 2. Acción (Añadimos un item nuevo a la factura YA CREADA)
            let libro2 = model.addLibro({ isbn: "456", titulo: "Test 2", precio: 50, stock: 10 });

            let itemObj = {
                libro: libro2,
                cantidad: 2,
                total: 100 // 50 (precio) * 2 (cantidad)
            };
            factura.addItem(itemObj);

            assert.equal(factura.subtotal, 200, "El subtotal debe ser 200");
            assert.equal(factura.iva, 42, "El IVA debe ser 42");
            assert.equal(factura.total, 242, "El total debe ser 242");
        });

    });

    describe("Casos de cálculo complejos", function () {
        it("Debe calcular correctamente con decimales", function () {
            let cliente = model.addCliente({ email: "test@test.com", password: "123", dni: "111" });
            let libro = model.addLibro({ isbn: "123", titulo: "Test", precio: 19.99, stock: 5 });

            cliente.addCarroItem({ libro: libro, cantidad: 3 });

            // 19.99 * 3 = 59.97
            // IVA: 59.97 * 0.21 = 12.5937
            // Total: 59.97 + 12.5937 = 72.5637
            assert.approximately(cliente.carro.subtotal, 59.97, 0.01);
            assert.approximately(cliente.carro.iva, 12.59, 0.01);
            assert.approximately(cliente.carro.total, 72.56, 0.01);
        });

        it("Debe recalcular correctamente después de vaciar carro", function () {
            let cliente = model.addCliente({ email: "test@test.com", password: "123", dni: "111" });
            let libro = model.addLibro({ isbn: "123", titulo: "Test", precio: 50, stock: 5 });

            cliente.addCarroItem({ libro: libro, cantidad: 2 });
            assert.equal(cliente.carro.total, 121); // 100 + 21

            cliente.removeItems();
            assert.equal(cliente.carro.subtotal, 0);
            assert.equal(cliente.carro.iva, 0);
            assert.equal(cliente.carro.total, 0);
        });
    });
});