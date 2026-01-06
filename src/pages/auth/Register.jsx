import { useState } from "react"
import { register } from "../../api/auth"
import { useNavigate } from "react-router-dom"

export default function Register () {
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
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const navigate = useNavigate()

  const validateStep1 = () => {
    // identificación: requerido, hasta 10 dígitos
    if (!/^\d{1,10}$/.test(identification)) {
      return 'Cédula requerida y debe ser hasta 10 dígitos numéricos.'
    }
    // nombre: requerido, hasta 100 caracteres
    if (!firstName || firstName.length > 100) {
      return 'Nombre requerido, máximo 100 caracteres.'
    }
    // segundo nombre: opcional, hasta 100
    if (secondName && secondName.length > 100) {
      return 'Segundo nombre máximo 100 caracteres.'
    }
    // apellido: requerido, hasta 100
    if (!firstLastName || firstLastName.length > 100) {
      return 'Apellido requerido, máximo 100 caracteres.'
    }
    // segundo apellido: opcional, hasta 100
    if (secondLastName && secondLastName.length > 100) {
      return 'Segundo apellido máximo 100 caracteres.'
    }
    return null
  }

  const validateStep2 = () => {
    // celular: requerido, combinar prefijo + número (número solo dígitos, 9 dígitos)
    if (!/^\d{9}$/.test(cellphone)) {
      return 'Celular requerido. Ingrese solo dígitos (9), seleccione prefijo.'
    }
    // email: requerido y válido
    if (!email) return 'Correo electrónico requerido.'
    // simple validación de email HTML + regex ligera
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) return 'Correo electrónico inválido.'
    // dirección: requerido hasta 200
    if (!address || address.length > 200) return 'Dirección requerida, máximo 200 caracteres.'
    return null
  }

  const validateStep3 = () => {
    // tipo: debe ser uno de las opciones
    if (!['Estudiante','Externo','Administrativo'].includes(type)) return 'Tipo inválido.'
    // contraseña: requerida hasta 255
    if (!password || password.length > 255) return 'Contraseña requerida, máximo 255 caracteres.'
    return null
  }

  const handleNext = (e) => {
    e.preventDefault();
    setErrorMessage('')
    let err = null
    
    if (currentStep === 1) {
      err = validateStep1()
    } else if (currentStep === 2) {
      err = validateStep2()
    }

    if (err) {
      setErrorMessage(err)
      return
    }

    setCurrentStep(currentStep + 1)
  }

  const handleBack = (e) => {
    e.preventDefault();
    setErrorMessage('')
    setCurrentStep(currentStep - 1)
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('')
    
    const err = validateStep3()
    if (err) {
      setErrorMessage(err)
      return
    }

    setLoading(true);

    try {
      const fullCell = `${cellPrefix}${cellphone}`
      // Llamada al servicio register con todos los campos en el orden esperado
      const response = await register(
        identification,
        firstName,
        secondName,
        firstLastName,
        secondLastName,
        fullCell,
        email,
        address,
        type,
        password
      );
      console.log(response);
      if (response.message === 'Platform user registered successfully') {
        console.log('Usuario registrado:', response);
        navigate('/login');
      }

      
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div
        className="flex h-screen flex-col justify-center"
        style={{
          backgroundImage: `url('src/assets/fisei.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <div className="sm:mx-auto bg-white rounded-2xl shadow-xl border border-gray-300 p-8 sm:w-full sm:max-w-[700px]">
          <div className="sm:mx-auto sm:w-full sm:max-w-sm">
            <img
              alt="Your Company"
              src="src/assets/logoCTT.webp"
              className="mx-auto h-30 w-auto"
            />
            <h2 className="text-center text-2xl font-bold mt-1 tracking-tight text-[#6C1313]">
              Registrarse
            </h2>
          </div>

          {/* Barra de progreso */}
          <div className="mt-6 mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className={`text-sm font-medium ${currentStep >= 1 ? 'text-[#6C1313]' : 'text-gray-400'}`}>
                Paso 1: Datos Personales
              </span>
              <span className={`text-sm font-medium ${currentStep >= 2 ? 'text-[#6C1313]' : 'text-gray-400'}`}>
                Paso 2: Contacto
              </span>
              <span className={`text-sm font-medium ${currentStep >= 3 ? 'text-[#6C1313]' : 'text-gray-400'}`}>
                Paso 3: Cuenta
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-[#6C1313] h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / 3) * 100}%` }}
              ></div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Paso 1: Datos Personales */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#6C1313]">Cédula *</label>
                  <input
                    value={identification}
                    onChange={(e) => setIdentification(e.target.value.replace(/\D/g,''))}
                    required
                    maxLength={10}
                    placeholder="Solo dígitos, hasta 10"
                    className="block w-full rounded-md px-3 py-1.5 border border-gray-300 focus:border-[#6C1313] focus:ring-1 focus:ring-[#6C1313]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#6C1313]">Nombre *</label>
                    <input
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                      maxLength={100}
                      className="block w-full rounded-md px-3 py-1.5 border border-gray-300 focus:border-[#6C1313] focus:ring-1 focus:ring-[#6C1313]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#6C1313]">Segundo Nombre (opcional)</label>
                    <input
                      value={secondName}
                      onChange={(e) => setSecondName(e.target.value)}
                      maxLength={100}
                      className="block w-full rounded-md px-3 py-1.5 border border-gray-300 focus:border-[#6C1313] focus:ring-1 focus:ring-[#6C1313]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#6C1313]">Apellido *</label>
                    <input
                      value={firstLastName}
                      onChange={(e) => setFirstLastName(e.target.value)}
                      required
                      maxLength={100}
                      className="block w-full rounded-md px-3 py-1.5 border border-gray-300 focus:border-[#6C1313] focus:ring-1 focus:ring-[#6C1313]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#6C1313]">Segundo Apellido (opcional)</label>
                    <input
                      value={secondLastName}
                      onChange={(e) => setSecondLastName(e.target.value)}
                      maxLength={100}
                      className="block w-full rounded-md px-3 py-1.5 border border-gray-300 focus:border-[#6C1313] focus:ring-1 focus:ring-[#6C1313]"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Paso 2: Datos de Contacto */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#6C1313]">Prefijo *</label>
                    <select 
                      value={cellPrefix} 
                      onChange={(e)=>setCellPrefix(e.target.value)} 
                      className="block w-full rounded-md px-3 py-1.5 border border-gray-300 focus:border-[#6C1313] focus:ring-1 focus:ring-[#6C1313]"
                    >
                      <option value="+593">+593 (Ecuador)</option>
                      <option value="+54">+54 (Argentina)</option>
                      <option value="+1">+1 (USA/Canadá)</option>
                      <option value="+34">+34 (España)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#6C1313]">Celular *</label>
                    <input
                      value={cellphone}
                      onChange={(e) => setCellphone(e.target.value.replace(/\D/g,''))}
                      required
                      maxLength={9}
                      placeholder="Solo dígitos"
                      className="block w-full rounded-md px-3 py-1.5 border border-gray-300 focus:border-[#6C1313] focus:ring-1 focus:ring-[#6C1313]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#6C1313]">Correo electrónico *</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="block w-full rounded-md px-3 py-1.5 border border-gray-300 focus:border-[#6C1313] focus:ring-1 focus:ring-[#6C1313]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#6C1313]">Dirección *</label>
                  <input
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                    maxLength={200}
                    placeholder="Dirección completa"
                    className="block w-full rounded-md px-3 py-1.5 border border-gray-300 focus:border-[#6C1313] focus:ring-1 focus:ring-[#6C1313]"
                  />
                </div>
              </div>
            )}

            {/* Paso 3: Datos de Cuenta */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#6C1313]">Tipo de Usuario *</label>
                  <select 
                    value={type} 
                    onChange={(e)=>setType(e.target.value)} 
                    className="block w-full rounded-md px-3 py-1.5 border border-gray-300 focus:border-[#6C1313] focus:ring-1 focus:ring-[#6C1313]"
                  >
                    <option>Estudiante</option>
                    <option>Externo</option>
                    <option>Administrativo</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#6C1313]">Contraseña *</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    maxLength={255}
                    placeholder="Ingrese una contraseña segura"
                    className="block w-full rounded-md px-3 py-1.5 border border-gray-300 focus:border-[#6C1313] focus:ring-1 focus:ring-[#6C1313]"
                  />
                  <p className="text-xs text-gray-500 mt-1">Máximo 255 caracteres</p>
                </div>
              </div>
            )}

            {loading && (
              <div className="flex justify-center items-center mt-2">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#6C1313]"></div>
              </div>
            )}

            {errorMessage && (
              <p className="text-red-600 text-sm text-center">{errorMessage}</p>
            )}

            {/* Botones de navegación */}
            <div className="flex justify-between gap-4 pt-4">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={handleBack}
                  disabled={loading}
                  className="flex-1 px-4 py-2"
                >
                  Anterior
                </button>
              )}

              {currentStep < 3 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={loading}
                  className="flex-1 px-4 py-2"
                >
                  Siguiente
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 disabled:opacity-50"
                >
                  {loading ? 'Registrando...' : 'Registrarse'}
                </button>
              )}
            </div>
          </form>

          <div className="mt-4 text-right">
            <span 
              onClick={() => navigate('/login')}
              className="text-sm text-[#6C1313] hover:underline cursor-pointer"
            >
              Volver al inicio de sesión
            </span>
          </div>
        </div>
      </div>
    </>
  )
}