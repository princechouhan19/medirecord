import { useRef } from "react";
import "../styles/fformview.scss";

export default function FFormView({ form, onClose }) {
  const printRef = useRef(null);

  const handlePrint = () => {
    const content = printRef.current.innerHTML;
    const w = window.open("", "_blank");
    w.document.write(`
      <!DOCTYPE html><html><head>
      <title>F-Form ${form.formNumber}</title>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Arial', sans-serif; font-size: 13px; color: #1a1a1a; background: white; }
        .pdf-wrapper { max-width: 800px; margin: 0 auto; padding: 32px; }
        .pdf-header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #2EC4B6; padding-bottom: 16px; margin-bottom: 20px; }
        .pdf-logo { font-size: 22px; font-weight: 700; color: #2EC4B6; }
        .pdf-logo span { color: #1a1a1a; }
        .pdf-form-num { font-size: 13px; color: #6B7280; }
        .pdf-patient { background: #F4F7F6; border-radius: 8px; padding: 12px 16px; margin-bottom: 20px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
        .pdf-patient-item label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.05em; color: #9CA3AF; display: block; margin-bottom: 2px; }
        .pdf-patient-item span { font-weight: 600; font-size: 13px; }
        .pdf-section { margin-bottom: 18px; }
        .pdf-section-title { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #2EC4B6; margin-bottom: 8px; padding-bottom: 4px; border-bottom: 1px solid #E5E7EB; }
        .pdf-field { margin-bottom: 10px; }
        .pdf-field label { font-size: 10px; color: #6B7280; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; display: block; margin-bottom: 2px; }
        .pdf-field p { font-size: 13px; color: #1a1a1a; line-height: 1.5; }
        .pdf-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .pdf-vitals { display: grid; grid-template-columns: repeat(6, 1fr); gap: 8px; }
        .pdf-vital { background: #F9FAFB; border-radius: 6px; padding: 8px; text-align: center; }
        .pdf-vital label { font-size: 9px; color: #9CA3AF; display: block; margin-bottom: 2px; }
        .pdf-vital span { font-size: 12px; font-weight: 600; }
        .pdf-icd { display: inline-block; background: #E8F9F8; color: #25A89D; padding: 3px 10px; border-radius: 100px; font-size: 11px; font-weight: 600; margin-bottom: 8px; }
        .pdf-footer { border-top: 1px solid #E5E7EB; padding-top: 12px; margin-top: 20px; display: flex; justify-content: space-between; font-size: 11px; color: #9CA3AF; }
        .sig-line { border-top: 1px solid #1a1a1a; width: 160px; margin-top: 32px; padding-top: 4px; font-size: 11px; color: #6B7280; }
        @media print { body { -webkit-print-color-adjust: exact; } }
      </style>
      </head><body>${content}</body></html>
    `);
    w.document.close();
    w.focus();
    setTimeout(() => {
      w.print();
      w.close();
    }, 500);
  };

  const handleDownload = () => {
    const content = printRef.current.innerHTML;
    const blob = new Blob(
      [
        `<!DOCTYPE html><html><head><title>F-Form ${form.formNumber}</title>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: Arial, sans-serif; font-size: 13px; color: #1a1a1a; padding: 32px; max-width: 800px; margin: 0 auto; }
        .pdf-header { display: flex; justify-content: space-between; border-bottom: 2px solid #2EC4B6; padding-bottom: 16px; margin-bottom: 20px; }
        .pdf-logo { font-size: 22px; font-weight: 700; color: #2EC4B6; }
        .pdf-patient { background: #F4F7F6; border-radius: 8px; padding: 12px 16px; margin-bottom: 20px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
        .pdf-patient-item label { font-size: 10px; text-transform: uppercase; color: #9CA3AF; display: block; margin-bottom: 2px; }
        .pdf-patient-item span { font-weight: 600; }
        .pdf-section-title { font-size: 11px; font-weight: 700; text-transform: uppercase; color: #2EC4B6; margin-bottom: 8px; border-bottom: 1px solid #E5E7EB; padding-bottom: 4px; }
        .pdf-section { margin-bottom: 18px; }
        .pdf-field { margin-bottom: 10px; }
        .pdf-field label { font-size: 10px; color: #6B7280; text-transform: uppercase; display: block; margin-bottom: 2px; }
        .pdf-field p { font-size: 13px; line-height: 1.5; }
        .pdf-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .pdf-vitals { display: grid; grid-template-columns: repeat(6, 1fr); gap: 8px; }
        .pdf-vital { background: #F9FAFB; border-radius: 6px; padding: 8px; text-align: center; }
        .pdf-vital label { font-size: 9px; color: #9CA3AF; display: block; }
        .pdf-icd { display: inline-block; background: #E8F9F8; color: #25A89D; padding: 3px 10px; border-radius: 100px; font-size: 11px; font-weight: 600; margin-bottom: 8px; }
        .pdf-footer { border-top: 1px solid #E5E7EB; padding-top: 12px; margin-top: 20px; display: flex; justify-content: space-between; font-size: 11px; color: #9CA3AF; }
        .sig-line { border-top: 1px solid #1a1a1a; width: 160px; margin-top: 32px; padding-top: 4px; font-size: 11px; color: #6B7280; }
      </style></head><body>${content}</body></html>`,
      ],
      { type: "text/html" },
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `FForm-${form.formNumber}-${form.patient?.name?.replace(/\s+/g, "_")}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleShare = async () => {
    const text = `MediRecord F-Form\nForm: ${form.formNumber}\nPatient: ${form.patient?.name}\nDate: ${new Date(form.createdAt).toLocaleDateString("en-IN")}\nDiagnosis: ${form.provisionalDiagnosis || "N/A"}`;
    if (navigator.share) {
      navigator.share({ title: `F-Form ${form.formNumber}`, text });
    } else {
      await navigator.clipboard.writeText(text);
      alert("Form summary copied to clipboard!");
    }
  };

  const val = (v) => v || "—";

  return (
    <div
      className="fform-view-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="fform-view-modal">
        <div className="fform-view-toolbar">
          <h3>F-Form — {form.formNumber}</h3>
          <div className="fform-view-actions">
            <button className="btn btn--outline btn--sm" onClick={handleShare}>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                width="14"
                height="14"
              >
                <circle cx="18" cy="5" r="3" />
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="19" r="3" />
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
              </svg>
              Share
            </button>
            <button
              className="btn btn--outline btn--sm"
              onClick={handleDownload}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                width="14"
                height="14"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Download
            </button>
            <button className="btn btn--primary btn--sm" onClick={handlePrint}>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                width="14"
                height="14"
              >
                <polyline points="6 9 6 2 18 2 18 9" />
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                <rect x="6" y="14" width="12" height="8" />
              </svg>
              Print
            </button>
            <button className="fform-view-close" onClick={onClose}>
              ✕
            </button>
          </div>
        </div>

        <div className="fform-view-body">
          <div className="pdf-wrapper" ref={printRef}>
            {/* PDF Header */}
            <div className="pdf-header">
              <div>
                <div className="pdf-logo">
                  Medi<span>Record</span>
                </div>
                <div className="pdf-form-num">Clinical Findings Form</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontWeight: 700, fontSize: "16px" }}>
                  {form.formNumber}
                </div>
                <div className="pdf-form-num">
                  {form.clinic?.name || "MediRecord Clinic"}
                </div>
                <div className="pdf-form-num">
                  Date: {new Date(form.createdAt).toLocaleDateString("en-IN")}
                </div>
              </div>
            </div>

            {/* Patient Info */}
            <div className="pdf-patient">
              {[
                { label: "Patient Name", value: form.patient?.name },
                {
                  label: "Age / Gender",
                  value: `${form.patient?.age} yrs / ${form.patient?.gender}`,
                },
                { label: "Phone", value: form.patient?.phone },
                { label: "Doctor", value: form.createdBy?.name || "—" },
              ].map((i) => (
                <div key={i.label} className="pdf-patient-item">
                  <label>{i.label}</label>
                  <span>{i.value || "—"}</span>
                </div>
              ))}
            </div>

            {/* Chief Complaint */}
            <div className="pdf-section">
              <div className="pdf-section-title">Chief Complaint</div>
              <div className="pdf-field">
                <p>{val(form.chiefComplaint)}</p>
              </div>
            </div>

            {/* History */}
            {(form.historyOfPresentIllness ||
              form.pastMedicalHistory ||
              form.familyHistory ||
              form.allergies ||
              form.currentMedications) && (
              <div className="pdf-section">
                <div className="pdf-section-title">History</div>
                <div className="pdf-grid-2">
                  {form.historyOfPresentIllness && (
                    <div className="pdf-field">
                      <label>History of Present Illness</label>
                      <p>{form.historyOfPresentIllness}</p>
                    </div>
                  )}
                  {form.pastMedicalHistory && (
                    <div className="pdf-field">
                      <label>Past Medical History</label>
                      <p>{form.pastMedicalHistory}</p>
                    </div>
                  )}
                  {form.familyHistory && (
                    <div className="pdf-field">
                      <label>Family History</label>
                      <p>{form.familyHistory}</p>
                    </div>
                  )}
                  {form.allergies && (
                    <div className="pdf-field">
                      <label>Allergies</label>
                      <p>{form.allergies}</p>
                    </div>
                  )}
                  {form.currentMedications && (
                    <div className="pdf-field">
                      <label>Current Medications</label>
                      <p>{form.currentMedications}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Vitals */}
            {form.vitals && Object.values(form.vitals).some(Boolean) && (
              <div className="pdf-section">
                <div className="pdf-section-title">Vitals</div>
                <div className="pdf-vitals">
                  {[
                    { key: "bp", label: "BP" },
                    { key: "pulse", label: "Pulse" },
                    { key: "temp", label: "Temp" },
                    { key: "weight", label: "Weight" },
                    { key: "height", label: "Height" },
                    { key: "spo2", label: "SpO2" },
                  ].map((v) => (
                    <div key={v.key} className="pdf-vital">
                      <label>{v.label}</label>
                      <span>{form.vitals[v.key] || "—"}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Examination & Investigations */}
            {(form.physicalExamination || form.investigations) && (
              <div className="pdf-section">
                <div className="pdf-section-title">
                  Examination & Investigations
                </div>
                {form.physicalExamination && (
                  <div className="pdf-field">
                    <label>Physical Examination</label>
                    <p>{form.physicalExamination}</p>
                  </div>
                )}
                {form.investigations && (
                  <div className="pdf-field">
                    <label>Investigations</label>
                    <p>{form.investigations}</p>
                  </div>
                )}
              </div>
            )}

            {/* Diagnosis */}
            <div className="pdf-section">
              <div className="pdf-section-title">Diagnosis & Treatment</div>
              {form.icdCode && (
                <div className="pdf-icd">ICD-10: {form.icdCode}</div>
              )}
              <div className="pdf-grid-2">
                {form.provisionalDiagnosis && (
                  <div className="pdf-field">
                    <label>Provisional Diagnosis</label>
                    <p>{form.provisionalDiagnosis}</p>
                  </div>
                )}
                {form.differentialDiagnosis && (
                  <div className="pdf-field">
                    <label>Differential Diagnosis</label>
                    <p>{form.differentialDiagnosis}</p>
                  </div>
                )}
              </div>
              {form.treatmentPlan && (
                <div className="pdf-field">
                  <label>Treatment Plan</label>
                  <p>{form.treatmentPlan}</p>
                </div>
              )}
              {form.prescriptions && (
                <div className="pdf-field">
                  <label>Prescriptions</label>
                  <p style={{ whiteSpace: "pre-line" }}>{form.prescriptions}</p>
                </div>
              )}
              {form.followUpDate && (
                <div className="pdf-field">
                  <label>Follow-up Date</label>
                  <p>
                    {new Date(form.followUpDate).toLocaleDateString("en-IN")}
                  </p>
                </div>
              )}
              {form.doctorNotes && (
                <div className="pdf-field">
                  <label>Doctor Notes</label>
                  <p>{form.doctorNotes}</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="pdf-footer">
              <div>
                <div className="sig-line">Doctor Signature</div>
              </div>
              <div
                style={{
                  textAlign: "right",
                  fontSize: "11px",
                  color: "#9CA3AF",
                }}
              >
                <div>MediRecord — Smart EMR</div>
                <div>Generated: {new Date().toLocaleString("en-IN")}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
