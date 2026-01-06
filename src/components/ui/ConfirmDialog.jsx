import { ExclamationTriangleIcon, XMarkIcon } from '@heroicons/react/24/outline';

/**
 * Componente de diálogo de confirmación reutilizable
 * @param {boolean} isOpen - Controla si el diálogo está visible
 * @param {function} onClose - Función que se ejecuta al cancelar
 * @param {function} onConfirm - Función que se ejecuta al confirmar
 * @param {string} title - Título del diálogo
 * @param {string} message - Mensaje del diálogo
 * @param {string} confirmText - Texto del botón de confirmación (por defecto: "Confirmar")
 * @param {string} cancelText - Texto del botón de cancelar (por defecto: "Cancelar")
 * @param {string} type - Tipo de alerta: "warning", "danger", "info" (por defecto: "warning")
 * @param {boolean} loading - Si está en proceso de confirmación
 */
export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = "¿Estás seguro?",
  message = "Esta acción no se puede deshacer",
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  type = "warning",
  loading = false
}) {
  if (!isOpen) return null;

  // Configuración de colores según el tipo
  const typeConfig = {
    warning: {
      iconBg: 'bg-yellow-50',
      iconColor: 'text-yellow-600',
      buttonBg: 'bg-yellow-600 hover:bg-yellow-700',
    },
    danger: {
      iconBg: 'bg-red-50',
      iconColor: 'text-red-600',
      buttonBg: 'bg-red-600 hover:bg-red-700',
    },
    info: {
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-600',
      buttonBg: 'bg-blue-600 hover:bg-blue-700',
    },
  };

  const config = typeConfig[type] || typeConfig.warning;

  const handleConfirm = () => {
    if (!loading) {
      onConfirm();
    }
  };

  const handleCancel = () => {
    if (!loading) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 pointer-events-auto">
      {/* Backdrop */}
      <div 
        className="absolute inset-0  bg-opacity-50 transition-opacity"
        onClick={handleCancel}
      />
      
      {/* Modal */}
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full relative z-10 border border-gray-200 animate-fade-in pointer-events-auto">
        {/* Botón cerrar */}
        <button
          onClick={handleCancel}
          disabled={loading}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>

        <div className="p-6">
          {/* Icono */}
          <div className={`mx-auto flex items-center justify-center h-12 w-12 rounded-full ${config.iconBg} mb-4`}>
            <ExclamationTriangleIcon className={`h-6 w-6 ${config.iconColor}`} />
          </div>

          {/* Título */}
          <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
            {title}
          </h3>

          {/* Mensaje */}
          <p className="text-sm text-gray-600 text-center mb-6">
            {message}
          </p>

          {/* Botones */}
          <div className="flex gap-3">
            <button
              onClick={handleCancel}
              disabled={loading}
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {cancelText}
            </button>
            <button
              onClick={handleConfirm}
              disabled={loading}
              className={`flex-1 px-4 py-2.5 rounded-lg text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${config.buttonBg}`}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Procesando...
                </span>
              ) : (
                confirmText
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
