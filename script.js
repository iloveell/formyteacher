(() => {
  "use strict";

  const screens = Array.from(document.querySelectorAll(".screen"));
  const navDots = Array.from(document.querySelectorAll(".progress-dot"));
  const floatingLayer = document.getElementById("floatingLayer");
  const music = document.getElementById("backgroundMusic");
  const record = document.getElementById("record");
  const playMusicButton = document.getElementById("playMusic");
  const playIcon = document.getElementById("playIcon");
  const musicToggle = document.getElementById("musicToggle");
  const musicToggleIcon = document.getElementById("musicToggleIcon");
  const volumeInput = document.getElementById("volume");
  const progressBar = document.getElementById("progressBar");
  const progressTrack = document.getElementById("progressTrack");
  const currentTimeText = document.getElementById("currentTime");
  const durationText = document.getElementById("duration");
  const musicHint = document.getElementById("musicHint");
  const toast = document.getElementById("toast");

  let activeScreen = "home";
  let toastTimer = null;
  let hasShownMusicError = false;

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add("show");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove("show"), 3200);
  }

  function goToScreen(id) {
    const target = document.getElementById(id);
    if (!target || !target.classList.contains("screen")) return;

    activeScreen = id;
    screens.forEach((screen) => {
      const isActive = screen.id === id;
      screen.classList.toggle("active", isActive);
      screen.setAttribute("aria-hidden", String(!isActive));
    });
    navDots.forEach((dot) => {
      const isActive = dot.dataset.go === id;
      dot.classList.toggle("active", isActive);
      if (isActive) dot.setAttribute("aria-current", "step");
      else dot.removeAttribute("aria-current");
    });
    window.scrollTo({ top: 0, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
    history.replaceState(null, "", `#${id}`);
  }

  document.getElementById("openLetter").addEventListener("click", () => goToScreen("letter"));
  document.querySelectorAll("[data-next]").forEach((button) => {
    button.addEventListener("click", () => goToScreen(button.dataset.next));
  });
  navDots.forEach((dot) => dot.addEventListener("click", () => goToScreen(dot.dataset.go)));
  document.getElementById("startOver").addEventListener("click", () => goToScreen("home"));

  document.querySelectorAll(".choice-card").forEach((card) => {
    card.addEventListener("click", () => {
      const message = card.dataset.message;
      const response = document.getElementById("responseMessage");
      response.querySelector("p").textContent = message;
      response.querySelector(".response-icon").textContent = "♥";
      response.classList.remove("response-pop");
      void response.offsetWidth;
      response.classList.add("response-pop");
      showToast("A little message, just for this moment. 💗");
    });
  });

  function formatTime(seconds) {
    if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  }

  function updatePlaybackUI() {
    const isPlaying = !music.paused && !music.ended;
    playIcon.textContent = isPlaying ? "Ⅱ" : "▶";
    playMusicButton.setAttribute("aria-label", isPlaying ? "Pause music" : "Play music");
    musicToggleIcon.textContent = isPlaying ? "♫" : "♪";
    musicToggle.classList.toggle("is-playing", isPlaying);
    record.classList.toggle("spinning", isPlaying);
  }

  async function playMusic() {
    try {
      await music.play();
      hasShownMusicError = false;
      musicHint.textContent = "Enjoy your soundtrack. You can pause it any time.";
      updatePlaybackUI();
    } catch (error) {
      musicHint.textContent = "Music file not found yet. Add your MP3 to assets/music/apology-song.mp3.";
      updatePlaybackUI();
      if (!hasShownMusicError) {
        showToast("Add your own MP3 file to assets/music/apology-song.mp3 first.");
        hasShownMusicError = true;
      }
    }
  }

  function pauseMusic() {
    music.pause();
    updatePlaybackUI();
  }

  playMusicButton.addEventListener("click", () => {
    if (music.paused) playMusic();
    else pauseMusic();
  });

  musicToggle.addEventListener("click", () => {
    if (music.paused) playMusic();
    else pauseMusic();
  });

  document.getElementById("restartMusic").addEventListener("click", () => {
    music.currentTime = 0;
    playMusic();
  });

  document.getElementById("stopMusic").addEventListener("click", () => {
    music.pause();
    music.currentTime = 0;
    updatePlaybackUI();
  });

  volumeInput.addEventListener("input", () => {
    music.volume = Number(volumeInput.value);
  });

  progressTrack.addEventListener("click", (event) => {
    if (!Number.isFinite(music.duration) || music.duration <= 0) return;
    const rect = progressTrack.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
    music.currentTime = ratio * music.duration;
  });

  music.addEventListener("loadedmetadata", () => {
    durationText.textContent = formatTime(music.duration);
    musicHint.textContent = "Your soundtrack is ready. Press play whenever you like.";
  });
  music.addEventListener("timeupdate", () => {
    currentTimeText.textContent = formatTime(music.currentTime);
    durationText.textContent = formatTime(music.duration);
    const ratio = Number.isFinite(music.duration) && music.duration > 0 ? music.currentTime / music.duration : 0;
    progressBar.style.width = `${ratio * 100}%`;
  });
  music.addEventListener("play", updatePlaybackUI);
  music.addEventListener("pause", updatePlaybackUI);
  music.addEventListener("ended", updatePlaybackUI);
  music.addEventListener("error", () => {
    musicHint.textContent = "No music file yet. Put your MP3 in assets/music/apology-song.mp3.";
  });
  music.volume = Number(volumeInput.value);

  const particles = ["♡", "✦", "✧", "♥", "✿", "·"];
  function createParticle() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const particle = document.createElement("span");
    particle.className = "float-particle";
    particle.textContent = particles[Math.floor(Math.random() * particles.length)];
    particle.style.left = `${Math.random() * 100}%`;
    particle.style.fontSize = `${12 + Math.random() * 17}px`;
    particle.style.animationDuration = `${8 + Math.random() * 9}s`;
    floatingLayer.appendChild(particle);
    window.setTimeout(() => particle.remove(), 18000);
  }
  for (let i = 0; i < 13; i += 1) {
    window.setTimeout(createParticle, i * 350);
  }
  window.setInterval(createParticle, 1150);

  const initialHash = window.location.hash.slice(1);
  if (initialHash && document.getElementById(initialHash)?.classList.contains("screen")) {
    goToScreen(initialHash);
  } else {
    goToScreen("home");
  }
  updatePlaybackUI();
})(); 
