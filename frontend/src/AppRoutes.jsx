import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './features/auth/hooks/useAuth'

import LoginPage from './features/auth/pages/LoginPage'
import MainLayout from './components/Layout/MainLayout'

// Staff/Doctor pages
import DashboardPage from './features/dashboard/pages/DashboardPage'
import RegistrationPage from './features/registration/pages/RegistrationPage'
import ReportingPage from './features/reporting/pages/ReportingPage'
import TrackingPage from './features/tracking/pages/TrackingPage'
import FFormPage from './features/fform/pages/FFormPage'

// Clinic Owner pages
import ClinicDashboardPage from './features/clinic/pages/ClinicDashboardPage'
import ClinicStaffPage from './features/clinic/pages/ClinicStaffPage'
import ClinicSettingsPage from './features/clinic/pages/ClinicSettingsPage'

// SuperAdmin pages
import AdminDashboardPage from './features/admin/pages/AdminDashboardPage'
import AdminClinicsPage from './features/admin/pages/AdminClinicsPage'
import AdminUsersPage from './features/admin/pages/AdminUsersPage'

const getHomeRoute = (user) => {
  if (!user) return '/login'
  if (user.role === 'superadmin' || user.role === 'admin') return '/admin'
  if (user.role === 'clinic_owner') return '/clinic'
  return '/dashboard'
}

function ProtectedRoute({ children }) {
  const { token } = useAuth()
  return token ? children : <Navigate to="/login" replace />
}

function RoleRoute({ children, roles }) {
  const { user } = useAuth()
  if (!roles.includes(user?.role)) {
    return <Navigate to={getHomeRoute(user)} replace />
  }
  return children
}

export default function AppRoutes() {
  const { token, user } = useAuth()

  // Redirect to correct home by role
  const homeRedirect = () => getHomeRoute(user)

  return (
    <Routes>
      <Route path="/login" element={token ? <Navigate to={homeRedirect()} replace /> : <LoginPage />} />

      {/* SuperAdmin routes */}
      <Route path="/admin" element={<ProtectedRoute><RoleRoute roles={['superadmin', 'admin']}><MainLayout role="superadmin" /></RoleRoute></ProtectedRoute>}>
        <Route index element={<AdminDashboardPage />} />
        <Route path="clinics" element={<AdminClinicsPage />} />
        <Route path="users" element={<AdminUsersPage />} />
      </Route>

      {/* Clinic Owner routes */}
      <Route path="/clinic" element={<ProtectedRoute><RoleRoute roles={['clinic_owner']}><MainLayout role="clinic_owner" /></RoleRoute></ProtectedRoute>}>
        <Route index element={<ClinicDashboardPage />} />
        <Route path="patients" element={<RegistrationPage />} />
        <Route path="staff" element={<ClinicStaffPage />} />
        <Route path="reports" element={<ReportingPage />} />
        <Route path="tracking" element={<TrackingPage />} />
        <Route path="fforms" element={<FFormPage />} />
        <Route path="settings" element={<ClinicSettingsPage />} />
      </Route>

      {/* Staff routes */}
      <Route path="/" element={<ProtectedRoute><RoleRoute roles={['staff','doctor']}><MainLayout role="staff" /></RoleRoute></ProtectedRoute>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="registration" element={<RegistrationPage />} />
        <Route path="reporting" element={<ReportingPage />} />
        <Route path="tracking" element={<TrackingPage />} />
        <Route path="fform" element={<FFormPage />} />
      </Route>

      <Route path="*" element={<Navigate to={token ? homeRedirect() : '/login'} replace />} />
    </Routes>
  )
}
