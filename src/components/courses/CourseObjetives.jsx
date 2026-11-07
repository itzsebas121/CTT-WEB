import { CheckCircleIcon } from "@heroicons/react/24/outline";
import { useDashboardTheme } from "../../context/DashboardThemeContext";

export default function CourseObjectives({ course }) {
  const { isDark } = useDashboardTheme();
  const objectives = course?.objectives || [];

  if (!objectives || objectives.length === 0) return null;

  return (
    <div
      className={`rounded-xl p-4 sm:p-5 border transition-colors mb-4 ${
        isDark
          ? 'bg-[#16161a] border-white/[0.08] shadow-xs'
          : 'bg-white border-black/[0.08] shadow-xs'
      }`}
    >
      <div className="flex items-center gap-2 mb-3.5">
        <div className={`p-1.5 rounded-lg ${isDark ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-600'}`}>
          <CheckCircleIcon className="w-4 h-4" />
        </div>
        <h2 className={`text-sm sm:text-base font-bold tracking-tight ${isDark ? 'text-white' : 'text-zinc-900'}`}>
          Objetivos de Aprendizaje
        </h2>
      </div>

      <div className="space-y-2">
        {objectives.map((objective, index) => (
          <div
            key={index}
            className={`p-2.5 sm:p-3 rounded-lg border flex items-start gap-2.5 transition-colors ${
              isDark
                ? 'bg-[#121215] border-white/[0.06]'
                : 'bg-zinc-50/80 border-black/[0.06]'
            }`}
          >
            <span className="w-5 h-5 rounded flex items-center justify-center font-bold text-[11px] flex-shrink-0 mt-0.5 bg-[#00345e]/15 text-[#00345e] dark:bg-blue-500/15 dark:text-blue-300">
              {index + 1}
            </span>
            <p className={`text-xs leading-relaxed ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
              {objective}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
