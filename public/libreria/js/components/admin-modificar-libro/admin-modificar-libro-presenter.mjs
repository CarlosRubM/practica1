import { Presenter } from "../../commons/presenter.mjs";
import { router } from "../../commons/router.mjs";
import { MensajesPresenter } from "../mensajes/mensajes-presenter.mjs";

export class AdminModificarLibroPresenter extends Presenter {
    constructor(model, view) {
        super(model, view);
        this.mensajesPresenter = new MensajesPresenter(model, 'mensajes', '#mensajesContainer');
        this.libro = null;
    }

    get guardarButton() {
        return document.querySelector('#guardarBtn');
    }

    get isbnInput() {
        return document.querySelector('#isbnInput');
    }

    get isbnText() {
        return this.isbnInput.value;
    }

    get tituloInput() {
        return document.querySelector('#tituloInput');
    }

    get tituloText() {
        return this.tituloInput.value;
    }

    get autoresInput() {
        return document.querySelector('#autoresInput');
    }

    get autoresText() {
        return this.autoresInput.value;
    }

    get portadaInput() {
        return document.querySelector('#portadaInput');
    }

    get portadaText() {
        return this.portadaInput.value;
    }

    get resumenInput() {
        return document.querySelector('#descripcionInput');
    }

    get resumenText() {
        return this.resumenInput.value;
    }

    get stockInput() {
        return document.querySelector('#stockInput');
    }

    get stockNumber() {
        return Number(this.stockInput.value);
    }

    get precioInput() {
        return document.querySelector('#precioInput');
    }

    get precioNumber() {
        return Number(this.precioInput.value);
    }

    get libroObject() {
        return {
            _id: this.libro._id,  // Necesitamos el id del libro para modificarlo
            isbn: this.isbnText,
            titulo: this.tituloText,
            autores: this.autoresText,
            portada: this.portadaText || "",  // Valor por defecto si no existe el campo
            resumen: this.resumenText,
            stock: this.stockNumber || 0,  // Valor por defecto si no existe el campo
            precio: this.precioNumber
        };
    }

    async guardarClick(event) {
        event.preventDefault();
        try {
            const datosModificados = this.libroObject; // Obtener los datos modificados del formulario
            console.log('Modificando libro...', datosModificados);

            // Actualizamos el libro con el método updateLibro de model
            this.libro = this.model.updateLibro(datosModificados);

            this.mensajesPresenter.mensaje('Libro modificado correctamente');
            console.log('Cambio exitoso, navegando...');
            await router.navigate('admin-home.html'); // Volvemos a la página de gestión de libros
        } catch (err) {
            console.error('Error en modificación:', err);
            this.mensajesPresenter.error(err.message);
            await this.mensajesPresenter.refresh();
        }
    }

    // Para prerellenar el formulario con los datos del libro
    pintar(libro) {
        if (!libro) return;
        this.isbnInput.value = libro.isbn ?? "";
        this.tituloInput.value = libro.titulo ?? "";
        this.autoresInput.value = libro.autores ?? "";
        this.resumenInput.value = libro.resumen ?? "";
        this.precioInput.value = libro.precio ?? 0;
        // Portada y stock solo si existen en el HTML
        if (this.portadaInput) this.portadaInput.value = libro.portada ?? "";
        if (this.stockInput) this.stockInput.value = libro.stock ?? 0;
    }

    async refresh() {
        await super.refresh(); // Ya carga los datos
        await this.mensajesPresenter.refresh();

        // Obtenemos el ID del libro desde la URL o desde algún parámetro
        // Asumiendo que el ID viene como parámetro en la URL (ej: ?id=1)
        const urlParams = new URLSearchParams(window.location.search);
        const id = Number(urlParams.get('id'));
        
        console.log('ID obtenido de URL:', id);
        console.log('Libros en el modelo:', this.model.libros);
        
        this.libro = this.model.getLibroPorId(id);
        
        if (!this.libro) {
            this.mensajesPresenter.error('Libro no encontrado');
            console.error('No se encontró el libro con ID:', id);
            return;
        }

        // Prerellenamos el formulario con los datos actuales
        console.log('Libro obtenido en refresh:', this.libro);
        this.pintar(this.libro); // Sin esto el formulario estaría vacío

        const button = this.parentElement?.querySelector('#guardarButton');
        if (button) {
            button.onclick = event => this.guardarClick(event);
        } else {
            console.error('Verifica que el HTML se haya cargado correctamente');
        }

        // Botón cancelar
        const cancelarBtn = this.parentElement?.querySelector('#cancelarButton');
        if (cancelarBtn) {
            cancelarBtn.onclick = async () => {
                await router.navigate('admin-home.html');
            };
        }
    }
}