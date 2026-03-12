import { useState, useEffect, useRef } from "react"
import { Link } from "react-router-dom"
import { gsap } from "gsap"
import { useAuth } from "../../auth/hooks/useAuth"
import api from "../../../services/api"
import "../styles/clinic.scss"

export default function ClinicDashboardPage() {
  const { user } = useAuth()
  const [clinic, setClinic] = useState(null)
  const [patients, setPatients] = useState([])
  const [patientStats, setPatientStats] = useState({ total: 0, thisWeek: 0 })
  const [reportCount, setReportCount] = useState(0)
  const [schedule, setSchedule] = useState({ upcoming: 0, overdue: 0 })
  const [staff, setStaff] = useState([])
  const headerRef = useRef(null)

  useEffect(() => {
    gsap.fromTo(headerRef.current, { y: -20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6 })
    gsap.fromTo(".clinic-stat", { y: 30, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.1, delay: 0.2 })

    Promise.all([
      api.get("/clinics/my/clinic"),
      api.get("/patients?limit=5"),
      api.get("/patients/stats"),
      api.get("/reports/count"),
      api.get("/tracking/stats"),
      api.get("/clinics/my/staff"),
    ]).then(([cl, p, ps, r, s, st]) => {
      setClinic(cl.data.clinic)
      setPatients(p.data.patients?.slice(0, 5) || [])
      setPatientStats(ps.data)
      setReportCount(r.data.count)
      setSchedule(s.data)
      setStaff(st.data.staff || [])
    }).catch(console.error)
  }, [])

  const now = new Date()
  const dateStr = now.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })

  return (
    <div className="clinic-page">
      <div className="clinic-header" ref={headerRef}>
        <div>
          <div className="clinic-header__greeting">Welcome back, {user?.name}</div>
          <h1>{clinic?.name || "My Clinic"}</h1>
          <p className="clinic-header__sub">{dateStr}</p>
        </div>
        <div className="clinic-header__badge">
          <span className={`badge badge--${clinic?.plan === "enterprise" ? "warning" : "primary"}`}>
            {clinic?.plan?.toUpperCase() || "BASIC"} Plan
          </span>
          <span className={`badge badge--${clinic?.isActive ? "success" : "danger"}`}>
            {clinic?.isActive ? "Active" : "Suspended"}
          </span>
        </div>
      </div>

      <div className="clinic-stats">
        {[
          { label: "Total Patients", value: patientStats.total, sub: `+${patientStats.thisWeek} this week`, link: "/clinic/patients" },
          { label: "Reports", value: reportCount, sub: "Generated", link: "/clinic/reports" },
          { label: "Upcoming Visits", value: schedule.upcoming, sub: "Next 7 days", link: "/clinic/tracking" },
          { label: "Overdue Visits", value: schedule.overdue, sub: "Need attention", link: "/clinic/tracking", alert: true },
          { label: "Staff Members", value: staff.length, sub: "Active users", link: "/clinic/staff" },
        ].map((s) => (
          <Link to={s.link} key={s.label} className={`clinic-stat ${s.alert ? "clinic-stat--alert" : ""}`}>
            <div className="clinic-stat__value">{s.value}</div>
            <div className="clinic-stat__label">{s.label}</div>
            <div className="clinic-stat__sub">{s.sub}</div>
          </Link>
        ))}
      </div>

      <div className="clinic-panels">
        <div className="card clinic-panel">
          <div className="panel-header">
            <h3>Recent Patients</h3>
            <Link to="/clinic/patients" className="panel-link">View all →</Link>
          </div>
          <div className="patient-list">
            {patients.map(p => (
              <div key={p._id} className="patient-row">
                <div className="patient-row__avatar">{p.name[0]}</div>
                <div className="patient-row__info">
                  <span className="patient-row__name">{p.name}</span>
                  <span className="patient-row__meta">{p.gender}, {p.age} yrs — {p.testType}</span>
                </div>
                <span className="patient-row__phone">{p.phone}</span>
              </div>
            ))}
            {patients.length === 0 && <p className="empty-state">No patients yet</p>}
          </div>
        </div>

        <div className="card clinic-panel">
          <div className="panel-header">
            <h3>Staff Members</h3>
            <Link to="/clinic/staff" className="panel-link">Manage →</Link>
          </div>
          <div className="staff-list">
            {staff.map(s => (
              <div key={s._id} className="staff-row">
                <div className="patient-row__avatar" style={{background: "#EDE9FE", color: "#7C3AED"}}>{s.name[0]}</div>
                <div className="patient-row__info">
                  <span className="patient-row__name">{s.name}</span>
                  <span className="patient-row__meta">{s.email}</span>
                </div>
                <span className={`badge badge--${s.isActive ? "success" : "danger"}`}>{s.role}</span>
              </div>
            ))}
            {staff.length === 0 && <p className="empty-state">No staff added yet. <Link to="/clinic/staff">Add staff →</Link></p>}
          </div>
        </div>
      </div>
    </div>
  )
}
