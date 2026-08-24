/* ==========================================================================
   Kinetic 3D Typography Carousel — Engine (page2.js)
   Faithfully reproduces the 3D text orbital loop from reference GIF
   ========================================================================== */

class KineticTypographyOrbit {
  constructor() {
    this.words = ['Global', 'Fast', 'Easy', 'Local'];
    this.numWords = this.words.length;

    // DOM Elements
    this.stageContainer = document.getElementById('stageContainer');
    this.orbitTrack = document.getElementById('orbitTrack');
    this.wordElements = Array.from(document.querySelectorAll('.orbit-word'));
    this.indicatorBtns = Array.from(document.querySelectorAll('.word-tab'));
    this.toggleAutoplayBtn = document.getElementById('toggleAutoplayBtn');
    this.autoplayText = document.getElementById('autoplayText');
    this.speedBtn = document.getElementById('speedBtn');

    // Angle tracking (in radians: 0 = word 0 in front)
    // In our coordinate system:
    // angle = 0 -> word 0 at front (cos(0) = 1)
    // angle = -PI/2 -> word 1 at front
    // angle = -PI -> word 2 at front
    // angle = -3*PI/2 -> word 3 at front
    this.currentIndex = 0;
    this.currentAngle = 0;
    this.targetAngle = 0;
    this.lastAngle = 0;
    this.velocity = 0;

    // Interaction state
    this.isDragging = false;
    this.startX = 0;
    this.startAngle = 0;
    this.lastPointerX = 0;
    this.lastPointerTime = 0;
    this.pointerVelocity = 0;

    // Autoplay Loop State
    this.isPlaying = true;
    this.speeds = [1.0, 1.5, 2.0, 0.5];
    this.speedIndex = 0;
    this.currentSpeed = 1.0;
    this.holdDuration = 1400; // ms to pause on each word
    this.autoTimer = null;

    // Responsive radii
    this.radiusX = 280;
    this.radiusZ = 220;

    this.init();
  }

  init() {
    this.updateRadii();
    window.addEventListener('resize', () => this.updateRadii());

    this.bindEvents();
    this.startRenderLoop();
    this.scheduleNextStep();
  }

  updateRadii() {
    const w = window.innerWidth;
    if (w < 600) {
      this.radiusX = 140;
      this.radiusZ = 120;
    } else if (w < 1000) {
      this.radiusX = 220;
      this.radiusZ = 180;
    } else {
      this.radiusX = 300;
      this.radiusZ = 240;
    }
  }

  bindEvents() {
    // Autoplay toggle
    this.toggleAutoplayBtn.addEventListener('click', () => {
      this.isPlaying = !this.isPlaying;
      this.toggleAutoplayBtn.classList.toggle('active', this.isPlaying);
      this.autoplayText.textContent = this.isPlaying ? 'Auto-Loop' : 'Pausado';
      if (this.isPlaying) {
        this.scheduleNextStep();
      } else {
        clearTimeout(this.autoTimer);
      }
    });

    // Speed toggle
    this.speedBtn.addEventListener('click', () => {
      this.speedIndex = (this.speedIndex + 1) % this.speeds.length;
      this.currentSpeed = this.speeds[this.speedIndex];
      this.speedBtn.textContent = `${this.currentSpeed.toFixed(1)}x`;
    });

    // Click indicators
    this.indicatorBtns.forEach((btn, idx) => {
      btn.addEventListener('click', () => {
        this.pauseAndGoTo(idx);
      });
    });

    // Click on words directly to bring to front
    this.wordElements.forEach((el, idx) => {
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        this.pauseAndGoTo(idx);
      });
    });

    // Pointer Drag / Swipe
    this.stageContainer.addEventListener('pointerdown', (e) => {
      this.isDragging = true;
      clearTimeout(this.autoTimer);
      this.startX = e.clientX;
      this.startAngle = this.currentAngle;
      this.lastPointerX = e.clientX;
      this.lastPointerTime = performance.now();
      this.pointerVelocity = 0;
      this.stageContainer.setPointerCapture(e.pointerId);
    });

    window.addEventListener('pointermove', (e) => {
      if (!this.isDragging) return;
      const now = performance.now();
      const dt = Math.max(1, now - this.lastPointerTime);
      const dx = e.clientX - this.lastPointerX;
      this.pointerVelocity = dx / dt;
      this.lastPointerX = e.clientX;
      this.lastPointerTime = now;

      // Sensitivity: drag 1px = ~0.006 rad
      const dragDelta = (e.clientX - this.startX) * 0.0065;
      this.targetAngle = this.startAngle + dragDelta;
      this.currentAngle = this.targetAngle;
    });

    const endDrag = () => {
      if (!this.isDragging) return;
      this.isDragging = false;

      // Inertia snap to nearest word step (steps of PI/2)
      const step = Math.PI / 2;
      const momentum = this.pointerVelocity * 80 * 0.0065;
      const projectedAngle = this.currentAngle + momentum;
      const nearestStep = Math.round(projectedAngle / step) * step;

      this.targetAngle = nearestStep;

      if (this.isPlaying) {
        this.scheduleNextStep();
      }
    };

    window.addEventListener('pointerup', endDrag);
    window.addEventListener('pointercancel', endDrag);

    // Mouse wheel / trackpad scroll
    this.stageContainer.addEventListener('wheel', (e) => {
      e.preventDefault();
      clearTimeout(this.autoTimer);
      const rawDelta = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
      this.targetAngle -= rawDelta * 0.003;
      if (this.isPlaying) {
        this.scheduleNextStep();
      }
    }, { passive: false });

    // Keyboard navigation
    window.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        this.pauseAndStep(1);
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        this.pauseAndStep(-1);
      } else if (e.key === ' ') {
        e.preventDefault();
        this.toggleAutoplayBtn.click();
      }
    });
  }

  pauseAndGoTo(targetIndex) {
    clearTimeout(this.autoTimer);
    const step = Math.PI / 2;
    // Current nearest index
    const currentStepIndex = Math.round(-this.currentAngle / step);
    const normalizedCurrent = ((currentStepIndex % this.numWords) + this.numWords) % this.numWords;

    // Calculate shortest angular path
    let diff = targetIndex - normalizedCurrent;
    if (diff > 2) diff -= 4;
    if (diff < -2) diff += 4;

    this.targetAngle = -(currentStepIndex + diff) * step;

    if (this.isPlaying) {
      this.scheduleNextStep();
    }
  }

  pauseAndStep(direction) {
    clearTimeout(this.autoTimer);
    const step = Math.PI / 2;
    const currentStepIndex = Math.round(-this.targetAngle / step);
    this.targetAngle = -(currentStepIndex + direction) * step;

    if (this.isPlaying) {
      this.scheduleNextStep();
    }
  }

  scheduleNextStep() {
    clearTimeout(this.autoTimer);
    if (!this.isPlaying) return;

    const delay = this.holdDuration / this.currentSpeed;
    this.autoTimer = setTimeout(() => {
      if (!this.isPlaying || this.isDragging) return;
      // Advance by 1 word (rotate clockwise, advancing targetAngle by -PI/2)
      const step = Math.PI / 2;
      const currentStepIndex = Math.round(-this.targetAngle / step);
      this.targetAngle = -(currentStepIndex + 1) * step;

      this.scheduleNextStep();
    }, delay);
  }

  startRenderLoop() {
    const render = () => {
      // Spring interpolation
      if (!this.isDragging) {
        const ease = 0.12 * this.currentSpeed;
        this.currentAngle += (this.targetAngle - this.currentAngle) * Math.min(0.25, ease);
      }

      // Calculate instantaneous rotational velocity for dynamic motion blur
      this.velocity = this.currentAngle - this.lastAngle;
      this.lastAngle = this.currentAngle;

      this.updateWordPositions();
      requestAnimationFrame(render);
    };
    requestAnimationFrame(render);
  }

  updateWordPositions() {
    const stepAngle = (Math.PI * 2) / this.numWords;
    const speedMagnitude = Math.abs(this.velocity);
    // Motion blur peaks during fast rotations and is 0 when settled
    const blurAmount = Math.min(10, speedMagnitude * 120);

    let activeWordIndex = 0;
    let maxCos = -2;

    this.wordElements.forEach((el, i) => {
      // Angle for this word
      const theta = this.currentAngle + i * stepAngle;

      const sinT = Math.sin(theta);
      const cosT = Math.cos(theta); // 1 = front, -1 = back, 0 = sides

      // 3D Elliptical coordinates
      const x = sinT * this.radiusX;
      const z = cosT * this.radiusZ;

      // Scale factor:
      // When cosT = 1 (front): scale = 1.0 (large display size)
      // When cosT = 0 (sides): scale = ~0.38
      // When cosT = -1 (back): scale = ~0.15
      const normalizedDepth = (cosT + 1) / 2; // 0 (back) to 1 (front)
      // Quadratic curve for dramatic depth perception like in the reference
      const scale = 0.15 + 0.85 * Math.pow(normalizedDepth, 1.6);

      // Opacity: high in front, subtle in back
      const opacity = 0.65 + 0.35 * Math.pow(normalizedDepth, 1.2);

      // Z-Index for proper layering (front words always render on top of back words)
      const zIndex = Math.round(normalizedDepth * 1000);

      // Motion blur along horizontal travel direction
      // Blur is stronger for words in foreground moving fast
      const itemBlur = blurAmount * (0.3 + 0.7 * normalizedDepth);

      el.style.transform = `translate(-50%, -50%) translate3d(${x.toFixed(1)}px, 0px, ${z.toFixed(1)}px) scale(${scale.toFixed(3)})`;
      el.style.opacity = opacity.toFixed(2);
      el.style.zIndex = zIndex;
      el.style.filter = itemBlur > 0.3 ? `blur(${itemBlur.toFixed(1)}px)` : 'none';

      // Find closest word to camera
      if (cosT > maxCos) {
        maxCos = cosT;
        activeWordIndex = i;
      }
    });

    // Update bottom indicators
    if (activeWordIndex !== this.currentIndex) {
      this.currentIndex = activeWordIndex;
      this.indicatorBtns.forEach((btn, idx) => {
        btn.classList.toggle('active', idx === activeWordIndex);
      });
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new KineticTypographyOrbit();
});
