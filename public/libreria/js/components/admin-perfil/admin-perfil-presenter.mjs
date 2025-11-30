import { Presenter } from "../../commons/presenter.mjs";
import { router } from "../../commons/router.mjs";
import { MensajesPresenter } from "../mensajes/mensajes-presenter.mjs";
import { libreriaSession } from "../../commons/libreria-session.mjs";

export class AdminPerfilPresenter extends Presenter {
    constructor(model, view) {
        super(model, view);
        this.mensajesPresenter = new MensajesPresenter(model, 'mensajes', '#mensajesContainer');
        this.usuario = null;
    }


    get guardarButton() {
        return document.querySelector('#guardarBtn');
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


    get usuarioObject() {
        return {
            _id: this.usuario._id,  //necesitamos el id del usuario para modificarlo
            dni: this.dniText,
            email: this.emailText,
            password: this.passwordText,
            rol: "ADMIN", //siempre sera admin
            nombre: this.nombreText,
            apellidos: this.apellidosText,
            direccion: this.direccionText
        };
    }

    async guardarClick(event) {
        event.preventDefault();
        try {

            const datosModificados = this.usuarioObject; // Obtener los datos modificados del formulario
            console.log('Modificando perfil...', datosModificados);

            //Actualizamos el usuario con el metodo updateUsario de model
            this.usuario = await this.model.updateUsuario(datosModificados);

            this.mensajesPresenter.mensaje('Usuario modificado correctamente');
            console.log('Cambio exitoso, navegando...');
            await router.navigate('/libreria/admin-home.html'); //Volvemos a la pagina de inicio del cliente
        } catch (err) {
            console.error('Error en modificacion:', err);
            this.mensajesPresenter.error(err.message);
            await this.mensajesPresenter.refresh();

        }
    }
    //Para prerellenar el formulario con los datos del usuario  
    pintar(u) {
        if (!u) return;
        this.dniInput.value = u.dni ?? "";
        this.nombreInput.value = u.nombre ?? "";
        this.apellidosInput.value = u.apellidos ?? "";
        this.direccionInput.value = u.direccion ?? "";
        this.emailInput.value = u.email ?? "";
        this.passwordInput.value = u.password ?? "";
    }

    async refresh() {
        await super.refresh(); //ya carga el usuario
        await this.mensajesPresenter.refresh();

        //Obtenemos usuario actual
        const id = libreriaSession.getUsuarioId();
        console.log('ID obtenido de session:', id);
        console.log('Usuarios en el modelo:', this.model.usuarios);
        this.usuario = await this.model.getAdminPorId(id);

        //Prerellenamos el formulario con los datos actuales
        console.log('Usuario obtenido en refresh:', this.usuario);
        this.pintar(this.usuario); 

        const button = this.parentElement?.querySelector('#guardarBtn');
        if (button) {
            button.onclick = event => this.guardarClick(event);

        } else {
            console.error('Verifica que el HTML se haya cargado correctamente');
        }
    }
}