import { useState, useEffect, createContext, useContext } from 'react'
import { supabase } from '../lib/supabase'

// Crear contexto de autenticación
const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Obtener sesión inicial
    getInitialSession()

    // Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user)
        await checkAdminStatus(session.user.email)
      } else {
        setUser(null)
        setIsAdmin(false)
      }
      setLoading(false)
    })

    return () => {
      subscription?.unsubscribe()
    }
  }, [])

  const getInitialSession = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error) throw error

      if (session?.user) {
        setUser(session.user)
        await checkAdminStatus(session.user.email)
      }
    } catch (error) {
      console.error('Error getting initial session:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const checkAdminStatus = async (email) => {
    // Si el usuario está autenticado, automáticamente es admin
    setIsAdmin(true)
  }

  const signIn = async (email, password) => {
    try {
      setError(null)
      setLoading(true)

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error

      return { success: true, data }
    } catch (error) {
      console.error('Error signing in:', error)
      setError(error.message)
      return { success: false, error: error.message }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      setError(null)
      const { error } = await supabase.auth.signOut()
      if (error) throw error

      setUser(null)
      setIsAdmin(false)
      return { success: true }
    } catch (error) {
      console.error('Error signing out:', error)
      setError(error.message)
      return { success: false, error: error.message }
    }
  }

  const value = {
    user,
    isAdmin,
    loading,
    error,
    signIn,
    signOut
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}