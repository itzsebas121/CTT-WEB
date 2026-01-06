# CTT-Web - Estructura del Proyecto Refactorizada

## 📁 Estructura de Carpetas

```
ctt-web/
├── public/
├── src/
│   ├── api/                      # Servicios de API
│   │   ├── api.js               # Configuración base de Axios
│   │   ├── auth.js              # Autenticación
│   │   ├── courses.js           # Endpoints de cursos
│   │   └── inscripciones.js     # Endpoints de inscripciones
│   │
│   ├── assets/                   # Recursos estáticos (imágenes, etc.)
│   │
│   ├── components/               # Componentes React organizados por función
│   │   ├── layout/              # Componentes de layout
│   │   │   ├── Header.jsx
│   │   │   ├── Nav.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── Menu.jsx
│   │   │   └── index.js         # Barrel export
│   │   │
│   │   ├── ui/                  # Componentes UI reutilizables
│   │   │   ├── Table.jsx
│   │   │   ├── EnrollmentModal.jsx
│   │   │   ├── FilterSideBar.jsx
│   │   │   ├── ItemHeader.jsx
│   │   │   └── index.js         # Barrel export
│   │   │
│   │   ├── home/                # Componentes específicos del home
│   │   │   ├── Carousel.jsx
│   │   │   ├── BannerImage.jsx
│   │   │   ├── Hero.jsx
│   │   │   ├── Section.jsx
│   │   │   ├── Stats.jsx
│   │   │   └── index.js         # Barrel export
│   │   │
│   │   └── courses/             # Componentes de cursos
│   │       ├── CardCourse.jsx
│   │       ├── CourseSection.jsx
│   │       ├── CoursesList.jsx
│   │       ├── CourseHeader.jsx
│   │       ├── CourseContent.jsx
│   │       ├── CourseDates.jsx
│   │       ├── CourseMaterials.jsx
│   │       ├── CourseObjetives.jsx
│   │       ├── CourseRequirements.jsx
│   │       ├── CourseSidebar.jsx
│   │       └── index.js         # Barrel export
│   │
│   ├── constants/               # Constantes y configuraciones
│   │   ├── navigation.js        # Datos de navegación
│   │   └── slides.js            # Datos de slides/carousels
│   │
│   ├── hooks/                   # Custom React hooks
│   │   ├── useFetch.js         # Hook para carga de datos
│   │   └── useWindowSize.js    # Hook para tamaño de ventana
│   │
│   ├── pages/                   # Páginas de la aplicación
│   │   ├── Home.jsx
│   │   ├── Courses.jsx
│   │   ├── CourseDetail.jsx
│   │   ├── Contact.jsx
│   │   ├── Nosotros.jsx
│   │   ├── auth/                # Páginas de autenticación
│   │   │   ├── Login.jsx
│   │   │   └── Register.jsx
│   │   └── application/         # Páginas del dashboard
│   │       ├── Dashboard.jsx
│   │       └── Cursos.jsx
│   │
│   ├── utils/                   # Funciones utilitarias
│   │   ├── helpers.js          # Funciones helper generales
│   │   └── auth.js             # Utilidades de autenticación
│   │
│   ├── App.css
│   ├── App.jsx                  # Componente principal con rutas
│   ├── index.css               # Estilos globales
│   └── main.jsx                # Punto de entrada
│
├── eslint.config.js
├── index.html
├── package.json
├── README.md
└── vite.config.js
```

## 🎯 Mejoras Implementadas

### 1. **Nomenclatura Consistente**
- ✅ Todos los componentes React ahora usan **PascalCase**
- ✅ Carpetas en minúsculas siguiendo convenciones
- ✅ Archivos renombrados: `header.jsx` → `Header.jsx`, `carrussel.jsx` → `Carousel.jsx`, etc.

### 2. **Organización por Funcionalidad**
- **`components/layout/`**: Componentes de estructura (Header, Nav, Footer, Menu)
- **`components/ui/`**: Componentes reutilizables (Table, Modal, Filter)
- **`components/home/`**: Componentes específicos de la página de inicio
- **`components/courses/`**: Todo relacionado con cursos en un solo lugar

### 3. **Separación de Concerns**
- **`constants/`**: Datos estáticos centralizados
- **`utils/`**: Funciones auxiliares reutilizables
- **`hooks/`**: Custom hooks para lógica compartida
- **`api/`**: Toda la lógica de comunicación con backend

### 4. **Barrel Exports**
```javascript
// Antes
import Header from './components/layout/Header';
import Nav from './components/layout/Nav';
import Footer from './components/layout/Footer';

// Ahora
import { Header, Nav, Footer } from './components/layout';
```

### 5. **Constantes Centralizadas**
```javascript
// src/constants/navigation.js
export const mainNavigation = [...];
export const headerNavigation = [...];
export const dashboardMenuItems = [...];

// src/constants/slides.js
export const heroSlides = [...];
export const aboutSlides = [...];
export const projectsSlides = [...];
```

## 🚀 Cómo Usar

### Importar Componentes

```javascript
// Componentes de layout
import { Header, Nav, Footer, Menu } from './components/layout';

// Componentes UI
import { Table, EnrollmentModal, FilterSideBar } from './components/ui';

// Componentes de home
import { Carousel, BannerImage, Stats } from './components/home';

// Componentes de cursos
import { CourseSection, CoursesList, CardCourse } from './components/courses';

// Constantes
import { mainNavigation, heroSlides } from './constants';

// Hooks personalizados
import { useFetch, useWindowSize } from './hooks';

// Utilidades
import { formatDate, isValidEmail } from './utils/helpers';
import { isAuthenticated, getToken } from './utils/auth';
```

## 🛠️ Scripts Disponibles

```bash
# Desarrollo
npm run dev

# Build para producción
npm run build

# Vista previa de producción
npm run preview

# Linting
npm run lint
```

## 📝 Convenciones de Código

### Nombres de Archivos
- **Componentes React**: `PascalCase.jsx` (Ej: `CardCourse.jsx`)
- **Utilidades/Hooks**: `camelCase.js` (Ej: `useFetch.js`)
- **Constantes**: `camelCase.js` (Ej: `navigation.js`)

### Estructura de Componentes
```javascript
// 1. Imports
import { useState } from 'react';
import { Component } from './components';

// 2. Constantes del componente (si no están en constants/)
const LOCAL_CONST = 'value';

// 3. Componente
export default function MyComponent() {
  // 3.1. Hooks
  const [state, setState] = useState();
  
  // 3.2. Funciones
  const handleClick = () => {};
  
  // 3.3. Render
  return (
    <div>Content</div>
  );
}
```

## 📦 Dependencias Principales

- **React 19.1.1**: Framework principal
- **React Router DOM 7.9.1**: Navegación
- **Axios 1.12.2**: Cliente HTTP
- **Tailwind CSS 4.1.13**: Estilos
- **Heroicons 2.2.0**: Iconos
- **AOS 2.3.4**: Animaciones

## 🔐 Autenticación

El proyecto utiliza JWT para autenticación. Las utilidades están en `src/utils/auth.js`:

```javascript
import { isAuthenticated, getToken, saveAuthData, clearAuthData } from './utils/auth';

// Verificar si está autenticado
if (isAuthenticated()) {
  // Usuario autenticado
}

// Obtener token
const token = getToken();

// Guardar datos de autenticación
saveAuthData(token, userData);

// Limpiar al cerrar sesión
clearAuthData();
```

## 🎨 Estilos

- **Tailwind CSS** para la mayoría de estilos
- **CSS Modules** en `App.css` e `index.css`
- **Animaciones** con AOS (Animate On Scroll)

## 📱 Responsive Design

El proyecto es completamente responsive con breakpoints:
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

---

## 👥 Contribuir

1. Seguir las convenciones de nomenclatura establecidas
2. Organizar nuevos componentes en las carpetas apropiadas
3. Crear barrel exports para nuevas carpetas de componentes
4. Documentar funciones complejas
5. Mantener la separación de concerns

---

**Última actualización**: Octubre 2025
**Branch**: fixedHome
**Repository**: CTT-Web
