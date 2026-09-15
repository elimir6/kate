document.addEventListener('DOMContentLoaded', () => {

  /* ==========================================
     1. ПЕРЕКЛЮЧЕНИЕ ЭКРАНОВ (SPA NAVIGATION)
     ========================================== */
  const navButtons = document.querySelectorAll('.nav-btn');
  const screens = document.querySelectorAll('.screen');
  const surpriseCards = document.querySelectorAll('[data-target-screen]');
  const backTo1Btn = document.getElementById('back-to-1-btn');
  const envelopeBtn = document.getElementById('envelope-btn');
  const envelopeHintBtn = document.getElementById('envelope-hint-btn');

  function goToScreen(screenNumber) {
    screens.forEach(screen => {
      if (screen.id === `screen-${screenNumber}`) {
        screen.classList.add('active');
      } else {
        screen.classList.remove('active');
      }
    });

    navButtons.forEach(btn => {
      if (btn.getAttribute('data-screen') === String(screenNumber)) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    playChimeSound();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Клики по навигации шапки
  navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-screen');
      goToScreen(target);
    });
  });

  // Клики по карточкам сюрпризов
  surpriseCards.forEach(card => {
    card.addEventListener('click', () => {
      const target = card.getAttribute('data-target-screen');
      goToScreen(target);
    });
  });

  // Открытие конверта
  function openEnvelopeFlow() {
    triggerConfetti();
    playChimeSound();
    setTimeout(() => {
      goToScreen(2);
    }, 350);
  }

  if (envelopeBtn) envelopeBtn.addEventListener('click', openEnvelopeFlow);
  if (envelopeHintBtn) envelopeHintBtn.addEventListener('click', openEnvelopeFlow);

  // Кнопка "Назад"
  if (backTo1Btn) {
    backTo1Btn.addEventListener('click', () => goToScreen(1));
  }

  /* ==========================================
     2. ИНТЕРАКТИВ С СВЕЧОЙ И ТОРТОМ
     ========================================== */
  const blowBtn = document.getElementById('blow-btn');
  const cakeInteractiveArea = document.getElementById('cake-interactive-area');
  const candleFlameGroup = document.getElementById('candle-flame-group');
  const wishStatusText = document.getElementById('wish-status');
  let candleBlown = false;

  function toggleCandleFlame() {
    if (!candleBlown) {
      // Задуть свечу
      if (candleFlameGroup) candleFlameGroup.style.opacity = '0';
      if (blowBtn) blowBtn.textContent = 'Зажечь свечу снова ✨';
      if (wishStatusText) wishStatusText.textContent = 'Желание загадано! 🎂✨';
      candleBlown = true;
      triggerConfetti();
      playChimeSound();
    } else {
      // Зажечь свечу снова
      if (candleFlameGroup) candleFlameGroup.style.opacity = '1';
      if (blowBtn) blowBtn.textContent = 'Задуть свечу и загадать желание 🎂';
      if (wishStatusText) wishStatusText.textContent = '';
      candleBlown = false;
    }
  }

  if (blowBtn) {
    blowBtn.addEventListener('click', toggleCandleFlame);
  }

  if (cakeInteractiveArea) {
    cakeInteractiveArea.addEventListener('click', toggleCandleFlame);
  }

  /* ==========================================
     3. ГЕНЕРАТОР ПРАЗДНИЧНОГО КОНФЕТТИ (CANVAS)
     ========================================== */
  const canvas = document.getElementById('confetti-canvas');
  const ctx = canvas ? canvas.getContext('2d') : null;
  let particles = [];
  let animationFrameId = null;

  function resizeCanvas() {
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  function triggerConfetti() {
    if (!canvas || !ctx) return;
    const colors = ['#6B0000', '#FFD1DC', '#FF8DA1', '#D4AF37', '#FFFFFF', '#8B001A'];
    particles = [];
    
    for (let i = 0; i < 90; i++) {
      particles.push({
        x: canvas.width / 2,
        y: canvas.height / 2 - 50,
        vx: (Math.random() - 0.5) * 16,
        vy: (Math.random() - 0.8) * 16,
        size: Math.random() * 8 + 5,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rSpeed: (Math.random() - 0.5) * 10,
        opacity: 1
      });
    }

    if (!animationFrameId) {
      renderConfetti();
    }
  }

  function renderConfetti() {
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let activeParticles = 0;

    particles.forEach(p => {
      if (p.opacity > 0) {
        activeParticles++;
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.3;
        p.rotation += p.rSpeed;
        p.opacity -= 0.008;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, p.opacity);
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
      }
    });

    if (activeParticles > 0) {
      animationFrameId = requestAnimationFrame(renderConfetti);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      animationFrameId = null;
    }
  }

  /* ==========================================
     4. ЗВУКОВОЙ ДВИЖОК И МЕЛОДИЯ (WEB AUDIO API)
     ========================================== */
  let audioCtx = null;
  let soundMuted = false;
  let isPlayingSong = false;
  let melodyTimeout = null;

  const soundToggleBtn = document.getElementById('sound-toggle-btn');
  if (soundToggleBtn) {
    soundToggleBtn.addEventListener('click', () => {
      soundMuted = !soundMuted;
      soundToggleBtn.textContent = soundMuted ? '🔇' : '🔊';
      if (soundMuted && isPlayingSong) {
        stopMelody();
      }
    });
  }

  function initAudio() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioContext();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function playChimeSound() {
    if (soundMuted) return;
    try {
      initAudio();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(659.25, audioCtx.currentTime + 0.15);

      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.2);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.25);
    } catch (e) {}
  }

  const vinylBtn = document.getElementById('vinyl-btn');
  const vinylStatusText = document.getElementById('vinyl-status-text');

  const birthdayMelody = [
    { note: 261.63, duration: 0.35 },
    { note: 261.63, duration: 0.35 },
    { note: 293.66, duration: 0.7 },
    { note: 261.63, duration: 0.7 },
    { note: 349.23, duration: 0.7 },
    { note: 329.63, duration: 1.1 },
    
    { note: 261.63, duration: 0.35 },
    { note: 261.63, duration: 0.35 },
    { note: 293.66, duration: 0.7 },
    { note: 261.63, duration: 0.7 },
    { note: 392.00, duration: 0.7 },
    { note: 349.23, duration: 1.1 },

    { note: 261.63, duration: 0.35 },
    { note: 261.63, duration: 0.35 },
    { note: 523.25, duration: 0.7 },
    { note: 440.00, duration: 0.7 },
    { note: 349.23, duration: 0.7 },
    { note: 329.63, duration: 0.7 },
    { note: 293.66, duration: 1.1 },

    { note: 466.16, duration: 0.35 },
    { note: 466.16, duration: 0.35 },
    { note: 440.00, duration: 0.7 },
    { note: 349.23, duration: 0.7 },
    { note: 392.00, duration: 0.7 },
    { note: 349.23, duration: 1.4 }
  ];

  function playMelodyStep(index) {
    if (!isPlayingSong || soundMuted) {
      stopMelody();
      return;
    }

    if (index >= birthdayMelody.length) {
      index = 0;
    }

    const item = birthdayMelody[index];
    try {
      initAudio();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(item.note, audioCtx.currentTime);

      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + item.duration - 0.05);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + item.duration);
    } catch(e) {}

    melodyTimeout = setTimeout(() => {
      playMelodyStep(index + 1);
    }, item.duration * 1000);
  }

  function stopMelody() {
    isPlayingSong = false;
    if (melodyTimeout) clearTimeout(melodyTimeout);
    if (vinylBtn) vinylBtn.classList.remove('spinning');
    if (vinylStatusText) vinylStatusText.textContent = 'Нажми на пластинку, чтобы заиграла музыка 🎵';
  }

  if (vinylBtn) {
    vinylBtn.addEventListener('click', () => {
      initAudio();
      if (isPlayingSong) {
        stopMelody();
      } else {
        isPlayingSong = true;
        soundMuted = false;
        if (soundToggleBtn) soundToggleBtn.textContent = '🔊';
        vinylBtn.classList.add('spinning');
        if (vinylStatusText) vinylStatusText.textContent = 'Играет праздничная музыка... 🎶';
        playMelodyStep(0);
        triggerConfetti();
      }
    });
  }

});
