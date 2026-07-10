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

| Phase    | Status      | Notes                                                                                      |
| -------- | ----------- | ------------------------------------------------------------------------------------------ |
| Inspect  | complete    | Confirmed an existing Vue/VitePress documentation site and no prior Sites project metadata |
| Validate | complete    | Homepage tests passed (16/16) and the full bilingual VitePress build succeeded             |
| Adapt    | complete    | Static worker routing tests passed (3/3) and the VitePress preview opened successfully     |
| Publish  | in progress | Create the Sites project, save the validated version, and deploy privately                 |
| Verify   | pending     | Poll deployment status and hand off the production URL                                     |

## Publishing Constraints

- Preserve the user's existing uncommitted homepage changes.
- Keep VitePress as the documentation source and preserve clean routes and interactive examples.
- Do not replace the current docs UI with a new starter.
- Publish privately unless Sites reports that owner-only access cannot be verified.

## Publishing Errors Encountered

| Error                                                                            | Attempt | Resolution                                                                           |
| -------------------------------------------------------------------------------- | ------- | ------------------------------------------------------------------------------------ |
| Initial combined inspection returned exit 1 because `.openai/` did not exist     | 1       | Confirmed this is a new Sites project and continued with targeted reads              |
| Combined homepage test and docs check timed out without output after 124 seconds | 1       | Split validation into isolated commands and constrain Vitest workers before retrying |
| Initial worker test expected generic Button and Page Not Found titles            | 1       | Matched the real generated titles after confirming the responses were correct        |
