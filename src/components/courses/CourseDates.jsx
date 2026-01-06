import { CalendarIcon } from "@heroicons/react/24/outline";

export default function CourseDates({ course }) {
    const courseSchedule = course.requirements?.courseSchedule;
    
    if (!courseSchedule?.startDate && !courseSchedule?.endDate) return null;

    const formatDate = (dateString) => {
        if (!dateString) return 'No especificada';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-2xl font-bold text-[#6C1313] mb-4">
                Fechas del Curso
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center">
                    <CalendarIcon className="h-6 w-6 text-green-600 mr-3" />
                    <div>
                        <p className="text-sm text-gray-500">Fecha de Inicio</p>
                        <p className="text-gray-900 font-medium">{formatDate(courseSchedule.startDate)}</p>
                    </div>
                </div>
                <div className="flex items-center">
                    <CalendarIcon className="h-6 w-6 text-red-600 mr-3" />
                    <div>
                        <p className="text-sm text-gray-500">Fecha de Finalización</p>
                        <p className="text-gray-900 font-medium">{formatDate(courseSchedule.endDate)}</p>
                    </div>
                </div>
            </div>
            {courseSchedule.days && courseSchedule.days.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-500 mb-1">Días de clase</p>
                    <p className="text-gray-900 font-medium">{courseSchedule.days.join(', ')}</p>
                    <p className="text-sm text-gray-600 mt-2">
                        Horario: {courseSchedule.startTime} - {courseSchedule.endTime}
                    </p>
                </div>
            )}
        </div>
    );
}
