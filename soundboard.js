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
const MAX_LENGTH = 30;

// -----------------------------
// ELEMENTS
// -----------------------------
const sendBtn = document.getElementById("sendSuggestionBtn");
const suggestionInput = document.getElementById("suggestionInput");
const suggestionsList = document.getElementById("suggestions-list");
const selectionModeBtn = document.getElementById("selection-mode");
const playSelectedBtn = document.getElementById("play-selected");
const stopBtn = document.getElementById("stop-all-sounds");
const selectionMessage = document.getElementById("selection-mode-center-message");

// -----------------------------
// FIREBASE SUGGESTIONS
// -----------------------------
sendBtn.addEventListener("click", async () => {
    const text = suggestionInput.value.trim();
    if (!text) return alert("Please enter a suggestion!");
    if (text.length > MAX_LENGTH) return alert(`Suggestion is too long! (Max ${MAX_LENGTH} characters)`);

    if (!confirm("Joke suggestions such as random text will be deleted and not taken. By proceeding, you confirm that this is a valid suggestion.")) return;

    try {
        const userDocRef = doc(db, "userCooldowns", auth.currentUser.uid);
        const userDocSnap = await getDoc(userDocRef);
        const now = Date.now();

        if (userDocSnap.exists()) {
            const lastTime = userDocSnap.data().lastSuggestion || 0;
            const timeLeft = COOLDOWN - (now - lastTime);
            if (timeLeft > 0) return alert(`Please wait ${Math.ceil(timeLeft / 1000)} more seconds before submitting another suggestion.`);
        }

        await addDoc(collection(db, "suggestions"), {
            text,
            timestamp: serverTimestamp(),
            uid: auth.currentUser.uid
        });

        await setDoc(userDocRef, { lastSuggestion: now });
        alert("Suggestion submitted!");
        suggestionInput.value = "";

    } catch (err) {
        console.error(err);
        alert("Error submitting suggestion.");
    }
});

const suggestionsRef = collection(db, "suggestions");
const suggestionsQuery = query(suggestionsRef, orderBy("timestamp", "desc"));

onSnapshot(suggestionsQuery, (snapshot) => {
    suggestionsList.innerHTML = "";
    snapshot.forEach((doc) => {
        const li = document.createElement("li");
        li.textContent = doc.data().text;
        suggestionsList.appendChild(li);
    });
});

// -----------------------------
// SOUND SYSTEM
// -----------------------------
const sounds = {
    "actually-good-fahhh": "sounds/actually-good-fahhhh-sfx.mp3",
    "metal-pipe-falling-sound": "sounds/metal-pipe-falling-sound-effect.mp3",
    "long-brain-fart": "sounds/long-brain-fart.mp3",
    "what-is-this-diddy-blud": "sounds/what-is-this-diddy-blud-doing-on-the.mp3",
    "fahhh-pump-sound": "sounds/fahhh-pump-sound.mp3",
    "knock-3d": "sounds/knock-3d.mp3",
    "we-are-charlie-kirk": "sounds/we-are-charlie-kirk.mp3",
    "tung-tung-sahur-song": "sounds/tung-tung-sahur-song.mp3",
    "wobbly-wiggly": "sounds/wobbly-wiggly.mp3",
    "brainrot-rap": "sounds/brainrot-rap.mp3",
    "high-pitch-sound": "sounds/high-pitch-sound.mp3",
    "wet-fart": "sounds/wet-fart.mp3",
    "fart-with-reverb": "sounds/fart-with-reverb.mp3"
};

const playingAudios = [];
function playSound(src) {
    const audio = new Audio(src);
    audio.play();
    playingAudios.push(audio);
}

// Stop all sounds
stopBtn.addEventListener("click", () => {
    playingAudios.forEach(a => { a.pause(); a.currentTime = 0; });
    playingAudios.length = 0;
});

// -----------------------------
// SELECTION SYSTEM
// -----------------------------
let selectionMode = false;
let selectedButtons = new Set();

// Selection handler
function selectionHandler(e) {
    const btn = e.currentTarget;
    const btnId = btn.id;

    if (selectionMode) {
        e.preventDefault();
        e.stopPropagation();
        btn.classList.toggle("selected");
        if (btn.classList.contains("selected")) selectedButtons.add(btnId);
        else selectedButtons.delete(btnId);
    } else {
        // Normal click
        if (btnId === "please-speed-i-need-this") {
            const audio = new Audio("sounds/please-speed-i-need-this.mp3");
            audio.play();
            playingAudios.push(audio);

            const interval = setInterval(() => {
                if (audio.currentTime >= 6.5 && audio.currentTime <= 8) {
                    document.getElementById("easterEggImage").style.opacity = "1";
                    setTimeout(() => document.getElementById("easterEggImage").style.opacity = "0", 2000);
                    clearInterval(interval);
                }
                if (audio.ended) clearInterval(interval);
            }, 100);
        } else {
            playSound(sounds[btnId]);
        }
    }
}

// Enable selection mode (add outline)
function enableSelectionMode() {
    selectedButtons.clear();
    document.querySelectorAll(".sound-grid .sound-btn").forEach(btn => {
        btn.classList.add("selectable");
    });
}

function disableSelectionMode() {
    selectedButtons.clear();
    document.querySelectorAll(".sound-grid .sound-btn").forEach(btn => {
        btn.classList.remove("selectable");
        btn.classList.remove("selected");
    });
}

// Toggle selection mode
selectionModeBtn.addEventListener("click", () => {
    selectionMode = !selectionMode;
    selectionModeBtn.classList.toggle("active");

    if (selectionMode) {
        selectionModeBtn.textContent = "Selection Mode: ON";
        enableSelectionMode();
        showCenterMessage("Selection Mode Enabled");
    } else {
        selectionModeBtn.textContent = "Selection Mode: OFF";
        selectedButtons.clear();
        disableSelectionMode();
        showCenterMessage("Selection Mode Disabled");
    }
});

// Handle button clicks
document.querySelectorAll(".sound-btn").forEach(btn => {
    btn.addEventListener("click", e => {
        const btnId = btn.id;

        if (selectionMode) {
            e.preventDefault();
            e.stopPropagation();
            btn.classList.toggle("selected");
            if (btn.classList.contains("selected")) selectedButtons.add(btnId);
            else selectedButtons.delete(btnId);
        } else {
            // Easter Egg special
            if (btnId === "please-speed-i-need-this") {
                const audio = new Audio("sounds/please-speed-i-need-this.mp3");
                audio.play();
                playingAudios.push(audio);

                const interval = setInterval(() => {
                    if (audio.currentTime >= 6.5 && audio.currentTime <= 8) {
                        document.getElementById("easterEggImage").style.opacity = "1";
                        setTimeout(() => document.getElementById("easterEggImage").style.opacity = "0", 2000);
                        clearInterval(interval);
                    }
                    if (audio.ended) clearInterval(interval);
                }, 100);
            } else {
                playSound(sounds[btnId]);
            }
        }
    });
});

// Play selected sounds
playSelectedBtn.addEventListener("click", () => {
    if (!selectionMode) return showCenterMessage("Enable Selection Mode First");
    if (selectedButtons.size === 0) return showCenterMessage("No Sounds Selected");

    selectedButtons.forEach(id => playSound(sounds[id]));
    showCenterMessage("Playing Selected Sounds");
});

// Fade-out center message
function showCenterMessage(text) {
    selectionMessage.textContent = text;
    selectionMessage.style.opacity = "1";
    setTimeout(() => { selectionMessage.style.opacity = "0"; }, 1500);
}