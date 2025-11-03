//TENEMOS QUE IMPORTAR ROL de model.mjs
import { ROL } from "../model/model.mjs";
const USUARIO_ID = 'USUARIO_ID';
const USUARIO_ROL = 'USUARIO_ROL';
const FACTURA_ID = 'FACTURA_ID'; // Nueva constante

class LibreriaSession {
  formatoMoneda;

  constructor() {
    this.formatoMoneda = Intl.NumberFormat('es-ES', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      currencySign: 'accounting'
    });
  }

  ingreso(usuario) {
    this.setUsuarioId(usuario._id);
    this.setUsuarioRol(usuario.rol);
  }

  setUsuarioId(id) {
    sessionStorage.setItem(USUARIO_ID, id);
  }

  getUsuarioId() {
    if (this.esInvitado()) throw new Error('Es un invitado');
    return sessionStorage.getItem(USUARIO_ID);
  }

  setUsuarioRol(rol) {
    sessionStorage.setItem(USUARIO_ROL, rol);
  }

  getUsuarioRol() {
    return sessionStorage.getItem(USUARIO_ROL);
  }

  salir() {
    sessionStorage.removeItem(USUARIO_ID);
    sessionStorage.removeItem(USUARIO_ROL);
    sessionStorage.removeItem(FACTURA_ID); // Limpiar también la factura
  }

  esInvitado() {
    return !this.getUsuarioRol();
  }

  esCliente() {
    return !this.esInvitado() && this.getUsuarioRol() === ROL.CLIENTE;
  }

  esAdmin() {
    return !this.esInvitado() && this.getUsuarioRol() === ROL.ADMIN;
  }

  // Nuevos métodos para factura
  setFacturaId(id) {
    sessionStorage.setItem(FACTURA_ID, id);
  }

  getFacturaId() {
    return sessionStorage.getItem(FACTURA_ID);
  }

  removeFacturaId() {
    sessionStorage.removeItem(FACTURA_ID);
  }

  formatearMoneda(valor) {
    return this.formatoMoneda.format(valor).replace('.', ','); //añadimos que reemplace el punto por una coma
  }
}

export let libreriaSession = new LibreriaSession();
