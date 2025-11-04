import { libreriaSession } from "../../commons/libreria-session.mjs";
import { Presenter } from "../../commons/presenter.mjs";
import { router } from "../../commons/router.mjs";
import { MensajesPresenter } from "../mensajes/mensajes-presenter.mjs";
import { AdminCatalogoLibroPresenter } from "../admin-catalogo-libro/admin-catalogo-libro-presenter.mjs";

export class AdminHomePresenter extends Presenter {
  constructor(model, view) {
    super(model, view);
    this.mensajesPresenter = new MensajesPresenter(model, 'mensajes', '#mensajesContainer');
  }

  get catalogoElement() {
    return document.querySelector("#catalogo");
  }
  get salirLink() {
    return document.querySelector('#salirLink');
  }

  async salirClick(event) {
    event.preventDefault();
    libreriaSession.salir();
    this.mensajesPresenter.mensaje('Ha salido con éxito');
    router.navigate('/libreria/index.html');
  }


  async refresh() {
    await super.refresh();
    await this.mensajesPresenter.refresh();
    this.salirLink.onclick = event => this.salirClick(event);
    let libros = this.model.getLibros();

    await Promise.all(
      libros.map(async (l) => {
        return await new AdminCatalogoLibroPresenter(
          l,
          "admin-catalogo-libro",
          "#catalogo"
        ).refresh();
      })
    );
  }
}