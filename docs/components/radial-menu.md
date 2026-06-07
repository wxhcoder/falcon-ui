# FlRadialMenu 径向菜单

数据驱动的径向工具菜单。默认展示中心圆，打开后以环形布局展示最多 6 个操作项，
超过 6 个的操作项进入 More 下拉菜单。

可通过 `size="large"`、`size="medium"` 或 `size="small"` 设置尺寸。未显式传入 `size`
时会读取 Element Plus `ElConfigProvider` 的全局 `size`；全局 `default` 映射为
`medium`，未配置全局尺寸时保持 `large`。

## 基础用法

::: demo radial-menu/basic
:::

## 尺寸

::: demo radial-menu/size
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

## 圆形菜单项

::: demo radial-menu/item-type
:::

## Label Slot

::: demo radial-menu/label-slot
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

### FlRadialMenuItem Props

<VpApiTable source="/api-meta/fl-radial-menu-item.json" section="props" />

### FlRadialMenuItem Slots

<VpApiTable source="/api-meta/fl-radial-menu-item.json" section="slots" />
