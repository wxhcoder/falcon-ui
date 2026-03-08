# FlTable 实施任务拆解（Task Breakdown）

## 1. 阶段划分

### 阶段 A：契约定义

- 新建 `src/table.ts`
- 定义 `flTableProps` 与 `flTableEmits`
- 明确 `CellChange`、拖拽事件 payload
- 产出：可被测试与组件实现直接消费的类型契约

### 阶段 B：基础封装与默认样式

- 新建 `src/table.vue`
- 基于 `ElTable` 做 attrs/slots 透传
- 注入默认值：`border=true`、`stripe=true`、`highlightCurrentRow=true`
- 合并 `header-row-class-name`，保证 `fl-table__header-row` 始终生效
- 产出：无业务侵入的样式增强表格

### 阶段 C：多选增强

- 接管 `row-click` 与 `select/select-all` 相关事件
- 实现 `selectionRowClick`
- 实现 `selectionSingle`
- 处理 `selectionSingle + select-all` 的降级策略（建议禁止全选并发出提示事件）
- 产出：多选行为一致且可控

### 阶段 D：单元格变更数据劫持（Proxy）

- 新增 `src/proxy-data.ts`
- 对表格数据建立 Proxy 代理视图，并通过 WeakMap 做缓存
- 在 `set` trap 中统一组装 `cell-change` payload 并触发 `cell-change`
- 支持深层路径追踪（`path`）和行列定位（`rowIndex/rowKey/columnKey`）
- 产出：无需大量组件级监听的统一变更入口

### 阶段 E：拖拽能力

- 行拖拽：
  - 支持 `rowDraggable`
  - 悬浮首列显示控制柄
  - 仅控制柄可拖
  - 发出 `row-order-change`
- 列拖拽：
  - 支持 `columnDraggable`
  - 按下表头时设置“当前列拖拽态”并给整列加虚线边框
  - 松开时立即清理态
  - 发出 `column-order-change`
- 产出：行列拖拽可独立开关且交互可见

### 阶段 F：导出链路与验证

- 新建并接入：
  - `packages/components/table/index.ts`
  - `packages/components/index.ts`
  - `packages/components/package.json` exports
  - `packages/falcon-ui/index.ts`
  - `packages/falcon-ui/global.d.ts`
- 新增测试：`packages/components/table/__test__/table.test.ts`
- 更新 play 示例：`play/src/views/components-view.vue`
- 质量门禁：`pnpm lint`、`pnpm test`、`pnpm format:check`、`pnpm play:build`

## 2. 关键实现决策

- 优先“兼容 ElTable”，不重写其排序/选择机制。
- 劫持策略采用“Proxy 数据层劫持”，不依赖组件事件冒泡或大量桥接监听。
- 行拖拽和列拖拽分离开关，避免耦合导致的误交互。
- 默认开启拖拽，但必须保留可关闭能力，便于低风险灰度。

## 3. 测试清单（最小集合）

- 默认样式注入与调用方覆盖优先级。
- 多选下点击行切换选中。
- `selectionSingle=true` 时只有一行选中。
- 代理数据写入时 `cell-change` payload 结构完整且路径定位正确。
- 行拖拽 handle 可见性与 reorder 事件。
- 列拖拽按下/松开虚线高亮状态切换。

## 4. 风险处理建议

- `data` 外部受控时，不在组件内部直接改源数组；通过事件回传顺序。
- 固定列/分组表头默认先限制不支持，并在文档显式说明。
- Proxy 仅捕获写回 row 的变更；若业务绕开 row 改外部 store，需要外部同步策略。
