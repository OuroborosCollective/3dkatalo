/* ============================================================
   catalog.js  –  Relic & Rune | Shared Catalog Logic
   ============================================================ */

/* ── Farb-Palette (Tailwind-kompatibel, inline genutzt) ─────── */
const C = {
  bg:       '#161311',
  surface:  '#231f1d',
  surfHigh: '#2e2927',
  surfHigh2:'#393431',
  primary:  '#e9c176',
  tertiary: '#00dce5',
  text:     '#eae1dd',
  muted:    '#dac3a2',
  outline:  '#54433a',
  error:    '#ffb4ab',
};

/* ── Hilfsfunktion: Modal-Overlay erzeugen ──────────────────── */
function createOverlay(content) {
  const ov = document.createElement('div');
  ov.id = 'catalog-overlay';
  ov.style.cssText = `
    position:fixed;inset:0;z-index:9999;
    background:rgba(0,0,0,.85);backdrop-filter:blur(4px);
    display:flex;align-items:center;justify-content:center;
    padding:1rem;
  `;
  ov.innerHTML = content;
  ov.addEventListener('click', e => { if (e.target === ov) closeOverlay(); });
  document.body.appendChild(ov);
  document.body.style.overflow = 'hidden';
}

function closeOverlay() {
  const ov = document.getElementById('catalog-overlay');
  if (ov) ov.remove();
  document.body.style.overflow = '';
}

/* ── NAVIGATION-MAPPING ─────────────────────────────────────── */
const NAV = {
  'The Armory':       'index.html',
  'Swords':           'sword_management_interactive_prototype.html',
  'Axes':             'two_handed_axes_collection_multi_tier_3d_1.html',
  'Plate Armor':      'plate_armor_management_interactive_prototype.html',
  'Grimoires':        'magic_wands_collection_interactive_prototype_1.html',
  'Dolche':           'sword_inventory_management.html',
  'Lederrüstung':     'leather_armor_collection_30_concepts_1.html',
  'Stoffrüstung':     'cloth_armor_multi_tier_3d_1.html',
  'Ancient Runes':    'ancient_decree_scroll_draft.html',
  'Quest Logs':       'registry_of_imperial_decrees.html',
  'Bestiary':         'pets_collection_interactive_prototype.html',
  'The Vault':        'runic_laws_imperial_archives.html',
  'Support':          'scholar_s_guide_support.html',
  'Exit':             'index.html',
  'Market':           'sell_asset.html',
  'Upload':           'upload_asset.html',
  'Category':         'sword_category_management.html',
  'Manage':           'index.html',
  'NPCs':             'npc_collection_interactive_prototype.html',
  'Pets':             'pets_collection_interactive_prototype.html',
  'Spears':           'spears_collection_multi_tier_3d.html',
  'Settings':         'settings_archivist_preferences.html',
};

/* ── Alle href="#" und leere Buttons mit Navigation verdrahten ─ */
function wireNavigation() {
  document.querySelectorAll('a[href="#"], a:not([href])').forEach(a => {
    const label = a.textContent.trim();
    const target = NAV[label];
    if (target) a.href = target;
  });
}

/* ── EDIT-MODAL ─────────────────────────────────────────────── */
function openEditModal(card) {
  const title = card.querySelector('h3')?.textContent.trim() || 'Asset';
  const tier  = card.querySelector('p')?.textContent.trim()  || '';
  const imgSrc= card.querySelector('img')?.src || '';

  createOverlay(`
    <div style="
      background:${C.surface};border:1px solid ${C.outline};
      width:100%;max-width:560px;padding:2rem;position:relative;
      font-family:'Space Grotesk',sans-serif;
    ">
      <button onclick="closeOverlay()" style="
        position:absolute;top:1rem;right:1rem;background:none;border:none;
        color:${C.muted};font-size:1.5rem;cursor:pointer;line-height:1;
      ">✕</button>
      <h2 style="color:${C.primary};font-family:'Newsreader',serif;font-size:1.5rem;
                 font-style:italic;margin-bottom:1.5rem;">Edit Asset</h2>

      <label style="color:${C.muted};font-size:.7rem;text-transform:uppercase;
                    letter-spacing:.1em;display:block;margin-bottom:.3rem;">Asset Name</label>
      <input id="edit-name" value="${title}" style="
        width:100%;background:${C.surfHigh2};border:1px solid ${C.outline};
        color:${C.text};padding:.6rem .8rem;margin-bottom:1rem;
        font-family:'Work Sans',sans-serif;font-size:.9rem;box-sizing:border-box;
      "/>

      <label style="color:${C.muted};font-size:.7rem;text-transform:uppercase;
                    letter-spacing:.1em;display:block;margin-bottom:.3rem;">Tier / Rarity</label>
      <select id="edit-tier" style="
        width:100%;background:${C.surfHigh2};border:1px solid ${C.outline};
        color:${C.text};padding:.6rem .8rem;margin-bottom:1rem;
        font-family:'Work Sans',sans-serif;font-size:.9rem;box-sizing:border-box;
      ">
        ${['Common Grade','Rare','Epic','Legendary Tier','Divine Relic','Masterwork','Magical Artifact']
          .map(t=>`<option value="${t}" ${t===tier?'selected':''}>${t}</option>`).join('')}
      </select>

      <label style="color:${C.muted};font-size:.7rem;text-transform:uppercase;
                    letter-spacing:.1em;display:block;margin-bottom:.3rem;">Description</label>
      <textarea id="edit-desc" rows="3" placeholder="Enter asset description…" style="
        width:100%;background:${C.surfHigh2};border:1px solid ${C.outline};
        color:${C.text};padding:.6rem .8rem;margin-bottom:1rem;resize:vertical;
        font-family:'Work Sans',sans-serif;font-size:.9rem;box-sizing:border-box;
      "></textarea>

      <label style="color:${C.muted};font-size:.7rem;text-transform:uppercase;
                    letter-spacing:.1em;display:block;margin-bottom:.3rem;">Replace Preview Image</label>
      <input type="file" id="edit-img" accept="image/*" style="
        width:100%;background:${C.surfHigh2};border:1px solid ${C.outline};
        color:${C.muted};padding:.5rem .8rem;margin-bottom:1.5rem;box-sizing:border-box;
      "/>

      <div style="display:flex;gap:.75rem;justify-content:flex-end;">
        <button onclick="closeOverlay()" style="
          background:none;border:1px solid ${C.outline};color:${C.muted};
          padding:.6rem 1.4rem;cursor:pointer;font-family:'Space Grotesk',sans-serif;
          font-size:.75rem;text-transform:uppercase;letter-spacing:.1em;
        ">Cancel</button>
        <button onclick="saveEdit(this.closest('[style]').parentElement)" style="
          background:${C.primary};border:none;color:#261900;
          padding:.6rem 1.4rem;cursor:pointer;font-family:'Space Grotesk',sans-serif;
          font-size:.75rem;font-weight:700;text-transform:uppercase;letter-spacing:.1em;
        ">Save Changes</button>
      </div>
    </div>
  `);

  // Bild-Vorschau bei Auswahl
  document.getElementById('edit-img').addEventListener('change', function() {
    if (this.files[0]) {
      const reader = new FileReader();
      reader.onload = e => {
        const prev = document.getElementById('edit-img-preview');
        if (prev) prev.src = e.target.result;
      };
      reader.readAsDataURL(this.files[0]);
    }
  });
}

function saveEdit(modal) {
  const name = document.getElementById('edit-name')?.value;
  const tier = document.getElementById('edit-tier')?.value;
  showToast(`✓ "${name}" gespeichert (${tier})`);
  closeOverlay();
}

/* ── EXPORT-DIALOG ──────────────────────────────────────────── */
function openExportDialog(card) {
  const title = card.querySelector('h3')?.textContent.trim() || 'Asset';
  const formats = ['GLB','FBX','USD','Unity Package','OBJ','USDZ'];

  createOverlay(`
    <div style="
      background:${C.surface};border:1px solid ${C.outline};
      width:100%;max-width:480px;padding:2rem;position:relative;
      font-family:'Space Grotesk',sans-serif;
    ">
      <button onclick="closeOverlay()" style="
        position:absolute;top:1rem;right:1rem;background:none;border:none;
        color:${C.muted};font-size:1.5rem;cursor:pointer;
      ">✕</button>
      <h2 style="color:${C.primary};font-family:'Newsreader',serif;font-size:1.5rem;
                 font-style:italic;margin-bottom:.5rem;">Export Asset</h2>
      <p style="color:${C.muted};font-size:.8rem;margin-bottom:1.5rem;">${title}</p>

      <label style="color:${C.muted};font-size:.7rem;text-transform:uppercase;
                    letter-spacing:.1em;display:block;margin-bottom:.75rem;">Select Format</label>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:.5rem;margin-bottom:1.5rem;">
        ${formats.map((f,i) => `
          <label style="
            display:flex;align-items:center;gap:.6rem;
            background:${C.surfHigh2};border:1px solid ${C.outline};
            padding:.6rem .8rem;cursor:pointer;
            font-size:.8rem;color:${C.text};
          ">
            <input type="radio" name="export-fmt" value="${f}" ${i===0?'checked':''}
              style="accent-color:${C.primary};">
            ${f}
          </label>
        `).join('')}
      </div>

      <label style="color:${C.muted};font-size:.7rem;text-transform:uppercase;
                    letter-spacing:.1em;display:block;margin-bottom:.3rem;">LOD Tier</label>
      <select id="export-lod" style="
        width:100%;background:${C.surfHigh2};border:1px solid ${C.outline};
        color:${C.text};padding:.6rem .8rem;margin-bottom:1.5rem;
        font-family:'Work Sans',sans-serif;font-size:.9rem;box-sizing:border-box;
      ">
        <option value="HI">HI – High Detail</option>
        <option value="MD">MD – Medium Detail</option>
        <option value="LO">LO – Low Detail (Mobile)</option>
      </select>

      <button onclick="triggerExport('${title}')" style="
        width:100%;background:${C.tertiary};border:none;color:#002021;
        padding:.75rem;cursor:pointer;font-family:'Space Grotesk',sans-serif;
        font-size:.8rem;font-weight:700;text-transform:uppercase;letter-spacing:.1em;
      ">⬇ Download Export</button>
    </div>
  `);
}

function triggerExport(title) {
  const fmt = document.querySelector('input[name="export-fmt"]:checked')?.value || 'GLB';
  const lod = document.getElementById('export-lod')?.value || 'HI';
  showToast(`⬇ Export gestartet: ${title} · ${fmt} · ${lod}`);
  closeOverlay();
}

/* ── SELL / LIST ASSET ──────────────────────────────────────── */
function openSellModal(card) {
  const title = card.querySelector('h3')?.textContent.trim() || 'Asset';

  createOverlay(`
    <div style="
      background:${C.surface};border:1px solid ${C.outline};
      width:100%;max-width:600px;max-height:90vh;overflow-y:auto;
      padding:2rem;position:relative;font-family:'Space Grotesk',sans-serif;
    ">
      <button onclick="closeOverlay()" style="
        position:absolute;top:1rem;right:1rem;background:none;border:none;
        color:${C.muted};font-size:1.5rem;cursor:pointer;
      ">✕</button>
      <h2 style="color:${C.primary};font-family:'Newsreader',serif;font-size:1.5rem;
                 font-style:italic;margin-bottom:.4rem;">List Asset for Sale</h2>
      <p style="color:${C.muted};font-size:.8rem;margin-bottom:1.5rem;">${title}</p>

      <label style="color:${C.muted};font-size:.7rem;text-transform:uppercase;
                    letter-spacing:.1em;display:block;margin-bottom:.3rem;">Price (€)</label>
      <input id="sell-price" type="number" min="0" step="0.01" placeholder="e.g. 9.99" style="
        width:100%;background:${C.surfHigh2};border:1px solid ${C.outline};
        color:${C.text};padding:.6rem .8rem;margin-bottom:1rem;
        font-family:'Work Sans',sans-serif;font-size:.9rem;box-sizing:border-box;
      "/>

      <label style="color:${C.muted};font-size:.7rem;text-transform:uppercase;
                    letter-spacing:.1em;display:block;margin-bottom:.3rem;">Description</label>
      <textarea id="sell-desc" rows="4" placeholder="Describe your asset for buyers…" style="
        width:100%;background:${C.surfHigh2};border:1px solid ${C.outline};
        color:${C.text};padding:.6rem .8rem;margin-bottom:1rem;resize:vertical;
        font-family:'Work Sans',sans-serif;font-size:.9rem;box-sizing:border-box;
      "></textarea>

      <label style="color:${C.muted};font-size:.7rem;text-transform:uppercase;
                    letter-spacing:.1em;display:block;margin-bottom:.5rem;">Preview Images (max. 3)</label>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:.5rem;margin-bottom:1rem;">
        ${[1,2,3].map(i=>`
          <div style="position:relative;">
            <input type="file" id="sell-img-${i}" accept="image/*"
              onchange="previewSellImg(${i})"
              style="position:absolute;inset:0;opacity:0;cursor:pointer;width:100%;height:100%;">
            <div id="sell-img-preview-${i}" style="
              aspect-ratio:1;background:${C.surfHigh2};border:1px dashed ${C.outline};
              display:flex;align-items:center;justify-content:center;
              color:${C.outline};font-size:1.5rem;overflow:hidden;
            ">+</div>
          </div>
        `).join('')}
      </div>

      <label style="color:${C.muted};font-size:.7rem;text-transform:uppercase;
                    letter-spacing:.1em;display:block;margin-bottom:.3rem;">3D File (GLB, FBX, USD, OBJ…)</label>
      <input type="file" id="sell-file" accept=".glb,.fbx,.usd,.obj,.usdz,.blend,.zip" style="
        width:100%;background:${C.surfHigh2};border:1px solid ${C.outline};
        color:${C.muted};padding:.5rem .8rem;margin-bottom:1.5rem;box-sizing:border-box;
      "/>
      <div id="sell-file-info" style="color:${C.tertiary};font-size:.75rem;margin-top:-.75rem;margin-bottom:1rem;"></div>

      <button onclick="submitListing('${title}')" style="
        width:100%;background:${C.primary};border:none;color:#261900;
        padding:.85rem;cursor:pointer;font-family:'Space Grotesk',sans-serif;
        font-size:.85rem;font-weight:700;text-transform:uppercase;letter-spacing:.12em;
      ">🏷 List Asset for Sale</button>
    </div>
  `);

  document.getElementById('sell-file').addEventListener('change', function() {
    const info = document.getElementById('sell-file-info');
    if (this.files[0]) {
      const mb = (this.files[0].size / 1048576).toFixed(2);
      info.textContent = `✓ ${this.files[0].name} (${mb} MB)`;
    }
  });
}

function previewSellImg(i) {
  const input = document.getElementById(`sell-img-${i}`);
  const preview = document.getElementById(`sell-img-preview-${i}`);
  if (input.files[0]) {
    const reader = new FileReader();
    reader.onload = e => {
      preview.innerHTML = `<img src="${e.target.result}" style="width:100%;height:100%;object-fit:cover;">`;
    };
    reader.readAsDataURL(input.files[0]);
  }
}

function submitListing(title) {
  const price = document.getElementById('sell-price')?.value;
  const desc  = document.getElementById('sell-desc')?.value;
  const file  = document.getElementById('sell-file')?.files[0];
  if (!price || parseFloat(price) <= 0) {
    showToast('⚠ Bitte einen Preis eingeben.', true); return;
  }
  if (!desc || desc.trim().length < 5) {
    showToast('⚠ Bitte eine Beschreibung eingeben.', true); return;
  }
  showToast(`✓ "${title}" wurde für €${parseFloat(price).toFixed(2)} gelistet!`);
  closeOverlay();
}

/* ── UPLOAD NEW ASSET ───────────────────────────────────────── */
function openUploadModal() {
  createOverlay(`
    <div style="
      background:${C.surface};border:1px solid ${C.outline};
      width:100%;max-width:580px;max-height:90vh;overflow-y:auto;
      padding:2rem;position:relative;font-family:'Space Grotesk',sans-serif;
    ">
      <button onclick="closeOverlay()" style="
        position:absolute;top:1rem;right:1rem;background:none;border:none;
        color:${C.muted};font-size:1.5rem;cursor:pointer;
      ">✕</button>
      <h2 style="color:${C.primary};font-family:'Newsreader',serif;font-size:1.5rem;
                 font-style:italic;margin-bottom:1.5rem;">Upload New Concept</h2>

      <label style="color:${C.muted};font-size:.7rem;text-transform:uppercase;
                    letter-spacing:.1em;display:block;margin-bottom:.3rem;">Asset Name *</label>
      <input id="up-name" placeholder="e.g. Dragon Fang Dagger" style="
        width:100%;background:${C.surfHigh2};border:1px solid ${C.outline};
        color:${C.text};padding:.6rem .8rem;margin-bottom:1rem;
        font-family:'Work Sans',sans-serif;font-size:.9rem;box-sizing:border-box;
      "/>

      <label style="color:${C.muted};font-size:.7rem;text-transform:uppercase;
                    letter-spacing:.1em;display:block;margin-bottom:.3rem;">Category *</label>
      <select id="up-cat" style="
        width:100%;background:${C.surfHigh2};border:1px solid ${C.outline};
        color:${C.text};padding:.6rem .8rem;margin-bottom:1rem;
        font-family:'Work Sans',sans-serif;font-size:.9rem;box-sizing:border-box;
      ">
        <option>Swords</option><option>Axes</option><option>Plate Armor</option>
        <option>Leather Armor</option><option>Cloth Armor</option><option>Daggers</option>
        <option>Spears</option><option>Magic Wands</option><option>NPCs</option>
        <option>Pets & Companions</option><option>Other</option>
      </select>

      <label style="color:${C.muted};font-size:.7rem;text-transform:uppercase;
                    letter-spacing:.1em;display:block;margin-bottom:.3rem;">Tier / Rarity</label>
      <select id="up-tier" style="
        width:100%;background:${C.surfHigh2};border:1px solid ${C.outline};
        color:${C.text};padding:.6rem .8rem;margin-bottom:1rem;
        font-family:'Work Sans',sans-serif;font-size:.9rem;box-sizing:border-box;
      ">
        <option>Common Grade</option><option>Rare</option><option>Epic</option>
        <option>Legendary Tier</option><option>Divine Relic</option><option>Masterwork</option>
      </select>

      <label style="color:${C.muted};font-size:.7rem;text-transform:uppercase;
                    letter-spacing:.1em;display:block;margin-bottom:.3rem;">Concept Image *</label>
      <input type="file" id="up-img" accept="image/*" style="
        width:100%;background:${C.surfHigh2};border:1px solid ${C.outline};
        color:${C.muted};padding:.5rem .8rem;margin-bottom:.5rem;box-sizing:border-box;
      "/>
      <div id="up-img-preview" style="
        width:100%;aspect-ratio:2/1;background:${C.surfHigh2};border:1px dashed ${C.outline};
        display:flex;align-items:center;justify-content:center;
        color:${C.outline};margin-bottom:1rem;overflow:hidden;
      ">Image Preview</div>

      <label style="color:${C.muted};font-size:.7rem;text-transform:uppercase;
                    letter-spacing:.1em;display:block;margin-bottom:.3rem;">3D File (optional)</label>
      <input type="file" id="up-3d" accept=".glb,.fbx,.usd,.obj,.usdz,.blend,.zip" style="
        width:100%;background:${C.surfHigh2};border:1px solid ${C.outline};
        color:${C.muted};padding:.5rem .8rem;margin-bottom:1.5rem;box-sizing:border-box;
      "/>

      <button onclick="submitUpload()" style="
        width:100%;background:${C.primary};border:none;color:#261900;
        padding:.85rem;cursor:pointer;font-family:'Space Grotesk',sans-serif;
        font-size:.85rem;font-weight:700;text-transform:uppercase;letter-spacing:.12em;
      ">⬆ Upload Asset</button>
    </div>
  `);

  document.getElementById('up-img').addEventListener('change', function() {
    if (this.files[0]) {
      const reader = new FileReader();
      reader.onload = e => {
        const prev = document.getElementById('up-img-preview');
        prev.innerHTML = `<img src="${e.target.result}" style="width:100%;height:100%;object-fit:contain;">`;
      };
      reader.readAsDataURL(this.files[0]);
    }
  });
}

function submitUpload() {
  const name = document.getElementById('up-name')?.value;
  const cat  = document.getElementById('up-cat')?.value;
  if (!name || name.trim().length < 2) {
    showToast('⚠ Bitte einen Asset-Namen eingeben.', true); return;
  }
  showToast(`✓ "${name}" (${cat}) erfolgreich hochgeladen!`);
  closeOverlay();
}

/* ── TOAST NOTIFICATION ─────────────────────────────────────── */
function showToast(msg, isError = false) {
  const existing = document.getElementById('catalog-toast');
  if (existing) existing.remove();
  const t = document.createElement('div');
  t.id = 'catalog-toast';
  t.textContent = msg;
  t.style.cssText = `
    position:fixed;bottom:2rem;right:2rem;z-index:99999;
    background:${isError ? '#93000a' : C.surfHigh2};
    border:1px solid ${isError ? C.error : C.primary};
    color:${isError ? C.error : C.primary};
    padding:.75rem 1.25rem;font-family:'Space Grotesk',sans-serif;
    font-size:.8rem;text-transform:uppercase;letter-spacing:.08em;
    box-shadow:0 4px 24px rgba(0,0,0,.6);
    animation:fadeInUp .3s ease;
  `;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 3500);
}

/* ── ASSET-KARTEN: Buttons verdrahten ───────────────────────── */
function wireAssetCards() {
  document.querySelectorAll('.group').forEach(card => {
    // Edit-Button
    card.querySelectorAll('button').forEach(btn => {
      const txt = btn.textContent.trim().toLowerCase();
      const icon = btn.querySelector('.material-symbols-outlined')?.textContent?.trim();

      if (txt.includes('edit') || icon === 'edit') {
        btn.addEventListener('click', e => { e.stopPropagation(); openEditModal(card); });
      }
      if (txt.includes('export') || icon === '3d_rotation') {
        btn.addEventListener('click', e => { e.stopPropagation(); openExportDialog(card); });
      }
    });

    // Sell-Symbol: kleines Marktplatz-Icon an jede Karte anhängen
    const sellBtn = document.createElement('button');
    sellBtn.title = 'List for Sale';
    sellBtn.innerHTML = `<span class="material-symbols-outlined" style="font-size:14px;">sell</span><span>Sell</span>`;
    sellBtn.style.cssText = `
      display:flex;align-items:center;justify-content:center;gap:4px;
      padding:.4rem .5rem;font-size:.6rem;font-family:'Space Grotesk',sans-serif;
      text-transform:uppercase;letter-spacing:.08em;cursor:pointer;
      background:#231f1d;border:1px solid #54433a;color:#dac3a2;
      transition:border-color .2s,color .2s;margin-top:.35rem;width:100%;
    `;
    sellBtn.addEventListener('mouseenter', () => { sellBtn.style.borderColor='#e9c176'; sellBtn.style.color='#e9c176'; });
    sellBtn.addEventListener('mouseleave', () => { sellBtn.style.borderColor='#54433a'; sellBtn.style.color='#dac3a2'; });
    sellBtn.addEventListener('click', e => { e.stopPropagation(); openSellModal(card); });

    const btnGrid = card.querySelector('.grid.grid-cols-2');
    if (btnGrid) btnGrid.parentElement.appendChild(sellBtn);
  });
}

/* ── UPLOAD-BUTTON im Header verdrahten ─────────────────────── */
function wireUploadButton() {
  document.querySelectorAll('button').forEach(btn => {
    const txt = btn.textContent.trim().toLowerCase();
    if (txt.includes('upload new concept') || txt.includes('upload')) {
      btn.addEventListener('click', () => openUploadModal());
    }
  });
}

/* ── BOTTOM NAV BUTTONS ─────────────────────────────────────── */
function wireBottomNav() {
  document.querySelectorAll('nav button').forEach(btn => {
    const label = btn.querySelector('span:last-child')?.textContent?.trim();
    if (!label) return;
    const target = NAV[label];
    if (target) {
      btn.addEventListener('click', () => window.location.href = target);
    }
    if (label === 'Upload') {
      btn.addEventListener('click', () => openUploadModal());
    }
  });
}

/* ── CSS-Animation ──────────────────────────────────────────── */
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeInUp {
    from { opacity:0; transform:translateY(12px); }
    to   { opacity:1; transform:translateY(0); }
  }
  #catalog-overlay > div { animation: fadeInUp .25s ease; }
`;
document.head.appendChild(style);

/* ── INIT ───────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  wireNavigation();
  wireAssetCards();
  wireUploadButton();
  wireBottomNav();
});
