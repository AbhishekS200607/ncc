// Admin Dashboard — applications management

// State
let state = { page: 1, search: '', gender: '', course: '', cert: '', activity: '', sort: 'newest', deleteTargetId: null };

// DOM refs
const tableBody = document.getElementById('tableBody');
const pagination = document.getElementById('pagination');

// Auth header
const authHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('ncc_admin_token')}`
});

// Toast
function showToast(msg, type = 'success') {
  const c = document.getElementById('toastContainer');
  const icons = { success: ICONS.checkcircle, error: ICONS.alertcircle, info: ICONS.info };
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.innerHTML = `<span>${icons[type]}</span><span>${msg}</span>`;
  c.appendChild(t);
  setTimeout(() => t.remove(), 4000);
}
function showSpinner() { document.getElementById('spinner').style.display = 'flex'; }
function hideSpinner() { document.getElementById('spinner').style.display = 'none'; }

// Sidebar navigation
document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', () => {
    const page = item.dataset.page;
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    item.classList.add('active');
    document.querySelectorAll('.page-section').forEach(s => s.classList.remove('active'));
    document.getElementById(`page-${page}`).classList.add('active');
    document.getElementById('pageTitle').textContent = page.charAt(0).toUpperCase() + page.slice(1);
    // close sidebar on mobile
    document.getElementById('sidebar').classList.remove('open');
    document.getElementById('sidebarBackdrop').classList.remove('show');
    if (page === 'applications') loadApplications();
    if (page === 'dashboard') loadStats();
  });
});

// Mobile filter toggle
const filterToggleBtn = document.getElementById('filterToggleBtn');
const toolbarFilters = document.getElementById('toolbarFilters');
if (filterToggleBtn && toolbarFilters) {
  filterToggleBtn.addEventListener('click', () => toolbarFilters.classList.toggle('open'));
}

// Mobile sidebar
document.getElementById('menuToggle').addEventListener('click', () => {
  document.getElementById('sidebar').classList.toggle('open');
  document.getElementById('sidebarBackdrop').classList.toggle('show');
});
document.getElementById('sidebarBackdrop').addEventListener('click', () => {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebarBackdrop').classList.remove('show');
});

// Set admin name
const admin = JSON.parse(localStorage.getItem('ncc_admin_info') || '{}');
if (admin.username) {
  document.getElementById('adminName').textContent = admin.username;
  document.getElementById('adminAvatar').textContent = admin.username[0].toUpperCase();
}

// Load statistics
async function loadStats() {
  try {
    const res = await fetch(`${API_BASE}/admin/statistics`, { headers: authHeaders() });
    if (res.status === 401) { clearAuth(); window.location.href = 'admin-login.html'; return; }
    const { data } = await res.json();
    document.getElementById('statTotal').textContent = data.total;
    document.getElementById('statMale').textContent = data.male;
    document.getElementById('statFemale').textContent = data.female;
    document.getElementById('statCerts').textContent = data.certificate_holders;
    document.getElementById('statToday').textContent = data.today;
  } catch { showToast('Failed to load statistics', 'error'); }
}

// Load applications
async function loadApplications() {
  showSpinner();
  const params = new URLSearchParams({
    page: state.page, limit: 15,
    ...(state.search   && { search: state.search }),
    ...(state.gender   && { gender: state.gender }),
    ...(state.course   && { course: state.course }),
    ...(state.cert     && { ncc_certificate: state.cert }),
    ...(state.activity && { school_activity: state.activity }),
    sort: state.sort
  });

  try {
    const res = await fetch(`${API_BASE}/admin/applications?${params}`, { headers: authHeaders() });
    if (res.status === 401) { clearAuth(); window.location.href = 'admin-login.html'; return; }
    const json = await res.json();
    renderTable(json.data || []);
    renderPagination(json.count || 0, json.totalPages || 1);
  } catch { showToast('Failed to load applications', 'error'); }
  finally { hideSpinner(); }
}

// Render table + mobile cards
function renderTable(rows) {
  const mobileCards = document.getElementById('mobileCards');
  if (!rows.length) {
    tableBody.innerHTML = `<tr><td colspan="14"><div class="empty-state"><div class="icon">${ICONS.inbox}</div><h3>No applications found</h3><p>Try adjusting your search or filters</p></div></td></tr>`;
    if (mobileCards) mobileCards.innerHTML = `<div class="empty-state"><div class="icon">${ICONS.inbox}</div><h3>No applications found</h3><p>Try adjusting your search or filters</p></div>`;
    return;
  }
  tableBody.innerHTML = rows.map(r => `
    <tr>
      <td><code style="font-size:0.75rem;background:#f3f4f6;padding:2px 6px;border-radius:4px;">${r.application_id}</code></td>
      <td><strong>${escHtml(r.name)}</strong></td>
      <td>${escHtml(r.whatsapp)}</td>
      <td><span class="badge ${r.gender.toLowerCase()}">${r.gender}</span></td>
      <td style="max-width:120px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${escHtml(r.course)}">${escHtml(r.course)}</td>
      <td>${r.height} cm</td>
      <td>${r.weight} kg</td>
      <td>${r.percentage_10}%</td>
      <td>${r.percentage_12}%</td>
      <td><span class="badge ${r.ncc_certificate === 'A Certificate' ? 'cert-a' : r.ncc_certificate === 'B Certificate' ? 'cert-b' : 'cert-nil'}">${r.ncc_certificate}</span></td>
      <td>${escHtml(r.school_activity)}</td>
      <td>${escHtml(r.parent_service)}</td>
      <td style="white-space:nowrap;font-size:0.8rem;">${new Date(r.created_at).toLocaleDateString('en-IN')}</td>
      <td>
        <div class="action-btns">
          <button class="action-btn view" title="View" onclick="viewApplication('${r.id}')">${ICONS.eye}</button>
          <button class="action-btn edit" title="Edit" onclick="editApplication('${r.id}')">${ICONS.edit}</button>
          <button class="action-btn delete" title="Delete" onclick="confirmDelete('${r.id}')">${ICONS.trash}</button>
          <button class="action-btn print" title="Print" onclick="printApplication('${r.id}')">${ICONS.printer}</button>
        </div>
      </td>
    </tr>`).join('');

  // Mobile cards
  if (mobileCards) {
    mobileCards.innerHTML = rows.map(r => `
      <div class="app-card">
        <div class="app-card-header">
          <strong>${escHtml(r.name)}</strong>
          <code>${r.application_id}</code>
        </div>
        <div class="app-card-row"><span>Gender</span><span><span class="badge ${r.gender.toLowerCase()}">${r.gender}</span></span></div>
        <div class="app-card-row"><span>Department</span><span>${escHtml(r.course)}</span></div>
        <div class="app-card-row"><span>WhatsApp</span><span>${escHtml(r.whatsapp)}</span></div>
        <div class="app-card-row"><span>NCC Cert</span><span><span class="badge ${r.ncc_certificate === 'A Certificate' ? 'cert-a' : r.ncc_certificate === 'B Certificate' ? 'cert-b' : 'cert-nil'}">${r.ncc_certificate}</span></span></div>
        <div class="app-card-row"><span>Height / Weight</span><span>${r.height} cm / ${r.weight} kg</span></div>
        <div class="app-card-row"><span>Date</span><span>${new Date(r.created_at).toLocaleDateString('en-IN')}</span></div>
        <div class="app-card-actions">
          <button class="action-btn view" title="View" onclick="viewApplication('${r.id}')">${ICONS.eye}</button>
          <button class="action-btn edit" title="Edit" onclick="editApplication('${r.id}')">${ICONS.edit}</button>
          <button class="action-btn delete" title="Delete" onclick="confirmDelete('${r.id}')">${ICONS.trash}</button>
          <button class="action-btn print" title="Print" onclick="printApplication('${r.id}')">${ICONS.printer}</button>
        </div>
      </div>`).join('');
  }
}

// Render pagination
function renderPagination(total, totalPages) {
  const start = (state.page - 1) * 15 + 1;
  const end = Math.min(state.page * 15, total);
  let html = `<span class="pagination-info">Showing ${total ? start : 0}–${end} of ${total}</span><div class="pagination-btns">`;
  html += `<button class="page-btn" onclick="changePage(${state.page - 1})" ${state.page === 1 ? 'disabled' : ''}>‹</button>`;
  for (let i = Math.max(1, state.page - 2); i <= Math.min(totalPages, state.page + 2); i++) {
    html += `<button class="page-btn ${i === state.page ? 'active' : ''}" onclick="changePage(${i})">${i}</button>`;
  }
  html += `<button class="page-btn" onclick="changePage(${state.page + 1})" ${state.page === totalPages ? 'disabled' : ''}>›</button></div>`;
  pagination.innerHTML = html;
}

function changePage(p) { state.page = p; loadApplications(); }

// Filters
let searchTimer;
document.getElementById('searchInput').addEventListener('input', e => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => { state.search = e.target.value; state.page = 1; loadApplications(); }, 400);
});
const filterMap = { filterGender: 'gender', filterCourse: 'course', filterCert: 'cert', filterActivity: 'activity', sortOrder: 'sort' };
Object.entries(filterMap).forEach(([id, key]) => {
  document.getElementById(id).addEventListener('change', e => {
    state[key] = e.target.value; state.page = 1; loadApplications();
  });
});

// View application
async function viewApplication(id) {
  showSpinner();
  try {
    const res = await fetch(`${API_BASE}/admin/application/${id}`, { headers: authHeaders() });
    const { data: r } = await res.json();
    document.getElementById('viewModalBody').innerHTML = `
      <div class="app-id-badge"><span>Application ID</span><strong>${r.application_id}</strong></div>
      <div class="detail-grid">
        <div class="detail-item"><label>Full Name</label><p>${escHtml(r.name)}</p></div>
        <div class="detail-item"><label>WhatsApp</label><p>${escHtml(r.whatsapp)}</p></div>
        <div class="detail-item"><label>Gender</label><p>${r.gender}</p></div>
        <div class="detail-item"><label>Course</label><p>${escHtml(r.course)}</p></div>
        <div class="detail-item"><label>Height</label><p>${r.height} cm</p></div>
        <div class="detail-item"><label>Weight</label><p>${r.weight} kg</p></div>
        <div class="detail-item"><label>10th %</label><p>${r.percentage_10}%</p></div>
        <div class="detail-item"><label>12th %</label><p>${r.percentage_12}%</p></div>
        <div class="detail-item"><label>NCC Certificate</label><p>${r.ncc_certificate}</p></div>
        <div class="detail-item"><label>School Activity</label><p>${r.school_activity}</p></div>
        <div class="detail-item"><label>Parent Service</label><p>${r.parent_service}</p></div>
        <div class="detail-item"><label>Guardian Name</label><p>${escHtml(r.guardian_name)}</p></div>
        <div class="detail-item"><label>Guardian Phone</label><p>${escHtml(r.guardian_phone)}</p></div>
        <div class="detail-item"><label>Date Submitted</label><p>${new Date(r.created_at).toLocaleString('en-IN')}</p></div>
        ${r.extracurricular ? `<div class="detail-item full"><label>Extracurricular</label><p>${escHtml(r.extracurricular)}</p></div>` : ''}
        ${r.achievements ? `<div class="detail-item full"><label>Achievements</label><p>${escHtml(r.achievements)}</p></div>` : ''}
      </div>`;
    openModal('viewModal');
  } catch { showToast('Failed to load details', 'error'); }
  finally { hideSpinner(); }
}

// Edit application
async function editApplication(id) {
  showSpinner();
  try {
    const res = await fetch(`${API_BASE}/admin/application/${id}`, { headers: authHeaders() });
    const { data: r } = await res.json();
    document.getElementById('editId').value = r.id;
    document.getElementById('editName').value = r.name;
    document.getElementById('editWhatsapp').value = r.whatsapp;
    document.getElementById('editCourse').value = r.course;
    document.getElementById('editHeight').value = r.height;
    document.getElementById('editWeight').value = r.weight;
    document.getElementById('editP10').value = r.percentage_10;
    document.getElementById('editP12').value = r.percentage_12;
    openModal('editModal');
  } catch { showToast('Failed to load application', 'error'); }
  finally { hideSpinner(); }
}

document.getElementById('editForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = document.getElementById('editId').value;
  const payload = {
    name: document.getElementById('editName').value.trim(),
    whatsapp: document.getElementById('editWhatsapp').value.trim(),
    course: document.getElementById('editCourse').value.trim(),
    height: parseFloat(document.getElementById('editHeight').value),
    weight: parseFloat(document.getElementById('editWeight').value),
    percentage_10: parseFloat(document.getElementById('editP10').value),
    percentage_12: parseFloat(document.getElementById('editP12').value)
  };
  showSpinner();
  try {
    const res = await fetch(`${API_BASE}/admin/application/${id}`, {
      method: 'PUT', headers: authHeaders(), body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (data.success) { closeModal('editModal'); showToast('Application updated'); loadApplications(); }
    else showToast(data.message || 'Update failed', 'error');
  } catch { showToast('Update failed', 'error'); }
  finally { hideSpinner(); }
});

// Delete
function confirmDelete(id) { state.deleteTargetId = id; openModal('deleteModal'); }
document.getElementById('confirmDeleteBtn').addEventListener('click', async () => {
  if (!state.deleteTargetId) return;
  showSpinner();
  try {
    const res = await fetch(`${API_BASE}/admin/application/${state.deleteTargetId}`, { method: 'DELETE', headers: authHeaders() });
    const data = await res.json();
    if (data.success) { closeModal('deleteModal'); showToast('Application deleted'); loadApplications(); loadStats(); }
    else showToast(data.message || 'Delete failed', 'error');
  } catch { showToast('Delete failed', 'error'); }
  finally { hideSpinner(); state.deleteTargetId = null; }
});

// Print
async function printApplication(id) {
  showSpinner();
  try {
    const res = await fetch(`${API_BASE}/admin/application/${id}`, { headers: authHeaders() });
    const { data: r } = await res.json();
    const win = window.open('', '_blank');
    win.document.write(`<!DOCTYPE html><html><head><title>Application ${r.application_id}</title>
    <style>body{font-family:Arial,sans-serif;padding:2rem;max-width:700px;margin:0 auto;}h1{color:#2e3a14;border-bottom:2px solid #c9a84c;padding-bottom:0.5rem;}table{width:100%;border-collapse:collapse;margin-top:1rem;}td{padding:8px 12px;border:1px solid #e5e7eb;font-size:0.9rem;}td:first-child{font-weight:700;background:#f5f5f0;width:40%;}</style>
    </head><body>
    <h1>🎖️ NCC Enrollment Application</h1>
    <table>
      <tr><td>Application ID</td><td>${r.application_id}</td></tr>
      <tr><td>Name</td><td>${escHtml(r.name)}</td></tr>
      <tr><td>WhatsApp</td><td>${r.whatsapp}</td></tr>
      <tr><td>Gender</td><td>${r.gender}</td></tr>
      <tr><td>Course</td><td>${escHtml(r.course)}</td></tr>
      <tr><td>Height</td><td>${r.height} cm</td></tr>
      <tr><td>Weight</td><td>${r.weight} kg</td></tr>
      <tr><td>10th %</td><td>${r.percentage_10}%</td></tr>
      <tr><td>12th %</td><td>${r.percentage_12}%</td></tr>
      <tr><td>NCC Certificate</td><td>${r.ncc_certificate}</td></tr>
      <tr><td>School Activity</td><td>${r.school_activity}</td></tr>
      <tr><td>Parent Service</td><td>${r.parent_service}</td></tr>
      <tr><td>Guardian Name</td><td>${escHtml(r.guardian_name)}</td></tr>
      <tr><td>Guardian Phone</td><td>${r.guardian_phone}</td></tr>
      <tr><td>Date Submitted</td><td>${new Date(r.created_at).toLocaleString('en-IN')}</td></tr>
    </table>
    <script>window.onload=()=>{window.print();}<\/script></body></html>`);
    win.document.close();
  } catch { showToast('Print failed', 'error'); }
  finally { hideSpinner(); }
}

// Export
document.getElementById('exportCsvBtn').addEventListener('click', () => exportData('csv'));
document.getElementById('exportXlsxBtn').addEventListener('click', () => exportData('xlsx'));
async function exportData(format) {
  showSpinner();
  try {
    const res = await fetch(`${API_BASE}/admin/applications/export?format=${format}`, { headers: authHeaders() });
    if (!res.ok) throw new Error();
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `applications.${format}`; a.click();
    URL.revokeObjectURL(url);
    showToast(`Exported as ${format.toUpperCase()}`);
  } catch { showToast('Export failed', 'error'); }
  finally { hideSpinner(); }
}

// Modal helpers
function openModal(id) { document.getElementById(id).classList.add('open'); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }
document.querySelectorAll('.modal-close, .btn-cancel').forEach(btn => {
  btn.addEventListener('click', () => closeModal(btn.dataset.modal));
});
document.querySelectorAll('.modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', e => { if (e.target === overlay) overlay.classList.remove('open'); });
});

// XSS protection
function escHtml(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// Init
loadStats();
