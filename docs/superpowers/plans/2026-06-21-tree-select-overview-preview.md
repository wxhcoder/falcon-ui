# Tree Select Overview Preview Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the `FlTreeSelect` overview SVG match the `FlSelect` visual language while clearly displaying tree hierarchy.

**Architecture:** Replace only the static `fl-tree-select.svg` artwork. The input shell and popup reuse the Select
preview's geometry and colors; the popup's three nested node markers convey the approved C direction without
changing Vue, component, or overview-grid code.

**Tech Stack:** Static SVG, PowerShell XML parsing, VitePress.

---

### Task 1: Replace the Tree Select SVG preview

**Files:**

- Modify: `docs/public/overview/fl-tree-select.svg`

- [x] **Step 1: Verify the existing preview violates the shared style contract**

Run:

```powershell
$svg = Get-Content -Raw docs/public/overview/fl-tree-select.svg
if ($svg -match '#FFFFFF|#F8FAFC|#CBD5E1') {
  throw 'Tree Select still uses the legacy light preview palette.'
}
```

Expected: The command fails with `Tree Select still uses the legacy light preview palette.`

- [x] **Step 2: Replace the preview with the approved C-direction SVG**

Use this complete SVG content:

```xml
<svg width="248" height="144" viewBox="0 0 248 144" fill="none" xmlns="http://www.w3.org/2000/svg">
  <title>FlTreeSelect SVG preview</title>
  <rect x="32" y="24" width="184" height="34" rx="4" fill="#171A1E" />
  <rect x="32" y="24" width="184" height="34" rx="4" fill="url(#fl-tree-select-shell)" />
  <rect x="32" y="24" width="184" height="34" rx="4" stroke="#0083FF" />
  <text x="42" y="41" dominant-baseline="middle" fill="#4EA8FF" font-size="16" font-weight="500">Tree Select</text>
  <path d="M196 43L201 38L206 43" stroke="#4EA8FF" stroke-linecap="round" stroke-linejoin="round" />
  <rect x="32" y="68" width="184" height="58" rx="4" fill="#171A1E" />
  <rect x="32" y="68" width="184" height="58" rx="4" stroke="#555A61" />
  <rect x="40" y="76" width="168" height="14" rx="3" fill="#0083FF" fill-opacity=".12" />
  <path d="M47 82L50 85L53 82" stroke="#4EA8FF" stroke-linecap="round" stroke-linejoin="round" />
  <circle cx="61" cy="85" r="3" fill="#4EA8FF" />
  <rect x="70" y="82" width="54" height="6" rx="3" fill="#4EA8FF" />
  <path d="M61 97L64 100L67 97" stroke="#6F7781" stroke-linecap="round" stroke-linejoin="round" />
  <circle cx="75" cy="100" r="3" fill="#4EA8FF" />
  <rect x="84" y="97" width="52" height="6" rx="3" fill="#6F7781" />
  <circle cx="89" cy="115" r="3" fill="#6F7781" />
  <rect x="98" y="112" width="60" height="6" rx="3" fill="#6F7781" />
  <defs>
    <linearGradient id="fl-tree-select-shell" x1="32" y1="24" x2="216" y2="58" gradientUnits="userSpaceOnUse">
      <stop stop-color="#2A3038" stop-opacity=".44" />
      <stop offset="1" stop-color="#0E1115" stop-opacity=".16" />
    </linearGradient>
  </defs>
</svg>
```

- [x] **Step 3: Validate the asset contract**

Run:

```powershell
[xml](Get-Content -Raw -Encoding utf8 docs/public/overview/fl-tree-select.svg) | Out-Null
$svg = Get-Content -Raw docs/public/overview/fl-tree-select.svg
if ($svg -notmatch 'width="248" height="144"' -or $svg -notmatch 'Tree Select' -or $svg -notmatch 'fl-tree-select-shell') {
  throw 'Tree Select overview SVG is missing the required canvas, label, or scoped gradient.'
}
```

Expected: The command exits with code `0`.

### Task 2: Validate rendered documentation

**Files:**

- Read: `docs/public/overview/fl-select.svg`
- Read: `docs/public/overview/fl-tree-select.svg`

- [x] **Step 1: Run the documentation build**

Run:

```powershell
pnpm docs:build
```

Expected: VitePress exits with code `0`.

- [x] **Step 2: Inspect the overview card in the browser**

Open the components overview page and compare `FlSelect` with `FlTreeSelect`.

Expected: The two cards have matching input and popup geometry; Tree Select has visible nested rows, two expand
chevrons, and three progressively indented node dots.

- [x] **Step 3: Commit the implementation and plan**

Run:

```powershell
git add docs/public/overview/fl-tree-select.svg docs/superpowers/plans/2026-06-21-tree-select-overview-preview.md
git commit -m "Align Tree Select overview preview"
```

Expected: Git creates a commit containing only the updated SVG and its implementation plan.
