import { useEffect, useState } from "react";
import { getUserEnrollments } from "../../api/inscripciones";
import { EyeIcon, DocumentTextIcon } from "@heroicons/react/16/solid";
import { useNavigate } from "react-router-dom";
import { Table } from "../../components/ui";
import AOS from "aos";
import "aos/dist/aos.css";

const headers = ["titulo", "categoria", "fecha_inscripcion", "estado", "acciones"];

// Filtros disponibles basados en la API
const filters = {
  estado: ["Interesado", "Generada la orden", "Pagado", "Facturado", "Anulado"],
};

export default function CursosInscritos() {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(7);
  const [statusFilter, setStatusFilter] = useState(null);
  const navigate = useNavigate();

  const handleGeneratePaymentOrder = (enrollmentId, courseName) => {
    // Aquí puedes implementar la lógica para generar la orden de pago
    console.log('Generar orden de pago para inscripción:', enrollmentId, courseName);
    // TODO: Implementar lógica de generación de orden de pago
    alert(`Generar orden de pago para: ${courseName}`);
  };

  const loadEnrollments = async (enrollmentStatus = null) => {
    try {
      setLoading(true);
      setError(null);
      
      const user = localStorage.getItem('user');
      if (!user) {
        navigate('/login');
        return;
      }

      const userData = JSON.parse(user);
      const response = await getUserEnrollments(userData.id, enrollmentStatus);

      // La respuesta tiene la estructura: { user_id, total, enrollments }
      const enrollmentsArray = response.enrollments || [];
      
      // Transformar los datos para la tabla
      const transformedEnrollments = enrollmentsArray.map((enrollment) => {
        // Formatear la fecha de inscripción
        const enrollmentDate = new Date(enrollment.enrollment_date);
        const formattedDate = enrollmentDate.toLocaleDateString('es-ES', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });

        return {
          titulo: enrollment.course_title || "Sin título",
          categoria: enrollment.course_category || "Sin categoría",
          fecha_inscripcion: formattedDate,
          estado: enrollment.status || "Pendiente",
          id: enrollment.id,
          courseId: enrollment.id_course,
          courseImage: enrollment.course_image,
          acciones: (
            <div className="flex gap-2">
              <button 
                onClick={() => navigate(`/dashboard/curso/${enrollment.id_course}`)}
                className="text-[#6C1313] hover:text-[#5a0f0f]"
                title="Ver detalles del curso"
              >
                <EyeIcon className="h-5 w-5 inline-block" />
              </button>
              <button
                onClick={() => handleGeneratePaymentOrder(enrollment.id, enrollment.course_title)}
                className="bg-[#6C1313] hover:bg-[#5a0f0f] text-white px-3 py-1 rounded text-sm flex items-center gap-1"
                title="Generar orden de pago"
              >
                <DocumentTextIcon className="h-4 w-4" />
                <span>Generar Orden</span>
              </button>
            </div>
          ),
        };
      });

      setEnrollments(transformedEnrollments);
    } catch (err) {
      if (err.message === 'UNAUTHORIZED') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      } else {
        setError(err.message);
        console.error('Error al cargar inscripciones:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    AOS.init({ duration: 1000, once: false, mirror: true });
    AOS.refresh();
    loadEnrollments(statusFilter);
  }, []);

  // Manejar cambio de filtro
  const handleFilterChange = (filterColumn, value) => {
    if (filterColumn === "estado") {
      const statusValue = value === "Todos" || !value ? null : value;
      setStatusFilter(statusValue);
      setPage(1); // Reset a primera página
      loadEnrollments(statusValue);
    }
  };

  // Paginación local
  const totalEnrollments = enrollments.length;
  const totalPages = Math.max(1, Math.ceil(totalEnrollments / pageSize));
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedEnrollments = enrollments.slice(startIndex, endIndex);

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize);
    setPage(1); // Reset to first page
  };

  return (
    <div className="p-4">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Mis Cursos Inscritos</h1>
      </div>

      <div className="mb-4">
        {error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        ) : (
          <Table
            headers={headers}
            data={paginatedEnrollments}
            filters={filters}
            page={page}
            pageSize={pageSize}
            total={totalEnrollments}
            totalPages={totalPages}
            loading={loading}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            onFilterChange={handleFilterChange}
          />
        )}
      </div>

      {!loading && !error && enrollments.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p className="text-lg mb-2">No tienes cursos inscritos</p>
          <button
            onClick={() => navigate('/dashboard/cursos/disponibles')}
            className="mt-4 bg-[#6C1313] hover:bg-[#5a0f0f] text-white px-4 py-2 rounded"
          >
            Ver cursos disponibles
          </button>
        </div>
      )}
    </div>
  );
}
