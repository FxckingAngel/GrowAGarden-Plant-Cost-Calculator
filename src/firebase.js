import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db, doc, setDoc, getDoc, updateDoc };
