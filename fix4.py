import os

with open('new.html', 'rb') as f:
    raw = f.read()

# remove UTF-8 BOM if present
if raw.startswith(b'\xef\xbb\xbf'):
    raw = raw[3:]

text = raw.decode('utf-8')

try:
    recovered = text.encode('cp1252').decode('utf-8')
    with open('new.html', 'w', encoding='utf-8') as f:
        f.write(recovered)
    print('Fully recovered!')
except Exception as e:
    print('Error:', e)
    # try byte by byte replacement or ignore
    recovered2 = text.encode('cp1252', 'ignore').decode('utf-8', 'ignore')
    with open('new.html', 'w', encoding='utf-8') as f:
        f.write(recovered2)
    print('Recovered with ignore')
