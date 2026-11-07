import { FaFacebook, FaInstagram } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { MapPinIcon, EnvelopeIcon, ComputerDesktopIcon } from "@heroicons/react/20/solid";
import { useDashboardTheme } from "../../context/DashboardThemeContext";

export default function Footer() {
  const { isDark } = useDashboardTheme();

  return (
    <footer
      className={`transition-colors duration-200 border-t ${
        isDark
          ? "bg-[#0b0b0e] border-white/[0.08] text-zinc-300"
          : "bg-[#00223d] border-black/[0.06] text-white"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col items-center space-y-4">
          <p className="text-center md:text-left text-zinc-200">
            Innovamos con conocimiento, transformamos con tecnología y creamos oportunidades para el futuro.
          </p>
        </div>

        {/* Links y columnas informativas (siempre visibles) */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 justify-items-center">
          <div className="text-center md:text-left">
            <h3 className="text-white font-semibold mb-3">Contacto</h3>
            <ul className="space-y-2 text-zinc-300 text-sm">
              <li>
                <div className="flex items-center justify-center md:justify-start">
                  <MapPinIcon className="h-5 w-5 inline-block mr-2 shrink-0 text-blue-300" />
                  <span>Av. Bolivar Oeste 1800 y Av. Los Chasquis, Ambato - Ecuador</span>
                </div>
              </li>
              <li>
                <div className="flex items-center justify-center md:justify-start">
                  <EnvelopeIcon className="h-5 w-5 inline-block mr-2 shrink-0 text-blue-300" />
                  <a href="mailto:talleresfisei@uta.edu.ec" className="hover:underline">talleresfisei@uta.edu.ec</a>
                </div>
              </li>
              <li>
                <div className="flex items-center justify-center md:justify-start">
                  <EnvelopeIcon className="h-5 w-5 inline-block mr-2 shrink-0 text-blue-300" />
                  <a href="mailto:ctt.fisei@uta.edu.ec" className="hover:underline">ctt.fisei@uta.edu.ec</a>
                </div>
              </li>
              <li>
                <div className="flex items-center justify-center md:justify-start">
                  <ComputerDesktopIcon className="h-5 w-5 inline-block mr-2 shrink-0 text-blue-300" />
                  <a
                    href="https://ctt-talleresfisei.uta.edu.ec/edu/login/index.php"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:underline"
                  >
                    Plataforma Educativa
                  </a>
                </div>
              </li>
            </ul>
          </div>
          <div className="text-center md:text-left">
            <h3 className="text-white font-semibold mb-3">FISEI</h3>
            <ul className="space-y-2 text-zinc-300 text-sm">
              <li>Decano - Ing. Franklin Mayorga, Mg.</li>
              <li>Subdecano - Ing. Luis Morales, Mg.</li>
              <li>Coordinador - Ing. Daniel Jerez, Mg.</li>
            </ul>
          </div>
          <div className="text-center md:text-left">
            <h3 className="text-white font-semibold mb-3">Redes Sociales</h3>
            <div className="mt-4 flex justify-center md:justify-start space-x-6 text-xl">
              <a
                href="https://www.facebook.com/UniversidadTecnicadeAmbatoOficial"
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                className="text-zinc-300 hover:text-white transition-colors"
              >
                <FaFacebook />
              </a>
              <a
                href="https://www.instagram.com/utecnicaambato/"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="text-zinc-300 hover:text-white transition-colors"
              >
                <FaInstagram />
              </a>
              <a
                href="https://x.com/UTecnicaAmbato"
                target="_blank"
                rel="noreferrer"
                aria-label="X (Twitter)"
                className="text-zinc-300 hover:text-white transition-colors"
              >
                <FaXTwitter />
              </a>
            </div>
            <h3 className="text-white font-semibold mb-2 mt-6">Información</h3>
            <p className="text-sm text-zinc-300">
              Centro de Transferencia Tecnológica FISEI - UTA
            </p>
          </div>
        </div>

        <div className="mt-12 border-t border-white/10 pt-6 text-center">
          <p className="text-xs text-zinc-400">
            &copy; 2025 Centro de Transferencia y Desarrollo de Tecnologías, Universidad Técnica de Ambato. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
