# Design System Document: The Relic & Rune Framework

## 1. Overview & Creative North Star
**Creative North Star: "The Master’s Ledger"**
This design system rejects the "plasticity" of modern mobile gaming UI in favor of a tactile, editorial experience that feels like a scholar’s desk in a world of high stakes and ancient magic. We are blending the nostalgic charm of classic RPGs with the oppressive, gritty atmosphere of gothic fantasy. 

The layout breaks the rigid digital grid by utilizing **intentional asymmetry** and **tonal depth**. Instead of clean, centered boxes, we treat the UI as a series of overlapping artifacts—parchments, iron plates, and leather-bound surfaces. The goal is to make the interface feel "heavy" and "physical," as if every button press is a mechanical click of a latch or the strike of a flint.

## 2. Colors & Materiality
The palette is built on the remains of a fallen empire: oxidized metals, cured hides, and the ethereal glow of runic energy.

*   **Primary (`#e9c176`):** This is our "Burnished Gold." Use it sparingly for critical path actions and legendary-tier information.
*   **Secondary (`#dac3a2`):** "Weathered Vellum." This serves as our primary interactive surface for secondary actions.
*   **Tertiary (`#00dce5`):** "Soul Fire." This is the only high-chroma color allowed. It is reserved exclusively for magical properties, runic glows, and active enchantments.
*   **Surface & Background (`#161311`):** "Obsidian Grime." Our canvas is a deep, near-black that allows high-contrast text and metallic textures to pop.

### The "No-Line" Rule
**Explicit Instruction:** Do not use 1px solid borders to section content. Traditional "dividers" are forbidden. Boundaries must be defined solely through background color shifts. Use `surface-container-low` for large content blocks and `surface-container-high` for nested interactive elements. If a separation is needed, use the **Spacing Scale (8 - 1.75rem)** to create structural breathing room.

### Surface Hierarchy & Nesting
Treat the UI as a physical stack.
1.  **Base Layer:** `surface` (#161311) – The deep, dark background.
2.  **Middle Layer:** `surface-container` (#231f1d) – Large UI panels (e.g., Inventory, Quest Log).
3.  **Interactive Layer:** `surface-container-highest` (#393431) – Active buttons or hovered items.

### The "Glass & Gradient" Rule
To mimic the semi-realistic aesthetic, use **Glassmorphism** for floating tooltips or overlay menus. Use a 20% opacity on `surface-variant` with a `backdrop-blur` of 12px. For primary CTAs, apply a subtle linear gradient from `primary` (#e9c176) to `primary-container` (#715313) at a 135-degree angle to simulate the sheen of real metal.

## 3. Typography
Our typography is a dialogue between the old world and the new.

*   **Display & Headline (Newsreader):** A sophisticated serif that carries the "Gothic Editorial" weight. Use `display-lg` (3.5rem) for major location reveals and `headline-md` (1.75rem) for character names and item titles.
*   **Body (Work Sans):** A clean sans-serif that ensures legibility during high-intensity gameplay. Used for quest descriptions and stats. 
*   **Labels (Space Grotesk):** A utilitarian, wide-set sans-serif used for technical data (e.g., "Strength 18/20"). This creates a "functional" contrast against the more romantic Newsreader serif.

## 4. Elevation & Depth
In this system, depth is earned, not given. We eschew standard drop shadows for **Tonal Layering**.

*   **The Layering Principle:** Place a `surface-container-lowest` card on a `surface-container-low` section to create a recessed "carved" look. 
*   **Ambient Shadows:** For floating elements like drag-and-drop items, use a wide, diffused shadow.
    *   *Shadow Color:* 8% opacity of `on-surface` (#eae1dd).
    *   *Blur:* 24px.
    *   *Spread:* 2px.
*   **The "Ghost Border" Fallback:** If a border is required for accessibility, use the `outline-variant` token (#54433a) at **15% opacity**. Never use a 100% opaque border; it breaks the illusion of realistic textures.

## 5. Components

### Buttons
*   **Primary:** Solid gradient (`primary` to `primary-container`). Sharp edges (`0px` roundedness). Text is `on-primary` (#412d00) in all-caps Space Grotesk.
*   **Secondary:** No background, only a `ghost border`. On hover, the background fills with a 5% opacity `primary`.
*   **Tertiary:** Text-only with a `tertiary` (#00dce5) runic glow effect on hover.

### Input Fields
*   **Style:** Recessed appearance. Use `surface-container-lowest`. 
*   **Active State:** The bottom edge glows with a 1px `primary-fixed` line.
*   **Errors:** Use `error` (#ffb4ab) for text only. The box does not turn red; instead, a subtle "blood-spatter" texture or glow can be applied behind the field.

### Cards & Item Slots
*   **Forbid Dividers:** Use `1.3rem (6)` spacing or a shift to `surface-container-high` to separate items.
*   **Tactile Feedback:** Item icons should have a 1px inner-glow (inset shadow) of `primary-fixed-dim` to look like they are set into the UI frame.

### Custom Component: The "Runic Header"
A decorative header for top-level navigation. It uses a `Newsreader` font with an underline that tapers off at the ends, utilizing a `primary` to `transparent` gradient.

## 6. Do's and Don'ts

### Do:
*   **Embrace the Void:** Use the deep `surface` colors to create mystery. Not every pixel needs to be filled.
*   **Use Asymmetry:** Place your headers slightly off-center to mimic the look of hand-written ledgers.
*   **Focus on Silhouettes:** Ensure all UI icons have high-contrast silhouettes against the dark background.

### Don't:
*   **No Rounded Corners:** Set all border-radii to `0px`. This system is built of iron and stone, not plastic.
*   **No Pure White:** Use `on-surface` (#eae1dd) for text. Pure white (#ffffff) is too clinical and destroys the gothic atmosphere.
*   **No Standard Grids:** Avoid perfectly even columns. Let some elements overlap others to create a sense of physical "clutter" found in a realistic workshop.