# FlDialog 需求与交付文档（基于 ElDialog 二次封装）

## 1. 组件信息

- 组件名称：`FlDialog`
- 基础组件：Element Plus `ElDialog`
- 依赖版本：Element Plus `>= 2.9.3`

## 2. 目标

在保持 `ElDialog` 语义兼容的前提下，提供 Falcon UI 统一弹窗能力：

- 默认增强交互（拖拽、销毁、居中、过渡）
- 内置 Header 操作（全屏、关闭）
- 内置 Footer 操作（取消、确认）
- 支持 Body 高度控制
- 使用 `header-class/body-class/footer-class` 定义三段主体样式

## 3. 功能需求（按当前实现修订）

### FR-01 默认可拖拽

- 默认开启 `draggable`。
- 允许业务通过 attrs 覆盖。

### FR-02 自动销毁

- 默认开启 `destroy-on-close`。

### FR-03 Header 内置全屏与关闭

- Header 固定包含“全屏”和“关闭”操作。
- 全屏：使用 `ElIcon + FullScreen` 触发内部 `fullscreen` 状态切换。
- 关闭：使用 `FlButton`（icon 模式，`Close` 图标）触发 `update:modelValue = false`。

### FR-04 Footer 内置取消与确认

- 默认渲染取消/确认按钮。
- 取消、确认均使用 `FlButton`。
- 事件顺序：
  - 取消：`cancel` -> `update:modelValue(false)`
  - 确认：`confirm` -> `update:modelValue(false)`
- 支持：`showFooter`、`cancelText`、`confirmText`、`cancelDisabled`、`confirmDisabled`。
- 若存在 `#footer` 插槽，则覆盖内置 Footer。

### FR-05 Body 高度可控（含全屏规则）

- `bodyHeight: number | string`
- 非全屏：`number` 按 `px`，`string` 原样应用。
- 全屏：忽略外部传入 `bodyHeight`，Body 充满除 Header/Footer 外剩余高度。

### FR-06 使用 2.9.3 分区 class 属性

必须通过以下属性定义三段主体样式：

- `header-class`
- `body-class`
- `footer-class`

默认类名：

- `fl-dialog__header`
- `fl-dialog__body`
- `fl-dialog__footer`

要求：

- 默认类与业务类合并。
- Dialog 保持外层边框。
- Header 下边框，Footer 上边框。
- Footer 带上阴影。

### FR-07 默认 Bounce 动画

- 使用 `transition` 默认启用 Bounce 动画。

### FR-08 屏幕居中

- 默认居中显示（垂直居中）。

### FR-09 样式文件约束

- Dialog 相关样式统一在 `packages/theme/src/dialog.scss`。

### FR-10 间距 Token 统一

- 新增并使用 `--fl-gap-sm` 作为通用小间距变量。
- Header/Body/Footer 的 padding 统一使用 `var(--fl-gap-sm)`。
- Header actions / Footer actions 的 gap 统一使用 `var(--fl-gap-sm)`。

## 4. API 约定

### Props

- `modelValue?: boolean`
- `bodyHeight?: number | string`
- `showFooter?: boolean`
- `cancelText?: string`
- `confirmText?: string`
- `cancelDisabled?: boolean`
- `confirmDisabled?: boolean`

### Emits

- `update:modelValue`
- `cancel`
- `confirm`

### Slots

- `default`
- `header`
- `title`
- `footer`

## 5. 视觉变量约定（当前实现）

- Dialog 边框：`--el-color-primary-light-5`
- Header 背景：`--el-color-primary-light-9`
- Header 标题色：`--el-color-primary`
- Footer 边框与阴影色：`--el-border-color`
- 间距 Token：`--fl-gap-sm`（定义于 `packages/theme/src/tokens.scss`）

## 6. 开发完成标记

### 功能目标

- [x] FR-01 默认可拖拽
- [x] FR-02 自动销毁
- [x] FR-03 Header 内置全屏与关闭
- [x] FR-04 Footer 内置取消与确认
- [x] FR-05 Body 高度可控（含全屏填充规则）
- [x] FR-06 使用 `header-class/body-class/footer-class` 定义主体样式
- [x] FR-07 默认 Bounce 动画
- [x] FR-08 弹窗居中
- [x] FR-09 样式全部落在 `dialog.scss`
- [x] FR-10 间距 Token 统一（`--fl-gap-sm`）

### 工程接入目标

- [x] 新增组件实现：`packages/components/dialog/src/dialog.ts`
- [x] 新增组件实现：`packages/components/dialog/src/dialog.vue`
- [x] 新增组件入口：`packages/components/dialog/index.ts`
- [x] 接入组件导出链（components / falcon-ui / global.d.ts）
- [x] 接入构建入口（`scripts/build/constants.mjs`）
- [x] 新增主题样式：`packages/theme/src/dialog.scss`
- [x] 接入主题入口：`packages/theme/index.scss`
- [x] 新增组件单测：`packages/components/dialog/__test__/dialog.test.ts`
- [x] 增加全屏忽略 bodyHeight 的回归测试
- [x] 更新 install 回归测试（components/falcon-ui）
- [x] 新增 docs 示例与组件文档（dialog）
- [x] 更新 docs 侧边栏与组件索引
- [x] 接入 API 元数据生成并产出 `fl-dialog.json`
- [x] 更新 playground 展示 `FlDialog`

### 质量门禁记录

- [x] `pnpm lint` 通过
- [x] `pnpm test` 通过
- [x] `pnpm build:lib:style` 通过
- [ ] `pnpm format:check` 未通过（仓库存在历史文件格式问题）
