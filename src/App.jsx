import './App.css'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { Header, Nav, Footer } from './components/layout'
import Home from './pages/Home'
import Courses from './pages/Courses'
import CourseDetail from './pages/CourseDetail'
import Nosotros from './pages/Nosotros'
import Contact from './pages/Contact'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import Dashboard from './pages/application/Dashboard'
import Cursos from './pages/application/Cursos'
import CursosInscritos from './pages/application/CursosInscritos'
import { useSessionExpiration } from './hooks/useSessionExpiration'
import { isAuthenticated } from './utils/auth'

function App() {
  const location = useLocation()
  const isLogin = location.pathname === '/login' || location.pathname === '/register' || location.pathname.startsWith('/dashboard')

  // Activar el control de expiración de sesión
  useSessionExpiration();

  // Componente para proteger rutas (solo entra si hay token válido)
  const PrivateRoute = ({ children }) => {
    return isAuthenticated() ? children : <Navigate to="/login" replace />;
  };

  return (
      <>
        {!isLogin && <Header />}
        {!isLogin && <Nav />}

        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Home />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/course/:id" element={<CourseDetail />} />
          <Route path="/nosotros" element={<Nosotros />} />
          <Route path="/contact" element={<Contact />} />

          {/* Rutas privadas dentro del dashboard */}
          <Route
            path="/dashboard/*"
            element={
              <PrivateRoute>
                <Dashboard/>
              </PrivateRoute>
            }
            
          >
            <Route index element={<Navigate to="cursos/disponibles" replace />} />  
            <Route path="cursos/disponibles" element={<Cursos />} />
            <Route path="cursos/inscrito" element={<CursosInscritos />} />
            <Route path="curso/:id" element={<CourseDetail />} />
            {/* Otras rutas privadas pueden ir aquí */}
          </Route>

          <Route path="*" element={<Home />} />
        </Routes>

        {!isLogin && <Footer />}
      </>
  )
}

export default App
