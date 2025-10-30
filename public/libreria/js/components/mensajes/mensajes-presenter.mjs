
import { Presenter } from "../../commons/presenter.mjs";
import { mensajes } from "../../commons/mensajes.mjs";

export class MensajesPresenter extends Presenter {
  constructor(model, view, parent) {
    super(model, view, parent);
  }

  // Plantillas HTML
  messageHTML(message) {
    return `
      <div class="message" style="display:flex; justify-content: space-between;">
        <span>${this.escape(message)}</span>
        <span class="x" onclick="event.target.parentElement.remove()">X</span>
      </div>
    `;
  }

  logHTML(log) {
    return `
      <div class="log" style="display:flex; justify-content: space-between;">
        <span>${this.escape(log)}</span>
        <span class="x" onclick="event.target.parentElement.remove()">X</span>
      </div>
    `;
  }

  errorHTML(error) {
    return `
      <div class="error" style="display:flex; justify-content: space-between;">
        <span>${this.escape(error)}</span>
        <span class="x" onclick="event.target.parentElement.remove()">X</span>
      </div>
    `;
  }

  // Acceso al contenedor
  get messagesDiv() {
    return document.querySelector("#mensajes");
  }

  // Helpers de inserción
  addMensajeHTML(message) {
    this.messagesDiv.innerHTML = this.messagesDiv.innerHTML + this.messageHTML(message);
  }

  addLogHTML(log) {
    this.messagesDiv.innerHTML = this.messagesDiv.innerHTML + this.logHTML(log);
  }

  addErrorHTML(error) {
    this.messagesDiv.innerHTML = this.messagesDiv.innerHTML + this.errorHTML(error);
  }

  // Refrescar listado desde el buffer global
  refreshMensajes() {
    if (!this.messagesDiv) return;
    this.messagesDiv.innerHTML = "";
    mensajes.errors.forEach(m => this.addErrorHTML(m));
    mensajes.messages.forEach(m => this.addMensajeHTML(m));
    mensajes.logs.forEach(m => this.addLogHTML(m));
  }

  // Facades al buffer global
  log(mensaje)     { mensajes.log(mensaje); }
  error(mensaje)   { mensajes.error(mensaje); }
  mensaje(mensaje) { mensajes.mensaje(mensaje); }
  limpiarMensajes() { mensajes.limpiar(); }

  // Ciclo de vida
  async refresh() {
    await super.refresh();
    this.refreshMensajes();
    this.limpiarMensajes();
  }

  // Escapar texto para HTML
  escape(s) {
    return String(s).replace(/[&<>"']/g, ch => (
      { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]
    ));
  }
}
