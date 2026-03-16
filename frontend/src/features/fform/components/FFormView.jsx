import { useRef } from 'react'
import { useAuth } from '../../auth/hooks/useAuth'
import '../styles/fformview.scss'

// ── USG Indications list (23 items from PC & PNDT Act) ─────────────────
const USG_IND = [
  ['i_viability',           'i.',   'To diagnose intra-uterine and/or ecotopic pregnancy & confirm viability'],
  ['ii_dating',             'ii.',  'Estimation of gestational age (dating)'],
  ['iii_fetuses',           'iii.', 'Detection of number of fetuses and their chorionicity'],
  ['iv_iucd_mtp',           'iv.',  'Suspected pregnancy with IUCD in-situ or suspected pregnancy following contraceptive failure / MTP failure'],
  ['v_bleeding',            'v.',   'Vaginal bleeding / Leaking'],
  ['vi_abortion',           'vi.',  'Follow-up of case of abortion'],
  ['vii_cervical',          'vii.', 'Assessment of cervical canal and diameter of internal os'],
  ['viii_discrepancy',      'viii.','Discrepancy between uterine size and period of amenorrhea'],
  ['ix_adnexal',            'ix.',  'Any suspected adnexal or uterine pathology/abnormality'],
  ['x_chromosomal',         'x.',   'Detection of chromosomal abnormalities, fetal structural defects and other abnormalities and their follow-up'],
  ['xi_presentation',       'xi.',  'To evaluate fetal presentation and position'],
  ['xii_liquor',            'xii.', 'Assessment of liquor amnii'],
  ['xiii_preterm',          'xiii.','Preterm labor / preterm premature rupture of membranes'],
  ['xiv_placenta',          'xiv.', 'Evaluation of placement position, thickness, grading and abnormalities (placenta previa, retro placental haemorrhage, abnormal adherence etc.)'],
  ['xv_umbilical',          'xv.',  'Evaluation of umbilical cord-presentation, insertion, nuchal encirclement, number of vessels, and presence of true knot'],
  ['xvi_caesarean',         'xvi.', 'Evaluation of previous caesarean section scars'],
  ['xvii_growth',           'xvii.','Evaluation of fetal growth parameters, fetal weight and fetal well being'],
  ['xviii_doppler',         'xviii.','Colour flow mapping and duplex Doppler studies'],
  ['xix_guided',            'xix.', 'Ultrasound guided procedures such as medical termination of pregnancy, external cephalic version etc. and their follow-up'],
  ['xx_invasive',           'xx.',  'Adjunct to diagnostic and therapeutic invasive intervention such as chorionic villus sampling (CVS), amniocenteses fetal blood sampling fetal skin biopsy, amnio-infusion, intrauterine infusion, placements of shunts etc.'],
  ['xxi_intrapartum',       'xxi.', 'Observation of intra-partum events'],
  ['xxii_medical_surgical', 'xxii.','Medical / Surgical conditions complicating pregnancy'],
  ['xxiii_research',        'xxiii.','Research/scientific studies in recognized institutions'],
]

// ── Build the complete Form F HTML — mirrors the physical govt form ─────
function buildFormFHtml(form, clinic, user) {
  const p   = form.patient || {}
  const sA  = form.sectionA  || {}
  const sB  = form.sectionB  || {}
  const sC  = form.sectionC  || {}
  const sD  = form.sectionD  || {}
  const ind = sB.indications || {}
  const cInd= sC.indications || {}
  const cProc = sC.procedure || {}
  const cDiag = sC.diagnosisBasis || {}
  const cAT   = sC.additionalTests || {}

  const clinicName    = clinic?.name    || user?.clinic?.name || 'MediRecord Clinic'
  const clinicAddr    = clinic?.address || user?.clinic?.address || ''
  const clinicPndt    = clinic?.pndtRegNo || user?.clinic?.pndtRegNo || ''
  const clinicLogo    = clinic?.logoUrl || clinic?.logo || ''

  const fmt = d => d ? new Date(d).toLocaleDateString('en-IN', {day:'2-digit',month:'2-digit',year:'numeric'}) : '___________'
  const val = v => v || '___________'
  const tick = v => v ? '<b>✓</b>' : '□'
  const lmp = p.lmp ? fmt(p.lmp) : '___________'
  const weeks = p.weeksOfPregnancy != null ? `${p.weeksOfPregnancy} wk${p.daysOfPregnancy ? ` ${p.daysOfPregnancy}d` : ''}` : ''
  const relative = p.relativeName
    ? `${p.relationType || 'Husband'}'s Name: ${p.relativeName}`
    : p.husbandName ? `Husband's Name: ${p.husbandName}` : '___________'
  const children = `${p.livingChildrenMale||0} Sons${p.livingChildrenMaleAge?' ('+p.livingChildrenMaleAge+')':''}, ${p.livingChildrenFemale||0} Daughters${p.livingChildrenFemaleAge?' ('+p.livingChildrenFemaleAge+')':''}`
  const referredBy = p.referredDoctor?.name
    ? `${p.referredDoctor.name}${p.referredDoctor.qualification?' ('+p.referredDoctor.qualification+')':''}, ${p.referredDoctor.address||''}`
    : p.referredBy || '___________'
  const address = [p.address, p.district, p.state].filter(Boolean).join(', ') || '___________'
  const procedureDate = sA.procedureDate ? fmt(sA.procedureDate) : fmt(p.visitDate)
  const declarationDate = sA.declarationDate ? fmt(sA.declarationDate) : fmt(p.patientRegDate || p.visitDate)

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Form F — ${form.formNumber || 'PNDT Form'}</title>
<style>
  /* ── Reset — One-page Form F ── */
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'Times New Roman',Times,serif;font-size:7.5pt;color:#000;background:#fff}
  .page{width:210mm;min-height:297mm;padding:4mm 7mm;display:block}

  /* ── Header ── */
  .form-header{border:1.5px solid #000;padding:2px 5px;margin-bottom:3px;display:flex;justify-content:space-between;align-items:flex-start;gap:6px}
  .form-title-block{flex:1}
  .form-title-main{font-size:7.5pt;font-weight:bold;text-transform:uppercase;line-height:1.3}
  .form-title-sub{font-size:7pt;font-style:italic;line-height:1.2}
  .clinic-block{border-left:1px solid #000;padding-left:8px;min-width:160px;text-align:right;flex-shrink:0}
  .clinic-name{font-size:8.5pt;font-weight:bold;line-height:1.2}
  .clinic-addr{font-size:7pt;margin-top:1px;line-height:1.3}
  .clinic-reg{font-size:7.5pt;font-weight:bold;margin-top:2px}
  .clinic-logo{max-height:26px;object-fit:contain;display:block;margin-bottom:2px;margin-left:auto}

  /* ── Section headings ── */
  .sec-head{background:#000;color:#fff;font-size:6.8pt;font-weight:bold;padding:1px 4px;margin:2px 0 1px;text-transform:uppercase;letter-spacing:.03em}
  .sec-head-sm{background:#333;color:#fff;font-size:6.8pt;font-weight:bold;padding:1px 4px;margin:1px 0 1px}

  /* ── Field rows ── */
  .field-row{display:flex;align-items:baseline;margin-bottom:1px;font-size:7.5pt;line-height:1.25}
  .field-label{font-weight:normal;white-space:nowrap;margin-right:3px;flex-shrink:0}
  .field-val{border-bottom:1px solid #000;flex:1;min-height:8px;padding:0 2px;font-size:7.5pt;font-style:italic}
  .field-val-bold{font-weight:bold;font-style:normal}

  /* ── Two-column body ── */
  .body-cols{display:grid;grid-template-columns:1fr 1fr;gap:0;border-top:1.5px solid #000}
  .col-left{padding-right:6px;border-right:1.5px solid #000}
  .col-right{padding-left:6px}

  /* ── Indication checkboxes — 2 column grid for space saving ── */
  .ind-grid{display:grid;grid-template-columns:1fr 1fr;gap:0;margin:1px 0}
  .ind-item{display:flex;gap:2px;margin-bottom:0.5px;font-size:6.5pt;line-height:1.2;align-items:flex-start;padding-right:2px}
  .ind-num{flex-shrink:0;width:16px;font-weight:bold;font-size:6.5pt}
  .ind-chk{flex-shrink:0;width:10px;font-size:8pt;line-height:1}
  .ind-txt{flex:1;font-size:6.5pt;line-height:1.15}

  /* ── Checkboxes in a row ── */
  .chk-row{display:flex;flex-wrap:wrap;gap:1px 8px;margin:1px 0;font-size:6.8pt}
  .chk-item{display:flex;align-items:center;gap:2px;white-space:nowrap}

  /* ── Declaration box ── */
  .declaration{border:1px solid #000;padding:1px 4px;margin:1px 0;font-size:7pt;line-height:1.3}
  .decl-gu{font-size:7pt;line-height:1.3;margin-top:2px;border-top:1px dashed #666;padding-top:1px}

  /* ── Signature area ── */
  .sig-row{display:flex;justify-content:space-between;margin-top:2px;gap:6px}
  .sig-box{flex:1}
  .sig-line{border-top:1px solid #000;margin-top:8px;padding-top:2px;font-size:6.5pt;text-align:center;line-height:1.2}
  .sig-date{font-size:6.5pt;margin-bottom:0px}

  /* ── Thumb impression section ── */
  .thumb-section{border:1px solid #555;padding:1px 4px;font-size:6.8pt;margin-top:1px}

  /* ── Results ── */
  .proc-result{margin-top:2px}
  .result-line{border-bottom:1px solid #000;min-height:7px;margin:1px 0;font-size:7pt;padding:0 2px;font-style:italic}

  /* ── Util ── */
  .bold{font-weight:bold}
  .italic{font-style:italic}
  .underline{text-decoration:underline}
  .indent{margin-left:10px}
  .mt2{margin-top:1px}
  .mt4{margin-top:2px}
  .small{font-size:7pt}
  .form-no{font-size:7.5pt;font-weight:bold;float:right;margin-top:-1px}

  @media print{
    body{-webkit-print-color-adjust:exact;print-color-adjust:exact}
    .page{padding:3mm 6mm;width:100%}
    @page{size:A4;margin:0}
  }
</style>
</head>
<body>
<div class="page">

<!-- ══ FORM HEADER ════════════════════════════════════════════════════ -->
<div class="form-header">
  <div class="form-title-block">
    <div class="form-title-main">FORM F &nbsp; [See Proviso to Section 4(3), rule 9(4) and rule 10(1A)]</div>
    <div class="form-title-sub">FORM FOR MAINTENANCE OF RECORD IN CASE OF PRENATAL DIAGNOSTIC TEST / PROCEDURE<br>BY GENETIC CLINIC / ULTRASOUND CLINIC / IMAGING CENTRE</div>
  </div>
  <div class="clinic-block">
    ${clinicLogo ? `<img src="${clinicLogo}" class="clinic-logo" alt="">` : ''}
    <div class="clinic-name">${clinicName}</div>
    ${clinicAddr ? `<div class="clinic-addr">${clinicAddr}</div>` : ''}
    ${clinicPndt ? `<div class="clinic-reg">Reg. No. ${clinicPndt}</div>` : ''}
  </div>
</div>
<div class="form-no">Form No.: <span style="text-decoration:underline">${form.formNumber || ''}</span></div>

<!-- ══ SECTION A ══════════════════════════════════════════════════════ -->
<div class="sec-head">Section A : To be filled in for all Diagnostic Procedures / Tests</div>

<div class="field-row">
  <span class="field-label">1. Name and complete address of Genetic Clinic / Ultrasound Clinic / Imaging Center :</span>
  <span class="field-val field-val-bold">${clinicName}${clinicAddr ? ', ' + clinicAddr : ''}</span>
</div>
<div class="field-row">
  <span class="field-label">2. Registration No. (Under PC &amp; PNDT Act, 1994) :</span>
  <span class="field-val field-val-bold">${val(clinicPndt)}</span>
</div>
<div class="field-row">
  <span class="field-label">3. Patient's name :</span>
  <span class="field-val field-val-bold">${val(p.name)}</span>
  <span style="margin-left:8px" class="field-label">Age :</span>
  <span class="field-val field-val-bold" style="max-width:60px">${p.age ? p.age + ' ' + (p.ageUnit||'yrs') : '___'}</span>
</div>
<div class="field-row">
  <span class="field-label">4. Total Number of living children :</span>
  <span class="field-val field-val-bold">${(p.livingChildrenMale||0) + (p.livingChildrenFemale||0)}</span>
</div>
<div class="field-row indent">
  <span class="field-label">(a) Number of living Sons with age :</span>
  <span class="field-val field-val-bold">${p.livingChildrenMale||0}${p.livingChildrenMaleAge ? ' — Ages: ' + p.livingChildrenMaleAge : ''}</span>
</div>
<div class="field-row indent">
  <span class="field-label">(b) Number of living Daughters with age :</span>
  <span class="field-val field-val-bold">${p.livingChildrenFemale||0}${p.livingChildrenFemaleAge ? ' — Ages: ' + p.livingChildrenFemaleAge : ''}</span>
</div>
<div class="field-row">
  <span class="field-label">5. ${p.relationType ? p.relationType + "'s" : "Husband's/Wife's/Father's/Mother's"} Name :</span>
  <span class="field-val field-val-bold">${val(p.relativeName || p.husbandName)}</span>
</div>
<div class="field-row">
  <span class="field-label">6. Full postal address of the patient with Contact Number, if any :</span>
  <span class="field-val field-val-bold">${val(address)}${p.phone ? ' — Ph: ' + p.phone : ''}</span>
</div>
<div class="field-row">
  <span class="field-label">7. (a) Referred by (Full name and address of Doctor(s)/Genetic Counseling Centre) :</span>
  <span class="field-val field-val-bold">${val(referredBy)}</span>
</div>
<div class="field-row indent">
  <span class="field-label small italic">(Referral slips to be preserved carefully with Form F)</span>
</div>
<div class="field-row">
  <span class="field-label">&nbsp;&nbsp;&nbsp;&nbsp;(b) Self-Referral by Gynaecologist/Radiologist/Registered Medical Practitioner :</span>
  <span class="field-val">${sB.performedBy && !p.referredDoctor?.name ? sB.performedBy : ''}</span>
</div>
<div class="field-row">
  <span class="field-label">8. Last menstrual period / weeks of pregnancy :</span>
  <span class="field-val field-val-bold">${lmp}${weeks ? ' / ' + weeks : ''}</span>
</div>

<!-- ══ TWO-COLUMN BODY (Section B left, Section C right) ════════════ -->
<div class="body-cols">

<!-- ── LEFT COLUMN: SECTION B ──────────────────────────────────────── -->
<div class="col-left">
  <div class="sec-head-sm">Section B : To be Filled in for performing non-invasive diagnostic Procedures / Tests Only</div>

  <div class="field-row mt2">
    <span class="field-label">9. Name of the doctor performing the procedure/s :</span>
    <span class="field-val field-val-bold">${val(sB.performedBy || sA.doctorName)}</span>
  </div>

  <div class="mt2 bold small">10. Indication/s for diagnosis procedure :</div>
  <div class="small italic indent" style="margin-bottom:2px">(Put a "Tick" against the appropriate indication/s)</div>

  <div class="ind-grid">
    ${USG_IND.map(([key, num, label]) => `
    <div class="ind-item">
      <span class="ind-num">${num}</span>
      <span class="ind-chk">${ind[key] ? '☑' : '☐'}</span>
      <span class="ind-txt">${label}</span>
    </div>`).join('')}
    <div class="ind-item" style="grid-column:1/-1">
      <span class="ind-num"></span>
      <span class="ind-chk"></span>
      <span class="ind-txt">Any other (specify): <span style="border-bottom:1px solid #000;display:inline-block;min-width:80px;font-style:italic">${ind.other || ''}</span></span>
    </div>
  </div>

  <div class="field-row mt2">
    <span class="field-label bold">11. Procedures carried out (Non-Invasive) — <span class="small italic">(Put a "Tick")</span></span>
  </div>
  <div class="chk-row indent">
    <span class="chk-item">${sB.procedureType==='Ultrasound'||!sB.procedureType ? '☑' : '☐'} <span>i. Ultrasound</span></span>
    <span class="chk-item">${sB.procedureType==='Other' ? '☑' : '☐'} <span>ii. Any other (specify): <span style="border-bottom:1px solid #000;display:inline-block;min-width:60px;font-style:italic">${sB.procedureOther||''}</span></span></span>
  </div>

  <div class="field-row mt2">
    <span class="field-label">12. Date on which declaration of pregnant woman/person was obtained :</span>
    <span class="field-val field-val-bold">${declarationDate}</span>
  </div>
  <div class="field-row">
    <span class="field-label">13. Date on which procedures carried out :</span>
    <span class="field-val field-val-bold">${procedureDate}</span>
  </div>
  <div class="bold small mt2">14. Result of the non-invasive procedure carried out <span class="italic">(report in brief including ultrasound carried out)</span> :</div>
  <div class="proc-result">
    ${sB.resultBrief
      ? `<div class="result-line">${sB.resultBrief}</div>`
      : `<div class="result-line"></div><div class="result-line"></div><div class="result-line"></div>`
    }
  </div>
  <div class="field-row mt2">
    <span class="field-label">15. The result of pre-natal diagnostic procedure were conveyed to</span>
  </div>
  <div class="field-row">
    <span class="field-val field-val-bold">${val(sB.conveyedTo)}</span>
    <span style="margin:0 4px"> on </span>
    <span class="field-val field-val-bold" style="max-width:90px">${sB.conveyedDate ? fmt(sB.conveyedDate) : '___________'}</span>
  </div>
  <div class="field-row mt2">
    <span class="field-label">16. Any indication for MTP as per the abnormality detected in the diagnostic procedures / tests :</span>
  </div>
  <div class="field-val" style="display:block;min-height:14px;border-bottom:1px solid #000;font-style:italic">${sB.mtpIndication || ''}</div>
</div>

<!-- ── RIGHT COLUMN: SECTION C ─────────────────────────────────────── -->
<div class="col-right">
  <div class="sec-head-sm">Section C : To be Filled for Invasive Procedures / Tests Only</div>

  <div class="field-row mt2">
    <span class="field-label">17. Name of the doctor performing the procedure/s :</span>
    <span class="field-val field-val-bold">${sC.enabled ? val(sC.performedBy) : ''}</span>
  </div>
  <div class="field-row">
    <span class="field-label">18. History of genetic/medical disease in the family (specify) :</span>
    <span class="field-val" style="font-style:italic">${sC.enabled ? (sC.familyHistory || '') : ''}</span>
  </div>
  <div class="small mt2">basis of diagnosis <span class="italic">(Tick on appropriate basis of diagnosis)</span>:</div>
  <div class="chk-row small indent">
    <span class="chk-item">${sC.enabled&&cDiag.clinical   ?'☑':'☐'} (a) Clinical</span>
    <span class="chk-item">${sC.enabled&&cDiag.biochemical?'☑':'☐'} (b) Bio-Chemical</span>
    <span class="chk-item">${sC.enabled&&cDiag.cytogenetic?'☑':'☐'} (c) Cytogenetic</span>
    <span class="chk-item">${sC.enabled&&cDiag.other?'☑':'☐'} (d) other: <span style="border-bottom:1px solid #000;display:inline-block;min-width:50px;font-style:italic">${sC.enabled?cDiag.other||'':''}</span></span>
  </div>

  <div class="small mt2 bold">19. Indication/s for the diagnosis procedure <span class="italic">("Tick" on appropriate indication/s)</span></div>
  <div class="small indent mt2">A. Previous child/children with:</div>
  <div class="chk-row small indent" style="margin-left:20px">
    <span class="chk-item">${sC.enabled&&cInd.chromosomal   ?'☑':'☐'} (i) chromosomal disorders</span>
    <span class="chk-item">${sC.enabled&&cInd.metabolic     ?'☑':'☐'} (ii) Metabolic disorders</span>
    <span class="chk-item">${sC.enabled&&cInd.congenital    ?'☑':'☐'} (iii) Congenital anomaly</span>
    <span class="chk-item">${sC.enabled&&cInd.mentalDisability?'☑':'☐'} (iv) Mental Disability</span>
    <span class="chk-item">${sC.enabled&&cInd.haemoglobin   ?'☑':'☐'} (v) Haemoglobin opathy</span>
    <span class="chk-item">${sC.enabled&&cInd.sexLinked     ?'☑':'☐'} (vi) Sex linked disorders</span>
    <span class="chk-item">${sC.enabled&&cInd.singleGene    ?'☑':'☐'} (vii) Single gene disorder</span>
    <span class="chk-item">${sC.enabled&&cInd.other?'☑':'☐'} (viii) Any other: <span style="border-bottom:1px solid #000;display:inline-block;min-width:50px;font-style:italic">${sC.enabled?cInd.other||'':''}</span></span>
  </div>
  <div class="chk-row small indent">
    <span class="chk-item">${sC.enabled&&cInd.advancedAge?'☑':'☐'} B. Advanced maternal age (35 years)</span>
    <span class="chk-item">C. Mother/Father/sibling has genetic disease: <span style="border-bottom:1px solid #000;display:inline-block;min-width:60px;font-style:italic">${sC.enabled?cInd.genetic||'':''}</span></span>
  </div>
  <div class="field-row small indent">
    <span class="field-label">D. other (specify):</span>
    <span class="field-val">${sC.enabled?cInd.other2||'':''}</span>
  </div>

  <div class="field-row mt2">
    <span class="field-label">20. Date on which consent of pregnant woman/person was obtained in Form G :</span>
    <span class="field-val field-val-bold">${sC.enabled&&sC.consentDate ? fmt(sC.consentDate) : '___________'}</span>
  </div>

  <div class="small mt2 bold">21. Invasive procedures carried out <span class="italic">("Tick" on appropriate indication/s)</span></div>
  <div class="chk-row small indent">
    <span class="chk-item">${sC.enabled&&cProc.amniocentesis?'☑':'☐'} i. Amniocentesis</span>
    <span class="chk-item">${sC.enabled&&cProc.cvs         ?'☑':'☐'} ii. Chorionic Villi aspiration</span>
    <span class="chk-item">${sC.enabled&&cProc.fetalBiopsy ?'☑':'☐'} iii. Fetal Biopsy</span>
    <span class="chk-item">${sC.enabled&&cProc.cordocentesis?'☑':'☐'} iv. Cordocentesis</span>
    <span class="chk-item">${sC.enabled&&cProc.other?'☑':'☐'} v. Any other: <span style="border-bottom:1px solid #000;display:inline-block;min-width:50px">${sC.enabled?cProc.other||'':''}</span></span>
  </div>

  <div class="field-row mt2">
    <span class="field-label">22. Any complication/s of invasive procedure (specify) :</span>
    <span class="field-val" style="font-style:italic">${sC.enabled?sC.complications||'':''}</span>
  </div>
  <div class="small mt2">23. Additional tests recommended <span class="italic">(please mention if applicable)</span></div>
  <div class="chk-row small indent">
    <span class="chk-item">${sC.enabled&&cAT.chromosomal    ?'☑':'☐'} (i) Chromosomal studies</span>
    <span class="chk-item">${sC.enabled&&cAT.biochemical    ?'☑':'☐'} (ii) Biochemical studies</span>
    <span class="chk-item">${sC.enabled&&cAT.molecular      ?'☑':'☐'} (iii) Molecular studies</span>
    <span class="chk-item">${sC.enabled&&cAT.preimplantation?'☑':'☐'} (iv) Pre-implantation gender diagnosis</span>
    <span class="chk-item">${sC.enabled&&cAT.other?'☑':'☐'} (v) Any other: <span style="border-bottom:1px solid #000;display:inline-block;min-width:40px">${sC.enabled?cAT.other||'':''}</span></span>
  </div>
  <div class="bold small mt2">24. Result of the procedures/Tests carried out <span class="italic">(report in brief of the invasive tests/procedure carried out)</span> :</div>
  <div class="proc-result">
    ${sC.enabled && sC.resultBrief
      ? `<div class="result-line">${sC.resultBrief}</div>`
      : `<div class="result-line"></div><div class="result-line"></div>`
    }
  </div>
  <div class="field-row mt2">
    <span class="field-label">25. Date on which procedures carried out :</span>
    <span class="field-val field-val-bold">${sC.enabled&&sC.procedureDate ? fmt(sC.procedureDate) : '___________'}</span>
  </div>
  <div class="field-row">
    <span class="field-label">26. The result of pre-natal diagnostic procedure were conveyed to</span>
    <span class="field-val field-val-bold">${sC.enabled?val(sC.conveyedTo):''}</span>
    <span> on </span>
    <span class="field-val field-val-bold" style="max-width:80px">${sC.enabled&&sC.conveyedDate?fmt(sC.conveyedDate):'___________'}</span>
  </div>
  <div class="field-row mt2">
    <span class="field-label">27. Any indication for MTP as per the abnormality detected in the diagnostic procedures/tests :</span>
  </div>
  <div class="field-val" style="display:block;min-height:14px;border-bottom:1px solid #000;font-style:italic">${sC.enabled?sC.mtpIndication||'':''}</div>

  <div class="sig-row mt2">
    <div class="sig-box">
      <div class="sig-date">Date : ${procedureDate}</div>
      <div class="sig-date">Place : ${clinicAddr ? clinicAddr.split(',')[0] : 'PATAN'}</div>
    </div>
    <div class="sig-box" style="text-align:center">
      <div class="sig-line">Name, Signature and Registration number<br>with seal of the Gynaecologist/Radiologist/<br>Registered Medical Practitioner performing<br>Diagnostic procedure/s</div>
      <div style="border:1px solid #000;width:60px;height:24px;margin:2px auto;display:flex;align-items:center;justify-content:center;font-size:6.5pt">SEAL</div>
    </div>
  </div>
</div>

</div><!-- end body-cols -->

<!-- ══ SECTION D ══════════════════════════════════════════════════════ -->
<div class="sec-head" style="margin-top:1px">Section D &nbsp; DECLARATION OF THE PERSON UNDERGOING PRENATAL DIAGNOSTIC TEST / PROCEDURE</div>

<div class="declaration" style="padding:2px 4px">
  <div>I, Mrs./Mr. <span style="border-bottom:1px solid #000;display:inline-block;min-width:200px;font-weight:bold">${p.name || ''}</span> declare that by undergoing <span class="underline">ultrasonography</span> &nbsp; Prenatal Diagnostic test / Procedure. I do not want to know the sex of my foetus.</div>
  <div class="sig-row" style="margin-top:4px">
    <div class="sig-date">Date : ${declarationDate}</div>
    <div style="text-align:center">
      <div class="sig-line" style="width:160px;margin-top:8px">Signature / Thumb impression of the person<br>undergoing the prenatal Diagnostic Test/Procedure</div>
    </div>
  </div>
</div>

<!-- Gujarati declaration -->
<div class="decl-gu" style="margin-top:2px;padding-top:2px">
  <span class="bold">પ્રિનેટલ ડાયગ્નોસ્ટીક ટેસ્ટ / પ્રોસીઝર કરાવનાર વ્યક્તિનો કબુલાત પત્ર</span><br>
  હું શ્રીમતિ <span style="border-bottom:1px solid #000;display:inline-block;min-width:160px;font-weight:bold">${p.name || ''}</span> આથી જાહેર કરૂં છું કે ગર્ભસ્થ બાળકની પ્રિનેટલ ડાયગ્નોસ્ટીક ટેસ્ટ / પ્રોસીઝર (સોનોગ્રાફી) તપાસ દરમ્યાન મારે મારા બાળક ની જાતિ (બાબો કે બેબી) જાણવી નથી.<br>
  <div style="display:flex;justify-content:space-between;margin-top:2px">
    <span>તારીખ : ${declarationDate}</span>
    <span style="border-top:1px solid #000;display:inline-block;min-width:180px;text-align:center;padding-top:2px">દર્દીની સહી અથવા અંગૂઠાનું નિશાન</span>
  </div>
</div>

${sD.thumbImpression ? `
<div class="thumb-section" style="padding:2px 4px;margin-top:2px">
  <div class="bold">In case of Thumb Impression :</div>
  <div class="field-row mt2">
    <span class="field-label">Identified by (Name)</span>
    <span class="field-val field-val-bold">${val(sD.witnessName)}</span>
  </div>
  <div class="field-row">
    <span class="field-label">Age :</span>
    <span class="field-val field-val-bold" style="max-width:50px">${sD.witnessAge||'___'}</span>
    <span style="margin:0 6px">Sex</span>
    <span class="field-val field-val-bold" style="max-width:50px">${sD.witnessSex||'___'}</span>
    <span style="margin:0 6px">Relation (if any)</span>
    <span class="field-val field-val-bold">${sD.witnessRelation||'___________'}</span>
  </div>
  <div class="field-row">
    <span class="field-label">Add. &amp; Contact No.</span>
    <span class="field-val field-val-bold">${sD.witnessContact||'___________'}</span>
  </div>
  <div style="text-align:right;margin-top:4px">
    <div style="display:inline-block;border-top:1px solid #000;min-width:160px;text-align:center;padding-top:2px;font-size:8pt">
      Signature of a person attesting thumb impression
    </div>
  </div>
</div>` : ''}

<!-- Radiologist declaration (compact - no border box) -->
<div style="border-top:1px solid #000;margin-top:1px;padding:1px 3px;font-size:6.5pt;line-height:1.2">
  <span class="bold" style="font-size:6.5pt;text-transform:uppercase">Declaration of the Person Conducting Ultrasonography / Image Scanning</span>
  <span> I, </span><span style="border-bottom:1px solid #000;display:inline-block;min-width:90px;font-weight:bold;font-size:7pt">${val(sB.performedBy || sA.doctorName)}</span>
  <span style="font-size:6.5pt"> declare that while conducting ultrasonography/image Scanning on Ms./Mr. </span>
  <span style="border-bottom:1px solid #000;display:inline-block;min-width:90px;font-weight:bold;font-size:7pt">${val(p.name)}</span>
  <span style="font-size:6.5pt">, I have neither detected nor disclosed sex of her fetus to anybody in any manner.</span>
</div>

<!-- Final signatures -->
<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:1px;border-top:1px solid #000;padding-top:2px">
  <div>
    <div class="sig-date" style="margin-bottom:0">Date : ${procedureDate}</div>
    <div class="sig-date" style="margin-bottom:0">Place : ${clinicAddr ? clinicAddr.split(',')[0] : 'PATAN'}</div>
    <div style="text-align:center;margin-top:4px">
      <div style="border:1px solid #000;width:60px;height:28px;margin:0 auto;display:flex;align-items:center;justify-content:center;font-size:7pt">SEAL</div>
      <div style="font-size:8pt;margin-top:2px;font-weight:bold">Radiologist</div>
    </div>
  </div>
  <div>
    <div class="sig-date" style="margin-bottom:0">Date : ${procedureDate}</div>
    <div class="sig-date" style="margin-bottom:0">Place : ${clinicAddr ? clinicAddr.split(',')[0] : 'PATAN'}</div>
    <div style="text-align:center;margin-top:4px">
      <div style="border:1px solid #000;width:60px;height:28px;margin:0 auto;display:flex;align-items:center;justify-content:center;font-size:7pt">SEAL</div>
      <div style="font-size:8pt;margin-top:2px;font-weight:bold">Radiologist</div>
    </div>
  </div>
</div>

<!-- Generated by note -->
<div style="border-top:1px dashed #ccc;margin-top:2px;padding-top:2px;font-size:6.5pt;color:#555;display:flex;justify-content:space-between">
  <span>MediRecord Smart EMR — Form F (PNDT) — ${form.formNumber || ''}</span>
  <span>Generated: ${new Date().toLocaleString('en-IN')}</span>
</div>

</div><!-- end page -->
</body>
</html>`
}

// ── Main Component ─────────────────────────────────────────────────────
export default function FFormView({ form, onClose }) {
  const { user } = useAuth()
  const clinic = form.clinic || {}

  const handlePrint = () => {
    const html = buildFormFHtml(form, clinic, user)
    const w = window.open('', '_blank', 'width=920,height=800')
    if (!w) { alert('Please allow pop-ups to print the form'); return }
    w.document.write(html)
    w.document.close()
    w.focus()
    setTimeout(() => w.print(), 600)
  }

  const handleSavePdf = () => {
    const html = buildFormFHtml(form, clinic, user)
    const w = window.open('', '_blank', 'width=920,height=800')
    if (!w) { alert('Please allow pop-ups to save PDF'); return }
    w.document.write(html)
    w.document.close()
    w.focus()
    setTimeout(() => w.print(), 600)
  }

  const handleShare = async () => {
    const text = `MediRecord Form F\nForm: ${form.formNumber}\nPatient: ${form.patient?.name}\nDate: ${new Date(form.createdAt).toLocaleDateString('en-IN')}\nDoctor: ${form.sectionA?.doctorName || form.createdBy?.name || '—'}`
    if (navigator.share) { navigator.share({ title: `Form F ${form.formNumber}`, text }) }
    else { await navigator.clipboard.writeText(text); alert('Form details copied to clipboard!') }
  }

  const p = form.patient || {}
  const sB = form.sectionB || {}
  const sC = form.sectionC || {}

  return (
    <div className="fform-view-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="fform-view-modal">
        <div className="fform-view-toolbar">
          <div>
            <h3>Form F — {form.formNumber}</h3>
            <div style={{fontSize:11,color:'var(--text-3)',marginTop:1}}>
              {p.name} · {new Date(form.createdAt).toLocaleDateString('en-IN')}
              {form.sectionB?.indications && Object.values(form.sectionB.indications).some(Boolean) ? ' · Section B ✓' : ''}
              {sC.enabled ? ' · Section C ✓' : ''}
            </div>
          </div>
          <div className="fform-view-actions">
            <button className="btn btn--secondary btn--sm" onClick={handleShare}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
              Share
            </button>
            <button className="btn btn--secondary btn--sm" onClick={handleSavePdf}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Save PDF
            </button>
            <button className="btn btn--primary btn--sm" onClick={handlePrint}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
              Print
            </button>
            <button className="fform-view-close" onClick={onClose}>✕</button>
          </div>
        </div>

        {/* Preview */}
        <div className="fform-view-body">
          <div className="fform-preview-notice">
            <span>📄 </span>
            <span>This is the official Form F (PC &amp; PNDT Act). Click <strong>Print</strong> or <strong>Save PDF</strong> for the formatted government document with all sections.</span>
          </div>

          {/* Summary preview (not the full form — that's in the print window) */}
          <div className="fform-preview-summary">
            <div className="fform-ps__header">
              {(clinic.logoUrl || clinic.logo) && <img src={clinic.logoUrl || clinic.logo} alt="" style={{height:28,objectFit:'contain'}} />}
              <div className="fform-ps__title">{clinic.name || user?.clinic?.name}</div>
              <div style={{marginLeft:'auto',fontFamily:'var(--font-num)',fontSize:18,fontWeight:900,color:'var(--teal)'}}>{form.formNumber}</div>
            </div>

            <div className="fform-ps__grid">
              {[
                ['Patient', p.name],
                ['Age/Gender', `${p.age} ${p.ageUnit||'yrs'} / ${p.gender}`],
                [p.relationType||"Husband's Name", p.relativeName || p.husbandName || '—'],
                ['Phone', p.phone],
                ['LMP', p.lmp ? new Date(p.lmp).toLocaleDateString('en-IN') : '—'],
                ['Weeks', p.weeksOfPregnancy ? `${p.weeksOfPregnancy}w ${p.daysOfPregnancy||0}d` : '—'],
                ['Referred By', p.referredDoctor?.name || p.referredBy || 'Self'],
                ['Procedure Date', sB.performedBy ? (form.sectionA?.procedureDate ? new Date(form.sectionA.procedureDate).toLocaleDateString('en-IN') : '—') : '—'],
                ['Performing Doctor', sB.performedBy || form.sectionA?.doctorName || '—'],
                ['PNDT Reg. No.', clinic.pndtRegNo || user?.clinic?.pndtRegNo || '—'],
              ].map(([l,v]) => (
                <div key={l} className="fform-ps__item">
                  <div className="fform-ps__label">{l}</div>
                  <div className="fform-ps__value">{v || '—'}</div>
                </div>
              ))}
            </div>

            {/* Checked indications summary */}
            {sB.indications && Object.values(sB.indications).some(v=>v===true) && (
              <div className="fform-ps__inds">
                <div className="fform-ps__ind-title">Section B — USG Indications Ticked:</div>
                <div className="fform-ps__ind-list">
                  {Object.entries(sB.indications).filter(([,v])=>v===true).map(([k]) => {
                    const entry = [
                      ['i_viability','Viability'],['ii_dating','Dating'],['iii_fetuses','Fetuses/Chorionicity'],
                      ['iv_iucd_mtp','IUCD/MTP'],['v_bleeding','Bleeding/Leaking'],['vi_abortion','Abortion F/U'],
                      ['vii_cervical','Cervical'],['viii_discrepancy','Size Discrepancy'],['ix_adnexal','Adnexal'],
                      ['x_chromosomal','Chromosomal/Structural'],['xi_presentation','Presentation'],['xii_liquor','Liquor Amnii'],
                      ['xiii_preterm','Preterm Labor'],['xiv_placenta','Placenta'],['xv_umbilical','Umbilical Cord'],
                      ['xvi_caesarean','Caesarean Scar'],['xvii_growth','Growth/Weight'],['xviii_doppler','Doppler'],
                      ['xix_guided','Guided Procedures'],['xx_invasive','Invasive Adjunct'],['xxi_intrapartum','Intrapartum'],
                      ['xxii_medical_surgical','Medical/Surgical'],['xxiii_research','Research'],
                    ].find(([key]) => key===k)
                    return entry ? <span key={k} className="fform-ps__ind-badge">{entry[1]}</span> : null
                  })}
                </div>
              </div>
            )}

            {/* Result brief */}
            {sB.resultBrief && (
              <div className="fform-ps__result">
                <div className="fform-ps__result-label">Section B Result:</div>
                <div className="fform-ps__result-text">{sB.resultBrief}</div>
              </div>
            )}

            {sC.enabled && (
              <div className="fform-ps__invasive">
                <span>⚠ Section C (Invasive) completed</span>
                {sC.resultBrief && <span className="fform-ps__result-text"> — {sC.resultBrief}</span>}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
