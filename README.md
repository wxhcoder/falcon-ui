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
