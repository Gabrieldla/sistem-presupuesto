import { useState, useEffect, useRef } from 'react'

const ArticuloSelector = ({ articulos, onAgregarArticulo }) => {
  const [articuloSeleccionado, setArticuloSeleccionado] = useState('')
  const [cantidadMarzo, setCantidadMarzo] = useState('')
  const [cantidadAgosto, setCantidadAgosto] = useState('')
  const [precioCustom, setPrecioCustom] = useState('')
  const [busquedaArticulo, setBusquedaArticulo] = useState('')
  const [mostrarLista, setMostrarLista] = useState(false)
  const busquedaRef = useRef(null)
  const listaRef = useRef(null)

  // Filtrar y ordenar artículos alfabéticamente
  const articulosFiltrados = articulos
    .filter(articulo => 
      articulo.codigo.toLowerCase().includes(busquedaArticulo.toLowerCase()) ||
      articulo.nombre.toLowerCase().includes(busquedaArticulo.toLowerCase())
    )
    .sort((a, b) => a.nombre.localeCompare(b.nombre))

  // Manejo de atajos de teclado
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key === 'f') {
        e.preventDefault()
        busquedaRef.current?.focus()
        setMostrarLista(true)
      }
      if (e.key === 'Escape') {
        setMostrarLista(false)
        setBusquedaArticulo('')
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Cerrar lista al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (listaRef.current && !listaRef.current.contains(event.target)) {
        setMostrarLista(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSeleccionarArticulo = (articulo) => {
    setArticuloSeleccionado(articulo.codigo)
    setBusquedaArticulo(`${articulo.codigo} - ${articulo.nombre}`)
    setMostrarLista(false)
  }

  const handleAgregar = () => {
    if (!articuloSeleccionado) {
      alert('Por favor selecciona un artículo')
      return
    }

    const cantMarzo = parseInt(cantidadMarzo) || 0
    const cantAgosto = parseInt(cantidadAgosto) || 0

    if (cantMarzo === 0 && cantAgosto === 0) {
      alert('Por favor ingresa al menos una cantidad para Marzo o Agosto')
      return
    }

    const articulo = articulos.find(art => art.codigo === articuloSeleccionado)
    const precio = precioCustom ? parseFloat(precioCustom) : null
    
    onAgregarArticulo(articulo, cantMarzo, cantAgosto, precio)
    
    // Limpiar formulario
    setArticuloSeleccionado('')
    setCantidadMarzo('')
    setCantidadAgosto('')
    setPrecioCustom('')
    setBusquedaArticulo('')
  }

  const articuloActual = articulos.find(art => art.codigo === articuloSeleccionado)

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Selector de artículo con búsqueda */}
        <div className="relative" ref={listaRef}>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Seleccionar Artículo
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              ref={busquedaRef}
              type="text"
              value={busquedaArticulo}
              onChange={(e) => {
                setBusquedaArticulo(e.target.value)
                setMostrarLista(true)
                if (!e.target.value) {
                  setArticuloSeleccionado('')
                }
              }}
              onFocus={() => setMostrarLista(true)}
              placeholder="Buscar artículo... (Ctrl+F)"
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {busquedaArticulo && (
              <button
                onClick={() => {
                  setBusquedaArticulo('')
                  setArticuloSeleccionado('')
                  setMostrarLista(false)
                }}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <svg className="h-4 w-4 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          
          {/* Lista desplegable con resultados */}
          {mostrarLista && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
              {articulosFiltrados.length === 0 ? (
                <div className="px-3 py-2 text-gray-500 text-sm">
                  {busquedaArticulo ? `No se encontraron artículos que coincidan con "${busquedaArticulo}"` : 'No hay artículos disponibles'}
                </div>
              ) : (
                <>
                  <div className="px-3 py-2 text-xs text-gray-500 bg-gray-50 border-b">
                    {articulosFiltrados.length} artículo{articulosFiltrados.length !== 1 ? 's' : ''} encontrado{articulosFiltrados.length !== 1 ? 's' : ''} (ordenados alfabéticamente)
                  </div>
                  {articulosFiltrados.map((articulo) => (
                    <button
                      key={articulo.codigo}
                      onClick={() => handleSeleccionarArticulo(articulo)}
                      className={`w-full text-left px-3 py-2 hover:bg-blue-50 focus:bg-blue-50 focus:outline-none border-b border-gray-100 last:border-b-0 ${
                        articuloSeleccionado === articulo.codigo ? 'bg-blue-100' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-medium text-blue-600">{articulo.codigo}</div>
                          <div className="text-sm text-gray-800">{articulo.nombre}</div>
                        </div>
                        <div className="text-sm text-gray-500">S/. {articulo.precio.toFixed(2)}</div>
                      </div>
                    </button>
                  ))}
                </>
              )}
            </div>
          )}
        </div>

        {/* Precio personalizado */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Precio (S/.) {articuloActual && `(Base: ${articuloActual.precio.toFixed(2)})`}
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={precioCustom}
            onChange={(e) => setPrecioCustom(e.target.value)}
            placeholder={articuloActual ? articuloActual.precio.toFixed(2) : '0.00'}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Cantidad Marzo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cantidad Marzo
          </label>
          <input
            type="number"
            min="0"
            value={cantidadMarzo}
            onChange={(e) => setCantidadMarzo(e.target.value)}
            placeholder="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Cantidad Agosto */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cantidad Agosto
          </label>
          <input
            type="number"
            min="0"
            value={cantidadAgosto}
            onChange={(e) => setCantidadAgosto(e.target.value)}
            placeholder="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Información del artículo seleccionado */}
      {articuloActual && (
        <div className="bg-gray-50 p-4 rounded-md">
          <h4 className="font-medium text-gray-800 mb-2">Artículo Seleccionado:</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium">Código:</span> {articuloActual.codigo}
            </div>
            <div>
              <span className="font-medium">Nombre:</span> {articuloActual.nombre}
            </div>
            <div>
              <span className="font-medium">Precio Base:</span> S/. {articuloActual.precio.toFixed(2)}
            </div>
          </div>
        </div>
      )}

      {/* Botón agregar */}
      <div className="flex justify-end">
        <button
          onClick={handleAgregar}
          disabled={!articuloSeleccionado}
          className="px-6 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          Agregar Artículo
        </button>
      </div>
    </div>
  )
}

export default ArticuloSelector