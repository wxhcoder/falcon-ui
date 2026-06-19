# FlInputNumber

A second-layer wrapper around Element Plus `ElInput` that provides numeric constraints,
precision control and formatted display.

In editable table scenarios, traditional numeric inputs often treat keyboard `↑/↓` as step
operations. When users only want to move between cells, the current number can be accidentally
increased or decreased. One core goal of `FlInputNumber` is to decouple cell navigation from
numeric stepping, preventing accidental changes and keeping data entry stable.

## Basic Usage

::: demo input-number/basic
:::

## Precision Mode

`precisionMode` supports:

- `ROUND`: round when precision is exceeded
- `FIXED`: truncate directly when precision is exceeded
- `STRICT`: trigger error logic and clear the value when precision is exceeded

::: demo input-number/precision-mode
:::

## Formatted Display

When `isFormat` is enabled, the displayed value is formatted while the bound value keeps the raw
numeric type (`number | null`).

- Without `formatter`: uses default thousands formatting
- With `formatter` and optional `parser`: uses custom formatting rules first

::: demo input-number/format
:::

## API

### Props

<VpApiTable source="/api-meta/fl-input-number.json" section="props" />

### Events

<VpApiTable source="/api-meta/fl-input-number.json" section="events" />

### Slots

<VpApiTable source="/api-meta/fl-input-number.json" section="slots" />

### Exposes

<VpApiTable source="/api-meta/fl-input-number.json" section="exposes" />
