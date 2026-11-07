import { useRef } from 'react';
import * as Icons from '@heroicons/react/24/outline';
import { gsap, useGSAP, prefersReducedMotion } from '../../utils/gsapConfig';
import fiseiFallback from '../../assets/fisei.jpg';

export default function Section({ item }) {
  const containerRef = useRef(null);

  useGSAP(
    () => {
      if (prefersReducedMotion() || !containerRef.current) return;

      gsap.from('.section-fade-in', {
        opacity: 0,
        y: 30,
        duration: 0.7,
        stagger: 0.15,
        ease: 'power2.out',
        clearProps: 'all',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 80%',
          once: true,
        },
      });
    },
    { scope: containerRef }
  );

  return (
    <div
      ref={containerRef}
      className="overflow-hidden bg-white dark:bg-[#121215] py-16 sm:py-24 transition-colors"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-12 gap-y-12 lg:mx-0 lg:max-w-none lg:grid-cols-2 items-center">
          <div className="section-fade-in lg:pt-4">
            <div className="lg:max-w-lg">
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                {item.subtitle || item.title}
              </h2>
              {item.description && (
                <p className="mt-4 text-base sm:text-lg leading-relaxed text-gray-700 dark:text-zinc-300">
                  {item.description}
                </p>
              )}
              {item.list && (
                <dl className="mt-8 space-y-6 text-sm sm:text-base">
                  {item.list.map((listItem, index) => {
                    const Icono = Icons[listItem.icon] || Icons.AcademicCapIcon;
                    return (
                      <div key={index} className="relative pl-8">
                        <dt className="inline font-bold text-[#00345e] dark:text-blue-400">
                          <Icono
                            aria-hidden="true"
                            className="absolute top-0.5 left-0 size-5 text-[#00345e] dark:text-blue-400"
                          />
                          {listItem.title}
                        </dt>
                        <dd className="inline text-gray-700 dark:text-zinc-300 ml-1">
                          {listItem.description}
                        </dd>
                      </div>
                    );
                  })}
                </dl>
              )}
            </div>
          </div>
          <div className="section-fade-in flex justify-center">
            <img
              alt="Instalaciones CTT UTA"
              src={item.image || fiseiFallback}
              onError={(e) => {
                e.currentTarget.src = fiseiFallback;
              }}
              className="w-full max-w-lg lg:max-w-none h-auto max-h-[500px] object-cover rounded-2xl shadow-xl ring-1 ring-black/[0.08] dark:ring-white/[0.1]"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
