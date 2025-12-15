import { useAuth } from '../hooks/useAuth.jsx'

const AdminNav = () => {
  const { user, signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={handleSignOut}
        className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2 transition-colors"
        title={`${user?.user_metadata?.full_name || 'Admin'} - ${user?.email}`}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
        <span className="font-medium">Cerrar Sesión</span>
      </button>
    </div>
  )
}

export default AdminNav