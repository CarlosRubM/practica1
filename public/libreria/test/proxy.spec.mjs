import * as chai from 'https://cdnjs.cloudflare.com/ajax/libs/chai/5.1.1/chai.js';
import { ROL } from '../js/model/proxy.mjs';
let assert = chai.assert;



describe("Pruebas del Proxy", function () {


    beforeEach(async function () {
        await proxy.setFacturas([]);
        await proxy.setClientes([]); // Al borrar clientes se borran sus carros
        await proxy.setAdmins([]);
        await proxy.setLibros([]);
        
    });

    describe("GETTERS Y SETTERS", function () {

        describe("Getters de Libros", function () {
            it("getLibros() debe retornar array de libros", async function () {
                let libros = await proxy.getLibros();
                assert.isArray(libros);

            });

            it("getLibroPorId() debe retornar libro correcto", async function () {
                let libro = await proxy.addLibro({ isbn: "123", titulo: "Test", precio: 10, stock: 5, autores: "A", resumen: "R" });
                let encontrado = await proxy.getLibroPorId(libro._id);
                assert.equal(encontrado._id, libro._id);

            });

            it("getLibroPorIsbn() debe retornar libro correcto", async function () {
                await proxy.addLibro({ isbn: "ABC123", titulo: "Test", precio: 10, stock: 5, autores: "A", resumen: "R" });
                let encontrado = await proxy.getLibroPorIsbn("ABC123");
                assert.equal(encontrado.isbn, "ABC123");
            });

            it("getLibroPorTitulo() debe retornar libro correcto", async function () {
                await proxy.addLibro({ isbn: "XYZ", titulo: "JavaScript Avanzado", precio: 20, stock: 3, autores: "A", resumen: "R" });
                let encontrado = await proxy.getLibroPorTitulo("JavaScript");
                assert.equal(encontrado.titulo, "JavaScript Avanzado");
            });
        });

        describe("Getters de Usuarios", function () {
            it("getClientes() debe retornar solo clientes", async function () {
                await proxy.addCliente({ email: "c@test.com", password: "123", dni: "111", nombre: "C", apellidos: "A", direccion: "D" });
                await proxy.addAdmin({ email: "a@test.com", password: "123", dni: "222", nombre: "A", apellidos: "A", direccion: "D" });
                
                let clientes = await proxy.getClientes();
                assert.equal(clientes.length, 1);
                assert.equal(clientes[0].rol, ROL.CLIENTE);
            });

            it("getAdmins() debe retornar solo administradores", async function () {
                await proxy.addCliente({ email: "c@test.com", password: "123", dni: "111", nombre: "C", apellidos: "A", direccion: "D" });
                await proxy.addAdmin({ email: "a@test.com", password: "123", dni: "222", nombre: "A", apellidos: "A", direccion: "D" });
                
                let admins = await proxy.getAdmins();
                assert.equal(admins.length, 1);
                assert.equal(admins[0].rol, ROL.ADMIN);
            });

            it("getClientePorId() debe retornar cliente correcto", async function () {
                let cliente = await proxy.addCliente({ email: "test@test.com", password: "123", dni: "111", nombre: "C", apellidos: "A", direccion: "D" });
                let encontrado = await proxy.getClientePorId(cliente._id);
                assert.equal(encontrado._id, cliente._id);
            });

            it("getClientePorEmail() debe retornar solo cliente", async function () {
                await proxy.addCliente({ email: "cliente@test.com", password: "123", dni: "111", nombre: "C", apellidos: "A", direccion: "D" });
                let cliente = await proxy.getClientePorEmail("cliente@test.com");
                assert.equal(cliente.rol, ROL.CLIENTE);
            });

            it("getAdminPorEmail() debe retornar solo admin", async function () {
                await proxy.addAdmin({ email: "admin@test.com", password: "123", dni: "222", nombre: "A", apellidos: "A", direccion: "D" });
                let admin = await proxy.getAdminPorEmail("admin@test.com");
                assert.equal(admin.rol, ROL.ADMIN);
            });
        });

        describe("Getter de Carro", function () {
            it("getCarroCliente() debe retornar carro del cliente", async function () {
                let cliente = await proxy.addCliente({ email: "test@test.com", password: "123", dni: "111", nombre: "C", apellidos: "A", direccion: "D" });
                let carro = await proxy.getCarroCliente(cliente._id);
                assert.isObject(carro);
                assert.isArray(carro.items);
            });
        });

        describe("Getters de Facturas", function () {
            it("getFacturaPorId() debe retornar factura correcta", async function () {
                let cliente = await proxy.addCliente({ email: "f@test.com", password: "123", dni: "111", nombre: "C", apellidos: "A", direccion: "D" });
                let libro = await proxy.addLibro({ isbn: "123", titulo: "T", precio: 10, stock: 5, autores: "A", resumen: "R" });
                
                await proxy.addClienteCarroItem(cliente._id, { libro: libro._id, cantidad: 1 });
                let facturaCreada = await proxy.facturarCompraCliente({ cliente: cliente._id });
                
                let facturaEncontrada = await proxy.getFacturaPorId(facturaCreada._id);
                assert.equal(facturaEncontrada._id, facturaCreada._id);
                assert.equal(facturaEncontrada.numero, facturaCreada.numero);
            });

            it("getFacturaPorNumero() debe retornar factura correcta", async function () {
                let cliente = await proxy.addCliente({ email: "f2@test.com", password: "123", dni: "222", nombre: "C", apellidos: "A", direccion: "D" });
                let libro = await proxy.addLibro({ isbn: "456", titulo: "T", precio: 10, stock: 5, autores: "A", resumen: "R" });
                
                await proxy.addClienteCarroItem(cliente._id, { libro: libro._id, cantidad: 1 });
                let facturaCreada = await proxy.facturarCompraCliente({ cliente: cliente._id });
                
                let facturaEncontrada = await proxy.getFacturaPorNumero(facturaCreada.numero);
                assert.equal(facturaEncontrada.numero, facturaCreada.numero);
            });
        });
    });

    describe("EXCEPCIONES", function () {

        describe("Excepciones en Libros", function () {
            it("addLibro() debe lanzar error si no tiene ISBN", async function () {
                try {
                    await proxy.addLibro({ titulo: "Sin ISBN", precio: 10, stock: 5 });
                    assert.fail("Debería haber lanzado un error");
                } catch (err) {
                    assert.include(err.message, 'El libro no tiene ISBN');
                }
            });

            it("addLibro() debe lanzar error si ISBN ya existe", async function () {
                await proxy.addLibro({ isbn: "123", titulo: "L1", precio: 10, stock: 5, autores: "A", resumen: "R" });
                try {
                    await proxy.addLibro({ isbn: "123", titulo: "L2", precio: 15, stock: 3, autores: "A", resumen: "R" });
                    assert.fail("Debería haber lanzado un error");
                } catch (err) {
                    assert.include(err.message, 'ya existe');
                }
            });

            it("removeLibro() debe lanzar error si libro no existe", async function () {
                try {
                    // ID válido de Mongo
                    await proxy.removeLibro("507f1f77bcf86cd799439011");
                    assert.fail("Debería haber lanzado un error");
                } catch (err) {
                    assert.include(err.message, 'no encontrado');
                }
            });
        });

        describe("Excepciones en Usuarios", function () {
            it("addCliente() debe lanzar error si email ya existe", async function () {
                await proxy.addCliente({ email: "dup@test.com", password: "123", dni: "111", nombre: "C", apellidos: "A", direccion: "D" });
                try {
                    await proxy.addCliente({ email: "dup@test.com", password: "456", dni: "222", nombre: "C", apellidos: "A", direccion: "D" });
                    assert.fail("Debería haber lanzado un error");
                } catch (err) {
                    assert.include(err.message, 'registrado'); // "Correo electrónico registrado"
                }
            });

            it("autenticar() debe lanzar error si usuario no existe", async function () {
                try {
                    await proxy.autenticar({ email: "noexiste@test.com", password: "123", rol: ROL.CLIENTE });
                    assert.fail("Debería haber lanzado un error");
                } catch (err) {
                    assert.include(err.message, 'no encontrado'); // "Usuario no encontrado"
                }
            });

            it("autenticar() debe lanzar error si contraseña incorrecta", async function () {
                await proxy.addCliente({ email: "login@test.com", password: "ok", dni: "111", nombre: "C", apellidos: "A", direccion: "D" });
                try {
                    await proxy.autenticar({ email: "login@test.com", password: "bad", rol: ROL.CLIENTE });
                    assert.fail("Debería haber lanzado un error");
                } catch (err) {
                    assert.include(err.message, 'contraseña'); // "Error en la contraseña"
                }
            });
        });

        describe("Excepciones en Carro", function () {
            it("setClienteCarroItemCantidad() debe lanzar error si cantidad negativa", async function () {
                let cliente = await proxy.addCliente({ email: "carro@test.com", password: "123", dni: "111", nombre: "C", apellidos: "A", direccion: "D" });
                let libro = await proxy.addLibro({ isbn: "123", titulo: "T", precio: 10, stock: 5, autores: "A", resumen: "R" });
                await proxy.addClienteCarroItem(cliente._id, { libro: libro._id, cantidad: 1 });

                try {
                    await proxy.setClienteCarroItemCantidad(cliente._id, 0, -5);
                    assert.fail("Debería haber lanzado un error");
                } catch (err) {
                    assert.include(err.message, 'inferior a 0');
                }
            });
        });

        describe("Excepciones en Facturas", function () {
            it("facturarCompraCliente() debe lanzar error si carro vacío", async function () {
                let cliente = await proxy.addCliente({ email: "vacio@test.com", password: "123", dni: "111", nombre: "C", apellidos: "A", direccion: "D" });
                try {
                    await proxy.facturarCompraCliente({ cliente: cliente._id });
                    assert.fail("Debería haber lanzado un error");
                } catch (err) {
                    assert.include(err.message, 'No hay que comprar');
                }
            });
        });
    });

    describe("AGREGAR, MODIFICAR Y ELIMINAR", function () {

        describe("CRUD de Libros", function () {
            it("addLibro() debe agregar libro correctamente", async function () {
                let libroData = {
                    isbn: "978-JS",
                    titulo: "JavaScript Good Parts",
                    autores: "Douglas Crockford",
                    resumen: "JS Book",
                    portada: "img.jpg",
                    precio: 29.99,
                    stock: 10
                };
                let libro = await proxy.addLibro(libroData);
                
                // Verificamos TODOS los campos
                assert.equal(libro.isbn, libroData.isbn);
                assert.equal(libro.titulo, libroData.titulo);
                assert.equal(libro.autores, libroData.autores);
                assert.equal(libro.resumen, libroData.resumen);
                assert.equal(libro.precio, libroData.precio);
                assert.equal(libro.stock, libroData.stock);
                assert.ok(libro._id);

                let libros = await proxy.getLibros();
                assert.equal(libros.length, 1);
            });

            it("updateLibro() debe modificar libro correctamente", async function () {
                let libro = await proxy.addLibro({ isbn: "111", titulo: "Orig", precio: 10, stock: 5, autores: "A", resumen: "R" });
                
                let actualizado = await proxy.updateLibro({
                    _id: libro._id,
                    isbn: "111",
                    titulo: "Modificado",
                    precio: 20,
                    stock: 8,
                    autores: "A Mod",
                    resumen: "R Mod",
                    portada: "P Mod"
                });

                assert.equal(actualizado.titulo, "Modificado");
                assert.equal(actualizado.precio, 20);
                assert.equal(actualizado.stock, 8);
                assert.equal(actualizado.autores, "A Mod");
                assert.equal(actualizado.resumen, "R Mod");
                assert.equal(actualizado.portada, "P Mod");
            });

            it("removeLibro() debe eliminar libro correctamente", async function () {
                let libro = await proxy.addLibro({ isbn: "222", titulo: "Del", precio: 10, stock: 5, autores: "A", resumen: "R" });
                await proxy.removeLibro(libro._id);
                
                let libros = await proxy.getLibros();
                assert.equal(libros.length, 0);
            });
        });

        describe("CRUD de Usuarios", function () {
            it("addCliente() debe agregar cliente correctamente", async function () {
                let clienteData = {
                    email: "juan@test.com",
                    password: "pass",
                    dni: "123A",
                    nombre: "Juan",
                    apellidos: "Perez",
                    direccion: "Calle 1"
                };
                let cliente = await proxy.addCliente(clienteData);

                // Verificamos TODOS los campos
                assert.equal(cliente.email, clienteData.email);
                assert.equal(cliente.dni, clienteData.dni);
                assert.equal(cliente.nombre, clienteData.nombre);
                assert.equal(cliente.apellidos, clienteData.apellidos);
                assert.equal(cliente.direccion, clienteData.direccion);
                assert.equal(cliente.password, clienteData.password);
                assert.equal(cliente.rol, ROL.CLIENTE);
                assert.ok(cliente._id);
                assert.ok(cliente.carro); 
            });

            it("addAdmin() debe agregar administrador correctamente", async function () {
                let adminData = {
                    email: "admin@test.com",
                    password: "pass",
                    dni: "456B",
                    nombre: "Ana",
                    apellidos: "Garcia",
                    direccion: "Av 2"
                };
                let admin = await proxy.addAdmin(adminData);

                // Verificamos TODOS los campos
                assert.equal(admin.email, adminData.email);
                assert.equal(admin.dni, adminData.dni);
                assert.equal(admin.nombre, adminData.nombre);
                assert.equal(admin.apellidos, adminData.apellidos);
                assert.equal(admin.direccion, adminData.direccion);
                assert.equal(admin.password, adminData.password);
                assert.equal(admin.rol, ROL.ADMIN);
                assert.ok(admin._id);
            });

            it("autenticar() debe retornar usuario si credenciales correctas", async function () {
                await proxy.addCliente({ email: "login@ok.com", password: "abc", dni: "789", nombre: "L", apellidos: "G", direccion: "D" });
                let usuario = await proxy.autenticar({
                    email: "login@ok.com",
                    password: "abc",
                    rol: ROL.CLIENTE
                });
                assert.equal(usuario.email, "login@ok.com");
            });

            it("updateUsuario() debe modificar cliente correctamente", async function () {
                let cliente = await proxy.addCliente({ email: "upd@test.com", password: "123", dni: "111", nombre: "Viejo", apellidos: "A", direccion: "D" });
                
                let actualizado = await proxy.updateUsuario({
                    _id: cliente._id,
                    rol: ROL.CLIENTE,
                    email: "upd@test.com",
                    nombre: "Nuevo",
                    apellidos: "B",
                    direccion: "E",
                    dni: "111",
                    password: "123"
                });
                assert.equal(actualizado.nombre, "Nuevo");
                assert.equal(actualizado.apellidos, "B");
            });

            it("updateUsuario() debe modificar admin correctamente", async function () {
                let admin = await proxy.addAdmin({ email: "adm@test.com", password: "123", dni: "222", nombre: "Viejo", apellidos: "A", direccion: "D" });
                
                let actualizado = await proxy.updateUsuario({
                    _id: admin._id,
                    rol: ROL.ADMIN,
                    email: "adm@test.com",
                    nombre: "AdminNuevo",
                    apellidos: "Z",
                    dni: "222",
                    direccion: "D",
                    password: "123"
                });
                assert.equal(actualizado.nombre, "AdminNuevo");
            });
        });

        describe("CRUD de Items del Carro", function () {
            it("addClienteCarroItem() debe agregar item al carro", async function () {
                let cliente = await proxy.addCliente({ email: "c@i.com", password: "1", dni: "1", nombre: "C", apellidos: "A", direccion: "D" });
                let libro = await proxy.addLibro({ isbn: "L1", titulo: "T", precio: 10, stock: 5, autores: "A", resumen: "R" });
                
                await proxy.addClienteCarroItem(cliente._id, { libro: libro._id, cantidad: 2 });
                let carro = await proxy.getCarroCliente(cliente._id);
                
                assert.equal(carro.items.length, 1);
                assert.equal(carro.items[0].cantidad, 2);
            });

            it("setClienteCarroItemCantidad() debe modificar cantidad", async function () {
                let cliente = await proxy.addCliente({ email: "c@mod.com", password: "1", dni: "1", nombre: "C", apellidos: "A", direccion: "D" });
                let libro = await proxy.addLibro({ isbn: "L1", titulo: "T", precio: 10, stock: 5, autores: "A", resumen: "R" });
                
                await proxy.addClienteCarroItem(cliente._id, { libro: libro._id, cantidad: 2 });
                await proxy.setClienteCarroItemCantidad(cliente._id, 0, 5); // Indice 0
                
                let carro = await proxy.getCarroCliente(cliente._id);
                assert.equal(carro.items[0].cantidad, 5);
            });

            it("setClienteCarroItemCantidad() con 0 debe eliminar item", async function () {
                let cliente = await proxy.addCliente({ email: "c@del.com", password: "1", dni: "1", nombre: "C", apellidos: "A", direccion: "D" });
                let libro = await proxy.addLibro({ isbn: "L1", titulo: "T", precio: 10, stock: 5, autores: "A", resumen: "R" });
                
                await proxy.addClienteCarroItem(cliente._id, { libro: libro._id, cantidad: 2 });
                await proxy.setClienteCarroItemCantidad(cliente._id, 0, 0);
                
                let carro = await proxy.getCarroCliente(cliente._id);
                assert.equal(carro.items.length, 0);
            });
        });

        describe("CRUD de Facturas", function () {
            it("facturarCompraCliente() debe crear factura correctamente", async function () {
                let clienteData = { 
                    email: "fact@test.com", password: "1", dni: "1", 
                    nombre: "Test", apellidos: "User", direccion: "Calle" 
                };
                let cliente = await proxy.addCliente(clienteData);
                let libro = await proxy.addLibro({ isbn: "L1", titulo: "T", precio: 10, stock: 5, autores: "A", resumen: "R" });
                
                await proxy.addClienteCarroItem(cliente._id, { libro: libro._id, cantidad: 2 });
                
                let facturaData = {
                    cliente: cliente._id,
                    razonSocial: "Test S.L.",
                    direccion: "Calle Factura",
                    email: "fact@test.com",
                    dni: "1"
                };
                let factura = await proxy.facturarCompraCliente(facturaData);

                assert.ok(factura._id);
                assert.equal(factura.numero, 1);
                assert.equal(factura.items.length, 1);
                assert.equal(factura.total, 24.2); // (10 * 2) * 1.21
                
                // Verificar los datos del cliente en la factura
                assert.equal(factura.razonSocial, facturaData.razonSocial);
                assert.equal(factura.direccion, facturaData.direccion);
                assert.equal(factura.email, facturaData.email);
                assert.equal(factura.dni, facturaData.dni);

                // Verificar que el carro se vació
                let carro = await proxy.getCarroCliente(cliente._id);
                assert.equal(carro.items.length, 0);
            });

            it("removeFactura() debe eliminar factura correctamente", async function () {
                let cliente = await proxy.addCliente({ email: "rem@f.com", password: "1", dni: "1", nombre: "C", apellidos: "A", direccion: "D" });
                let libro = await proxy.addLibro({ isbn: "L1", titulo: "T", precio: 10, stock: 5, autores: "A", resumen: "R" });
                
                await proxy.addClienteCarroItem(cliente._id, { libro: libro._id, cantidad: 1 });
                let factura = await proxy.facturarCompraCliente({ cliente: cliente._id });
                
                await proxy.removeFactura(factura._id);
                
                let facturas = await proxy.getFacturas();
                assert.equal(facturas.length, 0);
            });
        });
    });

    describe("CÁLCULOS", function () {

        describe("Cálculos de Item", function () {
            it("Item.calcular() debe calcular total correctamente", async function () {
                let cliente = await proxy.addCliente({ email: "calc@item.com", password: "1", dni: "1", nombre: "C", apellidos: "A", direccion: "D" });
                let libro = await proxy.addLibro({ isbn: "L1", titulo: "T", precio: 15.50, stock: 10, autores: "A", resumen: "R" });
                
                await proxy.addClienteCarroItem(cliente._id, { libro: libro._id, cantidad: 3 });
                let carro = await proxy.getCarroCliente(cliente._id);
                
                assert.equal(carro.items[0].total, 46.50); // 15.50 * 3
            });
        });

        describe("Cálculos del Carro", function () {
            it("Carro.calcular() debe calcular subtotal correctamente", async function () {
                let cliente = await proxy.addCliente({ email: "calc@carro.com", password: "1", dni: "1", nombre: "C", apellidos: "A", direccion: "D" });
                let l1 = await proxy.addLibro({ isbn: "L1", titulo: "T1", precio: 10, stock: 10, autores: "A", resumen: "R" });
                let l2 = await proxy.addLibro({ isbn: "L2", titulo: "T2", precio: 20, stock: 10, autores: "A", resumen: "R" });
                
                await proxy.addClienteCarroItem(cliente._id, { libro: l1._id, cantidad: 2 }); // 20
                await proxy.addClienteCarroItem(cliente._id, { libro: l2._id, cantidad: 3 }); // 60
                
                let carro = await proxy.getCarroCliente(cliente._id);
                assert.equal(carro.subtotal, 80);
            });

            it("Carro.calcular() debe calcular IVA correctamente (21%)", async function () {
                let cliente = await proxy.addCliente({ email: "iva@carro.com", password: "1", dni: "1", nombre: "C", apellidos: "A", direccion: "D" });
                let libro = await proxy.addLibro({ isbn: "L1", titulo: "T", precio: 100, stock: 10, autores: "A", resumen: "R" });
                
                await proxy.addClienteCarroItem(cliente._id, { libro: libro._id, cantidad: 1 });
                let carro = await proxy.getCarroCliente(cliente._id);
                
                assert.equal(carro.subtotal, 100);
                assert.equal(carro.iva, 21);
            });

            it("Carro.calcular() debe calcular total correctamente", async function () {
                let cliente = await proxy.addCliente({ email: "tot@carro.com", password: "1", dni: "1", nombre: "C", apellidos: "A", direccion: "D" });
                let libro = await proxy.addLibro({ isbn: "L1", titulo: "T", precio: 100, stock: 10, autores: "A", resumen: "R" });
                
                await proxy.addClienteCarroItem(cliente._id, { libro: libro._id, cantidad: 1 });
                let carro = await proxy.getCarroCliente(cliente._id);
                
                assert.equal(carro.total, 121);
            });

            it("Carro.calcular() debe recalcular al modificar cantidad", async function () {
                let cliente = await proxy.addCliente({ email: "mod@carro.com", password: "1", dni: "1", nombre: "C", apellidos: "A", direccion: "D" });
                let libro = await proxy.addLibro({ isbn: "L1", titulo: "T", precio: 10, stock: 10, autores: "A", resumen: "R" });
                
                await proxy.addClienteCarroItem(cliente._id, { libro: libro._id, cantidad: 2 });
                // Check inicial
                let carro = await proxy.getCarroCliente(cliente._id);
                assert.equal(carro.subtotal, 20);

                // Modificar
                await proxy.setClienteCarroItemCantidad(cliente._id, 0, 5);
                carro = await proxy.getCarroCliente(cliente._id);
                
                assert.equal(carro.subtotal, 50);
                assert.equal(carro.iva, 10.5);
                assert.equal(carro.total, 60.5);
            });

            it("Carro.calcular() debe ser 0 cuando está vacío", async function () {
                let cliente = await proxy.addCliente({ email: "cero@carro.com", password: "1", dni: "1", nombre: "C", apellidos: "A", direccion: "D" });
                let carro = await proxy.getCarroCliente(cliente._id);
                
                assert.equal(carro.subtotal, 0);
                assert.equal(carro.iva, 0);
                assert.equal(carro.total, 0);
            });
        });

        describe("Casos de cálculo complejos", function () {
            it("Debe calcular correctamente con decimales", async function () {
                let cliente = await proxy.addCliente({ email: "dec@carro.com", password: "1", dni: "1", nombre: "C", apellidos: "A", direccion: "D" });
                let libro = await proxy.addLibro({ isbn: "L1", titulo: "T", precio: 19.99, stock: 10, autores: "A", resumen: "R" });
                
                await proxy.addClienteCarroItem(cliente._id, { libro: libro._id, cantidad: 3 });
                let carro = await proxy.getCarroCliente(cliente._id);
                
                // 19.99 * 3 = 59.97
                // IVA 21% de 59.97 = 12.5937
                // Total = 72.5637
                assert.approximately(carro.subtotal, 59.97, 0.01);
                assert.approximately(carro.iva, 12.59, 0.01);
                assert.approximately(carro.total, 72.56, 0.01);
            });
        });
    });
});