// Registration form — multi-step with validation

const TOTAL_STEPS = 4;
let currentStep = 1;

const form = document.getElementById('registrationForm');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const submitBtn = document.getElementById('submitBtn');
const progressBar = document.getElementById('progressBar');
const progressText = document.getElementById('progressText');
const stepIndicator = document.getElementById('stepIndicator');

function updateProgress() {
  const pct = (currentStep / TOTAL_STEPS) * 100;
  progressBar.style.width = pct + '%';
  progressText.textContent = `Step ${currentStep} of ${TOTAL_STEPS}`;
  stepIndicator.textContent = `Step ${currentStep} of ${TOTAL_STEPS}`;
  prevBtn.style.visibility = currentStep === 1 ? 'hidden' : 'visible';
  nextBtn.style.display = currentStep === TOTAL_STEPS ? 'none' : 'inline-flex';
  submitBtn.style.display = currentStep === TOTAL_STEPS ? 'inline-flex' : 'none';
}

function showStep(step) {
  document.querySelectorAll('.form-section-block').forEach(s => s.classList.remove('active'));
  document.querySelector(`[data-step="${step}"]`).classList.add('active');
  updateProgress();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Validation rules per step
function validateStep(step) {
  let valid = true;

  const setError = (id, show) => {
    const el = document.getElementById(id);
    if (el) el.classList.toggle('show', show);
  };
  const setFieldError = (id, show) => {
    const el = document.getElementById(id);
    if (el) el.classList.toggle('error', show);
  };

  if (step === 1) {
    const name = document.getElementById('name').value.trim();
    const whatsapp = document.getElementById('whatsapp').value.trim();
    const gender = document.querySelector('input[name="gender"]:checked');
    const course = document.getElementById('course').value;

    const nameOk = name.length >= 2;
    const waOk = /^[6-9]\d{9}$/.test(whatsapp);
    const genderOk = !!gender;
    const courseOk = course !== '';

    setFieldError('name', !nameOk); setError('nameError', !nameOk);
    setFieldError('whatsapp', !waOk); setError('whatsappError', !waOk);
    setError('genderError', !genderOk);
    setFieldError('course', !courseOk); setError('courseError', !courseOk);

    valid = nameOk && waOk && genderOk && courseOk;
  }

  if (step === 2) {
    const p10 = parseFloat(document.getElementById('percentage_10').value);
    const p12 = parseFloat(document.getElementById('percentage_12').value);
    const h = parseFloat(document.getElementById('height').value);
    const w = parseFloat(document.getElementById('weight').value);

    const p10Ok = !isNaN(p10) && p10 >= 0 && p10 <= 100;
    const p12Ok = !isNaN(p12) && p12 >= 0 && p12 <= 100;
    const hOk = !isNaN(h) && h >= 100 && h <= 250;
    const wOk = !isNaN(w) && w >= 30 && w <= 200;

    setFieldError('percentage_10', !p10Ok); setError('percentage10Error', !p10Ok);
    setFieldError('percentage_12', !p12Ok); setError('percentage12Error', !p12Ok);
    setFieldError('height', !hOk); setError('heightError', !hOk);
    setFieldError('weight', !wOk); setError('weightError', !wOk);

    valid = p10Ok && p12Ok && hOk && wOk;
  }

  if (step === 3) {
    // radio defaults are set so always valid, but check anyway
    const sa = document.querySelector('input[name="school_activity"]:checked');
    const ps = document.querySelector('input[name="parent_service"]:checked');
    setError('schoolActivityError', !sa);
    setError('parentServiceError', !ps);
    valid = !!sa && !!ps;
  }

  if (step === 4) {
    const gn = document.getElementById('guardian_name').value.trim();
    const gp = document.getElementById('guardian_phone').value.trim();
    const decl = document.getElementById('declaration').checked;

    const gnOk = gn.length >= 2;
    const gpOk = /^[6-9]\d{9}$/.test(gp);

    setFieldError('guardian_name', !gnOk); setError('guardianNameError', !gnOk);
    setFieldError('guardian_phone', !gpOk); setError('guardianPhoneError', !gpOk);
    setError('declarationError', !decl);

    valid = gnOk && gpOk && decl;
  }

  return valid;
}

prevBtn.addEventListener('click', () => {
  if (currentStep > 1) { currentStep--; showStep(currentStep); }
});

nextBtn.addEventListener('click', () => {
  if (validateStep(currentStep) && currentStep < TOTAL_STEPS) {
    currentStep++;
    showStep(currentStep);
  }
});

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!validateStep(4)) return;

  const payload = {
    name: document.getElementById('name').value.trim(),
    whatsapp: document.getElementById('whatsapp').value.trim(),
    gender: document.querySelector('input[name="gender"]:checked').value,
    course: document.getElementById('course').value,
    extracurricular: document.getElementById('extracurricular').value.trim(),
    achievements: document.getElementById('achievements').value.trim(),
    ncc_certificate: document.querySelector('input[name="ncc_certificate"]:checked')?.value || 'NIL',
    guardian_name: document.getElementById('guardian_name').value.trim(),
    guardian_phone: document.getElementById('guardian_phone').value.trim(),
    height: parseFloat(document.getElementById('height').value),
    weight: parseFloat(document.getElementById('weight').value),
    percentage_10: parseFloat(document.getElementById('percentage_10').value),
    percentage_12: parseFloat(document.getElementById('percentage_12').value),
    school_activity: document.querySelector('input[name="school_activity"]:checked')?.value || 'NIL',
    parent_service: document.querySelector('input[name="parent_service"]:checked')?.value || 'No'
  };

  submitBtn.disabled = true;
  document.getElementById('submitText').textContent = 'Submitting...';
  showSpinner();

  try {
    const res = await fetch(`${API_BASE}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();

    if (data.success) {
      sessionStorage.setItem('applicationId', data.data.application_id);
      window.location.href = `thankyou.html?id=${data.data.application_id}`;
    } else {
      const msg = data.errors?.[0]?.msg || data.message || 'Submission failed';
      showToast(msg, 'error');
      submitBtn.disabled = false;
      document.getElementById('submitText').textContent = 'Submit Application';
    }
  } catch {
    showToast('Network error. Please try again.', 'error');
    submitBtn.disabled = false;
    document.getElementById('submitText').textContent = 'Submit Application';
  } finally {
    hideSpinner();
  }
});

// Init
showStep(1);
