import { useState, useEffect } from "react";
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
} from "@heroicons/react/24/outline";
import { getCongressById } from "../api/congresses";
import { resolveImageUrl } from "../utils/helpers";
import { useDashboardTheme } from "../context/DashboardThemeContext";

export default function CongressDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isDark } = useDashboardTheme();

  const isDashboard = location.pathname.startsWith("/dashboard");

  const [congress, setCongress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
      navigate("/dashboard/cursos/inscrito");
    } else {
      navigate("/events");
    }
  };

  // Estado Skeleton Dokploy
  if (loading) {
    return (
      <div className="w-full max-w-7xl mx-auto space-y-6 animate-pulse">
        <div className="flex justify-between items-center pb-3 border-b border-black/[0.06] dark:border-white/[0.06]">
          <div className={`h-9 w-36 rounded-xl ${isDark ? "bg-white/[0.06]" : "bg-black/[0.06]"}`} />
          <div className={`h-6 w-24 rounded-lg ${isDark ? "bg-white/[0.06]" : "bg-black/[0.06]"}`} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className={`h-72 rounded-2xl ${isDark ? "bg-[#16161a]" : "bg-zinc-100"}`} />
            <div className={`h-48 rounded-2xl ${isDark ? "bg-[#16161a]" : "bg-zinc-100"}`} />
            <div className={`h-64 rounded-2xl ${isDark ? "bg-[#16161a]" : "bg-zinc-100"}`} />
          </div>
          <div className="lg:col-span-1 space-y-5">
            <div className={`h-60 rounded-2xl ${isDark ? "bg-[#16161a]" : "bg-zinc-100"}`} />
            <div className={`h-48 rounded-2xl ${isDark ? "bg-[#16161a]" : "bg-zinc-100"}`} />
          </div>
        </div>
      </div>
    );
  }

  // Estado de Error
  if (error) {
    const isInvalid = !id || id === "null" || id === "undefined" || isNaN(parseInt(id, 10));
    return (
      <div className="w-full max-w-xl mx-auto py-16 px-4 text-center">
        <div
          className={`rounded-2xl p-8 border transition-colors ${
            isDark ? "bg-[#16161a] border-white/[0.08] shadow-xl" : "bg-white border-black/[0.08] shadow-md"
          }`}
        >
          <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mx-auto mb-4">
            <ExclamationTriangleIcon className="w-6 h-6" />
          </div>
          <h2 className={`text-xl font-bold tracking-tight mb-2 ${isDark ? "text-white" : "text-zinc-900"}`}>
            {isInvalid ? "Congreso No Encontrado" : "Error al Cargar el Evento"}
          </h2>
          <p className={`text-xs sm:text-sm mb-6 ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>
            {isInvalid
              ? "No se ha especificado un identificador de evento válido o el enlace ha caducado."
              : error}
          </p>
          <button
            type="button"
            onClick={handleGoBack}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-[#00345e] hover:bg-[#002747] text-white cursor-pointer transition-colors shadow-xs"
          >
            ← Volver a Mis Cursos
          </button>
        </div>
      </div>
    );
  }

  if (!congress) {
    return (
      <div className="w-full max-w-xl mx-auto py-16 px-4 text-center">
        <div
          className={`rounded-2xl p-8 border transition-colors ${
            isDark ? "bg-[#16161a] border-white/[0.08] shadow-xl" : "bg-white border-black/[0.08] shadow-md"
          }`}
        >
          <h2 className={`text-xl font-bold tracking-tight mb-2 ${isDark ? "text-white" : "text-zinc-900"}`}>
            Congreso No Disponible
          </h2>
          <p className={`text-xs sm:text-sm mb-6 ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>
            El evento solicitado no está disponible o ha concluido.
          </p>
          <button
            type="button"
            onClick={handleGoBack}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-[#00345e] hover:bg-[#002747] text-white cursor-pointer transition-colors"
          >
            ← Volver a Mis Cursos
          </button>
        </div>
      </div>
    );
  }

  const posterUrl = congress.poster_cover_url ? resolveImageUrl(congress.poster_cover_url) : null;
  const sessions = congress.sesiones || congress.sessions || [];
  const speakers = congress.speakers || [];
  const sponsors = congress.sponsors || [];

  const formatDate = (dateStr) => {
    if (!dateStr) return "Por definir";
    const d = new Date(dateStr);
    return isNaN(d.getTime())
      ? dateStr
      : d.toLocaleDateString("es-ES", { year: "numeric", month: "long", day: "numeric" });
  };

  return (
    <div className={`w-full max-w-7xl mx-auto space-y-6 ${!isDashboard ? "px-4 sm:px-6 lg:px-8 py-6" : ""}`}>
      {/* Barra de Retorno Intuitiva */}
      <div className="flex items-center justify-between pb-3 border-b border-black/[0.06] dark:border-white/[0.06]">
        <button
          type="button"
          onClick={handleGoBack}
          className={`group inline-flex items-center gap-2.5 h-9 px-3.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer border ${
            isDark
              ? "bg-[#16161a] hover:bg-zinc-800 text-zinc-200 hover:text-white border-white/[0.08] hover:border-white/[0.18] shadow-xs"
              : "bg-white hover:bg-zinc-100 text-zinc-800 hover:text-[#00345e] border-zinc-200 hover:border-zinc-300 shadow-xs"
          }`}
          title="Regresar"
        >
          <ArrowLeftIcon className="h-4 w-4 text-[#00345e] dark:text-blue-400 transition-transform duration-200 group-hover:-translate-x-1" />
          <span>Volver a Mis Cursos</span>
        </button>

        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold border ${
          isDark
            ? "bg-[#00345e]/40 text-blue-300 border-blue-500/40"
            : "bg-[#00345e]/08 text-[#00345e] border-[#00345e]/20"
        }`}>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          Inscrito
        </span>
      </div>

      {/* Grid Principal: 2 columnas Dokploy Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 items-start">
        {/* Columna Izquierda: Contenido Principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header del Congreso */}
          <div
            className={`rounded-2xl border overflow-hidden transition-colors ${
              isDark ? "bg-[#16161a] border-white/[0.08] shadow-md" : "bg-white border-black/[0.08] shadow-xs"
            }`}
          >
            {posterUrl && (
              <div className="w-full h-56 sm:h-72 bg-zinc-900 overflow-hidden relative">
                <img
                  src={posterUrl}
                  alt={congress.nombre}
                  className="w-full h-full object-cover"
                  onError={(e) => { e.currentTarget.style.display = "none"; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-[#00345e]/90 text-white backdrop-blur-md border border-white/20 mb-2">
                    {congress.edicion || "Congreso Internacional"}
                  </span>
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight leading-tight">
                    {congress.nombre}
                  </h1>
                </div>
              </div>
            )}

            {!posterUrl && (
              <div className="p-6 sm:p-8 border-b border-black/[0.06] dark:border-white/[0.06]">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-[#00345e]/10 dark:bg-blue-500/20 text-[#00345e] dark:text-blue-300 border border-[#00345e]/20 dark:border-blue-500/30 mb-2">
                  {congress.edicion || "Congreso"}
                </span>
                <h1 className={`text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight ${isDark ? "text-white" : "text-zinc-900"}`}>
                  {congress.nombre}
                </h1>
              </div>
            )}

            {/* Metadatos Rápidos */}
            <div className="p-6 sm:p-8 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className={`p-3.5 rounded-xl border flex items-center gap-3 ${
                  isDark ? "bg-[#121215] border-white/[0.06]" : "bg-zinc-50/80 border-black/[0.06]"
                }`}>
                  <CalendarDaysIcon className="w-5 h-5 text-[#00345e] dark:text-blue-400 flex-shrink-0" />
                  <div className="text-xs">
                    <span className={`block font-medium ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>Fechas del Evento</span>
                    <span className={`font-semibold ${isDark ? "text-zinc-100" : "text-zinc-900"}`}>
                      {formatDate(congress.fecha_inicio)} — {formatDate(congress.fecha_fin)}
                    </span>
                  </div>
                </div>

                <div className={`p-3.5 rounded-xl border flex items-center gap-3 ${
                  isDark ? "bg-[#121215] border-white/[0.06]" : "bg-zinc-50/80 border-black/[0.06]"
                }`}>
                  <AcademicCapIcon className="w-5 h-5 text-[#00345e] dark:text-blue-400 flex-shrink-0" />
                  <div className="text-xs">
                    <span className={`block font-medium ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>Edición / Año</span>
                    <span className={`font-semibold ${isDark ? "text-zinc-100" : "text-zinc-900"}`}>
                      {congress.edicion || "Edición General"} ({congress.anio || new Date().getFullYear()})
                    </span>
                  </div>
                </div>
              </div>

              {congress.descripcion_general && (
                <div className="pt-2">
                  <h3 className={`text-xs font-semibold uppercase tracking-wider mb-2 ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>
                    Descripción General
                  </h3>
                  <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? "text-zinc-300" : "text-zinc-700"}`}>
                    {congress.descripcion_general}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Cronograma de Sesiones */}
          {sessions.length > 0 && (
            <div
              className={`rounded-2xl p-6 sm:p-8 border transition-colors ${
                isDark ? "bg-[#16161a] border-white/[0.08] shadow-xs" : "bg-white border-black/[0.08] shadow-xs"
              }`}
            >
              <div className="flex items-center justify-between gap-3 mb-5">
                <div className="flex items-center gap-2.5">
                  <ClockIcon className="w-5 h-5 text-[#00345e] dark:text-blue-400" />
                  <h2 className={`text-base sm:text-lg font-bold tracking-tight ${isDark ? "text-white" : "text-zinc-900"}`}>
                    Cronograma de Sesiones
                  </h2>
                </div>
                <span className={`text-xs font-medium px-2.5 py-0.5 rounded-md border ${
                  isDark ? "bg-zinc-800 text-zinc-300 border-white/10" : "bg-zinc-100 text-zinc-700 border-zinc-200"
                }`}>
                  {sessions.length} sesiones
                </span>
              </div>

              <div className="space-y-3">
                {sessions.map((sesion, idx) => (
                  <div
                    key={sesion.id_sesion || idx}
                    className={`p-4 rounded-xl border transition-colors ${
                      isDark ? "bg-[#121215] border-white/[0.06]" : "bg-zinc-50/70 border-black/[0.06]"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                      <span className={`font-semibold text-xs sm:text-sm ${isDark ? "text-zinc-100" : "text-zinc-900"}`}>
                        {sesion.titulo_sesion || "Sesión académica"}
                      </span>
                      {sesion.jornada && (
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium capitalize self-start sm:self-auto border ${
                          isDark ? "bg-zinc-800 text-zinc-300 border-white/10" : "bg-white text-zinc-700 border-zinc-200"
                        }`}>
                          Jornada {sesion.jornada}
                        </span>
                      )}
                    </div>

                    <div className={`flex flex-wrap items-center gap-x-4 gap-y-1 text-xs ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>
                      {sesion.fecha && (
                        <span className="flex items-center gap-1.5">
                          <CalendarDaysIcon className="w-3.5 h-3.5" />
                          {formatDate(sesion.fecha)}
                        </span>
                      )}
                      {(sesion.hora_inicio || sesion.hora_fin) && (
                        <span className="flex items-center gap-1.5">
                          <ClockIcon className="w-3.5 h-3.5" />
                          {sesion.hora_inicio} — {sesion.hora_fin}
                        </span>
                      )}
                      {sesion.lugar && (
                        <span className="flex items-center gap-1.5">
                          <MapPinIcon className="w-3.5 h-3.5" />
                          {sesion.lugar}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Ponentes / Speakers */}
          {speakers.length > 0 && (
            <div
              className={`rounded-2xl p-6 sm:p-8 border transition-colors ${
                isDark ? "bg-[#16161a] border-white/[0.08] shadow-xs" : "bg-white border-black/[0.08] shadow-xs"
              }`}
            >
              <div className="flex items-center gap-2.5 mb-5">
                <UserGroupIcon className="w-5 h-5 text-[#00345e] dark:text-blue-400" />
                <h2 className={`text-base sm:text-lg font-bold tracking-tight ${isDark ? "text-white" : "text-zinc-900"}`}>
                  Ponentes y Expositores
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {speakers.map((spk, idx) => (
                  <div
                    key={spk.id_speaker || idx}
                    className={`p-3.5 rounded-xl border flex items-start gap-3 ${
                      isDark ? "bg-[#121215] border-white/[0.06]" : "bg-zinc-50/70 border-black/[0.06]"
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#00345e] text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                      {(spk.nombres_completos || "P")[0]}
                    </div>
                    <div className="text-xs min-w-0">
                      <span className={`block font-semibold truncate ${isDark ? "text-zinc-100" : "text-zinc-900"}`}>
                        {spk.nombres_completos}
                      </span>
                      {spk.institucion && (
                        <span className={`block truncate ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>
                          {spk.institucion}
                        </span>
                      )}
                      {spk.pais && (
                        <span className={`text-[11px] ${isDark ? "text-zinc-500" : "text-zinc-400"}`}>
                          {spk.pais}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Columna Derecha: Sticky Sidebar Dokploy Style */}
        <div className="lg:col-span-1 space-y-5 lg:sticky lg:top-20">
          {/* Tarjeta de Ficha Técnica */}
          <div
            className={`rounded-2xl p-6 border transition-colors ${
              isDark ? "bg-[#16161a] border-white/[0.08] shadow-md" : "bg-white border-black/[0.08] shadow-xs"
            }`}
          >
            <h3 className={`text-xs font-semibold uppercase tracking-wider mb-4 pb-2 border-b ${
              isDark ? "border-white/[0.08] text-zinc-400" : "border-black/[0.06] text-zinc-500"
            }`}>
              Ficha del Evento
            </h3>

            <div className="space-y-3.5 text-xs">
              <div>
                <span className={`block font-medium ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>Modalidad</span>
                <span className={`font-semibold ${isDark ? "text-zinc-200" : "text-zinc-800"}`}>Presencial / Híbrido</span>
              </div>
              <div>
                <span className={`block font-medium ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>Sede</span>
                <span className={`font-semibold ${isDark ? "text-zinc-200" : "text-zinc-800"}`}>
                  Universidad Técnica de Ambato · FISEI
                </span>
              </div>
              <div>
                <span className={`block font-medium ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>Certificación</span>
                <span className={`font-semibold ${isDark ? "text-zinc-200" : "text-zinc-800"}`}>
                  Certificado digital de asistencia y aprobación
                </span>
              </div>
            </div>

            <div className={`mt-5 pt-4 border-t ${isDark ? "border-white/[0.08]" : "border-black/[0.06]"}`}>
              <button
                type="button"
                onClick={handleGoBack}
                className="w-full py-2.5 px-3.5 rounded-xl font-semibold text-xs text-white bg-[#00345e] hover:bg-[#002747] active:bg-[#001f38] transition-all cursor-pointer shadow-xs border-0"
              >
                Volver a Mis Cursos
              </button>
            </div>
          </div>

          {/* Tarjeta de Patrocinadores */}
          {sponsors.length > 0 && (
            <div
              className={`rounded-2xl p-6 border transition-colors ${
                isDark ? "bg-[#16161a] border-white/[0.08] shadow-xs" : "bg-white border-black/[0.08] shadow-xs"
              }`}
            >
              <div className="flex items-center gap-2 mb-3">
                <BuildingOffice2Icon className="w-4 h-4 text-[#00345e] dark:text-blue-400" />
                <h3 className={`text-xs font-semibold uppercase tracking-wider ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>
                  Patrocinadores
                </h3>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {sponsors.map((spon, idx) => (
                  <span
                    key={idx}
                    className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-medium border ${
                      isDark
                        ? "bg-zinc-800/80 text-zinc-300 border-white/10"
                        : "bg-zinc-100 text-zinc-700 border-zinc-200"
                    }`}
                  >
                    {spon.sponsor_name || spon.nombre || "Patrocinador"}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

