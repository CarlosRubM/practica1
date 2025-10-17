import { libreriaSession } from "../../commons/libreria-session.mjs";
import { Presenter } from "../../commons/presenter.mjs";
import { router } from "../../commons/router.mjs";


export class ClienteHomePresenter extends Presenter {
  constructor(model, view) {
    super(model, view);
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
    router.navigate('/libreria/index.html');
  }


  async refresh() {
    await super.refresh();
    this.salirLink.onclick = event => this.salirClick(event);
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