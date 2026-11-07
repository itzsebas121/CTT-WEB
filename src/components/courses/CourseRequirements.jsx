import { CheckBadgeIcon } from '@heroicons/react/24/outline';
import { useDashboardTheme } from '../../context/DashboardThemeContext';

export default function CourseRequirements({ course }) {
  const { isDark } = useDashboardTheme();
  const prerequisites = course?.requirements?.prerequisites || [];

  if (!prerequisites || prerequisites.length === 0) return null;

  return (
    <div
      className={`rounded-xl p-4 sm:p-5 border transition-colors mb-4 ${
        isDark
          ? 'bg-[#16161a] border-white/[0.08] shadow-xs'
          : 'bg-white border-black/[0.08] shadow-xs'
      }`}
    >
      <div className="flex items-center gap-2 mb-3">
        <div className={`p-1.5 rounded-lg ${isDark ? 'bg-amber-500/10 text-amber-400' : 'bg-amber-50 text-amber-600'}`}>
          <CheckBadgeIcon className="w-4 h-4" />
        </div>
        <h2 className={`text-sm sm:text-base font-bold tracking-tight ${isDark ? 'text-white' : 'text-zinc-900'}`}>
          Requisitos Previos
        </h2>
      </div>

      <div className="space-y-2">
        {prerequisites.map((requirement, index) => (
          <div
            key={index}
            className={`p-2.5 rounded-lg border flex items-center gap-2.5 ${
              isDark ? 'bg-[#121215] border-white/[0.06]' : 'bg-zinc-50/80 border-black/[0.06]'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" />
            <span className={`text-xs font-medium ${isDark ? 'text-zinc-200' : 'text-zinc-800'}`}>
              {requirement}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
