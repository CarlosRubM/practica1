import * as chai from 'https://cdnjs.cloudflare.com/ajax/libs/chai/5.1.1/chai.js';
import { ROL } from '../js/model/proxy.mjs';
let assert = chai.assert;

// proxy es global y viene del test.html
// Ya no usamos model.libros = [] porque el proxy no tiene acceso directo

describe("GETTERS Y SETTERS", function () {

    beforeEach(async function () {
        // Limpiar usando las APIs del proxy
        await proxy.setLibros([]);
        await proxy.setClientes([]);
        await proxy.setAdmins([]);
        await proxy.setFacturas([]);
    });

    describe("Getters de Libros", function () {
        it("getLibros() debe retornar array de libros", async function () {
            let libros = await proxy.getLibros();
            assert.isArray(libros);
        });

        it("getLibroPorId() debe retornar libro correcto", async function () {
            let libro = await proxy.addLibro({ isbn: "123", titulo: "Test", precio: 10, stock: 5 });
            let encontrado = await proxy.getLibroPorId(libro._id);
            assert.equal(encontrado._id, libro._id);
        });

        it("getLibroPorIsbn() debe retornar libro correcto", async function () {
            await proxy.addLibro({ isbn: "ABC123", titulo: "Test", precio: 10, stock: 5 });
            let encontrado = await proxy.getLibroPorIsbn("ABC123");
            assert.equal(encontrado.isbn, "ABC123");
        });

        it("getLibroPorTitulo() debe retornar libro correcto", async function () {
            await proxy.addLibro({ isbn: "XYZ", titulo: "JavaScript Avanzado", precio: 20, stock: 3 });
            let encontrado = await proxy.getLibroPorTitulo("JavaScript");
            assert.equal(encontrado.titulo, "JavaScript Avanzado");
        });
    });

    describe("Getters de Usuarios", function () {
        it("getClientes() debe retornar solo clientes", async function () {
            await proxy.addCliente({ email: "cliente@test.com", password: "123", dni: "111" });
            await proxy.addAdmin({ email: "admin@test.com", password: "123", dni: "222" });
            let clientes = await proxy.getClientes();
            assert.equal(clientes.length, 1);
            assert.equal(clientes[0].rol, ROL.CLIENTE);
        });

        it("getAdmins() debe retornar solo administradores", async function () {
            await proxy.addCliente({ email: "cliente@test.com", password: "123", dni: "111" });
            await proxy.addAdmin({ email: "admin@test.com", password: "123", dni: "222" });
            let admins = await proxy.getAdmins();
            assert.equal(admins.length, 1);
            assert.equal(admins[0].rol, ROL.ADMIN);
        });

        it("getClientePorId() debe retornar cliente correcto", async function () {
            let cliente = await proxy.addCliente({ email: "test@test.com", password: "123", dni: "111" });
            let encontrado = await proxy.getClientePorId(cliente._id);
            assert.equal(encontrado._id, cliente._id);
            assert.equal(encontrado.rol, ROL.CLIENTE);
        });

        it("getClientePorEmail() debe retornar solo cliente", async function () {
            await proxy.addCliente({ email: "cliente@test.com", password: "123", dni: "111" });
            let cliente = await proxy.getClientePorEmail("cliente@test.com");
            assert.equal(cliente.rol, ROL.CLIENTE);
        });

        it("getAdminPorEmail() debe retornar solo admin", async function () {
            await proxy.addAdmin({ email: "admin@test.com", password: "123", dni: "222" });
            let admin = await proxy.getAdminPorEmail("admin@test.com");
            assert.equal(admin.rol, ROL.ADMIN);
        });
    });

    describe("Getters de Facturas", function () {
        it("getFacturas() debe retornar array de facturas", async function () {
            let facturas = await proxy.getFacturas();
            assert.isArray(facturas);
        });

        it("getFacturaPorId() debe retornar factura correcta", async function () {
            let cliente = await proxy.addCliente({ email: "test@test.com", password: "123", dni: "111" });
            let libro = await proxy.addLibro({ isbn: "123", titulo: "Test", precio: 10, stock: 5 });
            await proxy.addClienteCarroItem(cliente._id, { libro: libro._id, cantidad: 1 });
            await proxy.facturarCompraCliente({ cliente: cliente._id });
            
            let facturas = await proxy.getFacturas();
            let facturaCreada = facturas[0];
            let facturaEncontrada = await proxy.getFacturaPorId(facturaCreada._id);
            
            assert.isObject(facturaEncontrada);
            assert.equal(facturaEncontrada._id, facturaCreada._id);
        });

        it("getFacturaPorNumero() debe retornar factura correcta", async function () {
            let cliente = await proxy.addCliente({ email: "test@test.com", password: "123", dni: "111" });
            let libro = await proxy.addLibro({ isbn: "123", titulo: "Test", precio: 10, stock: 5 });
            await proxy.addClienteCarroItem(cliente._id, { libro: libro._id, cantidad: 1 });
            await proxy.facturarCompraCliente({ cliente: cliente._id });
            
            let factura = await proxy.getFacturaPorNumero(1);
            assert.isObject(factura);
            assert.equal(factura.numero, 1);
        });
    });

    describe("Getter de Carro", function () {
        it("getCarroCliente() debe retornar carro del cliente", async function () {
            let cliente = await proxy.addCliente({ email: "test@test.com", password: "123", dni: "111" });
            let carro = await proxy.getCarroCliente(cliente._id);
            assert.isObject(carro);
            assert.isArray(carro.items);
        });
    });
});

describe("EXCEPCIONES", function () {

    beforeEach(async function () {
        await proxy.setLibros([]);
        await proxy.setClientes([]);
        await proxy.setAdmins([]);
        await proxy.setFacturas([]);
    });

    describe("Excepciones en Libros", function () {
        it("addLibro() debe lanzar error si no tiene ISBN", async function () {
            try {
                await proxy.addLibro({ titulo: "Sin ISBN", precio: 10, stock: 5 });
                assert.fail("Debería haber lanzado un error");
            } catch (err) {
                assert.include(err.message, 'ISBN');
            }
        });

        it("addLibro() debe lanzar error si ISBN ya existe", async function () {
            await proxy.addLibro({ isbn: "123", titulo: "Libro 1", precio: 10, stock: 5 });
            try {
                await proxy.addLibro({ isbn: "123", titulo: "Libro 2", precio: 15, stock: 3 });
                assert.fail("Debería haber lanzado un error");
            } catch (err) {
                assert.include(err.message, '123');
            }
        });

        it("removeLibro() debe lanzar error si libro no existe", async function () {
            try {
                await proxy.removeLibro(999);
                assert.fail("Debería haber lanzado un error");
            } catch (err) {
                assert.isTrue(err.message.includes('404') || err.message.includes('no encontrado'));
            }
        });
    });

    describe("Excepciones en Usuarios", function () {
        it("addCliente() debe lanzar error si email ya existe", async function () {
            await proxy.addCliente({ email: "cliente@test.com", password: "123", dni: "111" });
            try {
                await proxy.addCliente({ email: "cliente@test.com", password: "456", dni: "222" });
                assert.fail("Debería haber lanzado un error");
            } catch (err) {
                assert.include(err.message.toLowerCase(), 'email');
            }
        });

        it("autenticarCliente() debe lanzar error si usuario no existe", async function () {
            try {
                await proxy.autenticarCliente({ email: "noexiste@test.com", password: "123" });
                assert.fail("Debería haber lanzado un error");
            } catch (err) {
                assert.isTrue(err.message.includes('404') || err.message.includes('no encontrado'));
            }
        });

        it("autenticarCliente() debe lanzar error si contraseña es incorrecta", async function () {
            await proxy.addCliente({ email: "cliente@test.com", password: "correcta", dni: "111" });
            try {
                await proxy.autenticarCliente({ email: "cliente@test.com", password: "incorrecta" });
                assert.fail("Debería haber lanzado un error");
            } catch (err) {
                assert.isTrue(err.message.includes('contraseña') || err.message.includes('password'));
            }
        });
    });

    describe("Excepciones en Carro", function () {
        it("setClienteCarroItemCantidad() debe lanzar error si cantidad es negativa", async function () {
            let cliente = await proxy.addCliente({ email: "test@test.com", password: "123", dni: "111" });
            let libro = await proxy.addLibro({ isbn: "123", titulo: "Test", precio: 10, stock: 5 });
            await proxy.addClienteCarroItem(cliente._id, { libro: libro._id, cantidad: 1 });
            
            try {
                await proxy.setClienteCarroItemCantidad(cliente._id, 0, -5);
                assert.fail("Debería haber lanzado un error");
            } catch (err) {
                assert.include(err.message.toLowerCase(), 'cantidad');
            }
        });
    });

    describe("Excepciones en Facturas", function () {
        it("facturarCompraCliente() debe lanzar error si carro está vacío", async function () {
            let cliente = await proxy.addCliente({ email: "test@test.com", password: "123", dni: "111" });
            try {
                await proxy.facturarCompraCliente({ cliente: cliente._id });
                assert.fail("Debería haber lanzado un error");
            } catch (err) {
                assert.include(err.message.toLowerCase(), 'comprar');
            }
        });

        it("removeFactura() debe lanzar error si factura no existe", async function () {
            try {
                await proxy.removeFactura(999);
                assert.fail("Debería haber lanzado un error");
            } catch (err) {
                assert.isTrue(err.message.includes('404') || err.message.includes('no encontrada'));
            }
        });
    });
});

describe("AGREGAR, MODIFICAR Y ELIMINAR", function () {

    beforeEach(async function () {
        await proxy.setLibros([]);
        await proxy.setClientes([]);
        await proxy.setAdmins([]);
        await proxy.setFacturas([]);
    });

    describe("CRUD de Libros", function () {
        it("addLibro() debe agregar libro correctamente", async function () {
            let libro = await proxy.addLibro({
                isbn: "978-3-16-148410-0",
                titulo: "JavaScript: The Good Parts",
                autores: "Douglas Crockford",
                precio: 29.99,
                stock: 10
            });
            assert.equal(libro.isbn, "978-3-16-148410-0");
            assert.equal(libro.titulo, "JavaScript: The Good Parts");
            assert.isNumber(libro._id);
            
            let libros = await proxy.getLibros();
            assert.equal(libros.length, 1);
        });

        it("updateLibro() debe modificar libro correctamente", async function () {
            let libro = await proxy.addLibro({ isbn: "123", titulo: "Original", precio: 10, stock: 5 });
            let actualizado = await proxy.updateLibro({
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

        it("removeLibro() debe eliminar libro correctamente", async function () {
            let libro = await proxy.addLibro({ isbn: "123", titulo: "Test", precio: 10, stock: 5 });
            await proxy.removeLibro(libro._id);
            
            let libros = await proxy.getLibros();
            assert.equal(libros.length, 0);
        });
    });

    describe("CRUD de Usuarios", function () {
        it("addCliente() debe agregar cliente correctamente", async function () {
            let cliente = await proxy.addCliente({
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

        it("addAdmin() debe agregar administrador correctamente", async function () {
            let admin = await proxy.addAdmin({
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

        it("updateCliente() debe modificar cliente correctamente", async function () {
            let cliente = await proxy.addCliente({ email: "test@test.com", password: "123", dni: "111" });
            let actualizado = await proxy.updateCliente({
                _id: cliente._id,
                email: "nuevo@test.com",
                nombre: "Nombre Nuevo"
            });
            assert.equal(actualizado.email, "nuevo@test.com");
            assert.equal(actualizado.nombre, "Nombre Nuevo");
        });

        it("autenticarCliente() debe retornar usuario si credenciales correctas", async function () {
            await proxy.addCliente({ email: "cliente@test.com", password: "pass123", dni: "111" });
            let usuario = await proxy.autenticarCliente({
                email: "cliente@test.com",
                password: "pass123"
            });
            assert.equal(usuario.email, "cliente@test.com");
        });
    });

    describe("CRUD de Items del Carro", function () {
        it("addClienteCarroItem() debe agregar item al carro", async function () {
            let cliente = await proxy.addCliente({ email: "test@test.com", password: "123", dni: "111" });
            let libro = await proxy.addLibro({ isbn: "123", titulo: "Test", precio: 10, stock: 5 });
            await proxy.addClienteCarroItem(cliente._id, { libro: libro._id, cantidad: 2 });
            
            let carro = await proxy.getCarroCliente(cliente._id);
            assert.equal(carro.items.length, 1);
            assert.equal(carro.items[0].cantidad, 2);
        });

        it("addClienteCarroItem() debe incrementar cantidad si libro ya existe", async function () {
            let cliente = await proxy.addCliente({ email: "test@test.com", password: "123", dni: "111" });
            let libro = await proxy.addLibro({ isbn: "123", titulo: "Test", precio: 10, stock: 5 });
            await proxy.addClienteCarroItem(cliente._id, { libro: libro._id, cantidad: 2 });
            await proxy.addClienteCarroItem(cliente._id, { libro: libro._id, cantidad: 3 });
            
            let carro = await proxy.getCarroCliente(cliente._id);
            assert.equal(carro.items.length, 1);
            assert.equal(carro.items[0].cantidad, 5);
        });

        it("setClienteCarroItemCantidad() debe modificar cantidad de item", async function () {
            let cliente = await proxy.addCliente({ email: "test@test.com", password: "123", dni: "111" });
            let libro = await proxy.addLibro({ isbn: "123", titulo: "Test", precio: 10, stock: 5 });
            await proxy.addClienteCarroItem(cliente._id, { libro: libro._id, cantidad: 2 });
            await proxy.setClienteCarroItemCantidad(cliente._id, 0, 5);
            
            let carro = await proxy.getCarroCliente(cliente._id);
            assert.equal(carro.items[0].cantidad, 5);
        });

        it("setClienteCarroItemCantidad() con 0 debe eliminar item", async function () {
            let cliente = await proxy.addCliente({ email: "test@test.com", password: "123", dni: "111" });
            let libro = await proxy.addLibro({ isbn: "123", titulo: "Test", precio: 10, stock: 5 });
            await proxy.addClienteCarroItem(cliente._id, { libro: libro._id, cantidad: 2 });
            await proxy.setClienteCarroItemCantidad(cliente._id, 0, 0);
            
            let carro = await proxy.getCarroCliente(cliente._id);
            assert.equal(carro.items.length, 0);
        });
    });

    describe("CRUD de Facturas", function () {
        it("facturarCompraCliente() debe crear factura correctamente", async function () {
            let cliente = await proxy.addCliente({
                email: "test@test.com",
                password: "123",
                dni: "111",
                nombre: "Test",
                apellidos: "Usuario"
            });
            let libro = await proxy.addLibro({ isbn: "123", titulo: "Test", precio: 10, stock: 5 });
            await proxy.addClienteCarroItem(cliente._id, { libro: libro._id, cantidad: 2 });
            await proxy.facturarCompraCliente({ cliente: cliente._id });

            let facturas = await proxy.getFacturas();
            assert.equal(facturas.length, 1);
            
            let carro = await proxy.getCarroCliente(cliente._id);
            assert.equal(carro.items.length, 0);
        });

        it("facturarCompraCliente() debe generar número de factura", async function () {
            let cliente = await proxy.addCliente({ email: "test@test.com", password: "123", dni: "111" });
            let libro = await proxy.addLibro({ isbn: "123", titulo: "Test", precio: 10, stock: 5 });
            await proxy.addClienteCarroItem(cliente._id, { libro: libro._id, cantidad: 1 });
            await proxy.facturarCompraCliente({ cliente: cliente._id });

            let facturas = await proxy.getFacturas();
            let factura = facturas[0];
            assert.isNumber(factura.numero);
            assert.equal(factura.numero, 1);
        });

        it("removeFactura() debe eliminar factura correctamente", async function () {
            let cliente = await proxy.addCliente({ email: "test@test.com", password: "123", dni: "111" });
            let libro = await proxy.addLibro({ isbn: "123", titulo: "Test", precio: 10, stock: 5 });
            await proxy.addClienteCarroItem(cliente._id, { libro: libro._id, cantidad: 1 });
            await proxy.facturarCompraCliente({ cliente: cliente._id });

            let facturas = await proxy.getFacturas();
            let factura = facturas[0];
            await proxy.removeFactura(factura._id);

            facturas = await proxy.getFacturas();
            assert.equal(facturas.length, 0);
        });
    });
});

describe("CÁLCULOS", function () {

    beforeEach(async function () {
        await proxy.setLibros([]);
        await proxy.setClientes([]);
        await proxy.setAdmins([]);
        await proxy.setFacturas([]);
    });

    describe("Cálculos de Item", function () {
        it("Item.calcular() debe calcular total correctamente", async function () {
            let cliente = await proxy.addCliente({ email: "test@test.com", password: "123", dni: "111" });
            let libro = await proxy.addLibro({ isbn: "123", titulo: "Test", precio: 15.50, stock: 5 });
            await proxy.addClienteCarroItem(cliente._id, { libro: libro._id, cantidad: 3 });

            let carro = await proxy.getCarroCliente(cliente._id);
            let item = carro.items[0];
            assert.equal(item.total, 46.50); // 15.50 * 3
        });
    });

    describe("Cálculos del Carro", function () {
        it("Carro.calcular() debe calcular subtotal correctamente", async function () {
            let cliente = await proxy.addCliente({ email: "test@test.com", password: "123", dni: "111" });
            let libro1 = await proxy.addLibro({ isbn: "123", titulo: "Test 1", precio: 10, stock: 5 });
            let libro2 = await proxy.addLibro({ isbn: "456", titulo: "Test 2", precio: 20, stock: 3 });

            await proxy.addClienteCarroItem(cliente._id, { libro: libro1._id, cantidad: 2 });
            await proxy.addClienteCarroItem(cliente._id, { libro: libro2._id, cantidad: 3 });

            let carro = await proxy.getCarroCliente(cliente._id);
            assert.equal(carro.subtotal, 80);
        });

        it("Carro.calcular() debe calcular IVA correctamente (21%)", async function () {
            let cliente = await proxy.addCliente({ email: "test@test.com", password: "123", dni: "111" });
            let libro = await proxy.addLibro({ isbn: "123", titulo: "Test", precio: 100, stock: 5 });
            await proxy.addClienteCarroItem(cliente._id, { libro: libro._id, cantidad: 1 });

            let carro = await proxy.getCarroCliente(cliente._id);
            assert.equal(carro.subtotal, 100);
            assert.equal(carro.iva, 21);
        });

        it("Carro.calcular() debe calcular total correctamente", async function () {
            let cliente = await proxy.addCliente({ email: "test@test.com", password: "123", dni: "111" });
            let libro = await proxy.addLibro({ isbn: "123", titulo: "Test", precio: 100, stock: 5 });
            await proxy.addClienteCarroItem(cliente._id, { libro: libro._id, cantidad: 1 });

            let carro = await proxy.getCarroCliente(cliente._id);
            assert.equal(carro.total, 121);
        });

        it("Carro.calcular() debe recalcular al modificar cantidad", async function () {
            let cliente = await proxy.addCliente({ email: "test@test.com", password: "123", dni: "111" });
            let libro = await proxy.addLibro({ isbn: "123", titulo: "Test", precio: 10, stock: 5 });

            await proxy.addClienteCarroItem(cliente._id, { libro: libro._id, cantidad: 2 });
            let carro = await proxy.getCarroCliente(cliente._id);
            assert.equal(carro.total, 24.2);

            await proxy.setClienteCarroItemCantidad(cliente._id, 0, 5);
            carro = await proxy.getCarroCliente(cliente._id);
            assert.equal(carro.subtotal, 50);
            assert.equal(carro.iva, 10.5);
            assert.equal(carro.total, 60.5);
        });

        it("Carro.calcular() debe ser 0 cuando está vacío", async function () {
            let cliente = await proxy.addCliente({ email: "test@test.com", password: "123", dni: "111" });
            let carro = await proxy.getCarroCliente(cliente._id);
            
            assert.equal(carro.subtotal, 0);
            assert.equal(carro.iva, 0);
            assert.equal(carro.total, 0);
        });
    });

    describe("Cálculos de Factura", function () {
        it("Factura debe tener los cálculos del carro", async function () {
            let cliente = await proxy.addCliente({
                email: "test@test.com",
                password: "123",
                dni: "111",
                nombre: "Test"
            });
            let libro = await proxy.addLibro({ isbn: "123", titulo: "Test", precio: 100, stock: 5 });
            await proxy.addClienteCarroItem(cliente._id, { libro: libro._id, cantidad: 2 });
            await proxy.facturarCompraCliente({ cliente: cliente._id });

            let facturas = await proxy.getFacturas();
            let factura = facturas[0];
            assert.equal(factura.items.length, 1);
            assert.equal(factura.items[0].cantidad, 2);
        });
    });

    describe("Casos de cálculo complejos", function () {
        it("Debe calcular correctamente con decimales", async function () {
            let cliente = await proxy.addCliente({ email: "test@test.com", password: "123", dni: "111" });
            let libro = await proxy.addLibro({ isbn: "123", titulo: "Test", precio: 19.99, stock: 5 });
            await proxy.addClienteCarroItem(cliente._id, { libro: libro._id, cantidad: 3 });

            let carro = await proxy.getCarroCliente(cliente._id);
            assert.approximately(carro.subtotal, 59.97, 0.01);
            assert.approximately(carro.iva, 12.59, 0.01);
            assert.approximately(carro.total, 72.56, 0.01);
        });
    });
});