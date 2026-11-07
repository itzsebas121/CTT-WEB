import { useState } from "react";
import { DocumentArrowUpIcon, XMarkIcon, ExclamationCircleIcon, DocumentIcon } from "@heroicons/react/24/outline";

export default function PdfUploadModal({ isOpen, onClose, onFileUpload, courseName, uploading }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        setError('Por favor selecciona un archivo PDF válido');
        setSelectedFile(null);
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('El archivo no debe superar los 5MB');
        setSelectedFile(null);
        return;
      }
      setError(null);
      setSelectedFile(file);
    }
  };

  const handleSubmit = () => {
    if (!selectedFile) {
      setError('Por favor selecciona tu archivo PDF');
      return;
    }
    onFileUpload(selectedFile);
  };

  const handleClose = () => {
    setSelectedFile(null);
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop estilo Apple Liquid Glass */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-md transition-opacity duration-300"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="relative bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-slate-200/80 max-w-md w-full p-6 sm:p-7 overflow-hidden z-10">
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all cursor-pointer border-0 bg-transparent"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>

        {/* Encabezado */}
        <div className="flex items-center gap-3.5 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center flex-shrink-0 shadow-2xs border border-violet-200/60">
            <DocumentArrowUpIcon className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Cargar Hoja de Vida (CV)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Requisito para postularse como expositor
            </p>
          </div>
        </div>

        <p className="text-xs text-slate-600 mb-4 leading-relaxed">
          Para postularte en <strong className="text-slate-800">{courseName}</strong>, adjunta tu CV en formato PDF.
        </p>

        {/* Zona de Carga de Archivo */}
        <label
          htmlFor="pdf-upload-input"
          className="border-2 border-dashed border-slate-200 hover:border-primary/50 hover:bg-slate-50/80 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 mb-4 group"
        >
          <div className="w-12 h-12 rounded-2xl bg-slate-100 group-hover:bg-primary/10 group-hover:text-primary text-slate-400 flex items-center justify-center mb-2 transition-colors">
            <DocumentIcon className="w-6 h-6" />
          </div>
          <span className="text-xs font-bold text-slate-700 group-hover:text-primary transition-colors">
            {selectedFile ? selectedFile.name : "Haz clic para seleccionar tu PDF"}
          </span>
          <span className="text-[10px] text-slate-400 mt-1">
            {selectedFile ? `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB` : "Formato PDF (máximo 5MB)"}
          </span>
          <input
            id="pdf-upload-input"
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            disabled={uploading}
            className="hidden"
          />
        </label>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 text-xs rounded-xl mb-4 border border-red-200/60">
            <ExclamationCircleIcon className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Botones de acción */}
        <div className="flex items-center justify-end gap-2.5 pt-2">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all cursor-pointer border border-slate-200/80 bg-white"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!selectedFile || uploading}
            className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-primary hover:bg-primary-hover active:scale-95 disabled:opacity-50 transition-all cursor-pointer border-0 shadow-xs"
          >
            {uploading ? "Subiendo..." : "Continuar"}
          </button>
        </div>
      </div>
    </div>
  );
}
