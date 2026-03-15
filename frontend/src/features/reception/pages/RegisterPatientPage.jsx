import { useState, useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { useAuth } from '../../auth/hooks/useAuth'
import api from '../../../services/api'
import './RegisterPatientPage.scss'

// ── Constants ──────────────────────────────────────────────────────────
const GENDERS      = ['Female','Male','Other']
const PAY_MODES    = ['cash','upi','card','cheque','pending']
const ID_PROOFS    = ['Aadhaar Card','PAN Card','Voter ID Card','Passport','Driving Licence','Ration Card','NREGA Job Card','Bank Passbook','Government ID Card','Birth Certificate']
const RELATION_TYPES = ['Husband','Wife','Father','Mother','Guardian','Self']
const REFERRAL_TYPES = ['Doctor','Genetic Counselling Centre','Self Referral','Other']

// Pregnancy week tracking schedule (FOGSI + ISUOG guidelines)
const PREGNANCY_SCHEDULE = [
  { weekFrom:6,  weekTo:8,  test:'Early Pregnancy Scan',           type:'USG',   notes:'Confirm viability, CRL, heartbeat' },
  { weekFrom:11, weekTo:13, test:'Double Marker Test',             type:'Blood', notes:'PAPP-A + free β-hCG, chromosomal anomalies' },
  { weekFrom:11, weekTo:14, test:'NT Scan (Nuchal Translucency)',  type:'USG',   notes:'Down syndrome screening, nasal bone' },
  { weekFrom:18, weekTo:20, test:'Anomaly Scan (Level II)',        type:'USG',   notes:'Full fetal anatomy survey' },
  { weekFrom:24, weekTo:28, test:'GCT / OGTT',                    type:'Blood', notes:'Gestational diabetes screening' },
  { weekFrom:24, weekTo:28, test:'Fetal Echo',                    type:'USG',   notes:'Fetal cardiac assessment' },
  { weekFrom:28, weekTo:32, test:'Growth Scan',                   type:'USG',   notes:'Growth parameters, liquor, Doppler' },
  { weekFrom:34, weekTo:36, test:'Growth + Doppler Scan',         type:'USG',   notes:'Biophysical profile, umbilical Doppler' },
  { weekFrom:36, weekTo:40, test:'Term Scan',                     type:'USG',   notes:'Presentation, placental grade, AFI' },
]

const EMPTY = {
  name:'', dob:'', age:'', ageUnit:'years', gender:'Female',
  phone:'', email:'',
  address:'', district:'', state:'', areaType:'Urban',
  relationType:'Husband', relativeName:'',
  livingChildrenMale:0, livingChildrenFemale:0,
  livingChildrenMaleAge:'', livingChildrenFemaleAge:'',
  idProofType:'', idProofNo:'', idProofFront:'', idProofFrontId:'', idProofBack:'', idProofBackId:'',
  referredBy:'', referralSlip:'', referralSlipId:'',
  referredDoctor:{ name:'', type:'Doctor', qualification:'', address:'', city:'', phone:'', regNo:'' },
  lmp:'', weeksOfPregnancy:'', daysOfPregnancy:'', edd:'', patientRegDate:'',
  testCategory:'', testCategoryId:'', testName:'', testId:'',
  fee:'', fformRequired:false, isPaid:false, paymentMode:'cash',
}

// ── File upload helper ─────────────────────────────────────────────────
function FileUpload({ label, hint, value, onUpload, folder, accept='image/*' }) {
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef(null)

  const handleFile = async e => {
    const file = e.target.files[0]; if (!file) return
    setUploading(true)
    try {
      const data = new FormData()
      data.append('file', file)
      data.append('folder', `/medirecord/${folder||'docs'}`)
      const r = await api.post('/upload', data, { headers:{ 'Content-Type':'multipart/form-data' } })
      onUpload(r.data.url, r.data.fileId)
    } catch(e) { alert('Upload failed: ' + (e.response?.data?.error || e.message)) }
    finally { setUploading(false) }
  }

  const isPdf = value?.endsWith('.pdf') || value?.includes('application/pdf')

  return (
    <div className="file-upload">
      <div className="file-upload__preview" onClick={() => inputRef.current?.click()}>
        {value
          ? isPdf
            ? <div className="file-upload__pdf-icon">📄<span>PDF</span></div>
            : <img src={value} alt="" />
          : <div className="file-upload__placeholder">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="24" height="24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              <span>Tap to upload</span>
            </div>
        }
        {uploading && <div className="file-upload__overlay">Uploading…</div>}
      </div>
      <div className="file-upload__meta">
        <div style={{fontWeight:700,fontSize:12}}>{label}</div>
        <div style={{fontSize:10,color:'var(--text-3)',marginTop:1}}>{hint}</div>
        {value && <a href={value} target="_blank" rel="noreferrer" className="file-upload__view">View →</a>}
        <button className="btn btn--secondary btn--sm" style={{marginTop:6}} onClick={() => inputRef.current?.click()} disabled={uploading}>
          {uploading ? 'Uploading…' : value ? '🔄 Replace' : '📤 Upload'}
        </button>
      </div>
      <input ref={inputRef} type="file" accept={accept} onChange={handleFile} style={{display:'none'}} />
    </div>
  )
}

// ── Main Page ──────────────────────────────────────────────────────────
export default function RegisterPatientPage() {
  const { user } = useAuth()
  const [form, setForm]           = useState(EMPTY)
  const [testCats, setTestCats]   = useState([])
  const [subTests, setSubTests]   = useState([])
  const [savedDoctors, setSavedDoctors] = useState([])
  const [doctorSearch, setDoctorSearch] = useState('')
  const [showDoctorDropdown, setShowDoctorDropdown] = useState(false)
  const [savingDoctor, setSavingDoctor] = useState(false)
  const [loading, setLoading]     = useState(false)
  const [success, setSuccess]     = useState(null)
  const [error, setError]         = useState('')
  const [activeTab, setActiveTab] = useState('basic') // basic | identity | referral | pregnancy
  const formRef = useRef(null)

  useEffect(() => {
    gsap.fromTo(formRef.current, {x:-20,opacity:0}, {x:0,opacity:1,duration:.5})
    api.get('/clinics/my/tests').then(r => setTestCats(r.data.testCategories||[])).catch(()=>{})
    loadDoctors()
  }, [])

  const loadDoctors = async () => {
    try { const r = await api.get('/referred-doctors'); setSavedDoctors(r.data.doctors||[]) } catch(e){}
  }

  // Auto-calc age from DOB
  const handleDobChange = e => {
    const dob = e.target.value
    const age = dob ? Math.floor((new Date() - new Date(dob)) / (365.25*24*3600*1000)) : ''
    setForm(f => ({ ...f, dob, age }))
  }

  // Auto-calc weeks/EDD from LMP
  const handleLmpChange = e => {
    const lmp = e.target.value
    if (!lmp) return setForm(f => ({...f, lmp, weeksOfPregnancy:'', daysOfPregnancy:'', edd:''}))
    const lmpDate  = new Date(lmp)
    const today    = new Date()
    const diffDays = Math.floor((today - lmpDate) / (24*3600*1000))
    const weeks    = Math.floor(diffDays / 7)
    const days     = diffDays % 7
    // EDD = LMP + 280 days
    const eddDate  = new Date(lmpDate.getTime() + 280*24*3600*1000)
    const edd      = eddDate.toISOString().split('T')[0]
    setForm(f => ({...f, lmp, weeksOfPregnancy:weeks, daysOfPregnancy:days, edd}))
  }

  // Category change
  const handleCategoryChange = e => {
    const catId = e.target.value
    const cat   = testCats.find(c => c._id === catId)
    setSubTests(cat?.subTests||[])
    setForm(f => ({...f, testCategoryId:catId, testCategory:cat?.name||'', testId:'', testName:'', fee:cat?.basePrice||'', fformRequired:false}))
  }

  const handleSubTestChange = e => {
    const tid = e.target.value
    const sub = subTests.find(s => s._id === tid)
    setForm(f => ({...f, testId:tid, testName:sub?.name||'', fee:sub?.price??f.fee, fformRequired:sub?.fformRequired||false}))
  }

  // Select a saved referred doctor
  const selectDoctor = doc => {
    setForm(f => ({...f,
      referredBy: doc.name,
      referredDoctor:{ name:doc.name, type:doc.type, qualification:doc.qualification||'', address:doc.address||'', city:doc.city||'', phone:doc.phone||'', regNo:doc.regNo||'' }
    }))
    setDoctorSearch(doc.name)
    setShowDoctorDropdown(false)
  }

  const saveCurrentDoctor = async () => {
    if (!form.referredDoctor?.name) return
    setSavingDoctor(true)
    try {
      await api.post('/referred-doctors', form.referredDoctor)
      await loadDoctors()
      alert('Doctor saved for future use!')
    } catch(e) { alert(e.response?.data?.error||'Failed to save doctor') }
    finally { setSavingDoctor(false) }
  }

  const setField = (k, v) => setForm(f => ({...f,[k]:v}))
  const setDoctorField = (k, v) => setForm(f => ({...f, referredDoctor:{...f.referredDoctor,[k]:v}, referredBy:k==='name'?v:f.referredBy}))

  const handleSubmit = async e => {
    e.preventDefault(); setError(''); setLoading(true)
    try {
      const clinicId = user?.clinic?._id || user?.clinic
      const payload  = { ...form, clinic: clinicId }
      const r = await api.post('/patients', payload)
      setSuccess(r.data.patient)
      setForm(EMPTY)
      setActiveTab('basic')
    } catch(err) { setError(err.response?.data?.error||'Registration failed') }
    finally { setLoading(false) }
  }

  const printReceipt = () => {
    if (!success) return
    const w = window.open('','_blank')
    w.document.write(`<!DOCTYPE html><html><head><title>Token Receipt</title>
    <style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:Arial,sans-serif;font-size:13px;padding:20px;max-width:320px}
    h2{font-size:16px;font-weight:800;color:#0EA5A0}.token{font-size:60px;font-weight:900;color:#0EA5A0;text-align:center;margin:12px 0}
    .row{display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px dashed #e2e8f0;font-size:12px}
    .label{color:#64748b}.val{font-weight:700}.footer{margin-top:14px;font-size:10px;color:#94a3b8;text-align:center}
    @media print{body{max-width:100%}}</style></head><body>
    <h2>MediRecord — Token Receipt</h2>
    <div class="token">#${String(success.tokenNo).padStart(3,'0')}</div>
    <div class="row"><span class="label">Patient</span><span class="val">${success.name}</span></div>
    <div class="row"><span class="label">Age/Gender</span><span class="val">${success.age}y · ${success.gender}</span></div>
    <div class="row"><span class="label">Test</span><span class="val">${success.testName}</span></div>
    <div class="row"><span class="label">Fee</span><span class="val">₹${success.fee}</span></div>
    <div class="row"><span class="label">Payment</span><span class="val">${success.isPaid?'Paid':'Pending'} · ${success.paymentMode}</span></div>
    <div class="row"><span class="label">Receipt</span><span class="val">${success.receiptNo||'—'}</span></div>
    <div class="row"><span class="label">Date</span><span class="val">${new Date().toLocaleDateString('en-IN')}</span></div>
    ${success.fformRequired?'<div style="margin-top:8px;background:#e6f7f7;border-radius:6px;padding:6px 10px;font-size:11px;color:#0C8F8A;font-weight:700">📋 F-Form Required for this test</div>':''}
    <div class="footer">Please keep this receipt · ${new Date().toLocaleString('en-IN')}</div>
    </body></html>`)
    w.document.close(); w.focus()
    setTimeout(() => w.print(), 400)
  }

  // Upcoming tests based on current pregnancy weeks
  const upcomingTests = form.weeksOfPregnancy
    ? PREGNANCY_SCHEDULE.filter(s => s.weekFrom >= (parseInt(form.weeksOfPregnancy)||0))
        .slice(0,3)
    : []

  const filteredDoctors = savedDoctors.filter(d =>
    d.name.toLowerCase().includes(doctorSearch.toLowerCase())
  )

  const TABS = [
    { id:'basic',     label:'Patient Info',  icon:'👤' },
    { id:'identity',  label:'ID & Documents',icon:'🪪' },
    { id:'referral',  label:'Referral',      icon:'🏥' },
    { id:'test',      label:'Test & Payment',icon:'💊' },
  ]

  const inp = (k, extra={}) => ({
    value: form[k]??'',
    onChange: e => setField(k, e.target.value),
    ...extra,
  })

  return (
    <div style={{maxWidth:860}} ref={formRef}>
      <div className="page-header">
        <div><h1>Register Patient</h1><p>PNDT-compliant registration with full documentation</p></div>
      </div>

      {success && (
        <div className="reg-success">
          <div className="reg-success__token">#{String(success.tokenNo).padStart(3,'0')}</div>
          <div className="reg-success__info">
            <div style={{fontWeight:800,fontSize:15}}>{success.name} registered successfully!</div>
            <div style={{fontSize:12,color:'var(--text-2)',marginTop:2}}>{success.testName} · ₹{success.fee} · {success.isPaid?'Paid':'Pending'}</div>
            {success.fformRequired && <div className="reg-success__fform">📋 F-Form required for this patient</div>}
          </div>
          <button className="btn btn--primary btn--sm" onClick={printReceipt}>🖨 Print Token</button>
          <button className="btn btn--secondary btn--sm" onClick={() => setSuccess(null)}>+ New Patient</button>
        </div>
      )}

      {error && <div className="alert alert--error" style={{marginBottom:16}}>{error}</div>}

      {/* Tab navigation */}
      <div className="reg-tabs">
        {TABS.map(t => (
          <button key={t.id}
            className={`reg-tab${activeTab===t.id?' reg-tab--active':''}`}
            onClick={() => setActiveTab(t.id)}>
            <span>{t.icon}</span> {t.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        {/* ── TAB 1: Basic Patient Info ── */}
        {activeTab==='basic' && (
          <div className="reg-card">
            <div className="form-grid-2">
              <div className="form-group" style={{gridColumn:'1/-1'}}>
                <label>Full Name *</label>
                <input {...inp('name')} required placeholder="As per ID proof" />
              </div>

              <div className="form-group">
                <label>Date of Birth</label>
                <input type="date" value={form.dob} onChange={handleDobChange}
                  max={new Date().toISOString().split('T')[0]} />
              </div>
              <div className="form-group">
                <label>Age *</label>
                <div style={{display:'flex',gap:6}}>
                  <input type="number" value={form.age} onChange={e=>setField('age',e.target.value)} required min={0} max={120} style={{flex:2}} />
                  <select value={form.ageUnit} onChange={e=>setField('ageUnit',e.target.value)} style={{flex:1}}>
                    <option value="years">yrs</option>
                    <option value="months">mo</option>
                    <option value="days">days</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Gender *</label>
                <select {...inp('gender')} required>
                  {GENDERS.map(g => <option key={g}>{g}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label>Relative / Guardian *</label>
                <div style={{display:'flex',gap:6}}>
                  <select value={form.relationType} onChange={e=>setField('relationType',e.target.value)} style={{flex:1}}>
                    {RELATION_TYPES.map(r => <option key={r}>{r}</option>)}
                  </select>
                  <input value={form.relativeName} onChange={e=>setField('relativeName',e.target.value)} placeholder="Name" style={{flex:2}} />
                </div>
              </div>

              <div className="form-group">
                <label>Phone *</label>
                <input {...inp('phone')} required type="tel" placeholder="10-digit mobile" maxLength={10} />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input {...inp('email')} type="email" placeholder="Optional" />
              </div>

              {/* Living children */}
              <div className="form-group">
                <label>Living Children — Male</label>
                <div style={{display:'flex',gap:6}}>
                  <input type="number" value={form.livingChildrenMale} onChange={e=>setField('livingChildrenMale',e.target.value)} min={0} max={20} style={{width:70}} placeholder="Count" />
                  <input value={form.livingChildrenMaleAge} onChange={e=>setField('livingChildrenMaleAge',e.target.value)} placeholder="Ages e.g. 5,7" style={{flex:1}} />
                </div>
              </div>
              <div className="form-group">
                <label>Living Children — Female</label>
                <div style={{display:'flex',gap:6}}>
                  <input type="number" value={form.livingChildrenFemale} onChange={e=>setField('livingChildrenFemale',e.target.value)} min={0} max={20} style={{width:70}} placeholder="Count" />
                  <input value={form.livingChildrenFemaleAge} onChange={e=>setField('livingChildrenFemaleAge',e.target.value)} placeholder="Ages e.g. 2" style={{flex:1}} />
                </div>
              </div>

              <div className="form-group" style={{gridColumn:'1/-1'}}>
                <label>Full Address</label>
                <input {...inp('address')} placeholder="Street / Area / Locality" />
              </div>
              <div className="form-group">
                <label>District</label>
                <input {...inp('district')} />
              </div>
              <div className="form-group">
                <label>State</label>
                <input {...inp('state')} />
              </div>
              <div className="form-group">
                <label>Area Type</label>
                <select {...inp('areaType')}>
                  <option value="Rural">Rural</option>
                  <option value="Urban">Urban</option>
                </select>
              </div>
              <div className="form-group">
                <label>Patient Reg. Date (PNDT)</label>
                <input type="date" {...inp('patientRegDate')} />
              </div>
              <div className="form-group">
                <label>PCTS ID</label>
                <input {...inp('pctsId')} placeholder="Govt PCTS system ID" />
              </div>
            </div>
            <div style={{display:'flex',justifyContent:'flex-end',marginTop:16}}>
              <button type="button" className="btn btn--primary" onClick={()=>setActiveTab('identity')}>Next: ID & Documents →</button>
            </div>
          </div>
        )}

        {/* ── TAB 2: ID Proof & Documents ── */}
        {activeTab==='identity' && (
          <div className="reg-card">
            <div className="form-grid-2" style={{marginBottom:20}}>
              <div className="form-group">
                <label>ID Proof Type *</label>
                <select value={form.idProofType} onChange={e=>setField('idProofType',e.target.value)}>
                  <option value="">Select...</option>
                  {ID_PROOFS.map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>ID Proof Number</label>
                <input {...inp('idProofNo')} placeholder="e.g. XXXX XXXX XXXX (Aadhaar)" />
              </div>
            </div>

            <div className="id-upload-grid">
              <FileUpload
                label="ID Proof — Front Side"
                hint="JPG/PNG/PDF · Max 5MB"
                value={form.idProofFront}
                folder="id-proof"
                accept="image/*,application/pdf"
                onUpload={(url, fid) => setForm(f => ({...f, idProofFront:url, idProofFrontId:fid}))}
              />
              <FileUpload
                label="ID Proof — Back Side"
                hint="JPG/PNG/PDF · Max 5MB"
                value={form.idProofBack}
                folder="id-proof"
                accept="image/*,application/pdf"
                onUpload={(url, fid) => setForm(f => ({...f, idProofBack:url, idProofBackId:fid}))}
              />
            </div>

            <div style={{display:'flex',justifyContent:'space-between',marginTop:20}}>
              <button type="button" className="btn btn--secondary" onClick={()=>setActiveTab('basic')}>← Back</button>
              <button type="button" className="btn btn--primary" onClick={()=>setActiveTab('referral')}>Next: Referral →</button>
            </div>
          </div>
        )}

        {/* ── TAB 3: Referral ── */}
        {activeTab==='referral' && (
          <div className="reg-card">
            <div className="form-group" style={{marginBottom:16}}>
              <label>Referred By (Type)</label>
              <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                {REFERRAL_TYPES.map(t => (
                  <label key={t} style={{display:'flex',alignItems:'center',gap:6,cursor:'pointer',padding:'6px 12px',borderRadius:6,border:`1.5px solid ${form.referredDoctor?.type===t?'var(--teal)':'var(--border)'}`,fontSize:12,fontWeight:600,background:form.referredDoctor?.type===t?'var(--teal-light)':'transparent'}}>
                    <input type="radio" value={t} checked={form.referredDoctor?.type===t} onChange={()=>setDoctorField('type',t)} style={{display:'none'}} />
                    {t}
                  </label>
                ))}
              </div>
            </div>

            {/* Doctor name with saved doctors dropdown */}
            <div className="form-group" style={{marginBottom:12,position:'relative'}}>
              <label>Doctor / Centre Name</label>
              <div style={{display:'flex',gap:8}}>
                <div style={{flex:1,position:'relative'}}>
                  <input
                    value={doctorSearch||form.referredDoctor?.name||''}
                    onChange={e => { setDoctorSearch(e.target.value); setDoctorField('name',e.target.value); setShowDoctorDropdown(true) }}
                    onFocus={() => setShowDoctorDropdown(true)}
                    onBlur={() => setTimeout(()=>setShowDoctorDropdown(false),200)}
                    placeholder="Search saved or type new..."
                  />
                  {showDoctorDropdown && filteredDoctors.length > 0 && (
                    <div style={{position:'absolute',top:'100%',left:0,right:0,background:'white',border:'1.5px solid var(--border)',borderRadius:8,boxShadow:'var(--shadow)',zIndex:50,maxHeight:200,overflowY:'auto'}}>
                      {filteredDoctors.map(d => (
                        <button key={d._id} type="button" onClick={() => selectDoctor(d)}
                          style={{display:'flex',flexDirection:'column',alignItems:'flex-start',padding:'8px 12px',borderBottom:'1px solid var(--border)',width:'100%',textAlign:'left',background:'none',cursor:'pointer'}}
                          onMouseEnter={e=>e.currentTarget.style.background='var(--bg)'}
                          onMouseLeave={e=>e.currentTarget.style.background='none'}>
                          <span style={{fontWeight:700,fontSize:13}}>{d.name}</span>
                          <span style={{fontSize:11,color:'var(--text-3)'}}>{d.qualification||d.type}{d.city?` · ${d.city}`:''}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <button type="button" className="btn btn--secondary btn--sm" onClick={saveCurrentDoctor} disabled={savingDoctor||!form.referredDoctor?.name}>
                  {savingDoctor?'Saving…':'💾 Save Doctor'}
                </button>
              </div>
            </div>

            <div className="form-grid-2">
              <div className="form-group"><label>Qualification / Designation</label><input value={form.referredDoctor?.qualification||''} onChange={e=>setDoctorField('qualification',e.target.value)} placeholder="MBBS, MD, MS..." /></div>
              <div className="form-group"><label>Registration No.</label><input value={form.referredDoctor?.regNo||''} onChange={e=>setDoctorField('regNo',e.target.value)} placeholder="Medical reg. number" /></div>
              <div className="form-group"><label>Mobile No.</label><input value={form.referredDoctor?.phone||''} onChange={e=>setDoctorField('phone',e.target.value)} placeholder="Doctor's mobile" /></div>
              <div className="form-group"><label>City</label><input value={form.referredDoctor?.city||''} onChange={e=>setDoctorField('city',e.target.value)} /></div>
              <div className="form-group" style={{gridColumn:'1/-1'}}>
                <label>Doctor's Address / Clinic Address</label>
                <input value={form.referredDoctor?.address||''} onChange={e=>setDoctorField('address',e.target.value)} placeholder="Full address" />
              </div>
            </div>

            {/* Referral slip scan */}
            <div style={{marginTop:16}}>
              <div style={{fontWeight:700,fontSize:12,color:'var(--text-2)',textTransform:'uppercase',letterSpacing:'.04em',marginBottom:8}}>Referral Slip Scan (optional)</div>
              <FileUpload
                label="Referral Slip"
                hint="Scan of the referring doctor's slip · JPG/PDF"
                value={form.referralSlip}
                folder="referral-slips"
                accept="image/*,application/pdf"
                onUpload={(url,fid) => setForm(f => ({...f, referralSlip:url, referralSlipId:fid}))}
              />
            </div>

            <div style={{display:'flex',justifyContent:'space-between',marginTop:20}}>
              <button type="button" className="btn btn--secondary" onClick={()=>setActiveTab('identity')}>← Back</button>
              <button type="button" className="btn btn--primary" onClick={()=>setActiveTab('test')}>Next: Test & Payment →</button>
            </div>
          </div>
        )}

        {/* ── TAB 4: Test, Pregnancy & Payment ── */}
        {activeTab==='test' && (
          <div className="reg-card">
            {/* LMP + Pregnancy */}
            {(form.gender==='Female') && (
              <div style={{background:'var(--teal-50)',border:'1px solid var(--teal-light)',borderRadius:10,padding:16,marginBottom:18}}>
                <div style={{fontWeight:700,fontSize:13,marginBottom:12,color:'var(--teal-dark)'}}>🤱 Pregnancy Details</div>
                <div className="form-grid-2">
                  <div className="form-group">
                    <label>Last Menstrual Period (LMP)</label>
                    <input type="date" value={form.lmp} onChange={handleLmpChange} max={new Date().toISOString().split('T')[0]} />
                  </div>
                  <div className="form-group">
                    <label>EDD (auto-calculated)</label>
                    <input type="date" value={form.edd} onChange={e=>setField('edd',e.target.value)} readOnly={!!form.lmp} style={{background: form.lmp?'var(--bg)':undefined}} />
                  </div>
                  <div className="form-group">
                    <label>Weeks of Pregnancy</label>
                    <input type="number" value={form.weeksOfPregnancy} onChange={e=>setField('weeksOfPregnancy',e.target.value)} min={0} max={45} />
                  </div>
                  <div className="form-group">
                    <label>Additional Days</label>
                    <input type="number" value={form.daysOfPregnancy} onChange={e=>setField('daysOfPregnancy',e.target.value)} min={0} max={6} />
                  </div>
                </div>
                {form.weeksOfPregnancy > 0 && (
                  <div style={{marginTop:12}}>
                    <div style={{fontSize:11,fontWeight:700,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'.05em',marginBottom:8}}>
                      Upcoming Tests (from week {form.weeksOfPregnancy})
                    </div>
                    <div style={{display:'flex',flexDirection:'column',gap:6}}>
                      {upcomingTests.map((s,i) => (
                        <div key={i} style={{display:'flex',alignItems:'center',gap:10,padding:'7px 10px',background:'white',borderRadius:7,fontSize:12}}>
                          <span className={`badge badge--${s.type==='Blood'?'red':'teal'}`} style={{fontSize:10,flexShrink:0}}>{s.type}</span>
                          <span style={{fontWeight:600}}>Wk {s.weekFrom}–{s.weekTo}: {s.test}</span>
                          <span style={{color:'var(--text-3)',fontSize:11,marginLeft:'auto'}}>{s.notes}</span>
                        </div>
                      ))}
                      {upcomingTests.length===0 && <div style={{fontSize:12,color:'var(--text-3)'}}>Near or at term — no further scheduled scans</div>}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Test selection */}
            <div className="form-grid-2" style={{marginBottom:14}}>
              <div className="form-group">
                <label>Test Category *</label>
                <select value={form.testCategoryId} onChange={handleCategoryChange} required>
                  <option value="">Select category…</option>
                  {testCats.filter(c=>c.isActive).map(c => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Sub-Test *</label>
                <select value={form.testId} onChange={handleSubTestChange} required disabled={!form.testCategoryId}>
                  <option value="">Select test…</option>
                  {subTests.map(s => (
                    <option key={s._id} value={s._id}>{s.name} — ₹{s.price}{s.fformRequired?' 📋':''}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* F-Form required toggle */}
            <label className="fform-toggle" style={{display:'flex',alignItems:'center',gap:10,marginBottom:16,cursor:'pointer',padding:'10px 14px',background:form.fformRequired?'var(--teal-light)':'var(--bg)',borderRadius:8,border:`1.5px solid ${form.fformRequired?'var(--teal)':'var(--border)'}`,transition:'all .15s'}}>
              <input type="checkbox" checked={form.fformRequired} onChange={e=>setField('fformRequired',e.target.checked)} style={{width:16,height:16,accentColor:'var(--teal)'}} />
              <div>
                <div style={{fontWeight:700,fontSize:13,color:form.fformRequired?'var(--teal-dark)':'var(--text-1)'}}>📋 F-Form Required</div>
                <div style={{fontSize:11,color:'var(--text-2)',marginTop:1}}>Tick if clinical findings form must be filled for this patient</div>
              </div>
              {form.fformRequired && <span className="badge badge--teal" style={{marginLeft:'auto'}}>Required</span>}
            </label>

            {/* Payment */}
            <div className="form-grid-2">
              <div className="form-group">
                <label>Fee (₹) *</label>
                <input type="number" value={form.fee} onChange={e=>setField('fee',e.target.value)} required min={0} />
              </div>
              <div className="form-group">
                <label>Payment Mode</label>
                <select {...inp('paymentMode')}>
                  {PAY_MODES.map(m => <option key={m}>{m.charAt(0).toUpperCase()+m.slice(1)}</option>)}
                </select>
              </div>
            </div>
            <label style={{display:'flex',alignItems:'center',gap:8,cursor:'pointer',marginBottom:16,marginTop:4}}>
              <input type="checkbox" checked={form.isPaid} onChange={e=>setField('isPaid',e.target.checked)} style={{width:16,height:16,accentColor:'var(--teal)'}} />
              <span style={{fontSize:13,fontWeight:600}}>Mark as Paid</span>
            </label>

            <div style={{display:'flex',justifyContent:'space-between',marginTop:8}}>
              <button type="button" className="btn btn--secondary" onClick={()=>setActiveTab('referral')}>← Back</button>
              <button type="submit" className="btn btn--primary btn--lg" disabled={loading}>
                {loading ? <><span className="lp__spinner"/>Registering…</> : '✅ Register Patient'}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  )
}
