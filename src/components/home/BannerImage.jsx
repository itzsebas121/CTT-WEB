import AOS from "aos";
import 'aos/dist/aos.css'
import { Link } from "react-router-dom";

import { useState, useEffect } from "react";



export default function BannerImage({buttons, slides}) {
    const [current, setCurrent] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
        setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
        }, 6000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        AOS.init({duration: 1000});
        AOS.refresh();
    }, []);
  return (
    <div className="relative w-full h-[900px] lg:h-[600px] overflow-hidden bg-white">
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === current ? "opacity-100" : "opacity-0"
          }`}
        >
          <div
            className="w-full h-full bg-fixed bg-center bg-cover"
            style={{ backgroundImage: `url(${slide.image})` }}
          >
            <div className="w-full h-full bg-black/50 flex flex-col lg:flex-row items-center justify-evenly px-12">
              <div className="max-w-xl text-white" data-aos="fade-up">
                <h3 className="text-lg font-semibold">{slide.subtitle}</h3>
                <h2 className="text-4xl md:text-5xl font-bold mt-2">
                  {slide.title}
                </h2>
                <p className="mt-4 text-lg">{slide.text}</p>
              </div>

              {slide.buttonText && slide.buttonLink && (
                <div>
                  <Link to={slide.buttonLink} key={slide.id} data-aos="fade-left">
                    <button>
                      {slide.buttonText}
                    </button>
                  </Link>
                </div>
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
