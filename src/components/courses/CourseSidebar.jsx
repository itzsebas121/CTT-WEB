import {
  CalendarDaysIcon,
  MapPinIcon,
  UsersIcon,
  AcademicCapIcon,
  ArrowRightIcon,
  UserCircleIcon,
  CheckBadgeIcon
} from "@heroicons/react/24/outline";
import { useDashboardTheme } from "../../context/DashboardThemeContext";

export default function CourseSidebar({ course, onEnroll, enrolling }) {
  const { isDark } = useDashboardTheme();

  const req = course?.requirements || {};
  const registration = req.registration || {};
  const location = req.location || course?.place || "Laboratorios FISEI - Campus Huachi";
  const quota = req.quota || {};
  const certification = req.certification || "Certificado digital con validación QR";
  const organizers = course?.organizers || [];
  const targetAudience = course?.target_audience || req.targetAudience || [];
  const prices = req.prices || [];
  const minPrice = prices.length > 0 ? Math.min(...prices.map((p) => p.amount)) : null;

  const formatDate = (dateString) => {
    if (!dateString) return "Por definir";
    try {
      const parts = dateString.split("-");
      if (parts.length === 3) {
        const d = new Date(parts[0], parts[1] - 1, parts[2]);
        return d.toLocaleDateString("es-ES", {
          day: "numeric",
          month: "short",
          year: "numeric",
        });
      }
      return new Date(dateString).toLocaleDateString("es-ES", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const getInitials = (name) => {
    if (!name) return "DOC";
    const cleaned = name.replace(/^(Ing\.|Dr\.|Dra\.|Lic\.|MSc\.|Mg\.)\s*/i, "");
    const parts = cleaned.trim().split(" ");
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return parts[0].slice(0, 2).toUpperCase();
  };

  return (
    <div className="space-y-3.5 sticky top-4">
      {/* Card 1: CTA de Inscripción & Precio */}
      <div
        className={`rounded-xl p-4 sm:p-5 border transition-colors ${
          isDark
            ? 'bg-[#16161a] border-white/[0.08] shadow-md'
            : 'bg-white border-black/[0.08] shadow-xs'
        }`}
      >
        <div className="mb-3.5">
          <span className={`text-[10px] font-semibold uppercase tracking-wider block ${
            isDark ? 'text-zinc-400' : 'text-zinc-500'
          }`}>
            Inversión Académica
          </span>
          <div className="mt-1 flex items-baseline gap-1.5">
            {minPrice !== null ? (
              <>
                <span className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${
                  isDark ? 'text-white' : 'text-[#00345e]'
                }`}>
                  ${minPrice}
                </span>
                <span className={`text-[11px] font-semibold uppercase ${
                  isDark ? 'text-zinc-400' : 'text-zinc-500'
                }`}>
                  USD / Desde
                </span>
              </>
            ) : (
              <span className={`text-xl font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>
                Aranceles FISEI
              </span>
            )}
          </div>
          <p className={`text-[11px] mt-0.5 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
            Tarifas preferenciales para comunidad UTA
          </p>
        </div>

        {/* Botón de Inscripción CTA */}
        {onEnroll && (
          <button
            type="button"
            onClick={onEnroll}
            disabled={enrolling}
            className={`w-full py-2.5 px-4 rounded-lg font-semibold text-xs text-white flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs disabled:opacity-50 disabled:cursor-not-allowed ${
              isDark
                ? 'bg-[#00345e] hover:bg-[#004f8c] active:bg-[#002747] border border-blue-400/30'
                : 'bg-[#00345e] hover:bg-[#002747] active:bg-[#001f38]'
            }`}
          >
            {enrolling ? (
              <span>Procesando...</span>
            ) : (
              <>
                <span>Inscribirme en este Curso</span>
                <ArrowRightIcon className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        )}

        {/* Fechas de Inscripción */}
        <div className="mt-3.5 pt-3 border-t border-black/[0.06] dark:border-white/[0.06]">
          <div className="flex items-center gap-2">
            <CalendarDaysIcon className="w-3.5 h-3.5 text-[#00345e] dark:text-blue-400 flex-shrink-0" />
            <div className="text-xs truncate">
              <span className={`font-medium ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                Inscripciones:{" "}
              </span>
              <span className={`font-semibold ${isDark ? 'text-zinc-200' : 'text-zinc-800'}`}>
                {formatDate(registration.startDate)} — {formatDate(registration.endDate)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Card 2: Ficha Técnica & Detalles Académicos */}
      <div
        className={`rounded-xl p-4 sm:p-5 border transition-colors ${
          isDark
            ? 'bg-[#16161a] border-white/[0.08] shadow-md'
            : 'bg-white border-black/[0.08] shadow-xs'
        }`}
      >
        <h3 className={`text-[10px] font-semibold uppercase tracking-wider mb-3 ${
          isDark ? 'text-zinc-400' : 'text-zinc-500'
        }`}>
          Ficha Técnica
        </h3>

        <div className="space-y-3 text-xs">
          {/* Ubicación */}
          <div className="flex items-start gap-2.5">
            <div className={`p-1 rounded flex-shrink-0 mt-0.5 ${isDark ? 'bg-white/[0.04] text-zinc-300' : 'bg-zinc-100 text-zinc-700'}`}>
              <MapPinIcon className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className={`font-semibold block ${isDark ? 'text-zinc-200' : 'text-zinc-800'}`}>
                Ubicación
              </span>
              <p className={`mt-0.5 leading-snug ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                {location}
              </p>
            </div>
          </div>

          {/* Cupo */}
          <div className="flex items-start gap-2.5">
            <div className={`p-1 rounded flex-shrink-0 mt-0.5 ${isDark ? 'bg-white/[0.04] text-zinc-300' : 'bg-zinc-100 text-zinc-700'}`}>
              <UsersIcon className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className={`font-semibold block ${isDark ? 'text-zinc-200' : 'text-zinc-800'}`}>
                Cupo
              </span>
              <p className={`mt-0.5 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                {quota.min ? `${quota.min} a ${quota.max} participantes` : 'Cupo limitado'}
              </p>
            </div>
          </div>

          {/* Certificación */}
          <div className="flex items-start gap-2.5">
            <div className={`p-1 rounded flex-shrink-0 mt-0.5 ${isDark ? 'bg-white/[0.04] text-zinc-300' : 'bg-zinc-100 text-zinc-700'}`}>
              <CheckBadgeIcon className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className={`font-semibold block ${isDark ? 'text-zinc-200' : 'text-zinc-800'}`}>
                Certificación
              </span>
              <p className={`mt-0.5 leading-snug ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                {certification}
              </p>
            </div>
          </div>
        </div>

        {/* Organizadores & Docentes Integrados */}
        {organizers.length > 0 && (
          <div className="mt-4 pt-3.5 border-t border-black/[0.06] dark:border-white/[0.06]">
            <div className="flex items-center gap-1.5 mb-2.5">
              <UserCircleIcon className="w-3.5 h-3.5 text-[#00345e] dark:text-blue-400" />
              <h4 className={`text-[10px] font-semibold uppercase tracking-wider ${
                isDark ? 'text-zinc-400' : 'text-zinc-500'
              }`}>
                Organizadores & Docentes
              </h4>
            </div>

            <div className="space-y-1.5">
              {organizers.map((organizer, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded flex items-center justify-center font-bold text-[9px] flex-shrink-0 bg-[#00345e]/15 text-[#00345e] dark:bg-blue-500/15 dark:text-blue-300 border border-[#00345e]/20 dark:border-blue-500/20">
                    {getInitials(organizer)}
                  </span>
                  <span className={`text-xs font-medium truncate ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
                    {organizer}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Público Objetivo Integrado */}
        {targetAudience.length > 0 && (
          <div className="mt-4 pt-3.5 border-t border-black/[0.06] dark:border-white/[0.06]">
            <div className="flex items-center gap-1.5 mb-2">
              <AcademicCapIcon className="w-3.5 h-3.5 text-[#00345e] dark:text-blue-400" />
              <h4 className={`text-[10px] font-semibold uppercase tracking-wider ${
                isDark ? 'text-zinc-400' : 'text-zinc-500'
              }`}>
                Público Objetivo
              </h4>
            </div>

            <div className="flex flex-wrap gap-1">
              {targetAudience.map((audience, index) => (
                <span
                  key={index}
                  className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${
                    isDark
                      ? 'bg-zinc-800 text-zinc-300 border-white/10'
                      : 'bg-zinc-100 text-zinc-700 border-zinc-200'
                  }`}
                >
                  {audience}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
