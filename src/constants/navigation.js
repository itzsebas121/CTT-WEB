import { DocumentMagnifyingGlassIcon, ComputerDesktopIcon } from '@heroicons/react/24/outline';

// Navegación principal del header
export const headerNavigation = [
  { id: 0, title: 'Verifica Tu Certificado', href: 'Ingresa aquí', icon: DocumentMagnifyingGlassIcon },
  { id: 1, title: 'Plataforma Educativa', href: 'Ingresa aquí', icon: ComputerDesktopIcon },
];

// Navegación principal del navbar
export const mainNavigation = [
  { id: 0, title: 'Home', href: '/' },
  { id: 1, title: 'Cursos', href: 'courses' },
  { id: 2, title: 'Nosotros', href: 'nosotros' },
  { id: 3, title: 'Contáctanos', href: 'contact' },
];

// Items del header móvil
export const itemsHeader = [
  { id: 1, title: 'Verificar Certificado', href: 'https://ctt-talleresfisei.uta.edu.ec/edu/mod/customcert/verify_certificate.php' },
  { id: 2, title: 'Plataforma Educativa', href: 'https://ctt-talleresfisei.uta.edu.ec/edu/login/index.php' },
];

// Menú del dashboard
export const dashboardMenuItems = [
  { 
    name: "Cursos", 
    path: "/dashboard/cursos",
    subItems: [
      { name: "Cursos Disponibles", path: "/dashboard/cursos/disponibles" },
      { name: "Cursos Inscrito", path: "/dashboard/cursos/inscrito" }
    ]
  },
   { 
    name: "Ordenes de Pago", 
    path: "/dashboard/ordenes",
    subItems: [
      { name: "Ordenes Pendientes", path: "/dashboard/ordenes/pendientes" },
      { name: "Ordenes Completadas", path: "/dashboard/ordenes/completadas" }
    ]
  },
];
