/* ==========================================================================
   MEDICAL CASE FILES — Interactive 3D Folder Shelf
   Symmetric 90° Swing & Flush Cover Engine
   ========================================================================== */

const booksData = [
  {
    id: 'folder-cardiology',
    title: 'CARDIOLOGY',
    subtitle: 'Dept. A-12',
    spineBg: '#251D4E', textColor: '#C8DEFE',
    tabColor: '#426DC2',
    spineWidth: 36, height: 295, tilt: -0.9,
    isFeatured: false
  },
  {
    id: 'folder-neurology',
    title: 'NEUROLOGY — Case Files Vol. III',
    subtitle: 'Dr. R. Castillo',
    spineBg: '#426DC2', textColor: '#F9FAFB',
    tabColor: '#82CACA',
    spineWidth: 30, height: 305, tilt: 0.5,
    isSlimSerif: true, isFeatured: false
  },
  {
    id: 'folder-oncology',
    title: 'ONCOLOGY PROTOCOLS',
    author: 'Dr. Helena Voss',
    spineBg: '#1A1A1A', textColor: '#82CACA',
    tabColor: '#82CACA',
    spineWidth: 46, coverWidth: 280, height: 310, tilt: 0,
    isFeatured: true, coverType: 'oncology'
  },
  {
    id: 'folder-trauma',
    title: 'TRAUMA REGISTRY — ACTIVE',
    subtitle: 'ER Division',
    spineBg: '#251D4E', textColor: '#C8DEFE',
    tabColor: '#82CACA',
    spineWidth: 28, height: 340, tilt: -1.1,
    isFeatured: false
  },
  {
    id: 'folder-labs',
    title: 'LAB RESULTS — PENDING',
    subtitle: '',
    spineBg: '#EBEBEB', textColor: '#251D4E',
    tabColor: '#426DC2',
    spineWidth: 40, height: 315, tilt: 0.7,
    isGrid: true, isFeatured: false
  },
  {
    id: 'folder-radiology',
    title: 'RADIOLOGY',
    author: 'Dr. S. Nomura',
    spineBg: '#C8DEFE', textColor: '#251D4E',
    tabColor: '#426DC2',
    spineWidth: 44, coverWidth: 270, height: 310, tilt: 0,
    isFeatured: true, coverType: 'generic'
  },
  {
    id: 'folder-pathology',
    title: 'PATHOLOGY: BIOPSY REPORTS — Q3',
    subtitle: 'Dr. L. Fontaine',
    spineBg: '#4C8FAE', textColor: '#F9FAFB',
    tabColor: '#C8DEFE',
    spineWidth: 38, height: 318, tilt: -0.4,
    isFeatured: false
  },
  {
    id: 'folder-patient-records',
    title: 'PATIENT RECORDS',
    author: 'Central Registry',
    spineBg: '#251D4E', textColor: '#C8DEFE',
    tabColor: '#426DC2',
    spineWidth: 48, coverWidth: 280, height: 285, tilt: 0,
    isFeatured: true, coverType: 'patient-records'
  },
  {
    id: 'folder-internal-med',
    title: 'INTERNAL MEDICINE — Referrals',
    subtitle: 'Building C, Floor 4',
    spineBg: '#1A1A1A', textColor: '#C8DEFE',
    tabColor: '#82CACA',
    spineWidth: 42, height: 322, tilt: 1.0,
    isFeatured: false
  },
  {
    id: 'folder-pediatrics',
    title: 'PEDIATRICS',
    subtitle: 'Ward 7-B',
    spineBg: '#82CACA', textColor: '#251D4E',
    tabColor: '#426DC2',
    spineWidth: 34, height: 300, tilt: -0.6,
    isFeatured: false
  },
  {
    id: 'folder-surgery',
    title: 'SURGICAL REPORTS',
    author: 'Dr. K. Andersen',
    spineBg: '#426DC2', textColor: '#F9FAFB',
    tabColor: '#82CACA',
    spineWidth: 40, coverWidth: 270, height: 305, tilt: 0,
    isFeatured: true, coverType: 'surgery'
  },
  {
    id: 'folder-pharmacy',
    title: 'PHARMACY — Rx Log',
    subtitle: '',
    spineBg: '#EBEBEB', textColor: '#251D4E',
    tabColor: '#426DC2',
    spineWidth: 26, height: 308, tilt: 1.1,
    isFeatured: false
  },
  {
    id: 'folder-diagnostics',
    title: 'DIAGNOSTICS',
    author: 'Clinical Lab',
    spineBg: '#426DC2', textColor: '#F9FAFB',
    tabColor: '#C8DEFE',
    spineWidth: 48, coverWidth: 280, height: 330, tilt: 0,
    isBold: true, isFeatured: true, coverType: 'diagnostics'
  },
  {
    id: 'folder-discharge',
    title: 'DISCHARGE SUMMARIES',
    subtitle: '',
    spineBg: '#6B6880', textColor: '#F9FAFB',
    tabColor: '#C8DEFE',
    spineWidth: 36, height: 312, tilt: -0.8,
    isFeatured: false
  }
];

/* La apertura del expediente. El texto de la tapa y el de la hoja viven en
   bloques de medidas fijas que solo se escalan, para que crecer no los
   deforme; estas son esas medidas. */
/* Una curva expo se come el 93% del recorrido en el primer tercio: la tapa
   se abriria antes de que a nadie le diera tiempo a verla. Esta arranca
   despacio, coge cuerpo en medio y frena al final, que es como se abre una
   carpeta de verdad. */
const APERTURA_MS = 1050;
const APERTURA_EASE = 'cubic-bezier(0.42, 0.02, 0.2, 1)';
const TAPA_W = 300, TAPA_H = 420;
const HOJA_W = 900, HOJA_H = 560;

class BookshelfManager {
  constructor() {
    this.shelfTrack = document.getElementById('shelfTrack');
    this.shelfViewport = document.getElementById('shelfViewport');
    this.prevBtn = document.getElementById('prevBtn');
    this.nextBtn = document.getElementById('nextBtn');
    this.pageNums = document.querySelectorAll('.page-num');
    this.expediente = document.getElementById('expediente');
    this.expCaja = document.getElementById('expCaja');
    this.expTapa = document.getElementById('expTapa');
    this.expHoja = document.getElementById('expHoja');

    this.books = booksData;
    this.numBooks = this.books.length;

    this.currentProgress = 7;
    this.targetProgress = 7;

    this.isDragging = false;
    this.startX = 0;
    this.dragStartProgress = 0;
    this.velocity = 0;
    this.lastX = 0;
    this.lastTime = 0;

    /* Nada se mueve solo: el estante espera. */
    this.abriendo = false;
    this.aperturaLista = null;
    this.relojes = [];
    this.arrastro = 0;     // cuanto se movio el puntero: un clic no arrastra
    /* El estante se acerca un poco al abrirse un expediente. Va aquí y no en
       CSS porque el bucle de render reescribe el transform de la pista en
       cada cuadro: una regla de hoja de estilo no sobreviviría al siguiente. */
    this.zoom = 1;
    this.zoomObjetivo = 1;

    this.domSlots = [];

    // Pre-compute random organic quirks per slot (stable across frames)
    // Subtle: extraGap 0-4px, vertShift 0-3px — enough to break linearity without overlapping
    this.quirks = booksData.map((b, i) => {
      const s = Math.sin(i * 9.1 + 3.7) * 10000;
      const r = s - Math.floor(s);
      const s2 = Math.sin(i * 13.3 + 7.1) * 10000;
      const r2 = s2 - Math.floor(s2);
      return {
        extraGap: r * 4,        // 0px to 4px extra gap
        vertShift: r2 * 3,      // 0px to 3px upward shift
      };
    });

    this.init();
  }

  init() {
    this.renderShelf();
    this.bindEvents();
    this.startRenderLoop();
  }

  renderShelf() {
    this.shelfTrack.innerHTML = '';
    this.domSlots = [];

    this.books.forEach((book, index) => {
      const slotEl = document.createElement('div');
      slotEl.className = 'book-slot';
      slotEl.dataset.index = index;
      slotEl.style.height = `${book.height}px`;

      let innerMarkup = '';

      if (book.isFeatured) {
        // Cover content (medical folder open face)
        let coverMarkup = '';
        if (book.coverType === 'oncology') {
          coverMarkup = `
            <div class="cover-folder" style="background:#F9FAFB;color:#251D4E;">
              <div class="folder-tab" style="background:${book.tabColor};"></div>
              <div class="folder-dept">DEPARTMENT OF ONCOLOGY</div>
              <div class="folder-main-title">PROTOCOLS<br>&amp; TREATMENT<br>GUIDELINES</div>
              <div class="folder-meta">Dr. Helena Voss — Attending<br>Case Series 2024–2026</div>
              <div class="folder-stamp">CONFIDENTIAL</div>
            </div>`;
        } else if (book.coverType === 'patient-records') {
          coverMarkup = `
            <div class="cover-folder" style="background:#F9FAFB;color:#251D4E;">
              <div class="folder-tab" style="background:${book.tabColor};"></div>
              <div class="folder-dept">CENTRAL REGISTRY</div>
              <div class="folder-main-title">PATIENT<br>RECORDS</div>
              <div class="folder-meta">Active Cases — All Departments<br>Updated: Aug 2026</div>
              <div class="folder-id">ID: CR-4401-B</div>
            </div>`;
        } else if (book.coverType === 'surgery') {
          coverMarkup = `
            <div class="cover-folder" style="background:#F9FAFB;color:#251D4E;">
              <div class="folder-tab" style="background:${book.tabColor};"></div>
              <div class="folder-dept">SURGICAL DIVISION</div>
              <div class="folder-main-title">OPERATIVE<br>REPORTS</div>
              <div class="folder-meta">Dr. K. Andersen — Chief Surgeon<br>Post-Op Follow-Up</div>
              <div class="folder-stamp">REVIEW PENDING</div>
            </div>`;
        } else if (book.coverType === 'diagnostics') {
          coverMarkup = `
            <div class="cover-folder" style="background:#F9FAFB;color:#251D4E;">
              <div class="folder-tab" style="background:${book.tabColor};"></div>
              <div class="folder-dept">CLINICAL LABORATORY</div>
              <div class="folder-main-title">DIAGNOSTIC<br>ANALYSIS</div>
              <div class="folder-meta">Full Panel Results<br>Hematology / Biochemistry / Serology</div>
              <div class="folder-id">REF: DX-7783</div>
            </div>`;
        } else {
          coverMarkup = `
            <div class="cover-folder" style="background:#F9FAFB;color:#251D4E;">
              <div class="folder-tab" style="background:${book.tabColor};"></div>
              <div class="folder-main-title">${book.title}</div>
              <div class="folder-meta">${book.author || ''}</div>
            </div>`;
        }

        const spineClass = book.isBold ? 'bold-block' : book.isSlimSerif ? 'slim-serif' : '';

        innerMarkup = `
          <div class="book-3d-mesh" data-spine-depth="${book.spineWidth}" style="width:${book.coverWidth}px;">
            <div class="mesh-face-front" style="transform:translateZ(${book.spineWidth}px);">
              ${coverMarkup}
              <div class="mesh-shading-layer"></div>
            </div>
            <div class="mesh-face-spine" style="width:${book.spineWidth}px; background:${book.spineBg}; color:${book.textColor};">
              <div class="spine-text-rot ${spineClass}">${book.title}</div>
            </div>
            <div class="mesh-face-pages" style="width:${book.spineWidth}px; transform:translateX(${book.coverWidth}px) rotateY(90deg);"></div>
          </div>`;
      } else {
        // Static spine-only folder
        let spineInner = '';
        if (book.isGrid) {
          spineInner = `
            <div style="display:flex;flex-direction:column;align-items:center;justify-content:space-between;height:100%;width:100%;">
              <div style="width:100%;height:4px;background:${book.tabColor};border-radius:0 0 2px 2px;"></div>
              <div class="spine-text-rot" style="flex:1;">${book.title}</div>
            </div>`;
        } else {
          const spineClass = book.isBold ? 'bold-block' : book.isSlimSerif ? 'slim-serif' : '';
          spineInner = `
            <div style="width:100%;height:4px;background:${book.tabColor};border-radius:0 0 2px 2px;position:absolute;top:0;left:0;"></div>
            <div class="spine-text-rot ${spineClass}">${book.title}</div>`;
        }

        innerMarkup = `
          <div class="spine-static-book" style="background:${book.spineBg};color:${book.textColor};transform:rotate(${book.tilt}deg);">
            ${spineInner}
          </div>`;
      }

      slotEl.innerHTML = innerMarkup;

      this.shelfTrack.appendChild(slotEl);

      this.domSlots.push({
        slotEl,
        meshEl: slotEl.querySelector('.book-3d-mesh'),
        shadingEl: slotEl.querySelector('.mesh-shading-layer'),
        book,
        isFeatured: book.isFeatured
      });
    });
  }

  bindEvents() {
    /* Un solo oyente para todo el estante. Antes cada ranura escuchaba lo
       suyo, pero las carpetas viven en 3D: la cara de una tapa sobresale de
       su ranura —que llega a medir cero de ancho— y el navegador acababa
       entregando el clic a otro libro. Sobre la portada grande, a cualquier
       altura, contestaba siempre el ultimo del estante.

       Asi que el libro no lo decide el DOM: lo decide donde se hizo clic. */
    this.shelfViewport.addEventListener('click', (ev) => {
      if (this.arrastro > 6) return;      // eso fue arrastrar, no señalar
      const i = this.libroEn(ev.clientX, ev.clientY);
      if (i !== -1) this.abrir(i);
    });

    this.prevBtn.addEventListener('click', () => {
      this.targetProgress = Math.max(0, this.targetProgress - 1);
    });
    this.nextBtn.addEventListener('click', () => {
      this.targetProgress = Math.min(this.numBooks - 1, this.targetProgress + 1);
    });

    this.pageNums.forEach(btn => {
      btn.addEventListener('click', () => {
        this.targetProgress = parseInt(btn.dataset.idx, 10);
      });
    });

    window.addEventListener('keydown', (e) => {
      if (this.abriendo) return;
      if (e.key === 'ArrowLeft') this.targetProgress = Math.max(0, this.targetProgress - 1);
      if (e.key === 'ArrowRight') this.targetProgress = Math.min(this.numBooks - 1, this.targetProgress + 1);
      if (e.key === 'Enter') this.abrir(Math.round(this.currentProgress));
    });

    this.shelfViewport.addEventListener('wheel', (e) => {
      e.preventDefault();
      if (this.abriendo) return;
      // Smooth calibrated wheel delta (no more instant jumping)
      const rawDelta = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
      const delta = rawDelta * 0.0018;
      this.targetProgress = Math.max(0, Math.min(this.numBooks - 1, this.targetProgress + delta));
    }, { passive: false });

    this.shelfViewport.addEventListener('pointerdown', (e) => {
      if (this.abriendo) return;
      this.arrastro = 0;
      this.isDragging = true;
      this.shelfViewport.classList.add('is-dragging');
      this.startX = e.clientX;
      this.lastX = e.clientX;
      this.lastTime = performance.now();
      this.dragStartProgress = this.currentProgress;
      this.velocity = 0;
      this.shelfViewport.setPointerCapture(e.pointerId);
    });

    window.addEventListener('pointermove', (e) => {
      if (!this.isDragging) return;
      const now = performance.now();
      this.velocity = (e.clientX - this.lastX) / Math.max(1, now - this.lastTime);
      this.lastX = e.clientX;
      this.lastTime = now;
      // Controlled drag sensitivity
      this.targetProgress = Math.max(0, Math.min(this.numBooks - 1, this.dragStartProgress - (e.clientX - this.startX) * 0.0032));
      this.currentProgress = this.targetProgress;
    });

    const endDrag = () => {
      if (!this.isDragging) return;
      this.arrastro = Math.abs(this.lastX - this.startX);
      this.isDragging = false;
      this.shelfViewport.classList.remove('is-dragging');
      // Gentle momentum snap
      this.targetProgress = Math.max(0, Math.min(this.numBooks - 1, Math.round(this.currentProgress - this.velocity * 3.2)));
    };
    window.addEventListener('pointerup', endDrag);
    window.addEventListener('pointercancel', endDrag);
  }

  /* Que libro hay en este punto de la pantalla.

     Se mide lo que se pinta, no las ranuras —que llegan a medir cero de
     ancho—, y del libro centrado se mide su portada, que es lo unico que se
     ve entero. Entre todas las cajas que contienen el punto gana la del
     centro mas cercano.

     Ese desempate importa: una cara girada en 3D deja una caja envolvente
     mucho mas ancha que el trozo que de verdad se ve, asi que la portada
     grande se solapa con los lomos de al lado. Por el centro mas cercano
     sale siempre el que cualquiera diria que ha tocado. */
  libroEn(x, y) {
    const dentro = (r) => x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
    const centrado = Math.max(0, Math.min(this.numBooks - 1, Math.round(this.currentProgress)));

    let elegido = -1, mejor = Infinity;
    for (let i = 0; i < this.domSlots.length; i++) {
      const ranura = this.domSlots[i].slotEl;
      const el = (i === centrado && ranura.querySelector('.mesh-face-front'))
              || ranura.firstElementChild || ranura;
      const r = el.getBoundingClientRect();
      if (!r.width || !dentro(r)) continue;
      const d = Math.abs(x - (r.left + r.width / 2));
      if (d < mejor) { mejor = d; elegido = i; }
    }
    return elegido;
  }

  /* ---------- abrir un expediente ----------
     Un clic basta. Si el expediente no estaba de frente primero viaja al
     centro: abrirlo de perfil no se entendería. */
  abrir(index) {
    if (this.abriendo) return;
    const ficha = this.domSlots[index];
    if (!ficha) return;

    this.targetProgress = index;
    const viaje = Math.min(620, Math.abs(index - this.currentProgress) * 170);
    this.abriendo = true;
    this.relojes.push(setTimeout(() => this.desplegar(ficha), viaje));
  }

  /* La caja que ocupa el expediente en pantalla ahora mismo. Se mide la cara
     de la carpeta si la tiene; si es un lomo suelto, el hueco entero. */
  cajaDe(ficha) {
    const cara = ficha.slotEl.querySelector('.mesh-face-front') || ficha.slotEl;
    const r = cara.getBoundingClientRect();
    return { x: r.left, y: r.top, w: r.width, h: r.height };
  }

  /* Dónde acaba: una carpeta abierta, grande, centrada en la pantalla. */
  cajaFinal() {
    const w = Math.min(1080, window.innerWidth * 0.9);
    const h = Math.min(660, window.innerHeight * 0.82);
    return { x: (window.innerWidth - w) / 2, y: (window.innerHeight - h) / 2, w: w, h: h };
  }

  pose(c) {
    return {
      transform: 'translate(' + c.x.toFixed(1) + 'px,' + c.y.toFixed(1) + 'px)',
      width: c.w.toFixed(1) + 'px',
      height: c.h.toFixed(1) + 'px'
    };
  }

  /* El bloque de texto cabe entero dentro de la caja, sin deformarse. */
  contener(c, dw, dh) {
    const k = Math.min(c.w / dw, c.h / dh);
    return 'translate(-50%,-50%) scale(' + k.toFixed(4) + ')';
  }

  pintarExpediente(ficha) {
    const libro = ficha.book;
    const bloque = this.expTapa.querySelector('.tapa-texto');
    const original = ficha.slotEl.querySelector('.cover-folder');
    bloque.innerHTML = '';

    if (original) {
      /* La tapa es la portada que ya estaba en el estante, tal cual. */
      const clon = original.cloneNode(true);
      this.expTapa.style.background = original.style.backgroundColor || '#e8e4db';
      clon.style.backgroundColor = 'transparent';
      bloque.appendChild(clon);
    } else {
      /* Los lomos sueltos no tienen portada: se les arma una con lo suyo. */
      const d = document.createElement('div');
      d.className = 'cover-folder';
      d.style.color = '#1a2530';
      d.innerHTML =
        '<div class="folder-tab" style="background:' + libro.tabColor + ';"></div>' +
        '<div class="folder-dept">Expediente</div>' +
        '<div class="folder-main-title">' + libro.title + '</div>' +
        '<div class="folder-meta">' + (libro.subtitle || libro.author || '') + '</div>';
      this.expTapa.style.background = '#e8e4db';
      bloque.appendChild(d);
    }

    document.getElementById('hojaDep').textContent = libro.title;
    document.getElementById('hojaId').textContent = libro.id.replace('folder-', 'REF · ').toUpperCase();
    document.getElementById('hojaSub').textContent = libro.subtitle || libro.author || '';
    this.expHoja.querySelector('.hoja-regla').style.background = libro.tabColor || '#1b1b19';
  }

  desplegar(ficha) {
    const desde = this.cajaDe(ficha);
    const hasta = this.cajaFinal();

    this.pintarExpediente(ficha);
    this.expCaja.style.transform = this.pose(desde).transform;
    this.expCaja.style.width = this.pose(desde).width;
    this.expCaja.style.height = this.pose(desde).height;
    this.expediente.classList.add('abierto');

    ficha.slotEl.classList.add('se-abre');
    document.documentElement.classList.add('abriendo');
    this.zoomObjetivo = 1.14;

    const t = { duration: APERTURA_MS, easing: APERTURA_EASE, fill: 'both' };

    this.expCaja.animate([this.pose(desde), this.pose(hasta)], t);

    /* La tapa se resiste un poco antes de abrirse del todo: ese titubeo al
       principio es lo que hace que se lea como una tapa y no como un telón. */
    this.expTapa.animate([
      { transform: 'rotateY(0deg)' },
      { transform: 'rotateY(-9deg)', offset: 0.22 },
      { transform: 'rotateY(-162deg)' }
    ], t);

    this.expTapa.querySelector('.tapa-texto').animate([
      { transform: this.contener(desde, TAPA_W, TAPA_H) },
      { transform: this.contener(hasta, TAPA_W, TAPA_H) }
    ], t);

    this.expHoja.querySelector('.hoja-texto').animate([
      { transform: this.contener(desde, HOJA_W, HOJA_H), opacity: 0 },
      { transform: this.contener(desde, HOJA_W, HOJA_H), opacity: 0, offset: 0.28 },
      { transform: this.contener(hasta, HOJA_W, HOJA_H), opacity: 1 }
    ], t);

    const libro = ficha.book;
    this.aperturaLista = new Promise((listo) => {
      this.relojes.push(setTimeout(listo, APERTURA_MS + 90));
    });

    const extra = {
      expediente: libro.id,
      titulo: libro.title,
      area: libro.subtitle || libro.author || '',
      color: libro.spineBg
    };

    if (window.Taller && window.Taller.dentroDelDeck) {
      window.Taller.ir('caso', extra);
    } else {
      // Suelta, sin deck alrededor: la carpeta se abre y luego navega
      this.aperturaLista.then(() => { window.location.href = '../slide 3/index.html'; });
    }
  }

  /* Al volver del caso el estante tiene que estar entero otra vez. */
  cerrarExpediente() {
    this.relojes.forEach(clearTimeout);
    this.relojes = [];
    this.abriendo = false;
    this.aperturaLista = null;
    this.zoomObjetivo = 1;
    this.zoom = 1;

    if (this.expediente) {
      this.expediente.classList.remove('abierto');
      [this.expCaja, this.expTapa, this.expHoja,
       this.expTapa.querySelector('.tapa-texto'),
       this.expHoja.querySelector('.hoja-texto')].forEach((el) => {
        if (el) el.getAnimations().forEach((a) => a.cancel());
      });
    }
    document.documentElement.classList.remove('abriendo');
    this.domSlots.forEach((f) => f.slotEl.classList.remove('se-abre'));
  }

  startRenderLoop() {
    const render = () => {
      if (!this.isDragging) {
        this.currentProgress += (this.targetProgress - this.currentProgress) * 0.085;
      }
      this.zoom += (this.zoomObjetivo - this.zoom) * 0.055;
      this.update3DLayout();
      requestAnimationFrame(render);
    };
    requestAnimationFrame(render);
  }

  update3DLayout() {
    const baseGap = 8;
    let accX = 0;
    const computed = [];

    this.domSlots.forEach((slot, idx) => {
      const book = slot.book;
      const absDist = Math.abs(idx - this.currentProgress);
      const quirk = this.quirks[idx];

      if (slot.isFeatured) {
        const openness = Math.max(0, Math.min(1, 1 - absDist));
        const rotY = 90 * (1 - openness);

        const rad = (rotY * Math.PI) / 180;
        const projW = book.coverWidth * Math.cos(rad) + book.spineWidth * Math.sin(rad);

        computed.push({ width: Math.max(book.spineWidth, projW), rotY, openness, isFeatured: true, quirk });
      } else {
        computed.push({ width: book.spineWidth, rotY: 0, openness: 0, isFeatured: false, quirk });
      }
    });

    const centers = [];
    computed.forEach((pos, idx) => {
      centers.push(accX + pos.width / 2);
      // Use base gap + per-book extra random gap for organic spacing
      accX += pos.width + baseGap + pos.quirk.extraGap;
    });

    const fi = Math.floor(this.currentProgress);
    const ci = Math.min(this.numBooks - 1, fi + 1);
    const frac = this.currentProgress - fi;
    const focalX = centers[fi] + ((centers[ci] || centers[fi]) - centers[fi]) * frac;

    const centrado = Math.round(this.currentProgress);

    this.domSlots.forEach((slot, idx) => {
      const pos = computed[idx];
      const quirk = pos.quirk;
      slot.slotEl.style.width = `${pos.width}px`;
      // El expediente centrado es el único que se puede abrir: que se note
      slot.slotEl.classList.toggle('es-actual', idx === centrado);

      // Apply organic vertical offset and tilt to the slot itself
      const baseTilt = slot.book.tilt || 0;
      // When the folder is opening (featured & close to center), reduce disorder
      const disorderFade = pos.isFeatured ? (1 - pos.openness) : 1;
      const tiltDeg = baseTilt * disorderFade;
      const vShift = quirk.vertShift * disorderFade;

      // Calculate how much the top of the book displaces horizontally due to tilt
      // displacement = height * sin(tilt). Add margin on the side the book leans toward.
      const tiltRad = (Math.abs(tiltDeg) * Math.PI) / 180;
      const topDisplacement = slot.book.height * Math.sin(tiltRad);
      
      // Positive tilt = leans right → need margin-right
      // Negative tilt = leans left → need margin-left
      const mLeft = tiltDeg < 0 ? topDisplacement : 0;
      const mRight = tiltDeg > 0 ? topDisplacement : quirk.extraGap;

      slot.slotEl.style.transform = `translateY(${-vShift}px) rotate(${tiltDeg}deg)`;
      slot.slotEl.style.marginLeft = `${mLeft}px`;
      slot.slotEl.style.marginRight = `${mRight + quirk.extraGap}px`;

      if (slot.isFeatured && slot.meshEl) {
        const liftY = -pos.openness * 6;
        const liftZ = pos.openness * 10;
        slot.meshEl.style.transform = `translateY(${liftY}px) translateZ(${liftZ}px) rotateY(${pos.rotY}deg)`;

        if (slot.shadingEl) {
          slot.shadingEl.style.opacity = `${(pos.rotY / 90) * 0.35}`;
        }
      }
    });

    const ri = Math.round(this.currentProgress);
    this.pageNums.forEach(btn => {
      const t = parseInt(btn.dataset.idx, 10);
      btn.classList.toggle('active', Math.abs(t - ri) <= 1);
    });

    this.shelfTrack.style.transform = `translateX(${-focalX}px) scale(${this.zoom.toFixed(4)})`;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.estante = new BookshelfManager();
});
