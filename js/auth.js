// ============================================
//  auth.js
//  Fungsi login & logout admin
// ============================================

const ADMIN_USER  = 'admin';
const ADMIN_PASS  = 'pln2024';
const SESSION_KEY = 'pln_logged_in';

function requireLogin() {
  if (!sessionStorage.getItem(SESSION_KEY)) {
    window.location.href = 'index.html';
  }
}

function doLogin() {
  const username = document.getElementById('loginUser').value.trim();
  const password = document.getElementById('loginPass').value;
  const errorEl  = document.getElementById('loginError');

  if (username === ADMIN_USER && password === ADMIN_PASS) {
    sessionStorage.setItem(SESSION_KEY, 'true');
    window.location.href = 'entry.html';
  } else {
    errorEl.style.display = 'block';
    errorEl.textContent   = 'Username atau password salah!';
  }
}

function doLogout() {
  if (confirm('Yakin ingin keluar?')) {
    sessionStorage.removeItem(SESSION_KEY);
    window.location.href = 'index.html';
  }
}

window.doLogin  = doLogin;
window.doLogout = doLogout;

document.addEventListener('DOMContentLoaded', function () {
  const passInput = document.getElementById('loginPass');
  if (passInput) {
    passInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') doLogin();
    });
  }
});
