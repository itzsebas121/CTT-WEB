import { useState, useEffect } from "react";

const images = [
    "https://www.lahora.com.ec/__export/1742573106841/sites/lahora/img/2025/03/21/20250321_100506562_Recomendaciones_para_los_aspirantes_que_rendirxn_la_prueba_de_ingreso_a_la_UTA.jpg",
    "https://www.lahora.com.ec/__export/1742573106841/sites/lahora/img/2025/03/21/20250321_100506562_Recomendaciones_para_los_aspirantes_que_rendirxn_la_prueba_de_ingreso_a_la_UTA.jpg",
    "https://www.lahora.com.ec/__export/1742573106841/sites/lahora/img/2025/03/21/20250321_100506562_Recomendaciones_para_los_aspirantes_que_rendirxn_la_prueba_de_ingreso_a_la_UTA.jpg",
];

export default function Hero() {
  const [current, setCurrent] = useState(0);

  // Cambiar imagen cada 5 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-[700px] overflow-hidden">
      {images.map((img, index) => (
        <img
          key={index}
          src={img}
          alt={`Hero ${index}`}
          className={`absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-1000 ${
            index === current ? "opacity-100" : "opacity-100"
          }`}
        />
      ))}

      {/* Texto encima de la imagen */}
      <div className="absolute inset-0 flex flex-col pl-5 md:pl-10 lg:pl-none items-center justify-center  text-white bg-black/20">
        <h1 className="text-8xl font-bold mb-4">Bienvenido al CTT  - Talleres Tecnológicos</h1>
        <p className="text-lg max-w-xl">
          Cursos  virtuales y presenciales
        </p>
      </div>
    </div>
  );
}
