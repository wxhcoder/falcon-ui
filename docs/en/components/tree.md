# FlTree

FlTree is a Falcon UI tree component for hierarchical data, covering expansion, selection,
checking, async loading, drag, keyboard navigation and scroll positioning.

## Basic Usage

Pass tree data through `data`. Every node must provide a stable unique `key`. When business fields
do not use the default `label` and `children` names, configure field mapping through `props`.

::: demo tree/basic
:::

## Default Expansion and Controlled Expansion

Use `defaultExpandedKeys` to set initially expanded nodes. Use `expandedKeys` with
`update:expandedKeys` to maintain expansion state in fully controlled mode.

::: demo tree/expand
:::

## Accordion Expansion

When `accordion` is enabled, only one sibling node under the same parent can stay expanded.

::: demo tree/accordion
:::

## Default Selection, Single/Multi Selection and Right Click

Use `defaultSelectedKeys` for initial selection, or manage selection with controlled
`selectedKeys`. Enabling `multiple` supports multi-selection. Right-clicking a node emits the
independent `right-click` event.

::: demo tree/selection
:::

## Checkboxes and Checked Conduct

Enable `checkable` to show checkboxes. The default mode conducts checked state between parents and
children. When `checkStrictly` is enabled, parent and child checked states are independent.

::: demo tree/checkable
:::

## Disabled, Unselectable and Checkbox Boundaries

Node interaction state is declared through key-based configuration. `disabledKeys` disables the
whole item, `unselectableKeys` only blocks selection, and `disabledCheckboxKeys` plus
`hiddenCheckboxKeys` control checkbox disabling and hiding separately.

::: demo tree/disabled
:::

## Lines, Custom Content and Toggle Icons

`showLine` displays connector lines and can use `showLeafIcon` to control leaf icons. The default
slot only takes over node content; toggles, checkboxes and indentation remain controlled internally.

::: demo tree/line-content
:::

## Semantic Styling

Use `classNames` and `styles` to inject stable styling hooks for the root container and node items.
Use `nodeClassName` to inject a class per node wrapper from `{ node, data }`, keeping style rules in
the view layer.

::: demo tree/semantic-style
:::

## Async Loading

After passing `loadData`, expanding an unloaded non-leaf node triggers async loading. `loadedKeys`
can control the list of loaded nodes, and the `load` event returns the latest loaded result.

::: demo tree/async
:::

## Node Drag

Enable `draggable` to support internal node drag sorting. Use `allowDrag` and `allowDrop` to limit
drag sources and drop positions, and listen to drag events for state updates.

::: demo tree/drag
:::

## Keyboard Navigation and Accessibility

The tree root provides a single Tab entry and marks the active node with ARIA. After focus, use
arrow keys to browse, expand or collapse nodes, and use Enter or Space to select or check.

::: demo tree/keyboard-a11y
:::

## Double Click, Filter Highlight and Scroll Positioning

Double-clicking the node content area emits `dblclick`; expandable nodes reuse the expansion flow.
`filterTreeNode` is responsible only for match highlighting, and `scrollTo` positions currently
rendered and visible nodes.

::: demo tree/dblclick-scroll
:::

## API

### Props

<VpApiTable source="/api-meta/fl-tree.json" section="props" />

### Events

<VpApiTable source="/api-meta/fl-tree.json" section="events" />

### Slots

<VpApiTable source="/api-meta/fl-tree.json" section="slots" />

### Exposes

<VpApiTable source="/api-meta/fl-tree.json" section="exposes" />
