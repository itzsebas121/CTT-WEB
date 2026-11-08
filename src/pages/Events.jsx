import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarDaysIcon, MapPinIcon, AcademicCapIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { Carousel } from '../components/home';
import { getCongresses, getCongressYears } from '../api/congresses';
import { useDashboardTheme } from '../context/DashboardThemeContext';

const eventsHeroSlides = [
  {
    id: 1,
    image:
      'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1600&q=80',
    title: 'Eventos y Congresos Académicos',
    subtitle: 'Conoce los próximos simposios, talleres y conferencias de la FISEI',
  },
];

export default function Events() {
  const [congresses, setCongresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedYear, setSelectedYear] = useState('Todos');
  const [availableYears, setAvailableYears] = useState([]);
  const { isDark } = useDashboardTheme();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchYears = async () => {
      try {
        const years = await getCongressYears();
        if (Array.isArray(years) && years.length > 0) {
          setAvailableYears(years.map(String));
        } else {
          setAvailableYears(['2027', '2026']);
        }
      } catch {
        setAvailableYears(['2027', '2026']);
      }
    };
    fetchYears();
  }, []);

  useEffect(() => {
    const loadCongresses = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await getCongresses({
          page: 1,
          pageSize: 30,
          year: selectedYear === 'Todos' ? null : selectedYear,
          orderBy: 'fecha_inicio',
          orderDesc: true,
        });

        const list = Array.isArray(res)
          ? res
          : res?.congresses || res?.data?.congresses || res?.data || [];
        setCongresses(list);
      } catch (err) {
        setError(err.message || 'Error al cargar eventos');
      } finally {
        setLoading(false);
      }
    };

    loadCongresses();
  }, [selectedYear]);

  const formatDateRange = (start, end) => {
    if (!start && !end) return 'Por definir';
    try {
      const s = start ? new Date(start + 'T00:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
      const e = end ? new Date(end + 'T00:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
      return s && e ? `${s} - ${e}` : s || e;
    } catch {
      return `${start} - ${end}`;
    }
  };

  return (
    <div className="bg-white dark:bg-[#121215] transition-colors min-h-screen">
      <Carousel
        slides={eventsHeroSlides}
        height="400px"
        background={isDark ? '#16161a' : '#ffffff'}
        colorText={isDark ? '#f4f4f5' : 'var(--color-primary)'}
      />

      <section className="container mx-auto px-5 py-12">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
          <div className="max-w-3xl">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-[#00345e] dark:text-[#5b8dd8]">
              Próximos Congresos y Simposios
            </h1>
            <p className="mt-2 text-zinc-600 dark:text-zinc-400 text-sm sm:text-base">
              Participa en congresos internacionales, conferencias magistrales y simposios de investigación tecnológica organizados por la FISEI.
            </p>
          </div>

          {/* Filtros por Año */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none self-start md:self-auto">
            <button
              type="button"
              onClick={() => setSelectedYear('Todos')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer shrink-0 border ${
                selectedYear === 'Todos'
                  ? 'bg-[#00345e] text-white border-[#00345e] shadow-2xs'
                  : isDark
                  ? 'bg-transparent text-zinc-400 hover:text-white border-transparent hover:bg-white/[0.04]'
                  : 'bg-transparent text-zinc-600 hover:text-zinc-900 border-transparent hover:bg-zinc-100'
              }`}
            >
              Todos ({congresses.length})
            </button>
            {availableYears.map((yr) => (
              <button
                key={yr}
                type="button"
                onClick={() => setSelectedYear(yr)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer shrink-0 border ${
                  selectedYear === yr
                    ? 'bg-[#00345e] text-white border-[#00345e] shadow-2xs'
                    : isDark
                    ? 'bg-transparent text-zinc-400 hover:text-white border-transparent hover:bg-white/[0.04]'
                    : 'bg-transparent text-zinc-600 hover:text-zinc-900 border-transparent hover:bg-zinc-100'
                }`}
              >
                Año {yr}
              </button>
            ))}
          </div>
        </div>

        {/* Estado de Carga */}
        {loading && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-black/[0.06] dark:border-white/[0.08] bg-white dark:bg-[#16161a] p-6 space-y-4 animate-pulse"
              >
                <div className="aspect-video w-full rounded-xl bg-zinc-200 dark:bg-white/[0.06]" />
                <div className="h-5 w-3/4 bg-zinc-200 dark:bg-white/[0.06] rounded" />
                <div className="h-4 w-1/2 bg-zinc-200 dark:bg-white/[0.06] rounded" />
              </div>
            ))}
          </div>
        )}

        {/* Lista de Congresos */}
        {!loading && congresses.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {congresses.map((event) => {
              const cid = event.id_congreso || event.id;
              return (
                <article
                  key={cid}
                  className="rounded-2xl border border-black/[0.08] dark:border-white/[0.08] bg-white dark:bg-[#16161a] shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
                >
                  <div>
                    {/* Imagen de Portada */}
                    <div className="aspect-video w-full relative overflow-hidden bg-zinc-100 dark:bg-zinc-900 border-b border-black/[0.04] dark:border-white/[0.06]">
                      {event.poster_cover_url && !event.poster_cover_url.includes('example.com') ? (
                        <img
                          src={event.poster_cover_url}
                          alt={event.nombre}
                          className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-400 dark:text-zinc-600 bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-900 dark:to-zinc-800">
                          <AcademicCapIcon className="w-14 h-14 stroke-[1.2]" />
                        </div>
                      )}

                      <div className="absolute top-3 left-3">
                        <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-[#00345e] text-white shadow-xs">
                          {event.edicion || `Edición ${event.anio}`}
                        </span>
                      </div>

                      <div className="absolute top-3 right-3">
                        <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-white/90 dark:bg-black/80 backdrop-blur-xs text-zinc-800 dark:text-zinc-200 border border-black/10 dark:border-white/10 shadow-xs">
                          {event.anio}
                        </span>
                      </div>
                    </div>

                    <div className="p-6">
                      <h2 className="text-lg font-bold text-zinc-900 dark:text-white mb-2 line-clamp-2 group-hover:text-[#00345e] dark:group-hover:text-blue-400 transition-colors">
                        {event.nombre}
                      </h2>

                      <div className="space-y-1.5 text-xs text-zinc-600 dark:text-zinc-400 mb-3">
                        <p className="flex items-center gap-2">
                          <CalendarDaysIcon className="h-4 w-4 text-[#00345e] dark:text-blue-400 shrink-0" />
                          <span>{formatDateRange(event.fecha_inicio, event.fecha_fin)}</span>
                        </p>
                        <p className="flex items-center gap-2">
                          <MapPinIcon className="h-4 w-4 text-[#00345e] dark:text-blue-400 shrink-0" />
                          <span>Universidad Técnica de Ambato · FISEI</span>
                        </p>
                      </div>

                      <p className="text-zinc-500 dark:text-zinc-400 text-xs sm:text-sm line-clamp-3 leading-relaxed">
                        {event.descripcion_general || 'Sin descripción disponible para este congreso.'}
                      </p>
                    </div>
                  </div>

                  <div className={`p-6 pt-3 border-t flex items-center justify-between ${
                    isDark ? 'border-white/[0.06] bg-white/[0.01]' : 'border-black/[0.04] bg-zinc-50/50'
                  }`}>
                    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      Inscripciones Abiertas
                    </span>
                    <button
                      type="button"
                      onClick={() => navigate(`/congreso/${cid}`)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#00345e] hover:bg-[#002747] active:bg-[#001f38] text-white rounded-xl text-xs font-semibold transition cursor-pointer shadow-xs border-0"
                    >
                      <span>Ver Detalles</span>
                      <ArrowRightIcon className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* Estado Vacío */}
        {!loading && congresses.length === 0 && (
          <div className="text-center py-16 px-4">
            <AcademicCapIcon className="w-12 h-12 text-zinc-400 mx-auto mb-3 opacity-60" />
            <h3 className="text-base font-bold text-zinc-900 dark:text-white">
              No hay eventos disponibles
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              No se encontraron congresos para el año seleccionado.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
