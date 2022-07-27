import { Outlet, Navigate} from 'react-router-dom'
import Header from '../components/Header'
import Sidebar from '../components/Sidebar'
import useAuth from '../hooks/useAuth'

const RutaProtegida = () => {
    // cuando hacemos login se establece la autenticacio "auth" entonces podemos acceder a las rutas privadas
    const { auth, cargando } = useAuth()

    //console.log(auth);
    if(cargando) return 'Cargando...'

     //outlet permite entrar a las paginas hijas definidas de las etiquetas Route -> proyectos, etc
  return (
    <>
        {auth._id ? 
        (
            <div className='bg-gray-100'>
                <Header />

                <div className='md:flex md:min-h-screen'>
                    <Sidebar />

                    <main className='p-10 flex-1 '>
                        <Outlet />
                    </main>

                </div>

            </div>
        )
        : 
        <Navigate to='/'/>} 
    </>
  )
}

export default RutaProtegida