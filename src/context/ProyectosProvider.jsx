import { createContext, useEffect, useState } from "react";
import clienteAxios from "../config/clienteAxios";
import { useNavigate } from "react-router-dom";
import io from 'socket.io-client'
import useAuth from "../hooks/useAuth";

let socket;

const ProyectosContext = createContext();

const ProyectosProvider = ({children}) => {
    console.log('se ejecuta provider')
    const [proyectos, setProyectos] = useState([])
    const [alerta, setAlerta] = useState({})
    const [proyecto, setProyecto] = useState({})
    const [cargando, setCargando] = useState(false)
    const [modalFormularioTarea, setModalFormularioTarea] = useState(false)
    const [tarea, setTarea] = useState({})
    const [modalEliminarTarea, setModalEliminarTarea] = useState(false)
    const [colaborador, setColaborador] = useState({})
    const [modalEliminarColaborador, setModalEliminarColaborador] = useState(false)
    const [buscador, setBuscador] = useState(false)

    const navigate = useNavigate();
    const {auth} = useAuth()
    console.log('proyecto', proyecto)

    useEffect( () => {
      const obtenerProyectos = async () => {
        try {
            const token = localStorage.getItem('token')
            console.log(token)
            if(!token) return

            const config = {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                }
            }

            const { data } = await clienteAxios('/proyectos', config)
            //console.log(data);
            setProyectos(data)
            
        } catch (error) {
            console.log(error);
        }
      }
      obtenerProyectos()
      
    }, [auth])

    useEffect(() => {
        socket = io(import.meta.env.VITE_BACKEND_URL)
    
    }, [])
    
    

    const mostrarAlerta = alerta => {
        setAlerta(alerta)

        setTimeout(() => {
            setAlerta({})
        }, 5000);
    }

    const submitProyecto = async proyecto => {
        //console.log(proyecto);

        if(proyecto.id) {
            await editarProyecto(proyecto)
        } else {
            await nuevoProyecto(proyecto)
        }
        
    }

    const editarProyecto = async proyecto => {
        // console.log('editando...');
        try {
            const token = localStorage.getItem('token')
            console.log(token)
            if(!token) return

            const config = {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                }
            }

            const { data } = await clienteAxios.put(`/proyectos/${proyecto.id}`, proyecto, config)
            console.log(data);

            // Sincronizar el state
            const proyectosActualizados = proyectos.map(proyectoState => proyectoState._id === data._id ? data : proyectoState)
            setProyectos(proyectosActualizados)
            // Mostrar la alerta
            setAlerta({
                msg: 'Proyecto Actualizado Correctamente',
                error: false,
            })

            setTimeout(() => {
                setAlerta({})
                navigate('/proyectos')
            }, 3000);

            // Redireccionar

        } catch (error) {
            console.log(error)
        }

    }

    const nuevoProyecto = async proyecto => {
        // console.log('creando...');
        try {
            const token = localStorage.getItem('token')
            if(!token) return

            const config = {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                }
            }

            const { data } = await clienteAxios.post('/proyectos', proyecto, config)
            //console.log(data);

            setProyectos([...proyectos, data])

            setAlerta({
                msg: 'Proyecto Creado Correctamente',
                error: false,
            })

            setTimeout(() => {
                setAlerta({})
                navigate('/proyectos')
            }, 3000);
        } catch (error) {
            
        }
    }

    const obtenerProyecto = async id => {
        //console.log( id );
        setCargando(true)

        try {
            const token = localStorage.getItem('token')
            console.log(token)
            if(!token) return

            const config = {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                }
            }

            const { data } = await clienteAxios(`/proyectos/${id}`, config)
            //console.log(data);
            setProyecto(data);
            setAlerta({})
            
        } catch (error) {
            //console.log(error);
            navigate('/proyectos')
            setAlerta({
                msg: error.response.data.msg,
                error: true
            })
            setTimeout(() => {
                setAlerta({})
            }, 3000);
        } finally {
            setCargando(false);
        }
    }

    const eliminarProyecto = async id => {
        console.log('Eliminando', id)
        try {
            const token = localStorage.getItem('token')
            if(!token) return

            const config = {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                }
            }

            const { data } = await clienteAxios.delete(`/proyectos/${id}`, config)
            //console.log(data);

            const proyectosActualizados = proyectos.filter(proyectoState => proyectoState._id !== id)
            setProyectos(proyectosActualizados);

            setAlerta({
                msg: data.msg,
                error: false
            })

            setTimeout(() => {
                setAlerta({})
                navigate('/proyectos')
            }, 3000);
        } catch (error) {
            
        }
    }

    const handleModalTarea = () => {
        setModalFormularioTarea(!modalFormularioTarea)
        setTarea({}) // Maneja el formulario de "Nueva tarea" enonces tiene que empezar con el formulario vacio
    }

    const submitTarea = async tarea => {
        //console.log(tarea)

        if(tarea?.id) {
            await editarTarea(tarea)
        } else {
            await crearTarea(tarea)
        }
    }

    const crearTarea = async tarea => {
        try {
            const token = localStorage.getItem('token')
            if(!token) return

            const config = {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                }
            }

            const { data } = await clienteAxios.post('/tareas', tarea, config)
            console.log(data);

            // Agrega la tarea al state
            /*const proyectoActualizado = {...proyecto}
            proyectoActualizado.tareas = [...proyecto.tareas, data]

            setProyecto(proyectoActualizado)*/
            console.log('Proyecto', proyecto)
            setAlerta({})
            setModalFormularioTarea(false)

            // SOCKET IO
            socket.emit('nueva tarea', data)
        } catch (error) {
            console.log(error)
        }
    }

    const editarTarea = async tarea => {
        try {
            const token = localStorage.getItem('token')
            if(!token) return

            const config = {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                }
            }

            const { data } = await clienteAxios.put(`/tareas/${tarea.id}`, tarea, config)
            console.log(data)

            //TODO: actualizar el DOM
            
            

            setAlerta({})
            setModalFormularioTarea(false)


            //  SOCKET
            socket.emit('actualizar tarea', data)
        } catch (error) {
            console.log(error)
        }
    }

    const handleModalEditarTarea = tarea => {
        //console.log(tarea);
        setTarea(tarea);
        setModalFormularioTarea(true)
    }

    const handleModalEliminarTarea = tarea => {
        setTarea(tarea)
        setModalEliminarTarea(!modalEliminarTarea)
    }

    const eliminarTarea = async () => {
        console.log(tarea)

        try {
            const token = localStorage.getItem('token')
            if(!token) return

            const config = {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                }
            }

            const { data } = await clienteAxios.delete(`/tareas/${tarea._id}`, config) //esta tarea viene de la base de datos
            console.log(data)
            setAlerta({
                msg: data.msg,
                error: false
            })


            //TODO: actualizar el DOM
            
            setModalEliminarTarea(false)

            // SOCKET 
            socket.emit('eliminar tarea', tarea)

            setTarea({})
            setTimeout(() => {
                setAlerta({})
            }, 3000);
        } catch (error) {
            console.log(error)
        }
    }

    const submitColaborador = async (email) => {
        //console.log(email)
        setCargando(true)
        try {
            const token = localStorage.getItem('token')
            if(!token) return

            const config = {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                }
            }

            const {data} = await clienteAxios.post('/proyectos/colaboradores', {email}, config)
            console.log(data);

            setColaborador(data)
            setAlerta({})

        } catch (error) {
            console.log(error.response)
            setAlerta({
                msg: error.response.data.msg,
                error: true
            })
        } finally {
            setCargando(false)
        }
    }


    const agregarColaborador = async email => {
        console.log(email)
        console.log(proyecto)

        try {
            const token = localStorage.getItem('token')
            if(!token) return

            const config = {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                }
            }

            const {data} = await clienteAxios.post(`/proyectos/colaboradores/${proyecto._id}`, email, config)
            console.log(data);

            setAlerta({
                msg: data.msg,
                error: false
            })

            setColaborador({}) //resetear 
            //setAlerta({}) //
            setTimeout(() => {
                setAlerta({})
            }, 3000);

        } catch (error) {
            console.log(error.response)
            setAlerta({
                msg: error.response.data.msg,
                error: true
            })
        }
    }

    const handleModalEliminarColaborador = (colaborador) => {
        setModalEliminarColaborador(!modalEliminarColaborador)
        setColaborador(colaborador)

        console.log(colaborador)
    }

    const eliminarColaborador = async () => {
        console.log(colaborador) //lo tenemos en el state

        try {
            const token = localStorage.getItem('token')
            if(!token) return

            const config = {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                }
            }

            const {data} = await clienteAxios.post(`/proyectos/eliminar-colaborador/${proyecto._id}`, {id: colaborador._id}, config)
            console.log(data);

            const proyectoActualizado = {...proyecto}
            proyectoActualizado.colaboradores = proyectoActualizado.colaboradores.filter(colaboradorState =>
                    colaboradorState._id !== colaborador._id //al colaborador del state de la memoria
                )

            console.log('proyecto_actualizado', proyectoActualizado)
            setProyecto(proyectoActualizado)
            
            setAlerta({
                msg: data.msg,
                error: false,
            })
            setColaborador({})
            setModalEliminarColaborador(false)

            setTimeout(() => {
                setAlerta({})
            }, 3000);
            
        } catch (error) {
            console.log(error.response)   
        }
    }

    const completarTarea = async id => {
        //console.log(id)
        try {
            const token = localStorage.getItem('token')
            if(!token) return

            const config = {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                }
            }

            const { data } = await clienteAxios.post(`/tareas/estado/${id}`, {}, config)
            //console.log(data)
            
                setTarea({})
                setAlerta({})

            // SOcket
            socket.emit('cambiar estado', data)

        } catch (error) {
            console.log(error.response)   
        }
    }

    const handleBuscador = () => {
        setBuscador(!buscador)
    }
    
    const submitTareasProyecto = (tarea) => {
        // agerga la tarea al sataet a toodos los usuarios conectados  a ese room
        const proyectoActualizado = {...proyecto}
        proyectoActualizado.tareas = [...proyectoActualizado.tareas, tarea]

        setProyecto(proyectoActualizado)
    }

    const eliminarTareaProyecto = tarea => {
        const proyectoActualizado = {...proyecto}
        proyectoActualizado.tareas = proyectoActualizado.tareas.filter(tareaState => 
            tareaState._id !== tarea._id)

        setProyecto(proyectoActualizado)
    }

    const actualizarTareaProyecto = tarea => {
        const proyectoActualizado = {...proyecto}
            proyectoActualizado.tareas = proyectoActualizado.tareas.map( tareaState => 
                tareaState._id === tarea._id ? tarea : tareaState 
                )
            setProyecto(proyectoActualizado)
    }

    const cambiarEstadoTarea = tarea => {
        const proyectoActualizado = {...proyecto}

        proyectoActualizado.tareas = proyectoActualizado.tareas.map(tareaState => 
            tareaState._id === tarea._id ? tarea : tareaState)

        setProyecto(proyectoActualizado)
    }

    const cerrarSesionProyectos = () => {
        setProyectos([])
        setProyecto({})
        setAlerta({})
    }


    return (
        <ProyectosContext.Provider
            value={{
                proyectos,
                mostrarAlerta,
                alerta,
                submitProyecto,
                obtenerProyecto,
                proyecto, 
                cargando,
                eliminarProyecto,
                modalFormularioTarea,
                handleModalTarea,
                submitTarea,
                handleModalEditarTarea,
                tarea,
                modalEliminarTarea,
                handleModalEliminarTarea,
                eliminarTarea,
                submitColaborador,
                colaborador,
                agregarColaborador,
                handleModalEliminarColaborador,
                modalEliminarColaborador,
                eliminarColaborador,
                completarTarea,
                buscador,
                handleBuscador,
                submitTareasProyecto,
                eliminarTareaProyecto,
                actualizarTareaProyecto,
                cambiarEstadoTarea,
                cerrarSesionProyectos
            }}
        >

            {children}
        </ProyectosContext.Provider>
    )
}

export {
    ProyectosProvider
}

export default ProyectosContext