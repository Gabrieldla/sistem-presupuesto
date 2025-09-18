import { useState, useEffect, useRef } from 'react'

const GestorMateriales = ({ materiales, onAgregarMaterial, onEditarMaterial, onEliminarMaterial }) => {
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [editandoMaterial, setEditandoMaterial] = useState(null)
  const [busqueda, setBusqueda] = useState('')
  const busquedaRef = useRef(null)
  const [nuevoMaterial, setNuevoMaterial] = useState({
    codigo: '',
    nombre: '',
    precio: ''
  })

  // Manejo de atajos de teclado
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl+F para enfocar la búsqueda
      if (e.ctrlKey && e.key === 'f') {
        e.preventDefault()
        busquedaRef.current?.focus()
      }
      // Escape para limpiar búsqueda
      if (e.key === 'Escape' && busqueda) {
        setBusqueda('')
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [busqueda])

  const handleAgregarMaterial = () => {
    if (!nuevoMaterial.codigo || !nuevoMaterial.nombre || !nuevoMaterial.precio) {
      alert('Por favor completa todos los campos')
      return
    }

    // Verificar que el código no exista
    if (materiales.find(m => m.codigo === nuevoMaterial.codigo)) {
      alert('Ya existe un material con ese código')
      return
    }

    onAgregarMaterial(nuevoMaterial.codigo, nuevoMaterial.nombre, nuevoMaterial.precio)
    setNuevoMaterial({ codigo: '', nombre: '', precio: '' })
    setMostrarFormulario(false)
  }

  const handleEditarMaterial = (material) => {
    setEditandoMaterial({
      codigoOriginal: material.codigo,
      codigo: material.codigo,
      nombre: material.nombre,
      precio: material.precio.toString()
    })
  }

  const handleGuardarEdicion = () => {
    if (!editandoMaterial.codigo || !editandoMaterial.nombre || !editandoMaterial.precio) {
      alert('Por favor completa todos los campos')
      return
    }

    onEditarMaterial(
      editandoMaterial.codigoOriginal,
      editandoMaterial.codigo,
      editandoMaterial.nombre,
      editandoMaterial.precio
    )
    setEditandoMaterial(null)
  }

  const handleCancelarEdicion = () => {
    setEditandoMaterial(null)
  }

  // Filtrar y ordenar materiales
  const materialesFiltrados = materiales
    .filter(material => 
      material.codigo.toLowerCase().includes(busqueda.toLowerCase()) ||
      material.nombre.toLowerCase().includes(busqueda.toLowerCase())
    )
    .sort((a, b) => a.nombre.localeCompare(b.nombre))

  return (
    <div className="space-y-8">
      {/* Header mejorado */}
      <div className="flex justify-between items-center bg-gray-50 p-6 rounded-lg border border-gray-300">
        <div>
          <h4 className="text-xl font-bold text-gray-800">Catálogo de Materiales</h4>
          <p className="text-gray-600 font-semibold">
            {materiales.length} materiales disponibles
          </p>
        </div>
        <button
          onClick={() => setMostrarFormulario(!mostrarFormulario)}
          className={`px-6 py-3 rounded-lg font-bold ${
            mostrarFormulario 
              ? 'bg-red-500 text-white hover:bg-red-600'
              : 'bg-emerald-600 text-white hover:bg-emerald-700'
          }`}
        >
          {mostrarFormulario ? 'Cancelar' : 'Nuevo Material'}
        </button>
      </div>

      {/* Formulario para nuevo material mejorado */}
      {mostrarFormulario && (
        <div className="bg-gray-50 border border-gray-300 p-8 rounded-lg shadow-lg">
          <div className="mb-6">
            <h5 className="text-xl font-bold text-gray-800">Agregar Nuevo Material</h5>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-2">Código</label>
              <input
                type="text"
                value={nuevoMaterial.codigo}
                onChange={(e) => setNuevoMaterial(prev => ({ ...prev, codigo: e.target.value }))}
                placeholder="ej: 9999"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-medium"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-800 mb-2">Nombre del Material</label>
              <input
                type="text"
                value={nuevoMaterial.nombre}
                onChange={(e) => setNuevoMaterial(prev => ({ ...prev, nombre: e.target.value }))}
                placeholder="ej: PAPEL BOND A4 x 500 HOJAS"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-medium"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-2">Precio (S/.)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={nuevoMaterial.precio}
                onChange={(e) => setNuevoMaterial(prev => ({ ...prev, precio: e.target.value }))}
                placeholder="0.00"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-medium"
              />
            </div>
          </div>
          <div className="mt-6 flex justify-center space-x-4">
            <button
              onClick={() => setMostrarFormulario(false)}
              className="px-6 py-3 bg-gray-500 text-white font-bold rounded-lg hover:bg-gray-600"
            >
              Cancelar
            </button>
            <button
              onClick={handleAgregarMaterial}
              className="px-8 py-3 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700"
            >
              Agregar Material
            </button>
          </div>
        </div>
      )}

      {/* Barra de búsqueda */}
      <div className="bg-white p-4 rounded-lg border border-gray-300 shadow-md">
        <div className="flex items-center space-x-3">
          <div className="flex-1">
            <label className="block text-sm font-bold text-gray-800 mb-2">Buscar Material</label>
            <input
              ref={busquedaRef}
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por código o nombre... (Ctrl+F para enfocar, Esc para limpiar)"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>
          {busqueda && (
            <button
              onClick={() => setBusqueda('')}
              className="px-3 py-2 bg-gray-500 text-white text-sm rounded-lg hover:bg-gray-600"
            >
              Limpiar
            </button>
          )}
        </div>
        <div className="mt-2 text-sm text-gray-600">
          Mostrando {materialesFiltrados.length} de {materiales.length} materiales (ordenados alfabéticamente)
        </div>
      </div>

      {/* Lista de materiales mejorada */}
      <div className="bg-white rounded-lg border border-gray-300 shadow-lg overflow-hidden">
        <div className="max-h-96 overflow-y-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-blue-600 sticky top-0">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wider">
                  Código
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wider">
                  Nombre del Material
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wider">
                  Precio
                </th>
                <th className="px-6 py-4 text-center text-sm font-bold text-white uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {materialesFiltrados.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center">
                    <div className="text-gray-500">
                      {busqueda ? 
                        `No se encontraron materiales que coincidan con "${busqueda}"` : 
                        'No hay materiales disponibles'
                      }
                    </div>
                  </td>
                </tr>
              ) : (
                materialesFiltrados.map((material, index) => (
                  <tr key={material.codigo} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  {editandoMaterial && editandoMaterial.codigoOriginal === material.codigo ? (
                    // Modo edición mejorado
                    <>
                      <td className="px-6 py-4">
                        <input
                          type="text"
                          value={editandoMaterial.codigo}
                          onChange={(e) => setEditandoMaterial(prev => ({ ...prev, codigo: e.target.value }))}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium bg-white"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <input
                          type="text"
                          value={editandoMaterial.nombre}
                          onChange={(e) => setEditandoMaterial(prev => ({ ...prev, nombre: e.target.value }))}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium bg-white"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={editandoMaterial.precio}
                          onChange={(e) => setEditandoMaterial(prev => ({ ...prev, precio: e.target.value }))}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium bg-white"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center space-x-2">
                          <button
                            onClick={handleGuardarEdicion}
                            className="px-4 py-2 bg-emerald-600 text-white text-sm font-bold rounded-lg hover:bg-emerald-700"
                          >
                            Guardar
                          </button>
                          <button
                            onClick={handleCancelarEdicion}
                            className="px-4 py-2 bg-gray-500 text-white text-sm font-bold rounded-lg hover:bg-gray-600"
                          >
                            Cancelar
                          </button>
                        </div>
                      </td>
                    </>
                  ) : (
                    // Modo vista mejorado
                    <>
                      <td className="px-6 py-4 text-sm font-bold text-gray-800">{material.codigo}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-800">{material.nombre}</td>
                      <td className="px-6 py-4 text-sm font-bold text-gray-700">S/. {material.precio.toFixed(2)}</td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center space-x-2">
                          <button
                            onClick={() => handleEditarMaterial(material)}
                            className="px-3 py-2 bg-blue-500 text-white text-xs font-bold rounded-lg hover:bg-blue-600"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`¿Eliminar material ${material.codigo} - ${material.nombre}?`)) {
                                onEliminarMaterial(material.codigo)
                              }
                            }}
                            className="px-3 py-2 bg-red-500 text-white text-xs font-bold rounded-lg hover:bg-red-600"
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default GestorMateriales