import { useEffect } from "react";
import {
  XMarkIcon,
  AcademicCapIcon,
  PresentationChartLineIcon,
  ChevronRightIcon
} from "@heroicons/react/24/outline";
import { useDashboardTheme } from "../../context/DashboardThemeContext";

export default function RoleSelectionModal({ isOpen, onClose, onSelectRole, courseName }) {
  const { isDark } = useDashboardTheme();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dokploy-role-title"
    >
      {/* Backdrop */}
      <div
        className={`fixed inset-0 backdrop-blur-sm transition-opacity duration-200 ${
          isDark ? 'bg-black/75' : 'bg-black/50'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Tarjeta Modal con soporte Claro / Oscuro */}
      <div
        className={`relative rounded-xl max-w-lg w-full p-6 overflow-hidden z-10 animate-fade-in shadow-2xl border transition-colors ${
          isDark
            ? 'bg-[#16161a] border-white/[0.1] text-white'
            : 'bg-white border-black/[0.08] text-zinc-900'
        }`}
      >
        {/* Botón de cierre */}
        <button
          type="button"
          onClick={onClose}
          className={`absolute top-4 right-4 p-1.5 rounded-lg transition-colors cursor-pointer border-0 bg-transparent ${
            isDark
              ? 'text-zinc-400 hover:text-white hover:bg-white/[0.06]'
              : 'text-zinc-400 hover:text-zinc-800 hover:bg-zinc-100'
          }`}
          aria-label="Cerrar modal"
        >
          <XMarkIcon className="w-5 h-5" aria-hidden="true" />
        </button>

        {/* Encabezado */}
        <div className="mb-4 pr-6">
          <h2
            id="dokploy-role-title"
            className={`text-xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-zinc-900'}`}
          >
            Modalidad de Inscripción
          </h2>
          <p className={`text-xs mt-1 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
            Selecciona tu rol para el curso antes de proceder
          </p>
        </div>

        {/* Detalle del Curso */}
        <div
          className={`rounded-lg p-3.5 mb-5 border ${
            isDark ? 'bg-[#121215] border-white/[0.06]' : 'bg-zinc-50 border-zinc-200/80'
          }`}
        >
          <span
            className={`text-[10px] font-semibold uppercase tracking-wider block mb-0.5 ${
              isDark ? 'text-zinc-500' : 'text-zinc-400'
            }`}
          >
            Curso seleccionado
          </span>
          <p className={`text-sm font-bold leading-snug ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}>
            {courseName}
          </p>
        </div>

        {/* Opciones Interactivas */}
        <div className="space-y-3 mb-6">
          {/* Opción 1: Participante */}
          <button
            type="button"
            onClick={() => onSelectRole('participante')}
            className={`w-full text-left p-4 rounded-xl border transition-all cursor-pointer group flex items-center justify-between gap-4 ${
              isDark
                ? 'border-white/[0.08] hover:border-[#00345e] hover:bg-[#00345e]/20 bg-[#18181b]'
                : 'border-zinc-200 hover:border-[#00345e] hover:bg-[#00345e]/05 bg-white shadow-xs'
            }`}
          >
            <div className="flex items-start gap-3.5">
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 border ${
                  isDark
                    ? 'bg-[#00345e]/20 text-[#5b8dd8] border-[#00345e]/40'
                    : 'bg-[#00345e]/10 text-[#00345e] border-[#00345e]/20'
                }`}
                aria-hidden="true"
              >
                <AcademicCapIcon className="w-5 h-5" />
              </div>
              <div>
                <h3
                  className={`text-sm font-bold transition-colors ${
                    isDark
                      ? 'text-white group-hover:text-[#5b8dd8]'
                      : 'text-zinc-900 group-hover:text-[#00345e]'
                  }`}
                >
                  Inscribirme como Participante
                </h3>
                <p
                  className={`text-xs mt-0.5 leading-relaxed font-normal ${
                    isDark ? 'text-zinc-400' : 'text-zinc-500'
                  }`}
                >
                  Asiste a las clases, accede a materiales formativos y recibe tu certificado oficial.
                </p>
              </div>
            </div>
            <ChevronRightIcon
              className={`w-5 h-5 group-hover:translate-x-0.5 transition-all flex-shrink-0 ${
                isDark
                  ? 'text-zinc-500 group-hover:text-[#5b8dd8]'
                  : 'text-zinc-400 group-hover:text-[#00345e]'
              }`}
              aria-hidden="true"
            />
          </button>

          {/* Opción 2: Expositor / Docente */}
          <button
            type="button"
            onClick={() => onSelectRole('expositor')}
            className={`w-full text-left p-4 rounded-xl border transition-all cursor-pointer group flex items-center justify-between gap-4 ${
              isDark
                ? 'border-white/[0.08] hover:border-white/30 hover:bg-white/[0.04] bg-[#18181b]'
                : 'border-zinc-200 hover:border-zinc-400 hover:bg-zinc-50 bg-white shadow-xs'
            }`}
          >
            <div className="flex items-start gap-3.5">
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 border ${
                  isDark
                    ? 'bg-white/[0.06] text-zinc-300 border-white/[0.08]'
                    : 'bg-zinc-100 text-zinc-600 border-zinc-200'
                }`}
                aria-hidden="true"
              >
                <PresentationChartLineIcon className="w-5 h-5" />
              </div>
              <div>
                <h3
                  className={`text-sm font-bold transition-colors ${
                    isDark ? 'text-white group-hover:text-zinc-200' : 'text-zinc-900 group-hover:text-zinc-700'
                  }`}
                >
                  Postular como Expositor / Docente
                </h3>
                <p
                  className={`text-xs mt-0.5 leading-relaxed font-normal ${
                    isDark ? 'text-zinc-400' : 'text-zinc-500'
                  }`}
                >
                  Postúlate como instructor (requerirá adjuntar tu hoja de vida en PDF).
                </p>
              </div>
            </div>
            <ChevronRightIcon
              className={`w-5 h-5 group-hover:translate-x-0.5 transition-all flex-shrink-0 ${
                isDark ? 'text-zinc-500 group-hover:text-white' : 'text-zinc-400 group-hover:text-zinc-700'
              }`}
              aria-hidden="true"
            />
          </button>
        </div>

        {/* Botón de Cancelación */}
        <div className={`flex justify-end pt-3 border-t ${isDark ? 'border-white/[0.06]' : 'border-zinc-100'}`}>
          <button
            type="button"
            onClick={onClose}
            className={`h-9 px-4 rounded-lg text-xs font-medium transition-colors cursor-pointer border ${
              isDark
                ? 'text-zinc-300 hover:text-white hover:bg-zinc-800 border-white/10 bg-zinc-900'
                : 'text-zinc-700 hover:bg-zinc-100 border-zinc-200 bg-white shadow-xs'
            }`}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
