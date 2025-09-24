import * as XLSX from 'xlsx'

// Función para crear encabezado del presupuesto
const crearEncabezadoPresupuesto = () => {
  return [
    ["FORMATO PARA LA FORMULACIÓN DEL PRESUPUESTO OPERATIVO 2025"],
    [""],
    ["UNIDAD RESPONSABLE :", "030000", "", "FACULTAD DE INGENIERÍA"],
    ["UNID. CENTRO DE COSTOS :", "032500", "", "CENTRO DE DOCUMENTACIÓN"],
    ["ACTIVIDAD:", "0009", "", "ACTIVIDAD OPERATIVA"],
    [""]
  ]
}

// Función para aplicar estilos y bordes
const aplicarEstilosYBordes = (ws, filaInicio, filaFin, colInicio, colFin) => {
  const border = {
    top: { style: 'thin' },
    bottom: { style: 'thin' },
    left: { style: 'thin' },
    right: { style: 'thin' }
  }

  // Aplicar bordes a todas las celdas de la tabla
  for (let row = filaInicio; row <= filaFin; row++) {
    for (let col = colInicio; col <= colFin; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: row, c: col })
      
      if (!ws[cellAddress]) {
        ws[cellAddress] = { v: '', t: 's' }
      }
      
      // Aplicar solo bordes y alineación
      ws[cellAddress].s = {
        border: border,
        alignment: { 
          horizontal: col === 0 ? 'left' : 'center',
          vertical: 'center'
        }
      }
    }
  }
}

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
    datosHojas.forEach(({ datos, nombreHoja, conEncabezado = true }) => {
      let ws
      let filaInicioDatos = 0
      
      if (conEncabezado && nombreHoja.includes('Resumen')) {
        // Crear hoja con encabezado para resumen de partidas
        const encabezado = crearEncabezadoPresupuesto()
        
        // Crear encabezados de la tabla
        const encabezadosTabla = datos.length > 0 ? Object.keys(datos[0]) : []
        
        // Combinar todo: encabezado + headers de tabla + datos
        const todosLosDatos = [
          ...encabezado,
          encabezadosTabla,  // Fila con nombres de columnas
          ...datos.map(Object.values)
        ]
        
        // Crear worksheet desde array
        ws = XLSX.utils.aoa_to_sheet(todosLosDatos)
        
        // Aplicar estilos al título principal
        if (!ws['A1']) {
          ws['A1'] = { v: 'FORMATO PARA LA FORMULACIÓN DEL PRESUPUESTO OPERATIVO 2025', t: 's' }
        }
        ws['A1'].s = {
          font: { bold: true, size: 14 },
          alignment: { horizontal: 'center' },
          border: {
            top: { style: 'thin' },
            bottom: { style: 'thin' },
            left: { style: 'thin' },
            right: { style: 'thin' }
          }
        }
        
        // Merge del título
        ws['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: encabezadosTabla.length - 1 } }]
        
        filaInicioDatos = encabezado.length
        
        // Aplicar estilos a los encabezados de la tabla
        if (encabezadosTabla.length > 0) {
          for (let col = 0; col < encabezadosTabla.length; col++) {
            const cellAddress = XLSX.utils.encode_cell({ r: filaInicioDatos, c: col })
            
            // Asegurar que la celda existe
            if (!ws[cellAddress]) {
              ws[cellAddress] = { v: encabezadosTabla[col], t: 's' }
            }
            
            // Aplicar solo bordes y bold
            ws[cellAddress].s = {
              font: { bold: true },
              alignment: { horizontal: 'center', vertical: 'center' },
              border: {
                top: { style: 'thin' },
                bottom: { style: 'thin' },
                left: { style: 'thin' },
                right: { style: 'thin' }
              }
            }
          }
        }
        
        // Aplicar bordes a la tabla de datos
        if (datos.length > 0) {
          const numCols = Object.keys(datos[0]).length
          aplicarEstilosYBordes(ws, filaInicioDatos + 1, filaInicioDatos + datos.length, 0, numCols - 1)
        }
        
      } else if (conEncabezado && nombreHoja.includes('Artículos')) {
        // Crear hoja con encabezado para detalle de artículos
        const encabezadoDetalle = [
          ["FORMATO PARA LA FORMULACIÓN DEL PRESUPUESTO OPERATIVO 2025"],
          [""],
          ["UNIDAD RESPONSABLE :", "", "030000", "", "FACULTAD DE INGENIERÍA"],
          ["UNID. CENTRO DE COSTOS :", "", "032500", "", "CENTRO DE DOCUMENTACIÓN"],
          ["ACTIVIDAD:", "", "0009", "", "ACTIVIDAD OPERATIVA"],
          [""]
        ]
        
        // Crear encabezados de la tabla
        const encabezadosTabla = datos.length > 0 ? Object.keys(datos[0]) : []
        
        // Combinar todo: encabezado + headers de tabla + datos
        const todosLosDatos = [
          ...encabezadoDetalle,
          encabezadosTabla,  // Fila con nombres de columnas
          ...datos.map(Object.values)
        ]
        
        ws = XLSX.utils.aoa_to_sheet(todosLosDatos)
        
        // Estilos del título
        if (!ws['A1']) {
          ws['A1'] = { v: 'FORMATO PARA LA FORMULACIÓN DEL PRESUPUESTO OPERATIVO 2025', t: 's' }
        }
        ws['A1'].s = {
          font: { bold: true, size: 14 },
          alignment: { horizontal: 'center' },
          border: {
            top: { style: 'thin' },
            bottom: { style: 'thin' },
            left: { style: 'thin' },
            right: { style: 'thin' }
          }
        }
        
        // Merges
        ws['!merges'] = [
          { s: { r: 0, c: 0 }, e: { r: 0, c: encabezadosTabla.length - 1 } }, // Título principal
          { s: { r: 2, c: 0 }, e: { r: 2, c: 1 } }, // UNIDAD RESPONSABLE (A3:B3)
          { s: { r: 3, c: 0 }, e: { r: 3, c: 1 } }, // UNID. CENTRO DE COSTOS (A4:B4)
          { s: { r: 4, c: 0 }, e: { r: 4, c: 1 } }  // ACTIVIDAD (A5:B5)
        ]
        
        filaInicioDatos = encabezadoDetalle.length
        
        // Aplicar estilos a los encabezados de la tabla
        if (encabezadosTabla.length > 0) {
          for (let col = 0; col < encabezadosTabla.length; col++) {
            const cellAddress = XLSX.utils.encode_cell({ r: filaInicioDatos, c: col })
            
            // Asegurar que la celda existe
            if (!ws[cellAddress]) {
              ws[cellAddress] = { v: encabezadosTabla[col], t: 's' }
            }
            
            // Aplicar solo bordes y bold
            ws[cellAddress].s = {
              font: { bold: true },
              alignment: { horizontal: 'center', vertical: 'center' },
              border: {
                top: { style: 'thin' },
                bottom: { style: 'thin' },
                left: { style: 'thin' },
                right: { style: 'thin' }
              }
            }
          }
        }
        
        // Aplicar bordes a la tabla de datos
        if (datos.length > 0) {
          const numCols = Object.keys(datos[0]).length
          aplicarEstilosYBordes(ws, filaInicioDatos + 1, filaInicioDatos + datos.length, 0, numCols - 1)
        }
        
      } else {
        // Hoja simple sin encabezado
        ws = XLSX.utils.json_to_sheet(datos)
      }
      
      // Ajustar ancho de columnas
      const colWidths = []
      if (datos.length > 0) {
        Object.keys(datos[0]).forEach((key, index) => {
          const maxLength = Math.max(
            key.length,
            ...datos.map(row => String(row[key] || '').length)
          )
          colWidths[index] = { wch: Math.min(maxLength + 2, 30) }
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
    'Nombre del Artículo': articulo.nombre,
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
    'Nombre del Artículo': '🔸 TOTALES GENERALES',
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