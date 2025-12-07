// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";




// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDlmnRHH3oPu5i3cSEp1ta-ZgyRxfMZvTg",
  authDomain: "electrodih.firebaseapp.com",
  projectId: "electrodih",
  storageBucket: "electrodih.firebasestorage.app",
  messagingSenderId: "933996789076",
  appId: "1:933996789076:web:5df365e69bca8c0a58dcc1",
  measurementId: "G-SE042RD463"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

export const auth = getAuth(app);
signInAnonymously(auth).catch(console.error);
