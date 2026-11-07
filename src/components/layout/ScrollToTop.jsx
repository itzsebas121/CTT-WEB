import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { ScrollTrigger } from "../../utils/gsapConfig";

/**
 * ScrollToTop: Restaura inmediatamente el scroll al tope (0, 0)
 * y recalcula ScrollTrigger en cada cambio de ruta.
 */
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant",
    });
    if (document.documentElement) document.documentElement.scrollTop = 0;
    if (document.body) document.body.scrollTop = 0;

    // Delay para permitir que el nuevo componente monte antes de recalcular
    const timer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 60);

    return () => clearTimeout(timer);
  }, [pathname]);

  return null;
}
