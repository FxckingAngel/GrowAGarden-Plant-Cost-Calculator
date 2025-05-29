import { db, doc, setDoc, getDoc, updateDoc } from './firebase.js';

const plantSelect = document.getElementById('plant');
const plantList = ["Aloe", "Basil", "Carrot", "Daisy", "Eucalyptus", "Fern", "Garlic", "Hydrangea"];
plantList.sort().forEach(p => {
  const opt = document.createElement("option");
  opt.value = p;
  opt.textContent = p;
  plantSelect.appendChild(opt);
});

const priceMemory = {};

async function calculatePrice() {
  const plant = plantSelect.value;
  const weight = Number(document.getElementById("weight").value);
  const modifier = document.getElementById("modifier").value;

  const base = weight * 0.05;
  const mod = modifier === "organic" ? 1.2 : modifier === "rare" ? 2.0 : 1;
  const predicted = Math.round(base * mod * 100) / 100;

  const key = `${plant}_${weight}_${modifier}`;
  priceMemory[key] = priceMemory[key] || [];

  // Fetch saved corrections
  const docRef = doc(db, "prices", key);
  const snap = await getDoc(docRef);
  if (snap.exists()) {
    const verified = snap.data().verified || [];
    if (verified.length > 0) {
      const avg = verified.reduce((a, b) => a + b, 0) / verified.length;
      document.getElementById("result").textContent = `Verified Price: $${avg.toFixed(2)}`;
      return;
    }
  }

  document.getElementById("result").textContent = `Predicted Price: $${predicted}`;
}

async function submitCorrection() {
  const plant = plantSelect.value;
  const weight = Number(document.getElementById("weight").value);
  const modifier = document.getElementById("modifier").value;
  const corrected = Number(document.getElementById("correctedPrice").value);
  const key = `${plant}_${weight}_${modifier}`;

  const docRef = doc(db, "prices", key);
  const snap = await getDoc(docRef);
  const data = snap.exists() ? snap.data() : { verified: [], rejected: [] };

  const predicted = Math.round(weight * 0.05 * (modifier === "organic" ? 1.2 : modifier === "rare" ? 2.0 : 1) * 100) / 100;

  const diff = Math.abs(corrected - predicted);
  if (diff <= 0.2 * predicted) {
    data.verified.push(corrected);
    await setDoc(docRef, data);
    document.getElementById("correctionStatus").textContent = "✅ Correction accepted.";
  } else {
    data.rejected.push(corrected);
    await setDoc(docRef, data);
    document.getElementById("correctionStatus").textContent = "❌ Correction rejected (too far from prediction).";
  }
}

// Admin logic
const ADMIN_PASSWORD = "secret123";

function checkAdmin() {
  const input = document.getElementById("adminPass").value;
  if (input === ADMIN_PASSWORD) {
    document.getElementById("adminLogin").style.display = "none";
    document.getElementById("adminPanel").style.display = "block";
    loadTrends();
  } else {
    alert("Wrong password.");
  }
}

async function loadTrends() {
  const ctx = document.getElementById("trendChart").getContext("2d");

  // Get price trend for each plant
  const trends = {};
  for (const plant of plantList) {
    for (const modifier of ["none", "organic", "rare"]) {
      const key = `${plant}_100_${modifier}`;
      const snap = await getDoc(doc(db, "prices", key));
      if (snap.exists()) {
        const data = snap.data();
        const avg = data.verified.length
          ? data.verified.reduce((a, b) => a + b, 0) / data.verified.length
          : null;
        if (avg) {
          trends[plant] = trends[plant] || [];
          trends[plant].push(avg);
        }
      }
    }
  }

  const labels = Object.keys(trends);
  const datasets = [{
    label: "Average Verified Price (per 100g)",
    data: labels.map(p => {
      const values = trends[p];
      return values ? (values.reduce((a, b) => a + b, 0) / values.length).toFixed(2) : 0;
    }),
    backgroundColor: 'rgba(75, 192, 192, 0.5)'
  }];

  new Chart(ctx, {
    type: 'bar',
    data: { labels, datasets },
    options: {
      responsive: true,
      scales: {
        y: { beginAtZero: true }
      }
    }
  });
}

export default App;
