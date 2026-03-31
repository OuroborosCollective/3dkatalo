#!/usr/bin/env python3
"""Überträgt sell_asset.html und catalog.js auf den VPS."""
import paramiko

VPS_HOST   = "46.202.154.25"
VPS_USER   = "root"
VPS_PASS   = "2N00py123+++"
REMOTE_DIR = "/var/www/katalog.arelogic.space/dist/browser"
FILES      = [
    "/home/ubuntu/3dkatalo/dist/sell_asset.html",
    "/home/ubuntu/3dkatalo/dist/catalog.js",
]

print("Verbinde …")
client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(VPS_HOST, username=VPS_USER, password=VPS_PASS, timeout=30)

sftp = client.open_sftp()
for local in FILES:
    fname = local.split('/')[-1]
    sftp.put(local, f"{REMOTE_DIR}/{fname}")
    print(f"  ✓ {fname}")
sftp.close()

stdin, stdout, stderr = client.exec_command("systemctl reload nginx && echo OK")
print("Nginx:", stdout.read().decode().strip())
client.close()
print("✅ https://katalog.arelogic.space/sell_asset.html")
