# FlInputNumber 数字输入框

基于 Element Plus `ElInput` 的二次封装组件，提供数字输入约束、精度控制与格式化显示能力。

在表格可编辑场景中，传统数字输入组件常会把键盘 `↑/↓` 识别为步进操作。
当用户原本只是想上下切换单元格时，容易导致当前数字被意外增加或减少。
封装 `FlInputNumber` 的核心目标之一，就是将“单元格切换操作”与“数值步进操作”解耦，
避免误触发增减，保障录入行为稳定可控。

## 基础用法

::: demo input-number/basic
:::

## 精度模式

`precisionMode` 支持：

- `ROUND`：精度超限时四舍五入
- `FIXED`：精度超限时直接截断
- `STRICT`：精度超限时触发错误逻辑并清空值

::: demo input-number/precision-mode
:::

## 格式化显示

开启 `isFormat` 后，显示值会被格式化；绑定值仍保持原始数值类型（`number | null`）。

- 未传 `formatter`：默认千分位格式化
- 传入 `formatter`（可配 `parser`）：优先使用自定义格式化规则

::: demo input-number/format
:::

## API

### Props

<VpApiTable source="/api-meta/fl-input-number.json" section="props" />

### Events

<VpApiTable source="/api-meta/fl-input-number.json" section="events" />

### Slots

<VpApiTable source="/api-meta/fl-input-number.json" section="slots" />

### Exposes

<VpApiTable source="/api-meta/fl-input-number.json" section="exposes" />
