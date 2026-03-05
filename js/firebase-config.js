// ============================================
//  firebase-config.js
//  Konfigurasi Firebase & Firestore
// ============================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc, onSnapshot, orderBy, query } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDq59vCXRF2DTu1TCSLrqbhufzAaG_mW0c",
  authDomain: "peralatan-masuk.firebaseapp.com",
  projectId: "peralatan-masuk",
  storageBucket: "peralatan-masuk.firebasestorage.app",
  messagingSenderId: "1030965034829",
  appId: "1:1030965034829:web:0e4b01af3c1a5221148104",
  measurementId: "G-TKX4CBZ7NF"
};

const app = initializeApp(firebaseConfig);
const db  = getFirestore(app);

// ===== FUNGSI DATABASE =====

// Ambil semua aset (realtime)
function listenAssets(callback) {
  const q = query(collection(db, "assets"), orderBy("tglEntry", "desc"));
  return onSnapshot(q, (snapshot) => {
    const assets = [];
    snapshot.forEach(d => assets.push({ id: d.id, ...d.data() }));
    callback(assets);
  });
}

// Tambah aset baru
async function addAsset(asset) {
  try {
    const docRef = await addDoc(collection(db, "assets"), asset);
    return docRef.id;
  } catch (e) {
    console.error("Error adding asset: ", e);
  }
}

// Update aset (misal isi realisasi)
async function updateAsset(id, data) {
  try {
    await updateDoc(doc(db, "assets", id), data);
  } catch (e) {
    console.error("Error updating asset: ", e);
  }
}

// Hapus aset
async function deleteAsset(id) {
  try {
    await deleteDoc(doc(db, "assets", id));
  } catch (e) {
    console.error("Error deleting asset: ", e);
  }
}

export { db, listenAssets, addAsset, updateAsset, deleteAsset };
