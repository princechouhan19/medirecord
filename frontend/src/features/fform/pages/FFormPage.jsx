import { useState, useEffect, useRef } from "react"
import { gsap } from "gsap"
import api from "../../../services/api"
import FFormView from "../components/FFormView"
import "../styles/fform.scss"

const defaultForm = {
  patient: "", chiefComplaint: "", historyOfPresentIllness: "",
  pastMedicalHistory: "", familyHistory: "", allergies: "", currentMedications: "",
  physicalExamination: "",
  vitals: { bp: "", pulse: "", temp: "", weight: "", height: "", spo2: "" },
  investigations: "", provisionalDiagnosis: "", differentialDiagnosis: "",
  treatmentPlan: "", prescriptions: "", followUpDate: "", icdCode: "", doctorNotes: ""
}

const TABS = ["New Form", "Saved Forms"]

export default function FFormPage() {
  const [activeTab, setActiveTab] = useState("New Form")
  const [patients, setPatients] = useState([])
  const [forms, setForms] = useState([])
  const [form, setForm] = useState(defaultForm)
  const [loading, setLoading] = useState(false)
  const [formsLoading, setFormsLoading] = useState(false)
  const [success, setSuccess] = useState("")
  const [error, setError] = useState("")
  const [aiLoading, setAiLoading] = useState(false)
  const [viewForm, setViewForm] = useState(null)
  const [searchForms, setSearchForms] = useState("")
  const headerRef = useRef(null)

  useEffect(() => {
    gsap.fromTo(headerRef.current, { y: -15, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5 })
    fetchData()
  }, [])

  const fetchData = async () => {
    const [p, f] = await Promise.all([api.get("/patients"), fetchForms()])
    setPatients(p.data.patients || [])
  }

  const fetchForms = async () => {
    setFormsLoading(true)
    try {
      const res = await api.get("/fform")
      setForms(res.data.forms || [])
    } finally { setFormsLoading(false) }
  }

  const handleAISuggest = async () => {
    if (!form.chiefComplaint) return setError("Enter Chief Complaint first")
    setAiLoading(true)
    setTimeout(() => {
      const suggestions = {
        pregnancy: { code: "Z34.0", diag: "Normal pregnancy" },
        fever: { code: "R50.9", diag: "Fever, unspecified" },
        cough: { code: "R05", diag: "Acute cough" },
        pain: { code: "R52", diag: "Pain, unspecified" },
        diabetes: { code: "E11", diag: "Type 2 diabetes mellitus" },
        hypertension: { code: "I10", diag: "Essential hypertension" },
        fracture: { code: "S00", diag: "Superficial injury" },
        anemia: { code: "D64.9", diag: "Anaemia, unspecified" },
        asthma: { code: "J45.9", diag: "Asthma, unspecified" },
        thyroid: { code: "E04.9", diag: "Nontoxic goitre" },
      }
      const lower = form.chiefComplaint.toLowerCase()
      const match = Object.keys(suggestions).find(k => lower.includes(k))
      const suggestion = match ? suggestions[match] : { code: "R69", diag: "Illness, unspecified" }
      setForm(f => ({
        ...f,
        icdCode: suggestion.code,
        provisionalDiagnosis: f.provisionalDiagnosis || suggestion.diag
      }))
      setAiLoading(false)
    }, 1200)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(""); setSuccess("")
    setLoading(true)
    try {
      await api.post("/fform", form)
      setSuccess("F-Form saved successfully!")
      setForm(defaultForm)
      fetchForms()
      setTimeout(() => {
        setSuccess("")
        setActiveTab("Saved Forms")
      }, 1500)
    } catch (err) {
      setError(err.response?.data?.error || "Failed to save F-Form")
    } finally { setLoading(false) }
  }

  const handleViewForm = async (id) => {
    const res = await api.get(`/fform/${id}`)
    setViewForm(res.data.form)
  }

  const sf = (key) => ({ value: form[key], onChange: e => setForm({ ...form, [key]: e.target.value }) })
  const sv = (key) => ({ value: form.vitals[key], onChange: e => setForm({ ...form, vitals: { ...form.vitals, [key]: e.target.value } }) })

  const filteredForms = forms.filter(f =>
    f.patient?.name?.toLowerCase().includes(searchForms.toLowerCase()) ||
    f.formNumber?.toLowerCase().includes(searchForms.toLowerCase()) ||
    f.chiefComplaint?.toLowerCase().includes(searchForms.toLowerCase())
  )

  return (
    <div className="fform-page">
      <div className="fform-page__header" ref={headerRef}>
        <div>
          <h1>F-Form — Clinical Findings</h1>
          <p>Structured documentation with AI-assisted ICD-10 coding</p>
        </div>
        <div className="fform-count-badge">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/></svg>
          {forms.length} Forms Saved
        </div>
      </div>

      <div className="fform-tabs">
        {TABS.map(tab => (
          <button key={tab} className={`fform-tab ${activeTab === tab ? "fform-tab--active" : ""}`} onClick={() => setActiveTab(tab)}>
            {tab}
            {tab === "Saved Forms" && forms.length > 0 && <span className="fform-tab__count">{forms.length}</span>}
          </button>
        ))}
      </div>

      {activeTab === "New Form" && (
        <form onSubmit={handleSubmit} className="fform-layout">
          {success && <div className="alert alert--success">{success}</div>}
          {error && <div className="alert alert--error" onClick={() => setError("")}>{error}</div>}

          {/* Patient Selection */}
          <div className="card fform-section">
            <div className="fform-section__header">
              <div className="fform-section__num">1</div>
              <h3 className="fform-section__title">Patient Selection</h3>
            </div>
            <div className="form-group">
              <label>Select Patient *</label>
              <select {...sf("patient")} required>
                <option value="">Choose a registered patient</option>
                {patients.map(p => (
                  <option key={p._id} value={p._id}>{p.name} — {p.age} yrs, {p.gender} | {p.phone}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Chief Complaint & History */}
          <div className="card fform-section">
            <div className="fform-section__header">
              <div className="fform-section__num">2</div>
              <h3 className="fform-section__title">History & Complaint</h3>
            </div>
            <div className="form-group">
              <label>Chief Complaint *</label>
              <textarea {...sf("chiefComplaint")} placeholder="Primary reason for visit..." rows={3} required />
            </div>
            <div className="form-group">
              <label>History of Present Illness</label>
              <textarea {...sf("historyOfPresentIllness")} placeholder="Onset, duration, severity, associated symptoms..." rows={4} />
            </div>
            <div className="fform-row-2">
              <div className="form-group"><label>Past Medical History</label><textarea {...sf("pastMedicalHistory")} rows={3} placeholder="Previous illnesses, surgeries..." /></div>
              <div className="form-group"><label>Family History</label><textarea {...sf("familyHistory")} rows={3} placeholder="Relevant family conditions..." /></div>
            </div>
            <div className="fform-row-2">
              <div className="form-group"><label>Allergies</label><input {...sf("allergies")} placeholder="Drug, food, or environmental allergies" /></div>
              <div className="form-group"><label>Current Medications</label><input {...sf("currentMedications")} placeholder="Ongoing medications and dosage" /></div>
            </div>
          </div>

          {/* Vitals */}
          <div className="card fform-section">
            <div className="fform-section__header">
              <div className="fform-section__num">3</div>
              <h3 className="fform-section__title">Vitals & Examination</h3>
            </div>
            <div className="vitals-grid">
              {[
                { key: "bp", label: "Blood Pressure", placeholder: "e.g. 120/80 mmHg" },
                { key: "pulse", label: "Pulse Rate", placeholder: "e.g. 72 bpm" },
                { key: "temp", label: "Temperature", placeholder: "e.g. 98.6°F" },
                { key: "weight", label: "Weight", placeholder: "e.g. 65 kg" },
                { key: "height", label: "Height", placeholder: "e.g. 170 cm" },
                { key: "spo2", label: "SpO2", placeholder: "e.g. 98%" },
              ].map(v => (
                <div key={v.key} className="form-group">
                  <label>{v.label}</label>
                  <input {...sv(v.key)} placeholder={v.placeholder} />
                </div>
              ))}
            </div>
            <div className="form-group" style={{marginTop: "16px"}}>
              <label>Physical Examination Findings</label>
              <textarea {...sf("physicalExamination")} rows={3} placeholder="General appearance, system-wise findings..." />
            </div>
            <div className="form-group">
              <label>Investigations / Lab Reports</label>
              <textarea {...sf("investigations")} rows={3} placeholder="Tests ordered, lab results, imaging findings..." />
            </div>
          </div>

          {/* Diagnosis */}
          <div className="card fform-section">
            <div className="fform-section__header">
              <div className="fform-section__num">4</div>
              <h3 className="fform-section__title">Diagnosis & Treatment</h3>
              <button type="button" className="ai-suggest-btn" onClick={handleAISuggest} disabled={aiLoading}>
                {aiLoading ? <><span className="ai-spinner" />Analyzing...</> : <>🤖 AI Suggest ICD-10</>}
              </button>
            </div>
            <div className="fform-row-2">
              <div className="form-group"><label>Provisional Diagnosis</label><textarea {...sf("provisionalDiagnosis")} rows={3} placeholder="Primary diagnosis..." /></div>
              <div className="form-group"><label>Differential Diagnosis</label><textarea {...sf("differentialDiagnosis")} rows={3} placeholder="Other possible diagnoses..." /></div>
            </div>
            <div className="form-group">
              <label>ICD-10 Code</label>
              <div className="icd-wrap">
                <input {...sf("icdCode")} placeholder="e.g. Z34.0 — AI will auto-suggest" />
                <button type="button" className="btn btn--outline" onClick={handleAISuggest} disabled={aiLoading}>
                  {aiLoading ? "..." : "Suggest"}
                </button>
              </div>
            </div>
            <div className="form-group"><label>Treatment Plan</label><textarea {...sf("treatmentPlan")} rows={3} placeholder="Management plan, procedures..." /></div>
            <div className="form-group"><label>Prescriptions</label><textarea {...sf("prescriptions")} rows={3} placeholder="Medications, dosage, frequency, duration..." /></div>
            <div className="fform-row-2">
              <div className="form-group"><label>Follow-up Date</label><input type="date" {...sf("followUpDate")} /></div>
              <div className="form-group"><label>Doctor&apos;s Notes</label><input {...sf("doctorNotes")} placeholder="Additional notes or instructions..." /></div>
            </div>
          </div>

          <div className="fform-footer">
            <button type="button" className="btn btn--outline" onClick={() => setForm(defaultForm)}>Clear Form</button>
            <button type="submit" className="btn btn--primary" disabled={loading}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/></svg>
              {loading ? "Saving..." : "Save F-Form"}
            </button>
          </div>
        </form>
      )}

      {activeTab === "Saved Forms" && (
        <div className="fform-saved">
          <div className="search-bar" style={{marginBottom: "16px"}}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input placeholder="Search by patient, form number, or complaint..." value={searchForms} onChange={e => setSearchForms(e.target.value)} />
          </div>

          {formsLoading ? (
            <div className="loading-state">Loading forms...</div>
          ) : (
            <div className="card table-card">
              <table className="data-table">
                <thead>
                  <tr><th>FORM #</th><th>PATIENT</th><th>CHIEF COMPLAINT</th><th>ICD-10</th><th>DOCTOR</th><th>DATE</th><th>ACTIONS</th></tr>
                </thead>
                <tbody>
                  {filteredForms.map(f => (
                    <tr key={f._id}>
                      <td><span className="form-number">{f.formNumber}</span></td>
                      <td>
                        <div className="td-name">{f.patient?.name}</div>
                        <div className="td-muted">{f.patient?.age} yrs, {f.patient?.gender}</div>
                      </td>
                      <td className="td-complaint">{f.chiefComplaint}</td>
                      <td>{f.icdCode ? <span className="badge badge--primary">{f.icdCode}</span> : <span className="td-muted">—</span>}</td>
                      <td className="td-muted">{f.createdBy?.name || "—"}</td>
                      <td className="td-muted">{new Date(f.createdAt).toLocaleDateString("en-IN")}</td>
                      <td>
                        <button className="btn btn--sm btn--primary" onClick={() => handleViewForm(f._id)}>View</button>
                      </td>
                    </tr>
                  ))}
                  {filteredForms.length === 0 && (
                    <tr><td colSpan={7} className="empty-row">
                      {forms.length === 0 ? "No forms saved yet. Create your first F-Form." : "No matching forms found."}
                    </td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {viewForm && <FFormView form={viewForm} onClose={() => setViewForm(null)} />}
    </div>
  )
}
