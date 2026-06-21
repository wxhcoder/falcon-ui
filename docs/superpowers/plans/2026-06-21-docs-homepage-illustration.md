# Docs Homepage Illustration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this
> plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver a bilingual Falcon UI documentation homepage with a responsive CSS exploded-view
illustration.

**Architecture:** Register a focused Vue homepage in the VitePress theme. Keep Markdown pages as
locale entrypoints, isolate the illustration in its own presentational component, and use existing
VitePress variables for light/dark compatibility.

**Tech Stack:** Vue 3 `<script setup lang="ts">`, VitePress, scoped CSS, Vitest, ESLint, Prettier.

---

### Task 1: Define the homepage regression contract

**Files:**

- Create: `docs/.vitepress/__test__/home-page.test.ts`

- [x] **Step 1: Write the failing test**

```ts
expect(themeSource).toContain("app.component('HomePage', HomePage)")
expect(homeSource).toContain('home-exploded-illustration')
expect(illustrationSource).toContain('prefers-reduced-motion: reduce')
```

- [x] **Step 2: Run the targeted test to verify it fails**

Run: `pnpm vitest run docs/.vitepress/__test__/home-page.test.ts`

Expected: FAIL because the homepage components and registration do not yet exist.

### Task 2: Build the reusable homepage and illustration

**Files:**

- Create: `docs/.vitepress/components/HomePage.vue`
- Create: `docs/.vitepress/components/HomeExplodedIllustration.vue`
- Modify: `docs/.vitepress/theme/index.ts`
- Modify: `docs/index.md`
- Modify: `docs/en/index.md`

- [x] **Step 1: Implement the illustration**

Render exactly three semantic panel layers (`Foundation`, `Layout`, `Template`), shared dashed
connectors, blue anchor nodes, softly blurred panel shadows, a low-frequency CSS float animation,
and a reduced-motion override.

- [x] **Step 2: Implement the localized page**

Use `localeIndex` to select copy and links. Include a heading, description, primary “Get started”
and secondary “Components” links, three value items, and the overview link.

- [x] **Step 3: Register and mount**

Register `HomePage` in the theme, then replace the root and English Markdown bodies with frontmatter
that disables sidebar/outline and the shared component tag.

- [x] **Step 4: Run the targeted test to verify it passes**

Run: `pnpm vitest run docs/.vitepress/__test__/home-page.test.ts`

Expected: PASS.

### Task 3: Verify the full documentation build

**Files:**

- Modify: `docs/superpowers/specs/2026-06-21-docs-homepage-illustration-design.md`
- Modify: `docs/superpowers/plans/2026-06-21-docs-homepage-illustration.md`

- [x] **Step 1: Format and lint the homepage files**

Run: `pnpm exec prettier --check docs/.vitepress/components/HomePage.vue docs/.vitepress/components/HomeExplodedIllustration.vue docs/.vitepress/theme/index.ts docs/index.md docs/en/index.md docs/.vitepress/__test__/home-page.test.ts`

Run: `pnpm exec eslint docs/.vitepress/components/HomePage.vue docs/.vitepress/components/HomeExplodedIllustration.vue docs/.vitepress/theme/index.ts docs/.vitepress/__test__/home-page.test.ts --max-warnings=0`

- [x] **Step 2: Run full automated verification**

Run: `pnpm test && pnpm docs:build`

Expected: all tests pass and the VitePress production build completes.

## Execution Notes

- The initial combined implementation patch could not match the pre-existing encoded Chinese
  homepage source. The implementation was applied as focused component/theme patches and complete
  homepage-entry replacements instead; no unrelated documentation content was changed.
- Local VitePress started on an IPv6 loopback port, but the browser automation context could not
  access that loopback target. Production build and static visual contracts remain the validation
  route for this environment.
