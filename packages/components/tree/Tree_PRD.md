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
- [ ] 阶段 4：开发树节点单选功能
- [ ] 阶段 5：开发树节点多选功能
- [ ] 阶段 6：开发树复选框渲染功能
- [ ] 阶段 7：开发树父子联动勾选功能
- [ ] 阶段 8：开发严格勾选与半选态功能
- [ ] 阶段 9：开发禁用节点联动边界功能
- [ ] 阶段 10：开发树节点视觉渲染功能
- [ ] 阶段 11：开发 Tree 语义化 DOM 样式定制功能
- [ ] 阶段 12：开发树节点异步加载功能
- [ ] 阶段 13：开发树节点拖拽功能
- [ ] 阶段 14：开发树键盘导航与无障碍功能
- [ ] 阶段 15：开发目录树模式
- [ ] 阶段 16：开发树滚动控制能力
- [ ] 阶段 17：开发虚拟树
- [ ] 阶段 18：开发文档示例与单元测试补全
- [ ] 阶段 19：质量门禁

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
- 内部自行实现树数据标准化、可见节点拍平、勾选传导、键盘导航、拖拽落点与虚拟滚动适配。
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
  - 普通树与虚拟树共享同一套标准化数据模型与交互状态模型
  - 渲染层按“普通渲染 / 虚拟渲染”分支适配，不依赖第三方树组件 DOM 结构
- 设计原则：
  - 树数据语义尽量对齐 Ant Design
  - Vue 对外事件统一采用 kebab-case emits
  - 受控状态同时支持属性输入与 `update:*` 输出
  - 逻辑层与渲染层解耦，避免后续目录树、异步树、虚拟树互相污染

## 3. 范围定义

### 3.1 In Scope

- 树节点数据渲染：`data`、`props`、节点级状态字段
- 展开行为：默认展开、受控展开、父级联动展开
- 选择行为：单选、多选、目录树模式下的多选
- 勾选行为：父子联动勾选、严格勾选、半选态
- 节点禁用能力：`disabled`、`disableCheckbox`、`selectable`
- 自定义渲染：标题、图标、展开图标、连线、整行占满
- 语义化 DOM 样式定制：`classNames`、`styles`
- 异步加载：`loadData`、`loadedKeys`、`isLeaf`
- 拖拽：节点可拖拽、投放位置限制、拖拽事件
- 虚拟滚动：`height`、`virtual`、`scrollTo`
- 筛选高亮：`filterTreeNode`
- 目录树模式：`directory`、`expandAction`
- 类型导出、组件暴露方法、测试矩阵与文档示例

### 3.2 Out of Scope（首版不做）

- 不提供与 Ant Design Tree Component Token 一一对应的主题兼容层
- 不提供搜索面板、右键菜单、上下文命令面板
- 不提供跨树拖拽、远程分页树、超大规模节点专项优化

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
- 默认字段映射遵循 Element Plus Tree 的 `props` 风格：
  - `label`
  - `children`
  - `disabled`
  - `isLeaf`
- `key` 始终作为树节点主键单独要求，不通过 `props` 做映射。
- `props` 首版至少支持：
  - `label`
  - `children`
  - `disabled`
  - `isLeaf`
  - `class`
- 除保留字段外，其余业务字段原样保留，并在事件与自定义渲染中回传。

### 4.2 展开行为

- 支持以下展开控制能力：
  - `defaultExpandAll`
  - `defaultExpandedKeys`
  - `expandedKeys`
  - `autoExpandParent`
  - `defaultExpandParent`
- 受控模式下，组件内部不得持久化最终展开结果；最终状态以外部传入为准。
- 非受控模式下，组件内部维护展开状态，并在变更时同步发出 `update:expandedKeys`。
- `directory` 模式下支持 `expandAction`：
  - `click`
  - `doubleClick`
  - `false`

### 4.3 选择行为

- 默认 `selectable = true`。
- 支持：
  - 单选
  - `multiple = true` 时的多选
  - `directory = true` 时的目录树交互模式
- 目录树多选需兼容平台快捷键语义：
  - Windows 使用 `ctrl`
  - macOS 使用 `command`
- 提供：
  - `defaultSelectedKeys`
  - `selectedKeys`
- 节点 `disabled` 或 `selectable = false` 时，不允许进入选中态。

### 4.4 勾选行为

- `checkable = true` 时显示勾选框。
- 提供：
  - `defaultCheckedKeys`
  - `checkedKeys`
  - `checkStrictly`
- `checkStrictly = false` 时，对齐 Ant Design 的父子联动勾选规则。
- `checkStrictly = true` 时：
  - 父子节点勾选状态相互独立
  - `checkedKeys` 支持 `{ checked, halfChecked }`
- `disableCheckbox = true` 时，节点仍可展示但勾选框不可交互。
- 勾选状态计算必须基于独立的传导算法实现，不能依赖第三方树组件内建回传。

### 4.5 禁用节点联动规则

- 遵守 Ant Design 文档中的禁用节点传导规则：
  - 勾选或展开状态向上、向下传导时，遇到 `disabled` 节点必须停止影响该分支
  - 被禁用的父节点不应因为子节点勾选而被动改变
  - 被禁用的子节点不应因为父节点勾选而被动改变
- 以上规则必须写入测试用例，避免后续回归破坏树语义。

### 4.6 自定义渲染与视觉能力

- 支持以下视觉控制：
  - `showLine`
  - `showIcon`
  - `blockNode`
  - `icon`
  - `switcherIcon`
  - `switcherLoadingIcon`
- `showLine` 需要支持：
  - `boolean`
  - `{ showLeafIcon }`
- 标题渲染建议同时支持：
  - `titleRender(node)`
  - `#title="{ node }"`
- 图标渲染建议支持 props 与 slots 双通道：
  - `icon`
  - `switcherIcon`
  - `#icon`
  - `#switcher-icon`
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
  - 默认展开的非叶子节点显示 `CaretBottom`
  - 后续收起态使用 `CaretRight`

### 4.7 语义化 DOM 样式定制

- 首版提供对标 Ant Design Tree 的语义化 DOM 样式定制能力：
  - `classNames`
  - `styles`
- 首版固定以下语义化结构名：
  - `root`
  - `item`
  - `itemIcon`
  - `itemTitle`
- 语义化结构含义：
  - `root`：树根容器
  - `item`：单个树节点条目容器
  - `itemIcon`：节点图标区域
  - `itemTitle`：节点标题区域
- 输入形式支持：
  - `Partial<Record<TreeSemanticDOM, string | CSSProperties>>`
  - `(info: { props }) => Partial<Record<TreeSemanticDOM, string | CSSProperties>>`
- 该能力仅承担样式扩展，不负责标题内容替换、图标逻辑替换和交互行为控制。

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
- `switcherLoadingIcon` 在异步加载中展示。
- 遵守 Ant Design FAQ 边界：`defaultExpandAll` 仅初始化生效。

### 4.10 拖拽能力

- 提供 `draggable`：
  - `boolean`
  - `(node) => boolean`
  - `{ icon?: boolean | VNode; nodeDraggable?: (node) => boolean }`
- 提供 `allowDrop({ dropNode, dropPosition }) => boolean`。
- 支持拖拽事件：
  - `drag-start`
  - `drag-enter`
  - `drag-over`
  - `drag-leave`
  - `drag-end`
  - `drop`
- `drop` 事件至少包含：
  - `node`
  - `dragNode`
  - `dragNodesKeys`
  - `dropPosition`
  - `dropToGap`
- 首版拖拽排序仅保证单树内部拖拽，不做跨树拖拽。

### 4.11 虚拟滚动与滚动控制

- `height` 存在时，组件进入虚拟滚动模式。
- `virtual = false` 时，强制关闭虚拟滚动。
- 虚拟滚动必须建立在“可见节点拍平数组”之上，而不是依赖第三方虚拟树黑盒能力。
- 暴露 `scrollTo` 方法：

```ts
scrollTo(options: {
  key: string | number
  align?: 'top' | 'bottom' | 'auto'
  offset?: number
}): void
```

- 保留 Ant Design 文档中的限制说明：虚拟滚动只渲染可见区域。

### 4.12 目录树模式

- 首版不单独拆 `FlDirectoryTree`，统一通过 `directory` 模式承接。
- 目录树模式要求：
  - 视觉风格与普通树区分
  - 选中态与普通树可分别配置样式变量
  - 支持 `expandAction`
  - 支持快捷键多选

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

type TreeSemanticDOM = 'root' | 'item' | 'itemIcon' | 'itemTitle'

interface TreeNodeProps {
  label?: string
  children?: string
  disabled?: string
  isLeaf?: string
  class?: string
}

interface TreeData {
  key: TreeKey
  label?: string
  children?: TreeData[]
  disabled?: boolean
  disableCheckbox?: boolean
  selectable?: boolean
  checkable?: boolean
  isLeaf?: boolean
  icon?: unknown
  [key: string]: unknown
}

type TreeCheckedKeys =
  | TreeKey[]
  | {
      checked: TreeKey[]
      halfChecked: TreeKey[]
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
- 选择相关
  - `selectable`
  - `multiple`
  - `defaultSelectedKeys`
  - `selectedKeys`
- 勾选相关
  - `checkable`
  - `checkStrictly`
  - `defaultCheckedKeys`
  - `checkedKeys`
- 异步相关
  - `loadData`
  - `loadedKeys`
- 视觉相关
  - `disabled`
  - `blockNode`
  - `showLine`
  - `showIcon`
  - `icon`
  - `switcherIcon`
  - `switcherLoadingIcon`
  - `titleRender`
  - `classNames`
  - `styles`
- 拖拽相关
  - `draggable`
  - `allowDrop`
- 筛选与滚动
  - `filterTreeNode`
  - `height`
  - `virtual`
- 目录树相关
  - `directory`
  - `expandAction`

### 5.3 Emits 草案

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
  - `drag-start`
  - `drag-enter`
  - `drag-over`
  - `drag-leave`
  - `drag-end`
  - `drop`

### 5.4 Expose 草案

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
- `src/use-tree-normalize.ts`
  - 树数据标准化、索引建立、字段映射
- `src/use-tree-flatten.ts`
  - 可见节点拍平、缩进层级、虚拟滚动输入
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
- `src/use-tree-virtual.ts`
  - 虚拟滚动与 `scrollTo`
- `src/use-tree-keyboard.ts`
  - 键盘导航、焦点管理、无障碍属性映射
- `__test__/tree.test.ts`
  - 行为测试与回归用例

### 6.2 技术取舍建议

- 不依赖 Element Plus `ElTree`、`ElTreeV2` 或其他 UI 树组件作为底座。
- 普通模式与虚拟模式共用同一套标准化数据、状态管理与事件语义。
- `height + virtual !== false` 时，仅切换渲染策略，不切换交互语义与状态模型。
- 受控状态统一通过“合并状态”模型处理，不允许散落在多个分支里各自维护。
- 事件 payload 必须回传原始节点对象与标准化 keys，减少业务侧二次查询。
- 勾选、展开、选中、拖拽四类核心能力都应具备可单测的纯逻辑层。
- `classNames` / `styles` 的挂点必须稳定映射到
  `root / item / itemIcon / itemTitle`。
- 样式文件优先消费 Element Plus Tree 相关 CSS 变量。

## 7. 风险与待确认项

- 普通树渲染与虚拟树渲染如何共享同一份拍平结果，需要在实现前固定接口。
- `directory` 模式作为 `FlTree` 的 prop 是否足够清晰，还是需要同步导出
  `FlDirectoryTree`。
- 拖拽排序是否只做事件回传，还是允许组件内部直接重排 `data` 视图。
- 异步加载与受控 `expandedKeys`、`loadedKeys` 同时存在时，状态优先级需要固定。
- 标题插槽与虚拟滚动同时开启时，是否存在高度测量抖动。
- 普通渲染与虚拟渲染下，`item / itemIcon / itemTitle` 的语义挂点是否能保持一致。

## 8. 验收标准（首版）

- 能以 `data` 正确渲染多层树结构，并支持 Element Plus 风格 `props` 字段映射。
- `expandedKeys`、`selectedKeys`、`checkedKeys`、`loadedKeys` 均支持受控与非受控模式。
- `checkStrictly = false` 时，父子勾选联动与半选态符合 Ant Design 语义。
- `checkStrictly = true` 时，父子勾选互不影响，且支持 `{ checked, halfChecked }`。
- `disabled` / `disableCheckbox` 节点联动边界与 Ant Design FAQ 一致。
- `loadData` 可在节点展开时异步加载，并正确维护加载中与已加载状态。
- `draggable`、`allowDrop`、`drop` 事件可完整表达节点拖放过程。
- `height` 开启后可使用虚拟滚动，并支持 `scrollTo({ key })`。
- `filterTreeNode` 只负责高亮，不主动篡改展开状态。
- `directory` 模式支持 `expandAction` 与快捷键多选。
- `classNames` 与 `styles` 可稳定作用于
  `root / item / itemIcon / itemTitle` 四类语义化结构。
- 默认视觉样式可跟随 Element Plus Tree / 全局色板变量变化。

## 9. 测试矩阵（建议）

### 9.1 基础渲染

1. 基础树正常渲染，层级缩进正确。
2. `props` 生效，非默认字段可映射渲染。
3. 节点 `disabled`、`disableCheckbox`、`selectable = false` 表现正确。
4. `data` 变化后，内部 `TreeNode` 递归结构可正确响应并重渲染。
5. 叶子节点显示圆点，默认收起的非叶子节点显示 `CaretRight`，展开后显示 `CaretBottom`。

### 9.2 展开与选择

1. `defaultExpandAll` 仅初始化生效。
2. `expandedKeys` 受控时，内部点击只通过事件请求外部更新。
3. `multiple = true` 时支持多选；目录树模式下支持快捷键多选。

### 9.3 勾选

1. 普通联动勾选下，父子节点状态正确传导。
2. 含 `disabled` 节点时，勾选传导在禁用节点处停止。
3. `checkStrictly = true` 时，`checked` 与 `halfChecked` 输出正确。

### 9.4 异步加载

1. 展开未加载节点时触发 `loadData`。
2. 已加载节点重复展开不重复请求。
3. 异步追加节点后，`defaultExpandAll` 不会再次自动执行。

### 9.5 语义化 DOM 样式定制

1. `classNames.root` 可稳定挂载到树根容器。
2. `classNames.item` / `styles.item` 可稳定挂载到节点条目容器。
3. `classNames.itemIcon` / `styles.itemIcon` 仅影响图标区域。
4. `classNames.itemTitle` / `styles.itemTitle` 仅影响标题区域。
5. 传入函数形式时，可基于 `componentProps` 返回语义化结构映射。
6. 普通渲染与虚拟渲染模式下，四类语义化结构挂点语义保持一致。

### 9.6 视觉变量继承

1. 默认文本色、hover 背景、展开图标色可跟随 Element Plus 对应变量变化。
2. 节点高度、字号、过渡时长等基础视觉参数优先取自 Element Plus 变量。
3. 叶子圆点颜色优先复用 Element Plus 次级文本色变量。

### 9.7 拖拽

1. 不可拖拽节点不会进入拖拽态。
2. `allowDrop` 返回 `false` 时禁止落点。
3. `drop` 事件可拿到 `dragNode`、`dropNode`、`dropPosition`、`dropToGap`。

### 9.8 虚拟滚动

1. `height` 开启后，仅渲染可见区域节点。
2. `scrollTo({ key })` 可滚动到指定节点。
3. 长标题在虚拟滚动下不要求自动撑出横向滚动。

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
- 下一阶段状态：继续阻塞，等待用户确认后进入阶段 4。
