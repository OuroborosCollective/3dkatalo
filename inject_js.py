#!/usr/bin/env python3
"""
inject_js.py
- Fügt catalog.js in alle HTML-Dateien im dist/-Verzeichnis ein
- Korrigiert alle Navigationslinks (href="#" → korrekte Seite)
- Verdrahtet Upload-Button, Bottom-Nav und Sidebar-Links
"""

import os
import re
from bs4 import BeautifulSoup

DIST = "/home/ubuntu/3dkatalo/dist"

# Vollständiges Navigations-Mapping
NAV = {
    "Swords":           "sword_management_interactive_prototype.html",
    "Axes":             "two_handed_axes_collection_multi_tier_3d_1.html",
    "Plate Armor":      "plate_armor_management_interactive_prototype.html",
    "Grimoires":        "magic_wands_collection_interactive_prototype_1.html",
    "Dolche":           "sword_inventory_management.html",
    "Lederrüstung":     "leather_armor_collection_30_concepts_1.html",
    "Stoffrüstung":     "cloth_armor_multi_tier_3d_1.html",
    "Ancient Runes":    "ancient_decree_scroll_draft.html",
    "Quest Logs":       "registry_of_imperial_decrees.html",
    "Bestiary":         "pets_collection_interactive_prototype.html",
    "The Vault":        "runic_laws_imperial_archives.html",
    "Support":          "scholar_s_guide_support.html",
    "Exit":             "index.html",
    "The Armory":       "index.html",
    "Dolche":           "sword_inventory_management.html",
    "Lederrüstung":     "leather_armor_collection_30_concepts_1.html",
    "Stoffrüstung":     "cloth_armor_multi_tier_3d_1.html",
    "NPCs":             "npc_collection_interactive_prototype.html",
    "Pets":             "pets_collection_interactive_prototype.html",
    "Spears":           "spears_collection_multi_tier_3d.html",
    "Settings":         "settings_archivist_preferences.html",
    "Market":           "sell_asset.html",
    "Upload":           "upload_asset.html",
    "Category":         "sword_category_management.html",
    "Manage":           "index.html",
    "Catalog":          "index.html",
    "Archives":         "registry_of_imperial_decrees.html",
    "Armory":           "index.html",
    "Decrees":          "registry_of_imperial_decrees.html",
    "Codex":            "runic_laws_imperial_archives.html",
    "Lineage":          "npc_collection_interactive_prototype.html",
    "Vault":            "runic_laws_imperial_archives.html",
    "Grimoire":         "magic_wands_collection_interactive_prototype_1.html",
    "Wands":            "magic_wands_collection_interactive_prototype_1.html",
    "Shields":          "sword_shield_collection_multi_tier_3d.html",
    "Two-Handed":       "two_handed_swords_collection_multi_tier_3d_1.html",
    "Marketplace":      "sell_asset.html",
    "Exchange":         "sell_asset.html",
}

# Bottom-Nav Button-Labels
BOTTOM_NAV = {
    "Manage":   "index.html",
    "Upload":   "upload_asset.html",
    "Category": "sword_category_management.html",
    "Market":   "sell_asset.html",
}

html_files = [f for f in os.listdir(DIST) if f.endswith('.html')]
print(f"Verarbeite {len(html_files)} HTML-Dateien...")

for filename in html_files:
    filepath = os.path.join(DIST, filename)
    with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()

    soup = BeautifulSoup(content, 'html.parser')

    # 1) catalog.js einbetten (falls noch nicht vorhanden)
    if 'catalog.js' not in content:
        script_tag = soup.new_tag('script', src='catalog.js')
        if soup.body:
            soup.body.append(script_tag)
        elif soup.html:
            soup.html.append(script_tag)

    # 2) Alle href="#" Links korrigieren
    for a in soup.find_all('a', href=True):
        if a['href'] in ('#', '', 'javascript:void(0)'):
            label = a.get_text(strip=True)
            # Exakter Match
            if label in NAV:
                a['href'] = NAV[label]
            else:
                # Partieller Match
                for key, val in NAV.items():
                    if key.lower() in label.lower() or label.lower() in key.lower():
                        a['href'] = val
                        break
                else:
                    a['href'] = 'index.html'

    # 3) Upload-Button onclick hinzufügen
    for btn in soup.find_all('button'):
        txt = btn.get_text(strip=True).lower()
        icon_el = btn.find(class_='material-symbols-outlined')
        icon = icon_el.get_text(strip=True) if icon_el else ''

        if ('upload new concept' in txt or txt == 'upload') and 'onclick' not in btn.attrs:
            btn['onclick'] = "openUploadModal()"

        # Bottom-Nav Buttons
        spans = btn.find_all('span')
        for sp in spans:
            label = sp.get_text(strip=True)
            if label in BOTTOM_NAV and 'onclick' not in btn.attrs:
                if label == 'Upload':
                    btn['onclick'] = "openUploadModal()"
                else:
                    btn['onclick'] = f"window.location.href='{BOTTOM_NAV[label]}'"

    # 4) Settings-Button im Header verdrahten
    for btn in soup.find_all('button'):
        icon_el = btn.find(class_='material-symbols-outlined')
        if icon_el and icon_el.get_text(strip=True) == 'settings' and 'onclick' not in btn.attrs:
            btn['onclick'] = "window.location.href='settings_archivist_preferences.html'"

    # 5) Enchant Item Button
    for btn in soup.find_all('button'):
        txt = btn.get_text(strip=True)
        if 'Enchant Item' in txt and 'onclick' not in btn.attrs:
            btn['onclick'] = "openUploadModal()"

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(str(soup))

print("✅ Alle HTML-Dateien aktualisiert.")
print(f"   - catalog.js eingebettet")
print(f"   - Navigationslinks korrigiert")
print(f"   - Buttons verdrahtet")
