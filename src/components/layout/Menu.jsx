import { NavLink, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { dashboardMenuItems } from '../../constants/navigation'
import { getUser, clearAuthData } from '../../utils/auth'
import { ConfirmDialog } from '../ui'

export default function Menu ({ items }) {
  const [isOpen, setIsOpen] = useState(false)
  const [user, setUser] = useState(null)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const userData = getUser()
    setUser(userData)
  }, [])

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true)
  }

  const handleLogoutConfirm = () => {
    clearAuthData()
    setShowLogoutConfirm(false)
    navigate('/')
  }

  const handleLogoutCancel = () => {
    setShowLogoutConfirm(false)
  }

  const handleGoHome = () => {
    navigate('/')
    setIsOpen(false)
  }

  return (
    <>
      {/* Botón hamburguesa - solo visible en pantallas pequeñas y medianas */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-[#6C1313] text-white rounded"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {isOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Overlay - solo visible cuando el menú está abierto en móvil */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-opacity-50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Menú lateral */}
      <aside className={`
        w-64 bg-[#6C1313] text-white flex flex-col
        fixed lg:static inset-y-0 left-0 z-40
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Encabezado del panel */}
        <div className="p-4 text-xl font-bold border-b border-white">
           CTT - Estudiantes
        </div>

        {/* Botón ir a página principal */}
        <div className="p-4 border-b border-white/30">
          <button
            onClick={handleGoHome}
            className="w-full flex items-center justify-center space-x-2 p-2 bg-white text-[#6C1313] rounded hover:bg-gray-100 transition-colors duration-200 font-semibold"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span>Página Principal</span>
          </button>
        </div>

        {/* Menú dinámico */}
        <nav className="flex-1 p-4 space-y-2">
          {dashboardMenuItems.map((item) => (
            <div key={item.path}>
              {item.subItems ? (
                <>
                  {/* Item con subsecciones */}
                  <div className="p-2 text-white font-semibold">
                    {item.name}
                  </div>
                  
                  {/* Subsecciones siempre visibles */}
                  <div className="ml-4 space-y-1">
                    {item.subItems.map((subItem) => (
                      <NavLink
                        key={subItem.path}
                        to={subItem.path}
                        onClick={() => setIsOpen(false)}
                        className={({ isActive }) =>
                          `block p-2 rounded transition-colors duration-200 text-sm
                          ${isActive ? "bg-white font-semibold NavLink" : "text-white hover:bg-white hover:!text-[#6C1313]"}`
                        }
                      >
                        {subItem.name}
                      </NavLink>
                    ))}
                  </div>
                </>
              ) : (
                /* Items sin subsecciones */
                <NavLink
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) =>
                    `block p-2 rounded transition-colors duration-200 
                    ${isActive ? "bg-white font-semibold NavLink" : " text-white hover:bg-white hover:!text-[#6C1313]"}`
                  }
                >
                  {item.name}
                </NavLink>
              )}
            </div>
          ))}
        </nav>

        {/* Información del usuario */}
        {user && (
          <div className="p-4 border-t border-white/30">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-[#6C1313] font-bold text-xl">
                {user.nombre?.charAt(0).toUpperCase() || user.first_name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">
                  {user.first_name + " " + user.first_last_name || 'Usuario'}
                </p>
                <p className="text-xs text-white/80 truncate">
                  {user.email || ''}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Botón de cerrar sesión */}
        <div className="p-4 border-t border-white/30">
          <button
            onClick={handleLogoutClick}
            className="w-full flex items-center justify-center space-x-2 p-2 bg-red-700 text-white rounded hover:bg-red-800 transition-colors duration-200 font-semibold"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Diálogo de confirmación de cierre de sesión */}
      <ConfirmDialog
        isOpen={showLogoutConfirm}
        onClose={handleLogoutCancel}
        onConfirm={handleLogoutConfirm}
        title="¿Cerrar sesión?"
        message="Estás a punto de cerrar tu sesión. ¿Deseas continuar?"
        confirmText="Cerrar Sesión"
        cancelText="Cancelar"
        type="danger"
      />
    </>
  )
}