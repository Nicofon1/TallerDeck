/* ==========================================================================
   Kinetic 3D Typography Carousel — Engine (page2.js)
   Órbita 3D de 3 nodos con inclinación y profundidad real
   ========================================================================== */

class KineticTypographyOrbit {
  constructor() {
    this.words = ['Global', 'Fast', 'Local'];
    this.numWords = this.words.length; // 3 palabras (120° de separación)

    // Elementos del DOM
    this.stageContainer = document.getElementById('stageContainer');
    this.orbitTrack = document.getElementById('orbitTrack');
    this.wordElements = Array.from(document.querySelectorAll('.orbit-word'));

    // Ángulos y cinemática (en radianes)
    // angle = 0      -> palabra 0 (Global) al frente
    // angle = -2PI/3 -> palabra 1 (Fast) al frente
    // angle = -4PI/3 -> palabra 2 (Local) al frente
    this.currentIndex = 0;
    this.currentAngle = 0;
    this.targetAngle = 0;
    this.lastAngle = 0;
    this.velocity = 0;

    // Estado de interacción
    this.isDragging = false;
    this.startX = 0;
    this.startAngle = 0;
    this.lastPointerX = 0;
    this.lastPointerTime = 0;
    this.pointerVelocity = 0;

    // Autoplay Loop
    this.isPlaying = true;
    this.holdDuration = 2800; // ms en cada palabra antes de avanzar
    this.autoTimer = null;

    // Radios responsivos y planos orbitales
    this.radiusX = 360;
    this.radiusZ = 280;
    this.tiltY = 160; // Elevación de las palabras traseras vs la delantera

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
    const h = window.innerHeight;
    if (w < 600) {
      this.radiusX = 180;
      this.radiusZ = 160;
      this.tiltY = 120;
    } else if (w < 1000) {
      this.radiusX = 290;
      this.radiusZ = 220;
      this.tiltY = 150;
    } else {
      this.radiusX = Math.min(460, w * 0.33);
      this.radiusZ = Math.min(320, h * 0.38);
      this.tiltY = Math.min(200, h * 0.26);
    }
  }

  bindEvents() {
    // Clic en cualquier tarjeta para traerla al frente
    this.wordElements.forEach((el, idx) => {
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        this.pauseAndGoTo(idx);
      });
    });

    // Arrastre con puntero (ratón o táctil)
    if (this.stageContainer) {
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

        const dragDelta = (e.clientX - this.startX) * 0.0055;
        this.targetAngle = this.startAngle + dragDelta;
        this.currentAngle = this.targetAngle;
      });

      const endDrag = () => {
        if (!this.isDragging) return;
        this.isDragging = false;

        const step = (Math.PI * 2) / this.numWords;
        const momentum = this.pointerVelocity * 80 * 0.0055;
        const projectedAngle = this.currentAngle + momentum;
        const nearestStep = Math.round(projectedAngle / step) * step;

        this.targetAngle = nearestStep;
        if (this.isPlaying) {
          this.scheduleNextStep();
        }
      };

      window.addEventListener('pointerup', endDrag);
      window.addEventListener('pointercancel', endDrag);

      // Rueda del ratón
      this.stageContainer.addEventListener('wheel', (e) => {
        e.preventDefault();
        clearTimeout(this.autoTimer);
        const rawDelta = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
        this.targetAngle -= rawDelta * 0.0025;
        if (this.isPlaying) {
          this.scheduleNextStep();
        }
      }, { passive: false });
    }

    // Teclas de dirección
    window.addEventListener('keydown', (e) => {
      if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        this.pauseAndStep(1);
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        this.pauseAndStep(-1);
      }
    });
  }

  pauseAndGoTo(targetIndex) {
    clearTimeout(this.autoTimer);
    const step = (Math.PI * 2) / this.numWords;
    const currentStepIndex = Math.round(-this.currentAngle / step);
    const normalizedCurrent = ((currentStepIndex % this.numWords) + this.numWords) % this.numWords;

    let diff = targetIndex - normalizedCurrent;
    if (diff > 1) diff -= 3;
    if (diff < -1) diff += 3;

    this.targetAngle = -(currentStepIndex + diff) * step;

    if (this.isPlaying) {
      this.scheduleNextStep();
    }
  }

  pauseAndStep(direction) {
    clearTimeout(this.autoTimer);
    const step = (Math.PI * 2) / this.numWords;
    const currentStepIndex = Math.round(-this.currentAngle / step);
    this.targetAngle = -(currentStepIndex + direction) * step;
    if (this.isPlaying) {
      this.scheduleNextStep();
    }
  }

  scheduleNextStep() {
    clearTimeout(this.autoTimer);
    this.autoTimer = setTimeout(() => {
      if (!this.isPlaying || this.isDragging) return;
      const step = (Math.PI * 2) / this.numWords;
      this.targetAngle -= step;
      this.scheduleNextStep();
    }, this.holdDuration);
  }

  startRenderLoop() {
    const render = () => {
      if (!this.isDragging) {
        // Suavizado elástico con amortiguación
        const ease = 0.08;
        this.currentAngle += (this.targetAngle - this.currentAngle) * ease;
      }

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
    const blurAmount = Math.min(8, speedMagnitude * 100);

    this.wordElements.forEach((el, i) => {
      const theta = this.currentAngle + i * stepAngle;
      const sinT = Math.sin(theta);
      const cosT = Math.cos(theta); // 1 = frente (abajo), -0.5 = atrás (arriba)

      // Coordenadas 3D
      const x = sinT * this.radiusX;
      const z = cosT * this.radiusZ;

      // Inclinación vertical (Y):
      // Al frente (cosT = 1): y = +tiltY (abajo, en primer plano)
      // Al fondo (cosT < 0):  y = -tiltY * 0.85 (arriba, detrás de Osler Hub)
      const y = -cosT * this.tiltY + (this.tiltY * 0.2);

      // Normalizado de profundidad (0 = fondo, 1 = frente)
      const normalizedDepth = (cosT + 1) / 2;

      // Escala: ~0.40 en el fondo hasta 1.0 al frente
      const scale = 0.38 + 0.62 * Math.pow(normalizedDepth, 1.4);

      // Opacidad: 0.70 en el fondo hasta 1.0 al frente
      const opacity = 0.68 + 0.32 * Math.pow(normalizedDepth, 1.2);

      // Z-Index: detrás del título Osler Hub (z: 20) si está atrás, al frente si está adelante (z: 35)
      const zIndex = cosT < -0.1 ? 10 : 35;

      // Desenfoque por movimiento dinámico
      const itemBlur = blurAmount * (0.2 + 0.8 * normalizedDepth);

      el.style.transform = `translate(-50%, -50%) translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, ${z.toFixed(1)}px) scale(${scale.toFixed(3)})`;
      el.style.opacity = opacity.toFixed(2);
      el.style.zIndex = zIndex;
      el.style.filter = itemBlur > 0.3 ? `blur(${itemBlur.toFixed(1)}px)` : 'none';
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new KineticTypographyOrbit();
});
