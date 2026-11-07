import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { gsap, useGSAP, ScrollTrigger, prefersReducedMotion } from "../../utils/gsapConfig";
import { useDashboardTheme } from "../../context/DashboardThemeContext";

export default function Carousel({
  slides = [],
  height = "500px",
  buttons = true,
  marginTop,
  marginBottom,
  colorText,
  background,
}) {
  const [current, setCurrent] = useState(0);
  const containerRef = useRef(null);
  const { isDark } = useDashboardTheme();

  // Determinar si es un carrusel con tarjeta modal (ej. Proyectos) o directo sobre foto (ej. Hero)
  const hasCard = Boolean(background);

  useEffect(() => {
    if (!slides || slides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 5500);
    return () => clearInterval(interval);
  }, [slides]);

  useGSAP(
    () => {
      if (prefersReducedMotion() || slides.length === 0) return;

      const activeSlide = containerRef.current?.querySelector(`[data-slide-index="${current}"]`);
      if (!activeSlide) return;

      const cardEl = activeSlide.querySelector(".carousel-text-card");
      if (!cardEl) return;

      gsap.fromTo(
        cardEl.children,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.1,
          ease: "power2.out",
        }
      );
    },
    { dependencies: [current], scope: containerRef }
  );

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden bg-white dark:bg-[#121215] transition-colors"
      style={{ height, marginTop, marginBottom }}
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
            alt={slide.title || "Banner slide"}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 flex items-center justify-start bg-black/45">
            <div
              className={`carousel-text-card ml-6 sm:ml-16 max-w-[650px] transition-colors ${
                hasCard
                  ? isDark
                    ? "p-6 sm:p-8 rounded-2xl bg-[#16161a]/95 border border-white/10 shadow-2xl backdrop-blur-md text-zinc-100"
                    : "p-6 sm:p-8 rounded-2xl bg-white/95 border border-black/10 shadow-2xl backdrop-blur-md text-zinc-900"
                  : "p-6 sm:p-10 rounded-2xl bg-black/40 backdrop-blur-xs border border-white/10 text-white"
              }`}
            >
              {slide.title && (
                <h4
                  className={`text-xs sm:text-sm font-bold tracking-wider uppercase ${
                    hasCard
                      ? isDark
                        ? "text-blue-400"
                        : "text-[#00345e]"
                      : "text-blue-200"
                  }`}
                >
                  {slide.title}
                </h4>
              )}
              {slide.subtitle && (
                <h2
                  className={`mt-2 font-extrabold leading-tight ${
                    hasCard
                      ? isDark
                        ? "text-2xl sm:text-4xl text-white"
                        : "text-2xl sm:text-4xl text-zinc-900"
                      : "text-3xl sm:text-5xl text-white"
                  }`}
                >
                  {slide.subtitle}
                </h2>
              )}
              {slide.buttonText && slide.buttonLink && (
                <Link to={slide.buttonLink} className="inline-block mt-6">
                  <button className="px-6 py-2.5 rounded-xl font-semibold text-sm text-white bg-[#00345e] hover:bg-[#002747] active:bg-[#001f38] transition-all shadow-md cursor-pointer border border-white/20">
                    {slide.buttonText}
                  </button>
                </Link>
              )}
            </div>
          </div>
        </div>
      ))}

      {buttons && slides.length > 1 && (
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex items-center space-x-2.5 z-20">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrent(index)}
              aria-label={`Slide ${index + 1}`}
              className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer border-0 ${
                index === current
                  ? "w-8 bg-[#00345e] dark:bg-white shadow-xs"
                  : "w-2.5 bg-white/50 hover:bg-white/80"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
