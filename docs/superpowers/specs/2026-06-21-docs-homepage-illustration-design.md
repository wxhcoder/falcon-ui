# Docs Homepage Illustration Design

## Goal

Replace the minimal Chinese and English documentation landing pages with a focused product
homepage for Falcon UI. The hero must recreate the supplied exploded-view visual language using
only Vue template markup and CSS.

## Experience

- Retain the existing docs navigation and locale switching, but hide the documentation sidebar and
  outline on both homepage routes.
- Present a two-column desktop hero with product copy and primary links on the left; use a
  three-layer, near-isometric UI-builder illustration on the right.
- Render the illustration as CSS/HTML panels connected by dashed vertical lines and blue anchor
  nodes. No image asset, SVG, or external font is required.
- Add a concise value strip and a direct entry to the component overview after the hero.
- Stack the hero on small viewports and reduce the illustration scale/tilt so it remains legible.
- Adapt panels, shadows, and text for the existing dark theme. Respect
  `prefers-reduced-motion` by disabling its floating animation.

## Architecture

- `HomePage.vue` owns locale-specific content, actions, and the page sections.
- `HomeExplodedIllustration.vue` owns the decorative but accessible illustration with a concise
  accessible description and presentation-only UI fragments.
- The VitePress theme registers `HomePage` globally so both Markdown entrypoints remain thin.

## Verification

- A docs regression test checks global component registration, both localized entrypoints, the
  three panel semantics, reduced-motion support, and the responsive/dark-mode style hooks.
- Run the targeted test, all tests, ESLint, formatting verification, and the VitePress production
  build.
