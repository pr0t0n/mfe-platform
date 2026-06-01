import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore'
import Sidebar from '../components/Sidebar'

export default function DashboardLayout() {
  const { isAuthenticated } = useAuthStore()
  if (!isAuthenticated) return <Navigate to="/login" replace />

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 ml-60 flex flex-col min-h-screen overflow-hidden">
        <Outlet />
      </main>
    </div>
  )
}
