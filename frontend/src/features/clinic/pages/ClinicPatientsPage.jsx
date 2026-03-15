import { printPatientRecordById } from '../../reception/components/PatientRecordSheet'
import { useState, useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import api from '../../../services/api'
import { useAuth } from '../../auth/hooks/useAuth'

export default function ClinicPatientsPage() {
  const { user } = useAuth()
  const [patients, setPatients] = useState([])
  const [search, setSearch]     = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const ref = useRef(null)

  useEffect(() => {
    gsap.fromTo(ref.current,{y:-16,opacity:0},{y:0,opacity:1,duration:.5})
    fetch()
  },[])

  const fetch = async (s=search, d=dateFilter) => {
    const params = new URLSearchParams()
    if(s) params.append('search',s)
    if(d) params.append('date',d)
    try {
      const r = await api.get(`/patients?${params}`)
      setPatients(r.data.patients||[])
    } catch(e){}
  }

  useEffect(()=>{ const t=setTimeout(()=>fetch(search,dateFilter),300); return()=>clearTimeout(t) },[search])

  return (
    <div style={{maxWidth:1300}}>
      <div className="page-header" ref={ref}>
        <div><h1>All Patients</h1><p>Search across all patient records</p></div>
      </div>
      <div style={{display:'flex',gap:'10px',marginBottom:'16px'}}>
        <div className="search-bar" style={{flex:1}}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input placeholder="Search by name, phone, referral..." value={search} onChange={e=>setSearch(e.target.value)} />
        </div>
        <input type="date" value={dateFilter} onChange={e=>{setDateFilter(e.target.value);fetch(search,e.target.value)}}
          style={{padding:'8px 12px',border:'1.5px solid var(--border)',borderRadius:'6px',fontSize:'13px',fontFamily:'inherit',outline:'none'}}/>
        {(search||dateFilter)&&<button className="btn btn--secondary" onClick={()=>{setSearch('');setDateFilter('');fetch('','')}}>Clear</button>}
      </div>
      <div className="card" style={{overflow:'hidden'}}>
        <table className="data-table">
          <thead><tr><th>#</th><th>Patient</th><th>Contact</th><th>Test</th><th>Fee</th><th>Ref By</th><th>Status</th><th>Registered</th><th>By</th></tr></thead>
          <tbody>
            {patients.map((p,i)=>(
              <tr key={p._id}>
                <td className="td-mono">#{String(p.tokenNo||i+1).padStart(3,'0')}</td>
                <td>
                  <div className="td-name">{p.name}</div>
                  <div className="td-muted">
                    {p.age}y · {p.gender}
                    {p.relativeName ? ` · ${p.relationType||'H/O'}: ${p.relativeName}` :
                     p.husbandName  ? ` · H/O: ${p.husbandName}` : ''}
                  </div>
                  {p.fformRequired && <span className="badge badge--teal" style={{fontSize:9,marginTop:3}}>📋 F-Form</span>}
                </td>
                <td className="td-muted">{p.phone}</td>
                <td><div style={{fontSize:'12.5px',fontWeight:600}}>{p.testName}</div><div className="td-muted">{p.testCategory}</div></td>
                <td><div style={{fontFamily:'var(--font-num)',fontWeight:700}}>₹{p.fee}</div><span className={`badge badge--${p.isPaid?'green':'amber'}`} style={{fontSize:'10px'}}>{p.isPaid?'Paid':'Pending'}</span></td>
                <td className="td-muted">{p.referredDoctor?.name || p.referredBy || 'Self'}</td>
                <td><span className={`badge badge--${p.status==='waiting'?'amber':p.status==='in_progress'?'blue':p.status==='completed'?'green':'gray'}`}>{p.status.replace('_',' ')}</span></td>
                <td className="td-muted">{new Date(p.visitDate).toLocaleDateString('en-IN')}</td>
                <td className="td-muted">{p.registeredBy?.name?.split(' ')[0]||'—'}</td>
              </tr>
            ))}
            {patients.length===0&&<tr><td colSpan={9} className="empty-row">No patients found</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}
