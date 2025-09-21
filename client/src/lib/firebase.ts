// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDpnWNY6seCe-PlM7ulAtBcgcudFg6ena0",
  authDomain: "genaihack25.firebaseapp.com",
  projectId: "genaihack25",
  storageBucket: "genaihack25.firebasestorage.app",
  messagingSenderId: "191568010162",
  appId: "1:191568010162:web:c9533f378f97c8ca30a2ab",
  measurementId: "G-FPFX92C51C",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);