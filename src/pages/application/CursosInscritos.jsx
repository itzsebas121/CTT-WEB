import { useCallback, useEffect, useState, useMemo } from "react";
import {
  getUserEnrollments,
  generateUtaPaymentOrder,
  downloadUtaPaymentOrder,
} from "../../api/inscripciones";
import {
  EyeIcon,
  DocumentArrowUpIcon,
  CheckCircleIcon,
  ClockIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  XMarkIcon,
  AcademicCapIcon,
  DocumentTextIcon,
  ArrowDownTrayIcon,
} from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import { PaymentReceiptModal } from "../../components/ui";
import { useDashboardTheme } from "../../context/DashboardThemeContext";

export default function CursosInscritos() {
  const [rawEnrollments, setRawEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("all"); // "all" | "congresos" | "cursos" | "pagados" | "pendientes"
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);
  const [uploadSuccessMessage, setUploadSuccessMessage] = useState("");
  const [selectedForReceipt, setSelectedForReceipt] = useState(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [downloadingRideId, setDownloadingRideId] = useState(null);
  const [generatingOrderId, setGeneratingOrderId] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const { isDark } = useDashboardTheme();
  const navigate = useNavigate();

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const loadEnrollments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const user = localStorage.getItem("user");
      if (!user) {
        navigate("/login");
        return;
      }

      const userData = JSON.parse(user);
      const response = await getUserEnrollments(userData.id);
      const enrollmentsArray = response.enrollments || [];
      setRawEnrollments(enrollmentsArray);
    } catch (err) {
      if (err.message === "UNAUTHORIZED") {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
      } else {
        setError(err.message || "Error al cargar inscripciones");
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    loadEnrollments();
  }, [loadEnrollments]);

  // Contadores de pestañas
  const counts = useMemo(() => {
    const total = rawEnrollments.length;
    const congresos = rawEnrollments.filter((e) => Boolean(e.id_congress)).length;
    const cursos = rawEnrollments.filter((e) => Boolean(e.id_course)).length;
    const pagados = rawEnrollments.filter((e) => {
      const st = (e.status || "").toUpperCase();
      return st === "PAGADO" || st === "FACTURADO";
    }).length;
    const pendientes = rawEnrollments.filter((e) => {
      const st = (e.status || "").toUpperCase();
      return (
        st === "INTERESADO" ||
        st === "ORDEN_GENERADA" ||
        st === "GENERADA LA ORDEN"
      );
    }).length;

    return { total, congresos, cursos, pagados, pendientes };
  }, [rawEnrollments]);

  // Filtrado compuesto
  const filteredEnrollments = useMemo(() => {
    return rawEnrollments.filter((item) => {
      const isCongress = Boolean(item.id_congress);
      const isCourse = Boolean(item.id_course);
      const st = (item.status || "").toUpperCase();
      const isPaid = st === "PAGADO" || st === "FACTURADO";
      const isPending =
        st === "INTERESADO" ||
        st === "ORDEN_GENERADA" ||
        st === "GENERADA LA ORDEN";

      if (activeTab === "congresos" && !isCongress) return false;
      if (activeTab === "cursos" && !isCourse) return false;
      if (activeTab === "pagados" && !isPaid) return false;
      if (activeTab === "pendientes" && !isPending) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const title = (
          item.course_title ||
          item.congress_title ||
          item.title ||
          ""
        ).toLowerCase();
        const category = (item.course_category_name || "").toLowerCase();
        if (!title.includes(q) && !category.includes(q)) return false;
      }

      return true;
    });
  }, [rawEnrollments, activeTab, searchQuery]);

  // Paginación
  const totalItems = filteredEnrollments.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startIndex = (page - 1) * pageSize;
  const paginatedItems = filteredEnrollments.slice(
    startIndex,
    startIndex + pageSize
  );

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setPage(1);
  };

  const handleNavigateDetail = (item) => {
    if (item.id_course) {
      navigate(`/dashboard/curso/${item.id_course}`);
    } else if (item.id_congress) {
      navigate(`/dashboard/congreso/${item.id_congress}`);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  // Descarga de factura oficial SRI / RIDE
  const handleDownloadRide = async (item) => {
    try {
      setDownloadingRideId(item.id);
      setToastMessage(null);
      const token = localStorage.getItem("token");
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3002/api/v1";
      const downloadUrl = `${apiUrl}/enrollments/${item.id}/ride/download`;

      const res = await fetch(downloadUrl, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (!res.ok) {
        let errorDetail = "No se pudo descargar el comprobante RIDE oficial.";
        try {
          const errData = await res.json();
          if (errData?.detail) errorDetail = errData.detail;
        } catch {}
        throw new Error(errorDetail);
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `RIDE_UTA_${String(item.id).padStart(9, "0")}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      setToastMessage({
        type: "success",
        text: "Comprobante RIDE oficial descargado correctamente.",
      });
    } catch (err) {
      console.error("Error al descargar RIDE:", err);
      setToastMessage({
        type: "error",
        text: err.message || "Error al descargar el comprobante RIDE oficial.",
      });
    } finally {
      setDownloadingRideId(null);
    }
  };

  // Generación y descarga de la Orden de Pago UTA oficial
  const handleGenerateOrDownloadUtaOrder = async (item) => {
    try {
      setGeneratingOrderId(item.id);
      setToastMessage(null);

      // Si ya tiene orden generada o URL de pago, descargarla directamente
      const rawStatus = (item.status || "").toUpperCase();
      if (rawStatus === "ORDEN_GENERADA" || rawStatus === "GENERADA LA ORDEN") {
        await downloadUtaPaymentOrder(item.id);
        setToastMessage({
          type: "success",
          text: "Orden de Pago UTA descargada. Preséntala en Dirección Financiera o transfiere con tu código.",
        });
        return;
      }

      // Si aún está en Interesado/Pendiente, generar la orden en la API institucional
      const res = await generateUtaPaymentOrder(item.id);
      if (res && res.status === "success") {
        await downloadUtaPaymentOrder(item.id);
        setToastMessage({
          type: "success",
          text: `Orden de Pago generada (${res.order_data?.order_code || "UTA"}). Descarga completada con éxito.`,
        });
        // Recargar datos en segundo plano
        loadEnrollments();
      }
    } catch (err) {
      console.error("Error al gestionar orden de pago UTA:", err);
      setToastMessage({
        type: "error",
        text: err.message || "Error al conectar con la Dirección Financiera de la UTA.",
      });
    } finally {
      setGeneratingOrderId(null);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Encabezado Principal Limpio y Directo */}
      <div>
        <h1
          className={`text-2xl sm:text-3xl font-bold tracking-tight ${
            isDark ? "text-white" : "text-zinc-900"
          }`}
        >
          Mis Inscripciones Académicas
        </h1>
        <p
          className={`text-xs sm:text-sm mt-1 max-w-2xl font-normal leading-relaxed ${
            isDark ? "text-zinc-400" : "text-zinc-500"
          }`}
        >
          Gestiona tus órdenes de pago institucionales UTA, valida comprobantes de transferencia y accede a las facturas electrónicas de tus programas.
        </p>
      </div>

      {/* Alerta de Éxito al Subir Comprobante */}
      {uploadSuccessMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircleIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
            <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">
              {uploadSuccessMessage}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setUploadSuccessMessage("")}
            className="text-emerald-600 hover:text-emerald-800 dark:text-emerald-400 text-xs font-bold cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      )}

      {/* Alerta Toast Feedback */}
      {toastMessage && (
        <div
          className={`p-3.5 rounded-xl border flex items-center justify-between transition-all ${
            toastMessage.type === "success"
              ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/40"
              : "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900/40"
          }`}
        >
          <div className="flex items-center gap-2">
            {toastMessage.type === "success" ? (
              <CheckCircleIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
            ) : (
              <XMarkIcon className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0" />
            )}
            <p
              className={`text-xs font-semibold ${
                toastMessage.type === "success"
                  ? "text-emerald-800 dark:text-emerald-300"
                  : "text-red-800 dark:text-red-300"
              }`}
            >
              {toastMessage.text}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className={`text-xs font-bold cursor-pointer ${
              toastMessage.type === "success"
                ? "text-emerald-600 hover:text-emerald-800 dark:text-emerald-400"
                : "text-red-600 hover:text-red-800 dark:text-red-400"
            }`}
          >
            Cerrar
          </button>
        </div>
      )}

      {/* Mensaje de Error con Reintentar */}
      {error && (
        <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 flex items-center justify-between">
          <p className="text-xs font-semibold text-red-700 dark:text-red-300">
            {error}
          </p>
          <button
            type="button"
            onClick={loadEnrollments}
            className="text-xs font-bold text-red-600 hover:text-red-800 dark:text-red-400 cursor-pointer flex items-center gap-1"
          >
            <ArrowPathIcon className="w-3.5 h-3.5" />
            <span>Reintentar</span>
          </button>
        </div>
      )}

      {/* Barra de Filtros y Buscador */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-black/[0.08] dark:border-white/[0.08] gap-4 pb-px">
        <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto pb-1">
          {[
            { id: "all", label: "Todos", count: counts.total },
            { id: "congresos", label: "Congresos", count: counts.congresos },
            { id: "cursos", label: "Cursos", count: counts.cursos },
            { id: "pagados", label: "Pagados", count: counts.pagados },
            { id: "pendientes", label: "Pendientes", count: counts.pendientes },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabChange(tab.id)}
                className={`h-9 px-3.5 text-xs font-semibold rounded-t-lg transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 border-b-2 ${
                  isActive
                    ? "border-[#00345e] text-[#00345e] dark:border-blue-400 dark:text-blue-400 bg-black/[0.02] dark:bg-white/[0.02]"
                    : "border-transparent text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                    isActive
                      ? "bg-[#00345e]/10 text-[#00345e] dark:bg-blue-400/20 dark:text-blue-300"
                      : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Buscador Integrado */}
        <div className="relative w-full sm:w-64 pb-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
            <MagnifyingGlassIcon className="h-3.5 w-3.5" />
          </div>
          <input
            type="search"
            placeholder="Buscar por título..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            className={`w-full h-8 pl-8 pr-7 text-xs rounded-lg outline-none transition-colors border ${
              isDark
                ? "bg-[#16161a] border-white/[0.08] text-zinc-100 placeholder:text-zinc-500 focus:border-[#00345e]"
                : "bg-white border-zinc-200 text-zinc-900 placeholder:text-zinc-400 focus:border-[#00345e] shadow-2xs"
            }`}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setPage(1);
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 cursor-pointer p-0.5"
            >
              <XMarkIcon className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Contenedor de la Tabla Principal */}
      <div
        className={`w-full rounded-2xl overflow-hidden border transition-colors shadow-2xs ${
          isDark
            ? "bg-[#16161a] border-white/[0.08]"
            : "bg-white border-black/[0.08]"
        }`}
      >
        {/* Vista Móvil (< 640px) */}
        <div className="sm:hidden">
          {loading ? (
            <div className="p-8 text-center space-y-3">
              <div className="w-6 h-6 border-2 border-[#00345e] border-t-transparent rounded-full animate-spin mx-auto" />
              <span className="text-xs text-zinc-400">
                Cargando tus inscripciones...
              </span>
            </div>
          ) : paginatedItems.length > 0 ? (
            <div className={`divide-y ${isDark ? "divide-white/[0.06]" : "divide-black/[0.06]"}`}>
              {paginatedItems.map((item) => {
                const isCongress = Boolean(item.id_congress);
                const effectiveTitle =
                  item.course_title ||
                  item.congress_title ||
                  item.title ||
                  "Programa Académico";
                const category =
                  item.course_category_name || (isCongress ? "Congreso Internacional" : "General");
                const rawStatus = (item.status || "INTERESADO").toUpperCase();
                const isPaid = rawStatus === "PAGADO" || rawStatus === "FACTURADO";
                const isOrderGenerated = rawStatus === "ORDEN_GENERADA" || rawStatus === "GENERADA LA ORDEN";
                const hasReceiptUploaded =
                  Boolean(item.payment_order_url) &&
                  item.payment_order_url !== "local" &&
                  !item.payment_order_url.includes("payment-order/download");

                return (
                  <div key={item.id} className="p-4 space-y-3.5">
                    {/* Encabezado Móvil */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold ${
                          isCongress
                            ? "bg-[#00345e]/10 text-[#00345e] dark:bg-blue-400/20 dark:text-blue-300"
                            : "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300"
                        }`}>
                          {isCongress ? "Congreso Internacional" : "Curso de Capacitación"}
                        </span>
                        <span className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400">
                          {formatDate(item.enrollment_date)}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleNavigateDetail(item)}
                        className={`text-left text-sm font-semibold line-clamp-2 transition-colors cursor-pointer w-full ${
                          isDark
                            ? "text-zinc-100 hover:text-blue-400"
                            : "text-zinc-900 hover:text-[#00345e]"
                        }`}
                      >
                        {effectiveTitle}
                      </button>
                      <p className="text-[11px] text-zinc-400 dark:text-zinc-500">
                        {isCongress ? "Campus Huachi · FISEI UTA" : category}
                      </p>
                      {item.tariff_type && (
                        <p className="text-[11px] font-medium text-[#00345e] dark:text-blue-400">
                          Tarifa: {item.tariff_type} {item.amount ? `· $${Number(item.amount).toFixed(2)}` : ""}
                        </p>
                      )}
                    </div>

                    {/* Estado Semántico */}
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-xs text-zinc-500 dark:text-zinc-400">Estado:</span>
                      {isPaid ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                          <CheckCircleIcon className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          Pagado
                        </span>
                      ) : hasReceiptUploaded ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
                          <ClockIcon className="w-3.5 h-3.5 text-amber-500" />
                          Comprobante en Revisión
                        </span>
                      ) : isOrderGenerated ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
                          <ClockIcon className="w-3.5 h-3.5 text-amber-500" />
                          Orden Generada
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-zinc-500/10 text-zinc-600 dark:text-zinc-300 border border-zinc-500/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
                          Pendiente
                        </span>
                      )}
                    </div>

                    {/* Acciones Móviles */}
                    <div className="pt-2 space-y-2">
                      {isPaid ? (
                        <button
                          type="button"
                          onClick={() => handleDownloadRide(item)}
                          disabled={downloadingRideId === item.id}
                          className="w-full h-10 px-4 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
                        >
                          <DocumentTextIcon className="w-4 h-4" />
                          <span>{downloadingRideId === item.id ? "Descargando..." : "Descargar Factura / RIDE (PDF)"}</span>
                        </button>
                      ) : (
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => handleGenerateOrDownloadUtaOrder(item)}
                            disabled={generatingOrderId === item.id}
                            className="h-10 px-3 rounded-xl text-xs font-bold bg-[#00345e] hover:bg-[#002747] text-white transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                          >
                            <ArrowDownTrayIcon className="w-3.5 h-3.5" />
                            <span className="truncate">
                              {generatingOrderId === item.id
                                ? "Generando..."
                                : isOrderGenerated
                                ? "Orden UTA (PDF)"
                                : "Generar Orden"}
                            </span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedForReceipt(item);
                              setIsReceiptModalOpen(true);
                            }}
                            className={`h-10 px-3 rounded-xl text-xs font-semibold border transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                              isDark
                                ? "bg-white/[0.04] hover:bg-white/[0.08] text-zinc-200 border-white/10"
                                : "bg-white hover:bg-zinc-50 text-zinc-800 border-zinc-200 shadow-2xs"
                            }`}
                          >
                            <DocumentArrowUpIcon className="w-3.5 h-3.5 text-zinc-500" />
                            <span className="truncate">
                              {hasReceiptUploaded ? "Actualizar" : "Subir Comprobante"}
                            </span>
                          </button>
                        </div>
                      )}

                      {/* Botón Ver Detalles Uniforme */}
                      <button
                        type="button"
                        onClick={() => handleNavigateDetail(item)}
                        className={`w-full h-9 px-3 rounded-xl text-xs font-semibold border transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                          isDark
                            ? "bg-zinc-800/60 hover:bg-zinc-800 text-zinc-200 border-white/10"
                            : "bg-zinc-50 hover:bg-zinc-100 text-zinc-700 border-zinc-200"
                        }`}
                      >
                        <EyeIcon className="w-3.5 h-3.5" />
                        <span>Ver Detalles del Programa</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center space-y-2">
              <AcademicCapIcon className="w-8 h-8 mx-auto text-zinc-400" />
              <p className={`text-sm font-semibold ${isDark ? "text-zinc-300" : "text-zinc-700"}`}>
                No se encontraron registros
              </p>
              <p className="text-xs text-zinc-400">
                {searchQuery
                  ? "No hay resultados para tu búsqueda."
                  : "No tienes inscripciones en esta categoría."}
              </p>
            </div>
          )}
        </div>

        {/* Vista Escritorio / Tablet: Tabla con 2 Columnas Dedicadas (>= 640px) */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full text-left border-collapse table-fixed">
            <thead>
              <tr
                className={`border-b ${
                  isDark
                    ? "bg-[#121215] border-white/[0.06]"
                    : "bg-zinc-50/75 border-black/[0.06]"
                }`}
              >
                <th
                  scope="col"
                  className="py-3.5 px-5 text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 w-[38%]"
                >
                  Programa Académico
                </th>
                <th
                  scope="col"
                  className="py-3.5 px-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 w-[12%]"
                >
                  Fecha Registro
                </th>
                <th
                  scope="col"
                  className="py-3.5 px-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 w-[14%]"
                >
                  Estado
                </th>
                <th
                  scope="col"
                  className="py-3.5 px-4 text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 w-[24%]"
                >
                  Comprobante y Orden de Pago
                </th>
                <th
                  scope="col"
                  className="py-3.5 px-4 text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 text-center w-[12%]"
                >
                  Detalles
                </th>
              </tr>
            </thead>
            <tbody
              className={`divide-y ${
                isDark
                  ? "divide-white/[0.04] bg-[#16161a]"
                  : "divide-black/[0.04] bg-white"
              }`}
            >
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-6 h-6 border-2 border-[#00345e] border-t-transparent rounded-full animate-spin" />
                      <span className="text-xs text-zinc-400">
                        Cargando tus inscripciones...
                      </span>
                    </div>
                  </td>
                </tr>
              ) : paginatedItems.length > 0 ? (
                paginatedItems.map((item) => {
                  const isCongress = Boolean(item.id_congress);
                  const effectiveTitle =
                    item.course_title ||
                    item.congress_title ||
                    item.title ||
                    "Programa Académico";
                  const category =
                    item.course_category_name || (isCongress ? "Congreso Internacional" : "General");
                  const rawStatus = (item.status || "INTERESADO").toUpperCase();
                  const isPaid = rawStatus === "PAGADO" || rawStatus === "FACTURADO";
                  const isOrderGenerated = rawStatus === "ORDEN_GENERADA" || rawStatus === "GENERADA LA ORDEN";
                  const hasReceiptUploaded =
                    Boolean(item.payment_order_url) &&
                    item.payment_order_url !== "local" &&
                    !item.payment_order_url.includes("payment-order/download");

                  return (
                    <tr
                      key={item.id}
                      className={`transition-colors ${
                        isDark ? "hover:bg-white/[0.02]" : "hover:bg-zinc-50/70"
                      }`}
                    >
                      {/* 1. Programa Académico (Nombre clickeable y subtítulo limpio) */}
                      <td className="py-3.5 px-5 align-middle">
                        <div className="flex flex-col pr-2">
                          <button
                            type="button"
                            onClick={() => handleNavigateDetail(item)}
                            className={`text-left text-xs sm:text-sm font-semibold truncate transition-colors cursor-pointer ${
                              isDark
                                ? "text-zinc-100 hover:text-blue-400"
                                : "text-zinc-900 hover:text-[#00345e]"
                            }`}
                            title={effectiveTitle}
                          >
                            {effectiveTitle}
                          </button>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[11px] text-zinc-400 dark:text-zinc-500 truncate">
                              {isCongress
                                ? "Congreso Internacional · Campus Huachi FISEI"
                                : `Curso de Capacitación · ${category}`}
                            </span>
                            {item.tariff_type && (
                              <span className="text-[10px] font-medium text-[#00345e] dark:text-blue-400 whitespace-nowrap">
                                · {item.tariff_type} {item.amount ? `($${Number(item.amount).toFixed(2)})` : ""}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* 2. Fecha Registro */}
                      <td className="py-3.5 px-3 align-middle">
                        <span className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">
                          {formatDate(item.enrollment_date)}
                        </span>
                      </td>

                      {/* 3. Estado */}
                      <td className="py-3.5 px-3 align-middle">
                        {isPaid ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Pagado
                          </span>
                        ) : hasReceiptUploaded ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            En Revisión
                          </span>
                        ) : isOrderGenerated ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            Orden Generada
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-zinc-500/10 text-zinc-600 dark:text-zinc-300 border border-zinc-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
                            Pendiente
                          </span>
                        )}
                      </td>

                      {/* 4. Columna Dedicada: Comprobante y Orden de Pago */}
                      <td className="py-3.5 px-4 align-middle">
                        <div className="flex items-center gap-2">
                          {isPaid ? (
                            <button
                              type="button"
                              onClick={() => handleDownloadRide(item)}
                              disabled={downloadingRideId === item.id}
                              className="h-8 px-3 rounded-lg text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50 hover:bg-emerald-100 transition-colors inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                              title="Descargar Comprobante Tributario Electrónico Oficial RIDE (SRI/UTA)"
                            >
                              <DocumentTextIcon className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                              <span>{downloadingRideId === item.id ? "Descargando..." : "Factura / RIDE (PDF)"}</span>
                            </button>
                          ) : (
                            <>
                              {/* Botón Orden de Pago (Ventanilla / Código Financiero UTA) */}
                              <button
                                type="button"
                                onClick={() => handleGenerateOrDownloadUtaOrder(item)}
                                disabled={generatingOrderId === item.id}
                                className="h-8 px-2.5 rounded-lg text-xs font-bold bg-[#00345e] hover:bg-[#002747] text-white transition-colors inline-flex items-center gap-1.5 shadow-2xs cursor-pointer disabled:opacity-50"
                                title="Generar o descargar la Orden de Pago para pagar en ventanillas de Dirección Financiera o por transferencia"
                              >
                                <ArrowDownTrayIcon className="w-3.5 h-3.5" />
                                <span className="whitespace-nowrap">
                                  {generatingOrderId === item.id
                                    ? "Procesando..."
                                    : isOrderGenerated
                                    ? "Orden UTA"
                                    : "Orden de Pago"}
                                </span>
                              </button>

                              {/* Botón Subir / Actualizar Comprobante (Transferencia) */}
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedForReceipt(item);
                                  setIsReceiptModalOpen(true);
                                }}
                                className={`h-8 px-2.5 rounded-lg text-xs font-semibold border transition-colors inline-flex items-center gap-1.5 cursor-pointer ${
                                  hasReceiptUploaded
                                    ? "bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800/40 hover:bg-amber-100"
                                    : isDark
                                    ? "bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border-white/10"
                                    : "bg-white hover:bg-zinc-50 text-zinc-700 border-zinc-300 shadow-2xs"
                                }`}
                                title="Subir el comprobante de transferencia bancaria"
                              >
                                <DocumentArrowUpIcon className="w-3.5 h-3.5" />
                                <span className="whitespace-nowrap">
                                  {hasReceiptUploaded ? "Actualizar" : "Comprobante"}
                                </span>
                              </button>
                            </>
                          )}
                        </div>
                      </td>

                      {/* 5. Columna Dedicada: Detalles */}
                      <td className="py-3.5 px-4 align-middle text-center">
                        <button
                          type="button"
                          onClick={() => handleNavigateDetail(item)}
                          className={`h-8 px-3 rounded-lg text-xs font-semibold border transition-colors inline-flex items-center justify-center gap-1.5 cursor-pointer ${
                            isDark
                              ? "bg-zinc-800/60 hover:bg-zinc-700 text-zinc-200 border-white/10"
                              : "bg-zinc-50 hover:bg-zinc-100 text-zinc-800 border-zinc-200 shadow-2xs"
                          }`}
                          title="Ver temario, objetivos y detalles completos del programa"
                        >
                          <EyeIcon className="w-3.5 h-3.5 text-zinc-500" />
                          <span>Ver Detalles</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="py-12 text-center">
                    <AcademicCapIcon className="w-8 h-8 mx-auto text-zinc-400 mb-2" />
                    <p className={`text-sm font-semibold ${isDark ? "text-zinc-300" : "text-zinc-700"}`}>
                      No se encontraron registros
                    </p>
                    <p className="text-xs text-zinc-400">
                      {searchQuery
                        ? "No hay resultados para tu búsqueda."
                        : "No tienes inscripciones en esta categoría."}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {totalPages > 1 && (
          <div
            className={`flex items-center justify-between px-5 py-3 border-t text-xs ${
              isDark
                ? "border-white/[0.06] bg-[#121215] text-zinc-400"
                : "border-black/[0.06] bg-zinc-50 text-zinc-600"
            }`}
          >
            <span>
              Mostrando {startIndex + 1} a {Math.min(startIndex + pageSize, totalItems)} de {totalItems} programas
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-2.5 py-1 rounded-md border border-zinc-300 dark:border-zinc-700 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                Anterior
              </button>
              <span className="font-medium">
                Página {page} de {totalPages}
              </span>
              <button
                type="button"
                disabled={page === totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="px-2.5 py-1 rounded-md border border-zinc-300 dark:border-zinc-700 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal para Subir / Actualizar Comprobante */}
      {isReceiptModalOpen && selectedForReceipt && (
        <PaymentReceiptModal
          isOpen={isReceiptModalOpen}
          onClose={() => {
            setIsReceiptModalOpen(false);
            setSelectedForReceipt(null);
          }}
          enrollment={selectedForReceipt}
          onSuccess={(msg) => {
            setUploadSuccessMessage(msg || "Comprobante de pago subido correctamente.");
            loadEnrollments();
          }}
        />
      )}
    </div>
  );
}
