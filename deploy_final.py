#!/usr/bin/env python3
"""
deploy_final.py – Überträgt alle Dateien aus dist/ auf den VPS
"""
import paramiko, os

VPS_HOST   = "46.202.154.25"
VPS_USER   = "root"
VPS_PASS   = "2N00py123+++"
LOCAL_DIR  = "/home/ubuntu/3dkatalo/dist"
REMOTE_DIR = "/var/www/katalog.arelogic.space/dist/browser"

print(f"[1/3] Verbinde mit {VPS_HOST} ...")
client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(VPS_HOST, username=VPS_USER, password=VPS_PASS, timeout=30)
print("      Verbunden.")

# Zielverzeichnis leeren
stdin, stdout, stderr = client.exec_command(
    f"mkdir -p {REMOTE_DIR} && rm -rf {REMOTE_DIR}/* && echo OK"
)
print(f"      Verzeichnis: {stdout.read().decode().strip()}")

# Dateien hochladen
print(f"[2/3] Lade Dateien hoch ...")
sftp = client.open_sftp()
files = sorted([f for f in os.listdir(LOCAL_DIR) if os.path.isfile(os.path.join(LOCAL_DIR, f))])
total = len(files)
for i, filename in enumerate(files, 1):
    local_path  = os.path.join(LOCAL_DIR, filename)
    remote_path = f"{REMOTE_DIR}/{filename}"
    sftp.put(local_path, remote_path)
    print(f"      [{i:2d}/{total}] {filename}")
sftp.close()
print(f"      ✓ {total} Dateien übertragen.")

# Nginx neu laden
print(f"[3/3] Nginx neu laden ...")
stdin, stdout, stderr = client.exec_command("nginx -t 2>&1 && systemctl reload nginx && echo NGINX_OK")
result = stdout.read().decode().strip()
print(f"      {result}")
client.close()

print(f"\n✅ Deploy abgeschlossen!")
print(f"   https://katalog.arelogic.space")
