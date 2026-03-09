# Test Matrix for Element Plus Wrapper Components

Apply this matrix to wrappers such as `FlInput`, `FlButton`, `FlSelect`.

## 1. Rendering and Passthrough

1. Render wrapper with basic attrs.
2. Verify attrs required by base `El*` component are passed through.
3. Verify disabled or boundary states render correctly.

## 2. Data and Event Flow

1. Validate primary data flow (`v-model` where applicable).
2. Validate original attrs listeners still execute.
3. Validate wrapper custom event emits expected event object.

## 3. Slot Passthrough

1. Verify slot content renders unchanged.
2. Verify common slot variants (text node and icon/component node).

## 4. Wrapper-Specific Branches

1. Positive case: branch enabled (for example debug mode on).
2. Negative case: branch disabled (for example debug mode off).
3. Validate no unintended side effects on base behavior.

## 5. Integration Sanity

1. Verify demo page interaction path.
2. Verify wrapper import from intended public entry.
3. Verify type exports are available to consumers.

## 6. Minimum Case Set

For each wrapper, include at least:

1. One render passthrough test.
2. One primary behavior test.
3. One custom event-object test.
4. One slot test.
5. One branch regression test.
