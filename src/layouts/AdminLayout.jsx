import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore'

export default function AdminLayout() {
  const { currentUser } = useAuthStore()
  if (currentUser?.role !== 'admin') return <Navigate to="/portal" replace />
  return <Outlet />
}
