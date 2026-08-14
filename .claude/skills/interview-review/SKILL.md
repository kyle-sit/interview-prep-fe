---
name: interview-review
description: Review a practice component the way a frontend interviewer would — state shape, re-render cost, decomposition, accessibility, React 19 idioms. Accepts a component name, folder, file paths, or glob as an argument; defaults to the most recently changed component. Use when the user asks to review, critique, or grade a practice component, or asks "how would this land in an interview". Reports findings only; does not edit.
allowed-tools: Read, Grep, Glob, Bash
---

# Interview-lens component review

Review a practice component as an interviewer would: not "is it correct" but "does this
demonstrate the judgment a senior frontend candidate should show, and can the candidate
defend every choice."

**Report only. Do not edit files.** The point is for the user to make the fix themselves.

## Scope

The invocation argument sets the target. Accept any of these forms:

| Argument | Resolves to |
| --- | --- |
| `BlogPost`, `blog post`, `blogposts` | The matching folder under `src/components/`. Match case-insensitively against folder names, then against the `path`/`label` fields in `src/routes/routes.tsx`. |
| `src/components/BlogPost/` | That folder. |
| `src/components/BlogPost/BlogInput.jsx BlogDisplay.jsx` | Just those files — space- or comma-separated, absolute or repo-relative. |
| `src/components/**/*.jsx` | Every file the glob matches. |
| *(nothing)* | The most recently changed component: `git status --porcelain` first, then `git log -1 --name-only`, then newest mtime under `src/components/`. |

If an argument matches nothing, say what you looked for, list the component folders that
exist, and stop — do not silently fall back to the default target.

If it matches more than one component, review them all and report each under its own
heading. Above three, ask which the user meant instead of producing a wall of findings.

**Always read the whole component folder for context**, even when the argument names
specific files — container, children, and CSS. A finding about decomposition or state
placement is not reviewable from one file. But scope the *findings* to the files that
were asked for: when the user passes `BlogInput.jsx`, a problem in `BlogDisplay.jsx` gets
one line at the end under "outside the requested scope", not a full finding.

## What to review

Work through these in order. Skip a dimension only if it genuinely doesn't apply, and say
you skipped it.

**1. State shape**
- Is each piece of state necessary, or is it derivable from other state/props?
- Is anything that should be two values collapsed into one (draft vs. committed,
  selection vs. display)? See `MedicalRecords.jsx` for the intended pattern.
- Is state at the right level, or lifted higher/pushed lower than it needs to be?
- `useState` vs `useReducer`: multi-field forms with cross-field validation want a
  reducer (`Form.jsx`); independent values don't.

**2. Re-render cost**
- What re-renders on each keystroke / each click, and does it need to?
- Controlled vs. uncontrolled inputs: uncontrolled + `<form action={fn}>` avoids
  per-keystroke renders (`BlogPost.jsx`). Controlled is only justified when you need
  per-keystroke validation or derived UI.
- Is `useMemo`/`useCallback` present where it does nothing? Absent where the work is
  real (sorting, mapping, filtering a list that could be large)? Both are findings.
- Would memoizing a child actually help, or is the prop identity unstable anyway?

**3. Decomposition**
- Container owns state, children are presentational — is that split clean?
- Is a child reaching for something it shouldn't know about?
- Is anything one component that should obviously be two (or vice versa)?

**4. Correctness under change**
- Does it break if the data is empty, has one item, or has thousands?
- Does it assume IDs are contiguous, 1-based, or ordered? Position-based navigation
  survives non-contiguous IDs; ID arithmetic doesn't.
- Are list `key`s stable and unique, or index-based on a reorderable list?
- Is state mutated in place anywhere (`.sort()` on a prop array without copying)?

**5. Accessibility**
- Labels bound to inputs (`htmlFor` matching `id`, not just `name`).
- Interactive elements are real buttons/links, not clickable `div`s.
- Focus handling on anything that opens, closes, or replaces content.
- Errors and status announced, not just colored.

**6. React 19 idioms**
- `<form action={fn}>` and `useActionState` where a form would otherwise need manual
  `preventDefault` + submit state.
- `crypto.randomUUID()` for keys on created items, not array index.
- No leftover patterns React 19 made unnecessary (`forwardRef` for a plain `ref` prop).

**7. Repo conventions**
- New practice components are `.jsx` (unchecked by design), colocated `Foo.css`, one
  entry in `src/routes/routes.tsx` with `element:` (not `Component:`).
- Global CSS class names share one namespace — flag a class name likely to collide.
- Non-obvious choices carry a comment explaining *why*; that's the house style and it's
  what a candidate would be asked to say out loud.

## Output

Findings only — no summary of what the component does, the user wrote it.

Order by what would cost the most in an interview. For each:

- **File and line** as a clickable reference.
- **The finding** in one sentence.
- **Why it matters** — the concrete failure or the question an interviewer would ask.
- **The fix** in a sentence or a few lines of code. Not a full rewrite.

Mark each as **Blocking** (wrong, or would sink the interview), **Worth fixing**
(defensible but a weaker answer), or **Nit**.

End with one line: the single strongest thing about the component, and the one question
an interviewer would most likely press on. If you found nothing blocking, say so plainly
rather than inventing filler.