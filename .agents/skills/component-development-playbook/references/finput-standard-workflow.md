# FlInput Standard Workflow (Element Plus Wrapper)

This document applies only to wrapper mode: `FlInput` based on `ElInput`.
Do not use this file for from-scratch input components.

## 1. File Mapping

1. `packages/components/input/src/input.ts`
2. `packages/components/input/src/input.vue`
3. `packages/components/input/index.ts`
4. `packages/components/index.ts`
5. `packages/falcon-ui/index.ts`
6. `play/src/views/components-view.vue`
7. `packages/components/input/src/input.test.ts`

## 2. Contract Template (`input.ts`)

Define:

1. `inputProps` for wrapper-only extensions (for example `debugMode`, `debugLabel`).
2. `inputEmits` with runtime event-object validators.
3. Public types:
   - `InputProps`
   - `InputEmits`
   - custom event-object interfaces (for example `InputCustomEvent`, `InputDebugEvent`)

Guideline:

1. Keep wrapper props small and explicit.
2. Avoid duplicating all Element Plus props in wrapper contract.

## 3. Wrapper Template (`input.vue`)

Use this implementation shape:

1. `defineOptions({ name: 'FlInput', inheritAttrs: false })`
2. `const attrs = useAttrs()`
3. `const slots = useSlots()`
4. `const mergedAttrs = computed(() => ({ ...attrs, <wrapped-listeners> }))`
5. Render `h(ElInput, { ...mergedAttrs, ref: changeRef }, slots)`

Listener wrapping rules:

1. Read original listener from attrs (`onInput`, `onChange`, etc.).
2. Emit wrapper custom event first when needed.
3. Call original listener with original args.
4. Do not alter native event ordering unless intentionally specified in scope.

Expose rules:

1. Preserve useful `ElInput` expose.
2. Merge wrapper custom expose via project utility if needed.

## 4. Export Rules

In `packages/components/input/index.ts`:

1. Export `FlInput`.
2. Export public types used by consumers.
3. Keep component export name stable (`FlInput`) and keep public type names concise (`InputProps`, `InputEmits`, `...Event`).

Then verify aggregate exports are consistent in:

1. `packages/components/index.ts`
2. `packages/falcon-ui/index.ts`

## 5. Playground Rules

Demo must include:

1. Basic input path.
2. One slot path (`prefix` or `suffix`).
3. One custom wrapper event example with visible output.
4. Disabled or boundary state.

## 6. Done Criteria (FlInput)

1. Element Plus behavior still works through wrapper.
2. Wrapper-added behavior works and is typed.
3. Demo shows interaction evidence.
4. Tests cover main path and wrapper-specific branch.
