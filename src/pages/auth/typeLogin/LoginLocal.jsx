import { useState } from "react"
import { loginComplete } from "../../../api/auth"
import { useNavigate, useLocation } from "react-router-dom"
import { saveAuthData } from "../../../utils/auth"
import {
  EnvelopeIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  ExclamationCircleIcon
} from "@heroicons/react/24/outline"

export default function LoginLocal() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const navigate = useNavigate()
  const location = useLocation()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErrorMessage('')

    try {
      const { token, user } = await loginComplete(email, password)
      saveAuthData(token, user)

      const pendingEnrollment = localStorage.getItem('pendingEnrollment')
      if (pendingEnrollment) {
        const { courseId, returnPath } = JSON.parse(pendingEnrollment)
        let targetPath = returnPath
        if (returnPath.startsWith('/course/')) {
          targetPath = returnPath.replace('/course/', '/dashboard/curso/')
        }
        navigate(targetPath, {
          state: { enrollCourseId: parseInt(courseId) },
          replace: true
        })
      } else {
        const from = location.state?.from?.pathname || '/dashboard'
        navigate(from, { replace: true })
      }
    } catch (error) {
      setErrorMessage(error.message || 'Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Campo de Correo */}
      <div>
        <label
          htmlFor="email"
          className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
        >
          Correo electrónico
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <EnvelopeIcon className="w-5 h-5" />
          </div>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="ejemplo@correo.com"
            required
            className="block w-full pl-10 pr-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 bg-slate-50 border border-slate-200 rounded-xl transition-all duration-150 outline-none focus:bg-white focus:border-primary focus:ring-3 focus:ring-primary/10"
          />
        </div>
      </div>

      {/* Campo de Contraseña */}
      <div>
        <label
          htmlFor="password"
          className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
        >
          Contraseña
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <LockClosedIcon className="w-5 h-5" />
          </div>
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            className="block w-full pl-10 pr-11 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 bg-slate-50 border border-slate-200 rounded-xl transition-all duration-150 outline-none focus:bg-white focus:border-primary focus:ring-3 focus:ring-primary/10"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 rounded-md transition-colors cursor-pointer flex items-center justify-center focus:outline-none"
            style={{ backgroundColor: 'transparent', border: 'none' }}
            tabIndex={-1}
            aria-label={showPassword ? "Ocultar contraseña" : "Ver contraseña"}
          >
            {showPassword ? (
              <EyeSlashIcon className="w-5 h-5" />
            ) : (
              <EyeIcon className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mensaje de Error */}
      {errorMessage && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs">
          <ExclamationCircleIcon className="h-4 w-4 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Botón Principal de Iniciar Sesión */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={loading}
          className="w-full h-11 flex items-center justify-center font-semibold text-white bg-primary hover:bg-primary-hover rounded-xl shadow-md hover:shadow-lg transition-all duration-150 active:scale-[0.98] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed text-sm border-0"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Iniciando sesión...</span>
            </div>
          ) : (
            'Iniciar sesión'
          )}
        </button>
      </div>

      {/* Enlace Secundario Limpio */}
      <div className="pt-4 mt-2 border-t border-slate-100 text-center">
        <p className="text-xs sm:text-sm text-slate-600">
          ¿Aún no tienes una cuenta?{' '}
          <button
            type="button"
            onClick={() => navigate('/register')}
            className="font-bold text-secondary hover:text-secondary-hover underline cursor-pointer bg-transparent border-0 p-0 shadow-none ml-1 inline"
            style={{ backgroundColor: 'transparent', border: 'none', padding: 0 }}
          >
            Regístrate aquí
          </button>
        </p>
      </div>
    </form>
  )
}
