# falcon-ui

Monorepo project for secondary packaging around Element Plus.

## Code Quality

This repo uses:

- `eslint` for lint checks
- `prettier` for formatting

Supported file types for lint/format:

- `.js`
- `.ts`
- `.tsx`
- `.vue`

Commands:

- `pnpm lint` run lint checks
- `pnpm lint:fix` auto-fix lint issues when available
- `pnpm format` format files in place
- `pnpm format:check` check formatting without writing

## Play Shell

Use the play shell app for local preview:

- `npm run dev` start the play dev server from repository root
- `pnpm play` start the play dev server
- `pnpm play:build` build the play app

Play app structure:

- `play/src/views/home-view.vue`
- `play/src/views/components-view.vue`
- `play/src/views/playground-view.vue`

Current component demos in `Components` page:

- `FButton`
- `FInput`

## Third-Party Usage

Install and import in your app:

```bash
pnpm add @falcon-ui/falcon-ui @falcon-ui/theme
```

Use one of these patterns:

1. Local import (usually no extra global typing config needed)

```ts
import { FInput } from '@falcon-ui/falcon-ui'
```

2. Global install (register all components)

```ts
import { createApp } from 'vue'
import App from './App.vue'
import FalconUI from '@falcon-ui/falcon-ui'
import '@falcon-ui/theme/index.scss'

createApp(App).use(FalconUI).mount('#app')
```

## Type Hints Setup (Important)

If you use global install (`app.use(FalconUI)`), you must add the global
component type entry:

- `@falcon-ui/falcon-ui/global`

Choose one setup method.

### Option A: tsconfig.json

```json
{
  "compilerOptions": {
    "types": ["vite/client", "@falcon-ui/falcon-ui/global"]
  }
}
```

### Option B: src/env.d.ts

```ts
/// <reference types="vite/client" />
/// <reference types="@falcon-ui/falcon-ui/global" />
```

## Type Hints Checklist

- Use Volar (`Vue - Official`) in VSCode.
- After changing types config, run `TypeScript: Restart TS Server`.
- Confirm template completion works on `<FInput>` and `<FButton>`.

## For Library Maintainers

When publishing, ensure these type artifacts and exports exist:

- `dist/index.d.ts`
- `dist/global.d.ts`
- `package.json` contains:
  - `types`
  - `exports["."]`
  - `exports["./global"]`
