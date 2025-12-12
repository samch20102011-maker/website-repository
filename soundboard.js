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
const COOLDOWN = 60 * 1000; // 1 minute
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

const volumeSlider = document.getElementById("volumeSlider");
const volumeValue = document.getElementById("volumeValue");
const resetVolumeBtn = document.getElementById("resetVolumeBtn");

const speedSlider = document.getElementById("speedSlider");
const speedValue = document.getElementById("speedValue");
const resetSpeedBtn = document.getElementById("resetSpeed");

const loopModeBtn = document.getElementById("loop-mode");
const loopMessage = document.getElementById("loop-mode-center-message");

// -----------------------------
// AUDIO CONTEXT
// -----------------------------
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

// Compressor & limiter
const compressor = audioCtx.createDynamicsCompressor();
compressor.threshold.value = -6;
compressor.knee.value = 20;
compressor.ratio.value = 2;
compressor.attack.value = 0.01;
compressor.release.value = 0.1;

const limiter = audioCtx.createDynamicsCompressor();
limiter.threshold.value = -3;
limiter.knee.value = 0;
limiter.ratio.value = 20;
limiter.attack.value = 0.001;
limiter.release.value = 0.05;

const gainNode = audioCtx.createGain();
gainNode.gain.value = 1.0;

compressor.connect(limiter);
limiter.connect(gainNode);
gainNode.connect(audioCtx.destination);

// -----------------------------
// GLOBAL STATE
// -----------------------------
let globalVolume = 1.0;
let globalSpeed = 1.0;

let selectionMode = false;
let selectedButtons = new Set();

let loopMode = false;
let loopTarget = null;
let loopTimeout = null;
let currentLoopNode = null;

let bufferCache = {};
let activeNodes = [];
let pendingTimeouts = [];

// -----------------------------
// SOUND FILES
// -----------------------------
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
  "wobbly-wiggly": "sounds/wobbly-wiggly.mp3",
  "brainrot-rap": "sounds/brainrot-rap.mp3",
  "high-pitch-sound": "sounds/high-pitch-sound.mp3",
  "wet-fart": "sounds/wet-fart.mp3",
  "fart-with-reverb": "sounds/fart-with-reverb.mp3",
  "domer-the-simpsons": "sounds/domer-the-simpsons.mp3",
  "who-invited-this-kid-bruh": "sounds/who-invited-this-kid-bruh.mp3",
  "why-did-you-redeem-it": "sounds/why-did-you-redeem-it.mp3",
  "skibidi-toilet-dop-dop": "sounds/skibidi-toilet-dop-dop.mp3",
  "annoying-laughter": "sounds/annoying-laughter.mp3",
  "evil-laughter": "sounds/evil-laughter.mp3",
  "christmas-ronaldo-siuuu": "sounds/christmas-ronaldo-siuuu.mp3",
  "dog-heck-nah": "sounds/dog-heck-nah.mp3",
  "fire-in-the-hole-geometry-dash": "sounds/fire-in-the-hole-geometry-dash.mp3",
  "minecraft-eating-sound": "sounds/minecraft-eating-sound.mp3",
  "oh-hell-naw": "sounds/oh-hell-naw-vine.mp3",
  "rickroll-meme": "sounds/rickroll-meme.mp3",
  "secret-rickroll": "sounds/rickroll-meme.mp3",
  "woman-screaming": "sounds/woman-screaming.mp3",
  "mr-krabs-sdiybt": "sounds/mr-krabs-sdiybt.mp3",
  "screaming-lebron": "sounds/screaming-lebron.mp3",
  "you-are-my-sunshine": "sounds/you-are-my-sunshine.mp3",
  "velvetal-phonk": "sounds/velvetal-phonk.mp3",
};

// -----------------------------
// LOAD BUFFERS
// -----------------------------
async function loadAllBuffers() {
  await Promise.all(Object.entries(sounds).map(async ([id, url]) => {
    try {
      const resp = await fetch(url);
      const arrayBuffer = await resp.arrayBuffer();
      bufferCache[id] = await audioCtx.decodeAudioData(arrayBuffer);
    } catch (err) {
      console.warn("Failed to load", url, err);
    }
  }));

  document.querySelectorAll(".sound-btn").forEach(btn => btn.disabled = false);
}

document.querySelectorAll(".sound-btn").forEach(btn => btn.disabled = true);
loadAllBuffers();

// -----------------------------
// PLAYBACK HELPERS
// -----------------------------
function playBuffer(buffer, playbackRate = 1.0) {
  const source = audioCtx.createBufferSource();
  source.buffer = buffer;
  source.playbackRate.value = playbackRate;
  source.connect(compressor);
  source.start();
  activeNodes.push(source);
  source.onended = () => {
    const idx = activeNodes.indexOf(source);
    if (idx !== -1) activeNodes.splice(idx, 1);
  };
  return source;
}

function playSoundById(id) {
  const buffer = bufferCache[id];
  if (!buffer) return;
  playBuffer(buffer, globalSpeed);
}

function stopAllPlaying() {
  activeNodes.forEach(node => {
    try { node.stop(); } catch {}
  });
  activeNodes.length = 0;

  pendingTimeouts.forEach(t => clearTimeout(t));
  pendingTimeouts.length = 0;

  stopLoopingSound();
}

// -----------------------------
// LOOP LOGIC (simple: pitch fixed)
// -----------------------------
function startLoopingSound(id) {
  const buffer = bufferCache[id];
  if (!buffer) return;

  loopTarget = id;

  if (currentLoopNode) {
    try { currentLoopNode.stop(); } catch {}
    currentLoopNode = null;
  }
  if (loopTimeout) clearTimeout(loopTimeout);

  function loopStep() {
    if (!loopTarget) return;

    // Play a new node each time at the speed when the loop started
    currentLoopNode = playBuffer(buffer, globalSpeed);

    // Easter egg for "please-speed-i-need-this"
    if (id === "please-speed-i-need-this") {
      const triggerTime = 6500 / globalSpeed; // 6.5 seconds, adjusted by speed
      const t = setTimeout(() => {
        const el = document.getElementById("easterEggImage");
        if (el) {
          el.style.opacity = "1";
          setTimeout(() => el.style.opacity = "0", 2000);
        }
      }, triggerTime);
      pendingTimeouts.push(t);
    }

    // Schedule next iteration using the same pitch/speed
    loopTimeout = setTimeout(loopStep, buffer.duration * 1000 / globalSpeed);
  }

  loopStep();
}

function stopLoopingSound() {
  loopTarget = null;
  if (currentLoopNode) {
    try { currentLoopNode.stop(); } catch {}
    currentLoopNode = null;
  }
  if (loopTimeout) clearTimeout(loopTimeout);
  loopTimeout = null;
}

// -----------------------------
// BUTTON EVENTS
// -----------------------------
stopBtn.addEventListener("click", stopAllPlaying);

volumeSlider.addEventListener("input", () => {
  globalVolume = volumeSlider.value / 100;
  gainNode.gain.value = globalVolume;
  volumeValue.textContent = `Volume: ${Math.round(globalVolume * 100)}%`;
});

resetVolumeBtn.addEventListener("click", () => {
  volumeSlider.value = 100;
  globalVolume = 1.0;
  gainNode.gain.value = globalVolume;
  volumeValue.textContent = "Volume: 100%";
});

speedSlider.addEventListener("input", () => {
  globalSpeed = parseFloat(speedSlider.value);
  speedValue.textContent = globalSpeed.toFixed(2) + "×";
});

resetSpeedBtn.addEventListener("click", () => {
  speedSlider.value = 1.0;
  globalSpeed = 1.0;
  speedValue.textContent = "1.00×";
});

// Selection mode
selectionModeBtn.addEventListener("click", () => {
  selectionMode = !selectionMode;
  selectionModeBtn.classList.toggle("active");
  if (selectionMode) {
    selectionModeBtn.textContent = "Selection Mode: ON";
    selectedButtons.clear();
    document.querySelectorAll(".sound-btn").forEach(btn => btn.classList.add("selectable"));
    showCenterMessage("Selection Mode Enabled");
  } else {
    selectionModeBtn.textContent = "Selection Mode: OFF";
    document.querySelectorAll(".sound-btn").forEach(btn => btn.classList.remove("selectable", "selected"));
    selectedButtons.clear();
    showCenterMessage("Selection Mode Disabled");
  }
});

// Loop mode
loopModeBtn.addEventListener("click", () => {
  loopMode = !loopMode;
  if (loopMode) {
    loopModeBtn.classList.add("active");
    loopMessage.textContent = "Select a button to loop.";
    loopMessage.style.opacity = "1";
  } else {
    loopModeBtn.classList.remove("active");
    loopMessage.style.opacity = "0";
    stopLoopingSound();
  }
});

// Sound buttons
document.querySelectorAll(".sound-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const id = btn.id;

    if (selectionMode) {
      btn.classList.toggle("selected");
      if (btn.classList.contains("selected")) selectedButtons.add(id);
      else selectedButtons.delete(id);
    } else if (loopMode) {
      stopLoopingSound();
      startLoopingSound(id);
      loopMode = false;
      loopModeBtn.classList.remove("active");
      loopMessage.style.opacity = "0";
    } else {
      playSoundById(id);
    }
  });
});

// Play selected
playSelectedBtn.addEventListener("click", () => {
  if (!selectionMode) return showCenterMessage("Enable Selection Mode First");
  if (selectedButtons.size === 0) return showCenterMessage("No Sounds Selected");

  selectedButtons.forEach(id => playSoundById(id));
  showCenterMessage("Playing Selected Sounds");
});

// -----------------------------
// FIREBASE SUGGESTIONS
// -----------------------------
sendBtn.addEventListener("click", async () => {
  const text = suggestionInput.value.trim();
  if (!text) return alert("Please enter a suggestion!");
  if (text.length > MAX_LENGTH) return alert(`Suggestion too long (max ${MAX_LENGTH})`);
  if (!confirm("Joke suggestions will be deleted and not taken. By proceeding, you confirm that this is a valid suggestion.")) return;

  try {
    const userDocRef = doc(db, "userCooldowns", auth.currentUser.uid);
    const userDocSnap = await getDoc(userDocRef);
    const now = Date.now();

    if (userDocSnap.exists()) {
      const last = userDocSnap.data().lastSuggestion || 0;
      const wait = COOLDOWN - (now - last);
      if (wait > 0) return alert(`Wait ${Math.ceil(wait / 1000)}s before submitting again.`);
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
onSnapshot(suggestionsQuery, snapshot => {
  suggestionsList.innerHTML = "";
  snapshot.forEach(doc => {
    const li = document.createElement("li");
    li.textContent = doc.data().text;
    suggestionsList.appendChild(li);
  });
});

// -----------------------------
// CENTER MESSAGE
// -----------------------------
function showCenterMessage(text) {
  selectionMessage.textContent = text;
  selectionMessage.style.opacity = "1";
  setTimeout(() => selectionMessage.style.opacity = "0", 1500);
}