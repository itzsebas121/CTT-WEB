import { CalendarDaysIcon, MapPinIcon, ClockIcon } from '@heroicons/react/24/outline';
import { Carousel } from '../components/home';

const eventsHeroSlides = [
  {
    id: 1,
    image:
      'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1600&q=80',
    title: 'Eventos y Congresos Académicos',
    subtitle: 'Conoce los próximos simposios, talleres y conferencias de la FISEI',
  },
];

const upcomingEvents = [
  {
    id: 1,
    title: 'Jornada de Innovación Tecnológica',
    date: '10 de abril de 2026',
    time: '09:00 - 13:00',
    location: 'Auditorio FISEI - UTA',
    description:
      'Conferencias y demostraciones sobre tendencias en desarrollo de software, IA aplicada y transformación digital.',
  },
  {
    id: 2,
    title: 'Taller de Automatización Industrial',
    date: '24 de abril de 2026',
    time: '15:00 - 18:00',
    location: 'Laboratorio de Control y Automatización',
    description:
      'Espacio práctico para conocer herramientas de automatización, sensores y diseño de soluciones para la industria.',
  },
  {
    id: 3,
    title: 'Encuentro de Proyectos Estudiantiles',
    date: '08 de mayo de 2026',
    time: '10:00 - 14:00',
    location: 'Centro de Convenciones UTA',
    description:
      'Presentación de proyectos de impacto desarrollados por estudiantes y docentes en distintas áreas tecnológicas.',
  },
];

export default function Events() {
  return (
    <div className="bg-white dark:bg-[#121215] transition-colors min-h-screen">
      <Carousel
        slides={eventsHeroSlides}
        height="400px"
        background={'white'}
        colorText={'var(--color-primary)'}
      />

      <section className="container mx-auto px-5 py-12">
        <div className="max-w-3xl mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-primary dark:text-[#5b8dd8]">Próximos eventos</h1>
          <p className="mt-3 text-gray-600 dark:text-zinc-400 text-base md:text-lg">
            Participa en actividades académicas, talleres y espacios de innovación organizados por el CTT.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {upcomingEvents.map((event) => (
            <article
              key={event.id}
              className="rounded-2xl border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-[#16161a] shadow-sm p-6 hover:shadow-md transition-all"
            >
              <h2 className="text-xl font-bold text-primary dark:text-white mb-4">{event.title}</h2>

              <div className="space-y-2 text-sm text-gray-700 dark:text-zinc-300 mb-4">
                <p className="flex items-center gap-2">
                  <CalendarDaysIcon className="h-5 w-5 text-primary dark:text-blue-400" />
                  {event.date}
                </p>
                <p className="flex items-center gap-2">
                  <ClockIcon className="h-5 w-5 text-primary dark:text-blue-400" />
                  {event.time}
                </p>
                <p className="flex items-center gap-2">
                  <MapPinIcon className="h-5 w-5 text-primary dark:text-blue-400" />
                  {event.location}
                </p>
              </div>

              <p className="text-gray-600 dark:text-zinc-400 text-sm leading-6">{event.description}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
