/* ═══════════════════════════════════════════════════════════
   ENLACE — el cable entre el deck y cada lámina.

   El deck no puede animar por dentro de una lámina: son
   documentos distintos. Así que no lo intenta. Le pide a la
   lámina que se vaya, la lámina coreografía su propia salida
   con los elementos que sí tiene a mano, y avisa cuando terminó.

   Una lámina abierta suelta (sin deck alrededor) sigue funcionando
   igual: las salidas se resuelven solas y `ir` no hace nada.
   ═══════════════════════════════════════════════════════════ */
(function(){
  "use strict";

  /* Una lámina puede estar embebida por dos motivos muy distintos:
     porque el deck la está presentando, o porque el índice la está
     mostrando en miniatura. En el segundo caso no debe comportarse
     como lámina —nada de telones ni de botones de volver—: tiene que
     verse tal cual se vería suelta. `?previa=1` marca esa diferencia. */
  var esPrevia = /[?&]previa=1/.test(location.search);

  var embebida = false;
  try { embebida = window.parent && window.parent !== window; } catch(_){}
  var dentroDelDeck = embebida && !esPrevia;

  var alSalir = null, alEntrar = null, miId = null;

  function avisar(msg){
    if (!dentroDelDeck) return;
    try { window.parent.postMessage(msg, "*"); } catch(_){}
  }

  window.Taller = {
    dentroDelDeck: dentroDelDeck,
    esPrevia: esPrevia,

    get id(){ return miId; },

    /* La lámina registra cómo se va. Puede devolver una promesa;
       el deck espera a que se resuelva antes de mostrar la siguiente. */
    alSalir: function(fn){ alSalir = fn; },

    /* Y cómo llega, sabiendo de dónde viene. */
    alEntrar: function(fn){ alEntrar = fn; },

    /* Pedirle al deck que lleve a otra lámina. `extra` viaja entero
       hasta la lámina destino: así un libro puede decir qué caso abre. */
    ir: function(destino, extra){
      avisar({ taller:"ir", destino:destino, extra:extra||null });
    },

    /* Volver a quien la contiene. */
    volver: function(){ avisar({ taller:"volver" }); },

    /* Ejecuta `fn` una vez el navegador ya pintó el estado inicial, que
       es lo que hace falta para que una transición CSS arranque desde
       algún sitio en lugar de saltar. Dos cuadros bastan... salvo en una
       pestaña de fondo, donde requestAnimationFrame no corre y el telón
       se quedaría puesto para siempre. Por eso el temporizador de
       respaldo: gane quien gane, `fn` corre exactamente una vez. */
    trasPintar: function(fn){
      var hecho = false;
      function una(){ if (hecho) return; hecho = true; fn(); }
      requestAnimationFrame(function(){ requestAnimationFrame(una); });
      setTimeout(una, 120);
    }
  };

  if (!dentroDelDeck) return;

  window.addEventListener("message", function(e){
    var d = e.data;
    if (!d || d.taller !== "orden") return;

    if (d.orden === "salir"){
      var fin = function(){ avisar({ taller:"salida-lista", vale:d.vale }); };
      /* Una coreografía rota no puede dejar el deck colgado, pero
         tampoco puede desaparecer sin dejar rastro: se sigue
         adelante Y se dice por consola qué se rompió. */
      var fallo = function(e){
        console.error("[taller] la salida de esta lámina falló:", e);
        fin();
      };
      var r = null;
      try { r = alSalir ? alSalir(d.hacia) : null; }
      catch (e){ fallo(e); return; }
      if (r && typeof r.then === "function") r.then(fin, fallo);
      else fin();

    } else if (d.orden === "entrar"){
      miId = d.id || miId;
      try { alEntrar && alEntrar(d.desde, d.extra); }
      catch (e){ console.error("[taller] la entrada de esta lámina falló:", e); }
    }
  });

  function saludar(){ avisar({ taller:"hola" }); }
  if (document.readyState === "complete") saludar();
  else window.addEventListener("load", saludar);
})();
