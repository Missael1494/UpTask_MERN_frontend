import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Alerta from '../components/Alerta'
import clienteAxios from '../config/clienteAxios'

const ConfirmarCuenta = () => {

  const [alerta, setAlerta] = useState({})
  const [cuentaconfirmada, setCuentaconfirmada] = useState(false)

  const params = useParams();
  const {id} = params;

  useEffect(() => {
    const confirmarCuenta = async () => {
      try {
        const url = `/usuarios/confirmar/${id}`
        const { data } = await clienteAxios(url);

        setAlerta({
          msg: data.msg,
          error: false
        })
        setCuentaconfirmada(true);

        console.log(data)
      } catch (error) {
        console.log(error);
        setAlerta({
          msg: error.response.data.msg,
          error: true,
        })
      }
    }
    confirmarCuenta();
    
  }, [])

  const { msg } = alerta;
  
  console.log(params);

  return (
    <>
      <h1 className='text-sky-600 font-black text-6xl capitalize'>
      Confirma Tu Cuenta y Comienza A Crear Tus <span className='text-slate-700'>proyectos</span>
      </h1>

      <div className='mt-20 md:mt-5 shadow-lg px-5 py-10 rounded-xl bg-white'>
        {msg && <Alerta alerta={alerta} />}
      </div>

      { cuentaconfirmada && (
        <Link className='block text-center my-5 text-slate-500 uppercase text-sm' 
        to="/"
        >Inicia Sesión
        
        </Link>
      )}

      
    </>
  )
}

export default ConfirmarCuenta