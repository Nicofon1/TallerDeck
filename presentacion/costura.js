/* ═══════════════════════════════════════════════════════════════
   La costura de las láminas de la presentación.

   Engancha la lámina al deck: el telón que tapa la carga, la llegada y
   la salida, y los enlaces que en vez de navegar se lo piden al padre.
   ═══════════════════════════════════════════════════════════════ */
(function(){
  "use strict";

  var raiz = document.documentElement;

  /* Dentro del deck los enlaces no navegan: se lo piden al padre, que es
     quien sabe hacer la transición. Fuera del deck siguen siendo enlaces. */
  document.querySelectorAll("a[data-seccion]").forEach(function(a){
    a.addEventListener("click", function(e){
      if (!(window.Taller && Taller.dentroDelDeck)) return;
      e.preventDefault();
      Taller.ir(a.getAttribute("data-seccion"));
    });
  });

  if (!window.Taller) return;

  Taller.alEntrar(function(){
    raiz.classList.remove("saliendo");
    raiz.classList.add("entrando");
    /* enlace.js guarda una sola funcion por evento: si la lamina llamara a
       Taller.alEntrar por su cuenta, borraria esta. Por eso el gancho. */
    if (typeof window.alLlegarLamina === "function") window.alLlegarLamina();
    Taller.trasPintar(function(){ raiz.classList.remove("con-telon"); });
    /* Por reloj y no por `animationend`: en una pestaña de fondo las
       animaciones no corren y el evento no llegaría nunca. */
    setTimeout(function(){ raiz.classList.remove("entrando"); }, 1400);
  });

  Taller.alSalir(function(){
    raiz.classList.remove("entrando");
    raiz.classList.add("saliendo", "con-telon");
    return new Promise(function(listo){ setTimeout(listo, 460); });
  });

  /* Hay láminas de una sola pantalla —el contexto, la línea de tiempo—: no
     tienen pasos que recorrer, así que en ellas avanzar ya es terminar. Se
     declaran con `data-sinpasos` en el body y no se detectan desde aquí,
     porque desde aquí no hay forma de saber si la lámina escucha las flechas
     por su cuenta, y dos oyentes de la misma tecla darían dos saltos. */
  if (document.body.hasAttribute("data-sinpasos")) {
    addEventListener("keydown", function(e){
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      var k = e.key;
      if (k === "ArrowRight" || k === "ArrowDown" || k === " " || k === "PageDown"){
        e.preventDefault();
        Taller.terminar();
      }
    });
  }
})();
