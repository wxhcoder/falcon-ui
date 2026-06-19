# FlDatePicker

A second-layer wrapper around Element Plus `ElDatePicker` with passthrough support and
Falcon UI state conventions.

## Feature Status

| Feature                           | Status      | Description                                                            |
| --------------------------------- | ----------- | ---------------------------------------------------------------------- |
| `isError` error-state class       | Implemented | Adds `is-error` to the component root.                                 |
| `isError` clear behavior          | Implemented | Emits `update:modelValue(null)` when switching from `false` to `true`. |
| `isTable` table-state class       | Implemented | Adds `is-table` to the component root.                                 |
| Consistent clearing for all modes | Implemented | Clears `date`, `datetime`, `range` and other modes to `null`.          |
| E2E automation cases              | Pending     | Only unit tests and documentation examples are currently complete.     |

## Basic Usage

::: demo date-picker/basic
:::

## Date Range

::: demo date-picker/range
:::

## Error State

`isError` is used for error-state display. When the value changes from `false` to `true`,
the component receives error styling and synchronizes the current value to `null` through
`update:modelValue`.

::: demo date-picker/is-error
:::

## Table Scenario

`isTable` is used for date editing inside table cells and can be combined with `isError`.

::: demo date-picker/is-table
:::

## Supported Modes

The following `ElDatePicker` modes are covered:

- `date`
- `dates`
- `datetime`
- `week`
- `month`
- `year`
- `daterange`
- `datetimerange`
- `monthrange`
- `yearrange`

## API

### Props

<VpApiTable source="/api-meta/fl-date-picker.json" section="props" />

### Events

<VpApiTable source="/api-meta/fl-date-picker.json" section="events" />

### Slots

<VpApiTable source="/api-meta/fl-date-picker.json" section="slots" />

### Exposes

<VpApiTable source="/api-meta/fl-date-picker.json" section="exposes" />
