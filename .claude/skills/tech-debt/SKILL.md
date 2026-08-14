---
name: tech-debt
description: Sweep the repo for accumulated tech debt — stale docs, dead code, duplicated CSS, drifted conventions, unreferenced components, TODOs — and report a prioritized list. Use when the user asks about tech debt, cleanup, what's rotting, or what needs attention. Reports only; does not fix.
allowed-tools: Read, Grep, Glob, Bash
---

# Tech debt sweep

Find what has drifted, rotted, or been left behind. Report it. **Do not fix anything** —
the user decides what's worth their time, and unasked-for cleanup violates the surgical-
changes rule in CLAUDE.md.

## What to check

**Doc drift** — the highest-value category in this repo, because stale docs actively
mislead.
- `README.md` and `CLAUDE.md` against the actual code. Do documented commands exist in
  `package.json`? Does the documented route-registry shape match `src/routes/routes.tsx`?
  Do referenced file paths still exist?
- Comments that describe code that has since changed.

**Dead and orphaned code**
- Components under `src/components/` with no entry in `src/routes/routes.tsx` and no
  import anywhere — grep each component name across `src/`.
- Exports in `src/constants.ts` nothing imports.
- CSS files with no matching import; CSS classes not referenced in any JSX.
- Unused imports and variables. Note that `noUnusedLocals`/`noUnusedParameters` are off
  on purpose, so `tsc` will not catch these — grep for them.

**CSS namespace risk** — plain CSS imports mean one global namespace. Report any class
name defined in two different `.css` files; that's a live collision, not a hypothetical.

**Convention drift** — measure against what the majority of components actually do, not
against an ideal:
- A practice component in `.tsx` when the rest are `.jsx`, or vice versa.
- Styles landing in `src/index.css` that are component-specific.
- A component not colocating its CSS, or a route entry that doesn't follow the
  `{ path, label, element }` shape.

**Markers and stubs** — `TODO`, `FIXME`, `HACK`, `XXX`, commented-out blocks,
`console.log` left in, empty catch blocks.

**Build and tooling health**
- `npm run typecheck` — report failures as debt.
- `npm run format:check` — report unformatted files as one line item, not one per file.
- `dist/` committed or otherwise tracked when it shouldn't be; check `.gitignore`.
- Dependencies in `package.json` that nothing imports.

## Judgment

This is a small personal practice repo, not a production service. Do not report:
- Missing tests as a blanket item (there is no test runner by design). Missing tests are
  only worth flagging for logic that is genuinely hard to verify by clicking.
- Absence of error boundaries, logging, i18n, or other production concerns nobody asked
  for.
- Style preferences Prettier doesn't enforce.

A finding must be something that will actually cost the user time or mislead them later.
If a category is clean, say so in one line — that's useful information.

## Output

A single prioritized list, worst first. For each item:

- **File reference** (clickable, with line where it's a specific spot).
- **What's wrong**, one sentence.
- **What it costs** — the concrete way this bites later.
- **Effort**: trivial / small / real.

Group only if the list runs long enough that grouping helps. Close with a one-line count
and the two or three items you'd actually do first — not a restatement of the list.