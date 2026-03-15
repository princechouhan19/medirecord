import { useState, useEffect } from 'react'
import { useAuth } from '../../auth/hooks/useAuth'
import api from '../../../services/api'
import FFormView from '../components/FFormView'
import '../styles/fform.scss'

// ── 23 USG Indications from Government Form F ──────────────────────────
const USG_INDICATIONS = [
  { key:'i_viability',           label:'1. To diagnose intra-uterine and/or ectopic pregnancy and confirm viability' },
  { key:'ii_dating',             label:'2. Estimation of gestational age (dating)' },
  { key:'iii_fetuses',           label:'3. Detection of number of fetuses and their chorionicity' },
  { key:'iv_iucd_mtp',           label:'4. Suspected pregnancy with IUCD in-situ or suspected pregnancy following contraceptive failure / MTP failure' },
  { key:'v_bleeding',            label:'5. Vaginal bleeding / leaking' },
  { key:'vi_abortion',           label:'6. Follow-up of case of abortion' },
  { key:'vii_cervical',          label:'7. Assessment of cervical canal and diameter of internal os' },
  { key:'viii_discrepancy',      label:'8. Discrepancy between uterine size and period of amenorrhoea' },
  { key:'ix_adnexal',            label:'9. Any suspected adnexal or uterine pathology / abnormality' },
  { key:'x_chromosomal',         label:'10. Detection of chromosomal abnormalities, foetal structural defects and other abnormalities and their follow-up' },
  { key:'xi_presentation',       label:'11. To evaluate foetal presentation and position' },
  { key:'xii_liquor',            label:'12. Assessment of liquor amnii' },
  { key:'xiii_preterm',          label:'13. Preterm labour / preterm premature rupture of membranes' },
  { key:'xiv_placenta',          label:'14. Evaluation of placental position, thickness, grading and abnormalities (placenta praevia, retroplacental haemorrhage, abnormal adherence etc.)' },
  { key:'xv_umbilical',          label:'15. Evaluation of umbilical cord – presentation, insertion, nuchal encirclement, number of vessels and presence of true knot' },
  { key:'xvi_caesarean',         label:'16. Evaluation of previous Caesarean Section scars' },
  { key:'xvii_growth',           label:'17. Evaluation of foetal growth parameters, foetal weight and foetal well being' },
  { key:'xviii_doppler',         label:'18. Colour flow mapping and duplex Doppler studies' },
  { key:'xix_guided',            label:'19. Ultrasound guided procedures such as medical termination of pregnancy, external cephalic version etc. and their follow-up' },
  { key:'xx_invasive',           label:'20. Adjunct to diagnostic and therapeutic invasive interventions such as chorionic villus sampling (CVS), amniocenteses, foetal blood sampling, foetal skin biopsy, amnioinfusion, intrauterine infusion, placement of shunts etc.' },
  { key:'xxi_intrapartum',       label:'21. Observation of intra-partum events' },
  { key:'xxii_medical_surgical', label:'22. Medical / surgical conditions complicating pregnancy' },
  { key:'xxiii_research',        label:'23. Research / scientific studies in recognized institutions' },
]

const ICD10_MAP = {
  pregnancy:'Z34',obstetric:'Z34',usg:'Z36',antenatal:'Z34',ectopic:'O00',
  abortion:'O03',bleeding:'O20',preterm:'O60',placenta:'O44',iucd:'T83',
  growth:'O36',doppler:'O36',anomaly:'Q00',chromosomal:'Q99',twins:'O30',
  cervical:'N88',ovarian:'N83',fibroid:'D25',kidney:'N28',gallbladder:'K80',
  thyroid:'E04',hypertension:'O10',diabetes:'O24',fever:'R50',pain:'R10',
}

const EMPTY_INDICATIONS = Object.fromEntries(USG_INDICATIONS.map(i => [i.key, false]))

const EMPTY_FORM = {
  patient: '',
  sectionA: { doctorName:'', procedureDate:'', declarationDate:'', patientRegDate:'' },
  sectionB: {
    performedBy:'', indications: EMPTY_INDICATIONS, other:'',
    procedureType:'Ultrasound', procedureOther:'',
    resultBrief:'', conveyedTo:'', conveyedDate:'', mtpIndication:'',
  },
  sectionC: {
    enabled:false, performedBy:'', familyHistory:'',
    diagnosisBasis:{ clinical:false, biochemical:false, cytogenetic:false, other:'' },
    indications:{ chromosomal:false, metabolic:false, congenital:false, mentalDisability:false, haemoglobin:false, sexLinked:false, singleGene:false, advancedAge:false, genetic:'', other:'' },
    consentDate:'',
    procedure:{ amniocentesis:false, cvs:false, fetalBiopsy:false, cordocentesis:false, other:'' },
    complications:'', additionalTests:{ chromosomal:false, biochemical:false, molecular:false, preimplantation:false, other:'' },
    resultBrief:'', procedureDate:'', conveyedTo:'', conveyedDate:'', mtpIndication:'',
  },
  sectionD: { thumbImpression:false, witnessName:'', witnessAge:'', witnessSex:'', witnessRelation:'', witnessContact:'' },
  vitals:{ bp:'', pulse:'', temp:'', weight:'', height:'', spo2:'' },
  chiefComplaint:'', historyOfPresentIllness:'', pastMedicalHistory:'', familyHistory:'',
  allergies:'', currentMedications:'', physicalExamination:'', investigations:'',
  provisionalDiagnosis:'', differentialDiagnosis:'', treatmentPlan:'', prescriptions:'',
  followUpDate:'', icdCode:'', doctorNotes:'',
}

// ── Checkbox helper ────────────────────────────────────────────────────
function Checkbox({ checked, onChange, label, style }) {
  return (
    <label style={{ display:'flex', alignItems:'flex-start', gap:8, cursor:'pointer', lineHeight:1.4, fontSize:12.5, ...style }}>
      <input type="checkbox" checked={!!checked} onChange={e => onChange(e.target.checked)}
        style={{ width:14, height:14, accentColor:'var(--teal)', flexShrink:0, marginTop:2 }} />
      <span>{label}</span>
    </label>
  )
}

function TextInput({ label, value, onChange, placeholder, type='text', multiline }) {
  return (
    <div className="form-group">
      {label && <label>{label}</label>}
      {multiline
        ? <textarea value={value||''} onChange={e=>onChange(e.target.value)} placeholder={placeholder||''} />
        : <input type={type} value={value||''} onChange={e=>onChange(e.target.value)} placeholder={placeholder||''} />
      }
    </div>
  )
}

// ── Main Component ─────────────────────────────────────────────────────
export default function FFormPage() {
  const { user } = useAuth()
  const [tab, setTab]           = useState('new')   // 'new' | 'saved'
  const [patients, setPatients] = useState([])
  const [saved, setSaved]       = useState([])
  const [form, setForm]         = useState(EMPTY_FORM)
  const [viewForm, setViewForm] = useState(null)
  const [loading, setLoading]   = useState(false)
  const [msg, setMsg]           = useState('')
  const [err, setErr]           = useState('')
  const [activeSection, setActiveSection] = useState('A')

  useEffect(() => {
    api.get('/patients/today').then(r => setPatients(r.data.patients || [])).catch(()=>{})
    loadSaved()
  }, [])

  const loadSaved = async () => {
    try { const r = await api.get('/fform'); setSaved(r.data.forms || []) } catch(e){}
  }

  // Auto-suggest ICD-10 from chief complaint
  const handleComplaintChange = val => {
    setForm(f => ({ ...f, chiefComplaint: val }))
    const lower = val.toLowerCase()
    for (const [kw, code] of Object.entries(ICD10_MAP)) {
      if (lower.includes(kw)) { setForm(f => ({ ...f, icdCode: code })); break }
    }
  }

  // Set patient and pre-fill section A from patient data
  const handlePatientSelect = patientId => {
    const p = patients.find(pt => pt._id === patientId)
    if (!p) return setForm(f => ({ ...f, patient: patientId }))
    setForm(f => ({
      ...f,
      patient: patientId,
      sectionA: {
        doctorName: user?.name || '',
        procedureDate: new Date().toISOString().split('T')[0],
        declarationDate: new Date().toISOString().split('T')[0],
        patientRegDate: p.patientRegDate ? new Date(p.patientRegDate).toISOString().split('T')[0] : '',
      },
      sectionB: { ...f.sectionB, performedBy: user?.name || '' },
    }))
  }

  // Deep setters
  const setA = (k, v) => setForm(f => ({ ...f, sectionA: { ...f.sectionA, [k]: v } }))
  const setB = (k, v) => setForm(f => ({ ...f, sectionB: { ...f.sectionB, [k]: v } }))
  const setBInd = (k, v) => setForm(f => ({ ...f, sectionB: { ...f.sectionB, indications: { ...f.sectionB.indications, [k]: v } } }))
  const setC = (k, v) => setForm(f => ({ ...f, sectionC: { ...f.sectionC, [k]: v } }))
  const setCInd = (k, v) => setForm(f => ({ ...f, sectionC: { ...f.sectionC, indications: { ...f.sectionC.indications, [k]: v } } }))
  const setCProc = (k, v) => setForm(f => ({ ...f, sectionC: { ...f.sectionC, procedure: { ...f.sectionC.procedure, [k]: v } } }))
  const setCDiag = (k, v) => setForm(f => ({ ...f, sectionC: { ...f.sectionC, diagnosisBasis: { ...f.sectionC.diagnosisBasis, [k]: v } } }))
  const setCATests = (k, v) => setForm(f => ({ ...f, sectionC: { ...f.sectionC, additionalTests: { ...f.sectionC.additionalTests, [k]: v } } }))
  const setD = (k, v) => setForm(f => ({ ...f, sectionD: { ...f.sectionD, [k]: v } }))
  const setV = (k, v) => setForm(f => ({ ...f, vitals: { ...f.vitals, [k]: v } }))

  const handleSave = async () => {
    if (!form.patient) return setErr('Select a patient')
    setLoading(true); setErr(''); setMsg('')
    try {
      await api.post('/fform', form)
      setMsg('Form saved!'); loadSaved()
      setTimeout(() => { setMsg(''); setTab('saved') }, 1200)
    } catch(e) { setErr(e.response?.data?.error || 'Save failed') }
    finally { setLoading(false) }
  }

  const handleView = async id => {
    try { const r = await api.get(`/fform/${id}`); setViewForm(r.data.form) } catch(e) {}
  }

  const todayPatients = patients.filter(p => {
    const d = new Date(p.visitDate || p.createdAt)
    const today = new Date(); today.setHours(0,0,0,0)
    return d >= today
  })
  const olderPatients = patients.filter(p => !todayPatients.includes(p))

  const SECTIONS = ['A','B','C','D','Clinical']

  return (
    <div style={{maxWidth:1000}}>
      <div className="page-header">
        <div>
          <h1>Form F — PNDT Form</h1>
          <p>[See Proviso to Section 4(3), Rule 9(4) and Rule 10(1A)]</p>
        </div>
        <div style={{display:'flex',gap:8}}>
          <button className={`btn btn--${tab==='new'?'primary':'secondary'}`} onClick={()=>setTab('new')}>+ New Form</button>
          <button className={`btn btn--${tab==='saved'?'primary':'secondary'}`} onClick={()=>setTab('saved')}>📋 Saved ({saved.length})</button>
        </div>
      </div>

      {/* ── NEW FORM ── */}
      {tab==='new' && (
        <div>
          {err && <div className="alert alert--error" style={{marginBottom:14}}>{err}</div>}
          {msg && <div className="alert alert--success" style={{marginBottom:14}}>{msg}</div>}

          {/* Patient select */}
          <div className="card" style={{padding:16,marginBottom:16}}>
            <div className="form-group">
              <label>Select Patient *</label>
              <select value={form.patient} onChange={e=>handlePatientSelect(e.target.value)} required>
                <option value="">Select patient...</option>
                {todayPatients.length > 0 && (
                  <optgroup label="Today's Patients">
                    {todayPatients.map(p=>(
                      <option key={p._id} value={p._id}>
                        #{String(p.tokenNo).padStart(3,'0')} · {p.name} · {p.testName}
                        {p.fformRequired?' 📋':''}
                      </option>
                    ))}
                  </optgroup>
                )}
                {olderPatients.length > 0 && (
                  <optgroup label="Other Patients">
                    {olderPatients.map(p=>(
                      <option key={p._id} value={p._id}>
                        {p.name} · {p.testName} · {new Date(p.visitDate||p.createdAt).toLocaleDateString('en-IN')}
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>
            </div>
          </div>

          {/* Section tabs */}
          <div className="fform-sec-tabs">
            {SECTIONS.map(s => (
              <button key={s} className={`fform-sec-tab${activeSection===s?' fform-sec-tab--active':''}`}
                onClick={()=>setActiveSection(s)}>
                {s === 'Clinical' ? '🏥 Clinical' :
                 s === 'A' ? 'A: Basic' :
                 s === 'B' ? 'B: Non-Invasive' :
                 s === 'C' ? 'C: Invasive' : 'D: Declaration'}
              </button>
            ))}
          </div>

          <div className="fform-section-body">

            {/* ── SECTION A ── */}
            {activeSection==='A' && (
              <div>
                <div className="fform-sec-title">SECTION A — To be filled in for all Diagnostic Procedures / Tests</div>
                <div className="form-grid-2">
                  <TextInput label="Name of Performing Doctor / Radiologist" value={form.sectionA.doctorName} onChange={v=>setA('doctorName',v)} placeholder="Dr. Name, Qualification, Reg. No." />
                  <TextInput label="Patient Registration Date (PNDT)" value={form.sectionA.patientRegDate} onChange={v=>setA('patientRegDate',v)} type="date" />
                  <TextInput label="Date Declaration Obtained from Patient" value={form.sectionA.declarationDate} onChange={v=>setA('declarationDate',v)} type="date" />
                  <TextInput label="Date Procedure Carried Out" value={form.sectionA.procedureDate} onChange={v=>setA('procedureDate',v)} type="date" />
                </div>
                {form.patient && (() => {
                  const p = patients.find(pt=>pt._id===form.patient)
                  if (!p) return null
                  const lmp = p.lmp ? new Date(p.lmp).toLocaleDateString('en-IN') : '—'
                  const weeks = p.weeksOfPregnancy ? `${p.weeksOfPregnancy}w ${p.daysOfPregnancy||0}d` : '—'
                  return (
                    <div style={{background:'var(--bg)',borderRadius:8,padding:'12px 14px',marginTop:12,fontSize:12}}>
                      <div style={{fontWeight:700,marginBottom:8,fontSize:13}}>Patient Details (from registration)</div>
                      <div className="form-grid-2">
                        {[
                          ['Patient Name', p.name],
                          ['Age', `${p.age} ${p.ageUnit||'yrs'}`],
                          ['Gender', p.gender],
                          [p.relationType||'Husband', p.relativeName||p.husbandName||'—'],
                          ['Address', [p.address,p.district,p.state].filter(Boolean).join(', ')||'—'],
                          ['Phone', p.phone],
                          ['Living Children', `♂${p.livingChildrenMale||0} / ♀${p.livingChildrenFemale||0}`],
                          ['LMP / Weeks', `${lmp} / ${weeks}`],
                          ['Referred By', p.referredDoctor?.name||p.referredBy||'Self'],
                          ['ID Proof', p.idProofType ? `${p.idProofType} — ${p.idProofNo||''}` : '—'],
                        ].map(([l,v])=>(
                          <div key={l} style={{display:'flex',gap:8,padding:'4px 0',borderBottom:'1px solid var(--border)'}}>
                            <span style={{minWidth:130,color:'var(--text-3)',fontSize:11,fontWeight:700,textTransform:'uppercase',letterSpacing:'.04em'}}>{l}</span>
                            <span style={{fontWeight:600,fontSize:12}}>{v}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })()}
              </div>
            )}

            {/* ── SECTION B ── */}
            {activeSection==='B' && (
              <div>
                <div className="fform-sec-title">SECTION B — Non-Invasive Diagnostic Procedures / Tests</div>
                <div className="form-grid-2" style={{marginBottom:16}}>
                  <TextInput label="Name of Doctor Performing Procedure" value={form.sectionB.performedBy} onChange={v=>setB('performedBy',v)} />
                </div>

                <div style={{fontWeight:700,fontSize:13,marginBottom:10}}>Indications for USG Procedure</div>
                <div style={{background:'var(--bg)',borderRadius:8,padding:'14px 16px',display:'flex',flexDirection:'column',gap:10,marginBottom:16}}>
                  {USG_INDICATIONS.map(ind => (
                    <Checkbox key={ind.key} checked={form.sectionB.indications[ind.key]} label={ind.label}
                      onChange={v=>setBInd(ind.key,v)} />
                  ))}
                  <div className="form-group" style={{marginTop:6}}>
                    <label>Other indication (specify)</label>
                    <input value={form.sectionB.indications.other||''} onChange={e=>setBInd('other',e.target.value)} placeholder="Describe other indication..." />
                  </div>
                </div>

                <div style={{fontWeight:700,fontSize:13,marginBottom:10}}>Procedure Carried Out (Non-Invasive)</div>
                <div style={{display:'flex',gap:16,marginBottom:16,flexWrap:'wrap'}}>
                  {['Ultrasound','Other'].map(opt=>(
                    <label key={opt} style={{display:'flex',alignItems:'center',gap:6,cursor:'pointer',fontSize:13,fontWeight:600}}>
                      <input type="radio" checked={form.sectionB.procedureType===opt} onChange={()=>setB('procedureType',opt)}
                        style={{width:14,height:14,accentColor:'var(--teal)'}} />
                      {opt}
                    </label>
                  ))}
                  {form.sectionB.procedureType==='Other' && (
                    <input value={form.sectionB.procedureOther} onChange={e=>setB('procedureOther',e.target.value)}
                      placeholder="Specify procedure" style={{flex:1,minWidth:160,padding:'6px 10px',border:'1.5px solid var(--border)',borderRadius:6,fontSize:13}} />
                  )}
                </div>

                <div className="form-grid-2">
                  <TextInput label="Result of Non-Invasive Procedure (brief)" value={form.sectionB.resultBrief} onChange={v=>setB('resultBrief',v)} placeholder="Result in brief including USG findings..." multiline />
                  <div>
                    <TextInput label="Result Conveyed To" value={form.sectionB.conveyedTo} onChange={v=>setB('conveyedTo',v)} placeholder="Name of person informed" />
                    <TextInput label="Date Conveyed" value={form.sectionB.conveyedDate} onChange={v=>setB('conveyedDate',v)} type="date" />
                  </div>
                  <TextInput label="MTP Indication (if any)" value={form.sectionB.mtpIndication} onChange={v=>setB('mtpIndication',v)} placeholder="Any indication for MTP as per abnormality detected..." />
                </div>
              </div>
            )}

            {/* ── SECTION C ── */}
            {activeSection==='C' && (
              <div>
                <div className="fform-sec-title">SECTION C — Invasive Procedures / Tests Only</div>
                <Checkbox checked={form.sectionC.enabled} onChange={v=>setC('enabled',v)}
                  label="This patient underwent an invasive procedure" style={{marginBottom:16,background:'var(--amber-bg)',padding:'10px 14px',borderRadius:8}} />

                {form.sectionC.enabled && (
                  <>
                    <div className="form-grid-2" style={{marginBottom:16}}>
                      <TextInput label="Name of Doctor Performing Procedure" value={form.sectionC.performedBy} onChange={v=>setC('performedBy',v)} />
                      <TextInput label="History of Genetic / Medical Disease in Family" value={form.sectionC.familyHistory} onChange={v=>setC('familyHistory',v)} />
                    </div>

                    <div style={{fontWeight:700,fontSize:12,marginBottom:8,color:'var(--text-2)',textTransform:'uppercase',letterSpacing:'.05em'}}>Basis of Diagnosis</div>
                    <div style={{display:'flex',gap:16,marginBottom:16,flexWrap:'wrap'}}>
                      {[['clinical','(a) Clinical'],['biochemical','(b) Biochemical'],['cytogenetic','(c) Cytogenetic']].map(([k,l])=>(
                        <Checkbox key={k} checked={form.sectionC.diagnosisBasis[k]} onChange={v=>setCDiag(k,v)} label={l} />
                      ))}
                      <div style={{display:'flex',alignItems:'center',gap:6}}>
                        <span style={{fontSize:12}}>(d) Other:</span>
                        <input value={form.sectionC.diagnosisBasis.other||''} onChange={e=>setCDiag('other',e.target.value)} placeholder="specify..." style={{padding:'4px 8px',border:'1.5px solid var(--border)',borderRadius:5,fontSize:12,width:160}} />
                      </div>
                    </div>

                    <div style={{fontWeight:700,fontSize:12,marginBottom:8,color:'var(--text-2)',textTransform:'uppercase',letterSpacing:'.05em'}}>Indications</div>
                    <div style={{background:'var(--bg)',borderRadius:8,padding:'12px 14px',display:'flex',flexDirection:'column',gap:8,marginBottom:16}}>
                      <div style={{fontWeight:600,fontSize:12,color:'var(--text-2)'}}>A. Previous child/children with:</div>
                      <div style={{display:'flex',flexWrap:'wrap',gap:12,marginLeft:16}}>
                        {[['chromosomal','(i) Chromosomal disorders'],['metabolic','(ii) Metabolic disorders'],['congenital','(iii) Congenital anomaly'],['mentalDisability','(iv) Mental disability'],['haemoglobin','(v) Haemoglobin opathy'],['sexLinked','(vi) Sex-linked disorders'],['singleGene','(vii) Single gene disorder']].map(([k,l])=>(
                          <Checkbox key={k} checked={form.sectionC.indications[k]} onChange={v=>setCInd(k,v)} label={l} />
                        ))}
                      </div>
                      <Checkbox checked={form.sectionC.indications.advancedAge} onChange={v=>setCInd('advancedAge',v)} label="B. Advanced maternal age (35 years)" />
                      <div style={{display:'flex',gap:6,alignItems:'center'}}>
                        <span style={{fontSize:12,fontWeight:500}}>C. Mother/Father/Sibling has genetic disease:</span>
                        <input value={form.sectionC.indications.genetic||''} onChange={e=>setCInd('genetic',e.target.value)} placeholder="specify..." style={{padding:'4px 8px',border:'1.5px solid var(--border)',borderRadius:5,fontSize:12,width:200}} />
                      </div>
                      <div style={{display:'flex',gap:6,alignItems:'center'}}>
                        <span style={{fontSize:12,fontWeight:500}}>D. Other:</span>
                        <input value={form.sectionC.indications.other||''} onChange={e=>setCInd('other',e.target.value)} placeholder="specify..." style={{padding:'4px 8px',border:'1.5px solid var(--border)',borderRadius:5,fontSize:12,flex:1}} />
                      </div>
                    </div>

                    <TextInput label="Date Consent (Form G) Obtained" value={form.sectionC.consentDate} onChange={v=>setC('consentDate',v)} type="date" />

                    <div style={{fontWeight:700,fontSize:12,marginBottom:8,color:'var(--text-2)',textTransform:'uppercase',letterSpacing:'.05em',marginTop:14}}>Invasive Procedures Carried Out</div>
                    <div style={{display:'flex',gap:16,flexWrap:'wrap',marginBottom:14}}>
                      {[['amniocentesis','(i) Amniocentesis'],['cvs','(ii) Chorionic Villi Aspiration'],['fetalBiopsy','(iii) Fetal Biopsy'],['cordocentesis','(iv) Cordocentesis']].map(([k,l])=>(
                        <Checkbox key={k} checked={form.sectionC.procedure[k]} onChange={v=>setCProc(k,v)} label={l} />
                      ))}
                      <div style={{display:'flex',gap:6,alignItems:'center'}}>
                        <span style={{fontSize:12}}>(v) Other:</span>
                        <input value={form.sectionC.procedure.other||''} onChange={e=>setCProc('other',e.target.value)} placeholder="specify..." style={{padding:'4px 8px',border:'1.5px solid var(--border)',borderRadius:5,fontSize:12,width:160}} />
                      </div>
                    </div>

                    <div className="form-grid-2">
                      <TextInput label="Complications (if any)" value={form.sectionC.complications} onChange={v=>setC('complications',v)} multiline />
                      <div>
                        <div style={{fontWeight:700,fontSize:12,marginBottom:8,color:'var(--text-2)',textTransform:'uppercase',letterSpacing:'.05em'}}>Additional Tests Recommended</div>
                        <div style={{display:'flex',flexDirection:'column',gap:6}}>
                          {[['chromosomal','Chromosomal studies'],['biochemical','Biochemical studies'],['molecular','Molecular studies'],['preimplantation','Pre-implantation gender diagnosis']].map(([k,l])=>(
                            <Checkbox key={k} checked={form.sectionC.additionalTests[k]} onChange={v=>setCATests(k,v)} label={l} />
                          ))}
                          <div style={{display:'flex',gap:6}}>
                            <span style={{fontSize:12}}>Other:</span>
                            <input value={form.sectionC.additionalTests.other||''} onChange={e=>setCATests('other',e.target.value)} style={{flex:1,padding:'4px 8px',border:'1.5px solid var(--border)',borderRadius:5,fontSize:12}} />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="form-grid-2" style={{marginTop:14}}>
                      <TextInput label="Result of Invasive Tests (brief)" value={form.sectionC.resultBrief} onChange={v=>setC('resultBrief',v)} multiline />
                      <div>
                        <TextInput label="Date Procedure Carried Out" value={form.sectionC.procedureDate} onChange={v=>setC('procedureDate',v)} type="date" />
                        <TextInput label="Result Conveyed To" value={form.sectionC.conveyedTo} onChange={v=>setC('conveyedTo',v)} />
                        <TextInput label="Date Conveyed" value={form.sectionC.conveyedDate} onChange={v=>setC('conveyedDate',v)} type="date" />
                      </div>
                      <TextInput label="MTP Indication (if any)" value={form.sectionC.mtpIndication} onChange={v=>setC('mtpIndication',v)} />
                    </div>
                  </>
                )}
              </div>
            )}

            {/* ── SECTION D ── */}
            {activeSection==='D' && (
              <div>
                <div className="fform-sec-title">SECTION D — Declaration of Person Undergoing Prenatal Diagnostic Test</div>
                <div style={{background:'var(--teal-50)',border:'1px solid var(--teal-light)',borderRadius:8,padding:'12px 14px',marginBottom:16,fontSize:13,lineHeight:1.7}}>
                  <strong>Declaration text (printed on form):</strong>
                  <br/>
                  "I, Mrs./Mr. <em>[patient name]</em> declare that by undergoing ultrasonography / Prenatal Diagnostic test / Procedure, I do not want to know the sex of my foetus."
                  <br/><br/>
                  <em>ગુજરાતી:</em> "હું શ્રીમતિ / શ્રી __________ આથી જાહેર કરૂં છું કે ગર્ભસ્થ બાળકની પ્રિનેટલ ડાયગ્નોસ્ટીક ટેસ્ટ / પ્રોસીઝર (સોનોગ્રાફી) તપાસ દરમ્યાન મારે મારા બાળક ની જાતિ જાણવી નથી."
                </div>

                <Checkbox checked={form.sectionD.thumbImpression}
                  onChange={v=>setD('thumbImpression',v)}
                  label="Patient gave thumb impression instead of signature"
                  style={{marginBottom:16,padding:'10px 14px',background:'var(--bg)',borderRadius:8}} />

                {form.sectionD.thumbImpression && (
                  <div style={{background:'var(--bg)',borderRadius:8,padding:'12px 14px',marginBottom:14}}>
                    <div style={{fontWeight:700,fontSize:12,marginBottom:10,color:'var(--text-2)',textTransform:'uppercase',letterSpacing:'.05em'}}>In Case of Thumb Impression — Witness Details</div>
                    <div className="form-grid-2">
                      <TextInput label="Identified By (Name)" value={form.sectionD.witnessName} onChange={v=>setD('witnessName',v)} />
                      <TextInput label="Age" value={form.sectionD.witnessAge} onChange={v=>setD('witnessAge',v)} />
                      <TextInput label="Sex" value={form.sectionD.witnessSex} onChange={v=>setD('witnessSex',v)} />
                      <TextInput label="Relation to Patient" value={form.sectionD.witnessRelation} onChange={v=>setD('witnessRelation',v)} />
                      <TextInput label="Address & Contact No." value={form.sectionD.witnessContact} onChange={v=>setD('witnessContact',v)} style={{gridColumn:'1/-1'}} />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── CLINICAL SECTION (Internal use) ── */}
            {activeSection==='Clinical' && (
              <div>
                <div className="fform-sec-title">Clinical Findings (Internal Use — Not on Govt Form F)</div>
                <div style={{background:'var(--blue-bg)',border:'1px solid #BFDBFE',borderRadius:8,padding:'8px 14px',marginBottom:14,fontSize:12,color:'#1E40AF'}}>
                  These fields are for internal clinical documentation. They do not appear on the printed Form F but are stored for reference.
                </div>

                {/* Vitals */}
                <div style={{fontWeight:700,fontSize:13,marginBottom:10}}>Vitals</div>
                <div className="form-grid-3" style={{marginBottom:16}}>
                  {[['bp','Blood Pressure'],['pulse','Pulse (bpm)'],['temp','Temperature (°F)'],['weight','Weight (kg)'],['height','Height (cm)'],['spo2','SpO2 (%)']].map(([k,l])=>(
                    <TextInput key={k} label={l} value={form.vitals[k]} onChange={v=>setV(k,v)} placeholder={l} />
                  ))}
                </div>

                <div className="form-grid-2">
                  <TextInput label="Chief Complaint" value={form.chiefComplaint} onChange={handleComplaintChange} multiline />
                  <div>
                    <TextInput label="ICD-10 Code (auto-suggested)" value={form.icdCode} onChange={v=>setForm(f=>({...f,icdCode:v}))} placeholder="e.g. Z34, O36" />
                    <TextInput label="History of Present Illness" value={form.historyOfPresentIllness} onChange={v=>setForm(f=>({...f,historyOfPresentIllness:v}))} multiline />
                  </div>
                  <TextInput label="Past Medical History" value={form.pastMedicalHistory} onChange={v=>setForm(f=>({...f,pastMedicalHistory:v}))} multiline />
                  <TextInput label="Family History" value={form.familyHistory} onChange={v=>setForm(f=>({...f,familyHistory:v}))} multiline />
                  <TextInput label="Allergies" value={form.allergies} onChange={v=>setForm(f=>({...f,allergies:v}))} />
                  <TextInput label="Current Medications" value={form.currentMedications} onChange={v=>setForm(f=>({...f,currentMedications:v}))} />
                  <TextInput label="Physical Examination" value={form.physicalExamination} onChange={v=>setForm(f=>({...f,physicalExamination:v}))} multiline />
                  <TextInput label="Investigations" value={form.investigations} onChange={v=>setForm(f=>({...f,investigations:v}))} multiline />
                  <TextInput label="Provisional Diagnosis" value={form.provisionalDiagnosis} onChange={v=>setForm(f=>({...f,provisionalDiagnosis:v}))} />
                  <TextInput label="Differential Diagnosis" value={form.differentialDiagnosis} onChange={v=>setForm(f=>({...f,differentialDiagnosis:v}))} />
                  <TextInput label="Treatment Plan" value={form.treatmentPlan} onChange={v=>setForm(f=>({...f,treatmentPlan:v}))} multiline />
                  <TextInput label="Prescriptions" value={form.prescriptions} onChange={v=>setForm(f=>({...f,prescriptions:v}))} multiline />
                  <TextInput label="Follow-up Date" value={form.followUpDate} onChange={v=>setForm(f=>({...f,followUpDate:v}))} type="date" />
                  <TextInput label="Doctor Notes" value={form.doctorNotes} onChange={v=>setForm(f=>({...f,doctorNotes:v}))} multiline />
                </div>
              </div>
            )}
          </div>

          {/* Save + nav buttons */}
          <div style={{display:'flex',justifyContent:'space-between',marginTop:16,flexWrap:'wrap',gap:10}}>
            <div style={{display:'flex',gap:8}}>
              {SECTIONS.indexOf(activeSection) > 0 && (
                <button className="btn btn--secondary" onClick={()=>setActiveSection(SECTIONS[SECTIONS.indexOf(activeSection)-1])}>← Previous</button>
              )}
              {SECTIONS.indexOf(activeSection) < SECTIONS.length-1 && (
                <button className="btn btn--secondary" onClick={()=>setActiveSection(SECTIONS[SECTIONS.indexOf(activeSection)+1])}>Next →</button>
              )}
            </div>
            <button className="btn btn--primary btn--lg" onClick={handleSave} disabled={loading||!form.patient}>
              {loading ? 'Saving…' : '💾 Save Form F'}
            </button>
          </div>
        </div>
      )}

      {/* ── SAVED FORMS ── */}
      {tab==='saved' && (
        <div className="card table-scroll">
          <table className="data-table">
            <thead>
              <tr><th>Form No.</th><th>Patient</th><th>Section B Result</th><th>Date</th><th>Status</th><th></th></tr>
            </thead>
            <tbody>
              {saved.map(f => (
                <tr key={f._id}>
                  <td className="td-mono">{f.formNumber}</td>
                  <td>
                    <div className="td-name">{f.patient?.name || '—'}</div>
                    <div className="td-muted">{f.patient?.age}y · {f.patient?.gender}</div>
                  </td>
                  <td style={{fontSize:12,maxWidth:200,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
                    {f.sectionB?.resultBrief || f.chiefComplaint || '—'}
                  </td>
                  <td className="td-muted">{new Date(f.createdAt).toLocaleDateString('en-IN')}</td>
                  <td><span className={`badge badge--${f.status==='final'?'green':'amber'}`}>{f.status}</span></td>
                  <td>
                    <button className="btn btn--primary btn--sm" onClick={()=>handleView(f._id)}>View / Print</button>
                  </td>
                </tr>
              ))}
              {saved.length===0 && <tr><td colSpan={6} className="empty-row">No saved forms yet</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {viewForm && <FFormView form={viewForm} onClose={()=>setViewForm(null)} />}
    </div>
  )
}
