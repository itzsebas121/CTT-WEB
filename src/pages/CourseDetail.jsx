import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeftIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { getCourseById } from "../api/courses";
import { enrollInCourse, uploadDocumentForEnrollment } from "../api/inscripciones";
import {
  CourseHeader,
  CourseContent,
  CourseRequirements,
  CourseSidebar,
  CourseDates,
  CourseObjetives,
  CourseMaterials,
} from "../components/courses";
import { EnrollmentModal, ConfirmDialog, RoleSelectionModal, PdfUploadModal } from "../components/ui";
import { useDashboardTheme } from "../context/DashboardThemeContext";

export default function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isDark } = useDashboardTheme();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [enrolling, setEnrolling] = useState(false);
  const [showEnrollmentModal, setShowEnrollmentModal] = useState(false);
  const [enrollmentData, setEnrollmentData] = useState(null);
  const [shouldAutoEnroll, setShouldAutoEnroll] = useState(false);
  const [enrollmentError, setEnrollmentError] = useState(null);
  const [showEnrollConfirm, setShowEnrollConfirm] = useState(false);
  const [showRoleSelection, setShowRoleSelection] = useState(false);
  const [showPdfUpload, setShowPdfUpload] = useState(false);
  const [isExpositor, setIsExpositor] = useState(false);
  const [documentFile, setDocumentFile] = useState(null);
  const [pendingEnrollment, setPendingEnrollment] = useState(null);

  const isDashboard = location.pathname.startsWith("/dashboard");

  const handleEnrollClick = () => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");

    if (!token || !user) {
      const currentPath = location.pathname;
      localStorage.setItem(
        "pendingEnrollment",
        JSON.stringify({
          courseId: id,
          courseName: course?.title || "Curso",
          returnPath: currentPath,
        })
      );
      navigate("/login", { state: { from: location } });
      return;
    }

    setPendingEnrollment({ courseId: id, courseName: course?.title || "Curso" });
    setShowRoleSelection(true);
  };

  const handleRoleSelection = (role) => {
    setShowRoleSelection(false);
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

  const handleEnroll = useCallback(async () => {
    setShowEnrollConfirm(false);
    const user = localStorage.getItem("user");

    try {
      setEnrolling(true);
      setEnrollmentError(null);
      const userData = JSON.parse(user);
      if (isExpositor && documentFile) {
        await uploadDocumentForEnrollment(documentFile);
      }
      const response = await enrollInCourse(userData.id, parseInt(id));
      setEnrollmentData(response);
      setShowEnrollmentModal(true);
    } catch (err) {
      if (err.message === "UNAUTHORIZED") {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
      } else {
        setEnrollmentError(err.message);
        setShowEnrollmentModal(true);
      }
    } finally {
      setEnrolling(false);
      setPendingEnrollment(null);
      setIsExpositor(false);
      setDocumentFile(null);
    }
  }, [id, navigate, isExpositor, documentFile]);

  useEffect(() => {
    const courseId = parseInt(id, 10);
    if (!id || id === "null" || id === "undefined" || isNaN(courseId) || courseId <= 0) {
      setLoading(false);
      setError("Identificador de curso inválido o no especificado.");
      return;
    }

    const loadCourse = async () => {
      try {
        setLoading(true);
        setError(null);
        const courseData = await getCourseById(courseId);
        setCourse(courseData);

        if (
          location.state?.enrollCourseId &&
          location.state.enrollCourseId === courseId
        ) {
          const pendingEnrollmentData = localStorage.getItem("pendingEnrollment");
          if (pendingEnrollmentData) {
            localStorage.removeItem("pendingEnrollment");
            setShouldAutoEnroll(true);
          }
          window.history.replaceState({}, document.title);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadCourse();
  }, [id, location.state]);

  useEffect(() => {
    if (shouldAutoEnroll && course && !loading && !enrolling) {
      setShouldAutoEnroll(false);
      setPendingEnrollment({ courseId: id, courseName: course?.title || "Curso" });
      setShowRoleSelection(true);
    }
  }, [shouldAutoEnroll, course, loading, enrolling, id]);

  const handleGoBack = () => {
    if (location.key !== "default") {
      navigate(-1);
    } else if (isDashboard) {
      navigate("/dashboard/cursos/disponibles");
    } else {
      navigate("/courses");
    }
  };

  // Estado de Carga con Skeleton Elegante Dokploy
  if (loading) {
    return (
      <div className="w-full max-w-7xl mx-auto space-y-6 animate-pulse">
        {/* Barra superior skeleton */}
        <div className="flex justify-between items-center pb-3 border-b border-black/[0.06] dark:border-white/[0.06]">
          <div className={`h-9 w-36 rounded-xl ${isDark ? 'bg-white/[0.06]' : 'bg-black/[0.06]'}`} />
          <div className={`h-6 w-20 rounded-lg ${isDark ? 'bg-white/[0.06]' : 'bg-black/[0.06]'}`} />
        </div>

        {/* Layout en 2 columnas skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className={`h-80 rounded-2xl ${isDark ? 'bg-[#16161a]' : 'bg-zinc-100'}`} />
            <div className={`h-48 rounded-2xl ${isDark ? 'bg-[#16161a]' : 'bg-zinc-100'}`} />
            <div className={`h-64 rounded-2xl ${isDark ? 'bg-[#16161a]' : 'bg-zinc-100'}`} />
          </div>
          <div className="lg:col-span-1 space-y-5">
            <div className={`h-60 rounded-2xl ${isDark ? 'bg-[#16161a]' : 'bg-zinc-100'}`} />
            <div className={`h-48 rounded-2xl ${isDark ? 'bg-[#16161a]' : 'bg-zinc-100'}`} />
          </div>
        </div>
      </div>
    );
  }

  // Estado de Error
  if (error) {
    const isInvalidId = !id || id === "null" || id === "undefined" || isNaN(parseInt(id, 10)) || (typeof error === 'string' && (error.includes("422") || error.includes("inválido")));
    return (
      <div className="w-full max-w-xl mx-auto py-16 px-4 text-center">
        <div
          className={`rounded-2xl p-8 border transition-colors ${
            isDark ? 'bg-[#16161a] border-white/[0.08] shadow-xl' : 'bg-white border-black/[0.08] shadow-md'
          }`}
        >
          <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mx-auto mb-4">
            <ExclamationTriangleIcon className="w-6 h-6" />
          </div>
          <h2 className={`text-xl font-bold tracking-tight mb-2 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
            {isInvalidId ? "Curso No Encontrado" : "Error al Cargar la Información"}
          </h2>
          <p className={`text-xs sm:text-sm mb-6 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
            {isInvalidId
              ? "No se ha especificado un curso válido o el enlace ha caducado."
              : error}
          </p>
          <button
            type="button"
            onClick={handleGoBack}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-[#00345e] hover:bg-[#002747] text-white cursor-pointer transition-colors shadow-xs"
          >
            ← Volver a Cursos
          </button>
        </div>
      </div>
    );
  }

  // Estado no encontrado
  if (!course) {
    return (
      <div className="w-full max-w-xl mx-auto py-16 px-4 text-center">
        <div
          className={`rounded-2xl p-8 border transition-colors ${
            isDark ? 'bg-[#16161a] border-white/[0.08] shadow-xl' : 'bg-white border-black/[0.08] shadow-md'
          }`}
        >
          <h2 className={`text-xl font-bold tracking-tight mb-2 ${isDark ? 'text-white' : 'text-zinc-900'}`}>
            Curso No Encontrado
          </h2>
          <p className={`text-xs sm:text-sm mb-6 ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
            El programa académico solicitado no está disponible o ha sido retirado del catálogo.
          </p>
          <button
            type="button"
            onClick={handleGoBack}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-[#00345e] hover:bg-[#002747] text-white cursor-pointer transition-colors"
          >
            ← Volver al Catálogo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full max-w-7xl mx-auto space-y-6 ${!isDashboard ? 'px-4 sm:px-6 lg:px-8 py-6' : ''}`}>
      {/* Barra Superior: Retorno Intuitivo al Catálogo */}
      <div className="flex items-center justify-between pb-3 border-b border-black/[0.06] dark:border-white/[0.06]">
        <button
          type="button"
          onClick={handleGoBack}
          className={`group inline-flex items-center gap-2.5 h-9 px-3.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer border ${
            isDark
              ? 'bg-[#16161a] hover:bg-zinc-800 text-zinc-200 hover:text-white border-white/[0.08] hover:border-white/[0.18] shadow-xs'
              : 'bg-white hover:bg-zinc-100 text-zinc-800 hover:text-[#00345e] border-zinc-200 hover:border-zinc-300 shadow-xs'
          }`}
          title="Regresar al catálogo de cursos disponibles"
        >
          <ArrowLeftIcon className="h-4 w-4 text-[#00345e] dark:text-blue-400 transition-transform duration-200 group-hover:-translate-x-1" />
          <span>Volver al Catálogo</span>
        </button>

        {course.category_name && (
          <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold uppercase tracking-wider border ${
            isDark
              ? 'bg-[#00345e]/30 text-blue-300 border-blue-500/30'
              : 'bg-[#00345e]/08 text-[#00345e] border-[#00345e]/15'
          }`}>
            {course.category_name}
          </span>
        )}
      </div>

      {/* Grid Principal de 2 Columnas: Contenido Detallado y Sidebar Flotante Sticky */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
        {/* Columna Izquierda (Contenido y Módulos) */}
        <div className="lg:col-span-7 xl:col-span-8">
          <CourseHeader course={course} />
          <CourseDates course={course} />
          <CourseObjetives course={course} />
          <CourseContent course={course} />
          <CourseRequirements course={course} />
          <CourseMaterials course={course} />
        </div>

        {/* Columna Derecha (Sidebar Ficha Técnica & CTA de Inscripción Sticky) */}
        <div className="lg:col-span-5 xl:col-span-4 h-full">
          <CourseSidebar
            course={course}
            onEnroll={handleEnrollClick}
            enrolling={enrolling}
          />
        </div>
      </div>

      {/* Modales de Inscripción y Validación */}
      <EnrollmentModal
        isOpen={showEnrollmentModal}
        onClose={() => {
          setShowEnrollmentModal(false);
          setEnrollmentError(null);
        }}
        enrollmentData={enrollmentData}
        courseName={course?.title}
        error={enrollmentError}
      />

      <RoleSelectionModal
        isOpen={showRoleSelection}
        onClose={() => {
          setShowRoleSelection(false);
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

      <ConfirmDialog
        isOpen={showEnrollConfirm}
        onClose={() => {
          setShowEnrollConfirm(false);
          setPendingEnrollment(null);
          setIsExpositor(false);
          setDocumentFile(null);
        }}
        onConfirm={handleEnroll}
        title="¿Confirmar inscripción académica?"
        message={`¿Estás seguro de que deseas inscribirte como ${isExpositor ? 'Expositor' : 'Participante'} en el curso "${course?.title}"?${documentFile ? '\n\nDocumento adjunto: ' + documentFile.name : ''}`}
        confirmText="Inscribirme Ahora"
        cancelText="Cancelar"
        type="info"
        loading={enrolling}
      />
    </div>
  );
}
