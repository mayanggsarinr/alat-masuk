// ============================================
//  entry.js
//  Logika form entry data kendaraan/peralatan
// ============================================

import { addAsset } from "./firebase-config.js";

// Hitung usia pemakaian & sisa masa ekonomis otomatis
function hitungUsia() {
  const tglUL  = document.getElementById('f_tgl_ul').value;
  const tglULP = document.getElementById('f_tgl_ulp').value;
  const masaEkonomis = parseInt(document.getElementById('f_masa_ekonomis').value) || 0;

  const tglRef = tglUL || tglULP;
  if (!tglRef) return;

  const today = new Date();
  const start = new Date(tglRef);
  const usia  = Math.max(0, Math.floor((today - start) / (1000 * 60 * 60 * 24)));

  document.getElementById('calc_usia').textContent = usia + ' hari';

  if (masaEkonomis > 0) {
    const sisa = masaEkonomis - usia;
    document.getElementById('calc_sisa').textContent = sisa + ' hari';
  }
}

// Preview file yang diupload
function previewFiles(inputId, previewId) {
  const input   = document.getElementById(inputId);
  const preview = document.getElementById(previewId);
  preview.innerHTML = '';

  Array.from(input.files).forEach(file => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = function (e) {
        const img = document.createElement('img');
        img.className = 'file-thumb';
        img.src = e.target.result;
        img.onclick = () => bukaFoto(e.target.result);
        preview.appendChild(img);
      };
      reader.readAsDataURL(file);
    } else {
      const div = document.createElement('div');
      div.style.cssText = 'padding:6px 10px;background:#EEF3FF;border-radius:8px;font-size:11px;color:var(--pln-blue);font-weight:600';
      div.textContent = '📄 ' + file.name;
      preview.appendChild(div);
    }
  });
}

function bukaFoto(src) {
  document.getElementById('modalImg').src = src;
  document.getElementById('imgModal').classList.add('open');
}

function tutupFoto() {
  document.getElementById('imgModal').classList.remove('open');
}

// Simpan data entry ke Firestore
async function simpanEntry() {
  const no           = document.getElementById('f_no').value.trim();
  const nama         = document.getElementById('f_nama').value.trim();
  const tglUL        = document.getElementById('f_tgl_ul').value;
  const tglULP       = document.getElementById('f_tgl_ulp').value;
  const ulp          = document.getElementById('f_ulp').value;
  const masaEkonomis = parseInt(document.getElementById('f_masa_ekonomis').value) || 0;

  if (!nama || !ulp || (!tglUL && !tglULP)) {
    tampilToast('⚠️ Lengkapi nama, ULP, dan tanggal diterima!');
    return;
  }

  const tglRef = tglUL || tglULP;
  const today  = new Date();
  const usia   = Math.max(0, Math.floor((today - new Date(tglRef)) / (1000 * 60 * 60 * 24)));
  const sisa   = masaEkonomis - usia;

  const baFiles   = [];
  const fotoFiles = [];

  function prosesFile(inputId, arr, callback) {
    const input  = document.getElementById(inputId);
    let pending  = input.files.length;
    if (!pending) { callback(); return; }

    Array.from(input.files).forEach(file => {
      const reader = new FileReader();
      reader.onload = function (e) {
        arr.push({ name: file.name, data: e.target.result });
        if (--pending === 0) callback();
      };
      reader.readAsDataURL(file);
    });
  }

  // Tampil loading
  const btnSimpan = document.getElementById('btnSimpan');
  btnSimpan.textContent = '⏳ Menyimpan...';
  btnSimpan.disabled = true;

  prosesFile('file_ba', baFiles, function () {
    prosesFile('file_foto', fotoFiles, async function () {
      const asetBaru = {
        no          : no || '',
        nama        : nama,
        tglUL       : tglUL,
        tglULP      : tglULP,
        ulp         : ulp,
        masaEkonomis: masaEkonomis,
        usia        : usia,
        sisa        : sisa,
        realisasi   : 0,
        baFiles     : baFiles,
        fotoFiles   : fotoFiles,
        tglEntry    : new Date().toISOString()
      };

      await addAsset(asetBaru);
      resetForm();
      btnSimpan.textContent = '✅ Simpan Data Aset';
      btnSimpan.disabled = false;
      tampilToast('✅ Data tersimpan! Isi realisasi di halaman Output.');
    });
  });
}

function resetForm() {
  ['f_no', 'f_nama', 'f_tgl_ul', 'f_tgl_ulp', 'f_masa_ekonomis'].forEach(id => {
    document.getElementById(id).value = '';
  });
  document.getElementById('f_ulp').value = '';
  document.getElementById('calc_usia').textContent = '—';
  document.getElementById('calc_sisa').textContent = '—';
  document.getElementById('prev_ba').innerHTML      = '';
  document.getElementById('prev_foto').innerHTML    = '';
  document.getElementById('file_ba').value          = '';
  document.getElementById('file_foto').value        = '';
}

function tampilToast(pesan) {
  const toast = document.getElementById('toast');
  toast.textContent = pesan;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

// Expose ke HTML
window.hitungUsia    = hitungUsia;
window.previewFiles  = previewFiles;
window.simpanEntry   = simpanEntry;
window.bukaFoto      = bukaFoto;
window.tutupFoto     = tutupFoto;
