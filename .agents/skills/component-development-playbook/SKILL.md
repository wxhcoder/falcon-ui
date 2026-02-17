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

1. 封装层 props（仅增量能力），命名为 `flXxxProps`。
2. 封装层 emits（含 payload 校验），命名为 `flXxxEmits`。
3. 对外类型导出（`FlXxxProps`、`FlXxxEmits`、payload 类型）。

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
3. 展示可观察结果（状态文本、计数器、payload 预览）。

## 第 6 步：补充测试

在 `packages/components/<component>/__test__/*.test.ts` 创建或更新测试：

1. 渲染与属性透传。
2. 值/事件行为（适用时覆盖 `v-model`）。
3. 自定义事件 payload 结构。
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
3. 封装层 props/emits 使用 `fl` 前缀：`flXxxProps`、`flXxxEmits`。
4. 类型名使用 `Fl` 前缀：`FlXxxProps`、`FlXxxEmits`。
5. BEM 命名空间统一为 `fl`：类名形如 `fl-button`、`fl-input__inner`。
6. CSS 变量统一使用 `--fl-` 前缀，不再新增 `--f-` 变量。
7. 禁止新增旧命名：`F*`、`f-*`、`--f-*`。

## 参考资料

1. FlInput 模板与映射：`references/finput-standard-workflow.md`
2. 封装完成定义检查清单：`references/component-checklist.md`
3. 测试矩阵：`references/test-matrix.md`
4. PR 输出模板：`references/pr-template.md`
