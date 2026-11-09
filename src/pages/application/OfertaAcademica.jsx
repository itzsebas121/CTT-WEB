import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import {
  AcademicCapIcon,
  BookOpenIcon,
  CalendarDaysIcon,
  ClockIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  Squares2X2Icon,
  TableCellsIcon,
  CheckCircleIcon,
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MapPinIcon,
  ArrowTopRightOnSquareIcon,
  TagIcon,
  UserGroupIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { getCourses, searchCourses } from '../../api/courses';
import { getCategoriesEnabled } from '../../api/categories';
import { getCongresses, getCongressYears } from '../../api/congresses';
import {
  getUserEnrollments,
  enrollInCourse,
  enrollInCongress,
  uploadDocumentForEnrollment,
} from '../../api/inscripciones';
import { getUser, isAuthenticated } from '../../utils/auth';
import { resolveImageUrl } from '../../utils/helpers';
import { useDashboardTheme } from '../../context/DashboardThemeContext';
import {
  EnrollmentModal,
  ConfirmDialog,
  RoleSelectionModal,
  PdfUploadModal,
} from '../../components/ui';

export default function OfertaAcademica() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isDark } = useDashboardTheme();
  const user = getUser();

  // Tab activa sincronizada con URL: "cursos" | "congresos"
  const currentTab = searchParams.get('tab') === 'congresos' ? 'congresos' : 'cursos';

  const handleTabChange = (newTab) => {
    setSearchParams({ tab: newTab });
  };

  // Modo de visualización: "cards" | "table" (recordado en localStorage)
  const [viewMode, setViewMode] = useState(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 640) return 'cards';
    return localStorage.getItem('oferta_view_mode') || 'cards';
  });

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    localStorage.setItem('oferta_view_mode', mode);
  };

  // Buscador compartido
  const [searchQuery, setSearchQuery] = useState('');

  // Inscripciones previas del estudiante
  const [userEnrollments, setUserEnrollments] = useState([]);

  const loadUserEnrollments = useCallback(async () => {
    if (!user?.id) return;
    try {
      const res = await getUserEnrollments(user.id);
      const list = res?.enrollments || res?.data || [];
      setUserEnrollments(Array.isArray(list) ? list : []);
    } catch {
      // Silencioso
    }
  }, [user?.id]);

  useEffect(() => {
    loadUserEnrollments();
  }, [loadUserEnrollments]);

  // =========================================================================
  // ESTADO Y LÓGICA: CURSOS
  // =========================================================================
  const [courses, setCourses] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [coursesError, setCoursesError] = useState(null);
  const [coursesTotal, setCoursesTotal] = useState(0);
  const [coursesPage, setCoursesPage] = useState(1);
  const [coursesPageSize] = useState(9);
  const [coursesTotalPages, setCoursesTotalPages] = useState(1);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(0); // 0 = Todos

  // Modales de matrícula de Cursos
  const [enrollingCourse, setEnrollingCourse] = useState(false);
  const [showRoleSelection, setShowRoleSelection] = useState(false);
  const [showPdfUpload, setShowPdfUpload] = useState(false);
  const [showCourseConfirm, setShowCourseConfirm] = useState(false);
  const [showCourseSuccessModal, setShowCourseSuccessModal] = useState(false);
  const [pendingCourse, setPendingCourse] = useState(null);
  const [isExpositor, setIsExpositor] = useState(false);
  const [documentFile, setDocumentFile] = useState(null);
  const [courseEnrollmentResult, setCourseEnrollmentResult] = useState(null);
  const [courseEnrollmentError, setCourseEnrollmentError] = useState(null);

  // Cargar categorías de cursos
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const cats = await getCategoriesEnabled();
        setCategories([{ id: 0, name: 'Todas las Categorías' }, ...cats]);
      } catch {
        setCategories([{ id: 0, name: 'Todas las Categorías' }]);
      }
    };
    fetchCategories();
  }, []);

  // Cargar cursos
  const loadCoursesData = useCallback(async () => {
    try {
      setCoursesLoading(true);
      setCoursesError(null);

      let res;
      if (searchQuery.trim().length > 1) {
        res = await searchCourses(searchQuery.trim());
      } else {
        const catParam = selectedCategory > 0 ? selectedCategory : null;
        res = await getCourses(coursesPage, coursesPageSize, 'activo', catParam);
      }

      const list = res?.courses || res?.data?.courses || res?.data || [];
      setCourses(Array.isArray(list) ? list : []);
      setCoursesTotal(res?.total || list.length || 0);
      setCoursesTotalPages(res?.total_pages || Math.ceil((res?.total || list.length || 1) / coursesPageSize));
    } catch (err) {
      setCoursesError(err.message || 'Error al cargar cursos');
    } finally {
      setCoursesLoading(false);
    }
  }, [coursesPage, coursesPageSize, selectedCategory, searchQuery]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadCoursesData();
    }, 250);
    return () => clearTimeout(timer);
  }, [loadCoursesData]);

  // Manejo de flujo de inscripción a curso
  const handleCourseEnrollClick = (course) => {
    if (!isAuthenticated() || !user?.id) {
      navigate('/login', { state: { from: location } });
      return;
    }
    setPendingCourse(course);
    setShowRoleSelection(true);
  };

  const handleRoleSelected = (role) => {
    setShowRoleSelection(false);
    const expositor = role === 'expositor';
    setIsExpositor(expositor);
    if (expositor) {
      setShowPdfUpload(true);
    } else {
      setShowCourseConfirm(true);
    }
  };

  const handleDocumentUploaded = (file) => {
    setDocumentFile(file);
    setShowPdfUpload(false);
    setShowCourseConfirm(true);
  };

  const executeCourseEnrollment = async () => {
    setShowCourseConfirm(false);
    if (!pendingCourse) return;

    try {
      setEnrollingCourse(true);
      setCourseEnrollmentError(null);

      if (isExpositor && documentFile) {
        await uploadDocumentForEnrollment(documentFile);
      }

      const res = await enrollInCourse(user.id, parseInt(pendingCourse.id));
      setCourseEnrollmentResult(res);
      setShowCourseSuccessModal(true);
      await loadUserEnrollments();
      await loadCoursesData();
    } catch (err) {
      setCourseEnrollmentError(err.message || 'No se pudo completar la matrícula');
      setShowCourseSuccessModal(true);
    } finally {
      setEnrollingCourse(false);
    }
  };

  // =========================================================================
  // ESTADO Y LÓGICA: CONGRESOS
  // =========================================================================
  const [congresses, setCongresses] = useState([]);
  const [congressesLoading, setCongressesLoading] = useState(true);
  const [congressesError, setCongressesError] = useState(null);
  const [congressesTotal, setCongressesTotal] = useState(0);
  const [availableYears, setAvailableYears] = useState(['Todos']);
  const [selectedYear, setSelectedYear] = useState('Todos');

  // Modales de inscripción a Congreso
  const [enrollingCongressId, setEnrollingCongressId] = useState(null);
  const [selectedCongressForModal, setSelectedCongressForModal] = useState(null);
  const [isCongressModalOpen, setIsCongressModalOpen] = useState(false);
  const [congressEnrollmentResult, setCongressEnrollmentResult] = useState(null);
  const [congressEnrollmentError, setCongressEnrollmentError] = useState(null);

  // Cargar años de congresos
  useEffect(() => {
    const fetchYears = async () => {
      try {
        const years = await getCongressYears();
        if (Array.isArray(years) && years.length > 0) {
          setAvailableYears(['Todos', ...years.map(String)]);
        } else {
          setAvailableYears(['Todos', '2027', '2026']);
        }
      } catch {
        setAvailableYears(['Todos', '2027', '2026']);
      }
    };
    fetchYears();
  }, []);

  // Cargar congresos
  const loadCongressesData = useCallback(async () => {
    try {
      setCongressesLoading(true);
      setCongressesError(null);

      const params = {
        page: 1,
        pageSize: 30,
      };
      if (selectedYear !== 'Todos') {
        params.year = selectedYear;
      }
      if (searchQuery.trim().length > 1) {
        params.search = searchQuery.trim();
      }

      const res = await getCongresses(params);
      const list = Array.isArray(res)
        ? res
        : res?.congresses || res?.data?.congresses || res?.data || [];
      setCongresses(list);
      setCongressesTotal(res?.total || list.length || 0);
    } catch (err) {
      setCongressesError(err.message || 'Error al cargar congresos');
    } finally {
      setCongressesLoading(false);
    }
  }, [selectedYear, searchQuery]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadCongressesData();
    }, 250);
    return () => clearTimeout(timer);
  }, [loadCongressesData]);

  // Manejo de inscripción directa a congreso
  const handleCongressEnrollClick = async (congress) => {
    if (!isAuthenticated() || !user?.id) {
      navigate('/login', { state: { from: location } });
      return;
    }

    const cid = congress.id_congreso || congress.id;
    try {
      setEnrollingCongressId(cid);
      setSelectedCongressForModal(congress);
      setCongressEnrollmentError(null);

      const res = await enrollInCongress(user.id, cid);
      setCongressEnrollmentResult(res);
      setIsCongressModalOpen(true);
      await loadUserEnrollments();
      await loadCongressesData();
    } catch (err) {
      setCongressEnrollmentError(err.message || 'No se pudo completar la inscripción');
      setIsCongressModalOpen(true);
    } finally {
      setEnrollingCongressId(null);
    }
  };

  // Helpers de verificación de inscripción previa
  const getCourseEnrollment = (courseId) => {
    return userEnrollments.find((e) => String(e.id_course) === String(courseId));
  };

  const getCongressEnrollment = (congressId) => {
    return userEnrollments.find((e) => String(e.id_congress) === String(congressId));
  };

  // Formato de fechas
  const formatDateRange = (start, end) => {
    if (!start && !end) return 'Por definir';
    try {
      const s = start
        ? new Date(start + 'T00:00:00').toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })
        : '';
      const e = end
        ? new Date(end + 'T00:00:00').toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })
        : '';
      return s && e ? `${s} - ${e}` : s || e;
    } catch {
      return `${start} - ${end}`;
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* ── Encabezado Principal ────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1
            className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${
              isDark ? 'text-zinc-100' : 'text-zinc-900'
            }`}
          >
            Oferta Académica
          </h1>
          <p className={`mt-1 text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
            Explora e inscríbete en cursos de formación continua y congresos internacionales de la FISEI UTA.
          </p>
        </div>

        {/* Alternador de Vista (Tarjetas / Tabla) */}
        <div
          className={`flex items-center gap-1 p-1 rounded-xl border ${
            isDark ? 'bg-zinc-900/70 border-zinc-800' : 'bg-zinc-100 border-zinc-200'
          }`}
        >
          <button
            type="button"
            onClick={() => handleViewModeChange('cards')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === 'cards'
                ? 'bg-[#00345e] text-white shadow-sm'
                : isDark
                ? 'text-zinc-400 hover:text-zinc-200'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
            title="Vista de Cuadrícula de Tarjetas"
          >
            <Squares2X2Icon className="w-4 h-4" />
            <span className="hidden sm:inline">Tarjetas</span>
          </button>
          <button
            type="button"
            onClick={() => handleViewModeChange('table')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === 'table'
                ? 'bg-[#00345e] text-white shadow-sm'
                : isDark
                ? 'text-zinc-400 hover:text-zinc-200'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
            title="Vista de Tabla Detallada"
          >
            <TableCellsIcon className="w-4 h-4" />
            <span className="hidden sm:inline">Tabla</span>
          </button>
        </div>
      </div>

      {/* ── Control Segmentado de Pestañas Principales ─────────────────── */}
      <div
        className={`flex border-b ${
          isDark ? 'border-zinc-800' : 'border-zinc-200'
        } gap-4 sm:gap-8`}
      >
        <button
          type="button"
          onClick={() => handleTabChange('cursos')}
          className={`relative pb-3 text-sm sm:text-base font-bold flex items-center gap-2.5 transition-colors ${
            currentTab === 'cursos'
              ? 'text-[#00345e] dark:text-sky-400'
              : isDark
              ? 'text-zinc-400 hover:text-zinc-200'
              : 'text-zinc-500 hover:text-zinc-800'
          }`}
        >
          <BookOpenIcon className="w-5 h-5" />
          <span>Cursos de Capacitación</span>
          <span
            className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
              currentTab === 'cursos'
                ? 'bg-[#00345e]/10 text-[#00345e] dark:bg-sky-500/20 dark:text-sky-300'
                : isDark
                ? 'bg-zinc-800 text-zinc-400'
                : 'bg-zinc-200 text-zinc-600'
            }`}
          >
            {coursesTotal}
          </span>
          {currentTab === 'cursos' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00345e] dark:bg-sky-400" />
          )}
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('congresos')}
          className={`relative pb-3 text-sm sm:text-base font-bold flex items-center gap-2.5 transition-colors ${
            currentTab === 'congresos'
              ? 'text-[#00345e] dark:text-sky-400'
              : isDark
              ? 'text-zinc-400 hover:text-zinc-200'
              : 'text-zinc-500 hover:text-zinc-800'
          }`}
        >
          <AcademicCapIcon className="w-5 h-5" />
          <span>Congresos Internacionales</span>
          <span
            className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
              currentTab === 'congresos'
                ? 'bg-[#00345e]/10 text-[#00345e] dark:bg-sky-500/20 dark:text-sky-300'
                : isDark
                ? 'bg-zinc-800 text-zinc-400'
                : 'bg-zinc-200 text-zinc-600'
            }`}
          >
            {congressesTotal}
          </span>
          {currentTab === 'congresos' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00345e] dark:bg-sky-400" />
          )}
        </button>
      </div>

      {/* ── Barra de Controles y Filtros Contextuales ─────────────────── */}
      <div
        className={`p-4 rounded-2xl border ${
          isDark ? 'bg-zinc-900/60 border-zinc-800' : 'bg-white border-zinc-200'
        } shadow-sm space-y-4`}
      >
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Buscador reactivo */}
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                currentTab === 'cursos'
                  ? 'Buscar curso por título, temario o tecnología...'
                  : 'Buscar congreso por nombre, eje temático o sede...'
              }
              className={`w-full pl-10 pr-9 py-2.5 rounded-xl border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[#00345e]/30 ${
                isDark
                  ? 'bg-zinc-800/80 border-zinc-700 text-zinc-100 placeholder-zinc-500 focus:border-sky-500'
                  : 'bg-zinc-50 border-zinc-300 text-zinc-900 placeholder-zinc-400 focus:border-[#00345e]'
              }`}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Sub-filtros dinámicos según pestaña */}
          {currentTab === 'cursos' ? (
            <div className="w-full sm:w-64">
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(Number(e.target.value));
                  setCoursesPage(1);
                }}
                className={`w-full px-3 py-2.5 rounded-xl border text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[#00345e]/30 ${
                  isDark
                    ? 'bg-zinc-800/80 border-zinc-700 text-zinc-100 focus:border-sky-500'
                    : 'bg-zinc-50 border-zinc-300 text-zinc-800 focus:border-[#00345e]'
                }`}
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {availableYears.map((y) => (
                <button
                  key={y}
                  type="button"
                  onClick={() => setSelectedYear(y)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    selectedYear === y
                      ? 'bg-[#00345e] text-white shadow-sm'
                      : isDark
                      ? 'bg-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700'
                      : 'bg-zinc-100 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200'
                  }`}
                >
                  {y === 'Todos' ? 'Todos los Años' : `Año ${y}`}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* =================================================================== */}
      {/* CONTENIDO DE PESTAÑA: CURSOS                                        */}
      {/* =================================================================== */}
      {currentTab === 'cursos' && (
        <>
          {coursesLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <ArrowPathIcon className="w-9 h-9 animate-spin text-[#00345e] dark:text-sky-400" />
              <p className={`mt-3 text-sm font-medium ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                Cargando catálogo de cursos...
              </p>
            </div>
          ) : coursesError ? (
            <div className="p-6 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/40 text-center">
              <p className="text-sm font-medium text-rose-700 dark:text-rose-400">{coursesError}</p>
              <button
                type="button"
                onClick={loadCoursesData}
                className="mt-3 px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition-colors"
              >
                Reintentar
              </button>
            </div>
          ) : courses.length === 0 ? (
            <div
              className={`p-12 text-center rounded-2xl border ${
                isDark ? 'bg-zinc-900/40 border-zinc-800' : 'bg-white border-zinc-200'
              }`}
            >
              <BookOpenIcon className="w-12 h-12 mx-auto text-zinc-400 stroke-1" />
              <h3 className={`mt-3 text-base font-bold ${isDark ? 'text-zinc-200' : 'text-zinc-800'}`}>
                No se encontraron cursos
              </h3>
              <p className={`mt-1 text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                Prueba ajustando el término de búsqueda o seleccionando otra categoría.
              </p>
            </div>
          ) : viewMode === 'cards' ? (
            /* Vista Cuadrícula de Tarjetas */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => {
                const cid = course.id;
                const courseTitle = course.title || course.titulo || 'Curso de Capacitación';
                const courseDesc = course.description || course.descripcion || 'Formación especializada dictada por docentes e investigadores de la UTA.';
                const courseCategory = course.category_name || course.categoria_nombre || course.category || 'Capacitación';
                const courseCover = course.course_image_detail || course.course_image || course.imagen_portada;
                const courseHours = course.requirements?.hours?.total || course.duracion_horas || 40;
                const courseModality = course.requirements?.modality || course.modalidad || 'Virtual';
                const courseQuota = course.requirements?.quota?.max || course.cupo_maximo;
                const courseEnrolled = course.enrolled_count || 0;
                const enrollment = getCourseEnrollment(cid);
                const isFull = courseQuota && courseEnrolled >= courseQuota;
                const isCoursePast = course.requirements?.registration?.endDate
                  ? new Date(course.requirements.registration.endDate + "T23:59:59") < new Date()
                  : false;

                return (
                  <div
                    key={cid}
                    className={`group flex flex-col rounded-2xl border overflow-hidden transition-all duration-200 hover:shadow-lg ${
                      isDark
                        ? 'bg-zinc-900/80 border-zinc-800 hover:border-zinc-700'
                        : 'bg-white border-zinc-200 hover:border-zinc-300'
                    }`}
                  >
                    {/* Imagen de Portada Clickable */}
                    <div
                      onClick={() => navigate(`/dashboard/curso/${cid}`)}
                      className="relative h-44 overflow-hidden bg-zinc-800 cursor-pointer"
                      title={`Ver detalles de ${courseTitle}`}
                    >
                      <img
                        src={resolveImageUrl(courseCover)}
                        alt={courseTitle}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        onError={(e) => {
                          e.target.src =
                            'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80';
                        }}
                      />
                      <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                        <span className="px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider bg-[#00345e] text-white shadow">
                          {courseCategory}
                        </span>
                        {courseModality && (
                          <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-black/60 text-white backdrop-blur-sm">
                            {courseModality}
                          </span>
                        )}
                      </div>

                      {/* Badge de Cupo / Matriculado */}
                      <div className="absolute top-3 right-3">
                        {enrollment ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-600 text-white shadow">
                            <CheckCircleIcon className="w-3.5 h-3.5" />
                            Matriculado
                          </span>
                        ) : isFull ? (
                          <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-600 text-white shadow">
                            Cupo Agotado
                          </span>
                        ) : null}
                      </div>
                    </div>

                    {/* Contenido de la Tarjeta */}
                    <div className="flex-1 p-5 flex flex-col justify-between space-y-4">
                      <div>
                        <button
                          type="button"
                          onClick={() => navigate(`/dashboard/curso/${cid}`)}
                          className={`text-left text-base font-bold line-clamp-2 transition-colors cursor-pointer border-0 bg-transparent p-0 block w-full ${
                            isDark ? 'text-zinc-100 hover:text-sky-400' : 'text-zinc-900 hover:text-[#00345e]'
                          }`}
                          title={`Ver detalles de ${courseTitle}`}
                        >
                          {courseTitle}
                        </button>
                        <p
                          className={`mt-2 text-xs line-clamp-2 leading-relaxed ${
                            isDark ? 'text-zinc-400' : 'text-zinc-600'
                          }`}
                        >
                          {courseDesc}
                        </p>
                      </div>

                      <div className="space-y-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                        {/* Metadatos (Horas, Fechas, Capacidad) */}
                        <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
                          <span className="flex items-center gap-1 font-medium">
                            <ClockIcon className="w-3.5 h-3.5 text-zinc-400" />
                            {courseHours} horas académicas
                          </span>
                          {courseQuota && (
                            <span className="flex items-center gap-1 font-medium">
                              <UserGroupIcon className="w-3.5 h-3.5 text-zinc-400" />
                              Cupos: {courseEnrolled}/{courseQuota}
                            </span>
                          )}
                        </div>

                        {/* Botones de Acción Contextual */}
                        <div className="flex items-center gap-2 pt-1">
                          {enrollment ? (
                            <button
                              type="button"
                              onClick={() => navigate('/dashboard/cursos/inscrito')}
                              className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 text-xs font-bold hover:bg-emerald-100 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <CheckCircleIcon className="w-4 h-4" />
                              Ver Estado / Matrícula
                            </button>
                          ) : isCoursePast ? (
                            <button
                              type="button"
                              onClick={() => navigate(`/dashboard/curso/${cid}`)}
                              className="flex-1 py-2.5 px-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 text-xs font-semibold hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
                            >
                              Concluido · Ver Temario
                            </button>
                          ) : isFull ? (
                            <button
                              type="button"
                              disabled
                              className="flex-1 py-2.5 px-3 rounded-xl bg-zinc-200 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 text-xs font-bold cursor-not-allowed"
                            >
                              Sin Cupos Disponibles
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleCourseEnrollClick(course)}
                              className="flex-1 py-2.5 px-3 rounded-xl bg-[#00345e] hover:bg-[#002847] text-white text-xs font-bold shadow-sm transition-colors active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <BookOpenIcon className="w-4 h-4" />
                              Matricularse
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => navigate(`/dashboard/curso/${cid}`)}
                            className={`p-2.5 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
                              isDark
                                ? 'bg-zinc-800/80 border-zinc-700 text-zinc-300 hover:bg-zinc-700 hover:text-white'
                                : 'bg-zinc-50 border-zinc-200 text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900'
                            }`}
                            title="Ver detalles completos del temario"
                          >
                            <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Vista de Tabla Detallada (Responsiva: tarjetas apiladas en móviles) */
            <div
              className={`rounded-2xl border overflow-hidden shadow-sm ${
                isDark ? 'bg-zinc-900/80 border-zinc-800' : 'bg-white border-zinc-200'
              }`}
            >
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead
                    className={`text-xs font-bold uppercase tracking-wider border-b ${
                      isDark
                        ? 'bg-zinc-900 text-zinc-400 border-zinc-800'
                        : 'bg-zinc-50 text-zinc-600 border-zinc-200'
                    }`}
                  >
                    <tr>
                      <th className="py-3.5 px-4 w-2/5">Curso y Temática</th>
                      <th className="py-3.5 px-4">Categoría</th>
                      <th className="py-3.5 px-4">Duración</th>
                      <th className="py-3.5 px-4">Modalidad</th>
                      <th className="py-3.5 px-4">Cupo</th>
                      <th className="py-3.5 px-4 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody
                    className={`divide-y ${
                      isDark ? 'divide-zinc-800/60' : 'divide-zinc-100'
                    }`}
                  >
                    {courses.map((course) => {
                      const cid = course.id;
                      const courseTitle = course.title || course.titulo || 'Curso de Capacitación';
                      const courseDesc = course.description || course.descripcion || 'Formación profesional continua CTT-FISEI.';
                      const courseCategory = course.category_name || course.categoria_nombre || course.category || 'General';
                      const courseHours = course.requirements?.hours?.total || course.duracion_horas || 40;
                      const courseModality = course.requirements?.modality || course.modalidad || 'Virtual';
                      const courseQuota = course.requirements?.quota?.max || course.cupo_maximo;
                      const courseEnrolled = course.enrolled_count || 0;
                      const enrollment = getCourseEnrollment(cid);
                      const isFull = courseQuota && courseEnrolled >= courseQuota;
                      const isCoursePast = course.requirements?.registration?.endDate
                        ? new Date(course.requirements.registration.endDate + "T23:59:59") < new Date()
                        : false;

                      return (
                        <tr
                          key={cid}
                          className={`transition-colors ${
                            isDark ? 'hover:bg-zinc-800/40' : 'hover:bg-zinc-50'
                          }`}
                        >
                          <td className="py-3.5 px-4">
                            <div className="flex flex-col">
                              <button
                                type="button"
                                onClick={() => navigate(`/dashboard/curso/${cid}`)}
                                className={`text-left font-bold transition-colors cursor-pointer border-0 bg-transparent p-0 line-clamp-1 ${
                                  isDark
                                    ? 'text-zinc-100 hover:text-sky-400 hover:underline'
                                    : 'text-zinc-900 hover:text-[#00345e] hover:underline'
                                }`}
                                title={`Ver detalles de ${courseTitle}`}
                              >
                                {courseTitle}
                              </button>
                              <span className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-1 mt-0.5">
                                {courseDesc}
                              </span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-[#00345e]/10 text-[#00345e] dark:bg-sky-500/20 dark:text-sky-300">
                              {courseCategory}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-xs font-medium text-zinc-600 dark:text-zinc-400">
                            {courseHours}h
                          </td>
                          <td className="py-3.5 px-4 text-xs font-medium text-zinc-600 dark:text-zinc-400">
                            {courseModality}
                          </td>
                          <td className="py-3.5 px-4 text-xs font-medium text-zinc-600 dark:text-zinc-400">
                            {courseQuota ? `${courseEnrolled}/${courseQuota}` : 'Ilimitado'}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {enrollment ? (
                                <button
                                  type="button"
                                  onClick={() => navigate('/dashboard/cursos/inscrito')}
                                  className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 text-xs font-bold hover:bg-emerald-100 transition-colors cursor-pointer"
                                >
                                  Matriculado
                                </button>
                              ) : isCoursePast ? (
                                <span className="px-2.5 py-1 rounded-lg text-xs font-semibold text-zinc-500 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                                  Concluido
                                </span>
                              ) : isFull ? (
                                <span className="px-2.5 py-1 rounded-lg text-xs font-semibold text-rose-600 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800">
                                  Lleno
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleCourseEnrollClick(course)}
                                  className="px-3.5 py-1.5 rounded-xl bg-[#00345e] hover:bg-[#002847] text-white text-xs font-bold transition-colors active:scale-95 cursor-pointer"
                                >
                                  Matricularse
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => navigate(`/dashboard/curso/${cid}`)}
                                className={`p-1.5 rounded-lg border text-xs cursor-pointer ${
                                  isDark
                                    ? 'border-zinc-700 text-zinc-300 hover:bg-zinc-800'
                                    : 'border-zinc-200 text-zinc-600 hover:bg-zinc-100'
                                }`}
                                title="Ver temario"
                              >
                                <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                              </button>
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

          {/* Paginación de Cursos */}
          {coursesTotalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <span className={`text-xs ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                Página {coursesPage} de {coursesTotalPages} ({coursesTotal} cursos en total)
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={coursesPage <= 1}
                  onClick={() => setCoursesPage((p) => Math.max(p - 1, 1))}
                  className={`p-2 rounded-xl border text-xs font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                    isDark
                      ? 'border-zinc-700 bg-zinc-800/60 text-zinc-300 hover:bg-zinc-700'
                      : 'border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50'
                  }`}
                >
                  <ChevronLeftIcon className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  disabled={coursesPage >= coursesTotalPages}
                  onClick={() => setCoursesPage((p) => Math.min(p + 1, coursesTotalPages))}
                  className={`p-2 rounded-xl border text-xs font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                    isDark
                      ? 'border-zinc-700 bg-zinc-800/60 text-zinc-300 hover:bg-zinc-700'
                      : 'border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50'
                  }`}
                >
                  <ChevronRightIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* =================================================================== */}
      {/* CONTENIDO DE PESTAÑA: CONGRESOS                                     */}
      {/* =================================================================== */}
      {currentTab === 'congresos' && (
        <>
          {congressesLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <ArrowPathIcon className="w-9 h-9 animate-spin text-[#00345e] dark:text-sky-400" />
              <p className={`mt-3 text-sm font-medium ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                Cargando congresos internacionales...
              </p>
            </div>
          ) : congressesError ? (
            <div className="p-6 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/40 text-center">
              <p className="text-sm font-medium text-rose-700 dark:text-rose-400">{congressesError}</p>
              <button
                type="button"
                onClick={loadCongressesData}
                className="mt-3 px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition-colors"
              >
                Reintentar
              </button>
            </div>
          ) : congresses.length === 0 ? (
            <div
              className={`p-12 text-center rounded-2xl border ${
                isDark ? 'bg-zinc-900/40 border-zinc-800' : 'bg-white border-zinc-200'
              }`}
            >
              <AcademicCapIcon className="w-12 h-12 mx-auto text-zinc-400 stroke-1" />
              <h3 className={`mt-3 text-base font-bold ${isDark ? 'text-zinc-200' : 'text-zinc-800'}`}>
                No se encontraron congresos para los criterios seleccionados
              </h3>
              <p className={`mt-1 text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                Selecciona otro año o limpia el buscador para ver más convocatorias científicas.
              </p>
            </div>
          ) : viewMode === 'cards' ? (
            /* Vista Cuadrícula de Tarjetas de Congresos */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {congresses.map((c) => {
                const cid = c.id_congreso || c.id;
                const congressTitle = c.nombre || c.title || 'Congreso Internacional';
                const congressDesc = c.descripcion_general || c.descripcion || c.description || 'Encuentro científico con ponencias indexadas, conferencistas magistrales y talleres especializados.';
                const congressCover = c.poster_cover_url || c.imagen_portada || c.foto_portada;
                const congressYear = c.anio || c.year || '2026';
                const enrollment = getCongressEnrollment(cid);
                const isFull = c.cupo_maximo && (c.enrolled_count || 0) >= c.cupo_maximo;
                const isCongressPast = c.fecha_fin ? new Date(c.fecha_fin + "T23:59:59") < new Date() : false;
                const isEnrollingThis = enrollingCongressId === cid;

                return (
                  <div
                    key={cid}
                    className={`group flex flex-col rounded-2xl border overflow-hidden transition-all duration-200 hover:shadow-lg ${
                      isDark
                        ? 'bg-zinc-900/80 border-zinc-800 hover:border-zinc-700'
                        : 'bg-white border-zinc-200 hover:border-zinc-300'
                    }`}
                  >
                    {/* Imagen de Portada Clickable */}
                    <div
                      onClick={() => navigate(`/dashboard/congreso/${cid}`)}
                      className="relative h-48 overflow-hidden bg-zinc-800 cursor-pointer"
                      title={`Ver detalles de ${congressTitle}`}
                    >
                      <img
                        src={resolveImageUrl(congressCover)}
                        alt={congressTitle}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        onError={(e) => {
                          e.target.src =
                            'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=600&q=80';
                        }}
                      />
                      <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                        <span className="px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider bg-[#00345e] text-white shadow">
                          Congreso Internacional
                        </span>
                        {congressYear && (
                          <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-500 text-zinc-950 shadow">
                            {congressYear}
                          </span>
                        )}
                      </div>

                      {/* Badge de Inscrito / Cupo */}
                      <div className="absolute top-3 right-3">
                        {enrollment ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-600 text-white shadow">
                            <CheckCircleIcon className="w-3.5 h-3.5" />
                            Inscrito
                          </span>
                        ) : isFull ? (
                          <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-600 text-white shadow">
                            Cupo Agotado
                          </span>
                        ) : null}
                      </div>
                    </div>

                    {/* Contenido de la Tarjeta */}
                    <div className="flex-1 p-5 flex flex-col justify-between space-y-4">
                      <div>
                        <button
                          type="button"
                          onClick={() => navigate(`/dashboard/congreso/${cid}`)}
                          className={`text-left text-base font-bold line-clamp-2 transition-colors cursor-pointer border-0 bg-transparent p-0 block w-full ${
                            isDark ? 'text-zinc-100 hover:text-sky-400' : 'text-zinc-900 hover:text-[#00345e]'
                          }`}
                          title={`Ver detalles de ${congressTitle}`}
                        >
                          {congressTitle}
                        </button>
                        <p
                          className={`mt-2 text-xs line-clamp-2 leading-relaxed ${
                            isDark ? 'text-zinc-400' : 'text-zinc-600'
                          }`}
                        >
                          {congressDesc}
                        </p>
                      </div>

                      <div className="space-y-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                        {/* Fechas y Sede */}
                        <div className="space-y-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                          <div className="flex items-center gap-1.5 font-medium">
                            <CalendarDaysIcon className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                            <span>{formatDateRange(c.fecha_inicio, c.fecha_fin)}</span>
                          </div>
                          <div className="flex items-center gap-1.5 font-medium">
                            <MapPinIcon className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                            <span className="line-clamp-1">{c.lugar || 'Campus Huachi, Ambato - Ecuador'}</span>
                          </div>
                        </div>

                        {/* Tarifa base indicativa */}
                        <div className="flex items-center justify-between text-xs pt-1">
                          <span className="text-zinc-500 dark:text-zinc-400">Inversión académica:</span>
                          <span className="font-extrabold text-[#00345e] dark:text-sky-400">
                            Desde $20 (Estudiantes)
                          </span>
                        </div>

                        {/* Botones de Acción */}
                        <div className="flex items-center gap-2 pt-1">
                          {enrollment ? (
                            <button
                              type="button"
                              onClick={() => navigate('/dashboard/cursos/inscrito')}
                              className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 text-xs font-bold hover:bg-emerald-100 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <CheckCircleIcon className="w-4 h-4" />
                              Ver Estado / Matrícula
                            </button>
                          ) : isCongressPast ? (
                            <button
                              type="button"
                              onClick={() => navigate(`/dashboard/congreso/${cid}`)}
                              className="flex-1 py-2.5 px-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 text-xs font-semibold hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
                            >
                              Concluido · Ver Memorias
                            </button>
                          ) : isFull ? (
                            <button
                              type="button"
                              disabled
                              className="flex-1 py-2.5 px-3 rounded-xl bg-zinc-200 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 text-xs font-bold cursor-not-allowed"
                            >
                              Agotado
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleCongressEnrollClick(c)}
                              disabled={isEnrollingThis}
                              className="flex-1 py-2.5 px-3 rounded-xl bg-[#00345e] hover:bg-[#002847] text-white text-xs font-bold shadow-sm transition-colors active:scale-95 disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              {isEnrollingThis ? (
                                <ArrowPathIcon className="w-4 h-4 animate-spin" />
                              ) : (
                                <AcademicCapIcon className="w-4 h-4" />
                              )}
                              <span>Inscribirse al Congreso</span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => navigate(`/dashboard/congreso/${cid}`)}
                            className={`p-2.5 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
                              isDark
                                ? 'bg-zinc-800/80 border-zinc-700 text-zinc-300 hover:bg-zinc-700 hover:text-white'
                                : 'bg-zinc-50 border-zinc-200 text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900'
                            }`}
                            title="Ver cronograma, speakers y call for papers"
                          >
                            <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Vista de Tabla Detallada de Congresos */
            <div
              className={`rounded-2xl border overflow-hidden shadow-sm ${
                isDark ? 'bg-zinc-900/80 border-zinc-800' : 'bg-white border-zinc-200'
              }`}
            >
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead
                    className={`text-xs font-bold uppercase tracking-wider border-b ${
                      isDark
                        ? 'bg-zinc-900 text-zinc-400 border-zinc-800'
                        : 'bg-zinc-50 text-zinc-600 border-zinc-200'
                    }`}
                  >
                    <tr>
                      <th className="py-3.5 px-4 w-2/5">Congreso</th>
                      <th className="py-3.5 px-4">Año</th>
                      <th className="py-3.5 px-4">Fechas</th>
                      <th className="py-3.5 px-4">Sede</th>
                      <th className="py-3.5 px-4">Tarifas</th>
                      <th className="py-3.5 px-4 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody
                    className={`divide-y ${
                      isDark ? 'divide-zinc-800/60' : 'divide-zinc-100'
                    }`}
                  >
                    {congresses.map((c) => {
                      const cid = c.id_congreso || c.id;
                      const congressTitle = c.nombre || c.title || 'Congreso Internacional';
                      const congressDesc = c.descripcion_general || c.descripcion || c.description || 'FISEI UTA · Sede Campus Huachi';
                      const congressYear = c.anio || c.year || '2026';
                      const enrollment = getCongressEnrollment(cid);
                      const isFull = c.cupo_maximo && (c.enrolled_count || 0) >= c.cupo_maximo;
                      const isCongressPast = c.fecha_fin ? new Date(c.fecha_fin + "T23:59:59") < new Date() : false;

                      return (
                        <tr
                          key={cid}
                          className={`transition-colors ${
                            isDark ? 'hover:bg-zinc-800/40' : 'hover:bg-zinc-50'
                          }`}
                        >
                          <td className="py-3.5 px-4">
                            <div className="flex flex-col">
                              <button
                                type="button"
                                onClick={() => navigate(`/dashboard/congreso/${cid}`)}
                                className={`text-left font-bold transition-colors cursor-pointer border-0 bg-transparent p-0 line-clamp-1 ${
                                  isDark
                                    ? 'text-zinc-100 hover:text-sky-400 hover:underline'
                                    : 'text-zinc-900 hover:text-[#00345e] hover:underline'
                                }`}
                                title={`Ver detalles de ${congressTitle}`}
                              >
                                {congressTitle}
                              </button>
                              <span className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-1 mt-0.5">
                                {congressDesc}
                              </span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-bold bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-300">
                              {congressYear}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-xs font-medium text-zinc-600 dark:text-zinc-400">
                            {formatDateRange(c.fecha_inicio, c.fecha_fin)}
                          </td>
                          <td className="py-3.5 px-4 text-xs font-medium text-zinc-600 dark:text-zinc-400">
                            {c.lugar || 'Campus Huachi'}
                          </td>
                          <td className="py-3.5 px-4 text-xs font-semibold text-[#00345e] dark:text-sky-400">
                            $20 / $50 / $80
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {enrollment ? (
                                <button
                                  type="button"
                                  onClick={() => navigate('/dashboard/cursos/inscrito')}
                                  className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 text-xs font-bold hover:bg-emerald-100 transition-colors cursor-pointer"
                                >
                                  Inscrito
                                </button>
                              ) : isCongressPast ? (
                                <span className="px-2.5 py-1 rounded-lg text-xs font-semibold text-zinc-500 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                                  Concluido
                                </span>
                              ) : isFull ? (
                                <span className="px-2.5 py-1 rounded-lg text-xs font-semibold text-rose-600 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800">
                                  Agotado
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleCongressEnrollClick(c)}
                                  className="px-3.5 py-1.5 rounded-xl bg-[#00345e] hover:bg-[#002847] text-white text-xs font-bold transition-colors active:scale-95 cursor-pointer"
                                >
                                  Inscribirse
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => navigate(`/dashboard/congreso/${cid}`)}
                                className={`p-1.5 rounded-lg border text-xs cursor-pointer ${
                                  isDark
                                    ? 'border-zinc-700 text-zinc-300 hover:bg-zinc-800'
                                    : 'border-zinc-200 text-zinc-600 hover:bg-zinc-100'
                                }`}
                                title="Ver detalles y cronograma del congreso"
                              >
                                <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                              </button>
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
        </>
      )}

      {/* ── Modales de Matrícula de Cursos ─────────────────────────────── */}
      <RoleSelectionModal
        isOpen={showRoleSelection}
        onClose={() => setShowRoleSelection(false)}
        onSelectRole={handleRoleSelected}
      />

      <PdfUploadModal
        isOpen={showPdfUpload}
        onClose={() => setShowPdfUpload(false)}
        onFileSelect={handleDocumentUploaded}
      />

      <ConfirmDialog
        isOpen={showCourseConfirm}
        onClose={() => setShowCourseConfirm(false)}
        onConfirm={executeCourseEnrollment}
        title="Confirmar Matrícula"
        message={`¿Estás seguro de que deseas matricularte en "${pendingCourse?.titulo}"?`}
        confirmText="Confirmar Matrícula"
        cancelText="Cancelar"
        isLoading={enrollingCourse}
      />

      <EnrollmentModal
        isOpen={showCourseSuccessModal}
        onClose={() => setShowCourseSuccessModal(false)}
        enrollmentData={courseEnrollmentResult}
        courseName={pendingCourse?.titulo}
        error={courseEnrollmentError}
      />

      {/* ── Modales de Inscripción a Congresos ─────────────────────────── */}
      <EnrollmentModal
        isOpen={isCongressModalOpen}
        onClose={() => setIsCongressModalOpen(false)}
        enrollmentData={congressEnrollmentResult}
        courseName={selectedCongressForModal?.nombre}
        error={congressEnrollmentError}
      />
    </div>
  );
}

