import os
import re
from bs4 import BeautifulSoup

base_dir = "/home/ubuntu/3dkatalo/stitch_mmorpg_concept_art_prd"
output_dir = "/home/ubuntu/3dkatalo/dist"

if not os.path.exists(output_dir):
    os.makedirs(output_dir)

# Mapping von Navigationsnamen zu Verzeichnissen (basierend auf der Analyse)
nav_mapping = {
    "Swords": "sword_management_interactive_prototype",
    "Axes": "two_handed_axes_collection_multi_tier_3d_1",
    "Plate Armor": "plate_armor_management_interactive_prototype",
    "Grimoires": "magic_wands_collection_interactive_prototype_1", # Platzhalter für Magie
    "Dolche": "sword_inventory_management", # Platzhalter
    "Lederrüstung": "leather_armor_collection_30_concepts_1",
    "Stoffrüstung": "cloth_armor_collection_30_concepts_1",
    "Ancient Runes": "ancient_decree_scroll_draft",
    "Quest Logs": "registry_of_imperial_decrees",
    "Bestiary": "pets_collection_interactive_prototype",
    "The Vault": "runic_laws_imperial_archives",
    "Support": "scholar_s_guide_support",
    "The Armory": "the_master_s_ledger_armory_management_flow",
    "Market": "the_great_exchange_blade_marketplace"
}

def slugify(text):
    return text.lower().replace(" ", "_").replace("&", "and")

# Alle code.html Dateien finden
html_files = []
for root, dirs, files in os.walk(base_dir):
    if "code.html" in files:
        html_files.append(os.path.join(root, "code.html"))

# Dateien kopieren und Links anpassen
for file_path in html_files:
    rel_path = os.path.relpath(os.path.dirname(file_path), base_dir)
    new_filename = f"{rel_path.replace(os.sep, '_')}.html"
    if rel_path == "the_master_s_ledger_armory_management_flow":
        new_filename = "index.html"
    
    with open(file_path, 'r', encoding='utf-8') as f:
        soup = BeautifulSoup(f, 'html.parser')
    
    # Links anpassen
    for a in soup.find_all('a', href=True):
        link_text = a.get_text(strip=True)
        if a['href'] == "#":
            if link_text in nav_mapping:
                target = nav_mapping[link_text]
                a['href'] = f"{target.replace(os.sep, '_')}.html"
                if target == "the_master_s_ledger_armory_management_flow":
                    a['href'] = "index.html"
            else:
                # Fallback für unbekannte Links
                a['href'] = "index.html"
    
    # Spezielle Buttons (Market, etc.)
    for btn in soup.find_all('button'):
        btn_text = btn.get_text(strip=True)
        if "Market" in btn_text:
            # Button in Link umwandeln oder onclick hinzufügen
            btn['onclick'] = "window.location.href='the_great_exchange_blade_marketplace.html'"

    with open(os.path.join(output_dir, new_filename), 'w', encoding='utf-8') as f:
        f.write(str(soup))

print(f"Website generiert in {output_dir}")
