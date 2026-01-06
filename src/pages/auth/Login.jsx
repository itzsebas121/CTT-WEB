import { useState } from "react"
import { loginComplete } from "../../api/auth"
import { useNavigate, useLocation } from "react-router-dom"
import { saveAuthData } from "../../utils/auth"


export default function Login () {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const navigate = useNavigate()
  const location = useLocation()

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    try {
      // Llamada al servicio loginComplete() que obtiene token y perfil
      const { token, user } = await loginComplete(email, password);

      // Guardar token y datos del usuario en localStorage usando la utilidad
      saveAuthData(token, user);

      // Verificar si hay una inscripción pendiente
      const pendingEnrollment = localStorage.getItem('pendingEnrollment');
      if (pendingEnrollment) {
        const { courseId, returnPath } = JSON.parse(pendingEnrollment);
        
        // Determinar la ruta correcta basada en si viene de dashboard o no
        let targetPath = returnPath;
        if (returnPath.startsWith('/course/')) {
          // Si viene de la ruta pública, redirigir a la ruta del dashboard
          targetPath = returnPath.replace('/course/', '/dashboard/curso/');
        }
        
        // NO eliminar pendingEnrollment aquí, se eliminará en el destino
        // Redirigir de vuelta con el estado de inscripción pendiente
        navigate(targetPath, { 
          state: { enrollCourseId: parseInt(courseId) },
          replace: true 
        });
      } else {
        // Si viene de alguna página específica, volver ahí
        const from = location.state?.from?.pathname || '/dashboard';
        navigate(from, { replace: true });
      }
    } catch (error) {
      // Si falla, no se guarda nada
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
        <div className="sm:mx-auto bg-white rounded-2xl shadow-xl border border-gray-300 p-8 sm:w-full sm:max-w-[500px]">
          <div className="sm:mx-auto sm:w-full sm:max-w-sm">
            <img
              alt="Your Company"
              src="src/assets/logoCTT.webp"
              className="mx-auto h-30 w-auto"
            />
            <h2 className="text-center text-2xl font-bold mt-1 tracking-tight text-[#6C1313]">
              Iniciar Sesión 
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 mt-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#6C1313]">
                Correo electrónico
              </label>
              <div className="mt-2">
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#6C1313]">
                Contraseña
              </label>
              <div className="mt-2">
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm"
                />
              </div>
            </div>
            {loading && (
                    <div className="flex justify-center items-center mt-10">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6C1313]"></div>
                    </div>
                )}
            {errorMessage && (

              <p className="text-red-600 text-sm text-center">{errorMessage }</p>
            )}
            

            <div>
              <button
                type="submit"
                disabled={loading}
                className="flex w-full justify-center rounded-md rojo"
              >
                {loading ? 'Iniciando...' : 'Iniciar sesión'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/register')}
                disabled={loading}
                className="flex w-full justify-center rounded-md mt-4"
              >
                Registrarse
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
