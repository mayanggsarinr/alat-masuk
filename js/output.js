// ============================================
//  output.js
//  Tabel output rekap kontrak per ULP
//  + Modal input realisasi
// ============================================

import { listenAssets, updateAsset } from "./firebase-config.js";

let semuaAssets   = [];
let idAsetDipilih = null;

document.addEventListener('DOMContentLoaded', function () {
  listenAssets(function (assets) {
    semuaAssets = assets;
    tampilOutput();
  });
});

function tampilOutput() {
  const assets = semuaAssets;

  document.getElementById('sum_total').textContent = assets.length;

  const wrap = document.getElementById('outputTabelWrap');

  if (!assets.length) {
    wrap.innerHTML = `<div class="empty-state" style="padding:40px 20px">
      <div class="empty-icon">📊</div>
      <div class="empty-text">Belum ada laporan</div>
      <div class="empty-sub">Entry data terlebih dahulu</div>
    </div>`;
    return;
  }

  // Kumpulkan ULP unik
  const ulps = [...new Set(assets.map(a => a.ulp).filter(Boolean))].sort();

  // Kelompokkan berdasarkan nama
  const kelompok = {};
  assets.forEach(aset => {
    const kunci = aset.nama;
    if (!kelompok[kunci]) {
      kelompok[kunci] = { nama: aset.nama, kontrakTotal: 0, dataUlp: {} };
    }
    kelompok[kunci].kontrakTotal += 1;
    if (!kelompok[kunci].dataUlp[aset.ulp]) {
      kelompok[kunci].dataUlp[aset.ulp] = { kontrak: 0, realisasi: 0, assetId: aset.id };
    }
    kelompok[kunci].dataUlp[aset.ulp].kontrak   += 1;
    kelompok[kunci].dataUlp[aset.ulp].realisasi += (aset.realisasi || 0);
    kelompok[kunci].dataUlp[aset.ulp].assetId    = aset.id;
  });

  const baris = Object.values(kelompok);

  // Total per ULP
  const totalUlp = {};
  ulps.forEach(ulp => {
    totalUlp[ulp] = { kontrak: 0, realisasi: 0 };
    baris.forEach(b => {
      if (b.dataUlp[ulp]) {
        totalUlp[ulp].kontrak   += b.dataUlp[ulp].kontrak;
        totalUlp[ulp].realisasi += b.dataUlp[ulp].realisasi;
      }
    });
  });

  // Header tabel
  let htmlHeader = `<thead>
    <tr style="background:linear-gradient(135deg,var(--pln-blue),var(--pln-light))">
      <th rowspan="2" style="vertical-align:middle">No</th>
      <th rowspan="2" style="vertical-align:middle;min-width:130px">Kendaraan / Peralatan</th>
      <th rowspan="2" style="vertical-align:middle;text-align:center">Jml<br>Kontrak</th>
      ${ulps.map(ulp => `<th colspan="3" style="text-align:center;border-left:2px solid rgba(255,255,255,0.3)">${ulp}</th>`).join('')}
    </tr>
    <tr style="background:rgba(0,40,110,0.88)">
      ${ulps.map(() => `
        <th style="border-left:2px solid rgba(255,255,255,0.2);font-size:10px">Kontrak</th>
        <th style="font-size:10px">Realisasi</th>
        <th style="font-size:10px">Selisih</th>
      `).join('')}
    </tr>
  </thead>`;

  // Baris data
  let htmlBody = '<tbody>';
  baris.forEach((b, i) => {
    htmlBody += `<tr>
      <td class="mono">${i + 1}</td>
      <td style="font-weight:700;font-size:12px">${b.nama}</td>
      <td class="mono" style="text-align:center;font-weight:700;color:var(--pln-blue)">${b.kontrakTotal}</td>
      ${ulps.map(ulp => {
        const d = b.dataUlp[ulp];
        if (!d) return `<td style="border-left:2px solid var(--border);text-align:center;color:#CCC" colspan="3">—</td>`;
        const selisih      = d.kontrak - d.realisasi;
        const warnaSelisih = selisih < 0 ? 'var(--danger)' : selisih === 0 ? 'var(--success)' : 'var(--pln-blue)';
        const sudahIsi     = d.realisasi > 0;
        const tombol       = `<button onclick="bukaModalRealisasi('${d.assetId}')"
          style="margin-top:3px;padding:3px 8px;
          background:${sudahIsi ? '#E6F9F1' : '#EEF3FF'};
          border:1px solid ${sudahIsi ? 'var(--success)' : 'var(--pln-sky)'};
          border-radius:6px;font-size:10px;font-weight:700;
          color:${sudahIsi ? 'var(--success)' : 'var(--pln-blue)'};
          cursor:pointer;font-family:inherit">
          ${sudahIsi ? '✏️ Edit' : '➕ Isi'}
        </button>`;
        return `
          <td class="mono" style="border-left:2px solid var(--border);text-align:center">${d.kontrak}</td>
          <td style="text-align:center;vertical-align:middle">
            <div class="mono" style="font-weight:700;color:${sudahIsi ? 'var(--text)' : 'var(--muted)'}">
              ${sudahIsi ? d.realisasi : '—'}
            </div>
            ${tombol}
          </td>
          <td class="mono" style="text-align:center;font-weight:700;color:${warnaSelisih}">
            ${sudahIsi ? selisih : '—'}
          </td>`;
      }).join('')}
    </tr>`;
  });

  // Baris TOTAL
  const totalKontrak = baris.reduce((s, b) => s + b.kontrakTotal, 0);
  htmlBody += `<tr style="background:#EEF3FF;border-top:2px solid var(--pln-blue)">
    <td colspan="2" style="font-weight:800;color:var(--pln-blue);font-size:12px">TOTAL</td>
    <td class="mono" style="text-align:center;font-weight:800;color:var(--pln-blue)">${totalKontrak}</td>
    ${ulps.map(ulp => {
      const t       = totalUlp[ulp];
      const selisih = t.kontrak - t.realisasi;
      const warna   = selisih < 0 ? 'var(--danger)' : selisih === 0 ? 'var(--success)' : 'var(--pln-blue)';
      return `
        <td class="mono" style="border-left:2px solid var(--border);text-align:center;font-weight:800;color:var(--pln-blue)">${t.kontrak}</td>
        <td class="mono" style="text-align:center;font-weight:800;color:var(--success)">${t.realisasi}</td>
        <td class="mono" style="text-align:center;font-weight:800;color:${warna}">${selisih}</td>`;
    }).join('')}
  </tr>`;
  htmlBody += '</tbody>';

  const lebarMin = 300 + ulps.length * 180;
  wrap.innerHTML = `<div style="overflow-x:auto">
    <table style="width:100%;border-collapse:collapse;font-size:12px;min-width:${lebarMin}px">
      ${htmlHeader}${htmlBody}
    </table>
  </div>`;
}

// ===== MODAL REALISASI =====
function bukaModalRealisasi(assetId) {
  const aset = semuaAssets.find(a => a.id === assetId);
  if (!aset) return;
  idAsetDipilih = assetId;

  const jumlahKontrak = semuaAssets.filter(a => a.nama === aset.nama && a.ulp === aset.ulp).length;

  document.getElementById('modalNamaAset').textContent   = aset.nama;
  document.getElementById('modalUlpAset').textContent    = 'ULP ' + aset.ulp;
  document.getElementById('modalJmlKontrak').textContent = jumlahKontrak;
  document.getElementById('inputRealisasi').value        = aset.realisasi > 0 ? aset.realisasi : '';

  hitungSelisihModal();
  document.getElementById('modalRealisasi').classList.add('open');
}

function tutupModalRealisasi() {
  document.getElementById('modalRealisasi').classList.remove('open');
  idAsetDipilih = null;
}

function hitungSelisihModal() {
  const kontrak   = parseInt(document.getElementById('modalJmlKontrak').textContent) || 0;
  const realisasi = parseInt(document.getElementById('inputRealisasi').value) || 0;
  const selisih   = kontrak - realisasi;
  const el        = document.getElementById('modalSelisih');
  el.textContent  = selisih;
  el.style.color  = selisih < 0 ? 'var(--danger)' : selisih === 0 ? 'var(--success)' : 'var(--pln-blue)';
}

async function simpanRealisasi() {
  const realisasi = parseInt(document.getElementById('inputRealisasi').value) || 0;
  const btnSimpan = document.getElementById('btnSimpanRealisasi');
  btnSimpan.textContent = '⏳ Menyimpan...';
  btnSimpan.disabled = true;

  await updateAsset(idAsetDipilih, { realisasi });

  btnSimpan.textContent = '✅ Simpan Realisasi';
  btnSimpan.disabled = false;
  tutupModalRealisasi();
  tampilToast('✅ Realisasi berhasil disimpan!');
}

function tampilToast(pesan) {
  const toast = document.getElementById('toast');
  toast.textContent = pesan;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

window.bukaModalRealisasi  = bukaModalRealisasi;
window.tutupModalRealisasi = tutupModalRealisasi;
window.hitungSelisihModal  = hitungSelisihModal;
window.simpanRealisasi     = simpanRealisasi;
