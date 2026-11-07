import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Squares2X2Icon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";
import CardCourse from "./CardCourse";
import { getCourses, getCoursesByCategory } from "../../api/courses";
import { getCategoriesEnabled } from "../../api/categories";
import { resolveImageUrl } from "../../utils/helpers";
import { useDashboardTheme } from "../../context/DashboardThemeContext";
import { gsap, useGSAP, prefersReducedMotion } from "../../utils/gsapConfig";

export default function CourseSection() {
  const navigate = useNavigate();
  const { isDark } = useDashboardTheme();

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState(0);
  const [categoriesApi, setCategoriesApi] = useState([]);

  const sectionRef = useRef(null);

  const loadCategories = async () => {
    try {
      const apiCats = await getCategoriesEnabled();
      const allCategories = [
        {
          id: 0,
          name: "Todos",
          svgurl: null,
        },
        ...apiCats,
      ];
      setCategoriesApi(allCategories);
    } catch (err) {
      console.error("Error loading categories:", err);
    }
  };

  const loadCourses = async (categoryId = null) => {
    try {
      setLoading(true);
      setError(null);

      // Obtener 3 cursos representativos para el home
      const data =
        categoryId && categoryId !== 0 && categoryId !== "Todos"
          ? await getCoursesByCategory(categoryId, 1, 3, "activo")
          : await getCourses(1, 3, "activo");

      const transformedCourses = (data.courses || []).map((course) => ({
        title: course.title,
        image: resolveImageUrl(course.course_image_detail),
        isOpen: course.status === "activo",
        hours: course.requirements?.hours?.total?.toString() || "0",
        description: course.description,
        id: course.id,
      }));

      setCourses(transformedCourses);
    } catch (err) {
      setError(err.message || "Error al cargar los cursos");
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = async (categoryId) => {
    if (activeCategory === categoryId) return;
    setActiveCategory(categoryId);
    await loadCourses(categoryId === 0 ? null : categoryId);
  };

  const handleViewMoreCourses = () => {
    navigate("/courses");
  };

  useEffect(() => {
    loadCategories();
    loadCourses();
  }, []);

  return (
    <div
      ref={sectionRef}
      className="bg-white dark:bg-[#121215] py-20 sm:py-28 transition-colors duration-200"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Cabecera de la sección */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between pb-8 border-b border-black/[0.06] dark:border-white/[0.06]">
          <div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
              Cursos y Categorías
            </h2>
            <p className="mt-2 text-sm sm:text-base text-zinc-600 dark:text-zinc-400 max-w-2xl">
              Explora nuestros programas académicos avalados por la Facultad de Ingeniería en Sistemas, Electrónica e Industrial.
            </p>
          </div>

          <button
            type="button"
            onClick={handleViewMoreCourses}
            className="hidden md:inline-flex items-center gap-2 text-sm font-bold text-[#00345e] dark:text-blue-400 hover:text-[#00223d] dark:hover:text-blue-300 transition-colors cursor-pointer"
          >
            <span>Ver catálogo completo</span>
            <ArrowRightIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Pestañas / Filtros de Categorías con Framer Motion */}
        <div className="mt-8 flex items-center gap-2.5 overflow-x-auto pb-3 scrollbar-hide">
          {categoriesApi.map((category) => {
            const isActive = activeCategory === category.id;
            return (
              <motion.button
                key={category.id}
                onClick={() => handleCategoryChange(category.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`relative inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap border shrink-0 ${
                  isActive
                    ? "bg-[#00345e] text-white border-[#00345e] shadow-md"
                    : isDark
                    ? "bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 border-white/[0.08]"
                    : "bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border-zinc-200"
                }`}
              >
                {category.svgurl ? (
                  <img
                    src={category.svgurl}
                    alt=""
                    className={`w-4 h-4 object-contain ${
                      isActive ? "brightness-0 invert" : ""
                    }`}
                  />
                ) : (
                  <Squares2X2Icon className="w-4 h-4" />
                )}
                <span>{category.name}</span>
              </motion.button>
            );
          })}
        </div>

        {/* Estado de carga */}
        {loading && (
          <div className="flex flex-col justify-center items-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-[#00345e] border-t-transparent"></div>
            <span className="mt-4 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              Cargando cursos...
            </span>
          </div>
        )}

        {/* Estado de error */}
        {error && !loading && (
          <div className="my-10 p-6 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-center max-w-lg mx-auto">
            <p className="text-sm font-semibold text-red-700 dark:text-red-300">
              {error}
            </p>
            <button
              onClick={() => loadCourses(activeCategory)}
              className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold text-xs rounded-xl transition-colors cursor-pointer shadow-xs"
            >
              Reintentar
            </button>
          </div>
        )}

        {/* Grilla de Cursos con Framer Motion */}
        {!loading && !error && courses.length > 0 && (
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 items-stretch">
            <AnimatePresence mode="popLayout">
              {courses.map((course, index) => (
                <motion.div
                  key={course.id || index}
                  layout
                  initial={{ opacity: 0, y: 20, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4, delay: index * 0.08, ease: "easeOut" }}
                  className="h-full"
                >
                  <CardCourse
                    title={course.title}
                    image={course.image}
                    isOpen={course.isOpen}
                    hours={course.hours}
                    id={course.id}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Estado vacío si no hay cursos en la categoría */}
        {!loading && !error && courses.length === 0 && (
          <div className="py-20 text-center max-w-md mx-auto">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400">
              <Squares2X2Icon className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              Sin cursos en esta categoría
            </h3>
            <p className="mt-1.5 text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
              Actualmente no hay programas abiertos para esta especialidad. Te invitamos a revisar las demás categorías.
            </p>
            <button
              type="button"
              onClick={() => handleCategoryChange(0)}
              className="mt-5 px-5 py-2.5 rounded-xl font-semibold text-xs text-white bg-[#00345e] hover:bg-[#002747] transition-all cursor-pointer shadow-xs"
            >
              Ver todos los cursos
            </button>
          </div>
        )}

        {/* Botón inferior para móviles y CTA visible */}
        <div className="mt-12 text-center md:hidden">
          <button
            type="button"
            onClick={handleViewMoreCourses}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-white bg-[#00345e] hover:bg-[#002747] transition-all shadow-md cursor-pointer"
          >
            <span>Ver catálogo completo</span>
            <ArrowRightIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
