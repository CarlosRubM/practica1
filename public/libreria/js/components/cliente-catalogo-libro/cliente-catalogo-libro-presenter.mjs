import { Presenter } from "../../commons/presenter.mjs";

export class ClienteCatalogoLibroPresenter extends Presenter {
  constructor(model, view, parentSelector) {
    super(model, view, parentSelector);
  }

 async refresh() {
  let html = await this.getHTML();
  this.parentElement.insertAdjacentHTML('beforeend', html);

  // --- Título ---
  let node = this.parentElement.querySelector(`#titulo`);
  node.setAttribute('id', `titulo_${this.model._id}`);
  node.innerHTML = this.model.titulo;

  // --- Portada (¡Descomentada y corregida!) ---
  node = this.parentElement.querySelector(`#portada`);
  node.setAttribute('id', `portada_${this.model._id}`);
  node.innerHTML = this.model.portada;

  //Autores
  node = this.parentElement.querySelector(`#autores`);
  node.setAttribute('id', `autores_${this.model._id}`);
  node.innerHTML = this.model.autores; 

  //Precio 
  node = this.parentElement.querySelector(`#precio`);
  node.setAttribute('id', `precio_${this.model._id}`);
  // Formateamos el precio como en la imagen
  node.innerHTML = `€ ${this.model.precio}`; 

  // ISBN 
  node = this.parentElement.querySelector(`#isbn`);
  node.setAttribute('id', `isbn_${this.model._id}`);
  node.innerHTML = this.model.isbn;

  // --- Ver Link ---
  node = this.parentElement.querySelector(`#verLink`);
  node.setAttribute('id', `verLink_${this.model._id}`);
  node.setAttribute('href', `cliente-ver-libro.html?id=${this.model._id}`);

  

  this.attachAnchors();
}
}