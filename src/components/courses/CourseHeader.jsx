import { useState } from "react";
import { ClockIcon, AcademicCapIcon, MapPinIcon, CurrencyDollarIcon } from "@heroicons/react/24/outline";
import { resolveImageUrl } from "../../utils/helpers";
import { useDashboardTheme } from "../../context/DashboardThemeContext";

export default function CourseHeader({ course }) {
  const { isDark } = useDashboardTheme();
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const rawImage = course?.course_image_detail || course?.course_image;
  const courseImage = resolveImageUrl(rawImage);
  const hasValidImage = Boolean(courseImage) && !imageError;

  const hours = course?.requirements?.hours || {};
  const totalHours = hours.total || course?.hours || 0;
  const modality = course?.requirements?.modality || "Presencial";
  const prices = course?.requirements?.prices || [];
  const status = String(course?.status || "activo").toLowerCase();
  const isActive = status === "activo";

  return (
    <div
      className={`rounded-xl overflow-hidden border transition-colors mb-4 ${
        isDark
          ? 'bg-[#16161a] border-white/[0.08] shadow-md'
          : 'bg-white border-black/[0.08] shadow-xs'
      }`}
    >
      {/* Portada Compacta Hero — Sin cápsulas de IA ni adornos artificiales */}
      <div className="relative w-full h-36 sm:h-44 md:h-48 overflow-hidden bg-zinc-900">
        {hasValidImage ? (
          <>
            <img
              src={courseImage}
              alt={course.title}
              onError={() => setImageError(true)}
              onLoad={() => setImageLoaded(true)}
              className={`w-full h-full object-cover transition-opacity duration-300 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/20" />
          </>
        ) : (
          /* Portada Institucional sobria UTA (#00345e) */
          <div className="w-full h-full relative flex items-center justify-between px-6 sm:px-8 bg-gradient-to-r from-[#00345e] via-[#002747] to-[#001729] overflow-hidden">
            <div className="relative z-10 max-w-xl">
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white tracking-tight line-clamp-2">
                {course.title}
              </h2>
              <p className="text-xs text-blue-200/80 mt-1 font-normal">
                Facultad de Ingeniería en Sistemas, Electrónica e Industrial — FISEI
              </p>
            </div>
          </div>
        )}

        {/* Solo Badges de Estado y Categoría Esenciales */}
        <div className="absolute top-3 left-3 z-20">
          <span className="inline-flex items-center px-3 py-0.5 rounded-md text-xs font-semibold tracking-wide border shadow-xs backdrop-blur-md bg-white/90 text-[#00345e] border-white/40 dark:bg-[#00345e]/80 dark:text-blue-200 dark:border-blue-400/30">
            {course.category_name || "Tecnología"}
          </span>
        </div>

        <div className="absolute top-3 right-3 z-20">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-md text-xs font-semibold tracking-wide border shadow-xs backdrop-blur-md ${
              isActive
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30'
                : 'bg-zinc-500/20 text-zinc-300 border-zinc-400/30'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isActive ? 'bg-emerald-400' : 'bg-zinc-400'
              }`}
            />
            {isActive ? 'Convocatoria Abierta' : 'Convocatoria Finalizada'}
          </span>
        </div>
      </div>

      {/* Cuerpo Principal del Curso — Compacto y Editorial */}
      <div className="p-4 sm:p-5">
        <h1 className={`text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight leading-snug ${
          isDark ? 'text-white' : 'text-zinc-900'
        }`}>
          {course.title}
        </h1>

        {course.description && (
          <p className={`text-xs sm:text-sm leading-relaxed mt-2.5 font-normal ${
            isDark ? 'text-zinc-300' : 'text-zinc-600'
          }`}>
            {course.description}
          </p>
        )}

        {/* Grid Compacto de Métricas Clave */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mt-5">
          {/* Card Duración */}
          <div className={`rounded-lg p-3 flex flex-col justify-between border transition-colors ${
            isDark
              ? 'bg-[#121215] border-white/[0.06]'
              : 'bg-zinc-50/80 border-black/[0.06]'
          }`}>
            <div className="flex items-center gap-1.5 mb-1">
              <ClockIcon className="h-3.5 w-3.5 text-[#00345e] dark:text-blue-400" />
              <span className={`text-[10px] font-semibold uppercase tracking-wider ${
                isDark ? 'text-zinc-400' : 'text-zinc-500'
              }`}>
                Duración Total
              </span>
            </div>
            <div>
              <div className={`text-base font-bold tracking-tight ${
                isDark ? 'text-zinc-100' : 'text-zinc-900'
              }`}>
                {totalHours} horas
              </div>
              {(hours.inPerson || hours.autonomous) && (
                <p className={`text-[10px] mt-0.5 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                  {hours.inPerson ? `${hours.inPerson}h presencial` : ''}
                  {hours.inPerson && hours.autonomous ? ' • ' : ''}
                  {hours.autonomous ? `${hours.autonomous}h autónomo` : ''}
                </p>
              )}
            </div>
          </div>

          {/* Card Nivel */}
          <div className={`rounded-lg p-3 flex flex-col justify-between border transition-colors ${
            isDark
              ? 'bg-[#121215] border-white/[0.06]'
              : 'bg-zinc-50/80 border-black/[0.06]'
          }`}>
            <div className="flex items-center gap-1.5 mb-1">
              <AcademicCapIcon className="h-3.5 w-3.5 text-[#00345e] dark:text-blue-400" />
              <span className={`text-[10px] font-semibold uppercase tracking-wider ${
                isDark ? 'text-zinc-400' : 'text-zinc-500'
              }`}>
                Nivel Académico
              </span>
            </div>
            <div>
              <div className={`text-base font-bold tracking-tight ${
                isDark ? 'text-zinc-100' : 'text-zinc-900'
              }`}>
                Todos los niveles
              </div>
              <p className={`text-[10px] mt-0.5 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                Sin requisitos excluyentes
              </p>
            </div>
          </div>

          {/* Card Modalidad */}
          <div className={`rounded-lg p-3 flex flex-col justify-between border transition-colors ${
            isDark
              ? 'bg-[#121215] border-white/[0.06]'
              : 'bg-zinc-50/80 border-black/[0.06]'
          }`}>
            <div className="flex items-center gap-1.5 mb-1">
              <MapPinIcon className="h-3.5 w-3.5 text-[#00345e] dark:text-blue-400" />
              <span className={`text-[10px] font-semibold uppercase tracking-wider ${
                isDark ? 'text-zinc-400' : 'text-zinc-500'
              }`}>
                Modalidad
              </span>
            </div>
            <div>
              <div className={`text-base font-bold tracking-tight ${
                isDark ? 'text-zinc-100' : 'text-zinc-900'
              }`}>
                {modality}
              </div>
              <p className={`text-[10px] mt-0.5 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                Asistencia y certificación
              </p>
            </div>
          </div>
        </div>

        {/* Sección de Inversión Compacta */}
        {prices.length > 0 && (
          <div className="mt-5 pt-4 border-t border-black/[0.06] dark:border-white/[0.06]">
            <div className="flex items-center gap-2 mb-3">
              <CurrencyDollarIcon className="w-4 h-4 text-[#00345e] dark:text-blue-400" />
              <h3 className={`text-xs font-semibold uppercase tracking-wider ${
                isDark ? 'text-zinc-300' : 'text-zinc-800'
              }`}>
                Inversión por Categoría
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {prices.map((price, index) => (
                <div
                  key={index}
                  className={`rounded-lg p-2.5 border transition-all flex items-center justify-between ${
                    isDark
                      ? 'bg-[#121215] border-white/[0.06]'
                      : 'bg-zinc-50/80 border-black/[0.06]'
                  }`}
                >
                  <span className={`text-xs font-medium truncate pr-2 ${
                    isDark ? 'text-zinc-300' : 'text-zinc-700'
                  }`}>
                    {price.category}
                  </span>
                  <div className="flex items-baseline gap-1 flex-shrink-0">
                    <span className={`text-base font-bold tracking-tight ${
                      isDark ? 'text-white' : 'text-[#00345e]'
                    }`}>
                      ${price.amount}
                    </span>
                    <span className={`text-[10px] font-medium ${
                      isDark ? 'text-zinc-500' : 'text-zinc-400'
                    }`}>
                      USD
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
