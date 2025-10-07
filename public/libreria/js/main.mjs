
import { model } from "./model/model.mjs";
import { router } from "./commons/router.mjs";
import { InvitadoHomePresenter } from "./components/invitado-home/invitado-home-presenter.mjs";
import { InvitadoVerLibroPresenter } from "./components/invitado-ver-libro/invitado-ver-libro-presenter.mjs";
import { seed } from "./model/seeder.mjs";

export function init() {
  seed();
  // console.log(model)
  router.register(/^\/libreria\/index.html$/, new InvitadoHomePresenter(model, 'invitado-home'));
  router.register(/^\/libreria\/catalogo.html$/, new InvitadoHomePresenter(model, 'invitado-home'));
  router.register(/^\/libreria\/invitado-ver-libro.html/, new InvitadoVerLibroPresenter(model, 'invitado-ver-libro'));
  // router.register(/^\/libreria\/home.html$/, new HomePresenter(model, 'home'));
  //router.register(/^\/libreria$/, new HomePresenter(model, 'home'));
  router.register(/^\/libreria$/, new InvitadoHomePresenter(model, 'invitado-home'));
  // router.register(/^\/libreria\/agregar-libro.html$/, new AgregarLibroPresenter(model, 'agregar-libro'));
  router.handleLocation();
}