# FlSelect

A second-layer wrapper around Element Plus `ElSelect` that provides a unified BEM styling entry
and adds `isError` and `isTable` business states.

## Basic Usage

::: demo select/basic
:::

## Default Clearable Behavior

`FlSelect` enables `clearable` by default and can be overridden by passing props externally.

::: demo select/clearable
:::

## Error State

`isError` is used for error-state display. Enabling it adds the `is-error` state class.

::: demo select/is-error
:::

## Table Select Scenario

`isTable` is used for editing inside tables and switches to styles closer to table inputs.

::: demo select/is-table
:::

## API

### Props

<VpApiTable source="/api-meta/fl-select.json" section="props" />

### Events

<VpApiTable source="/api-meta/fl-select.json" section="events" />

### Slots

<VpApiTable source="/api-meta/fl-select.json" section="slots" />

### Exposes

<VpApiTable source="/api-meta/fl-select.json" section="exposes" />
