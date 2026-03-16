import { useState, useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import api from '../../../services/api'
import { useAuth } from '../../auth/hooks/useAuth'
import { printPatientRecordById } from '../../reception/components/PatientRecordSheet'

// ── Patient Detail Modal ────────────────────────────────────────────────
function PatientDetailModal({ patient: p, onClose, onPrint }) {
  if (!p) return null
  const fmt = d => d ? new Date(d).toLocaleDateString('en-IN', {day:'2-digit',month:'2-digit',year:'numeric'}) : '—'

  const rows = [
    ['Full Name',    p.name],
    ['Date of Birth',p.dob ? fmt(p.dob) : '—'],
    ['Age / Gender', `${p.age} ${p.ageUnit||'yrs'} / ${p.gender}`],
    [p.relationType||"Husband's Name", p.relativeName || p.husbandName || '—'],
    ['Phone',        p.phone || '—'],
    ['Email',        p.email || '—'],
    ['Address',      [p.address,p.district,p.state].filter(Boolean).join(', ') || '—'],
    ['Area Type',    p.areaType || '—'],
    ['PCTS ID',      p.pctsId || '—'],
    ['Patient Reg. Date', p.patientRegDate ? fmt(p.patientRegDate) : '—'],
    ['Living Children', `♂ ${p.livingChildrenMale||0} · ♀ ${p.livingChildrenFemale||0}`],
    ['LMP',          p.lmp ? fmt(p.lmp) : '—'],
    ['Weeks',        p.weeksOfPregnancy != null ? `${p.weeksOfPregnancy}w ${p.daysOfPregnancy||0}d` : '—'],
    ['EDD',          p.edd ? fmt(p.edd) : '—'],
    ['Test Category',p.testCategory || '—'],
    ['Test Name',    p.testName || '—'],
    ['Fee',          p.fee ? `₹${p.fee}` : '—'],
    ['Payment',      p.isPaid ? `✓ Paid · ${p.paymentMode}` : `Pending · ${p.paymentMode}`],
    ['Status',       p.status?.replace('_',' ')],
    ['Token No.',    `#${String(p.tokenNo||0).padStart(3,'0')}`],
    ['Visit Date',   fmt(p.visitDate || p.createdAt)],
    ['Registered By',p.registeredBy?.name || '—'],
  ]

  return (
    <div className="modal-overlay" onClick={e => e.target===e.currentTarget && onClose()}>
      <div className="modal modal--xl" style={{maxHeight:'90vh'}}>
        <div className="modal__header">
          <div>
            <h2>{p.name}</h2>
            <div style={{fontSize:11,color:'var(--text-3)',marginTop:2}}>
              Token #{String(p.tokenNo||0).padStart(3,'0')} · {p.testName} · {fmt(p.visitDate||p.createdAt)}
            </div>
          </div>
          <div style={{display:'flex',gap:8,alignItems:'center'}}>
            <button className="btn btn--primary btn--sm" onClick={()=>{onPrint(p._id);onClose()}}>
              🖨 Print Record Sheet
            </button>
            <button className="modal__close" onClick={onClose}>✕</button>
          </div>
        </div>

        <div className="modal__body">
          {/* Patient details grid */}
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:0,border:'1px solid var(--border)',borderRadius:8,overflow:'hidden',marginBottom:16}}>
            {rows.map(([l,v]) => (
              <div key={l} style={{padding:'7px 12px',borderBottom:'1px solid var(--border)',borderRight:'1px solid var(--border)',display:'flex',flexDirection:'column',gap:1}}>
                <div style={{fontSize:9.5,fontWeight:700,textTransform:'uppercase',color:'var(--text-3)',letterSpacing:'.04em'}}>{l}</div>
                <div style={{fontSize:12.5,fontWeight:600,color:
                  l==='Payment' ? (p.isPaid?'var(--green)':'var(--amber)') :
                  l==='Status'  ? (p.status==='completed'?'var(--green)':p.status==='in_progress'?'var(--blue)':'#D97706') : 'var(--text-1)'
                }}>{v||'—'}</div>
              </div>
            ))}
          </div>

          {/* Referred doctor */}
          {(p.referredDoctor?.name || p.referredBy) && (
            <div style={{marginBottom:16}}>
              <div style={{fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:'.05em',color:'var(--text-3)',marginBottom:8}}>Referred By</div>
              <div style={{background:'var(--bg)',borderRadius:8,padding:'10px 14px',display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10}}>
                {[
                  ['Name',          p.referredDoctor?.name || p.referredBy],
                  ['Type',          p.referredDoctor?.type || 'Doctor'],
                  ['Qualification', p.referredDoctor?.qualification || '—'],
                  ['Phone',         p.referredDoctor?.phone || '—'],
                  ['Reg. No.',      p.referredDoctor?.regNo || '—'],
                  ['Address',       [p.referredDoctor?.address,p.referredDoctor?.city].filter(Boolean).join(', ')||'—'],
                ].map(([l,v]) => (
                  <div key={l}>
                    <div style={{fontSize:9.5,fontWeight:700,textTransform:'uppercase',color:'var(--text-3)'}}>{l}</div>
                    <div style={{fontSize:12,fontWeight:600,marginTop:1}}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ID Proof */}
          {(p.idProofType || p.idProofFront || p.idProofBack) && (
            <div style={{marginBottom:16}}>
              <div style={{fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:'.05em',color:'var(--text-3)',marginBottom:8}}>
                Identity Document
              </div>
              <div style={{background:'var(--bg)',borderRadius:8,padding:'10px 14px'}}>
                <div style={{display:'flex',gap:20,marginBottom:10}}>
                  <div>
                    <div style={{fontSize:9.5,fontWeight:700,textTransform:'uppercase',color:'var(--text-3)'}}>Type</div>
                    <div style={{fontSize:13,fontWeight:700,marginTop:1}}>{p.idProofType||'—'}</div>
                  </div>
                  <div>
                    <div style={{fontSize:9.5,fontWeight:700,textTransform:'uppercase',color:'var(--text-3)'}}>Number</div>
                    <div style={{fontSize:13,fontWeight:700,fontFamily:'var(--font-num)',marginTop:1}}>{p.idProofNo||'—'}</div>
                  </div>
                </div>
                {(p.idProofFront || p.idProofBack) && (
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
                    {[['Front Side',p.idProofFront],['Back Side',p.idProofBack]].map(([label,url]) => (
                      <div key={label}>
                        <div style={{fontSize:9.5,fontWeight:700,color:'var(--text-3)',marginBottom:4,textTransform:'uppercase'}}>{label}</div>
                        {url
                          ? <a href={url} target="_blank" rel="noreferrer">
                              <img src={url} alt={label} style={{width:'100%',maxHeight:120,objectFit:'contain',border:'1px solid var(--border)',borderRadius:6,cursor:'pointer'}} />
                            </a>
                          : <div style={{height:80,background:'var(--border)',borderRadius:6,display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,color:'var(--text-3)'}}>Not uploaded</div>
                        }
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Referral slip */}
          {p.referralSlip && (
            <div style={{marginBottom:16}}>
              <div style={{fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:'.05em',color:'var(--text-3)',marginBottom:8}}>Referral Slip</div>
              <a href={p.referralSlip} target="_blank" rel="noreferrer">
                <img src={p.referralSlip} alt="Referral Slip"
                  style={{width:'100%',maxHeight:200,objectFit:'contain',objectPosition:'top',border:'1px solid var(--border)',borderRadius:8,cursor:'pointer'}} />
              </a>
            </div>
          )}

          {/* Report */}
          {p.reportUrl && (
            <div>
              <div style={{fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:'.05em',color:'var(--text-3)',marginBottom:8}}>Report / Findings</div>
              <a href={p.reportUrl} target="_blank" rel="noreferrer">
                <img src={p.reportUrl} alt="Report"
                  style={{width:'100%',maxHeight:200,objectFit:'contain',objectPosition:'top',border:'1px solid var(--border)',borderRadius:8,cursor:'pointer'}} />
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Main Page ───────────────────────────────────────────────────────────
export default function ClinicPatientsPage() {
  const { user } = useAuth()
  const [patients, setPatients] = useState([])
  const [search, setSearch]     = useState('')
  const [dateFilter, setDate]   = useState('')
  const [selected, setSelected] = useState(null)
  const ref = useRef(null)

  useEffect(() => {
    if (ref.current) gsap.fromTo(ref.current,{y:-16,opacity:0},{y:0,opacity:1,duration:.5})
    loadPatients()
  }, [])

  const loadPatients = async (s=search, d=dateFilter) => {
    const params = new URLSearchParams()
    if (s) params.append('search', s)
    if (d) params.append('date', d)
    try {
      const r = await api.get(`/patients?${params}`)
      setPatients(r.data.patients || [])
    } catch(e) {}
  }

  useEffect(() => {
    const t = setTimeout(() => loadPatients(search, dateFilter), 300)
    return () => clearTimeout(t)
  }, [search])

  // When clicking a row — fetch full patient data (with docs) then show modal
  const handleRowClick = async (id) => {
    try {
      const r = await api.get(`/patients/${id}/full`)
      setSelected(r.data.patient)
    } catch(e) {}
  }

  const handlePrint = (id) => printPatientRecordById(id)

  return (
    <div style={{maxWidth:1400}}>
      <div className="page-header" ref={ref}>
        <div>
          <h1>All Patients</h1>
          <p>Search and view complete patient records · Click any row to view details</p>
        </div>
      </div>

      {/* Filters */}
      <div style={{display:'flex',gap:10,marginBottom:16,flexWrap:'wrap'}}>
        <div className="search-bar" style={{flex:1,minWidth:220}}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input placeholder="Search by name, phone, referral..." value={search}
            onChange={e => setSearch(e.target.value)} />
        </div>
        <input type="date" value={dateFilter}
          onChange={e => { setDate(e.target.value); loadPatients(search, e.target.value) }}
          style={{padding:'8px 12px',border:'1.5px solid var(--border)',borderRadius:6,fontSize:13,fontFamily:'inherit',outline:'none'}} />
        {(search||dateFilter) && (
          <button className="btn btn--secondary"
            onClick={() => { setSearch(''); setDate(''); loadPatients('','') }}>
            Clear
          </button>
        )}
        <span style={{fontSize:13,color:'var(--text-3)',alignSelf:'center'}}>{patients.length} records</span>
      </div>

      {/* Table */}
      <div className="card table-scroll">
        <table className="data-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Patient</th>
              <th>Contact</th>
              <th>Test</th>
              <th>Fee</th>
              <th>Docs</th>
              <th>Ref By</th>
              <th>Status</th>
              <th>Date</th>
              <th>By</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {patients.map((p, i) => (
              <tr key={p._id} style={{cursor:'pointer'}}
                onClick={() => handleRowClick(p._id)}
                onMouseEnter={e => e.currentTarget.style.background='#F8FBFF'}
                onMouseLeave={e => e.currentTarget.style.background=''}>

                <td className="td-mono">#{String(p.tokenNo||i+1).padStart(3,'0')}</td>

                <td>
                  <div className="td-name">{p.name}</div>
                  <div className="td-muted">
                    {p.age}y · {p.gender}
                    {p.relativeName ? ` · ${p.relationType||'H/O'}: ${p.relativeName}` :
                     p.husbandName  ? ` · H/O: ${p.husbandName}` : ''}
                  </div>
                  {p.fformRequired && (
                    <span className="badge badge--teal" style={{fontSize:9,marginTop:2}}>📋 F-Form</span>
                  )}
                </td>

                <td className="td-muted">{p.phone}</td>

                <td>
                  <div style={{fontSize:12.5,fontWeight:600}}>{p.testName}</div>
                  <div className="td-muted">{p.testCategory}</div>
                </td>

                <td>
                  <div style={{fontFamily:'var(--font-num)',fontWeight:700}}>₹{p.fee}</div>
                  <span className={`badge badge--${p.isPaid?'green':'amber'}`} style={{fontSize:10}}>
                    {p.isPaid?'Paid':'Pending'}
                  </span>
                </td>

                {/* Docs indicator */}
                <td>
                  <div style={{display:'flex',gap:3,flexWrap:'wrap'}}>
                    {p.idProofFront && <span title="ID Proof" style={{fontSize:13}}>🪪</span>}
                    {p.referralSlip && <span title="Referral Slip" style={{fontSize:13}}>📄</span>}
                    {p.reportUrl    && <span title="Report" style={{fontSize:13}}>🔬</span>}
                    {!p.idProofFront && !p.referralSlip && !p.reportUrl &&
                      <span style={{fontSize:11,color:'var(--text-3)'}}>—</span>
                    }
                  </div>
                </td>

                <td className="td-muted">{p.referredDoctor?.name || p.referredBy || 'Self'}</td>

                <td>
                  <span className={`badge badge--${
                    p.status==='waiting'?'amber':
                    p.status==='in_progress'?'blue':
                    p.status==='completed'?'green':'gray'
                  }`}>
                    {p.status?.replace('_',' ')}
                  </span>
                </td>

                <td className="td-muted" style={{whiteSpace:'nowrap'}}>
                  {new Date(p.visitDate||p.createdAt).toLocaleDateString('en-IN')}
                </td>

                <td className="td-muted">{p.registeredBy?.name?.split(' ')[0]||'—'}</td>

                <td onClick={e => e.stopPropagation()}>
                  <button
                    className="btn btn--primary btn--sm"
                    title="Print A4 Record Sheet"
                    onClick={() => handlePrint(p._id)}>
                    🖨
                  </button>
                </td>
              </tr>
            ))}
            {patients.length === 0 && (
              <tr><td colSpan={11} className="empty-row">No patients found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Detail modal */}
      {selected && (
        <PatientDetailModal
          patient={selected}
          onClose={() => setSelected(null)}
          onPrint={handlePrint}
        />
      )}
    </div>
  )
}
