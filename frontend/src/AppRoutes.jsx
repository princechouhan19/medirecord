import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './features/auth/hooks/useAuth'
import MainLayout from './components/Layout/MainLayout'

import LoginPage from './features/auth/pages/LoginPage'
import LandingPage from './features/landing/pages/LandingPage'
import AdminDashboardPage from './features/admin/pages/AdminDashboardPage'
import AdminClinicsPage   from './features/admin/pages/AdminClinicsPage'
import AdminUsersPage     from './features/admin/pages/AdminUsersPage'
import ClinicDashboardPage from './features/clinic/pages/ClinicDashboardPage'
import ClinicStaffPage    from './features/clinic/pages/ClinicStaffPage'
import ClinicSettingsPage from './features/clinic/pages/ClinicSettingsPage'
import ClinicPatientsPage from './features/clinic/pages/ClinicPatientsPage'
import ClinicActivityPage from './features/clinic/pages/ClinicActivityPage'
import TestFeesPage       from './features/tests/pages/TestFeesPage'
import PndtRegisterPage   from './features/pndt/pages/PndtRegisterPage'
import BillingPage        from './features/billing/pages/BillingPage'
import ReceptionDashboard from './features/reception/pages/ReceptionDashboard'
import RegisterPatientPage from './features/reception/pages/RegisterPatientPage'
import LabDashboard       from './features/lab/pages/LabDashboard'
import LiveQueuePage      from './features/queue/pages/LiveQueuePage'
import FFormPage          from './features/fform/pages/FFormPage'
import ProfilePage        from './features/profile/pages/ProfilePage'

const HOME = { superadmin:'/admin', clinic_owner:'/clinic', receptionist:'/reception', lab_handler:'/lab', doctor:'/reception' }

function Guarded({ children, roles }) {
  const { token, user } = useAuth()
  if (!token) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user?.role)) return <Navigate to={HOME[user?.role]||'/login'} replace />
  return children
}

export default function AppRoutes() {
  const { token, user } = useAuth()
  const home = HOME[user?.role] || '/login'

  return (
    <Routes>
      <Route path="/" element={token ? <Navigate to={home} replace /> : <LandingPage />} />
      <Route path="/login" element={token ? <Navigate to={home} replace /> : <LoginPage />} />

      {/* Super Admin */}
      <Route path="/admin" element={<Guarded roles={['superadmin']}><MainLayout role="superadmin"/></Guarded>}>
        <Route index element={<AdminDashboardPage/>}/>
        <Route path="clinics" element={<AdminClinicsPage/>}/>
        <Route path="users"   element={<AdminUsersPage/>}/>
        <Route path="profile" element={<ProfilePage/>}/>
      </Route>

      {/* Clinic Owner */}
      <Route path="/clinic" element={<Guarded roles={['clinic_owner']}><MainLayout role="clinic_owner"/></Guarded>}>
        <Route index element={<ClinicDashboardPage/>}/>
        <Route path="queue"    element={<LiveQueuePage/>}/>
        <Route path="patients" element={<ClinicPatientsPage/>}/>
        <Route path="staff"    element={<ClinicStaffPage/>}/>
        <Route path="fforms"   element={<FFormPage/>}/>
        <Route path="pndt"     element={<PndtRegisterPage/>}/>
        <Route path="activity" element={<ClinicActivityPage/>}/>
        <Route path="tests"    element={<TestFeesPage/>}/>
        <Route path="bills"    element={<BillingPage/>}/>
        <Route path="settings" element={<ClinicSettingsPage/>}/>
        <Route path="profile"  element={<ProfilePage/>}/>
      </Route>

      {/* Receptionist / Doctor */}
      <Route path="/reception" element={<Guarded roles={['receptionist','doctor']}><MainLayout role="receptionist"/></Guarded>}>
        <Route index element={<ReceptionDashboard/>}/>
        <Route path="queue"    element={<LiveQueuePage/>}/>
        <Route path="register" element={<RegisterPatientPage/>}/>
        <Route path="fform"    element={<FFormPage/>}/>
        <Route path="bills"    element={<BillingPage/>}/>
        <Route path="profile"  element={<ProfilePage/>}/>
      </Route>

      {/* Lab Handler */}
      <Route path="/lab" element={<Guarded roles={['lab_handler']}><MainLayout role="lab_handler"/></Guarded>}>
        <Route index element={<LabDashboard/>}/>
        <Route path="queue"   element={<LiveQueuePage/>}/>
        <Route path="profile" element={<ProfilePage/>}/>
      </Route>

      <Route path="*" element={<Navigate to={token ? home : '/'} replace />}/>
    </Routes>
  )
}
