import { NavLink, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getUser, clearAuthData } from '../../utils/auth';
import ConfirmDialog from '../ui/ConfirmDialog';
import logoUTASidebar from '../../assets/logoUTA-sidebar.png';
import logoUTASidebarWhite from '../../assets/logoUTA-sidebar-white.png';
import { useDashboardTheme } from '../../context/DashboardThemeContext';
import {
  BookOpenIcon,
  AcademicCapIcon,
  CheckCircleIcon,
  ClockIcon,
  DocumentCheckIcon,
  HomeIcon,
  ArrowLeftOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  UserIcon
} from '@heroicons/react/24/outline';

export default function Menu({ isCollapsed = false, onToggleCollapse }) {
  const [isOpenMobile, setIsOpenMobile] = useState(false);
  const [user, setUser] = useState(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const { isDark } = useDashboardTheme();
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthChange = () => {
      setUser(getUser());
    };
    handleAuthChange();
    window.addEventListener('authChange', handleAuthChange);
    return () => window.removeEventListener('authChange', handleAuthChange);
  }, []);

  const handleLogoutConfirm = () => {
    clearAuthData();
    setShowLogoutConfirm(false);
    navigate('/');
  };

  const getUserInitials = () => {
    if (!user) return 'ES';
    const first = user.first_name ? user.first_name.charAt(0) : (user.nombre ? user.nombre.charAt(0) : 'E');
    const last = user.first_last_name ? user.first_last_name.charAt(0) : (user.apellido ? user.apellido.charAt(0) : 'S');
    return (first + last).toUpperCase();
  };

  const navGroups = [
    {
      group: 'Home',
      items: [
        {
          name: 'Página Principal',
          path: '/',
          icon: HomeIcon,
          exact: true
        }
      ]
    },
    {
      group: 'Área Académica',
      items: [
        {
          name: 'Oferta Académica',
          path: '/dashboard/oferta',
          icon: AcademicCapIcon
        },
        {
          name: 'Mis Inscripciones',
          path: '/dashboard/cursos/inscrito',
          icon: CheckCircleIcon
        }
      ]
    },
    {
      group: 'Gestión y Pagos',
      items: [
        {
          name: 'Órdenes Pendientes',
          path: '/dashboard/ordenes/pendientes',
          icon: ClockIcon
        },
        {
          name: 'Órdenes Completadas',
          path: '/dashboard/ordenes/completadas',
          icon: DocumentCheckIcon
        },
        {
          name: 'Mi Perfil',
          path: '/dashboard/perfil',
          icon: UserIcon
        }
      ]
    }
  ];

  return (
    <>
      {/* Botón flotante para dispositivos móviles */}
      <button
        type="button"
        onClick={() => setIsOpenMobile(!isOpenMobile)}
        className={`lg:hidden fixed bottom-4 right-4 z-50 p-3 rounded-full shadow-2xl border cursor-pointer flex items-center justify-center transition-all duration-200 active:scale-95 ${
          isDark
            ? 'bg-zinc-900/90 text-white border-white/20'
            : 'bg-white text-zinc-900 border-zinc-300'
        }`}
        aria-label={isOpenMobile ? "Cerrar menú" : "Abrir menú"}
      >
        {isOpenMobile ? <XMarkIcon className="w-5 h-5" /> : <Bars3Icon className="w-5 h-5" />}
      </button>

      {/* Backdrop móvil */}
      <div
        className={`lg:hidden fixed inset-0 backdrop-blur-sm z-30 transition-opacity duration-300 ${
          isOpenMobile ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        } ${isDark ? 'bg-black/75' : 'bg-black/40'}`}
        onClick={() => setIsOpenMobile(false)}
        aria-hidden="true"
      />

      {/* Barra lateral flotante (compatible con Claro y Oscuro) */}
      <aside
        className={`
          ${isCollapsed ? 'lg:w-[72px]' : 'lg:w-60'} w-64
          flex flex-col justify-between flex-shrink-0
          fixed lg:static inset-y-0 left-0 z-40 h-full select-none rounded-2xl
          transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]
          ${isDark
            ? 'bg-[#09090b] text-zinc-300 border border-white/[0.08]'
            : 'bg-white text-zinc-700 border border-black/[0.08] shadow-sm'
          }
          ${isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Cabecera: Logo Oficial UTA más grande y sin icono de notificaciones */}
        <div
          className={`pt-3.5 pb-3 px-3 flex items-center justify-center border-b transition-colors ${
            isDark ? 'border-white/[0.06]' : 'border-black/[0.06]'
          }`}
        >
          <button
            type="button"
            onClick={() => navigate('/')}
            className={`w-full flex items-center justify-center p-1.5 rounded-xl transition-colors cursor-pointer border-0 bg-transparent ${
              isDark ? 'hover:bg-white/[0.04]' : 'hover:bg-black/[0.03]'
            }`}
            title="Universidad Técnica de Ambato"
          >
            <img
              src={isDark ? logoUTASidebarWhite : logoUTASidebar}
              alt="Universidad Técnica de Ambato"
              className={`transition-all duration-300 object-contain bg-transparent ${
                isCollapsed
                  ? 'h-8 w-auto'
                  : 'h-11 sm:h-12 w-auto max-w-full drop-shadow-2xs'
              }`}
            />
          </button>
        </div>

        {/* Navegación con Secciones */}
        <nav className="flex-1 overflow-y-auto px-2.5 py-3 space-y-3.5 scrollbar-none">
          {navGroups.map((group, groupIdx) => (
            <div key={groupIdx} className="space-y-1">
              {!isCollapsed && (
                <div className="px-2.5 pt-1 pb-0.5">
                  <span
                    className={`text-[10px] font-semibold uppercase tracking-wider ${
                      isDark ? 'text-zinc-500' : 'text-zinc-400'
                    }`}
                  >
                    {group.group}
                  </span>
                </div>
              )}

              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      end={item.exact}
                      onClick={() => setIsOpenMobile(false)}
                      className={({ isActive }) => {
                        let baseClasses = `flex items-center ${
                          isCollapsed ? 'justify-center px-0' : 'px-2.5'
                        } py-2 rounded-lg text-xs font-medium transition-all group `;

                        if (isActive) {
                          return isDark
                            ? baseClasses + 'bg-white/[0.08] text-white border border-white/[0.06] shadow-xs'
                            : baseClasses + 'bg-[#00345e] text-white shadow-xs font-semibold';
                        }
                        return isDark
                          ? baseClasses + 'text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.04]'
                          : baseClasses + 'text-zinc-600 hover:text-zinc-900 hover:bg-black/[0.04]';
                      }}
                      title={isCollapsed ? item.name : undefined}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0 transition-colors" />
                      {!isCollapsed && (
                        <span className="ml-2.5 truncate">{item.name}</span>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Dock Inferior: Solo Usuario y Versión (sin botón innecesario de sistema) */}
        <div
          className={`p-2.5 border-t space-y-2 ${
            isDark ? 'border-white/[0.06]' : 'border-black/[0.06]'
          }`}
        >
          {/* User Account Dock */}
          <div
            className={`w-full flex items-center ${
              isCollapsed ? 'justify-center p-1.5' : 'justify-between p-2'
            } rounded-xl border transition-colors ${
              isDark
                ? 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.05]'
                : 'bg-zinc-50 border-black/[0.06] hover:bg-zinc-100/80'
            }`}
          >
            <button
              type="button"
              onClick={() => {
                setIsOpenMobile(false);
                navigate('/dashboard/perfil');
              }}
              className="flex items-center gap-2.5 min-w-0 flex-1 text-left cursor-pointer border-0 bg-transparent p-0 group"
              title="Ir a Mi Perfil"
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-[11px] flex-shrink-0 shadow-xs border transition-transform group-hover:scale-105 ${
                  isDark
                    ? 'bg-zinc-800 text-zinc-200 border-white/10'
                    : 'bg-[#00345e] text-white border-[#00345e]/20'
                }`}
              >
                {getUserInitials()}
              </div>

              {!isCollapsed && (
                <div className="min-w-0 flex-1 truncate text-left">
                  <div className="flex items-center gap-1">
                    <p
                      className={`text-[10px] font-semibold uppercase tracking-wider leading-none ${
                        isDark ? 'text-zinc-500' : 'text-zinc-400'
                      }`}
                    >
                      Estudiante
                    </p>
                    <span className="text-[10px] text-[#00345e] dark:text-blue-400 font-medium">· Mi Perfil</span>
                  </div>
                  <p
                    className={`text-xs font-medium truncate mt-0.5 ${
                      isDark ? 'text-zinc-300' : 'text-zinc-800'
                    }`}
                  >
                    {user?.email || 'estudiante@uta.edu.ec'}
                  </p>
                </div>
              )}
            </button>

            {!isCollapsed && (
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(true)}
                className="p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer border-0 bg-transparent flex-shrink-0 ml-1"
                title="Cerrar Sesión"
                aria-label="Cerrar Sesión"
              >
                <ArrowLeftOnRectangleIcon className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Versión Footer */}
          {!isCollapsed && (
            <div className="text-center pt-0.5">
              <span
                className={`text-[10px] font-mono tracking-tight ${
                  isDark ? 'text-zinc-600' : 'text-zinc-400'
                }`}
              >
                Version v2.4.0
              </span>
            </div>
          )}
        </div>
      </aside>

      {/* Diálogo de Confirmación */}
      <ConfirmDialog
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogoutConfirm}
        title="¿Deseas cerrar sesión?"
        message="Se cerrará tu sesión activa en este dispositivo."
        confirmText="Cerrar Sesión"
        cancelText="Cancelar"
        type="danger"
      />
    </>
  );
}
