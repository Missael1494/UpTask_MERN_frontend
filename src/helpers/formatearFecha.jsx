export const formatearFecha = fecha => {


    //const fecha1 = "2022-02-25"
    //const fecha2 = "02-25-2022"
    const nuevaFecha = new Date(fecha.split('T')[0].split('-'))


    const opciones = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    }

    return nuevaFecha.toLocaleDateString('es-ES', opciones)

}