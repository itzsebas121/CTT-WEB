import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Squares2X2Icon,
  ArrowRightIcon,
  AcademicCapIcon,
  BookOpenIcon,
  CalendarDaysIcon,
  MapPinIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import CardCourse from "./CardCourse";
import { getCourses, getCoursesByCategory } from "../../api/courses";
import { getCategoriesEnabled } from "../../api/categories";
import { getCongresses } from "../../api/congresses";
import { resolveImageUrl } from "../../utils/helpers";
import { useDashboardTheme } from "../../context/DashboardThemeContext";
import { gsap, useGSAP, prefersReducedMotion } from "../../utils/gsapConfig";

export default function CourseSection() {
  const navigate = useNavigate();
  const { isDark } = useDashboardTheme();

  // Pestaña principal: "cursos" | "congresos"
  const [activeTab, setActiveTab] = useState("cursos");

  // Estado de Cursos
  const [courses, setCourses] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [coursesError, setCoursesError] = useState(null);
  const [activeCategory, setActiveCategory] = useState(0);
  const [categoriesApi, setCategoriesApi] = useState([]);

  // Estado de Congresos
  const [congresses, setCongresses] = useState([]);
  const [congressesLoading, setCongressesLoading] = useState(false);
  const [congressesError, setCongressesError] = useState(null);

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
      setCoursesLoading(true);
      setCoursesError(null);

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
      setCoursesError(err.message || "Error al cargar los cursos");
    } finally {
      setCoursesLoading(false);
    }
  };

  const loadCongresses = async () => {
    try {
      setCongressesLoading(true);
      setCongressesError(null);

      // Obtener 3 congresos representativos
      const res = await getCongresses({
        page: 1,
        pageSize: 3,
        orderBy: "fecha_inicio",
        orderDesc: true,
      });

      const list = Array.isArray(res)
        ? res
        : res?.congresses || res?.data?.congresses || res?.data || [];

      setCongresses(list.slice(0, 3));
    } catch (err) {
      setCongressesError(err.message || "Error al cargar los congresos");
    } finally {
      setCongressesLoading(false);
    }
  };

  const handleCategoryChange = async (categoryId) => {
    if (activeCategory === categoryId) return;
    setActiveCategory(categoryId);
    await loadCourses(categoryId === 0 ? null : categoryId);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === "congresos" && congresses.length === 0) {
      loadCongresses();
    }
  };

  const formatDateRange = (start, end) => {
    if (!start && !end) return "Fecha por definir";
    try {
      const s = start
        ? new Date(start + "T00:00:00").toLocaleDateString("es-ES", {
            day: "numeric",
            month: "short",
          })
        : "";
      const e = end
        ? new Date(end + "T00:00:00").toLocaleDateString("es-ES", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })
        : "";
      return s && e ? `${s} - ${e}` : s || e;
    } catch {
      return `${start} - ${end}`;
    }
  };

  useEffect(() => {
    loadCategories();
    loadCourses();
  }, []);

  return (
    <div
      ref={sectionRef}
      className="bg-white dark:bg-[#121215] py-16 sm:py-24 transition-colors duration-200"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Cabecera de la sección (limpia, sin cápsulas decorativas sobre el título según AGENTS.md) */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between pb-6 border-b border-black/[0.06] dark:border-white/[0.06] gap-4">
          <div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
              Oferta Académica y Eventos
            </h2>
            <p className="mt-2 text-sm sm:text-base text-zinc-600 dark:text-zinc-400 max-w-2xl">
              Cursos de capacitación profesional continua y congresos científicos internacionales de la FISEI UTA.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate(activeTab === "cursos" ? "/courses" : "/events")}
            className="hidden md:inline-flex items-center gap-2 text-sm font-bold text-[#00345e] dark:text-sky-400 hover:text-[#00223d] dark:hover:text-sky-300 transition-colors cursor-pointer"
          >
            <span>{activeTab === "cursos" ? "Ver todos los cursos" : "Ver todos los congresos"}</span>
            <ArrowRightIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Selector de Pestañas Interactivas (Cursos / Congresos) */}
        <div className="mt-8 flex items-center gap-3">
          <button
            type="button"
            onClick={() => handleTabChange("cursos")}
            className={`inline-flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${
              activeTab === "cursos"
                ? "bg-[#00345e] text-white shadow-md"
                : isDark
                ? "bg-zinc-800/80 text-zinc-300 hover:bg-zinc-700"
                : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
            }`}
          >
            <BookOpenIcon className="w-4 h-4" />
            <span>Cursos de Capacitación</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange("congresos")}
            className={`inline-flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${
              activeTab === "congresos"
                ? "bg-[#00345e] text-white shadow-md"
                : isDark
                ? "bg-zinc-800/80 text-zinc-300 hover:bg-zinc-700"
                : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
            }`}
          >
            <AcademicCapIcon className="w-4 h-4" />
            <span>Congresos y Simposios</span>
          </button>
        </div>

        {/* ── Sub-filtros de categorías (Solo cuando está en Cursos) ───── */}
        {activeTab === "cursos" && (
          <div className="mt-6 flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-hide">
            {categoriesApi.map((category) => {
              const isActive = activeCategory === category.id;
              return (
                <motion.button
                  key={category.id}
                  onClick={() => handleCategoryChange(category.id)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`relative inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap border shrink-0 ${
                    isActive
                      ? "bg-[#00345e] text-white border-[#00345e] shadow-sm"
                      : isDark
                      ? "bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 border-white/[0.08]"
                      : "bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border-zinc-200"
                  }`}
                >
                  {category.svgurl ? (
                    <img
                      src={category.svgurl}
                      alt=""
                      className={`w-3.5 h-3.5 object-contain ${
                        isActive ? "brightness-0 invert" : ""
                      }`}
                    />
                  ) : (
                    <Squares2X2Icon className="w-3.5 h-3.5" />
                  )}
                  <span>{category.name}</span>
                </motion.button>
              );
            })}
          </div>
        )}

        {/* ── CONTENIDO: CURSOS ───────────────────────────────────────── */}
        {activeTab === "cursos" && (
          <>
            {coursesLoading && (
              <div className="flex flex-col justify-center items-center py-20">
                <div className="animate-spin rounded-full h-10 w-10 border-2 border-[#00345e] border-t-transparent"></div>
                <span className="mt-4 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Cargando cursos destacados...
                </span>
              </div>
            )}

            {coursesError && !coursesLoading && (
              <div className="my-10 p-6 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-center max-w-lg mx-auto">
                <p className="text-sm font-semibold text-red-700 dark:text-red-300">
                  {coursesError}
                </p>
                <button
                  onClick={() => loadCourses(activeCategory)}
                  className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold text-xs rounded-xl transition-colors cursor-pointer shadow-xs"
                >
                  Reintentar
                </button>
              </div>
            )}

            {!coursesLoading && !coursesError && courses.length > 0 && (
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 items-stretch">
                <AnimatePresence mode="popLayout">
                  {courses.map((course, index) => (
                    <motion.div
                      key={course.id || index}
                      layout
                      initial={{ opacity: 0, y: 20, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.35, delay: index * 0.06, ease: "easeOut" }}
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
          </>
        )}

        {/* ── CONTENIDO: CONGRESOS ────────────────────────────────────── */}
        {activeTab === "congresos" && (
          <>
            {congressesLoading && (
              <div className="flex flex-col justify-center items-center py-20">
                <div className="animate-spin rounded-full h-10 w-10 border-2 border-[#00345e] border-t-transparent"></div>
                <span className="mt-4 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Cargando congresos internacionales...
                </span>
              </div>
            )}

            {congressesError && !congressesLoading && (
              <div className="my-10 p-6 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-center max-w-lg mx-auto">
                <p className="text-sm font-semibold text-red-700 dark:text-red-300">
                  {congressesError}
                </p>
                <button
                  onClick={loadCongresses}
                  className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold text-xs rounded-xl transition-colors cursor-pointer shadow-xs"
                >
                  Reintentar
                </button>
              </div>
            )}

            {!congressesLoading && !congressesError && congresses.length > 0 && (
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 items-stretch">
                <AnimatePresence mode="popLayout">
                  {congresses.map((c, index) => {
                    const cid = c.id_congreso || c.id;
                    return (
                      <motion.div
                        key={cid || index}
                        layout
                        initial={{ opacity: 0, y: 20, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.35, delay: index * 0.06, ease: "easeOut" }}
                        className={`group flex flex-col rounded-2xl border overflow-hidden transition-all duration-200 hover:shadow-lg ${
                          isDark
                            ? "bg-zinc-900/80 border-zinc-800 hover:border-zinc-700"
                            : "bg-white border-zinc-200 hover:border-zinc-300"
                        }`}
                      >
                        {/* Portada */}
                        <div className="relative h-44 overflow-hidden bg-zinc-800">
                          <img
                            src={resolveImageUrl(c.imagen_portada || c.foto_portada)}
                            alt={c.nombre}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            onError={(e) => {
                              e.target.src =
                                "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=600&q=80";
                            }}
                          />
                          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                            <span className="px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider bg-[#00345e] text-white shadow">
                              Congreso Internacional
                            </span>
                            {c.anio && (
                              <span className="px-2 py-1 rounded-lg text-xs font-bold bg-amber-500 text-zinc-950 shadow">
                                {c.anio}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Contenido */}
                        <div className="flex-1 p-5 flex flex-col justify-between space-y-4">
                          <div>
                            <h3
                              className={`text-base font-bold line-clamp-2 transition-colors ${
                                isDark
                                  ? "text-zinc-100 group-hover:text-sky-400"
                                  : "text-zinc-900 group-hover:text-[#00345e]"
                              }`}
                            >
                              {c.nombre}
                            </h3>
                            <p
                              className={`mt-2 text-xs line-clamp-2 leading-relaxed ${
                                isDark ? "text-zinc-400" : "text-zinc-600"
                              }`}
                            >
                              {c.descripcion ||
                                "Encuentro de divulgación científica con ponencias indexadas y conferencistas internacionales."}
                            </p>
                          </div>

                          <div className="space-y-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                            <div className="space-y-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                              <div className="flex items-center gap-1.5 font-medium">
                                <CalendarDaysIcon className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                                <span>{formatDateRange(c.fecha_inicio, c.fecha_fin)}</span>
                              </div>
                              <div className="flex items-center gap-1.5 font-medium">
                                <MapPinIcon className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                                <span className="line-clamp-1">{c.lugar || "Campus Huachi, Ambato"}</span>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => navigate(`/congreso/${cid}`)}
                              className="w-full py-2.5 px-4 rounded-xl bg-[#00345e] hover:bg-[#002847] text-white text-xs font-bold shadow-sm transition-colors active:scale-95 flex items-center justify-center gap-1.5"
                            >
                              <span>Ver Congreso y Programa</span>
                              <ArrowRightIcon className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </>
        )}

        {/* Botón inferior móvil */}
        <div className="mt-10 text-center md:hidden">
          <button
            type="button"
            onClick={() => navigate(activeTab === "cursos" ? "/courses" : "/events")}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-white bg-[#00345e] hover:bg-[#002747] transition-all shadow-md cursor-pointer"
          >
            <span>{activeTab === "cursos" ? "Ver catálogo de cursos" : "Ver catálogo de congresos"}</span>
            <ArrowRightIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
