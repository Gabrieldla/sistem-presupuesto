import { AuthProvider } from './hooks/useAuth.jsx'
import ProtectedRoute from './components/ProtectedRoute'
import BudgetSystem from './components/BudgetSystem'

function App() {
  return (
    <AuthProvider>
      <ProtectedRoute>
        <BudgetSystem />
      </ProtectedRoute>
    </AuthProvider>
  )
}

export default App
