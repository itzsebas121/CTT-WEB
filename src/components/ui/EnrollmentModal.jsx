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
      {/* Backdrop estilo Apple Liquid Glass */}
      <div 
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Modal */}
      <div className="bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl max-w-md w-full relative z-10 border border-slate-200/80 overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-100">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all cursor-pointer border-0 bg-transparent"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-3.5">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-2xs border ${isError ? 'bg-amber-50 text-amber-600 border-amber-200/60' : 'bg-emerald-50 text-emerald-600 border-emerald-200/60'}`}>
              {isError ? (
                <ExclamationCircleIcon className="h-6 w-6" />
              ) : (
                <CheckCircleIcon className="h-6 w-6" />
              )}
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                {isError ? 'Atención' : 'Inscripción Exitosa'}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {isError ? 'No se pudo completar la inscripción' : 'Has sido inscrito correctamente'}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {isError ? (
            <div>
              <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-4 mb-5">
                <p className="text-xs text-amber-900 text-center font-medium leading-relaxed">
                  {error || 'Ocurrió un error al procesar la inscripción.'}
                </p>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-full bg-primary hover:bg-primary-hover active:scale-95 text-white font-bold py-2.5 px-4 rounded-xl text-xs shadow-xs transition-all cursor-pointer border-0"
              >
                Entendido
              </button>
            </div>
          ) : (
            <>
              {/* User Info */}
              <div className="p-3.5 bg-slate-50/90 rounded-2xl border border-slate-200/70 flex items-center gap-3">
                <UserCircleIcon className="h-8 w-8 text-primary/70 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Estudiante</p>
                  <p className="text-xs font-bold text-slate-800 truncate">{user.first_name || ''} {user.first_last_name || ''}</p>
                  <p className="text-[11px] text-slate-500 truncate">{user.email || 'N/A'}</p>
                </div>
              </div>

              {/* Course Info */}
              <div className="p-3.5 bg-slate-50/90 rounded-2xl border border-slate-200/70 space-y-2">
                <div className="flex items-start gap-3">
                  <AcademicCapIcon className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Curso</p>
                    <p className="text-xs font-bold text-slate-800 leading-snug">{courseName}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 pt-2 border-t border-slate-200/60">
                  <ClockIcon className="h-3.5 w-3.5 flex-shrink-0 text-slate-400" />
                  <span>Inscrito el {enrollmentData?.data?.enrollment_date ? formatDate(enrollmentData.data.enrollment_date) : 'Hoy'}</span>
                </div>
              </div>

              {/* Status */}
              <div className="flex items-center justify-between p-3 bg-emerald-50/80 rounded-2xl border border-emerald-200/70">
                <span className="text-xs text-emerald-800 font-semibold">Estado de Inscripción</span>
                <span className="bg-emerald-600 text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-2xs">
                  {enrollmentData?.data?.status || 'Interesado'}
                </span>
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={() => {
                  onClose();
                  navigate('/dashboard/cursos/inscrito');
                }}
                className="w-full bg-primary hover:bg-primary-hover active:scale-95 text-white font-bold py-2.5 px-4 rounded-xl text-xs shadow-xs transition-all cursor-pointer border-0 mt-2"
              >
                Generar orden de pago
              </button>

              {/* Footer Note */}
              <p className="text-[11px] text-center text-slate-400 leading-relaxed pt-1">
                Para completar tu matrícula genera tu orden de pago en el siguiente paso.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
