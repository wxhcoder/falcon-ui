# FlInputSearch

A business search input based on Element Plus `ElInput`, supporting keyword entry, Enter search
and dialog placeholder events.

This component focuses on fixed business styling and interaction. It does not fully passthrough
every `ElInput` capability.

## Basic Usage

Enter a unique keyword and press Enter to backfill directly, or click the search icon to open a
single-selection customer dialog.

::: demo input-search/basic
:::

## Table Business Selection Scenario

Set `is-table` when the component is used in a table cell. Each row maintains its own business ID
and display label; selecting a customer from the search dialog updates only the active row.

::: demo input-search/is-table
:::

## Multiple Fuzzy Matches

Enter `acme` and press Enter to return multiple fuzzy matches. The component then opens a
single-selection table and backfills the confirmed row.

::: demo input-search/fuzzy-multi-select
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
