import { useState, useRef } from 'react'
import { gsap } from 'gsap'
import { useEffect } from 'react'
import { useAuth } from '../../auth/hooks/useAuth'
import api from '../../../services/api'

const ROLE_LABEL = { superadmin:'Super Admin', clinic_owner:'Clinic Owner', receptionist:'Receptionist', lab_handler:'Lab Handler', doctor:'Doctor' }
const ROLE_COLOR = { superadmin:'amber', clinic_owner:'purple', receptionist:'teal', lab_handler:'blue', doctor:'green' }

export default function ProfilePage() {
  const { user }   = useAuth()
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '' })
  const [passForm, setPassForm] = useState({ currentPassword: '', newPassword: '', confirm: '' })
  const [msg, setMsg]   = useState('')
  const [err, setErr]   = useState('')
  const [pMsg, setPMsg] = useState('')
  const [pErr, setPErr] = useState('')
  const [saving, setSaving]   = useState(false)
  const [pSaving, setPSaving] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    gsap.fromTo(ref.current, { y: -16, opacity: 0 }, { y: 0, opacity: 1, duration: .5 })
  }, [])

  const handleSave = async (e) => {
    e.preventDefault(); setMsg(''); setErr(''); setSaving(true)
    try {
      await api.patch('/auth/profile', form)
      setMsg('Profile updated!')
      setTimeout(() => setMsg(''), 3000)
    } catch (e) { setErr(e.response?.data?.error || 'Failed') }
    finally { setSaving(false) }
  }

  const handlePass = async (e) => {
    e.preventDefault(); setPMsg(''); setPErr('')
    if (passForm.newPassword !== passForm.confirm) return setPErr('Passwords do not match')
    if (passForm.newPassword.length < 6) return setPErr('Minimum 6 characters')
    setPSaving(true)
    try {
      await api.patch('/auth/change-password', { currentPassword: passForm.currentPassword, newPassword: passForm.newPassword })
      setPMsg('Password changed!')
      setPassForm({ currentPassword: '', newPassword: '', confirm: '' })
      setTimeout(() => setPMsg(''), 3000)
    } catch (e) { setPErr(e.response?.data?.error || 'Failed') }
    finally { setPSaving(false) }
  }

  return (
    <div style={{ maxWidth: 680 }} ref={ref}>
      <div className="page-header">
        <div><h1>My Profile</h1><p>Manage your account details</p></div>
      </div>

      {/* Profile card */}
      <div className="card" style={{ padding: 24, marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid var(--border)' }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: `var(--${ROLE_COLOR[user?.role]}-bg,var(--teal-light))`, color: `var(--${ROLE_COLOR[user?.role]},var(--teal))`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 22, flexShrink: 0 }}>
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800 }}>{user?.name}</div>
            <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>{user?.email}</div>
            <span className={`badge badge--${ROLE_COLOR[user?.role] || 'gray'}`} style={{ marginTop: 6 }}>{ROLE_LABEL[user?.role] || user?.role}</span>
          </div>
          {user?.clinic?.name && (
            <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
              <div style={{ fontSize: 11, color: 'var(--text-3)' }}>Clinic</div>
              <div style={{ fontSize: 13, fontWeight: 700 }}>{user.clinic.name}</div>
            </div>
          )}
        </div>

        {msg && <div className="alert alert--success" style={{ marginBottom: 14 }}>{msg}</div>}
        {err && <div className="alert alert--error"  style={{ marginBottom: 14 }}>{err}</div>}

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div className="form-group"><label>Full Name *</label><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required /></div>
            <div className="form-group"><label>Phone</label><input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
          </div>
          <div className="form-group"><label>Email (cannot change)</label><input value={user?.email} disabled style={{ opacity: .6, cursor: 'not-allowed' }} /></div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="btn btn--primary" disabled={saving}>{saving ? 'Saving…' : 'Save Changes'}</button>
          </div>
        </form>
      </div>

      {/* Change password */}
      <div className="card" style={{ padding: 24 }}>
        <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>Change Password</div>
        {pMsg && <div className="alert alert--success" style={{ marginBottom: 14 }}>{pMsg}</div>}
        {pErr && <div className="alert alert--error"  style={{ marginBottom: 14 }}>{pErr}</div>}
        <form onSubmit={handlePass} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="form-group"><label>Current Password *</label><input type="password" value={passForm.currentPassword} onChange={e => setPassForm({ ...passForm, currentPassword: e.target.value })} required /></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div className="form-group"><label>New Password *</label><input type="password" value={passForm.newPassword} onChange={e => setPassForm({ ...passForm, newPassword: e.target.value })} required minLength={6} /></div>
            <div className="form-group"><label>Confirm New *</label><input type="password" value={passForm.confirm} onChange={e => setPassForm({ ...passForm, confirm: e.target.value })} required /></div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="btn btn--primary" disabled={pSaving}>{pSaving ? 'Updating…' : 'Update Password'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
