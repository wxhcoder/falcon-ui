# FlRadialMenu 径向菜单设计文档

## 背景

`FlRadialMenu` 是一个参考设计图实现的径向工具菜单组件。它默认只展示中心圆，
在点击、hover、手动控制或全局快捷键触发后，以环形动画展开周围菜单项。

组件需要同时服务两类场景：

- 页面内常驻入口：中心圆作为普通组件出现在布局中。
- 快捷工具盘：通过全局快捷键在鼠标当前位置唤醒，关闭后整体消失。

当前仓库是 Vue 3、TypeScript、SCSS、pnpm monorepo 组件库。新组件需要遵循
现有 `packages/components/*`、`packages/theme/src/*.scss`、`docs/examples/*`
和 Vitest 测试组织方式。

## 目标

- 提供一个数据驱动的径向工具菜单组件。
- 默认仅渲染中心圆，展开时显示环形菜单和可选 More 下拉。
- 最多 6 个菜单项显示在圆环上，超过 6 个的项目收纳到 More 下拉中。
- 支持 inline 和 floating 两种展示形态。
- 支持 click、hover、manual 三种触发方式。
- 支持自定义全局快捷键唤醒 floating 菜单。
- 支持完整菜单可访问性，包括 ARIA、焦点管理、键盘导航和焦点回收。
- 支持中心圆内容自定义。
- 支持 hover/focus 时的扇形扫描区和当前圆环项高亮。
- 保持 Falcon UI 现有 BEM 命名、主题 SCSS 和安装导出风格。

## 非目标

- 不在第一版提供命令式服务，例如 `$radialMenu.open()`。
- 不支持无限层级径向子菜单。
- 不把每个菜单项的业务回调写进 `items.onClick`，统一通过组件事件派发。
- 不依赖外部图形库实现布局。环形坐标、扇形背景和动画由组件内部计算和 CSS 实现。

## 推荐方案

采用单组件内聚方案。`FlRadialMenu` 对外提供一个完整组件 API，内部按职责拆分
composable 和工具函数。

推荐内部结构：

```txt
packages/components/radial-menu/
  index.ts
  src/
    radial-menu.vue
    radial-menu.ts
    types.ts
    use-radial-menu-state.ts
    use-radial-menu-position.ts
    use-radial-menu-keyboard.ts
    use-radial-menu-shortcut.ts
    use-radial-menu-items.ts
  __test__/
    radial-menu.test.ts
```

配套样式与文档：

```txt
packages/theme/src/radial-menu.scss
docs/components/radial-menu.md
docs/examples/radial-menu/basic.vue
docs/examples/radial-menu/floating-shortcut.vue
docs/examples/radial-menu/more.vue
docs/examples/radial-menu/custom-center.vue
docs/examples/radial-menu/controlled.vue
```

## 组件 API

### Props

```ts
export interface FlRadialMenuItem {
  key: string | number
  label: string
  icon?: Component | string
  shortcut?: string
  disabled?: boolean
  hidden?: boolean
  divided?: boolean
  closeOnSelect?: boolean
  meta?: Record<string, unknown>
}

export type FlRadialMenuMode = 'inline' | 'floating'
export type FlRadialMenuTrigger = 'click' | 'hover' | 'manual'
export type FlRadialMenuMoreMode = 'ellipsis' | 'text' | 'text-ellipsis'
export type FlRadialMenuDropdownPlacement = 'bottom' | 'top'
```

建议 props：

```ts
items: FlRadialMenuItem[]

mode?: FlRadialMenuMode
trigger?: FlRadialMenuTrigger
modelValue?: boolean

shortcut?: string
shortcutEnabled?: boolean

centerIcon?: Component | string
centerLabel?: string
disabled?: boolean

maxRingItems?: number
closeOnSelect?: boolean

moreText?: string
moreMode?: FlRadialMenuMoreMode
moreDropdownPlacement?: FlRadialMenuDropdownPlacement

radius?: number
centerSize?: number
itemSize?: number

teleport?: boolean | string
zIndex?: number
```

默认值：

```ts
mode: 'inline'
trigger: 'click'
shortcutEnabled: true
disabled: false
maxRingItems: 6
closeOnSelect: true
moreText: 'More'
moreMode: 'text-ellipsis'
moreDropdownPlacement: 'bottom'
teleport: true
```

`maxRingItems` 可配置，但内部最大值固定为 6。小于 1 时按 1 处理。

### Slots

第一版必须支持中心圆 slot：

```vue
<template #center />
```

增强 slot：

```vue
<template #item="{ item, index, active, disabled }" />
<template #more="{ items, opened }" />
```

中心圆内容优先级：

1. `center` slot
2. `centerIcon`
3. `centerLabel`
4. 默认空圆

### Events

```ts
type FlRadialMenuOpenReason = 'click' | 'hover' | 'manual' | 'shortcut'
type FlRadialMenuCloseReason = 'click-outside' | 'select' | 'escape' | 'manual' | 'hover-leave'

interface FlRadialMenuSelectContext {
  source: 'ring' | 'more'
  index: number
  event: MouseEvent | KeyboardEvent
}
```

建议 emits：

```ts
'update:modelValue': (opened: boolean) => true
'open': (reason: FlRadialMenuOpenReason) => true
'close': (reason: FlRadialMenuCloseReason) => true
'select': (item: FlRadialMenuItem, context: FlRadialMenuSelectContext) => true
'active-change': (item: FlRadialMenuItem | null) => true
'more-open': () => true
'more-close': () => true
```

### Expose

```ts
open(options?: { x?: number; y?: number; reason?: FlRadialMenuOpenReason }): void
close(reason?: FlRadialMenuCloseReason): void
toggle(options?: { x?: number; y?: number; reason?: FlRadialMenuOpenReason }): void
focus(): void
```

`floating` 模式下，`open({ x, y })` 使用传入坐标作为中心点。全局快捷键触发时，
组件使用最近一次鼠标坐标作为默认打开位置。

## 数据处理

`items` 先经过可见性过滤，再切分为 ring 和 more 两组：

- `hidden=true` 的项不渲染，不参与焦点和选择。
- 前 `Math.min(maxRingItems, 6)` 个可见项进入圆环。
- 剩余可见项进入 More 下拉。
- `disabled=true` 的项可渲染，但不可点击、不可键盘激活。
- `closeOnSelect` 以 item 配置优先，未配置时使用组件级 `closeOnSelect`。

组件选择事件由内部统一处理：

1. 忽略 disabled 项。
2. 触发 `select`。
3. 根据最终 `closeOnSelect` 判断是否关闭菜单。
4. 若关闭，触发 `update:modelValue` 和 `close`。

## 展示模式

### Inline

`inline` 是默认模式。组件在文档流中渲染中心圆。关闭时只保留中心圆，展开时在
组件区域内显示圆环、扇形扫描区、More 和下拉。

### Floating

`floating` 模式关闭时不占位。打开时菜单容器定位到鼠标当前位置，适合画布、
编辑器或全局快捷工具盘。

行为要求：

- 默认 teleport 到 `body`。
- 使用 `position: fixed`。
- 以打开坐标作为中心圆位置。
- 展开前做视口边界修正，确保圆环和 More 下拉尽量不超出视口。
- 关闭后移除浮层内容。

## 触发方式

### Click

- 点击中心圆打开。
- 已打开时再次点击中心圆关闭。
- 点击菜单外部关闭。

### Hover

- 鼠标进入中心圆或菜单区域打开。
- 鼠标离开整体区域后延迟关闭。
- 延迟关闭需要可取消，避免从中心圆移动到菜单项时误关。

### Manual

- 不绑定中心圆 click 或 hover 展开逻辑。
- 只响应 `modelValue` 或 expose 方法。
- 仍保留键盘和内部关闭逻辑。

### Shortcut

全局快捷键用于唤醒 floating 菜单，也可以在 inline 模式下触发 `toggle`。

要求：

- 默认监听 `window`。
- 支持自定义快捷键字符串，例如 `Alt+W`、`Ctrl+Shift+K`。
- 快捷键监听仅在组件挂载后启用，卸载时清理。
- `shortcutEnabled=false` 时不监听。
- 当事件目标位于 `input`、`textarea`、`select` 或 `contenteditable` 内时不触发。
- 触发后阻止默认行为，避免和浏览器快捷键冲突时产生重复动作。
- 打开位置使用最近一次 `mousemove` 坐标。没有鼠标坐标时使用视口中心兜底。

## 布局与视觉

### 环形布局

- 圆环菜单最多展示 6 个 item。
- 少于 6 个 item 时按可见 ring 项均匀分布。
- 第一个 item 位于顶部，后续 item 顺时针排列。
- More 按钮固定在圆环正下方，不占用 ring 槽位。
- `radius` 控制中心点到环形 item 中心点的距离。
- `centerSize` 控制中心圆直径。
- `itemSize` 控制环形 item 直径。

坐标计算：

```ts
angle = startAngle + step * index
x = Math.cos(angle) * radius
y = Math.sin(angle) * radius
```

默认 `startAngle` 为 -90 度，即第一项在顶部。

### 动画

展开动画：

- 轨道淡入。
- item 从中心点向目标位置位移。
- item 同时从 `scale(0.6)` 到 `scale(1)`，opacity 从 0 到 1。
- 可按 index 设置轻微 stagger，使展开更有环状扫描感。

关闭动画：

- item 回到中心点并淡出。
- 轨道和扇形扫描区淡出。

动效原则：

- 使用 `transform` 和 `opacity`，避免频繁触发布局。
- 支持 `prefers-reduced-motion: reduce`，关闭位移动画和 stagger。

### Hover 与 Focus 高亮

当鼠标 hover 或键盘 focus 到某个 ring item 时：

- 当前 item 显示蓝色描边和强调色。
- 圆环轨道对应位置高亮。
- 背景显示低透明蓝色扇形扫描区。
- 当前 item 的 label 或快捷键信息高亮。

扇形扫描区可以用 SVG path 或 CSS `clip-path` 实现。第一版推荐 SVG 层：

- 尺寸固定为展开菜单外接矩形。
- 根据当前 item 的角度和 ring item 数量计算扇区 path。
- SVG 层设置 `pointer-events: none`。
- 由 CSS 控制透明度和过渡。

### More

当 more 项数量大于 0 时显示 More 按钮：

- `moreMode="ellipsis"` 显示 `...`。
- `moreMode="text"` 显示 `moreText`。
- `moreMode="text-ellipsis"` 显示 `${moreText} ...`。

点击 More 或通过键盘激活 More 后，显示下拉列表：

- 下拉默认在 More 下方。
- `moreDropdownPlacement="top"` 时显示在 More 上方。
- More 下拉项展示 label、icon、shortcut 和 disabled 状态。
- 点击下拉项后触发同一个 `select` 事件，`context.source` 为 `more`。
- 默认选择后关闭整个径向菜单。

## 可访问性

### 语义

- 中心圆使用 `button`。
- 中心圆设置 `aria-haspopup="menu"`。
- 中心圆设置 `aria-expanded` 表示展开状态。
- 展开容器使用 `role="menu"`。
- 菜单项使用 `role="menuitem"`。
- disabled 项设置 `aria-disabled="true"`。
- More 按钮使用 `aria-haspopup="menu"` 和 `aria-expanded`。

### 焦点

- 打开后焦点进入第一个可用 ring item。
- 如果没有可用 ring item，但存在可用 More 项，焦点进入 More。
- disabled 项跳过焦点。
- 关闭后焦点回到触发元素。
- floating 快捷键唤醒且没有明确触发元素时，关闭后不强制抢焦点。

### 键盘

- `Enter` 和 `Space` 激活当前项。
- `Esc` 关闭 More 下拉。More 未打开时关闭整个菜单。
- `ArrowLeft` 和 `ArrowRight` 在 ring item 间前后移动。
- `ArrowUp` 和 `ArrowDown` 按视觉方向移动，More 下拉打开时切换为列表导航。
- `Tab` 按 roving tabindex 管理菜单内焦点，避免焦点落到隐藏或 disabled 项。

## BEM 与编码规范

所有 Vue、TSX 和 SCSS 代码必须遵循 Falcon UI 已有 BEM 工具，不允许手写
`fl-radial-menu` 及其元素、修饰符类名字符串。

运行时代码约束：

- Vue 和 TSX 文件统一从 `@falcon-ui/utils` 引入 `useNamespace`。
- 组件根作用域使用 `const ns = useNamespace('radial-menu')`。
- block 类名使用 `ns.b()`。
- element 类名使用 `ns.e('item')`、`ns.e('center')` 等。
- modifier 类名使用 `ns.m('floating')` 或组合函数。
- 状态类使用 `ns.is('opened', opened)`、`ns.is('active', active)`。

示例：

```ts
const ns = useNamespace('radial-menu')

const rootClass = computed(() => [
  ns.b(),
  ns.m(props.mode),
  ns.is('opened', opened.value),
  ns.is('disabled', props.disabled)
])
```

SCSS 约束：

- `packages/theme/src/radial-menu.scss` 必须使用 `@use './mixins/bem.scss' as bem;`。
- block 选择器使用 `@include bem.b(radial-menu)`。
- element 选择器使用 `@include bem.e(center)`、`@include bem.e(item)`。
- modifier 选择器使用 `@include bem.m(floating)`。
- 状态选择器使用 `@include bem.when(opened)` 或 `.is-opened`。
- 跨元素选择器使用 `#{bem.selector('radial-menu', 'item')}`。
- 不允许直接手写 `.fl-radial-menu__item` 等完整类名。

示例：

```scss
@use './mixins/bem.scss' as bem;

@include bem.b(radial-menu) {
  @include bem.e(center) {
    // center style
  }

  @include bem.e(item) {
    @include bem.when(active) {
      // active item style
    }
  }
}
```

这条约束需要进入测试：

- 测试组件源码包含 `useNamespace('radial-menu')`。
- 测试 SCSS 源码包含 `@include bem.b(radial-menu)`。
- 测试 SCSS 源码包含关键元素的 `@include bem.e(...)`。

## 样式变量

建议在 `radial-menu.scss` 内定义以下 CSS 变量：

```scss
--fl-radial-menu-primary-color
--fl-radial-menu-track-color
--fl-radial-menu-active-bg-color
--fl-radial-menu-active-ring-color
--fl-radial-menu-center-size
--fl-radial-menu-item-size
--fl-radial-menu-radius
--fl-radial-menu-duration
--fl-radial-menu-easing
--fl-radial-menu-z-index
```

默认视觉：

- 中心圆白底、蓝色描边。
- 当前激活项使用蓝色描边和蓝色文本。
- 扇形扫描区使用低透明蓝色。
- 非激活 item 使用白底、浅灰边框。
- label 使用浅灰胶囊背景。
- shortcut 使用更小的独立胶囊。

## 测试计划

单元测试覆盖：

- 默认只渲染中心圆。
- `trigger="click"` 可以打开和关闭。
- `trigger="manual"` 不响应中心圆 click。
- `modelValue` 受控模式可以同步展开状态。
- `items.length <= 6` 时全部进入 ring。
- `items.length > 6` 时前 6 项进入 ring，剩余项进入 More。
- `hidden` 项不渲染。
- `disabled` 项不可点击，不可键盘激活。
- 选择 ring item 触发 `select`，默认关闭菜单。
- 选择 More item 触发 `select`，`context.source` 为 `more`。
- `closeOnSelect=false` 时选择后保持展开。
- `Esc` 关闭菜单。
- 方向键移动焦点并跳过 disabled 项。
- 快捷键可打开 floating 菜单。
- 快捷键在输入区域不触发。
- BEM 使用约束测试。

可选测试：

- `prefers-reduced-motion` 下不依赖动画完成事件才能完成交互。
- floating 模式靠近视口边缘时执行边界修正。

## 文档示例

### 基础用法

展示 inline 模式，点击中心圆展开菜单。

### Hover 展开

展示 `trigger="hover"`，说明离开菜单区域后自动关闭。

### 快捷键浮层

展示 `mode="floating"` 和 `shortcut="Alt+W"`，说明在鼠标当前位置唤醒。

### More 菜单

展示超过 6 个 item 后 More 的渲染和下拉选择。

### 自定义中心圆

展示 `center` slot 和 `centerIcon` 两种方式。

### 受控模式

展示 `v-model` 控制展开状态，以及 `open / close / toggle` expose 方法。

## 验收标准

- 新组件可通过 `FlRadialMenu` 从 `@falcon-ui/components` 和 `falcon-ui` 导出。
- 样式被纳入主题构建输出。
- 文档站包含 RadialMenu 组件文档和示例。
- Play 或 docs 示例能演示 inline、floating、More、custom center 和 controlled。
- 单元测试覆盖核心交互、快捷键、More、可访问性和 BEM 约束。
- `pnpm test`、`pnpm lint`、`pnpm typecheck` 通过。
