# FlSelect 需求文档（基于 ElSelect 二次封装）

## 1. 组件信息

- 组件名称：`FlSelect`
- 基础组件：Element Plus `ElSelect`
- 封装类型：透传增强型封装（保持原语义，增加业务态样式与默认值）

## 2. 目标

在保持 `ElSelect` 原生行为兼容的前提下，提供 Falcon UI 统一选择器能力：

- 提供 `isError` 错误态能力
- 提供 `isTable` 表格态能力
- 默认启用清空按钮（`clearable: true`）

## 3. 范围

### In Scope

- 新增封装层 Props：`isError`、`isTable`
- 封装层默认行为：`clearable` 默认开启
- attrs/slots 透传，保留 `ElSelect` 的 slots 与事件语义
- 输出 `FlSelect` 的 props/emits/type 导出骨架

### Out of Scope

- 复杂业务扩展（远程搜索、选项映射、自动回填等）
- 新增主题样式文件与视觉重设计
- 全量导出链与文档站联动接入

## 4. 功能需求

### FR-01 默认启用清空按钮

- 封装层默认 `clearable = true`。
- 若外部显式传入 `clearable`，以外部值为准。

### FR-02 错误态能力（isError）

- 提供 `isError: boolean`，默认 `false`。
- `isError = true` 时，组件根 class 增加 `is-error` 状态类。

### FR-03 表格态能力（isTable）

- 提供 `isTable: boolean`，默认 `false`。
- `isTable = true` 时，组件根 class 增加 `is-table` 状态类。

### FR-04 兼容性约束

- 不改变 `ElSelect` 原生 props、emits、slots 语义。
- 使用 `inheritAttrs: false`，通过 attrs 合并透传。
- 保留 BEM 命名空间根类：`fl-select`。

## 5. API 草案

### Props（封装层增量）

- `isError?: boolean`（default: `false`）
- `isTable?: boolean`（default: `false`）

### Emits（封装层增量）

- 当前版本不新增自定义 emits，保留类型导出占位。

## 6. 验收标准

1. 创建目录 `packages/components/select/`，并包含：
   - `select_prd.md`
   - `src/select.ts`
   - `src/select.vue`
   - `index.ts`
2. `select.ts` 包含 `flSelectProps`、`flSelectEmits`、`FlSelectProps`、`FlSelectEmits` 类型导出。
3. `select.vue` 使用 Vue 3 `<script setup lang="ts">`，并完成 `ElSelect` 透传骨架。
4. 默认 `clearable` 启用，外部 attrs 可覆盖。
5. 状态类在根 class 上可组合输出：`fl-select`、`is-error`、`is-table`。
6. 文档中包含可落地执行的测试用例清单，覆盖 FR-01 至 FR-04。

## 7. 测试用例

测试文件目标位置：`packages/components/select/__test__/select.test.ts`

### 7.1 渲染与透传

1. 使用基础 attrs 渲染 `FlSelect`，断言组件可正常挂载。
2. 断言根 class 包含 `fl-select`，并且外部传入 class 不丢失。
3. 断言 `disabled`、`placeholder` 等常用 attrs 可透传到底层 `ElSelect`。

### 7.2 默认值与覆盖规则（FR-01）

1. 未传入 `clearable` 时，断言传递给 `ElSelect` 的 `clearable === true`。
2. 传入 `clearable=false` 时，断言封装层不会覆盖，最终值为 `false`。
3. 传入 `clearable=true` 时，断言最终值仍为 `true`。

### 7.3 状态类分支（FR-02 / FR-03）

1. `isError=false` 时不应包含 `is-error` 类；`isError=true` 时应包含 `is-error` 类。
2. `isTable=false` 时不应包含 `is-table` 类；`isTable=true` 时应包含 `is-table` 类。
3. 同时传入 `isError=true` 与 `isTable=true`，断言两个状态类可同时存在。

### 7.4 兼容性回归（FR-04）

1. `v-model` 变更链路保持可用，`update:modelValue` 可被父层接收。
2. 外部监听器（如 `onChange`）仍可触发，封装层不吞掉原生事件。
3. 默认插槽和常见命名插槽（如 `prefix`、`empty`）内容可正常透传渲染。

### 7.5 导出与集成冒烟

1. 断言可从组件入口导入 `FlSelect` 组件。
2. 断言可从组件入口导入 `FlSelectProps`、`FlSelectEmits` 类型。
3. 在演示页完成最小交互冒烟：可选择、可清空、状态类可切换。

## 8. 质量门禁

建议在实现与测试补齐后执行：

1. `pnpm lint`
2. `pnpm test`
3. `pnpm format:check`
4. `pnpm play:build`

## 9. 阶段完成记录（component-development-playbook）

- [x] 第 0 步：适用性检查完成（基于 Element Plus `ElSelect` 的二次封装，保持原语义）。
- [x] 第 1 步：范围冻结完成（本次聚焦 `isError`、`isTable`、默认 `clearable`，不扩展业务检索能力）。
- [x] 第 2 步：契约定义完成（`flSelectProps`/`flSelectEmits`/类型导出已落地）。
- [x] 第 3 步：组件实现完成（`inheritAttrs: false` + attrs/slots 透传 + 默认 `clearable` 逻辑）。
- [x] 第 4 步：导出边界完成（`components`、`falcon-ui`、`global.d.ts`、构建入口已接入）。
- [x] 第 5 步：Playground 验证完成（`components-view.vue` 增加 FlSelect 演示与状态切换路径）。
- [x] 第 6 步：测试补齐完成（新增 `packages/components/select/__test__/select.test.ts`，覆盖渲染、透传、分支、插槽、导出冒烟）。
- [x] 第 7 步：质量门禁已执行（见下方结果）。

### 9.1 质量门禁执行结果（2026-03-05）

1. [x] `pnpm lint`：通过
2. [x] `pnpm test`：通过
3. [ ] `pnpm format:check`：未通过（仓库存在大量历史文件格式差异，非本次改动独占问题）
4. [x] `pnpm play:build`：通过
