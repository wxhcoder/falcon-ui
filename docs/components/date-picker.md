# FlDatePicker 日期选择器

基于 Element Plus `ElDatePicker` 的二次封装组件，支持透传和 Falcon UI 统一状态能力。

## 功能状态

| 功能项                 | 状态   | 说明                                                  |
| ---------------------- | ------ | ----------------------------------------------------- |
| `isError` 错误态 class | 已实现 | 组件根节点增加 `is-error`。                           |
| `isError` 清空行为     | 已实现 | 从 `false -> true` 时触发 `update:modelValue(null)`。 |
| `isTable` 表格态 class | 已实现 | 组件根节点增加 `is-table`。                           |
| 全模式清空一致性       | 已实现 | `date/datetime/range` 等模式统一清空为 `null`。       |
| E2E 自动化用例         | 待实现 | 当前仅完成单元测试与文档示例。                        |

## 基础用法

::: demo date-picker/basic
:::

## 日期区间

::: demo date-picker/range
:::

## 错误状态

`isError` 用于错误态展示。值从 `false` 切换为 `true` 时，会为组件添加错误样式并通过
`update:modelValue` 将当前值同步清空为 `null`。

::: demo date-picker/is-error
:::

## 表格场景

`isTable` 用于表格单元格内日期编辑场景，可与 `isError` 组合使用。

::: demo date-picker/is-table
:::

## 支持模式

已覆盖以下 `ElDatePicker` 模式：

- `date`
- `dates`
- `datetime`
- `week`
- `month`
- `year`
- `daterange`
- `datetimerange`
- `monthrange`
- `yearrange`

## API

### Props

<VpApiTable source="/api-meta/fl-date-picker.json" section="props" />

### Events

<VpApiTable source="/api-meta/fl-date-picker.json" section="events" />

### Slots

<VpApiTable source="/api-meta/fl-date-picker.json" section="slots" />

### Exposes

<VpApiTable source="/api-meta/fl-date-picker.json" section="exposes" />
