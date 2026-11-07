import { useRef } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "../../utils/gsapConfig";

const stats = [
  { id: 1, name: "Estudiantes capacitados", value: 2000, suffix: "+" },
  { id: 2, name: "Cursos y programas activos", value: 40, suffix: "" },
  { id: 3, name: "Talleres y eventos concluidos", value: 80, suffix: "+" },
];

export default function Stats() {
  const containerRef = useRef(null);
  const numberRefs = useRef([]);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;

      // Animación de entrada de las tarjetas estadísticas con ScrollTrigger
      gsap.from(".stat-card", {
        opacity: 0,
        y: 35,
        duration: 0.8,
        stagger: 0.2,
        ease: "power3.out",
        clearProps: "all",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 82%",
          once: true,
        },
      });

      // Animación fluida de contadores numéricos con ScrollTrigger
      stats.forEach((stat, idx) => {
        const el = numberRefs.current[idx];
        if (!el) return;

        const countObj = { val: 0 };
        gsap.to(countObj, {
          val: stat.value,
          duration: 1.8,
          ease: "power2.out",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 82%",
            once: true,
          },
          onUpdate: () => {
            if (el) {
              const currentInt = Math.floor(countObj.val);
              el.innerText = `${currentInt.toLocaleString("es-ES")}${stat.suffix}`;
            }
          },
        });
      });
    },
    { scope: containerRef }
  );

  return (
    <div
      ref={containerRef}
      className="bg-[#F5F5F5] dark:bg-[#16161a] border-y border-black/[0.04] dark:border-white/[0.06] py-14 sm:py-16 transition-colors"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <dl className="grid grid-cols-1 gap-x-8 gap-y-12 text-center lg:grid-cols-3">
          {stats.map((stat, idx) => (
            <div
              key={stat.id}
              className="stat-card mx-auto flex max-w-xs flex-col gap-y-3.5 will-change-transform"
            >
              <dt className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 font-medium tracking-tight">
                {stat.name}
              </dt>
              <dd
                ref={(el) => (numberRefs.current[idx] = el)}
                className="order-first text-4xl sm:text-5xl font-extrabold tracking-tight text-[#00345e] dark:text-white"
              >
                0{stat.suffix}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
