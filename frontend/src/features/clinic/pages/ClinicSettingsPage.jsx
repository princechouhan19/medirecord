import { useState, useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { useAuth } from '../../auth/hooks/useAuth'
import api from '../../../services/api'

export default function ClinicSettingsPage() {
  const { user } = useAuth()
  const [clinic, setClinic]   = useState(null)
  const [editing, setEditing] = useState(false)
  const [cForm, setCForm]     = useState({})
  const [cLoading, setCLoading] = useState(false)
  const [cMsg, setCMsg]       = useState('')
  const [passForm, setPassForm] = useState({ currentPassword: '', newPassword: '', confirm: '' })
  const [passMsg, setPassMsg] = useState('')
  const [passErr, setPassErr] = useState('')
  const [passLoading, setPassLoading] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    gsap.fromTo(ref.current, { y: -16, opacity: 0 }, { y: 0, opacity: 1, duration: .5 })
    api.get('/clinics/my/clinic').then(r => {
      setClinic(r.data.clinic)
      setCForm({
        name: r.data.clinic.name,
        phone: r.data.clinic.phone,
        email: r.data.clinic.email,
        address: r.data.clinic.address,
        city: r.data.clinic.city,
        state: r.data.clinic.state,
        licenseNumber: r.data.clinic.licenseNumber,
        pndtRegNo: r.data.clinic.pndtRegNo || '',
        specialization: r.data.clinic.specialization,
      })
    }).catch(() => {})
  }, [])

  const handleSaveClinic = async () => {
    setCLoading(true); setCMsg('')
    try {
      const r = await api.patch('/clinics/my/clinic', cForm)
      setClinic(r.data.clinic)
      setEditing(false)
      setCMsg('Clinic details updated!')
      setTimeout(() => setCMsg(''), 3000)
    } catch (e) { setCMsg(e.response?.data?.error || 'Failed to save') }
    finally { setCLoading(false) }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    setPassErr(''); setPassMsg('')
    if (passForm.newPassword !== passForm.confirm) return setPassErr('Passwords do not match')
    if (passForm.newPassword.length < 6) return setPassErr('Password must be at least 6 characters')
    setPassLoading(true)
    try {
      await api.patch('/auth/change-password', { currentPassword: passForm.currentPassword, newPassword: passForm.newPassword })
      setPassMsg('Password updated successfully!')
      setPassForm({ currentPassword: '', newPassword: '', confirm: '' })
      setTimeout(() => setPassMsg(''), 3000)
    } catch (e) { setPassErr(e.response?.data?.error || 'Failed') }
    finally { setPassLoading(false) }
  }

  const cf = k => ({ value: cForm[k] || '', onChange: e => setCForm({ ...cForm, [k]: e.target.value }) })
  const pf = k => ({ value: passForm[k], onChange: e => setPassForm({ ...passForm, [k]: e.target.value }) })

  return (
    <div style={{ maxWidth: 860 }}>
      <div className="page-header" ref={ref}>
        <div><h1>Settings</h1><p>Clinic profile and account management</p></div>
      </div>

      {cMsg && <div className="alert alert--success" style={{ marginBottom: 16 }}>{cMsg}</div>}

      {/* Clinic Information */}
      <div className="card" style={{ padding: 24, marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, paddingBottom: 14, borderBottom: '1px solid var(--border)' }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700 }}>Clinic Information</div>
            {clinic?.clinicId && <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>ID: <strong>{clinic.clinicId}</strong></div>}
          </div>
          <button className={`btn btn--${editing ? 'secondary' : 'primary'} btn--sm`} onClick={() => setEditing(!editing)}>
            {editing ? '✕ Cancel' : '✎ Edit'}
          </button>
        </div>

        {editing ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div className="form-group" style={{ gridColumn: '1/-1' }}><label>Clinic Name *</label><input {...cf('name')} /></div>
              <div className="form-group"><label>Phone</label><input {...cf('phone')} /></div>
              <div className="form-group"><label>Email</label><input type="email" {...cf('email')} /></div>
              <div className="form-group"><label>License Number</label><input {...cf('licenseNumber')} /></div>
              <div className="form-group"><label>PNDT Reg. No.</label><input {...cf('pndtRegNo')} placeholder="PNDT registration number" /></div>
              <div className="form-group"><label>City</label><input {...cf('city')} /></div>
              <div className="form-group"><label>State</label><input {...cf('state')} /></div>
              <div className="form-group" style={{ gridColumn: '1/-1' }}><label>Full Address</label><input {...cf('address')} /></div>
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button className="btn btn--secondary" onClick={() => setEditing(false)}>Cancel</button>
              <button className="btn btn--primary" onClick={handleSaveClinic} disabled={cLoading}>{cLoading ? 'Saving…' : 'Save Changes'}</button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
            {[
              ['Clinic Name', clinic?.name],
              ['Specialization', clinic?.specialization || '—'],
              ['Phone', clinic?.phone || '—'],
              ['Email', clinic?.email || '—'],
              ['License No.', clinic?.licenseNumber || '—'],
              ['PNDT Reg. No.', clinic?.pndtRegNo || '—'],
              ['City', clinic?.city || '—'],
              ['State', clinic?.state || '—'],
              ['Plan', clinic?.subscription?.plan?.toUpperCase()],
              ['Expires', clinic?.subscription?.endDate ? new Date(clinic.subscription.endDate).toLocaleDateString('en-IN') : '—'],
              ['Status', clinic?.isActive ? 'Active' : 'Suspended'],
            ].map(([label, val]) => (
              <div key={label} style={{ padding: '10px 0', borderBottom: '1px solid var(--border)', display: 'flex', gap: 12, alignItems: 'center' }}>
                <div style={{ minWidth: 130, fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.04em' }}>{label}</div>
                <div style={{ fontSize: 13, color: 'var(--text-1)', fontWeight: 500 }}>
                  {label === 'Status' ? (
                    <span className={`badge badge--${clinic?.isActive ? 'green' : 'red'}`}>{val}</span>
                  ) : label === 'Plan' ? (
                    <span className="badge badge--teal">{val}</span>
                  ) : val}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* My Account */}
      <div className="card" style={{ padding: 24, marginBottom: 20 }}>
        <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>My Account</div>
        <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 16, padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--purple-bg,#F5F3FF)', color: 'var(--purple,#8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 20 }}>
            {user?.name?.[0]}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15 }}>{user?.name}</div>
            <div style={{ fontSize: 12, color: 'var(--text-3)' }}>{user?.email}</div>
            <span className="badge badge--purple" style={{ marginTop: 4 }}>Clinic Owner</span>
          </div>
          <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
            <div style={{ fontSize: 11, color: 'var(--text-3)' }}>Last login</div>
            <div style={{ fontSize: 12, fontWeight: 600 }}>{user?.lastLogin ? new Date(user.lastLogin).toLocaleString('en-IN') : '—'}</div>
          </div>
        </div>
      </div>

      {/* Change Password */}
      <div className="card" style={{ padding: 24 }}>
        <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>Change Password</div>
        {passMsg && <div className="alert alert--success" style={{ marginBottom: 14 }}>{passMsg}</div>}
        {passErr && <div className="alert alert--error" style={{ marginBottom: 14 }}>{passErr}</div>}
        <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="form-group"><label>Current Password *</label><input type="password" {...pf('currentPassword')} required /></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div className="form-group"><label>New Password *</label><input type="password" {...pf('newPassword')} required minLength={6} /></div>
            <div className="form-group"><label>Confirm New Password *</label><input type="password" {...pf('confirm')} required /></div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="btn btn--primary" disabled={passLoading}>{passLoading ? 'Updating…' : 'Update Password'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
