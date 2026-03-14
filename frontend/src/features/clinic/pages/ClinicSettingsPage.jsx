import { useState, useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { useAuth } from '../../auth/hooks/useAuth'
import api from '../../../services/api'

const DISCOUNT_ROLES = [
  { val: 'receptionist', label: 'Receptionist (Staff 1)' },
  { val: 'lab_handler',  label: 'Lab Handler (Staff 2)' },
]

function ImageUploadBox({ label, current, onUpload, hint }) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview]     = useState(current)
  const inputRef = useRef(null)

  useEffect(() => setPreview(current), [current])

  const handleFile = async e => {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    try {
      const data = new FormData()
      data.append('file', file)
      data.append('folder', '/medirecord/clinic')
      const r = await api.post('/upload', data, { headers: { 'Content-Type': 'multipart/form-data' } })
      setPreview(r.data.url)
      onUpload(r.data.url, r.data.fileId)
    } catch(e) { alert('Upload failed: ' + (e.response?.data?.error || e.message)) }
    finally { setUploading(false) }
  }

  return (
    <div className="img-upload-box">
      <div className="img-upload-box__preview" onClick={() => inputRef.current?.click()}>
        {preview
          ? <img src={preview} alt={label} />
          : <div className="img-upload-box__placeholder">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="28" height="28"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              <span>Upload</span>
            </div>
        }
        {uploading && <div className="img-upload-box__loading">Uploading…</div>}
      </div>
      <div className="img-upload-box__info">
        <div style={{fontWeight:700,fontSize:13}}>{label}</div>
        <div style={{fontSize:11,color:'var(--text-3)',marginTop:2}}>{hint}</div>
        <button className="btn btn--secondary btn--sm" style={{marginTop:8}} onClick={() => inputRef.current?.click()} disabled={uploading}>
          {uploading ? 'Uploading…' : preview ? '🔄 Change' : '📤 Upload'}
        </button>
      </div>
      <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} style={{display:'none'}} />
    </div>
  )
}

export default function ClinicSettingsPage() {
  const { user } = useAuth()
  const [clinic, setClinic]     = useState(null)
  const [editing, setEditing]   = useState(false)
  const [cForm, setCForm]       = useState({})
  const [cLoading, setCLoading] = useState(false)
  const [cMsg, setCMsg]         = useState('')
  const [passForm, setPassForm] = useState({ currentPassword:'', newPassword:'', confirm:'' })
  const [passMsg, setPassMsg]   = useState('')
  const [passErr, setPassErr]   = useState('')
  const [passLoading, setPassLoading] = useState(false)
  const [discountRoles, setDiscountRoles] = useState([])
  const [gst, setGst] = useState({ enabled:false, gstin:'', gstType:'CGST_SGST', cgstPercent:9, sgstPercent:9, igstPercent:18 })
  const ref = useRef(null)

  useEffect(() => {
    gsap.fromTo(ref.current, {y:-16,opacity:0}, {y:0,opacity:1,duration:.5})
    api.get('/clinics/my/clinic').then(r => {
      const c = r.data.clinic
      setClinic(c)
      setCForm({
        name: c.name, phone: c.phone, email: c.email,
        address: c.address, city: c.city, state: c.state,
        licenseNumber: c.licenseNumber, pndtRegNo: c.pndtRegNo||'',
        specialization: c.specialization,
      })
      setDiscountRoles(c.settings?.discountRoles || [])
      if (c.gstSettings) setGst({
        enabled: c.gstSettings.enabled||false,
        gstin: c.gstSettings.gstin||'',
        gstType: c.gstSettings.gstType||'CGST_SGST',
        cgstPercent: c.gstSettings.cgstPercent||9,
        sgstPercent: c.gstSettings.sgstPercent||9,
        igstPercent: c.gstSettings.igstPercent||18,
      })
    }).catch(()=>{})
  }, [])

  const handleSaveClinic = async () => {
    setCLoading(true); setCMsg('')
    try {
      const r = await api.patch('/clinics/my/clinic', cForm)
      setClinic(r.data.clinic); setEditing(false)
      setCMsg('Clinic details updated!')
      setTimeout(() => setCMsg(''), 3000)
    } catch(e) { setCMsg(e.response?.data?.error || 'Failed') }
    finally { setCLoading(false) }
  }

  const handleLogoUpload = async (url, fileId) => {
    try {
      const r = await api.patch('/clinics/my/logo', { logoUrl: url, logoFileId: fileId })
      setClinic(prev => ({ ...prev, logoUrl: url }))
    } catch(e) {}
  }

  const handleProfileUpload = async (url, fileId) => {
    try {
      await api.patch('/clinics/my/logo', { ownerProfileImage: url, ownerProfileFileId: fileId })
      await api.patch('/auth/profile', { profileImage: url, profileImageFileId: fileId })
    } catch(e) {}
  }

  const handleDiscountRoles = async role => {
    const updated = discountRoles.includes(role)
      ? discountRoles.filter(r => r !== role)
      : [...discountRoles, role]
    setDiscountRoles(updated)
    await api.patch('/clinics/my/logo', { discountRoles: updated })
    // reload clinic
    api.get('/clinics/my/clinic').then(r => setClinic(r.data.clinic))
  }

  const handleChangePassword = async e => {
    e.preventDefault(); setPassErr(''); setPassMsg('')
    if (passForm.newPassword !== passForm.confirm) return setPassErr('Passwords do not match')
    if (passForm.newPassword.length < 6) return setPassErr('Minimum 6 characters')
    setPassLoading(true)
    try {
      await api.patch('/auth/change-password', { currentPassword: passForm.currentPassword, newPassword: passForm.newPassword })
      setPassMsg('Password updated!'); setPassForm({ currentPassword:'', newPassword:'', confirm:'' })
      setTimeout(() => setPassMsg(''), 3000)
    } catch(e) { setPassErr(e.response?.data?.error || 'Failed') }
    finally { setPassLoading(false) }
  }

  const saveGst = async () => {
    try {
      await api.patch('/clinics/my/logo', {
        gstEnabled: gst.enabled, gstin: gst.gstin, gstType: gst.gstType,
        cgstPercent: Number(gst.cgstPercent), sgstPercent: Number(gst.sgstPercent), igstPercent: Number(gst.igstPercent),
      })
      setCMsg('GST settings saved!')
      setTimeout(() => setCMsg(''), 3000)
    } catch(e) { setCMsg('Failed to save GST settings') }
  }

  const cf = k => ({ value: cForm[k]||'', onChange: e => setCForm({...cForm,[k]:e.target.value}) })

  const sub = clinic?.subscription || {}
  const daysLeft = sub.endDate ? Math.ceil((new Date(sub.endDate)-new Date())/86400000) : null

  return (
    <div style={{maxWidth:900}}>
      <div className="page-header" ref={ref}>
        <div><h1>Settings</h1><p>Manage clinic profile, images, and account settings</p></div>
      </div>

      {/* Subscription warning */}
      {daysLeft !== null && daysLeft <= 30 && (
        <div className={`notif-bar notif-bar--${daysLeft<=7?'danger':'warn'}`} style={{marginBottom:20}}>
          <span className="notif-bar__icon">⚠️</span>
          <span className="notif-bar__text">
            Your subscription expires in <strong>{daysLeft} day{daysLeft!==1?'s':''}</strong> ({new Date(sub.endDate).toLocaleDateString('en-IN')}). Contact admin to renew.
          </span>
        </div>
      )}

      {cMsg && <div className="alert alert--success" style={{marginBottom:16}}>{cMsg}</div>}

      {/* Images section */}
      <div className="card" style={{padding:24,marginBottom:20}}>
        <div style={{fontWeight:700,fontSize:15,marginBottom:16,paddingBottom:12,borderBottom:'1px solid var(--border)'}}>
          Branding & Profile Images
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20}}>
          <ImageUploadBox
            label="Clinic Logo"
            hint="Appears on F-Forms and Bills · PNG/JPG recommended"
            current={clinic?.logoUrl || clinic?.logo}
            onUpload={handleLogoUpload}
          />
          <ImageUploadBox
            label="Your Profile Photo"
            hint="Shown in sidebar and staff list"
            current={user?.profileImage || clinic?.ownerProfileImage}
            onUpload={handleProfileUpload}
          />
        </div>
      </div>

      {/* Clinic info */}
      <div className="card" style={{padding:24,marginBottom:20}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:18,paddingBottom:12,borderBottom:'1px solid var(--border)'}}>
          <div>
            <div style={{fontWeight:700,fontSize:15}}>Clinic Information</div>
            {clinic?.clinicId && <div style={{fontSize:11,color:'var(--text-3)',marginTop:2}}>ID: <strong>{clinic.clinicId}</strong></div>}
          </div>
          <button className={`btn btn--${editing?'secondary':'primary'} btn--sm`} onClick={() => setEditing(!editing)}>
            {editing ? '✕ Cancel' : '✎ Edit'}
          </button>
        </div>

        {editing ? (
          <div style={{display:'flex',flexDirection:'column',gap:14}}>
            <div className="form-grid-2">
              <div className="form-group" style={{gridColumn:'1/-1'}}><label>Clinic Name *</label><input {...cf('name')} /></div>
              <div className="form-group"><label>Phone</label><input {...cf('phone')} /></div>
              <div className="form-group"><label>Email</label><input type="email" {...cf('email')} /></div>
              <div className="form-group"><label>License Number</label><input {...cf('licenseNumber')} /></div>
              <div className="form-group"><label>PNDT Reg. No.</label><input {...cf('pndtRegNo')} /></div>
              <div className="form-group"><label>City</label><input {...cf('city')} /></div>
              <div className="form-group"><label>State</label><input {...cf('state')} /></div>
              <div className="form-group" style={{gridColumn:'1/-1'}}><label>Full Address</label><input {...cf('address')} /></div>
            </div>
            <div style={{display:'flex',gap:10,justifyContent:'flex-end'}}>
              <button className="btn btn--secondary" onClick={() => setEditing(false)}>Cancel</button>
              <button className="btn btn--primary" onClick={handleSaveClinic} disabled={cLoading}>{cLoading?'Saving…':'Save Changes'}</button>
            </div>
          </div>
        ) : (
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:0}}>
            {[
              ['Clinic Name',   clinic?.name],
              ['Specialization',clinic?.specialization||'—'],
              ['Phone',         clinic?.phone||'—'],
              ['Email',         clinic?.email||'—'],
              ['License No.',   clinic?.licenseNumber||'—'],
              ['PNDT Reg. No.', clinic?.pndtRegNo||'—'],
              ['City',          clinic?.city||'—'],
              ['State',         clinic?.state||'—'],
              ['Plan',          sub.plan?.toUpperCase()],
              ['Expires',       sub.endDate?new Date(sub.endDate).toLocaleDateString('en-IN'):'—'],
            ].map(([l,v]) => (
              <div key={l} style={{padding:'9px 0',borderBottom:'1px solid var(--border)',display:'flex',gap:12}}>
                <div style={{minWidth:130,fontSize:11,fontWeight:700,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'.04em'}}>{l}</div>
                <div style={{fontSize:13,color:'var(--text-1)',fontWeight:500}}>
                  {l==='Plan'?<span className="badge badge--teal">{v}</span>:v}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Discount permissions */}
      <div className="card" style={{padding:24,marginBottom:20}}>
        <div style={{fontWeight:700,fontSize:15,marginBottom:4,paddingBottom:12,borderBottom:'1px solid var(--border)'}}>
          Discount Permissions
        </div>
        <p style={{fontSize:13,color:'var(--text-2)',margin:'12px 0'}}>
          Select which staff roles can apply discounts when creating bills.
          Clinic owner always has discount permission.
        </p>
        <div style={{display:'flex',flexDirection:'column',gap:10}}>
          {DISCOUNT_ROLES.map(r => (
            <label key={r.val} style={{display:'flex',alignItems:'center',gap:10,cursor:'pointer',padding:'10px 14px',background:'var(--bg)',borderRadius:8,border:`1.5px solid ${discountRoles.includes(r.val)?'var(--teal)':'var(--border)'}`}}>
              <input type="checkbox" checked={discountRoles.includes(r.val)} onChange={() => handleDiscountRoles(r.val)} style={{width:16,height:16,accentColor:'var(--teal)'}} />
              <div>
                <div style={{fontWeight:600,fontSize:13}}>{r.label}</div>
                <div style={{fontSize:11,color:'var(--text-3)'}}>Can apply discounts on bills</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* My Account */}
      <div className="card" style={{padding:24,marginBottom:20}}>
        <div style={{fontWeight:700,fontSize:15,marginBottom:16,paddingBottom:12,borderBottom:'1px solid var(--border)'}}>My Account</div>
        <div style={{display:'flex',gap:14,alignItems:'center',paddingBottom:16,borderBottom:'1px solid var(--border)',marginBottom:16}}>
          {user?.profileImage
            ? <img src={user.profileImage} alt="" style={{width:52,height:52,borderRadius:'50%',objectFit:'cover',flexShrink:0}} />
            : <div style={{width:52,height:52,borderRadius:'50%',background:'var(--purple-bg,#F5F3FF)',color:'var(--purple,#8B5CF6)',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:900,fontSize:22,flexShrink:0}}>
                {user?.name?.[0]}
              </div>
          }
          <div>
            <div style={{fontWeight:700,fontSize:15}}>{user?.name}</div>
            <div style={{fontSize:12,color:'var(--text-3)'}}>{user?.email}</div>
            <span className="badge badge--purple" style={{marginTop:4}}>Clinic Owner</span>
          </div>
          <div style={{marginLeft:'auto',textAlign:'right'}}>
            <div style={{fontSize:11,color:'var(--text-3)'}}>Last login</div>
            <div style={{fontSize:12,fontWeight:600}}>{user?.lastLogin?new Date(user.lastLogin).toLocaleString('en-IN'):'—'}</div>
          </div>
        </div>
      </div>

      {/* GST Settings */}
      <div className="card" style={{padding:24,marginBottom:20}}>
        <div style={{fontWeight:700,fontSize:15,marginBottom:16,paddingBottom:12,borderBottom:'1px solid var(--border)',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <span>GST Settings</span>
          <label style={{display:'flex',alignItems:'center',gap:8,cursor:'pointer',fontWeight:500,fontSize:13,textTransform:'none'}}>
            <input type="checkbox" checked={gst.enabled} onChange={e=>setGst({...gst,enabled:e.target.checked})} style={{width:16,height:16,accentColor:'var(--teal)'}}/>
            Enable GST on Bills
          </label>
        </div>
        {gst.enabled && (
          <div style={{display:'flex',flexDirection:'column',gap:14}}>
            <div style={{background:'var(--amber-bg)',border:'1px solid #FDE68A',borderRadius:8,padding:'10px 14px',fontSize:12,color:'#92400E'}}>
              ⚠️ Note: Most diagnostic services (SAC 9993) are GST-exempt in India. Enable only if your clinic is GST-registered and applicable.
            </div>
            <div className="form-grid-2">
              <div className="form-group"><label>GSTIN *</label><input value={gst.gstin} onChange={e=>setGst({...gst,gstin:e.target.value})} placeholder="22AAAAA0000A1Z5" /></div>
              <div className="form-group"><label>GST Type</label>
                <select value={gst.gstType} onChange={e=>setGst({...gst,gstType:e.target.value})}>
                  <option value="CGST_SGST">CGST + SGST (Intra-state)</option>
                  <option value="IGST">IGST (Inter-state)</option>
                </select>
              </div>
              {gst.gstType==='CGST_SGST' ? (
                <>
                  <div className="form-group"><label>CGST %</label><input type="number" value={gst.cgstPercent} onChange={e=>setGst({...gst,cgstPercent:e.target.value})} min={0} max={50} /></div>
                  <div className="form-group"><label>SGST %</label><input type="number" value={gst.sgstPercent} onChange={e=>setGst({...gst,sgstPercent:e.target.value})} min={0} max={50} /></div>
                </>
              ) : (
                <div className="form-group"><label>IGST %</label><input type="number" value={gst.igstPercent} onChange={e=>setGst({...gst,igstPercent:e.target.value})} min={0} max={100} /></div>
              )}
            </div>
            <div style={{display:'flex',justifyContent:'flex-end'}}>
              <button className="btn btn--primary" onClick={saveGst}>Save GST Settings</button>
            </div>
          </div>
        )}
        {!gst.enabled && <div style={{fontSize:13,color:'var(--text-3)',textAlign:'center',padding:'12px 0'}}>GST disabled — all bills will be generated without tax lines.</div>}
      </div>

      {/* Change password */}
      <div className="card" style={{padding:24}}>
        <div style={{fontWeight:700,fontSize:15,marginBottom:16,paddingBottom:12,borderBottom:'1px solid var(--border)'}}>Change Password</div>
        {passMsg && <div className="alert alert--success" style={{marginBottom:14}}>{passMsg}</div>}
        {passErr && <div className="alert alert--error"  style={{marginBottom:14}}>{passErr}</div>}
        <form onSubmit={handleChangePassword} style={{display:'flex',flexDirection:'column',gap:14}}>
          <div className="form-group"><label>Current Password *</label><input type="password" value={passForm.currentPassword} onChange={e=>setPassForm({...passForm,currentPassword:e.target.value})} required /></div>
          <div className="form-grid-2">
            <div className="form-group"><label>New Password *</label><input type="password" value={passForm.newPassword} onChange={e=>setPassForm({...passForm,newPassword:e.target.value})} required minLength={6} /></div>
            <div className="form-group"><label>Confirm *</label><input type="password" value={passForm.confirm} onChange={e=>setPassForm({...passForm,confirm:e.target.value})} required /></div>
          </div>
          <div style={{display:'flex',justifyContent:'flex-end'}}>
            <button type="submit" className="btn btn--primary" disabled={passLoading}>{passLoading?'Updating…':'Update Password'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
