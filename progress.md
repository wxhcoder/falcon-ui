# FlTree Progress

# Falcon UI Latest Main Release Progress

## 2026-07-22

- Loaded the Sites building/hosting, Vue, and file-planning workflows.
- Confirmed the workspace is on `main`, the GitHub remote targets `wxhcoder/falcon-ui`, and the
  existing hosting metadata points to the requested Falcon UI Sites project.
- Inventoried all pending tracked and untracked paths; detailed diff review and validation are in
  progress before the release commit is created.
- Reviewed the FlTable focus-class delta sync, cell-indexed editor registry, regression coverage,
  benchmark route/scripts/artifacts, InputSearch bilingual examples, homepage styling, and favicon.
- Confirmed `git diff --check` passes; only Git line-ending conversion notices were reported.
- Full lint passed. The first full test run exhausted fork-worker startup while three heavy gates
  ran concurrently, and typecheck exposed a stale TypeScript 7 link under `play/node_modules`.
- Validation recovery is restoring the pnpm lockfile dependency graph and will rerun tests with a
  constrained worker count instead of repeating the resource-heavy parallel invocation.
- Restored the lockfile-defined TypeScript 6.0.2 / vue-tsc 3.2.x dependency graph without changing
  tracked files; workspace typecheck now passes.
- Re-ran the full suite with one worker: 28 test files and 347 tests passed.
- The first Sites build found ten repository-source links in the new performance report that are
  not valid VitePress routes; converted them to explicit code paths before rebuilding.
- Formatted the corrected report and shared planning records with the repository Prettier config.
- Re-ran `pnpm docs:build:sites` successfully; VitePress rendered all pages and the Sites worker
  output completed with only existing Sass deprecation and chunk-size warnings.

---

## 2026-04-16

- Read `packages/components/tree/Tree_PRD.md`.
- Confirmed `FlTree` is a standalone component, not an Element Plus wrapper.
- Inspected repository root scripts and `packages/components` export structure.
- Inspected existing component patterns from `input` and `table`.
- Created project planning files for phased execution.
- Confirmed the stage 1 export chain likely requires updates in:
  - `packages/components/tree/index.ts`
  - `packages/components/index.ts`
  - `packages/components/package.json`
  - `packages/falcon-ui/index.ts`
  - `packages/falcon-ui/global.d.ts`
  - `packages/theme/index.scss`
- Added the stage 1 test scaffold at `packages/components/tree/__test__/tree.test.ts`.
- Added the stage 1 test documentation section to `packages/components/tree/Tree_PRD.md`.
- Replaced the TODO coverage with executable stage 1 assertions.
- Ran `pnpm vitest run packages/components/tree/__test__/tree.test.ts` and the targeted install
  regression check.
- Phase 1 is now closed from the test side; next phase remains blocked on user confirmation.

## 2026-04-18

- Re-read the stage 3 PRD plan and current tree implementation.
- Added stage 3 expand props and emits in `packages/components/tree/src/tree.ts`.
- Introduced `packages/components/tree/src/use-tree-expanded-state.ts` to centralize expand-state
  priority, initialization, ancestor expansion, and toggle behavior.
- Simplified `packages/components/tree/src/tree.vue` to consume the composable and emit stage 3
  events.
- Kept `packages/components/tree/src/tree-node.vue` as a render-only recursive node that consumes
  expand state from the root component.
- Exported `FlTreeEmits` and `FlTreeExpandPayload` from both tree barrels.
- Updated the tree playground to pass `default-expand-all` explicitly for visibility.
- Rewrote `packages/components/tree/__test__/tree.test.ts` to match the stage 3 contract.
- Backfilled `packages/components/tree/Tree_PRD.md` with stage 3 scope, test cases, results, and
  completion status.
- Ran:
  - `pnpm exec prettier --write ...`
  - `pnpm exec eslint ...`
  - `pnpm exec vitest run packages/components/tree/__test__/tree.test.ts`
  - `pnpm exec vitest run packages/components/__test__/install.test.ts packages/components/tree/__test__/tree.test.ts`
  - `pnpm exec vue-tsc -p tsconfig.build.json --noEmit`
  - `pnpm build:lib`
  - `pnpm --dir play build`
- Phase 3 is now complete and still blocked from stage 4 until the user confirms.

## 2026-04-22

- Re-read `packages/components/tree/Tree_PRD.md` and locked the phase 5 scope to ordinary tree
  multi-select only.
- Added the public `multiple` prop in `packages/components/tree/src/tree.ts`.
- Reworked `packages/components/tree/src/use-tree-selected-state.ts` into a shared single / multi
  select state layer:
  - controlled mode now reads only `selectedKeys`
  - uncontrolled mode initializes from `defaultSelectedKeys` once and only prunes invalid keys on
    later data changes
  - key normalization now deduplicates and filters invalid, missing, disabled, and
    `selectable=false` nodes while preserving order
  - ordinary tree multi-select now appends newly selected keys and removes only the clicked key
- Extended `packages/components/tree/__test__/tree.test.ts` with phase 5 coverage for default
  multi-select normalization, uncontrolled append/remove, controlled multi-select, select payloads,
  and multi-select boundaries.
- Updated `play/src/views/components-view.vue` with explicit ordinary tree multi-select demos,
  controlled selection switches, clear actions, and richer event logging.
- Backfilled `packages/components/tree/Tree_PRD.md` with the phase 5 runtime contract, test matrix,
  verification results, and archive status.
- Ran:
  - `pnpm exec prettier --write packages/components/tree/src/tree.ts packages/components/tree/src/use-tree-selected-state.ts packages/components/tree/__test__/tree.test.ts packages/components/tree/Tree_PRD.md play/src/views/components-view.vue`
  - `pnpm exec eslint packages/components/tree/src/tree.ts packages/components/tree/src/use-tree-selected-state.ts packages/components/tree/src/tree.vue packages/components/tree/src/tree-node.vue packages/components/tree/__test__/tree.test.ts play/src/views/components-view.vue`
  - `pnpm exec vitest run packages/components/tree/__test__/tree.test.ts`
  - `pnpm exec vitest run packages/components/__test__/install.test.ts packages/components/tree/__test__/tree.test.ts`
  - `pnpm exec vue-tsc -p tsconfig.build.json --noEmit`
  - `pnpm build:lib`
  - `pnpm --dir play build`
- Phase 5 is now complete and blocked from stage 6 until the user confirms.

## 2026-04-23

- Re-read the stage 6 PRD scope and locked the behavior to checkbox rendering plus strict
  independent checking only.
- Added public checkbox props and events in `packages/components/tree/src/tree.ts`:
  - `checkable`
  - `checkStrictly`
  - `defaultCheckedKeys`
  - `checkedKeys`
  - `update:checkedKeys`
  - `check`
- Extended the standardized tree node model with `disableCheckbox` and carried it through event
  nodes.
- Introduced `packages/components/tree/src/use-tree-checked-state.ts` to own controlled /
  uncontrolled checked state, normalization, and strict independent toggle semantics.
- Wired `tree.vue` and `tree-node.vue` to render `ElCheckbox`, emit checkbox-only events, and keep
  checkbox clicks isolated from select / expand behavior.
- Updated `packages/theme/src/tree.scss` to include Element Plus checkbox styles and tree checkbox
  layout rules.
- Expanded `packages/components/tree/__test__/tree.test.ts` with phase 6 coverage for checkbox
  rendering, checked key normalization, strict toggling, controlled check state, render-only
  non-strict behavior, disabled boundaries, event isolation, and checkbox/select coexistence.
- Updated `play/src/views/components-view.vue` with stage 6 checkbox demos, controlled check
  buttons, checked key display, and `check` event logs.
- Backfilled `packages/components/tree/Tree_PRD.md` with the phase 6 test document, runtime
  contract, results, and archive status.
- Ran:
  - `pnpm exec eslint`
  - `pnpm exec vitest run packages/components/__test__/install.test.ts packages/components/tree/__test__/tree.test.ts`
  - `pnpm exec vue-tsc -p tsconfig.build.json --noEmit`
  - `pnpm build:lib`
  - `pnpm --dir play build`
- Phase 6 is now complete and blocked from stage 7 until the user confirms.

## 2026-04-24

- Re-read the consolidated stage 7-9 PRD plan and locked the delivery order to:
  - default conducted checking
  - strict-mode object contract
  - disabled / checkbox boundary cleanup
- Added `packages/components/tree/src/use-tree-check-conduct.ts` to centralize checked-state
  normalization, parent-child conduct, half-check calculation, strict normalization, and output
  shaping.
- Expanded the public checked-state contract in `packages/components/tree/src/tree.ts` with:
  - `TreeCheckedKeysObject`
  - `TreeCheckedKeys`
  - strict-mode object prop / emit validation
  - `TreeCheckEvent.halfCheckedKeys`
- Reworked `packages/components/tree/src/use-tree-checked-state.ts` around unified
  `checkedKeys` / `halfCheckedKeys` state for both controlled and uncontrolled modes.
- Updated `packages/components/tree/src/tree-node.vue` and `packages/components/tree/src/tree.vue`
  to:
  - render `indeterminate` checkboxes
  - emit `aria-checked="mixed"` for half-checked nodes
  - hide node-level `checkable=false` checkboxes
  - keep checkbox interactions isolated from select / expand chains
- Extended `packages/components/tree/src/tree-types.ts`, `packages/components/tree/index.ts`, and
  `packages/components/index.ts` so the new runtime contract and node metadata are exported
  consistently.
- Reworked `packages/components/tree/__test__/tree.test.ts` to cover:
  - default conduct
  - half-check propagation
  - strict object checked values
  - controlled strict updates
  - disabled hard boundaries
  - `disableCheckbox` interaction boundaries
  - node-level `checkable=false` transparency
  - checkbox click isolation and selection coexistence regressions
- Updated `play/src/views/components-view.vue` so the playground now shows dedicated stage 7-9
  demos and logs both checked and half-checked keys.
- Backfilled `packages/components/tree/Tree_PRD.md` with the phase 7-9 contract, migration note,
  test coverage, and verification summary.
- Ran:
  - `pnpm exec prettier --write packages/components/tree/src/tree-types.ts packages/components/tree/src/tree.ts packages/components/tree/src/use-tree-check-conduct.ts packages/components/tree/src/use-tree-checked-state.ts packages/components/tree/src/tree.vue packages/components/tree/src/tree-node.vue packages/components/tree/index.ts packages/components/index.ts packages/components/tree/__test__/tree.test.ts play/src/views/components-view.vue packages/components/tree/Tree_PRD.md task_plan.md findings.md progress.md`
  - `pnpm exec eslint`
  - `pnpm exec vitest run packages/components/__test__/install.test.ts packages/components/tree/__test__/tree.test.ts`
  - `pnpm exec vue-tsc -p tsconfig.build.json --noEmit`
  - `pnpm build:lib`
  - `pnpm --dir play build`
- Results:
  - `vitest`: 44 passed
  - `vue-tsc`: passed
  - `build:lib`: passed with the existing `dialog.vue` dynamic-import warning
  - `play build`: passed with the existing chunk-size warning
- Stages 7, 8, and 9 are now complete in one verified pass.

## 2026-05-01

- Re-read `packages/components/tree/Tree_PRD.md` and current `FlTree` source for phase 12.
- Confirmed `FlTree` is standalone and not an Element Plus `ElTree` wrapper, so the Element Plus
  wrapper playbook does not apply to this phase.
- Scoped stage 12 semantic DOM styling to Tree-owned shell structures only:
  - `root`
  - `item`
- Removed `itemIcon`, `itemCheckbox`, and `itemTitle` from the public `TreeSemanticDOM` contract.
- Changed semantic record factory input from `{ componentProps }` to `{ props }`.
- Updated `tree-node.vue` so only the item shell consumes semantic class / style records; internal
  BEM nodes remain for layout and interaction only.
- Added stage 12 tests for object form, function form, props-driven recomputation, unsupported
  internal semantic keys, and event-order stability.
- Added a playground toggle that demonstrates only root / item shell styling.
- Updated `packages/components/tree/Tree_PRD.md` with the phase 12 test document and completion
  status.
- Ran:
  - `pnpm exec vitest run packages/components/tree/__test__/tree.test.ts`
  - `pnpm exec eslint packages/components/tree/src/tree-types.ts packages/components/tree/src/tree.ts packages/components/tree/src/tree.vue packages/components/tree/src/tree-node.vue packages/components/tree/__test__/tree.test.ts play/src/views/components-view.vue`
  - `pnpm exec vue-tsc -p tsconfig.build.json --noEmit`
  - `pnpm --dir play build`
- Results:
  - `vitest`: 52 passed
  - target `eslint`: passed
  - `vue-tsc`: passed
  - `play build`: passed with the existing chunk-size warning
- Stage 12 is now complete.

---

# Falcon UI Docs Publishing Progress

## 2026-07-10

- Loaded the Sites building and hosting workflows.
- Inspected the existing VitePress structure, package scripts, localization, custom theme, and
  current uncommitted homepage changes.
- Confirmed no existing Sites project metadata is present.
- Started validating the current documentation build before adding hosting compatibility.
- The first combined validation command timed out without producing a test result; switched to
  isolated, resource-constrained test and build commands so the failure can be diagnosed safely.
- Ran the homepage suite with one worker: 16 tests passed.
- Ran `pnpm docs:check`: API metadata generation and the full VitePress build succeeded.
- Added a Sites build script, static asset worker, hosting metadata scaffold, and worker route tests.
- The first worker test run confirmed routing worked but exposed two overly generic title
  assertions; updated them to the actual generated VitePress titles.
- Re-ran the Sites worker suite: 3 tests passed.
- Opened the existing VitePress preview at `http://127.0.0.1:5173/` and confirmed the Falcon UI
  document title loaded.
- Created the private Falcon UI Documentation Sites project and persisted its project metadata.
- Pushed the exact validated source state to the Sites source branch; an HTTP/2 interruption was
  resolved by using Git HTTP/1.1.
- The bundled Bash packager could not start because WSL is unavailable in this Windows session;
  switched to an equivalent native PowerShell archive flow.
- Saved Sites version 1 from the validated archive and deployed it privately.
- Sites reported deployment success at `https://falcon-ui-docs.wangzixu53982.chatgpt.site`.
- The in-app browser could not complete a TLS handshake with the newly provisioned hostname, but
  the production deployment itself completed successfully according to Sites.
- Final plan review confirmed all publishing phases are complete; the auxiliary completion helper
  did not recognize the appended Markdown phase table format.

---

# Docs Homepage Exploded Animation Progress

## 2026-07-14

- Loaded Vue, frontend motion, and file-planning guidance.
- Recovered and preserved the existing dirty worktree and prior planning records.
- Confirmed the current illustration has four independently grouped planes and separate connectors.
- Confirmed the homepage regression baseline passes all 20 tests.
- Started the implementation phase for the one-shot staggered entrance animation.
- Added per-plane initial offsets, overshoot values, and 70ms stagger delays.
- Added the 880ms one-shot layer keyframes and delayed connector reveal.
- Added mobile-specific reduced travel and complete reduced-motion final-state resets.
- Extended the homepage regression suite with an animation contract test.
- The first parallel test/format check stopped on Prettier warnings for both edited files; the
  test result was not retained, so verification continues with isolated commands.
- Formatted the two edited source/test files with the repository Prettier configuration.
- Re-ran the homepage regression suite successfully: 21 tests passed.
- Target ESLint and Prettier checks passed.
- The VitePress production build succeeded with only existing Sass, chunking, and bundle-size
  warnings.
- Desktop final-state inspection showed all planes at full opacity with identity transforms.
- One timed browser screenshot returned a capture-only black frame; surrounding screenshots and
  computed element bounds remained healthy.
- The browser page scope did not expose `Element.getAnimations()`, so visual verification continues
  with computed styles and responsive bounds.
- Verified the production preview at 390x844: no horizontal overflow, no clipping, and all mobile
  offset overrides applied.
- Verified desktop light and dark final states: four planes and connectors are fully visible with
  identity transforms after the entrance finishes.
- Browser visual verification is complete; reduced motion remains covered by the source contract
  test because the local browser cannot emulate the system preference.
- Restored the preview theme, finalized browser tabs, and stopped the local preview server; the
  combined cleanup command left only its two temporary log files for separate removal.
- Final source diff and whitespace checks passed.
- The three planning Markdown files required repository-standard formatting before handoff.

---

# Docs Homepage White-Screen Performance Progress

## 2026-07-18

- Loaded the Computer Use safety/runtime guidance and the file-based planning workflow.
- Confirmed the repository already has modified planning records; appended a new investigation
  section without overwriting prior content.
- Started the baseline phase; no product source files have been modified.
- Inspected package scripts, VitePress configuration, docs inventory, scoped dirty state, and local
  listeners.
- Preserved the user's unrelated open Chrome window and selected an isolated profiling path.
- Confirmed the listener on port 5173 belongs to `vitepress dev docs`.
- Mapped the homepage entry chain and identified the eager theme-level imports to validate against
  the performance trace.
- Completed the baseline phase and moved to cold-load profiling in an isolated DevTools browser.
- The first navigation to IPv4 loopback failed because VitePress is listening on IPv6 loopback;
  switched the target URL to `localhost` instead of repeating the same endpoint.
- The requested workspace trace path was rejected by the isolated DevTools filesystem policy;
  continued with DevTools-managed trace storage so profiling itself remains unaffected.
- Recorded the first unthrottled cold-load performance trace and analyzed its LCP breakdown and
  network dependency tree.
- Confirmed that render delay/module fan-out, not TTFB, accounts for virtually the entire blank
  interval.
- Read the exact demo registration implementation and proved it eagerly imports every localized
  demo module.
- Collected Resource Timing counts, decoded sizes, First Paint/FCP timings, and slowest initial
  resources from the loaded page.
- Repeated the trace with Fast 3G networking and 4x CPU slowdown; captured the 48.1-second LCP and
  47.0-second critical path.
- Detected that the existing production output predated the latest docs commit, rebuilt the current
  site successfully, and retained Vite's chunk-size/static-import warnings as supporting evidence.
- Measured the rebuilt asset totals and started an isolated current production preview on port 5174.
- Recorded the production preview under the same Fast 3G/4x CPU conditions and measured 2.10-second
  LCP, establishing the dev-versus-production boundary of the issue.
- Analyzed production render-blocking resources and the critical dependency chain.
- Corrected for warm-cache bias by tracing a new isolated browser context from `about:blank`; the
  true cold production LCP is 3.36 seconds under the constrained profile.
- Analyzed cold production render-blocking CSS, dependency latency, DOM/layout cost, and forced
  reflow to rank secondary causes.
- Ran an isolated cold dev navigation; navigation itself completed after about 50 seconds, but the
  generated trace was too large for DevTools to serialize, so switched to browser timing entries.
- Collected the final cold-dev Navigation/Resource Timing data: 67.2-second First Paint and
  70.2-second FCP with 250 resources.
- Compared HTTP shells and proved dev serves an empty mount point while production includes the
  server-rendered homepage.
- Completed profiling and began final source/build correlation.
- Measured the true cold production startup payload and confirmed the 1.30 MB decoded theme chunk
  continues loading after first paint.
- Ranked the root causes and proposed measurable remediation priorities without changing product
  source.
- Reset browser CPU/network emulation, closed isolated profiling pages, stopped the temporary 5174
  preview, and verified the pre-existing 5173 dev server remains running.
- Finalized the white-screen problem report; all investigation phases are complete.

---

# Docs Homepage White-Screen Optimization Progress

## 2026-07-18

- Reloaded the Vue, Vite, and file-planning workflows for the implementation turn.
- Preserved the pre-existing dirty planning files and started a new scoped optimization plan.
- Began mapping the docs-only runtime dependencies before changing registration or styles.
- Cataloged all demo component tags/imports and confirmed no Element Plus directives require global
  plugin installation.
- Confirmed SSR injection keys and Falcon component entries can be imported without the two root
  plugins; logged and corrected a Windows-only `rg` glob failure.
- Verified `VpDemo`, Element Plus subpath exports, `useDialog`, and Vite CSS-splitting behavior support
  the planned async runtime design.
- Added a source-contract regression suite for lazy demo loading, on-demand component registration,
  and demo-only style loading; the red baseline is ready to run.
- Confirmed the red baseline failed all 3 tests for the expected missing contracts.
- The first combined implementation/planning patch could not identify the intended error table;
  split the edits and confirmed no partial source change occurred.
- Added a docs-only async runtime that lazy-loads demo SFCs, registers only the required Falcon and
  Element Plus components through dynamic imports, and loads the full demo visual theme on demand.
- Removed the two full plugin installations and all demo CSS imports from the shared theme entry.
- Re-ran the new performance suite successfully: 3 tests passed.
- Target lint/type verification exposed a pre-existing docs TypeScript configuration resolution
  problem for `falcon-ui/global` and `node`; separated lint from the config diagnosis.

---

# Falcon UI Compressed Production Release Progress

## 2026-07-18

- Loaded the Sites building, Sites hosting, Vite, and file-planning workflows.
- Resolved the existing Falcon UI project, production URL, public access mode, and current source
  state without changing the site's access policy.
- Verified production gzip delivery for both HTML and CSS; selected platform compression instead
  of redundant Worker-level compression.
- Started validation of the latest white-screen optimization source before publishing.
- The first validation run found a stale source-contract assertion after the VitePress hook context
  fix; updated the assertion to the correct `context.app` call before retrying.
- The combined retry exceeded the command window because tests and the full docs build shared one
  timeout; split the production check into a separate run instead of repeating the same command.
- Completed the split validation successfully: all 36 documentation tests passed and the full API
  generation plus VitePress production build completed.
- Began packaging and source publication for a new Sites version.
- Sites could not issue a fresh source credential because of an internal connector error; checking
  the existing version's source binding before choosing the established repository fallback.
- Pushed the validated release commit to the established source repository.
- The first packaging-helper call rejected the Windows drive-letter archive path; switching to the
  helper's native MSYS path form for the retry.
- Packaged the validated Sites artifact successfully and confirmed its required server and hosting
  metadata entries.
- The first save attempt proved the Sites project uses a separate bound source repository; obtained
  a fresh credential after the earlier connector error cleared.
- The bound repository rejected a direct push because its previous release history diverges from
  GitHub main; preparing a merge commit with the current validated tree and both histories intact.
- Pushed a merge commit to the bound Sites source repository with the validated current tree and
  the previous production commit retained as history.
- The first archive upload failed at the file transport layer; retrying the already validated
  archive once without rebuilding or changing its contents.
- Saved Sites version 2 successfully after the archive retry.
- Paused immediately before production deployment because the existing site is public and the
  hosting workflow requires explicit public-release confirmation.
- A cleanup command for the uploaded temporary archive was blocked by command policy; left the
  harmless file in the system temporary directory instead of bypassing the policy.

---

# FlTable 50×50 Keyboard Focus Performance Progress

## 2026-07-20

- Reloaded the Vue, Element Plus wrapper, browser, and file-planning workflows for implementation.
- Recovered existing planning history and preserved unrelated dirty docs and planning changes.
- Mapped the FlTable keyboard path, active-cell class callbacks, editor registry, play router, and
  available quality commands.
- Logged and corrected a rejected combined planning append; it produced no partial file changes.
- Started the isolated benchmark page implementation; component source remains untouched.
- Added `/table-performance`, navigation, query-controlled 1–100 row/column dimensions, plain and
  2,500-editor modes, non-reactive class probes, double-frame key timing, and a browser snapshot API.
- The new play files pass targeted ESLint.
- The first play typecheck could not resolve `falcon-ui/global` because the linked `dist/falcon-ui`
  directory was empty; rebuilding and relinking before retrying.
- Rebuilt the complete local library successfully with unminified source maps and generated global
  types. The subsequent npm link installed incompatible TypeScript/vue-tsc versions in `play`, so
  dependency recovery is switching to pnpm rather than repeating npm link.
- Restored the locked pnpm workspace dependency graph, retained the local Falcon UI distribution
  junction, and passed `pnpm --dir play typecheck` with TypeScript 6.0.2.
- Benchmark implementation phase is complete; browser profiling is now in progress.
- Started the play server at `127.0.0.1:5174` and verified the plain baseline DOM is exactly 50×50.
- Confirmed a real ArrowRight moves the active cell one column without entering edit mode; the first
  measurement recorded 213.8 ms and 2,500 cell-class callbacks.
- Captured and analyzed the first DevTools trace in memory: worst keydown 608 ms, including 397 ms
  processing and 210 ms presentation delay; 7,670 elements were affected by a 167 ms style pass.
- DevTools rejected three distinct raw-trace destinations, so file export is switching to a separate
  Chrome DevTools Protocol capture rather than repeating the blocked API path.
- Added a dependency-free CDP capture script for reproducible physical-key traces, metrics, and PNGs;
  corrected its first lint pass by replacing the progress console call.
- Captured all four raw Chrome traces through the deterministic CDP runner. The artifacts are valid gzip
  JSON trace streams; a corrected probe-order run and report generation remain.
- Regenerated all four traces after moving the probe to the window capture phase; each key now records the
  expected 2,500 body class callbacks, plus 50 header callbacks when cross highlight is enabled.
- Added an independent raw-trace analyzer and a fact-versus-inference baseline report with ranked P0–P3
  proposals. No file under `packages/components/table/**` changed.
- Passed play typecheck, full lint, 342 tests, full library/Playground production build, and diff checks.
- Kept the unrelated `pnpm-workspace.yaml` untouched: it is the only file failing the repository-wide
  Prettier check, while the supplemental check for every other supported file passes.
- Stopped the temporary Vite server and restored pnpm's locked dependency graph after the required legacy
  npm-link build step.

## 2026-07-21 FlTable P0 implementation

- Reloaded the Vue performance, Element Plus wrapper, browser-control, and file-planning workflows.
- Recovered the dirty workspace without changing unrelated docs/site work.
- Froze the P0-only implementation boundary and started the complete component-local P0–P3 roadmap.
- Added `packages/components/table/PERFORMANCE_OPTIMIZATION_PLAN.md` with the full P0–P3 roadmap and an
  explicit restriction that only P0-A/P0-B may change code in this iteration.
- Inspected editor registration, DOM cell resolution, focus lifecycle, structural watchers, and the existing
  regression matrix; implementation design now preserves fixed clones and current editor priority rules.
- Implemented P0-A with a non-reactive focus snapshot and old/new DOM class-set delta updates.
- Implemented P0-B with a non-reactive `Map`/`WeakMap` registry indexed by owning table cell.
- Added callback-count and registry fast-path tests; the component tests pass 33/33 and the full suite
  passes 345/345.
- Built and profiled the final distribution in all four fixed scenarios. Body/header callback probes are
  zero for all 96 measured keys.
- Saved final compressed traces, screenshots, page metrics, and raw-trace analysis under
  `docs/performance/artifacts/p0-after/`.
- Added the complete P0–P3 component plan and P0 result report under `packages/components/table/`;
  P1–P3 remain documentation only.
