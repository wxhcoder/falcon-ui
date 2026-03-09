# PR Template for Element Plus Wrapper Changes

Use this output format for wrapper component pull requests.

## Title

`type(scope): short summary`

Example:
`feat(input): standardize ElInput wrapper events and expose behavior`

## 1. Goal

State the single primary objective of this change.

## 2. Scope

### In Scope

List implemented items.

### Out of Scope

List intentionally excluded items.

## 3. Public Surface Impact

1. Props added/changed.
2. Emits added/changed.
3. Type exports added/changed.
4. Entry-point export updates.

## 4. Behavior Notes

1. What remains identical to Element Plus behavior.
2. What wrapper-specific behavior is added.
3. Any compatibility caveats.

## 5. Test Evidence

Include executed commands and outcomes:

1. `pnpm lint`
2. `pnpm test`
3. `pnpm format:check`
4. `pnpm play:build`

## 6. Risks and Rollback

1. Main risk points.
2. Rollback approach if regression appears.
