import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { startSessionExpirationTimer, clearAuthData, isAuthenticated } from '../utils/auth';

/**
 * Hook personalizado para manejar la expiración automática de la sesión
 * Redirige al login cuando la sesión expira después de 8 horas
 */
export const useSessionExpiration = () => {
  const navigate = useNavigate();
  const timerIdRef = useRef(null);

  useEffect(() => {
    // Función que se ejecuta cuando expira la sesión
    const handleSessionExpiration = () => {
      // Limpiar el temporizador primero para evitar conflictos
      if (timerIdRef.current) {
        clearTimeout(timerIdRef.current);
        timerIdRef.current = null;
      }
      
      clearAuthData();
      // Mostrar mensaje al usuario
      alert('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
      // Redirigir al login
      navigate('/login', { replace: true });
    };

    // Función para iniciar el temporizador
    const startTimer = () => {
      // Limpiar temporizador anterior si existe
      if (timerIdRef.current) {
        clearTimeout(timerIdRef.current);
        timerIdRef.current = null;
      }

      // Solo iniciar si hay una sesión activa
      if (isAuthenticated()) {
        const timerId = startSessionExpirationTimer(handleSessionExpiration);
        timerIdRef.current = timerId;
      }
    };

    // Manejar cambios en la autenticación
    const handleAuthChange = () => {
      // Si no hay autenticación, limpiar el temporizador
      if (!isAuthenticated()) {
        if (timerIdRef.current) {
          clearTimeout(timerIdRef.current);
          timerIdRef.current = null;
        }
      } else if (!timerIdRef.current) {
        // Si hay autenticación y no hay temporizador, iniciarlo
        startTimer();
      }
    };

    // Iniciar el temporizador solo si hay sesión
    startTimer();

    // Escuchar cambios de autenticación
    window.addEventListener('authChange', handleAuthChange);

    // Limpiar el temporizador y el listener cuando el componente se desmonte
    return () => {
      if (timerIdRef.current) {
        clearTimeout(timerIdRef.current);
        timerIdRef.current = null;
      }
      window.removeEventListener('authChange', handleAuthChange);
    };
  }, [navigate]);
};
