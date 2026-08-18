# Architecture

Stack and structure for `interview-prep` — a React scratchpad for practicing frontend
component interview problems. No backend, no test runner — data comes from public
placeholder APIs.

## Stack

| Layer | Choice | Version |
| --- | --- | --- |
| UI | React + React DOM | 19.2 |
| Routing | react-router (declarative) | 8.3 |
| Build / dev server | Vite + `@vitejs/plugin-react` | 8.2 |
| Language | TypeScript (shell only) / plain JS (components) | 7.0 |
| Formatting | Prettier | 3.9 |
| Testing | *none* | — |

Runtime dependencies are only `react`, `react-dom`, and `react-router`. Everything else
is a devDependency. No state library, no CSS framework, no component library — the point
is to write these by hand.

## Commands

```bash
npm run dev           # dev server on :5173 — does NOT type-check
npm run typecheck     # tsc -b — the only type check that runs
npm run build         # typecheck + production build into dist/
npm run preview       # serve the production build
npm run format        # prettier --write .
npm run format:check  # prettier --check .
```

There is no lint step and no test command. Prettier is the only automated style
enforcement: 4-space indent, double quotes, semicolons, 90-column width, trailing commas.

## Layout

```
src/
  main.tsx              <BrowserRouter> + React.StrictMode, mounts #root
  App.tsx               <Routes>, maps the registry to <Route> elements
  constants.ts          sample data (articles, medical records, review categories)
  index.css             global only — box-sizing reset, document defaults
  routes/routes.tsx     THE registry — single source of truth
  pages/                Layout (nav shell + <Outlet />), Home (index), NotFound
  components/<Name>/    one folder per practice problem, .jsx + colocated .css
  context/              app-wide providers (theme, products) + their hooks
  services/             HTTP calls — one class per API resource, no React
```

## Services

`src/services/` holds data access and nothing else. A service owns the URL, the HTTP
status check, and the shape of the response envelope, so a caller gets back domain data
and never a `Response`. Nothing in there imports React — which is what makes the fetch
swappable without touching a component.

## The route registry

`src/routes/routes.tsx` is the only wiring point. One entry there simultaneously creates
the route, the nav link in `Layout`, and the row on the `Home` index:

```tsx
{ path: "modal", label: "Modal", element: <Modal /> }
```

The field is `element` — a rendered `ReactElement`, not a component reference. That is
what lets a route pass props, e.g. `<Articles articles={ARTICLES_DATA} />`. Adding a
component requires no change anywhere else.

## TypeScript / JavaScript split

Deliberate and load-bearing:

- `.tsx` (routing shell, pages) — checked in `strict` mode.
- `.jsx` (all practice components) — compile but are **never** type-checked
  (`allowJs: true`, `checkJs: false`). New practice components belong here; this is the
  escape hatch for writing fast under interview time pressure.
- `noUnusedLocals`, `noUnusedParameters`, and `erasableSyntaxOnly` are off on purpose so
  half-written code isn't a hard error mid-problem. `tsc` will not flag unused imports.
- `npm run dev` never fails on a type error — esbuild strips types without checking them.

A typed `.tsx` registry importing untyped `.jsx` components compiles fine.

## Styling

Colocated plain CSS — a component owns `Foo.css` beside it and imports it itself. These
are **global class names in one shared namespace**; there is no CSS Modules setup. If two
components ever need the same class name, rename to `Foo.module.css` and
`import styles from "./Foo.module.css"` (Vite supports it with no config).

`src/index.css` is global-only. Nothing component-specific belongs there.

## Data

All sample data lives in `src/constants.ts` and is either imported directly by a component
or passed in as a prop from the route registry. Components are written as if the data were
fetched — see the comment in `MedicalRecords.jsx` — so the structure would survive a real
API.

## Conventions worth matching

The existing components are the reference for what "done" looks like. They demonstrate the
tradeoffs an interviewer probes, and comments explain *why*, not what:

- Container owns state; children are presentational (`MedicalRecords` → `Search`/`Records`).
- State shape is justified inline — `MedicalRecords` keeps `selectedId` (draft) separate
  from `shownId` (committed) rather than collapsing them into one value.
- Memoization is justified, not reflexive — `useMemo` where it matters at realistic data
  volume, with a comment saying so.
- React 19 idioms: `<form action={fn}>` with uncontrolled inputs to avoid per-keystroke
  rerenders (`BlogPost`); `useReducer` for controlled multi-field forms (`Form`).
- Navigate by position, not ID arithmetic, so non-contiguous IDs don't break it.
