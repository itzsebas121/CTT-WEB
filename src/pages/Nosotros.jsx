import { Carousel, Section, BannerImage } from "../components/home";
const contentHero =[
  {
    id: 1,
    image:
      "https://ctt-talleresfisei.uta.edu.ec/img/carrusel/carrusel_2.jpeg", 
    title: "Nosotros",
    subtitle: "Conoce más sobre nosotros",
  },

];

const item = {
    id: 1,
    title: 'Nosotros',
    subtitle: 'Nuestros objetivos.',
    list: [
        {
            id: 1,
            title: 'Formular ',
            description:
            'alternativas tecnológicas aplicables a la solución de problemas inherentes a sus áreas de trabajo, que satisfagan las necesidades básicas de la población en general con el fin de propender a su desarrollo.',
            icon: 'AcademicCapIcon',
        },
        {
            id: 2,
            title: 'Proporcionar ',
            description: 'capacitación, asesoramiento técnico y consultorías a los sectores públicos y privados.',
            icon: 'AcademicCapIcon',
        },
        {
            id: 3,
            title: 'Brindar ',
            description: 'soporte académico y técnico a las carreras profesionales relacionadas con sus áreas de trabajo.',
            icon: 'AcademicCapIcon',
        },
        {
            id: 4,
            title: 'Difundir ',
            description: 'el conocimiento técnico - científico existente, en foros nacionales e internacionales a través de concursos, congresos, seminarios, conferencias y publicaciones de artículos.',
            icon: 'AcademicCapIcon',
        },
    ],
    image: "https://ctt-talleresfisei.uta.edu.ec/img/equipo_fisei.jpg"
}

const slides = [
  {
    id: 1,
    image: "src/assets/fisei.jpg",
    title: "El inicio de una nueva forma de aprendizaje.",
    subtitle: "Sobre Nosotros",
    text: "El 20 de octubre de 2002 se crea el Centro de Transferencia y Desarrollo de Tecnologías mediante resolución 1452-2002-CU-P en la áreas de Ingenierías en Sistemas, Electrónica e Industrial de la Universidad Técnica de Ambato, para proveer servicios a la comunidad mediante la realización de trabajos y proyectos específicos , asesorías, estudios, investigaciones, cursos de entrenamiento, seminarios y otras actividades de servicios a los sectores sociales y productivos en las áreas de Ingeniería en Sistemas computacionales e Informáticos, Ingeniería Electrónica y Comunicaciones e Ingeniería Industrial en Procesos de Automatización.",
    buttonText: "Más información",
    buttonLink: "#",
  },
]

export default function Nosotros() {
  return (
    <>
        <Carousel slides={contentHero} height="400px" background={'white'} colorText={'#6C1313'} />
        <Section item={item}/>
        <BannerImage slides={slides} />
    </>
  )
}
