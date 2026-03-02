# FlInputSearch 精简落地开发计划（弹窗占位版）

## 1. Summary

本期只实现 `FlInputSearch` 组件本体，不实现全局弹窗函数。  
组件采用固定样式和固定交互，直接使用 `<el-input>` 封装，不走 `<component>` 动态透传模式，
也不做 ElInput 全量 props、slots、methods 透传。

## 2. 范围与边界

### 2.1 In Scope

1. 新增 `FlInputSearch` 契约与实现。
2. 实现双值逻辑（`modelValue` + `label`）、Enter 检索、唯一结果回填、Blur 快照清理。
3. 非唯一结果与手动搜索仅抛出“弹窗占位”事件（不实现弹窗）。
4. 补齐导出链路、基础样式、单测、play 示例、docs、api-meta。

### 2.2 Out of Scope

1. 不实现 `openInputSearchPanel` / 全局单例弹窗服务。
2. 不实现 `FlDialog` 选择面板行为。
3. 不透传全部 ElInput 能力。

## 3. 公共 API（冻结）

### 3.1 Props

1. `modelValue: string | number | null`
2. `label: string`
3. `fetchApi?: (keyword: string) => Promise<unknown[]>`
4. `mapResult: (item: unknown) => { value: string | number | null; label: string }`
5. `placeholder?: string`
6. `disabled?: boolean`
7. `clearable?: boolean`
8. `isError?: boolean`（默认 `false`）
9. `isTable?: boolean`（默认 `false`）
10. `clearOnBlurUnconfirmed?: boolean`（默认 `true`）

### 3.2 Emits

1. `update:modelValue(value)`
2. `update:label(label)`
3. `openDialog(payload: { keyword: string; reason: 'manual' | 'multi-match'; results?: unknown[] })`
   模板监听时使用 `@open-dialog`（遵循 Vue 事件连字符规范）。
4. `selection-commit(payload: { value; label; source: 'enter' })`
5. `search-error(payload: { keyword: string; error: unknown })`
6. `clear(payload: { reason: 'manual-empty' | 'blur-unconfirmed' | 'error' })`

### 3.3 Slots

不开放业务插槽（固定 UI）。

### 3.4 Expose

仅暴露 `focus()`、`blur()`、`clear()`（包装内部 input ref，不透传全部实例方法）。

## 4. 交互实现方案（组件内）

1. 模板固定：`<el-input v-model="innerLabel" ...>` + 固定 suffix 搜索按钮图标。
2. 输入阶段：仅更新 `label`，不更新 `modelValue`。
3. Enter：
   1. 空值不请求。
   2. 调 `fetchApi`。
   3. 1 条结果：`mapResult` 后提交 `modelValue` 与 `label`，刷新快照。
   4. 多条结果：抛 `openDialog(reason='multi-match')`。
4. 点击 suffix 搜索按钮：抛 `openDialog(reason='manual')`，业务侧通过 `@open-dialog` 监听。
5. Blur 快照策略：
   1. 未变化：不处理。
   2. 清空：`value/label` 均清空。
   3. 未确认输入：强制清空。
6. 不透传原始 attrs/listeners；仅受控支持上述 API。

## 5. 文件变更清单

### 5.1 新增

1. `packages/components/input-search/src/input-search.ts`
2. `packages/components/input-search/src/input-search.vue`
3. `packages/components/input-search/index.ts`
4. `packages/components/input-search/__test__/input-search.test.ts`
5. `packages/theme/src/input-search.scss`
6. `docs/components/input-search.md`
7. `docs/examples/input-search/basic.vue`
8. `docs/examples/input-search/enter-multi-placeholder.vue`
9. `docs/public/overview/fl-input-search.svg`

### 5.2 修改

1. `packages/components/index.ts`
2. `packages/components/package.json`
3. `packages/falcon-ui/index.ts`
4. `packages/falcon-ui/global.d.ts`
5. `packages/theme/index.scss`
6. `play/src/views/components-view.vue`
7. `docs/.vitepress/config.ts`
8. `docs/.vitepress/data/overview-components.ts`
9. `scripts/docs/generate-api-meta.mjs`
10. `docs/public/api-meta/fl-input-search.json`

## 6. 测试用例

1. 输入仅更新 `label`，不改 `modelValue`。
2. Enter 空值不触发 `fetchApi`。
3. Enter 单结果自动回填并触发 `selection-commit`。
4. Enter 多结果触发 `openDialog`。
5. 点击搜索按钮触发 `openDialog(manual)`。
6. Blur 未确认输入触发强制清空。
7. `isError`/`isTable` 样式状态正确。
8. expose 的 `focus/blur/clear` 可用。

## 7. 质量门禁

1. `pnpm lint`
2. `pnpm test`
3. `pnpm format:check`
4. `pnpm play:build`
5. `pnpm docs:api`
6. `pnpm docs:build`

## 8. Assumptions & Defaults

1. 本期“弹窗占位”统一通过 `openDialog` 事件表达。
2. `mapResult` 为必传，确保数据结构由业务侧完全定义。
3. 不做向后兼容的 attrs 透传扩展；如后续需要再增量开放白名单 props。
4. 组件视觉与行为固定，优先稳定性而非通用性。
