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
