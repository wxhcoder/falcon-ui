# FlTable 需求文档（Table PRD）

## 0. 开发阶段状态

- [x] 阶段 1：需求梳理与实现拆解（本次会话）
- [ ] 阶段 2：组件契约定义（`src/table.ts`）
- [ ] 阶段 3：组件实现（`src/table.vue`）
- [ ] 阶段 4：导出链路接入（components/falcon-ui/global）
- [ ] 阶段 5：单元测试与 Play 示例
- [ ] 阶段 6：质量门禁（lint/test/format/play:build）

## 1. 目标与背景

- 目标：基于 `ElTable` 二次封装 `FlTable`，提供统一默认样式，并补齐多选增强、单元格变更劫持、
  行列拖拽能力。
- 要求：在保持 Element Plus 语义兼容的前提下，实现可配置增强能力，减少业务侧重复代码。

## 2. 组件定位

- 组件名称：`FlTable`
- 技术基础：`ElTable`（Element Plus）
- 封装风格：与现有 `FlInput`/`FlSelect` 一致，`inheritAttrs: false`，attrs/slots 透传，
  只做增量能力封装。

## 3. 范围定义

### 3.1 In Scope

- 默认样式增强：
  - 默认开启边框
  - 默认开启斑马纹
  - 默认高亮当前行
  - 使用 `header-row-class-name` 设置表头背景，颜色与斑马纹变量统一
- 选择行为增强：
  - 多选开启后，点击行可联动行选中状态
  - 多选开启后，支持“仅能单选”模式（一次仅允许 1 行选中）
- 数据劫持增强：
  - 通过 Proxy 在数据写入层统一劫持单元格变更，减少大量组件级事件监听
- 拖拽增强：
  - 行拖拽默认开启，可单独关闭
  - 列拖拽默认开启，可单独关闭
  - 行拖拽通过“首列悬浮控制柄”触发
  - 列拖拽过程中不改变表头可见位置，松开后一次性完成列顺序变更

### 3.2 Out of Scope（本轮不做）

- 虚拟滚动场景下的大数据量拖拽性能优化
- 跨页选中、服务端分页一致性策略
- 单元格公式引擎的具体实现（仅提供劫持事件与扩展点）
- 树形表格、分组表头、固定列混合拖拽的完整兼容（先定义边界）

## 4. 核心需求拆解

### 4.1 默认样式

- 需求：默认带边框、斑马纹、高亮当前行。
- 逻辑：
  - 当调用方未显式传入 `border/stripe/highlight-current-row` 时，内部注入默认值 `true`。
  - 若调用方显式传值，调用方优先。
- 表头背景：
  - 合并调用方 `header-row-class-name`，注入 `fl-table__header-row`。
  - 直接复用 Element Plus 变量：
    - 斑马纹行背景使用 `--el-fill-color-lighter`（ElTable striped 内置变量）
    - 表头背景使用 `--el-table-header-bg-color`，默认映射为 `var(--el-fill-color-lighter)`

### 4.2 多选后点击行联动选中

- 触发前提：存在选择列（`type="selection"`）。
- 逻辑：
  - 监听 `row-click`。
  - 命中可选中场景时，通过 `tableRef.toggleRowSelection(row)` 联动状态。
  - 触发封装事件，透出联动前后选中集合，便于业务感知。

### 4.3 多选场景下“仅能单选”

- 新增能力：在“多选 UI”下限制为“单条选中”。
- 逻辑：
  - 属性开启后，点击某行时先 `clearSelection()`，再 `toggleRowSelection(row, true)`。
  - 勾选复选框时同样遵循单选约束，保证行为一致。

### 4.4 单元格组件变更数据劫持（Proxy）

- 目标：表格层统一拿到“哪一行/哪一列/从什么值变成了什么值”，且不依赖大量组件监听。
- 方案：
  - `FlTable` 对传入 `data` 生成代理视图（Proxy），并将代理数据传给 `ElTable` 渲染。
  - 在 `set` trap 中统一捕获字段写入，自动派发 `cell-change`。
  - 使用 `WeakMap` 做代理缓存，避免重复代理与性能抖动。
  - 支持深层路径（如 `row.a.b.c`）写入劫持。
- 约束：
  - 仅捕获“最终写回 row 对象”的变更。
  - 若业务只改外部 store 且未回写 row，不在本能力覆盖范围。

### 4.5 拖拽能力

#### 4.5.0 基础交互逻辑（当前实现）

- 统一要求：
  - 拖拽底层库必须使用 `sortablejs`，禁止自研拖拽实现。
  - 拖拽开始与结束均透出事件，排序变化通过 `*-order-change` 事件回传。
- 索引口径：
  - `oldIndex/newIndex` 均为“当前显示顺序下的索引”。
  - `columnIndex` 表示被拖拽列在“源列集合”中的索引。
- 提交时机：
  - 拖拽过程中只计算目标位置，不提交最终排序。
  - 仅在 `onEnd` 时判断是否发生变化，变化后再提交排序结果。

#### 4.5.1 行拖拽（默认开启，可关闭）

- 交互：
  - 鼠标悬浮到行时，首列显示拖拽控制柄 ICON。
  - 只能通过控制柄触发拖拽，避免误拖。
- 实现建议：
  - 使用 `Sortable` 绑定 `tbody`。
  - `handle` 指向控制柄类名（如 `.fl-table__drag-handle`）。
  - `onStart` 触发 `row-drag-start`，`onEnd` 触发 `row-drag-end`。
  - 拖拽结束后输出新顺序并触发 `row-order-change`。

#### 4.5.2 列拖拽（默认开启，可关闭）

- 交互：
  - 鼠标按下表头进入拖拽态，但不直接重排表头 DOM。
  - 拖拽过程中根据悬停位置实时计算“目标插入索引”。
  - 鼠标松开后一次性提交列顺序变更。
- 实现逻辑：
  - 使用 `Sortable` 绑定表头 `tr`，并配置 `sort: false`，禁止拖拽中 DOM 位移。
  - 指标线与目标索引计算主路径基于指针事件：监听 `dragover/pointermove/mousemove/touchmove`，按 `clientX/clientY` 命中目标列并判定左右侧。
  - 不依赖 `onMove` 作为主要命中来源，避免不同运行环境下 `onMove` 不触发导致指标线失效。
  - `onEnd` 时按优先级取 `newIndex`：
    - 指针计算结果
    - `event.newIndex`（兜底）
  - 当 `oldIndex !== newIndex` 时才更新 `columnOrder` 并触发 `column-order-change`。

## 5. 组件契约草案（拟定）

### 5.1 Props（新增）

- `selectionRowClick: boolean`，默认 `true`
- `selectionSingle: boolean`，默认 `false`
- `enableCellProxyIntercept: boolean`，默认 `true`
- `cellProxyMaxDepth: number`，默认 `4`
- `rowDraggable: boolean`，默认 `true`
- `columnDraggable: boolean`，默认 `true`
- `rowDragHandleColumnIndex: number`，默认 `0`
- `rowKeyField: string`，默认 `'id'`

### 5.2 Emits（新增）

- `selection-row-toggle`
- `selection-single-conflict`
- `cell-change`
- `row-drag-start`
- `row-drag-end`
- `row-order-change`
- `column-drag-start`
- `column-drag-end`
- `column-order-change`

### 5.3 Cell Change Payload（建议）

```ts
type CellChange = {
  rowIndex: number
  rowKey: string | number
  columnKey: string
  path: string
  prevValue: unknown
  nextValue: unknown
  trigger: 'proxy-set'
}
```

## 6. 实现逻辑与文件落点

- 目录：`packages/components/table`
- 本次落盘：
  - `Table_PRD.md`（本文件）
  - `Table_Task_Breakdown.md`（开发任务拆解）
- 下一阶段建议落地文件：
  - `src/table.ts`：props/emits/type 契约
  - `src/table.vue`：组件封装与交互逻辑
  - `src/proxy-data.ts`：行数据代理与路径追踪
  - `__test__/table.test.ts`：行为与回归测试
  - `index.ts`：组件导出

## 7. 风险与待确认项

- 行拖拽是否直接修改 `data` 原数组，还是只通过事件回传新顺序由外部回写。
- 列拖拽对“固定列 + 分组表头”的兼容策略是否纳入首版。
- `selectionSingle` 开启时，全选行为是禁用、降级还是保留“取首行”策略。
- Proxy 仅能捕获写回 row 的变更，跨对象引用写入策略需明确。

## 8. 验收标准（首版）

- 默认样式符合要求且可被调用方覆盖。
- 多选 + 行点击联动生效，`selectionSingle=true` 时严格单选。
- 单元格写回 row 的变更可被统一上报，且不需要大量组件级监听。
- 行拖拽仅控制柄可拖，排序结果可回传。
- 列拖拽过程中表头不发生实时位移，松开后可正确回传并应用列顺序。

## 9. 列拖拽指标线交互（当前实现）

- 拖拽库固定使用 `sortablejs`，列拖拽保持 `sort: false`，拖拽中不改变表头 DOM 顺序。
- 拖拽移动时实时计算“目标列 + 目标侧”：
  - 目标列：指针命中的表头单元格（`th.el-table__cell`）。
  - 目标侧：按指针相对该单元格中心点判定，左侧为 `left`，右侧为 `right`。
- 指标线计算来源：
  - 主路径：`dragover/pointermove/mousemove/touchmove` 实时计算并更新目标列。
  - `onMove` 不作为主处理链路，避免在部分浏览器/场景不触发导致指标线丢失。
- 视觉反馈作用范围为整列：目标列的表头单元格与所有 body 单元格同步高亮。
- 视觉样式规则：
  - `left`：目标列增加 `fl-table__column-drag-indicator-left` 高亮样式。
  - `right`：目标列增加 `fl-table__column-drag-indicator-right` 高亮样式。
  - 目标线宽度为 `2px`。
  - 高亮颜色使用 `var(--el-color-primary)`。
- 指针离开表头命中区域时立即清空高亮，不保留上一次命中结果。
- 仅在 `onEnd` 时提交排序结果；排序索引仍采用显示索引口径，并通过 `column-order-change` 回传。

### 9.1 目标实现逻辑（本次确认）

- 拖拽引擎：
  - 固定使用 `sortablejs`，不自研拖拽实现。
  - 列拖拽启用 `sort: false`，拖拽过程中不改变表头可见顺序。
- 命中计算：
  - 在拖拽过程中通过 `dragover/pointermove/mousemove/touchmove` 获取指针坐标。
  - 先命中目标列，再按是否越过目标列中心点判定 `left/right`。
- 指标线渲染：
  - 命中后给目标列 `th` + 对应列全部 `td` 同步加类名。
  - 左移命中使用 `fl-table__column-drag-indicator-left`，右移命中使用
    `fl-table__column-drag-indicator-right`。
  - 指标线视觉宽度统一为 `2px`。
- 提交时机：
  - 拖拽中只做命中态与视觉反馈，不提交列顺序。
  - 仅在 `onEnd` 计算并提交 `column-order-change`，再清理指标线状态。

### 9.2 列宽拖拽与列排序解耦（本次新增）

- 问题背景：列排序拖拽命中整列 `th` 时，会与 Element Plus 的列宽拖拽（表头边缘手势）冲突。
- 热区判定：在表头 `pointerdown/mousedown/touchstart` 捕获阶段，按单元格左右边缘热区判定列宽手势。
  - 热区宽度常量：`8px`（`COLUMN_RESIZE_HOTZONE_PX`）。
  - 命中条件：`clientX` 距离 `th` 左/右边界小于等于热区宽度。
- 手势隔离：
  - 命中列宽热区后，标记 `isColumnResizeGesture=true`。
  - 临时禁用列排序 `Sortable`（`option('disabled', true)`）。
  - 清空当前列排序指标线，避免视觉误导。
  - 列排序 `onStart/onEnd` 在 `isColumnResizeGesture=true` 时直接短路，不触发排序事件计算。
- 手势恢复：在 `pointerup/mouseup/touchend/touchcancel/dragend` 统一清理列宽手势状态并恢复列排序能力。
- 生命周期清理：组件销毁或重建列拖拽实例时，同步解绑热区监听与释放监听，避免残留状态影响后续交互。
- 验证要求：
  - 命中边缘拖拽仅触发列宽调整，不触发列排序、不显示列排序指标线。
  - 边缘手势结束后，列排序拖拽可立即恢复并正常回传 `column-order-change`。
