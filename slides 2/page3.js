/* ==========================================================================
   Índice del taller (page3.js)
   Motor FLIP / Shared-Layout cíclico de alta fidelidad
   ========================================================================== */

const seccionesData = [
  {
    id: 0,
    deck: 'contexto',
    src: '../presentacion/contexto.html',
    nombre: 'La clínica de simulación',
    area: 'Contexto',
    texto: 'Uno de los lugares más importantes en la formación de los estudiantes, porque es donde se pueden equivocar con los simuladores de alta fidelidad sin afectar una vida humana.',
    heroImg: 'assets/cover_curation.jpg',
    thumbImg: 'assets/cover_curation.jpg'
  },
  {
    id: 1,
    deck: 'problema',
    src: '../presentacion/problema.html',
    nombre: 'El problema',
    area: 'Tres nodos en ciclo',
    texto: 'Inseguridad, método que no se internaliza y feedback que no deja rastro. Los tres se refuerzan uno al otro; el grafo lo muestra encendiendo sus hilos.',
    heroImg: 'assets/candy_bar.jpg',
    thumbImg: 'assets/candy_bar.jpg'
  },
  {
    id: 2,
    deck: 'investigacion',
    src: '../presentacion/investigacion.html',
    nombre: 'La investigación',
    area: 'Cinco frentes',
    texto: 'Voz estudiantil, observación directa, referentes del mundo, literatura revisada por pares y marco normativo. La tira de evidencias se arrastra a lo ancho.',
    heroImg: 'assets/lost_in_you.jpg',
    thumbImg: 'assets/lost_in_you.jpg'
  },
  {
    id: 3,
    deck: 'journey',
    src: '../presentacion/journey.html',
    nombre: 'Journey',
    area: 'Los cinco pasos',
    texto: 'La simulación de Camilo en órbita: inicio y modo, anamnesis libre, procedimientos, diagnóstico con justificación y el feedback que queda guardado.',
    heroImg: 'assets/love_me.jpg',
    thumbImg: 'assets/love_me.jpg'
  },
  {
    id: 4,
    deck: 'timeline',
    src: '../presentacion/timeline.html',
    nombre: 'Timeline',
    area: 'Hasta el 11 de noviembre',
    texto: 'Prototipo, pruebas de usuario, pre entrega y entrega. Cada tramo ocupa a lo ancho lo que dura, y al pie queda el cierre del guion.',
    heroImg: 'assets/bubble_pop.jpg',
    thumbImg: 'assets/bubble_pop.jpg'
  },
  {
    id: 5,
    deck: 'burbujas',
    src: '../Slides/corazon-burbujas.html',
    nombre: 'Anatomía de burbujas',
    area: 'Modelo interactivo',
    texto: 'El corazón otra vez, pero en tus manos: densidad, tamaño, opacidad y paleta. Las esferas se apartan del puntero, empujan a las vecinas y vuelven a su sitio.',
    heroImg: 'assets/anew.jpg',
    thumbImg: 'assets/anew.jpg'
  },
  {
    id: 6,
    deck: 'cinetica',
    src: 'page2.html',
    nombre: 'Tipografía cinética',
    area: 'Concepto',
    texto: 'Palabras en órbita sobre un eje tridimensional. Se arrastra para girarlas o se salta directo a cualquiera de ellas.',
    heroImg: 'assets/preview.jpg',
    thumbImg: 'assets/preview.jpg'
  },
  {
    id: 7,
    deck: 'biblioteca',
    src: 'index.html',
    nombre: 'Archivo de casos',
    area: 'Estantería',
    texto: 'La estantería de expedientes. Cada carpeta se centra al primer clic y abre su historia clínica al segundo.',
    heroImg: 'assets/cover_smlxl.jpg',
    thumbImg: 'assets/cover_smlxl.jpg'
  },
  {
    id: 8,
    deck: 'caso',
    src: '../slide 3/index.html',
    nombre: 'Historia clínica',
    area: 'Caso PEDS-302',
    texto: 'La ficha completa de urgencias: radiografía de tórax, electrocardiograma de doce derivaciones, constantes en vivo y el protocolo PALS aplicado.',
    heroImg: 'assets/reviews/hero_jacob.png',
    thumbImg: 'assets/reviews/hero_jacob.png'
  }
];

const THUMB_W = 76;
const THUMB_GAP = 16;
const SLOT = THUMB_W + THUMB_GAP; // 92
const MORPH_MS = 750;
const MORPH_EASING = 'cubic-bezier(0.19, 1, 0.22, 1)';
const TEXT_SWAP_MS = 280;
const RING_CIRCUMFERENCE = 2 * Math.PI * 23;

class IndiceDeSecciones {
  constructor() {
    this.secciones = seccionesData;
    this.total = this.secciones.length;
    this.currentHeroIndex = 0;
    this.isAnimating = false;

    this.thumbnailsTrack = document.getElementById('thumbnailsTrack');
    this.heroBannerCard = document.getElementById('heroBannerCard');
    this.heroImage = document.getElementById('heroImage');
    this.quoteContent = document.getElementById('quoteContent');
    this.reviewerName = document.getElementById('reviewerName');
    this.reviewerCompany = document.getElementById('reviewerCompany');
    this.reviewerQuote = document.getElementById('reviewerQuote');
    this.nextBtn = document.getElementById('nextBtn');
    this.ringProgress = document.getElementById('ringProgress');
    this.flipGhostCard = document.getElementById('flipGhostCard');
    this.flipGhostImg = document.getElementById('flipGhostImg');
    this.ingresarBtn = document.getElementById('ingresar');
    this.entrarMarco = document.getElementById('entrarMarco');
    this.entrarMarcoTexto = document.getElementById('entrarMarcoTexto');

    this.morphTimers = [];
    this.morphAnims = [];

    this.init();
  }

  init() {
    this.preloadImages();
    this.renderStrip(this.currentHeroIndex);
    this.applySeccion(this.secciones[this.currentHeroIndex]);
    this.bindEvents();
  }

  preloadImages() {
    const seen = new Set();
    this.secciones.forEach((s) => {
      [s.heroImg, s.thumbImg].forEach((src) => {
        if (!src || seen.has(src)) return;
        seen.add(src);
        const img = new Image();
        img.src = src;
      });
    });
  }

  wrap(n) {
    return (n + this.total * 2) % this.total;
  }

  getThumbnailIndices(heroIdx) {
    return [
      this.wrap(heroIdx + 3),
      this.wrap(heroIdx + 2),
      this.wrap(heroIdx + 1)
    ];
  }

  buildThumb(secIdx, { active = false, entering = false } = {}) {
    const s = this.secciones[secIdx];
    const item = document.createElement('div');
    item.className = 'thumb-item';
    if (active) item.classList.add('active');
    if (entering) item.classList.add('thumb-entering');
    item.dataset.index = secIdx;

    item.innerHTML = `
      <div class="thumb-img-box">
        <img src="${s.thumbImg}" alt="${s.nombre}">
      </div>
      <div class="thumb-caption">
        <span class="thumb-name">${s.nombre}</span>
        <span class="thumb-company">${s.area}</span>
      </div>
      <div class="thumb-accent-bar"></div>
    `;

    item.addEventListener('click', () => {
      if (this.isAnimating) return;
      this.goToIndex(secIdx);
    });

    return item;
  }

  renderStrip(heroIdx) {
    const indices = this.getThumbnailIndices(heroIdx);
    this.thumbnailsTrack.innerHTML = '';
    indices.forEach((secIdx, slot) => {
      this.thumbnailsTrack.appendChild(
        this.buildThumb(secIdx, { active: slot === 2 })
      );
    });
  }

  renderAdvanceStrip(oldHeroIdx) {
    const seq = [
      { idx: this.wrap(oldHeroIdx + 4), entering: true },
      { idx: this.wrap(oldHeroIdx + 3) },
      { idx: this.wrap(oldHeroIdx + 2), active: true }
    ];

    this.thumbnailsTrack.innerHTML = '';
    seq.forEach((s) => {
      this.thumbnailsTrack.appendChild(
        this.buildThumb(s.idx, { active: !!s.active, entering: !!s.entering })
      );
    });
  }

  bindEvents() {
    if (this.nextBtn) {
      this.nextBtn.addEventListener('click', () => {
        this.triggerButtonBounce();
        this.goToNext();
      });
    }

    if (this.ingresarBtn) {
      this.ingresarBtn.addEventListener('click', () => this.ingresar());
    }

    if (this.entrarMarco) {
      this.entrarMarco.addEventListener('click', () => this.ingresar());
    }

    window.addEventListener('keydown', (e) => {
      if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ') {
        e.preventDefault();
        this.triggerButtonBounce();
        this.goToNext();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        this.triggerButtonBounce();
        this.goToPrev();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        this.ingresar();
      }
    });
  }

  triggerButtonBounce() {
    if (!this.nextBtn) return;
    this.nextBtn.classList.remove('trigger-bounce');
    void this.nextBtn.offsetWidth;
    this.nextBtn.classList.add('trigger-bounce');
  }

  goToNext() {
    this.goToIndex(this.wrap(this.currentHeroIndex + 1));
  }

  goToPrev() {
    this.goToIndex(this.wrap(this.currentHeroIndex - 1));
  }

  goToIndex(targetIdx) {
    if (this.isAnimating || targetIdx === this.currentHeroIndex) return;

    const oldHeroIdx = this.currentHeroIndex;
    const isSingleStepForward = targetIdx === this.wrap(oldHeroIdx + 1);

    this.isAnimating = true;
    this.currentHeroIndex = targetIdx;

    this.clearMorphTimers();
    this.clearMorphAnims();
    this.swapText(this.secciones[targetIdx]);
    this.morphHero(targetIdx, oldHeroIdx, isSingleStepForward);
  }

  morphHero(targetIdx, oldHeroIdx, isSingleStepForward) {
    const s = this.secciones[targetIdx];
    const sourceThumb = this.thumbnailsTrack.querySelector(
      `.thumb-item[data-index="${targetIdx}"]`
    );
    const sourceBox = sourceThumb
      ? sourceThumb.querySelector('.thumb-img-box')
      : null;

    const firstRect = sourceBox ? sourceBox.getBoundingClientRect() : null;
    const lastRect = this.heroBannerCard.getBoundingClientRect();

    if (isSingleStepForward) {
      this.renderAdvanceStrip(oldHeroIdx);
    } else {
      this.renderStrip(targetIdx);
    }

    if (!firstRect || !this.flipGhostCard || !this.flipGhostImg) {
      if (this.heroImage) this.heroImage.src = s.heroImg;
      this.playHeroSettle();
      this.finishMorph();
      return;
    }

    this.heroBannerCard.classList.remove('morph-settle');
    this.heroBannerCard.classList.add('morph-shrink-out');

    const ghost = this.flipGhostCard;
    this.flipGhostImg.src = s.heroImg;
    ghost.style.opacity = '1';

    const box = (r) => ({
      top: `${r.top}px`,
      left: `${r.left}px`,
      width: `${r.width}px`,
      height: `${r.height}px`
    });

    const flight = ghost.animate([box(firstRect), box(lastRect)], {
      duration: MORPH_MS,
      easing: MORPH_EASING,
      fill: 'both'
    });
    this.morphAnims.push(flight);

    if (isSingleStepForward) {
      this.morphAnims.push(
        this.thumbnailsTrack.animate(
          [
            { transform: `translateX(-${SLOT}px)` },
            { transform: 'translateX(0px)' }
          ],
          { duration: MORPH_MS, easing: MORPH_EASING, fill: 'both' }
        )
      );
    }

    let landed = false;
    const land = () => {
      if (landed) return;
      landed = true;

      if (this.heroImage) this.heroImage.src = s.heroImg;
      this.heroBannerCard.classList.remove('morph-shrink-out');
      this.playHeroSettle();

      ghost.style.opacity = '0';
      this.clearMorphAnims();

      this.renderStrip(this.currentHeroIndex);
      this.finishMorph();
    };

    flight.onfinish = land;
    this.morphTimers.push(setTimeout(land, MORPH_MS + 400));
  }

  playHeroSettle() {
    this.heroBannerCard.classList.remove('morph-settle');
    void this.heroBannerCard.offsetWidth;
    this.heroBannerCard.classList.add('morph-settle');
  }

  finishMorph() {
    this.isAnimating = false;
  }

  clearMorphTimers() {
    this.morphTimers.forEach(clearTimeout);
    this.morphTimers = [];
  }

  clearMorphAnims() {
    this.morphAnims.forEach((a) => {
      a.onfinish = null;
      try { a.cancel(); } catch (_) {}
    });
    this.morphAnims = [];
  }

  swapText(s) {
    this.quoteContent.classList.remove('stagger-in');
    this.quoteContent.classList.add('stagger-out');

    this.morphTimers.push(
      setTimeout(() => {
        this.applySeccion(s);
        this.quoteContent.classList.remove('stagger-out');
        void this.quoteContent.offsetWidth;
        this.quoteContent.classList.add('stagger-in');
      }, TEXT_SWAP_MS)
    );
  }

  applySeccion(s) {
    if (this.reviewerName) this.reviewerName.textContent = s.nombre;
    if (this.reviewerCompany) this.reviewerCompany.textContent = s.area;
    if (this.reviewerQuote) this.reviewerQuote.textContent = s.texto;
    if (this.heroImage) this.heroImage.alt = s.nombre;
    if (this.entrarMarcoTexto) this.entrarMarcoTexto.textContent = 'Ingresar a ' + s.nombre;
  }

  ingresar() {
    const s = this.secciones[this.currentHeroIndex];
    if (window.Taller && window.Taller.dentroDelDeck) window.Taller.ir(s.deck);
    else window.location.href = s.src;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.indiceTaller = new IndiceDeSecciones();
});
