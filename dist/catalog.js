/* ============================================================
   catalog.js  –  Relic & Rune | Shared Catalog Logic v2
   ============================================================ */

/* ── model-viewer laden (Google's Web Component für GLB) ────── */
if (!customElements.get('model-viewer')) {
  const s = document.createElement('script');
  s.type  = 'module';
  s.src   = 'https://ajax.googleapis.com/ajax/libs/model-viewer/3.4.0/model-viewer.min.js';
  document.head.appendChild(s);
}

/* ── Farb-Palette ────────────────────────────────────────────── */
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

/* ── Per-Asset In-Memory Store (LOD-Dateien, Metadaten) ──────── */
// Schlüssel: card-id (auto-generiert), Wert: { name, tier, desc, imgSrc, lods: {HI,MD,LO} }
const assetStore = {};

function getCardId(card) {
  if (!card.dataset.catalogId) {
    card.dataset.catalogId = 'asset-' + Math.random().toString(36).slice(2,9);
  }
  return card.dataset.catalogId;
}

function getAsset(card) {
  const id = getCardId(card);
  if (!assetStore[id]) {
    assetStore[id] = {
      name:   card.querySelector('h3')?.textContent.trim() || 'Asset',
      tier:   card.querySelector('p')?.textContent.trim()  || 'Common Grade',
      desc:   '',
      imgSrc: card.querySelector('img')?.src || '',
      lods:   { HI: null, MD: null, LO: null },  // File-Objekte
      lodUrls:{ HI: null, MD: null, LO: null },  // Object-URLs
    };
  }
  return assetStore[id];
}

/* ── Modal-Overlay ───────────────────────────────────────────── */
function createOverlay(content) {
  const ov = document.createElement('div');
  ov.id = 'catalog-overlay';
  ov.style.cssText = `
    position:fixed;inset:0;z-index:9999;
    background:rgba(0,0,0,.88);backdrop-filter:blur(4px);
    display:flex;align-items:center;justify-content:center;
    padding:1rem;overflow-y:auto;
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

/* ── NAVIGATION-MAPPING ──────────────────────────────────────── */
const NAV = {
  'The Armory':    'index.html',
  'Swords':        'sword_management_interactive_prototype.html',
  'Axes':          'two_handed_axes_collection_multi_tier_3d_1.html',
  'Plate Armor':   'plate_armor_management_interactive_prototype.html',
  'Grimoires':     'magic_wands_collection_interactive_prototype_1.html',
  'Dolche':        'sword_inventory_management.html',
  'Lederrüstung':  'leather_armor_collection_30_concepts_1.html',
  'Stoffrüstung':  'cloth_armor_multi_tier_3d_1.html',
  'Ancient Runes': 'ancient_decree_scroll_draft.html',
  'Quest Logs':    'registry_of_imperial_decrees.html',
  'Bestiary':      'pets_collection_interactive_prototype.html',
  'The Vault':     'runic_laws_imperial_archives.html',
  'Support':       'scholar_s_guide_support.html',
  'Exit':          'index.html',
  'Market':        'sell_asset.html',
  'Upload':        'upload_asset.html',
  'Category':      'sword_category_management.html',
  'Manage':        'index.html',
  'NPCs':          'npc_collection_interactive_prototype.html',
  'Pets':          'pets_collection_interactive_prototype.html',
  'Spears':        'spears_collection_multi_tier_3d.html',
  'Settings':      'settings_archivist_preferences.html',
};

function wireNavigation() {
  document.querySelectorAll('a[href="#"], a:not([href])').forEach(a => {
    const label = a.textContent.trim();
    const target = NAV[label];
    if (target) a.href = target;
  });
}

/* ══════════════════════════════════════════════════════════════
   EDIT MODAL  –  mit LOD-Uploads + 3D-Vorschau
   ══════════════════════════════════════════════════════════════ */
function openEditModal(card) {
  const asset = getAsset(card);

  const lodStatus = (lod) => {
    const f = asset.lods[lod];
    if (!f) return `<span style="color:${C.outline};font-size:.7rem;">No file</span>`;
    const mb = (f.size/1048576).toFixed(2);
    return `<span style="color:${C.tertiary};font-size:.7rem;">✓ ${f.name} (${mb} MB)</span>`;
  };

  createOverlay(`
    <div id="edit-modal" style="
      background:${C.surface};border:1px solid ${C.outline};
      width:100%;max-width:720px;padding:2rem;position:relative;
      font-family:'Space Grotesk',sans-serif;max-height:92vh;overflow-y:auto;
    ">
      <button onclick="closeOverlay()" style="
        position:absolute;top:1rem;right:1rem;background:none;border:none;
        color:${C.muted};font-size:1.5rem;cursor:pointer;line-height:1;
      ">✕</button>

      <h2 style="color:${C.primary};font-family:'Newsreader',serif;font-size:1.5rem;
                 font-style:italic;margin-bottom:1.5rem;">Edit Asset</h2>

      <!-- ── Zwei Spalten ── -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:1.5rem;">

        <!-- Linke Spalte: Metadaten + Bild -->
        <div>
          <label style="${lbl()}">Asset Name</label>
          <input id="edit-name" value="${asset.name}" style="${inp()}" oninput="syncEditPreview()"/>

          <label style="${lbl()}">Tier / Rarity</label>
          <select id="edit-tier" style="${inp()}" onchange="syncEditPreview()">
            ${['Common Grade','Rare','Epic','Legendary Tier','Divine Relic','Masterwork','Magical Artifact']
              .map(t=>`<option value="${t}" ${t===asset.tier?'selected':''}>${t}</option>`).join('')}
          </select>

          <label style="${lbl()}">Description</label>
          <textarea id="edit-desc" rows="3" style="${inp()}resize:vertical;" placeholder="Asset description…">${asset.desc}</textarea>

          <label style="${lbl()}">Preview Image</label>
          <div id="edit-img-preview" style="
            width:100%;aspect-ratio:1;background:${C.surfHigh2};border:1px dashed ${C.outline};
            display:flex;align-items:center;justify-content:center;overflow:hidden;margin-bottom:.5rem;
          ">
            ${asset.imgSrc
              ? `<img src="${asset.imgSrc}" style="width:100%;height:100%;object-fit:contain;">`
              : `<span style="color:${C.outline};font-size:2rem;">🖼</span>`}
          </div>
          <input type="file" id="edit-img-file" accept="image/*"
            style="${inp()}padding:.4rem;" onchange="handleEditImg(this)"/>
        </div>

        <!-- Rechte Spalte: LOD-Uploads + 3D-Viewer -->
        <div>
          <label style="${lbl()}">3D Files per LOD Tier</label>

          <!-- HI -->
          <div style="background:${C.surfHigh2};border:1px solid ${C.outline};padding:.75rem;margin-bottom:.5rem;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:.4rem;">
              <span style="color:${C.primary};font-size:.7rem;font-weight:700;letter-spacing:.1em;">HI — High Detail</span>
              ${asset.lodUrls.HI
                ? `<button onclick="preview3D('HI')" style="${smallBtn(C.tertiary)}">👁 Preview</button>`
                : ''}
            </div>
            <div id="lod-status-HI" style="margin-bottom:.4rem;">${lodStatus('HI')}</div>
            <input type="file" id="lod-file-HI" accept=".glb,.fbx,.usd,.usdz,.obj,.blend,.zip"
              style="${inp()}padding:.3rem;font-size:.7rem;" onchange="handleLodUpload('HI',this)"/>
          </div>

          <!-- MD -->
          <div style="background:${C.surfHigh2};border:1px solid ${C.outline};padding:.75rem;margin-bottom:.5rem;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:.4rem;">
              <span style="color:${C.muted};font-size:.7rem;font-weight:700;letter-spacing:.1em;">MD — Medium Detail</span>
              ${asset.lodUrls.MD
                ? `<button onclick="preview3D('MD')" style="${smallBtn(C.tertiary)}">👁 Preview</button>`
                : ''}
            </div>
            <div id="lod-status-MD" style="margin-bottom:.4rem;">${lodStatus('MD')}</div>
            <input type="file" id="lod-file-MD" accept=".glb,.fbx,.usd,.usdz,.obj,.blend,.zip"
              style="${inp()}padding:.3rem;font-size:.7rem;" onchange="handleLodUpload('MD',this)"/>
          </div>

          <!-- LO -->
          <div style="background:${C.surfHigh2};border:1px solid ${C.outline};padding:.75rem;margin-bottom:1rem;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:.4rem;">
              <span style="color:${C.muted};font-size:.7rem;font-weight:700;letter-spacing:.1em;">LO — Low Detail (Mobile)</span>
              ${asset.lodUrls.LO
                ? `<button onclick="preview3D('LO')" style="${smallBtn(C.tertiary)}">👁 Preview</button>`
                : ''}
            </div>
            <div id="lod-status-LO" style="margin-bottom:.4rem;">${lodStatus('LO')}</div>
            <input type="file" id="lod-file-LO" accept=".glb,.fbx,.usd,.usdz,.obj,.blend,.zip"
              style="${inp()}padding:.3rem;font-size:.7rem;" onchange="handleLodUpload('LO',this)"/>
          </div>

          <!-- 3D Viewer Bereich -->
          <div id="viewer-container" style="
            width:100%;aspect-ratio:1;background:${C.bg};border:1px solid ${C.outline};
            display:flex;align-items:center;justify-content:center;position:relative;overflow:hidden;
          ">
            <div id="viewer-placeholder" style="text-align:center;color:${C.outline};padding:1rem;">
              <div style="font-size:2.5rem;margin-bottom:.5rem;">🎲</div>
              <div style="font-size:.65rem;font-family:'Space Grotesk',sans-serif;
                          text-transform:uppercase;letter-spacing:.1em;">
                Upload a GLB file<br>to preview in 3D
              </div>
            </div>
          </div>
          <p style="color:${C.outline};font-size:.6rem;text-transform:uppercase;
                    letter-spacing:.08em;margin-top:.3rem;text-align:center;">
            Drag to rotate · Scroll to zoom · Supported: GLB, GLTF
          </p>
        </div>
      </div>

      <!-- Buttons -->
      <div style="display:flex;gap:.75rem;justify-content:flex-end;margin-top:1.5rem;
                  border-top:1px solid ${C.outline};padding-top:1rem;">
        <button onclick="closeOverlay()" style="${cancelBtn()}">Cancel</button>
        <button onclick="saveEdit()" style="${primaryBtn()}">✓ Save Changes</button>
      </div>
    </div>
  `);

  // Aktiven Card-Referenz speichern für saveEdit()
  document.getElementById('edit-modal')._card = card;

  // Falls bereits ein GLB vorhanden → direkt anzeigen
  const firstLod = ['HI','MD','LO'].find(l => asset.lodUrls[l]);
  if (firstLod) showModelViewer(asset.lodUrls[firstLod]);
}

/* ── LOD-Datei hochladen ─────────────────────────────────────── */
function handleLodUpload(lod, input) {
  if (!input.files[0]) return;
  const file = input.files[0];
  const modal = document.getElementById('edit-modal');
  if (!modal) return;
  const card = modal._card;
  const asset = getAsset(card);

  // Alten Object-URL revoken
  if (asset.lodUrls[lod]) URL.revokeObjectURL(asset.lodUrls[lod]);

  asset.lods[lod]    = file;
  asset.lodUrls[lod] = URL.createObjectURL(file);

  // Status-Text aktualisieren
  const mb = (file.size/1048576).toFixed(2);
  const statusEl = document.getElementById(`lod-status-${lod}`);
  if (statusEl) statusEl.innerHTML =
    `<span style="color:${C.tertiary};font-size:.7rem;">✓ ${file.name} (${mb} MB)</span>`;

  // Preview-Button einblenden
  const container = statusEl?.closest('div[style]');
  if (container) {
    const headerRow = container.querySelector('div');
    if (headerRow && !headerRow.querySelector('button')) {
      const btn = document.createElement('button');
      btn.innerHTML = '👁 Preview';
      btn.setAttribute('style', smallBtn(C.tertiary));
      btn.onclick = () => preview3D(lod);
      headerRow.appendChild(btn);
    }
  }

  // Automatisch im Viewer anzeigen (nur GLB/GLTF nativ unterstützt)
  const ext = file.name.split('.').pop().toLowerCase();
  if (ext === 'glb' || ext === 'gltf') {
    showModelViewer(asset.lodUrls[lod]);
  } else {
    showToast(`✓ ${file.name} gespeichert (${lod}) – 3D-Vorschau nur für GLB/GLTF`);
  }
}

/* ── model-viewer anzeigen ───────────────────────────────────── */
function showModelViewer(url) {
  const container = document.getElementById('viewer-container');
  if (!container) return;
  container.innerHTML = `
    <model-viewer
      src="${url}"
      alt="3D Asset Preview"
      camera-controls
      auto-rotate
      shadow-intensity="1"
      environment-image="neutral"
      style="width:100%;height:100%;background:${C.bg};"
      loading="eager"
    ></model-viewer>
  `;
}

function preview3D(lod) {
  const modal = document.getElementById('edit-modal');
  if (!modal) return;
  const card  = modal._card;
  const asset = getAsset(card);
  if (asset.lodUrls[lod]) {
    showModelViewer(asset.lodUrls[lod]);
    showToast(`👁 Zeige ${lod}-LOD in 3D-Viewer`);
  }
}

/* ── Bild-Vorschau im Edit-Modal ─────────────────────────────── */
function handleEditImg(input) {
  if (!input.files[0]) return;
  const reader = new FileReader();
  reader.onload = e => {
    const prev = document.getElementById('edit-img-preview');
    if (prev) prev.innerHTML = `<img src="${e.target.result}" style="width:100%;height:100%;object-fit:contain;">`;
    // In Store speichern
    const modal = document.getElementById('edit-modal');
    if (modal?._card) getAsset(modal._card).imgSrc = e.target.result;
  };
  reader.readAsDataURL(input.files[0]);
}

/* ── Live-Sync Edit-Vorschau ─────────────────────────────────── */
function syncEditPreview() {
  const modal = document.getElementById('edit-modal');
  if (!modal?._card) return;
  const asset = getAsset(modal._card);
  const name  = document.getElementById('edit-name')?.value;
  const tier  = document.getElementById('edit-tier')?.value;
  if (name) asset.name = name;
  if (tier) asset.tier = tier;
}

/* ── Edit speichern ──────────────────────────────────────────── */
function saveEdit() {
  const modal = document.getElementById('edit-modal');
  if (!modal?._card) { closeOverlay(); return; }
  const card  = modal._card;
  const asset = getAsset(card);

  const name = document.getElementById('edit-name')?.value?.trim();
  const tier = document.getElementById('edit-tier')?.value;
  const desc = document.getElementById('edit-desc')?.value?.trim();

  if (name) {
    asset.name = name;
    const h3 = card.querySelector('h3');
    if (h3) h3.textContent = name;
  }
  if (tier) {
    asset.tier = tier;
    const p = card.querySelector('p');
    if (p) p.textContent = tier;
  }
  if (desc !== undefined) asset.desc = desc;

  // Bild in Karte übernehmen
  if (asset.imgSrc) {
    const img = card.querySelector('img');
    if (img) { img.src = asset.imgSrc; img.style.filter = 'none'; }
  }

  const lodCount = ['HI','MD','LO'].filter(l => asset.lods[l]).length;
  showToast(`✓ "${asset.name}" gespeichert${lodCount ? ` · ${lodCount} LOD-Datei(en)` : ''}`);
  closeOverlay();
}

/* ══════════════════════════════════════════════════════════════
   EXPORT DIALOG  –  mit echtem Download
   ══════════════════════════════════════════════════════════════ */
function openExportDialog(card) {
  const asset   = getAsset(card);
  const formats = ['GLB','FBX','USD','Unity Package','OBJ','USDZ'];
  const lods    = ['HI','MD','LO'];

  // Welche LODs haben Dateien?
  const available = lods.filter(l => asset.lods[l]);

  createOverlay(`
    <div style="
      background:${C.surface};border:1px solid ${C.outline};
      width:100%;max-width:500px;padding:2rem;position:relative;
      font-family:'Space Grotesk',sans-serif;
    ">
      <button onclick="closeOverlay()" style="
        position:absolute;top:1rem;right:1rem;background:none;border:none;
        color:${C.muted};font-size:1.5rem;cursor:pointer;
      ">✕</button>

      <h2 style="color:${C.primary};font-family:'Newsreader',serif;font-size:1.5rem;
                 font-style:italic;margin-bottom:.4rem;">Export Asset</h2>
      <p style="color:${C.muted};font-size:.8rem;margin-bottom:1.5rem;">${asset.name}</p>

      ${available.length === 0 ? `
        <!-- Keine Dateien hochgeladen -->
        <div style="
          background:${C.surfHigh2};border:1px solid ${C.outline};
          padding:1.5rem;text-align:center;margin-bottom:1.5rem;
        ">
          <div style="font-size:2rem;margin-bottom:.5rem;">📂</div>
          <p style="color:${C.muted};font-size:.8rem;margin-bottom:.75rem;">
            Noch keine 3D-Dateien hochgeladen.
          </p>
          <button onclick="closeOverlay();openEditModal(document.querySelector('[data-catalog-id=\\'${getCardId(card)}\\']'))"
            style="${primaryBtn()}width:100%;">
            ⬆ Jetzt 3D-Dateien hochladen
          </button>
        </div>
      ` : `
        <!-- LOD-Auswahl (nur verfügbare) -->
        <label style="${lbl()}">LOD Tier (verfügbar)</label>
        <div style="display:grid;grid-template-columns:repeat(${available.length},1fr);gap:.5rem;margin-bottom:1.25rem;">
          ${available.map((l,i) => `
            <label style="
              display:flex;align-items:center;gap:.5rem;
              background:${C.surfHigh2};border:1px solid ${C.outline};
              padding:.6rem .8rem;cursor:pointer;font-size:.75rem;color:${C.text};
            ">
              <input type="radio" name="exp-lod" value="${l}" ${i===0?'checked':''}
                style="accent-color:${C.primary};">
              <span>
                <strong style="color:${C.primary}">${l}</strong><br>
                <span style="font-size:.65rem;color:${C.muted};">${asset.lods[l].name}</span>
              </span>
            </label>
          `).join('')}
        </div>

        <!-- 3D-Vorschau im Export-Dialog -->
        <div id="export-viewer" style="
          width:100%;aspect-ratio:16/9;background:${C.bg};border:1px solid ${C.outline};
          margin-bottom:1.25rem;overflow:hidden;
        ">
          <model-viewer
            src="${asset.lodUrls[available[0]]}"
            alt="3D Preview"
            camera-controls auto-rotate shadow-intensity="1"
            environment-image="neutral"
            style="width:100%;height:100%;background:${C.bg};"
          ></model-viewer>
        </div>

        <!-- Download-Button -->
        <button onclick="triggerDownload()" style="${primaryBtn()}width:100%;padding:.85rem;">
          ⬇ Download Selected LOD
        </button>
      `}

      <!-- Falls keine Dateien: Hinweis auf Preview -->
      ${available.length > 0 ? `
        <p style="color:${C.outline};font-size:.6rem;text-transform:uppercase;
                  letter-spacing:.08em;margin-top:.75rem;text-align:center;">
          Drag to rotate · Scroll to zoom · ${available.length} LOD(s) available
        </p>
      ` : ''}
    </div>
  `);

  // LOD-Wechsel → Viewer aktualisieren
  if (available.length > 0) {
    document.querySelectorAll('input[name="exp-lod"]').forEach(radio => {
      radio.addEventListener('change', () => {
        const lod = radio.value;
        const viewer = document.getElementById('export-viewer');
        if (viewer && asset.lodUrls[lod]) {
          viewer.innerHTML = `
            <model-viewer
              src="${asset.lodUrls[lod]}"
              alt="3D Preview"
              camera-controls auto-rotate shadow-intensity="1"
              environment-image="neutral"
              style="width:100%;height:100%;background:${C.bg};"
            ></model-viewer>
          `;
        }
      });
    });
  }

  // Card-Referenz für triggerDownload
  document.querySelector('#catalog-overlay > div')._card = card;
}

/* ── Echter Datei-Download ───────────────────────────────────── */
function triggerDownload() {
  const overlay = document.getElementById('catalog-overlay');
  const modal   = overlay?.querySelector('div');
  if (!modal?._card) return;

  const card  = modal._card;
  const asset = getAsset(card);
  const lod   = document.querySelector('input[name="exp-lod"]:checked')?.value;
  if (!lod || !asset.lods[lod]) {
    showToast('⚠ Keine Datei für diesen LOD vorhanden.', true);
    return;
  }

  const file = asset.lods[lod];
  const url  = asset.lodUrls[lod];
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `${asset.name.replace(/\s+/g,'_')}_${lod}.${file.name.split('.').pop()}`;
  a.click();
  showToast(`⬇ Download gestartet: ${a.download}`);
}

/* ══════════════════════════════════════════════════════════════
   SELL MODAL
   ══════════════════════════════════════════════════════════════ */
function openSellModal(card) {
  const asset = getAsset(card);
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
      <p style="color:${C.muted};font-size:.8rem;margin-bottom:1.5rem;">${asset.name}</p>

      <label style="${lbl()}">Price (€) *</label>
      <input id="sell-price" type="number" min="0" step="0.01" placeholder="e.g. 9.99"
        style="${inp()}margin-bottom:1rem;"/>

      <label style="${lbl()}">Description *</label>
      <textarea id="sell-desc" rows="4" placeholder="Describe your asset for buyers…"
        style="${inp()}resize:vertical;margin-bottom:1rem;">${asset.desc}</textarea>

      <label style="${lbl()}">Preview Images (max. 3)</label>
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

      <label style="${lbl()}">3D File (GLB, FBX, USD, OBJ…)</label>
      <input type="file" id="sell-file" accept=".glb,.fbx,.usd,.obj,.usdz,.blend,.zip"
        style="${inp()}margin-bottom:.5rem;"/>
      <div id="sell-file-info" style="color:${C.tertiary};font-size:.75rem;margin-bottom:1rem;"></div>

      <button onclick="submitListing('${asset.name}')" style="${primaryBtn()}width:100%;padding:.85rem;">
        🏷 List Asset for Sale
      </button>
    </div>
  `);

  document.getElementById('sell-file').addEventListener('change', function() {
    const info = document.getElementById('sell-file-info');
    if (this.files[0]) {
      const mb = (this.files[0].size/1048576).toFixed(2);
      info.textContent = `✓ ${this.files[0].name} (${mb} MB)`;
    }
  });
}

function previewSellImg(i) {
  const input   = document.getElementById(`sell-img-${i}`);
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
  if (!price || parseFloat(price) <= 0) { showToast('⚠ Bitte einen Preis eingeben.', true); return; }
  if (!desc || desc.trim().length < 5)  { showToast('⚠ Bitte eine Beschreibung eingeben.', true); return; }
  showToast(`✓ "${title}" wurde für €${parseFloat(price).toFixed(2)} gelistet!`);
  closeOverlay();
}

/* ══════════════════════════════════════════════════════════════
   UPLOAD MODAL
   ══════════════════════════════════════════════════════════════ */
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

      <label style="${lbl()}">Asset Name *</label>
      <input id="up-name" placeholder="e.g. Dragon Fang Dagger" style="${inp()}"/>

      <label style="${lbl()}">Category *</label>
      <select id="up-cat" style="${inp()}">
        <option>Swords</option><option>Axes</option><option>Plate Armor</option>
        <option>Leather Armor</option><option>Cloth Armor</option><option>Daggers</option>
        <option>Spears</option><option>Magic Wands</option><option>NPCs</option>
        <option>Pets &amp; Companions</option><option>Other</option>
      </select>

      <label style="${lbl()}">Tier / Rarity</label>
      <select id="up-tier" style="${inp()}">
        <option>Common Grade</option><option>Rare</option><option>Epic</option>
        <option>Legendary Tier</option><option>Divine Relic</option><option>Masterwork</option>
      </select>

      <label style="${lbl()}">Concept Image *</label>
      <input type="file" id="up-img" accept="image/*" style="${inp()}padding:.4rem;"
        onchange="previewUploadImg(this)"/>
      <div id="up-img-prev" style="
        width:100%;aspect-ratio:2/1;background:${C.surfHigh2};border:1px dashed ${C.outline};
        display:flex;align-items:center;justify-content:center;
        color:${C.outline};margin-bottom:1rem;overflow:hidden;
      ">Image Preview</div>

      <label style="${lbl()}">3D File (optional)</label>
      <input type="file" id="up-3d" accept=".glb,.fbx,.usd,.usdz,.obj,.blend,.zip"
        style="${inp()}margin-bottom:1.5rem;"/>

      <button onclick="submitUpload()" style="${primaryBtn()}width:100%;padding:.85rem;">
        ⬆ Upload to Catalog
      </button>
    </div>
  `);
}

function previewUploadImg(input) {
  if (!input.files[0]) return;
  const reader = new FileReader();
  reader.onload = e => {
    const prev = document.getElementById('up-img-prev');
    if (prev) prev.innerHTML = `<img src="${e.target.result}" style="width:100%;height:100%;object-fit:contain;">`;
  };
  reader.readAsDataURL(input.files[0]);
}

function submitUpload() {
  const name = document.getElementById('up-name')?.value?.trim();
  const cat  = document.getElementById('up-cat')?.value;
  if (!name || name.length < 2) { showToast('⚠ Bitte einen Asset-Namen eingeben.', true); return; }
  showToast(`✓ "${name}" (${cat}) erfolgreich hochgeladen!`);
  closeOverlay();
}

/* ── Style-Hilfsfunktionen ───────────────────────────────────── */
function lbl() {
  return `color:${C.muted};font-size:.65rem;text-transform:uppercase;letter-spacing:.1em;
          display:block;margin-bottom:.25rem;margin-top:.75rem;`;
}
function inp() {
  return `width:100%;background:${C.surfHigh2};border:1px solid ${C.outline};
          color:${C.text};padding:.55rem .75rem;font-family:'Work Sans',sans-serif;
          font-size:.85rem;box-sizing:border-box;display:block;`;
}
function primaryBtn() {
  return `background:${C.primary};border:none;color:#261900;cursor:pointer;
          font-family:'Space Grotesk',sans-serif;font-size:.75rem;font-weight:700;
          text-transform:uppercase;letter-spacing:.12em;padding:.6rem 1.4rem;
          transition:filter .2s;`;
}
function cancelBtn() {
  return `background:none;border:1px solid ${C.outline};color:${C.muted};cursor:pointer;
          font-family:'Space Grotesk',sans-serif;font-size:.75rem;
          text-transform:uppercase;letter-spacing:.1em;padding:.6rem 1.4rem;`;
}
function smallBtn(color) {
  return `background:none;border:1px solid ${color};color:${color};cursor:pointer;
          font-family:'Space Grotesk',sans-serif;font-size:.6rem;
          text-transform:uppercase;letter-spacing:.08em;padding:.25rem .6rem;`;
}

/* ── TOAST ───────────────────────────────────────────────────── */
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
    font-size:.75rem;text-transform:uppercase;letter-spacing:.08em;
    box-shadow:0 4px 24px rgba(0,0,0,.6);animation:fadeInUp .3s ease;
  `;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 3500);
}

/* ── Asset-Karten verdrahten ─────────────────────────────────── */
function wireAssetCards() {
  document.querySelectorAll('.group').forEach(card => {
    card.querySelectorAll('button').forEach(btn => {
      const icon = btn.querySelector('.material-symbols-outlined')?.textContent?.trim();
      const txt  = btn.textContent.trim().toLowerCase();

      if ((txt.includes('edit') || icon === 'edit') && !btn._catalogWired) {
        btn._catalogWired = true;
        btn.addEventListener('click', e => { e.stopPropagation(); openEditModal(card); });
      }
      if ((txt.includes('export') || icon === '3d_rotation') && !btn._catalogWired) {
        btn._catalogWired = true;
        btn.addEventListener('click', e => { e.stopPropagation(); openExportDialog(card); });
      }
    });

    // Sell-Button anhängen (falls noch nicht vorhanden)
    if (!card.querySelector('[data-sell-btn]')) {
      const sellBtn = document.createElement('button');
      sellBtn.setAttribute('data-sell-btn', '1');
      sellBtn.innerHTML = `<span class="material-symbols-outlined" style="font-size:13px;">sell</span><span>Sell</span>`;
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
    }
  });
}

function wireUploadButton() {
  document.querySelectorAll('button').forEach(btn => {
    if (btn._catalogWired) return;
    const txt = btn.textContent.trim().toLowerCase();
    if (txt.includes('upload new concept')) {
      btn._catalogWired = true;
      btn.addEventListener('click', () => openUploadModal());
    }
  });
}

function wireBottomNav() {
  const BOTTOM = { 'Market':'sell_asset.html','Category':'sword_category_management.html','Manage':'index.html' };
  document.querySelectorAll('nav button').forEach(btn => {
    if (btn._catalogWired) return;
    const label = btn.querySelector('span:last-child')?.textContent?.trim();
    if (!label) return;
    if (label === 'Upload') {
      btn._catalogWired = true;
      btn.addEventListener('click', () => openUploadModal());
    } else if (BOTTOM[label]) {
      btn._catalogWired = true;
      btn.addEventListener('click', () => window.location.href = BOTTOM[label]);
    }
  });
}

/* ── CSS-Animation ───────────────────────────────────────────── */
const _style = document.createElement('style');
_style.textContent = `
  @keyframes fadeInUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
  #catalog-overlay>div{animation:fadeInUp .25s ease;}
  model-viewer{--poster-color:transparent;}
`;
document.head.appendChild(_style);

/* ── INIT ────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  wireNavigation();
  wireAssetCards();
  wireUploadButton();
  wireBottomNav();
});
