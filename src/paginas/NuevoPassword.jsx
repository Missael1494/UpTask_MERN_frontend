import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import axios from 'axios'
import clienteAxios from '../config/clienteAxios'
import Alerta from '../components/Alerta'

const NuevoPassword = () => {
  const [tokenValido, setTokenValido] = useState(false)
  const [alerta, setAlerta] = useState({})
  const [password, setPassword] = useState('')
  const [passwordModificado, setPasswordModificado] = useState(false)

  const params = useParams();
  const { token } = params;

  useEffect(() => {
    const comprobarToken = async () => {
      try {
        //TODO: mover hacia un cliente axios
        await clienteAxios(`/usuarios/olvide-password/${token}`)
        setTokenValido(true);
        //console.log(data)
      } catch (error) {
        console.log(error);
        setAlerta({
          msg: error.response.data.msg,
          error: true
        })
      }
    }
    
    comprobarToken();
    
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault();

    if(password.length <6 ) {
      setAlerta({
        msg: 'El password debe ser minimo de 6 caracteres',
        error: true
      })
      return
    }

    try {
      const url = `/usuarios/olvide-password/${token}`

      const { data } = await clienteAxios.post(url, {password})
      setAlerta({
        msg: data.msg,
        error: false,
      })

      setPasswordModificado(true);

      console.log(data);
    } catch (error) {
      setAlerta({
        msg: error.response.data.msg,
        error: true,
      })
    }
  }

  const { msg } = alerta;
  
  return (
    <>
      <h1 className='text-sky-600 font-black text-6xl capitalize'>
      Reestablece tu password t no pierdas acceso a tus <span className='text-slate-700'>proyectos</span>
      </h1>
     
      { msg && <Alerta alerta={alerta} />}

      { tokenValido && (
        <form 
         action="" 
         className='bg-white shadow rounded-lg px-10 py-5'
         onSubmit={handleSubmit}
         >
         
          <div className='my-5'>
            <label htmlFor="password" className='uppercase text-gray-600 block text-xl font-bold'>Nuevo Password</label>
            <input 
              id='password'
              type="password"
              placeholder='Escribe tu Nuevo Password'   
              className='w-full mt-3 p-3 border rounded-xl bg-gray-50'
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>

          

          <input 
            type="submit"
            value="Guardar Nuevo Password"  
            className='bg-sky-700 w-full mb-5 py-3 text-white uppercase font-bold rounded hover:cursor-pointer hover:bg-sky-800 transition-colors'
          />
        </form>

      )}

      { passwordModificado && (
        <Link className='block text-center my-5 text-slate-500 uppercase text-sm' 
        to="/"
        >Inicia Sesión
        
        </Link>
      )}

      
    </>
  )
}

export default NuevoPassword