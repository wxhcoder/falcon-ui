# FlTextShimmer

Text stays in place while a highlight loops from left to right inside the glyphs. It indicates that
work is still in progress; it does not represent completion percentage.

## Basic Usage

::: demo text-shimmer/basic
:::

## Colors

The default inherits the parent text color. Base and highlight colors can be customized separately.

::: demo text-shimmer/color
:::

## Duration and Spread

`duration` controls seconds per pass. `spread` calculates the gradient range from the JavaScript
string length. The examples use long text so the effect is easy to inspect.

::: demo text-shimmer/duration
:::

::: demo text-shimmer/spread
:::

## Static Text and Buttons

The component renders readable static text when disabled or when the operating system requests
reduced motion.

::: demo text-shimmer/disabled
:::

::: demo text-shimmer/button
:::

## Limits

The default slot is for plain text or string interpolation and takes precedence over `text`. HTML is
not parsed, and text inside slotted elements or components is not guaranteed to shimmer. The root is
single-line by default; wrapping and overflow are controlled by the calling layout.

The component does not set `role="status"`, `aria-live`, or `aria-busy`; supply them only when they
match the actual task state.

## API

### Props

<VpApiTable source="/en/api-meta/fl-text-shimmer.json" section="props" />

### Slots

<VpApiTable source="/en/api-meta/fl-text-shimmer.json" section="slots" />
