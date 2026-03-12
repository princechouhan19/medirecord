import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../features/auth/hooks/useAuth'
import './Sidebar.scss'

const ADMIN_NAV = [
  { path: '/admin', label: 'Dashboard', icon: '⬛', end: true },
  { path: '/admin/clinics', label: 'Clinics', icon: '🏥' },
  { path: '/admin/users', label: 'Users', icon: '👥' },
]

const CLINIC_NAV = [
  { path: '/clinic', label: 'Overview', icon: '⬛', end: true },
  { path: '/clinic/patients', label: 'Patients', icon: '👤' },
  { path: '/clinic/staff', label: 'Staff', icon: '👥' },
  { path: '/clinic/reports', label: 'Reports', icon: '📄' },
  { path: '/clinic/tracking', label: 'Tracking', icon: '📅' },
  { path: '/clinic/fforms', label: 'F-Forms', icon: '📋' },
  { path: '/clinic/settings', label: 'Settings', icon: '⚙️' },
]

const STAFF_NAV = [
  { path: '/dashboard', label: 'Dashboard', icon: '⬛' },
  { path: '/registration', label: 'Registration', icon: '👤' },
  { path: '/reporting', label: 'Reporting', icon: '📄' },
  { path: '/tracking', label: 'Tracking', icon: '📅' },
  { path: '/fform', label: 'F-Form', icon: '📋' },
]

const ROLE_LABELS = {
  superadmin: 'Super Admin',
  clinic_owner: 'Clinic Owner',
  staff: 'Staff',
  doctor: 'Doctor',
}

export default function Sidebar({ role }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const navItems = role === 'superadmin' ? ADMIN_NAV : role === 'clinic_owner' ? CLINIC_NAV : STAFF_NAV

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <aside className="sidebar">
      <div className="sidebar__logo">
        <div className="sidebar__logo-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" width="18" height="18">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
          </svg>
        </div>
        <div>
          <span className="sidebar__logo-text">Medi<strong>Record</strong></span>
          {role === 'superadmin' && <div className="sidebar__role-badge sidebar__role-badge--admin">ADMIN</div>}
          {role === 'clinic_owner' && <div className="sidebar__role-badge sidebar__role-badge--owner">OWNER</div>}
        </div>
      </div>

      {role === 'clinic_owner' && user?.clinic && (
        <div className="sidebar__clinic-info">
          <div className="sidebar__clinic-name">{user.clinic?.name || 'My Clinic'}</div>
          <div className="sidebar__clinic-plan">{user.clinic?.plan?.toUpperCase() || 'BASIC'} Plan</div>
        </div>
      )}

      <nav className="sidebar__nav">
        {navItems.map(({ path, label, icon, end }) => (
          <NavLink
            key={path}
            to={path}
            end={end}
            className={({ isActive }) => `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`}
          >
            <span className="sidebar__link-icon">{icon === '⬛' ? 
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
              : icon}</span>
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar__footer">
        <div className="sidebar__user">
          <div className="sidebar__user-avatar">{user?.name?.[0]?.toUpperCase() || 'U'}</div>
          <div className="sidebar__user-info">
            <p className="sidebar__user-name">{user?.name}</p>
            <p className="sidebar__user-role">{ROLE_LABELS[user?.role] || 'Staff'}</p>
          </div>
        </div>
        <button className="sidebar__logout" onClick={handleLogout}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          Sign Out
        </button>
      </div>
    </aside>
  )
}
