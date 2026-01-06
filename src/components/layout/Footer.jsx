import { FaFacebook, FaInstagram, FaTwitter } from "react-icons/fa";
import { MapPinIcon, EnvelopeIcon, ComputerDesktopIcon } from "@heroicons/react/20/solid";
import { useEffect } from "react"
import AOS from "aos"
import 'aos/dist/aos.css'
export default function Footer() {
  useEffect(() => {
              AOS.init({ duration: 1000, once: false });
              AOS.refresh();
  }, []);
  return (
    <footer className="bg-gray-900" data-aos="fade-down">
      <div className="max-w-7xl mx-auto px-6 py-12 ">
        <div className="flex flex-col items-center space-y-4">
          <p className="text-center md:text-left text-white agray">
            Innovamos con conocimiento, transformamos con tecnología y creamos oportunidades para el futuro.
          </p>
        </div>

        {/* Links */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 justify-items-center">
          <div className="text-center md:text-left">
            <h3 className="text-white font-semibold mb-3">Contacto</h3>
            <ul className="space-y-2">
              <li>
                <div>
                    <MapPinIcon className="agray h-5 w-5 inline-block mr-2" />
                    <a href="#" className="agray">Av. Bolivar Oeste 1800 y Av. Los Chasquis, Ambato - Ecuador</a>
                </div>
              </li>
              <li>
                <div>
                    <EnvelopeIcon className="agray h-5 w-5 inline-block mr-2" />
                    <a href="#" className="agray">talleresfisei@uta.edu.ec</a>
                </div>
              </li>
              <li>
                <div>
                    <EnvelopeIcon className="agray h-5 w-5 inline-block mr-2" />
                    <a href="#" className="agray">ctt.fisei@uta.edu.ec</a>
                </div>
              </li>
              <li>
                <div>
                    <ComputerDesktopIcon className="agray h-5 w-5 inline-block mr-2" />
                    <a href="#" className="agray">Plataforma Educativa</a>
                </div>
              </li>
            </ul>
          </div>
          <div className="text-center md:text-left">
            <h3 className="text-white font-semibold mb-3">FISEI</h3>
            <ul className="space-y-2">
              <li><a href="#" className="agray">Decano - Ing. Franklin Mayorga, Mg.</a></li>
              <li><a href="#" className="agray">Subdecano - Ing. Luis Morales, Mg.</a></li>
              <li><a href="#" className="agray">Coordinador - Ing. Daniel Jerez, Mg.</a></li>
            </ul>
          </div>
          <div className="text-center md:text-left">
            <h3 className="text-white font-semibold mb-3">Redes Sociales</h3>
            <div className="mt-6 flex justify-center space-x-6">
              <a href="#" className="hover:text-white"><FaFacebook /></a>
              <a href="#" className="hover:text-white"><FaInstagram />  </a>
              <a href="#" className="hover:text-white"><FaTwitter /></a>
            </div>
            <h3 className="text-white font-semibold mb-3 mt-5">Información</h3>
            <button className="text-sm"> Solicitar información CTT</button>
          </div>
        </div>
        
        <div className="mt-12 border-t border-gray-700 pt-6 text-center">
          <div className="mt-3">
            <p className="text-sm agray">&copy; 2025 Centro de Transferencia y Desarrollo de Tecnologías, Universidad Técnica de Ambato. Inc. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer> 
  )
}
