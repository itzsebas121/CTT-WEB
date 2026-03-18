import { CalendarDaysIcon, MapPinIcon, ClockIcon } from '@heroicons/react/24/outline';
import { Carousel } from '../components/home';

const eventsHeroSlides = [
  {
    id: 1,
    image:
      'https://ctt-talleresfisei.uta.edu.ec/img/carrusel/carrusel_2.jpeg',
    title: 'Eventos',
    subtitle: 'Conoce los próximos eventos del CTT',
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
    <div className="bg-white">
      <Carousel
        slides={eventsHeroSlides}
        height="400px"
        background={'white'}
        colorText={'var(--color-primary)'}
      />

      <section className="container mx-auto px-5 py-12">
        <div className="max-w-3xl mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-primary">Próximos eventos</h1>
          <p className="mt-3 text-gray-600 text-base md:text-lg">
            Participa en actividades académicas, talleres y espacios de innovación organizados por el CTT.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {upcomingEvents.map((event) => (
            <article
              key={event.id}
              className="rounded-2xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow"
            >
              <h2 className="text-xl font-semibold text-primary mb-4">{event.title}</h2>

              <div className="space-y-2 text-sm text-gray-700 mb-4">
                <p className="flex items-center gap-2">
                  <CalendarDaysIcon className="h-5 w-5 text-primary" />
                  {event.date}
                </p>
                <p className="flex items-center gap-2">
                  <ClockIcon className="h-5 w-5 text-primary" />
                  {event.time}
                </p>
                <p className="flex items-center gap-2">
                  <MapPinIcon className="h-5 w-5 text-primary" />
                  {event.location}
                </p>
              </div>

              <p className="text-gray-600 text-sm leading-6">{event.description}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
