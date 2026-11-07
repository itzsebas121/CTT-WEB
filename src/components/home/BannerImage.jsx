import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { gsap, useGSAP, ScrollTrigger, prefersReducedMotion } from "../../utils/gsapConfig";

export default function BannerImage({ buttons, slides = [] }) {
  const [current, setCurrent] = useState(0);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!slides || slides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 6000);
    return () => clearInterval(interval);
  }, [slides]);

  useGSAP(
    () => {
      if (prefersReducedMotion() || slides.length === 0) return;

      const activeSlide = containerRef.current?.querySelector(`[data-slide-index="${current}"]`);
      if (!activeSlide) return;

      const textEl = activeSlide.querySelector(".banner-text-content");
      const btnEl = activeSlide.querySelector(".banner-btn-content");

      const tl = gsap.timeline();
      if (textEl) {
        tl.fromTo(
          textEl.children,
          { opacity: 0, y: 25 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            stagger: 0.12,
            ease: "power2.out",
          }
        );
      }
      if (btnEl) {
        tl.fromTo(
          btnEl,
          { opacity: 0, x: 20 },
          { opacity: 1, x: 0, duration: 0.5, ease: "power2.out" },
          "-=0.3"
        );
      }
    },
    { dependencies: [current], scope: containerRef }
  );

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[900px] lg:h-[600px] overflow-hidden bg-white dark:bg-[#121215] transition-colors"
    >
      {slides.map((slide, index) => (
        <div
          key={slide.id || index}
          data-slide-index={index}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === current ? "opacity-100 z-10 pointer-events-auto" : "opacity-0 z-0 pointer-events-none"
          }`}
        >
          <div
            className="w-full h-full bg-fixed bg-center bg-cover"
            style={{ backgroundImage: `url(${slide.image})` }}
          >
            <div className="w-full h-full bg-black/60 flex flex-col lg:flex-row items-center justify-evenly px-6 sm:px-12">
              <div className="banner-text-content max-w-xl text-white">
                <h3 className="text-lg font-semibold text-blue-200">{slide.subtitle}</h3>
                <h2 className="text-4xl md:text-5xl font-bold mt-2">
                  {slide.title}
                </h2>
                <p className="mt-4 text-lg text-zinc-200">{slide.text}</p>
              </div>

              {slide.buttonText && slide.buttonLink && (
                <div className="banner-btn-content mt-6 lg:mt-0">
                  <Link to={slide.buttonLink}>
                    <button className="px-6 py-2.5 rounded-xl font-semibold text-sm text-white bg-[#00345e] hover:bg-[#002747] active:bg-[#001f38] transition-all shadow-md cursor-pointer border border-white/20">
                      {slide.buttonText}
                    </button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
      {buttons && slides.length > 1 && (
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-3 z-20">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrent(index)}
              aria-label={`Slide ${index + 1}`}
              style={{ backgroundColor: index === current ? "white" : "rgba(255,255,255,0.4)" }}
              className="w-3 h-3 rounded-full cursor-pointer transition-all hover:scale-125 border-0"
            />
          ))}
        </div>
      )}
    </div>
  );
}
