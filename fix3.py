import os

with open('new.html', 'rb') as f:
    raw = f.read()

text = raw.decode('utf-8-sig') # strips BOM

try:
    recovered = text.encode('windows-1252').decode('utf-8')
    with open('new.html', 'w', encoding='utf-8') as f:
        f.write(recovered)
    print("Recovered with windows-1252")
except Exception as e:
    print("windows-1252 failed:", e)
    # let's try replacing undefined characters
    try:
        recovered = text.encode('windows-1252', errors='ignore').decode('utf-8', errors='ignore')
        with open('new.html', 'w', encoding='utf-8') as f:
            f.write(recovered)
        print("Recovered with windows-1252 ignore")
    except Exception as e2:
        pass
