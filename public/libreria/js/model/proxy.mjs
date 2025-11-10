export const ROL = {
  ADMIN: "ADMIN",
  CLIENTE: "CLIENTE",
};


export class LibreriaProxy {

  constructor() { }

  /**
   * Libros
   */

  async getLibros() {
    let response = await fetch('http://localhost:3000/api/libros');
    if (response.ok) {
      return await response.json();
    } else {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
  }

  async addLibro(obj) {
    let response = await fetch('http://localhost:3000/api/libros', {
      method: 'POST',
      body: JSON.stringify(obj),
      headers: { 'Content-Type': 'application/json;charset=utf-8' }
    });
    if (response.ok) {
      return await response.json();
    } else {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
  }

  async setLibros(array) {
    let response = await fetch('http://localhost:3000/api/libros', {
      method: 'PUT',
      body: JSON.stringify(array),
      headers: { 'Content-Type': 'application/json;charset=utf-8' }
    });
    if (response.ok) {
      return await response.json();
    } else {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
  }

  async getLibroPorId(id) {
    let response = await fetch(`http://localhost:3000/api/libros/${id}`);
    if (response.ok) {
      return await response.json();
    } else {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
  }


  async getLibroPorIsbn(id) {
    let response = await fetch(`http://localhost:3000/api/libros?isbn=${isbn}`);
    if (response.ok) {
      return await response.json();
    } else {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
  }

  async getLibroPorTitulo(titulo) {
    let response = await fetch(`http://localhost:3000/libros?titulo=${encodeURIComponent(titulo)}`)
    if (response.ok) {
      return await response.json();
    } else {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
  }


  async removeLibro(id) {
    let response = await fetch(`http://localhost:3000/api/libros/${id}`, { method: 'DELETE' });
    if (response.ok) {
      return await response.json();
    } else {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
  }

  async updateLibro(obj) {
    let response = await fetch(`http://localhost:3000/api/libros/${obj._id}`, {
      method: 'PUT',
      body: JSON.stringify(obj),
      headers: { 'Content-Type': 'application/json;charset=utf-8' }
    });
    if (response.ok) {
      return await response.json();
    } else {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
  }

  /**
 * Clientes
 */


  async addCliente(obj) {
    let response = await fetch('http://localhost:3000/api/clientes', {
      method: 'POST',
      body: JSON.stringify(obj),
      headers: { 'Content-Type': 'application/json;charset=utf-8' }
    });
    if (response.ok) {
      return await response.json();
    } else {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
  }

  async getClientes() {
    let response = await fetch('http://localhost:3000/api/clientes');
    if (response.ok) {
      return await response.json();
    } else {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
  }

  async getClientePorId(_id) {
    let response = await fetch(`http://localhost:3000/api/usuarios/${_id}`);
    if (response.ok) {
      return await response.json();
    } else {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
  }
  async getClientePorEmail(email) {
    let response = await fetch(`http://localhost:3000/clientes?email=${encodeURIComponent(email)}`)
    if (response.ok) {
      return await response.json();
    } else {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
  }

  async getClientePorDni(dni) {
    let response = await fetch(`http://localhost:3000/clientes?dni=${encodeURIComponent(dni)}`)
    if (response.ok) {
      return await response.json();
    } else {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
  }

  async removeCliente(id) {
    let response = await fetch(`http://localhost:3000/api/clientes/${id}`, { method: 'DELETE' });
    if (response.ok) {
      return await response.json();
    } else {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
  }

  async setClientes(array) {
    let response = await fetch('http://localhost:3000/api/clientes', {
      method: 'PUT',
      body: JSON.stringify(array),
      headers: { 'Content-Type': 'application/json;charset=utf-8' }
    });
    if (response.ok) {
      return await response.json();
    } else {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
  }

  async updateCliente(obj) {
    let response = await fetch(`http://localhost:3000/api/clientes/${obj._id}`, {
      method: 'PUT',
      body: JSON.stringify(obj),
      headers: { 'Content-Type': 'application/json;charset=utf-8' }
    });
    if (response.ok) {
      return await response.json();
    } else {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
  }
  async autenticar(obj) {
    let response = await fetch('/api/usuarios/autenticar', {
      method: 'POST',
      body: JSON.stringify(obj),
      headers: { 'Content-Type': 'application/json;charset=utf-8' }
    });
    if (response.ok) {
      return await response.json();
    } else {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
  }

  //SE NECESITA PARA REGISTRAR USUARIOS
  async addUsuario(obj) {
    let response = await fetch('/api/usuarios', {
      method: 'POST',
      body: JSON.stringify(obj),
      headers: { 'Content-Type': 'application/json;charset=utf-8' }
    });
    if (response.ok) {
      return await response.json();
    } else {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
  }

  async getCarroCliente(id) {
    let response = await fetch(`http://localhost:3000/api/clientes/${id}/carro`);
    if (response.ok) {
      return await response.json();
    } else {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
  }

  async addClienteCarroItem(id, item) {
    let response = await fetch(`http://localhost:3000/api/clientes/${id}/carro/items`, {
      method: 'POST',
      body: JSON.stringify(item),
      headers: { 'Content-Type': 'application/json;charset=utf-8' }
    });
    if (response.ok) {
      return await response.json();
    } else {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
  }

  async setClienteCarroItemCantidad(id, index, cantidad) {
    let response = await fetch(`http://localhost:3000/api/clientes/${id}/carro/items/${index}`, {
      method: 'PUT',
      body: JSON.stringify({ cantidad }),
      headers: { 'Content-Type': 'application/json;charset=utf-8' }
    });
    if (response.ok) {
      return await response.json();
    } else {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
  }

  /**
 * Admins
 */
  async getAdmins() {
    let response = await fetch(`http://localhost:3000/api/admins`);
    if (response.ok) {
      return await response.json();
    } else {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
  }

  async addAdmin(obj) {
    let response = await fetch(`http://localhost:3000/api/admins`, {
      method: 'POST',
      body: JSON.stringify(obj),
      headers: { 'Content-Type': 'application/json;charset=utf-8' }
    });
    if (response.ok) {
      return await response.json();
    } else {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
  }

  async setAdmins(array) {
    let response = await fetch(`http://localhost:3000/api/admins`, {
      method: 'PUT',
      body: JSON.stringify(array),
      headers: { 'Content-Type': 'application/json;charset=utf-8' }
    });
    if (response.ok) {
      return await response.json();
    } else {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
  }

  async getAdminPorId(id) {
    let response = await fetch(`http://localhost:3000/api/admins/${id}`);
    if (response.ok) {
      return await response.json();
    } else {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
  }

  async getAdminPorEmail(email) {
    let response = await fetch(`http://localhost:3000/api/admins?email=${encodeURIComponent(email)}`);
    if (response.ok) {
      return await response.json();
    } else {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
  }

  async getAdminPorDni(dni) {
    let response = await fetch(`http://localhost:3000/api/admins?dni=${encodeURIComponent(dni)}`);
    if (response.ok) {
      return await response.json();
    } else {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
  }

  async removeAdmin(id) {
    let response = await fetch(`http://localhost:3000/api/admins/${id}`, { method: 'DELETE' });
    if (response.ok) {
      return await response.json();
    } else {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
  }

  async updateAdmin(obj) {
    let response = await fetch(`http://localhost:3000/api/admins/${obj._id}`, {
      method: 'PUT',
      body: JSON.stringify(obj),
      headers: { 'Content-Type': 'application/json;charset=utf-8' }
    });
    if (response.ok) {
      return await response.json();
    } else {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
  }

  // Autenticación de admin
  async autenticar(obj) {
    let response = await fetch('/api/admins/autenticar', {
      method: 'POST',
      body: JSON.stringify(obj),
      headers: { 'Content-Type': 'application/json;charset=utf-8' }
    });
    if (response.ok) {
      return await response.json();
    } else {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
  }

  
  /**
 * Facturas
 */
 async getFacturas() {
    let response = await fetch('http://localhost:3000/api/facturas');
    if (response.ok) {
      return await response.json();
    } else {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
  }

  async setFacturas(array){
    let response = await fetch('http://localhost:3000/api/facturas', {
      method: 'PUT',
      body: JSON.stringify(array),
      headers: { 'Content-Type': 'application/json;charset=utf-8' }
    });
    if (response.ok) {
      return await response.json();
    } else {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
  }

  async removeFacturas() {
    let response = await fetch('http://localhost:3000/api/facturas', { method: 'DELETE' });
    if (response.ok) {
      return await response.json();
    } else {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
  }

  async getFacturaPorId(id){
    let response = await fetch(`http://localhost:3000/api/facturas/${id}`);
    if (response.ok) {
      return await response.json();
    } else {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
  }

  async getFacturaPorNumero(numero){
    let response = await fetch(`http://localhost:3000/api/facturas?numero=${encodeURIComponent(numero)}`);
    if (response.ok) {
      return await response.json();
    } else {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
  }

  async getFacturasPorCliente(clienteId){
    let response = await fetch(`http://localhost:3000/api/facturas?cliente=${encodeURIComponent(clienteId)}`);
    if (response.ok) {
      return await response.json();
    } else {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
  }

  async facturarCompraCliente(obj) {
    let response = await fetch('http://localhost:3000/api/facturas', {
      method: 'POST',
      body: JSON.stringify(obj),
      headers: { 'Content-Type': 'application/json;charset=utf-8' }
    });
    if (response.ok) {
      return await response.json();
    } else {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
  }

  async removeFactura(id) {
    let response = await fetch(`http://localhost:3000/api/facturas/${id}`, { method: 'DELETE' });
    if (response.ok) {
      return await response.json();
    } else {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
  }
}

export const proxy = new LibreriaProxy();