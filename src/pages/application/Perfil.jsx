import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  UserIcon,
  BuildingLibraryIcon,
  KeyIcon,
  CreditCardIcon,
  LockClosedIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ArrowDownTrayIcon,
  DocumentTextIcon,
  QrCodeIcon,
  DocumentArrowUpIcon,
  EyeIcon,
  EyeSlashIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { getUser, getToken, saveAuthData } from "../../utils/auth";
import { getProfile } from "../../api/auth";
import { getUserEnrollments, downloadUtaPaymentOrder, generateUtaPaymentOrder } from "../../api/inscripciones";
import api from "../../api/api";
import { useDashboardTheme } from "../../context/DashboardThemeContext";
import { PaymentReceiptModal } from "../../components/ui";

export default function Perfil() {
  const navigate = useNavigate();
  const { isDark } = useDashboardTheme();

  // Estado de usuario y autenticación
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Pestaña activa: "personal" | "billing" | "security" | "finance"
  const [activeTab, setActiveTab] = useState("personal");

  // Feedback de alertas
  const [feedback, setFeedback] = useState({ type: null, message: null });

  // 1. Tab Datos Personales
  const [personalForm, setPersonalForm] = useState({
    first_name: "",
    last_name: "",
    identification: "",
    email: "",
    phone: "",
    address: "",
  });
  const [savingPersonal, setSavingPersonal] = useState(false);

  // 2. Tab Facturación SRI
  const [billingForm, setBillingForm] = useState({
    billing_identification: "",
    billing_name: "",
    billing_address: "",
    billing_phone: "",
    billing_email: "",
  });
  const [savingBilling, setSavingBilling] = useState(false);

  // 3. Tab Seguridad
  const [securityForm, setSecurityForm] = useState({
    current_password: "",
    new_password: "",
    confirm_new_password: "",
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [savingSecurity, setSavingSecurity] = useState(false);

  // 4. Tab Historial Financiero
  const [enrollments, setEnrollments] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [selectedForReceipt, setSelectedForReceipt] = useState(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [downloadingRideId, setDownloadingRideId] = useState(null);
  const [generatingOrderId, setGeneratingOrderId] = useState(null);

  // Carga inicial del perfil del usuario
  useEffect(() => {
    const rawUser = getUser();
    const storedToken = getToken();

    if (!rawUser || !storedToken) {
      navigate("/login");
      return;
    }

    setCurrentUser(rawUser);
    setToken(storedToken);

    // Inicializar datos base desde localStorage
    const fullName = `${rawUser.first_name || ""} ${rawUser.second_name || ""}`.trim();
    const fullLastName = `${rawUser.first_last_name || ""} ${rawUser.second_last_name || ""}`.trim();

    setPersonalForm({
      first_name: rawUser.first_name || fullName || "",
      last_name: rawUser.first_last_name || fullLastName || rawUser.last_name || "",
      identification: rawUser.identification || "",
      email: rawUser.email || "",
      phone: rawUser.cellphone || rawUser.phone || "",
      address: rawUser.address || "",
    });

    setBillingForm({
      billing_identification: rawUser.billing_identification || rawUser.identification || "",
      billing_name: rawUser.billing_name || `${rawUser.first_name || ""} ${rawUser.first_last_name || ""}`.trim() || "",
      billing_address: rawUser.billing_address || rawUser.address || "",
      billing_phone: rawUser.billing_phone || rawUser.cellphone || rawUser.phone || "",
      billing_email: rawUser.billing_email || rawUser.email || "",
    });

    // Intentar refrescar perfil desde el backend
    getProfile(storedToken)
      .then((profileData) => {
        if (profileData) {
          setCurrentUser(profileData);
          saveAuthData(storedToken, profileData);

          setPersonalForm({
            first_name: profileData.first_name || "",
            last_name: profileData.first_last_name || profileData.last_name || "",
            identification: profileData.identification || "",
            email: profileData.email || "",
            phone: profileData.cellphone || profileData.phone || "",
            address: profileData.address || "",
          });

          setBillingForm({
            billing_identification: profileData.billing_identification || profileData.identification || "",
            billing_name: profileData.billing_name || `${profileData.first_name || ""} ${profileData.first_last_name || ""}`.trim() || "",
            billing_address: profileData.billing_address || profileData.address || "",
            billing_phone: profileData.billing_phone || profileData.cellphone || profileData.phone || "",
            billing_email: profileData.billing_email || profileData.email || "",
          });
        }
      })
      .catch(() => {
        // En caso de modo offline o error temporal, continuar con datos de localStorage
      })
      .finally(() => {
        setLoading(false);
      });
  }, [navigate]);

  // Cargar órdenes financieras cuando se activa la pestaña
  const loadFinancialHistory = useCallback(async () => {
    if (!currentUser?.id) return;
    try {
      setLoadingOrders(true);
      const res = await getUserEnrollments(currentUser.id);
      const items = res?.enrollments || res?.data || [];
      setEnrollments(items);
    } catch {
      // Manejo silencioso o estado vacío
    } finally {
      setLoadingOrders(false);
    }
  }, [currentUser?.id]);

  useEffect(() => {
    if (activeTab === "finance") {
      loadFinancialHistory();
    }
  }, [activeTab, loadFinancialHistory]);

  // Métricas financieras calculadas
  const financialMetrics = useMemo(() => {
    const totalOrders = enrollments.length;
    const paidOrders = enrollments.filter((e) => {
      const st = (e.status || "").toUpperCase();
      return st === "PAGADO" || st === "FACTURADO";
    }).length;
    const pendingOrders = totalOrders - paidOrders;
    return { totalOrders, paidOrders, pendingOrders };
  }, [enrollments]);

  // Limpiar mensajes después de 4 segundos
  useEffect(() => {
    if (feedback.message) {
      const timer = setTimeout(() => {
        setFeedback({ type: null, message: null });
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  // 1. Guardar Información Personal
  const handleSavePersonal = async (e) => {
    e.preventDefault();
    if (!currentUser?.id) return;

    try {
      setSavingPersonal(true);
      setFeedback({ type: null, message: null });

      const payload = {
        first_name: personalForm.first_name.trim(),
        last_name: personalForm.last_name.trim(),
        phone: personalForm.phone.trim(),
        address: personalForm.address.trim(),
      };

      const response = await api.put(
        `/users/${currentUser.id}/profile`,
        payload,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );

      // Actualizar localStorage y estado local
      const updatedUser = {
        ...currentUser,
        first_name: payload.first_name,
        last_name: payload.last_name,
        cellphone: payload.phone,
        phone: payload.phone,
        address: payload.address,
      };
      setCurrentUser(updatedUser);
      saveAuthData(token, updatedUser);

      setFeedback({
        type: "success",
        message: response.data?.message || "Información personal actualizada correctamente.",
      });
    } catch (err) {
      const errorDetail =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        err.message ||
        "Error al actualizar la información personal.";
      setFeedback({ type: "error", message: errorDetail });
    } finally {
      setSavingPersonal(false);
    }
  };

  // 2. Guardar Datos de Facturación SRI
  const handleSaveBilling = async (e) => {
    e.preventDefault();
    if (!currentUser?.id) return;

    try {
      setSavingBilling(true);
      setFeedback({ type: null, message: null });

      const payload = {
        billing_identification: billingForm.billing_identification.trim(),
        billing_name: billingForm.billing_name.trim(),
        billing_address: billingForm.billing_address.trim(),
        billing_phone: billingForm.billing_phone.trim(),
        billing_email: billingForm.billing_email.trim(),
      };

      const response = await api.put(
        `/users/${currentUser.id}/billing`,
        payload,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );

      const updatedUser = {
        ...currentUser,
        ...payload,
      };
      setCurrentUser(updatedUser);
      saveAuthData(token, updatedUser);

      setFeedback({
        type: "success",
        message: response.data?.message || "Datos de facturación SRI actualizados correctamente.",
      });
    } catch (err) {
      const errorDetail =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        err.message ||
        "Error al actualizar los datos de facturación.";
      setFeedback({ type: "error", message: errorDetail });
    } finally {
      setSavingBilling(false);
    }
  };

  // 3. Cambiar Contraseña de Seguridad
  const handleSaveSecurity = async (e) => {
    e.preventDefault();
    if (!currentUser?.id) return;

    const { current_password, new_password, confirm_new_password } = securityForm;

    if (!current_password) {
      setFeedback({ type: "error", message: "Ingresa tu contraseña actual." });
      return;
    }

    if (!new_password || new_password.length < 6) {
      setFeedback({
        type: "error",
        message: "La nueva contraseña debe tener al menos 6 caracteres.",
      });
      return;
    }

    if (new_password !== confirm_new_password) {
      setFeedback({
        type: "error",
        message: "La nueva contraseña y su confirmación no coinciden.",
      });
      return;
    }

    try {
      setSavingSecurity(true);
      setFeedback({ type: null, message: null });

      const payload = {
        current_password,
        new_password,
      };

      const response = await api.put(
        `/users/${currentUser.id}/password`,
        payload,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );

      setSecurityForm({
        current_password: "",
        new_password: "",
        confirm_new_password: "",
      });

      setFeedback({
        type: "success",
        message: response.data?.message || "Contraseña actualizada exitosamente.",
      });
    } catch (err) {
      const errorDetail =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        err.message ||
        "Error al actualizar la contraseña.";
      setFeedback({ type: "error", message: errorDetail });
    } finally {
      setSavingSecurity(false);
    }
  };

  // Descarga del Comprobante RIDE
  const handleDownloadRide = async (item) => {
    try {
      setDownloadingRideId(item.id);
      setFeedback({ type: null, message: null });
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
        } catch {
          // ignore
        }
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

      setFeedback({
        type: "success",
        message: "Comprobante RIDE oficial descargado correctamente.",
      });
    } catch (err) {
      console.error("Error al descargar RIDE:", err);
      setFeedback({
        type: "error",
        message: err.message || "Error al descargar el comprobante RIDE oficial (PDF).",
      });
    } finally {
      setDownloadingRideId(null);
    }
  };

  // Generación y descarga de la Orden de Pago UTA oficial
  const handleGenerateOrDownloadUtaOrder = async (item) => {
    try {
      setGeneratingOrderId(item.id);
      setFeedback({ type: null, message: null });

      const rawStatus = (item.status || "").toUpperCase();
      if (rawStatus === "ORDEN_GENERADA" || rawStatus === "GENERADA LA ORDEN") {
        await downloadUtaPaymentOrder(item.id);
        setFeedback({
          type: "success",
          message: "Orden de Pago UTA descargada. Preséntala en Dirección Financiera o transfiere con tu código.",
        });
        return;
      }

      const res = await generateUtaPaymentOrder(item.id);
      if (res && res.status === "success") {
        await downloadUtaPaymentOrder(item.id);
        setFeedback({
          type: "success",
          message: `Orden de Pago generada (${res.order_data?.order_code || "UTA"}). Descarga completada con éxito.`,
        });
        loadFinancialHistory();
      }
    } catch (err) {
      console.error("Error al gestionar orden de pago UTA:", err);
      setFeedback({
        type: "error",
        message: err.message || "Error al generar o descargar la Orden de Pago UTA.",
      });
    } finally {
      setGeneratingOrderId(null);
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

  if (loading) {
    return (
      <div className="w-full py-16 flex flex-col items-center justify-center gap-3">
        <div className="w-7 h-7 border-2 border-[#00345e] border-t-transparent rounded-full animate-spin" />
        <span className="text-xs text-zinc-400">Cargando perfil del usuario...</span>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Encabezado Principal Limpio y Directo (Sin cápsulas decorativas sobre h1 según AGENTS.md) */}
      <div className="space-y-1">
        <h1
          className={`text-2xl sm:text-3xl font-bold tracking-tight ${
            isDark ? "text-white" : "text-zinc-900"
          }`}
        >
          Mi Perfil de Usuario
        </h1>
        <p
          className={`text-xs sm:text-sm font-normal ${
            isDark ? "text-zinc-400" : "text-zinc-500"
          }`}
        >
          Gestiona tu información personal, datos fiscales para facturación electrónica del SRI, credenciales de seguridad e historial de pagos.
        </p>
      </div>

      {/* Alertas de Notificación / Feedback */}
      {feedback.message && (
        <div
          className={`p-4 rounded-xl border text-xs sm:text-sm font-medium flex items-center gap-2.5 transition-all ${
            feedback.type === "success"
              ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-500/20 text-emerald-800 dark:text-emerald-300"
              : "bg-rose-50 dark:bg-rose-950/30 border-rose-500/20 text-rose-800 dark:text-rose-300"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircleIcon className="w-5 h-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
          ) : (
            <ExclamationCircleIcon className="w-5 h-5 shrink-0 text-rose-600 dark:text-rose-400" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Barra de Pestañas con Desplazamiento Suave en Móvil */}
      <div
        className={`border-b flex items-center gap-2 overflow-x-auto scrollbar-none pb-px ${
          isDark ? "border-white/[0.08]" : "border-black/[0.08]"
        }`}
      >
        <button
          type="button"
          onClick={() => setActiveTab("personal")}
          className={`h-11 px-4 rounded-t-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer border-b-2 ${
            activeTab === "personal"
              ? "border-[#00345e] text-[#00345e] dark:text-blue-400 dark:border-blue-400 bg-[#00345e]/5 dark:bg-blue-400/10"
              : "border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200"
          }`}
        >
          <UserIcon className="w-4 h-4" />
          <span>Datos Personales</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("billing")}
          className={`h-11 px-4 rounded-t-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer border-b-2 ${
            activeTab === "billing"
              ? "border-[#00345e] text-[#00345e] dark:text-blue-400 dark:border-blue-400 bg-[#00345e]/5 dark:bg-blue-400/10"
              : "border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200"
          }`}
        >
          <BuildingLibraryIcon className="w-4 h-4" />
          <span>Facturación SRI</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("security")}
          className={`h-11 px-4 rounded-t-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer border-b-2 ${
            activeTab === "security"
              ? "border-[#00345e] text-[#00345e] dark:text-blue-400 dark:border-blue-400 bg-[#00345e]/5 dark:bg-blue-400/10"
              : "border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200"
          }`}
        >
          <KeyIcon className="w-4 h-4" />
          <span>Seguridad</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("finance")}
          className={`h-11 px-4 rounded-t-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer border-b-2 ${
            activeTab === "finance"
              ? "border-[#00345e] text-[#00345e] dark:text-blue-400 dark:border-blue-400 bg-[#00345e]/5 dark:bg-blue-400/10"
              : "border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200"
          }`}
        >
          <CreditCardIcon className="w-4 h-4" />
          <span>Historial Académico</span>
        </button>
      </div>

      {/* Contenedor Principal del Formulario o Vistas */}
      <div
        className={`p-5 sm:p-7 rounded-2xl border transition-colors shadow-2xs ${
          isDark
            ? "bg-[#16161a] border-white/[0.08]"
            : "bg-white border-black/[0.08]"
        }`}
      >
        {/* TAB 1: DATOS PERSONALES */}
        {activeTab === "personal" && (
          <form onSubmit={handleSavePersonal} className="space-y-6">
            <div>
              <h2
                className={`text-base sm:text-lg font-bold tracking-tight ${
                  isDark ? "text-white" : "text-zinc-900"
                }`}
              >
                Información Personal del Estudiante
              </h2>
              <p
                className={`text-xs mt-0.5 ${
                  isDark ? "text-zinc-400" : "text-zinc-500"
                }`}
              >
                Mantén tus datos actualizados para la emisión correcta de tus certificaciones y constancias académicas.
              </p>
            </div>

            {/* Grid de Formulario: 1 columna en móvil (<sm), 2 columnas en tablet/escritorio (>=sm) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Nombres */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Nombres Completos
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={personalForm.first_name}
                    onChange={(e) =>
                      setPersonalForm((prev) => ({ ...prev, first_name: e.target.value }))
                    }
                    placeholder="Ej. Juan Carlos"
                    className={`w-full h-11 px-3.5 rounded-xl text-xs sm:text-sm border transition-colors focus:outline-none focus:ring-2 focus:ring-[#00345e]/20 ${
                      isDark
                        ? "bg-zinc-900 border-white/10 text-white focus:border-blue-400"
                        : "bg-zinc-50 border-zinc-200 text-zinc-900 focus:border-[#00345e]"
                    }`}
                  />
                </div>
              </div>

              {/* Apellidos */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Apellidos Completos
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={personalForm.last_name}
                    onChange={(e) =>
                      setPersonalForm((prev) => ({ ...prev, last_name: e.target.value }))
                    }
                    placeholder="Ej. Pérez Morales"
                    className={`w-full h-11 px-3.5 rounded-xl text-xs sm:text-sm border transition-colors focus:outline-none focus:ring-2 focus:ring-[#00345e]/20 ${
                      isDark
                        ? "bg-zinc-900 border-white/10 text-white focus:border-blue-400"
                        : "bg-zinc-50 border-zinc-200 text-zinc-900 focus:border-[#00345e]"
                    }`}
                  />
                </div>
              </div>

              {/* Identificación (Bloqueada contra suplantación) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Cédula / Identificación Oficial
                  </label>
                  <span className="text-[10px] text-zinc-400 flex items-center gap-1 font-mono">
                    <LockClosedIcon className="w-3 h-3 text-amber-500" />
                    Protegida
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    readOnly
                    disabled
                    value={personalForm.identification}
                    className={`w-full h-11 px-3.5 pl-9 rounded-xl text-xs sm:text-sm border cursor-not-allowed font-mono opacity-80 ${
                      isDark
                        ? "bg-zinc-900/60 border-white/10 text-zinc-300"
                        : "bg-zinc-100 border-zinc-200 text-zinc-600"
                    }`}
                  />
                  <LockClosedIcon className="w-4 h-4 absolute left-3 top-3.5 text-zinc-400" />
                </div>
                <p className="text-[10px] text-zinc-400">
                  El número de cédula está bloqueado para garantizar la autenticidad académica e impedir suplantaciones.
                </p>
              </div>

              {/* Correo Electrónico Institucional / Personal */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <input
                    type="email"
                    readOnly
                    disabled
                    value={personalForm.email}
                    className={`w-full h-11 px-3.5 pl-9 rounded-xl text-xs sm:text-sm border cursor-not-allowed opacity-80 ${
                      isDark
                        ? "bg-zinc-900/60 border-white/10 text-zinc-300"
                        : "bg-zinc-100 border-zinc-200 text-zinc-600"
                    }`}
                  />
                  <EnvelopeIcon className="w-4 h-4 absolute left-3 top-3.5 text-zinc-400" />
                </div>
              </div>

              {/* Teléfono / Celular */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Teléfono / Celular de Contacto
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    value={personalForm.phone}
                    onChange={(e) =>
                      setPersonalForm((prev) => ({ ...prev, phone: e.target.value }))
                    }
                    placeholder="Ej. 0987654321"
                    className={`w-full h-11 px-3.5 pl-9 rounded-xl text-xs sm:text-sm border transition-colors focus:outline-none focus:ring-2 focus:ring-[#00345e]/20 ${
                      isDark
                        ? "bg-zinc-900 border-white/10 text-white focus:border-blue-400"
                        : "bg-zinc-50 border-zinc-200 text-zinc-900 focus:border-[#00345e]"
                    }`}
                  />
                  <PhoneIcon className="w-4 h-4 absolute left-3 top-3.5 text-zinc-400" />
                </div>
              </div>

              {/* Dirección Domiciliaria */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Dirección Domiciliaria
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={personalForm.address}
                    onChange={(e) =>
                      setPersonalForm((prev) => ({ ...prev, address: e.target.value }))
                    }
                    placeholder="Ej. Av. Los Chasquis y Río Payamino, Ambato"
                    className={`w-full h-11 px-3.5 pl-9 rounded-xl text-xs sm:text-sm border transition-colors focus:outline-none focus:ring-2 focus:ring-[#00345e]/20 ${
                      isDark
                        ? "bg-zinc-900 border-white/10 text-white focus:border-blue-400"
                        : "bg-zinc-50 border-zinc-200 text-zinc-900 focus:border-[#00345e]"
                    }`}
                  />
                  <MapPinIcon className="w-4 h-4 absolute left-3 top-3.5 text-zinc-400" />
                </div>
              </div>
            </div>

            {/* Botón de Guardado (Touch target >= 44px h-11) */}
            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={savingPersonal}
                className="w-full sm:w-auto h-11 px-6 rounded-xl font-semibold text-xs sm:text-sm text-white bg-[#00345e] hover:bg-[#002747] active:bg-[#001f38] transition-all cursor-pointer shadow-xs border-0 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {savingPersonal ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Guardando cambios...</span>
                  </>
                ) : (
                  <>
                    <CheckCircleIcon className="w-4 h-4" />
                    <span>Guardar Información Personal</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* TAB 2: FACTURACIÓN SRI */}
        {activeTab === "billing" && (
          <form onSubmit={handleSaveBilling} className="space-y-6">
            <div>
              <h2
                className={`text-base sm:text-lg font-bold tracking-tight ${
                  isDark ? "text-white" : "text-zinc-900"
                }`}
              >
                Datos Fiscales para Facturación Electrónica (SRI)
              </h2>
              <p
                className={`text-xs mt-0.5 ${
                  isDark ? "text-zinc-400" : "text-zinc-500"
                }`}
              >
                Estos datos se aplican de forma automática al generar tus órdenes de pago y facturas autorizadas del Servicio de Rentas Internas.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* RUC / Cédula SRI */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Identificación / RUC
                </label>
                <input
                  type="text"
                  required
                  value={billingForm.billing_identification}
                  onChange={(e) =>
                    setBillingForm((prev) => ({
                      ...prev,
                      billing_identification: e.target.value,
                    }))
                  }
                  placeholder="Ej. 1801234567001"
                  className={`w-full h-11 px-3.5 rounded-xl text-xs sm:text-sm border font-mono transition-colors focus:outline-none focus:ring-2 focus:ring-[#00345e]/20 ${
                    isDark
                      ? "bg-zinc-900 border-white/10 text-white focus:border-blue-400"
                      : "bg-zinc-50 border-zinc-200 text-zinc-900 focus:border-[#00345e]"
                  }`}
                />
              </div>

              {/* Razón Social */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Razón Social / Nombre Completo
                </label>
                <input
                  type="text"
                  required
                  value={billingForm.billing_name}
                  onChange={(e) =>
                    setBillingForm((prev) => ({
                      ...prev,
                      billing_name: e.target.value,
                    }))
                  }
                  placeholder="Ej. ACME S.A. o Nombre del Contribuyente"
                  className={`w-full h-11 px-3.5 rounded-xl text-xs sm:text-sm border transition-colors focus:outline-none focus:ring-2 focus:ring-[#00345e]/20 ${
                    isDark
                      ? "bg-zinc-900 border-white/10 text-white focus:border-blue-400"
                      : "bg-zinc-50 border-zinc-200 text-zinc-900 focus:border-[#00345e]"
                  }`}
                />
              </div>

              {/* Dirección Fiscal */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Dirección Fiscal
                </label>
                <input
                  type="text"
                  required
                  value={billingForm.billing_address}
                  onChange={(e) =>
                    setBillingForm((prev) => ({
                      ...prev,
                      billing_address: e.target.value,
                    }))
                  }
                  placeholder="Ej. Av. Cevallos y Montalvo, Ambato"
                  className={`w-full h-11 px-3.5 rounded-xl text-xs sm:text-sm border transition-colors focus:outline-none focus:ring-2 focus:ring-[#00345e]/20 ${
                    isDark
                      ? "bg-zinc-900 border-white/10 text-white focus:border-blue-400"
                      : "bg-zinc-50 border-zinc-200 text-zinc-900 focus:border-[#00345e]"
                  }`}
                />
              </div>

              {/* Teléfono Fiscal */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Teléfono de Contacto Fiscal
                </label>
                <input
                  type="tel"
                  required
                  value={billingForm.billing_phone}
                  onChange={(e) =>
                    setBillingForm((prev) => ({
                      ...prev,
                      billing_phone: e.target.value,
                    }))
                  }
                  placeholder="Ej. 032821234"
                  className={`w-full h-11 px-3.5 rounded-xl text-xs sm:text-sm border transition-colors focus:outline-none focus:ring-2 focus:ring-[#00345e]/20 ${
                    isDark
                      ? "bg-zinc-900 border-white/10 text-white focus:border-blue-400"
                      : "bg-zinc-50 border-zinc-200 text-zinc-900 focus:border-[#00345e]"
                  }`}
                />
              </div>

              {/* Correo para Comprobantes Electrónicos */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Correo para Envío de Facturas Electrónicas (RIDE / XML)
                </label>
                <input
                  type="email"
                  required
                  value={billingForm.billing_email}
                  onChange={(e) =>
                    setBillingForm((prev) => ({
                      ...prev,
                      billing_email: e.target.value,
                    }))
                  }
                  placeholder="Ej. facturacion@miempresa.com"
                  className={`w-full h-11 px-3.5 rounded-xl text-xs sm:text-sm border transition-colors focus:outline-none focus:ring-2 focus:ring-[#00345e]/20 ${
                    isDark
                      ? "bg-zinc-900 border-white/10 text-white focus:border-blue-400"
                      : "bg-zinc-50 border-zinc-200 text-zinc-900 focus:border-[#00345e]"
                  }`}
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={savingBilling}
                className="w-full sm:w-auto h-11 px-6 rounded-xl font-semibold text-xs sm:text-sm text-white bg-[#00345e] hover:bg-[#002747] active:bg-[#001f38] transition-all cursor-pointer shadow-xs border-0 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {savingBilling ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Guardando datos SRI...</span>
                  </>
                ) : (
                  <>
                    <CheckCircleIcon className="w-4 h-4" />
                    <span>Guardar Datos de Facturación</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* TAB 3: SEGURIDAD */}
        {activeTab === "security" && (
          <form onSubmit={handleSaveSecurity} className="space-y-6">
            <div>
              <h2
                className={`text-base sm:text-lg font-bold tracking-tight ${
                  isDark ? "text-white" : "text-zinc-900"
                }`}
              >
                Seguridad y Contraseña de la Cuenta
              </h2>
              <p
                className={`text-xs mt-0.5 ${
                  isDark ? "text-zinc-400" : "text-zinc-500"
                }`}
              >
                Actualiza tu contraseña periódicamente. Las contraseñas se almacenan mediante hashing criptográfico bcrypt de alta seguridad.
              </p>
            </div>

            <div className="space-y-4 max-w-lg">
              {/* Contraseña Actual */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Contraseña Actual
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    required
                    value={securityForm.current_password}
                    onChange={(e) =>
                      setSecurityForm((prev) => ({
                        ...prev,
                        current_password: e.target.value,
                      }))
                    }
                    placeholder="Tu contraseña actual"
                    className={`w-full h-11 px-3.5 pr-11 rounded-xl text-xs sm:text-sm border transition-colors focus:outline-none focus:ring-2 focus:ring-[#00345e]/20 ${
                      isDark
                        ? "bg-zinc-900 border-white/10 text-white focus:border-blue-400"
                        : "bg-zinc-50 border-zinc-200 text-zinc-900 focus:border-[#00345e]"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="w-11 h-11 absolute right-0 top-0 flex items-center justify-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                    aria-label="Ver u ocultar contraseña"
                  >
                    {showCurrentPassword ? (
                      <EyeSlashIcon className="w-4 h-4" />
                    ) : (
                      <EyeIcon className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Nueva Contraseña */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Nueva Contraseña
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    required
                    minLength={6}
                    value={securityForm.new_password}
                    onChange={(e) =>
                      setSecurityForm((prev) => ({
                        ...prev,
                        new_password: e.target.value,
                      }))
                    }
                    placeholder="Mínimo 6 caracteres"
                    className={`w-full h-11 px-3.5 pr-11 rounded-xl text-xs sm:text-sm border transition-colors focus:outline-none focus:ring-2 focus:ring-[#00345e]/20 ${
                      isDark
                        ? "bg-zinc-900 border-white/10 text-white focus:border-blue-400"
                        : "bg-zinc-50 border-zinc-200 text-zinc-900 focus:border-[#00345e]"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="w-11 h-11 absolute right-0 top-0 flex items-center justify-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                    aria-label="Ver u ocultar contraseña"
                  >
                    {showNewPassword ? (
                      <EyeSlashIcon className="w-4 h-4" />
                    ) : (
                      <EyeIcon className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirmar Nueva Contraseña */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Confirmar Nueva Contraseña
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    minLength={6}
                    value={securityForm.confirm_new_password}
                    onChange={(e) =>
                      setSecurityForm((prev) => ({
                        ...prev,
                        confirm_new_password: e.target.value,
                      }))
                    }
                    placeholder="Repite la nueva contraseña"
                    className={`w-full h-11 px-3.5 pr-11 rounded-xl text-xs sm:text-sm border transition-colors focus:outline-none focus:ring-2 focus:ring-[#00345e]/20 ${
                      isDark
                        ? "bg-zinc-900 border-white/10 text-white focus:border-blue-400"
                        : "bg-zinc-50 border-zinc-200 text-zinc-900 focus:border-[#00345e]"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="w-11 h-11 absolute right-0 top-0 flex items-center justify-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                    aria-label="Ver u ocultar contraseña"
                  >
                    {showConfirmPassword ? (
                      <EyeSlashIcon className="w-4 h-4" />
                    ) : (
                      <EyeIcon className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-start">
              <button
                type="submit"
                disabled={savingSecurity}
                className="w-full sm:w-auto h-11 px-6 rounded-xl font-semibold text-xs sm:text-sm text-white bg-[#00345e] hover:bg-[#002747] active:bg-[#001f38] transition-all cursor-pointer shadow-xs border-0 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {savingSecurity ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Actualizando contraseña...</span>
                  </>
                ) : (
                  <>
                    <KeyIcon className="w-4 h-4" />
                    <span>Actualizar Contraseña</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* TAB 4: HISTORIAL FINANCIERO */}
        {activeTab === "finance" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2
                  className={`text-base sm:text-lg font-bold tracking-tight ${
                    isDark ? "text-white" : "text-zinc-900"
                  }`}
                >
                  Historial de Órdenes y Comprobantes de Pago
                </h2>
                <p
                  className={`text-xs mt-0.5 ${
                    isDark ? "text-zinc-400" : "text-zinc-500"
                  }`}
                >
                  Visualiza el resumen contable de tus inscripciones, sube comprobantes y descarga los comprobantes oficiales RIDE emitidos por la UTA.
                </p>
              </div>

              <button
                type="button"
                onClick={loadFinancialHistory}
                disabled={loadingOrders}
                className={`h-11 px-3.5 rounded-xl text-xs font-semibold border transition-colors inline-flex items-center justify-center gap-1.5 cursor-pointer ${
                  isDark
                    ? "bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border-white/10"
                    : "bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border-zinc-200"
                }`}
              >
                <ArrowPathIcon
                  className={`w-4 h-4 ${loadingOrders ? "animate-spin" : ""}`}
                />
                <span>Actualizar</span>
              </button>
            </div>

            {/* Tarjetas de Resumen Financiero */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div
                className={`p-4 rounded-xl border text-center ${
                  isDark
                    ? "bg-zinc-900/60 border-white/[0.06]"
                    : "bg-zinc-50 border-black/[0.06]"
                }`}
              >
                <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block">
                  Total de Órdenes
                </span>
                <span className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100 mt-1 block">
                  {financialMetrics.totalOrders}
                </span>
              </div>

              <div
                className={`p-4 rounded-xl border text-center ${
                  isDark
                    ? "bg-emerald-950/20 border-emerald-800/30 text-emerald-300"
                    : "bg-emerald-50/70 border-emerald-200/80 text-emerald-800"
                }`}
              >
                <span className="text-[11px] font-semibold uppercase tracking-wider block">
                  Órdenes Aprobadas
                </span>
                <span className="text-xl sm:text-2xl font-bold mt-1 block">
                  {financialMetrics.paidOrders}
                </span>
              </div>

              <div
                className={`p-4 rounded-xl border text-center ${
                  isDark
                    ? "bg-amber-950/20 border-amber-800/30 text-amber-300"
                    : "bg-amber-50/70 border-amber-200/80 text-amber-800"
                }`}
              >
                <span className="text-[11px] font-semibold uppercase tracking-wider block">
                  Órdenes Pendientes
                </span>
                <span className="text-xl sm:text-2xl font-bold mt-1 block">
                  {financialMetrics.pendingOrders}
                </span>
              </div>
            </div>

            {/* Lista de Órdenes */}
            {loadingOrders ? (
              <div className="p-8 text-center space-y-2">
                <div className="w-6 h-6 border-2 border-[#00345e] border-t-transparent rounded-full animate-spin mx-auto" />
                <span className="text-xs text-zinc-400">
                  Cargando tus órdenes de pago...
                </span>
              </div>
            ) : enrollments.length > 0 ? (
              <div className="space-y-3">
                {enrollments.map((item) => {
                  const isCongress = Boolean(item.id_congress);
                  const effectiveTitle =
                    item.course_title ||
                    item.congress_title ||
                    item.title ||
                    "Programa Académico";
                  const rawStatus = (item.status || "INTERESADO").toUpperCase();
                  const isPaid = rawStatus === "PAGADO" || rawStatus === "FACTURADO";
                  const hasReceiptUploaded =
                    Boolean(item.payment_order_url) &&
                    item.payment_order_url !== "local";

                  return (
                    <div
                      key={item.id}
                      className={`p-4 sm:p-5 rounded-xl border transition-all space-y-3 ${
                        isDark
                          ? "bg-zinc-900/40 border-white/[0.06] hover:border-white/10"
                          : "bg-zinc-50/60 border-black/[0.06] hover:border-black/10"
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-mono text-zinc-400">
                              Orden #{String(item.id).padStart(6, "0")}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                isCongress
                                  ? "bg-[#00345e]/10 text-[#00345e] dark:bg-blue-400/20 dark:text-blue-300"
                                  : "bg-purple-500/10 text-purple-700 dark:text-purple-300"
                              }`}
                            >
                              {isCongress ? "Congreso" : "Curso"}
                            </span>
                          </div>
                          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                            {effectiveTitle}
                          </h3>
                        </div>

                        {/* Badges de Estado Semántico */}
                        <div>
                          {rawStatus === "PAGADO" ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              Pagado
                            </span>
                          ) : rawStatus === "FACTURADO" ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                              Facturado
                            </span>
                          ) : rawStatus === "ORDEN_GENERADA" ||
                            rawStatus === "GENERADA LA ORDEN" ? (
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
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 pt-1 border-t border-black/[0.04] dark:border-white/[0.04]">
                        <span>Fecha: {formatDate(item.enrollment_date)}</span>
                        <span>
                          {isCongress
                            ? "Arancel FISEI UTA"
                            : item.cost ? `$${item.cost}` : "Tarifa Académica"}
                        </span>
                      </div>

                      {/* Botones de Acción (Touch target >= 44px h-11) */}
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-2">
                        {isPaid && (
                          <button
                            type="button"
                            onClick={() => handleDownloadRide(item)}
                            disabled={downloadingRideId === item.id}
                            className={`min-h-[44px] h-11 px-4 rounded-xl text-xs font-semibold border transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 ${
                              isDark
                                ? "bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border-white/10"
                                : "bg-white hover:bg-zinc-100 text-zinc-800 border-zinc-200 shadow-2xs"
                            }`}
                            title="Descargar comprobante RIDE oficial emitido por la UTA"
                          >
                            {downloadingRideId === item.id ? (
                              <div className="w-4 h-4 border-2 border-[#00345e] dark:border-blue-400 border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <DocumentTextIcon className="w-4 h-4 text-[#00345e] dark:text-blue-400" />
                            )}
                            <span>
                              {downloadingRideId === item.id
                                ? "Descargando..."
                                : "Descargar RIDE / Comprobante PDF"}
                            </span>
                          </button>
                        )}

                        {!isPaid && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleGenerateOrDownloadUtaOrder(item)}
                              disabled={generatingOrderId === item.id}
                              className="h-11 px-4 rounded-xl text-xs font-semibold bg-[#00345e] hover:bg-[#002747] text-white transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer disabled:opacity-50"
                              title="Generar o descargar la Orden de Pago oficial para ventanilla UTA o transferencia bancaria"
                            >
                              {generatingOrderId === item.id ? (
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <ArrowDownTrayIcon className="w-4 h-4" />
                              )}
                              <span>
                                {generatingOrderId === item.id
                                  ? "Generando..."
                                  : isOrderGenerated
                                  ? "Orden de Pago (PDF)"
                                  : "Generar Orden UTA"}
                              </span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setSelectedForReceipt(item);
                                setIsReceiptModalOpen(true);
                              }}
                              className={`h-11 px-4 rounded-xl text-xs font-semibold border transition-all flex items-center justify-center gap-2 cursor-pointer ${
                                isDark
                                  ? "bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border-zinc-700"
                                  : "bg-white hover:bg-zinc-50 text-zinc-700 border-zinc-300 shadow-2xs"
                              }`}
                            >
                              <DocumentArrowUpIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                              <span>
                                {hasReceiptUploaded
                                  ? "Actualizar Comprobante"
                                  : "Subir Comprobante"}
                              </span>
                            </button>
                          </>
                        )}

                        <button
                          type="button"
                          onClick={() => {
                            if (isCongress) {
                              navigate(`/dashboard/congreso/${item.id_congress}`);
                            } else {
                              navigate(`/dashboard/curso/${item.id_course}`);
                            }
                          }}
                          className={`h-11 px-4 rounded-xl text-xs font-semibold border transition-colors flex items-center justify-center gap-2 cursor-pointer ${
                            isDark
                              ? "bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 border-white/10"
                              : "bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border-zinc-200"
                          }`}
                        >
                          <EyeIcon className="w-4 h-4" />
                          <span>Ver Detalles</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center space-y-2 border rounded-xl border-dashed border-black/[0.08] dark:border-white/[0.08]">
                <CreditCardIcon className="w-8 h-8 mx-auto text-zinc-400" />
                <p
                  className={`text-sm font-semibold ${
                    isDark ? "text-zinc-300" : "text-zinc-700"
                  }`}
                >
                  No tienes órdenes registradas
                </p>
                <p className="text-xs text-zinc-400">
                  Cuando te inscribas en un curso o congreso, aparecerán aquí tus comprobantes y enlaces de pago.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modales Compartidos */}
      <PaymentReceiptModal
        isOpen={isReceiptModalOpen}
        onClose={() => {
          setIsReceiptModalOpen(false);
          setSelectedForReceipt(null);
        }}
        enrollment={selectedForReceipt}
        onSuccess={() => {
          setIsReceiptModalOpen(false);
          setSelectedForReceipt(null);
          loadFinancialHistory();
          setFeedback({
            type: "success",
            message: "Comprobante y datos de facturación recibidos correctamente.",
          });
        }}
      />
    </div>
  );
}
