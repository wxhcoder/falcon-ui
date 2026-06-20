# FlInput

A second-layer wrapper around Element Plus `ElInput` with passthrough support and debug event
extensions.

## Basic Usage

::: demo input/basic
:::

## Icons

::: demo input/icon
:::

## Clear Button

::: demo input/clearable
:::

## Input Sizes

::: demo input/size
:::

## Error State

`isError` is used for error-state display. When the value changes from `false` to `true`,
the input receives error styling and synchronizes the current value to an empty string through
`update:modelValue`.

::: demo input/is-error
:::

## Table Input Scenario

`isTable` is used for input inside table cells. It switches to styles better suited to tables,
including no border, transparent background and compact padding. `isTable` can be combined with
`isError` to preserve error placeholder color in table scenarios.

::: demo input/is-table
:::

## API

### Props

<VpApiTable source="/api-meta/fl-input.json" section="props" />

### Events

<VpApiTable source="/api-meta/fl-input.json" section="events" />

### Slots

<VpApiTable source="/api-meta/fl-input.json" section="slots" />

### Exposes

<VpApiTable source="/api-meta/fl-input.json" section="exposes" />
