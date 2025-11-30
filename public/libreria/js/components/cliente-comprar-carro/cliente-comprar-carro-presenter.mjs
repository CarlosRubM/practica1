import { Presenter } from "../../commons/presenter.mjs";
import { router } from "../../commons/router.mjs";
import { MensajesPresenter } from "../mensajes/mensajes-presenter.mjs";
import { libreriaSession } from "../../commons/libreria-session.mjs";

export class ClienteComprarCarroPresenter extends Presenter {
  constructor(model, view) {
    super(model, view);
    this.mensajesPresenter = new MensajesPresenter(model, 'mensajes', '#mensajesContainer');
    this.carro = null;
  }


  get template() { return document.querySelector('#tpl-compra-row'); }
  get carroBody() { return document.querySelector('#carroBody'); }
  get ivaCell() { return document.querySelector('#ivaCell'); }
  get totalCell() { return document.querySelector('#totalCell'); }
  get formCompra() { return document.querySelector('#formCompra'); }
  get fechaInput() { return document.querySelector('#fecha'); }
  get dniInput() { return document.querySelector('#dni'); }
  get razonSocialInput() { return document.querySelector('#razonSocial'); }
  get direccionInput() { return document.querySelector('#direccion'); }
  get emailInput() { return document.querySelector('#email'); }


  get facturaObject() {
    return {
      fecha: this.fechaInput?.value,
      dni: this.dniInput?.value,
      razonSocial: this.razonSocialInput?.value,
      direccion: this.direccionInput?.value,
      email: this.emailInput?.value,
      cliente: libreriaSession.getUsuarioId()
    };
  }

  // Pinta una fila del carro
  pintarFila(item, index) {
    const clone = this.template.content.cloneNode(true);
    const tr = clone.querySelector('tr');
    const input = tr.querySelector('.cantidadInput');

    input.value = item.cantidad;

    // Para modificar la cantidad
    input.addEventListener('input', e => {
      const cantidad = parseInt(e.target.value) || 0;
      this.cambiarCantidad(index, cantidad);
    });

    tr.querySelector('.titulo').textContent = item.libro.titulo;
    tr.querySelector('.isbn').textContent = `[${item.libro.isbn}]`;
    tr.querySelector('.precioUnit').textContent = libreriaSession.formatearMoneda(item.libro.precio);
    tr.querySelector('.precioTotal').textContent = libreriaSession.formatearMoneda(item.total);

    return clone;
  }

  // Pinta el contenido completo del carro
  pintarCarro() {
    this.carroBody.innerHTML = '';

    if (!this.carro?.items?.length) {
      this.mensajesPresenter.error('El carro está vacío');
      router.navigate('/libreria/cliente-carro.html');
      return;
    }

    this.carro.items.forEach((it, i) => this.carroBody.append(this.pintarFila(it, i)));

    this.ivaCell.textContent = libreriaSession.formatearMoneda(this.carro.iva);
    this.totalCell.textContent = libreriaSession.formatearMoneda(this.carro.total);
  }

  // Cambia la cantidad de un item del carro
  async cambiarCantidad(index, cantidad) {
    const id = libreriaSession.getUsuarioId();
    await this.model.setClienteCarroItemCantidad(id, index, cantidad);
    this.carro = await this.model.getCarroCliente(id);
    this.pintarCarro();
  }


  async procesarCompra(event) {
    event.preventDefault();

    try {
      const facturaData = this.facturaObject;
      await this.model.facturarCompraCliente(facturaData);
      this.mensajesPresenter.mensaje('Compra realizada con éxito');
      await router.navigate('/libreria/cliente-home.html');

    } catch (err) {
      console.error('Error al procesar la compra:', err);
      this.mensajesPresenter.error('Error al procesar la compra: ' + err.message);
      await this.mensajesPresenter.refresh();
    }
  }


  async refresh() {
    await super.refresh();
    await this.mensajesPresenter.refresh();

    const id = libreriaSession.getUsuarioId();
    this.carro = await this.model.getCarroCliente(id);
    this.pintarCarro();

    const cliente = await this.model.getClientePorId(id);
    if (cliente) {
      const hoy = new Date().toISOString().split('T')[0];
      if (this.fechaInput) this.fechaInput.value = hoy;
      if (this.dniInput) this.dniInput.value = cliente.dni || '';
      if (this.razonSocialInput) this.razonSocialInput.value = cliente.razonSocial || '';
      if (this.direccionInput) this.direccionInput.value = cliente.direccion || '';
      if (this.emailInput) this.emailInput.value = cliente.email || '';
    }

    if (this.formCompra) {
      this.formCompra.onsubmit = e => this.procesarCompra(e);
    }
  }
}
