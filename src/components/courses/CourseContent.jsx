
export default function CourseContent({ course }) {
    if (!course.contents || course.contents.length === 0) return null;

    return (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-2xl font-bold text-[#6C1313] mb-4">
                Temario del Curso
            </h2>
            <div className="space-y-6">
                {course.contents?.map((module, index) => (
                    <div key={index} className="border-l-4 border-[#6C1313] pl-4 py-2">
                        <h3 className="font-semibold text-gray-900 text-lg mb-2">
                            Módulo {index + 1}: {module.title}
                        </h3>
                        {module.topics && module.topics.length > 0 && (
                            <ul className="space-y-2 mt-3">
                                {module.topics.map((topic, topicIndex) => (
                                    <li key={topicIndex} className="text-gray-700 text-sm ml-4">
                                        • Tema {topicIndex + 1}: {topic.title}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
