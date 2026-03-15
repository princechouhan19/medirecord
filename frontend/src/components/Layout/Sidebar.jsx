import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../features/auth/hooks/useAuth'
import './Sidebar.scss'

const NAV = {
  superadmin: [
    { path:'/admin',           label:'Dashboard',    icon:'grid',     end:true },
    { path:'/admin/clinics',   label:'Clinics',      icon:'hospital' },
    { path:'/admin/users',     label:'All Users',    icon:'users' },
    { path:'/admin/profile',   label:'Profile',      icon:'person' },
  ],
  clinic_owner: [
    { path:'/clinic',          label:'Overview',     icon:'grid',     end:true },
    { path:'/clinic/queue',    label:'Live Queue',   icon:'queue',    live:true },
    { path:'/clinic/register', label:'Register Patient',icon:'patient' },
    { path:'/clinic/patients', label:'Patients',     icon:'patient' },
    { path:'/clinic/staff',    label:'Staff',        icon:'users' },
    { path:'/clinic/fforms',   label:'F-Forms',      icon:'fform' },
    { path:'/clinic/pndt',     label:'PNDT Register',icon:'pndt' },
    { path:'/clinic/activity', label:'Activity Log', icon:'log' },
    { path:'/clinic/tests',    label:'Test & Fees',  icon:'fee' },
    { path:'/clinic/bills',    label:'Bills',        icon:'bill' },
    { path:'/clinic/branches', label:'Branches',     icon:'branch' },
    { path:'/clinic/settings', label:'Settings',     icon:'settings' },
  ],
  receptionist: [
    { path:'/reception',           label:'Dashboard',      icon:'grid',    end:true },
    { path:'/reception/queue',     label:'Live Queue',     icon:'queue',   live:true },
    { path:'/reception/register',  label:'Register Patient',icon:'patient' },
    { path:'/reception/fform',     label:'F-Form',         icon:'fform' },
    { path:'/reception/bills',     label:'Bills',          icon:'bill' },
  ],
  lab_handler: [
    { path:'/lab',       label:'Dashboard', icon:'grid', end:true },
    { path:'/lab/queue', label:'My Queue',  icon:'queue', live:true },
  ],
  doctor: [
    { path:'/reception',       label:'Dashboard', icon:'grid', end:true },
    { path:'/reception/queue', label:'Queue',     icon:'queue' },
  ],
}

const ICONS = {
  grid:     'd="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z"',
  hospital: 'd="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22"',
  users:    'd="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"',
  patient:  'd="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4"',
  queue:    'd="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"',
  fform:    'd="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17"',
  pndt:     'd="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" /><rect x="9" y="3" width="6" height="4" rx="1"',
  log:      'd="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"',
  fee:      'd="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"',
  bill:     'd="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="12" y1="18" x2="12" y2="12" /><line x1="9" y1="15" x2="15" y2="15"',
  settings: 'd="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"',
  person:   'd="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4"',
  branch:   'd="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><path d="M9 22V12h2v10" /><path d="M13 22V12h2v10" /><line x1="12" y1="2" x2="12" y2="9"',
  logout:   'd="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12"',
}

function Icon({ name }) {
  const d = ICONS[name] || ''
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      dangerouslySetInnerHTML={{ __html: `<${d.startsWith('d=') ? 'path ' + d : d}/>` }} />
  )
}

const ROLE_META = {
  superadmin:   { label:'Super Admin',  color:'#F59E0B', bg:'#FEF3C7' },
  clinic_owner: { label:'Clinic Owner', color:'#8B5CF6', bg:'#F5F3FF' },
  receptionist: { label:'Receptionist', color:'#0EA5A0', bg:'#E6F7F7' },
  lab_handler:  { label:'Lab Handler',  color:'#3B82F6', bg:'#EFF6FF' },
  doctor:       { label:'Doctor',       color:'#10B981', bg:'#ECFDF5' },
}

export default function Sidebar({ role, mobile, onClose }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const navItems = NAV[role] || []
  const meta = ROLE_META[role] || {}

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <aside className={`sidebar${mobile ? ' sidebar--mobile' : ''}`}>
      <div className="sidebar__brand">
        <div className="sidebar__brand-logo-full">
          <img src="/logo.png" alt="MediRecord" />
        </div>
        {role === 'clinic_owner' && user?.clinic?.name && (
          <div className="sidebar__clinic-tag">{user.clinic.name}</div>
        )}
        {mobile && (
          <button className="sidebar__close" onClick={onClose}>✕</button>
        )}
      </div>

      <div className="sidebar__role" style={{ background: meta.bg, color: meta.color }}>
        {meta.label}
      </div>

      <nav className="sidebar__nav">
        {navItems.map(({ path, label, icon, live, end }) => (
          <NavLink key={path} to={path} end={end}
            className={({ isActive }) => `sidebar__link${isActive ? ' sidebar__link--active' : ''}`}
            onClick={mobile ? onClose : undefined}>
            <span className="sidebar__link-icon">
              <Icon name={icon} />
            </span>
            <span>{label}</span>
            {live && <span className="sidebar__live-dot" />}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar__footer">
        <div className="sidebar__user">
          {user?.profileImage ? (
            <img src={user.profileImage} alt="" className="sidebar__avatar sidebar__avatar--img" />
          ) : (
            <div className="sidebar__avatar">{user?.name?.[0]?.toUpperCase()}</div>
          )}
          <div className="sidebar__user-info">
            <div className="sidebar__user-name">{user?.name}</div>
            <div className="sidebar__user-email">{user?.email}</div>
          </div>
        </div>
        <button className="sidebar__logout" onClick={handleLogout}>
          <Icon name="logout" /> Sign Out
        </button>
      </div>
    </aside>
  )
}
