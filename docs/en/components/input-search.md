# FlInputSearch

A business search input based on Element Plus `ElInput`, supporting keyword entry, Enter search
and dialog placeholder events.

This component focuses on fixed business styling and interaction. It does not fully passthrough
every `ElInput` capability.

## Basic Usage

::: demo input-search/basic
:::

## Enter Search and useDialog Placeholder

When the Enter result is unique, `modelValue` and `label` are backfilled automatically. When the
result is not unique, or when the suffix search icon is clicked, the component emits `openDialog`.
In business code, render a table through `useDialog.open`, confirm the selected rows, then
backfill the input value.

::: demo input-search/enter-multi-placeholder
:::

## API

### Props

<VpApiTable source="/api-meta/fl-input-search.json" section="props" />

### Events

<VpApiTable source="/api-meta/fl-input-search.json" section="events" />

### Slots

<VpApiTable source="/api-meta/fl-input-search.json" section="slots" />

### Exposes

<VpApiTable source="/api-meta/fl-input-search.json" section="exposes" />
