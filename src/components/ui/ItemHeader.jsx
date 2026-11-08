export default function ItemHeader({ item }) {
  return (
    <div key={item.id} className="flex items-center gap-x-2.5">
      <item.icon className="size-7 text-[#00345e] dark:text-blue-400 shrink-0" aria-hidden="true" />
      <div className="text-xs sm:text-sm font-semibold leading-snug flex flex-col items-start">
        <label className="text-zinc-800 dark:text-zinc-100 font-medium">{item.title}</label>
        <a
          href={item.href}
          className="block text-xs sm:text-sm text-[#00345e] dark:text-blue-400 hover:text-[#00223d] dark:hover:text-blue-300 hover:underline transition-colors"
        >
          Ingresa aquí
        </a>
      </div>
    </div>
  );
}
