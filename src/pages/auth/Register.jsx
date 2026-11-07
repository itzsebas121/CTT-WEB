import { useState } from "react"
import { register } from "../../api/auth"
import { useNavigate } from "react-router-dom"
import fiseiImage from "../../assets/fisei.jpg"
import logoCtt from "../../assets/logoCTT.webp"
import AppleAlert from "../../components/ui/AppleAlert"
import {
  IdentificationIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  AcademicCapIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  CheckIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  ExclamationCircleIcon
} from "@heroicons/react/24/outline"

export default function Register() {
  const [currentStep, setCurrentStep] = useState(1)
  const [identification, setIdentification] = useState("")
  const [firstName, setFirstName] = useState("")
  const [secondName, setSecondName] = useState("")
  const [firstLastName, setFirstLastName] = useState("")
  const [secondLastName, setSecondLastName] = useState("")
  const [cellPrefix, setCellPrefix] = useState("+593")
  const [cellphone, setCellphone] = useState("")
  const [email, setEmail] = useState("")
  const [address, setAddress] = useState("")
  const [type, setType] = useState("Estudiante")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [alertConfig, setAlertConfig] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
    actionText: "Aceptar",
    onAction: null,
  })
  const navigate = useNavigate()

  const validateStep1 = () => {
    if (!/^\d{1,10}$/.test(identification)) {
      return 'La cédula es requerida y debe contener hasta 10 dígitos numéricos.'
    }
    if (!firstName.trim() || firstName.length > 100) {
      return 'El nombre es requerido (máximo 100 caracteres).'
    }
    if (secondName && secondName.length > 100) {
      return 'El segundo nombre no puede superar 100 caracteres.'
    }
    if (!firstLastName.trim() || firstLastName.length > 100) {
      return 'El primer apellido es requerido (máximo 100 caracteres).'
    }
    if (secondLastName && secondLastName.length > 100) {
      return 'El segundo apellido no puede superar 100 caracteres.'
    }
    return null
  }

  const validateStep2 = () => {
    if (!/^\d{9}$/.test(cellphone)) {
      return 'Número celular requerido (9 dígitos sin el 0 inicial, ej: 991234567).'
    }
    if (!email) return 'Correo electrónico requerido.'
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) return 'Formato de correo electrónico inválido.'
    if (!address.trim() || address.length > 200) {
      return 'Dirección requerida (máximo 200 caracteres).'
    }
    return null
  }

  const validateStep3 = () => {
    if (!['Estudiante', 'Externo', 'Administrativo'].includes(type)) {
      return 'Tipo de usuario inválido.'
    }
    if (!password || password.length < 6) {
      return 'La contraseña debe tener al menos 6 caracteres.'
    }
    if (password.length > 255) {
      return 'La contraseña no puede superar 255 caracteres.'
    }
    return null
  }

  const handleNext = (e) => {
    e.preventDefault()
    setErrorMessage('')
    let err = null
    if (currentStep === 1) err = validateStep1()
    else if (currentStep === 2) err = validateStep2()

    if (err) {
      setErrorMessage(err)
      return
    }
    setCurrentStep(currentStep + 1)
  }

  const handleBack = (e) => {
    e.preventDefault()
    setErrorMessage('')
    setCurrentStep(currentStep - 1)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMessage('')

    const err = validateStep3()
    if (err) {
      setErrorMessage(err)
      return
    }

    setLoading(true)
    try {
      const fullCell = `${cellPrefix}${cellphone}`
      const response = await register(
        identification,
        firstName.trim(),
        secondName ? secondName.trim() : null,
        firstLastName.trim(),
        secondLastName ? secondLastName.trim() : null,
        fullCell,
        email.trim(),
        address.trim(),
        type,
        password
      )

      if (response.message === 'Platform user registered successfully' || response.id) {
        setAlertConfig({
          isOpen: true,
          title: "¡Cuenta Creada con Éxito!",
          message: "Tu cuenta en la plataforma CTT ha sido registrada correctamente. Ya puedes iniciar sesión con tus credenciales.",
          type: "success",
          actionText: "Iniciar Sesión",
          onAction: () => navigate('/login', { state: { registered: true } }),
        })
      }
    } catch (error) {
      const msg = error.message || 'No se pudo completar el registro. Verifica los datos e intenta nuevamente.'
      setErrorMessage(msg)
      setAlertConfig({
        isOpen: true,
        title: "Error al Registrarse",
        message: msg,
        type: "error",
        actionText: "Revisar datos",
        onAction: () => setAlertConfig(prev => ({ ...prev, isOpen: false })),
      })
    } finally {
      setLoading(false)
    }
  }

  const steps = [
    { id: 1, name: "Datos Personales" },
    { id: 2, name: "Contacto" },
    { id: 3, name: "Cuenta" }
  ]

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
      {/* Alerta Modal Apple HIG */}
      <AppleAlert
        isOpen={alertConfig.isOpen}
        onClose={() => setAlertConfig(prev => ({ ...prev, isOpen: false }))}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        actionText={alertConfig.actionText}
        onAction={alertConfig.onAction}
      />

      {/* Dimming overlay de fondo */}
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-[4px]"
        aria-hidden="true"
      />

      {/* Tarjeta de Registro Apple HIG */}
      <div className="relative w-full max-w-[560px] bg-white rounded-3xl shadow-2xl p-7 sm:p-9 transition-all duration-200">
        
        {/* Logo integrado: sin bordes ni recuadros */}
        <div className="text-center mb-5">
          <img
            alt="Logo CTT - Talleres Tecnológicos"
            src={logoCtt}
            className="h-14 w-auto object-contain mx-auto mix-blend-multiply"
          />
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-2">
            Crear Cuenta
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Plataforma CTT · Talleres Tecnológicos FISEI UTA
          </p>
        </div>

        {/* Stepper / Indicador de Pasos estilo Apple */}
        <div className="mb-6">
          <div className="grid grid-cols-3 gap-2">
            {steps.map((step) => {
              const isCompleted = currentStep > step.id
              const isCurrent = currentStep === step.id
              return (
                <div key={step.id} className="flex flex-col items-center">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-200 ${
                      isCompleted
                        ? "bg-emerald-600 text-white"
                        : isCurrent
                        ? "bg-primary text-white shadow-sm ring-4 ring-primary/15"
                        : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    {isCompleted ? (
                      <CheckIcon className="w-4 h-4 stroke-[3]" />
                    ) : (
                      step.id
                    )}
                  </div>
                  <span
                    className={`text-[11px] font-semibold mt-1.5 transition-colors ${
                      isCurrent
                        ? "text-primary"
                        : isCompleted
                        ? "text-slate-700"
                        : "text-slate-400"
                    }`}
                  >
                    {step.name}
                  </span>
                </div>
              )
            })}
          </div>

          {/* Barra de progreso animada */}
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3 overflow-hidden">
            <div
              className="bg-primary h-1.5 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${(currentStep / 3) * 100}%` }}
            />
          </div>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* PASO 1: Datos Personales */}
          {currentStep === 1 && (
            <div className="space-y-3.5">
              {/* Cédula */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Cédula o Identificación *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <IdentificationIcon className="w-5 h-5" />
                  </div>
                  <input
                    value={identification}
                    onChange={(e) => setIdentification(e.target.value.replace(/\D/g, ''))}
                    required
                    maxLength={10}
                    placeholder="Ej: 1801234567 (hasta 10 dígitos)"
                    className="block w-full pl-10 pr-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 bg-slate-50 border border-slate-200 rounded-xl transition-all duration-150 outline-none focus:bg-white focus:border-primary focus:ring-3 focus:ring-primary/10"
                  />
                </div>
              </div>

              {/* Nombres (2 columnas) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Primer Nombre *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <UserIcon className="w-5 h-5" />
                    </div>
                    <input
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                      maxLength={100}
                      placeholder="Juan"
                      className="block w-full pl-10 pr-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 bg-slate-50 border border-slate-200 rounded-xl transition-all duration-150 outline-none focus:bg-white focus:border-primary focus:ring-3 focus:ring-primary/10"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Segundo Nombre
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <UserIcon className="w-5 h-5" />
                    </div>
                    <input
                      value={secondName}
                      onChange={(e) => setSecondName(e.target.value)}
                      maxLength={100}
                      placeholder="Carlos (opcional)"
                      className="block w-full pl-10 pr-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 bg-slate-50 border border-slate-200 rounded-xl transition-all duration-150 outline-none focus:bg-white focus:border-primary focus:ring-3 focus:ring-primary/10"
                    />
                  </div>
                </div>
              </div>

              {/* Apellidos (2 columnas) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Primer Apellido *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <UserIcon className="w-5 h-5" />
                    </div>
                    <input
                      value={firstLastName}
                      onChange={(e) => setFirstLastName(e.target.value)}
                      required
                      maxLength={100}
                      placeholder="Pérez"
                      className="block w-full pl-10 pr-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 bg-slate-50 border border-slate-200 rounded-xl transition-all duration-150 outline-none focus:bg-white focus:border-primary focus:ring-3 focus:ring-primary/10"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Segundo Apellido
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <UserIcon className="w-5 h-5" />
                    </div>
                    <input
                      value={secondLastName}
                      onChange={(e) => setSecondLastName(e.target.value)}
                      maxLength={100}
                      placeholder="López (opcional)"
                      className="block w-full pl-10 pr-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 bg-slate-50 border border-slate-200 rounded-xl transition-all duration-150 outline-none focus:bg-white focus:border-primary focus:ring-3 focus:ring-primary/10"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PASO 2: Datos de Contacto */}
          {currentStep === 2 && (
            <div className="space-y-3.5">
              {/* Celular con Prefijo */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Número de Celular *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-1">
                    <select
                      value={cellPrefix}
                      onChange={(e) => setCellPrefix(e.target.value)}
                      className="block w-full py-2.5 px-3 text-sm text-slate-800 bg-slate-50 border border-slate-200 rounded-xl transition-all duration-150 outline-none focus:bg-white focus:border-primary focus:ring-3 focus:ring-primary/10 font-medium"
                    >
                      <option value="+593">🇪🇨 +593</option>
                      <option value="+54">🇦🇷 +54</option>
                      <option value="+1">🇺🇸 +1</option>
                      <option value="+34">🇪🇸 +34</option>
                      <option value="+57">🇨🇴 +57</option>
                      <option value="+51">🇵🇪 +51</option>
                    </select>
                  </div>
                  <div className="col-span-2 relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <PhoneIcon className="w-5 h-5" />
                    </div>
                    <input
                      value={cellphone}
                      onChange={(e) => setCellphone(e.target.value.replace(/\D/g, ''))}
                      required
                      maxLength={9}
                      placeholder="991234567"
                      className="block w-full pl-10 pr-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 bg-slate-50 border border-slate-200 rounded-xl transition-all duration-150 outline-none focus:bg-white focus:border-primary focus:ring-3 focus:ring-primary/10"
                    />
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">9 dígitos sin el 0 inicial</p>
              </div>

              {/* Correo Electrónico */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Correo Electrónico *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <EnvelopeIcon className="w-5 h-5" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="usuario@ejemplo.com"
                    className="block w-full pl-10 pr-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 bg-slate-50 border border-slate-200 rounded-xl transition-all duration-150 outline-none focus:bg-white focus:border-primary focus:ring-3 focus:ring-primary/10"
                  />
                </div>
              </div>

              {/* Dirección */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Dirección de Residencia *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <MapPinIcon className="w-5 h-5" />
                  </div>
                  <input
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                    maxLength={200}
                    placeholder="Av. Los Chasquis y Río Guayllabamba"
                    className="block w-full pl-10 pr-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 bg-slate-50 border border-slate-200 rounded-xl transition-all duration-150 outline-none focus:bg-white focus:border-primary focus:ring-3 focus:ring-primary/10"
                  />
                </div>
              </div>
            </div>
          )}

          {/* PASO 3: Datos de Cuenta */}
          {currentStep === 3 && (
            <div className="space-y-3.5">
              {/* Tipo de Usuario */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Tipo de Participante *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <AcademicCapIcon className="w-5 h-5" />
                  </div>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="block w-full pl-10 pr-3.5 py-2.5 text-sm text-slate-800 bg-slate-50 border border-slate-200 rounded-xl transition-all duration-150 outline-none focus:bg-white focus:border-primary focus:ring-3 focus:ring-primary/10 font-medium"
                  >
                    <option value="Estudiante">Estudiante</option>
                    <option value="Externo">Público Externo / Profesional</option>
                    <option value="Administrativo">Personal Administrativo</option>
                  </select>
                </div>
              </div>

              {/* Contraseña con Toggle de Ojo Centrado */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Contraseña *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <LockClosedIcon className="w-5 h-5" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    maxLength={255}
                    placeholder="Crea una contraseña segura (mín. 6 caracteres)"
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
                <p className="text-[11px] text-slate-400 mt-1">Mínimo 6 caracteres</p>
              </div>
            </div>
          )}

          {/* Error Callout en el formulario */}
          {errorMessage && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs">
              <ExclamationCircleIcon className="h-4 w-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Botones de Navegación del Wizard */}
          <div className="flex items-center gap-3 pt-3">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={handleBack}
                disabled={loading}
                className="flex-1 h-11 flex items-center justify-center gap-2 font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all duration-150 active:scale-[0.98] cursor-pointer text-sm border-0"
              >
                <ArrowLeftIcon className="w-4 h-4" />
                <span>Anterior</span>
              </button>
            )}

            {currentStep < 3 ? (
              <button
                type="button"
                onClick={handleNext}
                disabled={loading}
                className="flex-1 h-11 flex items-center justify-center gap-2 font-semibold text-white bg-primary hover:bg-primary-hover rounded-xl shadow-md hover:shadow transition-all duration-150 active:scale-[0.98] cursor-pointer text-sm border-0"
              >
                <span>Siguiente</span>
                <ArrowRightIcon className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="flex-1 h-11 flex items-center justify-center font-semibold text-white bg-primary hover:bg-primary-hover rounded-xl shadow-md hover:shadow transition-all duration-150 active:scale-[0.98] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed text-sm border-0"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Creando cuenta...</span>
                  </div>
                ) : (
                  'Registrarse'
                )}
              </button>
            )}
          </div>
        </form>

        {/* Enlace al login */}
        <div className="mt-5 pt-4 border-t border-slate-100 text-center">
          <p className="text-xs sm:text-sm text-slate-600">
            ¿Ya tienes una cuenta registrada?{' '}
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="font-bold text-secondary hover:text-secondary-hover underline cursor-pointer bg-transparent border-0 p-0 shadow-none ml-1 inline"
              style={{ backgroundColor: 'transparent', border: 'none', padding: 0 }}
            >
              Inicia sesión aquí
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
