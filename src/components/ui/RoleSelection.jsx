export default function RoleSelectionModal({ isOpen, onClose, onSelectRole, courseName }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-xl font-semibold mb-4">Tipo de Inscripción</h2>
        <p className="text-gray-600 mb-6">
          ¿Cómo deseas inscribirte en el curso <strong>{courseName}</strong>?
        </p>
        <div className="flex flex-col gap-3">
          <button
            onClick={() => onSelectRole('expositor')}
            className="bg-[#6C1313] hover:bg-[#5a0f0f] text-white px-4 py-3 rounded"
          >
            Inscribirme como Expositor
          </button>
          <button
            onClick={() => onSelectRole('participante')}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-3 rounded"
          >
            Inscribirme como Participante
          </button>
          <button
            onClick={onClose}
            className="bg-white hover:bg-gray-100 text-gray-700 px-4 py-3 rounded border border-gray-300"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
