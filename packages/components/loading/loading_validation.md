# FlLoading 验证记录

日期：2026-09-12。分支：`codex/feat-loading`。实现与发布产物本地验证已完成。

## 本次 BEM 修正

- `FlLoading.vue` 保持 Vue Composition API 和 `<script setup lang="ts">`。
- 使用 `useNamespace('loading')` 生成根节点、元素、布局、状态与遮罩类名。
- Sass 使用公共 `bem.b/e/m/when`，新增 Canvas 元素类 `fl-loading__canvas`。
- 既有默认类名和公共接口保持兼容；适配样式仅匹配专用遮罩的直接子元素。
- Sass 编译核对通过：根节点、vertical、inactive、visual、canvas、fallback、text
  以及适配遮罩下 div、svg、p 共 10 个选择器。
- 组件回归覆盖布局切换、Canvas 复用、暂停恢复、关闭重开及卸载清理。

## 仓库检查

| 命令                 | 结果                                               |
| -------------------- | -------------------------------------------------- |
| `pnpm lint`          | 通过，零警告                                       |
| `pnpm typecheck`     | 通过；仓库脚本检查 play，库类型另由 build:lib 检查 |
| `pnpm test`          | 31 个文件、366 个测试通过，其中 Loading 19 个测试  |
| `pnpm build:lib`     | 通过，包含库类型生成与 Sass 编译                   |
| `pnpm docs:check`    | 通过，中英文 API 生成及文档构建成功                |
| `pnpm format:check`  | 通过，所有仓库文件符合 Prettier 配置               |
| `pnpm release:check` | 通过，生成并校验 `@falcon-ui/falcon-ui@1.1.0`      |
| `npm pack --dry-run` | 通过，318 个发布文件包含 Loading 入口和声明文件    |

构建仍提示 Browserslist 数据较旧、Sass legacy API 弃用及文档大分块，未阻断构建。
文档生成导致其他组件联合类型排序变化，已恢复这部分无关输出。
性能脚本包含多个独立 Vue 测试应用，局部豁免 one-component-per-file；生产组件没有豁免。

发布包包含 `THIRD_PARTY_NOTICES.md`、`./components/loading` 的 ESM/CJS 入口和类型声明。
远端推送与 npm 发布仍需在提交阶段完成；npm 发布前需要先完成 `npm login`。

## 浏览器与性能

环境：Windows x64，Chrome 152（Codex 内置浏览器），DPR 1.5，32 个逻辑处理器。
当前 Element Plus 基线 2.13.6。

- 原生局部遮罩使用新 Canvas 元素类，适配遮罩 SVG 为 `display:none`；
  同页普通原生遮罩 SVG 仍为 `display:inline`。
- 非默认 `qa` namespace：遮罩为 `qa-loading-mask fl-loading-adapter`，
  原生 SVG 隐藏，垂直中心偏差为 0 CSS px。
- 连续快速开关 100 次，最后卸载：遮罩 0、动画回调 0、测试容器残留 Canvas 0。
- 全屏遮罩使用 `position:fixed`，打开时原生滚动锁生效，关闭后锁定解除且全屏遮罩为 0。
  body 遮罩包含新 Canvas 元素类，背景保持指定的深色值。
- 十个 64px Earth 实例运行 30,003.6ms：采集 1,043 个回调时间点，
  平均总绘制耗时 4.85ms，P95 为 8.90ms。停止与卸载后回调均为 0，Canvas 为 0。
- 上一轮同环境 P95 为 7.50ms；本轮超过 PRD 的 8ms 目标，性能验收仍未通过。
  测量包含每帧十个实例的 JavaScript 计算与 Canvas 提交，不包含 GPU 光栅化，
  也不能据此声称达到稳定 60fps。
- 发布 ESM Loading 入口 37,700 bytes，gzip 10,089 bytes；独立压缩 CSS gzip 377 bytes。
  此入口包含七种动画、地理点集、组件、helper 和所需工具代码，不含 Vue/Element Plus
  外部依赖与 source map；低于 30KB gzip 目标。

复测入口：`node scripts/diagnostics/loading-preview.mjs`，打开输出的本地 URL，
分别运行 30 秒测试和 namespace/100 次开关测试。

## 首版剩余验收边界

本次 BEM 修正已完成；以下项目不能写成首版全部通过：

- L15：非默认 namespace 已验证，Element Plus 升级版本仍待独立回归。
- L16：体积与回调清理达标，十实例 P95 的稳定达标仍需优化与复测。
- L02/L03：已有大陆轮廓及小尺寸视觉检查，仍需保存固定时间点截图。
- L12/L13：已有无障碍属性、减少动态效果和 SSR 字符串渲染测试；
  实际读屏播报、浏览器 hydration 仍需专门验证。
- L14：Canvas 不可用的降级已测；地图生成脚本有输入哈希校验，损坏数据路径仍待补测。

其余已有算法、组件和指令回归覆盖详见同目录 `__test__`，不以单元测试代替完整浏览器验收。
