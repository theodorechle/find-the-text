import sqlite3

database = sqlite3.connect("database.db")
cursor = database.cursor()

def get_key_from_temp_key(temp_key):
    return cursor.execute(f'SELECT key FROM users WHERE temp_key = ?', (temp_key,)).fetchone()[0]

def add_to_database(name, text, temp_key, timer):
    key = get_key_from_temp_key(temp_key)
    cursor.execute(f'INSERT INTO Textes(name, text, user_key, timer) VALUES("?", "?", ?, ?)', (name, text, key, timer))
    database.commit()

def get_texts_keys(temp_key):
    user_key = get_key_from_temp_key(temp_key)
    return cursor.execute("SELECT key, name FROM Textes WHERE user_key = ?",(user_key,)).fetchall()

def get_text_infos(id):
    infos = cursor.execute("SELECT text, timer FROM Textes WHERE key = ?", (id,)).fetchall()
    return infos[0]

def connect(username, password):
    name = cursor.execute(f'SELECT key FROM users WHERE username = ? AND password = ? AND temp_key IS NULL',(username, password)).fetchone()
    if name:
        return name[0]

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

def update_user_temp_key_from_db_key(db_key, temp_key):
    cursor.execute(f"UPDATE users SET temp_key = ? WHERE key = ?", (temp_key, db_key))
    database.commit()

def update_user_temp_key_from_temp_key(old_key, new_key):
    print(f"{old_key = }, {new_key = }")
    cursor.execute("UPDATE users SET temp_key = ? WHERE temp_key = ?", (new_key, old_key))
    database.commit()

def remove(key):
    cursor.execute('DELETE FROM Textes WHERE key = ?', (key,))
    database.commit()

def delete_account(key):
    cursor.execute('DELETE FROM users WHERE key = ?', (key,))
    cursor.execute('DELETE FROM Textes WHERE user_key = ?', (key,))
    database.commit()

def disconnect(temp_key):
    key = cursor.execute("SELECT key FROM users WHERE temp_key = ? AND password = ''", (temp_key,)).fetchone()
    if key:
        delete_account(key[0])
        print("account deleted")
    else:
        cursor.execute("UPDATE users SET temp_key = NULL WHERE temp_key = ?", (temp_key,))
        database.commit()
        print("account disconnected")