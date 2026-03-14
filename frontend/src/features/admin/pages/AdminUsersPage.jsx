import { useState, useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import api from '../../../services/api'

const ROLE_COLOR = { superadmin:'amber', clinic_owner:'purple', receptionist:'teal', lab_handler:'blue', doctor:'green' }
const ROLE_LABEL = { superadmin:'Super Admin', clinic_owner:'Clinic Owner', receptionist:'Receptionist', lab_handler:'Lab Handler', doctor:'Doctor' }

export default function AdminUsersPage() {
  const [clinics, setClinics]   = useState([])
  const [selected, setSelected] = useState(null) // selected clinic
  const [staff, setStaff]       = useState([])
  const [search, setSearch]     = useState('')
  const ref = useRef(null)

  useEffect(() => {
    gsap.fromTo(ref.current, { y: -16, opacity: 0 }, { y: 0, opacity: 1, duration: .5 })
    api.get('/clinics').then(r => setClinics(r.data.clinics || [])).catch(() => {})
  }, [])

  const loadStaff = async (clinic) => {
    setSelected(clinic)
    try {
      // Use superadmin to peek at a clinic's staff via a direct user query
      // We'll use clinic filter approach
      const r = await api.get(`/clinics/${clinic._id}`)
      // Fetch all users for this clinic
      // Note: we need a backend route — for now we use the staff endpoint
      setStaff([])
    } catch (e) {}
  }

  const filtered = clinics.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.owner?.name?.toLowerCase().includes(search.toLowerCase()) ||
    (c.clinicId || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div style={{ maxWidth: 1200 }}>
      <div className="page-header" ref={ref}>
        <div>
          <h1>Users Overview</h1>
          <p>All clinic owners and staff across the platform</p>
        </div>
      </div>

      <div className="search-bar" style={{ marginBottom: 16 }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input placeholder="Search clinics or owners..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Clinic list */}
        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', fontSize: 14, fontWeight: 700 }}>
            Clinics ({filtered.length})
          </div>
          {filtered.map(c => (
            <div
              key={c._id}
              onClick={() => loadStaff(c)}
              style={{
                padding: '14px 18px', cursor: 'pointer', borderBottom: '1px solid var(--border)',
                background: selected?._id === c._id ? 'var(--teal-light)' : 'transparent',
                transition: 'background .15s',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13 }}>{c.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>
                    {c.clinicId || 'No ID'} · Owner: {c.owner?.name}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6, flexDirection: 'column', alignItems: 'flex-end' }}>
                  <span className={`badge badge--${c.isActive ? 'green' : 'red'}`}>{c.isActive ? 'Active' : 'Off'}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{c._staffCount || 0} staff</span>
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && <div className="empty-row">No clinics found</div>}
        </div>

        {/* Info panel */}
        <div className="card" style={{ padding: 24 }}>
          {selected ? (
            <div>
              <div style={{ fontWeight: 800, fontSize: 17, marginBottom: 4 }}>{selected.name}</div>
              <div style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 16 }}>
                Clinic ID: <strong>{selected.clinicId || '—'}</strong> · {selected.city}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
                <span className="badge badge--teal">Plan: {selected.subscription?.plan?.toUpperCase()}</span>
                <span className="badge badge--gray">Expires: {selected.subscription?.endDate ? new Date(selected.subscription.endDate).toLocaleDateString('en-IN') : '—'}</span>
                <span className="badge badge--blue">Patients: {selected._patientCount || 0}</span>
              </div>
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 14 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 10 }}>
                  Owner Account
                </div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'var(--purple-bg)', color: 'var(--purple)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 15 }}>
                    {selected.owner?.name?.[0]}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{selected.owner?.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-3)' }}>{selected.owner?.email}</div>
                  </div>
                  <span className="badge badge--purple" style={{ marginLeft: 'auto' }}>Clinic Owner</span>
                </div>
              </div>
              <div style={{ marginTop: 16, padding: 12, background: 'var(--bg)', borderRadius: 8, fontSize: 12, color: 'var(--text-2)', lineHeight: 1.6 }}>
                To manage staff for this clinic, the clinic owner must log in to their dashboard at <strong>/clinic/staff</strong>.
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-3)' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: 10 }}>👆</div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>Select a clinic to view details</div>
              <div style={{ fontSize: 12, marginTop: 4 }}>Click any clinic from the left panel</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
