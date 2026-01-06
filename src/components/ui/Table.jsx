import { useState, useMemo } from "react";

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
}) {
  const [search, setSearch] = useState("");
  const [columnFilters, setColumnFilters] = useState({});

  // Manejar cambio de búsqueda con debounce
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);

    // Si hay callback de búsqueda del padre, usarlo
    if (onSearchChange) {
      onSearchChange(value);
    }
  };

  // Manejar filtro por columna
  const handleFilterChange = (column, value) => {
    setColumnFilters((prev) => ({ ...prev, [column]: value }));

    // Notificar al padre para que haga fetch si es necesario
    if (onFilterChange && value !== "All") {
      onFilterChange(column, value);
    } else if (onFilterChange && value === "All") {
      // Si selecciona "All", notificar con null para limpiar filtro
      onFilterChange(column, null);
    }
  };

  // Datos filtrados: solo si NO hay onSearchChange (búsqueda local)
  const filteredData = useMemo(() => {
    // Si hay búsqueda del servidor, no filtrar localmente
    if (onSearchChange) {
      return data;
    }

    return data.filter((row) => {
      // Búsqueda global
      const matchesSearch = !search
        ? true
        : headers.some((header) =>
            String(row[header]).toLowerCase().includes(search.toLowerCase())
          );

      // Filtros por columna
      const matchesFilters = headers.every((header) => {
        if (!columnFilters[header] || columnFilters[header] === "All")
          return true;
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
  const handlePageSize = (e) => {
    const newSize = parseInt(e.target.value, 10);
    if (onPageSizeChange) onPageSizeChange(newSize);
  };
  const handleJumpTo = (e) => {
    const v = parseInt(e.target.value, 10);
    if (!isNaN(v) && onPageChange) {
      const target = Math.min(Math.max(1, v), totalPages);
      onPageChange(target);
    }
  };

  return (
    <div className="flex flex-col space-y-4">
      {/* Controles de búsqueda */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
        <input
          type="text"
          placeholder="Buscar..."
          value={search}
          onChange={handleSearchChange}
          className="px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#6C1313] focus:border-[#6C1313]"
        />

        {/* Filtros por columna */}
        <div className="flex flex-wrap gap-2">
          {headers.map(
            (header) =>
              filters[header] && (
                <select
                  key={header}
                  value={columnFilters[header] || "All"}
                  onChange={(e) => handleFilterChange(header, e.target.value)}
                  className="px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#6C1313] focus:border-[#6C1313] text-sm"
                >
                  <option value="All">Todos {header}</option>
                  {filters[header].map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              )
          )}
        </div>
      </div>

      {/* Tabla */}
      <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
          <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-[#6C1313]">
                <tr>
                  {headers.map((header, idx) => (
                    <th
                      key={idx}
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredData.length > 0 ? (
                  filteredData.map((row, rowIndex) => (
                    <tr
                      key={rowIndex}
                      className={
                        rowIndex % 2 === 0
                          ? "bg-white hover:bg-gray-100"
                          : "bg-gray-50 hover:bg-gray-100"
                      }
                    >
                      {headers.map((header, colIndex) => (
                        <td
                          key={colIndex}
                          className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900"
                        >
                          {row[header]}
                        </td>
                      ))}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={headers.length}
                      className="px-6 py-4 text-center text-sm text-gray-500"
                    >
                      No se encontraron resultados
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Paginación dentro de Table */}
      <div className="flex items-center justify-between mt-3">
        <div className="text-sm text-gray-700">
          {loading
            ? "Cargando..."
            : `Mostrando página ${page} de ${totalPages} — ${total} registros`}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrev}
            disabled={loading || page <= 1}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Prev
          </button>

          <div className="flex items-center gap-2">
            <label className="text-sm">Ir a</label>
            <input
              type="number"
              min={1}
              max={totalPages}
              value={page}
              onChange={handleJumpTo}
              className="w-16 border rounded p-1"
            />
            <span className="text-sm">/ {totalPages}</span>
          </div>

          <button
            onClick={handleNext}
            disabled={loading || page >= totalPages}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>

          <label className="text-sm ml-2">Filas:</label>
          <select
            value={pageSize}
            onChange={handlePageSize}
            className="border rounded p-1"
          >
            <option value={7}>7</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>
    </div>
  );
}
