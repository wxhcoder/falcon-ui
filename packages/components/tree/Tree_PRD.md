# FlTree 需求文档（完整功能版）

## 0. 文档状态

- 当前状态：`FlTree` 完整功能已开发完成，本文件按最终能力重新整理。
- 文档目标：系统描述组件定位、能力边界、公开契约、交互规则和验收标准。
- 文档口径：面向产品与组件维护，不再记录逐阶段开发过程。
- 代码事实来源：
  - 组件实现：`packages/components/tree/src/`
  - 测试用例：`packages/components/tree/__test__/tree.test.ts`
  - 文档示例：`docs/examples/tree/`
  - API 元数据：`docs/public/api-meta/fl-tree.json`

## 1. 组件定位

`FlTree` 是 Falcon UI 的自研树组件，用于展示层级数据，并承载展开、选择、勾选、
异步加载、拖拽排序、键盘导航、筛选高亮和滚动定位等常见树形交互。

组件实现不基于 Element Plus `ElTree`，树结构、状态传导、拖拽落点、键盘焦点和
滚动定位由 Falcon UI 自行维护。视觉层优先继承 Element Plus Tree 变量，并复用
Element Plus 的 Checkbox、Icon 与图标资源，以保证 Falcon UI 现有主题一致性。

## 2. 设计目标

- 提供稳定、完整、可组合的树形数据展示组件。
- 使用 key-based 状态模型，保证展开、选择、勾选、加载和交互禁用状态可预测。
- 同时支持非受控默认值和受控状态，符合 Vue 3 `v-model:*` 使用习惯。
- 保持事件职责清晰：节点点击、展开、勾选、右键、双击、拖拽互不误触发。
- 提供基础无障碍语义和键盘操作，满足常规管理后台与业务系统使用场景。
- 提供文档示例、类型导出、单测和构建门禁，支撑长期维护。

## 3. 非目标

- 不提供搜索输入框、右键菜单、上下文菜单、批量工具栏等业务层能力。
- 不提供虚拟滚动、远程分页树、跨树拖拽或超大数据量专项优化。
- 不承诺 DOM 结构与 Ant Design 或 Element Plus Tree 完全一致。
- 不支持从节点数据字段直接驱动禁用、不可选、禁用复选框或隐藏复选框。
- 不开放动画开关、动画时长、节点路径、公开 `parentKey` 等扩展 API。

## 4. 典型场景

- 目录、组织、权限、分类、菜单等层级数据展示。
- 通过默认展开或受控展开管理节点可见范围。
- 对节点执行单选、多选、右键、双击展开等轻量交互。
- 在权限、分类、组织范围选择中使用复选框和父子联动。
- 对节点进行单树内部拖拽排序，并通过规则限制拖拽源和投放位置。
- 组合外部搜索框，通过筛选高亮、受控展开和 `scrollTo` 定位命中项。
- 在键盘可访问场景中通过方向键、Enter、Space 完成主要操作。

## 5. 数据模型

### 5.1 节点数据

- `data` 是唯一树形数据入口，类型为树节点数组。
- 每个节点必须提供全局唯一 `key`，`key` 仅支持字符串或数字。
- 缺失 `key` 或出现重复 `key` 应视为非法输入，并在运行时抛出错误。
- 业务字段可以任意保留，事件与插槽会通过 `node.data` 或 `data` 原样回传。
- `TreeData` 只承载业务数据与树结构，不承载组件交互状态或样式 class。

### 5.2 字段映射

`props` 用于配置业务字段到树节点标准字段的映射：

| 字段       | 默认值     | 说明             |
| ---------- | ---------- | ---------------- |
| `label`    | `label`    | 节点标题字段     |
| `children` | `children` | 子节点数组字段   |
| `isLeaf`   | `isLeaf`   | 是否叶子节点字段 |

`key` 不参与 `props` 映射，始终要求直接存在于节点数据上。

### 5.3 内部索引

组件会将 `data` 标准化为内部节点模型，并维护以下索引：

| 索引              | 用途                     |
| ----------------- | ------------------------ |
| `keyNodeMap`      | 通过 key 查找节点        |
| `parentKeyMap`    | 判断父子关系和同级关系   |
| `childrenKeyMap`  | 查找节点直接子级         |
| `visibleNodeKeys` | 按树遍历顺序输出节点 key |

这些索引只服务内部状态计算，不作为公开 API。

## 6. 状态模型

### 6.1 受控与非受控

`FlTree` 对展开、选择、勾选和异步加载均支持受控与非受控：

| 能力 | 默认值属性                                | 受控属性       | 同步事件              |
| ---- | ----------------------------------------- | -------------- | --------------------- |
| 展开 | `defaultExpandedKeys`、`defaultExpandAll` | `expandedKeys` | `update:expandedKeys` |
| 选择 | `defaultSelectedKeys`                     | `selectedKeys` | `update:selectedKeys` |
| 勾选 | `defaultCheckedKeys`                      | `checkedKeys`  | `update:checkedKeys`  |
| 加载 | 无                                        | `loadedKeys`   | `update:loadedKeys`   |

只要传入受控属性，组件即以外部传入值为事实来源。用户交互只通过同步事件请求外部更新，
视图必须等待外部 prop 回写后变化。

非受控默认值只在初始化阶段消费；后续 `data` 变化只裁剪无效 key，不重新消费默认值。

### 6.2 key 归一化

所有 key 集合都会按能力进行归一化：

- 过滤非法 key。
- 过滤已经不存在于当前树中的 key。
- 去重并保持稳定顺序。
- 选择状态会额外过滤 `disabledKeys` 与 `unselectableKeys`。
- 勾选状态会过滤隐藏复选框节点，但保留禁用节点的受控展示能力。

## 7. 功能需求

### 7.1 基础渲染

- 默认展示根节点，未配置展开时分支节点处于收起状态。
- 非叶子节点渲染展开器，叶子节点渲染叶子占位视觉。
- 节点内容区默认展示 `label`。
- 当传入默认插槽时，节点内容区完全由插槽接管。
- 插槽只接管 switcher 与 checkbox 右侧的内容，不接管缩进、连线、展开器和复选框。
- 节点内容区为整行热区，hover、focus、selected、filtered、drag 状态都作用于整行。

### 7.2 展开与收起

展开能力覆盖以下需求：

- `defaultExpandAll` 初始化展开所有可展开节点。
- `defaultExpandedKeys` 初始化展开指定节点。
- `defaultExpandParent` 控制默认展开时是否补齐祖先节点，默认开启。
- `expandedKeys` 受控管理展开状态。
- `autoExpandParent` 控制受控展开时是否补齐祖先节点，默认关闭。
- `accordion` 开启后，同一父节点下最多只保留一个同级可展开节点展开。
- 点击 switcher、键盘右箭头、双击内容区都复用同一展开链路。
- 展开未加载的异步节点时触发 `loadData`。
- 初始展开和外部 `expandedKeys` 变更不会自动触发 `loadData`。

展开事件顺序固定为：

| 入口                           | 事件顺序                                             |
| ------------------------------ | ---------------------------------------------------- |
| switcher / 键盘 / 双击触发展开 | `update:expandedKeys` -> `node-expand` -> `expand`   |
| switcher / 键盘 / 双击触发收起 | `update:expandedKeys` -> `node-collapse` -> `expand` |

switcher 点击只负责展开或收起，不触发 `node-click`、`select` 或 `check`。

### 7.3 手风琴展开

`accordion = true` 时启用手风琴展开模式：

- 同一 `parentKey` 分组下最多保留一个展开节点。
- 根节点之间也属于同级分组。
- `defaultExpandAll`、`defaultExpandedKeys`、`expandedKeys` 和交互结果都需要归一化。
- 同一同级组输入多个展开 key 时，保留输入顺序中最后出现的 key。
- `defaultExpandParent` 与 `autoExpandParent` 仍负责祖先补齐，但不能绕过同级唯一约束。
- 自动收起的同级节点不额外派发独立 `node-collapse`。

### 7.4 展开动画

- 子树展开和收起默认具备视觉动画。
- 动画基于 Vue `Transition` 和 Falcon UI 原生 SCSS 实现。
- 子树容器保持 `role="group"`，内部动画包裹层使用展示性结构。
- 动画只影响视觉，不改变展开状态、事件顺序、异步加载或滚动注册语义。
- 折叠后子树仍会卸载；折叠节点不参与滚动定位、键盘导航和节点注册。
- 在 `prefers-reduced-motion: reduce` 下禁用过渡和位移效果。

### 7.5 选择

选择能力覆盖以下需求：

- `selectable` 默认开启；关闭后整棵树不进入选择链路。
- `defaultSelectedKeys` 用于非受控初始化。
- `selectedKeys` 用于受控选中。
- `multiple` 开启多选；关闭时为单选。
- `disabledKeys` 和 `unselectableKeys` 命中的节点不能进入选中态。

单选行为：

- 点击未选中节点：该节点成为唯一选中项。
- 点击已选中节点：取消选中，选中集合变为空。
- 如果输入多个默认或受控 key，只保留第一个合法可选 key。

多选行为：

- 点击未选中节点：追加到选中集合末尾。
- 点击已选中节点：只移除当前节点。
- 不引入 Ctrl、Command、Shift 等组合键语义。

节点内容区点击事件顺序固定为：

| 场景                 | 事件顺序                                          |
| -------------------- | ------------------------------------------------- |
| 可选节点点击         | `node-click` -> `update:selectedKeys` -> `select` |
| 禁用或不可选节点点击 | 只触发 `node-click`                               |
| `selectable = false` | 不触发选中事件，不输出选中态                      |

### 7.6 复选框与勾选

勾选能力覆盖以下需求：

- `checkable` 开启后渲染复选框。
- `defaultCheckedKeys` 用于非受控初始化。
- `checkedKeys` 用于受控勾选。
- `checkStrictly` 控制是否关闭父子联动。
- `disabledCheckboxKeys` 禁用指定节点复选框交互。
- `hiddenCheckboxKeys` 隐藏指定节点复选框。

默认联动模式：

- 勾选父节点时，勾选可达子孙中所有可勾选节点。
- 勾选子节点时，自底向上计算父节点的勾选或半选状态。
- 取消节点时，清理当前可达分支和沿途可勾选祖先，再重新计算半选态。
- `disabledKeys` 是父子传导硬边界，向上和向下传导都不能穿透。
- `hiddenCheckboxKeys` 只隐藏当前节点复选框，作为透明桥接层允许子孙参与传导。

严格模式：

- 父子节点勾选互不影响。
- `checkedKeys` 可接收数组，也可接收包含 `checked` 与 `halfChecked` 的对象。
- 用户切换节点时只增删 `checked`，`halfChecked` 仅由外部受控输入决定。

复选框点击事件顺序固定为：

| 场景                   | 事件顺序                        |
| ---------------------- | ------------------------------- |
| 可勾选节点点击复选框   | `update:checkedKeys` -> `check` |
| 禁用复选框或隐藏复选框 | 不触发勾选事件                  |

复选框点击不触发 `node-click`、`select`、`node-expand` 或 `node-collapse`。

### 7.7 key-based 交互状态

节点交互状态统一通过组件级 key 集合声明：

| 属性                   | 行为                                                   |
| ---------------------- | ------------------------------------------------------ |
| `disabledKeys`         | 节点整体禁用，不可选择，复选框不可交互，并阻断勾选传导 |
| `unselectableKeys`     | 节点正常展示，但不能进入选中态                         |
| `disabledCheckboxKeys` | 只禁用当前节点复选框，不阻断父子联动                   |
| `hiddenCheckboxKeys`   | 隐藏当前节点复选框，不阻断子孙勾选                     |

节点数据中的旧交互字段，例如 `disabled`、`selectable`、`disableCheckbox`、`checkable`，
不再驱动组件行为。

### 7.8 异步加载

异步加载能力覆盖以下需求：

- 传入 `loadData` 后，未加载的非叶子节点会展示可展开状态。
- 用户展开未加载节点时调用 `loadData(node)`。
- 节点加载中时显示加载图标，并禁止重复触发展开加载。
- `loadedKeys` 可受控记录已加载节点。
- 加载成功后触发 `update:loadedKeys` 与 `load`。
- 加载失败后清理 loading 状态，不写入 `loadedKeys`，后续可重试。
- `loadData` 的 Promise resolve 值不由组件消费；业务侧负责更新 `data`。
- `isLeaf = true` 的节点不触发异步加载。

### 7.9 拖拽排序

拖拽能力覆盖以下需求：

- `draggable` 开启后，节点内容区成为原生拖拽源。
- `allowDrag(node)` 返回 `false` 时阻止该节点开始拖拽。
- `allowDrop(draggingNode, dropNode, type)` 可分别限制 `prev`、`inner`、`next`。
- 鼠标位于目标节点上、中、下区域时，对应生成 before、inner、after 投放类型。
- 成功投放后，组件会按 `props.children` 字段映射原地重排 `data` / children 数组。
- 拖拽结束先完成内部重排，再触发 `node-drag-end` 与 `node-drop`。
- 自身投放、投放到后代、相邻位置 no-op、`allowDrop=false` 都不会触发 `node-drop`。
- 拖拽链路不触发点击、选择、勾选或展开事件。
- 当前只支持单树内部排序，不支持跨树拖拽。

拖拽事件包括：

| 事件              | 说明                     |
| ----------------- | ------------------------ |
| `node-drag-start` | 拖拽开始                 |
| `node-drag-enter` | 拖拽进入目标节点         |
| `node-drag-over`  | 拖拽悬停在目标节点       |
| `node-drag-leave` | 拖拽离开目标节点         |
| `node-drag-end`   | 拖拽结束，包含成功和失败 |
| `node-drop`       | 成功投放后触发           |

### 7.10 右键与双击

右键能力：

- 节点内容区右键触发 `right-click`。
- 右键会同步内部活动节点。
- 右键不触发选择、勾选或展开链路。

双击能力：

- 节点内容区双击触发 `dblclick`。
- 可展开且非加载中的节点会在 `dblclick` 后复用展开链路。
- 双击叶子节点、switcher 或 checkbox 不会误触发展开。
- 双击不会造成选中态连续切换两次。

### 7.11 筛选高亮

`filterTreeNode(node)` 用于判断节点是否命中筛选：

- 返回 `true` 时节点进入过滤命中态。
- 命中态只影响节点内容区视觉。
- 不自动展开祖先节点。
- 不自动滚动到命中节点。
- 不改变选择、勾选、展开或加载状态。

完整搜索体验应由外层组合搜索输入、`expandedKeys`、`filterTreeNode` 和 `scrollTo`
共同实现。

### 7.12 滚动定位

组件通过 expose 暴露 `scrollTo`：

| 参数     | 说明                                   |
| -------- | -------------------------------------- |
| `key`    | 目标节点 key                           |
| `align`  | `top`、`bottom` 或 `auto`，默认 `auto` |
| `offset` | 滚动偏移量，默认 `0`                   |

行为规则：

- 只定位当前已经渲染且可见的节点。
- 目标 key 不存在、位于折叠子树、异步尚未加载或已从数据中移除时保持 no-op。
- 优先使用最近可滚动祖先；没有局部滚动祖先时回退页面滚动容器。
- 不主动展开祖先节点，不触发异步加载，不改变渲染策略。
- 不要求 Tree 根节点自身设置固定高度或成为滚动容器。

### 7.13 视觉与自定义内容

视觉能力包括：

| 属性                  | 行为                                                 |
| --------------------- | ---------------------------------------------------- |
| `showLine`            | 显示树节点连线，可用对象形式配置叶子图标             |
| `switcherIcon`        | 展开器图标模式，支持 `arrow`、`plus-minus`、`folder` |
| `switcherLoadingIcon` | 异步加载中的展开器图标                               |
| `classNames`          | 注入语义化 DOM class                                 |
| `nodeClassName`       | 按节点快照与原始数据注入节点外壳 class               |
| `styles`              | 注入语义化 DOM 内联样式                              |

`showLine` 规则：

- `false`：不显示连线。
- `true`：显示连线与叶子末端结构，不显示叶子图标。
- 对象形式：显示连线，并可通过 `showLeafIcon` 控制叶子图标。

`switcherIcon` 规则：

- `arrow`：收起为右箭头，展开为下箭头。
- `plus-minus`：收起为加号，展开为减号。
- `folder`：收起为文件夹，展开为打开文件夹。
- 叶子节点不渲染 switcher 按钮，只渲染叶子视觉。

语义化 DOM 当前只开放两个稳定挂点：

| 挂点   | 含义               |
| ------ | ------------------ |
| `root` | 树根容器           |
| `item` | 单个树节点条目外壳 |

`itemIcon`、`itemCheckbox`、`itemTitle` 等内部结构不作为公开语义化挂点。
单节点差异化 class 通过 `nodeClassName({ node, data })` 计算，不从 `TreeData` 读取样式字段。

### 7.14 键盘导航与无障碍

无障碍语义：

- 根容器输出 `role="tree"`。
- 节点输出 `role="treeitem"`。
- 子树容器输出 `role="group"`。
- 节点按状态输出 `aria-expanded`、`aria-selected`、`aria-checked`、`aria-disabled`、
  `aria-level`。
- 根容器默认 `tabindex=0`，也允许外部通过 attrs 覆盖。
- 根容器通过 `aria-activedescendant` 指向当前活动节点。

键盘操作：

| 按键         | 行为                                                  |
| ------------ | ----------------------------------------------------- |
| `ArrowDown`  | 移动到下一个可见节点                                  |
| `ArrowUp`    | 移动到上一个可见节点                                  |
| `ArrowRight` | 未展开时展开；已展开时移动到第一个可见子节点          |
| `ArrowLeft`  | 已展开时收起；否则移动到父节点                        |
| `Enter`      | 复用节点内容点击语义                                  |
| `Space`      | checkable 树中切换勾选；非 checkable 树中复用点击选择 |

焦点只在当前可见节点间移动；折叠子树中的节点不参与键盘导航。

## 8. 公开 API

### 8.1 Props

| 属性                   | 默认值       | 说明                                    |
| ---------------------- | ------------ | --------------------------------------- |
| `data`                 | `[]`         | 树形数据源                              |
| `props`                | 默认字段映射 | 配置 `label`、`children`、`isLeaf` 字段 |
| `defaultExpandAll`     | `false`      | 初始化时展开所有可展开节点              |
| `defaultExpandedKeys`  | `undefined`  | 非受控初始化展开 key                    |
| `expandedKeys`         | `undefined`  | 受控展开 key                            |
| `defaultExpandParent`  | `true`       | 默认展开时补齐祖先节点                  |
| `autoExpandParent`     | `false`      | 受控展开时补齐祖先节点                  |
| `accordion`            | `false`      | 手风琴展开                              |
| `selectable`           | `true`       | 是否允许节点选中                        |
| `multiple`             | `false`      | 是否允许多选                            |
| `defaultSelectedKeys`  | `undefined`  | 非受控初始化选中 key                    |
| `selectedKeys`         | `undefined`  | 受控选中 key                            |
| `disabledKeys`         | `undefined`  | 整体禁用节点 key                        |
| `unselectableKeys`     | `undefined`  | 不可选节点 key                          |
| `checkable`            | `false`      | 是否显示复选框                          |
| `checkStrictly`        | `false`      | 是否关闭父子勾选联动                    |
| `defaultCheckedKeys`   | `undefined`  | 非受控初始化勾选 key                    |
| `checkedKeys`          | `undefined`  | 受控勾选 key                            |
| `disabledCheckboxKeys` | `undefined`  | 禁用复选框 key                          |
| `hiddenCheckboxKeys`   | `undefined`  | 隐藏复选框 key                          |
| `loadData`             | `undefined`  | 异步加载函数                            |
| `loadedKeys`           | `undefined`  | 受控已加载 key                          |
| `draggable`            | `false`      | 是否开启单树内部拖拽                    |
| `allowDrag`            | `undefined`  | 拖拽源拦截                              |
| `allowDrop`            | `undefined`  | 投放位置拦截                            |
| `filterTreeNode`       | `undefined`  | 筛选命中函数                            |
| `showLine`             | `false`      | 是否显示连线                            |
| `switcherIcon`         | `arrow`      | 展开器图标模式                          |
| `switcherLoadingIcon`  | `Loading`    | 加载态展开器图标                        |
| `classNames`           | `undefined`  | 语义化 DOM class                        |
| `nodeClassName`        | `undefined`  | 节点外壳 class 回调                     |
| `styles`               | `undefined`  | 语义化 DOM style                        |

### 8.2 Events

| 事件                  | 说明                   |
| --------------------- | ---------------------- |
| `update:expandedKeys` | 请求同步展开 key       |
| `update:selectedKeys` | 请求同步选中 key       |
| `update:checkedKeys`  | 请求同步勾选 key       |
| `update:loadedKeys`   | 请求同步已加载 key     |
| `expand`              | 节点展开状态切换后触发 |
| `node-click`          | 节点内容区点击         |
| `select`              | 节点选中状态变化       |
| `check`               | 节点复选框勾选变化     |
| `load`                | 节点异步加载成功       |
| `node-expand`         | 节点展开               |
| `node-collapse`       | 节点收起               |
| `dblclick`            | 节点内容区双击         |
| `right-click`         | 节点内容区右键         |
| `node-drag-start`     | 拖拽开始               |
| `node-drag-enter`     | 拖拽进入节点           |
| `node-drag-over`      | 拖拽悬停节点           |
| `node-drag-leave`     | 拖拽离开节点           |
| `node-drag-end`       | 拖拽结束               |
| `node-drop`           | 成功投放               |

### 8.3 Slot

| 插槽      | 说明                                      |
| --------- | ----------------------------------------- |
| `default` | 自定义节点内容区，参数为 `{ node, data }` |

### 8.4 Expose

| 方法       | 说明                             |
| ---------- | -------------------------------- |
| `scrollTo` | 滚动定位到当前已渲染且可见的节点 |

### 8.5 类型导出

组件包需要导出树组件使用方常用类型，包括但不限于：

- `TreeKey`
- `TreeData`
- `TreeNode`
- `TreeNodeProps`
- `TreeNodeClassName`
- `TreeNodeClassNameInfo`
- `TreeProps`
- `TreeEmits`
- `TreeCheckedKeys`
- `TreeCheckEvent`
- `TreeSelectEvent`
- `TreeExpandEvent`
- `TreeLoadEvent`
- `TreeAllowDrag`
- `TreeAllowDrop`
- `TreeSwitcherIconMode`
- `TreeShowLine`
- `TreeScrollToOptions`
- `TreeExpose`
- `TreeSemanticDOM`
- `TreeClassNames`
- `TreeStyles`

类型必须可从 `@falcon-ui/components/tree` 与 `@falcon-ui/components` 访问。

## 9. 导出与安装

- 默认导出与命名导出均提供 `FlTree`。
- 支持按组件安装：`app.use(FlTree)`。
- 支持通过 Falcon UI 全量插件安装并注册全局组件名 `FlTree`。
- `packages/components/index.ts`、`packages/falcon-ui/index.ts` 和全局类型声明应保持导出一致。
- 主题样式接入 `packages/theme/src/tree.scss`。

## 10. 文档与示例

VitePress 文档页位于 `docs/components/tree.md`，示例按能力拆分：

| 示例                  | 覆盖能力                       |
| --------------------- | ------------------------------ |
| `basic.vue`           | 基础渲染与字段映射             |
| `expand.vue`          | 默认展开与受控展开             |
| `accordion.vue`       | 手风琴展开                     |
| `selection.vue`       | 默认选中、单选、多选与右键事件 |
| `checkable.vue`       | 复选框、父子联动与严格模式     |
| `disabled.vue`        | 禁用、不可选、复选框禁用与隐藏 |
| `line-content.vue`    | 连线、自定义内容与切换图标     |
| `semantic-style.vue`  | 语义化样式                     |
| `async.vue`           | 异步加载                       |
| `drag.vue`            | 节点拖拽                       |
| `keyboard-a11y.vue`   | 键盘导航与无障碍               |
| `dblclick-scroll.vue` | 双击展开、筛选高亮与滚动定位   |

## 11. 验收标准

### 11.1 功能验收

- 基础树渲染支持多层级、字段映射、默认插槽和稳定类名。
- 展开状态覆盖默认展开、受控展开、祖先补齐、手风琴和动画。
- 选择状态覆盖单选、多选、受控、禁用和不可选边界。
- 勾选状态覆盖默认父子联动、严格模式、半选态和禁用传导边界。
- 异步加载覆盖加载中、成功、失败重试、受控 `loadedKeys` 和数据回写。
- 拖拽覆盖拖拽源限制、投放位置限制、内部重排和事件顺序。
- 键盘导航覆盖可见节点遍历、展开收起、选择、勾选和异步展开。
- `filterTreeNode` 只做命中高亮，不改变树状态。
- `scrollTo` 只定位可见节点，对非法或未渲染节点保持 no-op。
- 右键、双击、switcher、checkbox 和拖拽之间事件职责隔离。

### 11.2 API 验收

- 所有 props、events、slot、expose 在 API 元数据中可生成。
- 公开类型从组件入口和总入口都可导入。
- 受控属性只请求外部更新，不私自改变最终视图。
- 非受控默认值只在初始化阶段消费，数据变化只裁剪失效 key。
- 事件对象中统一回传 `TreeNode`，原始业务数据通过 `data` 或 `node.data` 获取。

### 11.3 质量门禁

完整门禁应覆盖：

- `pnpm lint`
- `pnpm test`
- `pnpm format:check`
- `pnpm exec vue-tsc -p tsconfig.build.json --noEmit`
- `pnpm build:lib:style`
- `pnpm build:lib`
- `pnpm docs:check`
- `pnpm play:build`

`FlTree` 相关能力应由 `packages/components/tree/__test__/tree.test.ts` 持续回归。

## 12. 维护约束

- 新增能力优先保持 key-based 状态模型，避免从节点数据字段读取交互状态。
- 新增事件必须明确事件职责、触发入口和与既有事件的隔离关系。
- 新增视觉扩展优先通过 Falcon UI 变量、BEM 类名和语义化挂点完成。
- 节点级样式差异通过 `nodeClassName` 在视图层计算，不在 `TreeData` 中承载 class 字段。
- 不应把内部节点结构挂点随意升级为公开 `classNames` / `styles` 语义。
- 涉及展开、选择、勾选、异步、拖拽或键盘焦点的改动必须补充单测。
- 任何破坏性 API 调整都需要同步更新文档示例、API 元数据和类型导出。
