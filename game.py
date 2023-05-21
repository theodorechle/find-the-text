split_chars = (" ",",","?",".",";","/",":","!","'",'"',"\n","\t","`","\\","|","-","_")

def find_word(word, text):
    word = word.lower()
    indexes = []
    for i, w in enumerate(text):
        #print("find_word :",w, i, word)
        if w[0].lower() == word:
            indexes += [[i, w[0]]]
    #print(indexes)
    return indexes


def to_list(text):
    final_list = [["",0]]
    is_last_split = False
    for char in text:
        if char in split_chars:
            if is_last_split:
                final_list[-1][0] += char
            else:
                final_list.append([char,1])
            is_last_split = True
        else:
            if is_last_split:
                final_list.append([char,0])
            else:
                final_list[-1][0] += char
            is_last_split = False
    return final_list

def to_dict(list):
    return {"indexes": [(len(str(word)),word if hide else "") for word,hide in list]}