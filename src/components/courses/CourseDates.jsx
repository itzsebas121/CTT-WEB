import { CalendarIcon, ClockIcon } from "@heroicons/react/24/outline";
import { useDashboardTheme } from "../../context/DashboardThemeContext";

export default function CourseDates({ course }) {
  const { isDark } = useDashboardTheme();
  const courseSchedule = course?.requirements?.courseSchedule;
  const registration = course?.requirements?.registration;

  if (!courseSchedule?.startDate && !courseSchedule?.endDate && !registration?.startDate) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'Por definir';
    try {
      const parts = dateString.split('-');
      if (parts.length === 3) {
        const d = new Date(parts[0], parts[1] - 1, parts[2]);
        return d.toLocaleDateString('es-ES', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
      }
      return new Date(dateString).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div
      className={`rounded-xl p-4 sm:p-5 border transition-colors mb-4 ${
        isDark
          ? 'bg-[#16161a] border-white/[0.08] shadow-xs'
          : 'bg-white border-black/[0.08] shadow-xs'
      }`}
    >
      <div className="flex items-center gap-2 mb-3.5">
        <div className={`p-1.5 rounded-lg ${isDark ? 'bg-blue-500/10 text-blue-400' : 'bg-[#00345e]/08 text-[#00345e]'}`}>
          <CalendarIcon className="w-4 h-4" />
        </div>
        <h2 className={`text-sm sm:text-base font-bold tracking-tight ${isDark ? 'text-white' : 'text-zinc-900'}`}>
          Fechas & Cronograma de Clases
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className={`p-3 rounded-lg border flex items-center gap-3 ${
          isDark ? 'bg-[#121215] border-white/[0.06]' : 'bg-zinc-50/80 border-black/[0.06]'
        }`}>
          <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
          <div className="min-w-0">
            <span className={`text-[10px] font-semibold uppercase tracking-wider block ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
              Fecha de Inicio
            </span>
            <span className={`text-xs sm:text-sm font-semibold truncate block mt-0.5 ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}>
              {formatDate(courseSchedule?.startDate)}
            </span>
          </div>
        </div>

        <div className={`p-3 rounded-lg border flex items-center gap-3 ${
          isDark ? 'bg-[#121215] border-white/[0.06]' : 'bg-zinc-50/80 border-black/[0.06]'
        }`}>
          <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
          <div className="min-w-0">
            <span className={`text-[10px] font-semibold uppercase tracking-wider block ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
              Fecha de Finalización
            </span>
            <span className={`text-xs sm:text-sm font-semibold truncate block mt-0.5 ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}>
              {formatDate(courseSchedule?.endDate)}
            </span>
          </div>
        </div>
      </div>

      {(courseSchedule?.days?.length > 0 || courseSchedule?.startTime) && (
        <div className={`mt-3 p-3 rounded-lg border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 ${
          isDark ? 'bg-[#121215] border-white/[0.06]' : 'bg-zinc-50/80 border-black/[0.06]'
        }`}>
          {courseSchedule?.days?.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className={`text-xs font-medium ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                Días de sesión:
              </span>
              {courseSchedule.days.map((day, idx) => (
                <span
                  key={idx}
                  className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${
                    isDark
                      ? 'bg-blue-500/10 text-blue-300 border-blue-500/20'
                      : 'bg-[#00345e]/08 text-[#00345e] border-[#00345e]/20'
                  }`}
                >
                  {day}
                </span>
              ))}
            </div>
          )}

          {courseSchedule?.startTime && (
            <div className="flex items-center gap-1.5 text-xs">
              <ClockIcon className="w-3.5 h-3.5 text-zinc-400" />
              <span className={`font-medium ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
                {courseSchedule.startTime.slice(0, 5)} - {courseSchedule.endTime?.slice(0, 5) || 'Fin'}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
