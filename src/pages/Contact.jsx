import { ChevronDownIcon } from '@heroicons/react/16/solid'
import { Carousel } from "../components/home";
const contentHero =[
  {
    id: 1,
    image:
      "https://ctt-talleresfisei.uta.edu.ec/img/carrusel/carrusel_2.jpeg", 
    title: "Contáctanos",
    subtitle: "Contáctanos para más información",
  },

];
export default function Contact() {
  return (
    <>
        <Carousel slides={contentHero} height="400px" background={'white'} colorText={'#6C1313'} />
        <div className="isolate bg-white px-6 py-24 sm:py-32 lg:px-8">
            <div
                aria-hidden="true"
                className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
            >
                <div
                style={{
                    clipPath:
                    'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
                }}
                className="relative left-1/2 -z-10 aspect-1155/678 w-144.5 max-w-none -translate-x-1/2 rotate-30 bg-linear-to-tr from-[#6C1313] to-[#CB972D] opacity-20 sm:left-[calc(50%-40rem)] sm:w-288.75"
                />
            </div>
            <div className="mx-auto max-w-2xl text-center mb-16">
                <h2 className="text-4xl font-semibold tracking-tight text-balance text-[#6C1313] sm:text-5xl">Contáctanos</h2>
                <p className="mt-2 text-lg/8 text-gray-600">Deja tus datos y nosotros te contactaremos.</p>
            </div>

            {/* Contenedor de dos columnas */}
            <div className="mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                {/* Formulario - Columna Izquierda */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-300 p-8">
                    <form className="space-y-6">
                        <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-6">
                            <div className="sm:col-span-1">
                                <label htmlFor="first-name" className="block text-sm font-semibold text-[#6C1313] mb-2">
                                    Nombre
                                </label>
                                <div className="mt-1">
                                    <input
                                        id="first-name"
                                        name="first-name"
                                        type="text"
                                        autoComplete="given-name"
                                        className="block w-full rounded-lg bg-gray-50 border border-gray-200 px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-[#6C1313] focus:ring-2 focus:ring-[#6C1313]/20 transition-all duration-200 hover:border-[#CB972D] focus:bg-white"
                                        placeholder="Ingresa tu nombre"
                                    />
                                </div>
                            </div>
                            <div className="sm:col-span-1">
                                <label htmlFor="last-name" className="block text-sm font-semibold text-[#6C1313] mb-2">
                                    Apellido
                                </label>
                                <div className="mt-1">
                                    <input
                                        id="last-name"
                                        name="last-name"
                                        type="text"
                                        autoComplete="family-name"
                                        className="block w-full rounded-lg bg-gray-50 border border-gray-200 px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-[#6C1313] focus:ring-2 focus:ring-[#6C1313]/20 transition-all duration-200 hover:border-[#CB972D] focus:bg-white"
                                        placeholder="Ingresa tu apellido"
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-semibold text-[#6C1313] mb-2">
                                Correo Electrónico
                            </label>
                            <div className="mt-1">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    className="block w-full rounded-lg bg-gray-50 border border-gray-200 px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-[#6C1313] focus:ring-2 focus:ring-[#6C1313]/20 transition-all duration-200 hover:border-[#CB972D] focus:bg-white"
                                    placeholder="tu.email@ejemplo.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="phone-number" className="block text-sm font-semibold text-[#6C1313] mb-2">
                                Número de teléfono
                            </label>
                            <div className="mt-1">
                                <div className="flex rounded-lg bg-gray-50 border border-gray-200 focus-within:border-[#6C1313] focus-within:ring-2 focus-within:ring-[#6C1313]/20 transition-all duration-200 hover:border-[#CB972D]">
                                    <div className="grid shrink-0 grid-cols-1 focus-within:relative">
                                        <select
                                            id="country"
                                            name="country"
                                            autoComplete="country"
                                            aria-label="Country"
                                            className="col-start-1 row-start-1 w-full appearance-none rounded-l-lg py-3 pr-7 pl-4 text-gray-500 placeholder:text-gray-400 focus:outline-none bg-transparent sm:text-sm"
                                        >
                                            <option>+593</option>
                                            <option>+1</option>
                                            <option>+57</option>
                                            <option>+51</option>
                                        </select>
                                        <ChevronDownIcon
                                            aria-hidden="true"
                                            className="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-400 sm:size-4"
                                        />
                                    </div>
                                    <input
                                        id="phone-number"
                                        name="phone-number"
                                        type="text"
                                        placeholder="099-123-4567"
                                        className="block min-w-0 grow py-3 pr-4 pl-1 text-gray-900 placeholder:text-gray-400 focus:outline-none bg-transparent sm:text-sm"
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="message" className="block text-sm font-semibold text-[#6C1313] mb-2">
                                Mensaje
                            </label>
                            <div className="mt-1">
                                <textarea
                                    id="message"
                                    name="message"
                                    rows={5}
                                    className="block w-full rounded-lg bg-gray-50 border border-gray-200 px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-[#6C1313] focus:ring-2 focus:ring-[#6C1313]/20 transition-all duration-200 hover:border-[#CB972D] focus:bg-white resize-none"
                                    placeholder="Escribe tu mensaje aquí..."
                                    defaultValue={''}
                                />
                            </div>
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                className="w-full rounded-lg bg-[#6C1313] px-4 py-3 text-center text-sm font-semibold text-white shadow-sm hover:bg-[#5a0f0f] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6C1313] transition-all duration-200 hover:shadow-lg transform hover:-translate-y-0.5"
                            >
                                ENVIAR MENSAJE
                            </button>
                        </div>
                    </form>
                </div>

                {/* Mapa - Columna Derecha */}
                <div className="bg-white rounded-2xl shadow-xl border h-full border-gray-300 overflow-hidden">
                    <div className="p-4 bg-[#6C1313] text-white">
                        <h3 className="text-lg font-semibold text-center">Nuestra Ubicación</h3>
                    </div>
                    <div className="aspect-video w-full h-full">
                        <iframe
                            width="100%"
                            height="90%"
                            style={{ border: 0 }}
                            loading="lazy"
                            allowFullScreen
                            referrerPolicy="no-referrer-when-downgrade"
                            src="https://www.google.com/maps/embed/v1/place?key=AIzaSyD_2K6NNv0BiPJcMXHjVtyHTR9oj3yw8sw&q=-1.268050,-78.624256"
                            className="rounded-b-2xl"
                        />
                    </div>
                </div>
            </div>
        </div>
    </>
    
  )
}
