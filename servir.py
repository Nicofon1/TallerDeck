"""Un servidor de taller: sin caché y con un hilo por conexión.

    python servir.py 8815 .

El sin-caché es para no tener que recargar a mano cada vez que se toca un
archivo. Los hilos son obligatorios: el navegador deja abiertas las conexiones
—keep-alive— y con un servidor de una sola conexión la primera que se queda
esperando bloquea todas las demás. Con varias láminas en iframes eso pasa
enseguida y la página se queda a medio cargar.
"""
import sys, os, http.server

os.chdir(sys.argv[2] if len(sys.argv) > 2 else ".")
PUERTO = int(sys.argv[1]) if len(sys.argv) > 1 else 8815


class Mano(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, must-revalidate")
        http.server.SimpleHTTPRequestHandler.end_headers(self)

    def log_message(self, *a):
        pass


servidor = http.server.ThreadingHTTPServer(("127.0.0.1", PUERTO), Mano)
servidor.daemon_threads = True
print("sirviendo " + os.getcwd() + " en http://localhost:" + str(PUERTO))
servidor.serve_forever()
