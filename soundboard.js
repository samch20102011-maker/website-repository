/*
    <button class="sound-btn red-btn" id="actually-good-fahhh">ACTUALLY GOOD FAHHH</button>
    <button class="sound-btn green-btn" id="please-speed-i-need-this">Please Speed I Need This</button>
    <button class="sound-btn blue-btn" id="metal-pipe-falling-sound">Metal Pipe Falling Sound</button>
    <button class="sound-btn brown-btn" id="long-brain-fart">Long brain fart</button>
    <button class="sound-btn green-btn" id="what-is-this-diddy-blud">WHAT IS THIS DIDDY BLUD</button>
    <button class="sound-btn red-btn" id="fahhh-pump-sound">fahhh pump sound</button>
*/


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