import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { gsap, useGSAP, prefersReducedMotion } from "../../utils/gsapConfig";

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
            clearProps: "all",
          }
        );
      }
      if (btnEl) {
        tl.fromTo(
          btnEl,
          { opacity: 0, x: 20 },
          { opacity: 1, x: 0, duration: 0.5, ease: "power2.out", clearProps: "all" },
          "-=0.3"
        );
      }
    },
    { dependencies: [current], scope: containerRef }
  );

  return (
    <div
      ref={containerRef}
      className="relative w-full min-h-[480px] lg:min-h-[540px] overflow-hidden bg-zinc-900 transition-colors"
    >
      {slides.map((slide, index) => (
        <div
          key={slide.id || index}
          data-slide-index={index}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === current ? "opacity-100 z-10 pointer-events-auto" : "opacity-0 z-0 pointer-events-none"
          }`}
        >
          <img
            src={slide.image}
            alt={slide.title || "Sobre Nosotros"}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/65 flex flex-col lg:flex-row items-center justify-between px-6 sm:px-12 lg:px-20 py-16 gap-8">
            <div className="banner-text-content max-w-2xl text-white space-y-4">
              {/* Título Directo y Limpio (Sin eyebrow overline) */}
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
                {slide.title}
              </h2>
              {slide.text && (
                <p className="text-sm sm:text-base lg:text-lg text-zinc-200 leading-relaxed font-normal">
                  {slide.text}
                </p>
              )}
            </div>

            {slide.buttonText && slide.buttonLink && (
              <div className="banner-btn-content flex-shrink-0">
                <Link to={slide.buttonLink}>
                  <button className="px-6 py-3 rounded-xl font-semibold text-xs sm:text-sm text-white bg-[#00345e] hover:bg-[#002747] active:bg-[#001f38] transition-all shadow-md cursor-pointer border border-white/20">
                    {slide.buttonText}
                  </button>
                </Link>
              </div>
            )}
          </div>
        </div>
      ))}

      {buttons && slides.length > 1 && (
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2.5 z-20">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrent(index)}
              aria-label={`Slide ${index + 1}`}
              className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer border-0 ${
                index === current
                  ? "w-8 bg-white shadow-md"
                  : "w-2.5 bg-white/40 hover:bg-white/70"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
