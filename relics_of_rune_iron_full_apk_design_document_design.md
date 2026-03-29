# Design Specification: "Relics of Rune & Iron" - Full APK Version

## 1. Project Overview
**Relics of Rune & Iron** is a high-fidelity 3D Asset Management Catalog designed for a semi-realistic fantasy MMORPG. The app serves as a bridge between 2D concept art and a production-ready 3D pipeline, supporting LOD (Level of Detail) management and multi-format exports.

## 2. Technical Architecture
- **Framework**: Single Page Application (SPA) with a fixed Sidebar Navigation.
- **Styling**: Tailwind CSS with a custom "Runic Iron & Ember" theme.
- **Typography**: 
    - Newsreader (Serif) for headlines and brand elements.
    - Space Grotesk (Sans) for technical data and labels.
    - Work Sans for general body text.
- **Color Palette**:
    - Onyx (#161311): Deep backgrounds.
    - Charcoal (#231f1d): Secondary surfaces/containers.
    - Gold (#e9c176): Primary actions, headers, and highlights.
    - Cyan (#00dce5): Accents for technical/machine states.

## 3. Core Features & Functional Requirements

### 3.1 Global Dashboard (Master Control)
- **Screen ID**: {{DATA:SCREEN:SCREEN_71}}
- **Logic**: Provides high-level statistics of the entire catalog (Total Assets, Link Status, High-Poly Fidelity).
- **Machine Readout**: A terminal-style console for automated data scraping by no-code agents.

### 3.2 Category Management & Navigation
- **Architecture**: Modular sidebar allows switching between 12+ categories.
- **Categories Included**: Plate Armor, Heavy Armor, Leather Armor, Cloth Armor, Swords, 2H Swords, 2H Axes, Bows, Magic Wands, NPCs, Pets & Companions, and Häuser & Gebäude (Architecture).

### 3.3 Multi-Tier 3D Asset Pipeline (LOD)
- **Selection Logic**: Users can toggle between **HI** (High-Poly), **MD** (Mid-Poly), and **LO** (Low-Poly) versions for every individual item.
- **Format Support**: Each tier supports independent uploads/exports for:
    - `.GLB` (Web-ready)
    - `.FBX` (Standard 3D)
    - `.USD` (Omniverse/Apple)
    - `.Unity` (Engine-specific)

### 3.4 Interactive Modals & Previews
- **3D Viewer**: Every item card triggers a "View 3D Model" modal. 
- **Implementation Note**: For the APK, integrate `<model-viewer>` or a Three.js container to render the linked `.glb` files.

## 4. Navigation Flow (Prototype Map)
1. **Entry Point**: Global Dashboard ({{DATA:SCREEN:SCREEN_71}})
2. **Category Selection**: Sidebar -> [Select Category]
3. **Item Interaction**: Click Item Card -> Open LOD Management / 3D Preview.
4. **Administrative**: "Bulk LOD Upload" -> Triggers batch processing flow.
5. **Accessibility**: "Machine Readout" -> Activates semantic HTML layer for AI agents.

## 5. Handoff Instructions for APK Generation
- **For No-Code Agents (e.g., FlutterFlow, Bubble)**:
    - Use the CSS classes defined in the provided HTML for consistent styling.
    - Map the "Manage Assets" buttons to a Firebase or AWS S3 bucket.
    - Use the provided Item IDs (e.g., `AXE-001`) as primary keys in your database.
- **For AI Developers**:
    - Scrape the `.machine-readout` container on the Dashboard to initialize the application state.
    - Use the transparent PNG/WebP assets provided in the HTML as the default 2D placeholders.
