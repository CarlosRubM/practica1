import { Presenter } from "../../commons/presenter.mjs";
import { InvitadoCatalogoLibroPresenter } from "../invitado-catalogo-libro/invitado-catalogo-libro-presenter.mjs";
import { LibreriaSession } from "../../commons/libreria-session.mjs";

export class InvitadoHomePresenter extends Presenter {
  constructor(model, view) {
    super(model, view);
  }

  get catalogoElement() {
    return document.querySelector("#catalogo");
  }

  displaySessionMessages() {
    // Recuperar y mostrar mensajes guardados en LibreriaSession
    const mensaje = LibreriaSession.getMessage();
    
    if (mensaje) {
      this.mostrarMensaje(mensaje.texto, mensaje.tipo);
      LibreriaSession.clearMessage(); // Limpiar después de mostrar
    }
  }

  mostrarMensaje(mensaje, tipo) {
    const container = document.getElementById('mensajesContainer');
    if (container) {
      container.innerHTML = `
        <div class="mensaje ${tipo}">
          ${mensaje}
        </div>
      `;

      // Auto-ocultar después de 5 segundos
      setTimeout(() => {
        container.innerHTML = '';
      }, 5000);
    }
  }

  async refresh() {
    await super.refresh();
    let libros = this.model.getLibros();

    await Promise.all(
      libros.map(async (l) => {
        return await new InvitadoCatalogoLibroPresenter(
          l,
          "invitado-catalogo-libro",
          "#catalogo"
        ).refresh();
      })
    );
  }
}