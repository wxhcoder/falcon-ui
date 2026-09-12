---
pageClass: loading-docs-page
---

# Loading 加载动画

七种点阵动画，可单独显示，也可用于 Element Plus 原生 `v-loading` 遮罩。
`earth` 根据真实陆地轮廓生成点阵，所有数据随组件提供，无需请求地图服务。

## 动画

::: demo loading/gallery
:::

## 尺寸

::: demo loading/size
:::

## 动态配置

修改动画、尺寸、速度和颜色，或暂停当前画面。`active=false` 隐藏后保留占位；
需要移除占位时使用 `v-if`。系统开启减少动态效果时显示静态帧。

::: demo loading/controls
:::

## 原生 v-loading

::: demo loading/overlay
:::

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { vLoading } from 'element-plus'
import { useFlLoading } from '@falcon-ui/falcon-ui'
import '@falcon-ui/falcon-ui/theme/index.css'

const pending = ref(false)
const loading = useFlLoading(pending, () => ({
  animation: 'earth',
  text: '正在查询…',
  background: 'transparent'
}))
</script>

<template>
  <section v-loading="loading" :aria-busy="pending">业务内容</section>
</template>
```

`useFlLoading` 必须在 setup 中调用，接受普通值、ref 或 getter，返回原生指令配置。
开关关闭时返回 `false`，不能改成 `{ visible: false }`。
局部、body、fullscreen.lock 修饰符保持 Element Plus 行为；全屏模式是单例，
多个并行任务需要由业务汇总 pending。

配置支持组件所有属性（除 active），以及 `background`、`customClass` 和 `themeTarget`。
遮罩默认上下布局，独立组件默认同行。`themeTarget` 接受元素、元素 ref 或 getter，
用于在 body 遮罩中保留原区域颜色；未指定时从文档根元素读取。
同一元素不要同时设置 spinner/svg/text 属性和 helper 配置。

## 导入与样式

```ts
import { FlLoading, useFlLoading } from '@falcon-ui/falcon-ui/components/loading'
import '@falcon-ui/falcon-ui/theme/index.css'
```

独立组件不需要注册 Element Plus 指令。helper 不会覆盖全局指令，也不改变普通 Loading。
项目工作区源码可从 `@falcon-ui/components/loading` 导入。
适配基线为 Element Plus 2.13.6；升级后需回归遮罩结构和布局。
使用自定义 namespace 时，应用仍须提供该 namespace 对应的 Element Plus 样式。

## API

### Props

<VpApiTable source="/api-meta/fl-loading.json" section="props" />

### Slots

<VpApiTable source="/api-meta/fl-loading.json" section="slots" />

text 插槽替换文字内容，需使用合法的行内容（例如 span）。组件没有事件和命令式方法。
未传文字时，默认无障碍名称为“加载中”；通过 ariaLabel 可覆盖。

### 颜色与生命周期

点颜色按 color、`--fl-loading-color`、theme 的顺序解析。auto 跟随最近祖先的
data-theme 或 dark/light 类，再回退系统主题。
暂停、隐藏、离屏、后台、KeepAlive 停用时停止动画；卸载释放所有监听和绘制回调。
Canvas 不可用时显示静态圆点及说明文字。

六种基础算法来自 [Thinking Orbs](https://github.com/Jakubantalik/thinking-orbs)，
地理轮廓来自 [Natural Earth](https://www.naturalearthdata.com/about/terms-of-use/)。
