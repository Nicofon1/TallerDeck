/* ==========================================================================
   Kinetic 3D Typography Carousel — Engine (page2.js)
   Órbita 3D de 3 nodos con inclinación y profundidad real
   ========================================================================== */

class KineticTypographyOrbit {
  constructor() {
    this.words = ['Integridad académica', 'Eficiencia', 'Confianza'];
    this.numWords = this.words.length; // 3 palabras (120° de separación)

    // Elementos del DOM
    this.stageContainer = document.getElementById('stageContainer');
    this.orbitTrack = document.getElementById('orbitTrack');
    this.wordElements = Array.from(document.querySelectorAll('.orbit-word'));

    // Ángulos y cinemática (en radianes)
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

    /* La órbita gira sin fin, así que «terminar» no le llega solo: hay que
       contarle las vueltas. Con tres palabras, el tercer paso adelante te
       devuelve a la primera —has visto las tres— y ahí la lámina se da por
       contada y el índice se adelanta a la card siguiente. Los pasos hacia
       atrás descuentan: quien retrocede no ha terminado nada. */
    this.pasosDados = 0;

    // Autoplay Loop
    this.isPlaying = true;
    this.holdDuration = 2800; // ms en cada palabra antes de avanzar
    this.autoTimer = null;

    // Radios responsivos y planos orbitales
    this.radiusX = 360;
    this.radiusZ = 280;
    this.bajo = 82; // Baja lo suficiente para quedar justo debajo de "Es"
    this.alto = 150; // Cuánto suben las del fondo

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
      this.radiusX = 160;
      this.radiusZ = 130;
      this.bajo = 65;
      this.alto = 110;
    } else if (w < 1000) {
      this.radiusX = 260;
      this.radiusZ = 180;
      this.bajo = 75;
      this.alto = 135;
    } else {
      this.radiusX = Math.min(440, w * 0.32);
      this.radiusZ = Math.min(280, h * 0.32);
      this.bajo = 82;
      this.alto = 150;
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

    /* La órbita se gira con el dedo, pero solo encima de ella: deslizar en
       el resto de la lámina sigue siendo pasar de lámina. */
    if (window.Gestos && this.stageContainer) {
      window.Gestos.mio((e) => this.stageContainer.contains(e.target));
    }

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
        if (++this.pasosDados >= this.numWords) {
          this.pasosDados = 0;
          if (window.Taller) window.Taller.terminar();
        }
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        this.pauseAndStep(-1);
        this.pasosDados = Math.max(0, this.pasosDados - 1);
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

      // Altura (Y). En reposo las tres solo visitan cosT = 1 (la delantera) y
      // cosT = -0.5 (las dos del fondo), así que basta con estirar ese tramo
      // entre las dos alturas: t = 1 abajo, t = 0 arriba.
      const t = (cosT + 0.5) / 1.5;
      const y = -this.alto + t * (this.bajo + this.alto);

      // Normalizado de profundidad (0 = fondo, 1 = frente)
      const normalizedDepth = (cosT + 1) / 2;

      // Escala: ~0.40 en el fondo hasta 1.0 al frente
      const scale = 0.38 + 0.62 * Math.pow(normalizedDepth, 1.4);

      // Opacidad: se apaga con la distancia
      const opacity = 0.58 + 0.42 * Math.pow(normalizedDepth, 1.2);

      // Z-Index: detrás del título Osler Hub (z: 20) si está atrás, al frente si está adelante (z: 35)
      const zIndex = cosT < -0.1 ? 10 : 35;

      // Desenfoque. Sin marco que las separe, la profundidad la tiene que
      // decir el foco: la que manda está nítida y las del fondo, veladas.
      // Encima va el barrido del movimiento, que solo pesa mientras gira.
      // El filtro se aplica antes de la escala, así que lo que se ve en
      // pantalla es blur*scale: hay que dividir para pedir píxeles reales.
      const depthBlur = 5.4 * Math.pow(1 - normalizedDepth, 1.15) / scale;
      const itemBlur = depthBlur + blurAmount * (0.2 + 0.8 * normalizedDepth);

      el.style.transform = `translate(-50%, -50%) translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, ${z.toFixed(1)}px) scale(${scale.toFixed(3)})`;
      el.style.opacity = opacity.toFixed(2);
      el.style.zIndex = zIndex;
      el.style.filter = itemBlur > 0.3 ? `blur(${itemBlur.toFixed(1)}px)` : 'none';
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.orbitaCinetica = new KineticTypographyOrbit();
});
