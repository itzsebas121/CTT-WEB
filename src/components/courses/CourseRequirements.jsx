import { CheckCircleIcon } from '@heroicons/react/24/solid';

export default function CourseRequirements({ course }) {
    const prerequisites = course.requirements?.prerequisites;
    
    if (!prerequisites || prerequisites.length === 0) return null;

    return (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-2xl font-bold text-[#6C1313] mb-4">
                Requisitos Previos
            </h2>
            <ul className="space-y-2">
                {prerequisites.map((requirement, index) => (
                    <li key={index} className="flex items-start">
                        <CheckCircleIcon className="h-5 w-5 text-[#6C1313] mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700"> {index + 1} - {requirement}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}

