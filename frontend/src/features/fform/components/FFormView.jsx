import { useRef } from 'react'
import { useAuth } from '../../auth/hooks/useAuth'
import '../styles/fformview.scss'

export default function FFormView({ form, onClose }) {
  const { user } = useAuth()
  const printRef = useRef(null)

  const buildHtml = (bodyContent) => `<!DOCTYPE html><html><head><title>F-Form ${form.formNumber}</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:Arial,sans-serif;font-size:12.5px;color:#0f172a;padding:32px;max-width:800px;margin:0 auto}
    .pdf-header{display:flex;justify-content:space-between;border-bottom:2px solid #0EA5A0;padding-bottom:14px;margin-bottom:18px}
    .pdf-logo{font-size:20px;font-weight:800;color:#0EA5A0}
    .pdf-logo span{color:#0f172a}
    .pdf-patient{background:#f0f4f8;border-radius:8px;padding:12px 16px;margin-bottom:18px;display:grid;grid-template-columns:repeat(4,1fr);gap:10px}
    .pdf-patient-item label{font-size:9px;text-transform:uppercase;color:#94a3b8;display:block;margin-bottom:2px;font-weight:700}
    .pdf-patient-item span{font-size:13px;font-weight:700}
    .pdf-sec-title{font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.07em;color:#0C8F8A;margin-bottom:8px;padding-bottom:5px;border-bottom:1px solid #e2e8f0}
    .pdf-section{margin-bottom:16px}
    .pdf-field{margin-bottom:8px}
    .pdf-field label{font-size:9px;color:#94a3b8;font-weight:700;text-transform:uppercase;display:block;margin-bottom:2px}
    .pdf-field p{font-size:12.5px;line-height:1.5;white-space:pre-line}
    .pdf-g2{display:grid;grid-template-columns:1fr 1fr;gap:12px}
    .pdf-vitals{display:grid;grid-template-columns:repeat(6,1fr);gap:8px}
    .pdf-vital{background:#f8fafc;border-radius:6px;padding:8px;text-align:center;border:1px solid #e2e8f0}
    .pdf-vital label{font-size:9px;color:#94a3b8;display:block;margin-bottom:3px;font-weight:700}
    .pdf-vital span{font-size:13px;font-weight:700}
    .pdf-icd{display:inline-block;background:#e6f7f7;color:#0C8F8A;padding:3px 12px;border-radius:100px;font-size:12px;font-weight:800;margin-bottom:10px}
    .pdf-footer{border-top:1px solid #e2e8f0;padding-top:14px;margin-top:22px;display:flex;justify-content:space-between;align-items:flex-end}
    .sig-line{border-top:1px solid #0f172a;width:150px;margin-top:36px;padding-top:5px;font-size:10px;color:#64748b}
    @media print{body{padding:20px}}
  </style></head><body>${bodyContent}</body></html>`

  const pdfBody = () => printRef.current?.innerHTML || ''

  const handlePrint = () => {
    const w = window.open('', '_blank')
    w.document.write(buildHtml(pdfBody()))
    w.document.close(); w.focus()
    setTimeout(() => { w.print(); w.close() }, 400)
  }

  const handleDownload = () => {
    // Open print window → browser Save as PDF
    const w = window.open('', '_blank', 'width=900,height=700')
    w.document.write(buildHtml(pdfBody()))
    w.document.close(); w.focus()
    setTimeout(() => { w.print() }, 600)
  }

  const handleShare = async () => {
    const text = `MediRecord F-Form\nForm: ${form.formNumber}\nPatient: ${form.patient?.name}\nDate: ${new Date(form.createdAt).toLocaleDateString('en-IN')}\nDiagnosis: ${form.provisionalDiagnosis || 'N/A'}`
    if (navigator.share) { navigator.share({ title: `F-Form ${form.formNumber}`, text }) }
    else { await navigator.clipboard.writeText(text); alert('Summary copied to clipboard!') }
  }

  const val = v => v || '—'
  const hasVitals = form.vitals && Object.values(form.vitals).some(Boolean)

  return (
    <div className="fform-view-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="fform-view-modal">
        <div className="fform-view-toolbar">
          <h3>F-Form — {form.formNumber}</h3>
          <div className="fform-view-actions">
            <button className="btn btn--secondary btn--sm" onClick={handleShare}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
              Share
            </button>
            <button className="btn btn--secondary btn--sm" onClick={handleDownload}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Download
            </button>
            <button className="btn btn--primary btn--sm" onClick={handlePrint}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
              Print
            </button>
            <button className="fform-view-close" onClick={onClose}>✕</button>
          </div>
        </div>

        <div className="fform-view-body">
          <div className="pdf-wrapper" ref={printRef}>
            {/* Header */}
            <div className="pdf-header">
              <div>
                {(form.clinic?.logoUrl || form.clinic?.logo) && (
                  <img src={form.clinic.logoUrl || form.clinic.logo} alt="" style={{height:34,objectFit:'contain',display:'block',marginBottom:4}} />
                )}
                <div className="pdf-logo">{form.clinic?.name || user?.clinic?.name || 'MediRecord'}</div>
                <div className="pdf-sub">Clinical Findings Form (F-Form)</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 800, fontSize: 16 }}>{form.formNumber}</div>
                <div className="pdf-sub">{form.clinic?.name || user?.clinic?.name || 'MediRecord Clinic'}</div>
                <div className="pdf-sub">{new Date(form.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
              </div>
            </div>

            {/* Patient info bar */}
            <div className="pdf-patient">
              {[
                ['Patient Name', form.patient?.name],
                ['Age / Gender', `${form.patient?.age} yrs / ${form.patient?.gender}`],
                ['Phone', form.patient?.phone],
                ['Doctor', form.createdBy?.name || '—'],
              ].map(([l, v]) => (
                <div key={l} className="pdf-patient-item">
                  <label>{l}</label><span>{v || '—'}</span>
                </div>
              ))}
            </div>

            {/* Chief Complaint */}
            <div className="pdf-section">
              <div className="pdf-sec-title">Chief Complaint</div>
              <div className="pdf-field"><p>{val(form.chiefComplaint)}</p></div>
            </div>

            {/* History */}
            {(form.historyOfPresentIllness || form.pastMedicalHistory || form.familyHistory || form.allergies || form.currentMedications) && (
              <div className="pdf-section">
                <div className="pdf-sec-title">History</div>
                <div className="pdf-g2">
                  {form.historyOfPresentIllness && <div className="pdf-field"><label>History of Present Illness</label><p>{form.historyOfPresentIllness}</p></div>}
                  {form.pastMedicalHistory && <div className="pdf-field"><label>Past Medical History</label><p>{form.pastMedicalHistory}</p></div>}
                  {form.familyHistory && <div className="pdf-field"><label>Family History</label><p>{form.familyHistory}</p></div>}
                  {form.allergies && <div className="pdf-field"><label>Allergies</label><p>{form.allergies}</p></div>}
                  {form.currentMedications && <div className="pdf-field"><label>Current Medications</label><p>{form.currentMedications}</p></div>}
                </div>
              </div>
            )}

            {/* Vitals */}
            {hasVitals && (
              <div className="pdf-section">
                <div className="pdf-sec-title">Vital Signs</div>
                <div className="pdf-vitals">
                  {[['bp','BP'],['pulse','Pulse'],['temp','Temp'],['weight','Weight'],['height','Height'],['spo2','SpO₂']].map(([k,l]) => (
                    <div key={k} className="pdf-vital">
                      <label>{l}</label><span>{form.vitals[k] || '—'}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Examination */}
            {(form.physicalExamination || form.investigations) && (
              <div className="pdf-section">
                <div className="pdf-sec-title">Examination & Investigations</div>
                {form.physicalExamination && <div className="pdf-field"><label>Physical Examination</label><p>{form.physicalExamination}</p></div>}
                {form.investigations && <div className="pdf-field"><label>Investigations</label><p>{form.investigations}</p></div>}
              </div>
            )}

            {/* Diagnosis & Treatment */}
            <div className="pdf-section">
              <div className="pdf-sec-title">Diagnosis & Treatment</div>
              {form.icdCode && <div className="pdf-icd">ICD-10: {form.icdCode}</div>}
              <div className="pdf-g2">
                {form.provisionalDiagnosis && <div className="pdf-field"><label>Provisional Diagnosis</label><p>{form.provisionalDiagnosis}</p></div>}
                {form.differentialDiagnosis && <div className="pdf-field"><label>Differential Diagnosis</label><p>{form.differentialDiagnosis}</p></div>}
              </div>
              {form.treatmentPlan && <div className="pdf-field"><label>Treatment Plan</label><p>{form.treatmentPlan}</p></div>}
              {form.prescriptions && <div className="pdf-field"><label>Prescriptions</label><p>{form.prescriptions}</p></div>}
              <div className="pdf-g2">
                {form.followUpDate && <div className="pdf-field"><label>Follow-up Date</label><p>{new Date(form.followUpDate).toLocaleDateString('en-IN')}</p></div>}
                {form.doctorNotes && <div className="pdf-field"><label>Doctor's Notes</label><p>{form.doctorNotes}</p></div>}
              </div>
            </div>

            {/* Footer */}
            <div className="pdf-footer">
              <div><div className="sig-line">Doctor / Radiologist Signature & Seal</div></div>
              <div style={{ textAlign: 'right', fontSize: 10.5, color: '#94a3b8' }}>
                <div>MediRecord Smart EMR</div>
                <div>Generated: {new Date().toLocaleString('en-IN')}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
