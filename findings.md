# FlTree Findings

## Product / PRD

- `FlTree` targets Ant Design Tree semantics.
- The implementation must be standalone and must not depend on `ElTree` or `ElTreeV2`.
- Stage 1 is intentionally narrow: render tree data, support field mapping, provide a recursive
  `TreeNode`, inherit Element Plus visual variables, and wire exports so demos/tests can import it.

## Repository Patterns

- Root scripts already provide `lint`, `test`, `build`, `play:build`.
- `packages/components/index.ts` is the central export barrel for component/runtime/type exports.
- Existing wrapper components use:
  - `src/<component>.ts` for props/emits/types
  - `src/<component>.vue` for SFC implementation
  - clear JSDoc comments on props, payloads, and helper logic
- `packages/components/tree/index.ts` now exports `FlTree` and the stage 1 tree types.
- `packages/components/package.json` now exports `./tree`.
- `packages/falcon-ui/index.ts` now includes `FlTree` in the install chain.
- `packages/falcon-ui/global.d.ts` now declares `FlTree` in `GlobalComponents`.
- `packages/theme/index.scss` now includes `./src/tree.scss`.
- Stage 1 test scope stays frozen to `data`, `props`, recursive `TreeNode`, Element Plus visual
  variable inheritance, and the minimal export chain.
- `packages/components/tree/__test__/tree.test.ts` now carries the executable contract through
  phases 1-9.

## Stage 3 Findings

- `tree.vue` no longer owns expand state directly; stage 3 routes all expand logic through
  `src/use-tree-expanded-state.ts`.
- `tree.ts` now exports:
  - `defaultExpandAll`
  - `defaultExpandedKeys`
  - `expandedKeys`
  - `defaultExpandParent`
  - `autoExpandParent`
  - `flTreeEmits`
  - `FlTreeEmits`
  - `FlTreeExpandPayload`
- Non-controlled initialization now follows the locked priority:
  1. `defaultExpandedKeys`
  2. `defaultExpandAll`
  3. default collapsed
- `defaultExpandAll` is now initialization-only. Data updates prune invalid keys but do not
  auto-expand newly appended branches.
- The playground now passes `default-expand-all` explicitly so stage 3's default collapsed
  runtime behavior does not make the demo look empty.

## Stage 5 Findings

- `tree.ts` now exposes `multiple` publicly with a default value of `false`.
- `src/use-tree-selected-state.ts` now owns both single-select and ordinary multi-select semantics
  instead of encoding an implicit single-key model in the render layer.
- The shared normalization rules are now fixed to:
  - deduplicate keys
  - drop invalid or missing keys
  - drop disabled nodes
  - drop `selectable=false` nodes
  - preserve the surviving order
- Controlled selection now behaves consistently in both single and multi mode: the component emits
  the next requested `selectedKeys`, but the UI only changes after the prop is updated.
- Uncontrolled ordinary multi-select follows the locked click contract:
  - click an unselected node to append it
  - click a selected node to remove only that node
  - no `ctrl` / `command` modifier logic is introduced in this stage
- `select` now keeps the same signature, but in multi-select mode `selectedKeys` and
  `event.selectedNodes` both reflect the full post-click selection set, while `event.selected`
  describes only the clicked node's new boolean state.
- The playground now explicitly documents that directory-tree shortcut multi-select is still out of
  scope for this stage.

## Stage 6 Findings

- `tree.ts` now exposes the phase 6 checkbox contract publicly:
  - `checkable`
  - `checkStrictly`
  - `defaultCheckedKeys`
  - `checkedKeys`
  - `update:checkedKeys`
  - `check`
- `TreeData`, `TreeNodeModel`, and `TreeNode` now all carry `disableCheckbox`, and phase 6 still
  ignored node-level `checkable=false` on purpose.
- `src/use-tree-checked-state.ts` took ownership of the checkbox state model instead of mixing
  checkbox behavior into the render layer.
- Checked key normalization in phase 6 intentionally only deduplicated keys and dropped invalid or
  missing keys, while preserving disabled and `disableCheckbox` nodes for display-only state.
- Checkbox clicks were isolated from the existing selection and expansion chains.
- Theme styling for the checkbox is global SCSS, so ordinary descendant selectors are correct;
  `:deep()` was unnecessary and produced a build warning until it was removed.

## Stage 7-9 Findings

- Checked-state internals are now unified around two sets:
  - `checkedKeys`
  - `halfCheckedKeys`
- `packages/components/tree/src/use-tree-check-conduct.ts` now centralizes all checked-state
  normalization and conduct logic, instead of scattering branch rules across the render layer.
- Default checkbox mode now matches the Ant Design / rc-tree baseline:
  - public `checkedKeys` shape remains `TreeKey[]`
  - clicking a parent conducts downward across reachable descendants
  - clicking a leaf recalculates ancestor `checked` and `halfChecked`
  - half-check state is rendered with `ElCheckbox` `indeterminate` and `aria-checked="mixed"`
- Strict mode no longer uses the phase 6 temporary array contract. The public contract is now:
  - `checkedKeys={{ checked, halfChecked }}`
  - `update:checkedKeys` emits the same object shape
  - `check` emits the same object shape as its first argument
- `defaultCheckedKeys` intentionally remains array-only in both modes. In strict mode it only
  seeds the `checked` set; `halfChecked` stays empty unless a controlled object prop provides it.
- `TreeCheckEvent` now always includes `halfCheckedKeys`, even when the first `check` argument is
  array-shaped in default conduct mode.
- Node-level checked boundaries are now intentionally split into three behaviors:
  - `disabled` is a hard conduct boundary and blocks checkbox interaction
  - `disableCheckbox` blocks checkbox interaction only, but still participates in parent-child
    checked and half-checked display
  - `checkable=false` hides that node's checkbox, excludes that node from emitted checked results,
    and remains transparent to descendant traversal
- Checkbox clicks remain isolated from selection and expand/collapse behavior after the stage 7-9
  conduct refactor.
- The playground now demonstrates three distinct stage 7-9 scenarios:
  - default conduct arrays
  - strict object values
  - disabled / disableCheckbox / `checkable=false` boundaries

## Stage 12 Planning Findings

- `FlTree` semantic DOM styling is now intentionally limited to shell structures:
  - `root` for the `role="tree"` root
  - `item` for each `role="treeitem"` node shell
- `itemIcon`, `itemCheckbox`, and `itemTitle` remain internal BEM/layout structures where needed,
  but they are no longer public semantic DOM keys for `classNames` / `styles`.
- The resolver factory argument is now shaped as `{ props }`, matching the public PRD contract.
- `styles.item` is merged before the internal item style, so `--fl-tree-level` remains owned by the
  component even when users pass item-level styles.
- The playground now demonstrates only root / item shell styling for stage 12.

## Applicability Notes

- `vue-best-practices` applies because this is a Vue 3 component task.
- `planning-with-files` applies because this task crossed the multi-step threshold and needs
  persistent phase tracking.
- `component-development-playbook` does not apply because `FlTree` is not an Element Plus wrapper.

---

# Falcon UI Docs Publishing Findings

- The documentation site is an existing VitePress 1.6 project rooted at `docs/`.
- Root scripts already include `docs:dev`, `docs:build`, `docs:preview`, and `docs:check`.
- The site provides Chinese and English locales, local search, component demos, and custom Vue
  theme components.
- No `.openai/hosting.json` exists, so publishing must create a new Sites project exactly once.
- The worktree contains user-authored changes in the homepage illustration, homepage layout, and
  related tests; publishing must include and preserve those changes.
- Sites packaging requires `dist/server/index.js` plus `.openai/hosting.json`; the existing
  VitePress build outputs to `docs/.vitepress/dist`, so a small hosting adapter is required.
- A Cloudflare-compatible worker can delegate generated files to the Sites `ASSETS` binding while
  mapping VitePress clean URLs such as `/components/button` to `/components/button.html`.
- Sites version 1 deployed successfully with owner-only access at
  `https://falcon-ui-docs.wangzixu53982.chatgpt.site`.

---

# Docs Homepage Exploded Animation Findings

- `HomeExplodedIllustration.vue` already renders each plane as an independent `.svg-plane` group,
  so the complete panel, depth faces, projected content, and glyph overlays can move together.
- Connectors render in a separate `.svg-connectors` group after all planes and can be revealed
  without changing their tested geometry.
- The current reduced-motion rule disables plane animation but no plane animation exists yet; it
  must also reset opacity/transform and cover connector animation.
- The targeted homepage test baseline is 20 passing tests.
- Existing homepage, illustration, and test modifications are user work and must remain intact.
- A 390x844 production preview keeps document `scrollWidth` equal to 390px, so the responsive
  animation configuration introduces no horizontal overflow.
- Mobile computed styles resolve the planned shorter offsets (`-72%`, `-18%`, `52%`, `142%`) and
  every plane finishes at full opacity with an identity matrix.
- Desktop light and dark previews both preserve the final layer geometry and connector visibility.

---

# Docs Homepage White-Screen Performance Findings

- Investigation started on 2026-07-18; no implementation changes are authorized in this pass.
- Existing planning files and homepage-related worktree changes are user-owned and must be
  preserved.
- The docs site is VitePress 1.6.4 with local search and direct source aliases into every Falcon UI
  workspace package.
- Port 5173 is already listening locally; the owning process must be identified before deciding
  whether it is the correct docs runtime.
- Computer Use found one Chrome window, but it contains an unrelated Google Gemini tab; it will not
  be disturbed for this diagnosis.
- `git status --short -- docs package.json pnpm-lock.yaml` is clean, so the source analyzed for this
  report is the committed docs state.
- The existing listener is the expected command: `vitepress dev docs` on port 5173.
- The theme entry eagerly imports and installs full `element-plus`, full `FalconUI`, both complete
  stylesheet bundles, three docs-only components, and the homepage component for every route.
- `HomePage.vue` also eagerly imports the 1,000+ line inline-SVG illustration; this adds parsing and
  module transformation cost before homepage hydration can complete.
- An isolated DevTools browser is available with a clean `about:blank` tab, so profiling can proceed
  without touching the user's existing Chrome session.
- The docs server is reachable at `http://localhost:5173/` but not at IPv4 loopback because the
  current VitePress process is bound to IPv6 loopback.
- Unthrottled dev trace: LCP was **1,721 ms** even on localhost. TTFB was only **5 ms**; the
  remaining **1,716 ms (99.7%)** was element render delay, proving the blank interval is not caused
  by HTML/server latency.
- The critical request chain reached **1,669 ms** and ended in VitePress/Vue devtools modules. The
  page did not render its text LCP until the JavaScript/module graph completed.
- The trace shows the homepage fetching examples for both Chinese and English documentation across
  Tree, Table, Dialog, Select, Input, Date Picker, Barcode, QR Code, and Radial Menu. These examples
  are unrelated to the homepage and should not be in its initial dependency graph.
- Full `element-plus.js`, full Element Plus CSS, Falcon theme SCSS, and numerous example-scoped
  styles are also requested during homepage startup. This confirms the source-level eager-import
  hypothesis in runtime evidence.
- Source confirmation: `theme/index.ts` uses `import.meta.glob([...], { eager: true })` for both
  `docs/examples/**/*.vue` and `docs/en/examples/**/*.vue`, then globally registers every result.
  This is the primary defect behind the dev white screen.
- Browser Resource Timing measured **250 initial resources / 4.90 MB decoded** on a localhost
  homepage load. Of these, **209 requests / 1.01 MB** are under `/examples/`; **215 requests** are
  Vue SFC modules and **92 requests / 581 KB** are CSS/SCSS modules.
- First Paint was **660 ms**, but First Contentful Paint was **1,724 ms**. The page therefore paints
  a visually empty shell/background long before the actual homepage content appears, matching the
  reported white-screen symptom.
- The single largest dev resource is the full prebundled `element-plus.js` at **2.31 MB decoded**.
  Full Element Plus CSS adds **353 KB** and the Falcon theme SCSS response adds **133 KB**.
- `HomeExplodedIllustration.vue` is about **30 KB source**, while `HomePage.vue` is about **9 KB**;
  these are meaningful but secondary compared with eager-loading every example and full UI bundles.
- Under **4x CPU + Fast 3G**, LCP expanded to **48,118 ms**. TTFB remained only **8 ms**;
  **48,110 ms** was render delay and the maximum critical request path was **47,029 ms**.
- The throttled critical tree still runs through the same eager theme/module graph and only requests
  `index.md` near the end. This explains why the content area remains visually empty for tens of
  seconds on a constrained client even though the HTML arrives immediately.
- The throttled result is a stress-test rather than a real-user metric (no CrUX data exists), but
  it proves the architecture scales pathologically with network latency and module request count.
- The previous production output was stale relative to the latest docs commit, so it was rebuilt
  before production profiling. The current build completed successfully in **76.97 s**.
- Vite emitted a production warning that some minified chunks exceed **500 KB**, plus a warning that
  `dialog.vue` cannot be moved to a separate dynamic chunk because it is also statically imported.
  Both are consistent with the full-library eager theme entry.
- The prior/stale build already contained **7.35 MB of JavaScript assets** and a single **601 KB CSS
  bundle** across the site; current entry-specific sizes will be measured from the rebuilt preview.
- The current build contains **7.36 MB JavaScript** and **600,944 bytes CSS** across 94 assets. The
  homepage preloads the shared `theme` chunk, framework chunk, page lean chunk, and the single full
  stylesheet.
- A clean production preview is running on `http://localhost:5174/` for an apples-to-apples trace;
  this server was started solely for the investigation and does not replace the existing dev server.
- Under the same **4x CPU + Fast 3G** profile, the production preview LCP was **2,102 ms** with a
  **2,098 ms render delay**. This is dramatically better than dev's 48.1 s because VitePress ships
  the homepage as server-rendered HTML instead of waiting for hundreds of source modules.
- The white-screen report is therefore primarily a **development-mode dependency fan-out defect**.
  Production still has a secondary render-blocking CSS/shared-bundle problem, but it does not
  reproduce the dev-scale blank interval.
- Production's maximum critical request chain was only **715 ms** (`/` → `app.*.js`). The only
  request DevTools explicitly marked render-blocking was `vp-icons.css` at **590 ms total** under
  the throttled profile.
- Because production HTML already contains the full homepage markup, eager JavaScript no longer
  blocks content existence, but the shared CSS and hydration work still delay when that markup is
  visibly painted.
- The first production trace reused cached entry assets. A genuinely cold isolated-context trace
  under the same 4x CPU/Fast 3G profile measured **3,364 ms LCP** (65 ms TTFB + **3,299 ms render
  delay**).
- DevTools estimates **1,146 ms FCP/LCP savings** from removing or reducing production render-blocking
  resources. This makes the **601 KB uncompressed shared stylesheet** the leading production-side
  issue after the development-mode defect.
- In the cold production trace, `style.*.css` stayed render-blocking for **1,980 ms** under Fast 3G;
  its Brotli-compressed payload was about **65.7 KB** and its decoded size was **600.9 KB**.
  `vp-icons.css` was also render-blocking for 588 ms. The critical JS chain reached **1,202 ms**.
- DOM size itself is not excessive: DevTools measured **228 elements**, depth 17, and at most 28
  children. However, initial layout cost **646 ms** at 4x CPU, and style recalculation affected 2,268
  element-visits; the large inline SVG contributes to this secondary render cost.
- Forced synchronous reflow totaled **87 ms** (mostly framework code, with a smaller theme chunk
  contribution). This is worth cleaning up later but is not large enough to explain the long blank
  screen by itself.
- A true isolated-context dev cold navigation took roughly **50 seconds** under Fast 3G/4x CPU.
  DevTools could not serialize the resulting trace because its string exceeded the runtime's
  maximum size; this is a profiler-output limit, so exact cold metrics are taken from the Navigation
  and Resource Timing APIs instead of repeating the oversized trace.
- Final browser timing for that cold dev load: `loadEventEnd` **67,251 ms**, First Paint **67,224
  ms**, and First Contentful Paint **70,244 ms**. This is the direct measured white-screen duration.
- The cold dev page transferred **2.65 MB** across **250 resources**. It loaded **213 example
  resources / 1.08 MB**, **218 Vue SFC resources / 1.20 MB**, and **94 style resources / 600 KB**.
  Resource downloads ended around 33.7 s, but module evaluation kept DOMContentLoaded blocked until
  67.2 s, proving both network fan-out and main-thread module execution are involved.
- Dev serves only a **510-byte HTML shell** with an empty `<div id="app"></div>`; it contains no
  homepage markup. Production serves **33,867 bytes** of server-rendered homepage HTML. Therefore
  dev cannot show meaningful content until the entire eager module graph mounts.
- `theme/index.ts` line 51 is the direct trigger (`eager: true`). Lines 41-42 install all of Element
  Plus and all 15 Falcon components, while lines 14/16 import the complete Element Plus and Falcon
  theme styles. `packages/theme/index.scss` statically includes every component stylesheet.
- Cold production startup transfers about **525 KB across 12 resources**, versus dev's 2.65 MB
  across 250 resources. The production theme chunk alone is **325 KB compressed / 1.30 MB decoded**
  and took 5.8 s to finish under Fast 3G, so it is a post-paint interactivity/hydration risk even
  though SSR lets content paint at 3.36 s.

## Root-Cause Ranking and Recommended Remediation

1. **P0 — eager demo glob:** replace `{ eager: true }` with lazy loaders and register examples as
   async components, or generate page-scoped imports. Success means the homepage makes zero
   `/examples/` requests before navigating to a component page.
2. **P1 — full global plugin installation:** avoid installing all of Element Plus and all Falcon UI
   components in the common theme entry. Register only docs infrastructure globally and load demo
   dependencies on demand.
3. **P1 — monolithic global CSS:** split Element Plus/Falcon component styles from homepage/docs
   shell styles. Keep only critical shell/home CSS on the homepage; DevTools estimates up to 1.146 s
   cold-production FCP/LCP savings from reducing render-blocking styles.
4. **P2 — homepage SVG/layout:** optimize the inline illustration or defer its non-critical visual
   work after headline paint. Its 153 SVG descendants and 646 ms throttled layout cost are secondary,
   not the root cause.
5. **P2 — regression budget:** add an automated homepage budget covering initial request count,
   accidental `/examples/` loads, CSS size, FCP/LCP, and shared theme chunk size.

---

# Docs Homepage White-Screen Optimization Findings

- Implementation started from the completed performance report; the requested scope is remediation
  priorities P0/P1/P1 only.
- Vue guidance favors local/on-demand registration, and Vite lazy `import.meta.glob` returns loader
  functions without eagerly evaluating matched modules.
- The Element Plus wrapper playbook does not apply because no Falcon component contract or wrapper
  implementation is being changed.
- The 124 demo SFCs rely mainly on globally resolved `Fl*` tags. Direct global Element Plus tags are
  limited to `ElIcon`, `ElOption`, `ElSelect`, `ElSwitch`, `ElTable`, `ElTableColumn`, and `ElTag`;
  no Element Plus directives are used by the demos.
- Element Plus ID and z-index SSR providers can be retained without importing the root plugin by
  importing their internal hook entry modules directly.
- Falcon component package entries export named installable components and can be targeted by
  explicit dynamic imports, including `FlTable` and `FlTableEditor` from the shared table entry.
- Loading the existing full Element Plus/Falcon style set only from an async demo boundary is the
  lowest-risk way to remove 601 KB of CSS from the homepage while preserving all demo visuals.
- `VpDemo` renders its named demo via dynamic `<component :is="...">`, so globally registered
  `defineAsyncComponent` wrappers are compatible with the existing Markdown output.
- Element Plus exposes typed exact subpaths for the required SSR hooks and individual components;
  the common docs theme does not need the root `element-plus` entry.
- Vite's default CSS code splitting remains available; no VitePress override disabling
  `cssCodeSplit` was found. Dynamic demo style imports should therefore produce non-home CSS chunks,
  which will be confirmed from the build output rather than assumed.
- The `useDialog` hook already lazy-loads `FlDialog`, so removing the global Falcon UI plugin does
  not break its component resolution path.
- The shared theme entry is now limited to VitePress/docs infrastructure plus a small async runtime;
  the runtime keeps component and style loaders behind `defineAsyncComponent` boundaries.
- The new performance source-contract suite passes 3/3 after the implementation and prevents
  reintroducing root plugin installs, eager demo globbing, or static demo CSS imports.

---

# Falcon UI Compressed Production Release Findings

- The existing public production URL is `https://falcon-ui-docs.wangzixu53982.chatgpt.site`.
- Requests with `Accept-Encoding: br, gzip` receive `Content-Encoding: gzip` for both the homepage
  HTML and its main CSS asset, with Cloudflare serving the response.
- Sites already performs production HTTP compression at the edge. Adding Worker-level dynamic
  compression or build-time `.gz` files would duplicate that behavior and add operational risk.
- The release should therefore publish the latest white-screen optimizations unchanged and verify
  that gzip remains present after deployment.
