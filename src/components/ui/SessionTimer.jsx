import { useState, useEffect } from 'react';
import { getSessionTimeRemaining } from '../../utils/auth';

/**
 * Componente opcional para mostrar el tiempo restante de sesión
 * Útil para debugging y para que el usuario sepa cuánto tiempo le queda
 */
export default function SessionTimer() {
  const [timeRemaining, setTimeRemaining] = useState(0);

  useEffect(() => {
    // Actualizar el tiempo restante cada minuto
    const updateTimer = () => {
      const remaining = getSessionTimeRemaining();
      setTimeRemaining(remaining);
    };

    updateTimer(); // Actualización inicial
    const interval = setInterval(updateTimer, 60000); // Actualizar cada minuto

    return () => clearInterval(interval);
  }, []);

  const formatTime = (milliseconds) => {
    if (milliseconds <= 0) return 'Sesión expirada';
    
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="text-xs text-gray-400">
      Sesión válida por: {formatTime(timeRemaining)}
    </div>
  );
}
