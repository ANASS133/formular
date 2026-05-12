import sys

with open('new.html', 'r', encoding='utf-8') as f:
    text = f.read()

def fix(t):
    res = ''
    for char in t:
        try:
            # Check if character is in the arabic range of windows-1256 or similar?
            # Actually, standard mojibake is utf-8 decoded as cp1252.
            pass
        except:
            pass
    return t

try:
    fixed = text.encode('cp1252').decode('utf-8')
    with open('new_fixed.html', 'w', encoding='utf-8') as f:
        f.write(fixed)
    print('Fixed successfully')
except Exception as e:
    print('Error:', e)
