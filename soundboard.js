// -----------------------------
// FIREBASE SETUP
// -----------------------------
import { db } from "./firebase-setup.js";
import { 
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  limit,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";


// -----------------------------
// SUBMIT SUGGESTION
// -----------------------------
const sendBtn = document.getElementById("sendSuggestionBtn");
const suggestionInput = document.getElementById("suggestionInput");

sendBtn.addEventListener("click", async () => {
  const text = suggestionInput.value.trim();
  if (!text) return alert("Please enter a suggestion!");

  else if (text.length > 30) return alert("Suggestion is too long! (Max 30 characters)");

  // --- NEW CONFIRMATION POPUP ---
  const ok = confirm(
    "Joke suggestions such as random text will be deleted.\n" +
    "By proceeding, you confirm this is a valid suggestion."
  );

  if (!ok) {
    return; // user pressed "Cancel"
  }

  try {
    await addDoc(collection(db, "suggestions"), {
      text,
      timestamp: serverTimestamp()
    });
    alert("Suggestion submitted!");
    suggestionInput.value = "";
  } catch (err) {
    console.error(err);
    alert("Error submitting suggestion.");
  }
});


// -----------------------------
// DISPLAY RECENT SUGGESTIONS
// -----------------------------
const suggestionsRef = collection(db, "suggestions");
const q = query(suggestionsRef, orderBy("timestamp", "desc"));

onSnapshot(q, (snapshot) => {
  const list = document.getElementById("suggestions-list");
  list.innerHTML = "";

  snapshot.forEach((doc) => {
    const data = doc.data();
    const li = document.createElement("li");
    li.textContent = data.text;
    list.appendChild(li);
  });
});


// -----------------------------
// SOUND EFFECT SYSTEM
// -----------------------------
const playingAudios = [];

function playSound(src) {
    const audio = new Audio(src);
    audio.play();
    playingAudios.push(audio);
}

document.getElementById("actually-good-fahhh").addEventListener("click", () => {
  playSound("sounds/actually-good-fahhhh-sfx.mp3");
});

document.getElementById("please-speed-i-need-this").addEventListener("click", () => {
  playSound("sounds/please-speed-i-need-this.mp3");
});

document.getElementById("metal-pipe-falling-sound").addEventListener("click", () => {
  playSound("sounds/metal-pipe-falling-sound-effect.mp3");
});

document.getElementById("long-brain-fart").addEventListener("click", () => {
  playSound("sounds/long-brain-fart.mp3");
});

document.getElementById("what-is-this-diddy-blud").addEventListener("click", () => {
  playSound("sounds/what-is-this-diddy-blud-doing-on-the.mp3");
});

document.getElementById("fahhh-pump-sound").addEventListener("click", () => {
  playSound("sounds/fahhh-pump-sound.mp3");
});

document.getElementById("knock-3d").addEventListener("click", () => {
  playSound("sounds/knock-3d.mp3");
});

document.getElementById("stop-all-sounds").addEventListener("click", () => {
  playingAudios.forEach(audio => {
    audio.pause();
    audio.currentTime = 0;
  });
  playingAudios.length = 0;
});