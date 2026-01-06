import { ClockIcon, UserGroupIcon, MapPinIcon } from "@heroicons/react/24/outline";

export default function CourseHeader({ course, onEnroll, enrolling }) {
    return (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-8">
            <div className="relative">
                <img
                    src={course.course_image}
                    alt={course.title}
                    className="w-full h-64 sm:h-80 object-cover"
                />
                <div className="absolute top-4 left-4">
                    <span className="bg-[#6C1313] text-white px-3 py-1 rounded-full text-xl font-medium">
                        {course.category}
                    </span>
                </div>
                <div className="absolute top-4 right-4">
                    <span className={`px-3 py-1 rounded-full text-xl font-medium bg ${
                        course.status === 'activo'
                        ? 'bg-green-100 text-black'
                        :'bg-red-100 text-red-800'
                    }`}>
                        {course.status === 'activo' ? 'Activo' : 'Cerrado'}
                    </span>
                </div>
            </div>

            <div className="p-8">
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                    {course.title}
                </h1>

                <p className="text-lg text-gray-600 leading-relaxed mb-6">
                    {course.description}
                </p>

                {/* Course Info Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                    <div className="bg-gray-50 rounded-xl p-4 text-center">
                        <ClockIcon className="h-8 w-8 text-[#6C1313] mx-auto mb-2" />
                        <div className="text-sm font-medium text-gray-900">
                            Duración
                        </div>
                        <div className="text-lg font-bold text-[#6C1313]">
                            {course.requirements?.hours?.total || 0} horas
                        </div>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-4 text-center">
                        <UserGroupIcon className="h-8 w-8 text-[#6C1313] mx-auto mb-2" />
                        <div className="text-sm font-medium text-gray-900">
                            Nivel
                        </div>
                        <div className="text-lg font-bold text-[#6C1313]">
                            Todos los niveles
                        </div>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-4 text-center">
                        <MapPinIcon className="h-8 w-8 text-[#6C1313] mx-auto mb-2" />
                        <div className="text-sm font-medium text-gray-900">
                            Modalidad
                        </div>
                        <div className="text-lg font-bold text-[#6C1313]">
                            {course.requirements?.modality || 'Presencial'}
                        </div>
                    </div>
                </div>

                {/* Prices Section */}
                <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Precios por Categoría</h3>
                    <div className="space-y-3">
                        {course.requirements?.prices?.map((price, index) => (
                            <div key={index} className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
                                <div className="flex items-center space-x-3">
                                    <div className="w-3 h-3 bg-[#6C1313] rounded-full"></div>
                                    <div>
                                        <div className="font-medium text-gray-900">
                                            {price.category}
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            Categoría {index + 1}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-bold text-[#6C1313]">
                                        ${price.amount}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        USD
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Highlighted Price for Enrollment */}
                    {course.requirements?.prices?.length > 0 && (
                        <div className="mt-6 p-4 bg-gradient-to-r from-[#6C1313] to-[#5a0f0f] rounded-xl text-white">
                            <div className="text-center">
                                <div className="text-sm opacity-90 mb-1">Precio desde</div>
                                <div className="text-3xl font-bold">
                                    ${Math.min(...course.requirements.prices.map(p => p.amount))}
                                </div>
                                <div className="text-sm opacity-90 mt-1">
                                    {course.requirements.prices.find(p => p.amount === Math.min(...course.requirements.prices.map(p => p.amount)))?.category}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Enroll Button */}
                <div className="text-center">
                    <button 
                        onClick={onEnroll}
                        disabled={enrolling}
                        className="bg-[#6C1313] hover:bg-[#5a0f0f] text-white font-bold py-4 px-8 rounded-xl text-lg transition-all duration-200 hover:shadow-lg transform hover:-translate-y-0.5 w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {enrolling ? 'Inscribiendo...' : 'Inscríbete Ahora'}
                    </button>
                    <p className="text-sm text-gray-500 mt-2">
                        Selecciona tu categoría al momento de la inscripción
                    </p>
                </div>
            </div>
        </div>
    );
}
