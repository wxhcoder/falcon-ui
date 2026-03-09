# Component Wrapper Checklist (Definition of Done)

Use this checklist for Element Plus secondary wrappers only.

## A. Applicability Gate

- [ ] Target component is from Element Plus (`El*`).
- [ ] Task is wrapper/enhancement, not from-scratch implementation.
- [ ] Wrapper must keep Element Plus public semantics.

## B. Scope and Contract

- [ ] In scope and out of scope are explicitly written.
- [ ] Acceptance criteria are explicit and testable.
- [ ] `src/<component>.ts` defines wrapper props and emits.
- [ ] Every custom emit has event-object validator and exported type.

## C. Naming Quick Check

- [ ] `Fl` prefix is used only for component names and install exports, such as `FlTable`.
- [ ] Runtime contract objects use short names such as `tableProps` and `tableEmits`, not `flTableProps` or `flTableEmits`.
- [ ] Public types use concise semantic names such as `TableProps`, `TableEmits`, and `RowData`.
- [ ] Custom event object types end with `Event`, such as `CellChangeEvent`; do not use `Payload`.
- [ ] Names do not repeat component context without need, such as `FlTableRowData` or `tableCellChangePayload`.
- [ ] Boolean names start with `is` / `has` / `can` / `should`; refs and collections use conventional names such as `tableRef`, `columnOrder`, and `visibleColumns`.

## D. Implementation

- [ ] `inheritAttrs: false` is set.
- [ ] Wrapper uses passthrough render with merged attrs.
- [ ] Original attrs listeners are invoked after wrapper logic.
- [ ] Slot passthrough is preserved.
- [ ] Ref/expose behavior is intentionally handled.

## E. Exports and Integration

- [ ] `packages/components/<component>/index.ts` exports component and types.
- [ ] `packages/components/index.ts` export chain is correct.
- [ ] `packages/falcon-ui/index.ts` export chain is correct when needed.

## F. Demo and Tests

- [ ] Play demo covers main path.
- [ ] Play demo covers one wrapper-specific extension path.
- [ ] Unit tests cover render, events, and custom event-object behavior.
- [ ] Regression checks exist for wrapper-specific logic.

## G. Quality Gates

- [ ] `pnpm lint` passes.
- [ ] `pnpm test` passes.
- [ ] `pnpm format:check` passes.
- [ ] `pnpm play:build` passes.
