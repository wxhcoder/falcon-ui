# Repository Guidelines

## Project Structure & Module Organization

This repository is currently minimal and contains only root-level docs (`README.md`, `LICENSE`, `.gitignore`). There is no source code or test tree yet. When adding implementation, prefer a conventional layout such as:

- `src/` for application or library code
- `tests/` for automated tests that mirror `src/` paths
- `docs/` for extended documentation or design notes

Keep related modules together and avoid deep nesting unless it reduces duplication.

## Build, Test, and Development Commands

No build or test tooling is committed yet (no `package.json`, `pnpm-workspace.yaml`, or similar). If you add tooling, include scripts for local dev, build, test, and lint, and document them in `README.md`. Example targets to add:

- `npm run dev` (local dev server)
- `npm run build` (production build)
- `npm run test` (unit test suite)
- `npm run lint` (static checks/format)

## Coding Style & Naming Conventions

There are no formatting or lint configs in the repo today. Until tooling is introduced:

- Use 2-space indentation and LF line endings.
- Keep Markdown lines under ~100 characters.
- Use lowercase-kebab-case for folders/files (e.g., `date-picker/`, `button-group.md`).
- If you add UI components, use `PascalCase` filenames and component names.

## Testing Guidelines

No test framework is configured. If you add tests:

- Place them under `tests/` or alongside modules with a clear suffix like `*.test.ts`.
- Ensure the test command is documented and runnable in CI.
- Include at least one test per new module or feature.

## Commit & Pull Request Guidelines

Current history uses short, plain-English messages like `Update README.md`. Keep commits concise, imperative, and focused on one change. For pull requests:

- Describe the change and rationale.
- Link any related issue or task.
- Add screenshots/GIFs for UI changes.
- Call out any breaking changes or migration steps.

## Security & Configuration

Do not commit secrets or environment files. If configuration is required, provide a `.env.example` and document required variables in `README.md`.
