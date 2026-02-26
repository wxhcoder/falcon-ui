# FlInput 输入框

基于 Element Plus `ElInput` 的二次封装组件，支持透传和调试事件扩展。

## 基础用法

::: demo input/basic
:::

## 使用图标

::: demo input/icon
:::

## 清空按钮

::: demo input/clearable
:::

## 输入框尺寸

::: demo input/size
:::

## 错误状态

`isError` 用于错误态展示。值从 `false` 切换为 `true` 时，会为输入框添加错误样式，
并通过 `update:modelValue` 将当前值同步清空为空字符串。

::: demo input/is-error
:::

## 表格输入场景

`isTable` 用于表格单元格内输入场景。开启后会使用更贴合表格的输入样式（无边框、透明背景、紧凑内边距）。
`isTable` 与 `isError` 可以组合使用，在表格场景中保留错误占位提示颜色。

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
