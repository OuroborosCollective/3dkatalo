#!/usr/bin/env python3
"""
fix_sidebar.py – Korrigiert Sidebar-Links die Icon-Text enthalten
"""
import os, re
from bs4 import BeautifulSoup

DIST = "/home/ubuntu/3dkatalo/dist"

# Mapping: enthaltener Substring → Ziel
CONTAINS_MAP = [
    ("The Armory",    "index.html"),
    ("Dolche",        "sword_inventory_management.html"),
    ("Lederrüstung",  "leather_armor_collection_30_concepts_1.html"),
    ("Stoffrüstung",  "cloth_armor_multi_tier_3d_1.html"),
    ("Ancient Runes", "ancient_decree_scroll_draft.html"),
    ("Quest Logs",    "registry_of_imperial_decrees.html"),
    ("Bestiary",      "pets_collection_interactive_prototype.html"),
    ("The Vault",     "runic_laws_imperial_archives.html"),
    ("Support",       "scholar_s_guide_support.html"),
    ("Exit",          "index.html"),
    ("Swords",        "sword_management_interactive_prototype.html"),
    ("Axes",          "two_handed_axes_collection_multi_tier_3d_1.html"),
    ("Plate Armor",   "plate_armor_management_interactive_prototype.html"),
    ("Grimoires",     "magic_wands_collection_interactive_prototype_1.html"),
    ("NPCs",          "npc_collection_interactive_prototype.html"),
    ("Pets",          "pets_collection_interactive_prototype.html"),
    ("Spears",        "spears_collection_multi_tier_3d.html"),
    ("Settings",      "settings_archivist_preferences.html"),
    ("Market",        "sell_asset.html"),
    ("Upload",        "upload_asset.html"),
    ("Category",      "sword_category_management.html"),
    ("Manage",        "index.html"),
    ("Catalog",       "index.html"),
    ("Archives",      "registry_of_imperial_decrees.html"),
    ("Armory",        "index.html"),
    ("Decrees",       "registry_of_imperial_decrees.html"),
    ("Codex",         "runic_laws_imperial_archives.html"),
    ("Vault",         "runic_laws_imperial_archives.html"),
    ("Wands",         "magic_wands_collection_interactive_prototype_1.html"),
    ("Shields",       "sword_shield_collection_multi_tier_3d.html"),
    ("Marketplace",   "sell_asset.html"),
    ("Exchange",      "sell_asset.html"),
]

html_files = [f for f in os.listdir(DIST) if f.endswith('.html')]
total_fixed = 0

for filename in html_files:
    filepath = os.path.join(DIST, filename)
    with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()

    soup = BeautifulSoup(content, 'html.parser')
    changed = False

    for a in soup.find_all('a', href=True):
        raw = a.get_text(strip=True)
        for label, target in CONTAINS_MAP:
            if label in raw:
                if a['href'] != target:
                    a['href'] = target
                    total_fixed += 1
                    changed = True
                break

    if changed:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(str(soup))

print(f"✅ {total_fixed} Sidebar-Links korrigiert.")
