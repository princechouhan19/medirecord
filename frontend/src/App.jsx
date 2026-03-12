import { BrowserRouter } from 'react-router-dom'
import AppRoutes from './AppRoutes'
import { AuthProvider } from './features/auth/hooks/useAuth'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
