/* ==========================================================================
   Índice del taller (page3.js)
   Motor FLIP / Shared-Layout cíclico de alta fidelidad
   Previsualizaciones reales de cada lámina
   ========================================================================== */

const seccionesData = [
  {
    id: 0,
    deck: 'contexto',
    src: '../presentacion/contexto.html',
    nombre: 'La clínica de simulación',
    area: 'Contexto',
    texto: 'Uno de los lugares más importantes en la formación de los estudiantes, porque es donde se pueden equivocar con los simuladores de alta fidelidad sin afectar una vida humana.',
    heroImg: 'assets/previews/contexto.png',
    thumbImg: 'assets/previews/contexto.png'
  },
  {
    id: 1,
    deck: 'problema',
    src: '../presentacion/problema.html',
    nombre: 'Los tres problemas que se refuerzan uno al otro.',
    area: 'Problema',
    texto: 'Inseguridad y la ansiedad.\n\nEl método clínico no se internaliza bien.\n\nfeedback docente ineficiente.',
    heroImg: 'assets/previews/problema.png',
    thumbImg: 'assets/previews/problema.png'
  },
  {
    id: 2,
    deck: 'investigacion',
    src: 'index.html',
    nombre: 'Entendimos el problema desde cinco frentes',
    area: 'Investigación',
    texto: 'Voz estudiantil, observación directa, referentes del mundo, literatura científica y marco normativo. Cada frente es una carpeta que se abre.',
    heroImg: 'assets/previews/biblioteca.png',
    thumbImg: 'assets/previews/biblioteca.png'
  },
  {
    id: 3,
    deck: 'journey',
    src: '../presentacion/journey.html',
    nombre: 'Cómo lo resolvemos',
    area: 'Journey',
    texto: 'El recorrido de Camilo, etapa por etapa: entrevista, procedimientos, diagnóstico, plan de manejo y retroalimentación.',
    heroImg: 'assets/previews/journey.png',
    thumbImg: 'assets/previews/journey.png'
  },
  {
    id: 4,
    deck: 'timeline',
    src: '../presentacion/timeline.html',
    nombre: '11 de Noviembre',
    area: 'Timeline',
    texto: 'Osler Hub no reemplaza la Clínica de Simulación: la complementa. La clínica enseña a intervenir; Osler Hub acompaña el paso previo, que es aprender a pensar antes de hacer.',
    heroImg: 'assets/previews/timeline.png',
    thumbImg: 'assets/previews/timeline.png'
  },
  {
    id: 5,
    deck: 'cinetica',
    src: 'page2.html',
    nombre: 'Tipografía cinética',
    area: 'Concepto',
    texto: 'Palabras en órbita sobre un eje tridimensional. Se arrastra para girarlas o se salta directo a cualquiera de ellas.',
    heroImg: 'assets/previews/cinetica.png',
    thumbImg: 'assets/previews/cinetica.png'
  }
];

const THUMB_W = 76;
const THUMB_GAP = 16;
const SLOT = THUMB_W + THUMB_GAP; // 92
const MORPH_MS = 750;
const MORPH_EASING = 'cubic-bezier(0.19, 1, 0.22, 1)';
const TEXT_SWAP_MS = 280;

class IndiceDeSecciones {
  constructor() {
    this.secciones = seccionesData;
    this.total = this.secciones.length;
    this.currentHeroIndex = 0;
    this.isAnimating = false;
    this.aterrizar = null;      // el aterrizaje del vuelo en curso, si lo hay

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

    item.addEventListener('click', () => this.goToIndex(secIdx));

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
    if (targetIdx === this.currentHeroIndex) return;

    /* Antes, mientras la portada volaba, cualquier flecha se tiraba a la
       basura: el recorrido iba al paso de la animación y no al de quien la
       mira. Ahora la pulsación hace aterrizar el vuelo en curso en el acto
       —con su portada y su tira ya en su sitio, que es de donde tiene que
       salir el siguiente— y arranca el nuevo desde ahí. El índice se recorre
       tan rápido como se pulse. */
    if (this.isAnimating && this.aterrizar) this.aterrizar();

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
    /* Las dos clases del morfeo animan `transform`, así que medir con
       cualquiera puesta devuelve una escala a medias. Se quitan y se fuerza
       el cálculo antes de medir: la caja de destino es la de la portada
       quieta, siempre. Con el candado puesto no se notaba —nunca había un
       morfeo tan pegado al anterior—, sin él sí. */
    this.heroBannerCard.classList.remove('morph-settle', 'morph-shrink-out');
    void this.heroBannerCard.offsetWidth;
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
      this.aterrizar = null;

      if (this.heroImage) this.heroImage.src = s.heroImg;
      this.heroBannerCard.classList.remove('morph-shrink-out');
      this.playHeroSettle();

      ghost.style.opacity = '0';
      this.clearMorphAnims();

      this.renderStrip(this.currentHeroIndex);
      this.finishMorph();
    };

    flight.onfinish = land;
    this.aterrizar = land;    // para poder hacerlo aterrizar desde fuera
    this.morphTimers.push(setTimeout(land, MORPH_MS + 400));
  }

  playHeroSettle() {
    this.heroBannerCard.classList.remove('morph-settle');
    void this.heroBannerCard.offsetWidth;
    this.heroBannerCard.classList.add('morph-settle');
  }

  finishMorph() {
    this.isAnimating = false;
    this.aterrizar = null;
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
