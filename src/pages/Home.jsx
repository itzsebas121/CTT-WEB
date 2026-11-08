import { useState, useEffect, useRef } from 'react';
import { Stats, Carousel, BannerImage } from '../components/home';
import { CourseSection } from '../components/courses';
import { heroSlides, aboutSlides, projectsSlides } from '../constants/slides';
import { 
  getBanners, 
  transformHeroSlides, 
  transformAboutSlides, 
  transformProjectsSlides 
} from '../api/banners';
import { useDashboardTheme } from '../context/DashboardThemeContext';
import { ScrollTrigger } from '../utils/gsapConfig';

export default function Home() {
  const { isDark } = useDashboardTheme();
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
        setHeroData(heroSlides);
        setAboutData(aboutSlides);
        setProjectsData(projectsSlides);
      } finally {
        setIsLoading(false);
        // Recalcular posiciones de ScrollTrigger una vez los banners se cargaron
        setTimeout(() => {
          ScrollTrigger.refresh();
        }, 100);
      }
    };

    fetchBanners();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-[#00345e] border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className={`transition-colors duration-200 ${isDark ? 'bg-[#121215] text-zinc-100' : 'bg-white text-zinc-900'}`}>
      <section className="relative z-10">
        <Carousel slides={heroData} height="calc(100vh - 198px)" buttons colorText="#FFFFFF" />
      </section>

      <section className="relative z-20">
        <CourseSection />
      </section>

      <section className="relative z-10">
        <BannerImage slides={aboutData} />
      </section>

      <section className="relative z-20">
        <Stats />
      </section>

      <section className="relative z-10">
        <Carousel
          slides={projectsData}
          height="560px"
          background={isDark ? '#16161a' : '#ffffff'}
        />
      </section>
    </div>
  );
}
