import { NavLink, useNavigate } from "react-router-dom"
import { useAuth } from "../../features/auth/hooks/useAuth"
import "./Sidebar.scss"

// Icons as inline SVG components
const Ico = ({ d, vb = "0 0 24 24", fill = "none", sw = "2" }) => (
  <svg viewBox={vb} fill={fill} stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
    {Array.isArray(d) ? d.map((p,i) => typeof p === 'string' ? <path key={i} d={p} /> : <circle key={i} {...p} />) : <path d={d} />}
  </svg>
)

const NAV = {
  superadmin: [
    { path:"/admin",           label:"Dashboard",   icon:"grid" },
    { path:"/admin/clinics",   label:"Clinics",     icon:"hospital" },
    { path:"/admin/users",     label:"All Users",   icon:"users" },
  ],
  clinic_owner: [
    { path:"/clinic",          label:"Overview",    icon:"grid" },
    { path:"/clinic/queue",    label:"Live Queue",  icon:"queue", badge:"live" },
    { path:"/clinic/patients", label:"Patients",    icon:"patient" },
    { path:"/clinic/staff",    label:"Staff",       icon:"users" },
    { path:"/clinic/fforms",   label:"F-Forms",     icon:"fform" },
    { path:"/clinic/pndt",     label:"PNDT Register",icon:"pndt" },
    { path:"/clinic/activity", label:"Activity Log",icon:"log" },
    { path:"/clinic/tests",    label:"Test & Fees", icon:"fee" },
    { path:"/clinic/settings", label:"Settings",    icon:"settings" },
  ],
  receptionist: [
    { path:"/reception",       label:"Dashboard",   icon:"grid" },
    { path:"/reception/queue", label:"Live Queue",  icon:"queue", badge:"live" },
    { path:"/reception/register", label:"Register Patient", icon:"patient" },
    { path:"/reception/fform", label:"F-Form",      icon:"fform" },
  ],
  lab_handler: [
    { path:"/lab",             label:"Dashboard",   icon:"grid" },
    { path:"/lab/queue",       label:"My Queue",    icon:"queue", badge:"live" },
  ],
  doctor: [
    { path:"/doctor",          label:"Dashboard",   icon:"grid" },
    { path:"/doctor/patients", label:"Referred",    icon:"patient" },
  ],
}

const ICONS = {
  grid:     <Ico d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z" />,
  hospital: <Ico d={["M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z","M9 22V12h6v10"]} />,
  users:    <Ico d={["M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2","M23 21v-2a4 4 0 0 0-3-3.87","M16 3.13a4 4 0 0 1 0 7.75"]} />,
  patient:  <Ico d={["M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"]} />,
  queue:    <Ico d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />,
  fform:    <Ico d={["M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z","M14 2v6h6","M16 13H8","M16 17H8","M10 9H8"]} />,
  pndt:     <Ico d={["M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2","M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2","M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2","M12 12h4","M12 16h4","M8 12h.01","M8 16h.01"]} />,
  log:      <Ico d={["M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"]} />,
  fee:      <Ico d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />,
  settings: <Ico d={["M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z","M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"]} />,
  logout:   <Ico d={["M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4","M16 17l5-5-5-5","M21 12H9"]} />,
}

const ROLE_META = {
  superadmin:    { label: "Super Admin",   color: "#F59E0B", bg: "#FEF3C7" },
  clinic_owner:  { label: "Clinic Owner",  color: "#8B5CF6", bg: "#F5F3FF" },
  receptionist:  { label: "Receptionist",  color: "#0EA5A0", bg: "#E6F7F7" },
  lab_handler:   { label: "Lab Handler",   color: "#3B82F6", bg: "#EFF6FF" },
  doctor:        { label: "Doctor",        color: "#10B981", bg: "#ECFDF5" },
}

export default function Sidebar({ role }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const navItems = NAV[role] || []
  const meta = ROLE_META[role] || {}

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar__brand">
        <div className="sidebar__brand-mark">
          <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
          </svg>
        </div>
        <div>
          <div className="sidebar__brand-name">Medi<span>Record</span></div>
          {role === 'clinic_owner' && user?.clinic?.name && (
            <div className="sidebar__clinic">{user.clinic.name}</div>
          )}
        </div>
      </div>

      {/* Role Badge */}
      <div className="sidebar__role" style={{ background: meta.bg, color: meta.color }}>
        {meta.label}
      </div>

      {/* Navigation */}
      <nav className="sidebar__nav">
        {navItems.map(({ path, label, icon, badge, end }) => (
          <NavLink
            key={path} to={path} end={end || path.split('/').length <= 2}
            className={({ isActive }) => `sidebar__link${isActive ? " sidebar__link--active" : ""}`}
          >
            <span className="sidebar__link-icon">{ICONS[icon]}</span>
            <span>{label}</span>
            {badge === "live" && <span className="sidebar__live-dot" />}
          </NavLink>
        ))}
      </nav>

      {/* User footer */}
      <div className="sidebar__footer">
        <div className="sidebar__user">
          <div className="sidebar__avatar">{user?.name?.[0]?.toUpperCase()}</div>
          <div className="sidebar__user-info">
            <div className="sidebar__user-name">{user?.name}</div>
            <div className="sidebar__user-email">{user?.email}</div>
          </div>
        </div>
        <button className="sidebar__logout" onClick={() => { logout(); navigate("/login") }}>
          {ICONS.logout} Sign Out
        </button>
      </div>
    </aside>
  )
}
