import { useState } from "react";

export default function PdfUploadModal({ isOpen, onClose, onFileUpload, courseName, uploading }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        setError('Por favor selecciona un archivo PDF');
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
      setError('Por favor selecciona un archivo PDF');
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-xl font-semibold mb-4">Cargar Curriculum Vitae</h2>
        <p className="text-gray-600 mb-4">
          Para inscribirte como expositor en <strong>{courseName}</strong>, debes cargar tu CV en formato PDF.
        </p>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Seleccionar archivo PDF (máx. 5MB)
          </label>
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            disabled={uploading}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-[#6C1313] file:text-white hover:file:bg-[#5a0f0f] disabled:opacity-50"
          />
          {selectedFile && (
            <p className="mt-2 text-sm text-green-600">
              Archivo seleccionado: {selectedFile.name}
            </p>
          )}
          {error && (
            <p className="mt-2 text-sm text-red-600">{error}</p>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleSubmit}
            disabled={!selectedFile || uploading}
            className="flex-1 bg-[#6C1313] hover:bg-[#5a0f0f] text-white px-4 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? 'Procesando...' : 'Continuar'}
          </button>
          <button
            onClick={handleClose}
            disabled={uploading}
            className="flex-1 bg-white hover:bg-gray-100 text-gray-700 px-4 py-2 rounded border border-gray-300 disabled:opacity-50"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

