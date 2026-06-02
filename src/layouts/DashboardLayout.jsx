import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore'
import Sidebar from '../components/Sidebar'

export default function DashboardLayout() {
  const { isAuthenticated, logout } = useAuthStore()

  // Garante que o JWT token existe — se não, força novo login
  const hasToken = !!localStorage.getItem('cyberops-token')

  if (!isAuthenticated || !hasToken) {
    logout()
    return <Navigate to="/login" replace />
  }

  return (
    <div className="flex min-h-screen" style={{ background: '#fcfbf8' }}>
      <Sidebar />
      <main className="flex-1 flex flex-col min-h-screen overflow-hidden" style={{ marginLeft: '260px' }}>
        <Outlet />
      </main>
    </div>
  )
}
