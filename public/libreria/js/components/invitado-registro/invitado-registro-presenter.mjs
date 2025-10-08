import { Presenter } from "../../commons/presenter.mjs";

export class InvitadoRegistroPresenter extends Presenter {
  constructor(model, view) {
    super(model, view);
    this.bindEvents();
  }

  bindEvents() {
    // Esperar a que el DOM esté cargado
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        this.setupEventListeners();
      });
    } else {
      this.setupEventListeners();
    }
  }

  setupEventListeners() {
    const form = document.getElementById('registroForm');
    
    if (form) {
      form.addEventListener('submit', (e) => this.handleRegistro(e));
    }
  }

  async handleRegistro(event) {
    event.preventDefault();
    
    try {
      // Obtener datos del formulario
      const formData = this.getFormData();
      
      // Validar datos
      if (!this.validateForm(formData)) {
        return;
      }

      // Intentar registrar usuario usando el modelo existente
      const nuevoUsuario = this.model.addUsuario(formData);
      
      if (nuevoUsuario) {
        this.mostrarMensaje('Usuario registrado exitosamente', 'success');
        
        // Opcional: limpiar formulario
        this.limpiarFormulario();
        
        // Opcional: redirigir al ingreso después de un tiempo
        setTimeout(() => {
          window.location.href = 'invitado-ingreso-presenter.html';
        }, 2000);
        
      } else {
        this.mostrarMensaje('Error al registrar usuario', 'error');
      }
      
    } catch (error) {
      console.error('Error en registro:', error);
      
      // Manejar errores específicos del modelo
      if (error.message === 'Correo electrónico registrado') {
        this.mostrarMensaje('El email ya está registrado', 'error');
      } else if (error.message === 'Rol desconocido') {
        this.mostrarMensaje('Rol no válido', 'error');
      } else {
        this.mostrarMensaje(error.message || 'Error interno del sistema', 'error');
      }
    }
  }

  getFormData() {
    return {
      nombre: document.getElementById('nombre').value.trim(),
      apellidos: document.getElementById('apellidos').value.trim(),
      direccion: document.getElementById('direccion').value.trim(),
      email: document.getElementById('email').value.trim(),
      password: document.getElementById('password').value,
      rol: document.getElementById('rol').value
    };
  }

  validateForm(data) {
    // Validaciones básicas
    if (!data.nombre) {
      this.mostrarMensaje('El nombre es obligatorio', 'error');
      return false;
    }

    if (!data.apellidos) {
      this.mostrarMensaje('Los apellidos son obligatorios', 'error');
      return false;
    }

    if (!data.direccion) {
      this.mostrarMensaje('La dirección es obligatoria', 'error');
      return false;
    }

    if (!data.email || !this.isValidEmail(data.email)) {
      this.mostrarMensaje('El email no es válido', 'error');
      return false;
    }

    if (!data.password || data.password.length < 6) {
      this.mostrarMensaje('La contraseña debe tener al menos 6 caracteres', 'error');
      return false;
    }

    if (!data.rol || (data.rol !== 'CLIENTE' && data.rol !== 'ADMIN')) {
      this.mostrarMensaje('Debe seleccionar un rol válido', 'error');
      return false;
    }

    return true;
  }

  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  limpiarFormulario() {
    document.getElementById('registroForm').reset();
    // Restaurar valor por defecto del select
    document.getElementById('rol').value = 'CLIENTE';
  }

  mostrarMensaje(mensaje, tipo) {
    const container = document.getElementById('mensajesContainer');
    if (container) {
      container.innerHTML = `
        <div class="mensaje ${tipo}">
          ${mensaje}
        </div>
      `;

      // Auto-ocultar después de 5 segundos
      setTimeout(() => {
        container.innerHTML = '';
      }, 5000);
    }
  }

  async refresh() {
    await super.refresh();
    // Configurar eventos si no se han configurado ya
    this.bindEvents();
  }
}
