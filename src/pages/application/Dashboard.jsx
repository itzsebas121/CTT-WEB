import { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Menu } from '../../components/layout';
import {
  DashboardThemeProvider,
  useDashboardTheme
} from '../../context/DashboardThemeContext';
import {
  Squares2X2Icon,
  SunIcon,
  MoonIcon
} from '@heroicons/react/24/outline';

function DashboardInner() {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem('sidebar_collapsed') === 'true';
  });
  const { isDark, toggleTheme } = useDashboardTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const handleToggleSidebar = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('sidebar_collapsed', String(next));
      return next;
    });
  };

  // Helper para generar el breadcrumb según la ruta activa
  const getBreadcrumbs = () => {
    const path = location.pathname;
    if (path.includes('/dashboard/cursos/disponibles')) {
      return [
        { name: 'Home', path: '/' },
        { name: 'Cursos', path: '/dashboard/cursos/disponibles' },
        { name: 'Disponibles', active: true }
      ];
    }
    if (path.includes('/dashboard/cursos/inscrito')) {
      return [
        { name: 'Home', path: '/' },
        { name: 'Cursos', path: '/dashboard/cursos/disponibles' },
        { name: 'Mis Cursos', active: true }
      ];
    }
    if (path.includes('/dashboard/curso/')) {
      return [
        { name: 'Home', path: '/' },
        { name: 'Cursos', path: '/dashboard/cursos/disponibles' },
        { name: 'Detalle del Curso', active: true }
      ];
    }
    if (path.includes('/dashboard/congresos/disponibles')) {
      return [
        { name: 'Home', path: '/' },
        { name: 'Congresos', path: '/dashboard/congresos/disponibles' },
        { name: 'Disponibles', active: true }
      ];
    }
    if (path.includes('/dashboard/congreso/')) {
      return [
        { name: 'Home', path: '/' },
        { name: 'Congresos', path: '/dashboard/congresos/disponibles' },
        { name: 'Detalle del Congreso', active: true }
      ];
    }
    if (path.includes('/dashboard/ordenes/pendientes')) {
      return [
        { name: 'Home', path: '/' },
        { name: 'Órdenes', path: '/dashboard/ordenes/pendientes' },
        { name: 'Pendientes', active: true }
      ];
    }
    if (path.includes('/dashboard/ordenes/completadas')) {
      return [
        { name: 'Home', path: '/' },
        { name: 'Órdenes', path: '/dashboard/ordenes/pendientes' },
        { name: 'Completadas', active: true }
      ];
    }
    return [
      { name: 'Home', path: '/' },
      { name: 'Dashboard', active: true }
    ];
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <div
      className={`flex h-screen w-screen overflow-hidden p-2 sm:p-2.5 gap-2 sm:gap-3 transition-colors duration-200 ${
        isDark ? 'bg-[#09090b] text-zinc-100' : 'bg-[#f4f4f6] text-zinc-800'
      }`}
    >
      {/* Sidebar estilo flotante (claro / oscuro) */}
      <Menu isCollapsed={isCollapsed} onToggleCollapse={handleToggleSidebar} />

      {/* Contenedor Flotante Principal con esquinas redondeadas y borde */}
      <div
        className={`flex-1 h-full rounded-2xl flex flex-col overflow-hidden relative min-w-0 transition-all duration-200 ${
          isDark
            ? 'bg-[#121215] border border-white/[0.08] shadow-2xl'
            : 'bg-white border border-black/[0.08] shadow-sm'
        }`}
      >
        {/* Barra superior */}
        <header
          className={`h-12 border-b px-4 flex items-center justify-between flex-shrink-0 backdrop-blur-md z-10 select-none transition-colors duration-200 ${
            isDark
              ? 'bg-[#121215]/95 border-white/[0.06] text-zinc-300'
              : 'bg-white/95 border-black/[0.06] text-zinc-700'
          }`}
        >
          {/* Lado izquierdo: Botón Toggle + Breadcrumb */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={handleToggleSidebar}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer border ${
                isDark
                  ? 'text-zinc-400 hover:text-white hover:bg-white/[0.06] border-transparent hover:border-white/[0.06]'
                  : 'text-zinc-600 hover:text-zinc-900 hover:bg-black/[0.04] border-transparent hover:border-black/[0.06]'
              }`}
              title={isCollapsed ? "Expandir barra lateral" : "Contraer barra lateral"}
              aria-label="Alternar barra lateral"
            >
              <Squares2X2Icon className="w-4 h-4" />
            </button>

            <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs font-medium truncate">
              {breadcrumbs.map((crumb, idx) => {
                const isLast = idx === breadcrumbs.length - 1;
                return (
                  <div key={idx} className="flex items-center gap-1.5">
                    {idx > 0 && (
                      <span className={isDark ? 'text-zinc-600' : 'text-zinc-400'}>/</span>
                    )}
                    {isLast ? (
                      <span className={`font-semibold truncate ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}>
                        {crumb.name}
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => navigate(crumb.path)}
                        className={`transition-colors cursor-pointer border-0 bg-transparent p-0 truncate ${
                          isDark ? 'text-zinc-400 hover:text-white' : 'text-zinc-500 hover:text-zinc-900'
                        }`}
                      >
                        {crumb.name}
                      </button>
                    )}
                  </div>
                );
              })}
            </nav>
          </div>

          {/* Lado derecho: Selector de Tema Claro / Oscuro */}
          <div className="flex items-center gap-2 text-xs flex-shrink-0">
            <button
              type="button"
              onClick={toggleTheme}
              className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer border flex items-center gap-1.5 ${
                isDark
                  ? 'text-amber-400 hover:text-amber-300 hover:bg-white/[0.06] border-white/10'
                  : 'text-zinc-600 hover:text-zinc-900 hover:bg-black/[0.04] border-zinc-200 shadow-xs'
              }`}
              title={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
              aria-label="Cambiar tema"
            >
              {isDark ? (
                <>
                  <SunIcon className="w-4 h-4" />
                  <span className="text-xs font-medium text-zinc-300">Modo Claro</span>
                </>
              ) : (
                <>
                  <MoonIcon className="w-4 h-4" />
                  <span className="text-xs font-medium text-zinc-700">Modo Oscuro</span>
                </>
              )}
            </button>
          </div>
        </header>

        {/* Área de Contenido Principal desplazable */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default function Dashboard() {
  return <DashboardInner />;
}
