import { useState, useEffect } from 'react';
import { Stats, Carousel, BannerImage } from '../components/home';
import { CourseSection } from '../components/courses';
import { heroSlides, aboutSlides, projectsSlides } from '../constants/slides';
import { 
  getBanners, 
  transformHeroSlides, 
  transformAboutSlides, 
  transformProjectsSlides 
} from '../api/banners';

export default function Home() {
  const [heroData, setHeroData] = useState(heroSlides);
  const [aboutData, setAboutData] = useState(aboutSlides);
  const [projectsData, setProjectsData] = useState(projectsSlides);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        setIsLoading(true);
        const data = await getBanners();
        
        // Transformar y actualizar los datos de cada banner
        if (data.banner) {
          const transformedHero = transformHeroSlides(data.banner);
          if (transformedHero.length > 0) {
            setHeroData(transformedHero);
          }
        }
        
        if (data.banner2) {
          const transformedAbout = transformAboutSlides(data.banner2);
          if (transformedAbout.length > 0) {
            setAboutData(transformedAbout);
          }
        }
        
        if (data.banner3) {
          const transformedProjects = transformProjectsSlides(data.banner3);
          if (transformedProjects.length > 0) {
            setProjectsData(transformedProjects);
          }
        }
      } catch (error) {
        console.error('Error al cargar los banners:', error);
        // Si hay error, se mantienen los datos por defecto de slides.js
        setHeroData(heroSlides);
        setAboutData(aboutSlides);
        setProjectsData(projectsSlides);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBanners();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Cargando...</div>
      </div>
    );
  }

  return (
    <div>
      <Carousel slides={heroData} height='calc(100vh - 198px)' buttons colorText={'#FFFFFF'} />
      <CourseSection/>
      <BannerImage slides={aboutData} />
      <Stats/>
      <Carousel slides={projectsData} marginBottom={65} colorText={'#6C1313'} background={'white'}/>
    </div>
  );
}
