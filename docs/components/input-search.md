# FlInputSearch 业务搜索输入框

基于 Element Plus `ElInput` 的业务搜索输入组件，支持“输入关键词回车检索 + 弹窗占位事件”。

本组件聚焦固定业务样式与交互，不做 `ElInput` 全量透传。

## 基础用法

输入唯一关键词后按回车可直接回填；点击搜索图标会打开客户单选弹窗。

::: demo input-search/basic
:::

## 表格业务选择场景

在表格单元格中使用时，设置 `is-table`。每一行分别维护业务 ID 与显示名称；点击搜索图标选择客户时，只更新当前业务行。

::: demo input-search/is-table
:::

## 模糊匹配多条结果

输入 `acme` 后按回车会返回多条模糊匹配结果，并自动打开单选表格完成回填。

::: demo input-search/fuzzy-multi-select
:::

## 回车检索与 useDialog 占位

当回车结果唯一时，自动回填 `modelValue` 与 `label`。  
当结果不唯一，或点击后缀搜索图标时，触发 `openDialog` 事件。  
推荐在业务侧通过 `useDialog.open` 渲染表格，确认后返回勾选行并回填输入框值。

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
