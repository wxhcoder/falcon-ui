# FlTable

FlTable 是基于 Element Plus `ElTable` 的二次封装组件。
在保持原生表格语义的前提下，补充了 Falcon UI 的默认样式和增强能力。

## 基础用法

基础示例用于展示 `FlTable` 的默认渲染效果与列配置方式。
::: demo table/basic
:::

## 交叉高亮

开启 `cross-highlight` 后，点击数据单元格会同步高亮当前行、当前列与对应表头列。
当前单元格保持原始背景色，仅通过边框突出当前关注点。
::: demo table/cross-highlight
:::

## 多选行点击联动与单选约束

通过 `selection-row-click` 可以在点击行时联动复选状态。
开启 `selection-single` 后，多选 UI 下会强制仅保留一条选中记录。
示例内置模式开关，可实时切换单选与多选并观察行为差异。

::: demo table/selection-single
:::

## 单元格变更劫持（Proxy）

开启 `enable-cell-proxy-intercept` 后，行数据字段写入会被统一捕获，并通过
`cell-change` 事件上报。

::: demo table/cell-change
:::

## 行拖拽与列拖拽

`row-draggable` 与 `column-draggable` 默认开启。
下方示例展示拖拽开始、结束以及顺序变更事件回调。

::: demo table/drag
:::

## API 说明

### 属性

<VpApiTable source="/api-meta/fl-table.json" section="props" />

### 事件

<VpApiTable source="/api-meta/fl-table.json" section="events" />

### 插槽

<VpApiTable source="/api-meta/fl-table.json" section="slots" />

### 暴露方法

<VpApiTable source="/api-meta/fl-table.json" section="exposes" />
