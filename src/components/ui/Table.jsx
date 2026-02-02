import { useState, useMemo } from "react";
import { ChevronLeftIcon, ChevronRightIcon, MagnifyingGlassIcon, FunnelIcon, ArrowPathIcon } from "@heroicons/react/24/outline";
import TableLoading from "./loadings/tableLoading";

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

  // Manejar cambio de búsqueda con debounce
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);
    if (onSearchChange) onSearchChange(value);
  };

  // Manejar filtro por columna
  const handleFilterChange = (column, value) => {
    setColumnFilters((prev) => ({ ...prev, [column]: value }));
    if (onFilterChange) {
      onFilterChange(column, value === "All" ? null : value);
    }
  };

  // Datos filtrados localmente si no es server-side
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

  // Helpers de Paginación
  const startRecord = filteredData.length > 0 ? (page - 1) * pageSize + 1 : 0;
  const endRecord = Math.min(page * pageSize, total);

  return (
    <div className="flex flex-col space-y-6">
      {/* Controles Superiores: Búsqueda y Filtros */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        {/* Input de Búsqueda y Refresh */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative w-full md:w-80 group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors group-focus-within:text-primary">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 group-focus-within:text-primary" aria-hidden="true" />
            </div>
            <input
              type="text"
              placeholder="Buscar..."
              value={search}
              onChange={handleSearchChange}
              className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary sm:text-sm transition-all duration-200 shadow-sm hover:border-gray-400"
            />
          </div>
          {onReload && (
            <button
              onClick={onReload}
              disabled={loading}
              className="p-2.5 bg-white border border-gray-300 rounded-lg text-gray-500 hover:text-primary hover:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200 shadow-sm"
              title="Recargar datos"
            >
              <ArrowPathIcon className={`h-5 w-5 ${loading ? 'animate-spin text-primary' : ''}`} />
            </button>
          )}
        </div>

        {/* Filtros dinámicos por columna */}
        <div className="flex flex-wrap gap-3">
          {headers.map((header) =>
            filters[header] ? (
              <div key={header} className="relative group">
                <select
                  value={columnFilters[header] || "All"}
                  onChange={(e) => handleFilterChange(header, e.target.value)}
                  className="appearance-none pl-4 pr-10 py-2.5 border border-gray-300 rounded-lg bg-white text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-sm hover:border-primary transition-all duration-200 cursor-pointer font-medium"
                >
                  <option value="All">Todos </option>
                  {filters[header].map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                  <FunnelIcon className="h-4 w-4 text-gray-400 group-hover:text-primary transition-colors duration-200" />
                </div>
              </div>
            ) : null
          )}
        </div>
      </div>

      {/* Tabla Principal */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr className="bg-primary">
                {headers.map((header, idx) => (
                  <th
                    key={idx}
                    scope="col"
                    className="px-6 py-5 text-left text-xs font-bold text-white uppercase tracking-wider whitespace-nowrap"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {loading ? (
                <TableLoading rows={pageSize} cols={headers.length} />
              ) : filteredData.length > 0 ? (
                filteredData.map((row, rowIndex) => (
                  <tr
                    key={rowIndex}
                    className="hover:bg-primary/5 transition-colors duration-200 group"
                  >
                    {headers.map((header, colIndex) => (
                      <td
                        key={colIndex}
                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 group-hover:text-gray-900 transition-colors"
                      >
                        <span className={`${colIndex === 0 ? 'font-semibold' : ''}`}>
                          {row[header]}
                        </span>
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={headers.length}
                    className="px-6 py-16 text-center"
                  >
                    <div className="flex flex-col items-center justify-center text-gray-400">
                      <div className="bg-gray-50 p-4 rounded-full mb-3">
                        <MagnifyingGlassIcon className="h-8 w-8 text-gray-400" />
                      </div>
                      <p className="text-base font-medium text-gray-600">No se encontraron resultados</p>
                      <p className="text-sm mt-1">Intenta ajustar tu búsqueda o filtros.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Barra de Paginación */}
        {total > 0 && (
          <div className="px-3 py-3 sm:px-4 sm:py-3 md:px-6 md:py-4 border-t border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row items-center justify-between gap-3">

            {/* Información de Registros */}
            <div className="text-xs md:text-sm text-gray-500 font-medium bg-white px-2.5 py-1 md:px-3 rounded-md border border-gray-200 shadow-sm order-last sm:order-first">
              <span className="text-primary font-bold">{startRecord}</span> - <span className="text-primary font-bold">{endRecord}</span> de <span className="text-gray-900">{total}</span>
            </div>
            {/* Controles de Navegación Custom */}
            <div className="flex items-center space-x-1.5 md:space-x-2">
              <button
                onClick={handlePrev}
                disabled={Number(page) <= 1 || loading}
                className={`
                    p-1.5 md:p-2 rounded-lg transition-all duration-200 flex items-center justify-center
                    ${Number(page) <= 1 || loading
                    ? 'bg-gray-100 text-gray-400 opacity-50 cursor-not-allowed'
                    : 'bg-white text-gray-600 hover:bg-primary hover:text-white border border-gray-200 shadow-sm hover:shadow-md'
                  }
                  `}
                title="Anterior"
              >
                <ChevronLeftIcon className="h-4 w-4 md:h-5 md:w-5" strokeWidth={2} />
              </button>

              <div className="flex items-center px-2.5 py-1.5 md:px-4 md:py-2 bg-white rounded-lg border border-gray-200 shadow-sm">
                <span className="text-xs md:text-sm font-medium text-gray-600 whitespace-nowrap">
                  <span className="hidden sm:inline">Pág. </span><span className="text-primary font-bold">{page}</span><span className="text-gray-400 mx-0.5">/</span><span className="text-gray-900">{totalPages}</span>
                </span>
              </div>

              <button
                onClick={handleNext}
                disabled={Number(page) >= Number(totalPages) || loading}
                className={`
                    p-1.5 md:p-2 rounded-lg transition-all duration-200 flex items-center justify-center
                    ${Number(page) >= Number(totalPages) || loading
                    ? 'bg-gray-100 text-gray-400 opacity-50 cursor-not-allowed'
                    : 'bg-white text-gray-600 hover:bg-primary hover:text-white border border-gray-200 shadow-sm hover:shadow-md'
                  }
                  `}
                title="Siguiente"
              >
                <ChevronRightIcon className="h-4 w-4 md:h-5 md:w-5" strokeWidth={2} />
              </button>
            </div>
            <div className="flex items-center gap-3 md:gap-5">
              {/* Selector de Filas */}
              <div className="flex items-center gap-2 bg-white px-2.5 py-1.5 md:px-3 rounded-lg border border-gray-200 shadow-sm text-xs md:text-sm">
                <span className="text-gray-400 uppercase font-semibold tracking-wide">Ver</span>
                <select
                  value={pageSize}
                  onChange={(e) => onPageSizeChange && onPageSizeChange(Number(e.target.value))}
                  className="font-medium text-gray-700 bg-transparent focus:outline-none cursor-pointer hover:text-primary transition-colors"
                >
                  {[10, 20, 50].map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
                <span className="text-gray-400">filas</span>
              </div>


            </div>
          </div>
        )}
      </div>
    </div>
  );
}
