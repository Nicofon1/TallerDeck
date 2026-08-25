/* ═══════════════════════════════════════════════════════════════
   La costura de las láminas de la presentación.

   Hace dos cosas. Primero pinta la barra de rumbo —el mismo orden en
   las cinco, sin repetir el markup cinco veces—. Y segundo engancha la
   lámina al deck: el telón que tapa la carga, la llegada y la salida.

   Cada página se identifica con <body data-seccion="...">.
   ═══════════════════════════════════════════════════════════════ */
(function(){
  "use strict";

  var raiz = document.documentElement;
  var actual = document.body.getAttribute("data-seccion") || "";

  /* El orden del guion. `deck` es el nombre con el que la lámina figura en
     el mapa de index.html; `href` es para cuando alguien la abre suelta. */
  var RUMBO = [
    { deck:"soma",         nombre:"Punch",         href:"../Slides/soma-hero.html" },
    { deck:"contexto",     nombre:"Contexto",      href:"contexto.html" },
    { deck:"problema",     nombre:"Problema",      href:"problema.html" },
    { deck:"investigacion",nombre:"Investigación", href:"investigacion.html" },
    { deck:"journey",      nombre:"Journey",       href:"journey.html" },
    { deck:"timeline",     nombre:"Timeline",      href:"timeline.html" }
  ];

  var caja = document.querySelector(".rumbo");
  if (caja){
    var vuelta = document.createElement("a");
    vuelta.className = "vuelta";
    vuelta.href = "../slides 2/page3.html";
    vuelta.textContent = "Índice";
    vuelta.setAttribute("data-seccion", "indice");
    caja.appendChild(vuelta);

    RUMBO.forEach(function(s){
      var a = document.createElement("a");
      a.href = s.href;
      a.textContent = s.nombre;
      a.setAttribute("data-seccion", s.deck);
      if (s.deck === actual) a.setAttribute("aria-current", "page");
      caja.appendChild(a);
    });
  }

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
})();
