# FlRadialMenu

A data-driven radial tool menu. It shows a center circle by default; after opening, it lays out
up to six actions on a ring and puts overflow actions into the More dropdown.

Use `size="large"`, `size="medium"` or `size="small"` to set the size. When `size` is not passed
explicitly, the component reads the global `size` from Element Plus `ElConfigProvider`; global
`default` maps to `medium`, and no global size keeps the component at `large`.

## Basic Usage

::: demo radial-menu/basic
:::

## Size

::: demo radial-menu/size
:::

## Shortcut Floating Layer

::: demo radial-menu/floating-shortcut
:::

## More Menu

::: demo radial-menu/more
:::

## Custom Center Circle

::: demo radial-menu/custom-center
:::

## Controlled Mode

::: demo radial-menu/controlled
:::

## Circular Menu Items

::: demo radial-menu/item-type
:::

## Label Slot

::: demo radial-menu/label-slot
:::

## API

### Props

<VpApiTable source="/api-meta/fl-radial-menu.json" section="props" />

### Events

<VpApiTable source="/api-meta/fl-radial-menu.json" section="events" />

### Slots

<VpApiTable source="/api-meta/fl-radial-menu.json" section="slots" />

### Exposes

<VpApiTable source="/api-meta/fl-radial-menu.json" section="exposes" />

### FlRadialMenuItem Props

<VpApiTable source="/api-meta/fl-radial-menu-item.json" section="props" />

### FlRadialMenuItem Slots

<VpApiTable source="/api-meta/fl-radial-menu-item.json" section="slots" />
