import { libreriaSession } from "../../commons/libreria-session.mjs";
import { Presenter } from "../../commons/presenter.mjs";
import { router } from "../../commons/router.mjs";

export class AdminAgregarLibroPresenter extends Presenter {
  constructor(model, view) {
    super(model, view);
  }

  // Accesores de elementos (IDs del HTML)
  get formEl() { return document.querySelector("#agregarLibroForm"); }
  get guardarBtn() { return document.querySelector("#guardarButton"); }
  get cancelarBtn() { return document.querySelector("#cancelarButton"); }

  get tituloInput() { return document.querySelector("#tituloInput"); }
  get autoresInput() { return document.querySelector("#autoresInput"); }
  get isbnInput() { return document.querySelector("#isbnInput"); }
  get precioInput() { return document.querySelector("#precioInput"); }
  get descripcionInput() { return document.querySelector("#descripcionInput"); }

  // Construye el objeto libro desde el formulario
  get libroFormData() {
    const titulo = this.tituloInput.value.trim();
    const autores = this.autoresInput.value.trim();
    const isbn = this.isbnInput.value.trim();
    const precio = parseFloat(this.precioInput.value);
    const descripcion = this.descripcionInput.value.trim();
   
    return { titulo, autores, isbn, precio, descripcion };
  }

  // Validación del formulario
  validarLibro(libro) {
    const errores = [];

    if (!libro.titulo) errores.push("Título es obligatorio");
    if (!libro.autores?.length) errores.push("Autores es obligatorio");
    if (!libro.isbn) errores.push("ISBN es obligatorio");
    if (!(typeof libro.precio === "number") || isNaN(libro.precio) || libro.precio < 0)
      errores.push("Precio debe ser mayor o igual a 0");
    if (!libro.descripcion) errores.push("Descripción es obligatoria");

    return errores;
  }

  async onGuardar(event) {
    event.preventDefault();

    try {
    
      if (!libreriaSession.esAdmin()) {
        throw new Error("Acceso denegado");
      }

      const libro = this.libroFormData;
      const errores = this.validarLibro(libro);
      if (errores.length > 0) {
        libreriaSession.emitMessage?.({
          text: errores.join(" "),
          type: "error"
        });
        return;
      }

      // Guardado en el modelo
      const nuevo = await this.model.addLibro(libro);

      // Mensaje y redirección
      libreriaSession.emitMessage?.({
        text: `Libro "${nuevo.titulo}" agregado correctamente.`,
        type: "success"
      });

      // Redirige a listado o home admin (ajusta la ruta según la que tengas)
      router.navigate("/libreria/admin-home.html");

    } catch (error) {
      libreriaSession.emitMessage?.({
        text: `Error al guardar libro: ${error.message}`,
        type: "error"
      });
      console.error(error);
    }
  }

  async onCancelar() {
    router.navigate("/libreria/admin-home.html");
  }

  async refresh() {
    await super.refresh();
    // Enlaza eventos tras render
    this.formEl?.addEventListener("submit", this.onGuardar.bind(this));
    this.cancelarBtn?.addEventListener("click", this.onCancelar.bind(this));
  }
}