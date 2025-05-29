import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, getDoc, updateDoc } from "firebase/firestore";

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

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Initialize Firestore database
const db = getFirestore(app);

// Export everything you want to use elsewhere
export { db, doc, setDoc, getDoc, updateDoc };
