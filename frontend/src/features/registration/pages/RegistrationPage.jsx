import { useState, useEffect, useRef } from "react"
import { gsap } from "gsap"
import api from "../../../services/api"
import "../styles/registration.scss"

const TEST_TYPES = ["Sonography","Blood Test","X-Ray","CT Scan","MRI","Other"]
const GENDERS = ["Male","Female","Other"]
const defaultForm = { name:"", aadhaar:"", age:"", gender:"Male", phone:"", testType:"Sonography", address:"" }

export default function RegistrationPage() {
  const [patients, setPatients] = useState([])
  const [search, setSearch] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(defaultForm)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const headerRef = useRef(null)

  useEffect(() => {
    gsap.fromTo(headerRef.current, { y: -15, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5 })
    fetchPatients()
  }, [])

  const fetchPatients = async (q = "") => {
    try {
      const res = await api.get(`/patients${q ? `?search=${q}` : ""}`)
      setPatients(res.data.patients || [])
    } catch (e) { console.error(e) }
  }

  useEffect(() => {
    const t = setTimeout(() => fetchPatients(search), 300)
    return () => clearTimeout(t)
  }, [search])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    if (form.aadhaar.length !== 12) return setError("Aadhaar must be exactly 12 digits")
    setLoading(true)
    try {
      await api.post("/patients", { ...form, age: Number(form.age) })
      setShowModal(false); setForm(defaultForm); fetchPatients()
    } catch (err) {
      setError(err.response?.data?.error || "Failed to register patient")
    } finally { setLoading(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm("Delete this patient record?")) return
    await api.delete(`/patients/${id}`)
    fetchPatients(search)
  }

  return (
    <div className="registration-page">
      <div className="page-header" ref={headerRef}>
        <div>
          <h1>Patient Registration</h1>
          <p>Register patients using Aadhaar verification</p>
        </div>
        <button className="btn btn--primary" onClick={() => setShowModal(true)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
          Register Patient
        </button>
      </div>

      <div className="search-bar">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input placeholder="Search by name, phone, or Aadhaar number..." value={search} onChange={e => setSearch(e.target.value)} />
        {search && <button onClick={() => setSearch("")} style={{background:"none",border:"none",cursor:"pointer",color:"var(--text-muted)"}}>✕</button>}
      </div>

      <div className="card table-card">
        <table className="data-table">
          <thead>
            <tr><th>NAME</th><th>AADHAAR</th><th>AGE / GENDER</th><th>PHONE</th><th>TEST TYPE</th><th>REGISTERED</th><th>ACTIONS</th></tr>
          </thead>
          <tbody>
            {patients.map(p => (
              <tr key={p._id}>
                <td>
                  <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
                    <div className="patient-row__avatar" style={{width:"32px",height:"32px",fontSize:"13px"}}>{p.name[0]}</div>
                    <span className="td-name">{p.name}</span>
                  </div>
                </td>
                <td className="td-muted">{p.aadhaar.replace(/(\d{4})(\d{4})(\d{4})/, "$1 $2 $3")}</td>
                <td>{p.age} / {p.gender}</td>
                <td>{p.phone}</td>
                <td><span className="badge badge--primary">{p.testType}</span></td>
                <td className="td-muted">{new Date(p.createdAt).toLocaleDateString("en-IN")}</td>
                <td>
                  <button className="icon-btn icon-btn--danger" onClick={() => handleDelete(p._id)} title="Delete patient">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15">
                      <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
            {patients.length === 0 && <tr><td colSpan={7} className="empty-row">{search ? "No patients match your search" : "No patients registered yet"}</td></tr>}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal__header">
              <h2>Register New Patient</h2>
              <button className="modal__close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            {error && <div className="auth-error" style={{margin:"0 24px"}}>{error}</div>}
            <form onSubmit={handleSubmit} className="modal__form">
              <div className="form-grid-2">
                <div className="form-group"><label>Full Name *</label><input value={form.name} onChange={e => setForm({...form,name:e.target.value})} required placeholder="Patient full name" /></div>
                <div className="form-group">
                  <label>Aadhaar Number *</label>
                  <input value={form.aadhaar} onChange={e => setForm({...form,aadhaar:e.target.value.replace(/\D/g,"")})} required placeholder="12-digit Aadhaar" maxLength={12} pattern="[0-9]{12}" />
                </div>
                <div className="form-group"><label>Age *</label><input type="number" value={form.age} onChange={e => setForm({...form,age:e.target.value})} required min={0} max={150} /></div>
                <div className="form-group"><label>Gender *</label><select value={form.gender} onChange={e => setForm({...form,gender:e.target.value})}>{GENDERS.map(g => <option key={g}>{g}</option>)}</select></div>
                <div className="form-group"><label>Phone *</label><input value={form.phone} onChange={e => setForm({...form,phone:e.target.value.replace(/\D/g,"")})} required placeholder="10-digit number" maxLength={10} /></div>
                <div className="form-group"><label>Test Type *</label><select value={form.testType} onChange={e => setForm({...form,testType:e.target.value})}>{TEST_TYPES.map(t => <option key={t}>{t}</option>)}</select></div>
              </div>
              <div className="form-group"><label>Address</label><input value={form.address} onChange={e => setForm({...form,address:e.target.value})} placeholder="Patient address (optional)" /></div>
              <div className="modal__footer">
                <button type="button" className="btn btn--outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn--primary" disabled={loading}>{loading ? "Saving..." : "Register Patient"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
