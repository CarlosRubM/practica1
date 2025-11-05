import { libreriaSession } from "../../commons/libreria-session.mjs";
import { Presenter } from "../../commons/presenter.mjs";
import { router } from "../../commons/router.mjs";
import { MensajesPresenter } from "../mensajes/mensajes-presenter.mjs";

export class AdminAgregarLibroPresenter extends Presenter {
  constructor(model, view) {
    super(model, view);
    this.mensajesPresenter = new MensajesPresenter(model, 'mensajes', '#mensajesContainer');
  }

  // Botones
  get guardarButton() {
    return document.querySelector("#guardarButton");
  }

  get cancelarButton() {
    return document.querySelector("#cancelarButton");
  }

  // Inputs
  get tituloInput() {
    return document.querySelector("#tituloInput");
  }

  get tituloText() {
    return this.tituloInput.value.trim();
  }

  get autoresInput() {
    return document.querySelector("#autoresInput");
  }

  get autoresText() {
    return this.autoresInput.value.trim();
  }

  get isbnInput() {
    return document.querySelector("#isbnInput");
  }

  get isbnText() {
    return this.isbnInput.value.trim();
  }

  get precioInput() {
    return document.querySelector("#precioInput");
  }

  get precioText() {
    return parseFloat(this.precioInput.value);
  }

  get descripcionInput() {
    return document.querySelector("#descripcionInput");
  }

  get descripcionText() {
    return this.descripcionInput.value.trim();
  }

  get stockInput() {
    return document.querySelector("#stockInput");
  }
  
  get stockText() {
    return parseInt(this.stockInput.value);
  }

  // Objeto libro
  get libroObject() {
    return {
      titulo: this.tituloText,
      autores: this.autoresText,
      isbn: this.isbnText,
      precio: this.precioText,
      resumen: this.descripcionText,
      stock: this.stockText
    };
  }

  async guardarClick(event) {
    event.preventDefault();
    try {
      console.log('Iniciando guardado...', this.libroObject);

      if (!libreriaSession.esAdmin()) {
        throw new Error("Acceso denegado");
      }

      const nuevo = await this.model.addLibro(this.libroObject);
      this.mensajesPresenter.mensaje(`Libro "${nuevo.titulo}" agregado correctamente.`);
      console.log('Libro guardado exitosamente, navegando...');
      await router.navigate("/libreria/admin-home.html");

    } catch (err) {
      console.error('Error al guardar libro:', err);
      this.mensajesPresenter.error(err.message);
      await this.mensajesPresenter.refresh();
    }
  }

  async cancelarClick(event) {
    event.preventDefault();
    await router.navigate("/libreria/admin-home.html");
  }

  async refresh() {
    await super.refresh();
    await this.mensajesPresenter.refresh();

    const guardarBtn = this.parentElement?.querySelector('#guardarButton');
    const cancelarBtn = this.parentElement?.querySelector('#cancelarButton');

    if (guardarBtn) {
      guardarBtn.onclick = event => this.guardarClick(event);
    } else {
      console.error('Botón guardar no encontrado');
    }

    if (cancelarBtn) {
      cancelarBtn.onclick = event => this.cancelarClick(event);
    } else {
      console.error('Botón cancelar no encontrado');
    }
  }
}