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
const COOLDOWN = 60 * 1000;
const MAX_LENGTH = 150;

// -----------------------------
// ELEMENTS
// -----------------------------
const sendBtn = document.getElementById("sendSuggestionBtn");
const suggestionInput = document.getElementById("suggestionInput");
const suggestionsList = document.getElementById("suggestions-list");

const selectionModeBtn = document.getElementById("selection-mode");
const playSelectedBtn = document.getElementById("play-selected");
const stopBtn = document.getElementById("stop-all-sounds");
const centerMessage = document.getElementById("selection-mode-center-message");

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

const compressor = audioCtx.createDynamicsCompressor();
compressor.threshold.value = -6;
compressor.knee.value = 20;
compressor.ratio.value = 2;

const limiter = audioCtx.createDynamicsCompressor();
limiter.threshold.value = -3;
limiter.ratio.value = 20;

const gainNode = audioCtx.createGain();
gainNode.gain.value = 1;

compressor.connect(limiter);
limiter.connect(gainNode);
gainNode.connect(audioCtx.destination);

// -----------------------------
// GLOBAL STATE
// -----------------------------
let globalVolume = 1;
let globalSpeed = 1;

let selectionMode = false;
let loopMode = false;
let downloadMode = false;
const downloadMessage = document.getElementById("download-mode-center-message");
let selectedButtons = new Set();

const bufferCache = {};
const activeNodes = [];
const pendingTimeouts = [];

// -----------------------------
// SOUNDS
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
  "montagem-bailao": "sounds/montagem-bailao.mp3",
  "montagem-rugada": "sounds/montagem-rugada.mp3",
  "montagem-xonada": "sounds/montagem-xonada.mp3",
  "ankara-messi": "sounds/ankara-messi.mp3",
  "brr-brr-patapim-phonk": "sounds/brr-brr-patapim-phonk.mp3",
  "get-out-song": "sounds/get-out-song.mp3",
  "italian-brainrot-song": "sounds/italian-brainrot-song.mp3",
  "meow-meow-song": "sounds/meow-meow-song.mp3",
  "neymar-theme-song": "sounds/neymar-theme-song.mp3",
  "sixseven-sound": "sounds/sixseven-sound.mp3",
  "vai-vai-trair-phonk": "sounds/vai-vai-trair-phonk.mp3",
  "thefatrat-unity": "sounds/thefatrat-unity.mp3",
  "skibidi-toilet-will-be-mine": "sounds/skibidi-toilet-will-be-mine.mp3",
  "please-speed-i-need-this-long": "sounds/please-speed-i-need-this-long.mp3",
  "slay-phonk": "sounds/slay-phonk.mp3",
  "sugarcrash-song": "sounds/sugarcrash-song.mp3",
  "eeya-eeya": "sounds/eeya-eeya.mp3",
  "speed-say-wallahi-bro": "sounds/speed-say-wallahi-bro.mp3",
  "back-on-track-gd": "sounds/back-on-track-gd.mp3",
  "im-making-mac-and-cheese": "sounds/im-making-mac-and-cheese.mp3",
  "ransom-song": "sounds/ransom-song.mp3",
  "tequila-phonk": "sounds/tequila-phonk.mp3",
  "thefatrat-jackpot": "sounds/thefatrat-jackpot.mp3",
  "thefatrat-xenogenesis": "sounds/thefatrat-xenogenesis.mp3",
  "uh-oh-stinky": "sounds/uh-oh-stinky.mp3",


};

// -----------------------------
// LOAD BUFFERS
// -----------------------------
async function loadBuffers() {
  await Promise.all(
    Object.entries(sounds).map(async ([id, url]) => {
      const resp = await fetch(url);
      const buf = await resp.arrayBuffer();
      bufferCache[id] = await audioCtx.decodeAudioData(buf);
    })
  );

  document.querySelectorAll(".sound-btn").forEach(b => b.disabled = false);
}

document.querySelectorAll(".sound-btn").forEach(b => b.disabled = true);
loadBuffers();

// -----------------------------
// AUDIO ENGINE
// -----------------------------
const AudioEngine = {
  loop: {
    active: false,
    id: null,
    timeout: null,
    speed: 1
  },

  play(id, { loop = false } = {}) {
    const buffer = bufferCache[id];
    if (!buffer) return;

    if (loop) this.stopLoop();

    const source = audioCtx.createBufferSource();
    source.buffer = buffer;
    source.playbackRate.value = globalSpeed;
    source.connect(compressor);
    source.start();

    activeNodes.push(source);
    source.onended = () => {
      const i = activeNodes.indexOf(source);
      if (i !== -1) activeNodes.splice(i, 1);
    };

    this.handleEasterEgg(id, globalSpeed);

    if (loop) {
      this.loop.active = true;
      this.loop.id = id;
      this.loop.speed = globalSpeed;

      const dur = buffer.duration * 1000 / globalSpeed;
      this.loop.timeout = setTimeout(() => {
        if (this.loop.active) this.play(id, { loop: true });
      }, dur);
    }
  },

  stopLoop() {
    this.loop.active = false;
    this.loop.id = null;
    if (this.loop.timeout) clearTimeout(this.loop.timeout);
    this.loop.timeout = null;
  },

  stopAll() {
    activeNodes.forEach(n => {
      try { n.stop(); } catch {}
    });
    activeNodes.length = 0;

    pendingTimeouts.forEach(t => clearTimeout(t));
    pendingTimeouts.length = 0;

    this.stopLoop();
  },

  handleEasterEgg(id, speed) {
    if (id !== "please-speed-i-need-this" && id !== "please-speed-i-need-this-long") return;

    const t = setTimeout(() => {
      const img = document.getElementById("easterEggImage");
      if (!img) return;
      img.style.opacity = "1";
      setTimeout(() => img.style.opacity = "0", 2000);
    }, 6500 / speed);

    pendingTimeouts.push(t);
  }
};


// -----------------------------
// UI EVENTS
// -----------------------------
stopBtn.addEventListener("click", () => AudioEngine.stopAll());

volumeSlider.addEventListener("input", () => {
  globalVolume = volumeSlider.value / 100;
  gainNode.gain.value = globalVolume;
  volumeValue.textContent = `Volume: ${Math.round(globalVolume * 100)}%`;
});

resetVolumeBtn.addEventListener("click", () => {
  volumeSlider.value = 100;
  gainNode.gain.value = 1;
  volumeValue.textContent = "Volume: 100%";
});

speedSlider.addEventListener("input", () => {
  globalSpeed = parseFloat(speedSlider.value);
  speedValue.textContent = globalSpeed.toFixed(2) + "×";
});

resetSpeedBtn.addEventListener("click", () => {
  speedSlider.value = 1;
  globalSpeed = 1;
  speedValue.textContent = "1.00×";
});

// -----------------------------
// MODES
// -----------------------------
selectionModeBtn.addEventListener("click", () => {
  selectionMode = !selectionMode;
  selectionModeBtn.classList.toggle("active", selectionMode);
  selectionModeBtn.textContent = `Selection Mode: ${selectionMode ? "ON" : "OFF"}`;
  selectedButtons.clear();

  document.querySelectorAll(".sound-btn").forEach(btn => {
    btn.classList.toggle("selectable", selectionMode);
    btn.classList.remove("selected");
  });

  showMessage(selectionMode ? "Selection Mode Enabled" : "Selection Mode Disabled");
});

loopModeBtn.addEventListener("click", () => {
  loopMode = !loopMode;
  loopModeBtn.classList.toggle("active", loopMode);
  loopMessage.style.opacity = loopMode ? "1" : "0";
  if (!loopMode) AudioEngine.stopLoop();
});

// -----------------------------
// SOUND BUTTONS
// -----------------------------
document.querySelectorAll(".sound-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const id = btn.id;

    if (selectionMode) {
      btn.classList.toggle("selected");
      btn.classList.contains("selected")
        ? selectedButtons.add(id)
        : selectedButtons.delete(id);
      return;
    }

    if (loopMode) {
      AudioEngine.play(id, { loop: true });
      loopMode = false;
      loopModeBtn.classList.remove("active");
      loopMessage.style.opacity = "0";
      return;
    }

    if (downloadMode) {
      downloadSound(id);
      downloadMode = false;                       // turn off after one click
      downloadModeBtn.classList.remove("active"); // update button UI
      downloadMessage.style.opacity = "0";        // hide message
      return;
    }

    AudioEngine.play(id);
  });
});

playSelectedBtn.addEventListener("click", () => {
  if (!selectionMode) return showMessage("Enable Selection Mode First");
  if (!selectedButtons.size) return showMessage("No Sounds Selected");

  selectedButtons.forEach(id => AudioEngine.play(id));
  showMessage("Playing Selected Sounds");
});

// -----------------------------
// DOWNLOAD MODE
// -----------------------------
function downloadSound(id) {
  const url = sounds[id];
  if (!url) return;

  const a = document.createElement("a");
  a.href = url;
  a.download = url.split("/").pop();
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

const downloadModeBtn = document.getElementById("download-mode");

downloadModeBtn.addEventListener("click", () => {
  downloadMode = !downloadMode;
  downloadModeBtn.classList.toggle("active", downloadMode);
  downloadMessage.style.opacity = downloadMode ? "1" : "0";
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

    alert("Suggestion submitted! Make sure to check if any feedback is given to your suggestion after a day or so.");
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
function showMessage(text) {
  centerMessage.textContent = text;
  centerMessage.style.opacity = "1";
  setTimeout(() => centerMessage.style.opacity = "0", 1500);
}

// -----------------------------
// CATEGORY FILTER
// -----------------------------
const categoryDropdown = document.getElementById("categoryFilter");
const soundButtons = document.querySelectorAll(".sound-btn"); // all sound buttons

categoryDropdown.addEventListener("change", () => {
  const selectedCategory = categoryDropdown.value.toLowerCase();
  const searchQuery = document.getElementById("soundSearch")?.value.toLowerCase() || "";

  soundButtons.forEach(btn => {
    const btnCategory = btn.dataset.category?.toLowerCase() || "all";
    const matchesCategory = selectedCategory === "all" || btnCategory === selectedCategory;
    const matchesSearch = btn.textContent.toLowerCase().includes(searchQuery);

    btn.style.display = matchesCategory && matchesSearch ? "" : "none";
  });
});
