import * as Icons from '@heroicons/react/24/outline'

export default function Section({item}) {
  return (
    <div className="overflow-hidden bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-2">
          <div className="lg:pt-4 lg:pr-8">
            <div className="lg:max-w-lg">
              <h2 className="text-2xl font-semibold text-[#6C1313]">{item.title}</h2>
              <p className="mt-2 text-3xl font-semibold tracking-tight text-pretty text-gray-900 sm:text-5xl">
                {item.subtitle}
              </p>
              { item.description && (
                <p className="mt-6 text-lg/8 text-gray-700">
                  {item.description}
                </p>
              ) }
              { item.list && (
                <dl className="mt-10 max-w-xl space-y-8 text-base/7 lg:max-w-none">
                  {item.list.map((item, index) => {
                      const  Icono = Icons[item.icon];
                        return (
                          <div key={index} className="relative pl-9">
                            <dt className="inline font-semibol text-[#6C1313]">
                              <Icono aria-hidden="true" className="absolute top-1 left-1 size-5" />
                              {item.title}
                            </dt>
                            <dd className="inline text-gray-700">{item.description}</dd>
                          </div>
                        )
                  })}
                </dl>
              )}
              { item.buttonText && (
                <button className="rojo mt-6">
                  Más información...
                </button>
              )}
            </div>
          </div>
          <img
            alt="Product screenshot"
            src={item.image}
            width={2432}
            height={1442}
            className="w-3xl max-w-none rounded-xl shadow-xl ring-1 ring-gray-400/10 sm:w-228 md:-ml-4 lg:-ml-0"
          />
        </div>
      </div>
    </div>
  )
}
