# FlDialog

A second-layer wrapper around Element Plus `ElDialog` with default drag, destroy-on-close,
centered display and Bounce transition enhancements.

## Basic Usage

::: demo dialog/basic
:::

## Custom Header Slot

Use the `header` slot to customize header content while keeping the built-in fullscreen and
close action buttons.

::: demo dialog/custom-header
:::

## Render a Table in a Dialog and Read Checked Rows

Render `ElTable` directly inside the `FlDialog` body, maintain checked rows through
`selection-change`, and read the current result in `@confirm`.

::: demo dialog/table-selection
:::

## Imperative Dialogs with useDialog

`useDialog` provides an imperative dialog API decoupled from component instances. It is useful
for form searches, multi-result confirmation and similar workflows.

::: demo dialog/use-dialog
:::

## Render a Table with useDialog and Return Checked Rows

Render `ElTable` through `message`, specify the method to call through `payloadMethod`
(for example `getSelectionRows`), and read the confirmed rows in `then(({ data }) => ...)`.

::: demo dialog/use-dialog-table-selection
:::

### useDialog API

Import `useDialog` from `@falcon-ui/hooks`. It returns `open` and `closeAll`:

| API                       | Description                                                                                                                           |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `open<TPayload>(options)` | Opens a dialog. `confirm` resolves with `resolve({ action: 'confirm', data })`; other close actions reject with `reject({ action })`. |
| `closeAll(reason?)`       | Closes the current instance and does nothing when no instance exists.                                                                 |

Recommended chained usage:

```ts
dialog
  .open<Row[]>({
    title: 'Select users',
    message: renderSelectionTable,
    payloadMethod: 'getSelectionRows'
  })
  .then(({ data }) => {
    // data is the selected rows inside the dialog
  })
  .catch(({ action }) => {
    // cancel or close action
  })
```

Key `open(options)` parameters:

| Field                | Type                                      | Default         | Description                                                  |
| -------------------- | ----------------------------------------- | --------------- | ------------------------------------------------------------ |
| `title`              | `string`                                  | `''`            | Dialog title.                                                |
| `message`            | `string \| VNode \| (() => VNode)`        | `undefined`     | Dialog content.                                              |
| `appendTo`           | `string \| HTMLElement`                   | `document.body` | Dynamic mount container.                                     |
| `showClose`          | `boolean`                                 | `true`          | Whether to show the top-right close action.                  |
| `closeOnClickModal`  | `boolean`                                 | `true`          | Whether clicking the mask can close the dialog.              |
| `closeOnPressEscape` | `boolean`                                 | `true`          | Whether pressing Esc can close the dialog.                   |
| `beforeClose`        | `(action) => boolean \| Promise<boolean>` | `undefined`     | Close interceptor; return `false` to prevent closing.        |
| `dialogProps`        | `Partial<FlDialogProps>`                  | `{}`            | Non-conflicting props passed to `FlDialog`.                  |
| `payloadResolver`    | `() => TPayload \| Promise<TPayload>`     | `undefined`     | Reads and returns business data to `then` on confirm.        |
| `payloadMethod`      | `string`                                  | `undefined`     | Calls a method on the message component instance on confirm. |
| `payloadMethodArgs`  | `unknown[]`                               | `[]`            | Arguments passed to `payloadMethod`.                         |
| `onAction`           | `(action) => void`                        | `undefined`     | Callback after the dialog finishes closing.                  |

Migration notes:

1. The current `FlInputSearch` version still keeps the `openDialog` event path.
2. New code should prefer `useDialog.open` as the unified imperative entry.

## API

### Props

<VpApiTable source="/api-meta/fl-dialog.json" section="props" />

### Events

<VpApiTable source="/api-meta/fl-dialog.json" section="events" />

### Slots

<VpApiTable source="/api-meta/fl-dialog.json" section="slots" />

### Exposes

<VpApiTable source="/api-meta/fl-dialog.json" section="exposes" />
