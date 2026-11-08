import { useCallback, useEffect, useState, useMemo } from "react";
import { getUserEnrollments, uploadPaymentReceiptTemp } from "../../api/inscripciones";
import { EyeIcon } from "@heroicons/react/16/solid";
import { useNavigate } from "react-router-dom";
import { Table } from "../../components/ui";
import { useDashboardTheme } from "../../context/DashboardThemeContext";

const headers = ["titulo", "categoria", "fecha_inscripcion", "estado", "detalles"];

const API_ENROLLMENT_STATUSES = ["Interesado", "Generada la orden", "Pagado", "Facturado", "Anulado"];

// Filtros disponibles basados en la API
const filters = {
  estado: API_ENROLLMENT_STATUSES,
};

export default function CursosInscritos() {
  const [rawEnrollments, setRawEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(7);
  const [statusFilter, setStatusFilter] = useState(null);
  const [uploadSuccessMessage, setUploadSuccessMessage] = useState("");
  const { isDark } = useDashboardTheme();
  const navigate = useNavigate();

  const handleUploadReceipt = useCallback(async (enrollmentId, courseTitle, event) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    try {
      setError(null);
      setUploadSuccessMessage("");

      await uploadPaymentReceiptTemp(enrollmentId, file);

      setUploadSuccessMessage(`Comprobante subido correctamente para "${courseTitle}".`);
    } catch (err) {
      if (err.message === "UNAUTHORIZED") {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
      } else {
        setError(err.message || "No se pudo subir el comprobante.");
      }
    }
  }, [navigate]);

  const loadEnrollments = useCallback(async (enrollmentStatus = null) => {
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
      const enrollmentsArray = response.enrollments || [];
      setRawEnrollments(enrollmentsArray);
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
  }, [navigate]);

  const enrollments = useMemo(() => {
    return rawEnrollments.map((enrollment) => {
      const enrollmentDate = new Date(enrollment.enrollment_date);
      const formattedDate = enrollmentDate.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      const apiStatus = enrollment.status || "Interesado";
      const isCongress = Boolean(enrollment.id_congress);
      const effectiveTitle = enrollment.course_title || enrollment.congress_title || enrollment.title || (isCongress ? "Congreso Académico" : "Sin título");
      const effectiveCategory = enrollment.course_category_name || (isCongress ? "Congreso" : "General");

      return {
        titulo: (
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full flex-shrink-0 ${isCongress ? 'bg-indigo-400' : 'bg-emerald-400'}`}
              title={isCongress ? "Congreso" : "Curso"}
            />
            <span className={`font-semibold ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}>
              {effectiveTitle}
            </span>
          </div>
        ),
        categoria: (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold whitespace-nowrap border ${
            isDark
              ? isCongress
                ? 'bg-indigo-950/50 text-indigo-300 border-indigo-500/30'
                : 'bg-[#00345e]/40 text-blue-300 border-blue-500/40'
              : isCongress
                ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                : 'bg-[#00345e]/08 text-[#00345e] border-[#00345e]/20'
          }`}>
            {effectiveCategory}
          </span>
        ),
        fecha_inscripcion: (
          <span className={isDark ? 'text-zinc-300' : 'text-zinc-700'}>
            {formattedDate}
          </span>
        ),
        estado: (
          <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${
            isDark
              ? 'bg-zinc-800 text-zinc-200 border border-white/10'
              : 'bg-zinc-100 text-zinc-700 border border-zinc-200'
          }`}>
            {API_ENROLLMENT_STATUSES.includes(apiStatus) ? apiStatus : "Interesado"}
          </span>
        ),
        id: enrollment.id,
        courseId: enrollment.id_course,
        courseImage: enrollment.course_image,
        detalles: (
          <div className="flex items-center justify-end gap-2">
            {enrollment.id_course ? (
              <button
                type="button"
                onClick={() => navigate(`/dashboard/curso/${enrollment.id_course}`)}
                className={`h-8 px-2.5 rounded-lg transition-colors cursor-pointer flex items-center justify-center border ${
                  isDark
                    ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white border-white/10'
                    : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700 hover:text-zinc-900 border-zinc-200'
                }`}
                title="Ver detalles del curso"
              >
                <EyeIcon className="h-4 w-4" />
              </button>
            ) : enrollment.id_congress ? (
              <button
                type="button"
                onClick={() => navigate(`/dashboard/congreso/${enrollment.id_congress}`)}
                className={`h-8 px-2.5 rounded-lg transition-colors cursor-pointer flex items-center justify-center border ${
                  isDark
                    ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white border-white/10'
                    : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700 hover:text-zinc-900 border-zinc-200'
                }`}
                title="Ver detalles del congreso"
              >
                <EyeIcon className="h-4 w-4" />
              </button>
            ) : null}
            <label
              htmlFor={`file_input_${enrollment.id}`}
              className="h-8 px-3 bg-[#00345e] hover:bg-[#002747] text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center justify-center whitespace-nowrap shadow-xs"
            >
              Subir Comprobante
            </label>
            <input
              type="file"
              className="hidden"
              accept="application/pdf"
              title="Subir comprobante de pago"
              name="file_input"
              id={`file_input_${enrollment.id}`}
              onChange={(e) => handleUploadReceipt(enrollment.id, effectiveTitle, e)}
            />
          </div>
        ),
      };
    });
  }, [rawEnrollments, isDark, navigate, handleUploadReceipt]);

  useEffect(() => {
    loadEnrollments(statusFilter);
  }, [loadEnrollments, statusFilter]);

  // Manejar cambio de filtro
  const handleFilterChange = (filterColumn, value) => {
    if (filterColumn === "estado") {
      const statusValue = value === "Todos" || !value ? null : value;
      setStatusFilter(statusValue);
      setPage(1); // Reset a primera página
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
    <div className="w-full space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className={`text-2xl sm:text-3xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-zinc-900'}`}>
            Mis Cursos Inscritos
          </h1>
          <p className={`text-xs sm:text-sm mt-1 ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
            Consulta el estado de tus inscripciones académicas y sube tus comprobantes de pago.
          </p>
        </div>
      </div>

      <div className="mb-4">
        {uploadSuccessMessage && (
          <div className={`mb-3 px-4 py-3 rounded-lg text-xs border ${
            isDark
              ? 'bg-emerald-950/40 border-emerald-800/40 text-emerald-300'
              : 'bg-emerald-50 border-emerald-200 text-emerald-800'
          }`} role="status">
            <span className="block sm:inline">{uploadSuccessMessage}</span>
          </div>
        )}

        {error ? (
          <div className={`px-4 py-3 rounded-lg text-xs border ${
            isDark
              ? 'bg-red-950/40 border-red-800/40 text-red-300'
              : 'bg-red-50 border-red-200 text-red-800'
          }`} role="alert">
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
        <div className={`text-center py-12 rounded-xl border max-w-sm mx-auto p-6 ${
          isDark
            ? 'text-zinc-500 bg-[#16161a] border-white/[0.08]'
            : 'text-zinc-500 bg-white border-black/[0.08] shadow-xs'
        }`}>
          <p className={`text-sm font-semibold mb-1 ${isDark ? 'text-zinc-300' : 'text-zinc-800'}`}>No tienes cursos inscritos</p>
          <p className="text-xs text-zinc-500 mb-4">Inscríbete en los cursos del catálogo para visualizarlos aquí.</p>
          <button
            onClick={() => navigate('/dashboard/cursos/disponibles')}
            className="bg-[#00345e] hover:bg-[#002747] text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors cursor-pointer"
          >
            Ver cursos disponibles
          </button>
        </div>
      )}
    </div>
  );
}
