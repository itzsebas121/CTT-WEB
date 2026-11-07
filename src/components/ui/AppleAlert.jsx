import {
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline'

/**
 * Componente de Alerta modal con estilo Apple Human Interface Guidelines (HIG)
 * @param {boolean} isOpen - Estado de visualización
 * @param {function} onClose - Cierre de la alerta
 * @param {string} title - Título del diálogo
 * @param {string} message - Descripción concisa
 * @param {'success'|'error'|'warning'|'info'} type - Tipo semántico de la alerta
 * @param {string} actionText - Texto del botón de acción
 * @param {function} onAction - Callback al pulsar la acción principal
 */
export default function AppleAlert({
  isOpen,
  onClose,
  title,
  message,
  type = 'info',
  actionText = 'Aceptar',
  onAction
}) {
  if (!isOpen) return null

  const handleAction = () => {
    if (onAction) {
      onAction()
    } else {
      onClose()
    }
  }

  const icons = {
    success: {
      icon: CheckCircleIcon,
      bgColor: 'bg-emerald-500/15',
      iconColor: 'text-emerald-600',
      btnColor: 'bg-emerald-600 hover:bg-emerald-700',
    },
    error: {
      icon: XCircleIcon,
      bgColor: 'bg-red-500/15',
      iconColor: 'text-red-600',
      btnColor: 'bg-red-600 hover:bg-red-700',
    },
    warning: {
      icon: ExclamationTriangleIcon,
      bgColor: 'bg-amber-500/15',
      iconColor: 'text-amber-600',
      btnColor: 'bg-amber-600 hover:bg-amber-700',
    },
    info: {
      icon: InformationCircleIcon,
      bgColor: 'bg-primary/15',
      iconColor: 'text-primary',
      btnColor: 'bg-primary hover:bg-primary-hover',
    },
  }

  const config = icons[type] || icons.info
  const IconComponent = config.icon

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Apple Dimming Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Tarjeta de Alerta Apple (Liquid Glass HIG) */}
      <div
        role="alertdialog"
        aria-modal="true"
        className="relative w-full max-w-sm bg-white/95 backdrop-blur-2xl rounded-2xl p-6 shadow-2xl border border-white/60 text-center transition-all duration-200"
      >
        {/* Símbolo con halo de color suave */}
        <div className={`mx-auto w-14 h-14 rounded-full ${config.bgColor} flex items-center justify-center mb-4`}>
          <IconComponent className={`w-8 h-8 ${config.iconColor}`} />
        </div>

        {/* Título de la alerta */}
        <h3 className="text-lg font-bold tracking-tight text-slate-900 mb-2">
          {title}
        </h3>

        {/* Mensaje descriptivo */}
        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed mb-6">
          {message}
        </p>

        {/* Botón de acción principal */}
        <button
          type="button"
          onClick={handleAction}
          className={`w-full h-11 flex items-center justify-center font-semibold text-white ${config.btnColor} rounded-xl shadow-md transition-all duration-150 active:scale-[0.98] cursor-pointer text-sm border-0`}
        >
          {actionText}
        </button>
      </div>
    </div>
  )
}

