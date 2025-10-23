import { useState, useEffect } from 'react'

const GestorInventario = ({ articulosPresupuesto, onActualizarInventario }) => {
  const [inventario, setInventario] = useState([])
  const [filtroEstado, setFiltroEstado] = useState('todos') // todos, aprobados, rechazados, pendientes
  const [busqueda, setBusqueda] = useState('')
  const [periodoActual, setPeriodoActual] = useState('marzo') // marzo, agosto
  const [materialActualIndex, setMaterialActualIndex] = useState(0)
  const [modoVista, setModoVista] = useState('revision') // revision, tabla
  const [mostrarCampoManual, setMostrarCampoManual] = useState(false)
  const [cantidadManual, setCantidadManual] = useState(0)

  // Inicializar inventario cuando cambian los artículos del presupuesto
  useEffect(() => {
    const inventarioInicial = articulosPresupuesto.map(articulo => ({
      id: articulo.id,
      codigo: articulo.codigo,
      nombre: articulo.nombre,
      precioPresupuesto: articulo.precioPresupuesto,
      
      // Cantidades solicitadas (del presupuesto)
      cantidadSolicitadaMarzo: articulo.cantidades.marzo,
      cantidadSolicitadaAgosto: articulo.cantidades.agosto,
      
      // Cantidades aprobadas por período (editables)
      cantidadAprobadaMarzo: 0,
      cantidadAprobadaAgosto: 0,
      
      // Estados por período
      estadoMarzo: 'pendiente', // pendiente, aprobado, rechazado, parcial
      estadoAgosto: 'pendiente',
      
      // Inventario actual
      stockActual: 0,
      stockMinimo: 0,
      
      // Observaciones por período
      observacionesMarzo: '',
      observacionesAgosto: '',
      fechaRevisionMarzo: null,
      fechaRevisionAgosto: null,
      revisadoPor: ''
    }))
    
    setInventario(inventarioInicial)
  }, [articulosPresupuesto])

  // Función para actualizar estado de un artículo
  const actualizarEstadoArticulo = (id, campo, valor) => {
    setInventario(prev => prev.map(item => {
      if (item.id === id) {
        const updated = { ...item, [campo]: valor }
        
        // Auto-calcular estado basado en cantidades aprobadas del período actual
        if (campo === 'cantidadAprobadaMarzo') {
          const solicitado = updated.cantidadSolicitadaMarzo
          const aprobado = updated.cantidadAprobadaMarzo
          
          if (aprobado === 0) {
            updated.estadoMarzo = 'rechazado'
          } else if (aprobado >= solicitado) {
            updated.estadoMarzo = 'aprobado'
          } else {
            updated.estadoMarzo = 'parcial'
          }
          
          updated.fechaRevisionMarzo = new Date().toLocaleDateString()
        } else if (campo === 'cantidadAprobadaAgosto') {
          const solicitado = updated.cantidadSolicitadaAgosto
          const aprobado = updated.cantidadAprobadaAgosto
          
          if (aprobado === 0) {
            updated.estadoAgosto = 'rechazado'
          } else if (aprobado >= solicitado) {
            updated.estadoAgosto = 'aprobado'
          } else {
            updated.estadoAgosto = 'parcial'
          }
          
          updated.fechaRevisionAgosto = new Date().toLocaleDateString()
        }
        
        return updated
      }
      return item
    }))
  }

  // Filtrar artículos según búsqueda y estado del período actual
  const inventarioFiltrado = inventario.filter(item => {
    const coincideBusqueda = item.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
                            item.codigo.toLowerCase().includes(busqueda.toLowerCase())
    
    const estadoPeriodo = periodoActual === 'marzo' ? item.estadoMarzo : item.estadoAgosto
    const coincideEstado = filtroEstado === 'todos' || estadoPeriodo === filtroEstado
    
    // Solo mostrar artículos que tienen cantidad solicitada para el período actual
    const tieneCantidadPeriodo = periodoActual === 'marzo' 
      ? item.cantidadSolicitadaMarzo > 0 
      : item.cantidadSolicitadaAgosto > 0
    
    return coincideBusqueda && coincideEstado && tieneCantidadPeriodo
  })

  // Resetear índice cuando cambian los filtros
  useEffect(() => {
    setMaterialActualIndex(0)
  }, [busqueda, filtroEstado, periodoActual])

  // Función para exportar inventario
  const exportarInventario = () => {
    // TODO: Implementar exportación del inventario
    console.log('Exportar inventario:', inventario)
  }



  // Estadísticas rápidas para el período actual
  const articulosPeriodo = inventario.filter(item => 
    periodoActual === 'marzo' ? item.cantidadSolicitadaMarzo > 0 : item.cantidadSolicitadaAgosto > 0
  )
  
  const stats = {
    total: articulosPeriodo.length,
    aprobados: articulosPeriodo.filter(i => {
      const estadoPeriodo = periodoActual === 'marzo' ? i.estadoMarzo : i.estadoAgosto
      return estadoPeriodo === 'aprobado'
    }).length,
    rechazados: articulosPeriodo.filter(i => {
      const estadoPeriodo = periodoActual === 'marzo' ? i.estadoMarzo : i.estadoAgosto
      return estadoPeriodo === 'rechazado'
    }).length,
    parciales: articulosPeriodo.filter(i => {
      const estadoPeriodo = periodoActual === 'marzo' ? i.estadoMarzo : i.estadoAgosto
      return estadoPeriodo === 'parcial'
    }).length,
    pendientes: articulosPeriodo.filter(i => {
      const estadoPeriodo = periodoActual === 'marzo' ? i.estadoMarzo : i.estadoAgosto
      return estadoPeriodo === 'pendiente'
    }).length
  }

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'aprobado': return 'bg-green-100 text-green-800'
      case 'rechazado': return 'bg-red-100 text-red-800'
      case 'parcial': return 'bg-yellow-100 text-yellow-800'
      case 'pendiente': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getEstadoIcon = (estado) => {
    switch (estado) {
      case 'aprobado': return '✅'
      case 'rechazado': return '❌'
      case 'parcial': return '⚠️'
      case 'pendiente': return '⏳'
      default: return '❓'
    }
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
              📦 Gestión de Inventario y Aprobaciones
            </h2>
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Período:</label>
              <select
                value={periodoActual}
                onChange={(e) => setPeriodoActual(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium"
              >
                <option value="marzo">Marzo 2024</option>
                <option value="agosto">Agosto 2024</option>
              </select>
            </div>
          </div>
          <button
            onClick={exportarInventario}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            📊 Exportar Inventario
          </button>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-gray-50 p-3 rounded-lg text-center">
            <div className="text-2xl font-bold text-gray-700">{stats.total}</div>
            <div className="text-sm text-gray-600">Total</div>
          </div>
          <div className="bg-green-50 p-3 rounded-lg text-center">
            <div className="text-2xl font-bold text-green-700">{stats.aprobados}</div>
            <div className="text-sm text-green-600">Aprobados</div>
          </div>
          <div className="bg-yellow-50 p-3 rounded-lg text-center">
            <div className="text-2xl font-bold text-yellow-700">{stats.parciales}</div>
            <div className="text-sm text-yellow-600">Parciales</div>
          </div>
          <div className="bg-red-50 p-3 rounded-lg text-center">
            <div className="text-2xl font-bold text-red-700">{stats.rechazados}</div>
            <div className="text-sm text-red-600">Rechazados</div>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg text-center">
            <div className="text-2xl font-bold text-gray-700">{stats.pendientes}</div>
            <div className="text-sm text-gray-600">Pendientes</div>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Buscar por código o nombre..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="todos">Todos los estados</option>
            <option value="pendiente">Pendientes</option>
            <option value="aprobado">Aprobados</option>
            <option value="parcial">Parciales</option>
            <option value="rechazado">Rechazados</option>
          </select>
        </div>
      </div>

      {/* Vista de material uno por uno */}
      {inventarioFiltrado.length > 0 && (
        <div className="bg-white rounded-lg shadow-md">
          {(() => {
            const materialActual = inventarioFiltrado[materialActualIndex] || inventarioFiltrado[0]
            const cantidadSolicitada = periodoActual === 'marzo' 
              ? materialActual.cantidadSolicitadaMarzo 
              : materialActual.cantidadSolicitadaAgosto
            const cantidadAprobada = periodoActual === 'marzo' 
              ? materialActual.cantidadAprobadaMarzo 
              : materialActual.cantidadAprobadaAgosto
            const estadoActual = periodoActual === 'marzo' 
              ? materialActual.estadoMarzo 
              : materialActual.estadoAgosto
            const observaciones = periodoActual === 'marzo' 
              ? materialActual.observacionesMarzo 
              : materialActual.observacionesAgosto

            return (
              <div className="p-8">
                {/* Progreso */}
                <div className="mb-6">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Material {materialActualIndex + 1} de {inventarioFiltrado.length}</span>
                    <span>{stats.aprobados + stats.rechazados} de {stats.total} revisados</span>
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
                    <div className="text-sm text-green-800 font-medium">Aprobado</div>
                  </div>
                </div>

                {/* Campo manual para cantidad parcial */}
                {mostrarCampoManual && (
                  <div className="mb-6 p-4 bg-yellow-50 rounded-lg border-2 border-yellow-200">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ingrese cantidad a aprobar (máximo {cantidadSolicitada}):
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
                          actualizarEstadoArticulo(materialActual.id, campo, cantidadManual)
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
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                    <button
                      onClick={() => {
                        const campo = periodoActual === 'marzo' ? 'cantidadAprobadaMarzo' : 'cantidadAprobadaAgosto'
                        actualizarEstadoArticulo(materialActual.id, campo, cantidadSolicitada)
                        // Auto-navegar al siguiente material
                        setTimeout(() => {
                          if (materialActualIndex < inventarioFiltrado.length - 1) {
                            setMaterialActualIndex(materialActualIndex + 1)
                          }
                        }, 500)
                      }}
                      className="bg-green-600 hover:bg-green-700 text-white font-bold py-6 px-6 rounded-lg transition-colors text-lg"
                    >
                      ✅ Aprobar Todo<br />
                      <span className="text-sm">({cantidadSolicitada} unidades)</span>
                    </button>
                    
                    <button
                      onClick={() => {
                        setCantidadManual(Math.ceil(cantidadSolicitada / 2))
                        setMostrarCampoManual(true)
                      }}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-6 px-6 rounded-lg transition-colors text-lg"
                    >
                      ⚠️ Aprobar Parcial<br />
                      <span className="text-sm">(Cantidad personalizada)</span>
                    </button>
                    
                    <button
                      onClick={() => {
                        const campo = periodoActual === 'marzo' ? 'cantidadAprobadaMarzo' : 'cantidadAprobadaAgosto'
                        actualizarEstadoArticulo(materialActual.id, campo, 0)
                        // Auto-navegar al siguiente material
                        setTimeout(() => {
                          if (materialActualIndex < inventarioFiltrado.length - 1) {
                            setMaterialActualIndex(materialActualIndex + 1)
                          }
                        }, 500)
                      }}
                      className="bg-red-600 hover:bg-red-700 text-white font-bold py-6 px-6 rounded-lg transition-colors text-lg"
                    >
                      ❌ Rechazar<br />
                      <span className="text-sm">(0 unidades)</span>
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
                    ⬅️ Anterior
                  </button>
                  
                  <div className="flex flex-col items-center gap-2">
                    <div className="text-sm text-gray-600">
                      {materialActualIndex < inventarioFiltrado.length - 1 
                        ? `Quedan ${inventarioFiltrado.length - materialActualIndex - 1} materiales por revisar`
                        : 'Último material'
                      }
                    </div>
                    <button
                      onClick={() => setModoVista('tabla')}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-sm"
                    >
                      📊 Finalizar y Ver Tabla
                    </button>
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
                    Siguiente ➡️
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
                📋 Tabla de Inventario - {periodoActual.charAt(0).toUpperCase() + periodoActual.slice(1)} 2024
              </h3>
              <button
                onClick={() => setModoVista('revision')}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                🔙 Volver a Revisión
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
                    Solicitado
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aprobado
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {inventario.filter(item => 
                  periodoActual === 'marzo' ? item.cantidadSolicitadaMarzo > 0 : item.cantidadSolicitadaAgosto > 0
                ).map((item) => {
                  const cantidadSolicitada = periodoActual === 'marzo' 
                    ? item.cantidadSolicitadaMarzo 
                    : item.cantidadSolicitadaAgosto
                  const cantidadAprobada = periodoActual === 'marzo' 
                    ? item.cantidadAprobadaMarzo 
                    : item.cantidadAprobadaAgosto
                  const estadoPeriodo = periodoActual === 'marzo' 
                    ? item.estadoMarzo 
                    : item.estadoAgosto
                  
                  return (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{item.nombre}</div>
                          <div className="text-sm text-gray-500">Código: {item.codigo}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-sm font-medium text-blue-600">{cantidadSolicitada}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-sm font-medium text-green-600">{cantidadAprobada}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getEstadoColor(estadoPeriodo)}`}>
                          {getEstadoIcon(estadoPeriodo)} {estadoPeriodo}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
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
            <div className="bg-green-50 p-4 rounded-lg text-left max-w-3xl mx-auto">
              <h4 className="font-medium text-green-900 mb-2">✅ Vale de Salida - Universidad Ricardo Palma</h4>
              <p className="text-sm text-green-800 mb-3">
                Sistema configurado para extraer del formato oficial de Vale de Salida:
              </p>
              
              <div className="bg-white p-3 rounded border border-green-200 mb-3">
                <p className="text-xs text-gray-600 mb-2"><strong>Estructura del documento detectada:</strong></p>
                <div className="grid grid-cols-4 gap-1 text-xs">
                  <div className="bg-gray-100 p-2 rounded text-center">
                    <div className="font-bold text-gray-700">N°</div>
                    <div className="text-gray-500">🚫</div>
                  </div>
                  <div className="bg-blue-100 p-2 rounded text-center">
                    <div className="font-bold text-blue-800">Código</div>
                    <div className="text-blue-600">✅</div>
                  </div>
                  <div className="bg-blue-100 p-2 rounded text-center">
                    <div className="font-bold text-blue-800">Descripción</div>
                    <div className="text-blue-600">✅</div>
                  </div>
                  <div className="bg-gray-100 p-2 rounded text-center">
                    <div className="font-bold text-gray-700">Subinventario</div>
                    <div className="text-gray-500">🚫</div>
                  </div>
                  <div className="bg-gray-100 p-2 rounded text-center">
                    <div className="font-bold text-gray-700">N° Transac.</div>
                    <div className="text-gray-500">🚫</div>
                  </div>
                  <div className="bg-blue-100 p-2 rounded text-center">
                    <div className="font-bold text-blue-800">Cantidad</div>
                    <div className="text-blue-600">✅</div>
                  </div>
                  <div className="bg-gray-100 p-2 rounded text-center">
                    <div className="font-bold text-gray-700">Unidad</div>
                    <div className="text-gray-500">🚫</div>
                  </div>
                  <div className="bg-gray-100 p-2 rounded text-center">
                    <div className="font-bold text-gray-700">Costo/Importe</div>
                    <div className="text-gray-500">🚫</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-3 rounded border border-green-200">
                <p className="text-xs text-gray-600 mb-2"><strong>Ejemplo de extracción:</strong></p>
                <div className="font-mono text-xs text-gray-700 bg-gray-50 p-2 rounded">
                  8845 → VINIFAN TAMAÑO OFICIO → Cantidad: 1<br/>
                  7558 → ETIQUETAS ADHESIVAS → Cantidad: 2<br/>
                  5845 → PLUMÓN AZUL P/PIZARRA → Cantidad: 3
                </div>
              </div>
            </div>
          </div>

          {/* Área de subida */}
          {!imagenSubida && (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
              <div className="mb-4">
                <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="mb-4">
                <label className="cursor-pointer">
                  <span className="text-lg font-medium text-blue-600 hover:text-blue-500">
                    Haz clic para subir una imagen
                  </span>
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,image/*"
                    onChange={(e) => {
                      const archivo = e.target.files[0]
                      if (archivo) {
                        setImagenSubida(archivo)
                      }
                    }}
                  />
                </label>
              </div>
              <p className="text-sm text-gray-500">
                PDF, PNG, JPG, GIF hasta 10MB<br />
                <strong>PDF recomendado</strong> para mejor precisión
              </p>
            </div>
          )}

          {/* Vista previa de archivo */}
          {imagenSubida && !procesandoOCR && !resultadoOCR && (
            <div className="space-y-6">
              <div className="text-center">
                {imagenSubida.type === 'application/pdf' ? (
                  <div className="bg-red-50 p-8 rounded-lg border-2 border-red-200">
                    <div className="w-16 h-16 bg-red-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <h4 className="text-lg font-medium text-red-800 mb-2">📄 Archivo PDF Cargado</h4>
                    <p className="text-red-700 mb-2">Listo para extraer datos de tabla</p>
                    <p className="text-sm text-red-600">
                      {imagenSubida.name} ({(imagenSubida.size / 1024 / 1024).toFixed(2)} MB)
                    </p>
                  </div>
                ) : (
                  <div>
                    <img
                      src={URL.createObjectURL(imagenSubida)}
                      alt="Vista previa"
                      className="max-w-full max-h-96 mx-auto rounded-lg shadow-md"
                    />
                    <p className="text-sm text-gray-600 mt-2">
                      {imagenSubida.name} ({(imagenSubida.size / 1024 / 1024).toFixed(2)} MB)
                    </p>
                  </div>
                )}
              </div>
              


              <div className="flex justify-center gap-4">
                <button
                  onClick={() => procesarImagenOCR(imagenSubida)}
                  className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium"
                >
                  {imagenSubida.type === 'application/pdf' ? '📄 Extraer Datos del PDF' : '🔍 Extraer Datos del Papel'}
                </button>
                <button
                  onClick={() => {
                    setImagenSubida(null)
                    setResultadoOCR('')
                  }}
                  className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  🗑️ Cambiar {imagenSubida.type === 'application/pdf' ? 'PDF' : 'Imagen'}
                </button>
              </div>
            </div>
          )}

          {/* Procesando OCR */}
          {procesandoOCR && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">
                {imagenSubida?.type === 'application/pdf' ? 'Procesando PDF...' : 'Procesando imagen...'}
              </h4>
              <p className="text-gray-600">
                {imagenSubida?.type === 'application/pdf' 
                  ? 'Extrayendo tabla del documento PDF'
                  : 'Extrayendo datos del papel de inventario'
                }
              </p>
              <div className="mt-4 bg-blue-50 p-4 rounded-lg max-w-md mx-auto">
                <p className="text-xs text-blue-700">
                  {imagenSubida?.type === 'application/pdf' 
                    ? '✅ Los PDFs tienen mejor precisión en la extracción de tablas'
                    : '💡 Para mejor precisión, usa archivos PDF cuando sea posible'
                  }
                </p>
              </div>
            </div>
          )}

          {/* Resultado OCR */}
          {resultadoOCR && (
            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Datos extraídos:</h4>
                <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
                  {resultadoOCR}
                </pre>
              </div>
              
              <div className="flex justify-center gap-4">
                <button
                  onClick={aplicarDatosOCR}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
                >
                  ✅ Aplicar Datos al Inventario
                </button>
                <button
                  onClick={() => {
                    setImagenSubida(null)
                    setResultadoOCR('')
                  }}
                  className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  🔄 Procesar Otra Imagen
                </button>
              </div>
            </div>
          )}

          {/* Botón volver */}
          <div className="mt-8 text-center">
            <button
              onClick={() => setModoVista('revision')}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              🔙 Volver a Revisión Manual
            </button>
          </div>
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