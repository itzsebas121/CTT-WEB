import { useState } from "react";
import { Carousel } from "../components/home";
import { FilterSideBar } from "../components/ui";
import { CoursesList } from "../components/courses";
import { coursesHeroSlides } from "../constants/slides";

export default function Courses() {
  const [filters, setFilters] = useState({
    search: "",
    category: "",
    status: "",
    modality: "",
    duration: "",
  });
  return (
    <>
    <div className="bg-white">
    <Carousel slides={coursesHeroSlides} height="400px" background={'white'} colorText={'#6C1313'} />
        <div className="lg:flex container mx-auto p-5">
          <FilterSideBar filters={filters} setFilters={setFilters} />
          <div className="lg:flex-1">
            <CoursesList filters={filters} />
          </div>
        </div>
    </div>
    </>
  )
}
