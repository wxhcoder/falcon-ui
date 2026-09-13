# FlTextShimmer 文字扫光

文字保持原位，高亮从左向右循环扫过字形内部。它表示任务仍在处理，不表示完成进度。

## 基础用法

::: demo text-shimmer/basic
:::

## 颜色

默认继承父级文字颜色。可分别设置普通文字和扫光高亮颜色，也可用于深色背景。

::: demo text-shimmer/color
:::

## 时长与宽度

`duration` 控制一轮扫过的秒数；`spread` 按文字 JavaScript 字符串长度计算高亮渐变范围。

::: demo text-shimmer/duration
:::

::: demo text-shimmer/spread
:::

## 静态文字与按钮

关闭动画或系统开启“减少动态效果”时，组件显示可读的静态文字。

::: demo text-shimmer/disabled
:::

::: demo text-shimmer/button
:::

## 使用限制

默认插槽只面向纯文本或字符串插值；存在时优先于 `text`。组件不解析 HTML，也不保证插槽中
元素或组件内的文字能够获得扫光效果。根元素默认单行显示；截断、换行和溢出由业务容器控制。

组件不主动设置 `role="status"`、`aria-live` 或 `aria-busy`，应由业务按真实任务状态传入。

## API

### Props

<VpApiTable source="/api-meta/fl-text-shimmer.json" section="props" />

### Slots

<VpApiTable source="/api-meta/fl-text-shimmer.json" section="slots" />
