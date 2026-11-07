import { ChevronDownIcon } from '@heroicons/react/16/solid'
import { Carousel } from "../components/home";
import { useDashboardTheme } from "../context/DashboardThemeContext";

const contentHero = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1423666639041-f56000c27a9a?auto=format&fit=crop&w=1600&q=80",
    title: "Atención y Contacto Directo",
    subtitle: "Comunícate con el Centro de Transferencia y Desarrollo de Tecnologías.",
  },
];

export default function Contact() {
  const { isDark } = useDashboardTheme();

  return (
    <>
      <Carousel slides={contentHero} height="400px" background={true} />
      <div className="isolate bg-white dark:bg-[#121215] px-6 py-16 sm:py-24 lg:px-8 transition-colors">
        <div className="mx-auto max-w-2xl text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-primary dark:text-white">
            Contáctanos
          </h2>
          <p className="mt-3 text-base text-gray-600 dark:text-zinc-400">
            Completa tus datos o visítanos en nuestras oficinas para coordinar capacitaciones, proyectos y asesorías.
          </p>
        </div>

        {/* Contenedor de dos columnas */}
        <div className="mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-stretch">
          {/* Formulario - Columna Izquierda */}
          <div className="bg-white dark:bg-[#16161a] rounded-2xl shadow-xl border border-gray-200 dark:border-white/[0.08] p-6 sm:p-8 transition-colors flex flex-col justify-between">
            <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
              <div className="grid grid-cols-1 gap-y-5 sm:grid-cols-2 sm:gap-x-5">
                <div>
                  <label htmlFor="first-name" className="block text-xs font-bold text-primary dark:text-blue-300 mb-1.5 uppercase tracking-wider">
                    Nombre
                  </label>
                  <input
                    id="first-name"
                    name="first-name"
                    type="text"
                    autoComplete="given-name"
                    className="block w-full rounded-xl bg-gray-50 dark:bg-zinc-800/60 border border-gray-200 dark:border-white/10 px-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:border-primary dark:focus:border-blue-400 focus:outline-none transition-colors"
                    placeholder="Ingresa tu nombre"
                  />
                </div>
                <div>
                  <label htmlFor="last-name" className="block text-xs font-bold text-primary dark:text-blue-300 mb-1.5 uppercase tracking-wider">
                    Apellido
                  </label>
                  <input
                    id="last-name"
                    name="last-name"
                    type="text"
                    autoComplete="family-name"
                    className="block w-full rounded-xl bg-gray-50 dark:bg-zinc-800/60 border border-gray-200 dark:border-white/10 px-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:border-primary dark:focus:border-blue-400 focus:outline-none transition-colors"
                    placeholder="Ingresa tu apellido"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-xs font-bold text-primary dark:text-blue-300 mb-1.5 uppercase tracking-wider">
                  Correo Electrónico
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  className="block w-full rounded-xl bg-gray-50 dark:bg-zinc-800/60 border border-gray-200 dark:border-white/10 px-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:border-primary dark:focus:border-blue-400 focus:outline-none transition-colors"
                  placeholder="tu.email@ejemplo.com"
                />
              </div>

              <div>
                <label htmlFor="phone-number" className="block text-xs font-bold text-primary dark:text-blue-300 mb-1.5 uppercase tracking-wider">
                  Número de Teléfono
                </label>
                <div className="flex rounded-xl bg-gray-50 dark:bg-zinc-800/60 border border-gray-200 dark:border-white/10 focus-within:border-primary dark:focus-within:border-blue-400">
                  <div className="grid shrink-0 grid-cols-1 focus-within:relative">
                    <select
                      id="country"
                      name="country"
                      aria-label="Código de país"
                      className="col-start-1 row-start-1 w-full appearance-none rounded-l-xl py-2.5 pr-7 pl-3 text-xs sm:text-sm text-gray-600 dark:text-zinc-300 focus:outline-none bg-transparent"
                    >
                      <option className="dark:bg-zinc-900">+593</option>
                      <option className="dark:bg-zinc-900">+1</option>
                      <option className="dark:bg-zinc-900">+57</option>
                      <option className="dark:bg-zinc-900">+51</option>
                    </select>
                    <ChevronDownIcon
                      aria-hidden="true"
                      className="pointer-events-none col-start-1 row-start-1 mr-2 size-4 self-center justify-self-end text-gray-400"
                    />
                  </div>
                  <input
                    id="phone-number"
                    name="phone-number"
                    type="text"
                    placeholder="099-123-4567"
                    className="block min-w-0 grow py-2.5 pr-4 pl-2 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none bg-transparent"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="message" className="block text-xs font-bold text-primary dark:text-blue-300 mb-1.5 uppercase tracking-wider">
                  Mensaje
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  className="block w-full rounded-xl bg-gray-50 dark:bg-zinc-800/60 border border-gray-200 dark:border-white/10 px-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:border-primary dark:focus:border-blue-400 focus:outline-none transition-colors resize-none"
                  placeholder="¿En qué programa o capacitación estás interesado?"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full rounded-xl bg-[#00345e] hover:bg-[#002747] px-4 py-3 text-center text-sm font-semibold text-white shadow-md transition-all cursor-pointer border-0"
                >
                  Enviar Mensaje
                </button>
              </div>
            </form>
          </div>

          {/* Mapa - Columna Derecha */}
          <div className="bg-white dark:bg-[#16161a] rounded-2xl shadow-xl border border-gray-200 dark:border-white/[0.08] overflow-hidden flex flex-col">
            <div className="p-4 bg-[#00345e] text-white flex items-center justify-between">
              <h3 className="text-sm font-bold tracking-wide">Campus Huachi · FISEI</h3>
              <span className="text-xs text-blue-200">Ambato, Ecuador</span>
            </div>
            <div className="w-full flex-1 min-h-[360px]">
              <iframe
                title="Ubicación CTT UTA"
                width="100%"
                height="100%"
                style={{ border: 0, minHeight: "360px" }}
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
                src="https://www.google.com/maps/embed/v1/place?key=AIzaSyD_2K6NNv0BiPJcMXHjVtyHTR9oj3yw8sw&q=-1.268050,-78.624256"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
