import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

// Registrar plugins oficiales
gsap.registerPlugin(ScrollTrigger, useGSAP);

// Configuración global de ScrollTrigger
ScrollTrigger.config({
  limitCallbacks: true,
  ignoreMobileResize: true,
});

/**
 * Helper para verificar si el usuario prefiere movimiento reducido
 */
export const prefersReducedMotion = () => {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
};

export { gsap, ScrollTrigger, useGSAP };
export default gsap;
