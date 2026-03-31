#!/usr/bin/env python3
"""Überträgt nur catalog.js auf den VPS (schneller Patch-Deploy)."""
import paramiko

VPS_HOST   = "46.202.154.25"
VPS_USER   = "root"
VPS_PASS   = "2N00py123+++"
LOCAL_FILE = "/home/ubuntu/3dkatalo/dist/catalog.js"
REMOTE_DIR = "/var/www/katalog.arelogic.space/dist/browser"

print("Verbinde …")
client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(VPS_HOST, username=VPS_USER, password=VPS_PASS, timeout=30)

sftp = client.open_sftp()
sftp.put(LOCAL_FILE, f"{REMOTE_DIR}/catalog.js")
sftp.close()
print("✓ catalog.js übertragen.")

stdin, stdout, stderr = client.exec_command("systemctl reload nginx && echo OK")
print("Nginx:", stdout.read().decode().strip())
client.close()
print("✅ Fertig — https://katalog.arelogic.space")
