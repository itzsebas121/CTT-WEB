import { useEffect, useState, useCallback } from "react";
import { getCourses, getCoursesByCategory, searchCourses } from "../../api/courses";
import { enrollInCourse } from "../../api/inscripciones";
import { EyeIcon } from "@heroicons/react/16/solid";
import { useNavigate, useLocation } from "react-router-dom";
import { Table, EnrollmentModal, ConfirmDialog } from "../../components/ui";
import AOS from "aos";
import "aos/dist/aos.css";

const headers = ["titulo", "categoria", "horas", "modalidad", "acciones"];

const filters = {
  categoria: ["TICS", "Educativo", "Software", "Electrónica", "Congresos"],
};

export default function Cursos() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(7);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [categorySelected, setCategorySelected] = useState(null);
  const [statusFilter, setStatusFilter] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [enrolling, setEnrolling] = useState(false);
  const [showEnrollmentModal, setShowEnrollmentModal] = useState(false);
  const [enrollmentData, setEnrollmentData] = useState(null);
  const [selectedCourseName, setSelectedCourseName] = useState("");
  const [coursesLoaded, setCoursesLoaded] = useState(false);
  const [enrollmentError, setEnrollmentError] = useState(null);
  const [isInitialMount, setIsInitialMount] = useState(true);
  const [showEnrollConfirm, setShowEnrollConfirm] = useState(false);
  const [pendingEnrollment, setPendingEnrollment] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const handleEnrollClick = (courseId, courseName) => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');

    if (!token || !user) {
      // Guardar la intención de inscripción antes de redirigir
      localStorage.setItem('pendingEnrollment', JSON.stringify({
        courseId,
        courseName,
        returnPath: location.pathname
      }));
      navigate('/login', { state: { from: location } });
      return;
    }

    // Guardar datos y mostrar confirmación
    setPendingEnrollment({ courseId, courseName });
    setShowEnrollConfirm(true);
  };

  const handleEnroll = useCallback(async (courseId, courseName) => {
    setShowEnrollConfirm(false);

    try {
      setEnrolling(true);
      setEnrollmentError(null);
      const user = localStorage.getItem('user');
      const userData = JSON.parse(user);
      const response = await enrollInCourse(userData.id, parseInt(courseId));
      setEnrollmentData(response);
      setSelectedCourseName(courseName);
      setShowEnrollmentModal(true);
      // Recargar la tabla de cursos después de inscripción exitosa
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
    }
  }, [navigate, categorySelected, page, pageSize, searchQuery]);

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
      
      // Si hay búsqueda, usar el endpoint de búsqueda
      if (query && query.trim().length > 0) {
        response = await searchCourses(query.trim(), pageRequested, pageSizeRequested, "activo", localStorage.getItem('token'));
      } else {
        // Si no hay búsqueda, usar la lógica existente
        response = category && category !== "Todos"
          ? await getCourses(pageRequested, pageSizeRequested, "activo", category, localStorage.getItem('token'))
          : await getCourses(pageRequested, pageSizeRequested, "activo", null, localStorage.getItem('token'));
      }
      
      // Manejar ambos formatos de respuesta
      const coursesArray = Array.isArray(response)
        ? response
        : response?.courses || [];
      const respTotal = response?.total ?? (Array.isArray(response) ? response.length : 0);
      const respPageSize = response?.page_size ?? pageSizeRequested;
      const respTotalPages = response?.total_pages ?? Math.max(1, Math.ceil(respTotal / respPageSize));

      // Transformar los datos de la API para que coincidan con la estructura esperada por CardCourse
      const transformedCourses = coursesArray.map((course) => ({
        titulo: course.title,
        categoria: course.category || "Sin categoría",
        status: course.status,
        horas: course.requirements?.hours?.total?.toString() || "0",
        id: course.id,
        modalidad: course.requirements?.modality?.toString() || "No definida",
        acciones: (
          <div className="flex gap-2">
            <button onClick={() => navigate(`/dashboard/curso/${course.id}`)}>
              <EyeIcon className="h-5 w-5 inline-block" />
            </button>
            <button
              onClick={() => handleEnrollClick(course.id, course.title)}
              disabled={enrolling}
              className="bg-[#6C1313] hover:bg-[#5a0f0f] text-white px-3 py-1 rounded text-sm disabled:opacity-50"
            >
              Inscribirse
            </button>
          </div>
        ),
      }));
      setCourses(transformedCourses);
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

  useEffect(() => {
    AOS.init({ duration: 1000, once: false, mirror: true });
    AOS.refresh();
    loadCourses();
    setIsInitialMount(false);
  }, []);

  // Efecto separado para manejar la inscripción pendiente después de cargar los cursos
  useEffect(() => {
    const checkPendingEnrollment = async () => {
      if (coursesLoaded && location.state?.enrollCourseId) {
        const pendingEnrollmentData = localStorage.getItem('pendingEnrollment');
        if (pendingEnrollmentData) {
          const { courseId, courseName } = JSON.parse(pendingEnrollmentData);
          localStorage.removeItem('pendingEnrollment');
          console.log('Mostrando confirmación de inscripción:', courseId, courseName);
          // Mostrar diálogo de confirmación en lugar de inscribir automáticamente
          setPendingEnrollment({ courseId, courseName });
          setShowEnrollConfirm(true);
        }
        // Limpiar el estado
        window.history.replaceState({}, document.title);
      }
    };
    
    checkPendingEnrollment();
  }, [coursesLoaded, location.state]);

  // Efecto para manejar la búsqueda con debounce
  useEffect(() => {
    // No ejecutar en el montaje inicial
    if (isInitialMount) {
      return;
    }

    const delayDebounceFn = setTimeout(() => {
      loadCourses(categorySelected || "Todos", 1, pageSize, searchQuery);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, categorySelected, pageSize, isInitialMount]);

  const handleFilterChange = (filterColumn, value) => {
    if (filterColumn === "categoria") {
      const categoryValue = value === "Todos" ? null : value;
      setCategorySelected(categoryValue);
      // Resetear a página 1 cuando cambia la categoría
      loadCourses(categoryValue || "Todos", 1, pageSize, searchQuery);
    } else if (filterColumn === "estado") {
      // Mapear valores de UI a valores de API
      let statusValue = null;
      if (value === "Activo") {
        statusValue = "activo";
      } else if (value === "Cerrado") {
        statusValue = "inactivo";
      }
      
      setStatusFilter(statusValue);
      // Resetear a página 1 cuando cambia el filtro
      loadCourses(categorySelected || "Todos", 1, pageSize, searchQuery);
    }
  };

  const handleSearchChange = (value) => {
    setSearchQuery(value);
  };

  return (
    <div className="p-4">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Cursos</h1>
      </div>

      <div className="mb-4">
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
        />
      </div>
      {error && <div className="text-red-600 mt-2">{error}</div>}

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
        }}
        onConfirm={() => pendingEnrollment && handleEnroll(pendingEnrollment.courseId, pendingEnrollment.courseName)}
        title="¿Confirmar inscripción?"
        message={`¿Estás seguro de que deseas inscribirte en el curso "${pendingEnrollment?.courseName}"?`}
        confirmText="Inscribirme"
        cancelText="Cancelar"
        type="info"
        loading={enrolling}
      />
    </div>
  );
}
