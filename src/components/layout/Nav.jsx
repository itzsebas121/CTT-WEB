import { Link, NavLink, useNavigate } from "react-router-dom"
import { Bars3Icon, XMarkIcon, UserCircleIcon, ArrowRightOnRectangleIcon, ChevronDownIcon } from '@heroicons/react/24/outline'
import { Dialog, DialogPanel } from '@headlessui/react'
import { useState, useEffect, useRef } from "react"
import { mainNavigation, itemsHeader } from '../../constants/navigation'
import { isAuthenticated, getUser, clearAuthData } from '../../utils/auth'
import { ConfirmDialog } from '../ui'
import logoCTT from '../../assets/logoCTT.webp'
import logoUTAPequeno from '../../assets/LogoUTAPequeño.png'

export default function Nav() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [user, setUser] = useState(null)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
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
      <nav aria-label="Global" className="sticky h-[60px] top-0 shadow-lg  z-50 w-full flex items-center justify-between p-6 lg:px-8 bg-[#FFFFFF] md:bg-[#6C1313] lg:bg-[#6C1313]">
        <div className="lg:flex md:flex hidden lg:gap-x-12 md:gap-x-12 gap-4 lg:pl-30 md:pl-20">
          {mainNavigation.map((item) => (
            <NavLink
              key={item.id}
              to={item.href}
              className={({ isActive }) =>
                `font-semibold transition ${isActive ? "text-[#6C1313] md:text-white border-b-2 border-[#6C1313] md:border-white" : "text-gray-700 md:text-gray-200 hover:text-[#6C1313] md:hover:text-white"
                }`
              }
            >
              {item.title}
            </NavLink>
          ))}
        </div>
        
        {/* Botón de usuario en desktop (oculto en móvil) */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-white/20 rounded-lg hover:bg-white/30 transition-colors border border-green-400"
              >
                <div className="relative">
                  <UserCircleIcon className="size-5" />
                  <span className="absolute -top-1 -right-1 size-2.5 bg-green-400 rounded-full border-2 border-[#6C1313]"></span>
                </div>
                <span className="hidden lg:inline">{user.name || user.username}</span>
                <span className="hidden lg:inline text-xs text-green-300">● En línea</span>
                <ChevronDownIcon className="size-4 hidden lg:block" />
              </button>

              {/* Menú desplegable */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                  <div className="p-4 border-b border-gray-200">
                    <p className="font-semibold text-gray-900">{user.first_name + " " + user.first_last_name}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                    <p className="text-xs text-green-600 mt-1">Sesión iniciada</p>
                  </div>
                  <div className="p-2">
                    <Link
                      to="/dashboard/cursos/disponibles"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 bg-[#6C1313]  rounded-md transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <ArrowRightOnRectangleIcon className="size-5" />
                      Ir a la plataforma
                    </Link>
                    <button
                      onClick={handleLogoutClick}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors mt-1"
                    >
                      <ArrowRightOnRectangleIcon className="size-5" />
                      Cerrar Sesión
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
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
              src={logoCTT}
              className="h-14 w-auto"
            />
          </a>
        </div>
        <div className="flex md:hidden lg:hidden flex-1 justify-center">
          <a href="/" className="-m-1.5 p-1.5">
            <img
              alt="Logo UTA"
              src={logoUTAPequeno}
              className="h-12 w-auto"
            />
          </a>
        </div>
        <div className="flex md:hidden lg:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
          >
            <span className="sr-only">Open main menu</span>
            <Bars3Icon aria-hidden="true" className="size-6" />
          </button>
        </div>

      </nav>
      <Dialog open={mobileMenuOpen} onClose={setMobileMenuOpen} className="lg:hidden">
        <div className="fixed inset-0 z-50" />
        <DialogPanel className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white p-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
          <div className="flex justify-end mb-10">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="-m-2.5 rounded-md p-2.5 text-gray-700"
            >
              <span className="sr-only">Close menu</span>
              <XMarkIcon aria-hidden="true" className="size-6" />
            </button>
          </div>
          <div className="mt-6 flow-root">
            <div className="-my-6 divide-y divide-gray-500/10" >
              <div className="space-y-2 py-12">
                {mainNavigation.map((item) => (
                  <NavLink
                    key={item.id}
                    to={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `block rounded-lg px-3 py-2 font-semibold  ${isActive
                        ? "bg-[#6C1313]"
                        : "text-[#6C1313] NavLink  hover:bg-[#6C1313] "
                      }`
                    }
                  >
                    {item.title}
                  </NavLink>
                ))}
              </div>
            </div>
            <div className="border-t-1 border-[#6C1313] divide-y divide-gray-500/10" >
              <div className="space-y-2 py-6">
                {itemsHeader.map((item) => (
                  <a
                    key={item.id}
                    href={item.href}
                    className="-mx-3 block rounded-lg px-3 py-2 text-base/7 font-semibold"
                    style={{ color: '#6C1313' }}
                  >
                    {item.title}
                  </a>
                ))}
              </div>
            </div>
            
            {/* Sección de usuario en móvil */}
            <div className="border-t border-gray-200 pt-6 mt-6">
              {user ? (
                <div className="space-y-3">
                  <div className="px-3 py-2 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <UserCircleIcon className="size-10 text-[#6C1313]" />
                      <div>
                        <p className="font-semibold text-gray-900">{user.first_name + " " + user.first_last_name}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </div>
                  <Link
                    to="/dashboard/cursos/disponibles"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full px-4 py-3 text-center font-semibold text-white bg-[#6C1313] rounded-lg hover:bg-[#8B1818] transition-colors"
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
                  className="flex items-center justify-center gap-2 w-full px-4 py-3 font-semibold text-white bg-[#6C1313] rounded-lg hover:bg-[#8B1818] transition-colors"
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
