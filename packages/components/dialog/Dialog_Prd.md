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

## 3. 功能需求

### FR-01 默认可拖拽

- 默认开启 `draggable`。
- 允许业务通过 attrs 覆盖。

### FR-02 自动销毁

- 默认开启 `destroy-on-close`。

### FR-03 Header 内置全屏与关闭

- Header 固定包含“全屏”和“关闭”按钮。
- 全屏仅内部切换 `fullscreen`。
- 关闭触发 `update:modelValue = false`。

### FR-04 Footer 内置取消与确认

- 默认渲染取消/确认按钮。
- 事件顺序：
  - 取消：`cancel` -> `update:modelValue(false)`
  - 确认：`confirm` -> `update:modelValue(false)`
- 支持：`showFooter`、`cancelText`、`confirmText`、`cancelDisabled`、`confirmDisabled`。
- 若存在 `#footer` 插槽，则覆盖内置 Footer。

### FR-05 Body 高度可控

- `bodyHeight: number | string`
- `number` 按 `px`，`string` 原样应用。

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
- 覆盖 ElDialog 原生 padding 为 0。
- 弹窗整体边框。
- Header/Footer 高度均为 `40px`。
- Header 带下边框，Footer 带上边框。

### FR-07 默认 Bounce 动画

- 使用 `transition` 默认启用 Bounce 动画。

### FR-08 屏幕居中

- 默认居中显示（垂直居中）。

### FR-09 样式文件约束

- Dialog 相关样式统一在 `packages/theme/src/dialog.scss`。

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

## 5. 开发完成标记

### 功能目标

- [x] FR-01 默认可拖拽
- [x] FR-02 自动销毁
- [x] FR-03 Header 内置全屏与关闭
- [x] FR-04 Footer 内置取消与确认
- [x] FR-05 Body 高度可控
- [x] FR-06 使用 `header-class/body-class/footer-class` 定义主体样式
- [x] FR-07 默认 Bounce 动画
- [x] FR-08 弹窗居中
- [x] FR-09 样式全部落在 `dialog.scss`

### 工程接入目标

- [x] 新增组件实现：`packages/components/dialog/src/dialog.ts`
- [x] 新增组件实现：`packages/components/dialog/src/dialog.vue`
- [x] 新增组件入口：`packages/components/dialog/index.ts`
- [x] 接入组件导出链（components / falcon-ui / global.d.ts）
- [x] 接入构建入口（`scripts/build/constants.mjs`）
- [x] 新增主题样式：`packages/theme/src/dialog.scss`
- [x] 接入主题入口：`packages/theme/index.scss`
- [x] 新增组件单测：`packages/components/dialog/__test__/dialog.test.ts`
- [x] 更新 install 回归测试（components/falcon-ui）
- [x] 新增 docs 示例与组件文档（dialog）
- [x] 更新 docs 侧边栏与组件索引
- [x] 接入 API 元数据生成并产出 `fl-dialog.json`
- [x] 更新 playground 展示 `FlDialog`

### 质量门禁记录

- [x] `pnpm lint` 通过
- [x] `pnpm test` 通过
- [x] `pnpm play:build` 通过
- [x] `pnpm docs:api` 通过
- [x] `pnpm docs:build` 通过
- [ ] `pnpm format:check` 未通过（仓库存在大量既有历史文件格式问题，非本次改动单独引入）
