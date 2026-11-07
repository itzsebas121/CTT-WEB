import { useState, useMemo } from "react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  XMarkIcon
} from "@heroicons/react/24/outline";
import TableLoading from "./loadings/tableLoading";
import { useDashboardTheme } from "../../context/DashboardThemeContext";

export default function Table({
  headers = [],
  data = [],
  filters = {},
  page = 1,
  pageSize = 10,
  total = 0,
  totalPages = 1,
  loading = false,
  onPageChange,
  onPageSizeChange,
  onFilterChange,
  onSearchChange,
  onReload,
}) {
  const [search, setSearch] = useState("");
  const [columnFilters, setColumnFilters] = useState({});
  const { isDark } = useDashboardTheme();

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);
    if (onSearchChange) onSearchChange(value);
  };

  const handleClearSearch = () => {
    setSearch("");
    if (onSearchChange) onSearchChange("");
  };

  const handleFilterChange = (column, value) => {
    setColumnFilters((prev) => ({ ...prev, [column]: value }));
    if (onFilterChange) {
      onFilterChange(column, value === "All" ? null : value);
    }
  };

  const filteredData = useMemo(() => {
    if (onSearchChange) return data;

    return data.filter((row) => {
      const matchesSearch = !search
        ? true
        : headers.some((header) =>
            String(row[header]).toLowerCase().includes(search.toLowerCase())
          );

      const matchesFilters = headers.every((header) => {
        if (!columnFilters[header] || columnFilters[header] === "All") return true;
        return String(row[header]) === columnFilters[header];
      });

      return matchesSearch && matchesFilters;
    });
  }, [search, columnFilters, data, headers, onSearchChange]);

  const handlePrev = () => {
    if (onPageChange && page > 1) onPageChange(page - 1);
  };
  const handleNext = () => {
    if (onPageChange && page < totalPages) onPageChange(page + 1);
  };

  const startRecord = filteredData.length > 0 ? (page - 1) * pageSize + 1 : 0;
  const endRecord = Math.min(page * pageSize, total);

  const formatHeaderName = (header) => {
    const map = {
      titulo: "Título del Curso",
      categoria: "Categoría",
      horas: "Duración",
      modalidad: "Modalidad",
      detalles: "Acciones",
      estado: "Estado",
      precio: "Inversión",
      fecha_inscripcion: "Fecha de Registro"
    };
    return map[header.toLowerCase()] || header.charAt(0).toUpperCase() + header.slice(1);
  };

  return (
    <div className="w-full space-y-3">
      {/* Barra de Filtros y Búsqueda Dokploy Style (Claro / Oscuro) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Input de Búsqueda */}
          <div className="relative w-full sm:w-72">
            <label htmlFor="dokploy-table-search" className="sr-only">
              Buscar curso
            </label>
            <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none ${
              isDark ? 'text-zinc-500' : 'text-zinc-400'
            }`}>
              <MagnifyingGlassIcon className="h-4 w-4" aria-hidden="true" />
            </div>
            <input
              id="dokploy-table-search"
              type="search"
              placeholder="Buscar curso por nombre..."
              value={search}
              onChange={handleSearchChange}
              className={`w-full h-9 pl-9 pr-7 text-xs rounded-lg outline-none transition-colors border ${
                isDark
                  ? 'bg-[#16161a] border-white/[0.08] text-zinc-100 placeholder:text-zinc-500 focus:border-[#00345e] focus:ring-1 focus:ring-[#00345e]/40'
                  : 'bg-white border-zinc-200 text-zinc-900 placeholder:text-zinc-400 focus:border-[#00345e] focus:ring-1 focus:ring-[#00345e]/40 shadow-xs'
              }`}
            />
            {search && (
              <button
                type="button"
                onClick={handleClearSearch}
                className={`absolute right-2.5 top-1/2 -translate-y-1/2 border-0 bg-transparent cursor-pointer p-0.5 ${
                  isDark ? 'text-zinc-500 hover:text-zinc-200' : 'text-zinc-400 hover:text-zinc-700'
                }`}
                title="Limpiar búsqueda"
                aria-label="Limpiar búsqueda"
              >
                <XMarkIcon className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {onReload && (
            <button
              type="button"
              onClick={onReload}
              disabled={loading}
              className={`h-9 w-9 flex items-center justify-center rounded-lg transition-colors cursor-pointer border disabled:opacity-50 ${
                isDark
                  ? 'bg-[#16161a] border-white/[0.08] text-zinc-400 hover:text-white hover:bg-white/[0.04]'
                  : 'bg-white border-zinc-200 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 shadow-xs'
              }`}
              title="Recargar listado"
              aria-label="Recargar listado"
            >
              <ArrowPathIcon className={`h-4 w-4 ${loading ? 'animate-spin text-[#00345e]' : ''}`} />
            </button>
          )}
        </div>

        {/* Filtros por columna */}
        <div className="flex flex-wrap items-center gap-2">
          {headers.map((header) =>
            filters[header] ? (
              <div key={header} className="inline-flex items-center gap-1.5">
                <label htmlFor={`dokploy-filter-${header}`} className={`text-xs font-medium ${
                  isDark ? 'text-zinc-400' : 'text-zinc-600'
                }`}>
                  {formatHeaderName(header)}:
                </label>
                <select
                  id={`dokploy-filter-${header}`}
                  value={columnFilters[header] || "All"}
                  onChange={(e) => handleFilterChange(header, e.target.value)}
                  className={`h-9 px-3 text-xs font-medium rounded-lg outline-none cursor-pointer border ${
                    isDark
                      ? 'bg-[#16161a] border-white/[0.08] text-zinc-200 focus:border-[#00345e]'
                      : 'bg-white border-zinc-200 text-zinc-800 focus:border-[#00345e] shadow-xs'
                  }`}
                >
                  <option value="All">Todas</option>
                  {filters[header].map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            ) : null
          )}
        </div>
      </div>

      {/* Tarjeta de Tabla: Dokploy Floating Card con bordes redondeados */}
      <div className={`w-full rounded-xl overflow-hidden border transition-colors ${
        isDark
          ? 'bg-[#16161a] border-white/[0.08] shadow-lg'
          : 'bg-white border-black/[0.08] shadow-xs'
      }`}>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left border-collapse" aria-label="Tabla de cursos disponibles">
            <thead>
              <tr className={`border-b ${
                isDark ? 'bg-[#121215] border-white/[0.08]' : 'bg-zinc-50/80 border-black/[0.06]'
              }`}>
                {headers.map((header, idx) => {
                  const isActions = header.toLowerCase() === 'detalles';
                  return (
                    <th
                      key={idx}
                      scope="col"
                      className={`py-3 px-4 sm:px-5 text-[11px] font-semibold uppercase tracking-wider whitespace-nowrap ${
                        isDark ? 'text-zinc-400' : 'text-zinc-600'
                      } ${isActions ? 'text-right' : 'text-left'}`}
                    >
                      {formatHeaderName(header)}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className={`divide-y ${
              isDark ? 'divide-white/[0.04] bg-[#16161a]' : 'divide-black/[0.04] bg-white'
            }`}>
              {loading ? (
                <TableLoading rows={pageSize} cols={headers.length} />
              ) : filteredData.length > 0 ? (
                filteredData.map((row, rowIndex) => (
                  <tr
                    key={rowIndex}
                    className={`transition-colors ${
                      isDark ? 'hover:bg-white/[0.02]' : 'hover:bg-zinc-50/80'
                    }`}
                  >
                    {headers.map((header, colIndex) => {
                      const isActions = header.toLowerCase() === 'detalles';
                      return (
                        <td
                          key={colIndex}
                          className={`py-3.5 px-4 sm:px-5 text-xs sm:text-sm align-middle ${
                            isDark ? 'text-zinc-300' : 'text-zinc-800'
                          } ${isActions ? 'text-right' : 'text-left'}`}
                        >
                          {row[header]}
                        </td>
                      );
                    })}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={headers.length}
                    className="py-14 px-4 text-center"
                  >
                    <p className={`text-sm font-semibold ${isDark ? 'text-zinc-200' : 'text-zinc-800'}`}>
                      No se encontraron cursos
                    </p>
                    <p className={`text-xs mt-1 ${isDark ? 'text-zinc-500' : 'text-zinc-500'}`}>
                      No hay registros que coincidan con el término de búsqueda o filtro seleccionado.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Barra de Paginación Dokploy */}
        {total > 0 && (
          <div className={`px-4 sm:px-5 py-3 border-t flex flex-col sm:flex-row items-center justify-between gap-3 text-xs ${
            isDark ? 'border-white/[0.06] bg-[#121215]/60 text-zinc-400' : 'border-black/[0.06] bg-zinc-50/50 text-zinc-600'
          }`}>
            <span>
              Mostrando <strong className={isDark ? 'text-zinc-200 font-semibold' : 'text-zinc-900 font-semibold'}>{startRecord}</strong> a{" "}
              <strong className={isDark ? 'text-zinc-200 font-semibold' : 'text-zinc-900 font-semibold'}>{endRecord}</strong> de{" "}
              <strong className={isDark ? 'text-zinc-200 font-semibold' : 'text-zinc-900 font-semibold'}>{total}</strong> cursos
            </span>

            <div className="flex items-center gap-3">
              <nav aria-label="Navegación de páginas" className="inline-flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handlePrev}
                  disabled={Number(page) <= 1 || loading}
                  className={`h-8 px-2.5 flex items-center gap-1 rounded-lg border disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer text-xs font-medium ${
                    isDark
                      ? 'border-white/10 bg-zinc-800/80 text-zinc-300 hover:text-white hover:bg-zinc-700'
                      : 'border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-100 shadow-xs'
                  }`}
                  aria-label="Ir a la página anterior"
                >
                  <ChevronLeftIcon className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Anterior</span>
                </button>

                <span className={`px-2.5 py-1 font-medium rounded-lg text-xs border ${
                  isDark ? 'text-zinc-200 bg-zinc-800 border-white/10' : 'text-zinc-900 bg-white border-zinc-200 shadow-xs'
                }`} aria-current="page">
                  {page} de {totalPages}
                </span>

                <button
                  type="button"
                  onClick={handleNext}
                  disabled={Number(page) >= Number(totalPages) || loading}
                  className={`h-8 px-2.5 flex items-center gap-1 rounded-lg border disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer text-xs font-medium ${
                    isDark
                      ? 'border-white/10 bg-zinc-800/80 text-zinc-300 hover:text-white hover:bg-zinc-700'
                      : 'border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-100 shadow-xs'
                  }`}
                  aria-label="Ir a la página siguiente"
                >
                  <span className="hidden sm:inline">Siguiente</span>
                  <ChevronRightIcon className="h-3.5 w-3.5" />
                </button>
              </nav>

              <div className={`inline-flex items-center gap-1.5 pl-3 border-l ${
                isDark ? 'border-white/[0.08] text-zinc-400' : 'border-zinc-200 text-zinc-600'
              }`}>
                <span>Filas:</span>
                <select
                  value={pageSize}
                  onChange={(e) => onPageSizeChange && onPageSizeChange(Number(e.target.value))}
                  className={`h-8 px-2 font-medium rounded-lg cursor-pointer outline-none text-xs border ${
                    isDark ? 'text-zinc-200 bg-zinc-800 border-white/10' : 'text-zinc-800 bg-white border-zinc-200 shadow-xs'
                  }`}
                  aria-label="Número de cursos por página"
                >
                  {[7, 10, 20, 50].map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
