// Import Firebase
import { db } from "./firebase-setup.js";
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

// Suggestion system
const sendBtn = document.getElementById("sendSuggestionBtn");
const suggestionInput = document.getElementById("suggestionInput");

sendBtn.addEventListener("click", async () => {
  const text = suggestionInput.value.trim();
  if (!text) return alert("Please enter a suggestion!");

  try {
    await addDoc(collection(db, "suggestions"), {
      text,
      timestamp: Date.now()
    });
    alert("Suggestion submitted!");
    suggestionInput.value = "";
  } catch (err) {
    console.error(err);
    alert("Error submitting suggestion.");
  }
});

const playingAudios = [];

function playSound(src) {
    const audio = new Audio(src); // create a new audio instance
    audio.play();                 // play it immediately
    playingAudios.push(audio);    // track it so we can stop later
}

document.getElementById("actually-good-fahhh").addEventListener("click", function() {
  playSound("sounds/actually-good-fahhhh-sfx.mp3");
});

document.getElementById("please-speed-i-need-this").addEventListener("click", function() {
    playSound("sounds/please-speed-i-need-this.mp3");
}); 

document.getElementById("metal-pipe-falling-sound").addEventListener("click", function() {
    playSound("sounds/metal-pipe-falling-sound-effect.mp3");
});

document.getElementById("long-brain-fart").addEventListener("click", function() {
    playSound("sounds/long-brain-fart.mp3");
});

document.getElementById("what-is-this-diddy-blud").addEventListener("click", function() {
    playSound("sounds/what-is-this-diddy-blud-doing-on-the.mp3");
});

document.getElementById("fahhh-pump-sound").addEventListener("click", function() {
    playSound("sounds/fahhh-pump-sound.mp3");
});

document.getElementById("knock-3d").addEventListener("click", function() {
    playSound("sounds/knock-3d.mp3");
});

document.getElementById("stop-all-sounds").addEventListener("click", function() {
    playingAudios.forEach(audio => {
        audio.pause();      
        audio.currentTime = 0;
    }); 
    playingAudios.length = 0;             
});