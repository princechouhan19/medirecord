import { useState, useEffect } from "react"
import api from "../../../services/api"
import "../styles/clinic.scss"

const ROLES = ["staff", "doctor"]
const defaultForm = { name: "", email: "", password: "", role: "staff", phone: "" }

export default function ClinicStaffPage() {
  const [staff, setStaff] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(defaultForm)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => { fetchStaff() }, [])

  const fetchStaff = async () => {
    const res = await api.get("/clinics/my/staff")
    setStaff(res.data.staff || [])
  }

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(""); setLoading(true)
    try {
      await api.post("/clinics/my/staff", form)
      setShowModal(false); setForm(defaultForm); fetchStaff()
    } catch (err) { setError(err.response?.data?.error || "Failed") }
    finally { setLoading(false) }
  }

  const handleToggle = async (userId) => {
    await api.patch(`/clinics/my/staff/${userId}/toggle`)
    fetchStaff()
  }

  const f = (key) => ({ value: form[key], onChange: e => setForm({ ...form, [key]: e.target.value }) })

  return (
    <div className="clinic-page">
      <div className="clinic-header">
        <div><h1>Staff Management</h1><p>Manage your clinic team members</p></div>
        <button className="btn btn--primary" onClick={() => setShowModal(true)}>+ Add Staff</button>
      </div>

      <div className="staff-grid">
        {staff.map(s => (
          <div key={s._id} className={`card staff-card ${!s.isActive ? "staff-card--inactive" : ""}`}>
            <div className="staff-card__header">
              <div className="staff-avatar" style={{background: s.role === "doctor" ? "#EDE9FE" : "var(--primary-light)", color: s.role === "doctor" ? "#7C3AED" : "var(--primary-dark)"}}>
                {s.name[0].toUpperCase()}
              </div>
              <div className="staff-card__info">
                <div className="staff-card__name">{s.name}</div>
                <div className="staff-card__email">{s.email}</div>
              </div>
            </div>
            <div className="staff-card__meta">
              <span className={`badge badge--${s.role === "doctor" ? "purple" : "primary"}`}>{s.role.charAt(0).toUpperCase() + s.role.slice(1)}</span>
              <span className={`badge badge--${s.isActive ? "success" : "danger"}`}>{s.isActive ? "Active" : "Inactive"}</span>
            </div>
            {s.phone && <div className="staff-card__phone">{s.phone}</div>}
            <div className="staff-card__footer">
              <span className="td-muted" style={{fontSize: "11px"}}>Added {new Date(s.createdAt).toLocaleDateString("en-IN")}</span>
              {s.role !== "clinic_owner" && (
                <button className={`btn btn--sm btn--${s.isActive ? "danger" : "outline"}`} onClick={() => handleToggle(s._id)}>
                  {s.isActive ? "Deactivate" : "Activate"}
                </button>
              )}
            </div>
          </div>
        ))}
        {staff.length === 0 && <div className="clinic-empty">No staff members yet. Add your first team member!</div>}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal__header">
              <h2>Add Staff Member</h2>
              <button className="modal__close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            {error && <div className="auth-error" style={{margin: "0 24px"}}>{error}</div>}
            <form onSubmit={handleSubmit} className="modal__form">
              <div className="form-grid-2">
                <div className="form-group"><label>Full Name *</label><input {...f("name")} required /></div>
                <div className="form-group"><label>Email *</label><input type="email" {...f("email")} required /></div>
                <div className="form-group"><label>Password *</label><input type="password" {...f("password")} required minLength={6} /></div>
                <div className="form-group"><label>Role *</label>
                  <select {...f("role")}>{ROLES.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}</select>
                </div>
                <div className="form-group"><label>Phone</label><input {...f("phone")} /></div>
              </div>
              <div className="modal__footer">
                <button type="button" className="btn btn--outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn--primary" disabled={loading}>{loading ? "Adding..." : "Add Staff"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
