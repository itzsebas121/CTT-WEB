import { DocumentMagnifyingGlassIcon, ComputerDesktopIcon } from '@heroicons/react/24/outline'
import { useState, useEffect } from 'react'
import ItemHeader from '../ui/ItemHeader'
import { headerNavigation } from '../../constants/navigation'

export default function Header() {
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      
      // Si estamos en el top, siempre mostrar el header
      if (currentScrollY < 10) {
        setIsVisible(true)
      } 
      // Si hacemos scroll hacia abajo, ocultar
      else if (currentScrollY > lastScrollY) {
        setIsVisible(false)
      } 
      // Si hacemos scroll hacia arriba, mostrar
      else {
        setIsVisible(true)
      }
      
      setLastScrollY(currentScrollY)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    
    return () => window.removeEventListener('scroll', handleScroll)
  }, [lastScrollY])

  return (
    <>
        <header className={`sticky hidden md:block top-0 w-full z-50 bg-white shadow-sm transition-transform duration-300 ${
          isVisible ? 'translate-y-0' : '-translate-y-full'
        }`}>
            <nav aria-label="Global" className="flex items-center justify-between p-6 lg:px-8">
            <div className="hidden md:flex lg:flex lg:flex-1">
                <a href="#" className="-m-1.5 p-1.5">
                <img
                    alt=""
                    src="src/assets/logoUTA.webp"
                    className="h-22 w-auto"
                />
                </a>
            </div>
            <div className="hidden md:flex md:gap-x-0 lg:flex lg:gap-x-12">
                {headerNavigation.map((item) => (
                    <ItemHeader key={item.id} item={item} />
                ))}
            </div>
            
            {/* Logo CTT - Solo en desktop */}
            <div className="lg:flex lg:flex-1 lg:justify-end">
                <a href="#" className="-m-1.5 p-1.5">
                    <img
                        alt="CTT Logo"
                        src="src/assets/logoCTT.webp"
                        className="h-22 w-auto"
                    />
                </a>
            </div>
            <div className=" flex flex-1 lg:hidden md:hidden pl-10">
                <a href="#" className="-m-1.5 p-1.5">
                <img
                    alt=""
                    src="src/assets/logoUTAPequeño.png"
                    className="h-15 w-auto min-w-30"
                />
                </a>
            </div>
            </nav>
        </header>
    </>
  )
}
