# FlInputSearch 业务搜索输入框

基于 Element Plus `ElInput` 的业务搜索输入组件，支持“输入关键词回车检索 + 弹窗占位事件”。

本组件聚焦固定业务样式与交互，不做 `ElInput` 全量透传。

## 基础用法

::: demo input-search/basic
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
