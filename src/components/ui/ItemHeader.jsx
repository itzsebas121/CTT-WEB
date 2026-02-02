
export default function ItemHeader({item}) {
  return (
        <div key={item.id} className="flex items-center gap-x-2">
            <item.icon className="size-10 text-gray-500" aria-hidden="true" />
            <div className="text-sm/6 font-semibold leading-6 flex flex-col items-start text-gray-500">
                <label>{item.title}</label>
                <a href={item.href} className="block text-sm/6 text-primary hover:text-primary-hover transition-colors">Ingresa aquí</a>
            </div>
        </div>
  )
}
