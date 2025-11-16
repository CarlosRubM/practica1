import { Presenter } from "../../commons/presenter.mjs";
import { router } from "../../commons/router.mjs";
import { MensajesPresenter } from "../mensajes/mensajes-presenter.mjs";
import { libreriaSession } from "../../commons/libreria-session.mjs";

export class ClienteVerCompraPresenter extends Presenter {
  constructor(model, view) {
    super(model, view);
    this.mensajesPresenter = new MensajesPresenter(model, 'mensajes', '#mensajesContainer');
    this.factura = null;
  }

  get numeroFactura() { return document.querySelector('#numeroFactura'); }
  get fechaFactura() { return document.querySelector('#fechaFactura'); }
  get razonSocial() { return document.querySelector('#razonSocial'); }
  get dniFactura() { return document.querySelector('#dniFactura'); }
  get direccionFactura() { return document.querySelector('#direccionFactura'); }
  get emailFactura() { return document.querySelector('#emailFactura'); }
  get itemsBody() { return document.querySelector('#itemsBody'); }
  get ivaCell() { return document.querySelector('#ivaCell'); }
  get totalCell() { return document.querySelector('#totalCell'); }
  get template() { return document.querySelector('#tpl-item-row'); }


  formatearFecha(fecha) {
    if (!fecha) return '';
    const f = new Date(fecha);
    const year = f.getFullYear();
    const month = String(f.getMonth() + 1).padStart(2, '0');
    const day = String(f.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

pintarFactura() {
  if (!this.factura) {
    this.mensajesPresenter.error('Factura no encontrada');
    router.navigate('/libreria/cliente-lista-compras.html');
    return;
  }

  // Usar .value en lugar de .textContent para los inputs
  this.numeroFactura.value = this.factura.numero || '';
  this.fechaFactura.value = this.formatearFecha(this.factura.fecha);
  this.razonSocial.value = this.factura.razonSocial || '';
  this.dniFactura.value = this.factura.dni || '';
  this.direccionFactura.value = this.factura.direccion || '';
  this.emailFactura.value = this.factura.email || '';

  this.itemsBody.innerHTML = '';
  if (this.factura.items?.length) {
    this.factura.items.forEach(item => this.itemsBody.append(this.pintarItem(item)));
  }

  this.ivaCell.textContent = libreriaSession.formatearMoneda(this.factura.iva);
  this.totalCell.textContent = libreriaSession.formatearMoneda(this.factura.total);
}

pintarItem(item) {
  const clone = this.template.content.cloneNode(true);
  const tr = clone.querySelector('tr');

  tr.querySelector('.item-cantidad').textContent = item.cantidad;
  tr.querySelector('.titulo').textContent = item.libro.titulo;
  tr.querySelector('.isbn').textContent = `[${item.libro.isbn}]`;
  tr.querySelector('.item-unidad').textContent = libreriaSession.formatearMoneda(item.libro.precio);
  tr.querySelector('.item-total').textContent = libreriaSession.formatearMoneda(item.total);

  return clone;
}
 /*  se podria hacer asi pero hemos optado por usar libreriaSession
  getFacturaIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return Number(params.get('id'));
  } */

  async refresh() {
    await super.refresh();
    await this.mensajesPresenter.refresh();
    const facturaId = Number(libreriaSession.getFacturaId());
    //const facturaId = this.getFacturaIdFromUrl();
    const todasFacturas = await this.model.getFacturas();
    this.factura = todasFacturas.find(f => f._id === facturaId);

    this.pintarFactura();
  }
}