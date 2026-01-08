
import { useState } from "react"
import LoginLocal from "./typeLogin/LoginLocal"
import Login365 from "./typeLogin/Login365"

export default function Login() {
  const [loginType, setLoginType] = useState('local')

  return (
    <>
      <div
        className="flex h-screen flex-col justify-center"
        style={{
          backgroundImage: `url('src/assets/fisei.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <div className="sm:mx-auto bg-white rounded-2xl shadow-xl border border-gray-300 p-8 sm:w-full sm:max-w-[500px]">
          <div className="sm:mx-auto sm:w-full sm:max-w-sm">
            <img
              alt="Your Company"
              src="src/assets/logoCTT.webp"
              className="mx-auto h-30 w-auto"
            />
            <h2 className="text-center text-2xl font-bold mt-1 tracking-tight text-[#6C1313]">
              Iniciar Sesión
            </h2>
          </div>

          <div className="flex justify-between gap-5 mt-4">
            {loginType === 'local' ? (
              <a
                type="button"
                className={`cursor-pointer flex w-full justify-center rounded-md py-2 px-4 text-sm font-semibold shadow-sm focus-visible:outline-offset-2 bg-amber-950 
                  }`}
                onClick={() => setLoginType('local')}
              >
                Local
              </a>
            ) : (
              <a
                type="button"
                className={`cursor-pointer flex w-full justify-center rounded-md py-2 px-4 text-sm font-semibold shadow-sm focus-visible:outline-offset-2 bg-[#CB972D]`}
                onClick={() => setLoginType('local')}
              >
                Local
              </a>
            )}
            {loginType === '365' ? (
              <a
                type="button"
                className={`cursor-pointer flex w-full justify-center rounded-md py-2 px-4 text-sm font-semibold shadow-sm focus-visible:outline-offset-2 bg-amber-950 
                  }`}
                onClick={() => setLoginType('365')}
              >
                365
              </a>
            ) : (
              <a
                type="button"
                className={`cursor-pointer flex w-full justify-center rounded-md py-2 px-4 text-sm font-semibold shadow-sm focus-visible:outline-offset-2 bg-[#CB972D]`}
                onClick={() => setLoginType('365')}
              >
                365
              </a>
            )}

          </div>

          <div className="mt-4">
            {loginType === 'local' ? <LoginLocal /> : <Login365 />}
          </div>

        </div>
      </div >
    </>
  )
}
