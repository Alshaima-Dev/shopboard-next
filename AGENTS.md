<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## ShopBoard Project Rules

1. Never modify the original `shopboard-react` project. Treat it as read-only.
2. Preserve existing ShopBoard functionality, design, assets, and EN/AR/TR localization during migration.
3. Follow Next.js App Router conventions and consult the installed Next.js documentation before implementation.
4. Use strict TypeScript. Avoid `any`, unsafe type assertions, and error suppression.
5. Use kebab-case for filenames, PascalCase for React components and types, and camelCase for functions and variables.
6. Keep route files minimal and separate business logic, API access, state, and UI.
7. Prefer Server Components. Use `"use client"` only where interaction, browser APIs, or client-side state require it.
8. Use Tailwind CSS v4, centralized design tokens, and reusable UI components.
9. Avoid duplicated styles, unnecessary abstractions, dependencies, and files.
10. Preserve accessibility, responsive behavior, and RTL support.
11. Work on one task at a time and validate changes with TypeScript, lint, and build checks.
12. Do not commit, push, or modify Git remotes without explicit approval.

## Bug Documentation

- Maintain `BUGS.md` in the project root throughout development. Preserve all existing entries.
- Whenever an actual bug or error is discovered, record it, including bugs successfully fixed during the task. Do not omit fixed bugs.
- Number entries sequentially as `## Bug 1`, `## Bug 2`, and so on, continuing from the highest existing number. Do not renumber existing entries.
- Use clear, concise English and the exact entry structure below. Choose the applicable Type value: `runtime`, `logic`, or `state`.
- Describe the observed behavior and how it was detected, including the console, breakpoint, Application tab, test, or other evidence used.
- Explain the confirmed cause and include accurate file paths and line numbers when available. Do not guess locations or causes; state when a cause is not yet known.
- Explain the resolution in the Fix field. If unresolved, explicitly write `Unresolved` and explain the current status.
- In the AI field, explicitly state whether Codex assisted and what it assisted with, such as detection, diagnosis, implementation, or validation.
- Document only confirmed bugs or errors. Do not invent bugs, record hypothetical issues as confirmed bugs, or classify expected framework behavior as a bug.
- Standard project logs `AGENTS.md` and `BUGS.md` retain their required uppercase filenames.

Use this exact structure for each entry, replacing the number sequentially:

```markdown
## Bug 1

- **What I saw:**
- **Type:** runtime / logic / state
- **How I found it:** (Console error, breakpoint, Application tab...)
- **Cause:** (the file and line, and why it was wrong)
- **Fix:**
- **Did I use AI? For what?**
```
