import os

with open('new.html', 'rb') as f:
    raw = f.read()

# The issue is that the text was UTF-8 encoded, then parsed as windows-1252, and saved back as UTF-8.
# We can reverse this: utf8 string -> encode windows-1252 -> decode utf8.
# Wait, some characters in windows-1252 might have been lost or mapped to '?' or similar.
# Let's try reversing it via latin1 which safely preserves bytes.

text = raw.decode('utf-8')
try:
    recovered = text.encode('windows-1252').decode('utf-8')
    with open('new_recovered.html', 'w', encoding='utf-8') as f:
        f.write(recovered)
    print("Recovered with windows-1252")
except Exception as e:
    print("windows-1252 failed:", e)
    try:
        recovered = text.encode('latin1').decode('utf-8')
        with open('new_recovered.html', 'w', encoding='utf-8') as f:
            f.write(recovered)
        print("Recovered with latin1")
    except Exception as e2:
        print("latin1 failed:", e2)
        
