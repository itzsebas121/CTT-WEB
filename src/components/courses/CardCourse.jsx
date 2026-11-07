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
        <div className="flex items-center justify-between text-gray-600 text-sm">
          <div className="flex items-center gap-1">
            {isOpen ? (
              <LockOpenIcon className="h-5 w-5 text-primary" />
            ) : (
              <LockClosedIcon className="h-5 w-5 text-primary" />
            )}
            <span className="uppercase tracking-wide font-medium">
              {isOpen ? "ABIERTO" : "CERRADO"}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <ClockIcon className="h-5 w-5 text-primary" />
            <span>{hours} HORAS</span>
          </div>
        </div>

        <div className="mt-4 flex-1 flex flex-col">
            <h2 className="mt-2 text-lg font-bold text-gray-900 leading-snug flex-1 w-auto h-full overflow-hidden text-ellipsis">
                {title}
            </h2>
        </div>

        <button
          className="mt-4 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-hover transition-colors font-medium"
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
