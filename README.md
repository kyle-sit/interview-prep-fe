# interview-prep-fe

Front end component interview prep.

A bare React + Vite scaffold for practicing frontend interview problems.

## Commands

```bash
npm run dev        # dev server on http://localhost:5173
npm run typecheck  # run TypeScript (the dev server does NOT type-check)
npm run build      # typecheck + production build into dist/
npm run preview    # serve the production build
```

## TypeScript and JavaScript both work

`.tsx` files are checked in `strict` mode. `.jsx` files compile but are never
type-checked (`allowJs: true`, `checkJs: false` in `tsconfig.app.json`), so you
can drop into plain JS when types would slow you down mid-problem.

`src/components/Example.jsx` demonstrates this and is safe to delete.

Note that `npm run dev` never fails on a type error — Vite strips types with
esbuild without checking them. Run `npm run typecheck` when you want the check.

## Deliberately relaxed

`noUnusedLocals`, `noUnusedParameters`, and `erasableSyntaxOnly` are all off, so
half-written functions and `enum` declarations don't become hard errors while
you're still working the problem.
