import * as Icons from "@heroicons/react/20/solid"
import { useEffect } from "react"
import AOS from "aos"
import 'aos/dist/aos.css'

const objetivos = [
  {
    id: 1,
    name: 'Formular ',
    description:
      'alternativas tecnológicas aplicables a la solución de problemas inherentes a sus áreas de trabajo, que satisfagan las necesidades básicas de la población en general con el fin de propender a su desarrollo.',
    icon: 'AcademicCapIcon',
  },
  {
    id: 2,
    name: 'Proporcionar ',
    description: 'capacitación, asesoramiento técnico y consultorías a los sectores públicos y privados.',
    icon: 'AcademicCapIcon',
  },
  {
    id: 3,
    name: 'Brindar ',
    description: 'soporte académico y técnico a las carreras profesionales relacionadas con sus áreas de trabajo.',
    icon: 'AcademicCapIcon',
  },
  {
    id: 4,
    name: 'Difundir ',
    description: 'el conocimiento técnico - científico existente, en foros nacionales e internacionales a través de concursos, congresos, seminarios, conferencias y publicaciones de artículos.',
    icon: 'AcademicCapIcon',
  },
]

export default function Banner () 
{
    useEffect(() => {
      AOS.init({ duration: 1000, once: false, mirror: true });
      AOS.refresh();
    }, []);
  return (
    <div className="bg-white mt-15" data-aos="fade-down">
        <div className="relative isolate overflow-hidden bg-[#6C1313] px-6 lg:py-8 sm:py-32 shadow-2xl sm:px-16 md:pt-24 lg:flex lg:gap-x-20 lg:px-24 lg:pt-0">
          <svg
            viewBox="0 0 1024 1024"
            aria-hidden="true"
            className="absolute top-1/2 left-1/2 -z-10 size-256 -translate-y-1/2 mask-[radial-gradient(closest-side,white,transparent)] sm:left-full sm:-ml-80 lg:left-1/2 lg:ml-0 lg:-translate-x-1/2 lg:translate-y-0"
          >
            <circle r={512} cx={512} cy={512} fill="url(#759c1415-0410-454c-8f7c-9a820de03641)" fillOpacity="0.7" />
            <defs>
              <radialGradient id="759c1415-0410-454c-8f7c-9a820de03641">
                <stop stopColor="#7775D6" />
                <stop offset={1} stopColor="#E935C1" />
              </radialGradient>
            </defs>
          </svg>
          <div className="mx-auto max-w-md text-center lg:mx-0 lg:flex-auto lg:py-10 lg:text-left">
            <h2 className="text-2xl font-semibold text-white">Nosotros</h2>
            <h2 className="text-3xl font-semibold tracking-tight text-balance text-white sm:text-4xl">
              Nuestros Objetivos.
            </h2>
            <dl className="mt-10 max-w-xl space-y-8 text-base/7 text-white lg:max-w-none">
                {objetivos.map((objetivo) => {
                  const  Icono = Icons[objetivo.icon];
                  return (
                    <div key={objetivo.id} className="relative pl-9">
                      <dt className="inline font-semibold text-white">
                        <Icono aria-hidden="true" className="absolute top-1 left-1 size-5 text[#C61313]" />
                        {objetivo.name}
                      </dt>
                      <dd className="inline">{objetivo.description}</dd>
                    </div>
                  )
                })}
              </dl>
          </div>
          <div className="relative mt-16 h-80 lg:mt-32">
            <img
              alt="App screenshot"
              src="src/assets/fisei.jpg"
              width={1824}
              height={1080}
              className="absolute top-0 left-0 w-228 max-w-none rounded-md bg-white/5 ring-1 ring-white/10"
              data-aos="fade-up"
            />
          </div>
        </div>
    </div>
  )
}
