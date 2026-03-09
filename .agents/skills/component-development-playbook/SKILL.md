---
name: component-development-playbook
description: 用于将 Element Plus 组件二次封装为 Falcon UI 组件的标准工作流，覆盖契约定义、实现、测试与质量门禁。仅用于 Element Plus 二次封装（如 ElInput、ElButton、ElSelect），并遵循 FlInput 风格流程。非 Element Plus 或从零开发组件时禁止使用。
---

# 组件开发作战手册（仅限 Element Plus 二次封装）

仅在 Element Plus 组件二次封装场景使用本工作流。
如果目标不是 Element Plus 组件，立即停止并不要使用本技能。

## 第 0 步：适用性检查（硬门槛）

确认以下条件全部成立：

1. 目标组件基于 Element Plus（`El*`）。
2. 任务是二次封装（透传或增强），不是从零开发 UI。
3. 目标行为需要保持 Element Plus 语义一致。

任一条件不满足，立刻退出本技能。

## 第 1 步：冻结范围

明确以下内容：

1. 范围内：本次封装改动包含什么。
2. 范围外：本次封装改动明确不做什么。
3. 验收标准：任务关闭前必须满足什么。

每次任务只保留一个主目标。

## 第 2 步：先定义契约

在 `src/<component>.ts` 中先定义：

1. 封装层 props（仅增量能力），运行时对象命名为 `xxxProps`，例如 `inputProps`、`tableProps`。
2. 封装层 emits（含事件对象校验），运行时对象命名为 `xxxEmits`，例如 `inputEmits`、`tableEmits`。
3. 对外类型导出使用简短且有语义的名字，例如 `InputProps`、`InputEmits`、`CellChangeEvent`。

除非范围明确要求，不要重定义 Element Plus 已有 API。

## 第 3 步：实现封装组件

在 `src/<component>.vue` 中：

1. 使用 `inheritAttrs: false`。
2. 使用 `useAttrs`、`useSlots`，并渲染 `h(ElXxx, { ...mergedAttrs }, slots)`。
3. 在 merged attrs 中加入增量逻辑（自定义事件、调试钩子等）。
4. 保持 Element Plus 原有事件与插槽语义。
5. 如项目工具链有要求，按约定合并 expose/ref 行为。

## 第 4 步：保持导出边界一致

更新所有相关导出：

1. `packages/components/<component>/index.ts`
2. `packages/components/index.ts`
3. `packages/falcon-ui/index.ts`（如受包边界影响）
4. `packages/falcon-ui/global.d.ts`（涉及全局组件类型时）

确保组件与公共类型能从预期入口访问。

## 第 5 步：补充 Playground 验证

更新 `play/src/views/components-view.vue` 或等效演示页面：

1. 覆盖主交互路径。
2. 至少覆盖一条扩展路径（插槽/事件/调试行为）。
3. 展示可观察结果（状态文本、计数器、事件对象预览）。

## 第 6 步：补充测试

在 `packages/components/<component>/__test__/*.test.ts` 创建或更新测试：

1. 渲染与属性透传。
2. 值/事件行为（适用时覆盖 `v-model`）。
3. 自定义事件对象结构（统一使用 `...Event`）。
4. 插槽透传。
5. 封装特有分支的回归验证。

## 第 7 步：执行质量门禁

执行并通过：

1. `pnpm lint`
2. `pnpm test`
3. `pnpm format:check`
4. `pnpm play:build`

任一门禁失败，不得结束实现。

## 组件命名与样式命名规范（必须）

1. 组件名统一使用 `Fl` 前缀：`FlXxx`（例如 `FlButton`、`FlInput`）。
2. `defineOptions` 的 `name` 必须与组件名一致（例如 `name: 'FlButton'`）。
3. BEM 命名空间统一为 `fl`：类名形如 `fl-button`、`fl-input__inner`。
4. CSS 变量统一使用 `--fl-` 前缀，不再新增 `--f-` 变量。
5. 禁止新增旧命名：`F*`、`f-*`、`--f-*`。

## 变量与类型命名规范（必须）

1. `Fl` 前缀只保留给组件名、安装导出名与 `defineOptions.name`，例如 `FlTable`；不要把 `FlTable` 再重复写进组件内部变量和普通类型名。
2. 组件目录内的运行时契约对象统一使用短名：`tableProps`、`tableEmits`；禁止 `flTableProps`、`flTableEmits` 这类重复品牌前缀。
3. 公共类型使用 `PascalCase` 的语义名：`TableProps`、`TableEmits`、`RowData`、`ColumnState`。在当前组件上下文已经明确时，不重复加组件名前缀。
4. 自定义事件对象类型统一以 `Event` 结尾：`CellChangeEvent`、`RowOrderChangeEvent`、`SelectionRowToggleEvent`。禁止使用 `Payload` 作为类型后缀。
5. 命名以“最短且不丢语义”为原则。优先用业务名词本身，不要无意义堆叠上下文，例如优先 `RowData`，不要 `FlTableRowData`；优先 `cellChangeEvent`，不要 `tableCellChangePayload`。
6. 变量名不要滥用空泛后缀。除非语义确实需要，避免 `data`、`info`、`object`、`payload` 这类弱语义词反复叠加。
7. 布尔值必须使用 `is`、`has`、`can`、`should` 之一开头；引用类型遵循通用约定：`tableRef`、`columnOrder`、`visibleColumns`、`activeIndex`。
8. 只有在跨包公共导出确实会产生命名冲突时，才补充最小必要前缀；即使如此，也优先补业务域前缀，不引入 `Fl` 品牌前缀和 `Payload` 后缀。
9. 新增或重构组件时，如果发现旧命名与本规范冲突，应在当前任务范围内一并收敛，避免新旧规范并存。

## 参考资料

1. FlInput 模板与映射：`references/finput-standard-workflow.md`
2. 封装完成定义检查清单：`references/component-checklist.md`
3. 测试矩阵：`references/test-matrix.md`
4. PR 输出模板：`references/pr-template.md`

## Shared Hook Refactor Rule (Mandatory)

When two or more Element Plus wrapper components contain the same Composition API logic,
extract that logic into a shared hook under `packages/hooks/src/`.

Requirements:

1. Prefer one semantic hook file for one cohesive concern (for example `use-component.ts`).
2. Do not hardcode BEM class strings in component files; generate class names via `useNamespace`.
3. Keep component-specific event-object logic in component files; only move reusable structure.
4. Export new hooks from `packages/hooks/index.ts` and ensure dependent packages declare
   `@falcon-ui/hooks` / `@falcon-ui/utils` dependencies correctly.
5. After refactor, run and pass at least: `pnpm lint`, `pnpm test`.
