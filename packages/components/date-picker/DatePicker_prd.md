# FlDatePicker PRD (ElDatePicker 二次封装)

## 1. 组件信息

- 组件名称: `FlDatePicker`
- 基础组件: Element Plus `ElDatePicker`
- 封装类型: 透传增强型封装（保持原生语义，增加 Falcon UI 业务状态能力）

## 2. 目标

- 提供统一的 `isTable` 与 `isError` 状态能力。
- 保持 `ElDatePicker` 的 attrs / events / slots 透传语义。
- 在错误态切换时提供一致的清空行为，降低表单脏值风险。

## 2.1 实现状态（对齐代码）

| 功能项                                | 状态   | 说明                                                     |
| ------------------------------------- | ------ | -------------------------------------------------------- |
| `isError` / `isTable` props           | 已实现 | 已在 `src/date-picker.ts` 定义并导出类型。               |
| attrs / slots 透传                    | 已实现 | `src/date-picker.vue` 通过 `h(ElDatePicker, ...)` 透传。 |
| `isError` 清空 `modelValue` 为 `null` | 已实现 | 首次挂载与状态切换均生效。                               |
| 全模式清空一致性（10 种 type）        | 已实现 | 单元测试覆盖并通过。                                     |
| `isError` / `isTable` 主题样式        | 已实现 | 新增 `packages/theme/src/date-picker.scss`。             |
| 文档示例（基础/区间/错误/表格）       | 已实现 | 已接入 docs 组件页与示例。                               |
| E2E 自动化测试                        | 待实现 | 当前保留在测试计划阶段。                                 |

## 3. 本期范围

### In Scope

- 新增封装层 props:
  - `isError?: boolean`（默认 `false`）
  - `isTable?: boolean`（默认 `false`）
- `isError` 行为:
  - 当 `isError` 从 `false` 切换为 `true` 时，触发 `onUpdate:modelValue(null)`。
  - 当首次挂载即 `isError=true` 时，立即触发一次清空。
- 根 class 输出:
  - `fl-date-picker`
  - 条件类 `is-error`、`is-table`
- 支持并验证全部常见 `ElDatePicker` 模式:
  - `date` `dates` `datetime` `week` `month` `year`
  - `daterange` `datetimerange` `monthrange` `yearrange`

### Out of Scope

- 日期快捷项、禁用规则、时区策略等业务扩展。
- 主题样式细节重构（仅保留状态 class 约定）。
- 文档站点页面与全量包导出链路接入。

## 4. 目录结构

```text
packages/components/date-picker/
  DatePicker_prd.md
  index.ts
  src/
    date-picker.ts
    date-picker.vue
  __test__/
    date-picker.test.ts
```

## 5. API 草案

### Props (增量封装)

- `isError: boolean = false`
- `isTable: boolean = false`

### Emits (增量封装)

- 首版不新增自定义 emits，保留类型导出结构。

### 清空值约定

- 错误态触发的清空 payload 固定为 `null`。
- 不按单值/区间模式返回不同空值，避免接入方分支判断。

## 6. 功能需求

- FR-01: 默认透传 `ElDatePicker` 原生行为，且不破坏 attrs/events/slots。
- FR-02: `isTable=true` 时根 class 增加 `is-table`。
- FR-03: `isError=true` 时根 class 增加 `is-error`。
- FR-04: `isError` 进入 `true` 时触发 `update:modelValue` 的监听器，payload=`null`。
- FR-05: FR-04 在所有支持模式下行为一致。

## 7. 测试用例清单

### 7.1 单元测试（Vitest + Vue Test Utils）

1. `UT-01` 透传监听器:
   - 前置: 传入 `onChange`。
   - 操作: 触发内部 `change` 事件。
   - 期望: `onChange` 接收到原始 payload。
2. `UT-02` 基础 class:
   - 前置: 默认渲染。
   - 期望: 根节点存在 `fl-date-picker`。
3. `UT-03` 表格态 class:
   - 前置: `isTable=true`。
   - 期望: 根节点包含 `is-table`。
4. `UT-04` 错误态首屏清空:
   - 前置: `isError=true` 且存在初始值。
   - 期望: 首次挂载触发一次 `onUpdate:modelValue(null)`。
5. `UT-05` 错误态切换清空:
   - 前置: 初始 `isError=false`。
   - 操作: 更新为 `isError=true`。
   - 期望: 触发一次 `onUpdate:modelValue(null)`，且有 `is-error` class。
6. `UT-06` 组合态:
   - 前置: `isTable=true` 且 `isError=true`。
   - 期望: 同时包含 `is-table`/`is-error`，并触发清空。
7. `UT-07` 全模式一致清空:
   - 前置: 分别以 10 种 picker type 挂载，`isError=true`。
   - 期望: 每种模式都触发一次 `onUpdate:modelValue(null)`。

### 7.2 E2E 场景（后续接入 Playwright/Cypress）

1. `E2E-01` 单值模式错误态回滚:
   - 流程: 选择日期 -> 切换 `isError=true`。
   - 期望: 输入展示清空，根节点出现 `is-error`。
2. `E2E-02` 区间模式错误态回滚:
   - 流程: 选择日期区间 -> 切换 `isError=true`。
   - 期望: 区间展示清空，提交值为 `null`。
3. `E2E-03` 表格态错误联动:
   - 流程: `isTable=true` 下选择值 -> 切换 `isError=true`。
   - 期望: 保留 `is-table` 并出现 `is-error`，值清空。
4. `E2E-04` 恢复可编辑:
   - 流程: 错误态清空后切回 `isError=false`，再次选择日期。
   - 期望: 可正常选择并提交新值。
5. `E2E-05` 模式抽样回归:
   - 流程: 抽样 `date` / `datetime` / `daterange` / `yearrange`。
   - 期望: 事件链路、清空语义与 class 行为一致。

## 8. 验收标准

1. 目录与文件结构按第 4 节创建完成。
2. `date-picker.ts`、`date-picker.vue`、`index.ts` 可通过类型检查。
3. 单元测试文件覆盖第 7.1 节核心场景。
4. PRD 明确列出单元与 E2E 用例，具备可执行验收标准。
