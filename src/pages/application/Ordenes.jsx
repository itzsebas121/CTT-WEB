import { useCallback, useEffect, useState, useMemo } from "react";
import { getUserEnrollments, uploadPaymentReceiptTemp } from "../../api/inscripciones";
import { useNavigate } from "react-router-dom";
import { Table } from "../../components/ui";
import { useDashboardTheme } from "../../context/DashboardThemeContext";
import {
  ClockIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  MagnifyingGlassIcon,
  DocumentArrowUpIcon,
  ArrowPathIcon
} from "@heroicons/react/24/outline";

const headers = ["programa", "categoria", "fecha", "estado", "acciones"];

export default function Ordenes({ type = "pendientes" }) {
  const isPending = type === "pendientes";
  const [rawEnrollments, setRawEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(7);
  const [searchQuery, setSearchQuery] = useState("");
  const [uploadSuccessMessage, setUploadSuccessMessage] = useState("");
  const [uploadingId, setUploadingId] = useState(null);
  const { isDark } = useDashboardTheme();
  const navigate = useNavigate();

  const loadOrders = useCallback(async () => {
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
      const allEnrollments = response.enrollments || [];

      // Filtrar según tipo de orden
      const filtered = allEnrollments.filter((item) => {
        const st = item.status || "Interesado";
        if (isPending) {
          return st === "Interesado" || st === "Generada la orden";
        } else {
          return st === "Pagado" || st === "Facturado";
        }
      });

      setRawEnrollments(filtered);
    } catch (err) {
      if (err.message === "UNAUTHORIZED") {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
      } else {
        setError(err.message || "Error al cargar las órdenes");
      }
    } finally {
      setLoading(false);
    }
  }, [navigate, isPending]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const handleUploadReceipt = async (enrollmentId, courseTitle, event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    try {
      setUploadingId(enrollmentId);
      setError(null);
      setUploadSuccessMessage("");

      await uploadPaymentReceiptTemp(enrollmentId, file);
      setUploadSuccessMessage(`Comprobante subido correctamente para "${courseTitle}".`);
      await loadOrders();
    } catch (err) {
      if (err.message === "UNAUTHORIZED") {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
      } else {
        setError(err.message || "No se pudo subir el comprobante.");
      }
    } finally {
      setUploadingId(null);
    }
  };

  // Filtrado por buscador
  const filteredEnrollments = useMemo(() => {
    if (!searchQuery.trim()) return rawEnrollments;
    const q = searchQuery.toLowerCase().trim();
    return rawEnrollments.filter((item) => {
      const title = (item.course_title || item.congress_title || item.title || "").toLowerCase();
      const cat = (item.course_category_name || "").toLowerCase();
      return title.includes(q) || cat.includes(q);
    });
  }, [rawEnrollments, searchQuery]);

  const ordersData = useMemo(() => {
    return filteredEnrollments.map((order) => {
      const orderDate = new Date(order.enrollment_date);
      const formattedDate = orderDate.toLocaleDateString("es-ES", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });

      const isCongress = Boolean(order.id_congress);
      const title =
        order.course_title ||
        order.congress_title ||
        order.title ||
        (isCongress ? "Congreso Académico" : "Curso de Capacitación");
      const category = order.course_category_name || (isCongress ? "Congreso" : "General");
      const status = order.status || "Interesado";

      return {
        id: order.id,
        programa: (
          <div className="flex items-center gap-2.5 py-1">
            <span
              className={`w-2 h-2 rounded-full flex-shrink-0 ${
                isPending ? "bg-amber-400" : "bg-emerald-400"
              }`}
            />
            <button
              type="button"
              onClick={() => {
                if (order.id_course) navigate(`/dashboard/curso/${order.id_course}`);
                else if (order.id_congress) navigate(`/dashboard/congreso/${order.id_congress}`);
              }}
              className={`font-semibold text-xs sm:text-sm text-left truncate transition-colors cursor-pointer border-0 bg-transparent p-0 ${
                isDark ? "text-zinc-100 hover:text-blue-400" : "text-zinc-900 hover:text-[#00345e]"
              }`}
              title={title}
            >
              {title}
            </button>
          </div>
        ),
        categoria: (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold whitespace-nowrap border ${
              isCongress
                ? isDark
                  ? "bg-purple-950/40 text-purple-300 border-purple-800/40"
                  : "bg-purple-50 text-purple-700 border-purple-200"
                : isDark
                ? "bg-blue-950/40 text-blue-300 border-blue-800/40"
                : "bg-blue-50 text-[#00345e] border-blue-200"
            }`}
          >
            {category}
          </span>
        ),
        fecha: (
          <span className={`text-xs ${isDark ? "text-zinc-300" : "text-zinc-600"}`}>
            {formattedDate}
          </span>
        ),
        estado: (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border ${
              status === "Pagado" || status === "Facturado"
                ? isDark
                  ? "bg-emerald-950/40 text-emerald-300 border-emerald-800/40"
                  : "bg-emerald-50 text-emerald-700 border-emerald-200"
                : status === "Generada la orden"
                ? isDark
                  ? "bg-amber-950/40 text-amber-300 border-amber-800/40"
                  : "bg-amber-50 text-amber-700 border-amber-200"
                : isDark
                ? "bg-sky-950/40 text-sky-300 border-sky-800/40"
                : "bg-sky-50 text-sky-700 border-sky-200"
            }`}
          >
            {status}
          </span>
        ),
        acciones: (
          <div className="flex items-center justify-end gap-2 whitespace-nowrap">
            {isPending && (
              <label
                className={`h-8 px-3 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border ${
                  uploadingId === order.id
                    ? "opacity-50 cursor-not-allowed"
                    : isDark
                    ? "bg-[#00345e] hover:bg-[#004f8c] text-white border-blue-400/30"
                    : "bg-[#00345e] hover:bg-[#002747] text-white border-[#00345e]"
                }`}
              >
                {uploadingId === order.id ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Subiendo...</span>
                  </>
                ) : (
                  <>
                    <DocumentArrowUpIcon className="w-4 h-4" />
                    <span>Subir Comprobante</span>
                  </>
                )}
                <input
                  type="file"
                  accept=".pdf,image/*"
                  onChange={(e) => handleUploadReceipt(order.id, title, e)}
                  disabled={uploadingId === order.id}
                  className="sr-only"
                />
              </label>
            )}

            <button
              type="button"
              onClick={() => {
                if (order.id_course) navigate(`/dashboard/curso/${order.id_course}`);
                else if (order.id_congress) navigate(`/dashboard/congreso/${order.id_congress}`);
              }}
              className={`h-8 px-3 rounded-lg text-xs font-medium transition-colors cursor-pointer border ${
                isDark
                  ? "bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border-white/10"
                  : "bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border-zinc-200"
              }`}
            >
              Ver Detalle
            </button>
          </div>
        ),
      };
    });
  }, [filteredEnrollments, isDark, isPending, navigate, uploadingId]);

  return (
    <div className="w-full space-y-6">
      {/* Encabezado Principal estilo Dokploy */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1
            className={`text-2xl sm:text-3xl font-bold tracking-tight ${
              isDark ? "text-white" : "text-zinc-900"
            }`}
          >
            {isPending ? "Órdenes de Pago Pendientes" : "Órdenes Completadas y Facturadas"}
          </h1>
          <p
            className={`text-xs mt-1 max-w-2xl font-normal leading-relaxed ${
              isDark ? "text-zinc-400" : "text-zinc-500"
            }`}
          >
            {isPending
              ? "Revisa tus órdenes emitidas, pendientes de pago o pendientes de validación de comprobante bancario."
              : "Historial de pagos validados, matriculación confirmada y facturas emitidas por el CTT."}
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/dashboard/cursos/disponibles")}
          className={`h-9 px-4 rounded-lg text-xs font-medium flex items-center gap-2 transition-colors cursor-pointer self-start sm:self-auto border ${
            isDark
              ? "bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white border-white/10"
              : "bg-zinc-100 hover:bg-zinc-200 text-zinc-800 hover:text-zinc-950 border-zinc-200 shadow-xs"
          }`}
        >
          <span>Ver Cursos Disponibles</span>
          <ArrowRightIcon className={`w-3.5 h-3.5 ${isDark ? "text-zinc-400" : "text-zinc-500"}`} />
        </button>
      </div>

      {/* Alertas de Notificación */}
      {uploadSuccessMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 flex items-center justify-between">
          <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">
            {uploadSuccessMessage}
          </p>
          <button
            type="button"
            onClick={() => setUploadSuccessMessage("")}
            className="text-emerald-600 hover:text-emerald-800 text-xs font-bold cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 flex items-center justify-between">
          <p className="text-xs font-semibold text-red-700 dark:text-red-300">{error}</p>
          <button
            type="button"
            onClick={loadOrders}
            className="text-xs font-bold text-red-600 hover:text-red-800 cursor-pointer flex items-center gap-1"
          >
            <ArrowPathIcon className="w-3.5 h-3.5" />
            <span>Reintentar</span>
          </button>
        </div>
      )}

      {/* KPI Cards estilo Dokploy */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div
          className={`rounded-xl p-4 sm:p-5 flex flex-col justify-between transition-colors border ${
            isDark
              ? "bg-[#16161a] border-white/[0.08] shadow-sm"
              : "bg-white border-black/[0.08] shadow-xs"
          }`}
        >
          <span
            className={`text-[11px] font-semibold uppercase tracking-wider ${
              isDark ? "text-zinc-400" : "text-zinc-500"
            }`}
          >
            Total Órdenes
          </span>
          <div className="my-2">
            <span
              className={`text-2xl sm:text-3xl font-bold tracking-tight ${
                isDark ? "text-white" : "text-zinc-900"
              }`}
            >
              {rawEnrollments.length}
            </span>
          </div>
          <span className={`text-xs ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>
            {isPending ? "órdenes por liquidar" : "órdenes liquidadas"}
          </span>
        </div>

        <div
          className={`rounded-xl p-4 sm:p-5 flex flex-col justify-between transition-colors border ${
            isDark
              ? "bg-[#16161a] border-white/[0.08] shadow-sm"
              : "bg-white border-black/[0.08] shadow-xs"
          }`}
        >
          <span
            className={`text-[11px] font-semibold uppercase tracking-wider ${
              isDark ? "text-zinc-400" : "text-zinc-500"
            }`}
          >
            Estado del Módulo
          </span>
          <div className="my-2 flex items-center gap-2">
            {isPending ? (
              <ClockIcon className="w-6 h-6 text-amber-500" />
            ) : (
              <CheckCircleIcon className="w-6 h-6 text-emerald-500" />
            )}
            <span
              className={`text-base font-bold ${
                isPending
                  ? "text-amber-600 dark:text-amber-400"
                  : "text-emerald-600 dark:text-emerald-400"
              }`}
            >
              {isPending ? "En Gestión Bancaria" : "Matriculados 100%"}
            </span>
          </div>
          <span className={`text-xs ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>
            {isPending ? "esperando confirmación" : "registro oficial completado"}
          </span>
        </div>

        <div
          className={`rounded-xl p-4 sm:p-5 flex flex-col justify-between transition-colors border ${
            isDark
              ? "bg-[#16161a] border-white/[0.08] shadow-sm"
              : "bg-white border-black/[0.08] shadow-xs"
          }`}
        >
          <span
            className={`text-[11px] font-semibold uppercase tracking-wider ${
              isDark ? "text-zinc-400" : "text-zinc-500"
            }`}
          >
            Soporte Administrativo
          </span>
          <div className="my-2">
            <span
              className={`text-xs font-semibold ${isDark ? "text-zinc-200" : "text-zinc-800"}`}
            >
              talleresfisei@uta.edu.ec
            </span>
          </div>
          <span className={`text-xs ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>
            consultas sobre pagos y facturación
          </span>
        </div>
      </div>

      {/* Buscador de Órdenes */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <MagnifyingGlassIcon
            className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 ${
              isDark ? "text-zinc-500" : "text-zinc-400"
            }`}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por programa o categoría..."
            className={`w-full pl-9 pr-4 py-2 rounded-xl text-xs sm:text-sm border transition-all ${
              isDark
                ? "bg-[#16161a] border-white/[0.08] text-white placeholder-zinc-500 focus:border-blue-500"
                : "bg-white border-zinc-200 text-zinc-900 placeholder-zinc-400 focus:border-[#00345e]"
            } focus:outline-hidden shadow-xs`}
          />
        </div>

        <button
          type="button"
          onClick={loadOrders}
          className={`h-9 px-3 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer border ${
            isDark
              ? "bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white border-white/10"
              : "bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border-zinc-200"
          }`}
          title="Actualizar lista"
        >
          <ArrowPathIcon className="w-3.5 h-3.5" />
          <span>Actualizar</span>
        </button>
      </div>

      {/* Contenedor de la Tabla o Estado Vacío */}
      <div
        className={`rounded-2xl border overflow-hidden transition-colors ${
          isDark
            ? "bg-[#16161a] border-white/[0.08] shadow-sm"
            : "bg-white border-black/[0.08] shadow-xs"
        }`}
      >
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#00345e] border-t-transparent mb-3" />
            <span
              className={`text-xs font-semibold ${
                isDark ? "text-zinc-400" : "text-zinc-500"
              }`}
            >
              Cargando órdenes...
            </span>
          </div>
        ) : ordersData.length === 0 ? (
          <div className="py-20 text-center max-w-md mx-auto px-4">
            <div
              className={`w-14 h-14 mx-auto mb-3 rounded-2xl flex items-center justify-center ${
                isDark ? "bg-zinc-800 text-zinc-500" : "bg-zinc-100 text-zinc-400"
              }`}
            >
              {isPending ? (
                <ClockIcon className="w-7 h-7" />
              ) : (
                <CheckCircleIcon className="w-7 h-7" />
              )}
            </div>
            <h3
              className={`text-base font-bold ${isDark ? "text-white" : "text-zinc-900"}`}
            >
              {isPending
                ? "No tienes órdenes pendientes"
                : "No tienes órdenes completadas"}
            </h3>
            <p
              className={`mt-1 text-xs leading-relaxed ${
                isDark ? "text-zinc-400" : "text-zinc-500"
              }`}
            >
              {isPending
                ? "Todas tus inscripciones se encuentran al día o no has generado nuevas órdenes de pago."
                : "Tus órdenes confirmadas y facturadas aparecerán en esta sección una vez validado el comprobante."}
            </p>
            <button
              type="button"
              onClick={() => navigate("/dashboard/cursos/disponibles")}
              className="mt-4 px-4 py-2 bg-[#00345e] hover:bg-[#002747] text-white text-xs font-semibold rounded-xl transition cursor-pointer shadow-xs border-0"
            >
              Explorar Catálogo
            </button>
          </div>
        ) : (
          <Table
            data={ordersData}
            headers={headers}
            page={page}
            pageSize={pageSize}
            totalItems={ordersData.length}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
          />
        )}
      </div>
    </div>
  );
}

