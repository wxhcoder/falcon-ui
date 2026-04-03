# FlTable

FlTable 是基于 Element Plus `ElTable` 的二次封装组件。
在保持原生表格语义的前提下，补充了 Falcon UI 的默认样式和增强能力。

## 基础用法

基础示例用于展示 `FlTable` 的默认渲染效果与列配置方式。
点击数据单元格后，默认会保留当前单元格的焦点边框，便于快速定位当前关注数据。
::: demo table/basic
:::

## 交叉高亮

点击数据单元格后，`FlTable` 默认会保留当前单元格的焦点边框。
开启 `cross-highlight` 后，会在该焦点边框基础上同步高亮当前行、当前列与对应表头列。示例内置固定列开关，可切换固定前 3 列并验证 fixed 场景下的高亮表现。
当前单元格保持原始背景色，仅通过边框突出当前关注点。
::: demo table/cross-highlight
:::

## 多选行点击联动与单选约束

通过 `selection-row-click` 可以在点击行时联动复选状态。
开启 `selection-single` 后，多选 UI 下会强制仅保留一条选中记录。
示例内置模式开关，可实时切换单选与多选并观察行为差异。

::: demo table/selection-single
:::

## 表格编辑状态

开启 `is-edit` 后，表格进入编辑状态，行数据字段写入会被统一捕获，并通过
`cell-change` 事件上报。当前示例提供“开启交叉高亮”开关，便于观察当前编辑单元格在默认焦点边框基础上的扩展高亮效果。
点击任意数据单元格后，可继续使用方向键切换单元格；已包裹 `FlTableEditor` 的编辑器会在输入首键时进入编辑态。

::: demo table/cell-change
:::

下方附加示例使用 `v-for` 动态创建列，并提供“行数 / 列数”输入，默认模拟 50 行与 20 列可编辑数据，便于验证大规模动态列场景下的编辑状态、交叉高亮与键盘切格行为。
示例中的动态列直接绑定到行对象字段（`row[column.key]`），这是动态列场景下的常规写法，`is-edit` 应对该模式提供即时编辑同步。

::: demo table/cell-change-dynamic-columns
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
