import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { getCourseById } from "../api/courses";
import { enrollInCourse } from "../api/inscripciones";
import { CourseHeader, CourseContent, CourseRequirements, CourseSidebar, CourseDates, CourseObjetives, CourseMaterials } from "../components/courses";
import { EnrollmentModal, ConfirmDialog } from "../components/ui";

export default function CourseDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [enrolling, setEnrolling] = useState(false);
    const [showEnrollmentModal, setShowEnrollmentModal] = useState(false);
    const [enrollmentData, setEnrollmentData] = useState(null);
    const [shouldAutoEnroll, setShouldAutoEnroll] = useState(false);
    const [enrollmentError, setEnrollmentError] = useState(null);
    const [showEnrollConfirm, setShowEnrollConfirm] = useState(false);

    const handleEnrollClick = () => {
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');

        if (!token || !user) {
            // Determinar la ruta actual para guardarla correctamente
            const currentPath = location.pathname;
            
            // Guardar la intención de inscripción antes de redirigir
            localStorage.setItem('pendingEnrollment', JSON.stringify({
                courseId: id,
                courseName: course?.title || 'Curso',
                returnPath: currentPath
            }));
            navigate('/login', { state: { from: location } });
            return;
        }

        // Mostrar diálogo de confirmación
        setShowEnrollConfirm(true);
    };

    const handleEnroll = useCallback(async () => {
        setShowEnrollConfirm(false);
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');

        try {
            setEnrolling(true);
            setEnrollmentError(null);
            const userData = JSON.parse(user);
            const response = await enrollInCourse(userData.id, parseInt(id));
            setEnrollmentData(response);
            setShowEnrollmentModal(true);
        } catch (err) {

            if (err.message === 'UNAUTHORIZED') {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                navigate('/login');
            } else {
                setEnrollmentError(err.message);
                setShowEnrollmentModal(true);
            }
        } finally {
            setEnrolling(false);
        }
    }, [id, navigate]);

    useEffect(() => {
        const loadCourse = async () => {
            try {
                setLoading(true);
                const courseData = await getCourseById(id);
                setCourse(courseData);
                
                // Verificar si hay una inscripción pendiente después de login
                if (location.state?.enrollCourseId && location.state.enrollCourseId === parseInt(id)) {
                    const pendingEnrollmentData = localStorage.getItem('pendingEnrollment');
                    if (pendingEnrollmentData) {
                        localStorage.removeItem('pendingEnrollment');
                        setShouldAutoEnroll(true);
                    }
                    // Limpiar el estado
                    window.history.replaceState({}, document.title);
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            loadCourse();
        }
    }, [id, location.state]);

    // Efecto separado para mostrar confirmación cuando el curso esté cargado
    useEffect(() => {
        if (shouldAutoEnroll && course && !loading && !enrolling) {
            setShouldAutoEnroll(false);
            // Mostrar diálogo de confirmación en lugar de inscribir automáticamente
            setShowEnrollConfirm(true);
        }
    }, [shouldAutoEnroll, course, loading, enrolling]);

    const handleGoBack = () => {
        // Determinar de dónde vino el usuario
        const isDashboard = location.pathname.startsWith('/dashboard');
        
        if (isDashboard) {
            navigate('/dashboard/cursos/disponibles');
        } else {
            navigate('/courses');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#6C1313] mx-auto mb-4"></div>
                    <p className="text-[#6C1313] text-lg">Cargando curso...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center max-w-md mx-auto p-6">
                    <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg">
                        <h2 className="text-lg font-semibold mb-2">Error al cargar el curso</h2>
                        <p className="mb-4">{error}</p>
                        <button
                            onClick={() => navigate(-1)}
                            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition-colors"
                        >
                            Volver a Cursos
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!course) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-500 text-lg">Curso no encontrado</p>
                    <button
                        onClick={() => navigate(-1)}
                        className="mt-4 bg-[#6C1313] hover:bg-[#5a0f0f] text-white font-bold py-2 px-6 rounded transition-colors"
                    >
                        Volver a Cursos
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <button
                    onClick={handleGoBack}
                    className="flex items-center text-[#6C1313] hover:text-[#5a0f0f] transition-colors font-medium"
                >
                    <ArrowLeftIcon className="h-5 w-5 mr-2" />
                    Volver a Cursos
                </button>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2">
                        <CourseHeader course={course} onEnroll={handleEnrollClick} enrolling={enrolling} />
                        <CourseDates course={course} />
                        <CourseObjetives course={course} />
                        <CourseContent course={course} />
                        <CourseRequirements course={course} />
                        <CourseMaterials course={course} />
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <CourseSidebar course={course} onEnroll={handleEnrollClick} enrolling={enrolling} />
                    </div>
                </div>
            </div>

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

            <ConfirmDialog
                isOpen={showEnrollConfirm}
                onClose={() => setShowEnrollConfirm(false)}
                onConfirm={handleEnroll}
                title="¿Confirmar inscripción?"
                message={`¿Estás seguro de que deseas inscribirte en el curso "${course?.title}"?`}
                confirmText="Inscribirme"
                cancelText="Cancelar"
                type="info"
                loading={enrolling}
            />
        </div>
    );
}
