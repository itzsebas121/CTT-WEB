import { CpuChipIcon, BuildingLibraryIcon, CommandLineIcon, ComputerDesktopIcon, Squares2X2Icon, ArrowRightEndOnRectangleIcon, UsersIcon } from "@heroicons/react/24/outline"
import CardCourse from "./CardCourse"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import AOS from "aos"
import 'aos/dist/aos.css'
import { getCourses, getCoursesByCategory } from "../../api/courses"


const categories = [
    { id: 0, text: 'Todos', icon: Squares2X2Icon, status: 'true' },
    { id: 1, text: 'TICS', icon: ComputerDesktopIcon, status: 'false' },
    { id: 2, text: 'Educativo', icon: BuildingLibraryIcon, status: 'false' },
    { id: 3, text: 'Software', icon: CommandLineIcon, status: 'false' },
    { id: 4, text: 'Electrónica', icon: CpuChipIcon, status: 'false' },
    { id: 5, text: 'Congresos', icon: UsersIcon, status: 'false' },
]

export default function CourseSection({ filters }) {
    const navigate = useNavigate();
    
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeCategory, setActiveCategory] = useState('Todos');

    const loadCourses = async (category = null) => {
        try {
            setLoading(true);
            setError(null);

            // Obtener solo 3 cursos para la sección de inicio
            const data = category && category !== 'Todos'
                ? await getCoursesByCategory(category, 1, 3, 'activo')
                : await getCourses(1, 3, 'activo');

            // Transformar los datos de la API
            const transformedCourses = data.courses.map(course => ({
                title: course.title,
                image: course.course_image_detail,
                isOpen: course.status === 'activo',
                hours: course.requirements?.hours?.total?.toString() || '0',
                description: course.description,
                id: course.id
            }));

            setCourses(transformedCourses);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCategoryChange = async (category) => {
        setActiveCategory(category);
        // Si es "Todos", no pasamos categoría para obtener todos los cursos
        // Si es otra categoría, la pasamos para filtrar
        await loadCourses(category === 'Todos' ? null : category);
    };

    const handleViewMoreCourses = () => {
        navigate('/courses');
    };

    useEffect(() => {
        AOS.init({ duration: 1000, once: false, mirror: true });
        AOS.refresh();
        loadCourses();
    }, []);
    return (
        <div className="overflow-hidden bg-white py-24 sm:py-32" data-aos="fade-down">
            <div className="mx-auto max-w-7xl md:px-6 lg:px-8">
                <h2 className="text-2xl font-semibold text-[#6C1313] ml-6">Cursos y Categorías</h2>
                <div className="flex justify-center">
                    <div className="mt-6 flex flex-around gap-x-10 px-6 gap-y-4 overflow-x-auto whitespace-nowrap scrollbar-hide">
                        {categories.map((category) => (
                            <button
                                key={category.id}
                                style={{
                                    backgroundColor: activeCategory === category.text ? '#6C1313' : '#F5F5F5',
                                    color: activeCategory === category.text ? 'white' : '#6C1313'
                                }}
                                className="flex flex-col items-center justify-center text-center min-w-[150px] transition-all duration-200 hover:opacity-80"
                                onClick={() => handleCategoryChange(category.text)}
                                data-aos="zoom-in">
                                <category.icon
                                    className={`h-20 w-20 mb-1 ${activeCategory === category.text ? 'text-white' : 'text-[#6C1313]'}`} 
                                    strokeWidth={0.5} 
                                />
                                <span>{category.text}</span>
                                <div className="mt-2 button">
                                    <ArrowRightEndOnRectangleIcon className="h-6 w-6 text-white" strokeWidth={0.9} />
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
                {loading && (
                    <div className="flex justify-center items-center mt-10">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6C1313]"></div>
                        <span className="ml-3 text-[#6C1313]">Cargando cursos...</span>
                    </div>
                )}

                {error && (
                    <div className="flex justify-center items-center mt-10">
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                            <p>Error al cargar los cursos: {error}</p>
                            <button
                                onClick={() => loadCourses(activeCategory)}
                                className="mt-2 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                            >
                                Reintentar
                            </button>
                        </div>
                    </div>
                )}

                {!loading && !error && courses.length > 0 && (
                    <div className="overflow-x-auto whitespace-nowrap scrollbar-hide">
                        <div className=" mt-10 lg:m-10 flex lg:grid sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch h-auto">
                        {courses.map((course, index) => (
                            <div data-aos="zoom-in" key={course.id || index} className="inline-block w-full px-6">
                                <CardCourse
                                    title={course.title}
                                    image={course.image}
                                    isOpen={course.isOpen}
                                    hours={course.hours}
                                    id={course.id}
                                />
                            </div>
                        ))}
                        </div>
                    </div>
                )}

                {!loading && !error && courses.length === 0 && (
                    <div className="flex flex-col justify-center items-center mt-16 mb-12 px-6">
                        <div className="relative bg-gray-50 rounded-2xl p-8 max-w-md w-full text-center shadow-sm border border-gray-100">
                            <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl opacity-50"></div>
                            <div className="relative z-10">
                                <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
                                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25A8.966 8.966 0 0118 3.75c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0118 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-medium text-gray-800 mb-2">
                                    {activeCategory === 'Todos' ? 'Sin cursos disponibles' : 'Categoría sin cursos'}
                                </h3>
                                <p className="text-gray-500 text-sm leading-relaxed">
                                    {activeCategory === 'Todos'
                                        ? 'Actualmente no hay cursos disponibles. Te notificaremos cuando se agreguen nuevos contenidos.'
                                        : `No encontramos cursos para "${activeCategory}". Prueba con otra categoría o revisa más tarde.`
                                    }
                                </p>
                            </div>
                        </div>
                    </div>
                )}
                <div className="m-10 mt-6 flex flex-wrap gap-x-4 gap-y-2" data-aos="fade-right">
                    <button
                        className="transition-all duration-200 hover:bg-[#5a0f0f] focus:outline-none focus:bg-[#5a0f0f] focus:ring-2 focus:ring-[#6C1313] focus:ring-opacity-50 active:bg-[#4a0c0c]"
                        onClick={handleViewMoreCourses}
                    >
                        Ver más cursos...
                    </button>
                </div>
            </div>
        </div>
    )
}
