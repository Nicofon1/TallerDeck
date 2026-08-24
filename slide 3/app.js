/* ==========================================================================
   DYNAMIC WIDE NOTCH PATH GENERATOR & SINGLE-SCREEN CLINICAL UI LOGIC
   ========================================================================== */

// 1. Precise Wide SVG Notch Path Generator (Generous clearance around circle)
function generateNotchPath(w, h, r = 24, notchSize = 96, arcRadius = 48) {
  const x1 = w - notchSize;
  const p1x = w - 64;
  const p1y = 16;
  const p2x = w - 16;
  const p2y = 64;
  const x2 = w;
  const y2 = notchSize;

  return `
    M ${r} 0 
    L ${x1} 0 
    C ${w - 82} 0, ${w - 72} 6, ${p1x} ${p1y} 
    A ${arcRadius} ${arcRadius} 0 0 0 ${p2x} ${p2y} 
    C ${w - 6} 72, ${w} 82, ${x2} ${y2} 
    L ${w} ${h - r} 
    A ${r} ${r} 0 0 1 ${w - r} ${h} 
    L ${r} ${h} 
    A ${r} ${r} 0 0 1 0 ${h - r} 
    L 0 ${r} 
    A ${r} ${r} 0 0 1 ${r} 0 
    Z
  `.trim();
}

function generateDocNotchPath(w, h, r = 20, notchSize = 68, arcRadius = 34) {
  const x1 = w - notchSize;
  const p1x = w - 44;
  const p1y = 12;
  const p2x = w - 12;
  const p2y = 44;
  const x2 = w;
  const y2 = notchSize;

  return `
    M ${r} 0 
    L ${x1} 0 
    C ${w - 58} 0, ${w - 50} 4, ${p1x} ${p1y} 
    A ${arcRadius} ${arcRadius} 0 0 0 ${p2x} ${p2y} 
    C ${w - 4} 50, ${w} 58, ${x2} ${y2} 
    L ${w} ${h - r} 
    A ${r} ${r} 0 0 1 ${w - r} ${h} 
    L ${r} ${h} 
    A ${r} ${r} 0 0 1 0 ${h - r} 
    L 0 ${r} 
    A ${r} ${r} 0 0 1 ${r} 0 
    Z
  `.trim();
}

function updateNotchShapes() {
  // Main Patient Card
  const patientCard = document.getElementById('patient-card');
  const patientFill = document.getElementById('patient-notch-fill');
  const patientStroke = document.getElementById('patient-notch-stroke');
  const patientSvg = document.getElementById('patient-notch-svg');

  if (patientCard && patientFill && patientStroke && patientSvg) {
    const rect = patientCard.getBoundingClientRect();
    const w = Math.round(rect.width);
    const h = Math.round(rect.height);
    if (w > 0 && h > 0) {
      patientSvg.setAttribute('viewBox', `0 0 ${w} ${h}`);
      const pathD = generateNotchPath(w, h, 24, 96, 48);
      patientFill.setAttribute('d', pathD);
      patientStroke.setAttribute('d', pathD);
    }
  }

  // Doctor Card
  const docCard = document.getElementById('doctor-card');
  const docFill = document.getElementById('doctor-notch-fill');
  const docStroke = document.getElementById('doctor-notch-stroke');
  const docSvg = document.getElementById('doctor-notch-svg');

  if (docCard && docFill && docStroke && docSvg) {
    const rect = docCard.getBoundingClientRect();
    const w = Math.round(rect.width);
    const h = Math.round(rect.height);
    if (w > 0 && h > 0) {
      docSvg.setAttribute('viewBox', `0 0 ${w} ${h}`);
      const pathD = generateDocNotchPath(w, h, 20, 68, 34);
      docFill.setAttribute('d', pathD);
      docStroke.setAttribute('d', pathD);
    }
  }
}

// 2. Multilingual Support
const i18n = {
  es: {
    patientName: "Lucas Mateo<br>Valenzuela<br>Rodríguez",
    patientAge: '<span>3 años</span><span>•</span><span class="text-red-600 bg-red-100 px-1.5 py-0.2 rounded text-[10px]">Código Rojo</span>',
    lblOrgan: "ÓRGANO AFECTADO",
    valOrgan: "Pulmón / Vías Aéreas",
    lblDiagnosis: "DIAGNÓSTICO INGRESO",
    valDiagnosis: "Sumersión & Edema Pulmonar",
    lblResp: "ESTADO RESPIRATORIO",
    valResp: "Hipoxemia Post-Intubación (82%)",
    lblHeart: "RITMO CARDÍACO",
    valHeart: "Bradicardia Pediátrica (<60 lpm)",
    lblProtocol: "PROTOCOLO APLICADO",
    valProtocol: "PALS: RCP (1 Ciclo) + O₂ 100%",
    lblDest: "DESTINO / TRASLADO",
    valDest: "Ingreso Inmediato a UCIP",
    lblDocNotes: "EVOLUCIÓN CLÍNICA & NOTA MÉDICA",
    valDocNotes: "Preescolar de 3 años rescatado tras inmersión accidental en piscina profunda. Ingresa inconsciente con fallo respiratorio y secreción espumosa. Tras intubación presenta hipoxemia y bradicardia severa; se ejecuta RCP PALS efectiva con soporte ventilatorio avanzado, logrando estabilización para entrega formal a UCIP.",
    docName: "Dra. Sarah J. Evans",
    docRole: "Especialista en Urgencias Pediátricas",
    docStatus: "Interconsulta UCIP Activa"
  },
  en: {
    patientName: "Lucas Mateo<br>Valenzuela<br>Rodríguez",
    patientAge: '<span>3 y/o</span><span>•</span><span class="text-red-600 bg-red-100 px-1.5 py-0.2 rounded text-[10px]">Code Red</span>',
    lblOrgan: "AFFECTED ORGAN",
    valOrgan: "Lungs / Airway",
    lblDiagnosis: "ADMISSION DIAGNOSIS",
    valDiagnosis: "Submersion & Acute Edema",
    lblResp: "RESPIRATORY STATUS",
    valResp: "Post-Intubation Hypoxemia (82%)",
    lblHeart: "HEART RHYTHM",
    valHeart: "Severe Bradycardia (<60 bpm)",
    lblProtocol: "APPLIED PROTOCOL",
    valProtocol: "PALS: CPR + 100% FiO₂",
    lblDest: "DISPOSITION / DESTINATION",
    valDest: "Immediate Transfer to PICU",
    lblDocNotes: "CLINICAL EVOLUTION & NOTES",
    valDocNotes: "3-year-old toddler rescued from pool submersion. Admitted with acute respiratory distress and foam in airway. Intubated on admission; developed refractory hypoxemia and acute bradycardia. Prompt PALS CPR and advanced ventilatory support achieved hemodynamic stability prior to PICU admission.",
    docName: "Dr. Sarah J. Evans, MD",
    docRole: "Pediatric Emergency Medicine",
    docStatus: "PICU Consult Active"
  }
};

function setLanguage(lang) {
  const data = i18n[lang];
  if (!data) return;

  document.getElementById('patient-name').innerHTML = data.patientName;
  document.getElementById('patient-age').innerHTML = data.patientAge;
  document.getElementById('lbl-organ').innerText = data.lblOrgan;
  document.getElementById('val-organ').innerText = data.valOrgan;
  document.getElementById('lbl-diagnosis').innerText = data.lblDiagnosis;
  document.getElementById('val-diagnosis').innerText = data.valDiagnosis;
  document.getElementById('lbl-resp').innerText = data.lblResp;
  document.getElementById('val-resp').innerText = data.valResp;
  document.getElementById('lbl-heart').innerText = data.lblHeart;
  document.getElementById('val-heart').innerText = data.valHeart;
  document.getElementById('lbl-protocol').innerText = data.lblProtocol;
  document.getElementById('val-protocol').innerText = data.valProtocol;
  document.getElementById('lbl-dest').innerText = data.lblDest;
  document.getElementById('val-dest').innerText = data.valDest;
  document.getElementById('lbl-doctor-notes').innerHTML = `<i class="fa-solid fa-notes-medical text-purple-600"></i> ${data.lblDocNotes}`;
  document.getElementById('val-doctor-notes').innerText = data.valDocNotes;
  document.getElementById('doc-name').innerText = data.docName;
  document.getElementById('doc-role').innerText = data.docRole;
  document.getElementById('doc-status').innerText = data.docStatus;

  const btnEs = document.getElementById('lang-es');
  const btnEn = document.getElementById('lang-en');
  if (lang === 'es') {
    btnEs.className = "px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-900 text-white transition-all";
    btnEn.className = "px-2.5 py-1 rounded-lg text-[11px] font-bold text-slate-600 hover:text-slate-900 transition-all";
  } else {
    btnEn.className = "px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-900 text-white transition-all";
    btnEs.className = "px-2.5 py-1 rounded-lg text-[11px] font-bold text-slate-600 hover:text-slate-900 transition-all";
  }

  setTimeout(updateNotchShapes, 30);
}

// 3. Modal Controls
function togglePalsModal() {
  const modal = document.getElementById('pals-modal');
  if (modal) modal.classList.toggle('hidden');
}

// 4. Diagnostic Tools
let isXrayInverted = false;
function toggleScanInvert() {
  isXrayInverted = !isXrayInverted;
  const img = document.getElementById('chest-xray-img');
  if (img) img.classList.toggle('inverted', isXrayInverted);
}

let isXrayZoomed = false;
function toggleScanZoom() {
  isXrayZoomed = !isXrayZoomed;
  const img = document.getElementById('chest-xray-img');
  if (img) img.classList.toggle('zoomed', isXrayZoomed);
}

let isEkgZoomed = false;
function toggleEkgZoom() {
  isEkgZoomed = !isEkgZoomed;
  const img = document.getElementById('ekg-strip-img');
  if (img) img.classList.toggle('zoomed', isEkgZoomed);
}

// 5. Recovery Simulation
let isRecovered = false;
function simulateRecovery() {
  isRecovered = !isRecovered;
  const vitalSpo2 = document.getElementById('vital-spo2');
  const vitalHr = document.getElementById('vital-hr');
  const valResp = document.getElementById('val-resp');
  const valHeart = document.getElementById('val-heart');

  if (isRecovered) {
    if (vitalSpo2) vitalSpo2.textContent = '95%';
    if (vitalHr) vitalHr.textContent = '112 lpm';
    if (valResp) {
      valResp.textContent = 'Normoxemia (SpO₂ 95%)';
      valResp.className = 'font-bold text-teal-700 text-xs sm:text-sm';
    }
    if (valHeart) {
      valHeart.textContent = 'Ritmo Sinusal Post-RCP (112 lpm)';
      valHeart.className = 'font-bold text-teal-700 text-xs sm:text-sm';
    }
  } else {
    if (vitalSpo2) vitalSpo2.textContent = '82%';
    if (vitalHr) vitalHr.textContent = '54 lpm';
    if (valResp) {
      valResp.textContent = 'Hipoxemia Post-Intubación (82%)';
      valResp.className = 'font-bold text-amber-700 text-xs sm:text-sm';
    }
    if (valHeart) {
      valHeart.textContent = 'Bradicardia Pediátrica (<60 lpm)';
      valHeart.className = 'font-bold text-red-600 text-xs sm:text-sm';
    }
  }
}

// Initialize on DOM Loaded
document.addEventListener('DOMContentLoaded', () => {
  updateNotchShapes();
  window.addEventListener('resize', updateNotchShapes);

  const patientCard = document.getElementById('patient-card');
  const docCard = document.getElementById('doctor-card');
  if (window.ResizeObserver) {
    const observer = new ResizeObserver(() => {
      updateNotchShapes();
    });
    if (patientCard) observer.observe(patientCard);
    if (docCard) observer.observe(docCard);
  }
});
