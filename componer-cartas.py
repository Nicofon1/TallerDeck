# -*- coding: utf-8 -*-
"""Compone las seis radiografias sobre el lienzo alto de la card.

La card es una columna estrecha (relacion ~0.41) y las seis imagenes vienen
con relaciones que van de 0.56 a 1.78. Recortar a ciegas dejaba a cada figura
en un sitio distinto del marco. Aqui se decide una por una: cuanto se recorta
de ancho y cuanto fondo se anade para que quepa entera, y todas acaban con la
figura en el mismo eje y con el mismo aire alrededor.
"""
from PIL import Image
import os, statistics

SRC = "Imagendes cards"
DST = os.path.join("slides 2", "assets", "cards")
ANCHO, ALTO = 620, 1500          # el lienzo de la card, al doble de lo que mide

# archivo, salida, (recorte x0,y0,x1,y1 o None), (relleno arriba, abajo)
PLAN = [
    # El cerebro es mucho mas ancho que alto y su fondo es plano: se deja
    # entero y se le da aire hasta que el lienzo cae de pie. Mas por arriba
    # que por abajo, porque el tronco ya baja solo y equilibra.
    ("cerebro x ray card.jpg",  "cerebro",  None,                 (480, 290)),
    # El corazon no puede crecer: su fondo esta lleno de vasos y cualquier
    # relleno se veria como una banda. Se recorta centrado en el, y lo poco
    # que sobra por la derecha se va por el canto de la card.
    ("Corazon x ray card.jpg",  "corazon",  (130, 0,  670, 1308), (0, 0)),
    # Las tres siguientes vienen con el cuerpo cortado a ras del lienzo por
    # abajo: todo el relleno va arriba y el corte se va por el canto de la
    # card, que es donde no se nota. Rellenar tambien por abajo dejaria una
    # raya justo donde el hueso se interrumpe.
    ("Caja toraxica X ray.jpg", "torax",    (380, 0,  830,  672), (418, 0)),
    ("Mano x ray card.jpg",     "mano",     (110, 20, 425,  482), (300, 0)),
    ("esqueleto x ray card.jpg","esqueleto",( 30, 0,  378,  565), (277, 0)),
    # A la espina se le corta la firma del autor por abajo, que en una card
    # de dos centimetros solo se lee como suciedad.
    ("Espina x ray card.jpg",   "espina",   (105, 90, 460,  612), (200, 137)),
]

def fondo(im, lado):
    """El color del fondo, tomado del borde por el que se va a crecer.

    Por lado y no una sola vez para toda la imagen: la mano trae la muneca
    en sombra abajo y el mismo color arriba y abajo dejaba una raya donde
    empezaba el relleno."""
    W, H = im.size; px = im.load()
    fila = [px[x, 3 if lado == "arriba" else H - 4] for x in range(0, W, max(1, W // 60))]
    return tuple(round(statistics.median(c[i] for c in fila)) for i in range(3))


for archivo, salida, caja, (arr, aba) in PLAN:
    im = Image.open(os.path.join(SRC, archivo)).convert("RGB")
    if caja: im = im.crop(caja)
    if arr or aba:
        W, H = im.size
        lienzo = Image.new("RGB", (W, H + arr + aba), fondo(im, "arriba"))
        if aba:
            lienzo.paste(Image.new("RGB", (W, aba), fondo(im, "abajo")), (0, arr + H))
        lienzo.paste(im, (0, arr))
        im = lienzo
    # y al final, a la relacion de la card: lo que sobre se quita por los lados,
    # que es donde solo hay fondo despues de haber compuesto el alto.
    W, H = im.size
    objetivo = ANCHO / ALTO
    if W / H > objetivo:
        w = round(H * objetivo); x = (W - w) // 2
        im = im.crop((x, 0, x + w, H))
    else:
        h = round(W / objetivo); y = (H - h) // 2
        im = im.crop((0, y, W, y + h))
    im = im.resize((ANCHO, ALTO), Image.LANCZOS)
    ruta = os.path.join(DST, salida + ".jpg")
    im.save(ruta, "JPEG", quality=88, optimize=True, progressive=True)
    print("%-10s %4dx%-4d %5.0f kB" % (salida, im.width, im.height, os.path.getsize(ruta)/1024))
