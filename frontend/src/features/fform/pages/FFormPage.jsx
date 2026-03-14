import { useState, useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { useAuth } from '../../auth/hooks/useAuth'
import api from '../../../services/api'
import FFormView from '../components/FFormView'
import '../styles/fform.scss'

const DEF = {
  patient: '', chiefComplaint: '', historyOfPresentIllness: '',
  pastMedicalHistory: '', familyHistory: '', allergies: '', currentMedications: '',
  physicalExamination: '',
  vitals: { bp: '', pulse: '', temp: '', weight: '', height: '', spo2: '' },
  investigations: '', provisionalDiagnosis: '', differentialDiagnosis: '',
  treatmentPlan: '', prescriptions: '', followUpDate: '', icdCode: '', doctorNotes: '',
}

const ICD_MAP = {
  pregnancy: { code: 'Z34.0', diag: 'Normal pregnancy' },
  obs:       { code: 'Z34.0', diag: 'Obstetric sonography' },
  fever:     { code: 'R50.9', diag: 'Fever, unspecified' },
  cough:     { code: 'R05',   diag: 'Acute cough' },
  pain:      { code: 'R52',   diag: 'Pain, unspecified' },
  diabetes:  { code: 'E11',   diag: 'Type 2 diabetes mellitus' },
  hypertension: { code: 'I10', diag: 'Essential hypertension' },
  anemia:    { code: 'D64.9', diag: 'Anaemia, unspecified' },
  thyroid:   { code: 'E04.9', diag: 'Nontoxic goitre' },
  usg:       { code: 'Z09',   diag: 'Follow-up examination' },
  tvs:       { code: 'Z01.4', diag: 'Gynaecological examination' },
  kidney:    { code: 'N28.9', diag: 'Kidney disorder, unspecified' },
  liver:     { code: 'K76.9', diag: 'Liver disease, unspecified' },
}

export default function FFormPage() {
  const { role } = useAuth()
  const [tab, setTab]             = useState('new')
  const [todayPts, setTodayPts]   = useState([])
  const [allPts, setAllPts]       = useState([])
  const [forms, setForms]         = useState([])
  const [form, setForm]           = useState(DEF)
  const [loading, setLoading]     = useState(false)
  const [formsLoading, setFormsLoading] = useState(false)
  const [success, setSuccess]     = useState('')
  const [error, setError]         = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [viewForm, setViewForm]   = useState(null)
  const [search, setSearch]       = useState('')
  const headerRef = useRef(null)

  useEffect(() => {
    gsap.fromTo(headerRef.current, { y: -15, opacity: 0 }, { y: 0, opacity: 1, duration: .5 })
    loadData()
  }, [])

  const loadData = async () => {
    setFormsLoading(true)
    try {
      const [t, a, f] = await Promise.all([
        api.get('/patients/today'),
        api.get('/patients?limit=50'),
        api.get('/fform'),
      ])
      setTodayPts(t.data.patients || [])
      setAllPts(a.data.patients || [])
      setForms(f.data.forms || [])
    } catch (e) { console.error(e) }
    finally { setFormsLoading(false) }
  }

  const handleAI = () => {
    if (!form.chiefComplaint) return setError('Enter Chief Complaint first')
    setAiLoading(true)
    setTimeout(() => {
      const lower = form.chiefComplaint.toLowerCase()
      const match = Object.keys(ICD_MAP).find(k => lower.includes(k))
      const r = match ? ICD_MAP[match] : { code: 'R69', diag: 'Illness, unspecified' }
      setForm(f => ({ ...f, icdCode: r.code, provisionalDiagnosis: f.provisionalDiagnosis || r.diag }))
      setAiLoading(false)
    }, 1000)
  }

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setSuccess(''); setLoading(true)
    try {
      await api.post('/fform', form)
      setSuccess('F-Form saved! ✓')
      setForm(DEF)
      loadData()
      setTimeout(() => { setSuccess(''); setTab('saved') }, 1500)
    } catch (err) { setError(err.response?.data?.error || 'Failed to save') }
    finally { setLoading(false) }
  }

  const handleView = async (id) => {
    const r = await api.get(`/fform/${id}`)
    setViewForm(r.data.form)
  }

  const sf = k => ({ value: form[k], onChange: e => setForm({ ...form, [k]: e.target.value }) })
  const sv = k => ({ value: form.vitals[k], onChange: e => setForm({ ...form, vitals: { ...form.vitals, [k]: e.target.value } }) })

  const filteredForms = forms.filter(f =>
    f.patient?.name?.toLowerCase().includes(search.toLowerCase()) ||
    (f.formNumber || '').toLowerCase().includes(search.toLowerCase()) ||
    (f.chiefComplaint || '').toLowerCase().includes(search.toLowerCase())
  )

  // Patient dropdown: prefer today's patients, then show search option
  const patientOptions = todayPts.length > 0 ? todayPts : allPts

  return (
    <div className="fform-page">
      <div className="fform-header" ref={headerRef}>
        <div>
          <h1>F-Form — Clinical Findings</h1>
          <p>Structured documentation with AI-assisted ICD-10 coding</p>
        </div>
        <div className="fform-badge">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          </svg>
          {forms.length} forms saved
        </div>
      </div>

      {/* Tabs */}
      <div className="fform-tabs">
        <button className={`fform-tab${tab === 'new' ? ' fform-tab--on' : ''}`} onClick={() => setTab('new')}>New Form</button>
        <button className={`fform-tab${tab === 'saved' ? ' fform-tab--on' : ''}`} onClick={() => setTab('saved')}>
          Saved Forms {forms.length > 0 && <span className="fform-tab__ct">{forms.length}</span>}
        </button>
      </div>

      {/* ── NEW FORM ── */}
      {tab === 'new' && (
        <form onSubmit={handleSubmit} className="fform-body">
          {success && <div className="alert alert--success">{success}</div>}
          {error   && <div className="alert alert--error" onClick={() => setError('')}>{error}</div>}

          {/* Section 1: Patient */}
          <div className="card ff-sec">
            <div className="ff-sec__hd"><span className="ff-sec__num">1</span> Patient Selection</div>
            <div className="form-group">
              <label>Select Patient *
                {todayPts.length > 0 && <span className="ff-hint">Showing today's registered patients</span>}
              </label>
              <select {...sf('patient')} required>
                <option value="">Choose a patient</option>
                {todayPts.length > 0 && <optgroup label="── Today's Patients ──">
                  {todayPts.map(p => (
                    <option key={p._id} value={p._id}>
                      #{String(p.tokenNo).padStart(3, '0')} · {p.name} ({p.age}y, {p.gender}) — {p.testName}
                    </option>
                  ))}
                </optgroup>}
                {allPts.filter(p => !todayPts.find(t => t._id === p._id)).length > 0 && (
                  <optgroup label="── Previous Patients ──">
                    {allPts.filter(p => !todayPts.find(t => t._id === p._id)).map(p => (
                      <option key={p._id} value={p._id}>{p.name} ({p.age}y, {p.gender}) — {p.testName}</option>
                    ))}
                  </optgroup>
                )}
              </select>
            </div>
          </div>

          {/* Section 2: History */}
          <div className="card ff-sec">
            <div className="ff-sec__hd"><span className="ff-sec__num">2</span> History & Complaint</div>
            <div className="form-group">
              <label>Chief Complaint *</label>
              <textarea {...sf('chiefComplaint')} placeholder="Primary reason for visit, onset, duration..." rows={3} required />
            </div>
            <div className="form-group">
              <label>History of Present Illness</label>
              <textarea {...sf('historyOfPresentIllness')} placeholder="Detailed illness history, progression..." rows={3} />
            </div>
            <div className="ff-grid2">
              <div className="form-group"><label>Past Medical History</label><textarea {...sf('pastMedicalHistory')} rows={2} placeholder="Previous illnesses, surgeries..." /></div>
              <div className="form-group"><label>Family History</label><textarea {...sf('familyHistory')} rows={2} placeholder="Hereditary conditions..." /></div>
              <div className="form-group"><label>Allergies</label><input {...sf('allergies')} placeholder="Drug / food / environmental" /></div>
              <div className="form-group"><label>Current Medications</label><input {...sf('currentMedications')} placeholder="Ongoing medications + dosage" /></div>
            </div>
          </div>

          {/* Section 3: Vitals */}
          <div className="card ff-sec">
            <div className="ff-sec__hd"><span className="ff-sec__num">3</span> Vitals & Examination</div>
            <div className="ff-vitals">
              {[['bp','Blood Pressure','120/80 mmHg'],['pulse','Pulse','72 bpm'],['temp','Temperature','98.6°F'],['weight','Weight','65 kg'],['height','Height','170 cm'],['spo2','SpO₂','98%']].map(([k,l,ph]) => (
                <div key={k} className="form-group">
                  <label>{l}</label>
                  <input {...sv(k)} placeholder={ph} />
                </div>
              ))}
            </div>
            <div className="form-group" style={{ marginTop: 14 }}>
              <label>Physical Examination Findings</label>
              <textarea {...sf('physicalExamination')} rows={2} placeholder="General appearance, systemic findings..." />
            </div>
            <div className="form-group">
              <label>Investigations / Lab Reports</label>
              <textarea {...sf('investigations')} rows={2} placeholder="Lab values, imaging reports, test results..." />
            </div>
          </div>

          {/* Section 4: Diagnosis */}
          <div className="card ff-sec">
            <div className="ff-sec__hd" style={{ justifyContent: 'flex-start', gap: 12 }}>
              <span className="ff-sec__num">4</span>
              <span>Diagnosis & Treatment</span>
              <button type="button" className="ff-ai-btn" onClick={handleAI} disabled={aiLoading}>
                {aiLoading ? <><span className="ff-spinner" />Analyzing...</> : '🤖 AI Suggest ICD-10'}
              </button>
            </div>
            <div className="ff-grid2">
              <div className="form-group"><label>Provisional Diagnosis</label><textarea {...sf('provisionalDiagnosis')} rows={2} placeholder="Primary diagnosis..." /></div>
              <div className="form-group"><label>Differential Diagnosis</label><textarea {...sf('differentialDiagnosis')} rows={2} placeholder="Other possible diagnoses..." /></div>
            </div>
            <div className="form-group">
              <label>ICD-10 Code</label>
              <div className="ff-icd">
                <input {...sf('icdCode')} placeholder="e.g. Z34.0 — AI will auto-suggest" />
                <button type="button" className="btn btn--secondary btn--sm" onClick={handleAI} disabled={aiLoading}>Suggest</button>
              </div>
            </div>
            <div className="form-group"><label>Treatment Plan</label><textarea {...sf('treatmentPlan')} rows={2} placeholder="Management plan, procedures..." /></div>
            <div className="form-group">
              <label>Prescriptions</label>
              <textarea {...sf('prescriptions')} rows={3} placeholder="Drug name · Dose · Frequency · Duration&#10;e.g. Tab. Folic Acid 5mg · OD · 3 months" />
            </div>
            <div className="ff-grid2">
              <div className="form-group"><label>Follow-up Date</label><input type="date" {...sf('followUpDate')} /></div>
              <div className="form-group"><label>Doctor's Notes</label><input {...sf('doctorNotes')} placeholder="Additional instructions..." /></div>
            </div>
          </div>

          <div className="fform-footer">
            <button type="button" className="btn btn--secondary" onClick={() => setForm(DEF)}>Clear Form</button>
            <button type="submit" className="btn btn--primary btn--lg" disabled={loading}>
              {loading ? 'Saving…' : '💾 Save F-Form'}
            </button>
          </div>
        </form>
      )}

      {/* ── SAVED FORMS ── */}
      {tab === 'saved' && (
        <div>
          <div className="search-bar" style={{ marginBottom: 16 }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input placeholder="Search by patient, form #, or complaint..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="card" style={{ overflow: 'hidden' }}>
            {formsLoading ? (
              <div className="empty-row">Loading forms...</div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr><th>Form #</th><th>Patient</th><th>Chief Complaint</th><th>ICD-10</th><th>Doctor</th><th>Date</th><th>Action</th></tr>
                </thead>
                <tbody>
                  {filteredForms.map(f => (
                    <tr key={f._id}>
                      <td><span className="ff-num">{f.formNumber}</span></td>
                      <td>
                        <div className="td-name">{f.patient?.name}</div>
                        <div className="td-muted">{f.patient?.age}y · {f.patient?.gender}</div>
                      </td>
                      <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 13 }}>
                        {f.chiefComplaint}
                      </td>
                      <td>{f.icdCode ? <span className="badge badge--teal">{f.icdCode}</span> : <span className="td-muted">—</span>}</td>
                      <td className="td-muted">{f.createdBy?.name || '—'}</td>
                      <td className="td-muted">{new Date(f.createdAt).toLocaleDateString('en-IN')}</td>
                      <td>
                        <button className="btn btn--primary btn--sm" onClick={() => handleView(f._id)}>View</button>
                      </td>
                    </tr>
                  ))}
                  {filteredForms.length === 0 && (
                    <tr><td colSpan={7} className="empty-row">
                      {forms.length === 0 ? 'No F-Forms saved yet. Create your first one.' : 'No matching forms.'}
                    </td></tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {viewForm && <FFormView form={viewForm} onClose={() => setViewForm(null)} />}
    </div>
  )
}
