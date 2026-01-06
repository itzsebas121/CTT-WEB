import { CheckCircleIcon } from "@heroicons/react/24/outline";

export default function CourseObjectives({ course }) {
    if (!course.objectives || course.objectives.length === 0) return null;

    return (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-2xl font-bold text-[#6C1313] mb-4">
                Objetivos del Curso
            </h2>
            <ul className="space-y-3">
                {course.objectives.map((objective, index) => (
                    <li key={index} className="flex items-start">
                        <CheckCircleIcon className="h-6 w-6 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{objective}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}
