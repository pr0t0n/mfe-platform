import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Portal from './pages/Portal'
import AppViewer from './pages/AppViewer'
import Profile from './pages/Profile'
import AdminApps from './pages/admin/Apps'
import AdminCategories from './pages/admin/Categories'
import AdminUsers from './pages/admin/Users'
import AdminPermissions from './pages/admin/Permissions'
import AdminRequests from './pages/admin/Requests'
import DashboardLayout from './layouts/DashboardLayout'
import AdminLayout from './layouts/AdminLayout'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<DashboardLayout />}>
          <Route path="/portal" element={<Portal />} />
          <Route path="/app/:appId" element={<AppViewer />} />
          <Route path="/profile" element={<Profile />} />
          <Route element={<AdminLayout />}>
            <Route path="/admin/apps" element={<AdminApps />} />
            <Route path="/admin/categories" element={<AdminCategories />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/permissions" element={<AdminPermissions />} />
            <Route path="/admin/requests" element={<AdminRequests />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/portal" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
