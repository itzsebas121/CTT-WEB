import { BookOpenIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { useDashboardTheme } from "../../context/DashboardThemeContext";

export default function CourseContent({ course }) {
  const { isDark } = useDashboardTheme();
  const contents = course?.contents || [];

  if (!contents || contents.length === 0) return null;

  return (
    <div
      className={`rounded-xl p-4 sm:p-5 border transition-colors mb-4 ${
        isDark
          ? 'bg-[#16161a] border-white/[0.08] shadow-xs'
          : 'bg-white border-black/[0.08] shadow-xs'
      }`}
    >
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg ${isDark ? 'bg-blue-500/10 text-blue-400' : 'bg-[#00345e]/08 text-[#00345e]'}`}>
            <BookOpenIcon className="w-4 h-4" />
          </div>
          <h2 className={`text-sm sm:text-base font-bold tracking-tight ${isDark ? 'text-white' : 'text-zinc-900'}`}>
            Temario del Curso
          </h2>
        </div>

        <span className={`px-2 py-0.5 rounded text-xs font-semibold border ${
          isDark
            ? 'bg-zinc-800 text-zinc-300 border-white/10'
            : 'bg-zinc-100 text-zinc-700 border-zinc-200'
        }`}>
          {contents.length} {contents.length === 1 ? 'Módulo' : 'Módulos'}
        </span>
      </div>

      <div className="space-y-3">
        {contents.map((module, index) => {
          const moduleNumber = index + 1;
          const topics = module.topics || [];

          return (
            <div
              key={index}
              className={`rounded-lg border overflow-hidden transition-all ${
                isDark
                  ? 'bg-[#121215] border-white/[0.06]'
                  : 'bg-zinc-50/70 border-black/[0.06]'
              }`}
            >
              {/* Encabezado del Módulo */}
              <div className="p-3 sm:p-3.5 flex items-start gap-2.5 border-b border-black/[0.04] dark:border-white/[0.04]">
                <span className="w-5 h-5 rounded flex items-center justify-center font-bold text-[11px] flex-shrink-0 mt-0.5 bg-[#00345e] text-white">
                  {moduleNumber}
                </span>
                <div className="flex-1 min-w-0">
                  <span className={`text-[10px] font-semibold uppercase tracking-wider block ${
                    isDark ? 'text-blue-400' : 'text-[#00345e]'
                  }`}>
                    {module.unit || `Módulo ${moduleNumber}`}
                  </span>
                  <h3 className={`text-xs sm:text-sm font-bold mt-0.5 leading-snug ${
                    isDark ? 'text-zinc-100' : 'text-zinc-900'
                  }`}>
                    {module.title}
                  </h3>
                </div>
              </div>

              {/* Temas del Módulo */}
              {topics.length > 0 && (
                <div className="p-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {topics.map((topic, topicIdx) => (
                      <div
                        key={topicIdx}
                        className={`flex items-start gap-1.5 p-2 rounded text-xs transition-colors ${
                          isDark
                            ? 'bg-white/[0.02] text-zinc-300'
                            : 'bg-white text-zinc-700 border border-zinc-200/60'
                        }`}
                      >
                        <ChevronRightIcon className="w-3 h-3 text-zinc-400 flex-shrink-0 mt-0.5" />
                        <span className="font-medium text-xs leading-tight">
                          {topic.title}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
