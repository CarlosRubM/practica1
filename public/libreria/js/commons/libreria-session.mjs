export class LibreriaSession {
  // Claves para sessionStorage
  static KEYS = {
    USER_ID: 'libreria_user_id',
    USER_ROL: 'libreria_user_rol',
    USER_DATA: 'libreria_user_data',
    MESSAGE: 'libreria_message'
  };

  // ============================================
  // GESTIÓN DE SESIÓN DE USUARIO
  // ============================================

  /**
   * Guarda la sesión del usuario
   * @param {Object} usuario - Objeto con datos del usuario (Cliente o Administrador)
   */
  static setUser(usuario) {
    if (!usuario) {
      this.clearUser();
      return;
    }

    // Guardar ID (_id del modelo), rol y datos completos
    sessionStorage.setItem(this.KEYS.USER_ID, usuario._id);
    sessionStorage.setItem(this.KEYS.USER_ROL, usuario.rol);
    
    // Guardar una copia simplificada sin el carro (evitar datos grandes)
    const userData = {
      _id: usuario._id,
      dni: usuario.dni,
      nombre: usuario.nombre,
      apellidos: usuario.apellidos,
      direccion: usuario.direccion,
      email: usuario.email,
      rol: usuario.rol
    };
    
    sessionStorage.setItem(this.KEYS.USER_DATA, JSON.stringify(userData));
  }

  /**
   * Obtiene el ID del usuario actual
   * @returns {string|null}
   */
  static getUserId() {
    return sessionStorage.getItem(this.KEYS.USER_ID);
  }

  /**
   * Obtiene el rol del usuario actual
   * @returns {string|null}
   */
  static getUserRol() {
    return sessionStorage.getItem(this.KEYS.USER_ROL);
  }

  /**
   * Obtiene todos los datos del usuario
   * @returns {Object|null}
   */
  static getUser() {
    const userData = sessionStorage.getItem(this.KEYS.USER_DATA);
    return userData ? JSON.parse(userData) : null;
  }

  /**
   * Verifica si hay un usuario logueado
   * @returns {boolean}
   */
  static isLoggedIn() {
    return this.getUserId() !== null;
  }

  /**
   * Verifica si el usuario es administrador
   * @returns {boolean}
   */
  static isAdmin() {
    return this.getUserRol() === 'ADMIN';
  }

  /**
   * Verifica si el usuario es cliente
   * @returns {boolean}
   */
  static isCliente() {
    return this.getUserRol() === 'CLIENTE';
  }

  /**
   * Elimina la sesión del usuario (logout)
   */
  static clearUser() {
    sessionStorage.removeItem(this.KEYS.USER_ID);
    sessionStorage.removeItem(this.KEYS.USER_ROL);
    sessionStorage.removeItem(this.KEYS.USER_DATA);
  }

  // ============================================
  // GESTIÓN DE MENSAJES DEL SISTEMA
  // ============================================

  /**
   * Guarda un mensaje en la sesión para mostrarlo en la siguiente página
   * @param {string} texto - Texto del mensaje
   * @param {string} tipo - Tipo de mensaje: 'success', 'error', 'warning', 'info'
   */
  static setMessage(texto, tipo = 'info') {
    const mensaje = {
      texto: texto,
      tipo: tipo,
      timestamp: Date.now()
    };
    sessionStorage.setItem(this.KEYS.MESSAGE, JSON.stringify(mensaje));
  }

  /**
   * Recupera el mensaje guardado (si existe)
   * @returns {Object|null} - {texto, tipo, timestamp} o null
   */
  static getMessage() {
    const messageData = sessionStorage.getItem(this.KEYS.MESSAGE);
    return messageData ? JSON.parse(messageData) : null;
  }

  /**
   * Elimina el mensaje de la sesión
   */
  static clearMessage() {
    sessionStorage.removeItem(this.KEYS.MESSAGE);
  }

  /**
   * Guarda un mensaje de éxito
   * @param {string} texto
   */
  static setSuccessMessage(texto) {
    this.setMessage(texto, 'success');
  }

  /**
   * Guarda un mensaje de error
   * @param {string} texto
   */
  static setErrorMessage(texto) {
    this.setMessage(texto, 'error');
  }

  /**
   * Guarda un mensaje de advertencia
   * @param {string} texto
   */
  static setWarningMessage(texto) {
    this.setMessage(texto, 'warning');
  }

  /**
   * Guarda un mensaje informativo
   * @param {string} texto
   */
  static setInfoMessage(texto) {
    this.setMessage(texto, 'info');
  }

  // ============================================
  // UTILIDADES
  // ============================================

  /**
   * Limpia toda la sesión (usuario y mensajes)
   */
  static clearAll() {
    this.clearUser();
    this.clearMessage();
  }
}