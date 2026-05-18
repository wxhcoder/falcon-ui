# FlTree 需求文档（Tree PRD）

## 0. 开发阶段状态

- 说明：开发按“一个功能一个阶段”推进，避免多项能力在同一阶段并行堆叠。
- 约束：每个阶段完成后都必须具备独立验证条件；未得到用户确认前，不进入下一阶段。
- 阶段 1 必须完成最小可用导出链路，保证示例、测试和完整安装链路都能直接导入。

- [x] 准备阶段：对标范围梳理、组件目录建立、PRD 落盘
- [x] 阶段 1：开发基本树渲染
  - `data` 输入
  - `props` 映射
  - `TreeNode` 递归渲染骨架
  - Element Plus Tree 视觉变量继承
  - 最小可用导出链路
- [x] 阶段 2：开发树节点展开 / 收起功能
- [x] 阶段 3：开发默认展开与受控展开功能
- [x] 阶段 4：开发树节点单选功能
- [x] 阶段 5：开发树节点多选功能
- [x] 阶段 6：开发树复选框渲染功能
- [x] 阶段 7：开发树父子联动勾选功能
- [x] 阶段 8：开发严格勾选与半选态功能
- [x] 阶段 9：开发禁用节点联动边界功能
- [x] 阶段 10：开发 `showLine` 配置与样式功能
- [x] 阶段 11：开发树节点默认内容渲染与 switcher 视觉模式
- [x] 阶段 12：开发 Tree 语义化 DOM 样式定制功能
- [x] 阶段 13：开发树节点异步加载功能
- [x] 阶段 14：开发树节点拖拽功能
- [x] 阶段 15：开发树键盘导航与无障碍功能
- [x] 阶段 16：开发树节点双击展开功能
- [x] 阶段 17：开发树滚动控制能力
- [x] 阶段 18：开发文档示例与单元测试补全
- [x] 阶段 19：质量门禁
- [x] 阶段 20：节点交互状态契约修正
- [x] 阶段 21：开发树节点手风琴展开模式
- [x] 阶段 22：开发树节点展开 / 折叠动画

## 1. 对标基线与目标

### 1.1 对标基线

本 PRD 以 **2026-04-15** 可见的 Ant Design Tree 文档与源码为对标对象：

- 文档页：<https://ant.design/components/tree/>
- 源码入口：<https://github.com/ant-design/ant-design/tree/master/components/tree>
- 类型参考：<https://raw.githubusercontent.com/ant-design/ant-design/master/components/tree/Tree.tsx>

### 1.2 目标

- 在 Falcon UI 中提供 `FlTree` 组件，交互语义尽量对齐 Ant Design `Tree`。
- API 命名尽量贴近 Ant Design，同时符合 Vue 3 受控写法与 `v-model:*` 习惯。
- 组件采用完全独立开发，不基于 Element Plus `ElTree` 或其他现成树组件做二次封装。
- 内部自行实现树数据标准化、可见节点拍平、勾选传导、键盘导航与拖拽落点判定。
- 实现统一使用 Vue 3 Composition API、`<script setup lang="ts">`、类型先行。

### 1.3 非目标

- 不追求 React DOM 结构或 CSS-in-JS token 体系逐字节一致。
- 不内置搜索输入框、右键菜单或上下文命令面板。
- 首版不做跨树拖拽、超大规模节点专项优化和远程分页树。

## 2. 组件定位

- 组件名称：`FlTree`
- 组件类型：树形数据展示与交互组件
- 对标对象：Ant Design `Tree`
- 技术路线：
  - 基于 Falcon UI 自研树状态引擎与节点渲染层实现
  - 渲染层聚焦普通树递归 / 拍平渲染
  - 不依赖第三方树组件 DOM 结构
- 设计原则：
  - 树数据语义尽量对齐 Ant Design
  - Vue 对外事件统一采用 kebab-case emits
  - 受控状态同时支持属性输入与 `update:*` 输出
  - 逻辑层与渲染层解耦，避免后续异步树、拖拽和滚动控制互相污染

## 3. 范围定义

### 3.1 In Scope

- 树节点数据渲染：`data`、`props`、key-based 交互状态
- 展开行为：默认展开、受控展开、父级联动展开
- 选择行为：单选、多选
- 勾选行为：父子联动勾选、严格勾选、半选态
- 节点禁用能力：`disabledKeys`、`unselectableKeys`、`disabledCheckboxKeys`、`hiddenCheckboxKeys`
- 自定义渲染：标题、图标、展开图标、连线、整行占满
- 语义化 DOM 样式定制：`classNames`、`styles`
- 异步加载：`loadData`、`loadedKeys`、`isLeaf`
- 拖拽：节点可拖拽、投放位置限制、拖拽事件
- 滚动控制：`scrollTo`
- 筛选高亮：`filterTreeNode`
- 双击展开：节点内容区双击展开 / 收起
- 类型导出、组件暴露方法、测试矩阵与文档示例

### 3.2 Out of Scope（首版不做）

- 不提供与 Ant Design Tree Component Token 一一对应的主题兼容层
- 不提供搜索面板、右键菜单、上下文命令面板
- 不提供跨树拖拽、远程分页树、超大规模节点专项优化
- 不提供虚拟树或虚拟滚动；相关能力由独立组件承接

## 4. 核心需求拆解

### 4.1 数据模型

- `FlTree` 对外统一以 `data` 作为树数据输入入口。
- `FlTree` 必须存在 `TreeNode` 内部组件，用于承接单节点渲染、递归组织与局部交互职责拆分。
- `TreeNode` 仅作为内部实现组件，不提供对外声明式节点 API。
- 每个节点必须具备全局唯一 `key`；若缺失则视为非法输入。
- 内部首先将原始树数据转换为标准化节点索引结构，至少维护：
  - `key -> node`
  - `key -> parentKey`
  - `key -> childrenKeys`
  - `visibleNodeKeys`
- 默认字段映射遵循 Element Plus Tree 的 `props` 风格，但不映射组件交互状态：
  - `label`
  - `children`
  - `isLeaf`
- `key` 始终作为树节点主键单独要求，不通过 `props` 做映射。
- `props` 首版至少支持：
  - `label`
  - `children`
  - `isLeaf`
  - `class`
- 除保留字段外，其余业务字段原样保留，并在事件与自定义渲染中回传。
- `TreeData` 不承载组件交互状态；禁用、不可选、禁用 checkbox 与隐藏 checkbox 均通过 key-based props 声明。

### 4.2 展开行为

- 支持以下展开控制能力：
  - `defaultExpandAll`
  - `defaultExpandedKeys`
  - `expandedKeys`
  - `autoExpandParent`
  - `defaultExpandParent`
  - `accordion`
- 受控模式下，组件内部不得持久化最终展开结果；最终状态以外部传入为准。
- 非受控模式下，组件内部维护展开状态，并在变更时同步发出 `update:expandedKeys`。
- `accordion = true` 时启用手风琴展开模式，同一层级、同一父节点下最多只允许一个
  可展开节点处于展开状态。
- `parentKey` 不是公开属性，仅作为内部 `key -> parentKey` 标准化索引，用于精确定义同级
  节点；两个节点的 `parentKey` 相同，即视为同级。
- 手风琴约束优先于 `defaultExpandedKeys`、`defaultExpandAll`、受控 `expandedKeys` 和用户
  交互结果；同一同级组出现多个展开 key 时，保留输入顺序中最后出现的 key。
- `autoExpandParent` 与 `defaultExpandParent` 是既有展开属性，只负责祖先补齐，不得绕过
  `accordion` 的同级唯一展开约束。
- 支持节点内容区双击展开 / 收起：
  - 仅非叶子、可展开且非加载中节点生效
  - 双击复用既有展开状态、异步加载和展开事件链路
  - 不新增选择模式，不改变单击选择、switcher 点击和 checkbox 勾选职责
- 展开 / 折叠默认具备视觉动画：
  - 动画只影响子树显隐视觉，不改变展开状态、事件顺序、受控优先级或异步加载链路
  - 动画通过 Vue 内置 `Transition` 输出 `fl-tree-collapse` 过渡 class
  - 动画样式由 Falcon UI Tree 原生 SCSS 实现，不引用 Element Plus transition 组件或样式文件
  - 展开后的子节点容器继续保留 `role="group"`，动画内部包裹层仅作为 presentation 结构
  - 收起后子树仍按既有 `v-if` 逻辑卸载，折叠节点继续不参与滚动、键盘和节点注册

### 4.3 选择行为

- 默认 `selectable = true`。
- 当前阶段已实现普通树单选与 `multiple = true` 的普通树多选。
- 提供：
  - `defaultSelectedKeys`
  - `selectedKeys`
  - `disabledKeys`
  - `unselectableKeys`
- 单选与多选共用同一套选中态合并模型：
  - 受控模式只读取外部 `selectedKeys`
  - 非受控模式只在初始化时消费 `defaultSelectedKeys`
  - 后续数据变化只裁剪非法 key，不重新初始化默认选中结果
- 选中 key 归一化规则固定为：
  - 去重
  - 过滤非法 key
  - 过滤已不存在节点
  - 过滤 `disabledKeys`
  - 过滤 `unselectableKeys`
  - 保持剩余 key 的原始顺序
- 单选运行时语义固定为：
  - 点击未选中节点：切换为该节点唯一选中
  - 点击已选中节点：取消选中，`selectedKeys` 变为 `[]`
- 多选运行时语义固定为：
  - 点击未选中节点：将当前 key 追加到 `selectedKeys` 末尾
  - 点击已选中节点：仅移除当前 key，保留其他已选中项
  - 不引入 `ctrl` / `command` 组合键语义
- 阶段 4 / 5 统一通过节点内容区触发选中链路；`switcher` 点击只负责展开 / 收起，不再触发 `node-click` / `select`。
- `disabledKeys` 或 `unselectableKeys` 命中的节点不允许进入选中态。
- 树级 `selectable = false` 时，整棵树不进入选中链路：
  - 不同步 `defaultSelectedKeys` / `selectedKeys`
  - 不输出 `aria-selected`
  - 不渲染选中高亮
- `select` 事件签名固定为 `select(selectedKeys, event)`；其中：
  - `event.node` 返回当前交互节点的 `TreeNode`
  - `event.selectedNodes` 返回当前选中节点列表 `TreeNode[]`
  - `event.selected` 仅表示当前交互节点本次点击后是选中还是取消选中
- 若业务侧需要原始数据，统一通过：
  - `event.node.data`
  - `event.selectedNodes.map((node) => node.data)`

### 4.4 勾选行为

- `checkable = true` 时显示勾选框。
- 提供：
  - `defaultCheckedKeys`
  - `checkedKeys`
  - `checkStrictly`
  - `disabledCheckboxKeys`
  - `hiddenCheckboxKeys`
- `checkStrictly = false` 时，对齐 Ant Design 的父子联动勾选规则。
- `checkStrictly = true` 时：
  - 父子节点勾选状态相互独立
  - `checkedKeys` 支持 `{ checked, halfChecked }`
- `disabledCheckboxKeys` 命中的节点仍可展示但勾选框不可交互。
- `hiddenCheckboxKeys` 命中的节点不渲染自身勾选框，但不阻断子孙节点勾选。
- 勾选状态计算必须基于独立的传导算法实现，不能依赖第三方树组件内建回传。

### 4.5 禁用节点联动规则

- 遵守 Ant Design 文档中的禁用节点传导规则：
  - 勾选状态向上、向下传导时，遇到 `disabledKeys` 命中的节点必须停止影响该分支
  - 被禁用的父节点不应因为子节点勾选而被动改变
  - 被禁用的子节点不应因为父节点勾选而被动改变
- 以上规则必须写入测试用例，避免后续回归破坏树语义。

### 4.6 自定义渲染与视觉能力

- 阶段拆分约束：
  - 下一阶段固定为阶段 10，仅开发 `showLine` 的配置能力与对应样式表现。
  - 阶段 11 固定承接默认节点内容渲染、`default` 插槽扩展、整行热区、
    `switcherIcon` 三档模式与 `switcherLoadingIcon`。
- 支持以下视觉控制：
  - `showLine`
  - `icon`
  - `switcherIcon`
  - `switcherLoadingIcon`
- 不再提供以下视觉入口：
  - `showIcon`
  - `blockNode`
  - `titleRender`
  - `#title`
  - `#icon`
  - `#switcher-icon`
- `showLine` 需要支持：
  - `boolean`
  - `{ showLeafIcon }`
- 阶段 10 对 `showLine` 的交付范围固定为：
  - 连线显隐
  - 叶子节点连线末端样式
  - `showLeafIcon` 配置对叶子节点视觉的影响
  - 连线模式下展开器、缩进与节点内容区的对齐稳定性
- 阶段 11 默认节点内容渲染约定：
  - 节点内容区默认铺满整行；hover、selected 与点击热区统一按整行处理
  - 未传 `default` 插槽时，组件仅渲染内建 `label`
  - 传入 `default="{ node, data }"` 后，节点内容区完全交由用户控制
  - `default` 插槽仅接管 `switcher / checkbox` 右侧的节点内容区；缩进、连线、
    `switcher` 与勾选框仍由组件内部控制
- `switcherIcon` 改为枚举型 prop，默认值为 `arrow`：
  - `arrow`：收起态显示 `CaretRight`，展开态显示 `CaretBottom`
  - `plus-minus`：收起态显示 Falcon UI `+` 图标，展开态显示 Falcon UI `-` 图标
  - `folder`：仅非叶子节点生效，收起态显示 Element Plus `Folder`，展开态显示
    Element Plus `FolderOpened`
- `switcherLoadingIcon` 保留：
  - 节点处于异步加载中时，临时覆盖当前 `switcherIcon` 模式
  - 仅作用于加载态，不改变非加载态下的 `switcherIcon` 模式选择
- 视觉变量约定：
  - 优先复用 Element Plus Tree 组件变量与全局颜色变量
  - 首版样式优先围绕以下变量建立：
    - `--el-tree-node-content-height`
    - `--el-tree-node-hover-bg-color`
    - `--el-tree-text-color`
    - `--el-tree-expand-icon-color`
    - `--el-color-primary`
    - `--el-color-primary-light-9`
    - `--el-fill-color-blank`
    - `--el-text-color-secondary`
    - `--el-font-size-base`
    - `--el-transition-duration`
- 图标约定：
  - 叶子节点显示圆点
  - `switcherIcon = 'arrow'` 时，收起态显示 `CaretRight`，展开态显示 `CaretBottom`
  - `switcherIcon = 'plus-minus'` 时，仅非叶子节点切换 Falcon UI `+ / -` 图标
  - `switcherIcon = 'folder'` 时，仅非叶子节点切换 `Folder / FolderOpened`

### 4.7 语义化 DOM 样式定制

- 首版提供对标 Ant Design Tree 的语义化 DOM 样式定制能力：
  - `classNames`
  - `styles`
- 首版固定以下语义化结构名：
  - `root`
  - `item`
- 语义化结构含义：
  - `root`：树根容器
  - `item`：单个树节点条目容器
- 输入形式支持：
  - `Partial<Record<TreeSemanticDOM, string | CSSProperties>>`
  - `(info: { props }) => Partial<Record<TreeSemanticDOM, string | CSSProperties>>`
- 函数形式中的 `info.props` 固定为当前 `FlTree` 公开 props 快照。
- 该能力仅承担样式扩展，不负责标题内容替换、图标逻辑替换和交互行为控制。
- 节点内部内容区由 `default` 插槽接管；`itemIcon`、`itemCheckbox`、`itemTitle` 不作为
  `classNames` / `styles` 的公开语义化 DOM 挂点。

### 4.8 筛选与高亮

- 提供 `filterTreeNode(node) => boolean`。
- 返回 `true` 时，对应节点进入命中过滤态。
- 该能力只负责高亮标记，不负责：
  - 自动生成搜索输入框
  - 自动展开祖先节点
  - 自动滚动到命中项
- 搜索体验由外层组合 `expandedKeys + filterTreeNode + scrollTo` 实现。

### 4.9 异步加载

- 提供 `loadData(node)` 异步加载能力。
- 当节点满足以下条件时，可触发异步加载：
  - 当前节点未标记为 `isLeaf = true`
  - 当前节点尚未加载
  - 当前节点被展开
- 提供 `loadedKeys` 受控能力，并同步支持 `update:loadedKeys`。
- 节点处于异步加载中时，默认使用 Element Plus `Loading` 图标覆盖当前
  `switcherIcon` 模式展示；传入 `switcherLoadingIcon` 时使用自定义加载图标。
  `switcherLoadingIcon` 类型固定为可选 `TreeSwitcherLoadingIcon` 组件类型，prop
  默认值为 Element Plus `Loading`；可不传，但不接受 `null` 空值。
- 遵守 Ant Design FAQ 边界：`defaultExpandAll` 仅初始化生效。

### 4.10 拖拽能力

- 提供 `draggable: boolean`，默认关闭。
- 提供 `allowDrag(node) => boolean`，用于节点级拖拽源拦截。
- 提供 `allowDrop(draggingNode, dropNode, type) => boolean`，其中 `type` 为
  `prev | inner | next`。
- 支持 Element Plus 风格拖拽事件：
  - `node-drag-start`
  - `node-drag-enter`
  - `node-drag-over`
  - `node-drag-leave`
  - `node-drag-end`
  - `node-drop`
- 成功投放后组件内部原地重排 `data` / children 数组，再触发
  `node-drag-end` 与 `node-drop`。
- 首版拖拽排序仅保证单树内部拖拽，不做跨树拖拽。

### 4.11 滚动控制

- 滚动控制只负责定位当前已渲染且可见的节点，不切换渲染策略。
- 折叠子树中的节点、已不存在节点或非法 `key` 不触发滚动。
- 暴露 `scrollTo` 方法：

```ts
scrollTo(options: {
  key: string | number
  align?: 'top' | 'bottom' | 'auto'
  offset?: number
}): void
```

### 4.12 节点双击展开

- 双击节点内容区时，可展开节点切换展开 / 收起状态。
- 双击叶子节点、不可展开节点或加载中节点时，不触发展开状态变更。
- 双击展开只作为普通树展开能力补充，不改变单击选择链路。
- 双击展开必须复用阶段 13 的异步加载链路：双击展开未加载节点时触发 `loadData`。
- 双击展开不得影响 switcher 点击、checkbox 点击、拖拽和键盘事件职责边界。

### 4.13 无障碍与键盘交互

- 节点需要具备基础树语义：
  - `role="tree"`
  - `role="treeitem"`
  - `aria-expanded`
  - `aria-selected`
  - `aria-checked`
- 首版至少支持：
  - `Up / Down`
  - `Left / Right`
  - `Enter / Space`
- 焦点管理应以内部 `focusedKey` 为唯一事实来源，避免 DOM 查询驱动状态。

## 5. 组件契约草案

### 5.1 类型草案

```ts
type TreeKey = string | number

type TreeSwitcherIconMode = 'arrow' | 'plus-minus' | 'folder'

type TreeSemanticDOM = 'root' | 'item'

interface TreeNodeProps {
  label?: string
  children?: string
  isLeaf?: string
  class?: string
}

interface TreeData {
  key: TreeKey
  label?: string
  children?: TreeData[]
  isLeaf?: boolean
  [key: string]: unknown
}

type TreeCheckedKeys =
  | TreeKey[]
  | {
      checked: TreeKey[]
      halfChecked: TreeKey[]
    }

interface TreeSelectEvent {
  selected: boolean
  node: TreeNode
  selectedNodes: TreeNode[]
  key: TreeKey
  event: MouseEvent
}
```

### 5.2 Props 草案

- 数据与映射
  - `data`
  - `props`
- 展开相关
  - `defaultExpandAll`
  - `defaultExpandedKeys`
  - `expandedKeys`
  - `autoExpandParent`
  - `defaultExpandParent`
  - `accordion`
- 选择相关
  - `selectable`
  - `multiple`
  - `defaultSelectedKeys`
  - `selectedKeys`
  - `disabledKeys`
  - `unselectableKeys`
- 勾选相关
  - `checkable`
  - `checkStrictly`
  - `defaultCheckedKeys`
  - `checkedKeys`
  - `disabledCheckboxKeys`
  - `hiddenCheckboxKeys`
- 异步相关
  - `loadData`
  - `loadedKeys`
- 视觉相关
  - `showLine`
  - `switcherIcon`
    - `'arrow' | 'plus-minus' | 'folder'`
  - `switcherLoadingIcon`
  - `classNames`
  - `styles`
- 拖拽相关
  - `draggable`
  - `allowDrag`
  - `allowDrop`
- 筛选
  - `filterTreeNode`

### 5.3 Slots 草案

- `default="{ node, data }"`
- 槽位参数语义对齐 Element Plus Tree 默认插槽。
- 未传 `default` 插槽时，组件仅渲染内建 `label`。
- 传入 `default` 插槽时，节点内容区完全由用户控制；`switcherIcon`、
  `switcherLoadingIcon`、checkbox、indent、showLine 仍由组件内部控制。

### 5.4 Emits 草案

- 状态同步
  - `update:expandedKeys`
  - `update:selectedKeys`
  - `update:checkedKeys`
  - `update:loadedKeys`
- 行为事件
  - `expand`
  - `node-click`
  - `node-expand`
  - `node-collapse`
  - `select`
  - `check`
  - `load`
  - `dblclick`
  - `right-click`
  - `node-drag-start`
  - `node-drag-enter`
  - `node-drag-over`
  - `node-drag-leave`
  - `node-drag-end`
  - `node-drop`
- 阶段 5 当前已落地的 `select` 契约：
  - `select(selectedKeys: TreeKey[], event: TreeSelectEvent)`
  - 事件顺序为 `node-click -> update:selectedKeys -> select`
  - `event.selectedNodes` 始终返回当前完整选中集对应的 `TreeNode[]`
  - `event.selected` 始终表示当前点击节点在本次交互后的选中结果

### 5.5 Expose 草案

```ts
interface TreeExpose {
  scrollTo: (options: {
    key: string | number
    align?: 'top' | 'bottom' | 'auto'
    offset?: number
  }) => void
}
```

## 6. 实现策略建议

### 6.1 内部结构拆分

- `src/tree.ts`
  - props / emits / types / 标准化工具函数
- `src/tree-types.ts`
  - 节点数据类型、标准化类型、索引类型
- `src/tree.vue`
  - 组件主入口
- `src/tree-node.vue`
  - 内部 `TreeNode` 组件，负责单节点递归渲染
- `src/use-tree-state.ts`
  - 展开、选中、勾选、受控状态合并
- `src/use-tree-expanded-state.ts`
  - 展开状态合并、祖先自动展开、展开收起事件派发
- `src/use-tree-selected-state.ts`
  - 单选 / 多选状态合并、选中键归一化、`update:selectedKeys` / `select` 事件派发
- `src/use-tree-normalize.ts`
  - 树数据标准化、索引建立、字段映射
- `src/use-tree-flatten.ts`
  - 可见节点拍平、缩进层级、滚动定位输入
- `src/use-tree-check-conduct.ts`
  - 父子勾选传导、半选态计算、禁用节点边界
- `src/use-tree-render.ts`
  - 节点渲染、插槽与图标逻辑
- `src/use-tree-semantic-dom.ts`
  - 语义化 DOM class / style 合并与注入
- `src/use-tree-drag.ts`
  - 拖拽与落点判定
- `src/use-tree-load.ts`
  - 异步加载状态管理
- `src/use-tree-scroll.ts`
  - 滚动定位与 `scrollTo`
- `src/use-tree-keyboard.ts`
  - 键盘导航、焦点管理、无障碍属性映射
- `__test__/tree.test.ts`
  - 行为测试与回归用例

### 6.2 技术取舍建议

- 不依赖 Element Plus `ElTree`、`ElTreeV2` 或其他 UI 树组件作为底座。
- `FlTree` 的渲染与状态能力保持单一链路，独立组件如需复用纯逻辑能力时另行设计契约。
- 受控状态统一通过“合并状态”模型处理，不允许散落在多个分支里各自维护。
- 事件 payload 必须回传原始节点对象与标准化 keys，减少业务侧二次查询。
- 勾选、展开、选中、拖拽四类核心能力都应具备可单测的纯逻辑层。
- `classNames` / `styles` 的挂点必须稳定映射到
  `root / item`。
- 样式文件优先消费 Element Plus Tree 相关 CSS 变量。

## 7. 风险与待确认项

- 拖拽排序是否只做事件回传，还是允许组件内部直接重排 `data` 视图。
- 异步加载与受控 `expandedKeys`、`loadedKeys` 同时存在时，状态优先级需要固定。
- 双击展开与单击选择事件顺序需要固定，避免一次双击导致选择链路异常。
- `scrollTo` 遇到折叠子树节点、异步未加载节点或已不存在节点时的 no-op 语义需要固定。

## 8. 验收标准（首版）

- 能以 `data` 正确渲染多层树结构，并支持 Element Plus 风格 `props` 字段映射。
- `expandedKeys`、`selectedKeys`、`checkedKeys`、`loadedKeys` 均支持受控与非受控模式。
- `checkStrictly = false` 时，父子勾选联动与半选态符合 Ant Design 语义。
- `checkStrictly = true` 时，父子勾选互不影响，且支持 `{ checked, halfChecked }`。
- `disabledKeys` / `disabledCheckboxKeys` / `hiddenCheckboxKeys` 边界与 Ant Design FAQ 一致。
- `loadData` 可在节点展开时异步加载，并正确维护加载中与已加载状态。
- `draggable`、`allowDrag`、`allowDrop` 与 `node-drop` 事件可完整表达节点拖放过程。
- `scrollTo({ key })` 可定位当前已渲染且可见的节点。
- `filterTreeNode` 只负责高亮，不主动篡改展开状态。
- 节点内容区双击可展开 / 收起非叶子节点，并保持单击选择、switcher 和 checkbox 链路隔离。
- `switcherIcon` 支持 `arrow / plus-minus / folder` 三种模式，且 `folder`
  仅作用于非叶子节点。
- `switcherLoadingIcon` 可在异步加载中覆盖当前 `switcherIcon` 模式。
- 未传 `default` 插槽时默认仅渲染 `label`；传入
  `default="{ node, data }"` 后，节点内容区完全由业务侧接管。
- 节点内容区 hover、selected 与点击热区默认铺满整行，不依赖 `blockNode`。
- `classNames` 与 `styles` 可稳定作用于 `root / item` 两类语义化结构。
- 默认视觉样式可跟随 Element Plus Tree / 全局色板变量变化。

## 9. 测试矩阵（建议）

### 9.1 基础渲染

1. 基础树正常渲染，层级缩进正确。
2. `props` 生效，非默认字段可映射渲染。
3. `disabledKeys`、`unselectableKeys`、`disabledCheckboxKeys`、`hiddenCheckboxKeys` 表现正确。
4. `data` 变化后，内部 `TreeNode` 递归结构可正确响应并重渲染。
5. 默认 `switcherIcon = 'arrow'` 时，叶子节点显示圆点，默认收起的非叶子节点
   显示 `CaretRight`，展开后显示 `CaretBottom`。

### 9.2 展开与选择

1. `defaultExpandAll` 仅初始化生效。
2. `expandedKeys` 受控时，内部点击只通过事件请求外部更新。
3. 节点内容区双击可展开 / 收起非叶子节点。
4. `multiple = true` 时支持多选。

### 9.3 勾选

1. 普通联动勾选下，父子节点状态正确传导。
2. 含 `disabled` 节点时，勾选传导在禁用节点处停止。
3. `checkStrictly = true` 时，`checked` 与 `halfChecked` 输出正确。

### 9.4 异步加载

1. 展开未加载节点时触发 `loadData`。
2. 已加载节点重复展开不重复请求。
3. 异步追加节点后，`defaultExpandAll` 不会再次自动执行。
4. 异步加载中 `switcherLoadingIcon` 会覆盖当前 `switcherIcon` 模式。

### 9.5 语义化 DOM 样式定制

1. `classNames.root` 可稳定挂载到树根容器。
2. `classNames.item` / `styles.item` 可稳定挂载到节点条目容器。
3. 传入函数形式时，可基于 `props` 返回语义化结构映射。
4. 节点内部 icon / checkbox / title DOM 不作为公开语义化挂点消费。
5. 展开、异步加载和拖拽状态变化后，两类语义化结构挂点语义保持一致。

### 9.6 阶段 11 默认内容与 `switcherIcon`

1. 未传 `default` 插槽时，节点内容区仅渲染 `label`。
2. 传入 `default="{ node, data }"` 时，节点内容区完全由业务侧控制，且可拿到
   标准化 `node` 与原始 `data`。
3. 传入 `default` 插槽后，内建默认内容渲染失效，但 `switcher`、checkbox、
   indent、showLine 仍正常工作。
4. `switcherIcon = 'arrow'` 时，收起显示 `CaretRight`，展开显示 `CaretBottom`。
5. `switcherIcon = 'plus-minus'` 时，收起 / 展开分别显示 Falcon UI `+ / -` 图标。
6. `switcherIcon = 'folder'` 时，仅非叶子节点显示 `Folder / FolderOpened`；
   叶子节点继续保留圆点或连线末端语义。
7. 默认 hover、selected 与点击热区铺满整行，不依赖 `blockNode`。
8. `showLine` 开启后，整行热区与三种 `switcherIcon` 模式不出现对齐抖动或
   点击热区偏移。

### 9.7 `showLine` 配置与样式

1. `showLine = false` 时，不渲染树连线与连线末端装饰。
2. `showLine = true` 时，父子节点纵向 / 横向连线完整且层级关系清晰。
3. `showLine = { showLeafIcon: false }` 时，叶子节点不额外渲染叶子图标，但连线结构保持稳定。
4. `showLine` 开启后，展开器、叶子节点占位与标题内容区的横向对齐保持一致。
5. 展开 / 收起、选中 / 勾选等既有交互在连线模式下不出现布局抖动或点击热区偏移。
6. `showLine + checkable` 同时开启时，展开器、复选框与标题文本必须按真实节点行高垂直居中。
7. `--fl-tree-node-content-height` 仅作为最小行高 token，不作为连线实际高度上限。
8. 叶子节点末端连线必须跟随真实行高拉伸；不得使用固定 `26px` 或固定
   `--fl-tree-node-content-height` 计算竖线高度与横线中心点。

### 9.8 视觉变量继承

1. 默认文本色、hover 背景、展开图标色可跟随 Element Plus 对应变量变化。
2. 节点高度、字号、过渡时长等基础视觉参数优先取自 Element Plus 变量。
3. 叶子圆点颜色优先复用 Element Plus 次级文本色变量。

### 9.9 拖拽

1. 不可拖拽节点不会进入拖拽态。
2. `allowDrop` 返回 `false` 时禁止落点。
3. `node-drop` 事件可拿到 `draggingNode`、`dropNode` 与 `dropType`。

### 9.10 滚动控制

1. `scrollTo({ key })` 可滚动到当前已渲染且可见的指定节点。
2. 目标 key 不存在、非法或处于折叠子树中时，不触发滚动。
3. 数据、展开态或异步加载结果变化后，滚动定位仍使用最新可见节点序列。

## 10. 当前落盘结果

- 已建立目录：
  - `packages/components/tree/`
  - `packages/components/tree/src/`
  - `packages/components/tree/__test__/`
- 已完成阶段 1 实现文件：
  - `src/tree.ts`
  - `src/tree-types.ts`
  - `src/tree.vue`
  - `src/tree-node.vue`
- 已完成阶段 3 状态层文件：
  - `src/use-tree-expanded-state.ts`
- 已完成阶段 5 状态层文件：
  - `src/use-tree-selected-state.ts`
- 已完成阶段 5 选择能力接线：
  - `src/tree.ts`
  - `src/tree.vue`
  - `src/tree-node.vue`
- 已接入导出链路：
  - `packages/components/tree/index.ts`
  - `packages/components/index.ts`
  - `packages/components/package.json`
  - `packages/falcon-ui/index.ts`
  - `packages/falcon-ui/global.d.ts`
- 已接入主题样式：
  - `packages/theme/src/tree.scss`
  - `packages/theme/index.scss`
- 已接入最小示例：
  - `play/src/views/components-view.vue`

## 11. 阶段 1 测试文档

### 11.1 测试范围

阶段 1 只验证以下内容，不进入阶段 2 及以后：

1. `data` 输入的基础渲染
2. `props` 字段映射
3. 内部 `TreeNode` 递归渲染骨架的可见行为
4. Element Plus 视觉变量继承的基础验证
5. 最小可用导出链路
6. 基础类名通过 `bem.ts` 统一生成

### 11.2 测试内容

| 编号 | 测试内容            | 关注点                                           | 预期结果                                                                      |
| ---- | ------------------- | ------------------------------------------------ | ----------------------------------------------------------------------------- |
| 1    | `data` 基础渲染     | 树节点是否能按层级可见渲染                       | 首层与子层节点均可被测试定位                                                  |
| 2    | `props` 字段映射    | `label`、`children`、`class`                     | 自定义字段名可正确映射到渲染结果                                              |
| 3    | `TreeNode` 递归骨架 | 多层级递归结构是否稳定可见                       | `TreeNode` 与 `role="group"` / `aria-level` 可见                              |
| 4    | 视觉变量继承        | 是否优先复用 Element Plus Tree 视觉变量          | 文本色、hover、图标色等变量可被继承                                           |
| 5    | 最小导出链路        | 组件、插件、样式与全局类型入口是否闭合           | 测试与示例可直接导入 `FlTree`                                                 |
| 6    | BEM 类名生成        | 组件模板是否统一通过 `useNamespace` 生成基础类名 | `root / item / item-content / item-icon / item-title / children` 均不再硬编码 |

### 11.3 当前测试结果

- 自动化测试文件：
  - `packages/components/tree/__test__/tree.test.ts`
- 已执行命令：
  - `pnpm vitest run packages/components/tree/__test__/tree.test.ts`
  - `pnpm vitest run packages/components/__test__/install.test.ts packages/components/tree/__test__/tree.test.ts`
  - `pnpm build:lib`
- 执行结果：
  - `packages/components/tree/__test__/tree.test.ts`：`6 passed`
  - 组合安装回归：`8 passed`
  - 组件构建：通过
- 结论：
  - `data` 基础渲染通过
  - `props` 映射通过
  - 递归骨架通过
  - Element Plus 视觉变量继承通过
  - 最小导出链路通过
  - 基础类名已统一接入 `bem.ts / useNamespace('tree')`
  - 叶子圆点与默认展开 `CaretBottom` 视觉约定已接入阶段 1 渲染骨架

### 11.4 结果判定

- 当前判定：阶段 1 已完成。
- 下一阶段状态：阶段 1 已归档；阶段 2 结果见“阶段 2 测试文档”，阶段 3 继续阻塞。

## 12. 阶段 2 测试文档

### 12.1 测试范围

阶段 2 只验证以下内容，不进入阶段 3 及以后：

1. 非叶子节点默认展开
2. 非叶子节点可通过 switcher 收起与再次展开
3. `CaretBottom / CaretRight` 随展开状态切换
4. 子节点容器跟随展开状态显隐
5. 非叶子节点 `aria-expanded` 与内部展开状态同步
6. 叶子节点继续显示圆点，且不暴露展开属性

### 12.2 测试内容

| 编号 | 测试内容     | 关注点                                       | 预期结果                                              |
| ---- | ------------ | -------------------------------------------- | ----------------------------------------------------- |
| 1    | 展开收起交互 | switcher 点击后是否能收起并再次展开          | 初始展开，点击后收起，再点击恢复                      |
| 2    | 图标切换     | `CaretBottom / CaretRight` 是否与状态同步    | 展开显示 `CaretBottom`，收起显示 `CaretRight`         |
| 3    | 子节点显隐   | `role="group"` 子节点容器是否跟随状态挂载    | 展开时存在，收起时移除                                |
| 4    | 无障碍属性   | 非叶子节点 `aria-expanded` 是否输出正确      | 展开为 `true`，收起为 `false`                         |
| 5    | 叶子节点渲染 | 叶子节点是否仍显示圆点且不暴露展开交互与属性 | 无 switcher button，保留圆点，无 `aria-expanded` 属性 |

### 12.3 当前测试结果

- 自动化测试文件：
  - `packages/components/tree/__test__/tree.test.ts`
- 已执行命令：
  - `pnpm exec eslint packages/components/tree/src/tree-types.ts packages/components/tree/src/tree.ts packages/components/tree/src/tree.vue packages/components/tree/src/tree-node.vue packages/components/tree/__test__/tree.test.ts`
  - `pnpm exec vitest run packages/components/tree/__test__/tree.test.ts`
  - `pnpm exec vitest run packages/components/__test__/install.test.ts packages/components/tree/__test__/tree.test.ts`
  - `pnpm exec vue-tsc -p tsconfig.build.json --noEmit`
  - `pnpm build:lib`
- 执行结果：
  - `packages/components/tree/__test__/tree.test.ts`：`8 passed`
  - 组合安装回归：`10 passed`
  - `vue-tsc`：通过
  - `build:lib`：通过
- 结论：
  - 非叶子节点默认展开通过
  - switcher 点击收起 / 再展开通过
  - `CaretBottom / CaretRight` 切换通过
  - 子节点容器显隐通过
  - `aria-expanded` 同步通过
  - 叶子节点圆点与无展开属性约定通过

### 12.4 结果判定

- 当前判定：阶段 2 已完成。
- 下一阶段状态：阶段 2 已归档；阶段 3 结果见“阶段 3 测试文档”，阶段 4 继续阻塞。

## 13. 阶段 3 测试文档

### 13.1 测试范围

阶段 3 只验证以下内容，不进入阶段 4 及以后：

1. 未传展开属性时默认收起
2. `defaultExpandAll` 仅初始化一次
3. `defaultExpandedKeys` 初始化展开
4. `defaultExpandParent` 祖先自动展开
5. `expandedKeys` 受控展开与 `update:expandedKeys` / `expand` 事件
6. `node-click` / `node-expand` / `node-collapse` 用户交互事件
7. `TreeProps`、`TreeEmits`、`TreeNodeModel`、`TreeNode` 等无 `Fl` 前缀类型导出
8. `autoExpandParent` 受控祖先自动展开
9. 叶子节点圆点、`aria-expanded` 与 BEM 类名回归稳定

### 13.2 测试内容

| 编号 | 测试内容                  | 关注点                                                                | 预期结果                                                            |
| ---- | ------------------------- | --------------------------------------------------------------------- | ------------------------------------------------------------------- |
| 1    | 默认收起                  | 未传展开相关 props 时的运行时默认行为                                 | 根节点可见，子节点不挂载，非叶子节点显示 `CaretRight`               |
| 2    | `defaultExpandAll` 一次性 | 数据更新后是否重复自动展开新增分支                                    | 仅初始化时展开已有分支，新增分支保持收起                            |
| 3    | `defaultExpandedKeys`     | 指定源展开键后分支是否按预期展开                                      | 命中分支展开，未命中的分支保持收起                                  |
| 4    | `defaultExpandParent`     | 非受控初始化时是否自动补齐祖先展开                                    | `true` 时祖先展开，`false` 时不自动展开祖先                         |
| 5    | 受控 `expandedKeys`       | 内部点击是否只发事件且视图严格跟随 prop                               | 点击后仅触发 `update:expandedKeys` / `expand`，外部不更新时视图不变 |
| 6    | 节点交互事件              | `node-click` / `node-expand` / `node-collapse` 的参数、顺序与受控行为 | 仅用户交互触发；switcher 点击顺序固定；受控模式按请求的下一状态出参 |
| 7    | 类型导出命名              | 树模块公开类型是否统一改为无 `Fl` 前缀                                | `TreeProps` / `TreeEmits` / `TreeNodeModel` / `TreeNode` 可正常导出 |
| 8    | `autoExpandParent`        | 受控模式下子节点 key 是否带动祖先渲染展开                             | `true` 时祖先展开，`false` 时仅按源 key 渲染                        |
| 9    | 回归稳定性                | 叶子圆点、`aria-expanded`、BEM 类名与语义化 DOM 挂点是否稳定          | 既有基础渲染契约不回退                                              |

### 13.3 当前测试结果

- 自动化测试文件：
  - `packages/components/tree/__test__/tree.test.ts`
- 已执行命令：
  - `pnpm exec prettier --write packages/components/tree/src/tree.ts packages/components/tree/src/tree.vue packages/components/tree/src/tree-node.vue packages/components/tree/src/use-tree-expanded-state.ts packages/components/tree/__test__/tree.test.ts packages/components/tree/index.ts packages/components/index.ts play/src/views/components-view.vue packages/components/tree/Tree_PRD.md`
  - `pnpm exec eslint packages/components/tree/src/tree-types.ts packages/components/tree/src/tree.ts packages/components/tree/src/tree.vue packages/components/tree/src/tree-node.vue packages/components/tree/src/use-tree-expanded-state.ts packages/components/tree/__test__/tree.test.ts play/src/views/components-view.vue`
  - `pnpm exec vitest run packages/components/__test__/install.test.ts packages/components/tree/__test__/tree.test.ts`
  - `pnpm exec vue-tsc -p tsconfig.build.json --noEmit`
  - `pnpm build:lib`
  - `pnpm --dir play build`
- 执行结果：
  - `eslint`：通过
  - 组合安装回归：`21 passed`
  - `vue-tsc`：通过
  - `build:lib`：通过
  - `play build`：通过
- 结论：
  - 运行时默认行为已从阶段 2 的“临时默认全展开”切换为阶段 3 的“默认收起”
  - `defaultExpandAll` / `defaultExpandedKeys` / `expandedKeys` / `defaultExpandParent` / `autoExpandParent` 已接入
  - `update:expandedKeys` / `expand` / `node-click` / `node-expand` / `node-collapse` 已接入
  - 树模块公开类型已统一改为 `Tree*` 命名，不再导出 `Fl*` Tree 类型
  - 叶子节点圆点、无障碍属性与基础类名契约保持稳定
  - `build:lib` 仍存在既有的 `dialog.vue` dynamic import warning，本阶段树组件改动未引入新的构建告警

### 13.4 结果判定

- 当前判定：阶段 3 已完成。
- 下一阶段状态：阶段 3 已归档；阶段 4 结果见“阶段 4 测试文档”。

## 14. 阶段 4 测试文档

### 14.1 测试范围

阶段 4 只验证以下内容，不进入阶段 5 及以后：

1. `selectable` 树级开关
2. `defaultSelectedKeys` 默认单选
3. `selectedKeys` 受控单选与 `update:selectedKeys` / `select` 事件
4. 单选切换、替换与再次点击取消
5. `disabledKeys` / `unselectableKeys` 节点的单选边界
6. `aria-selected` 与选中高亮样式
7. switcher 点击不再触发 `node-click` / `select`
8. Tree 类型导出补齐 `TreeSelectEvent`

### 14.2 测试内容

| 编号 | 测试内容                  | 关注点                                                         | 预期结果                                                              |
| ---- | ------------------------- | -------------------------------------------------------------- | --------------------------------------------------------------------- |
| 1    | 默认无选中态              | 未传选中相关 props 时是否输出稳定初始状态                      | 可选节点输出 `aria-selected="false"`，内容区无选中高亮                |
| 2    | `defaultSelectedKeys`     | 默认单选是否只保留第一个合法且可选的 key                       | 非法 key、重复 key、`disabledKeys` 与 `unselectableKeys` 被自动过滤   |
| 3    | 单选事件顺序              | 点击内容区时事件链路是否稳定                                   | 顺序固定为 `node-click -> update:selectedKeys -> select`              |
| 4    | 再次点击取消              | 点击已选中节点时是否清空单选                                   | 第二次点击后 `selectedKeys = []`，`select.selected = false`           |
| 5    | 单选替换                  | 点击另一节点时是否替换旧选中项                                 | 新节点成为唯一选中项，旧节点退出选中态                                |
| 6    | 受控 `selectedKeys`       | 组件内部是否只请求外部更新且视图严格跟随 prop                  | 外部不回写时视图不变，回写后视图同步                                  |
| 7    | 节点级单选边界            | `disabledKeys` / `unselectableKeys` 内容区点击是否错误进入选中 | 允许保留 `node-click` 观察能力，但不触发 `update:selectedKeys/select` |
| 8    | 树级 `selectable = false` | 树级关闭单选能力时是否彻底禁用选中表现                         | 不输出 `aria-selected`，不渲染高亮，不触发单选事件                    |
| 9    | switcher 交互边界         | switcher 点击是否仍误触发阶段 3 的点击链路                     | 仅触发展开 / 收起链路，不再触发 `node-click` / `select`               |
| 10   | 类型与导出回归            | `TreeSelectEvent` 是否进入树模块与组件总入口导出               | `@falcon-ui/components/tree` 与 `@falcon-ui/components` 均可导出      |

### 14.3 当前测试结果

- 自动化测试文件：
  - `packages/components/tree/__test__/tree.test.ts`
- 已执行命令：
  - `pnpm exec eslint packages/components/tree/src/tree-types.ts packages/components/tree/src/tree.ts packages/components/tree/src/tree.vue packages/components/tree/src/tree-node.vue packages/components/tree/src/use-tree-selected-state.ts packages/components/tree/__test__/tree.test.ts play/src/views/components-view.vue`
  - `pnpm exec vitest run packages/components/__test__/install.test.ts packages/components/tree/__test__/tree.test.ts`
  - `pnpm exec vue-tsc -p tsconfig.build.json --noEmit`
  - `pnpm build:lib`
  - `pnpm --dir play build`
- 执行结果：
  - `eslint`：通过
  - 组合安装回归：`28 passed`
  - `vue-tsc`：通过
  - `build:lib`：通过
  - `play build`：通过
- 结论：
  - `selectable` / `defaultSelectedKeys` / `selectedKeys` 已接入
  - `update:selectedKeys` / `select` 已接入，事件对象类型统一命名为 `TreeSelectEvent`
  - `TreeSelectEvent.node` 与 `TreeSelectEvent.selectedNodes` 均返回事件层 `TreeNode`，其中 `selectedNodes` 最终定稿为 `TreeNode[]`，不返回原始 `TreeData[]`
  - 单选支持点击选中、点击其他节点替换、再次点击当前节点取消
  - `disabledKeys` / `unselectableKeys` 命中的节点不会进入选中态
  - 树级 `selectable = false` 时，不输出选中态与选中事件
  - `aria-selected` 与选中高亮样式已接入
  - switcher 点击已调整为只触发展开 / 收起，不再触发 `node-click` / `select`
  - 节点内容区 hover 已补充手型光标，保持单选交互提示一致
  - play 示例已补充默认选中、受控选中与 `select` 事件展示
  - `build:lib` 仍存在既有的 `dialog.vue` dynamic import warning，本阶段树组件改动未引入新的构建告警

### 14.4 功能归档

- 本阶段已完成的对外能力：
  - `selectable`
  - `defaultSelectedKeys`
  - `selectedKeys`
  - `update:selectedKeys`
  - `select(selectedKeys, event: TreeSelectEvent)`
- 本阶段已固定的运行时契约：
  - 只实现单选，不实现多选与 `checkable`
  - 点击内容区进入单选链路；点击当前已选中节点会取消选中
  - switcher 点击只处理展开 / 收起，不再参与 `node-click` / `select`
  - `selectedNodes` 返回 `TreeNode[]`，原始数据统一通过 `.data` 读取
  - `disabledKeys`、`unselectableKeys`、树级 `selectable = false` 均不会进入选中态
- 本阶段已完成的渲染与无障碍能力：
  - 可选节点输出 `aria-selected`
  - 选中态高亮作用于节点内容区
  - 节点 hover 使用手型光标强化可点击反馈
- 明确未进入本阶段的能力：
  - `multiple = true`
  - `checkable`、父子勾选联动、`checkStrictly`
  - 键盘选中与焦点管理增强

### 14.5 结果判定

- 当前判定：阶段 4 已完成。
- 下一阶段状态：阶段 4 已归档；阶段 5 结果见“阶段 5 测试文档”。

## 15. 阶段 5 测试文档

### 15.1 测试范围

阶段 5 只验证以下内容，不进入阶段 6 及以后：

1. `multiple = true` 的普通树多选能力
2. `defaultSelectedKeys` / `selectedKeys` 在多选模式下的受控与非受控行为
3. 多选模式下 `update:selectedKeys` / `select` 事件语义与顺序
4. `disabledKeys` / `unselectableKeys` / 树级 `selectable = false` 的多选边界
5. `switcher` 点击与多选链路的职责隔离
6. Playground 多选示例与事件展示

### 15.2 测试内容

| 编号 | 测试内容             | 关注点                                                               | 预期结果                                                                 |
| ---- | -------------------- | -------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| 1    | 默认多选归一化       | `multiple=true + defaultSelectedKeys` 是否保留全部合法可选 key       | 去重、过滤非法 key、过滤 `disabledKeys` / `unselectableKeys`，并保持顺序 |
| 2    | 非受控多选追加与取消 | 普通点击未选中节点是否追加；再次点击已选中节点是否只移除当前项       | 未选中节点追加到末尾；已选中节点仅移除自身，不清空其余选中项             |
| 3    | 受控多选请求更新     | 内部交互是否只发出下一组 `selectedKeys` 请求                         | 外部不回写时视图不变；回写后视图与外部值同步                             |
| 4    | 多选事件对象         | `select` 事件中的 `selectedKeys`、`event.key`、`event.selectedNodes` | 返回点击后的完整多选结果，顺序稳定                                       |
| 5    | 多选事件布尔语义     | `event.selected` 是否只表达当前点击节点最终是选中还是取消选中        | 选中时为 `true`，取消时为 `false`                                        |
| 6    | 多选边界             | 树级 `selectable=false`、`disabledKeys`、`unselectableKeys`          | 不触发选中状态变更，不输出错误的多选事件                                 |
| 7    | switcher 交互边界    | switcher 点击是否误入多选链路                                        | 仅触发展开 / 收起链路，不触发 `select`                                   |
| 8    | 单选回归稳定         | `multiple` 未传或为 `false` 时阶段 4 单选语义是否回退                | 单选替换、再次点击取消、事件顺序保持不变                                 |
| 9    | Playground 多选示例  | 默认多选、受控多选、清空 / 切换选中集合与事件日志是否可见            | 示例可直接演示多选追加 / 取消                                            |

### 15.3 当前测试结果

- 自动化测试文件：
  - `packages/components/tree/__test__/tree.test.ts`
- 已执行命令：
  - `pnpm exec eslint packages/components/tree/src/tree.ts packages/components/tree/src/use-tree-selected-state.ts packages/components/tree/src/tree.vue packages/components/tree/src/tree-node.vue packages/components/tree/__test__/tree.test.ts play/src/views/components-view.vue`
  - `pnpm exec vitest run packages/components/__test__/install.test.ts packages/components/tree/__test__/tree.test.ts`
  - `pnpm exec vue-tsc -p tsconfig.build.json --noEmit`
  - `pnpm build:lib`
  - `pnpm --dir play build`
- 执行结果：
  - `eslint`：通过
  - 组合安装回归：`33 passed`
  - `vue-tsc`：通过
  - `build:lib`：通过
  - `play build`：通过
- 结论：
  - `multiple` 已进入树公开契约，默认值为 `false`
  - 普通树多选已接入统一选中态模型，单选与多选共享同一套受控 / 非受控语义
  - 多选模式下默认选中、点击追加、再次点击移除当前项、受控请求更新均已通过验证
  - `select` 事件在多选模式下返回完整 `selectedKeys` 与 `selectedNodes`，`event.selected` 仅表示当前点击节点的最终状态
  - 树级 `selectable = false`、`disabledKeys`、`unselectableKeys` 在多选模式下仍不会进入选中态
  - switcher 点击继续只负责展开 / 收起，不参与多选链路
  - Playground 已补充默认多选、受控多选、清空 / 切换选中集合与事件日志示例
  - `build:lib` 仍存在既有的 `dialog.vue` dynamic import warning；`play build` 仍存在既有的 chunk size warning，本阶段树组件改动未引入新的构建失败

### 15.4 功能归档

- 本阶段已完成的对外能力：
  - `multiple`
  - `defaultSelectedKeys`
  - `selectedKeys`
  - `update:selectedKeys`
  - `select(selectedKeys, event: TreeSelectEvent)`
- 本阶段已固定的运行时契约：
  - 普通树默认单选；`multiple = true` 时启用普通树多选
  - 普通树多选通过内容区普通点击做增删，不引入 `ctrl` / `command` 组合键
  - 新选中 key 追加到末尾；点击已选中 key 时仅移除当前 key
  - 受控模式只读外部 `selectedKeys`；非受控模式只初始化一次 `defaultSelectedKeys`
  - `selectedNodes` 返回 `TreeNode[]`，原始数据统一通过 `.data` 读取
  - `disabledKeys`、`unselectableKeys`、树级 `selectable = false` 均不会进入选中态
- 明确未进入本阶段的能力：
  - `checkable`、父子勾选联动、`checkStrictly`
  - 键盘多选增强

### 15.5 结果判定

- 当前判定：阶段 5 已完成。
- 下一阶段状态：阶段 5 已归档；阶段 6 结果见“阶段 6 测试文档”。

## 16. 阶段 6 测试文档

### 16.1 测试范围

阶段 6 只验证以下内容，不进入阶段 7 及以后：

1. `checkable = true` 的复选框渲染与 `ElCheckbox` 接线
2. `defaultCheckedKeys` / `checkedKeys` 的受控与非受控显示
3. `checkStrictly = true` 下的严格独立勾选与 `update:checkedKeys` / `check` 事件
4. `checkStrictly !== true` 下的只渲染不交互分支
5. `disabledKeys` / `disabledCheckboxKeys` / `hiddenCheckboxKeys` / 树级 `selectable = false` 的阶段 6 边界
6. Playground 复选框示例与事件日志展示

### 16.2 测试内容

| 编号 | 测试内容            | 关注点                                                           | 预期结果                                                                        |
| ---- | ------------------- | ---------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| 1    | 复选框渲染          | `checkable=true` / `false` 下是否正确渲染 `ElCheckbox`           | 开启时渲染复选框并输出 `aria-checked`；关闭时完全不渲染                         |
| 2    | 默认勾选归一化      | `defaultCheckedKeys` 是否去重、过滤非法 key 与已不存在节点       | 合法 key 保留显示；`disabledKeys` / `disabledCheckboxKeys` 节点可保持已勾选视觉 |
| 3    | 严格独立勾选        | `checkStrictly=true` 时点击是否只增删当前节点                    | 未勾选节点追加到末尾；已勾选节点仅移除自身                                      |
| 4    | 严格勾选事件语义    | `update:checkedKeys -> check` 顺序与 `TreeCheckEvent` 载荷       | 事件顺序稳定；`checkedKeys` / `checkedNodes` 返回完整结果                       |
| 5    | 受控勾选            | 受控 `checkedKeys` 是否只请求外部更新                            | 外部未回写前视图不变；回写后视图与外部值同步                                    |
| 6    | 非严格渲染分支      | `checkStrictly !== true` 时用户点击是否被拦截                    | 复选框可见且显示勾选态，但不会触发 `update:checkedKeys` / `check`               |
| 7    | 禁用勾选边界        | `disabledKeys` / `disabledCheckboxKeys` 是否禁用复选框且阻止交互 | 复选框禁用；若 key 已在 `checkedKeys` 中则保留已勾选视觉                        |
| 8    | 事件链路隔离        | 复选框点击是否误触发 `node-click` / `select` / 展开收起事件      | 只进入勾选链路，不进入选择与展开链路                                            |
| 9    | 选择与勾选独立      | 树级 `selectable=false` 与 `hiddenCheckboxKeys` 的阶段 6 表现    | 内容区不进入选中态；勾选链路仍可工作；隐藏 checkbox 不阻断子孙节点              |
| 10   | Playground 阶段说明 | 默认示例、严格勾选、边界示例与日志展示是否可见                   | 示例可演示 render-only / strict / boundary，明确父子联动留在下一阶段            |

### 16.3 当前测试结果

- 自动化测试文件：
  - `packages/components/tree/__test__/tree.test.ts`
  - `packages/components/__test__/install.test.ts`
- 执行命令：
  - `pnpm exec eslint`
  - `pnpm exec vitest run packages/components/__test__/install.test.ts packages/components/tree/__test__/tree.test.ts`
  - `pnpm exec vue-tsc -p tsconfig.build.json --noEmit`
  - `pnpm build:lib`
  - `pnpm --dir play build`
- 执行结果：
  - `eslint`：通过
  - 组合安装与树组件回归：通过
  - `vue-tsc`：通过
  - `build:lib`：通过
  - `play build`：通过
- 结论：
  - `checkable`、`checkStrictly`、`defaultCheckedKeys`、`checkedKeys` 已进入树公开契约
  - 树节点复选框固定使用 `ElCheckbox` 渲染，并已接入主题样式导入
  - `checkStrictly = true` 已实现严格独立勾选；`checkStrictly !== true` 当前仅渲染复选框，不允许用户修改状态
  - `check` 事件返回完整 `checkedKeys` 与 `checkedNodes`，`event.checked` 仅表示当前点击节点在本次交互后的最终勾选状态
  - `disabledKeys`、`disabledCheckboxKeys` 命中的节点会禁用复选框，但若外部传入勾选 key 仍会保持已勾选视觉
  - 复选框点击不会误触发 `node-click`、`select`、`node-expand` 或 `node-collapse`
  - Playground 已补充 render-only / strict / boundary 示例、受控勾选按钮与 `check` 日志展示
  - `build:lib` 仍存在既有的 `dialog.vue` dynamic import warning；`play build` 仍存在既有的 chunk size warning，本阶段树组件改动未引入新的构建失败

### 16.4 功能归档

- 本阶段已完成的对外能力：
  - `checkable`
  - `checkStrictly`
  - `defaultCheckedKeys`
  - `checkedKeys`
  - `update:checkedKeys`
  - `check(checkedKeys, event: TreeCheckEvent)`
- 本阶段已固定的运行时契约：
  - `checkable = true` 时渲染 `ElCheckbox`；`checkable = false` 时整棵树不渲染复选框，也不输出 `aria-checked`
  - `checkStrictly = true` 时启用严格独立勾选：勾选未选中节点会追加到末尾；取消已勾选节点仅移除当前 key
  - `checkStrictly !== true` 时仅渲染复选框和勾选态，不允许用户点击修改状态
  - 受控模式只读外部 `checkedKeys`；非受控模式只初始化一次 `defaultCheckedKeys`，后续数据变化仅裁剪失效 key
  - `checkedKeys` 当前仅支持 `TreeKey[]`；不接收 `{ checked, halfChecked }` 对象形态
  - `disabledKeys`、`disabledCheckboxKeys` 命中的节点会禁用复选框，但不会从勾选结果中自动移除
  - 复选框点击只进入勾选链路；节点内容区仍保持阶段 4 / 5 的选择语义
- 明确未进入本阶段的能力：
  - `checkStrictly = false` 下的父子联动勾选
  - 半选态与 `{ checked, halfChecked }` 对象形态
  - 键盘勾选增强

### 16.5 结果判定

- 当前判定：阶段 6 已完成。
- 下一阶段状态：阶段 6 已归档；阶段 7-9 结果见“阶段 7-9 测试文档”。

## 17. 阶段 7-9 测试文档

### 17.1 测试范围

阶段 7-9 合并验证以下内容：

1. `checkStrictly = false` 的默认父子联动勾选
2. half-check 运行时计算、`aria-checked="mixed"` 与 `ElCheckbox.indeterminate`
3. `checkStrictly = true` 的 `{ checked, halfChecked }` 对象态
4. `update:checkedKeys` / `check` 在默认模式与 strict 模式下的值形态与事件语义
5. `disabledKeys` / `disabledCheckboxKeys` / `hiddenCheckboxKeys` 的联动边界
6. Playground 三组示例与事件日志同步

### 17.2 当前测试结果

- 自动化测试文件：
  - `packages/components/tree/__test__/tree.test.ts`
  - `packages/components/__test__/install.test.ts`
- 执行命令：
  - `pnpm exec eslint`
  - `pnpm exec vitest run packages/components/__test__/install.test.ts packages/components/tree/__test__/tree.test.ts`
  - `pnpm exec vue-tsc -p tsconfig.build.json --noEmit`
  - `pnpm build:lib`
  - `pnpm --dir play build`
- 执行结果：
  - `eslint`：通过
  - 组合安装与树组件回归：通过
  - `vue-tsc`：通过
  - `build:lib`：通过
  - `play build`：通过

### 17.3 结论

- 阶段 7 已完成：
  - `checkStrictly = false` 现在按默认联动模式工作
  - 点击父节点会向下传导；点击叶子节点会向上聚合
  - half-check 已进入运行时状态与事件结果
- 阶段 8 已完成：
  - `checkStrictly = true` 现在对齐 Ant Design / rc-tree 对象态契约
  - `checkedKeys` / `update:checkedKeys` / `check` 首参均支持 `{ checked, halfChecked }`
  - `defaultCheckedKeys` 仍只初始化 `checked`
- 阶段 9 已完成：
  - `disabledKeys` 成为勾选传导硬边界
  - `disabledCheckboxKeys` 仅禁用交互，不阻断联动
  - `hiddenCheckboxKeys` 会隐藏自身复选框，不进入勾选结果，但不阻断对子孙的联动
- 渲染与无障碍同步更新：
  - half-check 使用 `ElCheckbox` 的 `indeterminate`
  - 节点级 `aria-checked` 在 half-check 下输出 `mixed`
- Playground 已补充：
  - 默认联动勾选示例
  - strict 对象态示例
  - 禁用 / 隐藏复选框边界示例
- 既有构建告警维持不变：
  - `build:lib` 仍存在既有的 `dialog.vue` dynamic import warning
  - `play build` 仍存在既有的 chunk size warning

### 17.4 功能归档

- 当前固定的勾选契约：
  - `checkStrictly = false`：`checkedKeys` 使用数组，组件内部负责父子联动与 half-check
  - `checkStrictly = true`：`checkedKeys` 支持 `{ checked, halfChecked }`
  - `check` 事件统一返回 `TreeCheckEvent`，并新增 `halfCheckedKeys`
  - `disabledKeys` / `disabledCheckboxKeys` / `hiddenCheckboxKeys` 的边界已按阶段 9 收口
- 明确未进入本阶段的能力：
  - 键盘勾选增强
  - 异步加载场景下的专项勾选优化

### 17.5 结果判定

- 当前判定：阶段 7、阶段 8、阶段 9、阶段 10 已完成。
- 下一阶段状态：阶段 7-10 已归档；阶段 11 为下一阶段开发内容。

## 18. 阶段 10 回归修复文档：连线模式 + 复选框对齐

### 18.1 问题范围

本次回归只修复 `showLine = true` 且 `checkable = true` 时的视觉问题：

1. 展开 / 收缩图标、复选框与标题文本在同一节点行内垂直不对齐。
2. 叶子节点连线按固定节点高度绘制，遇到复选框或自定义内容撑高节点后出现断层。

### 18.2 根因

- `packages/theme/src/tree.scss` 中 `--fl-tree-node-content-height` 被同时用作最小行高与连线实际高度。
- `.fl-tree__item-content` 旧实现使用 `align-items: flex-start`，子元素只按自身高度对齐。
- `.fl-tree__switcher-leaf-line::before / ::after` 旧实现依赖固定
  `var(--fl-tree-node-content-height)` 计算竖线高度与横线中心点。
- 当 `ElCheckbox` 或节点内容让真实行高超过默认高度时，连线仍停留在固定高度，产生视觉断层。

### 18.3 实现方案

- 保留 `--fl-tree-node-content-height: var(--el-tree-node-content-height, 26px)`，
  但只将其作为节点最小行高 token。
- 将 `.fl-tree__item-content` 调整为 `align-items: stretch`，让 switcher、checkbox、
  title 共享真实节点行高。
- 让 `.fl-tree__switcher` 与 `.fl-tree__switcher-leaf-line` 使用 `align-self: stretch`，
  叶子连线占位跟随当前节点行高拉伸。
- 将叶子连线竖线从固定 `height: var(--fl-tree-node-content-height)` 改为
  `top: 0; bottom: 0`，横线中心从固定高度的一半改为 `top: 50%`。
- 最后一个叶子节点的竖线只绘制到当前真实行高的中线：`height: 50%; bottom: auto`。
- 本次不修改 `tree.vue` 状态逻辑，不扩展 `showLine` 对象形态，不进入后续阶段能力。

### 18.4 回归测试

- 自动化测试文件：
  - `packages/components/tree/__test__/tree.test.ts`
- 新增覆盖：
  - 样式源码回归：确认连线使用拉伸 / 百分比策略，且不再使用固定
    `--fl-tree-node-content-height` 作为实际连线高度。
  - 结构回归：`showLine + checkable` 同时开启时，branch 节点保留 switcher 与 checkbox，
    leaf 节点保留 `switcher-leaf-line` 与 checkbox，且 checkbox 点击不误触发
    `node-click` / `select` / `node-expand`。
- 已执行命令：
  - `pnpm exec vitest run packages/components/tree/__test__/tree.test.ts`
  - `pnpm build:lib:style`
  - `pnpm exec eslint packages/components/tree/src/tree-node.vue packages/components/tree/__test__/tree.test.ts`
- 执行结果：
  - 树组件单测：`49 passed`
  - `build:lib:style`：通过
  - 目标 ESLint：通过

### 18.5 视觉验收

- Playground 验证地址：`http://localhost:5173/components`
- 验证配置：
  - `showLine = true`
  - `checkable = true`
  - 默认展开树节点
- 验收结论：
  - 展开 / 收缩图标、复选框与文本在节点行内垂直居中。
  - 父子纵向连线与叶子末端横线连续，未观察到因复选框撑高导致的断层。

## 19. 阶段 12 测试文档：语义化 DOM 外壳样式定制

### 19.1 测试范围

阶段 12 只验证 `classNames` / `styles` 对 Tree 外壳结构的样式扩展能力：

1. `root` 挂点稳定作用于树根容器。
2. `item` 挂点稳定作用于节点条目外层。
3. 函数形式统一通过 `info.props` 读取当前 Tree props。
4. `itemIcon`、`itemCheckbox`、`itemTitle` 不再作为公开语义化 DOM 挂点。
5. 语义化样式不改变展开、选择、勾选和 default 插槽事件链路。

### 19.2 当前固定契约

- `TreeSemanticDOM = 'root' | 'item'`
- `root`：树根容器，对应 `role="tree"`。
- `item`：单个节点外层容器，对应 `role="treeitem"`。
- `classNames` 与 `styles` 支持对象形式和函数形式。
- 函数形式入参固定为 `{ props }`，不再使用 `componentProps` 作为公开契约。
- checkbox 仍由 Tree 内部控制交互，但不作为 `classNames` / `styles` 的公开语义化挂点。
- 节点内容区继续由 `default` 插槽接管。

### 19.3 测试内容

| 编号 | 测试内容             | 关注点                                     | 预期结果                                      |
| ---- | -------------------- | ------------------------------------------ | --------------------------------------------- |
| 1    | 对象形式 root / item | class 与 style 是否挂到正确外壳 DOM        | 根容器和节点外层分别拿到语义化 class / style  |
| 2    | item 内部样式变量    | `styles.item` 是否破坏 `--fl-tree-level`   | 内部层级变量仍以组件计算值为准                |
| 3    | 函数形式 props 入参  | 是否能通过 `info.props` 读取当前 props     | props 变化后语义化 class / style 重新计算     |
| 4    | 内部挂点移除         | `itemIcon/itemCheckbox/itemTitle` 是否失效 | 类型与运行时都不把三者作为公开语义化挂点消费  |
| 5    | 事件链路回归         | 语义化样式是否影响交互事件顺序             | `node-click/select/expand/check` 顺序保持不变 |
| 6    | Playground 可视化    | root / item 外壳样式是否可观察             | 示例可切换语义化样式且事件日志继续工作        |

### 19.4 当前测试结果

- 自动化测试文件：
  - `packages/components/tree/__test__/tree.test.ts`
- Playground 验证入口：
  - `play/src/views/components-view.vue`
- 已执行命令：
  - `pnpm exec vitest run packages/components/tree/__test__/tree.test.ts`
  - `pnpm exec eslint packages/components/tree/src/tree-types.ts packages/components/tree/src/tree.ts packages/components/tree/src/tree.vue packages/components/tree/src/tree-node.vue packages/components/tree/__test__/tree.test.ts play/src/views/components-view.vue`
  - `pnpm exec vue-tsc -p tsconfig.build.json --noEmit`
  - `pnpm --dir play build`
- 执行结果：
  - 树组件单测：`52 passed`
  - 目标 ESLint：通过
  - `vue-tsc`：通过
  - `play build`：通过
  - `play build` 仍存在既有 chunk size warning，本阶段未引入构建失败

### 19.5 当前判定

- 当前判定：阶段 12 已完成。
- 下一阶段状态：阶段 12 已归档；阶段 13 结果见“阶段 13 测试文档”。

## 20. 阶段 13 测试文档：树节点异步加载

### 20.1 测试范围

阶段 13 只验证异步加载链路，不进入拖拽、键盘导航、双击展开和滚动控制能力：

1. `loadData(node)` 用户展开触发。
2. `loadedKeys` 受控 / 非受控状态合并。
3. `update:loadedKeys` / `load` 事件契约。
4. 加载中 switcher icon 覆盖与重复请求保护。
5. 加载失败后的 loading 清理与可重试边界。
6. Playground 外部更新 `data` 的异步树示例。

### 20.2 当前固定契约

- `loadData?: (node: TreeNode) => Promise<unknown>`。
- `Promise<unknown>` 的 resolve 值不被组件消费；子节点必须由父组件更新 `data`。
- `loadedKeys` 为受控已加载 key 集合；非受控模式下组件内部维护加载完成结果。
- `load(loadedKeys, event)` 在加载成功后触发，`event.node` 返回当前加载节点。
- 用户点击展开时才触发异步加载；`defaultExpandAll`、`defaultExpandedKeys` 与外部
  `expandedKeys` 初始化 / 变更不自动调用 `loadData`。
- `isLeaf = true` 的节点永远不进入异步加载入口。
- 加载态默认渲染 Element Plus `Loading` 图标，传入 `switcherLoadingIcon` 时渲染自定义
  图标；`switcherLoadingIcon` 默认值为 Element Plus `Loading`，可省略但不接受
  `null`；加载态动画为 `rotating 2s linear infinite`。
- 加载失败时不写入 `loadedKeys`，不触发 `load`，节点保持可重试。

### 20.3 测试内容

| 编号 | 测试内容        | 关注点                                    | 预期结果                                         |
| ---- | --------------- | ----------------------------------------- | ------------------------------------------------ |
| 1    | 异步节点入口    | 无 children、非叶子、存在 `loadData`      | 渲染 switcher；用户展开时调用 `loadData`         |
| 2    | 叶子边界        | `isLeaf=true`                             | 不渲染异步 switcher，不调用 `loadData`           |
| 3    | 初始展开边界    | default / controlled 展开                 | 初始或外部展开变更不自动加载                     |
| 4    | 加载中状态      | pending Promise 与重复点击                | 显示 loading icon；不重复请求                    |
| 5    | 成功路径        | resolve 后事件和状态                      | `update:loadedKeys -> load`，loadedKeys 顺序稳定 |
| 6    | 受控路径        | 外部传入 `loadedKeys`                     | 只请求外部更新；外部回写后不再进入异步加载入口   |
| 7    | 失败路径        | rejected Promise                          | 清理 loading，不写入 loadedKeys，不触发 load     |
| 8    | 数据更新回归    | 父组件更新 `data` 后的新子节点            | 继续参与展开、选择、勾选、插槽、showLine 与样式  |
| 9    | Playground 示例 | 外部更新数据、loadedKeys 展示和 load 日志 | 可直接观察异步加载、受控 loadedKeys 与事件结果   |

### 20.4 当前测试结果

- 自动化测试文件：
  - `packages/components/tree/__test__/tree.test.ts`
- Playground 验证入口：
  - `play/src/views/components-view.vue`
- 已执行命令：
  - `pnpm exec eslint packages/components/tree/src/tree.ts packages/components/tree/src/use-tree-load.ts packages/components/tree/src/use-tree-expanded-state.ts packages/components/tree/src/tree.vue packages/components/tree/src/tree-node.vue packages/components/tree/__test__/tree.test.ts play/src/views/components-view.vue --max-warnings=0`
  - `pnpm exec vitest run packages/components/tree/__test__/tree.test.ts`
  - `pnpm exec vue-tsc -p tsconfig.build.json --noEmit`
  - `pnpm build:lib`
  - `pnpm --dir play build`
- 执行结果：
  - 目标 ESLint：通过
  - 树组件单测：`57 passed`
  - `vue-tsc`：通过
  - `build:lib`：通过
  - `play build`：通过
  - `build:lib` 仍存在既有 `dialog.vue` dynamic import warning
  - `play build` 仍存在既有 chunk size warning，本阶段未引入构建失败

### 20.5 当前判定

- 当前判定：阶段 13 已完成。
- 下一阶段状态：阶段 13 已归档；阶段 14 为树节点拖拽功能。

## 21. 阶段 14 测试文档：树节点拖拽功能

### 21.1 测试范围

阶段 14 验证单树内部拖拽、内部原地重排和 Element Plus 风格事件链路，不进入跨树拖拽、
键盘拖拽、双击展开和滚动控制能力：

1. `draggable` boolean 与 `allowDrag` 节点级拖拽源控制。
2. `allowDrop(draggingNode, dropNode, type)` 的 `prev | inner | next` 判断。
3. `node-drag-start`、`node-drag-enter`、`node-drag-over`、`node-drag-leave`、
   `node-drag-end`、`node-drop` 事件。
4. `dropType = before | after | inner | none` 的落点语义。
5. 合法投放后内部原地重排 `data` / children 数组。
6. 自身、后代和相邻 no-op 投放的禁止边界。
7. 拖拽链路与点击、选择、勾选、展开、异步加载、连线和 default 插槽的隔离。
8. Playground 拖拽开关、`allowDrag` / `allowDrop` 示例和事件日志展示。

### 21.2 当前固定契约

- `draggable = false` 为默认值，关闭时节点不设置原生 `draggable` 属性。
- `draggable = true` 时所有节点均可作为拖拽源。
- `allowDrag(node)` 返回 `false` 时阻止当前节点进入拖拽态。
- `allowDrop(draggingNode, dropNode, type)` 返回 `false` 时禁止对应落点。
- `dropType` 固定为：
  - `before`：投放到目标节点前方
  - `inner`：投放到目标节点内部
  - `after`：投放到目标节点后方
  - `none`：未发生合法投放
- 合法投放后组件先原地重排 `data` / children 数组，再触发 `node-drag-end` 和 `node-drop`。
- 组件内置拒绝投放到拖拽源自身、自身后代和不会产生顺序变化的相邻落点。
- `node-drop` 只在 `dropType !== 'none'` 时触发。

### 21.3 当前测试结果

- 自动化测试文件：
  - `packages/components/tree/__test__/tree.test.ts`
- Playground 验证入口：
  - `play/src/views/components-view.vue`
- 当前已执行命令：
  - `pnpm exec eslint play/src/views/components-view.vue packages/components/tree/src/tree.ts packages/components/tree/src/tree.vue packages/components/tree/src/tree-node.vue packages/components/tree/src/use-tree-drag.ts packages/components/tree/__test__/tree.test.ts --max-warnings=0`
  - `pnpm exec vitest run packages/components/tree/__test__/tree.test.ts`
  - `pnpm exec vue-tsc -p tsconfig.build.json --noEmit`
  - `pnpm build:lib:style`
  - `pnpm build:lib`
  - `pnpm --dir play build`
- 当前执行结果：
  - 目标 ESLint：通过
  - 树组件单测：`64 passed`
  - `vue-tsc`：通过
  - `build:lib:style`：通过
  - `build:lib`：通过
  - `play build`：通过
  - `build:lib` 仍存在既有 `dialog.vue` dynamic import warning
  - `play build` 仍存在既有 chunk size warning，本阶段未引入构建失败

### 21.4 当前判定

- 当前判定：阶段 14 已完成。
- 下一阶段状态：阶段 14 已归档；阶段 15 为树键盘导航与无障碍功能。

## 22. 阶段 15 规划文档：树键盘导航与无障碍功能

### 22.1 阶段目标

阶段 15 的目标是让 `FlTree` 在不依赖鼠标的情况下可浏览、可展开、可选择、可勾选，并让
屏幕阅读器能理解树、节点、展开态、选中态、勾选态、禁用态与当前活动节点。

本阶段不是新增业务形态，而是补齐 Tree 作为基础交互组件必须具备的键盘与无障碍契约。后续
双击展开和滚动控制都应复用本阶段建立的 `focusedKey`、可见节点顺序和活动节点语义。

### 22.2 使用场景与作用

| 场景           | 典型用法                                     | 阶段 15 的作用                                                              |
| -------------- | -------------------------------------------- | --------------------------------------------------------------------------- |
| 键盘用户浏览树 | 设置中心、组织架构、分类树中只用键盘查看层级 | `Up / Down` 在当前可见节点间移动焦点；`Left / Right` 折叠、展开或进入子节点 |
| 权限勾选树     | 角色权限、菜单权限、资源授权树               | `Space` 可切换当前节点勾选；半选、已选、未选通过 `aria-checked` 被读屏识别  |
| 层级资源树     | 文件管理器、知识库导航、配置分类             | 方向键语义接近层级导航预期，为阶段 16 双击展开做基础                        |
| 异步加载树     | 远程组织节点、按需加载分类、懒加载资源树     | 键盘展开异步节点时复用阶段 13 的 `loadData`，加载中焦点不丢失               |
| 禁用节点树     | 部分节点不可选、不可勾选或不可展开           | 禁用节点仍可被读屏感知，但不会触发被禁止的选择、勾选或展开行为              |
| 自定义内容树   | `default` 插槽渲染复杂标题、标签、状态徽标   | 焦点与键盘事件仍由 Tree 外壳接管，不要求业务插槽自己实现可访问交互          |

### 22.3 本阶段要做的事情

1. 增加 `use-tree-keyboard.ts`
   - 维护内部 `focusedKey`，并把它作为焦点状态唯一事实来源。
   - 基于当前展开态递归生成真实可见节点序列，不直接使用 `treeIndex.visibleNodeKeys`
     全量索引作为键盘导航顺序。
   - 基于真实可见节点序列计算当前节点、上一个可见节点、下一个可见节点、
     父节点和第一个可见子节点。
   - 在 `data`、展开状态或异步加载结果变化后，如果 `focusedKey` 已不可见，回退到可见祖先
     或第一条可见节点。

2. 建立 Tree 根节点键盘入口
   - 根容器增加 `tabindex="0"`，让整棵树可以通过 Tab 进入。
   - 根容器监听 `keydown`，统一处理方向键、`Enter`、`Space`。
   - 根容器通过 `aria-activedescendant` 指向当前 `focusedKey` 对应的 treeitem。

3. 建立节点活动态 DOM 契约
   - 每个 `role="treeitem"` 输出稳定 `id`，供 `aria-activedescendant` 引用。
   - 当前活动节点输出焦点态 class，并用背景色提供键盘切换反馈，不额外渲染 outline。
   - 节点输出 `aria-disabled`，让禁用态可被辅助技术识别。

4. 实现键盘导航规则
   - `Down`：移动到下一个可见节点。
   - `Up`：移动到上一个可见节点。
   - `Right`：当前节点可展开且未展开时展开；已展开时移动到第一个可见子节点。
   - `Left`：当前节点已展开时收起；未展开或叶子节点时移动到父节点。
   - `Enter`：复用节点内容点击语义，触发 `node-click` 与选择链路。
   - `Space`：当 `checkable = true` 时走勾选链路且不回退选择；
     `checkable = false` 时复用选择链路。

5. 衔接既有交互
   - 鼠标点击节点内容、switcher、checkbox 时同步更新 `focusedKey`。
   - 键盘展开时继续复用阶段 2 / 3 的展开事件顺序。
   - 键盘展开异步节点时继续进入阶段 13 的加载链路。
   - 键盘勾选时继续复用阶段 7-9 的联动、半选和禁用边界。
   - 拖拽态不改变键盘焦点模型，本阶段不做键盘拖拽。

6. 补充样式
   - 禁用树根容器与活动节点内容区的 outline，避免方向键切换时出现边框跳动。
   - 活动节点使用 hover 背景色作为视觉反馈，不使用 border / outline。
   - 焦点状态 class 需要兼容 selected、hover、disabled、drop target、showLine、checkable。
   - 不改变现有 hover、selected、checked、dragging 的优先级语义。

### 22.4 本阶段不做的事情

- 不实现键盘拖拽；阶段 14 只覆盖鼠标拖拽，本阶段只保证拖拽与键盘焦点互不污染。
- 不新增 `Home / End / PageUp / PageDown / *` 等扩展快捷键。
- 不做搜索输入、首字母跳转或 typeahead。
- 不实现独立 `scrollTo` API；滚动控制留到阶段 17。
- 不改变 `classNames` / `styles` 的公开语义挂点。

### 22.5 事件与类型注意事项

- 键盘触发选择或勾选时，事件对象需要允许 `KeyboardEvent`。
- 若沿用既有事件结构，`TreeSelectEvent.event` 与 `TreeCheckEvent.event` 需要从
  `MouseEvent` 扩展为 `MouseEvent | KeyboardEvent`。
- `node-click` 由键盘 `Enter` 触发时，也应传出当前键盘事件，保证业务侧可以区分来源。
- 所有事件顺序应尽量复用鼠标链路，避免出现键盘和鼠标两套行为结果。

### 22.6 验收测试范围

| 编号 | 测试内容        | 关注点                                     | 预期结果                                                 |
| ---- | --------------- | ------------------------------------------ | -------------------------------------------------------- |
| 1    | 根容器可聚焦    | `tabindex` 与 `aria-activedescendant`      | Tab 进入树后存在稳定活动节点                             |
| 2    | 上下导航        | `Up / Down` 与 `visibleNodeKeys`           | 只在当前可见节点间移动，不进入已收起子树                 |
| 3    | 左右展开收起    | `Left / Right` 与展开链路                  | 可展开节点按预期展开、收起、移动到父子节点               |
| 4    | 键盘选择        | `Enter` 与 selectable / disabled 边界      | 事件顺序和鼠标点击一致，禁用节点不进入选中态             |
| 5    | 键盘勾选        | `Space` 与 checkable / half-check          | 勾选传导、半选、禁用边界与鼠标勾选一致                   |
| 6    | 异步节点        | 键盘展开未加载节点                         | 触发 `loadData`，加载中焦点保持在当前节点                |
| 7    | ARIA 状态       | expanded / selected / checked / disabled   | 屏幕阅读器可读取当前节点关键状态                         |
| 8    | 样式回归        | focus / hover / selected / showLine / drag | 上下切换有背景反馈，不出现 outline，且不破坏既有视觉状态 |
| 9    | 插槽回归        | default 插槽复杂内容                       | 键盘事件仍由 Tree 控制，插槽无需额外实现键盘逻辑         |
| 10   | Playground 示例 | 可视化键盘操作与事件日志                   | 示例能直接演示方向键、Enter、Space 和当前活动节点        |

### 22.7 Playground 建议

- 增加“键盘导航与无障碍”示例区。
- 示例默认包含：
  - 普通可选择树
  - `checkable` 权限树
  - 包含 disabledKeys / disabledCheckboxKeys / hiddenCheckboxKeys / half-check 的边界树
  - 一个异步加载节点
- 页面不展示内部 `focusedKey`；通过焦点样式、ARIA 关系和最近事件日志观察结果。
- 示例文案只说明验证入口，不在组件 UI 内写快捷键教学内容。

### 22.8 结果判定标准

- `FlTree` 可通过键盘完成基础浏览、展开、收起、选择和勾选。
- 当前活动节点由 `focusedKey` 驱动，不能通过 DOM 查询反推组件状态。
- 现有点击、勾选、展开、异步加载、拖拽、showLine、语义化样式能力不回退。
- 自动化测试、类型检查、样式构建和 Playground 构建均通过后，阶段 15 才能标记完成。

### 22.9 当前固定契约

- `focusedKey` 为内部状态，不新增公开 prop、emit 或 expose。
- 树根容器默认输出 `tabindex="0"`，外部显式传入 `tabindex` 时保留外部值。
- 树根容器通过 `aria-activedescendant` 指向当前活动 `treeitem`。
- 每个节点输出稳定 `id`；节点 key 的类型会参与 id 生成，避免 `1` 与 `'1'` 冲突。
- `disabledKeys` 命中的节点输出 `aria-disabled="true"`。
- switcher button 与 checkbox 从 Tab 顺序中移除，树保持单一 Tab 入口。
- `Enter` 复用节点内容点击语义，键盘触发时 `node-click` 的 component 参数为 `null`。
- `Space` 在 `checkable = true` 时只尝试勾选；节点不可勾选时不回退为选择。
- `Space` 在 `checkable = false` 时复用节点内容点击 / 选择语义。
- `TreeInteractionEvent = MouseEvent | KeyboardEvent`，用于统一选择、勾选和点击事件。

### 22.10 当前测试结果

- 自动化测试文件：
  - `packages/components/tree/__test__/tree.test.ts`
- Playground 验证入口：
  - `play/src/views/components-view.vue`
- 当前已执行命令：
  - `pnpm exec eslint packages/components/tree/src/tree.ts packages/components/tree/src/tree.vue packages/components/tree/src/tree-node.vue packages/components/tree/src/use-tree-keyboard.ts packages/components/tree/src/use-tree-selected-state.ts packages/components/tree/src/use-tree-checked-state.ts packages/components/tree/__test__/tree.test.ts play/src/views/components-view.vue --max-warnings=0`
  - `pnpm exec vitest run packages/components/tree/__test__/tree.test.ts`
  - `pnpm exec vue-tsc -p tsconfig.build.json --noEmit`
  - `pnpm build:lib:style`
  - `pnpm build:lib`
  - `pnpm --dir play build`
- 当前执行结果：
  - 目标 ESLint：通过
  - 树组件单测：`71 passed`
  - `vue-tsc`：通过
  - `build:lib:style`：通过
  - `build:lib`：通过
  - `play build`：通过
  - `build:lib` 仍存在既有 `dialog.vue` dynamic import warning
  - `play build` 仍存在既有 chunk size warning，本阶段未引入构建失败

### 22.11 当前判定

- 当前判定：阶段 15 已完成。
- 下一阶段状态：阶段 15 已归档；阶段 16 为树节点双击展开功能。

## 23. 阶段 16 测试文档：树节点双击展开功能

### 23.1 阶段目标

阶段 16 补齐节点内容区双击展开 / 收起能力，让普通树在不新增目录树模式的前提下支持
常见资源树交互。双击能力必须复用现有展开、异步加载、焦点和事件链路，不引入新的状态模型。

### 23.2 本阶段要做的事情

1. 在节点内容区接入 `dblclick` 事件。
2. 新增 `dblclick(data, node, component, event)` emit，参数形态对齐 `node-click`。
3. 双击可展开、非加载中的非叶子节点时，复用 `toggleNodeExpansion` 切换展开状态。
4. 双击展开未加载异步节点时，继续触发阶段 13 的 `loadData`。
5. 双击时同步当前 `focusedKey`，让阶段 15 的活动节点语义保持一致。
6. 节点单击处理忽略 `MouseEvent.detail > 1`，避免双击导致选中态切换两次。
7. switcher 与 checkbox 阻止 `dblclick` 冒泡，保持职责边界。

### 23.3 本阶段不做的事情

- 不新增 `directory`、`expandAction` 或目录树快捷键多选。
- 不改变单击选择、switcher 点击、checkbox 勾选、拖拽和键盘事件职责。
- 不让 `dblclick` 事件替代 `node-expand` / `node-collapse` / `expand`。

### 23.4 验收测试范围

| 编号 | 测试内容        | 关注点                                 | 预期结果                                    |
| ---- | --------------- | -------------------------------------- | ------------------------------------------- |
| 1    | 双击事件参数    | `dblclick` 多参数出参                  | 返回 data、node、component、MouseEvent      |
| 2    | 双击展开链路    | 事件顺序与展开状态                     | `dblclick -> update:expandedKeys -> expand` |
| 3    | 异步节点        | 未加载节点双击展开                     | 触发 `loadData`，加载中不重复切换           |
| 4    | 叶子边界        | 叶子节点双击                           | 只触发 `dblclick`，不触发展开               |
| 5    | 单击选择隔离    | 双击产生的第二次 click                 | 不会把选中态切换两次                        |
| 6    | 内部控件隔离    | switcher / checkbox 双击               | 不冒泡到节点内容区，不误触发双击展开        |
| 7    | Playground 示例 | 普通树与异步树双击事件、展开和日志展示 | 可直接观察双击展开、异步加载与事件计数      |

### 23.5 当前固定契约

- `dblclick` 对所有节点内容区触发；展开切换只对可展开且非加载中节点生效。
- `dblclick` 的 `event` 固定为 `MouseEvent`。
- 双击展开复用原展开链路，最终展开结果仍以 `expandedKeys` / `node-expand` /
  `node-collapse` / `expand` 观察。
- 双击不新增公开 prop，不改变既有受控展开优先级。

### 23.6 当前测试结果

- 自动化测试文件：
  - `packages/components/tree/__test__/tree.test.ts`
- Playground 验证入口：
  - `play/src/views/components-view.vue`
- 当前已执行命令：
  - `pnpm exec eslint packages/components/tree/src/tree.ts packages/components/tree/src/tree.vue packages/components/tree/src/tree-node.vue packages/components/tree/src/use-tree-scroll.ts packages/components/tree/__test__/tree.test.ts play/src/views/components-view.vue --max-warnings=0`
  - `pnpm exec vitest run packages/components/tree/__test__/tree.test.ts`
  - `pnpm exec vue-tsc -p tsconfig.build.json --noEmit`
  - `pnpm build:lib`
  - `pnpm --dir play build`
- 当前执行结果：
  - 目标 ESLint：通过
  - 树组件单测：`77 passed`
  - `vue-tsc`：通过
  - `build:lib`：通过
  - `play build`：通过
  - `build:lib` 仍存在既有 `dialog.vue` dynamic import warning
  - `play build` 仍存在既有 chunk size warning，本阶段未引入构建失败

### 23.7 当前判定

- 当前判定：阶段 16 已完成。
- 下一阶段状态：阶段 16 已归档；阶段 17 为树滚动控制能力。

## 24. 阶段 17 测试文档：树滚动控制能力

### 24.1 阶段目标

阶段 17 暴露 `scrollTo` 方法，用于定位当前已渲染且可见的节点。滚动控制只负责定位，不展开
折叠祖先、不触发异步加载、不切换渲染策略，也不要求 `FlTree` 或使用方设置固定高度。

### 24.2 本阶段要做的事情

1. 新增 `use-tree-scroll.ts`，维护 `key -> HTMLElement` 的节点内容区元素注册表。
2. TreeNode 挂载时注册内容区元素，卸载时注销；折叠子树节点因此自动不可滚动。
3. `scrollTo` 根据目标节点查找最近可滚动祖先；找不到局部滚动祖先时回退页面滚动容器。
4. 支持 `align = 'top' | 'bottom' | 'auto'` 与 `offset`。
5. 暴露 `TreeExpose.scrollTo(options)`，并导出 `TreeScrollAlign` / `TreeScrollToOptions`。
6. Playground 增加普通树和异步树 scrollTo 按钮，演示布局不作为组件高度契约。

### 24.3 本阶段不做的事情

- 不提供虚拟滚动或虚拟树。
- 不主动展开折叠祖先，不触发 `loadData`。
- 不内置平滑滚动。
- 不把 Tree 根节点固定定义为滚动容器，不要求组件设置 `height`、`max-height` 或
  `overflow`。

### 24.4 验收测试范围

| 编号 | 测试内容        | 关注点                             | 预期结果                                        |
| ---- | --------------- | ---------------------------------- | ----------------------------------------------- |
| 1    | expose 契约     | `scrollTo` 是否可通过组件 ref 调用 | 对外实例存在 `scrollTo`                         |
| 2    | 最近滚动祖先    | Tree 外层存在滚动容器              | 使用最近可滚动祖先计算 `scrollTop`              |
| 3    | 页面回退        | 无局部滚动祖先                     | 回退 `document.scrollingElement` / 页面滚动容器 |
| 4    | 对齐方式        | `top` / `bottom` / `auto`          | 按目标位置和 `offset` 计算滚动距离              |
| 5    | 折叠子树 no-op  | 目标节点未渲染                     | 不改变滚动位置                                  |
| 6    | 非法 / 移除 key | key 不存在或已从数据中移除         | 不改变滚动位置                                  |
| 7    | 展开后定位      | 节点重新渲染后注册 DOM             | 使用最新可见节点元素执行定位                    |
| 8    | Playground 示例 | 普通树、异步树和 no-op 按钮        | 可观察 scrollTo 调用且不依赖固定树高度          |

### 24.5 当前固定契约

- `scrollTo` 只定位当前已渲染且可见的节点。
- `align` 默认值为 `auto`，`offset` 默认值为 `0`。
- 非法 key、折叠子树、异步未加载节点和已移除节点全部 no-op。
- 组件不新增滚动相关 prop，不修改展开、选择、勾选、拖拽和键盘状态。

### 24.6 当前测试结果

- 自动化测试文件：
  - `packages/components/tree/__test__/tree.test.ts`
- Playground 验证入口：
  - `play/src/views/components-view.vue`
- 浏览器验证结果：
  - 已在 Chrome 中验证 `Scroll Playground` 使用 `align="top"` 与默认 `offset=0` 后，
    目标节点 `Playground` 进入客户区顶部，上一节点底部对齐客户区顶部。
- 当前已执行命令：
  - `pnpm exec eslint packages/components/tree/src/tree.ts packages/components/tree/src/tree.vue packages/components/tree/src/tree-node.vue packages/components/tree/src/use-tree-scroll.ts packages/components/tree/__test__/tree.test.ts play/src/views/components-view.vue --max-warnings=0`
  - `pnpm exec vitest run packages/components/tree/__test__/tree.test.ts`
  - `pnpm exec vue-tsc -p tsconfig.build.json --noEmit`
  - `pnpm build:lib`
  - `pnpm --dir play build`
- 当前执行结果：
  - 目标 ESLint：通过
  - 树组件单测：`77 passed`
  - `vue-tsc`：通过
  - `build:lib`：通过
  - `play build`：通过
  - `build:lib` 仍存在既有 `dialog.vue` dynamic import warning
  - `play build` 仍存在既有 chunk size warning，本阶段未引入构建失败

### 24.7 当前判定

- 当前判定：阶段 17 已完成。
- 下一阶段状态：阶段 17 已归档；阶段 18 为文档示例与单元测试补全。

## 25. 阶段 18 测试文档：文档示例与单元测试补全

### 25.1 阶段目标

阶段 18 收口 `FlTree` 的公开文档、按能力场景组织的 VitePress 示例、API 元数据入口和阶段末
单测缺口。文档示例使用准确的能力名称；相同目标的能力合并到同一个示例，避免重复展示相同
交互。

### 25.2 本阶段完成内容

1. 新增 `docs/components/tree.md`，接入 `FlTree` 文档页和 API 表格。
2. 新增 `docs/examples/tree/` 示例目录，按能力场景组织示例：
   - 基础用法：`basic.vue`
   - 默认展开与受控展开：`expand.vue`
   - 默认选中、单选/多选与右键事件：`selection.vue`
   - 复选框与勾选联动：`checkable.vue`
   - 禁用、不可选与复选框边界：`disabled.vue`
   - 连线、自定义内容与切换图标：`line-content.vue`
   - 语义化样式：`semantic-style.vue`
   - 异步加载：`async.vue`
   - 节点拖拽：`drag.vue`
   - 键盘导航与无障碍：`keyboard-a11y.vue`
   - 双击展开、筛选高亮与滚动定位：`dblclick-scroll.vue`
3. 文档侧接入 `FlTree`：
   - VitePress sidebar 增加 `/components/tree`
   - 组件总览增加 `FlTree`
   - 新增 `docs/public/overview/fl-tree.svg`
   - `scripts/docs/generate-api-meta.mjs` 增加 `fl-tree`
   - 生成 `docs/public/api-meta/fl-tree.json`
4. 补齐 PRD 首版验收中未完全落地的公开契约：
   - `showLine` 支持 `boolean | { showLeafIcon?: boolean }`
   - `filterTreeNode(node)` 只添加过滤命中态，不自动展开、不滚动、不改状态
   - `right-click` 事件对齐节点事件多参数出参，不触发选择、勾选或展开链路
5. 补充类型导出：
   - `TreeShowLine`
   - `TreeShowLineOptions`
   - `TreeFilterTreeNode`
   - `TreeNodeRightClickArgs`

### 25.3 本阶段补充测试

新增或补齐以下单测：

1. `showLine` 对象形态和 `showLeafIcon = false` 时叶子连线结构稳定。
2. `filterTreeNode` 命中态 class、props 更新和不自动展开行为。
3. `right-click` 事件参数、事件隔离和焦点同步。
4. 新增 Tree 类型在 `@falcon-ui/components/tree` 与 `@falcon-ui/components` 中可导出。

### 25.4 当前测试结果

- 自动化测试文件：
  - `packages/components/tree/__test__/tree.test.ts`
- 文档验证入口：
  - `docs/components/tree.md`
- 当前已执行命令：
  - `pnpm exec vitest run packages/components/tree/__test__/tree.test.ts`
  - `pnpm exec eslint packages/components/tree/src/tree-types.ts packages/components/tree/src/tree.ts packages/components/tree/src/tree.vue packages/components/tree/src/tree-node.vue packages/components/tree/__test__/tree.test.ts packages/components/tree/index.ts packages/components/index.ts docs/examples/tree/*.vue docs/.vitepress/config.ts docs/.vitepress/data/overview-components.ts scripts/docs/generate-api-meta.mjs --max-warnings=0`
  - `pnpm docs:api`
  - `pnpm exec vue-tsc -p tsconfig.build.json --noEmit`
  - `pnpm docs:build`
- 当前执行结果：
  - 树组件单测：`80 passed`
  - 目标 ESLint：通过
  - `docs:api`：通过，已生成 `fl-tree.json`
  - `vue-tsc`：通过
  - `docs:build`：通过
  - `docs:build` 仍存在既有 `dialog.vue` dynamic import warning、chunk size warning 和 Sass legacy JS API warning，本阶段未引入构建失败

### 25.5 当前判定

- 当前判定：阶段 18 已完成。
- 下一阶段状态：阶段 18 已归档；阶段 19 为质量门禁。

## 26. 阶段 19 测试文档：质量门禁

### 26.1 阶段目标

阶段 19 对 `FlTree` 阶段 1-18 的实现、测试、文档和构建链路执行完整质量门禁，确保组件、
文档示例、类型导出、样式构建和 Playground 构建均可稳定通过。

### 26.2 门禁命令

阶段 19 固定执行以下命令：

1. `pnpm lint`
2. `pnpm test`
3. `pnpm format:check`
4. `pnpm exec vue-tsc -p tsconfig.build.json --noEmit`
5. `pnpm build:lib:style`
6. `pnpm build:lib`
7. `pnpm docs:check`
8. `pnpm play:build`

### 26.3 当前执行结果

- 当前执行结果：
  - `pnpm lint`：通过
  - `pnpm test`：通过
  - `pnpm format:check`：通过
  - `pnpm exec vue-tsc -p tsconfig.build.json --noEmit`：通过
  - `pnpm build:lib:style`：通过
  - `pnpm build:lib`：通过
  - `pnpm docs:check`：通过
  - `pnpm play:build`：通过
- 已知非阻塞告警：
  - `dialog.vue` dynamic import warning 为既有构建告警
  - chunk size warning 为既有构建告警
  - Sass legacy JS API deprecation warning 来自当前构建链路依赖
  - `play:build` 的 `npm link` 仍提示 1 个 moderate npm audit warning，命令退出码为 0

### 26.4 当前判定

- 当前判定：阶段 19 已完成。
- `FlTree` 阶段 1-19 已全部归档。

## 27. 阶段 20 测试文档：节点交互状态契约修正

### 27.1 阶段目标

阶段 20 按破坏式契约修正 `FlTree` 节点交互状态来源：`TreeData` 只承载业务数据与树结构，
禁用、不可选、禁用 checkbox、隐藏 checkbox 全部改由 key-based props 声明。

### 27.2 本阶段完成内容

1. `TreeData` 移除 `disabled`、`selectable`、`disableCheckbox`、`checkable` 主契约字段。
2. `TreeNodeProps` 移除 `disabled` 字段映射。
3. 新增公开 props：
   - `disabledKeys`
   - `unselectableKeys`
   - `disabledCheckboxKeys`
   - `hiddenCheckboxKeys`
4. 运行时节点状态改为从 key-based props 派生：
   - `disabled`
   - `selectable`
   - `checkboxDisabled`
   - `checkboxVisible`
5. Playground 与 VitePress 示例均改为纯业务数据，不再在节点数据中写组件交互状态。

### 27.3 行为判定

- `disabledKeys`：节点整体禁用，不可选中，checkbox 禁用，输出 disabled 样式与 ARIA，
  并作为勾选联动硬边界。
- `unselectableKeys`：节点正常展示和交互，但不进入 `selectedKeys`，不触发 `select`。
- `disabledCheckboxKeys`：仅禁用当前节点 checkbox 交互，不阻断父子联动。
- `hiddenCheckboxKeys`：不渲染当前节点 checkbox，不阻断子孙节点勾选。
- `TreeData` 中即使存在旧交互字段，也不再产生组件行为。

### 27.4 当前测试结果

- 自动化测试文件：
  - `packages/components/tree/__test__/tree.test.ts`
- 当前已执行命令：
  - `pnpm exec vitest run packages/components/tree/__test__/tree.test.ts`
- 当前执行结果：
  - 树组件单测：通过，`81 passed`

### 27.5 当前判定

- 当前判定：阶段 20 已完成。

## 28. 阶段 21 测试文档：树节点手风琴展开模式

### 28.1 阶段目标

阶段 21 新增 `accordion` 展开模式开关，用于支持同一层级、同一父节点下只能展开一个
可展开节点的业务场景。该能力基于内部 `parentKey` 索引判断同级关系，不新增公开
`parentKey` 属性。

### 28.2 本阶段完成内容

1. 新增公开 prop：`accordion`，默认值为 `false`。
2. `accordion = true` 时，展开任一节点会收起同一 `parentKey` 分组下其他已展开节点。
3. `defaultExpandedKeys`、`defaultExpandAll`、受控 `expandedKeys` 和用户交互产生的展开 key
   都需要经过手风琴归一化。
4. 同一同级组出现多个展开 key 时，保留输入顺序中最后出现的 key。
5. `autoExpandParent` 与 `defaultExpandParent` 仍作为既有祖先补齐属性，不绕过手风琴约束。
6. `docs/examples/tree/accordion.vue` 增加独立“手风琴展开”示例，并在 Tree 文档页单独接入。

### 28.3 本阶段不做的事情

- 不新增公开 `parentKey`、节点路径或层级 prop。
- 不改变选择、勾选、拖拽、滚动和节点渲染契约。
- 不为被手风琴模式自动收起的同级节点额外派发独立 `node-collapse` 事件。

### 28.4 验收测试范围

| 编号 | 测试内容              | 关注点                                 | 预期结果                                 |
| ---- | --------------------- | -------------------------------------- | ---------------------------------------- |
| 1    | 非受控交互            | 同级节点依次展开                       | 后展开节点保持展开，原同级节点收起       |
| 2    | 受控事件              | `expandedKeys` 受控时点击同级节点      | `update:expandedKeys` 输出归一化后的结果 |
| 3    | `defaultExpandAll`    | 初始化展开全部节点                     | 每个同级组只保留最后一个展开节点         |
| 4    | `defaultExpandParent` | 默认展开子节点时祖先补齐               | 祖先补齐结果仍受手风琴约束               |
| 5    | `autoExpandParent`    | 受控子节点 key 带动祖先展开            | 祖先补齐结果不绕过手风琴约束             |
| 6    | 交互入口回归          | switcher、双击展开、键盘展开、异步展开 | 均复用同一展开状态归一化链路             |

### 28.5 当前固定契约

- `accordion` 为树级 boolean prop，默认 `false`。
- 同级关系由内部 `parentKeyMap` 判断；根节点的 `parentKey` 统一视为 `null`。
- `accordion` 只约束展开状态，不影响选择、勾选、拖拽、滚动和自定义渲染。
- 受控模式下组件仍不持久化最终展开结果，只通过 `update:expandedKeys` 请求外部同步归一化后
  的展开 key 集合。

### 28.6 当前测试结果

- 自动化测试文件：
  - `packages/components/tree/__test__/tree.test.ts`
- 当前已执行命令：
  - `pnpm exec vitest run packages/components/tree/__test__/tree.test.ts`
  - `pnpm exec eslint packages/components/tree/src/tree.ts packages/components/tree/src/use-tree-expanded-state.ts packages/components/tree/__test__/tree.test.ts scripts/docs/generate-api-meta.mjs --max-warnings=0`
  - `pnpm docs:api`
  - `pnpm exec vue-tsc -p tsconfig.build.json --noEmit`
  - `pnpm exec eslint docs/examples/tree/expand.vue docs/examples/tree/accordion.vue --max-warnings=0`
  - `pnpm docs:build`
- 当前执行结果：
  - 树组件单测：通过，`86 passed`
  - 目标 ESLint：通过
  - `docs:api`：通过，已生成 `fl-tree.json`
  - `vue-tsc`：通过
  - 文档示例 ESLint：通过
  - `docs:build`：通过
  - `docs:build` 仍存在既有 `dialog.vue` dynamic import warning、chunk size warning 和 Sass legacy JS API warning，本阶段未引入构建失败

### 28.7 当前判定

- 当前判定：阶段 21 已完成。

## 29. 阶段 22 测试文档：树节点展开 / 折叠动画

### 29.1 阶段目标

阶段 22 为 `FlTree` 子树展开 / 折叠补齐默认视觉动画。该能力只增强节点显隐的视觉反馈，
不新增公开 API，不改变展开状态模型、事件顺序、受控 / 非受控优先级、异步加载、键盘导航、
滚动定位和拖拽链路。

### 29.2 本阶段完成内容

1. `tree-node.vue` 使用 Vue 内置 `Transition`，过渡名称固定为 `fl-tree-collapse`。
2. 子树容器继续使用 `.fl-tree__children[role="group"]`，保持既有树语义。
3. 新增 `.fl-tree__children-inner[role="presentation"]` 作为 CSS Grid 高度动画内部结构。
4. `tree.scss` 使用原生 CSS 实现动画，不引用 Element Plus transition 组件或样式文件。
5. 动画通过 `grid-template-rows`、`opacity` 和 `transform` 表现展开 / 折叠过程。
6. 动画时长使用 `--el-transition-duration`，默认约 `0.3s`。
7. `prefers-reduced-motion: reduce` 下禁用过渡和位移效果。

### 29.3 本阶段不做的事情

- 不新增 `motion`、`animation`、`transition`、`collapseDuration` 等公开 prop。
- 不引入 `ElCollapseTransition`，不引入 `collapse-transition.scss`。
- 不移除 Tree 里已有的 `ElIcon`、`ElCheckbox` 或 Element Plus 图标依赖。
- 不改变 `node-expand`、`node-collapse`、`expand`、`update:expandedKeys` 的派发顺序。
- 不改变子树收起后的卸载语义；折叠子树节点仍不可滚动、不可键盘访问、不可注册 DOM。

### 29.4 验收测试范围

| 编号 | 测试内容     | 关注点                           | 预期结果                                   |
| ---- | ------------ | -------------------------------- | ------------------------------------------ |
| 1    | 子树语义结构 | `role="group"` 是否保持          | 展开后仍存在 `.fl-tree__children` 分组容器 |
| 2    | 动画内部结构 | CSS Grid 动画承载层              | 存在 `.fl-tree__children-inner`            |
| 3    | 原生 CSS     | 是否自研动画样式                 | 存在 `fl-tree-collapse` 与 grid 行动画     |
| 4    | 外部依赖边界 | Element Plus transition 是否误入 | 不包含 `ElCollapseTransition` 与样式引用   |
| 5    | 可访问性偏好 | 减少动态效果设置                 | 存在 `prefers-reduced-motion` 兜底         |
| 6    | 行为回归     | 展开、折叠和受控展开既有测试     | 原有 Tree 单测全部通过                     |

### 29.5 当前固定契约

- 展开 / 折叠动画默认启用，不提供公开开关。
- 动画只作用于子树容器的视觉过渡，不作为状态事实来源。
- `fl-tree-collapse` 是内部样式契约，不作为公开 API 承诺给业务侧控制。
- 组件仍完全自研 Tree 结构，不基于 Element Plus Tree 或 Element Plus collapse transition。

### 29.6 当前测试结果

- 自动化测试文件：
  - `packages/components/tree/__test__/tree.test.ts`
- 当前已执行命令：
  - `pnpm test -- packages/components/tree/__test__/tree.test.ts`
  - `pnpm build:lib:style`
  - `pnpm lint`
- 当前执行结果：
  - 树组件单测：通过，`86 passed`
  - 样式构建：通过
  - ESLint：通过

### 29.7 当前判定

- 当前判定：阶段 22 已完成。
