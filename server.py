
from http.server import BaseHTTPRequestHandler, HTTPServer
import json, os, uuid
from threading import Timer
from time import time_ns

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

    def serve_file(self,filename):
        if os.path.isfile(filename):
            self.send_response(200)
            self.send_header("Content-type", "text/html; charset=utf-8")
            self.end_headers()
            with open(filename, encoding='utf-8') as file:
                self.wfile.write(bytes(file.read(), "utf-8"))
            return


    def do_GET(self):
        # path = self.path.split('/')[1:] 
        # if len(path) > 0:
        #   if os.path.isdir(path[0]):
        #       if len(path) > 1:
        #           filename = os.path.join(path[0],path[1], ".html")
        #           if os.path.isfile(filename):
        #             return self.serve_file(filename)
        #       else:
        #             return self.serve_file(filename)
        # filename = os.path.join(path[0],"404.html")
        # return self.serve_file(filename)


        if self.path.startswith("/game"):
            path = self.path.removeprefix("/game")
            if path == "/":
                self.send_response(200)
                self.send_header("Content-type", "text/html; charset=utf-8")
                self.end_headers()
                with open('menu/index.html', encoding='utf-8') as file:
                    self.wfile.write(bytes(file.read(), "utf-8"))
            
            elif path == "/style.css":
                self.send_response(200)
                self.send_header("Content-type", "text/css; charset=utf-8")
                self.end_headers()
                with open('menu/style.css', encoding='utf-8') as file:
                    self.wfile.write(bytes(file.read(), 'utf-8'))
            
            elif path == "/code.js":
                self.send_response(200)
                self.send_header("Content-type", "text/javascript; charset=utf-8")
                self.end_headers()
                with open('menu/code.js', encoding='utf-8') as file:
                    self.wfile.write(bytes(file.read(), 'utf-8'))
            
        elif self.path.startswith("/play"):
            path = self.path.removeprefix("/play")
            if path == "/":
                self.send_response(200)
                self.send_header("Content-type", "text/html; charset=utf-8")
                self.end_headers()
                with open('play/play.html', encoding='utf-8') as file:
                    self.wfile.write(bytes(file.read(), "utf-8"))
            
            elif path == "/style.css":
                self.send_response(200)
                self.send_header("Content-type", "text/css; charset=utf-8")
                self.end_headers()
                with open('play/style.css', encoding='utf-8') as file:
                    self.wfile.write(bytes(file.read(), 'utf-8'))
            
            elif path == "/code.js":
                self.send_response(200)
                self.send_header("Content-type", "text/javascript; charset=utf-8")
                self.end_headers()
                with open('play/code.js', encoding='utf-8') as file:
                    self.wfile.write(bytes(file.read(), 'utf-8'))
            
        elif self.path.startswith("/create_account"):
            path = self.path.removeprefix("/create_account")
            if path == "/":
                self.send_response(200)
                self.send_header("Content-type", "text/html; charset=utf-8")
                self.end_headers()
                with open("account_creation/account_creation_page.html", encoding='utf-8') as file:
                    self.wfile.write(bytes(file.read(), 'utf-8'))
            
            elif path == "/style_creation.css":
                self.send_response(200)
                self.send_header("Content-type", "text/css; charset=utf-8")
                self.end_headers()
                with open("account_creation/style_creation.css", encoding='utf-8') as file:
                    self.wfile.write(bytes(file.read(), 'utf-8'))
            
            elif path == "/code_creation.js":
                self.send_response(200)
                self.send_header("Content-type", "text/javascript; charset=utf-8")
                self.end_headers()
                with open("account_creation/code_creation.js", encoding='utf-8') as file:
                    self.wfile.write(bytes(file.read(), 'utf-8'))
            
        elif self.path.startswith("/login"):
            path = self.path.removeprefix("/login")
            if path == "/":
                self.send_response(200)
                self.send_header("Content-type", "text/html; charset=utf-8")
                self.end_headers()
                with open("login/login.html", encoding='utf-8') as file:
                    self.wfile.write(bytes(file.read(), 'utf-8'))
            
            elif path == "/login_style.css":
                self.send_response(200)
                self.send_header("Content-type", "text/css; charset=utf-8")
                self.end_headers()
                with open("login/login_style.css", encoding='utf-8') as file:
                    self.wfile.write(bytes(file.read(), 'utf-8'))
            
            elif path == "/login_script.js":
                self.send_response(200)
                self.send_header("Content-type", "text/javascript; charset=utf-8")
                self.end_headers()
                with open("login/login_script.js", encoding='utf-8') as file:
                    self.wfile.write(bytes(file.read(), 'utf-8'))
            
            elif path  == "/login_anonym":
                self.send_response(200)
                key = new_temp_key()
                d_m.add_user(str(key), "")
                db_key = d_m.connect(str(key), "")
                print("login_anonym")
                d_m.update_user_temp_key_from_db_key(db_key, key)
                self.send_response(200)
                self.send_header("Content-type", "text/json; charset=utf-8")
                self.end_headers()
                self.wfile.write(bytes(json.dumps({"token": key}),"utf-8"))
        
        else:
            self.send_response(404)
            self.send_header("Content-type", "text/html")
            self.end_headers()
            self.wfile.write(bytes("<html><head><title>Page not found</title></head>", "utf-8"))
            self.wfile.write(bytes("<p>Error 404</p>", "utf-8"))
            self.wfile.write(bytes("<p>Request: %s</p>" % self.path, "utf-8"))
            self.wfile.write(bytes("<body>", "utf-8"))
            self.wfile.write(bytes("<p>No route found for this request</p>", "utf-8"))
            self.wfile.write(bytes("</body></html>", "utf-8"))
            return

    def do_POST(self):
        length = int(self.headers['content-length'])
        raw = self.rfile.read(length).decode()
        parsed = json.loads(raw)
        token = parsed["token"]
        status = 404
        response = {}
        if self.path == "/create_account":
            if d_m.add_user(parsed['username'], parsed['password']):
                self.send_response(201)
                self.end_headers()
            else:
                self.send_response(401)
                self.end_headers()
        
        elif self.path == "/login":
            db_key = d_m.connect(parsed['username'], parsed['password'])
            if db_key != None:
                key = new_temp_key()
                print("login")
                d_m.update_user_temp_key_from_db_key(db_key, key)
                token = key
                self.send_response(200)
                self.send_header("Content-type", "text/json; charset=utf-8")
                self.end_headers()
            else:
                self.send_response(401)
                self.send_header("Content-type", "text/json; charset=utf-8")
                self.end_headers()
        
        elif self.path == "/game/new_text":
            id = len(texts)
            title, text, timer = parsed['title'], parsed['text'], parsed['timer']
            title_sizes = game.to_list(title)
            text_sizes = game.to_list(text)
            texts[id] = {"title": title, "text": text, "title_sizes": title_sizes, "text_sizes": text_sizes, "timer": timer}
            self.send_response(200)
            self.send_header("Content-type", "text/json; charset=utf-8")
            self.end_headers()
            response["id"] = str(id)
        
        elif self.path == "/get_text":
            id = int(parsed["id"])
            print(f"{id = }, {len(texts) = }")
            if id < len(texts):
                self.send_response(200)
                self.send_header("Content-type", "text/json; charset=utf-8")
                self.end_headers()
                value = {"title": texts[id]["title"], "text": texts[id]["text"], "timer": texts[id]["timer"]}
                response.update(value)
            else:
                self.send_response(401)
                self.send_header("Content-type", "text/json; charset=utf-8")
                self.end_headers()
        
        elif self.path == "/get_indexes":
            id = int(parsed["id"])
            text = texts[id]
            title_sizes = text["title_sizes"]
            text_sizes = text["text_sizes"]
            title_dict = game.to_dict(title_sizes)
            text_dict = game.to_dict(text_sizes)
            timer = text["timer"]
            self.send_response(200)
            self.send_header("Content-type", "text/json; charset=utf-8")
            self.end_headers()
            json_sizes = {"title": title_dict, "text": text_dict, "timer": timer}
            response.update(json_sizes)
        
        elif self.path == "/game/submit_word":
            word = parsed['word']
            id = int(parsed['id'])
            title = game.find_word(word, texts[id]["title_sizes"])
            text = game.find_word(word, texts[id]["text_sizes"])
            sizes = {"title": title, "text": text}
            self.send_response(200)
            self.send_header("Content-type", "text/json; charset=utf-8")
            self.end_headers()
            response.update(sizes)
        
        elif self.path == "/get_text_infos":
            length = int(self.headers['content-length'])
            id = int(parsed["id"])
            self.send_response(200)
            self.send_header("Content-type", "text/json; charset=utf-8")
            self.end_headers()
            value = d_m.get_text_infos(id)
            response["text"] = value[0]
            response["timer"] = value[1]
        
        elif self.path == "/game/save":
            d_m.add_to_database(parsed["title"], parsed["text"], token, int(parsed["timer"]))
            self.send_response(200)
            self.end_headers()
        
        elif self.path == "/game/texts_db":
            db_texts = d_m.get_texts_keys(token)
            self.send_response(200)
            self.send_header("Content-type", "text/json; charset=utf-8")
            self.end_headers()
            response["texts"] = db_texts
        
        elif self.path == "/game/disconnect":
            d_m.disconnect(token)
            self.send_response(200)
            self.end_headers()
        
        elif self.path == "/delete":
            d_m.remove(parsed["key"])
            self.send_response(200)
            self.end_headers()
        else:
            return
        
        key = new_temp_key()
        d_m.update_user_temp_key_from_temp_key(token, key)
        response["token"] = key
        print(f'Path = {self.path}\nparsed json = {parsed}\nlast token = {token}, new token = {key}')
        self.wfile.write(bytes(json.dumps(response), 'utf-8'))
        print("SEND")
        print()


# FUNCTIONS
def new_temp_key():
    return str(time_ns())+uuid.uuid4().hex


# VARIABLES
NB_MAX_USERS = 100
texts = {}


# LOOP
if __name__ == "__main__":        
    webServer = HTTPServer((hostName, serverPort), MyServer)
    print("Server started at http://%s:%s" % (hostName, serverPort))

    try:
        webServer.serve_forever()
    except KeyboardInterrupt:
        pass

    webServer.server_close()
    print("Server stopped.")

