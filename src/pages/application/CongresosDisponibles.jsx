import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CalendarDaysIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  EyeIcon,
  AcademicCapIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  QueueListIcon,
  Squares2X2Icon,
} from '@heroicons/react/24/outline';
import { getCongresses, getCongressYears } from '../../api/congresses';
import { getUserEnrollments, enrollInCongress } from '../../api/inscripciones';
import { getUser } from '../../utils/auth';
import { useDashboardTheme } from '../../context/DashboardThemeContext';
import EnrollmentModal from '../../components/ui/EnrollmentModal';

export default function CongresosDisponibles() {
  const [congresses, setCongresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedYear, setSelectedYear] = useState('Todos');
  const [availableYears, setAvailableYears] = useState([]);
  const [viewMode, setViewMode] = useState('cards'); // 'cards' | 'table'
  const [userEnrollments, setUserEnrollments] = useState([]);
  const [enrollingId, setEnrollingId] = useState(null);

  // Modal de confirmación de inscripción
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCongressName, setSelectedCongressName] = useState('');
  const [enrollmentData, setEnrollmentData] = useState(null);
  const [enrollmentError, setEnrollmentError] = useState(null);

  const { isDark } = useDashboardTheme();
  const navigate = useNavigate();
  const user = getUser();

  // Cargar años disponibles
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

  // Cargar inscripciones previas del usuario
  const loadUserEnrollments = useCallback(async () => {
    if (!user?.id) return;
    try {
      const res = await getUserEnrollments(user.id);
      const enrollments = res?.enrollments || res?.data || [];
      setUserEnrollments(enrollments);
    } catch {
      // Silencioso
    }
  }, [user?.id]);

  useEffect(() => {
    loadUserEnrollments();
  }, [loadUserEnrollments]);

  // Cargar lista de congresos
  const loadCongressesData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getCongresses({
        page: 1,
        pageSize: 50,
        year: selectedYear === 'Todos' ? null : selectedYear,
        searchTerm: searchQuery,
        orderBy: 'fecha_inicio',
        orderDesc: true,
      });

      const list = Array.isArray(res)
        ? res
        : res?.congresses || res?.data?.congresses || res?.data || [];
      setCongresses(list);
    } catch (err) {
      setError(err.message || 'Error al cargar congresos');
    } finally {
      setLoading(false);
    }
  }, [selectedYear, searchQuery]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadCongressesData();
    }, 300);
    return () => clearTimeout(timer);
  }, [loadCongressesData]);

  // Verificar si el usuario ya está inscrito en un congreso
  const isEnrolled = useCallback(
    (congressId) => {
      return userEnrollments.some(
        (e) => String(e.id_congress) === String(congressId)
      );
    },
    [userEnrollments]
  );

  // Manejar inscripción directa
  const handleEnroll = async (c) => {
    if (!user?.id) {
      navigate('/login');
      return;
    }

    const cid = c.id_congreso || c.id;
    if (isEnrolled(cid)) {
      return;
    }

    try {
      setEnrollingId(cid);
      setSelectedCongressName(c.nombre);
      setEnrollmentError(null);

      const res = await enrollInCongress(user.id, cid);
      setEnrollmentData(res);
      setIsModalOpen(true);
      await loadUserEnrollments();
    } catch (err) {
      setEnrollmentError(err.message);
      setIsModalOpen(true);
    } finally {
      setEnrollingId(null);
    }
  };

  // Formateador de fechas
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
    <div className="w-full space-y-5">
      {/* Encabezado Principal */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Congresos Disponibles
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
            Eventos académicos, simposios internacionales y conferencias tecnológicas — FISEI UTA.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/dashboard/cursos/inscrito')}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-[#00345e] dark:text-blue-400 bg-zinc-100 dark:bg-white/[0.04] hover:bg-zinc-200 dark:hover:bg-white/[0.08] transition cursor-pointer self-start sm:self-auto"
        >
          <span>Mis Inscripciones</span>
          <span>→</span>
        </button>
      </div>

      {/* Tarjetas de Métricas Resumen (Dokploy / Notion Style) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className={`p-4 rounded-xl border transition-colors ${
          isDark ? 'bg-[#16161a] border-white/[0.08]' : 'bg-white border-black/[0.08]'
        }`}>
          <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-400 block mb-1">
            Catálogo Ofertado
          </span>
          <span className="text-2xl font-bold text-zinc-900 dark:text-white">
            {congresses.length}
          </span>
          <p className="text-[11px] text-zinc-400 mt-0.5">congresos y simposios</p>
        </div>

        <div className={`p-4 rounded-xl border transition-colors ${
          isDark ? 'bg-[#16161a] border-white/[0.08]' : 'bg-white border-black/[0.08]'
        }`}>
          <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-400 block mb-1">
            Convocatorias
          </span>
          <span className="text-2xl font-bold text-zinc-900 dark:text-white">
            {availableYears.length > 0 ? availableYears.join(', ') : '2026, 2027'}
          </span>
          <p className="text-[11px] text-zinc-400 mt-0.5">períodos académicos</p>
        </div>

        <div className={`p-4 rounded-xl border transition-colors ${
          isDark ? 'bg-[#16161a] border-white/[0.08]' : 'bg-white border-black/[0.08]'
        }`}>
          <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-400 block mb-1">
            Modalidades
          </span>
          <span className="text-2xl font-bold text-zinc-900 dark:text-white">
            100%
          </span>
          <p className="text-[11px] text-zinc-400 mt-0.5">presencial e híbrido</p>
        </div>

        <div className={`p-4 rounded-xl border transition-colors ${
          isDark ? 'bg-[#16161a] border-white/[0.08]' : 'bg-white border-black/[0.08]'
        }`}>
          <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-400 block mb-1">
            Acreditación
          </span>
          <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            Oficial
          </span>
          <p className="text-[11px] text-zinc-400 mt-0.5">certificación digital FISEI</p>
        </div>
      </div>

      {/* Barra de Filtros, Búsqueda y Switcher de Vista */}
      <div className={`p-3 rounded-xl border transition-colors flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 ${
        isDark ? 'bg-[#16161a] border-white/[0.08]' : 'bg-white border-black/[0.08]'
      }`}>
        {/* Pills de Año */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 sm:pb-0">
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

        {/* Buscador + Selector de Vista */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-64">
            <MagnifyingGlassIcon className="w-4 h-4 text-zinc-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar congreso..."
              className={`w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border outline-none transition-colors ${
                isDark
                  ? 'bg-[#121215] border-white/10 text-white placeholder-zinc-500 focus:border-blue-400'
                  : 'bg-zinc-50 border-black/[0.08] text-zinc-900 placeholder-zinc-400 focus:border-[#00345e]'
              }`}
            />
          </div>

          {/* Toggle Tarjetas / Tabla */}
          <div className={`flex items-center p-0.5 rounded-lg border ${
            isDark ? 'bg-[#121215] border-white/10' : 'bg-zinc-100 border-zinc-200'
          }`}>
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-md transition cursor-pointer ${
                viewMode === 'cards'
                  ? isDark
                    ? 'bg-[#00345e] text-white shadow-2xs'
                    : 'bg-white text-zinc-900 shadow-2xs'
                  : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200'
              }`}
              title="Vista en tarjetas"
            >
              <Squares2X2Icon className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md transition cursor-pointer ${
                viewMode === 'table'
                  ? isDark
                    ? 'bg-[#00345e] text-white shadow-2xs'
                    : 'bg-white text-zinc-900 shadow-2xs'
                  : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200'
              }`}
              title="Vista en tabla"
            >
              <QueueListIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Estado de Carga */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-xl border animate-pulse space-y-3 ${
                isDark ? 'bg-[#16161a] border-white/[0.06]' : 'bg-white border-black/[0.06]'
              }`}
            >
              <div className="aspect-video w-full rounded-lg bg-zinc-200/60 dark:bg-white/[0.05]" />
              <div className="h-4 w-3/4 rounded bg-zinc-200/60 dark:bg-white/[0.05]" />
              <div className="h-3 w-1/2 rounded bg-zinc-200/60 dark:bg-white/[0.05]" />
            </div>
          ))}
        </div>
      )}

      {/* Estado Sin Resultados */}
      {!loading && congresses.length === 0 && (
        <div className={`p-12 text-center rounded-xl border transition-colors ${
          isDark ? 'bg-[#16161a] border-white/[0.08]' : 'bg-white border-black/[0.08]'
        }`}>
          <AcademicCapIcon className="w-10 h-10 text-zinc-400 mx-auto mb-2 opacity-60" />
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
            No se encontraron congresos
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Intenta ajustando el término de búsqueda o seleccionando otro año.
          </p>
        </div>
      )}

      {/* Vista de Tarjetas (Cards Grid) */}
      {!loading && viewMode === 'cards' && congresses.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {congresses.map((c) => {
            const cid = c.id_congreso || c.id;
            const alreadyEnrolled = isEnrolled(cid);
            const isThisEnrolling = enrollingId === cid;
            const cupoMaximo = Number(c.cupo_maximo || 250);
            const inscritos = Number(c.inscritos ?? c.total_inscritos ?? c.total_enrolled ?? 0);
            const capacityPercentage = cupoMaximo > 0 ? Math.min(Math.round((inscritos / cupoMaximo) * 100), 100) : 0;
            const isQuotaExceeded = cupoMaximo > 0 && inscritos >= cupoMaximo;

            return (
              <div
                key={cid}
                className={`rounded-xl border transition-all flex flex-col justify-between overflow-hidden shadow-2xs hover:shadow-xs group ${
                  isDark
                    ? 'bg-[#16161a] border-white/[0.08] hover:border-white/20'
                    : 'bg-white border-black/[0.08] hover:border-black/20'
                }`}
              >
                <div>
                  {/* Portada */}
                  <div className="aspect-video w-full relative overflow-hidden bg-zinc-100 dark:bg-zinc-900 border-b border-black/[0.04] dark:border-white/[0.06]">
                    {c.poster_cover_url && !c.poster_cover_url.includes('example.com') ? (
                      <img
                        src={c.poster_cover_url}
                        alt={c.nombre}
                        className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-400 dark:text-zinc-600 bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-900 dark:to-zinc-800">
                        <AcademicCapIcon className="w-12 h-12 stroke-[1.2]" />
                      </div>
                    )}

                    {/* Badge de Edición */}
                    <div className="absolute top-2.5 left-2.5">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#00345e] text-white shadow-xs">
                        {c.edicion || `Edición ${c.anio}`}
                      </span>
                    </div>

                    {/* Año */}
                    <div className="absolute top-2.5 right-2.5">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-white/90 dark:bg-black/80 backdrop-blur-xs text-zinc-800 dark:text-zinc-200 border border-black/10 dark:border-white/10 shadow-xs">
                        {c.anio}
                      </span>
                    </div>
                  </div>

                  {/* Contenido */}
                  <div className="p-4 space-y-2">
                    <h3 className="text-sm font-semibold text-zinc-900 dark:text-white line-clamp-2 leading-snug">
                      {c.nombre}
                    </h3>

                    <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                      <CalendarDaysIcon className="w-3.5 h-3.5 text-[#00345e] dark:text-blue-400 shrink-0" />
                      <span className="truncate">{formatDateRange(c.fecha_inicio, c.fecha_fin)}</span>
                    </div>

                    <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                      {c.descripcion_general || 'Sin descripción disponible.'}
                    </p>

                    {/* Barra de Aforo y Capacidad */}
                    <div className="space-y-1 pt-1 border-t border-black/[0.04] dark:border-white/[0.04]">
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-zinc-500 dark:text-zinc-400">Aforo:</span>
                        <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                          {inscritos} / {cupoMaximo} ({capacityPercentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-zinc-200 dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            isQuotaExceeded
                              ? 'bg-rose-500'
                              : capacityPercentage > 80
                              ? 'bg-amber-500'
                              : 'bg-[#00345e] dark:bg-blue-500'
                          }`}
                          style={{ width: `${capacityPercentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Acciones */}
                <div className={`p-4 pt-3 border-t flex items-center gap-2 ${
                  isDark ? 'border-white/[0.06] bg-white/[0.01]' : 'border-black/[0.04] bg-zinc-50/50'
                }`}>
                  <button
                    type="button"
                    onClick={() => navigate(`/dashboard/congreso/${cid}`)}
                    className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition cursor-pointer border ${
                      isDark
                        ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border-white/10'
                        : 'bg-white hover:bg-zinc-100 text-zinc-700 border-zinc-200 shadow-2xs'
                    }`}
                  >
                    Ver Detalles
                  </button>

                  {alreadyEnrolled ? (
                    <span className="inline-flex items-center gap-1 py-1.5 px-3 rounded-lg text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-500/20">
                      <CheckCircleIcon className="w-3.5 h-3.5" />
                      Inscrito
                    </span>
                  ) : isQuotaExceeded ? (
                    <span
                      title="Convocatoria Completa / Cupos Agotados"
                      className="inline-flex items-center gap-1 py-1.5 px-2.5 rounded-lg text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 border border-rose-500/20 cursor-not-allowed"
                    >
                      <ExclamationCircleIcon className="w-3.5 h-3.5 shrink-0" />
                      <span>Agotado</span>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleEnroll(c)}
                      disabled={isThisEnrolling}
                      className="py-1.5 px-3.5 bg-[#00345e] hover:bg-[#002747] active:bg-[#001f38] text-white rounded-lg text-xs font-semibold transition cursor-pointer shadow-2xs disabled:opacity-50 border-0 flex items-center gap-1.5"
                    >
                      {isThisEnrolling ? (
                        <>
                          <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Inscribiendo...</span>
                        </>
                      ) : (
                        <span>Inscribirme</span>
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Vista de Tabla (Table List) */}
      {!loading && viewMode === 'table' && congresses.length > 0 && (
        <div className={`rounded-xl border overflow-hidden shadow-2xs ${
          isDark ? 'bg-[#16161a] border-white/[0.08]' : 'bg-white border-black/[0.08]'
        }`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className={`border-b text-[11px] font-semibold uppercase tracking-wider ${
                  isDark ? 'bg-[#121215] border-white/[0.08] text-zinc-400' : 'bg-zinc-50 border-black/[0.06] text-zinc-600'
                }`}>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Congreso</th>
                  <th className="px-4 py-3">Edición</th>
                  <th className="px-4 py-3">Año</th>
                  <th className="px-4 py-3">Fechas</th>
                  <th className="px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${
                isDark ? 'divide-white/[0.04]' : 'divide-black/[0.04]'
              }`}>
                {congresses.map((c) => {
                  const cid = c.id_congreso || c.id;
                  const alreadyEnrolled = isEnrolled(cid);
                  const isThisEnrolling = enrollingId === cid;
                  const cupoMaximo = Number(c.cupo_maximo || 250);
                  const inscritos = Number(c.inscritos ?? c.total_inscritos ?? c.total_enrolled ?? 0);
                  const capacityPercentage = cupoMaximo > 0 ? Math.min(Math.round((inscritos / cupoMaximo) * 100), 100) : 0;
                  const isQuotaExceeded = cupoMaximo > 0 && inscritos >= cupoMaximo;

                  return (
                    <tr
                      key={cid}
                      className={`transition-colors ${
                        isDark ? 'hover:bg-white/[0.02]' : 'hover:bg-zinc-50/80'
                      }`}
                    >
                      <td className="px-4 py-3 font-mono text-zinc-400">{cid}</td>
                      <td className="px-4 py-3 max-w-sm">
                        <span className="font-semibold text-zinc-900 dark:text-white block truncate" title={c.nombre}>
                          {c.nombre}
                        </span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[11px] text-zinc-400">
                            Aforo: {inscritos}/{cupoMaximo} ({capacityPercentage}%)
                          </span>
                          <div className="w-16 bg-zinc-200 dark:bg-zinc-800 rounded-full h-1 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                isQuotaExceeded
                                  ? 'bg-rose-500'
                                  : capacityPercentage > 80
                                  ? 'bg-amber-500'
                                  : 'bg-[#00345e] dark:bg-blue-500'
                              }`}
                              style={{ width: `${capacityPercentage}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-[#00345e]/10 dark:bg-blue-400/20 text-[#00345e] dark:text-blue-300">
                          {c.edicion || 'General'}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium text-zinc-600 dark:text-zinc-300">
                        {c.anio}
                      </td>
                      <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400 whitespace-nowrap">
                        {formatDateRange(c.fecha_inicio, c.fecha_fin)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => navigate(`/dashboard/congreso/${cid}`)}
                            className={`p-1.5 rounded-lg border transition cursor-pointer ${
                              isDark
                                ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border-white/10'
                                : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border-zinc-200 shadow-2xs'
                            }`}
                            title="Ver detalles"
                          >
                            <EyeIcon className="w-3.5 h-3.5" />
                          </button>

                          {alreadyEnrolled ? (
                            <span className="inline-flex items-center px-2 py-1 rounded-md text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-500/20">
                              Inscrito
                            </span>
                          ) : isQuotaExceeded ? (
                            <span
                              title="Convocatoria Completa / Cupos Agotados"
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 border border-rose-500/20 cursor-not-allowed"
                            >
                              <ExclamationCircleIcon className="w-3.5 h-3.5" />
                              Agotado
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleEnroll(c)}
                              disabled={isThisEnrolling}
                              className="px-2.5 py-1 bg-[#00345e] hover:bg-[#002747] text-white rounded-md text-xs font-semibold transition cursor-pointer shadow-2xs disabled:opacity-50 border-0"
                            >
                              {isThisEnrolling ? '...' : 'Inscribirme'}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal de Inscripción */}
      <EnrollmentModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEnrollmentData(null);
          setEnrollmentError(null);
        }}
        enrollmentData={enrollmentData}
        courseName={selectedCongressName}
        error={enrollmentError}
      />
    </div>
  );
}
