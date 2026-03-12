import { useState, useEffect } from "react"
import api from "../../../services/api"
import "../styles/admin.scss"

const defaultForm = {
  name: "", address: "", city: "", state: "", phone: "", email: "",
  licenseNumber: "", specialization: "", plan: "basic",
  ownerName: "", ownerEmail: "", ownerPassword: "", ownerPhone: ""
}

const PLANS = ["basic", "pro", "enterprise"]
const SPECIALIZATIONS = ["General Medicine", "Sonography", "Radiology", "Pathology", "Cardiology", "Orthopedics", "Pediatrics", "Gynecology", "Other"]

export default function AdminClinicsPage() {
  const [clinics, setClinics] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(defaultForm)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")

  useEffect(() => { fetchClinics() }, [])

  const fetchClinics = async () => {
    const res = await api.get("/clinics")
    setClinics(res.data.clinics || [])
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(""); setLoading(true)
    try {
      await api.post("/clinics", form)
      setShowModal(false); setForm(defaultForm); fetchClinics()
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create clinic")
    } finally { setLoading(false) }
  }

  const handleToggle = async (id) => {
    if (!confirm("Toggle clinic status?")) return
    await api.patch(`/clinics/${id}/toggle`)
    fetchClinics()
  }

  const filtered = clinics.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.owner?.name?.toLowerCase().includes(search.toLowerCase())
  )

  const f = (key) => ({ value: form[key], onChange: e => setForm({ ...form, [key]: e.target.value }) })

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div>
          <h1>Clinics Management</h1>
          <p>Register and manage clinic accounts</p>
        </div>
        <button className="btn btn--primary" onClick={() => setShowModal(true)}>+ Register Clinic</button>
      </div>

      <div className="search-bar">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input placeholder="Search clinics or owners..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="card table-card">
        <table className="data-table">
          <thead>
            <tr><th>CLINIC</th><th>OWNER</th><th>CONTACT</th><th>PLAN</th><th>PATIENTS</th><th>STAFF</th><th>STATUS</th><th>ACTIONS</th></tr>
          </thead>
          <tbody>
            {filtered.map(c => (
              <tr key={c._id}>
                <td>
                  <div className="clinic-cell">
                    <div className="clinic-cell__avatar">{c.name[0]}</div>
                    <div>
                      <div className="td-name">{c.name}</div>
                      <div className="td-muted">{c.city}{c.city && c.state ? ", " : ""}{c.state}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <div className="td-name">{c.owner?.name}</div>
                  <div className="td-muted">{c.owner?.email}</div>
                </td>
                <td className="td-muted">{c.phone || "—"}</td>
                <td>
                  <span className={`badge badge--${c.plan === "enterprise" ? "warning" : c.plan === "pro" ? "primary" : "default"}`}>
                    {c.plan.toUpperCase()}
                  </span>
                </td>
                <td>{c._patientCount || 0}</td>
                <td>{c._staffCount || 0}</td>
                <td>
                  <span className={`badge badge--${c.isActive ? "success" : "danger"}`}>
                    {c.isActive ? "Active" : "Suspended"}
                  </span>
                </td>
                <td>
                  <button className={`btn btn--sm btn--${c.isActive ? "danger" : "outline"}`} onClick={() => handleToggle(c._id)}>
                    {c.isActive ? "Suspend" : "Activate"}
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={8} className="empty-row">No clinics found</td></tr>}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal modal--wide">
            <div className="modal__header">
              <h2>Register New Clinic</h2>
              <button className="modal__close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            {error && <div className="auth-error" style={{margin: "0 24px 0"}}>{error}</div>}
            <form onSubmit={handleSubmit} className="modal__form">
              <div className="modal__section-title">Clinic Information</div>
              <div className="form-grid-2">
                <div className="form-group"><label>Clinic Name *</label><input {...f("name")} required placeholder="e.g. City Diagnostic Center" /></div>
                <div className="form-group"><label>Specialization</label>
                  <select {...f("specialization")}><option value="">Select specialization</option>{SPECIALIZATIONS.map(s => <option key={s}>{s}</option>)}</select>
                </div>
                <div className="form-group"><label>License Number</label><input {...f("licenseNumber")} placeholder="Medical license #" /></div>
                <div className="form-group"><label>Plan</label>
                  <select {...f("plan")}>{PLANS.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}</select>
                </div>
                <div className="form-group"><label>Phone</label><input {...f("phone")} placeholder="Clinic phone" /></div>
                <div className="form-group"><label>Email</label><input type="email" {...f("email")} placeholder="Clinic email" /></div>
                <div className="form-group"><label>City</label><input {...f("city")} placeholder="City" /></div>
                <div className="form-group"><label>State</label><input {...f("state")} placeholder="State" /></div>
              </div>
              <div className="form-group"><label>Address</label><input {...f("address")} placeholder="Full clinic address" /></div>

              <div className="modal__section-title" style={{marginTop: "20px"}}>Clinic Owner Account</div>
              <div className="form-grid-2">
                <div className="form-group"><label>Owner Name *</label><input {...f("ownerName")} required placeholder="Full name" /></div>
                <div className="form-group"><label>Owner Email *</label><input type="email" {...f("ownerEmail")} required placeholder="Login email" /></div>
                <div className="form-group"><label>Password *</label><input type="password" {...f("ownerPassword")} required placeholder="Min 6 characters" minLength={6} /></div>
                <div className="form-group"><label>Owner Phone</label><input {...f("ownerPhone")} placeholder="Phone number" /></div>
              </div>

              <div className="modal__footer">
                <button type="button" className="btn btn--outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn--primary" disabled={loading}>{loading ? "Creating..." : "Create Clinic + Owner"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
