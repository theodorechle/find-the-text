
from http.server import BaseHTTPRequestHandler, HTTPServer
import time
import re

hostName = "127.0.0.1"
serverPort = 8080

class MyServer(BaseHTTPRequestHandler):
    texte = "Ceci n'est pas un texte. \nEssaye de deviner mon contenu ! Difficile, n'est-ce pas ?"

    def find_all(self, texte :str, mot):
        words = re.split(r"[ ,\-\"!,?.']", texte)
        words = [word for word in words if word]
        return [str(i) for i, x in enumerate(words) if x == mot]
    def do_GET(self):
        if self.path == '/':
            self.send_response(200)
            self.send_header("Content-type", "text/html; charset=utf-8")
            self.end_headers()
            with open('toto.html', encoding='utf-8') as file:
                self.wfile.write(bytes(file.read(), "utf-8"))
        elif self.path == '/text':
            self.send_response(200)
            self.send_header("Content-type", "text/plain; charset=utf-8")
            self.end_headers()
            self.wfile.write(bytes(self.texte, "utf-8"))
        elif self.path.startswith('/indices?word='):
            word = self.path.removeprefix('/indices?word=')
            positions = self.find_all(self.texte, word)
            self.send_response(200)
            self.send_header("Content-type", "text/plain; charset=utf-8")
            self.end_headers()
            print(positions)
            self.wfile.write(bytes(",".join(positions), "utf-8"))
        else:
            self.send_response(404)
            self.send_header("Content-type", "text/html")
            self.end_headers()
            self.wfile.write(bytes("<html><head><title>Page not found</title></head>", "utf-8"))
            self.wfile.write(bytes("<p>Request: %s</p>" % self.path, "utf-8"))
            self.wfile.write(bytes("<body>", "utf-8"))
            self.wfile.write(bytes("<p>No route found for this request</p>", "utf-8"))
            self.wfile.write(bytes("</body></html>", "utf-8"))



if __name__ == "__main__":        
    webServer = HTTPServer((hostName, serverPort), MyServer)
    print("Server started at http://%s:%s" % (hostName, serverPort))

    try:
        webServer.serve_forever()
    except KeyboardInterrupt:
        pass

    webServer.server_close()
    print("Server stopped.")
