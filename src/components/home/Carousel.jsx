import AOS from "aos";
import "aos/dist/aos.css";
import { Link } from "react-router-dom";

import { useState, useEffect, use } from "react";


export default function Carrusel({slides, height= "500px", buttons, marginTop, colorText, background}) {
    const [current, setCurrent] = useState(0);

    useEffect(() => {
    const interval = setInterval(() => {
        setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(interval);
    }, []);
    useEffect(() => {
        AOS.init({duration: 1000});
        AOS.refresh();
    }, []);
  return (
    <div className="relative w-full overflow-hidden" style={{ height: height, marginTop: marginTop }} data-aos="fade-down">
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === current ? "opacity-100" : "opacity-0"
          }`}
        >
          <img
            src={slide.image}
            alt={slide.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 flex items-center justify-start bg-black/40">
            <div className=" p-8 rounded-md ml-16 max-w-[700px]" style={{color: colorText, background: background}}>
              {slide.title && (
                <h4 className="text-xl tracking-wider font-semibold" data-aos="fade-right">
                  {slide.title}
                </h4>
              )}
              {slide.subtitle && (
                <h2 className="text-3xl md:text-5xl font-bold  mt-2" data-aos="fade-right" data-aos-delay="200">
                  {slide.subtitle}
                </h2>
              )}
              { slide.buttonText && slide.buttonLink && (
                <Link to={slide.buttonLink} key={slide.id} data-aos="fade-right" data-aos-delay="400">
                  <button className="mt-6">
                    {slide.buttonText}
                  </button>
                </Link>
              )}
            </div>
          </div>
        </div>
      ))}

      {buttons && (
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-3">
        {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrent(index)}
              style={{ backgroundColor: index === current ? 'white' : 'gray' }}
              className="w-3 h-3 rounded-full"
            />
          ))}
        </div>
      )}
      
    </div>
  )
}
