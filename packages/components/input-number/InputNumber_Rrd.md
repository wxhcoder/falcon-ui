# FlInputNumber 需求文档（InputNumber RRD）

## 0. 开发阶段状态

- [x] 阶段 1：核心组件契约与实现（`src/input-number.ts`、`src/input-number.vue`、`index.ts`）
- [x] 阶段 2：导出链路与构建链路接入
- [x] 阶段 3：单元测试覆盖
- [x] 阶段 4：Play 示例与文档示例
- [x] 阶段 5：API meta 与质量门禁（`format:check` 受仓库历史未格式化文件影响）
- [x] 阶段 6：格式化接口收敛（`format -> isFormat`，移除 `numberFormatter`，复用 `ElInput formatter/parser`）

## 1. 目标与背景

- 目标：新增 `FlInputNumber`，保持 `FlInput` 的透传/插槽/暴露能力与 `isError`、`isTable`
  逻辑，同时增加“仅数字输入 + 精度控制 + 显示格式化与绑定值分离”能力。
- 技术路线：按 component-development-playbook 流程，使用 Vue 3 `<script setup lang="ts">`，
  实现为 `ElInput` 包装组件，变更覆盖组件、导出、测试、play、文档和 API 元数据。

## 2. 组件定位

- 组件名称：`FlInputNumber`
- 技术基础：`ElInput`（不是 `ElInputNumber`）
- 封装风格：与 `FlInput` 一致（`inheritAttrs: false`、attrs/slots 透传、监听器合并、expose 合并）

## 3. 范围定义

### 3.1 In Scope

- 新增 `FlInputNumber` 组件与类型导出
- 输入值数字化校验与归一化
- 精度控制策略：`ROUND | FIXED | STRICT`
- 可选格式化显示（默认千分位，支持通过 `ElInput formatter/parser` 自定义）
- 严格模式错误联动：`isError` 与错误占位提示
- 完整测试、play 示例、文档与 API meta 输出

### 3.2 Out of Scope

- 不改造现有 `FlInput` 行为
- 不引入货币符号、单位系统、国际化完整方案
- 不新增服务端校验或表单引擎逻辑

## 4. 核心需求

### 4.1 值类型与归一化

- `v-model` 绑定值类型：`number | null`
- 输入值处理规则：
  - `number`：直接作为有效值
  - 字符串数字（如 `'123'`、`'12.34'`）：自动转换为 `number`
  - 非数字或非字符串数字（如 `'abc'`、`'12a'`）：直接清空为 `null`

### 4.2 输入控制

- 组件只允许数字输入语义
- 输入过程中应过滤非法字符，保留可形成合法数字的字符组合
- 清空输入框时，模型值同步为 `null`

### 4.3 精度控制

- 精度位配置：`precision: number`（默认 `2`）
- 精度策略配置：
  - `precisionMode: 'ROUND' | 'FIXED' | 'STRICT'`
  - 默认：`'ROUND'`
- 精度策略生效时机：`change` 阶段

#### ROUND（四舍五入）

- 当小数位超过 `precision` 时，自动四舍五入
- 例如：`1.236` + `precision=2` => `1.24`

#### FIXED（截断）

- 当小数位超过 `precision` 时，直接截断，不四舍五入
- 例如：`1.236` + `precision=2` => `1.23`

#### STRICT（严格）

- 当小数位超过 `precision` 时，不自动修正值
- 触发严格错误流程：
  - 触发 `strict-error` 事件
  - 触发 `update:isError`，传出 `true`
  - placeholder 显示精度错误提示

### 4.4 错误态与提示

- 保留 `isError`（与 `FlInput` 逻辑一致）
- `STRICT` 模式超精度时，需要主动触发外部错误联动
- 新增错误提示文案配置：
  - `strictErrorPlaceholder: string`
  - 默认文案：`精度不对`

### 4.5 格式化显示

- 配置项：
  - `isFormat: boolean`（默认 `false`）
  - 复用 `ElInput` 的 `formatter/parser` attrs
- 规则：
  - `isFormat=false`：显示原始编辑值
  - `isFormat=true` 且未提供 `formatter`：默认千分位格式化显示
  - `isFormat=true` 且提供 `formatter`（可配 `parser`）：优先使用调用方规则
- 关键约束：
  - 显示值可以是格式化字符串
  - 绑定值必须保持原始数值（`number | null`），不回传格式化字符串

## 5. 事件与类型契约

### 5.1 Props（新增/关键）

- `modelValue: number | null`
- `precision?: number`
- `precisionMode?: 'ROUND' | 'FIXED' | 'STRICT'`
- `isFormat?: boolean`
- `strictErrorPlaceholder?: string`
- `isError?: boolean`
- `isTable?: boolean`

### 5.2 Emits（新增/关键）

- `update:modelValue`：`(value: number | null) => void`
- `update:isError`：`(value: boolean) => void`
- `strict-error`：精度严格校验失败时触发

## 6. 交互与行为细则

- attrs/listeners/slots 必须继续透传
- 监听器调用顺序保持一致：先封装逻辑，再调用原监听器
- `isTable` 与 `isError` 样式机制需延续 `FlInput`
- 保留 ElInput expose，并支持封装额外 expose

## 7. 验收标准（必须通过）

### 7.1 功能验收

- 字符串数字自动转 number
- 非法值输入后模型值清空为 `null`
- 仅数字输入控制有效
- `ROUND/FIXED/STRICT` 三模式行为正确
- `STRICT` 下触发 `strict-error` + `update:isError(true)` + 错误 placeholder
- `isFormat=true` 默认千分位显示
- `isFormat=true` + `formatter/parser` 时按自定义显示
- 显示值与绑定值分离正确（绑定值始终原始 number）

### 7.2 兼容验收

- `FlInput` 既有能力不回归（样式、透传、调试事件语义）
- 组件导出链路完整：components/falcon-ui/global types
- play 示例可覆盖主路径与边界路径
- docs 与 api-meta 可正确生成并展示

### 7.3 质量门禁

- `pnpm lint`
- `pnpm test`
- `pnpm format:check`
- `pnpm play:build`

## 8. 默认值与约定

- `precision = 2`
- `precisionMode = 'ROUND'`
- `isFormat = false`
- `strictErrorPlaceholder = '精度不对'`
- 默认格式化实现采用千分位（如 `12,345.67`）

## 9. 交付清单

- `FlInputNumber` 组件源码与类型
- 单元测试
- play 演示
- 组件文档与示例
- API meta 产物
- 导出链路与全局类型注册
