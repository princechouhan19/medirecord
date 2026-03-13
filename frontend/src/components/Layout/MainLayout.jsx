import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../features/auth/hooks/useAuth'
import { Activity, LayoutDashboard, Users, FileText, Clock, ClipboardList, LogOut, Menu, X, Settings, Shield } from 'lucide-react'
import './MainLayout.scss'

const STAFF_NAV = [
  { path: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
  { path: '/registration', label: 'Registration', icon: <Users size={18} /> },
  { path: '/reporting', label: 'Reporting', icon: <FileText size={18} /> },
  { path: '/tracking', label: 'Tracking', icon: <Clock size={18} /> },
  { path: '/fform', label: 'F-Form', icon: <ClipboardList size={18} /> },
]

const CLINIC_NAV = [
  { path: '/clinic', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
  { path: '/clinic/patients', label: 'Patients', icon: <Users size={18} /> },
  { path: '/clinic/staff', label: 'Staff Providers', icon: <Activity size={18} /> },
  { path: '/clinic/reports', label: 'Reporting', icon: <FileText size={18} /> },
  { path: '/clinic/tracking', label: 'Tracking', icon: <Clock size={18} /> },
  { path: '/clinic/fforms', label: 'F-Form', icon: <ClipboardList size={18} /> },
  { path: '/clinic/settings', label: 'Settings', icon: <Settings size={18} /> },
]

const ADMIN_NAV = [
  { path: '/admin', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
  { path: '/admin/clinics', label: 'Clinics', icon: <Activity size={18} /> },
  { path: '/admin/users', label: 'Users', icon: <Shield size={18} /> },
]

export default function MainLayout({ role = 'staff' }) {
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const getNavItems = () => {
    if (role === 'superadmin' || role === 'admin') return ADMIN_NAV
    if (role === 'clinic_owner') return CLINIC_NAV
    return STAFF_NAV
  }
  
  const currentNav = getNavItems()
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const initials = user?.name ? user.name.split(' ').filter(Boolean).map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U'

  return (
    <div className={`main-layout ${isMobileOpen ? 'mobile-nav-open' : ''}`}>
      {/* Mobile Overlay */}
      <div 
        className={`mobile-overlay ${isMobileOpen ? 'visible' : ''}`} 
        onClick={() => setIsMobileOpen(false)}
      />

      <aside className={`sidebar ${isMobileOpen ? 'open' : ''}`}>
        <div className="sidebar__logo">
          <img src="/logo.png" alt="MediRecord" className="logo-img" />
          <button 
            className="sidebar__close-btn" 
            onClick={() => setIsMobileOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar__nav">
          {currentNav.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setIsMobileOpen(false)}
              className={({ isActive }) => `sidebar__nav-item ${isActive ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div 
          className="sidebar__user" 
          onClick={() => {
            setIsMobileOpen(false);
            navigate(role === 'superadmin' ? '/admin/profile' : role === 'clinic_owner' ? '/clinic/profile' : '/profile');
          }}
          style={{ cursor: 'pointer' }}
          title="Click to view Profile"
        >
          <div className="user-avatar">
            {user?.profileImage
              ? <img src={user.profileImage} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
              : initials
            }
          </div>
          <div className="user-info">
            <p className="user-email">{user?.email}</p>
            <p className="user-role">{user?.role?.replace('_', ' ').toUpperCase()} Account</p>
          </div>
        </div>

        <button className="sidebar__signout" onClick={handleLogout}>
          <LogOut size={18} />
          Sign Out
        </button>
      </aside>

      <main className="main-content">
        <header className="mobile-header">
          <button 
            className="mobile-menu-btn" 
            onClick={() => setIsMobileOpen(true)}
          >
            <Menu size={24} />
          </button>
          <div className="mobile-header-logo">
            <img src="/logo.png" alt="MediRecord" className="logo-img" />
          </div>
        </header>
        <div className="content-wrapper">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
