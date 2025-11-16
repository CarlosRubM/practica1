import { Presenter } from "../../commons/presenter.mjs";
import { router } from "../../commons/router.mjs";
import { MensajesPresenter } from "../mensajes/mensajes-presenter.mjs";
import { libreriaSession } from "../../commons/libreria-session.mjs";

export class ClienteListaComprasPresenter extends Presenter {
  constructor(model, view) {
    super(model, view);
    this.mensajesPresenter = new MensajesPresenter(model, 'mensajes', '#mensajesContainer');
    this.facturas = [];
  }

  get facturasBody() { return document.querySelector('#facturasBody'); }
  get totalCell() { return document.querySelector('#totalCell'); }
  get template() { return document.querySelector('#tpl-factura-row'); }

//UNICAMENTE PARA QUE SALGA DE IGUAL MANERA QUE EN LOS VIDEOS
  formatearFecha(fecha) {
    if (!fecha) return '';
    const f = new Date(fecha);
    const year = f.getFullYear();
    const month = String(f.getMonth() + 1).padStart(2, '0');
    const day = String(f.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  pintarFila(factura) {
    const clone = this.template.content.cloneNode(true);
    const tr = clone.querySelector('tr');
    const btn = tr.querySelector('.verBtn');

    tr.querySelector('.numero').textContent = factura.numero;
    tr.querySelector('.fecha').textContent = this.formatearFecha(factura.fecha);
    tr.querySelector('.total').textContent = libreriaSession.formatearMoneda(factura.total);

    btn.dataset.facturaId = factura._id;

    return clone;
  }

  pintarFacturas() {
    this.facturasBody.innerHTML = '';

    if (!this.facturas?.length) {
      this.facturasBody.innerHTML = `<tr><td colspan="4">No tienes facturas</td></tr>`;
      this.totalCell.textContent = '0,00';
      return;
    }

    this.facturas.forEach(f => this.facturasBody.append(this.pintarFila(f)));

    const totalGeneral = this.facturas.reduce((sum, f) => sum + (parseFloat(f.total) || 0), 0);
    this.totalCell.textContent = libreriaSession.formatearMoneda(totalGeneral);
  }


//METODO PARA VER FACTURA
  async verFacturaClick(event) {
    event.preventDefault();


    try {
      const facturaId = event.target.dataset.facturaId;
      libreriaSession.setFacturaId(facturaId);
      await router.navigate(`/libreria/cliente-ver-compra.html?id=${facturaId}`);
    } catch (err) {
      console.error('Error al navegar:', err);
      this.mensajesPresenter.error('Error al abrir la factura');
      await this.mensajesPresenter.refresh();
    }
  }

  async refresh() {
    await super.refresh();
    await this.mensajesPresenter.refresh();

    const id = Number(libreriaSession.getUsuarioId());
    const todasFacturas = await this.model.getFacturas();
    this.facturas = todasFacturas.filter(f => f.cliente?._id === id);
    this.pintarFacturas();

    //Cuando se le da al boton de ver para cada factura
    const botonesVer = this.facturasBody.querySelectorAll('.verBtn');
    botonesVer.forEach(btn => {
      btn.onclick = event => this.verFacturaClick(event);
    });
  }

}
