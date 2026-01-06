import { LockOpenIcon, LockClosedIcon, ClockIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function CardCourse({
  title = "Título del Curso",
  image = "dsadsa",
  isOpen = true,
  hours = "0",
  id = null,
}) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (id) {
      navigate(`/course/${id}`);
    }
  };

  return (
    <div
      className={cn(
        "rounded-2xl overflow-hidden shadow-lg bg-[#F2F1F8] flex flex-col h-full cursor-pointer transition-all duration-200 hover:shadow-xl hover:scale-105",
        id ? "hover:bg-[#E8E7EF]" : ""
      )}
      onClick={handleClick}
    >
      {/* Imagen fija arriba */}
      <img src={image} alt={title} className="w-full object-cover h-auto" />

      {/* Contenido flexible */}
      <div className="p-4 flex flex-col flex-1">
        {/* Estado y horas */}
        <div className="flex items-center justify-between text-gray-600 text-sm">
          <div className="flex items-center gap-1">
            {isOpen ? (
              <LockOpenIcon className="h-5 w-5 text-[#6C1313]" />
            ) : (
              <LockClosedIcon className="h-5 w-5 text-[#6C1313]" />
            )}
            <span className="uppercase tracking-wide font-medium">
              {isOpen ? "ABIERTO" : "CERRADO"}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <ClockIcon className="h-5 w-5 text-[#6C1313]" />
            <span>{hours} HORAS</span>
          </div>
        </div>

        <div className="mt-4 flex-1 flex flex-col">
            <h2 className="mt-2 text-lg font-bold text-gray-900 leading-snug flex-1 w-auto h-full overflow-hidden text-ellipsis">
                {title}
            </h2>
        </div>

        <button
          className="mt-4 bg-[#6C1313] text-white px-4 py-2 rounded-lg hover:bg-[#5a0f0f] transition-colors font-medium"
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
