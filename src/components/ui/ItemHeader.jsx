
export default function ItemHeader({item}) {
  return (
        <div key={item.id} className="flex items-center gap-x-2">
            <item.icon className="size-8 text-gray-400 dark:text-zinc-500" aria-hidden="true" />
            <div className="text-xs sm:text-sm font-semibold leading-snug flex flex-col items-start text-gray-700 dark:text-zinc-200">
                <label className="text-zinc-700 dark:text-zinc-300 font-medium">{item.title}</label>
                <a href={item.href} className="block text-xs sm:text-sm text-primary dark:text-[#5b8dd8] hover:text-primary-hover dark:hover:text-blue-300 transition-colors">Ingresa aquí</a>
            </div>
        </div>
  )
}
