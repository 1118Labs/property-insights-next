# Property Insights Brand Guide

Structured reference for building Property Insights interfaces consistently across light and dark themes.

## Logo Usage
- Primary logo: mark + wordmark on light surfaces; use navy or full-color mark.
- Dark backgrounds: use white mark/wordmark; ensure 16px min padding around.
- Minimum size: 24px height for mark-only, 32px height for lockup.
- Clear space: at least 0.5x the mark height on all sides; keep free of text or graphics.
- Never distort, recolor outside palette, place on busy photos, or add effects.

## Color System (PI Navy Stack + PI Cyan Accents)
```md
PI-Navy-950: #021C36
PI-Navy-900: #0B2A49
PI-Navy-800: #123659
PI-Navy-700: #1D446A
PI-Navy-600: #285278
PI-Navy-500: #35648A
PI-Navy-100: #E8F0F7

PI-Cyan-500: #14D8FF
PI-Cyan-400: #4FE3FF
PI-Cyan-200: #A6F0FF
PI-Cyan-100: #E5FBFF

Success: #10B981
Warning: #F59E0B
Error:   #EF4444
Neutrals: Slate-50..900 (Tailwind defaults), White, Black
```
- Light surfaces lean on white and Slate-50 with navy text; cyan used for focus/active.
- Dark surfaces lean on PI-Navy-900/950 with cyan for accent and white text.

## Typography System
```md
Display (Hero):     "Inter Tight" or "Sora", 40–56, -1% tracking, semi-bold
H1:                 "Inter Tight" or "Sora", 30–36, -1% tracking, semi-bold
H2:                 "Inter Tight" or "Sora", 24–28, -0.5% tracking, semi-bold
H3:                 "Inter", 18–20, 0 tracking, semi-bold
Body Large:         "Inter", 16, 0 tracking, medium
Body:               "Inter", 14–15, 0 tracking, regular/medium
Label / Eyebrow:    "Inter", 11–12, 0.18em letterspacing, semi-bold uppercase
Code/Data:          "JetBrains Mono" or "IBM Plex Mono", 12–13
```
- Use tight leading for headings (1.15–1.2), generous for body (1.5–1.6).
- Avoid mixing more than 2 font families on a page.

## Spacing Scale
```md
4, 8, 12, 16, 20, 24, 32, 40, 48, 64
```
- Default layout gutters: 24–32 on desktop, 16 on mobile.
- Cards: 20–24 padding; tables: 16–20 cell padding.

## Shadow & Blur Rules
- Light: `shadow-sm` for small UI, `shadow-lg shadow-[#021C36]/10` for cards, `shadow-xl` for elevated drawers/modals.
- Dark: soften with spread tint: `shadow-[0_24px_60px_-30px_rgba(0,0,0,0.65)]`.
- Glass: combine blur-12–20 with 10–20% white/ navy overlays and subtle borders.

## Card Styles
- **Light**: rounded-2xl/3xl, border white/20–slate-200/80, bg white/90–100, shadow-lg navy/10. Padding 20–24.
- **Dark/Glass**: bg gradient from white/20 to navy/40, border white/25, blur-16–20, shadow deep navy.
- Include faint gradients for hero cards (cyan wash) when emphasizing live data.

## Button Styles
```md
Primary:   bg-gradient-to-r from-[#021C36] to-[#0c345a], text-white,
           rounded-full, px-4–5, py-2–2.5, shadow-[0_14px_32px_-18px_rgba(2,28,54,0.7)]
Accent:    border-transparent, bg-[#14D8FF], text-[#021C36], hover: darker cyan
Ghost:     border-slate-200/80, bg-white/80, text-navy, hover: cyan/10
Danger:    bg-[#EF4444], text-white, hover:#dc2626
```
- Focus: 2px outline in PI-Cyan, 2px offset.
- Disabled: lower opacity, remove translate/hover shadows.

## Charts & Data Viz
- Palette: Navy for axes/labels, Cyan for primary series, Emerald for positive, Amber for warnings, Slate for baselines.
- Gridlines: subtle slate-200 on light, slate-700/opacity on dark.
- Corners: soften bars/areas with 6–10 radius.
- Tooltips: glass card, blur-12, white/90, border white/20, shadow-lg navy/20.
- Use meaningful deltas with up/down arrows colored success/error.

## Form Patterns
- Inputs: rounded-xl, border slate-200/70, bg white/90; focus ring cyan.
- Labels: 12–13, medium; helper text 12 slate-500.
- Toggles/switches: cyan accent when on; navy track.
- Validation: error border #EF4444, helper text same color.

## Motion & Animation
- Default easing: `cubic-bezier(0.22,1,0.36,1)` (swift-out).
- Durations: 150–250ms for micro-interactions; 300–500ms for drawers/modals.
- Hover: subtle translateY(-2px) + shadow lift; active: return to rest.
- Skeleton shimmer optional; prefer pulse opacity.

## Component Examples
### Cards
- Light: rounded-2xl, border white/20–slate-200/80, bg white/90, shadow-lg navy/10.
- Dark/Glass: rounded-2xl, border white/25, bg gradient white/20→navy/40, blur-16.

### Tables
- Header: 16–20px padding, uppercase label rows, subtle divider, rounded top corners.
- Rows: 16–20px padding, hover bg cyan/6, dividers slate-100/80.
- Badges: cyan pill with dot, navy text.

### Drawers
- Slide-in from right/bottom, blur-20, bg white/20→navy/40, border white/25, shadow deep navy.
- Top bar sticks with soft border and close pill.

### Navigation
- Sidebar: white bg, navy text, icons in slate-50 chips; active dot cyan glow.
- Top bar: white with thin navy border shadow; refresh pill ghost style.

## Light vs Dark Comparisons
- Light text on white: navy headers (#021C36), slate body (#475569).
- Dark text on navy: white primary, slate-200 body, cyan accents.
- Cards: swap bg to navy/40 with blur; keep borders at white/25; maintain cyan focus ring in both.

## Tailwind Token Snippets
```md
--color-primary: #021C36;
--color-accent: #14D8FF;
--radius-card: 1.25rem; /* rounded-2xl */
--shadow-card: 0 14px 32px -18px rgba(2,28,54,0.7);
--blur-glass: 20px;
--spacing-card: 1.25rem; /* 20px */
--padding-table-cell: 1rem; /* 16px */
```

## Implementation Notes
- Keep layouts to the spacing scale; avoid off-scale padding.
- Prefer gradients and subtle textures over flat blocks for hero/summary areas.
- Use cyan sparingly for actions, focus, and live status—not for large surfaces.
