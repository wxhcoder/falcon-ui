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

Commit quality gate:

- `pre-commit` runs format, lint, and unit tests
- run `pnpm prepare` once if hooks are not installed yet
- `pnpm precommit:format` format staged files with `lint-staged`
- `pnpm precommit:quality` run `pnpm lint && pnpm test`

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

- `FlButton`
- `FlInput`

## Library Build

Build the distributable package:

- `pnpm build:lib` run full build pipeline (Gulp orchestrated)
- `pnpm build:lib:clean` clean `dist/falcon-ui`
- `pnpm build:lib:js` build `esm/cjs/umd`
- `pnpm build:lib:types` build declaration files
- `pnpm build:lib:style` build theme css

Output structure:

```txt
dist/falcon-ui/
  package.json
  global.d.ts
  esm/
  cjs/
  umd/
  types/
  theme/
    index.css
    index.scss
    src/
```

## Third-Party Usage

Install and import in your app:

```bash
pnpm add falcon-ui
```

Use one of these patterns:

1. Local import (usually no extra global typing config needed)

```ts
import { FlInput } from 'falcon-ui'
```

2. Global install (register all components)

```ts
import { createApp } from 'vue'
import App from './App.vue'
import FalconUI from 'falcon-ui'
import 'falcon-ui/theme/index.css'

createApp(App).use(FalconUI).mount('#app')
```

## Type Hints Setup (Important)

If you use global install (`app.use(FalconUI)`), you must add the global
component type entry:

- `falcon-ui/global`

Choose one setup method.

### Option A: tsconfig.json

```json
{
  "compilerOptions": {
    "types": ["vite/client", "falcon-ui/global"]
  }
}
```

### Option B: src/env.d.ts

```ts
/// <reference types="vite/client" />
/// <reference types="falcon-ui/global" />
```

## Type Hints Checklist

- Use Volar (`Vue - Official`) in VSCode.
- After changing types config, run `TypeScript: Restart TS Server`.
- Confirm template completion works on `<FlInput>` and `<FlButton>`.

## For Library Maintainers

When publishing, ensure these type artifacts and exports exist:

- `dist/falcon-ui/types/falcon-ui/index.d.ts`
- `dist/falcon-ui/global.d.ts`
- `package.json` contains:
  - `types`
  - `exports["."]`
  - `exports["./global"]`
  - `exports["./theme/index.css"]`

Style override source files are published under `dist/falcon-ui/theme/src`.

## Play Dist Link Mode

Play uses the built package output and `pnpm link`:

1. `pnpm build:lib`
2. `pnpm link:play:falcon`
3. `pnpm --dir play dev`

Or run one command:

- `pnpm play:dist`
