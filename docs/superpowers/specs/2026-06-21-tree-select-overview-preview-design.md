# Tree Select Overview Preview Design

## Goal

Make the `FlTreeSelect` card preview visually consistent with `FlSelect`, while making the open dropdown
unambiguously read as a tree.

## Decision

Use the approved C direction: a compact, icon-led tree. The preview will use three nested rows with expand
chevrons, progressive indentation, and blue/gray node dots. It will not use tree connector lines.

## Implementation Boundary

- Modify only `docs/public/overview/fl-tree-select.svg`.
- Preserve the existing `248 x 144` transparent SVG canvas contract.
- Do not change overview-card data, component APIs, documentation pages, or layout styles.

## Visual Contract

- Reuse the Select preview's input and popup geometry: input at `(32, 24)` with size `184 x 34`, and popup
  at `(32, 68)` with size `184 x 58`; both use `4px` corners.
- Reuse its dark shell, blue focus border, blue label, neutral popup border, and upward chevron.
- Label the field `Tree Select` so the preview identifies the component without relying on the card title.
- Render the dropdown as a three-level hierarchy:
  - a selected top-level node with an open chevron and blue dot;
  - an indented child with an open chevron and blue dot;
  - a further-indented leaf with a muted gray dot.
- Keep the tree markers compact enough that the dropdown retains the visual density of the Select preview.

## Verification

- Parse the updated SVG as XML.
- Run the docs build.
- Open the component overview and confirm the Tree Select preview aligns with Select while showing clear hierarchy.
