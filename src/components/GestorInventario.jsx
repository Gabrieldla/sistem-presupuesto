import { useState, useEffect } from 'react'
import * as XLSX from 'xlsx'
import { supabase } from '../lib/supabase'

const GestorInventario = ({ articulosPresupuesto, onActualizarInventario }) => {
  const [inventario, setInventario] = useState([])
  const [busqueda, setBusqueda] = useState('')
  const [periodoActual, setPeriodoActual] = useState('marzo') // marzo, agosto
  const [materialActualIndex, setMaterialActualIndex] = useState(0)
  const [modoVista, setModoVista] = useState('revision') // revision, tabla
  const [mostrarCampoManual, setMostrarCampoManual] = useState(false)
  const [cantidadManual, setCantidadManual] = useState(0)

  // Cargar inventario desde la base de datos y combinar con artículos del presupuesto
  useEffect(() => {
    const cargarInventario = async () => {
      try {
        // Obtener datos existentes del inventario
        const { data: inventarioExistente, error } = await supabase
          .from('inventario')
          .select('*')

        if (error) {
          console.error('Error cargando inventario:', error)
          return
        }

        // Crear mapa de inventario existente por artículo_id
        const inventarioMap = {}
        if (inventarioExistente) {
          inventarioExistente.forEach(item => {
            inventarioMap[item.articulo_id] = item
          })
        }

        // Combinar artículos del presupuesto con datos del inventario
        const inventarioInicial = articulosPresupuesto.map(articulo => {
          const inventarioExiste = inventarioMap[articulo.id]
          
          return {
            id: articulo.id,
            codigo: articulo.codigo,
            nombre: articulo.nombre,
            precioPresupuesto: articulo.precioPresupuesto,
            
            // Cantidades solicitadas (del presupuesto)
            cantidadSolicitadaMarzo: articulo.cantidades.marzo,
            cantidadSolicitadaAgosto: articulo.cantidades.agosto,
            
            // Cantidades aprobadas por período (desde BD o 0)
            cantidadAprobadaMarzo: inventarioExiste?.cantidad_marzo || 0,
            cantidadAprobadaAgosto: inventarioExiste?.cantidad_agosto || 0,
            
            // Stock actual (común para ambos períodos)
            stockActual: inventarioExiste?.stock_actual || 0
          }
        })
        
        setInventario(inventarioInicial)
      } catch (error) {
        console.error('Error inicializando inventario:', error)
      }
    }

    if (articulosPresupuesto.length > 0) {
      cargarInventario()
    }
  }, [articulosPresupuesto])

  // Función para actualizar cantidad de un artículo y guardarlo en BD
  const actualizarCantidadArticulo = async (id, campo, valor) => {
    try {
      // Actualizar en el estado local primero
      setInventario(prev => prev.map(item => {
        if (item.id === id) {
          return { ...item, [campo]: valor }
        }
        return item
      }))

      // Determinar los valores para la BD
      const articuloActual = inventario.find(item => item.id === id)
      const cantidadMarzo = campo === 'cantidadAprobadaMarzo' ? valor : articuloActual?.cantidadAprobadaMarzo || 0
      const cantidadAgosto = campo === 'cantidadAprobadaAgosto' ? valor : articuloActual?.cantidadAprobadaAgosto || 0

      // Verificar si ya existe un registro en la BD
      const { data: existente, error: errorConsulta } = await supabase
        .from('inventario')
        .select('id')
        .eq('articulo_id', id)
        .single()

      if (errorConsulta && errorConsulta.code !== 'PGRST116') {
        throw errorConsulta
      }

      if (existente) {
        // Actualizar registro existente
        const { error: errorUpdate } = await supabase
          .from('inventario')
          .update({
            cantidad_marzo: cantidadMarzo,
            cantidad_agosto: cantidadAgosto,
            updated_at: new Date().toISOString()
          })
          .eq('articulo_id', id)

        if (errorUpdate) throw errorUpdate
      } else {
        // Crear nuevo registro
        const { error: errorInsert } = await supabase
          .from('inventario')
          .insert({
            articulo_id: id,
            cantidad_marzo: cantidadMarzo,
            cantidad_agosto: cantidadAgosto,
            stock_actual: 0
          })

        if (errorInsert) throw errorInsert
      }

    } catch (error) {
      console.error('Error actualizando inventario:', error)
      alert('Error al guardar en la base de datos. Por favor intenta de nuevo.')
    }
  }

  // Filtrar artículos según búsqueda del período actual
  const inventarioFiltrado = inventario.filter(item => {
    const coincideBusqueda = item.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
                            item.codigo.toLowerCase().includes(busqueda.toLowerCase())
    
    // Solo mostrar artículos que tienen cantidad solicitada para el período actual
    const tieneCantidadPeriodo = periodoActual === 'marzo' 
      ? item.cantidadSolicitadaMarzo > 0 
      : item.cantidadSolicitadaAgosto > 0
    
    return coincideBusqueda && tieneCantidadPeriodo
  }).sort((a, b) => a.nombre.localeCompare(b.nombre))

  // Resetear índice cuando cambian los filtros
  useEffect(() => {
    setMaterialActualIndex(0)
  }, [busqueda, periodoActual])

  // Función para exportar inventario
  const exportarInventario = () => {
    // Filtrar solo los materiales con cantidad asignada
    const inventarioParaExportar = inventario.filter(item => {
      const tieneCantidadPeriodo = periodoActual === 'marzo' ? item.cantidadSolicitadaMarzo > 0 : item.cantidadSolicitadaAgosto > 0
      const cantidadAprobada = periodoActual === 'marzo' ? item.cantidadAprobadaMarzo : item.cantidadAprobadaAgosto
      return tieneCantidadPeriodo && cantidadAprobada > 0
    }).map(item => ({
      Codigo: item.codigo,
      Descripcion: item.nombre,
      'Cantidad en Inventario': periodoActual === 'marzo' ? item.cantidadAprobadaMarzo : item.cantidadAprobadaAgosto,
      'Precio Unitario': item.precioPresupuesto.toLocaleString(),
      'Valor Total': ((periodoActual === 'marzo' ? item.cantidadAprobadaMarzo : item.cantidadAprobadaAgosto) * item.precioPresupuesto).toLocaleString()
    }))

    if (inventarioParaExportar.length === 0) {
      alert('No hay materiales en el inventario para exportar')
      return
    }

    // Crear libro de trabajo
    const worksheet = XLSX.utils.json_to_sheet(inventarioParaExportar)
    const workbook = XLSX.utils.book_new()
    
    // Título del período
    const periodoTexto = periodoActual.charAt(0).toUpperCase() + periodoActual.slice(1)
    XLSX.utils.book_append_sheet(workbook, worksheet, `Inventario ${periodoTexto}`)
    
    // Descargar archivo
    const fecha = new Date().toLocaleDateString().replace(/\//g, '-')
    XLSX.writeFile(workbook, `Inventario_${periodoTexto}_2024_${fecha}.xlsx`)
  }

  // Función para ir a la vista de tabla
  const verTabla = () => {
    setModoVista('tabla')
  }

  // Estadísticas rápidas para el período actual
  const articulosPeriodo = inventario.filter(item => 
    periodoActual === 'marzo' ? item.cantidadSolicitadaMarzo > 0 : item.cantidadSolicitadaAgosto > 0
  )
  
  const cantidadConAprobadas = articulosPeriodo.filter(i => {
    const cantidadAprobada = periodoActual === 'marzo' ? i.cantidadAprobadaMarzo : i.cantidadAprobadaAgosto
    return cantidadAprobada > 0
  }).length
  
  const stats = {
    total: articulosPeriodo.length,
    conCantidad: cantidadConAprobadas,
    sinCantidad: articulosPeriodo.length - cantidadConAprobadas
  }



  if (articulosPresupuesto.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-12 text-center">
        <div className="w-20 h-20 bg-gray-400 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl text-white">📦</span>
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">Sin Artículos en Presupuesto</h3>
        <p className="text-gray-600">Primero agregue artículos al presupuesto para poder gestionar el inventario.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header con estadísticas */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-4">
            <h2 className="text-2xl font-bold text-gray-800">
              Gestión de Inventario
            </h2>
          </div>
          <div className="flex items-center space-x-3">
            <label className="text-lg font-semibold text-gray-700">Período:</label>
            <select
              value={periodoActual}
              onChange={(e) => setPeriodoActual(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-lg font-semibold bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="marzo">Marzo 2024</option>
              <option value="agosto">Agosto 2024</option>
            </select>
          </div>
        </div>


      </div>

      {/* Controles de filtro */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Buscar material</label>
            <input
              type="text"
              placeholder="Buscar por código o nombre..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Vista de material uno por uno */}
      {inventarioFiltrado.length > 0 && modoVista === 'revision' && (
        <div className="bg-white rounded-lg shadow-md">
          {(() => {
            const materialActual = inventarioFiltrado[materialActualIndex] || inventarioFiltrado[0]
            const cantidadSolicitada = periodoActual === 'marzo' 
              ? materialActual.cantidadSolicitadaMarzo 
              : materialActual.cantidadSolicitadaAgosto
            const cantidadAprobada = periodoActual === 'marzo' 
              ? materialActual.cantidadAprobadaMarzo 
              : materialActual.cantidadAprobadaAgosto

            return (
              <div className="p-8">
                {/* Progreso */}
                <div className="mb-6">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Material {materialActualIndex + 1} de {inventarioFiltrado.length}</span>
                    <span>{stats.conCantidad} materiales con cantidad asignada</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${((materialActualIndex + 1) / inventarioFiltrado.length) * 100}%` }}
                    ></div>
                  </div>
                </div>

                {/* Información del material */}
                <div className="text-center mb-8">
                  <h3 className="text-3xl font-bold text-gray-900 mb-2">{materialActual.nombre}</h3>
                  <p className="text-lg text-gray-600">Código: <span className="font-medium">{materialActual.codigo}</span></p>
                </div>

                {/* Cantidad solicitada vs aprobada */}
                <div className="grid grid-cols-2 gap-6 mb-8">
                  <div className="bg-blue-50 p-6 rounded-lg text-center">
                    <div className="text-3xl font-bold text-blue-600">{cantidadSolicitada}</div>
                    <div className="text-sm text-blue-800 font-medium">Solicitado</div>
                  </div>
                  
                  <div className="bg-green-50 p-6 rounded-lg text-center">
                    <div className="text-3xl font-bold text-green-600">{cantidadAprobada}</div>
                    <div className="text-sm text-green-800 font-medium">Cantidad Asignada</div>
                  </div>
                </div>

                {/* Campo manual para cantidad parcial */}
                {mostrarCampoManual && (
                  <div className="mb-6 p-4 bg-yellow-50 rounded-lg border-2 border-yellow-200">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ingrese cantidad a asignar (máximo {cantidadSolicitada}):
                    </label>
                    <div className="flex gap-3">
                      <input
                        type="number"
                        min="1"
                        max={cantidadSolicitada}
                        value={cantidadManual}
                        onChange={(e) => setCantidadManual(parseInt(e.target.value) || 0)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-center text-lg"
                        autoFocus
                      />
                      <button
                        onClick={() => {
                          const campo = periodoActual === 'marzo' ? 'cantidadAprobadaMarzo' : 'cantidadAprobadaAgosto'
                          actualizarCantidadArticulo(materialActual.id, campo, cantidadManual)
                          setMostrarCampoManual(false)
                          // Auto-navegar al siguiente material
                          setTimeout(() => {
                            if (materialActualIndex < inventarioFiltrado.length - 1) {
                              setMaterialActualIndex(materialActualIndex + 1)
                            }
                          }, 500)
                        }}
                        disabled={cantidadManual <= 0 || cantidadManual > cantidadSolicitada}
                        className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-300 text-white rounded-lg transition-colors"
                      >
                        Confirmar
                      </button>
                      <button
                        onClick={() => {
                          setMostrarCampoManual(false)
                          setCantidadManual(0)
                        }}
                        className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}

                {/* Botones de acción principales */}
                {!mostrarCampoManual && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                    <button
                      onClick={() => {
                        const campo = periodoActual === 'marzo' ? 'cantidadAprobadaMarzo' : 'cantidadAprobadaAgosto'
                        actualizarCantidadArticulo(materialActual.id, campo, cantidadSolicitada)
                        // Auto-navegar al siguiente material
                        setTimeout(() => {
                          if (materialActualIndex < inventarioFiltrado.length - 1) {
                            setMaterialActualIndex(materialActualIndex + 1)
                          }
                        }, 500)
                      }}
                      className="bg-green-600 hover:bg-green-700 text-white font-bold py-6 px-6 rounded-lg transition-colors text-lg"
                    >
                      Asignar Todo<br />
                      <span className="text-sm">({cantidadSolicitada} unidades)</span>
                    </button>
                    
                    <button
                      onClick={() => {
                        setCantidadManual(Math.ceil(cantidadSolicitada / 2))
                        setMostrarCampoManual(true)
                      }}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-6 px-6 rounded-lg transition-colors text-lg"
                    >
                      Asignar Cantidad<br />
                      <span className="text-sm">(Cantidad personalizada)</span>
                    </button>
                  </div>
                )}

                {/* Navegación */}
                <div className="flex justify-between items-center pt-4 border-t">
                  <button
                    onClick={() => {
                      if (materialActualIndex > 0) {
                        setMaterialActualIndex(materialActualIndex - 1)
                        setMostrarCampoManual(false)
                      }
                    }}
                    disabled={materialActualIndex === 0}
                    className="px-6 py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-300 text-white rounded-lg transition-colors"
                  >
                    Anterior
                  </button>
                  
                  <div className="flex flex-col items-center gap-2">
                    <div className="text-sm text-gray-600">
                      {materialActualIndex < inventarioFiltrado.length - 1 
                        ? `Quedan ${inventarioFiltrado.length - materialActualIndex - 1} materiales por revisar`
                        : 'Último material'
                      }
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={verTabla}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-sm"
                      >
                        Ver Tabla
                      </button>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => {
                      if (materialActualIndex < inventarioFiltrado.length - 1) {
                        setMaterialActualIndex(materialActualIndex + 1)
                        setMostrarCampoManual(false)
                      }
                    }}
                    disabled={materialActualIndex >= inventarioFiltrado.length - 1}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-lg transition-colors"
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            )
          })()}
        </div>
      )}

      {/* Vista de tabla de inventarios */}
      {modoVista === 'tabla' && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-900">
                Inventario - {periodoActual.charAt(0).toUpperCase() + periodoActual.slice(1)} 2024
              </h3>
              <button
                onClick={() => setModoVista('revision')}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Volver a Revisión
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Material
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cantidad en Inventario
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {inventario.filter(item => {
                  const tieneCantidadPeriodo = periodoActual === 'marzo' ? item.cantidadSolicitadaMarzo > 0 : item.cantidadSolicitadaAgosto > 0
                  const cantidadAprobada = periodoActual === 'marzo' ? item.cantidadAprobadaMarzo : item.cantidadAprobadaAgosto
                  return tieneCantidadPeriodo && cantidadAprobada > 0
                }).sort((a, b) => a.nombre.localeCompare(b.nombre)).map((item) => {
                  const cantidadSolicitada = periodoActual === 'marzo' 
                    ? item.cantidadSolicitadaMarzo 
                    : item.cantidadSolicitadaAgosto
                  const cantidadAprobada = periodoActual === 'marzo' 
                    ? item.cantidadAprobadaMarzo 
                    : item.cantidadAprobadaAgosto
                  
                  return (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{item.nombre}</div>
                          <div className="text-sm text-gray-500">Código: {item.codigo}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-2xl font-bold text-green-600">{cantidadAprobada}</span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          
          {/* Mensaje si no hay materiales con cantidad asignada */}
          {inventario.filter(item => {
            const tieneCantidadPeriodo = periodoActual === 'marzo' ? item.cantidadSolicitadaMarzo > 0 : item.cantidadSolicitadaAgosto > 0
            const cantidadAprobada = periodoActual === 'marzo' ? item.cantidadAprobadaMarzo : item.cantidadAprobadaAgosto
            return tieneCantidadPeriodo && cantidadAprobada > 0
          }).length === 0 && (
            <div className="p-8 text-center bg-gray-50">
              <div className="text-gray-500 mb-2">
                <svg className="mx-auto h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-8l-4 4m0 0l-4-4m4 4V3" />
                </svg>
              </div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">Inventario Vacío</h4>
              <p className="text-gray-600">
                No hay materiales con cantidad asignada para el período de {periodoActual} 2024.
                <br />
                Vuelve a la revisión para asignar cantidades a algunos materiales.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Botón de Exportar Inventario - Al final */}
      {modoVista === 'tabla' && inventario.filter(item => {
        const tieneCantidadPeriodo = periodoActual === 'marzo' ? item.cantidadSolicitadaMarzo > 0 : item.cantidadSolicitadaAgosto > 0
        const cantidadAprobada = periodoActual === 'marzo' ? item.cantidadAprobadaMarzo : item.cantidadAprobadaAgosto
        return tieneCantidadPeriodo && cantidadAprobada > 0
      }).length > 0 && (
        <div className="flex justify-center">
          <button
            onClick={exportarInventario}
            className="px-6 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors text-lg"
          >
            📊 Exportar Inventario a Excel
          </button>
        </div>
      )}

      {inventarioFiltrado.length === 0 && modoVista === 'revision' && (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <p className="text-gray-600">No se encontraron artículos con los filtros aplicados.</p>
        </div>
      )}
    </div>
  )
}

export default GestorInventario