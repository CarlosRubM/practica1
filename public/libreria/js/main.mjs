
import { model } from "./model/model.mjs";
import { router } from "./commons/router.mjs";
import { InvitadoHomePresenter } from "./components/invitado-home/invitado-home-presenter.mjs";
import { InvitadoVerLibroPresenter } from "./components/invitado-ver-libro/invitado-ver-libro-presenter.mjs";
import { InvitadoRegistroPresenter } from "./components/invitado-registro/invitado-registro-presenter.mjs"; 
import { InvitadoIngresoPresenter } from "./components/invitado-ingreso/invitado-ingreso-presenter.mjs";
import { ClienteHomePresenter } from "./components/cliente-home/cliente-home-presenter.mjs";
import { ClienteVerLibroPresenter } from "./components/cliente-ver-libro/cliente-ver-libro-presenter.mjs";
import { seed } from "./model/seeder.mjs";
import { ClientePerfilPresenter } from "./components/cliente-perfil/cliente-perfil-presenter.mjs"; 
import { ClienteCarroPresenter } from "./components/cliente-carro/cliente-carro-presenter.mjs";
import { ClienteComprarCarroPresenter } from "./components/cliente-comprar-carro/cliente-comprar-carro-presenter.mjs";
import { ClienteListaComprasPresenter } from "./components/cliente-lista-compras/cliente-lista-compras-presenter.mjs";
import { ClienteVerCompraPresenter } from "./components/cliente-ver-compra/cliente-ver-compra-presenter.mjs";
import { AdminHomePresenter } from "./components/admin-home/admin-home-presenter.mjs";
import { AdminVerLibroPresenter } from "./components/admin-ver-libro/admin-ver-libro-presenter.mjs";
import { AdminPerfilPresenter } from "./components/admin-perfil/admin-perfil-presenter.mjs";
import { AdminAgregarLibroPresenter } from "./components/admin-agregar-libro/admin-agregar-libro-presenter.mjs";
import { AdminModificarLibroPresenter } from "./components/admin-modificar-libro/admin-modificar-libro-presenter.mjs";



export function init() {
  seed();
  // console.log(model)
  router.register(/^\/libreria\/index.html$/, new InvitadoHomePresenter(model, 'invitado-home'));
  router.register(/^\/libreria\/catalogo.html$/, new InvitadoHomePresenter(model, 'invitado-home'));
  router.register(/^\/libreria\/invitado-ver-libro.html/, new InvitadoVerLibroPresenter(model, 'invitado-ver-libro'));
  // router.register(/^\/libreria\/home.html$/, new HomePresenter(model, 'home'));
  //router.register(/^\/libreria$/, new HomePresenter(model, 'home'));
  router.register(/^\/libreria$/, new InvitadoHomePresenter(model, 'invitado-home'));

   //se añade el de registro de invitado
  router.register(/^\/libreria\/invitado-registro.html$/, new InvitadoRegistroPresenter(model, 'invitado-registro'));
  router.register(/^\/libreria\/invitado-ingreso.html$/, new InvitadoIngresoPresenter(model, 'invitado-ingreso'));

  //CLIENTE
  router.register(/^\/libreria\/cliente-home.html$/, new ClienteHomePresenter(model, 'cliente-home'));
  router.register(/^\/libreria\/cliente-ver-libro.html/, new ClienteVerLibroPresenter(model, 'cliente-ver-libro'));
  router.register(/^\/libreria\/cliente-perfil.html/, new ClientePerfilPresenter(model, 'cliente-perfil'));
  router.register(/^\/libreria\/cliente-carro.html/, new ClienteCarroPresenter(model, 'cliente-carro'));
  router.register(/^\/libreria\/cliente-comprar-carro.html/, new ClienteComprarCarroPresenter(model, 'cliente-comprar-carro'));
  router.register(/^\/libreria\/cliente-lista-compras.html/, new ClienteListaComprasPresenter(model, 'cliente-lista-compras'));
  router.register(/^\/libreria\/cliente-ver-compra.html/, new ClienteVerCompraPresenter(model, 'cliente-ver-compra'));
  // router.register(/^\/libreria\/agregar-libro.html$/, new AgregarLibroPresenter(model, 'agregar-libro'));

  //ADMIN
  router.register(/^\/libreria\/admin-home.html$/, new AdminHomePresenter(model, 'admin-home'));
  router.register(/^\/libreria\/admin-ver-libro.html/, new AdminVerLibroPresenter(model, 'admin-ver-libro'));
  router.register(/^\/libreria\/admin-perfil.html/, new AdminPerfilPresenter(model, 'admin-perfil'));
  router.register(/^\/libreria\/admin-agregar-libro.html$/, new AdminAgregarLibroPresenter(model, "admin-agregar-libro"));
  router.register(/^\/libreria\/admin-modificar-libro.html/, new AdminModificarLibroPresenter(model, "admin-modificar-libro"));
  router.handleLocation();
}