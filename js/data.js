// ============================================
//  data.js
//  Tampilkan tabel data aset, filter & pencarian
// ============================================

import { listenAssets } from "./firebase-config.js";

let semuaAssets  = [];
let filterUlp    = 'semua';

// Inisialisasi halaman data
document.addEventListener('DOMContentLoaded', function () {
  // Dengarkan perubahan data secara realtime dari Firestore
  listenAssets(function (assets) {
    semuaAssets = assets;
    tampilData();
    bangunFilterUlp();
  });
});

function sorotKata(teks, kata) {
  if (!kata) return teks;
  const regex = new RegExp(`(${kata.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return String(teks).replace(regex, '<span class="highlight">$1</span>');
}

function bangunFilterUlp() {
  const ulpUnik   = [...new Set(semuaAssets.map(a => a.ulp).filter(Boolean))].sort();
  const container = document.getElementById('ulpFilters');
  container.innerHTML = `<button class="filter-chip ${filterUlp === 'semua' ? 'active' : ''}" onclick="setFilterUlp('semua', this)">Semua ULP</button>`;
  ulpUnik.forEach(ulp => {
    const btn = document.createElement('button');
    btn.className = 'filter-chip' + (filterUlp === ulp ? ' active' : '');
    btn.textContent = '📍 ' + ulp;
    btn.onclick = function () { setFilterUlp(ulp, this); };
    container.appendChild(btn);
  });
}

function setFilterUlp(ulp, el) {
  filterUlp = ulp;
  document.querySelectorAll('#ulpFilters .filter-chip').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  tampilData();
}

function hapusCari() {
  document.getElementById('inputCari').value = '';
  document.getElementById('btnHapusCari').style.display = 'none';
  tampilData();
}

function tampilData() {
  const kata     = document.getElementById('inputCari').value.trim().toLowerCase();
  const btnHapus = document.getElementById('btnHapusCari');
  btnHapus.style.display = kata ? 'flex' : 'none';

  bangunFilterUlp();

  const hasil = semuaAssets.filter(aset => {
    const cocokCari = !kata || aset.nama.toLowerCase().includes(kata) || (aset.ulp || '').toLowerCase().includes(kata);
    const cocokUlp  = filterUlp === 'semua' || aset.ulp === filterUlp;
    return cocokCari && cocokUlp;
  });

  const infoEl = document.getElementById('infoHasil');
  infoEl.textContent = (kata || filterUlp !== 'semua')
    ? `Menampilkan ${hasil.length} dari ${semuaAssets.length} aset`
    : '';

  document.getElementById('jumlahAset').textContent = semuaAssets.length + ' aset';
  renderBarisTabel(hasil, kata);
}

function renderBarisTabel(list, kata) {
  const tbody = document.getElementById('tabelBody');

  if (semuaAssets.length === 0) {
    tbody.innerHTML = `<tr><td colspan="9"><div class="empty-state">
      <div class="empty-icon">📦</div>
      <div class="empty-text">Belum ada data</div>
      <div class="empty-sub">Tambahkan melalui halaman Entry Data</div>
    </div></td></tr>`;
    return;
  }

  if (list.length === 0) {
    tbody.innerHTML = `<tr><td colspan="9"><div class="empty-state">
      <div class="empty-icon">🔍</div>
      <div class="empty-text">Data tidak ditemukan</div>
      <div class="empty-sub">Coba kata kunci atau filter lain</div>
    </div></td></tr>`;
    return;
  }

  tbody.innerHTML = list.map((aset, i) => {
    const fotoHtml = aset.fotoFiles && aset.fotoFiles.length
      ? `<img src="${aset.fotoFiles[0].data}" style="width:36px;height:36px;border-radius:6px;object-fit:cover;cursor:pointer;border:2px solid var(--border)" onclick="bukaFoto('${aset.fotoFiles[0].data}')">`
      : '—';

    return `<tr>
      <td class="mono">${i + 1}</td>
      <td style="font-weight:700;min-width:120px">${sorotKata(aset.nama, kata)}</td>
      <td><span class="chip">${sorotKata(aset.ulp, kata)}</span></td>
      <td class="mono">${aset.tglUL || '—'}</td>
      <td class="mono">${aset.tglULP || '—'}</td>
      <td class="mono">${aset.usia}</td>
      <td class="mono">${aset.masaEkonomis}</td>
      <td class="mono" style="font-weight:700">${aset.sisa}</td>
      <td>${fotoHtml}</td>
    </tr>`;
  }).join('');
}

function bukaFoto(src) {
  document.getElementById('modalImg').src = src;
  document.getElementById('imgModal').classList.add('open');
}

function tutupFoto() {
  document.getElementById('imgModal').classList.remove('open');
}

function tampilToast(pesan) {
  const toast = document.getElementById('toast');
  toast.textContent = pesan;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

window.tampilData   = tampilData;
window.setFilterUlp = setFilterUlp;
window.hapusCari    = hapusCari;
window.bukaFoto     = bukaFoto;
window.tutupFoto    = tutupFoto;
