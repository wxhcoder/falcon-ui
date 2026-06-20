# FlTreeSelect 树选择器

基于 Element Plus `ElTreeSelect` 的二次封装组件，提供统一 BEM 样式入口，并扩展
`isError`、`isTable` 两个业务态能力。

## 基础用法

::: demo tree-select/basic
:::

## 默认清空能力

`FlTreeSelect` 默认开启 `clearable`，可通过外部显式传参覆盖。

::: demo tree-select/clearable
:::

## 错误状态

`isError` 用于错误态展示。开启后会增加 `is-error` 状态类，并清空当前绑定值。

::: demo tree-select/is-error
:::

## 表格树选择场景

`isTable` 用于表格内编辑场景，开启后会使用更贴近表格输入的样式。

::: demo tree-select/is-table
:::

## API

### Props

<VpApiTable source="/api-meta/fl-tree-select.json" section="props" />

### Events

<VpApiTable source="/api-meta/fl-tree-select.json" section="events" />

### Slots

<VpApiTable source="/api-meta/fl-tree-select.json" section="slots" />

### Exposes

<VpApiTable source="/api-meta/fl-tree-select.json" section="exposes" />
