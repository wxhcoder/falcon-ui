# FlTextShimmer 需求文档（Text Shimmer PRD）

## 0. 开发阶段状态

- [x] 阶段 1：参考效果调研、需求梳理与目录初始化
- [ ] 阶段 2：组件属性与类型定义
- [ ] 阶段 3：文字扫光效果实现与主题样式接入
- [ ] 阶段 4：按需导出、全量安装与全局类型声明
- [ ] 阶段 5：单元测试、Play 示例与中英文文档
- [ ] 阶段 6：类型检查、代码检查、测试与构建验证

开发分支：`codex/feat-text-shimmer`，从当前 `1.0.0` 分支创建。
本阶段完成需求文档，组件实现与验证按上述后续阶段推进。
文档文件名保留为 `TestShimmer_PRD.md`，组件名称统一使用 `FlTextShimmer`。

## 1. 组件目标

提供文字扫光组件：文字保持原位，一条高亮带从左向右扫过文字并循环播放。
高亮只出现在字形内部，周围背景不发光；动画过程中不改变文字尺寸或位置。

适用于“正在思考”“正在生成报告”“正在扫描文档”等等待提示，
可放在普通文本、按钮文字、标签和输入区域的辅助提示中。
动画表示任务仍在处理，不代表实际完成百分比。

## 2. 参考来源与效果对齐

- [Loading UI Text shimmer 文档](https://loading-ui.com/docs/components/text-shimmer)
- [参考组件源码](https://github.com/turbostarter/loading-ui/blob/main/registry/components/loading-ui/text-shimmer.tsx)
- 调研日期：2026-09-10。

已核对的参考行为：

- 使用渐变背景，并将背景裁剪到文字内部。
- 默认每次扫过耗时 `2` 秒，匀速、无限循环。
- 默认 `spread=2`，源码以字符串长度乘以该参数得到渐变中心两侧的扩散距离，单位为 px。
- 渐变背景宽度为文字容器的 `250%`，背景位置从 `100% center` 移至 `0% center`。
- 普通文字颜色为 `currentColor` 与透明色混合，文字颜色占 `55%`；
  高亮颜色为 `currentColor`，即跟随所在位置的 CSS `color`。
- 可分别指定普通文字颜色与高亮颜色。

Falcon UI 采用 Vue 3 与 CSS 动画实现上述视觉效果，不增加 React 或 Motion 依赖。
以下 API 为 Falcon UI 的设计草案；默认标签、内容传入方式和关闭动画能力是本库的适配。

## 3. 首版范围

### 3.1 包含能力

- 中文、英文、数字和混合纯文本的连续扫光。
- 自定义文字、扫过时长、高亮宽度、普通文字颜色和高亮颜色。
- 默认继承父级字体、字号、字重、行高及文字颜色，适配浅色与深色背景。
- 可关闭动画，关闭后显示静态文字。
- 尊重系统“减少动态效果”设置，系统要求减少动画时显示静态文字。
- 支持运行时更新文字和属性。
- 支持按需使用、全量安装及服务端渲染。

### 3.2 不包含能力

- 逐字跳动、打字机、波浪、闪烁或多方向扫光。
- 加载进度计算、异步请求管理和任务完成判断。
- 多行逐行扫光、富文本排版、图标扫光和 HTML 字符串解析。
- 播放次数、播放完成事件或命令式播放方法。

## 4. 组件 API 草案

### 4.1 Props

| 属性           | 类型                     | 默认值      | 说明                                     |
| -------------- | ------------------------ | ----------- | ---------------------------------------- |
| `text`         | `string`                 | `''`        | 无默认插槽时显示的文字                   |
| `as`           | `'span' \| 'p' \| 'div'` | `'span'`    | 根元素标签                               |
| `duration`     | `number`                 | `2`         | 一次完整扫过的秒数，必须为有限正数       |
| `spread`       | `number`                 | `2`         | 高亮扩散系数，必须为有限正数             |
| `baseColor`    | `string`                 | `undefined` | 普通文字颜色，未设置时跟随父级颜色并减淡 |
| `shimmerColor` | `string`                 | `undefined` | 高亮颜色，未设置时跟随父级颜色           |
| `disabled`     | `boolean`                | `false`     | 是否关闭扫光，显示静态文字               |

`spread` 的计算方式与参考源码一致：`显示文字.length × spread`，结果单位为 px。
这里的长度使用 JavaScript 字符串 `length`，不测量屏幕上的文字像素宽度。
该结果控制渐变中心两侧的距离；相同文字下，参数越大，高亮覆盖范围越宽。

默认标签选择 `span`，便于直接放入按钮或一句话中。
业务可通过 `class`、`style` 控制字体与布局，无需额外提供字号、字重属性。

### 4.2 Slots、Events 与 Exposes

- 默认插槽：只接收纯文本或字符串插值，存在时优先于 `text`。
- 多个文本节点按顺序合并后计算 `spread`，保留原始空格，不使用 `trim()`。
- 不解析 HTML，不承诺包含元素或组件的富文本插槽效果。
- 不新增自定义事件，不暴露实例方法。
- `class`、`style`、`title`、`aria-*` 等原生属性透传至根元素。

### 4.3 使用示例

```vue
<FlTextShimmer>正在思考</FlTextShimmer>

<FlTextShimmer text="正在扫描文档" :duration="3" :spread="3" />

<FlTextShimmer base-color="#64748b" shimmer-color="#0ea5e9">
  正在生成报告
</FlTextShimmer>

<FlTextShimmer :disabled="!loading" :text="loading ? '正在生成' : '生成完成'" />
```

## 5. 渲染与动画要求

- 使用 Vue 3 Composition API、`<script setup>` 与 TypeScript。
- 通过计算属性生成动画所需的 CSS 变量，样式统一放入主题包。
- 使用“静态底色渐变 + 移动高亮渐变”两层背景，裁剪到字形内。
- 使用 CSS `@keyframes` 移动背景；不通过计时器逐帧修改 Vue 状态。
- 保留元素本身的 `color`，使用文字填充透明实现背景显示，
  避免将 `color` 设置为透明后导致 `currentColor` 失效。
- 根元素默认 `inline-block`，无额外外边距或内边距，默认单行显示。
- 长文本不自动截断或添加省略号；容器宽度限制与溢出展示由业务控制。
- 属性变化后样式立即更新，允许动画重新开始；文字变化后重新计算高亮宽度。
- `disabled=true` 时清除动画及渐变填充，显示 `baseColor` 或完整父级文字颜色。
- 再次启用时从一轮扫光的起点重新开始，不保留暂停进度。
- 空内容不输出占位符或多余宽度，不保留上一次显示的文字。
- 不读取浏览器尺寸，不依赖 `window` 或 `document`，保证服务端能输出文字。

## 6. 异常与可访问性

- `duration`、`spread` 为零、负数、`NaN` 或无穷大时回退默认值，
  不生成无效动画样式；开发环境给出参数警告。
- 颜色支持合法 CSS 颜色与 CSS 变量；空字符串按未设置处理。
  无效颜色字符串不抛出组件异常，其显示遵循浏览器 CSS 处理规则。
- `prefers-reduced-motion: reduce` 下采用与关闭动画相同的静态显示方式。
- 不支持文字背景裁剪或颜色混合时回退为可读的静态文字，禁止整段文字透明消失。
- 强制颜色模式下显示系统可读文字，不保留透明填充。
- 保留真实文本供复制与屏幕阅读器读取，不拆成重复的装饰文本。
- 不自动设置 `role="status"`、`aria-live` 或 `aria-busy`；
  由业务根据实际任务状态传入，避免仅因装饰动画重复播报。

## 7. 文档与示例

- `basic.vue`：默认插槽与 `text` 两种用法，包含中英文文字。
- `color.vue`：继承父级颜色、自定义两种颜色、浅色与深色背景。
- `duration.vue`：对比 `1`、`2`、`4` 秒的扫过速度。
- `spread.vue`：同一段文字对比 `1`、`2`、`4` 的高亮宽度。
- `disabled.vue`：运行时切换动画与静态文字。
- `button.vue`：在 `FlButton` 中展示文字跟随按钮前景色的效果。

中英文文档说明所有属性、默认插槽限制、单行约束和减少动态效果的行为。
Play 页面提供可调整内容、时长、宽度、颜色及启停的示例。

## 8. 测试与验收

### 8.1 自动化验证

- 默认属性、标签、文本属性与默认插槽优先级正确。
- 中文、空格、表情和动态文本按约定计算高亮宽度。
- 更新时长、宽度、颜色与关闭状态后，文字及样式配置正确更新。
- 空内容清空显示；非法数值回退默认值，且不抛出异常。
- 原生属性、类名、内联样式透传正常。
- 按需导入、全量安装、全局类型声明与服务端渲染正常。

### 8.2 浏览器视觉验收

- 与参考页并排查看同一段文字：扫光方向、匀速循环、默认时长及宽度一致。
- 文字始终可读，高亮只在字形内移动，无文字位移和容器尺寸抖动。
- 首尾衔接不出现明显闪白，长短文字都能看到高亮扫过全过程。
- 浅色、深色、实心按钮内的文字颜色正确，无背景矩形色块。
- 关闭动画、系统减少动态效果及强制颜色模式下显示静态可读文字。
- 在 Chromium、Firefox、WebKit 中检查动画和静态回退。

单元测试不能替代动画视觉验收；浏览器检查需记录结果并保存效果截图或录屏。

实现完成后执行：`pnpm typecheck`、`pnpm lint`、`pnpm test`、
`pnpm docs:check`、`pnpm play:build`、`pnpm release:check`。

## 9. 后续落地文件与接入位置

- `packages/components/text-shimmer/src/text-shimmer.ts`：属性与公开类型。
- `packages/components/text-shimmer/src/text-shimmer.vue`：组件实现。
- `packages/components/text-shimmer/index.ts`：通过 `withInstall` 导出组件及类型。
- `packages/components/text-shimmer/__test__/text-shimmer.test.ts`：组件测试。
- `packages/theme/src/text-shimmer.scss` 与 `packages/theme/index.scss`：动画及主题入口。
- `packages/components/index.ts`：组件与类型导出。
- `packages/falcon-ui/index.ts` 与 `global.d.ts`：全量安装及全局组件类型。
- `packages/falcon-ui/__test__/`：补充导出与安装验证。
- `docs/components/text-shimmer.md` 与 `docs/en/components/text-shimmer.md`：中英文文档。
- `docs/examples/text-shimmer/`：文档示例。
- `docs/.vitepress/config.ts`、组件总览数据与 `theme/demo-runtime.ts`：文档导航和示例加载。
- `scripts/docs/generate-api-meta.mjs`：组件 API 文档生成配置。
- `play/src/views/components-view.vue`：交互示例。
- `scripts/release/verify-package.mjs`：确认组件子路径导出及发布产物。
