import { useState, useEffect, Fragment } from "react";
import { Dialog, Transition, TransitionChild } from "@headlessui/react";
import {
  XMarkIcon,
  DocumentArrowUpIcon,
  BuildingOffice2Icon,
  CreditCardIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";
import { updateUserBilling } from "../../api/auth";
import { uploadPaymentReceiptTemp } from "../../api/inscripciones";
import { useDashboardTheme } from "../../context/DashboardThemeContext";

export default function PaymentReceiptModal({
  isOpen,
  onClose,
  enrollment,
  onSuccess,
}) {
  const { isDark } = useDashboardTheme();

  // Datos de facturación SRI
  const [formData, setFormData] = useState({
    billing_identification: "",
    billing_name: "",
    billing_address: "",
    billing_phone: "",
    billing_email: "",
  });

  const [receiptFile, setReceiptFile] = useState(null);
  const [fileError, setFileError] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Pre-cargar datos del usuario cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      setErrorMessage("");
      setFileError("");
      setReceiptFile(null);

      try {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          const user = JSON.parse(storedUser);
          setFormData({
            billing_identification:
              user.billing_identification || user.identification || "",
            billing_name:
              user.billing_name ||
              `${user.first_name || ""} ${user.first_last_name || ""}`.trim(),
            billing_address: user.billing_address || user.address || "",
            billing_phone: user.billing_phone || user.cellphone || "",
            billing_email: user.billing_email || user.email || "",
          });
        }
      } catch (e) {
        console.error("Error reading stored user:", e);
      }
    }
  }, [isOpen, enrollment]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validación de tipo (PDF o imagen)
    const validTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/webp",
    ];
    if (!validTypes.includes(file.type)) {
      setFileError("Solo se permiten archivos en formato PDF, JPG o PNG.");
      setReceiptFile(null);
      return;
    }

    // Validación de tamaño (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setFileError("El tamaño del archivo no debe superar los 5MB.");
      setReceiptFile(null);
      return;
    }

    setFileError("");
    setReceiptFile(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    // Validar campos requeridos
    if (
      !formData.billing_identification.trim() ||
      !formData.billing_name.trim() ||
      !formData.billing_address.trim() ||
      !formData.billing_phone.trim() ||
      !formData.billing_email.trim()
    ) {
      setErrorMessage(
        "Todos los campos de facturación SRI son obligatorios para la emisión del comprobante."
      );
      return;
    }

    if (!receiptFile) {
      setFileError("Debes seleccionar el comprobante de pago en PDF o imagen.");
      return;
    }

    try {
      setLoading(true);

      const storedUser = localStorage.getItem("user");
      const user = storedUser ? JSON.parse(storedUser) : null;
      const userId = user?.id || enrollment?.id_user_platform;

      if (!userId) {
        throw new Error("No se pudo identificar la cuenta del estudiante.");
      }

      // 1. Actualizar datos de facturación SRI
      await updateUserBilling(userId, formData);

      // Actualizar localStorage con los nuevos datos de facturación
      if (user) {
        const updatedUser = { ...user, ...formData };
        localStorage.setItem("user", JSON.stringify(updatedUser));
      }

      // 2. Subir archivo de comprobante de pago
      await uploadPaymentReceiptTemp(enrollment.id, receiptFile);

      if (onSuccess) {
        onSuccess(
          `Comprobante y datos de facturación registrados exitosamente para ${
            enrollment.course_title ||
            enrollment.congress_title ||
            "el programa"
          }.`
        );
      }
      onClose();
    } catch (err) {
      setErrorMessage(
        err.message || "Ocurrió un error al procesar el comprobante."
      );
    } finally {
      setLoading(false);
    }
  };

  const programTitle =
    enrollment?.course_title ||
    enrollment?.congress_title ||
    enrollment?.title ||
    "Inscripción Académica";

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={loading ? () => {} : onClose}>
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" />
        </TransitionChild>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-end sm:items-center justify-center p-0 sm:p-4 text-center">
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-8 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-8 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel
                className={`w-full max-w-2xl transform overflow-hidden rounded-t-2xl sm:rounded-2xl text-left align-middle shadow-2xl transition-all border max-h-[92vh] sm:max-h-[90vh] flex flex-col ${
                  isDark
                    ? "bg-[#16161a] border-white/[0.08] text-zinc-100"
                    : "bg-white border-black/[0.08] text-zinc-900"
                }`}
              >
                {/* Indicador táctil deslizable (Bottom Sheet en móvil) */}
                <div className="sm:hidden w-12 h-1 bg-zinc-300 dark:bg-zinc-700 rounded-full mx-auto mt-2.5 mb-1 shrink-0" />

                {/* Cabecera */}
                <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-black/[0.06] dark:border-white/[0.06] shrink-0">
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100">
                      Subir Comprobante y Facturación SRI
                    </h2>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 truncate max-w-xs sm:max-w-md">
                      {programTitle}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={loading}
                    className="w-11 h-11 sm:w-8 sm:h-8 inline-flex items-center justify-center rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors cursor-pointer"
                    aria-label="Cerrar modal"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-6 overflow-y-auto flex-1">
                  {/* Datos Bancarios Institucionales de la UTA */}
                  <div
                    className={`p-4 rounded-xl border text-xs ${
                      isDark
                        ? "bg-blue-950/20 border-blue-800/30 text-blue-200"
                        : "bg-blue-50/70 border-blue-200/80 text-[#00345e]"
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <CreditCardIcon className="w-5 h-5 flex-shrink-0 text-[#00345e] dark:text-blue-400 mt-0.5" />
                      <div className="space-y-1">
                        <span className="font-semibold block text-sm">
                          Cuenta Institucional - Universidad Técnica de Ambato
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-xs opacity-90">
                          <div>
                            <span className="font-medium">Banco:</span> Banco del Pacífico
                          </div>
                          <div>
                            <span className="font-medium">Tipo:</span> Cuenta Corriente
                          </div>
                          <div>
                            <span className="font-medium">No. Cuenta:</span> 7458129
                          </div>
                          <div>
                            <span className="font-medium">RUC Institucional:</span> 1860000880001
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Datos de Facturación SRI */}
                  <div>
                    <div className="mb-3">
                      <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                        <BuildingOffice2Icon className="w-4 h-4 text-[#00345e] dark:text-blue-400" />
                        Datos para Facturación Electrónica (SRI)
                      </h3>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                        Ingresa los datos exactos del contribuyente a cuyo nombre se emitirá la factura autorizada.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                      <div>
                        <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                          Cédula o RUC *
                        </label>
                        <input
                          type="text"
                          name="billing_identification"
                          value={formData.billing_identification}
                          onChange={handleChange}
                          placeholder="Ej. 1801234567 o 1801234567001"
                          required
                          className={`w-full px-3 py-2 rounded-lg border transition-colors ${
                            isDark
                              ? "bg-zinc-800/80 border-white/10 text-white focus:border-blue-400"
                              : "bg-white border-zinc-300 text-zinc-900 focus:border-[#00345e]"
                          }`}
                        />
                      </div>

                      <div>
                        <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                          Razón Social / Nombres Completos *
                        </label>
                        <input
                          type="text"
                          name="billing_name"
                          value={formData.billing_name}
                          onChange={handleChange}
                          placeholder="Ej. Juan Pérez o Empresa S.A."
                          required
                          className={`w-full px-3 py-2 rounded-lg border transition-colors ${
                            isDark
                              ? "bg-zinc-800/80 border-white/10 text-white focus:border-blue-400"
                              : "bg-white border-zinc-300 text-zinc-900 focus:border-[#00345e]"
                          }`}
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                          Dirección Fiscal *
                        </label>
                        <input
                          type="text"
                          name="billing_address"
                          value={formData.billing_address}
                          onChange={handleChange}
                          placeholder="Ej. Av. Los Chasquis y Río Payamino, Ambato"
                          required
                          className={`w-full px-3 py-2 rounded-lg border transition-colors ${
                            isDark
                              ? "bg-zinc-800/80 border-white/10 text-white focus:border-blue-400"
                              : "bg-white border-zinc-300 text-zinc-900 focus:border-[#00345e]"
                          }`}
                        />
                      </div>

                      <div>
                        <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                          Teléfono de Contacto *
                        </label>
                        <input
                          type="text"
                          name="billing_phone"
                          value={formData.billing_phone}
                          onChange={handleChange}
                          placeholder="Ej. 0991234567"
                          required
                          className={`w-full px-3 py-2 rounded-lg border transition-colors ${
                            isDark
                              ? "bg-zinc-800/80 border-white/10 text-white focus:border-blue-400"
                              : "bg-white border-zinc-300 text-zinc-900 focus:border-[#00345e]"
                          }`}
                        />
                      </div>

                      <div>
                        <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                          Correo para Factura Electrónica *
                        </label>
                        <input
                          type="email"
                          name="billing_email"
                          value={formData.billing_email}
                          onChange={handleChange}
                          placeholder="Ej. correo@ejemplo.com"
                          required
                          className={`w-full px-3 py-2 rounded-lg border transition-colors ${
                            isDark
                              ? "bg-zinc-800/80 border-white/10 text-white focus:border-blue-400"
                              : "bg-white border-zinc-300 text-zinc-900 focus:border-[#00345e]"
                          }`}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Selector de Archivo de Comprobante */}
                  <div>
                    <label className="block text-xs font-semibold text-zinc-900 dark:text-zinc-100 mb-1.5 flex items-center gap-2">
                      <DocumentArrowUpIcon className="w-4 h-4 text-[#00345e] dark:text-blue-400" />
                      Comprobante de Pago (PDF, JPG, PNG - Máx 5MB) *
                    </label>

                    <div
                      className={`relative border-2 border-dashed rounded-xl p-4 text-center transition-colors ${
                        receiptFile
                          ? isDark
                            ? "border-emerald-500/50 bg-emerald-950/20"
                            : "border-emerald-500/50 bg-emerald-50/50"
                          : isDark
                          ? "border-white/10 hover:border-white/20 bg-zinc-800/40"
                          : "border-zinc-300 hover:border-zinc-400 bg-zinc-50"
                      }`}
                    >
                      {receiptFile ? (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5 text-left">
                            <DocumentTextIcon className="w-6 h-6 text-emerald-500 flex-shrink-0" />
                            <div>
                              <p className="text-xs font-medium text-zinc-900 dark:text-zinc-100 truncate max-w-xs sm:max-w-md">
                                {receiptFile.name}
                              </p>
                              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                                {(receiptFile.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setReceiptFile(null)}
                            className="text-xs text-red-500 hover:text-red-700 font-medium px-2 py-1"
                          >
                            Quitar
                          </button>
                        </div>
                      ) : (
                        <div>
                          <DocumentArrowUpIcon className="w-8 h-8 mx-auto text-zinc-400 dark:text-zinc-500 mb-1.5" />
                          <label
                            htmlFor="receipt_file_input"
                            className="text-xs font-semibold text-[#00345e] dark:text-blue-400 hover:underline cursor-pointer"
                          >
                            Haz clic para seleccionar el archivo
                          </label>
                          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                            Comprobante legible de depósito en ventanilla o transferencia bancaria.
                          </p>
                          <input
                            id="receipt_file_input"
                            type="file"
                            accept=".pdf,image/jpeg,image/png,image/webp"
                            onChange={handleFileChange}
                            className="sr-only"
                          />
                        </div>
                      )}
                    </div>
                    {fileError && (
                      <p className="text-xs text-red-500 mt-1">{fileError}</p>
                    )}
                  </div>

                  {errorMessage && (
                    <div className="p-3 rounded-lg text-xs font-medium bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400">
                      {errorMessage}
                    </div>
                  )}

                  {/* Acciones del Modal */}
                  <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 sm:gap-3 pt-4 border-t border-black/[0.06] dark:border-white/[0.06]">
                    <button
                      type="button"
                      onClick={onClose}
                      disabled={loading}
                      className={`h-11 sm:h-9 px-4 rounded-xl text-xs font-semibold transition-colors cursor-pointer border inline-flex items-center justify-center ${
                        isDark
                          ? "bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border-white/10"
                          : "bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border-zinc-200"
                      }`}
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={loading || !receiptFile}
                      className="h-11 sm:h-9 px-5 rounded-xl text-xs font-semibold bg-[#00345e] hover:bg-[#002747] text-white transition-all shadow-xs disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Guardando y Subiendo...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircleIcon className="w-4 h-4" />
                          <span>Confirmar y Enviar</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

