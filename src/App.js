// Firebase configuration and initialization
const firebaseConfig = {
  apiKey: "AIzaSyDvMCSyGIAUsMpRE-pDY3uwwMg7IMwmLig",
  authDomain: "growagardenplantcostcalculator.firebaseapp.com",
  databaseURL: "https://growagardenplantcostcalculator-default-rtdb.firebaseio.com",
  projectId: "growagardenplantcostcalculator",
  storageBucket: "growagardenplantcostcalculator.firebasestorage.app",
  messagingSenderId: "410113480248",
  appId: "1:410113480248:web:72badb81206b458ecd38cd",
  measurementId: "G-K7XD9NMRGZ"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// Helper function to check price closeness (25% margin)
function isCloseEnough(userPrice, estimatedPrice, margin = 0.25) {
  const diff = Math.abs(userPrice - estimatedPrice);
  return diff / estimatedPrice <= margin;
}

// Validate user input against trusted data in Firebase
async function validateUserInput(name, weight, modifiers, userPrice) {
  const key = `${name.toLowerCase()}|${weight}|${modifiers.sort().join(",")}`;
  const ref = database.ref('trustedPrices');
  const snapshot = await ref.once('value');
  const data = snapshot.val() || {};

  // Find closest known price for the same plant name and modifiers
  let closestMatch = null;
  let minDistance = Infinity;

  for (const savedKey in data) {
    const [savedName, savedWeightStr, savedModifiersStr] = savedKey.split("|");
    const savedPrice = data[savedKey];
    const savedWeight = parseFloat(savedWeightStr);
    const weightDiff = Math.abs(savedWeight - parseFloat(weight));

    if (savedName === name.toLowerCase()) {
      const savedModifiers = savedModifiersStr ? savedModifiersStr.split(",") : [];
      const matchCount = modifiers.filter(mod => savedModifiers.includes(mod)).length;
      // Calculate a simple "distance" metric; lower is better
      const distance = weightDiff - matchCount;
      if (distance < minDistance) {
        minDistance = distance;
        closestMatch = savedPrice;
      }
    }
  }

  if (closestMatch && isCloseEnough(userPrice, closestMatch)) {
    // Accept user price, add/update trusted data
    await ref.child(key).set(userPrice);
    return { accepted: true, estimated: closestMatch };
  }

  return { accepted: false, estimated: closestMatch };
}

// Submit button handler
document.getElementById("submitPrice").onclick = async () => {
  const name = document.getElementById("plantName").value.trim();
  const weight = document.getElementById("plantWeight").value.trim();
  const modifiers = Array.from(document.querySelectorAll(".modifier:checked")).map(m => m.value);
  const userPrice = parseFloat(document.getElementById("plantPrice").value);

  if (!name || !weight || isNaN(userPrice)) {
    alert("Please fill all fields correctly.");
    return;
  }

  const result = await validateUserInput(name, weight, modifiers, userPrice);

  if (result.accepted) {
    alert("Price accepted! AI has added this to trusted data.");
  } else {
    alert(`Suspicious price. Closest known estimate is $${result.estimated || "unknown"}. Data not added.`);
  }
};
