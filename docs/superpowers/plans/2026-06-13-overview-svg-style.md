# Overview SVG Style Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redraw the docs overview component SVG previews using the approved blue/gray minimalist style guide.

**Architecture:** The overview grid already consumes static SVG files from `docs/public/overview/`. This plan keeps the existing grid implementation intact, rewrites the static assets to the approved `248x144` transparent-canvas format, and adds the missing `FlRadialMenu` overview entry because a component page already exists for it.

**Tech Stack:** VitePress docs, Vue overview data module, static SVG assets, pnpm verification commands.

---

## File Structure

- Modify: `docs/public/overview/fl-button.svg`
  - Replace the old button preview with the approved button sample.
- Modify: `docs/public/overview/fl-input.svg`
  - Replace the old input preview with the approved input sample.
- Modify: `docs/public/overview/fl-table.svg`
  - Replace the old table preview with the approved table sample.
- Modify: `docs/public/overview/fl-qr-code.svg`
  - Redraw as a compact QR tile with blue finder blocks and gray modules.
- Modify: `docs/public/overview/fl-barcode.svg`
  - Redraw as a compact barcode symbol with restrained blue highlight bars.
- Modify: `docs/public/overview/fl-tree.svg`
  - Redraw as a hierarchical node structure with thin connectors.
- Modify: `docs/public/overview/fl-input-search.svg`
  - Redraw as an input body plus search affordance.
- Modify: `docs/public/overview/fl-select.svg`
  - Redraw as a select field plus compact dropdown rows.
- Modify: `docs/public/overview/fl-date-picker.svg`
  - Redraw as a date input plus small calendar panel.
- Modify: `docs/public/overview/fl-input-number.svg`
  - Redraw as an input body with number block and stepper controls.
- Modify: `docs/public/overview/fl-dialog.svg`
  - Redraw as a modal panel with header/content/actions.
- Create: `docs/public/overview/fl-radial-menu.svg`
  - Add a radial menu preview asset for the existing component page.
- Modify: `docs/.vitepress/data/overview-components.ts`
  - Add the `FlRadialMenu` card under `interaction`.

## Task 1: Rewrite Current Overview SVG Assets

**Files:**

- Modify: `docs/public/overview/fl-button.svg`
- Modify: `docs/public/overview/fl-input.svg`
- Modify: `docs/public/overview/fl-table.svg`
- Modify: all other existing `docs/public/overview/*.svg`

- [x] **Step 1: Replace SVG contents**

Use direct SVG markup with:

```xml
<svg width="248" height="144" viewBox="0 0 248 144" fill="none" xmlns="http://www.w3.org/2000/svg">
  <title>ComponentName SVG preview</title>
  <!-- Transparent canvas, no background rect. -->
  <!-- Primary blue: #0083FF; main radius: 4; main stroke: 1. -->
</svg>
```

Expected: Every existing overview SVG has a transparent canvas, `248x144` size, `viewBox="0 0 248 144"`, no background card, no external references, and component-specific gradient ids.

- [x] **Step 2: Validate SVG files are well-formed**

Run:

```powershell
Get-ChildItem docs\public\overview -Filter *.svg | ForEach-Object {
  [xml](Get-Content -Raw -Encoding utf8 $_.FullName) | Out-Null
}
```

Expected: Command exits with code `0`.

## Task 2: Add Radial Menu Overview Card

**Files:**

- Create: `docs/public/overview/fl-radial-menu.svg`
- Modify: `docs/.vitepress/data/overview-components.ts`

- [x] **Step 1: Create the radial menu SVG**

Create `docs/public/overview/fl-radial-menu.svg` using the same root SVG contract as Task 1. The symbol should show a small center circle, thin radial segments, and blue active menu points.

Expected: The SVG parses as XML and visually matches the approved style.

- [x] **Step 2: Add the overview entry**

Insert this object in the `interaction` group after `FlTree`:

```ts
{
  name: 'FlRadialMenu',
  title: 'Radial Menu',
  group: 'interaction',
  link: '/components/radial-menu',
  description: '径向菜单组件，支持环形操作、更多项和快捷打开。',
  icon: '/overview/fl-radial-menu.svg'
}
```

Expected: The overview card links to the existing `docs/components/radial-menu.md` page.

## Task 3: Verify Docs Rendering

**Files:**

- Read: `docs/components/index.md`
- Read: `docs/.vitepress/components/overview-grid.vue`

- [x] **Step 1: Run static checks**

Run:

```powershell
pnpm exec prettier --check docs/public/overview docs/.vitepress/data/overview-components.ts docs/superpowers/plans/2026-06-13-overview-svg-style.md
```

Expected: Prettier exits with code `0`.

- [x] **Step 2: Build docs**

Run:

```powershell
pnpm docs:build
```

Expected: VitePress build exits with code `0`.

- [x] **Step 3: Inspect overview page**

Open the docs overview page in the browser and confirm:

- All cards show SVG previews.
- The previews use the approved blue `#0083FF`.
- The SVGs have no internal background cards.
- `FlRadialMenu` appears in the interaction group.
- No card has visually uneven internal padding.

Expected: The overview page displays a consistent set of SVG previews.

## Self-Review

- Spec coverage: The plan implements the approved canvas, background, color, radius, stroke, padding, abstraction, export, and rendering requirements.
- Placeholder scan: No implementation placeholder remains; each task names exact files and expected outcomes.
- Type consistency: The overview item object follows the existing `OverviewItem` shape and group keys.
