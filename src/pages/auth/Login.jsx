import { useState } from "react"
import { useLocation } from "react-router-dom"
import LoginLocal from "./typeLogin/LoginLocal"
import Login365 from "./typeLogin/Login365"
import fiseiImage from "../../assets/fisei.jpg"
import logoCtt from "../../assets/logoCTT.webp"
import { CheckCircleIcon, XMarkIcon } from "@heroicons/react/24/outline"

export default function Login() {
  const [loginType, setLoginType] = useState('local')
  const location = useLocation()
  const [showNotice, setShowNotice] = useState(Boolean(location.state?.registered))

  return (
    <div
      className="relative min-h-screen w-full flex items-center justify-center p-4 sm:p-6"
      style={{
        backgroundImage: `url(${fiseiImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Dimming overlay sobre la imagen de fondo para que la tarjeta destaque */}
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-[4px]"
        aria-hidden="true"
      />

      {/* Tarjeta de Login: fondo blanco puro y limpio sin bordes molestos */}
      <div className="relative w-full max-w-[420px] bg-white rounded-3xl shadow-2xl p-7 sm:p-8 transition-all duration-200">
        
        {/* Banner de Registro Exitoso si viene de registrarse */}
        {showNotice && (
          <div className="mb-4 flex items-center justify-between p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs">
            <div className="flex items-center gap-2">
              <CheckCircleIcon className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <span>¡Cuenta creada con éxito! Ingresa tus credenciales para continuar.</span>
            </div>
            <button
              type="button"
              onClick={() => setShowNotice(false)}
              className="text-emerald-500 hover:text-emerald-800 bg-transparent border-0 p-0.5 cursor-pointer ml-2"
              aria-label="Cerrar notificación"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Logo integrado: sin recuadro ni bordes, fundiéndose con el fondo */}
        <div className="text-center mb-5">
          <img
            alt="Logo CTT - Talleres Tecnológicos"
            src={logoCtt}
            className="h-16 w-auto object-contain mx-auto mix-blend-multiply"
          />
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-3">
            Iniciar Sesión
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Talleres Tecnológicos · FISEI UTA
          </p>
        </div>

        {/* Segmented Control limpio y de alto contraste */}
        <div
          role="tablist"
          aria-label="Tipo de acceso"
          className="flex p-1 rounded-xl bg-slate-100 border border-slate-200/80 mb-6 gap-1"
        >
          <button
            type="button"
            role="tab"
            aria-selected={loginType === 'local'}
            onClick={() => setLoginType('local')}
            className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all duration-200 cursor-pointer text-center border-0 ${
              loginType === 'local'
                ? 'bg-primary text-white shadow-sm'
                : 'bg-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            Cuenta Local
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={loginType === '365'}
            onClick={() => setLoginType('365')}
            className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all duration-200 cursor-pointer text-center border-0 ${
              loginType === '365'
                ? 'bg-primary text-white shadow-sm'
                : 'bg-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            Microsoft 365
          </button>
        </div>

        {/* Contenido de Login */}
        <div>
          {loginType === 'local' ? <LoginLocal /> : <Login365 />}
        </div>
      </div>
    </div>
  )
}
