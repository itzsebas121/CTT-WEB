import { ClipboardDocumentListIcon } from "@heroicons/react/24/outline";

export default function CourseMaterials({ course }) {
    if (!course.materials || course.materials.length === 0) return null;

    return (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-2xl font-bold text-[#6C1313] mb-4">
                Materiales Requeridos
            </h2>
            <ul className="space-y-3">
                {course.materials.map((material, index) => (
                    <li key={index} className="flex items-start">
                        <ClipboardDocumentListIcon className="h-6 w-6 text-[#6C1313] mr-3 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{material}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}
