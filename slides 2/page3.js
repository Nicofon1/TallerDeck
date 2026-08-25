/* ==========================================================================
   Índice del taller (page3.js)
   Motor cíclico FLIP / shared-layout — el mismo de los retratos

   Donde había fotos de gente hay páginas: las secciones que siguen después
   del corazón, cargadas y corriendo dentro de su marco. La coreografía es
   la del carrusel original, pieza por pieza:

     · La tira es una cola que fluye hacia la derecha, hacia el marco. La
       ranura de la izquierda es la más lejana; la de la derecha es la que
       sube ahora y está pegada al banner.
     · Al avanzar se rehace la tira ya en su orden final, se la sujeta una
       ranura a la izquierda y se la deja caminar hasta su sitio: toda la
       cola da un paso a la derecha de una vez.
     · La que sube vuela de la caja de su ficha a la del marco.
     · La que deja el marco no baja a la tira: se encoge un poco, cae y se
       apaga donde estaba. Reaparece después, ya colocada al final de la
       cola, entrando por la izquierda.

   Con una diferencia obligada respecto al original: allí la misma foto podía
   estar en tres sitios a la vez —banner, fantasma y miniatura—. Aquí cada
   sección es un iframe vivo y no hay copias: moverlo de sitio en el DOM lo
   recargaría. Así que el elemento que vuela ES la miniatura, y es también el
   marco. Por eso todo el movimiento ocurre sobre una capa suelta.
   ========================================================================== */

const seccionesData = [
  {
    deck: 'contexto',
    src: '../presentacion/contexto.html',
    nombre: 'La clínica de simulación',
    area: 'Contexto',
    texto: 'Uno de los lugares más importantes en la formación de los estudiantes, porque es donde se pueden equivocar con los simuladores de alta fidelidad sin afectar una vida humana.'
  },
  {
    deck: 'problema',
    src: '../presentacion/problema.html',
    nombre: 'El problema',
    area: 'Tres nodos en ciclo',
    texto: 'Inseguridad, método que no se internaliza y feedback que no deja rastro. Los tres se refuerzan uno al otro; el grafo lo muestra encendiendo sus hilos.'
  },
  {
    deck: 'investigacion',
    src: '../presentacion/investigacion.html',
    nombre: 'La investigación',
    area: 'Cinco frentes',
    texto: 'Voz estudiantil, observación directa, referentes del mundo, literatura revisada por pares y marco normativo. La tira de evidencias se arrastra a lo ancho.'
  },
  {
    deck: 'journey',
    src: '../presentacion/journey.html',
    nombre: 'Journey',
    area: 'Los cinco pasos',
    texto: 'La simulación de Camilo en órbita: inicio y modo, anamnesis libre, procedimientos, diagnóstico con justificación y el feedback que queda guardado.'
  },
  {
    deck: 'timeline',
    src: '../presentacion/timeline.html',
    nombre: 'Timeline',
    area: 'Hasta el 11 de noviembre',
    texto: 'Prototipo, pruebas de usuario, pre entrega y entrega. Cada tramo ocupa a lo ancho lo que dura, y al pie queda el cierre del guion.'
  },
  {
    deck: 'burbujas',
    src: '../Slides/corazon-burbujas.html',
    nombre: 'Anatomía de burbujas',
    area: 'Modelo interactivo',
    texto: 'El corazón otra vez, pero en tus manos: densidad, tamaño, opacidad y paleta. Las esferas se apartan del puntero, empujan a las vecinas y vuelven a su sitio.'
  },
  {
    deck: 'cinetica',
    src: 'page2.html',
    nombre: 'Tipografía cinética',
    area: 'Concepto',
    texto: 'Palabras en órbita sobre un eje tridimensional. Se arrastra para girarlas o se salta directo a cualquiera de ellas.'
  },
  {
    deck: 'biblioteca',
    src: 'index.html',
    nombre: 'Archivo de casos',
    area: 'Estantería',
    texto: 'La estantería de expedientes. Cada carpeta se centra al primer clic y abre su historia clínica al segundo.'
  },
  {
    deck: 'caso',
    src: '../slide 3/index.html',
    nombre: 'Historia clínica',
    area: 'Caso PEDS-302',
    texto: 'La ficha completa de urgencias: radiografía de tórax, electrocardiograma de doce derivaciones, constantes en vivo y el protocolo PALS aplicado.'
  }
];

/* Tamaño con el que se renderiza cada página antes de recortarla. Fijo a
   propósito: si dependiera del marco, cada sección se maquetaría distinto
   según el tamaño de la ventana del que mira. */
const DISENO_W = 1440;
const DISENO_H = 900;

/* Las páginas 3D son caras de arrancar: se montan de a una para que abrir
   el índice no dispare todos los motores en el mismo fotograma. */
const ESPERA_MONTAJE = 420;

/* Geometría compartida con page3.css (ficha + hueco). En un solo sitio para
   que el paso de la tira valga exactamente una ranura. */
const FICHA_W = 76;
const FICHA_GAP = 16;
const PASO = FICHA_W + FICHA_GAP;   // 92

const RANURAS = 3;
const MORPH_MS = 750;
const MORPH_EASE = 'cubic-bezier(0.19, 1, 0.22, 1)';
/* La que se va no necesita los 750: para cuando la otra llega, ya no está */
const APAGADO_MS = 460;
const APAGADO_EASE = 'cubic-bezier(0.4, 0, 0.9, 0.4)';
const TEXTO_MS = 280;
const AUTOPLAY_MS = 4500;
const RING = 2 * Math.PI * 23;      // r=23 en el SVG

class IndiceDeSecciones {
  constructor() {
    this.secciones = seccionesData;
    this.total = this.secciones.length;
    this.actual = 0;
    this.animando = false;
    this.ranuras = [];
    this.morfos = [];
    this.relojes = [];

    this.digitWheel = document.getElementById('digitWheel');
    this.totalNum = document.getElementById('totalNum');
    this.thumbnailsTrack = document.getElementById('thumbnailsTrack');
    this.heroContainer = document.getElementById('heroBannerContainer');
    this.capa = document.getElementById('capaPrevias');
    this.quoteContent = document.getElementById('quoteContent');
    this.nombreEl = document.getElementById('reviewerName');
    this.areaEl = document.getElementById('reviewerCompany');
    this.textoEl = document.getElementById('reviewerQuote');
    this.nextBtn = document.getElementById('nextBtn');
    this.ringProgress = document.getElementById('ringProgress');
    this.autoPlayToggle = document.getElementById('autoPlayToggle');
    this.autoPlayLabel = document.getElementById('autoPlayLabel');
    this.ingresarBtn = document.getElementById('ingresar');
    this.entrarMarco = document.getElementById('entrarMarco');
    this.entrarMarcoTexto = document.getElementById('entrarMarcoTexto');

    /* El indice no pasa solo: se queda donde lo dejen. El interruptor sigue
       ahi por si alguien quiere que corra, pero arranca quieto. */
    this.isPlaying = false;
    this.progressStart = 0;
    this.animFrameId = null;
    this.vigilando = false;
    this.finVigilia = 0;

    this.init();
  }

  init() {
    this.buildWheel();
    this.construirPrevias();
    this.pintarTira(this.indicesDeTira(this.actual));
    this.aplicarSeccion(this.secciones[this.actual]);
    this.asentar();
    this.bindEvents();
    this.updateWheel();
    this.montarPorTurnos();
    this.startAutoplayLoop();
    this.pausar();          // el interruptor tiene que decir lo que hace

    this.vigilarMaqueta();
  }

  /* La primera colocacion se hace sobre una maqueta que todavia se esta
     haciendo: faltan las tipografias, faltan los iframes, y la tira —que es
     lo ultimo de una columna repartida— se mueve entera en cuanto un rotulo
     gana o pierde una linea. Por eso no basta con colocar una vez: hay que
     mirar. Antes esto se arreglaba solo al primer giro, que era la siguiente
     vez que alguien llamaba a asentar. */
  vigilarMaqueta() {
    const revisar = () => { if (!this.animando) this.asentar(); };

    if (document.fonts && document.fonts.ready) document.fonts.ready.then(revisar);

    if (window.ResizeObserver) {
      const ojo = new ResizeObserver(revisar);
      ojo.observe(this.heroContainer);
      ojo.observe(this.thumbnailsTrack);
      // La columna entera: si crece o mengua, la tira cambia de sitio
      if (this.thumbnailsTrack.parentElement) ojo.observe(this.thumbnailsTrack.parentElement);
      this.ojoMaqueta = ojo;
    }

    /* Y un par de repasos por reloj, para lo que ningun observador ve: una
       imagen de fondo que llega tarde, un scrollbar que aparece. */
    [180, 700, 1600].forEach((ms) => setTimeout(revisar, ms));

    /* Y por encima de todo eso, los primeros segundos se comprueba en cada
       cuadro que cada previa siga clavada sobre su caja. Los observadores
       cubren lo que saben mirar; esto cubre lo que no se me ocurrio. */
    this.vigilarUnRato(2600);
  }

  /* Comprueba en cada cuadro, durante un rato, que nada se haya descolocado.

     Hace falta sobre todo al ENTRAR desde otra seccion: la lamina llega con
     una animacion que empuja las columnas 38px hacia abajo, y una caja medida
     a mitad de ese empujon devuelve su sitio de paso, no el definitivo. Ningun
     observador avisa —un transform no cambia la medida de nada, solo donde se
     pinta—, asi que la unica forma de acertar es seguir mirando hasta que la
     animacion termine. */
  vigilarUnRato(ms) {
    if (this.finVigilia && performance.now() + ms < this.finVigilia) return;
    const arranca = !this.vigilando;
    this.finVigilia = performance.now() + ms;
    if (!arranca) return;

    this.vigilando = true;
    const clavar = () => {
      if (!this.animando) this.asentarSiSeMovio();
      if (performance.now() < this.finVigilia) requestAnimationFrame(clavar);
      else this.vigilando = false;
    };
    requestAnimationFrame(clavar);
  }

  /* Colocar cuesta poco, pero escribir estilos identicos en cada cuadro obliga
     al navegador a recalcular de balde: primero se mira, y solo se escribe si
     de verdad algo se movio. */
  asentarSiSeMovio() {
    const d = this.destinos();
    if (!d) return;
    for (let i = 0; i < this.secciones.length; i++) {
      const q = this.secciones[i].pose, p = d[i];
      if (!p) continue;
      if (!q ||
          Math.abs(p.x - q.x) > 0.5 || Math.abs(p.y - q.y) > 0.5 ||
          Math.abs(p.w - q.w) > 0.5 || Math.abs(p.h - q.h) > 0.5) {
        this.asentar();
        return;
      }
    }
  }

  pad(n) { return String(n).padStart(2, '0'); }
  wrap(n) { return (n + this.total * 2) % this.total; }

  buildWheel() {
    if (!this.digitWheel) return;
    this.digitWheel.innerHTML = this.secciones
      .map((_, i) => '<span class="digit">' + this.pad(i + 1) + '</span>')
      .join('');
    if (this.totalNum) this.totalNum.textContent = this.pad(this.total);
  }

  /* ---------- la tira ----------
     Cola que fluye hacia la derecha: la ranura k guarda marco + (RANURAS - k),
     así que la última es la que sube ahora y la primera la más lejana. */
  indicesDeTira(marco) {
    const lista = [];
    for (let k = RANURAS; k >= 1; k--) lista.push(this.wrap(marco + k));
    return lista;
  }

  pintarTira(indices, entrante) {
    this.thumbnailsTrack.innerHTML = '';
    this.ranuras = indices.map((idx, k) => {
      const s = this.secciones[idx];
      const item = document.createElement('div');
      item.className = 'thumb-item';
      if (k === indices.length - 1) item.classList.add('active');
      if (idx === entrante) item.classList.add('thumb-entering');
      item.innerHTML =
        '<div class="thumb-img-box"></div>' +
        '<div class="thumb-caption">' +
          '<span class="thumb-name"></span>' +
          '<span class="thumb-company"></span>' +
        '</div>' +
        '<div class="thumb-accent-bar"></div>';
      item.querySelector('.thumb-name').textContent = s.nombre;
      item.querySelector('.thumb-company').textContent = s.area;
      item.addEventListener('click', () => this.irA(idx));
      this.thumbnailsTrack.appendChild(item);
      return { el: item, caja: item.querySelector('.thumb-img-box'), idx: idx };
    });
  }

  construirPrevias() {
    this.secciones.forEach((s) => {
      const p = document.createElement('div');
      p.className = 'previa cargando';
      /* Sin medida propia, una previa que ya tiene iframe dentro y todavia no
         tiene pose creceria hasta los 1440x900 del iframe: los transforms no
         encogen la caja, solo lo que se pinta. Nace en cero. */
      p.style.width = '0px';
      p.style.height = '0px';
      this.capa.appendChild(p);
      s.previa = p;
    });
  }

  /* Cada iframe nace una sola vez y no se vuelve a tocar. */
  montar(s) {
    if (s.marco) return;
    const f = document.createElement('iframe');
    f.setAttribute('scrolling', 'no');
    f.setAttribute('tabindex', '-1');
    f.setAttribute('aria-hidden', 'true');
    f.title = s.nombre;
    f.style.width = DISENO_W + 'px';
    f.style.height = DISENO_H + 'px';
    const sep = s.src.indexOf('?') === -1 ? '?' : '&';
    f.src = encodeURI(s.src) + sep + 'previa=1';
    f.addEventListener('load', () => {
      s.previa.classList.remove('cargando');
      if (!this.animando) this.asentar();
    });
    s.previa.appendChild(f);
    s.marco = f;
    if (s.pose) f.style.transform = this.interior(s.pose.w, s.pose.h);
    else if (!this.animando) this.asentar();
  }

  montarPorTurnos() {
    const orden = [this.actual].concat(
      this.secciones.map((_, i) => i).filter((i) => i !== this.actual)
    );
    orden.forEach((i, k) => {
      setTimeout(() => this.montar(this.secciones[i]), k * ESPERA_MONTAJE);
    });
  }

  /* ---------- geometría ----------
     Una pose es una caja en coordenadas de la capa. La página de dentro se
     agranda hasta cubrirla y se recorta por el centro, como se recortaba la
     foto que había aquí antes: el marco es un retrato muy estirado y la
     página es apaisada, así que caber entera no es una opción. */
  rel(r, base) {
    return { x: r.left - base.left, y: r.top - base.top, w: r.width, h: r.height };
  }

  interior(w, h) {
    const esc = Math.max(w / DISENO_W, h / DISENO_H);
    const dx = (w - DISENO_W * esc) / 2;
    const dy = (h - DISENO_H * esc) / 2;
    return 'translate(' + dx.toFixed(2) + 'px,' + dy.toFixed(2) + 'px) scale(' + esc.toFixed(5) + ')';
  }

  cuadro(p) {
    return {
      transform: 'translate(' + p.x.toFixed(2) + 'px,' + p.y.toFixed(2) + 'px)',
      width: p.w.toFixed(2) + 'px',
      height: p.h.toFixed(2) + 'px'
    };
  }

  /* Dónde va cada sección ahora mismo, leído de la maqueta real. */
  destinos() {
    const base = this.capa.getBoundingClientRect();
    const m = this.heroContainer.getBoundingClientRect();
    if (!m.width) return null;
    const d = {};
    d[this.actual] = this.rel(m, base);
    this.ranuras.forEach((r) => { d[r.idx] = this.rel(r.caja.getBoundingClientRect(), base); });
    return d;
  }

  escribir(s, pose) {
    const p = s.previa;
    const c = this.cuadro(pose);
    p.style.transform = c.transform;
    p.style.width = c.width;
    p.style.height = c.height;
    if (s.marco) s.marco.style.transform = this.interior(pose.w, pose.h);
    s.pose = pose;
  }

  /* Todo en su sitio, sin viaje. */
  asentar() {
    const d = this.destinos();
    if (!d) return;
    this.secciones.forEach((s, i) => {
      if (!d[i]) return;
      this.escribir(s, d[i]);
      s.previa.classList.toggle('grande', i === this.actual);
      s.previa.style.zIndex = i === this.actual ? 3 : 1;
      s.previa.style.opacity = '';
    });
  }

  /* ---------- el giro ---------- */
  irA(destino) {
    const n = this.wrap(destino);
    if (this.animando || n === this.actual) return;

    const antes = this.actual;
    const unPaso = n === this.wrap(antes + 1);
    const dir = n === this.wrap(antes - 1) ? -1 : 1;

    this.animando = true;
    this.actual = n;
    this.limpiarMorfos();
    this.resetProgress();

    /* La tira se rehace ya en su orden final. La que acaba de dejar el marco
       entra en ella marcada como recién llegada. */
    this.pintarTira(this.indicesDeTira(n), unPaso ? antes : null);

    const d = this.destinos();
    if (!d) { this.animando = false; return; }

    /* Y se la sujeta una ranura a la izquierda para soltarla: la cola entera
       camina un paso a la derecha, hacia el marco. Se mide antes de crear la
       animación, que ya ocupa su primer fotograma en cuanto nace. */
    if (unPaso) {
      this.morfos.push(this.thumbnailsTrack.animate(
        [{ transform: 'translateX(' + (-PASO) + 'px)' }, { transform: 'translateX(0px)' }],
        { duration: MORPH_MS, easing: MORPH_EASE, fill: 'both' }
      ));
    }

    this.secciones.forEach((s, i) => {
      if (i === antes) { this.apagar(s, d[n]); return; }
      if (!d[i] || !s.pose) return;
      this.volar(s, s.pose, d[i], i === n);
    });

    this.relevarTexto(dir);
    this.updateWheel();

    /* Se aterriza por reloj y no por onfinish: en una pestaña de fondo el
       evento no llega nunca y el índice se quedaría a medio giro. */
    this.relojes.push(setTimeout(() => this.aterrizar(antes), MORPH_MS + 40));
  }

  volar(s, desde, hasta, alMarco) {
    const p = s.previa;
    p.style.zIndex = alMarco ? 3 : 1;
    p.classList.toggle('grande', alMarco);

    this.morfos.push(p.animate([this.cuadro(desde), this.cuadro(hasta)],
      { duration: MORPH_MS, easing: MORPH_EASE, fill: 'both' }));

    if (s.marco) {
      this.morfos.push(s.marco.animate(
        [{ transform: this.interior(desde.w, desde.h) },
         { transform: this.interior(hasta.w, hasta.h) }],
        { duration: MORPH_MS, easing: MORPH_EASE, fill: 'both' }
      ));
    }
    s.pose = hasta;
  }

  /* La que deja el marco no vuelve a ningún sitio a la vista: se encoge un
     poco, cae y se apaga donde estaba. Volverá a aparecer al aterrizar, ya
     puesta al final de la cola. */
  apagar(s, caja) {
    if (!caja) return;
    const p = s.previa;
    /* Por debajo de la que llega (3) y por encima de la cola (1): la nueva
       tiene que taparla mientras crece, no asomar por detrás de un fantasma
       que todavía no se ha ido. */
    p.style.zIndex = 2;
    const fin = {
      x: caja.x + caja.w * 0.03,
      y: caja.y + caja.h * 0.03 + 28,
      w: caja.w * 0.94,
      h: caja.h * 0.94
    };
    this.morfos.push(p.animate(
      [Object.assign({ opacity: 1 }, this.cuadro(caja)),
       Object.assign({ opacity: 0 }, this.cuadro(fin))],
      { duration: APAGADO_MS, easing: APAGADO_EASE, fill: 'both' }
    ));
    if (s.marco) {
      this.morfos.push(s.marco.animate(
        [{ transform: this.interior(caja.w, caja.h) },
         { transform: this.interior(fin.w, fin.h) }],
        { duration: APAGADO_MS, easing: APAGADO_EASE, fill: 'both' }
      ));
    }
  }

  aterrizar(antes) {
    /* Primero se escriben las poses definitivas —todavía tapadas por las
       animaciones— y solo después se cancelan: al revés habría un fotograma
       con todo en su sitio anterior. */
    this.pintarTira(this.indicesDeTira(this.actual));
    this.asentar();
    this.limpiarMorfos();

    const p = this.secciones[antes].previa;
    p.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 380, easing: 'ease' });

    this.animando = false;
    this.resetProgress();
  }

  limpiarMorfos() {
    this.morfos.forEach((a) => { a.onfinish = null; try { a.cancel(); } catch (e) {} });
    this.morfos = [];
    this.relojes.forEach(clearTimeout);
    this.relojes = [];
  }

  /* ---------- texto y contador ---------- */
  aplicarSeccion(s) {
    this.nombreEl.textContent = s.nombre;
    this.areaEl.textContent = s.area;
    this.textoEl.textContent = s.texto;
    this.entrarMarcoTexto.textContent = 'Ingresar a ' + s.nombre;
  }

  /* El texto no se cambia: se releva. Sale hacia un lado perdiendo opacidad,
     y el nuevo entra con los créditos un paso por delante de la cita. Ese
     desfase es lo que hace que se lea como una frase y no como un bloque. */
  relevarTexto(dir) {
    const q = this.quoteContent;
    q.classList.toggle('atras', dir < 0);
    q.classList.remove('stagger-in');
    q.classList.add('stagger-out');

    this.relojes.push(setTimeout(() => {
      this.aplicarSeccion(this.secciones[this.actual]);
      q.classList.remove('stagger-out');
      void q.offsetWidth;
      q.classList.add('stagger-in');
    }, TEXTO_MS));
  }

  updateWheel() {
    if (!this.digitWheel) return;
    const digito = this.digitWheel.querySelector('.digit');
    const alto = digito ? digito.getBoundingClientRect().height : 22;
    this.digitWheel.style.transform = 'translateY(' + (-this.actual * alto) + 'px)';
  }

  siguiente() { this.irA(this.wrap(this.actual + 1)); }
  anterior()  { this.irA(this.wrap(this.actual - 1)); }

  ingresar() {
    const s = this.secciones[this.actual];
    if (window.Taller && window.Taller.dentroDelDeck) window.Taller.ir(s.deck);
    else window.location.href = s.src;   // suelta: navega de verdad
  }

  /* El botón acusa el clic antes de que pase nada más: el gesto tiene que
     responder aunque el giro dure tres cuartos de segundo. */
  rebotar() {
    const b = this.nextBtn;
    b.classList.remove('trigger-bounce');
    void b.offsetWidth;
    b.classList.add('trigger-bounce');
  }

  bindEvents() {
    if (this.nextBtn) this.nextBtn.addEventListener('click', () => { this.pausar(); this.rebotar(); this.siguiente(); });
    if (this.ingresarBtn) this.ingresarBtn.addEventListener('click', () => this.ingresar());
    if (this.entrarMarco) this.entrarMarco.addEventListener('click', () => this.ingresar());

    if (this.autoPlayToggle) {
      this.autoPlayToggle.addEventListener('click', () => {
        this.isPlaying ? this.pausar() : this.reanudar();
      });
    }

    window.addEventListener('resize', () => {
      if (!this.animando) this.asentar();
      this.updateWheel();
    });

    window.addEventListener('keydown', (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      /* La cola corre a la derecha y el contador sube: la tecla que empuja en
         ese sentido es la que trae la siguiente sección. */
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft' || e.key === ' ') {
        this.pausar(); this.rebotar(); this.siguiente();
      } else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        this.pausar(); this.rebotar(); this.anterior();
      } else if (e.key === 'Enter') {
        this.ingresar();
      } else return;
      e.preventDefault();
    });
  }

  /* ---------- autoplay ---------- */
  pausar() {
    this.isPlaying = false;
    if (this.autoPlayToggle) this.autoPlayToggle.classList.remove('active');
    if (this.autoPlayLabel) this.autoPlayLabel.textContent = 'Pausado';
    this.setRing(0);
  }

  reanudar() {
    this.isPlaying = true;
    if (this.autoPlayToggle) this.autoPlayToggle.classList.add('active');
    if (this.autoPlayLabel) this.autoPlayLabel.textContent = 'Auto-Play';
    this.resetProgress();
  }

  resetProgress() { this.progressStart = performance.now(); this.setRing(0); }

  setRing(t) {
    if (!this.ringProgress) return;
    this.ringProgress.style.strokeDasharray = RING.toFixed(2);
    this.ringProgress.style.strokeDashoffset = (RING * (1 - t)).toFixed(2);
  }

  startAutoplayLoop() {
    this.resetProgress();
    const paso = (now) => {
      if (this.isPlaying && !this.animando) {
        const t = Math.min(1, (now - this.progressStart) / AUTOPLAY_MS);
        this.setRing(t);
        if (t >= 1) { this.rebotar(); this.siguiente(); }
      }
      this.animFrameId = requestAnimationFrame(paso);
    };
    this.animFrameId = requestAnimationFrame(paso);
  }
}

window.indiceTaller = new IndiceDeSecciones();
