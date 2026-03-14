import { useAuth } from '../../features/auth/hooks/useAuth'
import './MobileTopbar.scss'

const ROLE_LABEL = { superadmin:'Super Admin', clinic_owner:'Clinic Owner', receptionist:'Receptionist', lab_handler:'Lab Handler', doctor:'Doctor' }

export default function MobileTopbar({ onMenuClick, role }) {
  const { user } = useAuth()
  return (
    <header className="mobile-topbar">
      <button className="mobile-topbar__menu" onClick={onMenuClick} aria-label="Menu">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="22" height="22">
          <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
        </svg>
      </button>

      <div className="mobile-topbar__brand">
        <img src="/logo.png" alt="MediRecord" style={{height:30,objectFit:'contain',maxWidth:160}} />
      </div>

      <div className="mobile-topbar__user">
        <div className="mobile-topbar__avatar">{user?.name?.[0]?.toUpperCase()}</div>
      </div>
    </header>
  )
}
