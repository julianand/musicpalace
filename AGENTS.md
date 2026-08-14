<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Tech stack

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS v4

## Project conventions

### Navigation
- **Always use `<Link href="...">` from `next/link` for internal app navigation.** Never use a plain `<a href="...">` for internal routes — it triggers a full page reload and bypasses Next.js client-side routing.
- Plain `<a>` is only acceptable for external URLs (e.g. `href="https://..."`) or when intentionally forcing a hard navigation.

### File naming
- Use **kebab-case** for all component files (e.g. `related-scroll.tsx`, `product-card.tsx`). Never use PascalCase filenames.
