# FlLoading 点阵加载动画需求

> 状态：七种动画、Vue 组件与原生指令接入已实现，正在完成质量验证。
> 调研日期：2026-09-10。
> 工作分支：`codex/feat-loading`，基于当前工作提交 `2d6ad1a` 创建。

## 1. 要解决的问题

提供一组可选择的点阵加载动画，用于数据查询、页面等待和 AI 任务状态提示。
重点实现参考页面的 Searching 动画，并增加能看出大陆轮廓的地球点阵。
同一套动画既能单独放在页面上，也能用于 Element Plus 原生 `v-loading` 遮罩。

本次交付是调研结论和可执行的需求文档。下文 API、文件结构和示例是待实现约定，
不代表当前包已经提供这些导出。

### 1.1 使用场景

| 场景           | 用法                                   | 预期结果                             |
| -------------- | -------------------------------------- | ------------------------------------ |
| 表格请求数据   | 原生 `v-loading` + 配置函数            | 遮罩中央显示指定动画和提示文字       |
| 全屏等待       | `v-loading.fullscreen.lock` + 配置函数 | 覆盖页面并沿用 Element Plus 滚动锁定 |
| 聊天任务提示   | 独立 `FlLoading`                       | 20px 点阵与文字同行，不生成遮罩      |
| 全球数据同步   | `animation="earth"`                    | 有大陆轮廓的点阵地球缓慢自转并扫描   |
| 多区域并行请求 | 每个区域独立配置                       | 不同动画、文字和开关互不影响         |

### 1.2 首版范围

- 完成六种参考动画，以及新增的 `earth` 地球动画，共七种选择。
- 支持独立组件和 Element Plus 原生指令两种入口，共用绘制逻辑。
- 支持尺寸、颜色、主题、速度、暂停、文字和布局。
- 支持浅色/深色页面、减少动态效果偏好、隐藏暂停和资源清理。
- 首版不提供百分比进度、地图交互、真实音频分析或任务完成判定。
- 胶囊背景是参考演示的业务外壳，不作为 Loading 的默认背景。
- 程序式 Loading 服务、另起 `v-fl-loading` 指令和全局默认动画注册可后续扩展。

## 2. 调研结论与证据

### 2.1 参考动画实际是什么

[21st.dev 参考页面][ref-21st] 展示灰白点阵球和状态文字，页面介绍六种状态。
其中 Thinking 演示实际传入 `state="composing"`，不能新增一个同义的 `thinking` 状态。
原始实现来自页面明确链接的 [Thinking Orbs 开源仓库][ref-upstream]。

调研时上游 `package.json` 为 `0.3.1`，HEAD 为
`de85557ca220332586d070d8788c0e1d6e877a0d`，已增加到九种状态。
本需求以用户指定页面的六种为范围，不自动加入 connecting、weaving、breathing。
21st.dev 的 Component.tsx 页签需要解锁，本次读取的是公开上游源码。

| 动画值      | 用户看到的运动                             | 参考源码位置                           |
| ----------- | ------------------------------------------ | -------------------------------------- |
| `working`   | 点沿不同倾斜轨道运动                       | `src/engine/orbits.ts`                 |
| `searching` | 点阵球自转，一条经线方向的扫描带扫过球面   | `src/engine/lattice.ts` / `frameGlobe` |
| `solving`   | 点阵分带扭转、打乱、复位，再循环           | `src/engine/lattice.ts` / `frameRubik` |
| `listening` | 波动依次通过球面点阵环                     | `src/engine/lattice.ts` / `frameWave`  |
| `composing` | 多条点带连续起伏                           | `src/engine/ribbon.ts`                 |
| `shaping`   | 点阵轮廓在圆、三角、方形之间变化           | `src/engine/morph.ts`                  |
| `earth`     | 大陆点阵随地球自转，扫描带经过时增强局部点 | Falcon UI 新增                         |

源码核对发现：Searching 的点位置由经纬度生成，靠近极点时减少经度采样数量。
球面先做三维旋转，再投影到二维画布；远近点的大小与明暗不同，并按深度绘制。
扫描带主要放大经过的点，同时改变透明度。原版没有陆地、海洋分类数据。
详见固定版本的 [球面算法][ref-lattice]、[投影与绘制][ref-core]。

### 2.2 推荐实现方式

采用 TypeScript 数学计算 + Canvas 2D + Vue 3 Composition API。
Canvas 是浏览器的一块画布，每帧直接画圆点，避免为数百个点创建 HTML 元素。

| 方案                | 适用性                                           | 决策             |
| ------------------- | ------------------------------------------------ | ---------------- |
| Canvas 2D           | 可共享点阵算法，容易加入陆地采样和深度变化       | 首选             |
| SVG / CSS           | 少量点简单，复杂球面逐点更新会增加节点和属性更新 | 仅作静态降级备选 |
| WebGL / Three.js    | 可做复杂三维场景，但小型等待动画无需引入此类依赖 | 首版不用         |
| 直接嵌入 React 组件 | 与当前 Vue 组件库不匹配                          | 不采用           |

上游已提供不依赖 React 的 `thinking-orbs/engine` 入口，
可以输出一帧的圆点数据；但整个 npm 包仍声明 React peer dependency。
推荐按 MIT 许可移植所需纯算法，记录来源、固定提交和修改说明，
自行实现 Vue 生命周期与地球采样，避免给业务项目额外引入 React。
若后续改为依赖上游 engine，须先验证安装时的 React 要求和最终包体积。
证据见 [engine 导出][ref-engine]、[包依赖][ref-package]、[MIT 许可][ref-license]。

### 2.3 Element Plus 接入结论

已检查项目实际安装的 Element Plus `2.13.6`：

- `LoadingOptions.text` 的类型包含 `VNode` 和 `VNode[]`，即 Vue 可直接渲染的节点。
- 原生 `v-loading` 支持配置对象，并把其中的 `text` 传给 Loading 组件。
- `spinner` / `svg` 是 SVG 字符串入口，不能直接接收 Vue Canvas 组件。
- 配置对象本身为真值；关闭时必须传 `false`，不能使用 `{ visible: false }` 代替。

使用 `text: h(FlLoading, props)` 承载完整动画和文字，
通过 `customClass` 给本次遮罩添加专用类，仅隐藏该遮罩原有的 SVG 转圈。
Element Plus 继续负责遮罩定位、body 挂载、全屏和关闭流程。
无需覆盖全局 `loading` 指令，也无需查找其私有实例或手工往遮罩插入节点。
公开接口见 [Element Plus Loading 文档][ref-ep]。

本次用 Vue + jsdom 对安装版本做了最小实验，验证通过：

1. 原生指令的对象配置可以挂载一个包含 Canvas 的 Vue 组件。
2. 更新节点 props 后显示变化，组件没有重复挂载。
3. 绑定改为 `false` 后，遮罩移除且子组件执行卸载。
4. 再次打开可正常挂载；宿主卸载后遮罩和子组件全部清理。

实验验证了接入路径，未验证真实 Canvas 画面、浏览器性能、主题、全屏定位或完整兼容性。
现阶段兼容基线仅为实测的 `2.13.6`，不能据此宣称支持所有 Element Plus 2.x。

## 3. 动画与地球纹理要求

### 3.1 通用视觉规则

- 每种动画必须有不同的运动规律，不能只改名字或转速。
- 默认透明背景，以适应表格、卡片和聊天界面。
- 不产生刺眼闪烁；动画循环处不突然跳回起点。
- `20px` 使用专门的小尺寸点数和点径，不能把 64px 图案直接缩小。
- `32/48/64/96px` 根据尺寸选择对应密度；超大展示不在首版范围内。
- 文字是实际文本，可选择、可被屏幕阅读器读取，不绘制到 Canvas 中。
- 修改颜色、文字、速度不重新创建 Canvas；切换动画允许一次重建点集。
- 动画代表“正在处理”，不承诺真实搜索、监听状态或完成比例。

### 3.2 地球点阵

`earth` 表示带大陆轮廓的地球动画，独立于普通 Searching 的均匀点阵球。
首版作为一个可直接选择的动画值，避免要求用户同时配置动画和纹理组合。

1. 从 Natural Earth 的低精度陆地轮廓生成精简数据，只使用海陆轮廓。
2. 构建阶段将经纬度采样点分为陆地和海洋；运行时不下载地图、不读取远程图片。
3. 陆地保留完整点阵，海洋以更低透明度的稀疏点辅助表达球体。
4. 点固定在地理位置上，随同一个旋转矩阵转动，不能每帧随机重排。
5. 默认北向上并轻微倾斜；首帧优先展示欧亚非区域，旋转中可看到美洲和大洋洲。
6. 地球背面的陆地不透到正面；靠近轮廓时平滑减淡，避免大陆叠在一起。
7. 扫描带经过时适度放大和提亮陆地点，不把整个球变成均匀亮球。
8. `64/96px` 应可辨认非洲、欧亚大陆、美洲和澳大利亚的大体轮廓。
9. `20/32px` 保留简化的海陆差异，不承诺小岛细节；不静默换成普通点阵球。

Natural Earth 数据允许修改和分发，来源条款见 [数据使用说明][ref-earth]。
开发时记录实际采用的数据版本、文件哈希、坐标方向和生成命令，
把最终点集随组件发布；不把完整 GIS 数据处理库作为运行时依赖。

### 3.3 地球绘制步骤

```text
构建阶段：陆地轮廓 → 球面均匀采样 → 判断海陆 → 精简点集 → 本地数据文件
运行阶段：点集 → 自转/倾斜 → 正面筛选 → 二维投影 → 深度与扫描效果 → Canvas
```

经纬度转三维坐标可使用下式，纬度和经度均以弧度参与计算：

```text
x = cos(latitude) × cos(longitude)
y = sin(latitude)
z = cos(latitude) × sin(longitude)
```

在相邻纬度环上按 `cos(latitude)` 调整点数，避免极点挤成一团。
海陆判定与点集生成只做一次，动画每帧只更新旋转、投影和亮度。
普通六种动画可沿用上游深度绘制；地球需增加背面隐藏和地理方向校验。

## 4. 独立组件 API

组件名 `FlLoading`，Vue 文件使用 `<script setup lang="ts">`。
独立使用不需要注册 Element Plus Loading 指令，不创建遮罩，也不锁滚动。

| Prop        | 类型                         | 默认值      | 作用                                  |
| ----------- | ---------------------------- | ----------- | ------------------------------------- |
| `active`    | `boolean`                    | `true`      | false 时隐藏组件、保留占位并停止动画  |
| `animation` | 七种动画值                   | `searching` | 选择点阵运动或地球动画                |
| `size`      | `20 \| 32 \| 48 \| 64 \| 96` | `64`        | 画布 CSS 边长，单位 px                |
| `color`     | `string`                     | 未设置      | 指定点的基础颜色，支持 CSS 颜色和变量 |
| `theme`     | `auto \| light \| dark`      | `auto`      | 未指定 color 时，决定深色或浅色点     |
| `speed`     | `number`                     | `1`         | 动画速度倍率，合法范围 0.25–3         |
| `paused`    | `boolean`                    | `false`     | 保留当前画面，暂停时间推进            |
| `text`      | `string`                     | 空字符串    | 显示加载说明                          |
| `layout`    | `inline \| vertical`         | `inline`    | 文字在动画右侧或下方                  |
| `ariaLabel` | `string`                     | `加载中`    | 无可见文字时的无障碍说明              |

`animation` 类型为：

```ts
type FlLoadingAnimation =
  | 'working'
  | 'searching'
  | 'solving'
  | 'listening'
  | 'composing'
  | 'shaping'
  | 'earth'
```

运行时非法 animation/size 回退默认值并在开发环境提示；
speed 超范围取最近边界，非有限数值回退 1。暂停统一使用 `paused`，不使用 speed=0。

- `text` 插槽可替代文本内容；调用者负责自定义内容的可读性。
- 根元素使用 `span`，内部保持合法的行内容，以兼容 Element Plus 的 `p` 容器。
- `active=false` 保留整个组件尺寸；需要移除占位时由业务使用 `v-if`。
- 原生 `class`、`style`、`data-*` 传到根元素。
- 不提供逐帧事件，避免触发 Vue 组件树反复更新。

独立使用示例（待实现）：

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { FlLoading } from '@falcon-ui/components'

const paused = ref(false)
</script>

<template>
  <FlLoading animation="searching" :size="20" text="正在查询…" />
  <FlLoading
    animation="earth"
    :size="64"
    :paused="paused"
    layout="vertical"
    text="正在同步全球数据…" />
</template>
```

## 5. 与原生 v-loading 结合

### 5.1 业务入口

提供 `useFlLoading(active, options)`，返回可直接绑定原生指令的
`ComputedRef<false | LoadingOptions>`。
active 和 options 接受普通值、ref 或 getter，getter 用于读取动态配置。

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { vLoading } from 'element-plus'
import { useFlLoading } from '@falcon-ui/components'

const pending = ref(false)
const loading = useFlLoading(pending, () => ({
  animation: 'earth',
  size: 64,
  text: '正在加载数据…',
  background: 'var(--el-mask-color)'
}))
</script>

<template>
  <section v-loading="loading" style="min-height: 240px">表格或其他内容</section>
</template>
```

将 `animation` 改成 `searching`、`working` 等即可指定其他动画。
`<script setup>` 中导入 `vLoading` 即可局部使用；已全局安装 Element Plus 时可省略。
源码开发和按需使用需引入 Falcon UI 的 Loading 样式；最终发布路径按现有打包规则提供。

### 5.2 配置约定

- 支持独立组件的动画参数，但不重复提供 `active`；开关以第一个参数为准。
- 遮罩模式默认 `layout='vertical'`、`size=64`。
- 额外支持 `background`、`customClass`，专用类与用户类合并。
- 额外支持 `themeTarget` 元素或元素 ref，用于读取局部容器的主题和 CSS 变量；
  未提供时读取 documentElement。它只决定颜色来源，不改变遮罩挂载目标。
- body、fullscreen、lock 通过原生指令修饰符设置，首版不提供重复配置入口。
- active 为 false 时计算结果必须是 `false`；为 true 时才产生 LoadingOptions。
- text 由 helper 转成组件节点，禁止把 VNode 绑定到 `element-loading-text` HTML 属性。
- 使用 helper 时不再同时设置 `element-loading-svg`、`element-loading-spinner`
  或 `element-loading-text`，避免两套配置争抢显示内容。
- 普通 `v-loading="boolean"` 行为保持 Element Plus 默认值；不会全局替换动画。

首版必须验证以下原生写法：

```vue
<section v-loading="loading">局部遮罩</section>
<section v-loading.body="loading">遮罩挂在 body，覆盖目标区域</section>
<section v-loading.fullscreen.lock="loading">全屏遮罩和滚动锁定</section>
```

以上是互斥的使用示例，不要求同时打开。
Element Plus 全屏 Loading 是单例；不把两个同时开启的全屏请求解释为两个独立实例。
应用应以统一的 pending 状态汇总全屏任务，避免任一调用关闭全部等待提示。

### 5.3 内部实现与样式边界

```text
业务 pending/options
  → useFlLoading 计算 false 或 LoadingOptions
  → Element Plus 原生 v-loading 创建遮罩
  → text 中的 FlLoading 节点启动同一套 Canvas 绘制
```

helper 返回的核心结构是 `text: h(FlLoading, props)` 与
`customClass: 'fl-loading-adapter …'`，不让业务操作 VNode。
组件定义保持非响应式对象，内部渲染不依赖业务父组件的 provide/inject。
正式实现可在 FlLoading 外增加一个只渲染 span 的内部连接组件，直接读取 pending ref，
以便绑定变成 false 后，仍在离场的子组件也能立即停止动画。
不能只给初始 VNode 传入 active=true 的一次性快照。

样式只作用于 `.fl-loading-adapter` 后代：

- 隐藏其原有 `.circular` SVG，保证视觉上只有一个动画。
- 修正 spinner 的默认负 margin，使用垂直居中变换容纳 64px 动画和文字。
- 清除 text 容器默认边距，避免上下偏移或重复继承字体样式。
- 不使用组件 scoped 样式覆盖 body 遮罩，适配样式必须随公共主题发布。

Element Plus 的非默认 namespace 会改变 loading 类名。
实现时须读取应用配置生成匹配选择器或提供对应规则，并做真实浏览器验证；
不得在文档中把仅验证 `el` namespace 的效果表述为全部支持。
Element Plus 升级时重新运行接入测试和样式截图比较。

## 6. 生命周期、可读性与性能

### 6.1 动画生命周期

- 仅在 mounted 后访问 Canvas、document、window，服务端渲染阶段保留固定尺寸占位。
- 首次显示立即绘制有效静态帧，再启动 `requestAnimationFrame`，
  即浏览器每次准备刷新画面时推进动画。
- 使用累计有效时间，暂停恢复、调速不突然改变球体位置。
- paused、active=false、页面后台、滚出视口或 KeepAlive 停用时停止刷新。
- 系统开启“减少动态效果”时只画固定帧，颜色与文字变化仍能更新。
- 卸载时取消所有帧回调、观察器和事件监听。
- 指令关闭时把子组件标记为 inactive，让离场期间也停止刷新；
  最终由 Element Plus 卸载节点完成清理。

### 6.2 主题与无障碍

- 显式 color 优先，其次组件颜色变量，再按 theme 选择点的基础颜色。
- auto 跟随最近祖先的主题标记，找不到时跟随系统；需要监听主题变化。
- body/fullscreen 挂载会改变祖先和 CSS 变量继承，helper 从 themeTarget 解析主题，
  将解析后的颜色/主题传给节点；目标尚未挂载时采用文档主题，挂载后重新解析。
  嵌套深色区域须传入其 themeTarget 或明确 theme/color，并纳入必测场景。
- 外层提供一次 `role="status"` 和 `aria-live="polite"`，Canvas 为装饰元素。
- 无可见文字时使用 ariaLabel；有文字时避免重复朗读同一说明。
- active=false 时不继续播报等待状态；Canvas 不可获取键盘焦点。
- 需要声明区域忙碌状态时，业务在内容容器绑定 `:aria-busy="pending"`。
- Canvas 不可用时显示文字和静态圆点标识，不抛错或留下无说明的空白。

### 6.3 性能目标，实施后实测

以下为验收目标，不是本次已测得的数据：

| 项目       | 目标与测量方式                                                |
| ---------- | ------------------------------------------------------------- |
| 绘制开销   | 记录测试机器、浏览器、DPR；桌面 10 个 64px 地球持续运行 30 秒 |
| 帧预算     | 上述条件下，全部动画每帧计算与绘制总耗时 P95 不超过 8ms       |
| 小尺寸密度 | 单个 20px 动画点数不超过 120，确保圆点间仍有空隙              |
| 地球密度   | 单个 64px 地球总采样点目标不超过 1500，96px 不超过 3000       |
| 高清屏     | 画布像素比上限 2，CSS 尺寸不随设备像素比变化                  |
| 隐藏开销   | 页面隐藏/组件停用后，持续绘制回调数量降为 0                   |
| 资源释放   | 开关 100 次后，无脱离页面但继续运行的 Canvas 和帧回调         |
| 网络       | 动画与地理点集无需运行时外部请求                              |
| 包体积     | 七种算法与地球数据的新增压缩体积目标不超过 30KB gzip          |

数据采样与格式转换应在构建阶段完成；每帧不触发 Vue 响应式数组更新。
如目标未达标，优先减少点数和重复计算，并记录视觉影响后复验。

## 7. 目录与交付安排

实现放在 `packages/components/loading/`，按以下职责拆分：

- Vue 组件采用 `<script setup lang="ts">`，统一负责模板、Canvas 和生命周期。
- 组件类名使用 `@falcon-ui/utils` 的 `useNamespace('loading')`，通过
  `ns.b/e/m/is` 生成根节点、元素、布局和状态类；遮罩类使用 `ns.b('adapter')`。
- 样式集中在公共主题的 `loading.scss`，使用现有 Sass `bem.b/e/m/when` 混入，
  不手写组件 BEM 类名。遮罩样式限定在适配类下，以直接子元素关系兼容 Element Plus namespace。
- 每种动画是独立 TypeScript 算法，放在 `animations/` 中，不拆成重复的子 Vue 组件。

```text
packages/components/loading/
  loading_prd.md
  index.ts
  src/
    FlLoading.vue
    loading.ts                  # props、类型与默认值
    use-fl-loading.ts           # 原生指令配置函数
    use-loading-animation.ts    # Canvas 生命周期与时钟
    use-loading-color.ts        # 解析主题与实际绘制颜色
    loading-frame.ts            # 帧数据接口
    loading-profiles.ts         # 动画参数类型与缩放
    loading-renderer.ts         # 圆点绘制和颜色处理
    loading-presets.ts          # 各动画、尺寸的参数
    loading-geometry.ts         # 投影与通用点阵数学
    earth-points.ts             # 构建好的海陆点集
    animations/                # 七种动画各一个 TypeScript 文件
  __test__/
    loading.test.ts
    loading-renderer.test.ts
    loading-element-plus.test.ts
  THIRD_PARTY_NOTICES.md         # 算法和地图来源及许可
```

另需接入组件总出口、子路径出口、Falcon UI 安装入口与全局类型、
`packages/theme/src/loading.scss`、主题入口、中英文组件文档、演示与 API 元数据。
地球数据生成脚本放在 `scripts/` 中，记录输入版本和输出校验值。

| 阶段 | 交付                       | 完成条件                                         |
| ---- | -------------------------- | ------------------------------------------------ |
| A    | Searching + Earth 独立组件 | 两种画面、尺寸、主题、暂停通过视觉检查           |
| B    | useFlLoading 适配          | 原生局部/body/fullscreen、动态更新和清理通过测试 |
| C    | 其余五种参考动画           | 六种参考状态与地球全部可选、各状态运动不同       |
| D    | 公共导出、文档与质量验证   | 七种动画验收表通过，按需使用与完整安装可用       |

阶段 A/B 是优先顺序，不能代替首版七种动画的完整交付。

## 8. 验收清单

| 编号 | 操作                                 | 必须满足                                     |
| ---- | ------------------------------------ | -------------------------------------------- |
| L01  | 独立切换七种 animation               | 每种效果符合定义，无重复 Canvas 或控制台错误 |
| L02  | 64/96px 地球旋转一周                 | 主要大陆可辨、方向正确、无背面大陆叠影       |
| L03  | 20/32px 地球和 Searching 对照        | 小尺寸点不糊成块，两种图案可区分             |
| L04  | 同页三个区域选择不同动画             | 动画、文字、颜色、开关相互独立               |
| L05  | pending 由 false → true → false      | 原生遮罩正确显示、关闭，无双重转圈           |
| L06  | 加载中改变动画、尺寸、文字、速度     | 变化生效，遮罩不重复创建、不闪回默认 SVG     |
| L07  | 局部/body/fullscreen.lock            | 位置、层级、滚动锁定及退出恢复符合原生行为   |
| L08  | 同页存在未使用 helper 的 v-loading   | 原生默认转圈样式不受影响                     |
| L09  | 局部深色容器使用 body/fullscreen     | 点与背景仍清晰，主题切换及时生效             |
| L10  | 暂停、恢复、后台、离屏、KeepAlive    | 无不必要刷新，恢复画面不跳动                 |
| L11  | 开关 100 次及加载中卸载宿主          | 无遗留遮罩、事件监听和动画回调               |
| L12  | 减少动态效果、无障碍读取             | 静态显示并只读一次状态文字                   |
| L13  | 服务端导入/渲染与客户端挂载          | 不访问未定义的浏览器变量，无 hydration 警告  |
| L14  | 禁用 Canvas 或地图数据异常           | 有文字/静态标识，不抛异常阻断业务            |
| L15  | 基线版本与升级版本、非默认 namespace | 原生节点接入、布局和关闭流程通过回归         |
| L16  | 多实例与包体积测量                   | 达到性能目标，保存实测环境及结果             |

测试不只核对 props：单元测试验证地理点不随机漂移、投影方向、海陆区别和边界值；
Vue 测试验证暂停清理、更新与原生指令挂载；浏览器截图在固定时间点核对各动画，
真实浏览器检查 DPR、主题、遮罩布局、滚动和运动连续性。

实施阶段运行仓库现有 `pnpm lint`、`pnpm typecheck`、`pnpm test`、
`pnpm build:lib` 与 `pnpm docs:check`。检查结果另存 `loading_validation.md`，
未实测的项目明确标为待验证。

## 9. 已验证与待验证的边界

实现与本轮规范修正的实测结果见 [loading_validation.md](./loading_validation.md)。
下列调研结论不代表 L01–L16 已全部验收通过。

- 已验证：参考页面外观、上游算法与授权声明、安装版本类型和指令源码、
  VNode 接入的挂载/更新/关闭/重开/宿主卸载路径。
- 待验证：地球采样后的可辨识度、七种动画完整还原、真实浏览器主题和遮罩布局、
  非默认 namespace、Element Plus 跨版本兼容、帧耗时与发布体积。
- 原生接口支持并不消除样式适配工作；必须为 Element Plus 升级保留回归用例。
- 首版采用公开 MIT 算法移植；正式复制代码时保留其完整版权和许可声明。

[ref-21st]: https://21st.dev/@larsen66/components/thinking-orbs/searching
[ref-upstream]: https://github.com/Jakubantalik/thinking-orbs
[ref-lattice]: https://github.com/Jakubantalik/thinking-orbs/blob/de85557ca220332586d070d8788c0e1d6e877a0d/src/engine/lattice.ts
[ref-core]: https://github.com/Jakubantalik/thinking-orbs/blob/de85557ca220332586d070d8788c0e1d6e877a0d/src/engine/core.ts
[ref-engine]: https://github.com/Jakubantalik/thinking-orbs/blob/de85557ca220332586d070d8788c0e1d6e877a0d/src/engine/index.ts
[ref-package]: https://github.com/Jakubantalik/thinking-orbs/blob/de85557ca220332586d070d8788c0e1d6e877a0d/package.json
[ref-license]: https://github.com/Jakubantalik/thinking-orbs/blob/de85557ca220332586d070d8788c0e1d6e877a0d/LICENSE
[ref-earth]: https://www.naturalearthdata.com/about/terms-of-use/
[ref-ep]: https://element-plus.org/en-US/component/loading.html
