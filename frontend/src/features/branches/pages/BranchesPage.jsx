import { useState, useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { useAuth } from '../../auth/hooks/useAuth'
import api from '../../../services/api'

const DEF = { name:'', branchName:'', address:'', city:'', state:'', phone:'', email:'', ownerName:'', ownerEmail:'', ownerPassword:'', ownerPhone:'' }

export default function BranchesPage() {
  const { user } = useAuth()
  const [data, setData]         = useState({ branches:[], parentStats:{}, totalRevenue:0, totalPatients:0 })
  const [showModal, setShowModal] = useState(false)
  const [form, setForm]         = useState(DEF)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const ref = useRef(null)

  useEffect(() => {
    if (ref.current) gsap.fromTo(ref.current, {y:-16,opacity:0}, {y:0,opacity:1,duration:.5})
    fetchBranches()
  }, [])

  const fetchBranches = async () => {
    try { const r = await api.get('/clinics/my/branches'); setData(r.data) } catch(e) { setError(e.response?.data?.error || 'Failed to load branches') }
  }

  const handleSubmit = async e => {
    e.preventDefault(); setError(''); setLoading(true)
    try { await api.post('/clinics/my/branches', form); setShowModal(false); setForm(DEF); fetchBranches() }
    catch(err) { setError(err.response?.data?.error || 'Failed to add branch') }
    finally { setLoading(false) }
  }

  const f = k => ({ value: form[k], onChange: e => setForm({...form,[k]:e.target.value}) })

  const { branches, parentStats, totalRevenue, totalPatients } = data
  const mainName = user?.clinic?.name || 'Main Clinic'

  return (
    <div style={{maxWidth:1100}}>
      <div className="page-header" ref={ref}>
        <div>
          <h1>Branches</h1>
          <p>Manage clinic branches and view consolidated data</p>
        </div>
        <button className="btn btn--primary" onClick={() => setShowModal(true)}>+ Add Branch</button>
      </div>

      {/* Consolidated totals */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:14,marginBottom:24}}>
        {[
          { label:'Total Patients (All)', val:totalPatients, c:'var(--teal)' },
          { label:'Total Revenue (All)',  val:`₹${(totalRevenue||0).toLocaleString('en-IN')}`, c:'var(--green)' },
          { label:'Branches',             val:branches.length, c:'var(--purple)' },
        ].map(s => (
          <div key={s.label} className="card" style={{padding:18,borderTop:`3px solid ${s.c}`,textAlign:'center'}}>
            <div style={{fontFamily:'var(--font-num)',fontSize:26,fontWeight:800,color:s.c}}>{s.val}</div>
            <div style={{fontSize:11,color:'var(--text-2)',fontWeight:600,marginTop:3}}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Branch comparison grid */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:14}}>
        {/* Main clinic card */}
        <div className="card" style={{padding:20,borderLeft:'3px solid var(--teal)'}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}>
            <div>
              <div style={{fontWeight:700,fontSize:14}}>{mainName}</div>
              <span className="badge badge--teal" style={{marginTop:4}}>Main Clinic</span>
            </div>
            <div style={{textAlign:'right'}}>
              <span className="badge badge--green">Active</span>
            </div>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
            <div style={{background:'var(--bg)',borderRadius:8,padding:'10px 12px',textAlign:'center'}}>
              <div style={{fontFamily:'var(--font-num)',fontSize:20,fontWeight:800,color:'var(--teal)'}}>{parentStats.patients||0}</div>
              <div style={{fontSize:10,color:'var(--text-3)',fontWeight:600,marginTop:2}}>PATIENTS</div>
            </div>
            <div style={{background:'var(--bg)',borderRadius:8,padding:'10px 12px',textAlign:'center'}}>
              <div style={{fontFamily:'var(--font-num)',fontSize:18,fontWeight:800,color:'var(--green)'}}>₹{(parentStats.revenue||0).toLocaleString('en-IN')}</div>
              <div style={{fontSize:10,color:'var(--text-3)',fontWeight:600,marginTop:2}}>REVENUE</div>
            </div>
          </div>
        </div>

        {/* Branch cards */}
        {branches.map(b => (
          <div key={b._id} className="card" style={{padding:20,borderLeft:'3px solid var(--purple)'}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}>
              <div>
                <div style={{fontWeight:700,fontSize:14}}>{b.branchName || b.name}</div>
                <div style={{fontSize:11,color:'var(--text-3)',marginTop:1}}>{b.city}{b.city&&b.state?', ':''}{b.state}</div>
                <span className="badge badge--purple" style={{marginTop:4}}>Branch</span>
              </div>
              <span className={`badge badge--${b.isActive?'green':'red'}`}>{b.isActive?'Active':'Off'}</span>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:10}}>
              <div style={{background:'var(--bg)',borderRadius:8,padding:'10px 12px',textAlign:'center'}}>
                <div style={{fontFamily:'var(--font-num)',fontSize:20,fontWeight:800,color:'var(--purple)'}}>{b._patientCount||0}</div>
                <div style={{fontSize:10,color:'var(--text-3)',fontWeight:600,marginTop:2}}>PATIENTS</div>
              </div>
              <div style={{background:'var(--bg)',borderRadius:8,padding:'10px 12px',textAlign:'center'}}>
                <div style={{fontFamily:'var(--font-num)',fontSize:18,fontWeight:800,color:'var(--green)'}}>₹{(b._revenue||0).toLocaleString('en-IN')}</div>
                <div style={{fontSize:10,color:'var(--text-3)',fontWeight:600,marginTop:2}}>REVENUE</div>
              </div>
            </div>
            <div style={{fontSize:11,color:'var(--text-3)'}}>Owner: {b.owner?.name} · {b.owner?.email}</div>
          </div>
        ))}

        {branches.length === 0 && (
          <div className="card" style={{padding:40,textAlign:'center',color:'var(--text-3)'}}>
            No branches yet. Add your first branch location.
          </div>
        )}
      </div>

      {/* Add Branch Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target===e.currentTarget && setShowModal(false)}>
          <div className="modal modal--wide">
            <div className="modal__header">
              <h2>Add Branch</h2>
              <button className="modal__close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            {error && <div className="alert alert--error" style={{margin:'0 20px'}}>{error}</div>}
            <form onSubmit={handleSubmit} className="modal__form">
              <div className="modal__section">Branch Details</div>
              <div className="form-grid-2">
                <div className="form-group"><label>Clinic Name *</label><input {...f('name')} required placeholder={mainName} /></div>
                <div className="form-group"><label>Branch Name *</label><input {...f('branchName')} required placeholder="e.g. North Branch, Satellite Centre" /></div>
                <div className="form-group"><label>City</label><input {...f('city')} /></div>
                <div className="form-group"><label>State</label><input {...f('state')} /></div>
                <div className="form-group"><label>Phone</label><input {...f('phone')} /></div>
                <div className="form-group"><label>Email</label><input type="email" {...f('email')} /></div>
                <div className="form-group" style={{gridColumn:'1/-1'}}><label>Full Address</label><input {...f('address')} /></div>
              </div>
              <div className="modal__section">Branch Manager Account</div>
              <div className="form-grid-2">
                <div className="form-group"><label>Manager Name *</label><input {...f('ownerName')} required /></div>
                <div className="form-group"><label>Manager Email *</label><input type="email" {...f('ownerEmail')} required /></div>
                <div className="form-group"><label>Password *</label><input type="password" {...f('ownerPassword')} required minLength={6} /></div>
                <div className="form-group"><label>Manager Phone</label><input {...f('ownerPhone')} /></div>
              </div>
              <div style={{background:'var(--teal-light)',borderRadius:8,padding:'10px 14px',fontSize:12,color:'var(--teal-dark)'}}>
                ℹ️ The branch inherits test categories and fees from your main clinic. The subscription plan is shared.
              </div>
            </form>
            <div className="modal__footer">
              <button className="btn btn--secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn--primary" onClick={handleSubmit} disabled={loading}>{loading?'Creating…':'Create Branch'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
