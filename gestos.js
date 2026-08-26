/* ═══════════════════════════════════════════════════════════
   GESTOS — el dedo, para cuando el taller se da en una tableta.

   Las láminas ya saben recorrerse con el teclado, y todas usan las
   mismas teclas. Así que esto no aprende a navegar: traduce.
   Un deslizamiento se convierte en la flecha que le corresponde y
   lo recibe quien ya la estaba escuchando. Una lámina nueva que
   escuche flechas queda con gestos sin tocar una línea de aquí.

     deslizar a la izquierda  →  avanzar      (flecha derecha)
     deslizar a la derecha    →  retroceder   (flecha izquierda)
     deslizar hacia abajo     →  volver       (soltar la lámina)

   Tres y no más: un vocabulario que se aprende de una vez y que no
   se pisa con lo que el navegador ya hace con el dedo.

   Sobre el gesto propio: hay láminas que ya usan el dedo para lo
   suyo —el estante se arrastra a mano— y ahí el deslizamiento no
   puede significar dos cosas a la vez. Esas se declaran con
   `Gestos.mio(fn)`: mientras `fn` diga que sí, este archivo no toca
   ese toque. Es la lámina quien manda, porque es la única que sabe
   en qué estado está.
   ═══════════════════════════════════════════════════════════ */
(function(){
  "use strict";

  /* Un toque que recorre menos de esto es un toque, no un gesto: hay
     que dejar sitio al pulso, que en una tableta apoyada tiembla. */
  var MINIMO = 46;
  /* Un eje tiene que mandar claramente sobre el otro. Sin esto, un
     deslizamiento en diagonal dispararía lo primero que se midiera. */
  var DOMINIO = 1.5;
  /* Más lento que esto ya no es deslizar, es arrastrar mirando: casi
     siempre es alguien apoyando la mano, y no quiere ir a ningún lado. */
  var LENTO_MS = 900;

  var propio = null;          // la lámina reclama el toque para sí
  var vivo = false;           // hay un toque en curso que nos interesa
  var x0 = 0, y0 = 0, t0 = 0;

  window.Gestos = {
    /* La lámina declara cuándo el dedo es suyo. `fn` se pregunta en cada
       toque —no una vez— porque el estante arrastra mientras se mira y
       deja de arrastrar en cuanto una carpeta se abre. */
    mio: function(fn){ propio = fn; }
  };

  /* Las flechas las escucha `window` en todas las láminas. Se manda el
     evento tal cual llegaría del teclado, con `key` y `code`, para que
     ningún oyente tenga que enterarse de que vino de un dedo. */
  function tecla(nombre, codigo){
    window.dispatchEvent(new KeyboardEvent("keydown", {
      key: nombre, code: codigo, bubbles: true, cancelable: true
    }));
  }

  function volver(){
    if (window.Taller && window.Taller.dentroDelDeck){ window.Taller.volver(); return; }
    /* Suelta, la lámina no tiene padre a quien pedírselo: se usa su
       propio botón de volver, que es a donde iría el dedo igualmente. */
    var salida = document.querySelector("a.volver, .volver[href]");
    if (salida) salida.click();
  }

  addEventListener("touchstart", function(e){
    /* Dos dedos es pellizcar para acercar, y eso es del navegador. */
    if (e.touches.length !== 1){ vivo = false; return; }
    try { if (propio && propio(e)) { vivo = false; return; } } catch(_){}
    var t = e.touches[0];
    x0 = t.clientX; y0 = t.clientY; t0 = e.timeStamp || Date.now();
    vivo = true;
  }, { passive: true });

  /* Si aparece un segundo dedo a mitad del recorrido, ya no era un
     deslizamiento: era el principio de un pellizco. */
  addEventListener("touchmove", function(e){
    if (e.touches.length !== 1) vivo = false;
  }, { passive: true });

  addEventListener("touchcancel", function(){ vivo = false; }, { passive: true });

  addEventListener("touchend", function(e){
    if (!vivo) return;
    vivo = false;

    var t = e.changedTouches && e.changedTouches[0];
    if (!t) return;

    var dx = t.clientX - x0;
    var dy = t.clientY - y0;
    var ax = Math.abs(dx), ay = Math.abs(dy);
    if (((e.timeStamp || Date.now()) - t0) > LENTO_MS) return;

    if (ax >= MINIMO && ax > ay * DOMINIO){
      /* El contenido sigue al dedo: llevárselo a la izquierda es pedir
         lo que viene detrás, igual que pasar una página. */
      if (dx < 0) tecla("ArrowRight", "ArrowRight");
      else        tecla("ArrowLeft",  "ArrowLeft");
    } else if (dy >= MINIMO && ay > ax * DOMINIO){
      /* Hacia abajo se suelta lo que se está mirando. Hacia arriba no se
         ata nada: en varias láminas la flecha arriba ya es retroceder, y
         dos gestos para lo mismo solo sirven para confundir. */
      volver();
    }
  }, { passive: true });

  /* Lo que el navegador hace por su cuenta con el dedo y aquí estorba:
     el retardo de trescientos milisegundos que espera un doble toque
     antes de dar por bueno un clic, el destello gris sobre lo que se
     toca, y el rebote elástico al llegar al borde —que dentro de un
     marco del deck se ve como si la lámina se despegara—. El pellizco
     para acercar se deja: es de quien mira, no del taller. */
  var hoja = document.createElement("style");
  hoja.textContent =
    "html{-webkit-text-size-adjust:100%}" +
    "html,body{overscroll-behavior:none}" +
    "body{touch-action:manipulation;-webkit-tap-highlight-color:transparent}";
  (document.head || document.documentElement).appendChild(hoja);
})();
