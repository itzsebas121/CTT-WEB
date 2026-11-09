import { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  ArrowLeftIcon,
  CalendarDaysIcon,
  ClockIcon,
  MapPinIcon,
  UserGroupIcon,
  AcademicCapIcon,
  BuildingOffice2Icon,
  ExclamationTriangleIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  GlobeAltIcon,
  DocumentTextIcon,
  TagIcon,
  ShareIcon,
  QrCodeIcon,
  DocumentArrowUpIcon,
  VideoCameraIcon,
  StarIcon,
  ArrowDownTrayIcon,
} from "@heroicons/react/24/outline";
import { getCongressById } from "../api/congresses";
import { getUserEnrollments, enrollInCongress } from "../api/inscripciones";
import { getUser } from "../utils/auth";
import { resolveImageUrl } from "../utils/helpers";
import { useDashboardTheme } from "../context/DashboardThemeContext";
import { EnrollmentModal, PaymentReceiptModal, ReviewsSection } from "../components/ui";
import SurveyModal from "../components/ui/SurveyModal";

export default function CongressDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isDark } = useDashboardTheme();

  const isDashboard = location.pathname.startsWith("/dashboard");

  const [congress, setCongress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("vision"); // "vision" | "cronograma" | "ponentes" | "patrocinadores"
  const [selectedDay, setSelectedDay] = useState("all");

  const user = getUser();
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [userEnrollment, setUserEnrollment] = useState(null);
  const [enrolling, setEnrolling] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [enrollmentData, setEnrollmentData] = useState(null);
  const [enrollmentError, setEnrollmentError] = useState(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [isSurveyModalOpen, setIsSurveyModalOpen] = useState(false);

  // Estados para Call for Papers (CFP)
  const [paperTitle, setPaperTitle] = useState("");
  const [paperAbstract, setPaperAbstract] = useState("");
  const [paperTrack, setPaperTrack] = useState("Inteligencia Artificial y Modelos Fundacionales");
  const [paperKeywords, setPaperKeywords] = useState("");
  const [paperFileUrl, setPaperFileUrl] = useState("");
  const [paperSubmitting, setPaperSubmitting] = useState(false);
  const [paperSuccess, setPaperSuccess] = useState(null);
  const [paperError, setPaperError] = useState(null);
  const [downloadingRide, setDownloadingRide] = useState(false);
  const [surveyCompleted, setSurveyCompleted] = useState(false);

  const handleDownloadRide = async () => {
    if (!userEnrollment?.id) return;
    try {
      setDownloadingRide(true);
      const token = localStorage.getItem("token");
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3002/api/v1";
      const downloadUrl = `${apiUrl}/enrollments/${userEnrollment.id}/ride/download`;

      const res = await fetch(downloadUrl, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (!res.ok) {
        throw new Error("No se pudo descargar el comprobante RIDE oficial.");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `RIDE_UTA_CONGRESO_${userEnrollment.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      alert(err.message || "Error al descargar comprobante RIDE");
    } finally {
      setDownloadingRide(false);
    }
  };

  const handlePaperSubmit = async (e) => {
    e.preventDefault();
    setPaperSubmitting(true);
    setPaperError(null);
    setPaperSuccess(null);

    try {
      const API_URL = import.meta.env.VITE_API_URL;
      const token = localStorage.getItem("token");

      const payload = {
        title: paperTitle.trim(),
        abstract: paperAbstract.trim(),
        track: paperTrack,
        keywords: paperKeywords.trim(),
        file_url: paperFileUrl.trim(),
        id_user_platform: user?.id || null,
      };

      const res = await fetch(`${API_URL}/congresses/${id}/papers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        let msg = "Error al enviar el artículo científico.";
        try {
          const data = await res.json();
          if (data?.detail) msg = data.detail;
        } catch {}
        throw new Error(msg);
      }

      setPaperSuccess("¡Artículo científico enviado con éxito! El comité editorial evaluará su postulación.");
      setPaperTitle("");
      setPaperAbstract("");
      setPaperKeywords("");
      setPaperFileUrl("");
    } catch (err) {
      setPaperError(err.message || "Error al enviar artículo.");
    } finally {
      setPaperSubmitting(false);
    }
  };

  // Verificar inscripción previa si el usuario está autenticado
  const checkEnrollment = async () => {
    if (!user?.id || !id) return;
    try {
      const res = await getUserEnrollments(user.id);
      const enrollments = res?.enrollments || res?.data || [];
      const found = enrollments.find(
        (e) => String(e.id_congress) === String(id)
      );
      if (found) {
        setIsEnrolled(true);
        setUserEnrollment(found);
      } else {
        setIsEnrolled(false);
        setUserEnrollment(null);
      }
    } catch {
      // En caso de sesión expirada o sin permisos, continuar sin romper la vista
    }
  };

  useEffect(() => {
    checkEnrollment();
  }, [user?.id, id]);

  const isPaidAttendee = useMemo(() => {
    if (!isEnrolled || !userEnrollment) return false;
    const st = (userEnrollment.status || "").toUpperCase();
    return st === "PAGADO" || st === "FACTURADO";
  }, [isEnrolled, userEnrollment]);

  const cupoMaximo = Number(congress?.cupo_maximo || 250);
  const inscritos = Number(congress?.inscritos ?? congress?.total_inscritos ?? congress?.total_enrolled ?? 0);
  const capacityPercentage = cupoMaximo > 0 ? Math.min(Math.round((inscritos / cupoMaximo) * 100), 100) : 0;
  const isQuotaExceeded = cupoMaximo > 0 && inscritos >= cupoMaximo;

  const isCongressPast = useMemo(() => {
    if (!congress?.fecha_fin) return false;
    try {
      const end = new Date(congress.fecha_fin + "T23:59:59");
      return end < new Date();
    } catch {
      return false;
    }
  }, [congress?.fecha_fin]);

  // Cargar datos completos del congreso
  useEffect(() => {
    const parsedId = parseInt(id, 10);
    if (!id || id === "null" || id === "undefined" || isNaN(parsedId) || parsedId <= 0) {
      setLoading(false);
      setError("Identificador de congreso inválido o no especificado.");
      return;
    }

    const loadCongress = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getCongressById(parsedId);
        setCongress(data);
      } catch (err) {
        setError(err.message || "Error al cargar la información del congreso.");
      } finally {
        setLoading(false);
      }
    };

    loadCongress();
  }, [id]);

  const handleGoBack = () => {
    if (location.key !== "default") {
      navigate(-1);
    } else if (isDashboard) {
      navigate("/dashboard/oferta?tab=congresos");
    } else {
      navigate("/events");
    }
  };

  const handleEnroll = async () => {
    if (!user?.id) {
      navigate("/login");
      return;
    }
    try {
      setEnrolling(true);
      setEnrollmentError(null);
      const res = await enrollInCongress(user.id, id);
      setEnrollmentData(res);
      setIsEnrolled(true);
      setIsModalOpen(true);
    } catch (err) {
      setEnrollmentError(err.message);
      setIsModalOpen(true);
    } finally {
      setEnrolling(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "Por definir";
    try {
      const d = new Date(dateStr + "T00:00:00");
      return isNaN(d.getTime())
        ? dateStr
        : d.toLocaleDateString("es-ES", {
            weekday: "short",
            year: "numeric",
            month: "short",
            day: "numeric",
          });
    } catch {
      return dateStr;
    }
  };

  const posterUrl = congress?.poster_cover_url
    ? resolveImageUrl(congress.poster_cover_url)
    : null;

  const rawSessions = congress?.sesiones || congress?.sessions || [];
  const rawSpeakers = congress?.speakers || [];
  const rawSponsors = congress?.sponsors || [];

  // Agrupar sesiones por fecha única para el selector de días
  const sessionDays = useMemo(() => {
    const set = new Set();
    rawSessions.forEach((s) => {
      if (s.fecha) set.add(s.fecha);
    });
    return Array.from(set).sort();
  }, [rawSessions]);

  // Filtrar sesiones según el día seleccionado
  const filteredSessions = useMemo(() => {
    if (selectedDay === "all") return rawSessions;
    return rawSessions.filter((s) => s.fecha === selectedDay);
  }, [rawSessions, selectedDay]);

  // Agrupar patrocinadores por categoría
  const sponsorsByCategory = useMemo(() => {
    const groups = {
      platino: [],
      oro: [],
      plata: [],
      bronce: [],
      colaborador: [],
    };
    rawSponsors.forEach((sp) => {
      const cat = String(sp.categoria || "colaborador").toLowerCase().trim();
      if (groups[cat]) {
        groups[cat].push(sp);
      } else {
        groups.colaborador.push(sp);
      }
    });
    return groups;
  }, [rawSponsors]);

  // Skeleton de carga
  if (loading) {
    return (
      <div className="w-full max-w-7xl mx-auto space-y-6 animate-pulse py-6">
        <div className="flex justify-between items-center pb-3 border-b border-black/[0.06] dark:border-white/[0.06]">
          <div className="h-8 w-32 rounded-lg bg-black/[0.06] dark:bg-white/[0.06]" />
          <div className="h-6 w-24 rounded-md bg-black/[0.06] dark:bg-white/[0.06]" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="h-80 rounded-xl bg-black/[0.04] dark:bg-white/[0.03]" />
            <div className="h-44 rounded-xl bg-black/[0.04] dark:bg-white/[0.03]" />
          </div>
          <div className="lg:col-span-1 space-y-4">
            <div className="h-64 rounded-xl bg-black/[0.04] dark:bg-white/[0.03]" />
            <div className="h-36 rounded-xl bg-black/[0.04] dark:bg-white/[0.03]" />
          </div>
        </div>
      </div>
    );
  }

  // Estado de error
  if (error || !congress) {
    return (
      <div className="w-full max-w-xl mx-auto py-16 px-4 text-center">
        <div
          className={`rounded-xl p-8 border transition-colors ${
            isDark
              ? "bg-[#16161a] border-white/[0.08] shadow-xl"
              : "bg-white border-black/[0.08] shadow-md"
          }`}
        >
          <div className="w-12 h-12 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center mx-auto mb-3 font-bold text-xl">
            <ExclamationTriangleIcon className="w-6 h-6" />
          </div>
          <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white mb-1.5">
            Congreso no encontrado o no disponible
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-5">
            {error || "El congreso solicitado no está registrado en el catálogo oficial."}
          </p>
          <button
            type="button"
            onClick={handleGoBack}
            className="px-4 py-2 rounded-lg text-xs font-semibold bg-[#00345e] hover:bg-[#002747] text-white cursor-pointer transition-colors"
          >
            ← Volver al Catálogo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`w-full max-w-7xl mx-auto space-y-5 ${
        !isDashboard ? "px-4 sm:px-6 lg:px-8 py-6" : ""
      }`}
    >
      {/* Barra Superior de Retorno y Estado */}
      <div className="flex items-center justify-between pb-3 border-b border-black/[0.06] dark:border-white/[0.06]">
        <button
          type="button"
          onClick={handleGoBack}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer border ${
            isDark
              ? "bg-[#16161a] hover:bg-zinc-800 text-zinc-300 hover:text-white border-white/[0.08]"
              : "bg-white hover:bg-zinc-50 text-zinc-700 hover:text-[#00345e] border-black/[0.08]"
          }`}
        >
          <ArrowLeftIcon className="h-3.5 w-3.5 text-[#00345e] dark:text-blue-400" />
          <span>Volver</span>
        </button>

        <div className="flex items-center gap-2">
          {isEnrolled && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
              <CheckCircleIcon className="w-3.5 h-3.5" />
              <span>Inscrito Oficial</span>
            </span>
          )}
          <span className="text-xs font-mono text-zinc-400">
            ID #{congress.id_congreso || congress.id}
          </span>
        </div>
      </div>

      {/* Grid Principal de 2 Columnas (Estilo Notion / Dokploy) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
        {/* Columna Izquierda (2/3): Hero, Pestañas y Contenido */}
        <div className="lg:col-span-2 space-y-4">
          {/* Tarjeta Hero del Congreso */}
          <div
            className={`rounded-xl border overflow-hidden transition-colors shadow-2xs ${
              isDark ? "bg-[#16161a] border-white/[0.08]" : "bg-white border-black/[0.08]"
            }`}
          >
            {/* Afiche / Portada Panorámica */}
            <div className="relative w-full h-56 sm:h-72 bg-zinc-900 overflow-hidden">
              {posterUrl ? (
                <img
                  src={posterUrl}
                  alt={congress.nombre}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src =
                      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&auto=format&fit=crop&q=80";
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#00345e] to-zinc-900 text-white/40">
                  <AcademicCapIcon className="w-16 h-16" />
                </div>
              )}

              {/* Overlay oscuro para lectura nítida */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-4 sm:p-6 text-white">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-[#00345e] text-white border border-white/20 uppercase tracking-wider">
                    {congress.edicion ? `Edición ${congress.edicion}` : "Congreso Internacional"}
                  </span>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-white/20 backdrop-blur-md text-white">
                    Año {congress.anio || 2026}
                  </span>
                </div>

                <h1 className="text-lg sm:text-2xl font-bold tracking-tight leading-snug">
                  {congress.nombre}
                </h1>
              </div>
            </div>

            {/* Metadatos Clave en Barra Horizontal */}
            <div className="p-3.5 sm:p-4 grid grid-cols-2 sm:grid-cols-4 gap-2.5 border-t border-black/[0.04] dark:border-white/[0.06] bg-zinc-50/50 dark:bg-white/[0.01]">
              <div>
                <span className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider block">
                  Fecha Apertura
                </span>
                <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 block truncate">
                  {formatDate(congress.fecha_inicio)}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider block">
                  Fecha Clausura
                </span>
                <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 block truncate">
                  {formatDate(congress.fecha_fin)}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider block">
                  Sesiones
                </span>
                <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 block">
                  {rawSessions.length} programadas
                </span>
              </div>
              <div>
                <span className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider block">
                  Ponentes
                </span>
                <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 block">
                  {rawSpeakers.length > 0 ? `${rawSpeakers.length} confirmados` : "Por anunciar"}
                </span>
              </div>
            </div>
          </div>

          {/* Selector de Pestañas Interactivas (Notion Style) */}
          <div className="flex rounded-xl border border-black/[0.08] dark:border-white/[0.08] p-1 bg-white dark:bg-[#16161a] overflow-x-auto gap-1">
            <button
              type="button"
              onClick={() => setActiveTab("vision")}
              className={`flex-1 min-w-[120px] py-1.5 px-3 rounded-lg text-xs font-semibold transition cursor-pointer text-center ${
                activeTab === "vision"
                  ? "bg-[#00345e] text-white shadow-xs"
                  : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/[0.04]"
              }`}
            >
              Visión General
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("cronograma")}
              className={`flex-1 min-w-[120px] py-1.5 px-3 rounded-lg text-xs font-semibold transition cursor-pointer text-center ${
                activeTab === "cronograma"
                  ? "bg-[#00345e] text-white shadow-xs"
                  : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/[0.04]"
              }`}
            >
              Cronograma ({rawSessions.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("ponentes")}
              className={`flex-1 min-w-[120px] py-1.5 px-3 rounded-lg text-xs font-semibold transition cursor-pointer text-center ${
                activeTab === "ponentes"
                  ? "bg-[#00345e] text-white shadow-xs"
                  : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/[0.04]"
              }`}
            >
              Ponentes ({rawSpeakers.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("patrocinadores")}
              className={`flex-1 min-w-[120px] py-1.5 px-3 rounded-lg text-xs font-semibold transition cursor-pointer text-center ${
                activeTab === "patrocinadores"
                  ? "bg-[#00345e] text-white shadow-xs"
                  : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/[0.04]"
              }`}
            >
              Auspiciantes ({rawSponsors.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("cfp")}
              className={`flex-1 min-w-[140px] py-1.5 px-3 rounded-lg text-xs font-semibold transition cursor-pointer text-center whitespace-nowrap ${
                activeTab === "cfp"
                  ? "bg-[#00345e] text-white shadow-xs"
                  : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/[0.04]"
              }`}
            >
              Call for Papers (CFP)
            </button>
          </div>

          {/* CONTENIDO DE PESTAÑAS */}

          {/* 1. VISIÓN GENERAL */}
          {activeTab === "vision" && (
            <div className="space-y-4">
              {/* Descripción Académica */}
              <div
                className={`rounded-xl border p-4 sm:p-5 transition-colors shadow-2xs ${
                  isDark ? "bg-[#16161a] border-white/[0.08]" : "bg-white border-black/[0.08]"
                }`}
              >
                <h3 className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider mb-2">
                  Alcance Académico y Justificación
                </h3>
                <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-line">
                  {congress.descripcion_general ||
                    "El congreso reúne a investigadores, docentes y expertos de la industria para difundir los avances científicos, metodologías innovadoras y casos de estudio aplicados a la ingeniería y la tecnología."}
                </p>
              </div>

              {/* Ejes Temáticos y Líneas de Investigación */}
              <div
                className={`rounded-xl border p-4 sm:p-5 transition-colors shadow-2xs ${
                  isDark ? "bg-[#16161a] border-white/[0.08]" : "bg-white border-black/[0.08]"
                }`}
              >
                <h3 className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider mb-2.5">
                  Líneas de Investigación y Ejes Temáticos
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    "Inteligencia Artificial y Modelos Fundacionales",
                    "Ciberseguridad y Redes de Comunicación",
                    "Arquitecturas de Software y Cloud Computing",
                    "Robótica, Automatización y Sistemas Embebidos",
                  ].map((track, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 p-2.5 rounded-lg border border-black/[0.04] dark:border-white/[0.04] bg-zinc-50/70 dark:bg-white/[0.02] text-xs text-zinc-800 dark:text-zinc-200"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00345e] dark:bg-blue-400 shrink-0" />
                      <span>{track}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Certificación Oficial */}
              <div
                className={`rounded-xl border p-4 sm:p-5 transition-colors shadow-2xs ${
                  isDark ? "bg-[#16161a] border-white/[0.08]" : "bg-white border-black/[0.08]"
                }`}
              >
                <div className="flex items-start gap-3">
                  <AcademicCapIcon className="w-5 h-5 text-[#00345e] dark:text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider">
                      Certificación Oficial Avalada por la UTA
                    </h3>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 leading-relaxed">
                      Los participantes que cumplan con la asistencia requerida recibirán un
                      certificado de aprobación con código de validación QR y registro institucional emitido por el Centro de Transferencia y Desarrollo de Tecnologías (CTT-FISEI).
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2. CRONOGRAMA Y SESIONES */}
          {activeTab === "cronograma" && (
            <div className="space-y-3.5">
              {/* Filtro de días */}
              {sessionDays.length > 1 && (
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                  <button
                    type="button"
                    onClick={() => setSelectedDay("all")}
                    className={`px-3 py-1 rounded-md text-xs font-semibold transition cursor-pointer ${
                      selectedDay === "all"
                        ? "bg-[#00345e] text-white"
                        : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300"
                    }`}
                  >
                    Todos los días ({rawSessions.length})
                  </button>
                  {sessionDays.map((day, idx) => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => setSelectedDay(day)}
                      className={`px-3 py-1 rounded-md text-xs font-semibold transition cursor-pointer whitespace-nowrap ${
                        selectedDay === day
                          ? "bg-[#00345e] text-white"
                          : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300"
                      }`}
                    >
                      Día {idx + 1}: {formatDate(day)}
                    </button>
                  ))}
                </div>
              )}

              {filteredSessions.length > 0 ? (
                <div className="space-y-2.5">
                  {filteredSessions.map((sess, idx) => (
                    <div
                      key={sess.id_sesion || idx}
                      className={`rounded-xl border p-3.5 sm:p-4 transition-all shadow-2xs ${
                        isDark ? "bg-[#16161a] border-white/[0.08]" : "bg-white border-black/[0.08]"
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
                        <div className="space-y-1">
                          <span className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-white block">
                            {sess.titulo_sesion}
                          </span>
                          {sess.lugar && (
                            <span className="inline-flex items-center gap-1 text-[11px] text-zinc-500 dark:text-zinc-400">
                              <MapPinIcon className="w-3.5 h-3.5" />
                              <span>{sess.lugar}</span>
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5 self-start sm:self-auto shrink-0">
                          {sess.jornada && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-[#00345e]/10 dark:bg-blue-400/20 text-[#00345e] dark:text-blue-300">
                              {sess.jornada}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-500 dark:text-zinc-400 pt-1 border-t border-black/[0.04] dark:border-white/[0.04]">
                        <span className="inline-flex items-center gap-1.5 font-medium text-zinc-700 dark:text-zinc-300">
                          <ClockIcon className="w-3.5 h-3.5 text-[#00345e] dark:text-blue-400" />
                          <span>
                            {sess.hora_inicio || "09:00"} — {sess.hora_fin || "10:30"}
                          </span>
                        </span>
                        {sess.fecha && (
                          <span className="inline-flex items-center gap-1.5">
                            <CalendarDaysIcon className="w-3.5 h-3.5" />
                            <span>{formatDate(sess.fecha)}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 px-4 rounded-xl border border-dashed border-black/[0.12] dark:border-white/[0.12] bg-zinc-50/40 dark:bg-white/[0.01]">
                  <CalendarDaysIcon className="w-8 h-8 text-zinc-300 dark:text-zinc-600 mx-auto mb-1.5" />
                  <p className="text-xs text-zinc-400">
                    No hay sesiones programadas para este filtro.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* 3. PONENTES Y EXPOSITORES */}
          {activeTab === "ponentes" && (
            <div>
              {rawSpeakers.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {rawSpeakers.map((spk, idx) => (
                    <div
                      key={spk.id_speaker || idx}
                      className={`p-3.5 rounded-xl border transition-colors flex items-start gap-3 shadow-2xs ${
                        isDark ? "bg-[#16161a] border-white/[0.08]" : "bg-white border-black/[0.08]"
                      }`}
                    >
                      <div className="w-10 h-10 rounded-lg bg-[#00345e] text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
                        {(spk.nombres_completos || "P")[0]}
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="text-xs font-bold text-zinc-900 dark:text-white block truncate">
                          {spk.nombres_completos}
                        </span>
                        {spk.titulo_academico && (
                          <span className="text-[11px] text-[#00345e] dark:text-blue-300 block truncate font-medium">
                            {spk.titulo_academico}
                          </span>
                        )}
                        {spk.institucion && (
                          <span className="text-[11px] text-zinc-500 dark:text-zinc-400 block truncate">
                            {spk.institucion}
                          </span>
                        )}
                        {spk.pais && (
                          <span className="text-[10px] text-zinc-400 block mt-0.5">
                            📍 {spk.pais}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 px-4 rounded-xl border border-dashed border-black/[0.12] dark:border-white/[0.12] bg-zinc-50/40 dark:bg-white/[0.01]">
                  <UserGroupIcon className="w-8 h-8 text-zinc-300 dark:text-zinc-600 mx-auto mb-1.5" />
                  <p className="text-xs text-zinc-400">
                    Los expositores de este congreso se publicarán próximamente.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* 4. PATROCINADORES Y AUSPICIOS */}
          {activeTab === "patrocinadores" && (
            <div className="space-y-4">
              {rawSponsors.length > 0 ? (
                Object.entries(sponsorsByCategory).map(([cat, list]) => {
                  if (list.length === 0) return null;
                  return (
                    <div
                      key={cat}
                      className={`rounded-xl border p-4 transition-colors shadow-2xs ${
                        isDark ? "bg-[#16161a] border-white/[0.08]" : "bg-white border-black/[0.08]"
                      }`}
                    >
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#00345e] dark:text-blue-300 mb-3">
                        Categoría {cat} ({list.length})
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {list.map((sp, idx) => (
                          <div
                            key={idx}
                            className="p-2.5 rounded-lg border border-black/[0.04] dark:border-white/[0.04] bg-zinc-50/50 dark:bg-white/[0.02] flex items-center justify-between"
                          >
                            <span className="text-xs font-semibold text-zinc-900 dark:text-white truncate">
                              {sp.sponsor_name || sp.nombre || "Empresa Auspiciante"}
                            </span>
                            {sp.aporte && (
                              <span className="text-[11px] font-mono text-zinc-400">
                                ${Number(sp.aporte).toLocaleString()} USD
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-10 px-4 rounded-xl border border-dashed border-black/[0.12] dark:border-white/[0.12] bg-zinc-50/40 dark:bg-white/[0.01]">
                  <BuildingOffice2Icon className="w-8 h-8 text-zinc-300 dark:text-zinc-600 mx-auto mb-1.5" />
                  <p className="text-xs text-zinc-400">
                    Sin patrocinadores registrados para este evento.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* 5. CALL FOR PAPERS (CFP) */}
          {activeTab === "cfp" && (
            <div className="space-y-4">
              <div
                className={`rounded-xl border p-4 sm:p-5 transition-colors shadow-2xs ${
                  isDark ? "bg-[#16161a] border-white/[0.08]" : "bg-white border-black/[0.08]"
                }`}
              >
                <div className="pb-3 border-b border-black/[0.06] dark:border-white/[0.06] mb-4">
                  <h3 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-white">
                    Convocatoria de Artículos Científicos (Call for Papers)
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
                    Invitamos a investigadores, docentes y profesionales a postular sus manuscritos científicos. Los trabajos aceptados por el comité académico serán presentados y sus autores accederán a la tarifa preferencial de Ponente ($80).
                  </p>
                </div>

                {paperSuccess && (
                  <div className="p-4 mb-4 rounded-xl text-xs font-medium text-emerald-800 dark:text-emerald-200 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-500/20 flex items-start gap-2.5">
                    <CheckCircleIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">¡Envío Exitoso!</p>
                      <p className="mt-0.5 leading-relaxed">{paperSuccess}</p>
                    </div>
                  </div>
                )}

                {paperError && (
                  <div className="p-3.5 mb-4 rounded-xl text-xs font-medium text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/30 border border-rose-500/20 flex items-start gap-2">
                    <ExclamationCircleIcon className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{paperError}</span>
                  </div>
                )}

                <form onSubmit={handlePaperSubmit} className="space-y-4">
                  {/* Título */}
                  <div className="space-y-1">
                    <label
                      htmlFor="cfp-title"
                      className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
                    >
                      Título del Manuscrito / Paper <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="cfp-title"
                      type="text"
                      required
                      value={paperTitle}
                      onChange={(e) => setPaperTitle(e.target.value)}
                      placeholder="Ej. Arquitectura Distribuida para Inferencia de Modelos LLM en el Borde"
                      className="w-full text-xs sm:text-sm p-3 rounded-xl border border-zinc-200 dark:border-white/[0.1] bg-white dark:bg-zinc-800/80 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:ring-2 focus:ring-[#00345e] focus:outline-none transition-colors min-h-[44px]"
                    />
                  </div>

                  {/* Eje Temático y Palabras Clave */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label
                        htmlFor="cfp-track"
                        className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
                      >
                        Eje Temático / Track <span className="text-rose-500">*</span>
                      </label>
                      <select
                        id="cfp-track"
                        value={paperTrack}
                        onChange={(e) => setPaperTrack(e.target.value)}
                        className="w-full text-xs sm:text-sm p-3 rounded-xl border border-zinc-200 dark:border-white/[0.1] bg-white dark:bg-zinc-800/80 text-zinc-900 dark:text-white focus:ring-2 focus:ring-[#00345e] focus:outline-none transition-colors min-h-[44px]"
                      >
                        <option value="Inteligencia Artificial y Modelos Fundacionales">
                          Inteligencia Artificial y Modelos Fundacionales
                        </option>
                        <option value="Ciberseguridad y Redes de Comunicación">
                          Ciberseguridad y Redes de Comunicación
                        </option>
                        <option value="Arquitecturas de Software y Cloud Computing">
                          Arquitecturas de Software y Cloud Computing
                        </option>
                        <option value="Robótica, Automatización y Sistemas Embebidos">
                          Robótica, Automatización y Sistemas Embebidos
                        </option>
                        <option value="Innovación Tecnológica y Transferencia (General)">
                          Innovación Tecnológica y Transferencia (General)
                        </option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label
                        htmlFor="cfp-keywords"
                        className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
                      >
                        Palabras Clave (separadas por coma)
                      </label>
                      <input
                        id="cfp-keywords"
                        type="text"
                        value={paperKeywords}
                        onChange={(e) => setPaperKeywords(e.target.value)}
                        placeholder="Ej. Edge Computing, LLM, Latencia, Redes Neuronales"
                        className="w-full text-xs sm:text-sm p-3 rounded-xl border border-zinc-200 dark:border-white/[0.1] bg-white dark:bg-zinc-800/80 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:ring-2 focus:ring-[#00345e] focus:outline-none transition-colors min-h-[44px]"
                      />
                    </div>
                  </div>

                  {/* Resumen / Abstract */}
                  <div className="space-y-1">
                    <label
                      htmlFor="cfp-abstract"
                      className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
                    >
                      Resumen Académico / Abstract (máx. 300 palabras) <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      id="cfp-abstract"
                      rows={4}
                      required
                      value={paperAbstract}
                      onChange={(e) => setPaperAbstract(e.target.value)}
                      placeholder="Describa el objetivo del estudio, metodología empleada, resultados destacados y conclusiones principales..."
                      className="w-full text-xs sm:text-sm p-3 rounded-xl border border-zinc-200 dark:border-white/[0.1] bg-white dark:bg-zinc-800/80 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:ring-2 focus:ring-[#00345e] focus:outline-none transition-colors resize-none"
                    />
                  </div>

                  {/* URL / Archivo del Manuscrito */}
                  <div className="space-y-1">
                    <label
                      htmlFor="cfp-file-url"
                      className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300"
                    >
                      Enlace o Archivo PDF del Manuscrito (IEEE / Springer format) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="cfp-file-url"
                      type="url"
                      required
                      value={paperFileUrl}
                      onChange={(e) => setPaperFileUrl(e.target.value)}
                      placeholder="https://drive.google.com/... o enlace público al PDF"
                      className="w-full text-xs sm:text-sm p-3 rounded-xl border border-zinc-200 dark:border-white/[0.1] bg-white dark:bg-zinc-800/80 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:ring-2 focus:ring-[#00345e] focus:outline-none transition-colors min-h-[44px]"
                    />
                    <p className="text-[11px] text-zinc-400">
                      Pegue el enlace público a su PDF (Google Drive, Dropbox, ArXiv o repositorio universitario).
                    </p>
                  </div>

                  {/* Nota de tarifa */}
                  <div className="p-3 rounded-xl border border-[#00345e]/20 dark:border-blue-500/20 bg-[#00345e]/5 dark:bg-blue-950/20 text-xs text-[#00345e] dark:text-blue-300">
                    <span className="font-bold">Beneficio de Aceptación:</span> Al ser aprobado por el comité científico, se le otorgará la acreditación oficial de Ponente con arancel preferencial ($80) y emisión de RIDE institucional.
                  </div>

                  {/* Botón de Enviar */}
                  <button
                    type="submit"
                    disabled={paperSubmitting}
                    className="w-full min-h-[44px] px-5 py-3 rounded-xl font-semibold text-xs sm:text-sm text-white bg-[#00345e] hover:bg-[#002747] active:bg-[#001f38] transition-all cursor-pointer shadow-xs flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {paperSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Enviando Artículo Científico...</span>
                      </>
                    ) : (
                      <span>Enviar Artículo al Comité Editorial</span>
                    )}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Sección de Calificación y Reseñas CACES */}
          <ReviewsSection
            type="congress"
            id={id}
            isEnrolledAndPaid={isPaidAttendee}
            onOpenSurvey={() => setIsSurveyModalOpen(true)}
            refreshKey={surveyCompleted ? 1 : 0}
          />
        </div>

        {/* Columna Derecha (1/3): Ficha de Inscripción y Sede (Sticky) */}
        <div className="lg:col-span-1 space-y-4 lg:sticky lg:top-20">
          {/* Tarjeta de Ficha de Inscripción */}
          <div
            className={`rounded-xl border p-4 sm:p-5 transition-colors shadow-2xs space-y-4 ${
              isDark ? "bg-[#16161a] border-white/[0.08]" : "bg-white border-black/[0.08]"
            }`}
          >
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 block mb-1">
                Convocatoria Oficial
              </span>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                Ficha del Evento
              </h3>
            </div>

            <div className="space-y-3 text-xs border-y border-black/[0.04] dark:border-white/[0.06] py-3">
              <div className="flex justify-between items-center">
                <span className="text-zinc-500 dark:text-zinc-400">Modalidad:</span>
                <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                  Presencial / Híbrida
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-500 dark:text-zinc-400">Sede Principal:</span>
                <span className="font-semibold text-zinc-800 dark:text-zinc-200 text-right truncate max-w-[180px]">
                  {congress.lugar_sede || "Campus Huachi · FISEI"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-500 dark:text-zinc-400">Acreditación:</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  {congress.duracion_horas ? `${congress.duracion_horas} Horas Académicas` : "40 Horas Acreditadas"}
                </span>
              </div>

              {/* Barra de Aforo y Capacidad */}
              <div className="space-y-1.5 pt-1 border-t border-black/[0.04] dark:border-white/[0.04]">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-500 dark:text-zinc-400">Aforo y Disponibilidad:</span>
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                    {inscritos} / {cupoMaximo} ({capacityPercentage}%)
                  </span>
                </div>
                <div className="w-full bg-zinc-200 dark:bg-zinc-800 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      isQuotaExceeded
                        ? "bg-rose-500"
                        : capacityPercentage > 80
                        ? "bg-amber-500"
                        : "bg-[#00345e] dark:bg-blue-500"
                    }`}
                    style={{ width: `${capacityPercentage}%` }}
                  />
                </div>
              </div>

              {/* Aranceles de Inscripción */}
              <div className="space-y-1.5 pt-2 border-t border-black/[0.04] dark:border-white/[0.04]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 block">
                  Aranceles Oficiales
                </span>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-600 dark:text-zinc-300">Estudiante UTA:</span>
                  <span className="font-bold text-[#00345e] dark:text-blue-400">
                    ${congress.costo_estudiante_uta ?? 20}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-600 dark:text-zinc-300">Profesional / Docente:</span>
                  <span className="font-bold text-[#00345e] dark:text-blue-400">
                    ${congress.costo_profesional ?? 50}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-600 dark:text-zinc-300">Ponente Autor:</span>
                  <span className="font-bold text-[#00345e] dark:text-blue-400">
                    ${congress.costo_ponente ?? 80}
                  </span>
                </div>
              </div>
            </div>

            {/* Botón de Inscripción / Acciones Contextuales */}
            <div className="space-y-2">
              {isEnrolled ? (
                <>
                  <div className="w-full py-2.5 px-3 rounded-lg font-semibold text-xs text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-500/20 text-center flex items-center justify-center gap-1.5">
                    <CheckCircleIcon className="w-4 h-4" />
                    <span>Inscripción Registrada</span>
                  </div>

                  {userEnrollment && (userEnrollment.status === "Pagado" || userEnrollment.status === "Facturado") ? (
                    <>
                      <button
                        type="button"
                        onClick={() => setIsPassModalOpen(true)}
                        className="w-full h-11 py-2.5 px-3 rounded-lg font-semibold text-xs text-white bg-[#00345e] hover:bg-[#002747] transition-all cursor-pointer shadow-xs border-0 flex items-center justify-center gap-2"
                      >
                        <QrCodeIcon className="w-4 h-4" />
                        <span>Ver Credencial de Acceso con QR</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setIsSurveyModalOpen(true)}
                        className="w-full h-11 py-2.5 px-3 rounded-lg font-semibold text-xs border transition-colors flex items-center justify-center gap-2 cursor-pointer border-[#00345e]/30 dark:border-blue-400/30 text-[#00345e] dark:text-blue-300 hover:bg-[#00345e]/10 dark:hover:bg-blue-900/30"
                      >
                        <StarIcon className="w-4 h-4 text-amber-500" />
                        <span>Evaluar Congreso (CACES)</span>
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsReceiptModalOpen(true)}
                      className="w-full h-11 py-2.5 px-3 rounded-lg font-semibold text-xs text-white bg-[#00345e] hover:bg-[#002747] transition-all cursor-pointer shadow-xs border-0 flex items-center justify-center gap-2"
                    >
                      <DocumentArrowUpIcon className="w-4 h-4" />
                      <span>{userEnrollment?.payment_order_url ? "Actualizar Comprobante / SRI" : "Subir Comprobante y Datos SRI"}</span>
                    </button>
                  )}
                </>
              ) : isCongressPast ? (
                <div className="space-y-1.5">
                  <div className="w-full py-2.5 px-3 rounded-lg font-semibold text-xs text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/60 text-center">
                    <span>Inscripciones Finalizadas</span>
                  </div>
                  <p className="text-[10px] text-zinc-400 dark:text-zinc-500 text-center">
                    El congreso ha concluido. El cronograma, ponentes y memorias se encuentran disponibles para consulta pública y legalidad.
                  </p>
                </div>
              ) : isQuotaExceeded ? (
                <div className="space-y-2">
                  <div className="w-full py-2.5 px-3 rounded-lg font-semibold text-xs text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/30 border border-rose-500/20 text-center flex items-center justify-center gap-1.5">
                    <ExclamationCircleIcon className="w-4 h-4 shrink-0" />
                    <span>Convocatoria Completa / Cupos Agotados</span>
                  </div>
                  <button
                    type="button"
                    disabled={true}
                    title="Convocatoria completa. No hay cupos disponibles para este congreso."
                    className="w-full h-11 py-2.5 px-4 rounded-lg font-semibold text-xs sm:text-sm text-zinc-400 dark:text-zinc-500 bg-zinc-100 dark:bg-zinc-800/60 cursor-not-allowed border border-zinc-200 dark:border-zinc-700/60 flex items-center justify-center gap-2"
                  >
                    <span>Inscribirme al Congreso (Agotado)</span>
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleEnroll}
                  disabled={enrolling}
                  className="w-full h-11 py-2.5 px-4 rounded-lg font-semibold text-xs sm:text-sm text-white bg-[#00345e] hover:bg-[#002747] active:bg-[#001f38] transition-all cursor-pointer shadow-xs border-0 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {enrolling ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Procesando...</span>
                    </>
                  ) : (
                    <span>Inscribirme al Congreso</span>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Tarjeta de Soporte Institucional */}
          <div
            className={`rounded-xl border p-4 transition-colors text-xs space-y-2 shadow-2xs ${
              isDark ? "bg-[#16161a] border-white/[0.08]" : "bg-white border-black/[0.08]"
            }`}
          >
            <h4 className="font-semibold text-zinc-900 dark:text-white">
              Centro de Transferencia Tecnológica
            </h4>
            <p className="text-zinc-500 dark:text-zinc-400 text-[11px] leading-relaxed">
              Facultad de Ingeniería en Sistemas, Electrónica e Industrial. Ambato, Ecuador.
            </p>
            <div className="pt-1 text-[11px] text-[#00345e] dark:text-blue-400 font-medium">
              <span>talleresfisei@uta.edu.ec</span>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Confirmación de Inscripción con nombre seguro */}
      <EnrollmentModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEnrollmentData(null);
          setEnrollmentError(null);
          checkEnrollment();
        }}
        enrollmentData={enrollmentData}
        courseName={congress?.nombre || "Congreso Internacional"}
        error={enrollmentError}
      />

      {/* Modal para Subir Comprobante y Registrar Datos SRI */}
      <PaymentReceiptModal
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        enrollment={userEnrollment || (enrollmentData?.data ? enrollmentData.data : { id_congress: id, congress_title: congress?.nombre })}
        onSuccess={() => {
          checkEnrollment();
        }}
      />

      {/* Modal de Evaluación de Calidad Académica CACES */}
      <SurveyModal
        isOpen={isSurveyModalOpen}
        onClose={() => setIsSurveyModalOpen(false)}
        congressId={id}
        congressTitle={congress?.nombre}
        onSuccess={() => setSurveyCompleted(true)}
      />
    </div>
  );
}
