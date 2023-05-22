
from http.server import BaseHTTPRequestHandler, HTTPServer
from random import choice
from threading import Timer
import json

import database_manager as d_m
import game

hostName = "127.0.0.1"
serverPort = 8080


class RepeatedTimer(object):
    def __init__(self, interval, function, *args, **kwargs):
        self._timer     = None
        self.interval   = interval
        self.function   = function
        self.args       = args
        self.kwargs     = kwargs
        self.is_running = False
        self.start()

    def _run(self):
        self.is_running = False
        self.start()
        self.function(*self.args, **self.kwargs)

    def start(self):
        if not self.is_running:
            self._timer = Timer(self.interval, self._run)
            self._timer.start()
            self.is_running = True

    def stop(self):
        self._timer.cancel()
        self.is_running = False


class MyServer(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path.startswith("/game"):
            path = self.path.removeprefix("/game")
            if path == "/":
                self.send_response(200)
                self.send_header("Content-type", "text/html; charset=utf-8")
                self.end_headers()
                with open('play/index.html', encoding='utf-8') as file:
                    self.wfile.write(bytes(file.read(), "utf-8"))
                return
            elif path == "/style.css":
                self.send_response(200)
                self.send_header("Content-type", "text/css; charset=utf-8")
                self.end_headers()
                with open('play/style.css', encoding='utf-8') as file:
                    self.wfile.write(bytes(file.read(), 'utf-8'))
                return
            elif path == "/code.js":
                self.send_response(200)
                self.send_header("Content-type", "text/javascript; charset=utf-8")
                self.end_headers()
                with open('play/code.js', encoding='utf-8') as file:
                    self.wfile.write(bytes(file.read(), 'utf-8'))
                return
        elif self.path.startswith("/create_account"):
            path = self.path.removeprefix("/create_account")
            if path == "/":
                self.send_response(200)
                self.send_header("Content-type", "text/html; charset=utf-8")
                self.end_headers()
                with open("account_creation/account_creation_page.html", encoding='utf-8') as file:
                    self.wfile.write(bytes(file.read(), 'utf-8'))
                return
            elif path == "/style_creation.css":
                self.send_response(200)
                self.send_header("Content-type", "text/css; charset=utf-8")
                self.end_headers()
                with open("account_creation/style_creation.css", encoding='utf-8') as file:
                    self.wfile.write(bytes(file.read(), 'utf-8'))
                return
            elif path == "/code_creation.js":
                self.send_response(200)
                self.send_header("Content-type", "text/javascript; charset=utf-8")
                self.end_headers()
                with open("account_creation/code_creation.js", encoding='utf-8') as file:
                    self.wfile.write(bytes(file.read(), 'utf-8'))
                return
        elif self.path.startswith("/login"):
            path = self.path.removeprefix("/login")
            if path == "/":
                self.send_response(200)
                self.send_header("Content-type", "text/html; charset=utf-8")
                self.end_headers()
                with open("login/login.html", encoding='utf-8') as file:
                    self.wfile.write(bytes(file.read(), 'utf-8'))
                return
            elif path == "/login_style.css":
                self.send_response(200)
                self.send_header("Content-type", "text/css; charset=utf-8")
                self.end_headers()
                with open("login/login_style.css", encoding='utf-8') as file:
                    self.wfile.write(bytes(file.read(), 'utf-8'))
                return
            elif path == "/login_script.js":
                self.send_response(200)
                self.send_header("Content-type", "text/javascript; charset=utf-8")
                self.end_headers()
                with open("login/login_script.js", encoding='utf-8') as file:
                    self.wfile.write(bytes(file.read(), 'utf-8'))
                return
            elif path  == "/login_anonym":
                self.send_response(200)
                keys = texts.keys()
                key = -choice([i for i in range(NB_MAX_USERS) if i not in keys])
                connections[key] = key
                append_to_connections_file(connections)
                self.send_response(200)
                self.send_header("Content-type", "text/json; charset=utf-8")
                self.end_headers()
                self.wfile.write(bytes(json.dumps({"token": key}),"utf-8"))
                return

        self.send_response(404)
        self.send_header("Content-type", "text/html")
        self.end_headers()
        self.wfile.write(bytes("<html><head><title>Page not found</title></head>", "utf-8"))
        self.wfile.write(bytes("<p>Error 404</p>", "utf-8"))
        self.wfile.write(bytes("<p>Request: %s</p>" % self.path, "utf-8"))
        self.wfile.write(bytes("<body>", "utf-8"))
        self.wfile.write(bytes("<p>No route found for this request</p>", "utf-8"))
        self.wfile.write(bytes("</body></html>", "utf-8"))

    def do_POST(self):
        print(self.path)
        if self.path == "/game/new_text":
            length = int(self.headers['content-length'])
            raw = self.rfile.read(length).decode()
            parsed = json.loads(raw)
            id = len(texts)
            name, text, timer = parsed['name'], parsed['text'], parsed['timer']
            name_sizes = game.to_list(name)
            text_sizes = game.to_list(text)
            texts[id] = {"name": name, "text": text, "name_sizes": name_sizes, "text_sizes": text_sizes, "timer": timer}
            name_dict = game.to_dict(name_sizes)
            text_dict = game.to_dict(text_sizes)
            self.send_response(200)
            self.send_header("Content-type", "text/json; charset=utf-8")
            self.end_headers()
            json_sizes = json.dumps({"id": str(id), "name": name_dict, "text": text_dict})
            self.wfile.write(bytes(json_sizes,"utf-8"))
        elif self.path == "/game/submit_word":
            length = int(self.headers['content-length'])
            value = json.loads(self.rfile.read(length).decode())
            word = value['word']
            id = int(value['id'])
            name = game.find_word(word, texts[id]["name_sizes"])
            text = game.find_word(word, texts[id]["text_sizes"])
            sizes = json.dumps({"name": name, "text": text})
            self.send_response(200)
            self.send_header("Content-type", "text/json; charset=utf-8")
            self.end_headers()
            self.wfile.write(bytes(sizes, "utf-8"))
        elif self.path == "/create_account":
            length = int(self.headers['content-length'])
            raw = self.rfile.read(length).decode()
            parsed = json.loads(raw)
            if d_m.add_user(parsed['username'], parsed['password']):
                self.send_response(201)
                self.end_headers()
            else:
                self.send_response(401)
                self.end_headers()
        elif self.path == "/login":
            length = int(self.headers['content-length'])
            raw = self.rfile.read(length).decode()
            parsed = json.loads(raw)
            db_key = d_m.connect(parsed['username'], parsed['password'])
            if db_key != None:
                keys = texts.keys()
                key = choice([i for i in range(NB_MAX_USERS) if i not in keys])
                connections[key] = db_key
                append_to_connections_file(connections)
                self.send_response(200)
                self.send_header("Content-type", "text/json; charset=utf-8")
                self.end_headers()
                self.wfile.write(bytes(json.dumps({"token": key}),"utf-8"))
            else:
                self.send_response(401)
                self.send_header("Content-type", "text/json; charset=utf-8")
                self.end_headers()
                self.wfile.write(bytes("","utf-8"))
        elif self.path == "/get_text":
            length = int(self.headers['content-length'])
            id = int(self.rfile.read(length).decode())
            if id < len(texts):
                self.send_response(200)
                self.send_header("Content-type", "text/json; charset=utf-8")
                self.end_headers()
                value = {"name": texts[id]["name"], "text": texts[id]["text"]}
                self.wfile.write(bytes(json.dumps(value), 'utf-8'))
            else:
                self.send_response(401)
                self.send_header("Content-type", "text/json; charset=utf-8")
                self.end_headers()
                self.wfile.write(bytes(json.dumps({}), 'utf-8'))
            return
        elif self.path == "/game/save":
            length = int(self.headers['content-length'])
            raw = self.rfile.read(length).decode()
            parsed = json.loads(raw)
            #print(parsed["token"], connections[int(parsed["token"])])
            #print(parsed)
            d_m.add_to_database(parsed["name"], parsed["text"], connections[int(parsed["token"])], int(parsed["timer"]))
            self.send_response(200)
            self.end_headers()
        elif self.path == "/game/texts_db":
            length = int(self.headers['content-length'])
            key = int(self.rfile.read(length).decode())
            #print(key, connections)
            db_texts = json.dumps(d_m.get_from_database(connections[key]))
            #print(db_texts)
            self.send_response(200)
            self.send_header("Content-type", "text/json; charset=utf-8")
            self.end_headers()
            self.wfile.write(bytes(db_texts, 'utf-8'))
        elif self.path == "/game/disconnect":
            length = int(self.headers['content-length'])
            raw_token = self.rfile.read(length).decode()
            token = json.loads(raw_token)
            print(int(token["token"]    ))
            connections.pop(int(token["token"]))
            print(token, connections)
            self.send_response(200)
            self.end_headers()


def append_to_connections_file(connections: dict):
    with open("connections.txt", "w") as f:
        json.dump(connections, f)

def read_from_connections_file():
    with open("connections.txt", "r") as f:
        connections = json.load(f)
    return {int(key): value for key, value in connections.items()}


NB_MAX_USERS = 100
connections = read_from_connections_file()
texts = {}


if __name__ == "__main__":        
    webServer = HTTPServer((hostName, serverPort), MyServer)
    print("Server started at http://%s:%s" % (hostName, serverPort))

    try:
        webServer.serve_forever()
    except KeyboardInterrupt:
        pass

    webServer.server_close()
    print("Server stopped.")

