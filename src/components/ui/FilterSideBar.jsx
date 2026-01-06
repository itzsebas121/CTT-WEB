// components/FilterSidebar.jsx
import { useEffect, useState } from "react";
import {
  CpuChipIcon,
  BuildingLibraryIcon,
  CommandLineIcon,
  ComputerDesktopIcon,
  FunnelIcon,
  XMarkIcon,
  UsersIcon
} from "@heroicons/react/24/outline";

const categories = [
  { id: 1, text: "TICS", icon: ComputerDesktopIcon },
  { id: 2, text: "Educativo", icon: BuildingLibraryIcon },
  { id: 3, text: "Software", icon: CommandLineIcon },
  { id: 4, text: "Electrónica", icon: CpuChipIcon },
  { id: 5, text: "Congresos", icon: UsersIcon },
];

export default function FilterSidebar({ filters, setFilters }) {
  const [open, setOpen] = useState(false);

  // Previene scroll de fondo cuando el drawer está abierto
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => (document.body.style.overflow = "");
  }, [open]);

  const handleChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const resetFilters = () => {
    setFilters({
      search: "",
      category: "",
      status: "",
      modality: "",
      duration: "",
    });

    // Forzar actualización del componente para limpiar estados de hover/focus
    setTimeout(() => {
      document.activeElement?.blur();
    }, 100);
  };

  const FiltersContent = (
    <div className="min-h-0"> {/* min-h-0 evita que el contenido estire contenedores padres */}
      <h2 className="text-xl font-semibold text-[#6C1313] mb-6">Filtros</h2>

      {/* Buscar */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Buscar por nombre
        </label>
        <input
          type="text"
          value={filters.search}
          onChange={(e) => handleChange("search", e.target.value)}
          placeholder="Ej: Arduino"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#6C1313]"
        />
      </div>

      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Categorías</h3>
        <div className="space-y-3">
          {/* Opción para mostrar todas las categorías */}
          <label className="flex items-center gap-3 cursor-pointer group transition-all duration-200 hover:bg-gray-50 p-2 rounded-lg -m-2">
            <div className="relative">
              <input
                type="radio"
                name="category"
                value=""
                checked={filters.category === ""}
                onChange={(e) => handleChange("category", e.target.value)}
                className="sr-only"
              />
                <div className={`
                  w-5 h-5 border-2 rounded-full transition-all duration-200 flex items-center justify-center
                  ${filters.category === ""
                    ? 'bg-[#6C1313] border-[#6C1313] text-white'
                    : 'bg-white border-gray-300 hover:border-[#6C1313] hover:shadow-sm focus:outline-none focus:border-[#6C1313] focus:shadow-md active:border-[#6C1313] active:shadow-sm'
                  }
                `}>
                {filters.category === "" && (
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                )}
              </div>
            </div>
            <span className={`
              flex items-center gap-3 text-sm transition-all duration-200
              ${filters.category === ""
                ? 'text-[#6C1313] font-medium'
                : 'text-gray-700 group-hover:text-gray-900'
              }
            `}>
              <span className={`
                w-6 h-6 flex items-center justify-center transition-all duration-200
                ${filters.category === ""
                  ? 'text-[#6C1313]'
                  : 'text-gray-600 group-hover:text-gray-700'
                }
              `}>
                ⊙
              </span>
              Todas las categorías
            </span>
          </label>

          {categories.map((cat) => (
            <label key={cat.id} className="flex items-center gap-3 cursor-pointer group transition-all duration-200 hover:bg-gray-50 p-2 rounded-lg -m-2">
              <div className="relative">
                <input
                  type="radio"
                  name="category"
                  value={cat.text}
                  checked={filters.category === cat.text}
                  onChange={(e) => handleChange("category", e.target.value)}
                  className="sr-only"
                />
                <div className={`
                  w-5 h-5 border-2 rounded-full transition-all duration-200 flex items-center justify-center
                  ${filters.category === cat.text
                    ? 'bg-[#6C1313] border-[#6C1313] text-white'
                    : 'bg-white border-gray-300 hover:border-[#6C1313] hover:shadow-sm focus:outline-none focus:border-[#6C1313] focus:shadow-md active:border-[#6C1313] active:shadow-sm'
                  }
                `}>
                  {filters.category === cat.text && (
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  )}
                </div>
              </div>
              <span className={`
                flex items-center gap-3 text-sm transition-all duration-200
                ${filters.category === cat.text
                  ? 'text-[#6C1313] font-medium'
                  : 'text-gray-700 group-hover:text-gray-900'
                }
              `}>
                <cat.icon className={`
                  h-6 w-6 transition-all duration-200
                  ${filters.category === cat.text
                    ? 'text-[#6C1313]'
                    : 'text-gray-600 group-hover:text-gray-700'
                  }
                `} />
                {cat.text}
              </span>
            </label>
          ))}
        </div>
      </div>


      {/* Modalidad */}
      <div className="mb-4">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Modalidad</h3>
        <select
          value={filters.modality}
          onChange={(e) => handleChange("modality", e.target.value)}
          className="w-full text-black rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#6C1313]"
        >
          <option value="">Todos</option>
          <option value="presencial">Presencial</option>
          <option value="virtual">Virtual</option>
        </select>
      </div>

      {/* Duración */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-700 mb-3">
          Duración (horas)
        </h3>
        <div className="space-y-3">
          {/* Opción para mostrar todas las duraciones */}
          <label className="flex items-center gap-3 cursor-pointer group transition-all duration-200 hover:bg-gray-50 p-2 rounded-lg -m-2">
            <div className="relative">
              <input
                type="radio"
                name="duration"
                value=""
                checked={filters.duration === ""}
                onChange={(e) => handleChange("duration", e.target.value)}
                className="sr-only"
              />
                <div className={`
                  w-5 h-5 border-2 rounded-full transition-all duration-200 flex items-center justify-center
                  ${filters.duration === ""
                    ? 'bg-[#6C1313] border-[#6C1313] text-white'
                    : 'bg-white border-gray-300 hover:border-[#6C1313] hover:shadow-sm focus:outline-none focus:border-[#6C1313] focus:shadow-md active:border-[#6C1313] active:shadow-sm'
                  }
                `}>
                {filters.duration === "" && (
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                )}
              </div>
            </div>
            <span className={`
              flex items-center gap-3 text-sm transition-all duration-200
              ${filters.duration === ""
                ? 'text-[#6C1313] font-medium'
                : 'text-gray-700 group-hover:text-gray-900'
              }
            `}>
              Todas las duraciones
            </span>
          </label>

          {[
            { id: 'less10', text: 'Menos de 10 horas', range: [0, 9] },
            { id: '10to19', text: 'Entre 10 a 19 horas', range: [10, 19] },
            { id: '20to59', text: 'Entre 20 a 59 horas', range: [20, 59] },
            { id: '60to99', text: 'Entre 60 a 99 horas', range: [60, 99] },
            { id: '100plus', text: 'Más de 100 horas', range: [100, Infinity] },
          ].map((duration) => (
            <label key={duration.id} className="flex items-center gap-3 cursor-pointer group transition-all duration-200 hover:bg-gray-50 p-2 rounded-lg -m-2">
              <div className="relative">
                <input
                  type="radio"
                  name="duration"
                  value={duration.id}
                  checked={filters.duration === duration.id}
                  onChange={(e) => handleChange("duration", e.target.value)}
                  className="sr-only"
                />
                <div className={`
                  w-5 h-5 border-2 rounded-full transition-all duration-200 flex items-center justify-center
                  ${filters.duration === duration.id
                    ? 'bg-[#6C1313] border-[#6C1313] text-white'
                    : 'bg-white border-gray-300 hover:border-[#6C1313] hover:shadow-sm focus:outline-none focus:border-[#6C1313] focus:shadow-md active:border-[#6C1313] active:shadow-sm'
                  }
                `}>
                  {filters.duration === duration.id && (
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  )}
                </div>
              </div>
              <span className={`
                flex items-center gap-3 text-sm transition-all duration-200
                ${filters.duration === duration.id
                  ? 'text-[#6C1313] font-medium'
                  : 'text-gray-700 group-hover:text-gray-900'
                }
              `}>
                {duration.text}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="mt-6 flex gap-2">
        <button
          onClick={resetFilters}
          className="flex-1 bg-[#6C1313] text-white py-2 rounded-lg text-sm transition-all duration-200 hover:bg-[#5a0f0f] focus:outline-none focus:bg-[#5a0f0f] focus:ring-2 focus:ring-[#6C1313] focus:ring-opacity-50 active:bg-[#4a0c0c]"
        >
          Limpiar
        </button>
      </div>
    </div>
  );

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden fixed bottom-6 right-4 z-40 flex items-center gap-2 bg-white shadow-lg px-4 py-3 rounded-full border"
        aria-label="Abrir filtros"
        type="button"
      >
        <FunnelIcon className="h-5 w-5 text-white" />
        <span className="text-sm font-medium text-white">Filtros</span>
      </button>

      {/* Sidebar para desktop */}
      <aside className="hidden lg:block w-72 bg-white border-r border-gray-200 p-6 sticky top-50 h-[calc(100vh-1.5rem)] overflow-y-auto">
        {FiltersContent}
      </aside>

      {/* Drawer móvil */}
      {open && (
        <div className="fixed inset-0 z-50 flex">
          {/* overlay */}
          <div
            className="absolute inset-0 bg-opacity-40"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          {/* panel */}
          <div className="relative w-80 max-w-full h-full bg-white p-6 shadow-xl overflow-y-auto">
            <button
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4 text-gray-600"
              aria-label="Cerrar filtros"
              type="button"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>

            {FiltersContent}
          </div>
        </div>
      )}
    </>
  );
}
