import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export const useSupabase = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Cargar todos los materiales
  const cargarMateriales = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('materiales')
        .select('*')
        .order('nombre')
      
      if (error) throw error
      return data
    } catch (err) {
      setError(err.message)
      return []
    } finally {
      setLoading(false)
    }
  }

  // Agregar nuevo material
  const agregarMaterial = async (codigo, nombre, precio) => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('materiales')
        .insert([{ codigo, nombre, precio: parseFloat(precio) }])
        .select()
      
      if (error) throw error
      return data[0]
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Editar material existente
  const editarMaterial = async (id, codigo, nombre, precio) => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('materiales')
        .update({ codigo, nombre, precio: parseFloat(precio) })
        .eq('id', id)
        .select()
      
      if (error) throw error
      return data[0]
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Eliminar material
  const eliminarMaterial = async (id) => {
    try {
      setLoading(true)
      const { error } = await supabase
        .from('materiales')
        .delete()
        .eq('id', id)
      
      if (error) throw error
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Cargar presupuesto con artículos
  const cargarPresupuesto = async (presupuestoId = 1) => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('presupuesto_articulos')
        .select(`
          *,
          materiales (codigo, nombre, precio)
        `)
        .eq('presupuesto_id', presupuestoId)
      
      if (error) throw error
      return data
    } catch (err) {
      setError(err.message)
      return []
    } finally {
      setLoading(false)
    }
  }

  // Guardar artículo en presupuesto
  const guardarArticuloPresupuesto = async (presupuestoId, materialId, cantidadMarzo, cantidadAgosto, precioPresupuesto) => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('presupuesto_articulos')
        .insert([{
          presupuesto_id: presupuestoId,
          material_id: materialId,
          cantidad_marzo: cantidadMarzo,
          cantidad_agosto: cantidadAgosto,
          precio_presupuesto: precioPresupuesto
        }])
        .select(`
          *,
          materiales (codigo, nombre, precio)
        `)
      
      if (error) throw error
      return data[0]
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Actualizar artículo en presupuesto
  const actualizarArticuloPresupuesto = async (id, campo, valor) => {
    try {
      setLoading(true)
      let updateData = {}
      
      if (campo === 'cantidadMarzo') updateData.cantidad_marzo = parseInt(valor) || 0
      if (campo === 'cantidadAgosto') updateData.cantidad_agosto = parseInt(valor) || 0
      if (campo === 'precioPresupuesto') updateData.precio_presupuesto = parseFloat(valor) || 0
      
      const { data, error } = await supabase
        .from('presupuesto_articulos')
        .update(updateData)
        .eq('id', id)
        .select(`
          *,
          materiales (codigo, nombre, precio)
        `)
      
      if (error) throw error
      return data[0]
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Eliminar artículo del presupuesto
  const eliminarArticuloPresupuesto = async (id) => {
    try {
      setLoading(true)
      const { error } = await supabase
        .from('presupuesto_articulos')
        .delete()
        .eq('id', id)
      
      if (error) throw error
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Cargar valores de partidas
  const cargarValoresPartidas = async (presupuestoId = 1) => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('partida_valores')
        .select('*')
        .eq('presupuesto_id', presupuestoId)
      
      if (error) throw error
      return data
    } catch (err) {
      setError(err.message)
      return []
    } finally {
      setLoading(false)
    }
  }

  // Guardar valor de partida
  const guardarValorPartida = async (presupuestoId, codigoPartida, mes, valor) => {
    try {
      setLoading(true)
      
      // Primero verificar si ya existe
      const { data: existing, error: selectError } = await supabase
        .from('partida_valores')
        .select('id')
        .eq('presupuesto_id', presupuestoId)
        .eq('codigo_partida', codigoPartida)
        .eq('mes', mes)
        .single()
      
      if (selectError && selectError.code !== 'PGRST116') {
        throw selectError
      }
      
      let result
      if (existing) {
        // Si existe, actualizar
        result = await supabase
          .from('partida_valores')
          .update({ valor: parseFloat(valor) || 0 })
          .eq('presupuesto_id', presupuestoId)
          .eq('codigo_partida', codigoPartida)
          .eq('mes', mes)
      } else {
        // Si no existe, insertar
        result = await supabase
          .from('partida_valores')
          .insert({
            presupuesto_id: presupuestoId,
            codigo_partida: codigoPartida,
            mes: mes,
            valor: parseFloat(valor) || 0
          })
      }
      
      if (result.error) throw result.error
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    error,
    cargarMateriales,
    agregarMaterial,
    editarMaterial,
    eliminarMaterial,
    cargarPresupuesto,
    guardarArticuloPresupuesto,
    actualizarArticuloPresupuesto,
    eliminarArticuloPresupuesto,
    cargarValoresPartidas,
    guardarValorPartida
  }
}