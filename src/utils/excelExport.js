import * as XLSX from 'xlsx'

export const exportarAExcel = (datos, nombreArchivo, nombreHoja = 'Hoja1') => {
  try {
    // Crear un nuevo libro de trabajo
    const wb = XLSX.utils.book_new()
    
    // Crear una hoja de trabajo a partir de los datos
    const ws = XLSX.utils.json_to_sheet(datos)
    
    // Ajustar ancho de columnas automáticamente
    const colWidths = []
    if (datos.length > 0) {
      Object.keys(datos[0]).forEach((key, index) => {
        const maxLength = Math.max(
          key.length,
          ...datos.map(row => String(row[key] || '').length)
        )
        colWidths[index] = { wch: Math.min(maxLength + 2, 50) }
      })
      ws['!cols'] = colWidths
    }
    
    // Agregar la hoja al libro
    XLSX.utils.book_append_sheet(wb, ws, nombreHoja)
    
    // Generar y descargar el archivo
    XLSX.writeFile(wb, `${nombreArchivo}.xlsx`)
    
    return true
  } catch (error) {
    console.error('Error al exportar a Excel:', error)
    return false
  }
}

export const exportarMultiplesHojas = (datosHojas, nombreArchivo) => {
  try {
    // Crear un nuevo libro de trabajo
    const wb = XLSX.utils.book_new()
    
    // Agregar cada conjunto de datos como una hoja separada
    datosHojas.forEach(({ datos, nombreHoja }) => {
      const ws = XLSX.utils.json_to_sheet(datos)
      
      // Ajustar ancho de columnas
      const colWidths = []
      if (datos.length > 0) {
        Object.keys(datos[0]).forEach((key, index) => {
          const maxLength = Math.max(
            key.length,
            ...datos.map(row => String(row[key] || '').length)
          )
          colWidths[index] = { wch: Math.min(maxLength + 2, 50) }
        })
        ws['!cols'] = colWidths
      }
      
      XLSX.utils.book_append_sheet(wb, ws, nombreHoja)
    })
    
    // Generar y descargar el archivo
    XLSX.writeFile(wb, `${nombreArchivo}.xlsx`)
    
    return true
  } catch (error) {
    console.error('Error al exportar múltiples hojas a Excel:', error)
    return false
  }
}

export const formatearMaterialesParaExcel = (materiales) => {
  return materiales.map(material => ({
    'Código': material.codigo,
    'Nombre del Material': material.nombre,
    'Precio Unitario': `S/. ${material.precio.toFixed(2)}`
  }))
}

export const formatearPresupuestoParaExcel = (articulos) => {
  const datosFormateados = articulos.map(articulo => ({
    'Código': articulo.codigo,
    'Descripción': articulo.nombre,
    'Precio Unitario': articulo.precioPresupuesto.toFixed(2),
    'Cantidad Marzo': articulo.cantidades.marzo,
    'Cantidad Agosto': articulo.cantidades.agosto,
    'Subtotal Marzo': articulo.totales.marzo.toFixed(2),
    'Subtotal Agosto': articulo.totales.agosto.toFixed(2),
    'Total Artículo': articulo.totales.total.toFixed(2)
  }))

  // Agregar fila de totales al final
  const totalMarzo = articulos.reduce((sum, art) => sum + art.totales.marzo, 0)
  const totalAgosto = articulos.reduce((sum, art) => sum + art.totales.agosto, 0)
  const totalGeneral = totalMarzo + totalAgosto

  datosFormateados.push({
    'Código': '',
    'Descripción': '🔸 TOTALES GENERALES',
    'Precio Unitario': '',
    'Cantidad Marzo': '',
    'Cantidad Agosto': '',
    'Subtotal Marzo': totalMarzo.toFixed(2),
    'Subtotal Agosto': totalAgosto.toFixed(2),
    'Total Artículo': totalGeneral.toFixed(2)
  })

  return datosFormateados
}

export const formatearResumenPartidasParaExcel = (articulos, valoresPartidas, partidasPresupuestarias) => {
  // Crear resumen basado en las partidas definidas
  const resumen = []
  let totalGeneral = 0
  
  // Array con nombres de meses en orden
  const meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'set', 'oct', 'nov', 'dic']
  
  partidasPresupuestarias.forEach(partida => {
    // Obtener artículos de esta partida que están en el presupuesto
    const articulosDePartida = articulos.filter(art => 
      partida.articulos.includes(art.codigo)
    )
    
    // Calcular totales de artículos para marzo y agosto
    const totalMarzoArticulos = articulosDePartida.reduce((sum, art) => sum + art.totales.marzo, 0)
    const totalAgostoArticulos = articulosDePartida.reduce((sum, art) => sum + art.totales.agosto, 0)
    
    // Obtener valores base de esta partida (editados o por defecto)
    const valoresBasePartida = valoresPartidas[partida.codigo] || partida.valoresBase
    
    // Crear fila para Excel con todos los meses
    const filaPartida = {
      'Nombre de Partidas': partida.nombre,
      'Código ERP': partida.codigo
    }
    
    let totalPartida = 0
    
    // Agregar cada mes
    meses.forEach(mes => {
      let valorMes = valoresBasePartida[mes] || 0
      
      // Sumar artículos para marzo y agosto
      if (mes === 'mar') {
        valorMes += totalMarzoArticulos
      } else if (mes === 'ago') {
        valorMes += totalAgostoArticulos
      }
      
      filaPartida[mes.charAt(0).toUpperCase() + mes.slice(1)] = valorMes.toFixed(2)
      totalPartida += valorMes
    })
    
    filaPartida['Total'] = totalPartida.toFixed(2)
    totalGeneral += totalPartida
    
    resumen.push(filaPartida)
  })
  
  // Agregar fila de gran total
  const filaTotales = {
    'Nombre de Partidas': 'GRAN TOTAL ANUAL:',
    'Código ERP': ''
  }
  
  // Dejar los meses en blanco para la fila de gran total
  meses.forEach(mes => {
    filaTotales[mes.charAt(0).toUpperCase() + mes.slice(1)] = ''
  })
  
  // Solo mostrar el total general en la columna Total
  filaTotales['Total'] = totalGeneral.toFixed(2)
  
  resumen.push(filaTotales)
  
  return resumen
}