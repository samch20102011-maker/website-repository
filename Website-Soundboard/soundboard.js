// Firebase imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

// Firebase config
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
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Handle suggestion submission
const form = document.getElementById("suggestionForm");
const input = document.getElementById("suggestionInput");

if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const text = input.value.trim();
    if (!text) return alert("Type a suggestion first!");

    try {
      await addDoc(collection(db, "suggestions"), {
        text,
        timestamp: Date.now(),
      });

      alert("Suggestion submitted!");
      input.value = "";
    } catch (err) {
      console.error(err);
      alert("Error submitting. Try again.");
    }
  });
}




document.getElementById("actually-good-fahhh").addEventListener("click", function() {
    const audio = new Audio("sounds/actually-good-fahhhh-sfx.mp3");
    audio.play();
});

document.getElementById("please-speed-i-need-this").addEventListener("click", function() {
    const audio = new Audio("sounds/please-speed-i-need-this.mp3");
    audio.play();
}); 

document.getElementById("metal-pipe-falling-sound").addEventListener("click", function() {
    const audio = new Audio("sounds/metal-pipe-falling-sound-effect.mp3");
    audio.play();
});

document.getElementById("long-brain-fart").addEventListener("click", function() {
    const audio = new Audio("sounds/long-brain-fart.mp3");
    audio.play();
});

document.getElementById("what-is-this-diddy-blud").addEventListener("click", function() {
    const audio = new Audio("sounds/what-is-this-diddy-blud-doing-on-the.mp3");
    audio.play();
});

document.getElementById("fahhh-pump-sound").addEventListener("click", function() {
    const audio = new Audio("sounds/fahhh-pump-sound.mp3");
    audio.play();
});

document.getElementById("stop-all-sounds").addEventListener("click", function() {
    // This will stop all currently playing sounds by reloading the page
    location.reload();
});