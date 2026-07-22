# FlTable 键盘焦点性能优化方案

## 目标

在不改变 FlTable 公共 API、Element Plus 透传语义和现有交互行为的前提下，降低大表格通过
方向键移动焦点时的主线程开销。

基线场景为 50 行 × 50 个可见数据列，包含 plain/editor 与 cross on/off 四种组合。基线
证据、原始 Trace 和截图见：

- `docs/performance/fl-table-keyboard-focus-baseline.md`
- `docs/performance/artifacts/`

## 当前状态（2026-07-21）

- P0-A、P0-B 已实施并完成浏览器复测。
- P1、P2、P3 仍然只有本文件中的方案说明，没有对应代码改动。
- 优化前后数据、残余延迟和下一步判断见
  [`PERFORMANCE_OPTIMIZATION_RESULT.md`](./PERFORMANCE_OPTIMIZATION_RESULT.md)。

## 迭代边界

### 当前迭代允许实施

仅实施下列两个 P0：

1. 焦点视觉从 ElTable 全表 `cellClassName` 响应式重算中解耦，改为旧/新焦点差量更新。
2. editor registry 改为非响应式、按所属单元格索引的查询结构。

### 当前迭代禁止实施

1. 不实施 P1 条件滚动或滚动帧合并。
2. 不实施 P2 行列位置缓存或 class 合并分配优化。
3. 不实施 P3 行列虚拟化。
4. 不增加或修改公共 props、emits、slots、expose 和导出类型。
5. 不改变方向键、编辑器弹层、失焦、固定列、拖拽列或交叉高亮语义。

## 基线事实

1. 每次有效方向键固定触发 2,500 次表体 class 回调。
2. 开启交叉高亮时，每次按键额外触发 50 次表头 class 回调。
3. editor 模式包含 2,500 个 endpoint；方向键在 panel 检查和 blur 路径中重复扫描 registry。
4. registry 注册通过数组展开逐次复制，2,500 次注册累计复制 3,126,250 个元素引用。
5. Trace 栈命中 `resolveCrossClass`、`findEditorsInCells`、`blurActiveEditor`、
   `scrollIntoView` 和 editor 组件更新路径。

## P0-A：焦点 class 差量更新

### 要解决的问题

`activeCell` 被 ElTable 的 body/header class 回调读取。焦点改变后，ElTable 会重新计算全部
表体单元格和表头，即使只有旧焦点、新焦点及交叉行列需要改变。

### 方案

1. 保留 `activeCell` 作为内部语义状态，但让 ElTable 的 class 回调不再读取它。
2. 用户传入的 `cellClassName`、`headerCellClassName` 和拖拽 handle class 继续通过原回调计算。
3. 建立内部焦点 class 同步函数，按逻辑行列定位普通表体与固定列克隆的真实 cell。
4. cross off 时，只移除旧活动 cell 的 `cross-active`，并添加到新活动 cell。
5. cross on 时，只清理旧焦点涉及的活动行、活动列、控制列和表头 class，再添加新焦点对应
   的 class；工作量从 O(行×列) 降为 O(行+列)。
6. 数据、排序、过滤、列重排、固定列布局或 crossHighlight 改变后，在 DOM 更新完成时重新
   同步一次当前焦点视觉，避免保存失效 DOM。
7. 组件卸载或焦点清除时移除 FlTable 自有焦点 class，不触碰用户 class。

### 验收

1. plain/cross-off 方向键不再触发 2,500 次用户 `cellClassName` 回调。
2. cross-on 不再触发全表 body/header 用户 class 回调。
3. 点击、方向键、边界、固定列克隆、动态切换 crossHighlight 的视觉语义保持不变。
4. 拖拽 handle class、用户 class 和 Element Plus 原 class 不被删除或覆盖。

## P0-B：editor registry 单元格索引

### 要解决的问题

当前 registry 是响应式数组。注册/注销会复制数组；查当前 cell 的 editor 会过滤全部 endpoint
并逐个执行 DOM `contains`。方向键的 panel 检查和 blur 会重复查找。

### 方案

1. registry 改用普通 Map/Set，不进入 Vue 响应式系统。
2. 保留 `id → endpoint` 的注册表，注册和注销不再复制全数组。
3. 按 endpoint 当前根节点所属的 `td.el-table__cell` 建立索引；固定列克隆允许同一逻辑 cell
   存在少量候选。
4. 查活动 editor 时先取得活动 cell 的真实 DOM，再只读取该 cell 对应的候选；仅对该小集合
   执行现有 fixed clone/priority 排序。
5. endpoint 根节点尚未挂载、Teleport 或 DOM 归属变化时，允许安全刷新索引；不得因此改变
   panel、close、blur 和 focus 语义。
6. `getEditors()` 继续返回全部已注册 endpoint，保持内部契约兼容。

### 验收

1. 2,500 个 editor 注册不再产生逐次数组复制。
2. 每次活动 editor 查询不再过滤全部 2,500 个 endpoint。
3. editor panel 打开时方向键仍不移动焦点。
4. 普通、固定列克隆和 priority 候选仍选择原有 editor。
5. editor close/blur、Enter 编辑、Escape/Tab 等现有键盘行为保持不变。

## P1：条件滚动与同帧合并（仅记录，本轮不实施）

1. 比较目标 cell 与表体横纵可视区域；完全可见时不调用滚动。
2. 越界时只调整必要的 table body `scrollTop`/`scrollLeft`。
3. 同一 animation frame 内先读取几何信息，再写焦点 class 和滚动位置。
4. 保持固定列、表头和外层页面滚动语义。

启动条件：P0 复测后，`scrollIntoView`、Layout 或 HitTest 仍是显著残余热点。

## P2：行列位置索引与分配优化（仅记录，本轮不实施）

1. 可选建立 `rowKey → rowIndex` 与 `columnKey → visible column` 缓存。
2. 数据、排序、过滤和列结构变化时重建，禁止使用过期索引。
3. 仅当新 Trace 仍显示 `resolveActiveCellPosition`、`resolveVisibleColumns` 或 `mergeClass`
   为主要热点时实施。

## P3：行列虚拟化（仅记录，本轮不实施）

1. 仅渲染可视行列及少量缓冲区，降低超大规模 DOM/editor 数量。
2. 实施前必须单独定义焦点跨越未渲染区域、editor 保活、固定列同步、可访问性、复制和打印
   契约。
3. 50×50 不以虚拟化掩盖焦点链路的全量更新问题；仅面向更大数据规模立项。

## 回归验证

### 功能回归

1. 点击建立焦点，方向键每次只移动一格，边界不越界。
2. 目标 cell 不自动进入编辑态。
3. crossHighlight on/off、运行时切换、控制列、固定列克隆保持现有视觉。
4. editor panel、close/blur、Enter/Escape/Tab 行为保持不变。
5. row draggable、selection、排序、列变化、用户 class callback 和 slot/attrs 透传保持正常。

### 自动化与质量门禁

1. 增加 P0 差量 class 和 registry 索引回归测试。
2. 执行组件定向测试与 `pnpm --dir play typecheck`。
3. 执行 `pnpm lint`、`pnpm test`、`pnpm format:check`、`pnpm play:build`。

### 浏览器性能复测

使用与基线相同的 1440×900、1× CPU、无网络限速配置，重新录制：

1. plain + cross off
2. plain + cross on
3. editor + cross off
4. editor + cross on

每组预热后从 R1C1 执行 12 次 ArrowRight 和 12 次 ArrowDown。保存新的 Trace、页面指标、
截图和主线程分析，并与基线对比：

1. body/header class 回调次数。
2. p50、p95、最大值和 >16.7 ms/>50 ms 次数。
3. Long Task、scripting/rendering/painting、样式/布局/Layerize。
4. `resolveCrossClass`、editor registry、Vue 更新和滚动残余调用栈。

## 完成条件

1. 代码只实施 P0-A/P0-B，P1～P3 无代码改动。
2. 公共契约和既有功能回归通过。
3. 四组修复后 Trace 可重新导入浏览器分析工具。
4. 报告明确列出改善、未改善和新增热点，并据此决定是否启动 P1。
