# FlTree

FlTree 是 Falcon UI 的自研树组件，用于展示层级数据并承载展开、选择、勾选、异步加载、拖拽、键盘导航和滚动定位等交互。

## 基础用法

通过 `data` 传入树形数据，节点必须提供稳定唯一的 `key`。
当业务字段不是默认的 `label`、`children` 时，可以通过 `props` 配置字段映射。

::: demo tree/basic
:::

## 默认展开与受控展开

使用 `defaultExpandedKeys` 可以设置初始化展开节点；使用 `expandedKeys` 配合
`update:expandedKeys` 可以完全受控地维护展开状态。

::: demo tree/expand
:::

## 手风琴展开

开启 `accordion` 后，同一父节点下同时只保留一个同级节点展开。

::: demo tree/accordion
:::

## 默认选中、单选/多选与右键事件

通过 `defaultSelectedKeys` 设置初始选中项，也可以使用 `selectedKeys` 受控管理。
开启 `multiple` 后支持多选，右键节点会触发独立的 `right-click` 事件。

::: demo tree/selection
:::

## 复选框与勾选联动

开启 `checkable` 后展示复选框。默认模式会进行父子联动勾选，
开启 `checkStrictly` 后父子节点勾选状态相互独立。

::: demo tree/checkable
:::

## 禁用、不可选与复选框边界

节点交互状态通过 key-based 配置声明。`disabledKeys` 禁用整项，
`unselectableKeys` 仅阻止选中，`disabledCheckboxKeys` 与 `hiddenCheckboxKeys` 分别控制复选框禁用和隐藏。

::: demo tree/disabled
:::

## 连线、自定义内容与切换图标

`showLine` 用于显示节点连线，并可通过 `showLeafIcon` 控制叶子节点图标。
默认插槽只接管节点内容区，展开器、复选框和缩进仍由组件内部控制。

::: demo tree/line-content
:::

## 语义化样式

通过 `classNames` 和 `styles` 可以为树根容器与节点条目注入样式。
函数形式会接收当前公开 props 快照，适合按配置动态调整样式。

::: demo tree/semantic-style
:::

## 异步加载

传入 `loadData` 后，展开未加载的非叶子节点时会触发异步加载。
`loadedKeys` 可用于受控记录已加载节点，`load` 事件会回传最新加载结果。

::: demo tree/async
:::

## 节点拖拽

开启 `draggable` 后支持单树内部拖拽排序。
可以通过 `allowDrag` 与 `allowDrop` 限制拖拽源和投放位置，并监听拖拽事件。

::: demo tree/drag
:::

## 键盘导航与无障碍

树根容器提供单一 Tab 入口，并通过 ARIA 标记当前活动节点。
聚焦后可使用方向键浏览和展开收起，使用 Enter 或 Space 触发选择或勾选。

::: demo tree/keyboard-a11y
:::

## 双击展开、筛选高亮与滚动定位

双击节点内容区会触发 `dblclick`，可展开节点会复用展开链路。
`filterTreeNode` 只负责命中高亮，`scrollTo` 用于定位当前已渲染且可见的节点。

::: demo tree/dblclick-scroll
:::

## API 说明

### 属性

<VpApiTable source="/api-meta/fl-tree.json" section="props" />

### 事件

<VpApiTable source="/api-meta/fl-tree.json" section="events" />

### 插槽

<VpApiTable source="/api-meta/fl-tree.json" section="slots" />

### 暴露方法

<VpApiTable source="/api-meta/fl-tree.json" section="exposes" />
