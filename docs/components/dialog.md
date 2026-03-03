# FlDialog 对话框

基于 Element Plus `ElDialog` 的二次封装，默认增强拖拽、销毁、居中与 Bounce 过渡。

## 基础用法

::: demo dialog/basic
:::

## 自定义表头插槽

通过 `header` 插槽可以自定义表头内容，同时保留内置全屏与关闭操作按钮。

::: demo dialog/custom-header
:::

## 弹窗渲染表格并获取勾选行

在 `FlDialog` 内容区直接渲染 `ElTable`，通过 `selection-change` 维护勾选行，
并在 `@confirm` 中读取当前勾选结果。

::: demo dialog/table-selection
:::

## 调用式弹窗（useDialog）

`useDialog` 提供与组件实例解耦的调用式弹窗能力，适合表单检索、多结果确认等场景。

::: demo dialog/use-dialog
:::

## useDialog 渲染表格并返回勾选行

通过 `message` 直接渲染 `ElTable`，并通过 `payloadMethod` 指定要调用的方法名
（例如 `getSelectionRows`），
可在 `then(({ data }) => ...)` 中拿到确认后的选中行数据。

::: demo dialog/use-dialog-table-selection
:::

### useDialog API

`useDialog` 从 `@falcon-ui/hooks` 导入，返回 `open` 与 `closeAll`：

| API                       | 说明                                                                                             |
| ------------------------- | ------------------------------------------------------------------------------------------------ |
| `open<TPayload>(options)` | 打开弹窗，`confirm` 时 `resolve({ action: 'confirm', data })`，其他关闭动作 `reject({ action })` |
| `closeAll(reason?)`       | 关闭当前实例（无实例时无副作用）                                                                 |

推荐链式写法：

```ts
dialog
  .open<Row[]>({
    title: '选择用户',
    message: renderSelectionTable,
    payloadMethod: 'getSelectionRows'
  })
  .then(({ data }) => {
    // data 是弹窗内部选中行
  })
  .catch(({ action }) => {
    // 取消/关闭动作
  })
```

`open(options)` 关键参数：

| 字段                 | 类型                                      | 默认值          | 说明                                              |
| -------------------- | ----------------------------------------- | --------------- | ------------------------------------------------- |
| `title`              | `string`                                  | `''`            | 弹窗标题                                          |
| `message`            | `string \| VNode \| (() => VNode)`        | `undefined`     | 弹窗内容                                          |
| `appendTo`           | `string \| HTMLElement`                   | `document.body` | 动态挂载容器                                      |
| `showClose`          | `boolean`                                 | `true`          | 是否显示右上角关闭操作                            |
| `closeOnClickModal`  | `boolean`                                 | `true`          | 是否允许点击遮罩关闭                              |
| `closeOnPressEscape` | `boolean`                                 | `true`          | 是否允许 ESC 关闭                                 |
| `beforeClose`        | `(action) => boolean \| Promise<boolean>` | `undefined`     | 关闭前拦截，返回 `false` 阻止关闭                 |
| `dialogProps`        | `Partial<FlDialogProps>`                  | `{}`            | 透传到 `FlDialog` 的非冲突属性                    |
| `payloadResolver`    | `() => TPayload \| Promise<TPayload>`     | `undefined`     | confirm 时读取并返回业务数据到 `then`             |
| `payloadMethod`      | `string`                                  | `undefined`     | confirm 时自动调用 message 组件实例方法并返回结果 |
| `payloadMethodArgs`  | `unknown[]`                               | `[]`            | 调用 `payloadMethod` 时透传参数                   |
| `onAction`           | `(action) => void`                        | `undefined`     | 弹窗完成关闭时回调                                |

兼容迁移说明：

1. 当前版本 `FlInputSearch` 仍保留 `openDialog` 事件路径。
2. 新代码建议优先使用 `useDialog.open` 作为统一调用入口。

## API

### Props

<VpApiTable source="/api-meta/fl-dialog.json" section="props" />

### Events

<VpApiTable source="/api-meta/fl-dialog.json" section="events" />

### Slots

<VpApiTable source="/api-meta/fl-dialog.json" section="slots" />

### Exposes

<VpApiTable source="/api-meta/fl-dialog.json" section="exposes" />
