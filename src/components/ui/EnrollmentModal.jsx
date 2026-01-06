import { XMarkIcon, CheckCircleIcon, ExclamationCircleIcon, UserCircleIcon, CalendarIcon, ClockIcon, AcademicCapIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

export default function EnrollmentModal({ isOpen, onClose, enrollmentData, courseName, error }) {
  const navigate = useNavigate();
  
  if (!isOpen) return null;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isError = !!error;
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop sin color - solo para cerrar */}
      <div 
        className="absolute inset-0"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full relative z-10 border border-gray-200">
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${isError ? 'bg-amber-50' : 'bg-green-50'}`}>
              {isError ? (
                <ExclamationCircleIcon className="h-8 w-8 text-amber-600" />
              ) : (
                <CheckCircleIcon className="h-8 w-8 text-green-600" />
              )}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {isError ? 'Atención' : 'Inscripción Exitosa'}
              </h2>
              <p className="text-sm text-gray-500">
                {isError ? 'No se pudo completar la inscripción' : 'Has sido inscrito correctamente'}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {isError ? (
            <div>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                <p className="text-gray-700 text-center">
                  {error || 'Ocurrió un error al procesar la inscripción.'}
                </p>
              </div>

              <button
                onClick={onClose}
                className="w-full bg-[#6C1313] hover:bg-[#5a0f0f] text-white font-medium py-2.5 px-4 rounded-lg transition-colors"
              >
                Entendido
              </button>
            </div>
          ) : (
            <>
              {/* User Info */}
              <div className="mb-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <UserCircleIcon className="h-5 w-5 text-gray-600 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-gray-500 font-medium">Estudiante</p>
                    <p className="font-medium text-gray-900 truncate">{user.first_name|| 'N/A'} {user.first_last_name || 'N/A'}</p>
                    <p className="text-xs text-gray-600 truncate">{user.identification || 'N/A'}</p>
                    <p className="text-xs text-gray-600 truncate">{user.email || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Course Info */}
              <div className="mb-4">
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-start gap-3 mb-3">
                    <AcademicCapIcon className="h-5 w-5 text-gray-600 flex-shrink-0 mt-0.5" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-gray-500 font-medium mb-1">Curso</p>
                      <p className="font-medium text-gray-900">{courseName}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs text-gray-600 pt-2 border-t border-gray-200">
                    <ClockIcon className="h-4 w-4 flex-shrink-0" />
                    <span>Inscrito el {enrollmentData?.data?.enrollment_date && formatDate(enrollmentData.data.enrollment_date)}</span>
                  </div>
                </div>
              </div>

              {/* Status */}
              <div className="mb-6">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                  <span className="text-sm text-gray-700 font-medium">Estado</span>
                  <span className="bg-green-600 text-white text-xs font-medium px-3 py-1 rounded-full">
                    {enrollmentData?.data?.status || 'Interesado'}
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => {
                  onClose();
                  navigate('/dashboard/cursos/inscrito');
                }}
                className="w-full bg-[#6C1313] hover:bg-[#5a0f0f] text-white font-medium py-2.5 px-4 rounded-lg transition-colors"
              >
                Generar orden de pago
              </button>

              {/* Footer Note */}
              <p className="text-xs text-center text-gray-500 mt-4">
                Para continuar con el proceso genera la orden de pago. Recibirás más información sobre el curso próximamente
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
