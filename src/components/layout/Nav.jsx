import { Link, NavLink, useNavigate } from "react-router-dom"
import { Bars3Icon, XMarkIcon, UserCircleIcon, ArrowRightOnRectangleIcon, ChevronDownIcon, SunIcon, MoonIcon } from '@heroicons/react/24/outline'
import { Dialog, DialogPanel } from '@headlessui/react'
import { useState, useEffect, useRef } from "react"
import { mainNavigation, itemsHeader } from '../../constants/navigation'
import { isAuthenticated, getUser, clearAuthData } from '../../utils/auth'
import { ConfirmDialog } from '../ui'
import { useDashboardTheme } from '../../context/DashboardThemeContext'
import logoCTTTransparent from '../../assets/logoCTT-transparent.png'
import logoCTTWhite from '../../assets/logoCTT-white.png'
import logoUTAPequeno from '../../assets/LogoUTAPequeño.png'
import logoUTAWhite from '../../assets/logoUTA-sidebar-white.png'

export default function Nav() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [user, setUser] = useState(null)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const { isDark, toggleTheme } = useDashboardTheme()
  const navigate = useNavigate()
  const menuRef = useRef(null)

  useEffect(() => {
    if (isAuthenticated()) {
      setUser(getUser())
    }

    // Listener para actualizar el estado cuando cambie la autenticación
    const handleAuthChange = () => {
      if (isAuthenticated()) {
        setUser(getUser())
      } else {
        setUser(null)
      }
    }

    window.addEventListener('storage', handleAuthChange)
    window.addEventListener('authChange', handleAuthChange)

    return () => {
      window.removeEventListener('storage', handleAuthChange)
      window.removeEventListener('authChange', handleAuthChange)
    }
  }, [])

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowUserMenu(false)
      }
    }

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showUserMenu])

  const handleLogoutClick = () => {
    // Cerrar el menú móvil antes de mostrar el diálogo
    setMobileMenuOpen(false)
    setShowUserMenu(false)
    // Pequeño delay para que el menú se cierre antes de mostrar el diálogo
    setTimeout(() => {
      setShowLogoutConfirm(true)
    }, 100)
  }

  const handleLogoutConfirm = () => {
    clearAuthData()
    setUser(null)
    setShowLogoutConfirm(false)
    navigate('/')
  }

  const handleLogoutCancel = () => {
    setShowLogoutConfirm(false)
  }

  return (
    <>
      <nav aria-label="Global" className={`sticky h-[60px] top-0 shadow-md z-50 w-full flex items-center justify-between p-4 sm:p-6 lg:px-8 transition-colors duration-200 ${
        isDark ? 'bg-[#0f172a] md:bg-[#002747] border-b border-white/10' : 'bg-white md:bg-primary lg:bg-primary'
      }`}>
        <div className="lg:flex md:flex hidden lg:gap-x-10 md:gap-x-8 gap-4 lg:pl-28 md:pl-16">
          {mainNavigation.map((item) => (
            <NavLink
              key={item.id}
              to={item.href}
              className={({ isActive }) =>
                `text-sm font-semibold transition ${isActive ? "text-primary md:text-white border-b-2 border-primary md:border-white" : "text-gray-700 md:text-gray-200 hover:text-primary md:hover:text-white"
                }`
              }
            >
              {item.title}
            </NavLink>
          ))}
        </div>
        
        {/* Controles a la derecha en desktop */}
        <div className="hidden md:flex items-center gap-3">
          {/* Selector de Tema Claro / Oscuro */}
          <button
            type="button"
            onClick={toggleTheme}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-white/15 hover:bg-white/25 active:bg-white/30 transition-all border border-white/20 cursor-pointer shadow-xs"
            title={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
            aria-label="Cambiar tema"
          >
            {isDark ? (
              <>
                <SunIcon className="w-4 h-4 text-amber-300" />
                <span className="hidden lg:inline text-xs">Claro</span>
              </>
            ) : (
              <>
                <MoonIcon className="w-4 h-4 text-white" />
                <span className="hidden lg:inline text-xs">Oscuro</span>
              </>
            )}
          </button>

          {user ? (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-white bg-white/20 rounded-lg hover:bg-white/30 transition-colors border border-green-400"
              >
                <div className="relative">
                  <UserCircleIcon className="size-5" />
                  <span className="absolute -top-1 -right-1 size-2.5 bg-green-400 rounded-full border-2 border-primary"></span>
                </div>
                <span className="hidden lg:inline">{user.name || user.username}</span>
                <span className="hidden lg:inline text-xs text-green-300">● En línea</span>
                <ChevronDownIcon className="size-4 hidden lg:block" />
              </button>

              {/* Menú desplegable */}
              {showUserMenu && (
                <div className={`absolute right-0 mt-2 w-56 rounded-xl shadow-xl border z-50 p-2 ${
                  isDark ? 'bg-[#16161a] border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'
                }`}>
                  <div className={`p-3 border-b ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
                    <p className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>{user.first_name + " " + user.first_last_name}</p>
                    <p className={`text-xs ${isDark ? 'text-zinc-400' : 'text-gray-500'}`}>{user.email}</p>
                    <p className="text-xs text-green-400 mt-1 font-medium">● Sesión activa</p>
                  </div>
                  <div className="pt-2 space-y-1">
                    <Link
                      to="/dashboard/cursos/disponibles"
                      className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-white bg-primary hover:bg-primary-hover rounded-lg transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <ArrowRightOnRectangleIcon className="size-4" />
                      Ir al Panel
                    </Link>
                    <button
                      onClick={handleLogoutClick}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      <ArrowRightOnRectangleIcon className="size-4" />
                      Cerrar Sesión
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-2 px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-white bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
            >
              <UserCircleIcon className="size-5" />
              <span className="hidden lg:inline">Iniciar Sesión</span>
            </Link>
          )}
        </div>
        <div className="flex md:hidden lg:hidden flex-1 justify-start">
          <a href="/" className="-m-1.5 p-1.5">
            <img
              alt="Logo CTT"
              src={isDark ? logoCTTWhite : logoCTTTransparent}
              className="h-12 w-auto object-contain"
            />
          </a>
        </div>
        <div className="flex md:hidden lg:hidden flex-1 justify-center">
          <a href="/" className="-m-1.5 p-1.5">
            <img
              alt="Logo UTA"
              src={isDark ? logoUTAWhite : logoUTAPequeno}
              className="h-11 w-auto object-contain"
            />
          </a>
        </div>
        <div className="flex md:hidden lg:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className={`-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 transition-colors cursor-pointer ${
              isDark ? "text-zinc-200 hover:text-white" : "text-gray-700 hover:text-primary"
            }`}
          >
            <span className="sr-only">Open main menu</span>
            <Bars3Icon aria-hidden="true" className="size-6" />
          </button>
        </div>

      </nav>
      <Dialog open={mobileMenuOpen} onClose={setMobileMenuOpen} className="lg:hidden">
        <div className="fixed inset-0 z-50" />
        <DialogPanel className={`fixed inset-y-0 right-0 z-50 w-full overflow-y-auto p-6 sm:max-w-sm sm:ring-1 transition-colors ${
          isDark ? 'bg-[#16161a] text-zinc-100 sm:ring-white/10' : 'bg-white text-gray-900 sm:ring-gray-900/10'
        }`}>
          <div className="flex justify-between items-center mb-6">
            <button
              type="button"
              onClick={toggleTheme}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold border ${
                isDark
                  ? 'bg-zinc-800 text-amber-300 border-white/10'
                  : 'bg-zinc-100 text-zinc-700 border-zinc-200'
              }`}
            >
              {isDark ? <SunIcon className="w-4 h-4" /> : <MoonIcon className="w-4 h-4" />}
              <span>{isDark ? 'Modo Claro' : 'Modo Oscuro'}</span>
            </button>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className={`-m-2.5 rounded-md p-2.5 ${isDark ? 'text-zinc-400 hover:text-white' : 'text-gray-700'}`}
            >
              <span className="sr-only">Close menu</span>
              <XMarkIcon aria-hidden="true" className="size-6" />
            </button>
          </div>
          <div className="mt-6 flow-root">
            <div className={`-my-6 divide-y ${isDark ? 'divide-white/10' : 'divide-gray-500/10'}`} >
              <div className="space-y-2 py-6">
                {mainNavigation.map((item) => (
                  <NavLink
                    key={item.id}
                    to={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `block rounded-lg px-3 py-2 font-semibold ${
                        isActive
                          ? "bg-primary text-white"
                          : isDark
                            ? "text-zinc-300 hover:bg-white/[0.06]"
                            : "text-primary hover:bg-gray-100"
                      }`
                    }
                  >
                    {item.title}
                  </NavLink>
                ))}
              </div>
            </div>
            <div className={`border-t divide-y ${isDark ? 'border-white/10 divide-white/10' : 'border-primary divide-gray-500/10'}`} >
              <div className="space-y-2 py-6">
                {itemsHeader.map((item) => (
                  <a
                    key={item.id}
                    href={item.href}
                    className={`-mx-3 block rounded-lg px-3 py-2 text-base/7 font-semibold ${
                      isDark ? 'text-blue-400 hover:text-blue-300' : 'text-primary'
                    }`}
                  >
                    {item.title}
                  </a>
                ))}
              </div>
            </div>
            
            {/* Sección de usuario en móvil */}
            <div className={`border-t pt-6 mt-6 ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
              {user ? (
                <div className="space-y-3">
                  <div className={`px-3 py-2 rounded-lg ${isDark ? 'bg-zinc-800/60' : 'bg-gray-50'}`}>
                    <div className="flex items-center gap-3 mb-2">
                      <UserCircleIcon className="size-10 text-primary" />
                      <div>
                        <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{user.first_name + " " + user.first_last_name}</p>
                        <p className={`text-sm ${isDark ? 'text-zinc-400' : 'text-gray-500'}`}>{user.email}</p>
                      </div>
                    </div>
                  </div>
                  <Link
                    to="/dashboard/cursos/disponibles"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full px-4 py-3 text-center font-semibold text-white bg-primary rounded-lg hover:bg-primary-hover transition-colors"
                  >
                    Ir a la plataforma
                  </Link>
                  <button
                    onClick={handleLogoutClick}
                    className="block w-full px-4 py-3 text-center font-semibold text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    Cerrar Sesión
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 w-full px-4 py-3 font-semibold text-white bg-primary rounded-lg hover:bg-primary-hover transition-colors"
                >
                  <UserCircleIcon className="size-5" />
                  Iniciar Sesión
                </Link>
              )}
            </div>
          </div>
        </DialogPanel>
      </Dialog>

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
