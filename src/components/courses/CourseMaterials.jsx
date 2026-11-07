import { WrenchScrewdriverIcon } from "@heroicons/react/24/outline";
import { useDashboardTheme } from "../../context/DashboardThemeContext";

export default function CourseMaterials({ course }) {
  const { isDark } = useDashboardTheme();
  const materials = course?.materials || [];

  if (!materials || materials.length === 0) return null;

  return (
    <div
      className={`rounded-xl p-4 sm:p-5 border transition-colors mb-4 ${
        isDark
          ? 'bg-[#16161a] border-white/[0.08] shadow-xs'
          : 'bg-white border-black/[0.08] shadow-xs'
      }`}
    >
      <div className="flex items-center gap-2 mb-3">
        <div className={`p-1.5 rounded-lg ${isDark ? 'bg-purple-500/10 text-purple-400' : 'bg-purple-50 text-purple-600'}`}>
          <WrenchScrewdriverIcon className="w-4 h-4" />
        </div>
        <h2 className={`text-sm sm:text-base font-bold tracking-tight ${isDark ? 'text-white' : 'text-zinc-900'}`}>
          Recursos & Materiales Requeridos
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {materials.map((material, index) => (
          <div
            key={index}
            className={`p-2 rounded-lg border flex items-center gap-2 text-xs ${
              isDark
                ? 'bg-[#121215] border-white/[0.06] text-zinc-300'
                : 'bg-zinc-50/80 border-black/[0.06] text-zinc-700'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500 flex-shrink-0" />
            <span className="font-medium truncate">{material}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
