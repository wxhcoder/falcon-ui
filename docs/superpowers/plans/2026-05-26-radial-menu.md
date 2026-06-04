# FlRadialMenu 径向菜单实现计划

> **给 agentic 执行者：** 必须使用子技能 `superpowers:subagent-driven-development`
> （推荐）或 `superpowers:executing-plans`，按任务逐项执行本计划。每个步骤使用
> checkbox（`- [ ]`）跟踪完成状态。

**目标：** 构建 `FlRadialMenu` 数据驱动径向菜单。先完成中心圆和基础环状展示，再逐步补齐
More、可访问性、floating 快捷键、导出链路和文档。

**架构：** 实现一个可安装的 Vue 3 组件，内部按 items、geometry、state、keyboard、shortcut
拆分小型 composable。视觉层集中在 `radial-menu.vue` 和
`packages/theme/src/radial-menu.scss`，运行时类名和 SCSS 选择器都必须使用 Falcon UI
已有 BEM 工具生成。

**技术栈：** Vue 3 `<script setup>`、TypeScript、Vitest、Vue Test Utils、SCSS、Falcon UI
`withInstall`、`useNamespace`、VitePress demo 文档。

---

## 阶段总览

1. **基础层：** 创建类型定义、菜单项拆分和环形坐标纯函数。
2. **基础环状展示：** 渲染中心圆、inline 环状菜单项，并支持 click/manual 展开状态。
3. **视觉层：** 增加 BEM SCSS、过渡动画、激活项和扇形高亮。
4. **More 菜单：** 拆分溢出项，实现底部 More 按钮和下拉菜单。
5. **可访问性：** 增加 ARIA、焦点管理、键盘导航和关闭行为。
6. **Floating 快捷键：** 增加 floating 模式、视口定位和全局快捷键唤醒。
7. **导出与构建：** 接入组件导出、package metadata、全局类型、主题和 api meta。
8. **文档与验证：** 增加示例、组件文档、侧边栏入口和完整质量检查。

## 文件清单

- 新建 `packages/components/radial-menu/src/types.ts`：公共 item、mode、trigger、event、expose
  类型。
- 新建 `packages/components/radial-menu/src/radial-menu.ts`：props、emits、默认值和公共类型别名。
- 新建 `packages/components/radial-menu/src/use-radial-menu-items.ts`：可见项过滤、ring/more
  拆分和 disabled 判断。
- 新建 `packages/components/radial-menu/src/use-radial-menu-position.ts`：环形坐标和扇形 path
  计算。
- 新建 `packages/components/radial-menu/src/use-radial-menu-state.ts`：受控/非受控展开状态和选择后关闭行为。
- 新建 `packages/components/radial-menu/src/use-radial-menu-keyboard.ts`：焦点顺序和键盘处理。
- 新建 `packages/components/radial-menu/src/use-radial-menu-shortcut.ts`：全局快捷键解析、编辑区拦截和鼠标坐标记录。
- 新建 `packages/components/radial-menu/src/radial-menu.vue`：组件模板和交互。
- 新建 `packages/components/radial-menu/index.ts`：install 包装和类型导出。
- 新建 `packages/components/radial-menu/__test__/radial-menu.test.ts`：组件和 helper 测试。
- 新建 `packages/theme/src/radial-menu.scss`：BEM SCSS 和 CSS 变量。
- 修改 `packages/theme/index.scss`：接入 radial menu 样式。
- 修改 `packages/components/index.ts`：导出 `FlRadialMenu` 和类型。
- 修改 `packages/components/package.json`：增加 `./radial-menu` export。
- 修改 `packages/falcon-ui/index.ts`：在全局插件中注册 `FlRadialMenu`。
- 修改 `packages/falcon-ui/global.d.ts`：增加全局组件类型。
- 修改 `packages/components/__test__/install.test.ts`：断言单组件可安装导出。
- 修改 `packages/falcon-ui/__test__/install.test.ts`：断言根插件注册。
- 修改 `scripts/build/constants.mjs`：增加 radial menu 构建入口。
- 修改 `scripts/build/build-meta.mjs`：增加 `./components/radial-menu` 发布导出。
- 修改 `scripts/docs/generate-api-meta.mjs`：增加 `fl-radial-menu` api 目标。
- 新建 `docs/components/radial-menu.md`：组件文档页。
- 新建 `docs/examples/radial-menu/basic.vue`：基础 inline click 示例。
- 新建 `docs/examples/radial-menu/floating-shortcut.vue`：floating 快捷键示例。
- 新建 `docs/examples/radial-menu/more.vue`：More 下拉示例。
- 新建 `docs/examples/radial-menu/custom-center.vue`：自定义中心圆示例。
- 新建 `docs/examples/radial-menu/controlled.vue`：受控 `v-model` 示例。
- 修改 `docs/.vitepress/config.ts`：侧边栏入口。
- 修改 `docs/index.md`：当前文档范围列表。

## 任务 1：基础类型与纯函数

**Files:**

- 新建：`packages/components/radial-menu/src/types.ts`
- 新建：`packages/components/radial-menu/src/radial-menu.ts`
- 新建：`packages/components/radial-menu/src/use-radial-menu-items.ts`
- 新建：`packages/components/radial-menu/src/use-radial-menu-position.ts`
- 新建：`packages/components/radial-menu/__test__/radial-menu.test.ts`

- [ ] **步骤 1：编写菜单项拆分和几何计算的失败测试**

新增这个初始测试文件：

```ts
import { describe, expect, it } from 'vitest'
import { splitRadialMenuItems } from '../src/use-radial-menu-items'
import { getRadialMenuItemLayout, getRadialMenuSectorPath } from '../src/use-radial-menu-position'
import type { FlRadialMenuItem } from '../src/types'

const createItems = (count: number): FlRadialMenuItem[] =>
  Array.from({ length: count }, (_, index) => ({
    key: `item-${index + 1}`,
    label: `Item ${index + 1}`
  }))

describe('radial menu helpers', () => {
  it('filters hidden items and limits ring items to six', () => {
    const items = [
      ...createItems(3),
      { key: 'hidden', label: 'Hidden', hidden: true },
      ...createItems(5).map((item) => ({
        ...item,
        key: `extra-${item.key}`
      }))
    ]

    const result = splitRadialMenuItems(items, 10)

    expect(result.visibleItems.map((item) => item.key)).not.toContain('hidden')
    expect(result.ringItems).toHaveLength(6)
    expect(result.moreItems).toHaveLength(2)
  })

  it('clamps max ring items between one and six', () => {
    expect(splitRadialMenuItems(createItems(3), 0).ringItems).toHaveLength(1)
    expect(splitRadialMenuItems(createItems(8), 99).ringItems).toHaveLength(6)
  })

  it('places the first ring item at the top of the circle', () => {
    const layout = getRadialMenuItemLayout({
      count: 4,
      index: 0,
      radius: 96
    })

    expect(Math.round(layout.x)).toBe(0)
    expect(Math.round(layout.y)).toBe(-96)
    expect(layout.angle).toBe(-90)
  })

  it('creates a sector path for the active ring item', () => {
    const path = getRadialMenuSectorPath({
      activeIndex: 0,
      count: 6,
      innerRadius: 36,
      outerRadius: 112
    })

    expect(path).toMatch(/^M /)
    expect(path).toContain('A 112 112')
    expect(path).toContain('A 36 36')
    expect(path.endsWith(' Z')).toBe(true)
  })
})
```

- [ ] **步骤 2：运行 helper 测试并确认失败**

运行：

```bash
pnpm exec vitest run packages/components/radial-menu/__test__/radial-menu.test.ts
```

预期：FAIL，因为 `use-radial-menu-items`、`use-radial-menu-position` 和 `types` 还不存在。

- [ ] **步骤 3：新增公共类型**

创建 `packages/components/radial-menu/src/types.ts`：

```ts
import type { Component } from 'vue'

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
export type FlRadialMenuOpenReason = 'click' | 'hover' | 'manual' | 'shortcut'
export type FlRadialMenuCloseReason =
  | 'click-outside'
  | 'select'
  | 'escape'
  | 'manual'
  | 'hover-leave'

export interface FlRadialMenuOpenOptions {
  x?: number
  y?: number
  reason?: FlRadialMenuOpenReason
}

export interface FlRadialMenuSelectContext {
  source: 'ring' | 'more'
  index: number
  event: MouseEvent | KeyboardEvent
}

export interface FlRadialMenuExpose {
  open: (options?: FlRadialMenuOpenOptions) => void
  close: (reason?: FlRadialMenuCloseReason) => void
  toggle: (options?: FlRadialMenuOpenOptions) => void
  focus: () => void
}
```

- [ ] **步骤 4：新增 props 和 emits 定义**

创建 `packages/components/radial-menu/src/radial-menu.ts`：

```ts
import type { ExtractPublicPropTypes, PropType } from 'vue'
import type {
  FlRadialMenuCloseReason,
  FlRadialMenuDropdownPlacement,
  FlRadialMenuItem,
  FlRadialMenuMode,
  FlRadialMenuMoreMode,
  FlRadialMenuOpenReason,
  FlRadialMenuSelectContext,
  FlRadialMenuTrigger
} from './types'

export const flRadialMenuProps = {
  items: {
    type: Array as PropType<FlRadialMenuItem[]>,
    default: () => []
  },
  mode: {
    type: String as PropType<FlRadialMenuMode>,
    default: 'inline'
  },
  trigger: {
    type: String as PropType<FlRadialMenuTrigger>,
    default: 'click'
  },
  modelValue: {
    type: Boolean,
    default: undefined
  },
  shortcut: {
    type: String,
    default: ''
  },
  shortcutEnabled: {
    type: Boolean,
    default: true
  },
  centerIcon: {
    type: [Object, String] as PropType<FlRadialMenuItem['icon']>,
    default: undefined
  },
  centerLabel: {
    type: String,
    default: ''
  },
  disabled: {
    type: Boolean,
    default: false
  },
  maxRingItems: {
    type: Number,
    default: 6
  },
  closeOnSelect: {
    type: Boolean,
    default: true
  },
  moreText: {
    type: String,
    default: 'More'
  },
  moreMode: {
    type: String as PropType<FlRadialMenuMoreMode>,
    default: 'text-ellipsis'
  },
  moreDropdownPlacement: {
    type: String as PropType<FlRadialMenuDropdownPlacement>,
    default: 'bottom'
  },
  radius: {
    type: Number,
    default: 96
  },
  centerSize: {
    type: Number,
    default: 56
  },
  itemSize: {
    type: Number,
    default: 44
  },
  teleport: {
    type: [Boolean, String],
    default: true
  },
  zIndex: {
    type: Number,
    default: 2000
  }
} as const

export const flRadialMenuEmits = {
  'update:modelValue': (opened: boolean) => typeof opened === 'boolean',
  open: (reason: FlRadialMenuOpenReason) => typeof reason === 'string',
  close: (reason: FlRadialMenuCloseReason) => typeof reason === 'string',
  select: (item: FlRadialMenuItem, context: FlRadialMenuSelectContext) =>
    item !== undefined && context !== undefined,
  'active-change': (item: FlRadialMenuItem | null) => item === null || item !== undefined,
  'more-open': () => true,
  'more-close': () => true
} as const

export type FlRadialMenuProps = ExtractPublicPropTypes<typeof flRadialMenuProps>
export type FlRadialMenuEmits = typeof flRadialMenuEmits
export type RadialMenuProps = FlRadialMenuProps
export type RadialMenuEmits = FlRadialMenuEmits

export type {
  FlRadialMenuCloseReason,
  FlRadialMenuDropdownPlacement,
  FlRadialMenuExpose,
  FlRadialMenuItem,
  FlRadialMenuMode,
  FlRadialMenuMoreMode,
  FlRadialMenuOpenOptions,
  FlRadialMenuOpenReason,
  FlRadialMenuSelectContext,
  FlRadialMenuTrigger
} from './types'
```

- [ ] **步骤 5：新增菜单项拆分 helper**

创建 `packages/components/radial-menu/src/use-radial-menu-items.ts`：

```ts
import type { FlRadialMenuItem } from './types'

export interface RadialMenuSplitItems {
  visibleItems: FlRadialMenuItem[]
  ringItems: FlRadialMenuItem[]
  moreItems: FlRadialMenuItem[]
  ringLimit: number
}

export const clampRingItemCount = (maxRingItems: number) => {
  if (!Number.isFinite(maxRingItems)) {
    return 6
  }

  return Math.min(Math.max(Math.trunc(maxRingItems), 1), 6)
}

export const splitRadialMenuItems = (
  items: FlRadialMenuItem[],
  maxRingItems: number
): RadialMenuSplitItems => {
  const ringLimit = clampRingItemCount(maxRingItems)
  const visibleItems = items.filter((item) => !item.hidden)

  return {
    visibleItems,
    ringItems: visibleItems.slice(0, ringLimit),
    moreItems: visibleItems.slice(ringLimit),
    ringLimit
  }
}

export const isRadialMenuItemDisabled = (item: FlRadialMenuItem | undefined) =>
  item?.disabled === true
```

- [ ] **步骤 6：新增几何计算 helper**

创建 `packages/components/radial-menu/src/use-radial-menu-position.ts`：

```ts
export interface RadialMenuItemLayoutOptions {
  count: number
  index: number
  radius: number
  startAngle?: number
}

export interface RadialMenuItemLayout {
  angle: number
  x: number
  y: number
}

export interface RadialMenuSectorPathOptions {
  activeIndex: number
  count: number
  innerRadius: number
  outerRadius: number
  startAngle?: number
}

const toRadians = (degree: number) => (degree * Math.PI) / 180

const pointOnCircle = (radius: number, angle: number) => {
  const radians = toRadians(angle)

  return {
    x: Math.cos(radians) * radius,
    y: Math.sin(radians) * radius
  }
}

export const getRadialMenuItemLayout = ({
  count,
  index,
  radius,
  startAngle = -90
}: RadialMenuItemLayoutOptions): RadialMenuItemLayout => {
  const safeCount = Math.max(count, 1)
  const angle = startAngle + (360 / safeCount) * index
  const point = pointOnCircle(radius, angle)

  return {
    angle,
    x: point.x,
    y: point.y
  }
}

export const getRadialMenuSectorPath = ({
  activeIndex,
  count,
  innerRadius,
  outerRadius,
  startAngle = -90
}: RadialMenuSectorPathOptions) => {
  const safeCount = Math.max(count, 1)
  const sectorAngle = 360 / safeCount
  const gap = Math.min(6, sectorAngle / 4)
  const centerAngle = startAngle + sectorAngle * activeIndex
  const start = centerAngle - sectorAngle / 2 + gap
  const end = centerAngle + sectorAngle / 2 - gap
  const outerStart = pointOnCircle(outerRadius, start)
  const outerEnd = pointOnCircle(outerRadius, end)
  const innerEnd = pointOnCircle(innerRadius, end)
  const innerStart = pointOnCircle(innerRadius, start)
  const largeArcFlag = end - start > 180 ? 1 : 0

  return [
    `M ${outerStart.x.toFixed(3)} ${outerStart.y.toFixed(3)}`,
    `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${outerEnd.x.toFixed(3)} ${outerEnd.y.toFixed(3)}`,
    `L ${innerEnd.x.toFixed(3)} ${innerEnd.y.toFixed(3)}`,
    `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${innerStart.x.toFixed(3)} ${innerStart.y.toFixed(3)}`,
    'Z'
  ].join(' ')
}
```

- [ ] **步骤 7：运行 helper 测试并提交**

运行：

```bash
pnpm exec vitest run packages/components/radial-menu/__test__/radial-menu.test.ts
```

预期：helper 测试 PASS。

提交：

```bash
git add packages/components/radial-menu
git commit -m "Add radial menu foundation helpers"
```

## 任务 2：基础环状展示

**Files:**

- 新建：`packages/components/radial-menu/src/use-radial-menu-state.ts`
- 新建：`packages/components/radial-menu/src/radial-menu.vue`
- 新建：`packages/components/radial-menu/index.ts`
- 修改：`packages/components/radial-menu/__test__/radial-menu.test.ts`

- [ ] **步骤 1：新增基础 inline 展示的失败测试**

追加这些 import 和测试：

```ts
import { mount } from '@vue/test-utils'
import RadialMenu from '../src/radial-menu.vue'

describe('FlRadialMenu basic ring display', () => {
  it('renders only the center button before opening', () => {
    const wrapper = mount(RadialMenu, {
      props: {
        items: createItems(3),
        centerLabel: 'Tools'
      }
    })

    expect(wrapper.get('button').classes()).toContain('fl-radial-menu__center')
    expect(wrapper.get('button').text()).toContain('Tools')
    expect(wrapper.findAll('[role="menuitem"]')).toHaveLength(0)
  })

  it('opens ring items on center click', async () => {
    const wrapper = mount(RadialMenu, {
      props: {
        items: createItems(3)
      }
    })

    await wrapper.get('button').trigger('click')

    expect(wrapper.classes()).toContain('is-opened')
    expect(wrapper.findAll('[role="menuitem"]')).toHaveLength(3)
    expect(wrapper.find('[data-radial-menu-key="item-1"]').attributes('style')).toContain(
      '--fl-radial-menu-item-x'
    )
  })

  it('does not open from center click in manual trigger mode', async () => {
    const wrapper = mount(RadialMenu, {
      props: {
        items: createItems(2),
        trigger: 'manual'
      }
    })

    await wrapper.get('button').trigger('click')

    expect(wrapper.findAll('[role="menuitem"]')).toHaveLength(0)
  })

  it('supports controlled modelValue', async () => {
    const wrapper = mount(RadialMenu, {
      props: {
        items: createItems(2),
        modelValue: true
      }
    })

    expect(wrapper.findAll('[role="menuitem"]')).toHaveLength(2)

    await wrapper.setProps({ modelValue: false })

    expect(wrapper.findAll('[role="menuitem"]')).toHaveLength(0)
  })
})
```

- [ ] **步骤 2：运行测试并确认失败**

运行：

```bash
pnpm exec vitest run packages/components/radial-menu/__test__/radial-menu.test.ts
```

预期：FAIL，因为 `radial-menu.vue` 还不存在。

- [ ] **步骤 3：新增展开状态 composable**

创建 `packages/components/radial-menu/src/use-radial-menu-state.ts`：

```ts
import { computed, ref, type Ref } from 'vue'
import type { FlRadialMenuCloseReason, FlRadialMenuOpenOptions } from './types'

export interface UseRadialMenuStateOptions {
  modelValue: Ref<boolean | undefined>
  disabled: Ref<boolean>
  emitUpdate: (opened: boolean) => void
}

export const useRadialMenuState = ({
  modelValue,
  disabled,
  emitUpdate
}: UseRadialMenuStateOptions) => {
  const uncontrolledOpened = ref(false)
  const floatingX = ref<number | undefined>()
  const floatingY = ref<number | undefined>()
  const isControlled = computed(() => modelValue.value !== undefined)
  const opened = computed(() =>
    isControlled.value ? modelValue.value === true : uncontrolledOpened.value
  )

  const setOpened = (nextOpened: boolean) => {
    if (disabled.value && nextOpened) {
      return
    }

    if (!isControlled.value) {
      uncontrolledOpened.value = nextOpened
    }

    emitUpdate(nextOpened)
  }

  const open = (options: FlRadialMenuOpenOptions = {}) => {
    if (options.x !== undefined) {
      floatingX.value = options.x
    }

    if (options.y !== undefined) {
      floatingY.value = options.y
    }

    setOpened(true)
  }

  const close = (_reason: FlRadialMenuCloseReason = 'manual') => {
    setOpened(false)
  }

  const toggle = (options: FlRadialMenuOpenOptions = {}) => {
    if (opened.value) {
      close('manual')
    } else {
      open(options)
    }
  }

  return {
    opened,
    floatingX,
    floatingY,
    open,
    close,
    toggle
  }
}
```

- [ ] **步骤 4：新增基础 Vue 组件**

创建 `packages/components/radial-menu/src/radial-menu.vue`：

```vue
<template>
  <div
    :class="rootClass"
    :style="rootStyle"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave">
    <button
      ref="centerRef"
      type="button"
      :class="ns.e('center')"
      :disabled="disabled"
      :aria-expanded="String(opened)"
      aria-haspopup="menu"
      @click="handleCenterClick">
      <slot name="center">
        <component v-if="centerIcon && typeof centerIcon !== 'string'" :is="centerIcon" />
        <span v-else-if="centerIcon" :class="ns.e('center-icon')">{{ centerIcon }}</span>
        <span v-if="centerLabel" :class="ns.e('center-label')">{{ centerLabel }}</span>
      </slot>
    </button>

    <div v-if="opened" :class="ns.e('panel')" role="menu">
      <button
        v-for="(item, index) in ringItems"
        :key="item.key"
        type="button"
        role="menuitem"
        :class="[ns.e('item'), ns.is('disabled', item.disabled)]"
        :style="getItemStyle(index)"
        :disabled="item.disabled"
        :data-radial-menu-key="item.key">
        <component v-if="item.icon && typeof item.icon !== 'string'" :is="item.icon" />
        <span v-else-if="item.icon" :class="ns.e('item-icon')">{{ item.icon }}</span>
        <span :class="ns.e('item-label')">{{ item.label }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, toRef, useTemplateRef } from 'vue'
import { useNamespace } from '@falcon-ui/utils'
import { flRadialMenuEmits, flRadialMenuProps } from './radial-menu'
import { splitRadialMenuItems } from './use-radial-menu-items'
import { getRadialMenuItemLayout } from './use-radial-menu-position'
import { useRadialMenuState } from './use-radial-menu-state'
import type { FlRadialMenuExpose, FlRadialMenuOpenOptions } from './types'

defineOptions({
  name: 'FlRadialMenu'
})

const props = defineProps(flRadialMenuProps)
const emit = defineEmits(flRadialMenuEmits)
const ns = useNamespace('radial-menu')
const centerRef = useTemplateRef<HTMLButtonElement>('centerRef')

const splitItems = computed(() => splitRadialMenuItems(props.items, props.maxRingItems))
const ringItems = computed(() => splitItems.value.ringItems)

const { opened, open, close, toggle } = useRadialMenuState({
  modelValue: toRef(props, 'modelValue'),
  disabled: toRef(props, 'disabled'),
  emitUpdate: (nextOpened) => emit('update:modelValue', nextOpened)
})

const rootClass = computed(() => [
  ns.b(),
  ns.m(props.mode),
  ns.is('opened', opened.value),
  ns.is('disabled', props.disabled)
])

const rootStyle = computed(() => ({
  '--fl-radial-menu-radius': `${props.radius}px`,
  '--fl-radial-menu-center-size': `${props.centerSize}px`,
  '--fl-radial-menu-item-size': `${props.itemSize}px`,
  '--fl-radial-menu-z-index': String(props.zIndex)
}))

const getItemStyle = (index: number) => {
  const layout = getRadialMenuItemLayout({
    count: ringItems.value.length,
    index,
    radius: props.radius
  })

  return {
    '--fl-radial-menu-item-x': `${layout.x}px`,
    '--fl-radial-menu-item-y': `${layout.y}px`,
    '--fl-radial-menu-item-index': String(index)
  }
}

const handleCenterClick = () => {
  if (props.disabled || props.trigger !== 'click') {
    return
  }

  toggle({ reason: 'click' })
}

const handleMouseEnter = () => {
  if (props.disabled || props.trigger !== 'hover') {
    return
  }

  open({ reason: 'hover' })
}

const handleMouseLeave = () => {
  if (props.trigger !== 'hover') {
    return
  }

  close('hover-leave')
}

const focus = () => {
  centerRef.value?.focus()
}

defineExpose<FlRadialMenuExpose>({
  open: (options?: FlRadialMenuOpenOptions) => open(options),
  close,
  toggle,
  focus
})
</script>
```

- [ ] **步骤 5：新增组件安装入口**

创建 `packages/components/radial-menu/index.ts`：

```ts
import RadialMenu from './src/radial-menu.vue'
import { withInstall } from '@falcon-ui/utils'

export const FlRadialMenu = withInstall(RadialMenu)

export default FlRadialMenu

export type {
  FlRadialMenuCloseReason,
  FlRadialMenuDropdownPlacement,
  FlRadialMenuEmits,
  FlRadialMenuExpose,
  FlRadialMenuItem,
  FlRadialMenuMode,
  FlRadialMenuMoreMode,
  FlRadialMenuOpenOptions,
  FlRadialMenuOpenReason,
  FlRadialMenuProps,
  FlRadialMenuSelectContext,
  FlRadialMenuTrigger,
  RadialMenuEmits,
  RadialMenuProps
} from './src/radial-menu'
```

- [ ] **步骤 6：运行基础环状展示测试并提交**

运行：

```bash
pnpm exec vitest run packages/components/radial-menu/__test__/radial-menu.test.ts
```

预期：helper 和基础环状展示测试 PASS。

提交：

```bash
git add packages/components/radial-menu
git commit -m "Add radial menu basic ring display"
```

## 任务 3：视觉层与激活扇区

**Files:**

- 新建：`packages/theme/src/radial-menu.scss`
- 修改：`packages/theme/index.scss`
- 修改：`packages/components/radial-menu/src/radial-menu.vue`
- 修改：`packages/components/radial-menu/__test__/radial-menu.test.ts`

- [ ] **步骤 1：新增 BEM 源码约束和激活状态的失败测试**

追加：

```ts
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const readProjectFile = (relativePath: string) =>
  readFileSync(resolve(process.cwd(), relativePath), 'utf8')

describe('FlRadialMenu styles and active sector', () => {
  it('uses Falcon BEM helpers in Vue and SCSS sources', () => {
    const vueSource = readProjectFile('packages/components/radial-menu/src/radial-menu.vue')
    const scssSource = readProjectFile('packages/theme/src/radial-menu.scss')

    expect(vueSource).toContain("useNamespace('radial-menu')")
    expect(scssSource).toContain('@include bem.b(radial-menu)')
    expect(scssSource).toContain('@include bem.e(center)')
    expect(scssSource).toContain('@include bem.e(item)')
    expect(scssSource).not.toContain('.fl-radial-menu__item')
  })

  it('sets active item and sector on hover', async () => {
    const wrapper = mount(RadialMenu, {
      props: {
        items: createItems(3),
        modelValue: true
      }
    })

    await wrapper.find('[data-radial-menu-key="item-2"]').trigger('mouseenter')

    expect(wrapper.find('[data-radial-menu-key="item-2"]').classes()).toContain('is-active')
    expect(wrapper.find('.fl-radial-menu__sector-path').exists()).toBe(true)
    expect(wrapper.emitted('active-change')?.[0]?.[0]).toMatchObject({ key: 'item-2' })
  })
})
```

- [ ] **步骤 2：运行测试并确认失败**

运行：

```bash
pnpm exec vitest run packages/components/radial-menu/__test__/radial-menu.test.ts
```

预期：FAIL，因为 `radial-menu.scss` 和激活扇区渲染还不存在。

- [ ] **步骤 3：新增激活项和扇区渲染**

在 `packages/components/radial-menu/src/radial-menu.vue` 中增加激活状态：

```ts
const activeRingIndex = ref<number | null>(null)

const activeItem = computed(() =>
  activeRingIndex.value === null ? null : (ringItems.value[activeRingIndex.value] ?? null)
)

const sectorPath = computed(() => {
  if (activeRingIndex.value === null || ringItems.value.length === 0) {
    return ''
  }

  return getRadialMenuSectorPath({
    activeIndex: activeRingIndex.value,
    count: ringItems.value.length,
    innerRadius: props.centerSize / 2 + 8,
    outerRadius: props.radius + props.itemSize / 2 + 14
  })
})

const setActiveRingIndex = (index: number | null) => {
  activeRingIndex.value = index
  emit('active-change', activeItem.value)
}
```

更新 imports：

```ts
import { computed, ref, toRef, useTemplateRef } from 'vue'
import { getRadialMenuItemLayout, getRadialMenuSectorPath } from './use-radial-menu-position'
```

在 panel 内、item 按钮前增加 SVG 层：

```vue
<svg v-if="sectorPath" :class="ns.e('sector')" viewBox="-140 -140 280 280" aria-hidden="true">
  <path :class="ns.e('sector-path')" :d="sectorPath" />
</svg>
```

更新 item 按钮绑定：

```vue
:class="[ns.e('item'), ns.is('active', activeRingIndex === index), ns.is('disabled',
item.disabled)]" @mouseenter="setActiveRingIndex(index)" @focus="setActiveRingIndex(index)"
@mouseleave="setActiveRingIndex(null)"
```

- [ ] **步骤 4：新增 BEM SCSS**

创建 `packages/theme/src/radial-menu.scss`：

```scss
@use './mixins/bem.scss' as bem;

@include bem.b(radial-menu) {
  --fl-radial-menu-primary-color: var(--el-color-primary);
  --fl-radial-menu-track-color: var(--el-border-color-lighter);
  --fl-radial-menu-active-bg-color: var(--el-color-primary-light-9);
  --fl-radial-menu-active-ring-color: var(--el-color-primary-light-5);
  --fl-radial-menu-duration: 180ms;
  --fl-radial-menu-easing: cubic-bezier(0.2, 0, 0, 1);

  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: var(--fl-radial-menu-center-size);
  height: var(--fl-radial-menu-center-size);
  z-index: var(--fl-radial-menu-z-index);

  @include bem.e(center) {
    position: relative;
    z-index: 3;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: var(--fl-radial-menu-center-size);
    height: var(--fl-radial-menu-center-size);
    border: 2px solid var(--fl-radial-menu-primary-color);
    border-radius: 50%;
    color: var(--fl-radial-menu-primary-color);
    background: var(--el-bg-color);
    cursor: pointer;
  }

  @include bem.e(center-label) {
    font-size: 13px;
    line-height: 1;
  }

  @include bem.e(panel) {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }

  @include bem.e(panel): : before {
    content: '';
    position: absolute;
    left: 50%;
    top: 50%;
    width: calc(var(--fl-radial-menu-radius) * 2);
    height: calc(var(--fl-radial-menu-radius) * 2);
    border: 2px solid var(--fl-radial-menu-track-color);
    border-radius: 50%;
    transform: translate(-50%, -50%);
  }

  @include bem.e(sector) {
    position: absolute;
    left: 50%;
    top: 50%;
    width: 280px;
    height: 280px;
    overflow: visible;
    pointer-events: none;
    transform: translate(-50%, -50%);
  }

  @include bem.e(sector-path) {
    fill: color-mix(in srgb, var(--fl-radial-menu-primary-color) 14%, transparent);
  }

  @include bem.e(item) {
    position: absolute;
    left: 50%;
    top: 50%;
    z-index: 2;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: var(--fl-radial-menu-item-size);
    height: var(--fl-radial-menu-item-size);
    border: 1px solid var(--el-border-color-light);
    border-radius: 12px;
    color: var(--el-text-color-regular);
    background: var(--el-bg-color);
    box-shadow: var(--el-box-shadow-light);
    cursor: pointer;
    pointer-events: auto;
    transform: translate(
        calc(-50% + var(--fl-radial-menu-item-x)),
        calc(-50% + var(--fl-radial-menu-item-y))
      )
      scale(1);
    transition:
      transform var(--fl-radial-menu-duration) var(--fl-radial-menu-easing),
      opacity var(--fl-radial-menu-duration) var(--fl-radial-menu-easing),
      border-color var(--fl-radial-menu-duration) var(--fl-radial-menu-easing),
      color var(--fl-radial-menu-duration) var(--fl-radial-menu-easing);

    @include bem.when(active) {
      border-color: var(--fl-radial-menu-primary-color);
      color: var(--fl-radial-menu-primary-color);
      background: var(--fl-radial-menu-active-bg-color);
    }

    @include bem.when(disabled) {
      cursor: not-allowed;
      opacity: 0.5;
    }
  }

  @include bem.e(item-label) {
    position: absolute;
    top: 50%;
    left: calc(100% + 8px);
    max-width: 120px;
    padding: 4px 8px;
    border-radius: 999px;
    color: var(--el-text-color-primary);
    background: var(--el-fill-color-light);
    font-size: 12px;
    line-height: 1;
    white-space: nowrap;
    transform: translateY(-50%);
  }

  @include bem.when(disabled) {
    pointer-events: none;
    opacity: 0.6;
  }

  @media (prefers-reduced-motion: reduce) {
    @include bem.e(item) {
      transition: none;
    }
  }
}
```

- [ ] **步骤 5：在主题入口中引入 radial menu 样式**

在 `packages/theme/index.scss` 的 `@use './src/table.scss';` 后增加：

```scss
@use './src/radial-menu.scss';
```

- [ ] **步骤 6：运行测试并提交**

运行：

```bash
pnpm exec vitest run packages/components/radial-menu/__test__/radial-menu.test.ts
pnpm exec prettier --check packages/components/radial-menu packages/theme/src/radial-menu.scss packages/theme/index.scss
```

预期：PASS。

提交：

```bash
git add packages/components/radial-menu packages/theme/src/radial-menu.scss packages/theme/index.scss
git commit -m "Add radial menu visual states"
```

## 任务 4：More 下拉与选择行为

**Files:**

- 修改：`packages/components/radial-menu/src/radial-menu.vue`
- 修改：`packages/theme/src/radial-menu.scss`
- 修改：`packages/components/radial-menu/__test__/radial-menu.test.ts`

- [ ] **步骤 1：新增 More 和 select 的失败测试**

追加：

```ts
describe('FlRadialMenu More dropdown and select', () => {
  it('renders overflow items in the More dropdown', async () => {
    const wrapper = mount(RadialMenu, {
      props: {
        items: createItems(8),
        modelValue: true
      }
    })

    expect(wrapper.findAll('.fl-radial-menu__item')).toHaveLength(6)
    expect(wrapper.get('.fl-radial-menu__more').text()).toContain('More')

    await wrapper.get('.fl-radial-menu__more').trigger('click')

    expect(wrapper.findAll('.fl-radial-menu__more-item')).toHaveLength(2)
  })

  it('emits select and closes after choosing a ring item', async () => {
    const wrapper = mount(RadialMenu, {
      props: {
        items: createItems(2),
        modelValue: true
      }
    })

    await wrapper.get('[data-radial-menu-key="item-1"]').trigger('click')

    expect(wrapper.emitted('select')?.[0]?.[0]).toMatchObject({ key: 'item-1' })
    expect(wrapper.emitted('select')?.[0]?.[1]).toMatchObject({ source: 'ring', index: 0 })
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([false])
  })

  it('keeps open when closeOnSelect is false', async () => {
    const wrapper = mount(RadialMenu, {
      props: {
        items: createItems(2),
        modelValue: true,
        closeOnSelect: false
      }
    })

    await wrapper.get('[data-radial-menu-key="item-1"]').trigger('click')

    expect(wrapper.emitted('select')).toHaveLength(1)
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })
})
```

- [ ] **步骤 2：运行测试并确认失败**

运行：

```bash
pnpm exec vitest run packages/components/radial-menu/__test__/radial-menu.test.ts
```

预期：FAIL，因为 More 下拉和 select 处理还缺失。

- [ ] **步骤 3：新增 More 状态和菜单项激活逻辑**

在 `radial-menu.vue` 中增加：

```ts
const moreOpened = ref(false)
const moreItems = computed(() => splitItems.value.moreItems)

const moreLabel = computed(() => {
  if (props.moreMode === 'ellipsis') {
    return '...'
  }

  if (props.moreMode === 'text') {
    return props.moreText
  }

  return `${props.moreText} ...`
})

const setMoreOpened = (nextOpened: boolean) => {
  moreOpened.value = nextOpened
  emit(nextOpened ? 'more-open' : 'more-close')
}

const activateItem = (
  item: FlRadialMenuItem,
  source: 'ring' | 'more',
  index: number,
  event: MouseEvent | KeyboardEvent
) => {
  if (item.disabled) {
    return
  }

  emit('select', item, { source, index, event })

  const shouldClose = item.closeOnSelect ?? props.closeOnSelect
  if (shouldClose) {
    moreOpened.value = false
    close('select')
  }
}
```

更新 imports：

```ts
import type { FlRadialMenuExpose, FlRadialMenuItem, FlRadialMenuOpenOptions } from './types'
```

更新 item 按钮：

```vue
@click="activateItem(item, 'ring', index, $event)"
```

在 ring item 按钮后增加 More 按钮和下拉：

```vue
<button
  v-if="moreItems.length > 0"
  type="button"
  :class="ns.e('more')"
  aria-haspopup="menu"
  :aria-expanded="String(moreOpened)"
  @click="setMoreOpened(!moreOpened)">
  {{ moreLabel }}
</button>

<div
  v-if="moreOpened"
  :class="[ns.e('more-dropdown'), ns.m(`more-${moreDropdownPlacement}`)]"
  role="menu">
  <button
    v-for="(item, index) in moreItems"
    :key="item.key"
    type="button"
    role="menuitem"
    :class="[ns.e('more-item'), ns.is('disabled', item.disabled)]"
    :disabled="item.disabled"
    :data-radial-menu-more-key="item.key"
    @click="activateItem(item, 'more', index, $event)"
  >
    <span :class="ns.e('more-label')">{{ item.label }}</span>
    <span v-if="item.shortcut" :class="ns.e('shortcut')">{{ item.shortcut }}</span>
  </button>
</div>
```

- [ ] **步骤 4：新增 More SCSS**

追加到 `@include bem.b(radial-menu)` 内：

```scss
@include bem.e(more) {
  position: absolute;
  left: 50%;
  top: calc(50% + var(--fl-radial-menu-radius) + 18px);
  z-index: 3;
  padding: 6px 12px;
  border: 0;
  border-radius: 999px;
  color: var(--el-text-color-primary);
  background: var(--el-fill-color-light);
  cursor: pointer;
  pointer-events: auto;
  transform: translateX(-50%);
}

@include bem.e(more-dropdown) {
  position: absolute;
  left: 50%;
  top: calc(50% + var(--fl-radial-menu-radius) + 54px);
  z-index: 4;
  display: inline-flex;
  flex-direction: column;
  min-width: 140px;
  padding: 6px;
  border: 1px solid var(--el-border-color-light);
  border-radius: 8px;
  background: var(--el-bg-color-overlay);
  box-shadow: var(--el-box-shadow-light);
  pointer-events: auto;
  transform: translateX(-50%);
}

@include bem.e(more-item) {
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-height: 30px;
  padding: 0 8px;
  border: 0;
  border-radius: 6px;
  color: var(--el-text-color-regular);
  background: transparent;
  cursor: pointer;

  &:hover,
  &:focus-visible {
    color: var(--fl-radial-menu-primary-color);
    background: var(--fl-radial-menu-active-bg-color);
  }
}

@include bem.e(shortcut) {
  padding: 2px 6px;
  border-radius: 999px;
  color: var(--el-text-color-secondary);
  background: var(--el-fill-color);
  font-size: 11px;
}
```

- [ ] **步骤 5：运行测试并提交**

运行：

```bash
pnpm exec vitest run packages/components/radial-menu/__test__/radial-menu.test.ts
```

预期：PASS。

提交：

```bash
git add packages/components/radial-menu packages/theme/src/radial-menu.scss
git commit -m "Add radial menu overflow actions"
```

## 任务 5：可访问性与键盘导航

**Files:**

- 新建：`packages/components/radial-menu/src/use-radial-menu-keyboard.ts`
- 修改：`packages/components/radial-menu/src/radial-menu.vue`
- 修改：`packages/components/radial-menu/__test__/radial-menu.test.ts`

- [ ] **步骤 1：新增键盘交互失败测试**

追加：

```ts
describe('FlRadialMenu keyboard accessibility', () => {
  it('moves focus with arrow keys and skips disabled items', async () => {
    const wrapper = mount(RadialMenu, {
      attachTo: document.body,
      props: {
        items: [
          { key: 'a', label: 'A' },
          { key: 'b', label: 'B', disabled: true },
          { key: 'c', label: 'C' }
        ],
        modelValue: true
      }
    })

    const first = wrapper.get('[data-radial-menu-key="a"]')
    await first.trigger('focus')
    await first.trigger('keydown', { key: 'ArrowRight' })

    expect(document.activeElement).toBe(wrapper.get('[data-radial-menu-key="c"]').element)
    wrapper.unmount()
  })

  it('activates the focused item with Enter', async () => {
    const wrapper = mount(RadialMenu, {
      attachTo: document.body,
      props: {
        items: createItems(2),
        modelValue: true
      }
    })

    const first = wrapper.get('[data-radial-menu-key="item-1"]')
    await first.trigger('focus')
    await first.trigger('keydown', { key: 'Enter' })

    expect(wrapper.emitted('select')?.[0]?.[0]).toMatchObject({ key: 'item-1' })
    wrapper.unmount()
  })

  it('closes on Escape', async () => {
    const wrapper = mount(RadialMenu, {
      attachTo: document.body,
      props: {
        items: createItems(2),
        modelValue: true
      }
    })

    await wrapper.get('[role="menu"]').trigger('keydown', { key: 'Escape' })

    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([false])
    wrapper.unmount()
  })
})
```

- [ ] **步骤 2：运行测试并确认失败**

运行：

```bash
pnpm exec vitest run packages/components/radial-menu/__test__/radial-menu.test.ts
```

预期：FAIL，因为键盘处理函数还缺失。

- [ ] **步骤 3：新增键盘 composable**

创建 `packages/components/radial-menu/src/use-radial-menu-keyboard.ts`：

```ts
import type { Ref } from 'vue'
import type { FlRadialMenuItem } from './types'

export interface UseRadialMenuKeyboardOptions {
  ringItems: Ref<FlRadialMenuItem[]>
  moreItems: Ref<FlRadialMenuItem[]>
  ringRefs: Ref<HTMLButtonElement[]>
  moreRefs: Ref<HTMLButtonElement[]>
  closeMenu: () => void
  closeMore: () => void
  activateFocused: (event: KeyboardEvent) => void
}

const findNextEnabledIndex = (
  items: FlRadialMenuItem[],
  currentIndex: number,
  direction: 1 | -1
) => {
  if (items.length === 0) {
    return -1
  }

  for (let step = 1; step <= items.length; step += 1) {
    const nextIndex = (currentIndex + step * direction + items.length) % items.length
    if (!items[nextIndex]?.disabled) {
      return nextIndex
    }
  }

  return -1
}

export const useRadialMenuKeyboard = ({
  ringItems,
  moreItems,
  ringRefs,
  moreRefs,
  closeMenu,
  closeMore,
  activateFocused
}: UseRadialMenuKeyboardOptions) => {
  const focusRingItem = (index: number) => {
    ringRefs.value[index]?.focus()
  }

  const focusFirstAvailableRingItem = () => {
    const index = findNextEnabledIndex(ringItems.value, -1, 1)
    if (index >= 0) {
      focusRingItem(index)
    }
  }

  const handleRingKeydown = (event: KeyboardEvent, index: number) => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      event.preventDefault()
      const nextIndex = findNextEnabledIndex(ringItems.value, index, 1)
      if (nextIndex >= 0) {
        focusRingItem(nextIndex)
      }
      return
    }

    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      event.preventDefault()
      const nextIndex = findNextEnabledIndex(ringItems.value, index, -1)
      if (nextIndex >= 0) {
        focusRingItem(nextIndex)
      }
      return
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      activateFocused(event)
    }
  }

  const handleMoreKeydown = (event: KeyboardEvent, index: number) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      const nextIndex = findNextEnabledIndex(moreItems.value, index, 1)
      moreRefs.value[nextIndex]?.focus()
      return
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault()
      const nextIndex = findNextEnabledIndex(moreItems.value, index, -1)
      moreRefs.value[nextIndex]?.focus()
      return
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      activateFocused(event)
    }
  }

  const handleMenuKeydown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      event.preventDefault()
      closeMore()
      closeMenu()
    }
  }

  return {
    focusFirstAvailableRingItem,
    handleMenuKeydown,
    handleRingKeydown,
    handleMoreKeydown
  }
}
```

- [ ] **步骤 4：在组件中接入 refs 和处理函数**

在 `radial-menu.vue` 中增加模板 refs 和键盘集成：

```ts
const ringButtonRefs = ref<HTMLButtonElement[]>([])
const moreButtonRefs = ref<HTMLButtonElement[]>([])

const setRingButtonRef = (element: Element | ComponentPublicInstance | null, index: number) => {
  if (element instanceof HTMLButtonElement) {
    ringButtonRefs.value[index] = element
  }
}

const setMoreButtonRef = (element: Element | ComponentPublicInstance | null, index: number) => {
  if (element instanceof HTMLButtonElement) {
    moreButtonRefs.value[index] = element
  }
}

const activateKeyboardItem = (event: KeyboardEvent) => {
  const target = event.currentTarget
  if (!(target instanceof HTMLElement)) {
    return
  }

  target.click()
}

const { focusFirstAvailableRingItem, handleMenuKeydown, handleRingKeydown, handleMoreKeydown } =
  useRadialMenuKeyboard({
    ringItems,
    moreItems,
    ringRefs: ringButtonRefs,
    moreRefs: moreButtonRefs,
    closeMenu: () => close('escape'),
    closeMore: () => {
      moreOpened.value = false
    },
    activateFocused: activateKeyboardItem
  })
```

更新 imports：

```ts
import {
  computed,
  nextTick,
  ref,
  toRef,
  useTemplateRef,
  watch,
  type ComponentPublicInstance
} from 'vue'
import { useRadialMenuKeyboard } from './use-radial-menu-keyboard'
```

增加打开后聚焦逻辑：

```ts
watch(opened, async (nextOpened) => {
  if (!nextOpened) {
    return
  }

  await nextTick()
  focusFirstAvailableRingItem()
})
```

更新 panel：

```vue
<div v-if="opened" :class="ns.e('panel')" role="menu" @keydown="handleMenuKeydown">
```

更新 ring item：

```vue
:ref="(element) => setRingButtonRef(element, index)" :tabindex="item.disabled ? -1 : 0"
:aria-disabled="String(item.disabled === true)" @keydown="handleRingKeydown($event, index)"
```

更新 More item：

```vue
:ref="(element) => setMoreButtonRef(element, index)" :tabindex="item.disabled ? -1 : 0"
:aria-disabled="String(item.disabled === true)" @keydown="handleMoreKeydown($event, index)"
```

- [ ] **步骤 5：运行测试并提交**

运行：

```bash
pnpm exec vitest run packages/components/radial-menu/__test__/radial-menu.test.ts
```

预期：PASS。

提交：

```bash
git add packages/components/radial-menu
git commit -m "Add radial menu keyboard navigation"
```

## 任务 6：Floating 模式与全局快捷键

**Files:**

- 新建：`packages/components/radial-menu/src/use-radial-menu-shortcut.ts`
- 修改：`packages/components/radial-menu/src/radial-menu.vue`
- 修改：`packages/components/radial-menu/src/use-radial-menu-position.ts`
- 修改：`packages/theme/src/radial-menu.scss`
- 修改：`packages/components/radial-menu/__test__/radial-menu.test.ts`

- [ ] **步骤 1：新增 floating 快捷键失败测试**

追加：

```ts
describe('FlRadialMenu floating shortcut', () => {
  it('opens in floating mode from shortcut using last mouse position', async () => {
    const wrapper = mount(RadialMenu, {
      attachTo: document.body,
      props: {
        items: createItems(2),
        mode: 'floating',
        shortcut: 'Alt+W'
      }
    })

    window.dispatchEvent(new MouseEvent('mousemove', { clientX: 320, clientY: 180 }))
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'w', altKey: true }))
    await wrapper.vm.$nextTick()

    expect(wrapper.classes()).toContain('fl-radial-menu--floating')
    expect(wrapper.attributes('style')).toContain('--fl-radial-menu-floating-x: 320px')
    expect(wrapper.attributes('style')).toContain('--fl-radial-menu-floating-y: 180px')
    expect(wrapper.findAll('[role="menuitem"]')).toHaveLength(2)
    wrapper.unmount()
  })

  it('does not trigger shortcut from editable targets', async () => {
    const wrapper = mount(RadialMenu, {
      attachTo: document.body,
      props: {
        items: createItems(2),
        mode: 'floating',
        shortcut: 'Alt+W'
      }
    })
    const input = document.createElement('input')
    document.body.appendChild(input)

    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'w', altKey: true, bubbles: true }))
    await wrapper.vm.$nextTick()

    expect(wrapper.findAll('[role="menuitem"]')).toHaveLength(0)
    input.remove()
    wrapper.unmount()
  })
})
```

- [ ] **步骤 2：运行测试并确认失败**

运行：

```bash
pnpm exec vitest run packages/components/radial-menu/__test__/radial-menu.test.ts
```

预期：FAIL，因为快捷键逻辑和 floating 样式变量还缺失。

- [ ] **步骤 3：新增快捷键 composable**

创建 `packages/components/radial-menu/src/use-radial-menu-shortcut.ts`：

```ts
import { onMounted, onUnmounted, type Ref } from 'vue'
import type { FlRadialMenuOpenOptions } from './types'

export interface UseRadialMenuShortcutOptions {
  shortcut: Ref<string>
  enabled: Ref<boolean>
  open: (options: FlRadialMenuOpenOptions) => void
}

const modifierKeys = new Set(['alt', 'ctrl', 'control', 'meta', 'shift'])

const isEditableTarget = (target: EventTarget | null) => {
  if (!(target instanceof HTMLElement)) {
    return false
  }

  const tagName = target.tagName.toLowerCase()
  return (
    tagName === 'input' ||
    tagName === 'textarea' ||
    tagName === 'select' ||
    target.isContentEditable
  )
}

const normalizeShortcut = (value: string) =>
  value
    .split('+')
    .map((part) => part.trim().toLowerCase())
    .filter(Boolean)

const matchesShortcut = (event: KeyboardEvent, shortcut: string) => {
  const parts = normalizeShortcut(shortcut)
  if (parts.length === 0) {
    return false
  }

  const key = parts.find((part) => !modifierKeys.has(part))
  const expectsAlt = parts.includes('alt')
  const expectsCtrl = parts.includes('ctrl') || parts.includes('control')
  const expectsMeta = parts.includes('meta')
  const expectsShift = parts.includes('shift')

  return (
    event.altKey === expectsAlt &&
    event.ctrlKey === expectsCtrl &&
    event.metaKey === expectsMeta &&
    event.shiftKey === expectsShift &&
    event.key.toLowerCase() === key
  )
}

export const useRadialMenuShortcut = ({
  shortcut,
  enabled,
  open
}: UseRadialMenuShortcutOptions) => {
  let lastMouseX = window.innerWidth / 2
  let lastMouseY = window.innerHeight / 2

  const handleMouseMove = (event: MouseEvent) => {
    lastMouseX = event.clientX
    lastMouseY = event.clientY
  }

  const handleKeydown = (event: KeyboardEvent) => {
    if (
      !enabled.value ||
      !matchesShortcut(event, shortcut.value) ||
      isEditableTarget(event.target)
    ) {
      return
    }

    event.preventDefault()
    open({
      x: lastMouseX,
      y: lastMouseY,
      reason: 'shortcut'
    })
  }

  onMounted(() => {
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('keydown', handleKeydown)
  })

  onUnmounted(() => {
    window.removeEventListener('mousemove', handleMouseMove)
    window.removeEventListener('keydown', handleKeydown)
  })
}
```

- [ ] **步骤 4：新增 floating 定位样式**

在 `radial-menu.vue` 中接入快捷键和样式变量：

```ts
const { opened, floatingX, floatingY, open, close, toggle } = useRadialMenuState({
  modelValue: toRef(props, 'modelValue'),
  disabled: toRef(props, 'disabled'),
  emitUpdate: (nextOpened) => emit('update:modelValue', nextOpened)
})

useRadialMenuShortcut({
  shortcut: toRef(props, 'shortcut'),
  enabled: computed(() => props.shortcutEnabled && Boolean(props.shortcut)),
  open
})

const rootStyle = computed(() => ({
  '--fl-radial-menu-radius': `${props.radius}px`,
  '--fl-radial-menu-center-size': `${props.centerSize}px`,
  '--fl-radial-menu-item-size': `${props.itemSize}px`,
  '--fl-radial-menu-floating-x': `${floatingX.value ?? window.innerWidth / 2}px`,
  '--fl-radial-menu-floating-y': `${floatingY.value ?? window.innerHeight / 2}px`,
  '--fl-radial-menu-z-index': String(props.zIndex)
}))
```

更新 imports：

```ts
import { useRadialMenuShortcut } from './use-radial-menu-shortcut'
```

在 `packages/theme/src/radial-menu.scss` 中增加 floating modifier：

```scss
@include bem.m(floating) {
  position: fixed;
  left: var(--fl-radial-menu-floating-x);
  top: var(--fl-radial-menu-floating-y);
  transform: translate(-50%, -50%);
}
```

- [ ] **步骤 5：运行测试并提交**

运行：

```bash
pnpm exec vitest run packages/components/radial-menu/__test__/radial-menu.test.ts
```

预期：PASS。

提交：

```bash
git add packages/components/radial-menu packages/theme/src/radial-menu.scss
git commit -m "Add radial menu floating shortcut"
```

## 任务 7：导出、构建入口与 API 元数据

**Files:**

- 修改：`packages/components/index.ts`
- 修改：`packages/components/package.json`
- 修改：`packages/falcon-ui/index.ts`
- 修改：`packages/falcon-ui/global.d.ts`
- 修改：`packages/components/__test__/install.test.ts`
- 修改：`packages/falcon-ui/__test__/install.test.ts`
- 修改：`scripts/build/constants.mjs`
- 修改：`scripts/build/build-meta.mjs`
- 修改：`scripts/docs/generate-api-meta.mjs`

- [ ] **步骤 1：新增导出链路失败测试**

在 `packages/components/__test__/install.test.ts` 中导入 `FlRadialMenu`，并把它加入 install
测试：

```ts
import {
  FlBarcode,
  FlButton,
  FlDatePicker,
  FlDialog,
  FlInput,
  FlInputNumber,
  FlInputSearch,
  FlQrCode,
  FlRadialMenu,
  FlSelect,
  FlTable
} from '..'
```

Add:

```ts
app.use(FlRadialMenu)
expect(app.component).toHaveBeenCalledWith('FlRadialMenu', FlRadialMenu)
```

在 `packages/falcon-ui/__test__/install.test.ts` 中导入并断言 `FlRadialMenu`：

```ts
import FalconUI, {
  FlButton,
  FlDatePicker,
  FlDialog,
  FlInput,
  FlInputNumber,
  FlInputSearch,
  FlRadialMenu,
  FlSelect,
  FlTable,
  FlTableEditor,
  HolderOutlined,
  MinusSquareOutlined,
  PlusSquareOutlined,
  install
} from '..'
```

在两个 plugin 测试中都增加这个断言：

```ts
expect(app.component).toHaveBeenCalledWith('FlRadialMenu', FlRadialMenu)
```

- [ ] **步骤 2：运行导出测试并确认失败**

运行：

```bash
pnpm exec vitest run packages/components/__test__/install.test.ts packages/falcon-ui/__test__/install.test.ts
```

预期：FAIL，因为根导出和插件注册还没有接入。

- [ ] **步骤 3：接入组件导出**

添加到 `packages/components/index.ts`：

```ts
export { FlRadialMenu } from './radial-menu'
export type {
  FlRadialMenuCloseReason,
  FlRadialMenuDropdownPlacement,
  FlRadialMenuEmits,
  FlRadialMenuExpose,
  FlRadialMenuItem,
  FlRadialMenuMode,
  FlRadialMenuMoreMode,
  FlRadialMenuOpenOptions,
  FlRadialMenuOpenReason,
  FlRadialMenuProps,
  FlRadialMenuSelectContext,
  FlRadialMenuTrigger,
  RadialMenuEmits,
  RadialMenuProps
} from './radial-menu'
```

添加到 `packages/components/package.json` 的 exports：

```json
"./radial-menu": "./radial-menu/index.ts"
```

- [ ] **步骤 4：注册根插件和全局类型**

在 `packages/falcon-ui/index.ts` 中导入并注册 `FlRadialMenu`：

```ts
import {
  FlBarcode,
  FlButton,
  FlDatePicker,
  FlDialog,
  FlInput,
  FlInputNumber,
  FlInputSearch,
  FlQrCode,
  FlRadialMenu,
  FlSelect,
  FlTree,
  FlTable,
  FlTableEditor
} from '@falcon-ui/components'
```

把 `FlRadialMenu` 加入 `components` 数组。

在 `packages/falcon-ui/global.d.ts` 中把 `FlRadialMenu` 加入类型 import 和
`GlobalComponents`：

```ts
FlRadialMenu,
```

```ts
FlRadialMenu: typeof FlRadialMenu
```

- [ ] **步骤 5：接入构建元数据**

在 `scripts/build/constants.mjs` 中增加入口：

```js
'components/radial-menu/index': resolve(packagesDir, 'components/radial-menu/index.ts'),
'components/radial-menu/src/radial-menu': resolve(
  packagesDir,
  'components/radial-menu/src/radial-menu.ts'
),
'components/radial-menu/src/radial-menu.vue': resolve(
  packagesDir,
  'components/radial-menu/src/radial-menu.vue'
),
```

在 `scripts/build/build-meta.mjs` 中增加发布导出：

```js
'./components/radial-menu': {
  types: './types/components/radial-menu/index.d.ts',
  import: './esm/components/radial-menu/index.mjs',
  require: './cjs/components/radial-menu/index.cjs'
},
```

在 `scripts/docs/generate-api-meta.mjs` 中增加目标：

```js
{
  id: 'fl-radial-menu',
  filePath: path.resolve(rootDir, 'packages/components/radial-menu/src/radial-menu.vue')
},
```

- [ ] **步骤 6：运行导出与构建检查，然后提交**

运行：

```bash
pnpm exec vitest run packages/components/__test__/install.test.ts packages/falcon-ui/__test__/install.test.ts
pnpm build:lib:types
```

预期：PASS，并且声明文件成功生成。

提交：

```bash
git add packages/components packages/falcon-ui scripts/build scripts/docs
git commit -m "Wire radial menu exports"
```

## 任务 8：文档、示例与最终验证

**Files:**

- 新建：`docs/components/radial-menu.md`
- 新建：`docs/examples/radial-menu/basic.vue`
- 新建：`docs/examples/radial-menu/floating-shortcut.vue`
- 新建：`docs/examples/radial-menu/more.vue`
- 新建：`docs/examples/radial-menu/custom-center.vue`
- 新建：`docs/examples/radial-menu/controlled.vue`
- 修改：`docs/.vitepress/config.ts`
- 修改：`docs/index.md`
- 生成：`docs/public/api-meta/fl-radial-menu.json`

- [ ] **步骤 1：新增文档示例**

创建 `docs/examples/radial-menu/basic.vue`：

```vue
<template>
  <FlRadialMenu :items="items" center-label="Tools" @select="handleSelect" />
</template>

<script setup lang="ts">
import { FlRadialMenu, type FlRadialMenuItem } from '../../../packages/components/radial-menu'

const items: FlRadialMenuItem[] = [
  { key: 'move', label: 'Move', icon: 'V', shortcut: 'V' },
  { key: 'frame', label: 'Frame', icon: '#', shortcut: 'F' },
  { key: 'pen', label: 'Pen', icon: 'P', shortcut: 'P' },
  { key: 'text', label: 'Text', icon: 'T', shortcut: 'T' }
]

const handleSelect = (item: FlRadialMenuItem) => {
  console.info('[radial-menu] selected', item.key)
}
</script>
```

创建 `docs/examples/radial-menu/floating-shortcut.vue`：

```vue
<template>
  <div class="radial-menu-shortcut-demo">
    <p>Move the mouse inside this area, then press Alt + W.</p>
    <FlRadialMenu mode="floating" shortcut="Alt+W" :items="items" center-label="+" />
  </div>
</template>

<script setup lang="ts">
import { FlRadialMenu, type FlRadialMenuItem } from '../../../packages/components/radial-menu'

const items: FlRadialMenuItem[] = [
  { key: 'move', label: 'Move Tool', shortcut: 'V' },
  { key: 'pen', label: 'Pen Tool', shortcut: 'P' },
  { key: 'text', label: 'Text', shortcut: 'T' }
]
</script>

<style scoped>
.radial-menu-shortcut-demo {
  min-height: 240px;
  padding: 24px;
  border: 1px dashed var(--el-border-color);
}
</style>
```

创建 `docs/examples/radial-menu/more.vue`：

```vue
<template>
  <FlRadialMenu :items="items" center-label="Menu" more-mode="text-ellipsis" />
</template>

<script setup lang="ts">
import { FlRadialMenu, type FlRadialMenuItem } from '../../../packages/components/radial-menu'

const items: FlRadialMenuItem[] = [
  { key: 'move', label: 'Move' },
  { key: 'frame', label: 'Frame' },
  { key: 'pen', label: 'Pen' },
  { key: 'text', label: 'Text' },
  { key: 'comment', label: 'Comment' },
  { key: 'objects', label: 'Objects' },
  { key: 'actions', label: 'Actions' },
  { key: 'settings', label: 'Settings' }
]
</script>
```

创建 `docs/examples/radial-menu/custom-center.vue`：

```vue
<template>
  <FlRadialMenu :items="items">
    <template #center>
      <span class="radial-menu-custom-center">⌘</span>
    </template>
  </FlRadialMenu>
</template>

<script setup lang="ts">
import { FlRadialMenu, type FlRadialMenuItem } from '../../../packages/components/radial-menu'

const items: FlRadialMenuItem[] = [
  { key: 'copy', label: 'Copy' },
  { key: 'paste', label: 'Paste' },
  { key: 'delete', label: 'Delete', disabled: true }
]
</script>

<style scoped>
.radial-menu-custom-center {
  font-size: 20px;
}
</style>
```

创建 `docs/examples/radial-menu/controlled.vue`：

```vue
<template>
  <div class="radial-menu-controlled-demo">
    <button type="button" @click="opened = !opened">Toggle</button>
    <FlRadialMenu v-model="opened" trigger="manual" :items="items" center-label="Manual" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { FlRadialMenu, type FlRadialMenuItem } from '../../../packages/components/radial-menu'

const opened = ref(false)
const items: FlRadialMenuItem[] = [
  { key: 'first', label: 'First' },
  { key: 'second', label: 'Second' },
  { key: 'third', label: 'Third' }
]
</script>

<style scoped>
.radial-menu-controlled-demo {
  display: flex;
  align-items: center;
  gap: 24px;
}
</style>
```

- [ ] **步骤 2：新增组件文档页**

创建 `docs/components/radial-menu.md`：

```md
# FlRadialMenu 径向菜单

数据驱动的径向工具菜单。默认展示中心圆，打开后以环形布局展示最多 6 个操作项，
超过 6 个的操作项进入 More 下拉菜单。

## 基础用法

::: demo radial-menu/basic
:::

## 快捷键浮层

::: demo radial-menu/floating-shortcut
:::

## More 菜单

::: demo radial-menu/more
:::

## 自定义中心圆

::: demo radial-menu/custom-center
:::

## 受控模式

::: demo radial-menu/controlled
:::

## API

### Props

<VpApiTable source="/api-meta/fl-radial-menu.json" section="props" />

### Events

<VpApiTable source="/api-meta/fl-radial-menu.json" section="events" />

### Slots

<VpApiTable source="/api-meta/fl-radial-menu.json" section="slots" />

### Exposes

<VpApiTable source="/api-meta/fl-radial-menu.json" section="exposes" />
```

- [ ] **步骤 3：新增文档导航**

在 `docs/.vitepress/config.ts` 中，在 `FlTable` 后增加侧边栏项：

```ts
{ text: 'FlRadialMenu', link: '/components/radial-menu' }
```

在 `docs/index.md` 中加入当前文档范围：

```md
- `FlRadialMenu`
```

- [ ] **步骤 4：生成 api meta 并运行文档构建**

运行：

```bash
pnpm docs:api
pnpm docs:build
```

预期：

```txt
[docs:api] generated docs\public\api-meta\fl-radial-menu.json
✓ building client + server bundles...
```

- [ ] **步骤 5：运行完整质量检查**

运行：

```bash
pnpm format:check
pnpm lint
pnpm test
pnpm typecheck
pnpm build:lib
```

预期：所有命令退出码都是 0。

- [ ] **步骤 6：提交文档和最终集成**

提交：

```bash
git add docs packages scripts
git commit -m "Document radial menu component"
```

## 自检清单

- 规格覆盖：任务 1 覆盖 item 拆分和几何计算；任务 2 覆盖中心圆和基础环状展示；任务 3
  覆盖 BEM、SCSS、激活项、动画壳和扇形高亮；任务 4 覆盖 More 和选择后关闭；任务 5
  覆盖 ARIA 和键盘；任务 6 覆盖 floating 和快捷键；任务 7 覆盖导出、构建和 api meta；任务 8
  覆盖文档和验证。
- 占位扫描：本计划使用明确文件、测试、命令、预期结果和代码块，没有待补占位。
- 类型一致性：公共名称为 `FlRadialMenuItem`、`FlRadialMenuProps`、`FlRadialMenuEmits`、
  `FlRadialMenuExpose`，事件 payload 与设计文档一致。
- BEM 覆盖：任务 3 要求 `useNamespace('radial-menu')`、`@include bem.b(radial-menu)`、
  element mixin，并通过源码级测试禁止手写完整元素选择器。
