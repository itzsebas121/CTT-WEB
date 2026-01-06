import { UserGroupIcon } from "@heroicons/react/24/outline";

export default function CourseSidebar({ course, onEnroll, enrolling }) {
    return (
        <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
            {/* Course Details Card */}
            <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Detalles del Curso
                </h3>

                <div className="space-y-4">
                    <div>
                        <h4 className="font-medium text-gray-900 mb-2">Fechas de Inscripción</h4>
                        <p className="text-sm text-gray-600">
                            {new Date(course.requirements?.registration?.startDate).toLocaleDateString()} - {new Date(course.requirements?.registration?.endDate).toLocaleDateString()}
                        </p>
                    </div>

                    <div>
                        <h4 className="font-medium text-gray-900 mb-2">Ubicación</h4>
                        <p className="text-sm text-gray-600">
                            {course.requirements?.location}
                        </p>
                    </div>

                    <div>
                        <h4 className="font-medium text-gray-900 mb-2">Cupo</h4>
                        <p className="text-sm text-gray-600">
                            {course.requirements?.quota?.min} - {course.requirements?.quota?.max} participantes
                        </p>
                    </div>

                    <div>
                        <h4 className="font-medium text-gray-900 mb-2">Certificación</h4>
                        <p className="text-sm text-gray-600">
                            {course.requirements?.certification}
                        </p>
                    </div>
                </div>
            </div>

            {/* Organizers Card */}
            <div className="bg-white rounded-2xl shadow-sm p-6 mt-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Organizadores
                </h3>

                <div className="space-y-2">
                    {course.organizers?.map((organizer, index) => (
                        <div key={index} className="flex items-center space-x-3">
                            <div className="w-2 h-2 bg-[#6C1313] rounded-full"></div>
                            <span className="text-sm text-gray-600">{organizer}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Target Audience Card */}
            <div className="bg-white rounded-2xl shadow-sm p-6 mt-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Público Objetivo
                </h3>

                <div className="space-y-2">
                    {course.target_audience?.map((audience, index) => (
                        <div key={index} className="flex items-center space-x-3">
                            <UserGroupIcon className="h-4 w-4 text-[#6C1313]" />
                            <span className="text-sm text-gray-600">{audience}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Enroll Button */}
            <button
                onClick={onEnroll}
                disabled={enrolling}
                className="w-full bg-[#6C1313] hover:bg-[#5a0f0f] text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-4"
            >
                {enrolling ? 'Inscribiendo...' : 'Inscribirse'}
            </button>
        </div>
    );
}
