import sqlite3

database = sqlite3.connect("database.db")
cursor = database.cursor()

def add_to_database(name, text, key, timer):
    #print(f"{name = }, {text = }, {key = }")
    cursor.execute(f'INSERT INTO Textes(name, text, user_key, timer) VALUES("{name}", "{text}", {key}, {timer})')
    database.commit()

def get_from_database(user_key):
    #print(user_key)
    return list(cursor.execute("SELECT * FROM Textes WHERE user_key = ?",(user_key,)))

def find_word(word, text_key, user_key):
    splitted_text = get_from_database(text_key, user_key)
    return [i for i in splitted_text if i.lower() == word.lower()]

def connect(username, password):
    name = list(cursor.execute(f'SELECT key FROM users WHERE username = ? AND password = ?',(username, password)))
    if name:
        return name[0][0]

def is_new_username(username):
    result = cursor.execute(f"SELECT count(*) FROM users WHERE username = '{username}'")
    value = result.fetchone()[0]
    return value == 0

def add_user(username, password):
    if is_new_username(username):
        cursor.execute(f'INSERT INTO users(username, password) VALUES(?,?)',(username,password))
        database.commit()
        return True
    return False