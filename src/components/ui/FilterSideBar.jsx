import { useEffect, useState } from "react";
import {
  CpuChipIcon,
  FunnelIcon,
  Squares2X2Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { getCategoriesEnabled } from "../../api/categories";
import { useDashboardTheme } from "../../context/DashboardThemeContext";

export default function FilterSideBar({ filters, setFilters }) {
  const [open, setOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const { isDark } = useDashboardTheme();

  // Previene scroll de fondo cuando el drawer está abierto en móvil
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => (document.body.style.overflow = "");
  }, [open]);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categoriesApi = await getCategoriesEnabled();
        const normalizedCategories = Array.isArray(categoriesApi)
          ? categoriesApi.map((cat) => ({
              id: cat.id,
              text: cat.name,
              icon: CpuChipIcon,
            }))
          : [];

        setCategories(normalizedCategories);
      } catch (error) {
        console.error("Error al cargar categorías:", error);
        setCategories([]);
      }
    };

    loadCategories();
  }, []);

  const handleChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const isCategorySelected = (categoryId) =>
    String(filters.category) === String(categoryId);

  const resetFilters = () => {
    setFilters({
      search: "",
      category: "",
      status: "",
      modality: "",
      duration: "",
    });

    setTimeout(() => {
      document.activeElement?.blur();
    }, 100);
  };

  const durationOptions = [
    { id: "less10", text: "Menos de 10 horas" },
    { id: "10to19", text: "Entre 10 a 19 horas" },
    { id: "20to59", text: "Entre 20 a 59 horas" },
    { id: "60to99", text: "Entre 60 a 99 horas" },
    { id: "100plus", text: "Más de 100 horas" },
  ];

  const FiltersContent = (
    <div className="space-y-4">
      <div className="pb-2.5 border-b border-black/[0.06] dark:border-white/[0.08]">
        <h2 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-white">
          Filtros
        </h2>
      </div>

      {/* Buscar por nombre */}
      <div>
        <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
          Buscar por nombre
        </label>
        <input
          type="text"
          value={filters.search}
          onChange={(e) => handleChange("search", e.target.value)}
          placeholder="Ej: Arduino, Python, React..."
          className="w-full rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50/50 dark:bg-white/[0.03] text-zinc-900 dark:text-white px-3 py-1.5 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-[#00345e] dark:focus:ring-blue-500 placeholder-zinc-400 dark:placeholder-zinc-500 transition-all"
        />
      </div>

      {/* Categorías */}
      <div>
        <h3 className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
          Categorías
        </h3>
        <div className="space-y-0.5">
          {/* Todas las categorías */}
          <label className="flex items-center gap-2.5 cursor-pointer group transition-colors hover:bg-zinc-100/80 dark:hover:bg-white/[0.04] py-1.5 px-2 rounded-lg -mx-1">
            <div className="relative flex-shrink-0">
              <input
                type="radio"
                name="category"
                value=""
                checked={filters.category === ""}
                onChange={(e) => handleChange("category", e.target.value)}
                className="sr-only"
              />
              <div
                className={`w-3.5 h-3.5 border-2 rounded-full transition-all flex items-center justify-center ${
                  filters.category === ""
                    ? "bg-[#00345e] border-[#00345e] dark:bg-blue-600 dark:border-blue-600"
                    : "bg-white dark:bg-zinc-800 border-zinc-300 dark:border-zinc-600 group-hover:border-[#00345e]"
                }`}
              >
                {filters.category === "" && (
                  <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                )}
              </div>
            </div>
            <span
              className={`flex items-center gap-2 text-xs sm:text-sm transition-colors ${
                filters.category === ""
                  ? "text-[#00345e] dark:text-blue-400 font-semibold"
                  : "text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-white font-medium"
              }`}
            >
              <Squares2X2Icon className="w-3.5 h-3.5 flex-shrink-0 opacity-80" />
              <span>Todas las categorías</span>
            </span>
          </label>

          {/* Categorías individuales */}
          {categories.map((cat) => {
            const isSelected = isCategorySelected(cat.id);
            return (
              <label
                key={cat.id}
                className="flex items-center gap-2.5 cursor-pointer group transition-colors hover:bg-zinc-100/80 dark:hover:bg-white/[0.04] py-1.5 px-2 rounded-lg -mx-1"
              >
                <div className="relative flex-shrink-0">
                  <input
                    type="radio"
                    name="category"
                    value={String(cat.id)}
                    checked={isSelected}
                    onChange={(e) => handleChange("category", e.target.value)}
                    className="sr-only"
                  />
                  <div
                    className={`w-3.5 h-3.5 border-2 rounded-full transition-all flex items-center justify-center ${
                      isSelected
                        ? "bg-[#00345e] border-[#00345e] dark:bg-blue-600 dark:border-blue-600"
                        : "bg-white dark:bg-zinc-800 border-zinc-300 dark:border-zinc-600 group-hover:border-[#00345e]"
                    }`}
                  >
                    {isSelected && (
                      <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                    )}
                  </div>
                </div>
                <span
                  className={`flex items-center gap-2 text-xs sm:text-sm transition-colors ${
                    isSelected
                      ? "text-[#00345e] dark:text-blue-400 font-semibold"
                      : "text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-white font-medium"
                  }`}
                >
                  <cat.icon className="w-3.5 h-3.5 flex-shrink-0 opacity-80" />
                  <span className="truncate">{cat.text}</span>
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Modalidad */}
      <div>
        <h3 className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
          Modalidad
        </h3>
        <select
          value={filters.modality}
          onChange={(e) => handleChange("modality", e.target.value)}
          className="w-full rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50/50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 px-3 py-1.5 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-[#00345e] dark:focus:ring-blue-500 transition-colors"
        >
          <option value="">Todas las modalidades</option>
          <option value="presencial">Presencial</option>
          <option value="virtual">Virtual</option>
          <option value="híbrido">Híbrido</option>
        </select>
      </div>

      {/* Duración (horas) */}
      <div>
        <h3 className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
          Duración (horas)
        </h3>
        <div className="space-y-0.5">
          {/* Todas las duraciones */}
          <label className="flex items-center gap-2.5 cursor-pointer group transition-colors hover:bg-zinc-100/80 dark:hover:bg-white/[0.04] py-1.5 px-2 rounded-lg -mx-1">
            <div className="relative flex-shrink-0">
              <input
                type="radio"
                name="duration"
                value=""
                checked={filters.duration === ""}
                onChange={(e) => handleChange("duration", e.target.value)}
                className="sr-only"
              />
              <div
                className={`w-3.5 h-3.5 border-2 rounded-full transition-all flex items-center justify-center ${
                  filters.duration === ""
                    ? "bg-[#00345e] border-[#00345e] dark:bg-blue-600 dark:border-blue-600"
                    : "bg-white dark:bg-zinc-800 border-zinc-300 dark:border-zinc-600 group-hover:border-[#00345e]"
                }`}
              >
                {filters.duration === "" && (
                  <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                )}
              </div>
            </div>
            <span
              className={`text-xs sm:text-sm transition-colors ${
                filters.duration === ""
                  ? "text-[#00345e] dark:text-blue-400 font-semibold"
                  : "text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-white font-medium"
              }`}
            >
              Todas las duraciones
            </span>
          </label>

          {/* Opciones de duración */}
          {durationOptions.map((duration) => {
            const isSelected = filters.duration === duration.id;
            return (
              <label
                key={duration.id}
                className="flex items-center gap-2.5 cursor-pointer group transition-colors hover:bg-zinc-100/80 dark:hover:bg-white/[0.04] py-1.5 px-2 rounded-lg -mx-1"
              >
                <div className="relative flex-shrink-0">
                  <input
                    type="radio"
                    name="duration"
                    value={duration.id}
                    checked={isSelected}
                    onChange={(e) => handleChange("duration", e.target.value)}
                    className="sr-only"
                  />
                  <div
                    className={`w-3.5 h-3.5 border-2 rounded-full transition-all flex items-center justify-center ${
                      isSelected
                        ? "bg-[#00345e] border-[#00345e] dark:bg-blue-600 dark:border-blue-600"
                        : "bg-white dark:bg-zinc-800 border-zinc-300 dark:border-zinc-600 group-hover:border-[#00345e]"
                    }`}
                  >
                    {isSelected && (
                      <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                    )}
                  </div>
                </div>
                <span
                  className={`text-xs sm:text-sm transition-colors ${
                    isSelected
                      ? "text-[#00345e] dark:text-blue-400 font-semibold"
                      : "text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-white font-medium"
                  }`}
                >
                  {duration.text}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Botón Limpiar */}
      <div className="pt-1">
        <button
          type="button"
          onClick={resetFilters}
          className="w-full bg-[#00345e] hover:bg-[#002747] active:bg-[#001f38] text-white py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-xs cursor-pointer border-0"
        >
          Limpiar Filtros
        </button>
      </div>
    </div>
  );

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden fixed bottom-6 right-4 z-40 flex items-center gap-2 bg-[#00345e] text-white shadow-lg px-4 py-3 rounded-full border border-blue-400/30 cursor-pointer"
        aria-label="Abrir filtros"
        type="button"
      >
        <FunnelIcon className="h-5 w-5 text-white" />
        <span className="text-xs sm:text-sm font-semibold text-white">Filtros</span>
      </button>

      {/* Sidebar para desktop: sin scroll interno, sticky natural */}
      <aside className="hidden lg:block w-72 shrink-0 bg-white dark:bg-[#16161a] border border-black/[0.08] dark:border-white/[0.08] p-5 sticky top-24 self-start rounded-2xl shadow-xs transition-colors">
        {FiltersContent}
      </aside>

      {/* Drawer móvil */}
      {open && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div className="relative w-80 max-w-full h-full bg-white dark:bg-[#16161a] border-l border-black/[0.08] dark:border-white/[0.08] p-6 shadow-xl overflow-y-auto">
            <button
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600 dark:hover:text-white cursor-pointer"
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
