import { useState } from "react";
import { Carousel } from "../components/home";
import { FilterSideBar } from "../components/ui";
import { CoursesList } from "../components/courses";
import { coursesHeroSlides } from "../constants/slides";
import { useDashboardTheme } from "../context/DashboardThemeContext";

export default function Courses() {
  const { isDark } = useDashboardTheme();
  const [filters, setFilters] = useState({
    search: "",
    category: "",
    status: "",
    modality: "",
    duration: "",
  });

  return (
    <div className={`min-h-screen transition-colors duration-200 ${isDark ? 'bg-[#121215] text-zinc-100' : 'bg-white text-zinc-900'}`}>
      <Carousel
        slides={coursesHeroSlides}
        height="400px"
        background={isDark ? '#16161a' : '#ffffff'}
        colorText={isDark ? '#f4f4f5' : 'var(--color-primary)'}
      />
      <div className="lg:flex items-start gap-6 container mx-auto p-4 sm:p-5">
        <FilterSideBar filters={filters} setFilters={setFilters} />
        <div className="lg:flex-1 min-w-0">
          <CoursesList filters={filters} />
        </div>
      </div>
    </div>
  );
}
