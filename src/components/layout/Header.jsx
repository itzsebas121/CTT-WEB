import ItemHeader from '../ui/ItemHeader'
import { headerNavigation } from '../../constants/navigation'
import logoUta from '../../assets/logoUTA.webp'
import logoUtaWhite from '../../assets/logoUTA-sidebar-white.png'
import logoCtt from '../../assets/logoCTT.webp'
import logoUtaPequeno from '../../assets/LogoUTAPequeño.png'
import { useDashboardTheme } from '../../context/DashboardThemeContext'

export default function Header() {
  const { isDark } = useDashboardTheme()

  return (
    <header className="relative hidden md:block w-full bg-white dark:bg-[#121215] border-b border-black/[0.06] dark:border-white/[0.08] shadow-2xs transition-colors duration-200 z-30">
      <nav aria-label="Global" className="flex items-center justify-between p-4 lg:px-8">
        <div className="hidden md:flex lg:flex lg:flex-1 items-center">
          <a href="https://uta.edu.ec/" className="-m-1.5 p-1.5 flex items-center" target="_blank" rel="noreferrer">
            <img
              alt="UTA Logo"
              src={isDark ? logoUtaWhite : logoUta}
              className="h-16 lg:h-20 w-auto object-contain transition-opacity duration-200"
            />
          </a>
        </div>
        <div className="hidden md:flex md:gap-x-4 lg:flex lg:gap-x-12">
          {headerNavigation.map((item) => (
            <ItemHeader key={item.id} item={item} />
          ))}
        </div>
        
        {/* Logo CTT - Solo en desktop */}
        <div className="lg:flex lg:flex-1 lg:justify-end items-center">
          <a href="https://uta.edu.ec/ctt-fisei/" className="-m-1.5 p-1.5 flex items-center" target="_blank" rel="noreferrer">
            <img
              alt="CTT Logo"
              src={logoCtt}
              className="h-16 lg:h-20 w-auto object-contain p-1 rounded-lg bg-white/95 dark:bg-white/90 shadow-2xs"
            />
          </a>
        </div>
        <div className="flex flex-1 lg:hidden md:hidden pl-10 items-center">
          <a href="https://uta.edu.ec/" className="-m-1.5 p-1.5 flex items-center" target="_blank" rel="noreferrer">
            <img
              alt="UTA Logo"
              src={isDark ? logoUtaWhite : logoUtaPequeno}
              className="h-12 w-auto object-contain"
            />
          </a>
        </div>
      </nav>
    </header>
  )
}
