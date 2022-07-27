import { useState, useEffect, createContext } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import clienteAxios from "../config/clienteAxios";


//El auth provider verifica que este el token activo y se procede a entrar a las rutas privadas y se ejecuta si se accede a la pag por primera vez
//o cuando recargamos la pág
const AuthContext = createContext();

const AuthProvider = ({children}) => {

    const [auth, setAuth] = useState({})
    const [cargando, setCargando] = useState(true)

    const navigate = useNavigate();

    useEffect(() => {
        const autenticarUsuario = async () => {
            const token = localStorage.getItem('token')
            console.log('Hola auth provider')

            if(!token) {
                setCargando(false)
                return
            }

            //console.log('Si hay un token');

            const config = {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                }
            }

            try {
                const { data } = await clienteAxios('/usuarios/perfil', config); //ir a esa url y pasamos el bearer token para revisar y validar en le chekAuth.js 
                setAuth(data)
                //opcional -> navigate('/proyectos') //navega automaticamente estando en sesion abierta, no se puede ver la pag login

                console.log(data);  //obtiene la informacion del usuario autenticado nombre correo y id
                setAuth(data);
            } catch (error) {
                setAuth({}) //en caso de que expire el token o algo para regresar al estado inicial
            }
            
            setCargando(false)
        
        }
        autenticarUsuario()
      
    }, [])

    const cerrarSesionAuth = () => {
        setAuth({})
    }
    

    return (
        <AuthContext.Provider
            value={{
                auth,
                setAuth,
                cargando,
                cerrarSesionAuth
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}

export {
    AuthProvider
}

export default AuthContext;