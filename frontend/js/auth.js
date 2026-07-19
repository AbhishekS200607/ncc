// Auth utilities — shared between login and dashboard

const API_BASE = 'http://localhost:5000/api';

const getToken = () => localStorage.getItem('ncc_admin_token');
const getAdmin = () => JSON.parse(localStorage.getItem('ncc_admin_info') || '{}');
const setAuth = (token, info) => {
  localStorage.setItem('ncc_admin_token', token);
  localStorage.setItem('ncc_admin_info', JSON.stringify(info));
};
const clearAuth = () => {
  localStorage.removeItem('ncc_admin_token');
  localStorage.removeItem('ncc_admin_info');
};

// Redirect if not authenticated (for dashboard page)
if (document.getElementById('sidebar')) {
  if (!getToken()) window.location.href = 'admin-login.html';
}

// LOGIN FORM
const loginForm = document.getElementById('loginForm');
if (loginForm) {
  // Redirect if already logged in
  if (getToken()) window.location.href = 'admin-dashboard.html';

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const errorEl = document.getElementById('loginError');
    const btn = document.getElementById('loginBtn');
    const btnText = document.getElementById('loginBtnText');

    errorEl.classList.remove('show');
    btn.disabled = true;
    btnText.textContent = 'Logging in...';

    try {
      const res = await fetch(`${API_BASE}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();

      if (data.success) {
        setAuth(data.data.token, { username: data.data.username, email: data.data.email });
        window.location.href = 'admin-dashboard.html';
      } else {
        errorEl.textContent = data.message || 'Invalid credentials';
        errorEl.classList.add('show');
      }
    } catch {
      errorEl.textContent = 'Network error. Please try again.';
      errorEl.classList.add('show');
    } finally {
      btn.disabled = false;
      btnText.textContent = 'Login to Dashboard';
    }
  });
}

// LOGOUT
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
  logoutBtn.addEventListener('click', () => {
    clearAuth();
    window.location.href = 'admin-login.html';
  });
}
