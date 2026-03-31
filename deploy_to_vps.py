#!/usr/bin/env python3
"""
Deploy-Skript: Überträgt alle Dateien aus dem lokalen dist/-Verzeichnis
auf den VPS nach /var/www/katalog.arelogic.space/dist/browser/
und passt die Nginx-Konfiguration an (root zeigt auf statische HTML-Dateien).
"""

import paramiko
import os
import sys

# === Konfiguration ===
VPS_HOST = "46.202.154.25"
VPS_USER = "root"
VPS_PASS = "2N00py123+++"
LOCAL_DIR = "/home/ubuntu/3dkatalo/dist"
REMOTE_DIR = "/var/www/katalog.arelogic.space/dist/browser"
NGINX_CONF = "/etc/nginx/sites-available/katalog.arelogic.space"

# === Verbindung aufbauen ===
print(f"[1/4] Verbinde mit {VPS_HOST} ...")
client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(VPS_HOST, username=VPS_USER, password=VPS_PASS, timeout=30)
print("      Verbunden.")

# === Zielverzeichnis erstellen und leeren ===
print(f"[2/4] Bereite Zielverzeichnis vor: {REMOTE_DIR}")
stdin, stdout, stderr = client.exec_command(
    f"mkdir -p {REMOTE_DIR} && rm -rf {REMOTE_DIR}/* && echo OK"
)
out = stdout.read().decode().strip()
err = stderr.read().decode().strip()
print(f"      Ergebnis: {out}")
if err:
    print(f"      Warnung: {err}")

# === Dateien hochladen via SFTP ===
print(f"[3/4] Lade Dateien hoch ...")
sftp = client.open_sftp()
files = [f for f in os.listdir(LOCAL_DIR) if os.path.isfile(os.path.join(LOCAL_DIR, f))]
total = len(files)
for i, filename in enumerate(files, 1):
    local_path = os.path.join(LOCAL_DIR, filename)
    remote_path = f"{REMOTE_DIR}/{filename}"
    sftp.put(local_path, remote_path)
    print(f"      [{i}/{total}] {filename}")
sftp.close()
print(f"      Alle {total} Dateien übertragen.")

# === Nginx-Konfiguration anpassen ===
print(f"[4/4] Passe Nginx-Konfiguration an ...")
nginx_config = f"""server {{
    server_name katalog.arelogic.space;
    root {REMOTE_DIR};
    index index.html;

    location / {{
        try_files $uri $uri/ /index.html;
    }}

    listen 443 ssl; # managed by Certbot
    ssl_certificate /etc/letsencrypt/live/arelogic.space-0001/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/arelogic.space-0001/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
}}

server {{
    listen 80;
    server_name katalog.arelogic.space;
    return 301 https://$host$request_uri;
}}
"""

# Konfiguration via SFTP schreiben
sftp2 = client.open_sftp()
with sftp2.open(NGINX_CONF, 'w') as f:
    f.write(nginx_config)
sftp2.close()
print("      Nginx-Konfiguration geschrieben.")

# Nginx testen und neu laden
stdin, stdout, stderr = client.exec_command("nginx -t 2>&1 && systemctl reload nginx && echo NGINX_OK")
result = stdout.read().decode().strip()
err2 = stderr.read().decode().strip()
print(f"      {result}")
if err2:
    print(f"      {err2}")

client.close()
print("\n✅ Deploy abgeschlossen!")
print("   Erreichbar unter: https://katalog.arelogic.space")
