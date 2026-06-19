# FlTable

FlTable is a second-layer wrapper around Element Plus `ElTable`. It keeps native table semantics
while adding Falcon UI default styling and enhanced behavior.

## Basic Usage

The basic example shows the default rendering and column configuration. After clicking a data cell,
the current cell focus border remains visible to help locate the active data.

::: demo table/basic
:::

## Cross Highlight

After clicking a data cell, `FlTable` keeps the current cell focus border by default. When
`cross-highlight` is enabled, it highlights the current row, current column and matching header
column based on that focus border. The example includes a fixed-column switch for validating
highlight behavior with the first three columns fixed. The current cell keeps its original
background and uses only a border to emphasize focus.

::: demo table/cross-highlight
:::

## Row Click Selection and Single-Select Constraint

`selection-row-click` links row clicks with checkbox selection. When `selection-single` is enabled,
the multi-select UI is constrained to keep only one selected row. The example includes a mode
switch for comparing single-select and multi-select behavior.

::: demo table/selection-single
:::

## Editable Table State

When `is-edit` is enabled, the table enters editable mode. Row data field writes are captured and
reported through the `cell-change` event. This example provides an "Enable cross highlight" switch
for observing extended highlight behavior on top of the default focus border. After clicking any
data cell, arrow keys can continue moving between cells; editors wrapped by `FlTableEditor` enter
editing mode when the first input key is pressed.

::: demo table/cell-change
:::

The additional example below creates columns dynamically with `v-for` and provides row and column
inputs. It simulates 50 editable rows and 20 editable columns by default, making it easier to verify
editing state, cross highlight and keyboard cell navigation at scale. Dynamic columns bind directly
to row object fields (`row[column.key]`), which is the normal pattern for dynamic table columns;
`is-edit` should support immediate edit synchronization for this pattern.

::: demo table/cell-change-dynamic-columns
:::

## Row Drag and Column Drag

`row-draggable` and `column-draggable` are enabled by default. The example below shows callbacks
for drag start, drag end and order changes.

::: demo table/drag
:::

## API

### Props

<VpApiTable source="/api-meta/fl-table.json" section="props" />

### Events

<VpApiTable source="/api-meta/fl-table.json" section="events" />

### Slots

<VpApiTable source="/api-meta/fl-table.json" section="slots" />

### Exposes

<VpApiTable source="/api-meta/fl-table.json" section="exposes" />
