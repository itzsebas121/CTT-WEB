import { InformationCircleIcon } from "@heroicons/react/24/outline"

export default function Login365() {
  const handleSubmit = () => {
    alert('Próximamente: Inicio de sesión con cuenta institucional Microsoft 365')
  }

  return (
    <div className="py-2 flex flex-col items-center text-center">
      <div className="mb-4">
        <h3 className="text-sm font-bold text-slate-800">
          Cuenta Institucional UTA
        </h3>
        <p className="text-xs text-slate-500 mt-1 max-w-[280px]">
          Ingresa con tu correo universitario (@uta.edu.ec) mediante el portal de Microsoft 365.
        </p>
      </div>

      <button
        type="button"
        onClick={handleSubmit}
        className="w-full h-12 flex items-center justify-center gap-3 px-4 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl shadow-sm hover:shadow transition-all duration-150 active:scale-[0.98] cursor-pointer text-sm font-semibold text-slate-700"
        style={{ color: '#1e293b' }}
      >
        <img
          src="/logo365.webp"
          alt="Microsoft 365"
          className="w-5 h-5 object-contain"
          onError={(e) => {
            e.currentTarget.style.display = 'none'
          }}
        />
        <span>Continuar con Microsoft 365</span>
      </button>

      <div className="mt-4 flex items-center gap-1.5 text-xs text-slate-400 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
        <InformationCircleIcon className="w-4 h-4 text-primary flex-shrink-0" />
        <span>Disponible para estudiantes y docentes UTA</span>
      </div>
    </div>
  )
}
