export default function Login365() {
    const handleSubmit = () => {
        //TODO: Implementar logeo con Microsoft 365X
        alert('Pendiente logeo con Microsoft 365')
    }
    return (
        <div className="flex flex-col items-center gap-2">
            <h2>Ingresar con</h2>
            <div className="flex items-center gap-2 border-secondary border-[2px]  p-1 rounded-md cursor-pointer justify-center w-[60%] hover:border-accent-red hover:border-[3px] hover:scale-102 transition-all"
                onClick={handleSubmit}>
                <img src="/logo365.webp" alt="Logo Microsoft 365" className="w-10 h-10" />
                <span>Microsoft 365</span>
            </div>
        </div>
    )
}