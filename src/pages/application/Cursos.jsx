import { useEffect, useState, useCallback, useMemo } from "react";
import { getCourses, searchCourses } from "../../api/courses";
import { enrollInCourse, uploadDocumentForEnrollment } from "../../api/inscripciones";
import { getCategoriesEnabled } from "../../api/categories";
import { useNavigate, useLocation } from "react-router-dom";
import { useDashboardTheme } from "../../context/DashboardThemeContext";
import { resolveImageUrl } from "../../utils/helpers";
import {
  Table,
  EnrollmentModal,
  ConfirmDialog,
  RoleSelectionModal,
  PdfUploadModal
} from "../../components/ui";
import {
  TableCellsIcon,
  Squares2X2Icon,
  MagnifyingGlassIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon,
  ArrowPathIcon,
  ClockIcon,
  ArrowRightIcon,
  PhotoIcon
} from "@heroicons/react/24/outline";

const headers = ["titulo", "categoria", "horas", "modalidad", "detalles"];

export default function Cursos() {
  const [rawCourses, setRawCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(7);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [categorySelected, setCategorySelected] = useState(null);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [filters, setFilters] = useState({ categoria: [] });
  const [searchQuery, setSearchQuery] = useState("");
  const { isDark } = useDashboardTheme();
  const [viewMode, setViewMode] = useState(() => {
    const saved = localStorage.getItem('cursos_view_mode');
    if (saved) return saved;
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      return 'cards';
    }
    return 'table';
  });

  const [enrolling, setEnrolling] = useState(false);
  const [showEnrollmentModal, setShowEnrollmentModal] = useState(false);
  const [enrollmentData, setEnrollmentData] = useState(null);
  const [selectedCourseName, setSelectedCourseName] = useState("");
  const [coursesLoaded, setCoursesLoaded] = useState(false);
  const [enrollmentError, setEnrollmentError] = useState(null);
  const [isInitialMount, setIsInitialMount] = useState(true);
  const [showEnrollConfirm, setShowEnrollConfirm] = useState(false);
  const [pendingEnrollment, setPendingEnrollment] = useState(null);
  const [showRolSelection, setShowRolSelection] = useState(false);
  const [showPdfUpload, setShowPdfUpload] = useState(false);
  const [isExpositor, setIsExpositor] = useState(false);
  const [documentFile, setDocumentFile] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    localStorage.setItem('cursos_view_mode', mode);
  };

  const handleEnrollClick = (courseId, courseName) => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');

    if (!token || !user) {
      localStorage.setItem('pendingEnrollment', JSON.stringify({
        courseId,
        courseName,
        returnPath: location.pathname
      }));
      navigate('/login', { state: { from: location } });
      return;
    }

    setPendingEnrollment({ courseId, courseName });
    setShowRolSelection(true);
  };

  const handleRoleSelection = (role) => {
    setShowRolSelection(false);
    setIsExpositor(role === 'expositor');
    if (role === 'expositor') {
      setShowPdfUpload(true);
    } else {
      setShowEnrollConfirm(true);
    }
  };

  const handleDocumentUpload = (file) => {
    setDocumentFile(file);
    setShowPdfUpload(false);
    setShowEnrollConfirm(true);
  };

  const handleEnroll = useCallback(async (courseId, courseName) => {
    setShowEnrollConfirm(false);

    try {
      setEnrolling(true);
      setEnrollmentError(null);
      const user = localStorage.getItem('user');
      const userData = JSON.parse(user);
      if (isExpositor && documentFile) {
        await uploadDocumentForEnrollment(documentFile);
      }
      const response = await enrollInCourse(userData.id, parseInt(courseId));
      setEnrollmentData(response);
      setSelectedCourseName(courseName);
      setShowEnrollmentModal(true);
      await loadCourses(categorySelected || "Todos", page, pageSize, searchQuery);
    } catch (err) {
      if (err.message === 'UNAUTHORIZED') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      } else {
        setEnrollmentError(err.message);
        setSelectedCourseName(courseName);
        setShowEnrollmentModal(true);
      }
    } finally {
      setEnrolling(false);
      setPendingEnrollment(null);
      setIsExpositor(false);
      setDocumentFile(null);
    }
  }, [navigate, categorySelected, page, pageSize, searchQuery, documentFile, isExpositor]);

  const loadCourses = async (
    category = "Todos",
    pageRequested = 1,
    pageSizeRequested = pageSize,
    query = ""
  ) => {
    try {
      setLoading(true);
      setError(null);

      let response;
      const categoryParam = category && category !== "Todos" ? category : null;

      if (query && query.trim().length > 0) {
        response = await searchCourses(query.trim(), pageRequested, pageSizeRequested, "activo", localStorage.getItem('token'));
      } else {
        response = category && category !== "Todos"
          ? await getCourses(pageRequested, pageSizeRequested, "activo", categoryParam, localStorage.getItem('token'))
          : await getCourses(pageRequested, pageSizeRequested, "activo", null, localStorage.getItem('token'));
      }

      const coursesArray = Array.isArray(response)
        ? response
        : response?.courses || [];
      const respTotal = response?.total ?? (Array.isArray(response) ? response.length : 0);
      const respPageSize = response?.page_size ?? pageSizeRequested;
      const respTotalPages = response?.total_pages ?? Math.max(1, Math.ceil(respTotal / respPageSize));

      setRawCourses(coursesArray);
      setTotal(respTotal);
      setPage(pageRequested);
      setPageSize(respPageSize);
      setTotalPages(respTotalPages);
      setCoursesLoaded(true);
    } catch (err) {
      setError(err.message);
      console.error('Error al cargar cursos:', err);
    } finally {
      setLoading(false);
    }
  };

  const courses = useMemo(() => {
    return rawCourses.map((course) => {
      const modalityStr = (course.requirements?.modality || "No definida").toString();

      return {
        id: course.id,
        titulo: (
          <div className="flex items-center gap-3 pr-4">
            <div className="w-9 h-9 rounded-lg overflow-hidden flex-shrink-0 bg-slate-100 dark:bg-zinc-800 border border-black/[0.06] dark:border-white/[0.08]">
              <img
                src={resolveImageUrl(course.course_image_detail || course.course_image)}
                alt=""
                className="w-full h-full object-cover"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" title="Curso Disponible"></span>
                <button
                  type="button"
                  onClick={() => course?.id && navigate(`/dashboard/curso/${course.id}`)}
                  className={`font-semibold transition-colors text-left text-xs sm:text-sm leading-snug cursor-pointer border-0 bg-transparent p-0 truncate ${
                    isDark ? 'text-zinc-100 hover:text-blue-400' : 'text-zinc-900 hover:text-[#00345e]'
                  }`}
                >
                  {course.title}
                </button>
              </div>
              {course.description && (
                <p className={`text-[11px] line-clamp-1 mt-0.5 font-normal ${
                  isDark ? 'text-zinc-300' : 'text-zinc-500'
                }`}>
                  {course.description}
                </p>
              )}
            </div>
          </div>
        ),
        categoria: (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold whitespace-nowrap border ${
            isDark
              ? 'bg-[#00345e]/40 text-blue-300 border-blue-500/40'
              : 'bg-[#00345e]/08 text-[#00345e] border-[#00345e]/20'
          }`}>
            {course.category_name || "General"}
          </span>
        ),
        horas: (
          <div className={`inline-flex items-center gap-1.5 text-xs font-medium whitespace-nowrap ${
            isDark ? 'text-zinc-300' : 'text-zinc-600'
          }`}>
            <ClockIcon className={`w-3.5 h-3.5 flex-shrink-0 ${isDark ? 'text-zinc-400' : 'text-zinc-400'}`} aria-hidden="true" />
            <span>{course.requirements?.hours?.total?.toString() || "0"} horas</span>
          </div>
        ),
        modalidad: (
          <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium whitespace-nowrap border ${
            isDark
              ? 'bg-zinc-800 text-zinc-200 border-white/10'
              : 'bg-zinc-100 text-zinc-700 border-zinc-200'
          }`}>
            {modalityStr}
          </span>
        ),
        detalles: (
          <div className="flex items-center justify-end gap-2 whitespace-nowrap">
            <button
              type="button"
              onClick={() => course?.id && navigate(`/dashboard/curso/${course.id}`)}
              className={`h-8 px-3 text-xs font-medium rounded-lg transition-colors cursor-pointer border ${
                isDark
                  ? 'text-zinc-200 bg-zinc-800 hover:bg-zinc-700 hover:text-white border-white/10'
                  : 'text-zinc-700 bg-zinc-100 hover:bg-zinc-200 hover:text-zinc-900 border-zinc-200 shadow-xs'
              }`}
              title={`Ver detalles de ${course.title}`}
              aria-label={`Ver detalles de ${course.title}`}
            >
              Detalles
            </button>
            <button
              type="button"
              onClick={() => handleEnrollClick(course.id, course.title)}
              disabled={enrolling}
              className={`h-8 px-3.5 text-xs font-semibold text-white rounded-lg transition-all shadow-xs cursor-pointer border-0 disabled:opacity-50 ${
                isDark
                  ? 'bg-[#00345e] hover:bg-[#004f8c] active:bg-[#002747] border border-blue-400/30'
                  : 'bg-[#00345e] hover:bg-[#002747] active:bg-[#001f38]'
              }`}
              title={`Inscribirme en ${course.title}`}
              aria-label={`Inscribirme en ${course.title}`}
            >
              Inscribirme
            </button>
          </div>
        )
      };
    });
  }, [rawCourses, isDark, navigate, enrolling]);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categories = await getCategoriesEnabled();
        setCategoryOptions(categories || []);
        setFilters({
          categoria: categories ? categories.map((cat) => cat.name) : [],
        });
      } catch (err) {
        console.error('Error al cargar categorías:', err);
      }
    };

    loadCategories();
    loadCourses();
    setIsInitialMount(false);
  }, []);

  useEffect(() => {
    const checkPendingEnrollment = async () => {
      if (coursesLoaded && location.state?.enrollCourseId) {
        const pendingEnrollmentData = localStorage.getItem('pendingEnrollment');
        if (pendingEnrollmentData) {
          const { courseId, courseName } = JSON.parse(pendingEnrollmentData);
          localStorage.removeItem('pendingEnrollment');
          setPendingEnrollment({ courseId, courseName });
          setShowRolSelection(true);
        }
        window.history.replaceState({}, document.title);
      }
    };
    checkPendingEnrollment();
  }, [coursesLoaded, location.state]);

  useEffect(() => {
    if (isInitialMount) return;
    const delayDebounceFn = setTimeout(() => {
      loadCourses(categorySelected || "Todos", 1, pageSize, searchQuery);
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, categorySelected, pageSize, isInitialMount]);

  const handleFilterChange = (filterColumn, value) => {
    if (filterColumn === "categoria") {
      const category = categoryOptions.find((cat) => cat.name === value);
      const categoryValue = category ? category.id : null;
      setCategorySelected(categoryValue);
      setPage(1);
      loadCourses(categoryValue || "Todos", 1, pageSize, searchQuery);
    }
  };

  const handleSearchChange = (value) => {
    setSearchQuery(value);
  };

  return (
    <div className="w-full space-y-6">
      {/* Encabezado Principal estilo Dokploy: Cursos Disponibles */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className={`text-2xl sm:text-3xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-zinc-900'}`}>
            Cursos Disponibles
          </h1>
          <p className={`text-xs mt-1 max-w-2xl font-normal leading-relaxed ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
            Talleres de capacitación continua — Facultad de Ingeniería en Sistemas, Electrónica e Industrial (FISEI).
          </p>
        </div>

        {/* Botón de acción estilo Dokploy ("Go to projects ->") */}
        <button
          type="button"
          onClick={() => navigate('/dashboard/cursos/inscrito')}
          className={`h-9 px-4 rounded-lg text-xs font-medium flex items-center gap-2 transition-colors cursor-pointer self-start sm:self-auto border ${
            isDark
              ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white border-white/10'
              : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-800 hover:text-zinc-950 border-zinc-200 shadow-xs'
          }`}
        >
          <span>Mis Inscripciones</span>
          <ArrowRightIcon className={`w-3.5 h-3.5 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`} />
        </button>
      </div>

      {/* Grid de Métricas / KPI Cards estilo Dokploy */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Total Cursos */}
        <div className={`rounded-xl p-4 sm:p-5 flex flex-col justify-between transition-colors border ${
          isDark
            ? 'bg-[#16161a] border-white/[0.08] hover:border-white/[0.14] shadow-sm'
            : 'bg-white border-black/[0.08] hover:border-black/[0.14] shadow-xs'
        }`}>
          <span className={`text-[11px] font-semibold uppercase tracking-wider ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
            Catálogo Ofertado
          </span>
          <div className="my-2">
            <span className={`text-2xl sm:text-3xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-zinc-900'}`}>
              {total || rawCourses.length || 27}
            </span>
          </div>
          <span className={`text-xs ${isDark ? 'text-zinc-300' : 'text-zinc-500'}`}>
            cursos activos para inscripción
          </span>
        </div>

        {/* Card 2: Categorías */}
        <div className={`rounded-xl p-4 sm:p-5 flex flex-col justify-between transition-colors border ${
          isDark
            ? 'bg-[#16161a] border-white/[0.08] hover:border-white/[0.14] shadow-sm'
            : 'bg-white border-black/[0.08] hover:border-black/[0.14] shadow-xs'
        }`}>
          <span className={`text-[11px] font-semibold uppercase tracking-wider ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
            Áreas de Especialidad
          </span>
          <div className="my-2">
            <span className={`text-2xl sm:text-3xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-zinc-900'}`}>
              {categoryOptions.length || 5}
            </span>
          </div>
          <span className={`text-xs ${isDark ? 'text-zinc-300' : 'text-zinc-500'}`}>
            tecnología, industria y gestión
          </span>
        </div>

        {/* Card 3: Modalidad */}
        <div className={`rounded-xl p-4 sm:p-5 flex flex-col justify-between transition-colors border ${
          isDark
            ? 'bg-[#16161a] border-white/[0.08] hover:border-white/[0.14] shadow-sm'
            : 'bg-white border-black/[0.08] hover:border-black/[0.14] shadow-xs'
        }`}>
          <span className={`text-[11px] font-semibold uppercase tracking-wider ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
            Modalidades
          </span>
          <div className="my-2">
            <span className={`text-2xl sm:text-3xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-zinc-900'}`}>
              100%
            </span>
          </div>
          <span className={`text-xs ${isDark ? 'text-zinc-300' : 'text-zinc-500'}`}>
            presencial, híbrido y virtual
          </span>
        </div>

        {/* Card 4: Estado (Puntos de colores estilo Dokploy) */}
        <div className={`rounded-xl p-4 sm:p-5 flex flex-col justify-between transition-colors border ${
          isDark
            ? 'bg-[#16161a] border-white/[0.08] hover:border-white/[0.14] shadow-sm'
            : 'bg-white border-black/[0.08] hover:border-black/[0.14] shadow-xs'
        }`}>
          <span className={`text-[11px] font-semibold uppercase tracking-wider ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
            Estado de Convocatoria
          </span>
          <div className="my-1.5 space-y-1.5">
            <div className="flex items-center gap-2 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className={`font-semibold ${isDark ? 'text-white' : 'text-zinc-900'}`}>1</span>
              <span className={isDark ? 'text-zinc-300' : 'text-zinc-600'}>período abierto</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              <span className={`font-semibold ${isDark ? 'text-white' : 'text-zinc-900'}`}>0</span>
              <span className={isDark ? 'text-zinc-300' : 'text-zinc-600'}>en pausa</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="w-2 h-2 rounded-full bg-zinc-400"></span>
              <span className={`font-semibold ${isDark ? 'text-white' : 'text-zinc-900'}`}>0</span>
              <span className={isDark ? 'text-zinc-300' : 'text-zinc-600'}>cerrados</span>
            </div>
          </div>
          <span className={`text-[10px] ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
            período académico actual
          </span>
        </div>
      </div>

      {/* Barra de Filtros Rápidos de Categorías y Selector de Vista */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
        {/* Pills de Categoría Horizontales */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            type="button"
            onClick={() => {
              setCategorySelected(null);
              setPage(1);
              loadCourses("Todos", 1, pageSize, searchQuery);
            }}
            className={`h-8 px-3.5 rounded-lg text-xs font-medium transition-colors cursor-pointer border whitespace-nowrap ${
              categorySelected === null
                ? isDark
                  ? 'bg-white/[0.12] text-white border-white/20 font-semibold shadow-xs'
                  : 'bg-[#00345e] text-white border-[#00345e] font-semibold shadow-xs'
                : isDark
                  ? 'bg-[#16161a] hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border-white/[0.08]'
                  : 'bg-white hover:bg-zinc-100 text-zinc-600 hover:text-zinc-900 border-zinc-200 shadow-xs'
            }`}
          >
            Todos ({total})
          </button>
          {categoryOptions.map((cat) => {
            const isSelected = categorySelected === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setCategorySelected(cat.id);
                  setPage(1);
                  loadCourses(cat.id, 1, pageSize, searchQuery);
                }}
                className={`h-8 px-3.5 rounded-lg text-xs font-medium transition-colors cursor-pointer border whitespace-nowrap ${
                  isSelected
                    ? isDark
                      ? 'bg-white/[0.12] text-white border-white/20 font-semibold shadow-xs'
                      : 'bg-[#00345e] text-white border-[#00345e] font-semibold shadow-xs'
                    : isDark
                      ? 'bg-[#16161a] hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border-white/[0.08]'
                      : 'bg-white hover:bg-zinc-100 text-zinc-600 hover:text-zinc-900 border-zinc-200 shadow-xs'
                }`}
              >
                {cat.name}
              </button>
            );
          })}
        </div>

        {/* Control Segmentado de Vista (Tabla vs Tarjetas) */}
        <div
          role="radiogroup"
          aria-label="Modo de visualización"
          className={`inline-flex items-center p-1 rounded-lg border self-start sm:self-auto flex-shrink-0 ${
            isDark ? 'bg-[#16161a] border-white/[0.08]' : 'bg-zinc-100 border-zinc-200'
          }`}
        >
          <button
            type="button"
            role="radio"
            aria-checked={viewMode === 'table'}
            onClick={() => handleViewModeChange('table')}
            className={`h-7 px-3 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer border-0 ${
              viewMode === 'table'
                ? isDark
                  ? 'bg-zinc-800 text-white shadow-xs font-semibold'
                  : 'bg-white text-zinc-900 shadow-xs font-semibold'
                : isDark
                  ? 'text-zinc-400 hover:text-white bg-transparent'
                  : 'text-zinc-600 hover:text-zinc-900 bg-transparent'
            }`}
            title="Vista de Tabla"
          >
            <TableCellsIcon className="w-4 h-4" aria-hidden="true" />
            <span className="hidden sm:inline">Tabla</span>
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={viewMode === 'cards'}
            onClick={() => handleViewModeChange('cards')}
            className={`h-7 px-3 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer border-0 ${
              viewMode === 'cards'
                ? isDark
                  ? 'bg-zinc-800 text-white shadow-xs font-semibold'
                  : 'bg-white text-zinc-900 shadow-xs font-semibold'
                : isDark
                  ? 'text-zinc-400 hover:text-white bg-transparent'
                  : 'text-zinc-600 hover:text-zinc-900 bg-transparent'
            }`}
            title="Vista de Tarjetas"
          >
            <Squares2X2Icon className="w-4 h-4" aria-hidden="true" />
            <span>Tarjetas</span>
          </button>
        </div>
      </div>

      {/* Contenido: Tabla o Cards */}
      {viewMode === 'table' ? (
        <Table
          headers={headers}
          data={courses}
          filters={filters}
          page={page}
          pageSize={pageSize}
          total={total}
          totalPages={totalPages}
          loading={loading}
          onPageChange={(newPage) =>
            loadCourses(categorySelected || "Todos", newPage, pageSize, searchQuery)
          }
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            loadCourses(categorySelected || "Todos", 1, newSize, searchQuery);
          }}
          onFilterChange={handleFilterChange}
          onSearchChange={handleSearchChange}
          onReload={() => loadCourses(categorySelected || "Todos", page, pageSize, searchQuery)}
        />
      ) : (
        /* Vista de Tarjetas (Cards) estilo Dokploy con soporte Claro y Oscuro */
        <div className="w-full space-y-4">
          {/* Controles de Búsqueda y Filtros en modo Cards */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative w-full sm:w-72">
                <label htmlFor="dokploy-cards-search" className="sr-only">
                  Buscar curso
                </label>
                <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none ${
                  isDark ? 'text-zinc-500' : 'text-zinc-400'
                }`}>
                  <MagnifyingGlassIcon className="h-4 w-4" aria-hidden="true" />
                </div>
                <input
                  id="dokploy-cards-search"
                  type="search"
                  placeholder="Buscar curso por nombre..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full h-9 pl-9 pr-7 text-xs rounded-lg outline-none border transition-colors ${
                    isDark
                      ? 'bg-[#16161a] border-white/[0.08] text-zinc-100 placeholder:text-zinc-500 focus:border-[#00345e]'
                      : 'bg-white border-zinc-200 text-zinc-900 placeholder:text-zinc-400 focus:border-[#00345e] shadow-xs'
                  }`}
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className={`absolute right-2.5 top-1/2 -translate-y-1/2 border-0 bg-transparent cursor-pointer p-0.5 ${
                      isDark ? 'text-zinc-500 hover:text-zinc-200' : 'text-zinc-400 hover:text-zinc-700'
                    }`}
                    aria-label="Limpiar búsqueda"
                  >
                    <XMarkIcon className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => loadCourses(categorySelected || "Todos", page, pageSize, searchQuery)}
                disabled={loading}
                className={`h-9 w-9 flex items-center justify-center rounded-lg transition-colors cursor-pointer border disabled:opacity-50 ${
                  isDark
                    ? 'bg-[#16161a] border-white/[0.08] text-zinc-400 hover:text-white hover:bg-white/[0.04]'
                    : 'bg-white border-zinc-200 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 shadow-xs'
                }`}
                title="Actualizar listado"
                aria-label="Actualizar listado"
              >
                <ArrowPathIcon className={`h-4 w-4 ${loading ? 'animate-spin text-[#00345e]' : ''}`} />
              </button>
            </div>

            <div className="inline-flex items-center gap-1.5 self-start sm:self-auto">
              <label htmlFor="dokploy-category-select" className={`text-xs font-medium ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                Categoría:
              </label>
              <select
                id="dokploy-category-select"
                value={categorySelected || "Todos"}
                onChange={(e) => {
                  const val = e.target.value === "Todos" ? null : e.target.value;
                  setCategorySelected(val);
                  setPage(1);
                  loadCourses(val || "Todos", 1, pageSize, searchQuery);
                }}
                className={`h-9 px-3 text-xs font-medium rounded-lg outline-none cursor-pointer border ${
                  isDark
                    ? 'bg-[#16161a] border-white/[0.08] text-zinc-200 focus:border-[#00345e]'
                    : 'bg-white border-zinc-200 text-zinc-800 focus:border-[#00345e] shadow-xs'
                }`}
              >
                <option value="Todos">Todas las categorías</option>
                {categoryOptions.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Grid de Floating Cards */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, idx) => (
                <div
                  key={idx}
                  className={`p-5 rounded-xl border animate-pulse space-y-3 ${
                    isDark ? 'bg-[#16161a] border-white/[0.08]' : 'bg-white border-black/[0.08]'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div className={`h-5 w-20 rounded-md ${isDark ? 'bg-white/[0.06]' : 'bg-black/[0.05]'}`} />
                    <div className={`h-5 w-16 rounded-md ${isDark ? 'bg-white/[0.06]' : 'bg-black/[0.05]'}`} />
                  </div>
                  <div className={`h-5 w-3/4 rounded ${isDark ? 'bg-white/[0.06]' : 'bg-black/[0.05]'}`} />
                  <div className={`h-12 w-full rounded ${isDark ? 'bg-white/[0.03]' : 'bg-black/[0.03]'}`} />
                  <div className={`h-9 w-full rounded-lg pt-2 ${isDark ? 'bg-white/[0.06]' : 'bg-black/[0.05]'}`} />
                </div>
              ))}
            </div>
          ) : rawCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {rawCourses.map((course) => {
                const modalityStr = (course.requirements?.modality || "No definida").toString();
                const hours = course.requirements?.hours?.total?.toString() || "0";

                return (
                  <div
                    key={course.id}
                    className={`rounded-xl p-4 sm:p-5 flex flex-col justify-between transition-all group border ${
                      isDark
                        ? 'bg-[#16161a] border-white/[0.08] hover:border-white/[0.18] shadow-sm'
                        : 'bg-white border-black/[0.08] hover:border-[#00345e]/30 shadow-xs'
                    }`}
                  >
                    <div>
                      {/* Imagen del Curso */}
                      <div className="relative w-full h-36 mb-3 rounded-lg overflow-hidden bg-slate-100 dark:bg-zinc-800 border border-black/[0.06] dark:border-white/[0.06]">
                        {resolveImageUrl(course.course_image_detail || course.course_image) ? (
                          <img
                            src={resolveImageUrl(course.course_image_detail || course.course_image)}
                            alt={course.title}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#00345e] to-[#001f38] text-white/50">
                            <PhotoIcon className="w-7 h-7" />
                          </div>
                        )}
                      </div>

                      {/* Cabecera de la Tarjeta */}
                      <div className="flex items-center justify-between gap-2 mb-2.5">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold truncate border ${
                          isDark
                            ? 'bg-[#00345e]/40 text-blue-300 border-blue-500/40'
                            : 'bg-[#00345e]/08 text-[#00345e] border-[#00345e]/20'
                        }`}>
                          {course.category_name || "General"}
                        </span>
                        <div className={`inline-flex items-center gap-1.5 text-xs font-medium ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                          <ClockIcon className="w-3.5 h-3.5 flex-shrink-0" />
                          <span>{hours}h</span>
                        </div>
                      </div>

                      {/* Título y Estado */}
                      <div className="flex items-start gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" title="Disponible"></span>
                        <h3 className={`text-sm sm:text-base font-bold transition-colors leading-snug line-clamp-2 ${
                          isDark ? 'text-white group-hover:text-[#5b8dd8]' : 'text-zinc-900 group-hover:text-[#00345e]'
                        }`}>
                          {course.title}
                        </h3>
                      </div>

                      {/* Descripción */}
                      {course.description && (
                        <p className={`text-xs line-clamp-2 mt-2 leading-relaxed font-normal ${
                          isDark ? 'text-zinc-400' : 'text-zinc-500'
                        }`}>
                          {course.description}
                        </p>
                      )}
                    </div>

                    {/* Footer de la Tarjeta */}
                    <div className={`mt-5 pt-3 border-t flex items-center justify-between gap-2 ${
                      isDark ? 'border-white/[0.06]' : 'border-black/[0.06]'
                    }`}>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${
                        isDark ? 'bg-zinc-800 text-zinc-300 border-white/[0.06]' : 'bg-zinc-100 text-zinc-700 border-zinc-200'
                      }`}>
                        {modalityStr}
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => course?.id && navigate(`/dashboard/curso/${course.id}`)}
                          className={`h-8 px-3 text-xs font-medium rounded-lg transition-colors cursor-pointer border ${
                            isDark
                              ? 'text-zinc-300 bg-zinc-800 hover:bg-zinc-700 hover:text-white border-white/10'
                              : 'text-zinc-700 bg-zinc-100 hover:bg-zinc-200 hover:text-zinc-900 border-zinc-200 shadow-xs'
                          }`}
                          title={`Ver detalles de ${course.title}`}
                        >
                          Detalles
                        </button>
                        <button
                          type="button"
                          onClick={() => handleEnrollClick(course.id, course.title)}
                          disabled={enrolling}
                          className="h-8 px-3.5 text-xs font-semibold text-white bg-[#00345e] hover:bg-[#002747] active:bg-[#001f38] rounded-lg transition-all shadow-xs cursor-pointer border-0 disabled:opacity-50"
                          title={`Inscribirme en ${course.title}`}
                        >
                          Inscribirme
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className={`rounded-xl p-10 text-center max-w-sm mx-auto border ${
              isDark ? 'bg-[#16161a] border-white/[0.08]' : 'bg-white border-black/[0.08] shadow-xs'
            }`}>
              <p className={`text-sm font-bold ${isDark ? 'text-zinc-200' : 'text-zinc-800'}`}>
                No se encontraron cursos
              </p>
              <p className={`text-xs mt-1 ${isDark ? 'text-zinc-500' : 'text-zinc-500'}`}>
                Prueba ajustando el término de búsqueda o la categoría seleccionada.
              </p>
            </div>
          )}

          {/* Paginación en Vista Tarjetas */}
          {total > pageSize && (
            <div className={`flex items-center justify-between gap-3 pt-2 text-xs ${
              isDark ? 'text-zinc-400' : 'text-zinc-600'
            }`}>
              <span>
                Página {page} de {totalPages}
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (page > 1) {
                      const newPage = page - 1;
                      setPage(newPage);
                      loadCourses(categorySelected || "Todos", newPage, pageSize, searchQuery);
                    }
                  }}
                  disabled={page <= 1 || loading}
                  className={`h-8 px-3 rounded-lg text-xs font-medium disabled:opacity-30 transition-colors cursor-pointer flex items-center gap-1 border ${
                    isDark
                      ? 'bg-zinc-800/80 border-white/10 text-zinc-300 hover:text-white hover:bg-zinc-700'
                      : 'bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50 shadow-xs'
                  }`}
                >
                  <ChevronLeftIcon className="w-3.5 h-3.5" />
                  <span>Anterior</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (page < totalPages) {
                      const newPage = page + 1;
                      setPage(newPage);
                      loadCourses(categorySelected || "Todos", newPage, pageSize, searchQuery);
                    }
                  }}
                  disabled={page >= totalPages || loading}
                  className={`h-8 px-3 rounded-lg text-xs font-medium disabled:opacity-30 transition-colors cursor-pointer flex items-center gap-1 border ${
                    isDark
                      ? 'bg-zinc-800/80 border-white/10 text-zinc-300 hover:text-white hover:bg-zinc-700'
                      : 'bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50 shadow-xs'
                  }`}
                >
                  <span>Siguiente</span>
                  <ChevronRightIcon className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className={`p-3.5 rounded-lg border text-xs sm:text-sm font-medium ${
          isDark
            ? 'bg-red-950/40 border-red-800/40 text-red-300'
            : 'bg-red-50 border-red-200 text-red-700'
        }`} role="alert">
          {error}
        </div>
      )}

      {/* Modales funcionales */}
      <RoleSelectionModal
        isOpen={showRolSelection}
        onClose={() => {
          setShowRolSelection(false);
          setPendingEnrollment(null);
        }}
        onSelectRole={handleRoleSelection}
        courseName={pendingEnrollment?.courseName || ""}
      />

      <PdfUploadModal
        isOpen={showPdfUpload}
        onClose={() => {
          setShowPdfUpload(false);
          setIsExpositor(false);
          setPendingEnrollment(null);
        }}
        onFileUpload={handleDocumentUpload}
        courseName={pendingEnrollment?.courseName || ""}
      />

      <EnrollmentModal
        isOpen={showEnrollmentModal}
        onClose={() => {
          setShowEnrollmentModal(false);
          setEnrollmentError(null);
        }}
        enrollmentData={enrollmentData}
        courseName={selectedCourseName}
        error={enrollmentError}
      />

      <ConfirmDialog
        isOpen={showEnrollConfirm}
        onClose={() => {
          setShowEnrollConfirm(false);
          setPendingEnrollment(null);
          setIsExpositor(false);
          setDocumentFile(null);
        }}
        onConfirm={() =>
          pendingEnrollment && handleEnroll(pendingEnrollment.courseId, pendingEnrollment.courseName)
        }
        title="Confirmar inscripción"
        message={`¿Confirmas tu inscripción como ${
          isExpositor ? 'Expositor' : 'Participante'
        } en el curso "${pendingEnrollment?.courseName}"?${
          documentFile ? '\n\nDocumento adjunto: ' + documentFile.name : ''
        }`}
        confirmText="Confirmar"
        cancelText="Cancelar"
        type="info"
        loading={enrolling}
      />
    </div>
  );
}
