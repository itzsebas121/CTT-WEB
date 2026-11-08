import { useState } from "react";
import { LockOpenIcon, LockClosedIcon, ClockIcon, PhotoIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import { resolveImageUrl } from "../../utils/helpers";

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function CardCourse({
  title = "Título del Curso",
  image = "",
  isOpen = true,
  hours = "0",
  id = null,
}) {
  const navigate = useNavigate();
  const [imageError, setImageError] = useState(false);
  const resolvedUrl = resolveImageUrl(image);

  const handleClick = () => {
    if (id) {
      navigate(`/course/${id}`);
    }
  };

  return (
    <div
      className={cn(
        "rounded-2xl overflow-hidden shadow-sm bg-white dark:bg-[#16161a] flex flex-col h-full cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 border border-black/[0.06] dark:border-white/[0.08]",
        id ? "hover:border-[#00345e]/30" : ""
      )}
      onClick={handleClick}
    >
      {/* Imagen fija arriba */}
      <div className="w-full h-44 bg-slate-100 dark:bg-zinc-800 relative overflow-hidden flex items-center justify-center">
        {resolvedUrl && !imageError ? (
          <img
            src={resolvedUrl}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            onError={() => setImageError(true)}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#00345e] to-[#001f38] text-white/70 p-4 text-center">
            <PhotoIcon className="w-8 h-8 mb-1 opacity-60" />
            <span className="text-xs font-medium line-clamp-1">{title}</span>
          </div>
        )}
      </div>

      {/* Contenido flexible */}
      <div className="p-4 flex flex-col flex-1">
        {/* Estado y horas */}
        <div className="flex items-center justify-between text-zinc-600 dark:text-zinc-300 text-xs sm:text-sm">
          <div className="flex items-center gap-1.5">
            {isOpen ? (
              <LockOpenIcon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <LockClosedIcon className="h-4 w-4 text-zinc-400 dark:text-zinc-500" />
            )}
            <span className={`uppercase tracking-wider font-semibold text-xs ${
              isOpen ? "text-emerald-700 dark:text-emerald-400" : "text-zinc-500 dark:text-zinc-400"
            }`}>
              {isOpen ? "ABIERTO" : "CERRADO"}
            </span>
          </div>

          <div className="flex items-center gap-1.5 font-medium text-xs">
            <ClockIcon className="h-4 w-4 text-[#00345e] dark:text-blue-400" />
            <span className="text-zinc-700 dark:text-zinc-200">{hours} HORAS</span>
          </div>
        </div>

        <div className="mt-3 flex-1 flex flex-col">
          <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white leading-snug flex-1 line-clamp-2">
            {title}
          </h2>
        </div>

        <button
          className="mt-4 bg-[#00345e] hover:bg-[#002747] text-white px-4 py-2 rounded-xl transition-colors font-semibold text-xs sm:text-sm cursor-pointer shadow-xs border-0"
          onClick={(e) => {
            e.stopPropagation(); // Evitar que se dispare el onClick del padre
            handleClick();
          }}
        >
          Ver curso
        </button>
      </div>
    </div>
  );
}
