# FlTree Task Plan

## Goal

Implement `FlTree` strictly by PRD phases. The current completed milestone is `阶段 12` in the PRD.
The closed runtime milestones cover:

- default collapsed behavior when no expand props are provided
- `defaultExpandAll`
- `defaultExpandedKeys`
- controlled `expandedKeys`
- `defaultExpandParent` / `autoExpandParent`
- `update:expandedKeys` / `expand`
- `selectable`
- `defaultSelectedKeys`
- controlled / uncontrolled `selectedKeys`
- ordinary tree multi-select with `multiple=true`
- `update:selectedKeys` / `select`
- `checkable` / `checkStrictly`
- `defaultCheckedKeys` / `checkedKeys`
- `update:checkedKeys` / `check`
- default parent-child conduct checking
- strict-mode object-shaped checked state
- `halfCheckedKeys` event payloads
- `disabled` conduct boundaries
- `disableCheckbox` interaction boundaries
- node-level `checkable=false` checkbox hiding and checked-key pruning
- `showLine` line rendering and line + checkbox alignment fixes
- default label-only content, default slot takeover, full-row content hit area
- `switcherIcon = 'arrow' | 'plus-minus' | 'folder'`
- semantic DOM shell styling through `classNames` / `styles` on `root` and `item`

## Phase Status

| Phase       | Status   | Notes                                                               |
| ----------- | -------- | ------------------------------------------------------------------- |
| Preparation | complete | PRD and tree package scaffold already exist                         |
| Phase 1     | complete | Basic tree rendering, exports, tests, and PRD were closed           |
| Phase 2     | complete | Expand / collapse interaction shipped and pushed                    |
| Phase 3     | complete | Default expand + controlled expand shipped and verified             |
| Phase 4     | complete | Single-select shipped and verified                                  |
| Phase 5     | complete | Ordinary tree multi-select shipped and verified                     |
| Phase 6     | complete | Checkbox rendering and strict independent checking shipped          |
| Phase 7     | complete | Default conducted checking and half-check state shipped             |
| Phase 8     | complete | Strict-mode object contract and controlled half-check shipped       |
| Phase 9     | complete | Disabled / disableCheckbox / node-level checkable boundaries closed |
| Phase 10    | complete | `showLine` rendering and line + checkbox alignment closed           |
| Phase 11    | complete | Default node content and switcher visual modes marked complete      |
| Phase 12    | complete | Semantic DOM shell styling scoped to `root` / `item`                |

## Work Split

- Main agent: orchestrate, implement, verify, and document each PRD phase in one pass
- No delegated agents were used for the stage 7-9 rollout

## Constraints

- Use Vue 3 Composition API and `<script setup lang="ts">`
- `FlTree` is self-built, not a wrapper around `ElTree`
- Keep exports aligned with existing package entry conventions
- Every phase must be independently verifiable
- Comments must use Chinese, and functions should use JSDoc comments

## Open Questions

- None for phase 12. Phase 13 async loading remains the next PRD slice.

## Errors Encountered

| Error                                                         | Attempt | Resolution                                                                             |
| ------------------------------------------------------------- | ------- | -------------------------------------------------------------------------------------- |
| `.agents/skills/planning-with-files/SKILL.md` missing in repo | 1       | Loaded the global skill from `C:\Users\wxh\.codex\skills\planning-with-files\SKILL.md` |
| `rg.exe` access denied in this environment                    | 1       | Switched to PowerShell `Get-ChildItem` and targeted file reads                         |
| `pnpm build:lib` warns about `dialog.vue` dynamic import      | 1       | Confirmed it is a pre-existing non-blocking warning unrelated to `FlTree`              |
| `pnpm --dir play build` warns about large chunks              | 1       | Confirmed the build succeeds; chunk-size warning is non-blocking and pre-existing      |

---

# Falcon UI Docs Publishing Plan

## Goal

Publish the existing VitePress site under `docs/` with OpenAI Sites while preserving the current
documentation content, bilingual routes, interactive examples, and uncommitted homepage work.

## Phase Status

| Phase    | Status   | Notes                                                                                      |
| -------- | -------- | ------------------------------------------------------------------------------------------ |
| Inspect  | complete | Confirmed an existing Vue/VitePress documentation site and no prior Sites project metadata |
| Validate | complete | Homepage tests passed (16/16) and the full bilingual VitePress build succeeded             |
| Adapt    | complete | Static worker routing tests passed (3/3) and the VitePress preview opened successfully     |
| Publish  | complete | Saved version 1 and deployed it with owner-only access                                     |
| Verify   | complete | Sites reported a successful production deployment and returned the live URL                |

## Publishing Constraints

- Preserve the user's existing uncommitted homepage changes.
- Keep VitePress as the documentation source and preserve clean routes and interactive examples.
- Do not replace the current docs UI with a new starter.
- Publish privately unless Sites reports that owner-only access cannot be verified.

## Publishing Errors Encountered

| Error                                                                            | Attempt | Resolution                                                                             |
| -------------------------------------------------------------------------------- | ------- | -------------------------------------------------------------------------------------- |
| Initial combined inspection returned exit 1 because `.openai/` did not exist     | 1       | Confirmed this is a new Sites project and continued with targeted reads                |
| Combined homepage test and docs check timed out without output after 124 seconds | 1       | Split validation into isolated commands and constrain Vitest workers before retrying   |
| Initial worker test expected generic Button and Page Not Found titles            | 1       | Matched the real generated titles after confirming the responses were correct          |
| First Git push was interrupted by an HTTP/2 protocol error                       | 1       | Retried with Git HTTP/1.1 and pushed the prepared commit successfully                  |
| WSL could not start the bundled Bash packaging helper                            | 1       | Switched to an equivalent PowerShell staging and tar flow on Windows                   |
| In-app browser could not negotiate TLS with the new production hostname          | 1       | Sites deployment status is authoritative and reported the production release succeeded |
| Planning completion helper reported 0/0 phases for the appended Markdown table   | 1       | Verified all five publishing phases are marked complete in the table manually          |

---

# Docs Homepage Exploded Animation Plan

## Goal

Add a one-shot exploded-layer entrance animation to the existing four-plane homepage SVG while
preserving all current uncommitted geometry, layout, theme, and publishing work.

## Phase Status

| Phase     | Status   | Notes                                                                |
| --------- | -------- | -------------------------------------------------------------------- |
| Inspect   | complete | Current SVG groups, connector structure, tests, and dirty state read |
| Implement | complete | Added staggered transform/opacity animation and reduced-motion reset |
| Test      | complete | 21 tests, target lint/format, and VitePress production build passed  |
| Verify    | complete | Desktop/mobile and light/dark final states inspected successfully    |

## Constraints

- Animate only `transform` and `opacity`; do not change layout or SVG geometry.
- Play once on component mount and remain static afterward.
- Preserve the current public props contract and all user-authored uncommitted changes.
- Reduced-motion users must receive the final static illustration immediately.

## Errors Encountered

| Error                                                                           | Attempt | Resolution                                                                |
| ------------------------------------------------------------------------------- | ------- | ------------------------------------------------------------------------- |
| Target Prettier check reported both edited files need formatting                | 1       | Run targeted Prettier write, then rerun checks separately                 |
| In-app page scope did not expose `Element.getAnimations()`                      | 1       | Use computed CSS contracts, timed screenshots, and element bounds instead |
| Combined preview stop/log cleanup command returned exit 1 after stopping server | 1       | Confirm server stopped, then remove each temporary log separately         |
| Planning Markdown files failed the final Prettier check                         | 1       | Run Prettier only on the three planning files, preserving their content   |

---

# Docs Homepage White-Screen Performance Investigation Plan

## Goal

Reproduce the long initial white screen on the `docs/` homepage, record a browser performance
profile, correlate network/main-thread/render timing with source code, and deliver a diagnosis
report before making any implementation changes.

## Phase Status

| Phase     | Status   | Notes                                                      |
| --------- | -------- | ---------------------------------------------------------- |
| Baseline  | complete | Docs dev server confirmed on 5173; eager theme entry found |
| Profile   | complete | Dev warm/cold and production cold profiles captured        |
| Correlate | complete | Trace evidence mapped to theme entry, plugins, and CSS     |
| Report    | complete | Causes, severity, evidence, and fix priorities finalized   |

## Constraints

- Diagnose only; do not change homepage implementation in this pass.
- Preserve all existing uncommitted work.
- Use browser performance profiling evidence, not source inspection alone.
- Separate observed facts from hypotheses and note test conditions.

## Errors Encountered

| Error                                                   | Attempt | Resolution                                                               |
| ------------------------------------------------------- | ------- | ------------------------------------------------------------------------ |
| `rg packages/theme/src/*.scss` failed on a Windows glob | 1       | Use `-g '*.scss' packages/theme/src` on the next inspection              |
| `127.0.0.1:5173` returned `ERR_CONNECTION_REFUSED`      | 1       | Listener is IPv6-only; retry with `localhost` / `::1`                    |
| DevTools rejected the requested raw-trace path          | 1       | Record in DevTools temporary storage and retain summarized evidence      |
| Cold dev trace exceeded DevTools' maximum string size   | 1       | Do not repeat; use the completed navigation plus Resource Timing metrics |

---

# Docs Homepage White-Screen Optimization Plan

## Goal

Implement the first three remediation priorities from the performance report: lazy demo loading,
on-demand docs component registration, and route/component-scoped styles, while preserving all
interactive bilingual examples and existing homepage behavior.

## Phase Status

| Phase     | Status      | Notes                                                    |
| --------- | ----------- | -------------------------------------------------------- |
| Inspect   | complete    | Mapped demo tags, global dependencies, styles, and tests |
| Tests     | complete    | Red baseline failed 3/3; async contracts now pass 3/3    |
| Implement | in_progress | Refactor theme registration and style entry points       |
| Verify    | pending     | Run tests/build and repeat request/bundle profiling      |

## Constraints

- Preserve all existing user-authored changes and planning records.
- Keep Chinese and English demos functional in both dev and production builds.
- The homepage must make no `/examples/` requests before navigation to a component page.
- Do not globally import/install complete Element Plus or Falcon UI bundles.
- Keep the homepage/docs shell visually unchanged while splitting demo styles.

## Errors Encountered

| Error                                                                          | Attempt | Resolution                                                            |
| ------------------------------------------------------------------------------ | ------- | --------------------------------------------------------------------- |
| Combined source/planning patch matched the wrong prior error table             | 1       | Split source and planning patches; no partial source edit occurred    |
| New performance suite failed 3/3 on the red baseline                           | 1       | Expected; implemented the missing async runtime contracts             |
| `vue-tsc -p tsconfig.docs.json` could not resolve existing global type entries | 1       | Diagnose config separately; use build plus targeted TypeScript checks |

---

# Falcon UI Compressed Production Release Plan

## Goal

Validate compression behavior for the existing Falcon UI Sites project, add production-safe
compression support when required, build the latest documentation changes, and publish a new
production version.

## Phase Status

| Phase     | Status      | Notes                                                                         |
| --------- | ----------- | ----------------------------------------------------------------------------- |
| Inspect   | complete    | Live HTML and CSS already return `Content-Encoding: gzip` from the Sites edge |
| Implement | complete    | Retain platform compression; avoid redundant Worker or precompression code    |
| Validate  | complete    | 36 docs tests and the full API generation/VitePress production build passed   |
| Publish   | in_progress | Push exact source, save a Sites version, deploy, and poll to success          |
| Verify    | pending     | Confirm the new production URL and compressed response headers                |

## Constraints

- Preserve the existing VitePress architecture and all current documentation optimizations.
- Prefer Brotli with gzip fallback and send `Vary: Accept-Encoding` correctly.
- Do not rely on precompressed files unless the Sites asset binding can serve them correctly.
- Publish to the existing project `appgprj_6a50fb4353f88191bddd43224e785984`.

## Errors Encountered

| Error                                                                  | Attempt | Resolution                                                                                              |
| ---------------------------------------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------- |
| Performance test expected the old `registerDemoRuntime(app)` call      | 1       | Match the full-context hook implementation with `registerDemoRuntime(context.app)`                      |
| Combined tests plus `docs:check` exceeded the 120-second command limit | 1       | Tests had already advanced; rerun the production check separately with its own time budget              |
| Sites source credential request returned an internal connector error   | 1       | Inspect the existing saved version/source binding and use the established repository path if it matches |
| Git Bash tar treated the Windows `C:` archive path as a remote target  | 1       | Retry the packaging helper with MSYS `/c/...` and `/d/...` paths                                        |
| Saving the GitHub SHA failed because it was not the Sites source HEAD  | 1       | Push the exact release tree to the bound Sites source repository                                        |
| Direct Sites source push was rejected as non-fast-forward              | 1       | Merge the previous Sites history with the validated current source tree                                 |
