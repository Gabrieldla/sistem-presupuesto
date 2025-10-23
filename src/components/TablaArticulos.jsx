const TablaArticulos = ({ articulos, onEliminarArticulo, onActualizarArticulo }) => {
  // Calcular totales generales
  const totalMarzo = articulos.reduce((sum, art) => sum + art.totales.marzo, 0)
  const totalAgosto = articulos.reduce((sum, art) => sum + art.totales.agosto, 0)
  const totalGeneral = totalMarzo + totalAgosto

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-PE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)
  }

  const handleInputChange = (id, campo, valor) => {
    // Permitir valores vacíos temporalmente, se convertirán a 0 en el backend
    onActualizarArticulo(id, campo, valor === '' ? '0' : valor)
  }

  if (articulos.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-12 text-center">
        <div className="w-20 h-20 bg-gray-400 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl text-white">■</span>
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">Presupuesto Vacío</h3>
        <p className="text-gray-600">No hay artículos agregados al presupuesto. Use el selector arriba para agregar artículos.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Tabla principal */}
      <div className="overflow-x-auto rounded-lg shadow-lg">
        <table className="min-w-full border-collapse bg-white border border-gray-300">
          <thead>
            <tr className="bg-blue-600 text-white">
              <th className="border border-gray-300 px-4 py-3 text-sm font-medium text-center">
                Código<br />Artículo
              </th>
              <th className="border border-gray-300 px-4 py-3 text-sm font-medium text-center min-w-[200px]">
                Nombre del Artículo
              </th>
              <th className="border border-gray-300 px-4 py-3 text-sm font-medium text-center">
                Precio<br />Presup.
              </th>
              <th className="border border-gray-300 px-4 py-3 text-sm font-medium text-center" colSpan="2">
                Cantidad
              </th>
              <th className="border border-gray-300 px-4 py-3 text-sm font-medium text-center" colSpan="2">
                Total (S/.)
              </th>
              <th className="border border-gray-300 px-4 py-3 text-sm font-medium text-center">
                Total<br />Soles
              </th>
              <th className="border border-gray-300 px-4 py-3 text-sm font-medium text-center">
                Acciones
              </th>
            </tr>
            <tr className="bg-blue-500 text-white">
              <th className="border border-gray-300 px-3 py-1 text-xs"></th>
              <th className="border border-gray-300 px-3 py-1 text-xs"></th>
              <th className="border border-gray-300 px-3 py-1 text-xs"></th>
              <th className="border border-gray-300 px-3 py-1 text-xs">Marzo</th>
              <th className="border border-gray-300 px-3 py-1 text-xs">Agosto</th>
              <th className="border border-gray-300 px-3 py-1 text-xs">Marzo</th>
              <th className="border border-gray-300 px-3 py-1 text-xs">Agosto</th>
              <th className="border border-gray-300 px-3 py-1 text-xs"></th>
              <th className="border border-gray-300 px-3 py-1 text-xs"></th>
            </tr>
          </thead>
          <tbody>
            {articulos.sort((a, b) => a.nombre.localeCompare(b.nombre)).map((articulo, index) => (
              <tr key={articulo.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                {/* Código */}
                <td className="border border-gray-300 px-3 py-2 text-center text-sm font-medium">
                  {articulo.codigo}
                </td>
                
                {/* Nombre */}
                <td className="border border-gray-300 px-3 py-2 text-sm">
                  {articulo.nombre}
                </td>
                
                {/* Precio Presupuesto - Editable */}
                <td className="border border-gray-300 px-2 py-2 text-center">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={articulo.precioPresupuesto || ''}
                    onChange={(e) => handleInputChange(articulo.id, 'precioPresupuesto', e.target.value)}
                    placeholder="0.00"
                    className="w-20 px-2 py-1 text-center border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-400 text-sm"
                  />
                </td>
                
                {/* Cantidad Marzo - Editable */}
                <td className="border border-gray-300 px-2 py-2 text-center">
                  <input
                    type="number"
                    min="0"
                    value={articulo.cantidades.marzo || ''}
                    onChange={(e) => handleInputChange(articulo.id, 'cantidadMarzo', e.target.value)}
                    placeholder="0"
                    className="w-16 px-2 py-1 text-center border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-400 text-sm"
                  />
                </td>
                
                {/* Cantidad Agosto - Editable */}
                <td className="border border-gray-300 px-2 py-2 text-center">
                  <input
                    type="number"
                    min="0"
                    value={articulo.cantidades.agosto || ''}
                    onChange={(e) => handleInputChange(articulo.id, 'cantidadAgosto', e.target.value)}
                    placeholder="0"
                    className="w-16 px-2 py-1 text-center border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-400 text-sm"
                  />
                </td>
                
                {/* Total Marzo - Calculado */}
                <td className="border border-gray-300 px-3 py-2 text-center text-sm font-medium">
                  {formatCurrency(articulo.totales.marzo)}
                </td>
                
                {/* Total Agosto - Calculado */}
                <td className="border border-gray-300 px-3 py-2 text-center text-sm font-medium">
                  {formatCurrency(articulo.totales.agosto)}
                </td>
                
                {/* Total Soles - Calculado */}
                <td className="border border-gray-300 px-3 py-2 text-center text-sm font-bold">
                  {formatCurrency(articulo.totales.total)}
                </td>
                
                {/* Acciones */}
                <td className="border border-gray-300 px-2 py-2 text-center">
                  <button
                    onClick={() => onEliminarArticulo(articulo.id)}
                    className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 focus:outline-none focus:ring-1 focus:ring-red-400"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
            
            {/* Fila de totales mejorada */}
            <tr className="bg-gray-100 border-t-2 border-gray-400">
              <td colSpan="5" className="border border-gray-300 px-4 py-4 text-right font-bold text-gray-800 text-lg">
                TOTALES GENERALES:
              </td>
              <td className="border border-gray-300 px-4 py-4 text-center font-bold text-gray-700 text-lg">
                S/. {formatCurrency(totalMarzo)}
              </td>
              <td className="border border-gray-300 px-4 py-4 text-center font-bold text-gray-700 text-lg">
                S/. {formatCurrency(totalAgosto)}
              </td>
              <td className="border border-gray-300 px-4 py-4 text-center font-bold text-gray-800 text-xl">
                S/. {formatCurrency(totalGeneral)}
              </td>
              <td className="border border-gray-300 px-4 py-4"></td>
            </tr>
          </tbody>
        </table>
      </div>
      
      {/* Resumen de totales mejorado */}
      <div className="bg-gray-50 border border-gray-300 p-6 rounded-lg shadow-lg">
        <div className="text-center mb-4">
          <h4 className="text-xl font-bold text-gray-800">Resumen Ejecutivo</h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-4 rounded-lg text-center border border-gray-200">
            <span className="block font-bold text-gray-700 text-sm mb-1">Total Marzo</span>
            <span className="block text-2xl font-bold text-gray-800">S/. {formatCurrency(totalMarzo)}</span>
          </div>
          <div className="bg-white p-4 rounded-lg text-center border border-gray-200">
            <span className="block font-bold text-gray-700 text-sm mb-1">Total Agosto</span>
            <span className="block text-2xl font-bold text-gray-800">S/. {formatCurrency(totalAgosto)}</span>
          </div>
          <div className="bg-gray-100 p-4 rounded-lg text-center border-2 border-gray-400">
            <span className="block font-bold text-gray-700 text-sm mb-1">Total General</span>
            <span className="block text-3xl font-bold text-gray-800">S/. {formatCurrency(totalGeneral)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TablaArticulos