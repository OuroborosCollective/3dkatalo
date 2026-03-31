#!/usr/bin/env python3
"""
inject_js2.py – Korrigiert Sidebar-Links mit Icon-Text-Bereinigung
"""

import os
import re
from bs4 import BeautifulSoup

DIST = "/home/ubuntu/3dkatalo/dist"

NAV = {
    "The Armory":       "index.html",
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
    "Wands":            "magic_wands_collection_interactive_prototype_1.html",
    "Shields":          "sword_shield_collection_multi_tier_3d.html",
    "Marketplace":      "sell_asset.html",
    "Exchange":         "sell_asset.html",
}

# Material Symbols Icon-Namen (werden aus Text entfernt)
ICON_NAMES = {
    'shield','colorize','apparel','checkroom','auto_fix_high','history_edu',
    'pets','lock','help','logout','menu_book','settings','grid_view',
    'upload_file','category','storefront','add_circle','sell','edit',
    '3d_rotation','swords','arrow_back','cloud_upload','check_circle',
    'radio_button_unchecked','image','add_photo_alternate','sell',
}

def clean_label(text):
    """Entfernt Material-Icon-Namen aus dem Text."""
    words = text.strip().split()
    cleaned = [w for w in words if w.lower() not in ICON_NAMES]
    return ' '.join(cleaned).strip()

BOTTOM_NAV = {
    "Manage":   "index.html",
    "Upload":   "upload_asset.html",
    "Category": "sword_category_management.html",
    "Market":   "sell_asset.html",
}

html_files = [f for f in os.listdir(DIST) if f.endswith('.html')]
print(f"Verarbeite {len(html_files)} HTML-Dateien...")

fixed_links = 0

for filename in html_files:
    filepath = os.path.join(DIST, filename)
    with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()

    soup = BeautifulSoup(content, 'html.parser')

    # Alle Links korrigieren (auch solche die bereits index.html haben aber falsch sind)
    for a in soup.find_all('a', href=True):
        raw_label = a.get_text(strip=True)
        label = clean_label(raw_label)

        if label in NAV:
            new_href = NAV[label]
            if a['href'] != new_href:
                a['href'] = new_href
                fixed_links += 1
        elif a['href'] in ('#', '', 'javascript:void(0)'):
            # Partieller Match
            for key, val in NAV.items():
                if key.lower() in label.lower() or label.lower() in key.lower():
                    a['href'] = val
                    fixed_links += 1
                    break
            else:
                a['href'] = 'index.html'

    # Bottom-Nav Buttons
    for btn in soup.find_all('button'):
        spans = btn.find_all('span')
        for sp in spans:
            label = sp.get_text(strip=True)
            if label in BOTTOM_NAV:
                if label == 'Upload':
                    btn['onclick'] = "openUploadModal()"
                else:
                    btn['onclick'] = f"window.location.href='{BOTTOM_NAV[label]}'"

    # Settings-Button
    for btn in soup.find_all('button'):
        icon_el = btn.find(class_='material-symbols-outlined')
        if icon_el and icon_el.get_text(strip=True) == 'settings' and 'onclick' not in btn.attrs:
            btn['onclick'] = "window.location.href='settings_archivist_preferences.html'"

    # Upload-Button
    for btn in soup.find_all('button'):
        txt = btn.get_text(strip=True).lower()
        if 'upload new concept' in txt and 'onclick' not in btn.attrs:
            btn['onclick'] = "openUploadModal()"

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(str(soup))

print(f"✅ Fertig. {fixed_links} Links korrigiert.")
