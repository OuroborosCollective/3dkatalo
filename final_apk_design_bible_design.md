# Relics of Rune & Iron: Master APK Design Document (v4 - Final)

## 1. Executive Summary
This document provides the full technical and architectural roadmap for a 3D Asset Management APK for the MMORPG "Relics of Rune & Iron". It is designed to be parsed by a no-code assistant (e.g., Cursor, GPT-4o, or a dedicated no-code platform agent) to build a functional, cross-linked application.

## 2. Technical Stack & UI Framework
- **Framework**: Single Page Application (SPA) with Sidebar Navigation.
- **Design System**: "Runic Iron & Ember" (Theme: {{DATA:DESIGN_SYSTEM:DESIGN_SYSTEM_1}}).
- **Core Typography**: Newsreader (Serif), Space Grotesk (Sans), Work Sans (Body).
- **Palette**: Onyx (#161311), Charcoal (#231f1d), Gold (#e9c176), Cyan (#00dce5).

## 3. Global Asset Mapping (The Catalog)
Every screen below contains high-fidelity HTML/CSS ready for export.

### A. Management Hubs (Main Dashboards)
1. **Global 3D Pipeline Dashboard** ({{DATA:SCREEN:SCREEN_106}}): The "Brain" of the app. Use the `.machine-readout` console to initialize app state.
2. **Grand Forge Workspace** ({{DATA:SCREEN:SCREEN_25}}): The primary creation and draft management area.
3. **The Great Exchange** ({{DATA:SCREEN:SCREEN_58}}): Marketplace and trading interface.
4. **Archivist Preferences** ({{DATA:SCREEN:SCREEN_6}}): Global app settings and 3D export protocols.

### B. Specialized Collections (3D Pipeline Ready)
All these screens support Multi-Tier LOD (High/Med/Low) and Multi-Format (GLB/FBX/USD/Unity) logic.
- **Plate Armor**: {{DATA:SCREEN:SCREEN_88}}
- **Leather Armor**: {{DATA:SCREEN:SCREEN_100}}
- **Cloth Armor**: {{DATA:SCREEN:SCREEN_68}}
- **Heavy Armor**: {{DATA:SCREEN:SCREEN_85}}
- **Swords**: {{DATA:SCREEN:SCREEN_105}}
- **Two-Handed Swords**: {{DATA:SCREEN:SCREEN_33}}
- **Two-Handed Axes**: {{DATA:SCREEN:SCREEN_92}}
- **Bows**: {{DATA:SCREEN:SCREEN_21}}
- **Spears**: {{DATA:SCREEN:SCREEN_71}}
- **Sword & Shield**: {{DATA:SCREEN:SCREEN_89}}
- **Magic Wands**: {{DATA:SCREEN:SCREEN_74}}

### C. World & lore Assets
- **Architecture (Häuser & Gebäude)**: {{DATA:SCREEN:SCREEN_104}}
- **Dwellings & Interiors**: {{DATA:SCREEN:SCREEN_2}}
- **NPC Catalog**: {{DATA:SCREEN:SCREEN_101}}
- **Pets & Companions**: {{DATA:SCREEN:SCREEN_107}}

### D. Judicial & Archive Systems
- **High Scribes Council**: {{DATA:SCREEN:SCREEN_94}}
- **Imperial Decree Registry**: {{DATA:SCREEN:SCREEN_17}}
- **Drafting New Decree**: {{DATA:SCREEN:SCREEN_87}}
- **Runic Statutes**: {{DATA:SCREEN:SCREEN_76}}

## 4. Interaction & Connection Logic for the Agent
**Step 1: Set Up Navigation**
- Connect the Sidebar links across all screens to their respective IDs.
- Ensure the "Machine Readout" link always points to the Global Dashboard.

**Step 2: Implement 3D Modals**
- Any button labeled "View 3D Model" or "Manage Assets" should open a modal.
- In the modal, use `<model-viewer>` for `.glb` files.
- Map the "LOD Toggles" (HI/MD/LO) to switch between different file URLs in your storage bucket.

**Step 3: Asset Exporting**
- Map the format buttons (GLB, FBX, etc.) to trigger a direct download of the linked file associated with the item ID (e.g., `SWORD-084`).

**Step 4: Form Logic**
- The "Forge New Blade" form ({{DATA:SCREEN:SCREEN_98}}) should POST to a "Drafts" collection in your database.

## 5. Handoff Checklist
1. Select all screens on the Stitch canvas.
2. Click **"</> View Code"**.
3. provide the resulting code and this `DESIGN.md` to your development agent.
4. Ensure your cloud storage (S3/Firebase) is organized by Item ID for the 3D model lookups.

*End of Document*