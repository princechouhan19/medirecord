import { NavLink } from 'react-router-dom'

const NAV_ITEMS = {
  superadmin:   [
    { path:'/admin',         icon:'grid',    label:'Home' },
    { path:'/admin/clinics', icon:'hospital',label:'Clinics' },
    { path:'/admin/users',   icon:'users',   label:'Users' },
  ],
  clinic_owner: [
    { path:'/clinic',        icon:'grid',    label:'Home' },
    { path:'/clinic/queue',  icon:'queue',   label:'Queue' },
    { path:'/clinic/patients',icon:'patient',label:'Patients' },
    { path:'/clinic/staff',  icon:'users',   label:'Staff' },
    { path:'/clinic/settings',icon:'settings',label:'Settings' },
  ],
  receptionist: [
    { path:'/reception',          icon:'grid',   label:'Home' },
    { path:'/reception/queue',    icon:'queue',  label:'Queue' },
    { path:'/reception/register', icon:'patient',label:'Register' },
    { path:'/reception/fform',    icon:'fform',  label:'F-Form' },
  ],
  lab_handler:  [
    { path:'/lab',       icon:'grid',  label:'Home' },
    { path:'/lab/queue', icon:'queue', label:'Queue' },
  ],
  doctor:       [
    { path:'/reception',       icon:'grid',    label:'Home' },
    { path:'/reception/queue', icon:'queue',   label:'Queue' },
  ],
}

const ICON_PATH = {
  grid:     <><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></>,
  hospital: <><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></>,
  users:    <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></>,
  patient:  <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></>,
  queue:    <><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></>,
  fform:    <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></>,
  settings: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></>,
}

function Icon({ name }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
      {ICON_PATH[name]}
    </svg>
  )
}

export default function MobileNav({ role }) {
  const items = NAV_ITEMS[role] || []
  if (!items.length) return null

  return (
    <nav className="mobile-nav">
      {items.map(item => (
        <NavLink key={item.path} to={item.path} end={item.path.split('/').length <= 2}
          className={({ isActive }) => `mobile-nav__item${isActive ? ' mobile-nav__item--active' : ''}`}>
          <Icon name={item.icon} />
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
