import { Presenter } from "../../commons/presenter.mjs";
import { libreriaSession } from "../../commons/libreria-session.mjs";
import { MensajesPresenter } from "../mensajes/mensajes-presenter.mjs";
import { router } from "../../commons/router.mjs";

export class AdminVerLibroPresenter extends Presenter {

  constructor(model, view) {
    super(model, view);
    this.mensajesPresenter = new MensajesPresenter(model, 'mensajes', '#mensajesContainer');
  }

  get catalogoElement() {
    return document.querySelector('#catalogo');
  }

  get searchParams() {
    return new URLSearchParams(document.location.search);
  }

  get id() {
    return this.searchParams.get('id');
  }

  getLibro() {
    return this.model.getLibroPorId(this.id);
  }

  set libro(libro) {
    this.isbn = libro.isbn;
    this.titulo = libro.titulo;
    this.autores = libro.autores;
    this.resumen = libro.resumen;
    this.stock = libro.stock;
    this.precio = libro.precio;
  }

  get isbnParagraph() {
    console.log(document);
    return document.querySelector('#isbnParagraph');
  }

  set isbn(isbn) {
    this.isbnParagraph.textContent = isbn;
  }
  get tituloParagraph() {
    return document.querySelector('#tituloParagraph');
  }

  set titulo(titulo) {
    this.tituloParagraph.textContent = titulo;
  }
  get autoresParagraph() {
    return document.querySelector('#autoresParagraph');
  }

  set autores(autores) {
    this.autoresParagraph.textContent = autores;
  }

  get resumenParagraph() {
    return document.querySelector('#resumenParagraph');
  }

  set resumen(resumen) {
    this.resumenParagraph.textContent = resumen;
  }
  get precioParagraph() {
    return document.querySelector('#precioParagraph');
  }

  set precio(precio) {
    this.precioParagraph.textContent = precio;
  }

  get stockParagraph() {
    return document.querySelector('#stockParagraph');
  }

  set stock(stock) {
    this.stockParagraph.textContent = stock;
  }

  //METODO PARA BORRAR LIBRO
  async borrarLibro(event) {
    event.preventDefault();
    try {
      const libroId = Number(this.id);

      this.model.removeLibro(libroId);

      this.mensajesPresenter.mensaje('Libro eliminado correctamente');
      await router.navigate('/libreria/admin-home.html');
    } catch (err) {
      this.mensajesPresenter.error(err.message);
    }
  }

  async modificarLibro(event) {
    event.preventDefault();
    try {
      
      await router.navigate(`/libreria/admin-modificar-libro.html?id=${this.id}`)
    } catch (err) {
      this.mensajesPresenter.error(err.message);
    }
  }



  async refresh() {
    await super.refresh();
    console.log(this.id);
    let libro = this.getLibro();
    if (libro) this.libro = libro;
    else console.error(`Libro ${id} not found!`);

    document.querySelector('#verLibroTitulo').textContent = `Titulo: ${libro.titulo}`

  //Boton de BORRAR LIBRO
    const btnBorrarLibro = this.parentElement?.querySelector('#btnBorrar');
    if (btnBorrarLibro) {
      
      btnBorrarLibro.onclick = (e) => this.borrarLibro(e);
    } else {
      console.error('No se encontró el botón #btnBorrar');
    }

    const btnModificarLibro = this.parentElement?.querySelector('#btnModificar');
    if (btnModificarLibro) {
      
      btnModificarLibro.onclick = (e) => this.modificarLibro(e);
    } else {
      console.error('No se encontró el botón #btnModificar');
    }

  }

}