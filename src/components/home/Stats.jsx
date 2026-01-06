import { useEffect, useState, useRef } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';

const stats = [
  { id: 1, name: 'Estudiantes', value: '2,000' },
  { id: 2, name: 'Cursos activos', value: '40' },
  { id: 3, name: 'Cursos concluidos', value: '80' },
]

// Hook personalizado para animar el contador
function useAnimatedCounter(endValue, duration = 2000) {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible) return;

    const startValue = 0;
    const startTime = Date.now();
    const numericValue = parseInt(endValue.replace(/,/g, ''), 10);

    const animate = () => {
      const currentTime = Date.now();
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function para una animación más suave
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentValue = Math.floor(startValue + (numericValue - startValue) * easeOut);

      // Formatear el número con comas
      const formattedValue = currentValue.toLocaleString('es-ES');
      setCount(formattedValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setCount(endValue); // Asegurar que termine en el valor exacto
      }
    };

    animate();
  }, [isVisible, endValue, duration]);

  return [count, elementRef];
}

export default function Stats() {
  useEffect(() => {
    AOS.init({ duration: 1000, once: false, mirror: true });
    AOS.refresh();
  }, []);
  return (
     <div className="bg-[#F5F5F5] py-12 sm:py-14" data-aos="fade-down">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <dl className="grid grid-cols-1 gap-x-8 gap-y-16 text-center lg:grid-cols-3">
          {stats.map((stat) => {
            const [animatedValue, elementRef] = useAnimatedCounter(stat.value);
            return (
              <div key={stat.id} className="mx-auto flex max-w-xs flex-col gap-y-4" ref={elementRef}>
                <dt className="text-base/7 text-[#6C1313]">{stat.name}</dt>
                <dd className="order-first text-3xl font-semibold tracking-tight text-[#6C1313] sm:text-5xl">
                  {animatedValue}
                </dd>
              </div>
            );
          })}
        </dl>
      </div>
    </div>
  )
}
