import { AuthProvider } from '../features/auth/AuthContext'
import { AppRoutes } from './routes'

const App = () => (
  <AuthProvider>
    <AppRoutes />
  </AuthProvider>
)

export default App
