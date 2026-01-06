import CardCourse from "./CardCourse"
import { useEffect, useState, useRef, useCallback } from "react"
import AOS from "aos"
import 'aos/dist/aos.css'
import { getCourses, getCoursesByCategory, searchCourses } from "../../api/courses"

export default function CoursesList({filters}) {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [totalCourses, setTotalCourses] = useState(0);
    const observer = useRef();

    useEffect(() => {
        AOS.init({ duration: 1000, once: false, mirror: true });
        AOS.refresh();
    }, []);

    // Cargar cursos desde la API con paginación
    const loadCourses = async (category = null, searchQuery = null, pageNum = 1, append = false) => {
        try {
            if (pageNum === 1) {
                setLoading(true);
            }
            setError(null);

            let data;
            const pageSize = 12; // Cursos por página

            // Priorizar búsqueda si existe
            if (searchQuery && searchQuery.trim() !== '') {
                data = await searchCourses(searchQuery, pageNum, pageSize, 'activo');
            } else if (category && category !== 'Todos') {
                data = await getCoursesByCategory(category, pageNum, pageSize, 'activo');
            } else {
                data = await getCourses(pageNum, pageSize, 'activo');
            }

            // Transformar los datos
            const transformedCourses = data.courses.map(course => ({
                title: course.title,
                image: course.course_image_detail,
                isOpen: course.status === 'activo',
                hours: course.requirements?.hours?.total?.toString() || '0',
                description: course.description,
                id: course.id,
                category: course.category
            }));

            if (append) {
                setCourses(prev => [...prev, ...transformedCourses]);
            } else {
                setCourses(transformedCourses);
            }

            setTotalCourses(data.total || 0);
            setHasMore(data.courses.length === pageSize && (data.page * pageSize) < data.total);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Observer para el último elemento
    const lastCourseElementRef = useCallback(node => {
        if (loading) return;
        if (observer.current) observer.current.disconnect();
        
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                setPage(prevPage => prevPage + 1);
            }
        });
        
        if (node) observer.current.observe(node);
    }, [loading, hasMore]);

    // Cargar más cursos cuando cambia la página
    useEffect(() => {
        if (page > 1) {
            loadCourses(filters.category, filters.search, page, true);
        }
    }, [page]);

    // Resetear y cargar cursos cuando cambian los filtros
    useEffect(() => {
        setPage(1);
        setCourses([]);
        setHasMore(true);
        loadCourses(filters.category, filters.search, 1, false);
    }, [filters.category, filters.search]);

    // Función para verificar si un curso cumple con los filtros de duración (usada para filtrado del lado del cliente)
    const matchesDurationFilter = (courseHours) => {
        if (!filters.duration) return true;

        const hours = parseInt(courseHours, 10);

        switch(filters.duration) {
            case 'less10':
                return hours >= 0 && hours <= 9;
            case '10to19':
                return hours >= 10 && hours <= 19;
            case '20to59':
                return hours >= 20 && hours <= 59;
            case '60to99':
                return hours >= 60 && hours <= 99;
            case '100plus':
                return hours >= 100;
            default:
                return true;
        }
    };

    // Función para verificar si un curso cumple con todos los filtros (lado cliente)
    const matchesFilters = (course) => {
        // Filtro de estado
        if (filters.status) {
            const isOpen = course.isOpen;
            if (filters.status === 'open' && !isOpen) return false;
            if (filters.status === 'closed' && isOpen) return false;
        }

        // Filtro de duración
        if (filters.duration) {
            if (!matchesDurationFilter(course.hours)) return false;
        }

        // Filtro de modalidad
        if (filters.modality) {
            const courseModality = course.requirements?.modality?.toLowerCase() || 'presencial';
            if (filters.modality !== courseModality) {
                return false;
            }
        }

        return true;
    };

    // Filtrar cursos
    const filteredCourses = courses.filter(matchesFilters);

    return (
        <div className="overflow-hidden bg-white mx-auto max-w-7xl md:px-6 lg:px-8 pt-8" data-aos="fade-down">
            <h2 className="text-2xl font-semibold text-[#6C1313] ml-6">
                Cursos {totalCourses > 0 && `(${totalCourses})`}
            </h2>

            {loading && page === 1 && (
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
                            onClick={() => {
                                setPage(1);
                                loadCourses(filters.category, filters.search, 1, false);
                            }}
                            className="mt-2 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                        >
                            Reintentar
                        </button>
                    </div>
                </div>
            )}

            {!loading && !error && filteredCourses.length === 0 ? (
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
                                {filters.search ? 'Sin resultados' : (filters.category === 'Todos' || !filters.category ? 'Sin cursos disponibles' : 'Categoría sin cursos')}
                            </h3>
                            <p className="text-gray-500 text-sm leading-relaxed">
                                {filters.search
                                    ? `No encontramos cursos que coincidan con "${filters.search}".`
                                    : (filters.category === 'Todos' || !filters.category
                                        ? 'Actualmente no hay cursos disponibles.'
                                        : `No encontramos cursos para "${filters.category}".`)
                                }
                            </p>
                        </div>
                    </div>
                </div>
            ) : (
                !error && (
                    <>
                        <div className="mt-10 lg:m-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch h-auto">
                            {filteredCourses.map((course, index) => {
                                const isLastElement = index === filteredCourses.length - 1;
                                return (
                                    <div 
                                        data-aos="zoom-in" 
                                        key={course.id || index} 
                                        className="inline-block w-full px-6"
                                        ref={isLastElement ? lastCourseElementRef : null}
                                    >
                                        <CardCourse
                                            title={course.title}
                                            image={course.image}
                                            isOpen={course.isOpen}
                                            hours={course.hours}
                                            id={course.id}
                                        />
                                    </div>
                                );
                            })}
                        </div>
                        {loading && page > 1 && (
                            <div className="flex justify-center items-center mt-6 mb-6">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6C1313]"></div>
                                <span className="ml-3 text-[#6C1313]">Cargando más cursos...</span>
                            </div>
                        )}
                        {!hasMore && filteredCourses.length > 0 && (
                            <div className="text-center mt-6 mb-6 text-gray-500">
                                No hay más cursos disponibles
                            </div>
                        )}
                    </>
                )
            )}
        </div>
    )
}
