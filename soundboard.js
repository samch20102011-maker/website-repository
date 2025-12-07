// -----------------------------
// FIREBASE SETUP
// -----------------------------
import { db, auth } from "./firebase-setup.js";
import { 
  collection, addDoc, serverTimestamp, query, orderBy, onSnapshot,
  doc, getDoc, setDoc
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

// -----------------------------
// CONFIG
// -----------------------------
const COOLDOWN = 60 * 1000; // 1 minute in milliseconds
const MAX_LENGTH = 30;      // max suggestion length

// -----------------------------
// ELEMENTS
// -----------------------------
const sendBtn = document.getElementById("sendSuggestionBtn");
const suggestionInput = document.getElementById("suggestionInput");
const suggestionsList = document.getElementById("suggestions-list");

// -----------------------------
// SUBMIT SUGGESTION
// -----------------------------
sendBtn.addEventListener("click", async () => {
  const text = suggestionInput.value.trim();

  if (!text) return alert("Please enter a suggestion!");
  if (text.length > MAX_LENGTH) return alert(`Suggestion is too long! (Max ${MAX_LENGTH} characters)`);

  // Confirm valid suggestion
  if (!confirm("Joke suggestions such as random text will be deleted and not taken. By proceeding, you confirm that this is a valid suggestion.")) {
    return; // user clicked Cancel
  }

  try {
    // Reference to this user's cooldown record
    const userDocRef = doc(db, "userCooldowns", auth.currentUser.uid);
    const userDocSnap = await getDoc(userDocRef);
    const now = Date.now();

    if (userDocSnap.exists()) {
      const lastTime = userDocSnap.data().lastSuggestion || 0;
      const timeLeft = COOLDOWN - (now - lastTime);
      if (timeLeft > 0) {
        return alert(`Please wait ${Math.ceil(timeLeft / 1000)} more seconds before submitting another suggestion.`);
      }
    }

    // Save suggestion
    await addDoc(collection(db, "suggestions"), {
      text,
      timestamp: serverTimestamp(),
      uid: auth.currentUser.uid
    });

    // Update last suggestion time
    await setDoc(userDocRef, { lastSuggestion: now });

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
const suggestionsQuery = query(suggestionsRef, orderBy("timestamp", "desc"));

onSnapshot(suggestionsQuery, (snapshot) => {
  suggestionsList.innerHTML = "";
  snapshot.forEach((doc) => {
    const data = doc.data();
    const li = document.createElement("li");
    li.textContent = data.text;
    suggestionsList.appendChild(li);
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

// Map your buttons to sounds
const sounds = {
  "actually-good-fahhh": "sounds/actually-good-fahhhh-sfx.mp3",
  "please-speed-i-need-this": "sounds/please-speed-i-need-this.mp3",
  "metal-pipe-falling-sound": "sounds/metal-pipe-falling-sound-effect.mp3",
  "long-brain-fart": "sounds/long-brain-fart.mp3",
  "what-is-this-diddy-blud": "sounds/what-is-this-diddy-blud-doing-on-the.mp3",
  "fahhh-pump-sound": "sounds/fahhh-pump-sound.mp3",
  "knock-3d": "sounds/knock-3d.mp3",
  "we-are-charlie-kirk": "sounds/we-are-charlie-kirk.mp3",
  "tung-tung-sahur-song": "sounds/tung-tung-sahur-song.mp3",
};

// Attach event listeners
for (const [btnId, src] of Object.entries(sounds)) {
  const btn = document.getElementById(btnId);
  if (btn) {
    btn.addEventListener("click", () => playSound(src));
  }
}

// Stop all sounds button
const stopBtn = document.getElementById("stop-all-sounds");
if (stopBtn) {
  stopBtn.addEventListener("click", () => {
    playingAudios.forEach(audio => {
      audio.pause();
      audio.currentTime = 0;
    });
    playingAudios.length = 0;
  });
}