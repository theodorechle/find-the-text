import sqlite3

database = sqlite3.connect("database.db")
cursor = database.cursor()

def get_key_from_temp_key(temp_key):
    return list(cursor.execute(f'SELECT key FROM users WHERE temp_key = "{temp_key}"'))[0][0]

def add_to_database(name, text, temp_key, timer):
    key = get_key_from_temp_key(temp_key)
    cursor.execute(f'INSERT INTO Textes(name, text, user_key, timer) VALUES("{name}", "{text}", {key}, {timer})')
    database.commit()

def get_texts_keys(temp_key):
    user_key = get_key_from_temp_key(temp_key)
    return list(cursor.execute("SELECT key, name FROM Textes WHERE user_key = ?",(user_key,)))

def get_text_infos(id):
    infos = list(cursor.execute("SELECT text, timer FROM Textes WHERE key = ?", (id,)))
    return infos[0]

def connect(username, password):
    name = list(cursor.execute(f'SELECT key, temp_key FROM users WHERE username = ? AND password = ?',(username, password)))
    if name and name[0][1] == None:
        return name[0][0]

def is_new_username(username):
    result = cursor.execute(f"SELECT count(*) FROM users WHERE username = '{username}'")
    value = result.fetchone()[0]
    return value == 0

def add_user(username, password):
    if is_new_username(username):
        cursor.execute('INSERT INTO users(username, password) VALUES(?,?)',(username,password))
        database.commit()
        return True
    return False

def update_user_temp_key(db_key, new_token):
    cursor.execute(f"UPDATE users SET temp_key = '{new_token}' WHERE key = '{db_key}'")
    database.commit()

def remove(key):
    cursor.execute('DELETE FROM Textes WHERE key = ?', (key,))
    database.commit()

def disconnect(temp_key):
    cursor.execute("UPDATE users SET temp_key = NULL WHERE temp_key = ?", (temp_key,))
    database.commit()