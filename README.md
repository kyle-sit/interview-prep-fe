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

## Adding a practice component

Each practice component gets its own route. Build the component, then add one
entry to `src/routes/routes.tsx`:

```tsx
export const practiceRoutes: PracticeRoute[] = [
    { path: "form", label: "Form", Component: Form },
    { path: "modal", label: "Modal", Component: Modal }, // <- new
];
```

That single line wires up the route, the nav link, and the home index. Nothing
else needs to change.

Routing is plain declarative React Router (`<BrowserRouter>` in `src/main.tsx`,
`<Routes>` in `src/App.tsx`, nav shell in `src/pages/Layout.tsx`).

## Where CSS lives

Styles are colocated: a component owns a `.css` file next to it and imports it
itself.

```
src/pages/Layout.tsx         ->  src/pages/Layout.css
src/components/Form/Form.jsx ->  src/components/Form/Form.css
```

`src/index.css` is for global concerns only — the box-sizing reset and
document-level defaults. Nothing component-specific belongs there.

Note these are plain CSS imports, so class names are **global** and share one
namespace. That's fine at this size, but if two components ever both want a
`.card`, rename to `Foo.module.css` and import it as
`import styles from './Foo.module.css'` — Vite supports CSS Modules with no
config, and the class names get scoped automatically.

## TypeScript and JavaScript both work

`.tsx` files are checked in `strict` mode. `.jsx` files compile but are never
type-checked (`allowJs: true`, `checkJs: false` in `tsconfig.app.json`), so you
can drop into plain JS when types would slow you down mid-problem.

`src/components/Form/Form.jsx` is plain JS and is imported by the typed registry
in `src/routes/routes.tsx` — that mix compiles and type-checks fine.

Note that `npm run dev` never fails on a type error — Vite strips types with
esbuild without checking them. Run `npm run typecheck` when you want the check.

## Deliberately relaxed

`noUnusedLocals`, `noUnusedParameters`, and `erasableSyntaxOnly` are all off, so
half-written functions and `enum` declarations don't become hard errors while
you're still working the problem.
