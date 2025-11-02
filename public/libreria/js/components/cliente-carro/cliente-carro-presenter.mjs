import { Presenter } from "../../commons/presenter.mjs";
import { router } from "../../commons/router.mjs";
import { MensajesPresenter } from "../mensajes/mensajes-presenter.mjs";
import { libreriaSession } from "../../commons/libreria-session.mjs";

export class ClienteCarroPresenter extends Presenter {
    constructor(model, view) {
        super(model, view);
        this.mensajesPresenter = new MensajesPresenter(model, 'mensajes', '#mensajesContainer');
        this.carro = null;
    }

    get carroBody() { return document.querySelector('#carroBody'); }
    get ivaCell() { return document.querySelector('#ivaCell'); }
    get totalCell() { return document.querySelector('#totalCell'); }
    get template() { return document.querySelector('#tpl-carro-row'); }

    formatearPrecio(num) {
        return (parseFloat(num) || 0).toFixed(2).replace('.', ',');
    }

    pintarFila(item, index) {
        const clone = this.template.content.cloneNode(true);
        const tr = clone.querySelector('tr');
        const input = tr.querySelector('.cantidadInput');

        input.value = item.cantidad;
        input.addEventListener('input', e => {
            const cantidad = parseInt(e.target.value) || 0;
            this.cambiarCantidad(index, cantidad);
        });

        tr.querySelector('.titulo').textContent = item.libro.titulo;
        tr.querySelector('.isbn').textContent = `[${item.libro.isbn}]`;
        tr.querySelector('.precioUnit').textContent = this.formatearPrecio(item.libro.precio);
        tr.querySelector('.precioTotal').textContent = this.formatearPrecio(item.total);
        return clone;
    }

    pintarCarro() {
        this.carroBody.innerHTML = '';
        if (!this.carro?.items?.length) {
            this.carroBody.innerHTML = `<tr><td colspan="4">Tu carro está vacío</td></tr>`;
            this.ivaCell.textContent = this.totalCell.textContent = '0,00';
            return;
        }
        this.carro.items.forEach((it, i) => this.carroBody.append(this.pintarFila(it, i)));
        this.ivaCell.textContent = this.formatearPrecio(this.carro.iva);
        this.totalCell.textContent = this.formatearPrecio(this.carro.total);
    }

    async cambiarCantidad(index, cantidad) {
        try {
            const id = Number(libreriaSession.getUsuarioId());

            // Actualizar o eliminar según cantidad
            if (cantidad <= 0) {
                this.model.setClienteCarroItemCantidad(id, index, 0);
                this.mensajesPresenter.mensaje('Libro eliminado del carrito');
            } else {
                this.model.setClienteCarroItemCantidad(id, index, cantidad);
                this.mensajesPresenter.mensaje('Carrito modificado');
            }

            // Refrescar datos y vista
            this.carro = this.model.getCarroCliente(id);
            this.pintarCarro();

            // Aseguramos que el mensaje se actualiza visualmente
            await this.mensajesPresenter.refresh();

        } catch (err) {
            console.error('Error al cambiar cantidad:', err);
            this.mensajesPresenter.error('Error al actualizar el carrito');
            await this.mensajesPresenter.refresh();
        }
    }

    async refresh() {
        await super.refresh();
        await this.mensajesPresenter.refresh();
        const id = Number(libreriaSession.getUsuarioId());
        this.carro = this.model.getCarroCliente(id);
        this.pintarCarro();

        const btnComprar = document.querySelector('#compraLink');
        if (btnComprar) btnComprar.onclick = e => {
            e.preventDefault();
            if (!this.carro?.items?.length)
                return this.mensajesPresenter.error('El carro está vacío');
            router.navigate('/libreria/cliente-comprar-carro.html');
        };
    }
}
