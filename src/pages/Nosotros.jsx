import { Carousel, Section, BannerImage } from "../components/home";
import fiseiImage from "../assets/fisei.jpg";

const contentHero = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1600&q=80",
    title: "Centro de Transferencia y Desarrollo de Tecnologías",
    subtitle: "Compromiso con la excelencia y la formación técnica continua en el centro del país.",
  },
];

const item = {
  id: 1,
  title: "Sobre el CTT FISEI",
  subtitle: "Nuestros objetivos institucionales",
  description:
    "El Centro de Transferencia y Desarrollo de Tecnologías (CTT) de la Facultad de Ingeniería en Sistemas, Electrónica e Industrial vincula la academia con las necesidades productivas de la sociedad.",
  list: [
    {
      id: 1,
      title: "Formular alternativas tecnológicas ",
      description:
        "aplicables a la solución de problemas inherentes a sus áreas de trabajo, impulsando el desarrollo sostenible de la comunidad.",
      icon: "AcademicCapIcon",
    },
    {
      id: 2,
      title: "Capacitación continua ",
      description:
        "asesoramiento técnico y consultorías especializadas a los sectores públicos, privados y profesionales independientes.",
      icon: "AcademicCapIcon",
    },
    {
      id: 3,
      title: "Soporte académico y técnico ",
      description:
        "de vanguardia a las carreras universitarias de la facultad, integrando teoría y laboratorios prácticos.",
      icon: "AcademicCapIcon",
    },
    {
      id: 4,
      title: "Difusión técnico-científica ",
      description:
        "a través de congresos internacionales, publicaciones científicas, seminarios y programas de entrenamiento de alta tecnología.",
      icon: "AcademicCapIcon",
    },
  ],
  image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80",
};

const slides = [
  {
    id: 1,
    image: fiseiImage,
    title: "El inicio de una nueva forma de aprendizaje.",
    subtitle: "Historia Institucional",
    text: "El 20 de octubre de 2002 se crea el Centro de Transferencia y Desarrollo de Tecnologías mediante resolución 1452-2002-CU-P en las áreas de Ingenierías en Sistemas, Electrónica e Industrial de la Universidad Técnica de Ambato, para proveer servicios a la comunidad mediante la realización de proyectos específicos, asesorías, investigaciones y cursos de entrenamiento.",
    buttonText: "Explorar Cursos",
    buttonLink: "/courses",
  },
];

export default function Nosotros() {
  return (
    <div className="w-full">
      <Carousel
        slides={contentHero}
        height="460px"
        background={true}
      />
      <Section item={item} />
      <BannerImage slides={slides} />
    </div>
  );
}
