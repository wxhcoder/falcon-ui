# FlTable 键盘切换单元格焦点 PRD

## 0. 文档目标

- 目标：为 `FlTable` 增加类似 Excel 的单元格键盘焦点能力。
- 范围：本稿只定义需求、交互逻辑、注册机制与开发边界，不直接改动现有组件源码。
- 约束：
  - 不改 `FlInput`、`FlSelect`、`FlInputNumber`、`FlDatePicker` 的现有源码。
  - 不依赖解析 VNode。
  - 不让 `FlTable` 通过全局 DOM 猜测单元格内编辑器类型。

## 1. 需求背景

- 当前 `FlTable` 已支持：
  - 点击数据单元格后建立 `activeCell`
  - 默认显示当前单元格焦点边框
  - 开启 `crossHighlight` 后显示行列交叉高亮
- 现阶段缺口：
  - 焦点单元格不能通过键盘方向键切换
  - 单元格内部组件获得焦点后，表格缺少统一的失焦与切格规则
  - 键盘输入无法像 Excel 一样把当前焦点单元格切入编辑态

## 2. 目标体验

- 点击任意数据单元格后，建立表格级单元格焦点。
- 按方向键时，焦点在数据单元格之间移动。
- 如果当前单元格内部组件已经获得焦点，方向键切换前先让该组件失焦。
- 切换到下一个单元格后，仅保留单元格边框焦点，不自动让内部组件获得焦点。
- 只有再次点击，或用户继续键盘输入时，目标单元格内部组件才进入编辑态。
- 当 `crossHighlight=true` 时，方向键移动时交叉高亮同步跟随。

## 3. 范围定义

### 3.1 In Scope

- 基于现有 `activeCell` 的单元格键盘导航。
- `ArrowUp`、`ArrowDown`、`ArrowLeft`、`ArrowRight` 四个方向键切格。
- 当前单元格内部编辑器的失焦处理。
- 首键接管：在已有单元格焦点前提下，输入键可让当前单元格进入编辑态。
- 目标单元格自动滚动到可见区域。
- 面向表格编辑场景的显式编辑器注册机制。

### 3.2 Out of Scope

- 不支持通过 `Tab` 建立整张表的网格导航模式。
- 不保证合并单元格、树形表格、虚拟滚动表格、复杂分组表头的完整一致性。
- 不重写 `FlSelect`、`FlDatePicker` 等组件内部键盘交互。
- 不改造现有编辑器组件源码，不要求其内建表格感知逻辑。
- 不支持一个单元格内多个主编辑器同时参与首版焦点接管。

## 4. 核心交互规则

### 4.1 焦点建立

- 前提：用户先点击一个表体数据单元格，建立 `activeCell`。
- `activeCell` 延续现有模型：

```ts
type ActiveCell = {
  rowKey: string | number
  columnKey: string
}
```

- `rowKey` 来源：`row[rowKeyField]`
- `columnKey` 来源：`FlTable` 内部按源列顺序生成的稳定标识 `column-${sourceIndex}`

### 4.2 方向键切格

- 仅在 `activeCell` 已存在时生效。
- 支持：
  - `ArrowUp`
  - `ArrowDown`
  - `ArrowLeft`
  - `ArrowRight`
- 边界规则：
  - 到首行/末行/首列/末列时停住
  - 不循环
  - 不换行跳转
- 水平移动规则：
  - 只在当前可见的数据列之间移动
  - 跳过 `selection`、`index`、`expand` 等控制列
- 垂直移动规则：
  - 保持当前 `columnKey` 不变
  - 在数据行之间移动

### 4.3 编辑器失焦

- 如果当前单元格内部编辑器已经获得焦点：
  - 方向键处理前先执行该编辑器的 `blur`
  - 若该编辑器存在已展开面板，可选执行 `close`
- 失焦完成后再更新 `activeCell`

### 4.4 目标单元格焦点态

- 切换到目标单元格后：
  - 仅建立单元格边框焦点
  - 不自动聚焦内部编辑器
  - 不自动打开下拉、日期面板等组件交互层

### 4.5 首键接管

- 前提：
  - 当前存在 `activeCell`
  - 当前不在编辑态
  - 用户按下可输入键
- 可输入键范围：
  - 普通可打印字符
  - 数字键
  - 空格
  - `Backspace`
  - `Delete`
  - `Enter`
  - `F2`
- 进入编辑后：
  - 当前单元格内部编辑器获得焦点
  - 首键交给编辑器处理
- 方向键不属于首键接管范围；方向键优先用于切格

### 4.6 自动滚动

- 当目标单元格超出当前可视区域时：
  - 自动滚动目标单元格进入可视区
- 建议策略：
  - `scrollIntoView({ block: 'nearest', inline: 'nearest' })`
  - 或等价的最近可见滚动逻辑

### 4.7 清空规则

- 点击表格外区域时：
  - 清空 `activeCell`
  - 清空编辑态
- 列结构变化时：
  - 因内部 `columnKey` 会重建，需清空当前焦点
- 当前激活行被移除时：
  - 清空当前焦点

## 5. 注册机制设计

## 5.1 结论

- 在“不改现有组件源码”的约束下，不采用子组件主动注册。
- 采用显式桥接组件 `FlTableEditor` 作为注册层。
- `FlTable` 只和 `FlTableEditor` 注册的编辑器能力交互，不直接感知 `FlInput`、`FlSelect` 等组件类型。

### 5.2 为什么不用 DOM 猜测

- `FlTable` 外层拿不到单元格 slot 内部渲染组件的稳定实例。
- 直接从 `FlTable` 全局扫描 DOM 并按类名猜测编辑器类型，维护成本高，且易受内部结构变动影响。
- 键盘交互属于基础能力，不应建立在脆弱的内部 class 结构之上。

### 5.3 为什么不用改现有组件源码

- 若让 `FlInput`、`FlSelect` 等组件主动注册，需要侵入多个组件源码。
- 当前约束已明确排除这条路径。
- 因此注册责任上移到表格单元格模板层，由调用方显式包裹 `FlTableEditor`。

## 6. FlTableEditor 方案

### 6.1 组件职责

- `FlTableEditor` 是一个很薄的桥接层，职责仅包括：
  - 将当前编辑器注册给 `FlTable`
  - 提供统一的 `focus`、`blur`、`handoffFirstKey` 能力
  - 在不改子组件源码的前提下，把表格导航和编辑器接管解耦

### 6.2 注册内容

```ts
type TableEditorEndpoint = {
  id: symbol
  getRootEl: () => HTMLElement | null
  focus: () => void
  blur: () => void
  handoffFirstKey: (event: KeyboardEvent) => Promise<boolean>
  open?: () => void | Promise<void>
  close?: () => void | Promise<void>
  isFixedClone?: boolean
  priority?: number
}
```

说明：

- `getRootEl`
  - 返回当前桥接编辑器的根 DOM
  - `FlTable` 通过“当前 `td` 是否包含该 root”来判断命中关系
- `focus`
  - 让当前编辑器进入焦点态
- `blur`
  - 让当前编辑器退出焦点态
- `handoffFirstKey`
  - 将首次输入键交给当前编辑器消费
  - 统一返回 `Promise<boolean>`，`FlTable` 必须 `await` 该结果后再决定是否切换编辑态
- `open / close`
  - 仅供 `FlSelect`、`FlDatePicker` 这类组件需要时扩展
- `isFixedClone`
  - 标记当前 endpoint 是否位于固定列克隆层
  - 由 `FlTableEditor` 根据祖先节点是否命中 `.el-table__fixed` / `.el-table__fixed-right` 自行判断
- `priority`
  - 单元格内存在多个候选编辑器时的优先级

### 6.3 注册查找方式

- `FlTable` 内部维护 registry，并在表格根 DOM 上通过 symbol key 挂载 registry host
- `FlTableEditor` 在挂载后通过 `closest('.fl-table')` 查找最近表格根节点并注册，在卸载时注销
- `FlTable` 在方向键或首键接管时：
  - 先通过 `activeCell` 定位当前 `td`
  - 再从 registry 中查找 `rootEl` 落在该 `td` 内的 endpoint
  - 若命中多个 endpoint，优先选择 `isFixedClone !== true` 的主表格侧 endpoint
  - 仅当主表格侧 endpoint 不存在时，才 fallback 到固定列覆盖层侧 endpoint
  - 命中后调用其 `focus / blur / handoffFirstKey`

说明：

- 首版实现未使用 `provide / inject`
- 原因是 `FlTableEditor` 位于 cell slot 渲染链路中，直接依赖 `provide / inject` 无法稳定命中当前表格实例
- 通过 DOM host registry 可以在不改现有输入类组件源码的前提下，保持注册边界明确且可控

### 6.4 为什么不用 rowKey + columnKey 注册

- `FlTableEditor` 作为 cell slot 内部桥接层，天然拿不到稳定的 `rowKey + columnKey` 上下文。
- 若要按单元格坐标注册，必须再让 `FlTable` 给每个 cell 注入额外上下文，复杂度显著上升。
- 首版采用“当前 `td` 包含关系”已经足够支撑导航和编辑接管。

### 6.5 固定列双重注册处理

- Element Plus 固定列通过克隆 DOM 实现，同一个 slot 会同时渲染在主表格和固定列覆盖层内。
- 因此，同一个业务单元格可能产生两个 `FlTableEditor` 实例并同时注册。
- 首版策略：
  - `FlTableEditor` 注册时记录 `isFixedClone`
  - Registry 查找时优先取主表格侧 endpoint
  - 固定列覆盖层侧 endpoint 只作为 fallback，不作为默认接管对象
- 说明：
  - 这条策略允许首版在 fixed 场景下保持可用，同时把对 Element Plus 内部固定列结构的依赖收敛到桥接层内部
  - 若 Element Plus 未来修改 fixed 实现方式，需要重新验证该判定逻辑

## 7. 编辑器分类与首键接管逻辑

### 7.1 分类方式

- 不按具体组件名分类。
- 只分两类：
  - `text`
  - `controlled`

### 7.2 text

适用对象：

- `FlInput`
- `FlInputNumber`
- 具备真实可写输入口的编辑器

处理规则：

- 真实输入口定位顺序：
  1. 若 `targetRef` 已传且非空，优先取其对应 DOM；若是组件实例，则取 `$el`
  2. 否则，仅在 `FlTableEditor` 自身 slot 根节点范围内查找第一个 `input:not([type="hidden"]), textarea`
  3. 若两者均无结果，则 `handoffFirstKey()` 返回 `false`，不接管
- `focus()` 时：
  - 聚焦真实输入口
- `blur()` 时：
  - 对当前活动输入口执行失焦
- `handoffFirstKey()` 时：
  - 聚焦输入口
  - 先派发 `keydown`
  - 对可打印字符、数字键、空格：
    - 通过标准键盘事件链与浏览器文本插入能力完成首键写入
    - 推荐顺序为：`keydown` → 文本插入能力（如 `setRangeText` / `execCommand('insertText')` 或等价策略）→ `InputEvent(inputType='insertText')`
  - 对 `Backspace`、`Delete`、`Enter`、`F2`：
    - 仅派发 `keydown`
    - 不额外写入字符
  - 禁止使用 `inputEl.value = ...` 直接改值

说明：

- 文本类编辑器允许 `FlTableEditor` 直接把首键落到真实输入目标上。
- 这里的输入口解析只发生在 `FlTableEditor` 局部包装范围内，不由 `FlTable` 全局猜测。
- 查找范围严格限定在 `FlTableEditor` 的 slot DOM 边界内，不允许跨层级全局搜索。
- 文本写入必须兼顾组件自身键盘处理链与 Vue `v-model` 响应链，避免“首键进入 DOM 但未进入响应式数据”的错位。

### 7.3 controlled

适用对象：

- `FlSelect`
- `FlDatePicker`
- 其它由组件自身控制交互状态的编辑器

处理规则：

- `focus()` 时：
  - 聚焦组件触发入口或根可聚焦节点
- `blur()` 时：
  - 让当前激活入口失焦
  - 如有展开态，可选执行 `close`
  - `handoffFirstKey()` 时：
    - 先 `focus`
    - 必要时 `open`
    - 若 `open()` 为异步操作，`handoffFirstKey()` 必须等待 `open` 完成
    - `open()` 若不返回 Promise，由桥接层自行通过 `nextTick`、`requestAnimationFrame` 或等价机制封装等待时机
    - 待面板或真实输入口稳定后：
      - 若出现真实输入口，则把首键继续交给该输入口
      - 若没有真实输入口，则把首键交给组件自己的键盘交互链路

说明：

- `controlled` 的策略不是直接写值，而是先把组件带入自己的交互态，再由组件或其真实输入口消费首键。
- `FlTable` 不重写 `FlSelect`、`FlDatePicker` 的业务键盘语义。
- `controlled` 场景下，首键接管必须是完整异步链路，禁止在 `open()` 尚未完成时提前派发首键，避免丢键。

## 8. 推荐 API 草案

### 8.1 FlTableEditor Props

```ts
type EditorMode = 'text' | 'controlled'

type FlTableEditorProps = {
  mode: EditorMode
  targetRef?: Ref<ComponentPublicInstance | HTMLElement | null>
  priority?: number
}
```

说明：

- `mode`
  - 当前桥接编辑器接入模式
- `targetRef`
  - 可选；显式指定需要注册的目标组件或目标 DOM
  - `mode="text"` 时：建议显式传入；未传则自动在 `FlTableEditor` slot 根节点内查找第一个真实输入口
  - `mode="controlled"` 时：未传则聚焦 `FlTableEditor` 根节点或其第一个可聚焦后代
- `priority`
  - 单元格内有多个桥接编辑器时的选择优先级

### 8.2 使用示例

```vue
<FlTable :data="data" row-key-field="id" is-edit cross-highlight>
  <el-table-column label="姓名">
    <template #default="{ row }">
      <FlTableEditor mode="text">
        <FlInput v-model="row.name" is-table />
      </FlTableEditor>
    </template>
  </el-table-column>

  <el-table-column label="数量">
    <template #default="{ row }">
      <FlTableEditor mode="text">
        <FlInputNumber v-model="row.amount" is-table />
      </FlTableEditor>
    </template>
  </el-table-column>

  <el-table-column label="状态">
    <template #default="{ row }">
      <FlTableEditor mode="controlled">
        <FlSelect v-model="row.status" :options="statusOptions" is-table />
      </FlTableEditor>
    </template>
  </el-table-column>

  <el-table-column label="日期">
    <template #default="{ row }">
      <FlTableEditor mode="controlled">
        <FlDatePicker v-model="row.date" type="date" is-table />
      </FlTableEditor>
    </template>
  </el-table-column>
</FlTable>
```

## 9. FlTable 实现逻辑

### 9.1 状态模型

- 延续现有：

```ts
type ActiveCell = {
  rowKey: string | number
  columnKey: string
}
```

- 新增内部状态：

```ts
type EditingState = {
  active: boolean
}
```

说明：

- `activeCell` 负责定位单元格
- `editingState` 负责区分“当前是否已有编辑器接管键盘”
- `crossHighlight` 仅负责展示层，不决定键盘导航是否可用

### 9.2 文档级键盘监听

- 监听位置：
  - `document` 级 `keydown`
- 生效条件：
  - 当前存在 `activeCell`
  - 事件不处于 `isComposing`
  - 非 `Ctrl / Meta / Alt` 组合键
- 前置依赖：
  - 当前激活单元格若存在 `FlTableEditor` 注册的 endpoint，则导航与首键接管优先走 registry 命中链路

### 9.3 方向键处理顺序

1. 判断是否命中四个方向键
2. 定位当前 `td`
3. 查找该 `td` 内命中的 editor endpoint
4. 若存在 editor，则先执行 `blur`
5. 计算下一个 `activeCell`
6. 更新焦点状态
7. 将目标单元格滚动到可视区域
8. 保持目标单元格只显示边框焦点，不自动进入编辑态

### 9.4 首键处理顺序

1. 判断是否为可输入键
2. 若当前无 `activeCell`，不接管
3. 若当前已经是编辑态，可直接放行给当前编辑器
4. 若当前不是编辑态：
   - 定位当前 `td`
   - 查找命中的 editor endpoint
   - `await` 调用 `handoffFirstKey`
   - 仅当返回 `true` 时，才把状态切为编辑态
   - 若返回 `false`，保持当前单元格焦点，不切入编辑接管

### 9.5 表格外点击处理

- 点击表格外任意区域时：
  - 清空 `activeCell`
  - 清空编辑态
  - 若当前编辑器仍持有焦点，先执行失焦

## 10. 开发边界与风险

### 10.1 明确边界

- 首版必须建立在显式桥接组件 `FlTableEditor` 之上。
- 不支持“完全零侵入模板”接入键盘编辑焦点。
- 单元格内若未显式包裹 `FlTableEditor`，则：
  - 仍可有单元格边框焦点
  - 仍可用方向键切换单元格
  - 但不承诺该单元格可进入编辑接管

### 10.2 风险点

- `controlled` 类组件的真实可聚焦入口可能依赖 Element Plus 内部结构。
- 同一个单元格若存在多个编辑器，需要调用方明确主编辑器，首版不做复杂仲裁。
- 固定列场景存在双重注册风险；首版按“优先主表格侧 endpoint、固定列侧仅 fallback”处理。
- 合并单元格、复杂嵌套 slot 下的 `td` 定位需要单独验证。

## 11. 验收标准

- 点击数据单元格后，四个方向键可在数据单元格之间移动焦点。
- 到边界时停止，不循环。
- 切格时若当前单元格内部组件已获焦，则先失焦，再切换单元格。
- 切换后的目标单元格不自动让内部组件获得焦点。
- 用户输入可打印键、数字键、空格、`Backspace`、`Delete`、`Enter`、`F2` 时，当前单元格可进入编辑接管。
- `mode="text"` 且未传 `targetRef` 时，桥接层仍可在自身 slot DOM 边界内定位真实输入口。
- `mode="controlled"` 且存在异步 `open()` 时，首键不会在面板挂载前丢失。
- `crossHighlight=false` 时，仅单元格边框焦点跟随方向键移动。
- `crossHighlight=true` 时，边框焦点、当前行、当前列、表头列高亮同步跟随。
- 点击表格外区域后，焦点与编辑态均被清空。
- 不改 `FlInput`、`FlSelect`、`FlInputNumber`、`FlDatePicker` 现有源码，依然可以完成接入。
- 固定列场景下，若主表格与 fixed 克隆侧同时存在 endpoint，默认优先主表格侧，不产生双重失焦副作用。

## 12. 测试建议

- 方向键基础导航：
  - 上下左右移动
  - 边界停住
- 焦点与编辑态：
  - 当前编辑器已聚焦时，方向键先失焦再切格
  - 目标格不自动 focus 内部组件
- 首键接管：
  - `text` 模式下输入字符可进入编辑
  - `text` 模式下未传 `targetRef` 时，验证 slot 局部 fallback 定位
  - `text` 模式下禁止直接改 `input.value`，应验证组件数据与视图同步
  - `controlled` 模式下可进入组件交互态并消费首键
  - `controlled` 模式下验证异步 `open()` 后首键不丢失
- 显示层：
  - `crossHighlight=true/false` 两种模式都正确
- 生命周期：
  - 点击表格外清空
  - 行移除、列结构变化时清空
  - fixed 列存在双 endpoint 时优先主表格侧

## 13. 下一阶段开发拆解

- [x] 第 0 步：建立执行跟踪文件与实现清单。
- [x] 第 1 步：在 `FlTable` 内补齐 editor registry 与键盘导航主逻辑。
- [x] 第 2 步：新增桥接组件 `FlTableEditor`。
- [x] 第 3 步：在文档示例和表格编辑示例中按 `mode="text"` / `mode="controlled"` 接入。
- [x] 第 4 步：补充单元测试，覆盖导航、失焦、首键接管、交叉高亮联动。
- [x] 第 5 步：补充文档与 API 说明。
