# SCSS 开发规范

用于 `packages/theme/src/*.scss` 中的 Falcon 组件主题开发。

## 1. 文件位置与结构

1. 组件主题文件统一放在 `packages/theme/src/<component>.scss`。
2. 文件顶部先引入 `packages/theme/src/mixins/bem.scss`，再引入对应的 Element Plus 原始样式文件。
3. 组件扩展样式统一放在 `@include bem.b(<block>)` 作用域内，不在文件里散落独立 `.fl-*` 根选择器。

## 2. BEM 使用方式

1. 块、元素、修饰符、状态优先使用 `b`、`e`、`m`、`when` mixin。
2. 禁止直接手写 `.fl-button`、`.fl-table__cell`、`.is-active` 这类 `fl` 命名空间字符串。
3. 只有在复合选择器必须把 `fl` 类名嵌入第三方 DOM 结构时，才允许使用 `bem.selector(...)`。
4. 如果 `b/e/m/when` 能表达，就禁止退回 `bem.selector(...)`。
5. 禁止在 `bem.scss` 中新增与 `b/e/m/when` 平行、语义重复的 helper API。

## 3. 覆盖 Element Plus 样式

1. 先保留 Element Plus 基线样式，再在 Falcon 作用域内做增量覆盖。
2. 处理 `striped`、`current-row`、`hover`、`fixed` 等结构态时，优先通过更精确的选择器解决，不使用 `!important`。
3. 样式覆盖前先确认是“类未命中”还是“优先级不够”，不要用额外状态类掩盖选择器问题。

## 4. 命名语义

1. 结构性元素使用 `__element`。
2. 修饰差异使用 `--modifier`。
3. 交互或运行时状态优先通过 `when(...)` 或外层状态类表达。
4. 临时视觉语义如果需要落类名，也必须保持 BEM 语义清晰并可复用。

## 5. 验证要求

1. 样式改动完成后，至少执行 `pnpm build:lib:style`。
2. 如果组，件带文档示例或样式会影响文档页面渲染，再执行 `pnpm docs:build`。
