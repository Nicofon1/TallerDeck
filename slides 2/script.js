/* ==========================================================================
   LA INVESTIGACIÓN — el estante de los cinco frentes

   Cada frente es una carpeta. En el estante se lee por el lomo; al llegar al
   centro gira y enseña la portada; al abrirse, la tapa rota sobre el lomo y
   deja ver la hoja de dentro, que es donde vive lo que se cuenta.

   Dos maneras de recorrerlo, a propósito:
     · rueda, arrastre y los botones → mirar el estante libremente
     · las flechas                   → abrir los cinco frentes en orden
   Pasado el quinto, la lámina se retira y queda la frase que lo resume.
   ========================================================================== */

const FRENTES = [
  {
    id: 'voz', num: '01',
    titulo: 'Voz estudiantil',
    /* El titular de la portada se parte a mano: dejar que caiga solo abría
       viudas feas en una caja tan estrecha. */
    portada: 'Voz<br>estudiantil',
    resumen: 'Encuestas amplias y entrevistas a profundidad.',
    /* Dos imágenes del trabajo de campo. `pos` mueve el encuadre cuando el
       recorte se comería lo que importa; `entera` es para los diagramas, que
       no se recortan. */
    laminas: [
      { src: 'assets/frentes/voz-a.jpg',
        alt: 'Estudiantes de medicina reunidos en una mesa del campus' },
      { src: 'assets/frentes/voz-b.jpg',
        alt: 'Dos estudiantes frente a la pantalla del simulador' }
    ],
    spineBg: '#251D4E', textColor: '#C8DEFE', tabColor: '#82CACA',
    spineWidth: 44, coverWidth: 268, height: 318, tilt: -0.9
  },
  {
    id: 'observacion', num: '02',
    titulo: 'Observación directa',
    portada: 'Observación<br>directa',
    resumen: 'Análisis y dinámicas en la clínica, vistas en observaciones de campo.',
    laminas: [
      { src: 'assets/frentes/observacion-a.jpg', pos: '50% 42%',
        alt: 'La consola del docente tras el vidrio, durante una sesión' },
      { src: 'assets/frentes/observacion-b.jpg', pos: '50% 46%',
        alt: 'Sala de simulación con el simulador en la camilla' }
    ],
    spineBg: '#426DC2', textColor: '#F9FAFB', tabColor: '#C8DEFE',
    spineWidth: 40, coverWidth: 262, height: 300, tilt: 0.6
  },
  {
    id: 'referentes', num: '03',
    titulo: 'Referentes del mundo',
    portada: 'Referentes<br>del mundo',
    resumen: 'Los simuladores y tecnologías que hoy se usan alrededor del mundo.',
    laminas: [
      { src: 'assets/frentes/referentes-a.jpg',
        alt: 'Un simulador clínico comercial, en escritorio, tableta y móvil' },
      { src: 'assets/frentes/referentes-b.jpg', pos: '50% 44%',
        alt: 'Pantalla de un simulador comercial con el panel de monitorización' }
    ],
    spineBg: '#1A1A1A', textColor: '#82CACA', tabColor: '#82CACA',
    spineWidth: 50, coverWidth: 278, height: 332, tilt: 0
  },
  {
    id: 'literatura', num: '04',
    titulo: 'Literatura científica',
    portada: 'Literatura<br>científica',
    resumen: 'Estudio de las academias nacionales y pares de medicina.',
    laminas: [
      { src: 'assets/frentes/literatura-a.png', entera: true,
        alt: 'Diagrama del proceso diagnóstico, National Academies, 2015' },
      { src: 'assets/frentes/literatura-b.png', entera: true,
        alt: 'Diagrama del razonamiento clínico entre terapeuta y paciente' }
    ],
    spineBg: '#82CACA', textColor: '#251D4E', tabColor: '#426DC2',
    spineWidth: 38, coverWidth: 258, height: 306, tilt: -1.1
  },
  {
    id: 'normativo', num: '05',
    titulo: 'Marco normativo',
    portada: 'Marco<br>normativo',
    resumen: 'Estándares colombianos y globales de norma y clínica.',
    laminas: [
      { src: 'assets/frentes/normativo-a.png', pos: '50% 30%',
        alt: 'Resolución 5596 de 2015 del Ministerio de Salud' },
      { src: 'assets/frentes/normativo-b.png', pos: '50% 34%',
        alt: 'Resolución 839 de 2017 del Ministerio de Salud' }
    ],
    spineBg: '#C8DEFE', textColor: '#251D4E', tabColor: '#251D4E',
    spineWidth: 46, coverWidth: 270, height: 322, tilt: 0.8
  }
];

/* La apertura del expediente. El texto de la tapa y el de la hoja viven en
   bloques de medidas fijas que solo se escalan, para que crecer no los
   deforme; estas son esas medidas. */
/* Una curva expo se come el 93% del recorrido en el primer tercio: la tapa
   se abriria antes de que a nadie le diera tiempo a verla. Esta arranca
   despacio, coge cuerpo en medio y frena al final, que es como se abre una
   carpeta de verdad. */
const APERTURA_MS = 880;
const APERTURA_EASE = 'cubic-bezier(0.42, 0.02, 0.2, 1)';
/* Cerrar es mas corto: nadie mira como se guarda una carpeta, y con cinco
   frentes seguidos cada milisegundo de mas se nota. */
const CIERRE_MS = 340;
const CIERRE_EASE = 'cubic-bezier(0.5, 0, 0.75, 0.95)';
/* El tramo del medio: el estante caminando de un frente al siguiente. Va con
   reloj propio y no con el acercamiento del bucle, porque el bucle nunca
   termina de llegar —siempre le falta un pelo— y esa cola es justo lo que
   hacia que la apertura empezara con un salto. */
const VIAJE_MS = 420;
const TAPA_W = 300, TAPA_H = 420;
const HOJA_W = 900, HOJA_H = 560;

class EstanteInvestigacion {
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

    this.books = FRENTES;
    this.numBooks = this.books.length;

    this.currentProgress = 0;
    this.targetProgress = 0;

    this.isDragging = false;
    this.startX = 0;
    this.dragStartProgress = 0;
    this.velocity = 0;
    this.lastX = 0;
    this.lastTime = 0;

    /* El recorrido. `abierto` es el frente desplegado ahora mismo, o -1 si
       solo se esta mirando el estante; `ocupado` tapa las flechas mientras
       una carpeta se abre o se cierra, que si no se pisan las animaciones. */
    this.abierto = -1;
    this.hueco = null;
    this.ocupado = false;
    this.enCierre = false;
    this.relojes = [];
    this.arrastro = 0;     // cuanto se movio el puntero: un clic no arrastra
    /* Mientras el estante viaja con reloj propio, el bucle no le toca la
       posicion: si no, se estarian disputando el mismo numero. */
    this.viajando = false;

    this.domSlots = [];

    // Pre-compute random organic quirks per slot (stable across frames)
    // Subtle: extraGap 0-4px, vertShift 0-3px — enough to break linearity without overlapping
    this.quirks = this.books.map((b, i) => {
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
    this.montarLaminas();
    this.bindEvents();
    this.startRenderLoop();
  }

  /* Los cinco pares de imágenes, montados de una vez al arrancar. Abrir un
     frente solo cambia cuál de los cinco se enseña: si se crearan al vuelo,
     la primera vez de cada uno el navegador tendría que ir a buscar la
     imagen justo en mitad de la apertura, que es cuando peor sienta. */
  montarLaminas() {
    const caja = document.getElementById('hojaLaminas');
    if (!caja) return;
    this.laminas = this.books.map((frente) => {
      const par = document.createElement('div');
      par.className = 'par';
      par.hidden = true;
      (frente.laminas || []).forEach((lam) => {
        const marco = document.createElement('figure');
        if (lam.entera) marco.classList.add('entera');
        const img = document.createElement('img');
        img.src = lam.src;
        img.alt = lam.alt || '';
        /* Descodificar a mano y no esperar a que se enseñe: un `img` oculto
           no se descodifica hasta que hace falta, y hacer falta le llega en
           mitad de la apertura, con el primer cuadro en blanco. */
        if (img.decode) img.decode().catch(function(){});
        if (lam.pos) img.style.setProperty('--pos', lam.pos);
        marco.appendChild(img);
        par.appendChild(marco);
      });
      caja.appendChild(par);
      return par;
    });
  }

  /* ---------- el estante ---------- */

  portadaDe(frente) {
    return '' +
      '<div class="cover-folder" style="background:#F9FAFB;color:#251D4E;">' +
        '<div class="folder-tab" style="background:' + frente.tabColor + ';"></div>' +
        '<div class="folder-dept">Frente ' + frente.num + ' / 05</div>' +
        '<div class="folder-main-title">' + frente.portada + '</div>' +
        '<div class="folder-meta">' + frente.resumen + '</div>' +
      '</div>';
  }

  renderShelf() {
    this.shelfTrack.innerHTML = '';
    this.domSlots = [];

    this.books.forEach((book, index) => {
      const slotEl = document.createElement('div');
      slotEl.className = 'book-slot';
      slotEl.dataset.index = index;
      slotEl.style.height = book.height + 'px';

      /* Los cinco son carpetas de verdad: lomo, portada y canto. Ninguno es
         solo un lomo pintado, porque los cinco se abren. */
      slotEl.innerHTML =
        '<div class="book-3d-mesh" style="width:' + book.coverWidth + 'px;">' +
          '<div class="mesh-face-front" style="transform:translateZ(' + book.spineWidth + 'px);">' +
            this.portadaDe(book) +
            '<div class="mesh-shading-layer"></div>' +
          '</div>' +
          '<div class="mesh-face-spine" style="width:' + book.spineWidth + 'px; background:' + book.spineBg + '; color:' + book.textColor + ';">' +
            '<div class="spine-text-rot">' + book.titulo + '</div>' +
          '</div>' +
          '<div class="mesh-face-pages" style="width:' + book.spineWidth + 'px; transform:translateX(' + book.coverWidth + 'px) rotateY(90deg);"></div>' +
        '</div>';

      this.shelfTrack.appendChild(slotEl);

      this.domSlots.push({
        slotEl,
        meshEl: slotEl.querySelector('.book-3d-mesh'),
        shadingEl: slotEl.querySelector('.mesh-shading-layer'),
        book
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
      if (this.ocupado || this.enCierre) return;
      if (this.abierto !== -1) { this.cerrar(); return; }
      const i = this.libroEn(ev.clientX, ev.clientY);
      if (i !== -1) this.abrir(i);
    });

    this.prevBtn.addEventListener('click', () => {
      if (!this.libre()) return;
      this.targetProgress = Math.max(0, this.targetProgress - 1);
    });
    this.nextBtn.addEventListener('click', () => {
      if (!this.libre()) return;
      this.targetProgress = Math.min(this.numBooks - 1, this.targetProgress + 1);
    });

    this.pageNums.forEach((btn) => {
      btn.addEventListener('click', () => {
        if (this.ocupado || this.enCierre) return;
        const i = parseInt(btn.dataset.idx, 10);
        if (this.abierto !== -1) this.enOrden(i);
        else this.targetProgress = i;
      });
    });

    /* Las flechas son el recorrido: abren los cinco frentes en orden y al
       final entregan la frase. Lo demas —rueda, arrastre, botones— sigue
       siendo mirar el estante a mano. */
    window.addEventListener('keydown', (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const k = e.key;
      if (k === 'ArrowRight' || k === 'ArrowDown' || k === ' ' || k === 'PageDown' || k === 'Enter') {
        this.avanzar(); e.preventDefault();
      } else if (k === 'ArrowLeft' || k === 'ArrowUp' || k === 'PageUp') {
        this.retroceder(); e.preventDefault();
      }
    });

    this.shelfViewport.addEventListener('wheel', (e) => {
      e.preventDefault();
      if (this.ocupado || this.enCierre) return;
      /* Girar la rueda con una carpeta abierta es pedir volver al estante. */
      if (this.abierto !== -1) { this.cerrar(); return; }
      // Smooth calibrated wheel delta (no more instant jumping)
      const rawDelta = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
      const delta = rawDelta * 0.0018;
      this.targetProgress = Math.max(0, Math.min(this.numBooks - 1, this.targetProgress + delta));
    }, { passive: false });

    /* El estante se recorre arrastrando, así que sobre él el dedo es suyo:
       deslizar mueve las carpetas, no pasa de frente. En cuanto una se abre
       deja de arrastrar y el gesto vuelve a valer lo que vale en el resto de
       la lámina —la flecha—, que es justo lo que se quiere con una carpeta
       delante: seguir al frente siguiente. */
    if (window.Gestos) {
      window.Gestos.mio((e) =>
        this.abierto === -1 && !this.ocupado && !this.enCierre &&
        this.shelfViewport.contains(e.target));
    }

    this.shelfViewport.addEventListener('pointerdown', (e) => {
      if (this.ocupado || this.enCierre || this.abierto !== -1) return;
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

  libre() { return !this.ocupado && !this.enCierre && this.abierto === -1; }

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

  /* ---------- el recorrido con las flechas ---------- */

  avanzar() {
    if (this.ocupado) return;
    if (this.enCierre) { this.alIndice(); return; }
    if (this.abierto === this.numBooks - 1) { this.alCierre(); return; }
    /* Sin nada abierto, la primera flecha abre el que este centrado: si se
       ha estado hurgando el estante a mano, sigue por donde se dejo. */
    const siguiente = this.abierto === -1
      ? Math.max(0, Math.min(this.numBooks - 1, Math.round(this.currentProgress)))
      : this.abierto + 1;
    this.enOrden(siguiente);
  }

  retroceder() {
    if (this.ocupado) return;
    if (this.enCierre) { this.salirDelCierre(); return; }
    if (this.abierto > 0) { this.enOrden(this.abierto - 1); return; }
    if (this.abierto === 0) { this.cerrar(); return; }
    this.targetProgress = Math.max(0, this.targetProgress - 1);
  }

  /* Un paso entre frentes es UN movimiento, no un cierre y una apertura
     sueltas que se pisan. Tres tramos que no se solapan nunca:

       recoger   la carpeta vuelve a su libro y el estante reaparece
       viajar    el estante camina hasta el frente siguiente
       desplegar la carpeta nueva se abre

     Lo que sí se solapa —a propósito— es cada tramo con el desvanecido del
     estante, porque van en el mismo sentido: la carpeta encoge mientras el
     estante aparece, y crece mientras el estante se va. */
  enOrden(i) {
    if (this.ocupado || i === this.abierto) return Promise.resolve();
    if (i < 0 || i >= this.numBooks) return Promise.resolve();
    this.ocupado = true;
    return this.recoger()
      .then(() => this.viajar(i))
      .then(() => this.desplegar(i))
      .then(() => this.espera(APERTURA_MS + 40))
      .then(() => { this.ocupado = false; });
  }

  /* Al cierre no se devuelve nada al estante: la carpeta y la lámina entera
     se van juntas y en su sitio queda la frase. Traer el estante de vuelta
     medio segundo para volver a echarlo era justo el parpadeo que sobraba. */
  alCierre() {
    if (this.ocupado) return;
    this.ocupado = true;
    this.enCierre = true;
    document.documentElement.classList.add('cierre');
    this.espera(620).then(() => {
      this.pararAnimaciones();
      this.expediente.classList.remove('abierto');
      this.domSlots.forEach((f) => f.slotEl.classList.remove('se-abre'));
      document.documentElement.classList.remove('abriendo');
      this.abierto = -1;
      this.hueco = null;
      this.ocupado = false;
    });
  }

  salirDelCierre() {
    if (this.ocupado) return;
    this.ocupado = true;
    this.enCierre = false;
    document.documentElement.classList.remove('cierre');
    this.viajar(this.numBooks - 1)
      .then(() => this.desplegar(this.numBooks - 1))
      .then(() => this.espera(APERTURA_MS + 40))
      .then(() => { this.ocupado = false; });
  }

  alIndice() {
    if (window.Taller) window.Taller.terminar();
    else window.location.href = 'page3.html';
  }

  /* ---------- abrir y cerrar un expediente ---------- */

  espera(ms) {
    return new Promise((listo) => { this.relojes.push(setTimeout(listo, ms)); });
  }

  /* Un clic basta. Si el expediente no estaba de frente primero viaja al
     centro: abrirlo de perfil no se entendería. */
  abrir(index) {
    return this.enOrden(index);
  }

  cerrar() {
    if (this.ocupado || this.abierto === -1) return Promise.resolve();
    this.ocupado = true;
    return this.recoger().then(() => { this.ocupado = false; });
  }

  /* El estante camina hasta un frente con reloj propio y aterriza clavado.
     El acercamiento del bucle nunca acaba de llegar, y ese resto era lo que
     obligaba a cuadrar el número de golpe justo antes de abrir: un salto de
     un tercio de libro en el peor cuadro posible. */
  viajar(i) {
    const desde = this.currentProgress;
    this.targetProgress = i;
    if (Math.abs(i - desde) < 0.002) return Promise.resolve();

    const t0 = performance.now();
    this.viajando = true;

    return new Promise((listo) => {
      const acabar = () => {
        if (!this.viajando) return;
        this.viajando = false;
        this.currentProgress = i;
        this.update3DLayout();
        listo();
      };
      /* Si el navegador congela los cuadros —una pestaña de fondo lo hace—
         el viaje se cierra igual por reloj y el recorrido no se queda colgado. */
      this.relojes.push(setTimeout(acabar, VIAJE_MS + 400));

      const paso = () => {
        if (!this.viajando) return;
        const k = Math.min(1, (performance.now() - t0) / VIAJE_MS);
        // easeInOutCubic: sale y entra sin tirón, que es como se recorre un estante
        const e = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
        this.currentProgress = desde + (i - desde) * e;
        if (k < 1) requestAnimationFrame(paso); else acabar();
      };
      requestAnimationFrame(paso);
    });
  }

  /* La caja que ocupa el expediente en pantalla ahora mismo. */
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
    const frente = ficha.book;

    /* La tapa es la portada que ya estaba en el estante, tal cual. */
    const bloque = this.expTapa.querySelector('.tapa-texto');
    const original = ficha.slotEl.querySelector('.cover-folder');
    bloque.innerHTML = '';
    const clon = original.cloneNode(true);
    this.expTapa.style.background = '#F9FAFB';
    clon.style.backgroundColor = 'transparent';
    bloque.appendChild(clon);

    /* Y la hoja de dentro es lo que se cuenta de ese frente. Nada mas: la
       lamina es apoyo, el resto lo pone quien habla. */
    document.getElementById('hojaTitulo').textContent = frente.titulo;
    document.getElementById('hojaCuerpo').textContent = frente.resumen;
    if (this.laminas) {
      const cual = this.books.indexOf(frente);
      this.laminas.forEach((par, i) => { par.hidden = (i !== cual); });
    }
    this.expHoja.querySelector('.hoja-regla').style.background = frente.tabColor;
  }

  desplegar(index) {
    const ficha = this.domSlots[index];
    if (!ficha) return;
    const desde = this.cajaDe(ficha);
    const hasta = this.cajaFinal();

    this.pintarExpediente(ficha);
    const p0 = this.pose(desde);
    this.expCaja.style.transform = p0.transform;
    this.expCaja.style.width = p0.width;
    this.expCaja.style.height = p0.height;
    this.expediente.classList.add('abierto');

    ficha.slotEl.classList.add('se-abre');
    document.documentElement.classList.add('abriendo');
    this.abierto = index;
    this.hueco = desde;   // adonde tendrá que volver, medido una sola vez

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
  }

  /* El camino de vuelta: la tapa se cierra y la carpeta se encoge hasta su
     sitio en el estante, que ya esta reapareciendo por debajo. Mide primero
     y toca el estante despues: el hueco al que vuelve tiene que ser el mismo
     durante todo el trayecto. */
  recoger() {
    if (this.abierto === -1) return Promise.resolve();
    const ficha = this.domSlots[this.abierto];
    const hasta = this.hueco || this.cajaDe(ficha);   // su hueco en el estante
    const desde = this.cajaFinal();                   // donde esta abierta ahora

    document.documentElement.classList.remove('abriendo');

    const t = { duration: CIERRE_MS, easing: CIERRE_EASE, fill: 'both' };

    this.expCaja.animate([this.pose(desde), this.pose(hasta)], t);
    this.expTapa.animate([
      { transform: 'rotateY(-162deg)' },
      { transform: 'rotateY(0deg)' }
    ], t);
    this.expTapa.querySelector('.tapa-texto').animate([
      { transform: this.contener(desde, TAPA_W, TAPA_H) },
      { transform: this.contener(hasta, TAPA_W, TAPA_H) }
    ], t);
    this.expHoja.querySelector('.hoja-texto').animate([
      { transform: this.contener(desde, HOJA_W, HOJA_H), opacity: 1 },
      { transform: this.contener(hasta, HOJA_W, HOJA_H), opacity: 0 }
    ], t);

    return this.espera(CIERRE_MS).then(() => {
      this.expediente.classList.remove('abierto');
      ficha.slotEl.classList.remove('se-abre');
      this.pararAnimaciones();
      this.abierto = -1;
      this.hueco = null;
    });
  }

  pararAnimaciones() {
    [this.expCaja, this.expTapa, this.expHoja,
     this.expTapa.querySelector('.tapa-texto'),
     this.expHoja.querySelector('.hoja-texto')].forEach((el) => {
      if (el) el.getAnimations().forEach((a) => a.cancel());
    });
  }

  /* Al volver de otra sección la lámina tiene que estar entera otra vez. */
  cerrarExpediente() {
    this.relojes.forEach(clearTimeout);
    this.relojes = [];
    this.ocupado = false;
    this.abierto = -1;
    this.hueco = null;
    this.enCierre = false;
    this.viajando = false;
    this.targetProgress = 0;
    this.currentProgress = 0;

    if (this.expediente) {
      this.expediente.classList.remove('abierto');
      this.pararAnimaciones();
    }
    document.documentElement.classList.remove('abriendo', 'cierre');
    this.domSlots.forEach((f) => f.slotEl.classList.remove('se-abre'));
  }

  /* ---------- el bucle ---------- */

  startRenderLoop() {
    const render = () => {
      if (!this.isDragging && !this.viajando) {
        this.currentProgress += (this.targetProgress - this.currentProgress) * 0.085;
      }
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

      const openness = Math.max(0, Math.min(1, 1 - absDist));
      const rotY = 90 * (1 - openness);

      const rad = (rotY * Math.PI) / 180;
      const projW = book.coverWidth * Math.cos(rad) + book.spineWidth * Math.sin(rad);

      computed.push({ width: Math.max(book.spineWidth, projW), rotY, openness, quirk });
    });

    const centers = [];
    computed.forEach((pos) => {
      centers.push(accX + pos.width / 2);
      // Use base gap + per-book extra random gap for organic spacing
      accX += pos.width + baseGap + pos.quirk.extraGap;
    });

    const fi = Math.max(0, Math.floor(this.currentProgress));
    const ci = Math.min(this.numBooks - 1, fi + 1);
    const frac = this.currentProgress - fi;
    const focalX = centers[fi] + ((centers[ci] || centers[fi]) - centers[fi]) * frac;

    const centrado = Math.round(this.currentProgress);

    this.domSlots.forEach((slot, idx) => {
      const pos = computed[idx];
      const quirk = pos.quirk;
      slot.slotEl.style.width = pos.width + 'px';
      // El expediente centrado es el único que se puede abrir: que se note
      slot.slotEl.classList.toggle('es-actual', idx === centrado);

      // Apply organic vertical offset and tilt to the slot itself
      // When the folder is opening (close to center), reduce disorder
      const disorderFade = 1 - pos.openness;
      const tiltDeg = (slot.book.tilt || 0) * disorderFade;
      const vShift = quirk.vertShift * disorderFade;

      // Calculate how much the top of the book displaces horizontally due to tilt
      // displacement = height * sin(tilt). Add margin on the side the book leans toward.
      const tiltRad = (Math.abs(tiltDeg) * Math.PI) / 180;
      const topDisplacement = slot.book.height * Math.sin(tiltRad);

      // Positive tilt = leans right → need margin-right
      // Negative tilt = leans left → need margin-left
      const mLeft = tiltDeg < 0 ? topDisplacement : 0;
      const mRight = tiltDeg > 0 ? topDisplacement : quirk.extraGap;

      slot.slotEl.style.transform = 'translateY(' + (-vShift) + 'px) rotate(' + tiltDeg + 'deg)';
      slot.slotEl.style.marginLeft = mLeft + 'px';
      slot.slotEl.style.marginRight = (mRight + quirk.extraGap) + 'px';

      if (slot.meshEl) {
        const liftY = -pos.openness * 6;
        const liftZ = pos.openness * 10;
        slot.meshEl.style.transform =
          'translateY(' + liftY + 'px) translateZ(' + liftZ + 'px) rotateY(' + pos.rotY + 'deg)';

        if (slot.shadingEl) {
          slot.shadingEl.style.opacity = String((pos.rotY / 90) * 0.35);
        }
      }
    });

    const ri = Math.round(this.currentProgress);
    this.pageNums.forEach((btn) => {
      const t = parseInt(btn.dataset.idx, 10);
      btn.classList.toggle('active', t === ri);
      /* Los frentes ya recorridos se quedan marcados: con cinco carpetas y
         una charla encima, saber por dónde se va vale más que la simetría. */
      btn.classList.toggle('visto', this.abierto !== -1 && t < this.abierto);
    });

    this.shelfTrack.style.transform = 'translateX(' + (-focalX) + 'px)';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.estante = new EstanteInvestigacion();
});
