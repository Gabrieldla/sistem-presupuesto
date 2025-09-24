import { useState, useRef, useCallback, useEffect } from 'react'
import { PARTIDAS_PRESUPUESTARIAS, createPartidaResumen, getArticulosSinAsignar } from '../types/budget'

const ResumenPartidas = ({ articulos, valoresPartidas, onActualizarValorPartida }) => {
  const [valoresLocales, setValoresLocales] = useState({})
  const timeoutRefs = useRef({})

  // Limpiar timeouts al desmontar el componente
  useEffect(() => {
    return () => {
      Object.values(timeoutRefs.current).forEach(timeout => {
        if (timeout) clearTimeout(timeout)
      })
    }
  }, [])
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-PE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)
  }

  // Generar resumen por partidas usando valores de BD + locales para inputs
  const partidasResumen = PARTIDAS_PRESUPUESTARIAS.map(partida => {
    // Usar valores de BD (valoresPartidas) para el cálculo principal
    return createPartidaResumen(partida, articulos, valoresPartidas[partida.codigo])
  })

  // Función para obtener el valor a mostrar en los inputs (con valores locales temporales)
  const getValorInput = (codigoPartida, mes) => {
    const localKey = `${codigoPartida}-${mes}`
    if (valoresLocales[localKey] !== undefined) {
      return valoresLocales[localKey]
    }
    
    // Para marzo y agosto, mostrar el valor calculado (base + artículos)
    const partida = partidasResumen.find(p => p.codigo === codigoPartida)
    if (partida && (mes === 'mar' || mes === 'ago')) {
      return partida.meses[mes] || 0
    }
    
    // Para otros meses, mostrar valor base
    return valoresPartidas[codigoPartida]?.[mes] || 0
  }

  // Calcular gran total
  const granTotal = partidasResumen.reduce((sum, partida) => sum + partida.total, 0)

  const handleValorChange = useCallback((codigoPartida, mes, valor) => {
    // Actualizar valores locales inmediatamente para UI responsiva
    setValoresLocales(prev => ({
      ...prev,
      [`${codigoPartida}-${mes}`]: parseFloat(valor) || 0
    }))
    
    // Limpiar timeout anterior si existe
    const timeoutKey = `${codigoPartida}-${mes}`
    if (timeoutRefs.current[timeoutKey]) {
      clearTimeout(timeoutRefs.current[timeoutKey])
    }
    
    // Crear nuevo timeout para guardar en BD después de 1 segundo
    timeoutRefs.current[timeoutKey] = setTimeout(() => {
      onActualizarValorPartida(codigoPartida, mes, valor)
      delete timeoutRefs.current[timeoutKey]
    }, 1000) // 1 segundo de delay
  }, [onActualizarValorPartida])

  const meses = [
    { key: 'ene', label: 'Ene' },
    { key: 'feb', label: 'Feb' },
    { key: 'mar', label: 'Mar' },
    { key: 'abr', label: 'Abr' },
    { key: 'may', label: 'May' },
    { key: 'jun', label: 'Jun' },
    { key: 'jul', label: 'Jul' },
    { key: 'ago', label: 'Ago' },
    { key: 'set', label: 'Set' },
    { key: 'oct', label: 'Oct' },
    { key: 'nov', label: 'Nov' },
    { key: 'dic', label: 'Dic' }
  ]

  return (
    <div className="space-y-8">
      {/* Tabla principal mejorada */}
      <div className="overflow-x-auto rounded-lg border border-gray-300 shadow-lg">
        <table className="min-w-full border-collapse bg-white">
          <thead>
            <tr className="bg-blue-600 text-white">
              <th className="border border-gray-300 px-4 py-4 text-sm font-bold text-left min-w-[300px]">
                Nombre de Partidas
              </th>
              <th className="border border-gray-300 px-4 py-4 text-sm font-bold text-center">
                Código ERP
              </th>
              {meses.map(mes => (
                <th key={mes.key} className="border border-gray-300 px-2 py-4 text-xs font-bold text-center min-w-[80px]">
                  {mes.label}
                </th>
              ))}
              <th className="border border-gray-300 px-4 py-4 text-sm font-bold text-center min-w-[120px]">
                Total
              </th>
            </tr>
          </thead>
            <tbody>
              {partidasResumen.map((partida, index) => (
                <tr key={partida.codigo} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="border border-gray-300 px-4 py-3 text-sm font-medium text-gray-800">
                    {partida.nombre}
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center text-sm font-medium text-gray-700">
                    {partida.codigo}
                  </td>
                  {meses.map(mes => {
                    const esMarzoOAgosto = mes.key === 'mar' || mes.key === 'ago'
                    const esMateriales = partida.codigo === '60311' // Solo la partida de materiales
                    const esMarzoAgostoMateriales = esMarzoOAgosto && esMateriales
                    const valorMostrar = partida.meses[mes.key]
                    const valorBase = partida.valoresBase[mes.key]
                    
                    return (
                      <td key={mes.key} className="border border-gray-300 px-1 py-2 text-center text-sm">
                        {esMarzoAgostoMateriales ? (
                          // Solo para marzo y agosto de la partida MATERIALES (60311), mostrar valor calculado (solo lectura)
                          <div 
                            className="w-full px-2 py-1 text-center border-2 border-gray-400 rounded text-xs font-bold bg-gray-100 text-gray-700 cursor-not-allowed"
                            title={`Total calculado: ${formatCurrency(valorMostrar)} (incluye artículos + valor base). No editable porque se gestiona desde arriba.`}
                          >
                            {formatCurrency(valorMostrar)}
                          </div>
                        ) : (
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={getValorInput(partida.codigo, mes.key) || ''}
                            onChange={(e) => handleValorChange(partida.codigo, mes.key, e.target.value)}
                            className={`w-full px-2 py-1 text-center border rounded focus:outline-none focus:ring-1 focus:ring-blue-400 text-xs font-medium ${
                              esMarzoOAgosto && !esMateriales 
                                ? 'border-2 border-blue-300 bg-blue-50' 
                                : 'border-gray-200 bg-white'
                            }`}
                            placeholder="0.00"
                            title={esMarzoOAgosto && !esMateriales 
                              ? `Valor total: ${formatCurrency(valorMostrar)} (incluye artículos + valor base)`
                              : undefined
                            }
                          />
                        )}
                      </td>
                    )
                  })}
                  <td className="border border-gray-300 px-4 py-3 text-center text-sm font-bold text-gray-800">
                    S/. {formatCurrency(partida.total)}
                  </td>
                </tr>
              ))}
              
              {/* Fila del gran total mejorada */}
              <tr className="bg-gray-100 border-t-2 border-gray-400">
                <td colSpan="2" className="border border-gray-300 px-4 py-4 text-right font-bold text-lg text-gray-800">
                  GRAN TOTAL ANUAL:
                </td>
                {meses.map(mes => {
                  const totalMes = partidasResumen.reduce((sum, partida) => sum + partida.meses[mes.key], 0)
                  return (
                    <td key={mes.key} className="border border-gray-300 px-2 py-4 text-center font-bold text-gray-700 bg-gray-200">
                      {totalMes > 0 ? formatCurrency(totalMes) : '0'}
                    </td>
                  )
                })}
                <td className="border border-gray-300 px-4 py-4 text-center font-bold text-gray-800 text-xl bg-gray-200">
                  S/. {formatCurrency(granTotal)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Resumen ejecutivo mejorado */}
        <div className="bg-gray-50 border border-gray-300 p-8 rounded-lg shadow-lg">
          <div className="text-center mb-6">
            <h4 className="text-2xl font-bold text-gray-800">Resumen Ejecutivo</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg text-center border border-gray-200">
              <div className="text-3xl font-bold text-gray-700 mb-2">
                {partidasResumen.length}
              </div>
              <div className="text-sm font-semibold text-gray-600">Partidas Activas</div>
            </div>
            <div className="bg-white p-6 rounded-lg text-center border border-gray-200">
              <div className="text-2xl font-bold text-gray-700 mb-2">
                S/. {formatCurrency(partidasResumen.reduce((sum, p) => sum + p.meses.mar, 0))}
              </div>
              <div className="text-sm font-semibold text-gray-600">Total Marzo</div>
            </div>
            <div className="bg-white p-6 rounded-lg text-center border border-gray-200">
              <div className="text-2xl font-bold text-gray-700 mb-2">
                S/. {formatCurrency(partidasResumen.reduce((sum, p) => sum + p.meses.ago, 0))}
              </div>
              <div className="text-sm font-semibold text-gray-600">Total Agosto</div>
            </div>
            <div className="bg-gray-100 p-6 rounded-lg text-center border-2 border-gray-400">
              <div className="text-3xl font-bold text-gray-800 mb-2">
                S/. {formatCurrency(granTotal)}
              </div>
              <div className="text-sm font-bold text-gray-700">Presupuesto Total</div>
            </div>
          </div>
        </div>

        {/* Detalles por partida mejorados */}
        <div className="space-y-6">
          <div className="mb-6">
            <h4 className="text-xl font-bold text-gray-800">Detalle por Partidas</h4>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {partidasResumen.map(partida => {
              const articulosDePartida = articulos.filter(art => 
                PARTIDAS_PRESUPUESTARIAS.find(p => p.codigo === partida.codigo)?.articulos.includes(art.codigo)
              )
              
              return (
                <div key={partida.codigo} className="bg-white border border-gray-300 rounded-lg p-6 shadow-lg">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="mb-2">
                        <h5 className="font-bold text-gray-800 text-lg">{partida.nombre}</h5>
                      </div>
                      <p className="text-sm text-gray-600 font-semibold">Código ERP: {partida.codigo}</p>
                    </div>
                    <div className="text-right bg-gray-100 p-4 rounded-lg border border-gray-200">
                      <div className="text-2xl font-bold text-gray-800">
                        S/. {formatCurrency(partida.total)}
                      </div>
                      <div className="text-sm font-semibold text-gray-600">Total Partida</div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
        
        {/* Artículos sin asignar - Advertencia */}
        {(() => {
          const articulosSinAsignar = getArticulosSinAsignar(articulos)
          if (articulosSinAsignar.length === 0) return null
          
          return (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 shadow-lg">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <svg className="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-bold text-yellow-800 mb-2">
                    ⚠️ Artículos sin asignar a partidas ({articulosSinAsignar.length})
                  </h4>
                  <p className="text-yellow-700 mb-3">
                    Los siguientes artículos aparecen en "Detalle de Artículos" pero NO se incluyen en el resumen por partidas:
                  </p>
                  <div className="bg-white rounded border border-yellow-200 p-3">
                    {articulosSinAsignar.map(articulo => (
                      <div key={articulo.id} className="flex justify-between items-center py-1 border-b border-yellow-100 last:border-b-0">
                        <span className="font-medium text-gray-800">
                          {articulo.codigo} - {articulo.nombre}
                        </span>
                        <span className="text-sm text-gray-600">
                          Total: S/. {formatCurrency(articulo.totales.total)}
                        </span>
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-yellow-600 mt-2">
                    💡 <strong>Solución:</strong> Estos artículos necesitan ser asignados a una partida presupuestaria en la configuración del sistema.
                  </p>
                </div>
              </div>
            </div>
          )
        })()}
    </div>
  )
}

export default ResumenPartidas