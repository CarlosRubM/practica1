import { Presenter } from "../../commons/presenter.mjs";
import { router } from "../../commons/router.mjs";
import { MensajesPresenter } from "../mensajes/mensajes-presenter.mjs";

export class InvitadoRegistroPresenter extends Presenter {
  constructor(model, view) {
    super(model, view);
    this.mensajesPresenter = new MensajesPresenter(model, 'mensajes', '#mensajesContainer');
  }


  get registroButton() {
    return document.querySelector('#registroBtn');
  }


  get dniInput() {
    return document.querySelector('#dni');
  }

  get dniText() {
    return this.dniInput.value;
  }


  get nombreInput() {
    return document.querySelector('#nombre');
  }

  get nombreText() {
    return this.nombreInput.value;
  }


  get apellidosInput() {
    return document.querySelector('#apellidos');
  }

  get apellidosText() {
    return this.apellidosInput.value;
  }

  get direccionInput() {
    return document.querySelector('#direccion');
  }

  get direccionText() {
    return this.direccionInput.value
  }

  get emailInput() {
    return document.querySelector('#email');
  }

  get emailText() {
    return this.emailInput.value
  }

  get passwordInput() {
    return document.querySelector('#password');
  }

  get passwordText() {
    return this.passwordInput.value;
  }

  get rolSelect() {
    return document.querySelector('#rol');
  }

  get rolText() {
    return this.rolSelect.value;
  }

  get usuarioObject() {
    return {
      dni: this.dniText,
      email: this.emailText,
      password: this.passwordText,
      rol: this.rolText,
      nombre: this.nombreText,
      apellidos: this.apellidosText,
      direccion: this.direccionText
    };
  }

  async registroClick(event) {
    event.preventDefault();
    try {
      console.log('Iniciando registro...', this.usuarioObject);
      await this.model.addUsuario(this.usuarioObject); //hay que cambiar registrar porque ese metodo no existe
      this.mensajesPresenter.mensaje('Usuario agregado');
      console.log('Registro exitoso, navegando...');
      await router.navigate('/libreria/index.html');
    } catch (err) {
      console.error('Error en registro:', err);
      this.mensajesPresenter.error(err.message);
      await this.mensajesPresenter.refresh();

    }
  }

  async refresh() {
    await super.refresh();
    await this.mensajesPresenter.refresh();
    // Buscar el botón dentro del parent element
    const button = this.parentElement?.querySelector('#registroBtn');
    
    if (button) {
      button.onclick = event => this.registroClick(event);

    } else {
      console.error('Verifica que el HTML se haya cargado correctamente');
    }
  }
}