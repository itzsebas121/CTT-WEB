/**
 * Verifica si el usuario está autenticado
 * @returns {boolean} True si está autenticado
 */
export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  const loginTime = localStorage.getItem('loginTime');
  
  if (!token || !loginTime) {
    return false;
  }
  
  // Verificar si han pasado 8 horas (8 * 60 * 60 * 1000 milisegundos)
  const eightHours = 8 * 60 * 60 * 1000;
  const currentTime = new Date().getTime();
  const timePassed = currentTime - parseInt(loginTime);
  
  if (timePassed >= eightHours) {
    // Token expirado, limpiar datos
    clearAuthData();
    return false;
  }
  
  return true;
};

/**
 * Obtiene el token del usuario
 * @returns {string|null} Token del usuario
 */
export const getToken = () => {
  return localStorage.getItem('token');
};

/**
 * Obtiene el usuario almacenado
 * @returns {object|null} Objeto usuario o null
 */
export const getUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

/**
 * Guarda el token y usuario en localStorage
 * @param {string} token - Token de autenticación
 * @param {object} user - Objeto usuario
 */
export const saveAuthData = (token, user) => {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
  localStorage.setItem('loginTime', new Date().getTime().toString());
  // Emitir evento personalizado para notificar cambios
  window.dispatchEvent(new Event('authChange'));
};

/**
 * Elimina los datos de autenticación
 */
export const clearAuthData = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('loginTime');
  // Emitir evento personalizado para notificar cambios
  window.dispatchEvent(new Event('authChange'));
};

/**
 * Obtiene el tiempo restante de la sesión en milisegundos
 * @returns {number} Tiempo restante en milisegundos, o 0 si expiró
 */
export const getSessionTimeRemaining = () => {
  const loginTime = localStorage.getItem('loginTime');
  
  if (!loginTime) {
    return 0;
  }
  
  const eightHours = 8 * 60 * 60 * 1000;
  const currentTime = new Date().getTime();
  const timePassed = currentTime - parseInt(loginTime);
  const timeRemaining = eightHours - timePassed;
  
  return timeRemaining > 0 ? timeRemaining : 0;
};

/**
 * Inicia un temporizador que ejecutará un callback cuando expire la sesión
 * @param {Function} onExpire - Función a ejecutar cuando expire la sesión
 * @returns {number|null} ID del timeout o null si no hay sesión activa
 */
export const startSessionExpirationTimer = (onExpire) => {
  const timeRemaining = getSessionTimeRemaining();
  
  if (timeRemaining <= 0) {
    return null;
  }
  
  return setTimeout(() => {
    clearAuthData();
    if (onExpire) {
      onExpire();
    }
  }, timeRemaining);
};
