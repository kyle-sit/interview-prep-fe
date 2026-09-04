# Problem 1 — Task List

**Format:** 4 tasks · 70 minutes · each task builds on the last
**Modeled on:** the Coinbase frontend CodeSignal, the best-corroborated real example
(reported independently on Blind and FrontendLead: static list → add form → API →
inline edit).
**Scored by:** a headless browser that renders your component and drives it. It clicks,
types, and asserts on the DOM. It never reads your source.

---

## Rules of engagement

Practice these or the rep is worthless:

- Set a 70-minute timer. Do not stop it between tasks.
- Read only Task 1 before you start. Reveal each next task when you get to it.
- No AI, no Google. MDN and the React docs only.
- Styling is not scored. Do not write CSS beyond what you need to see what you're doing.
- Every element the spec names a `data-testid` for **must** carry it exactly.

Build it at `src/components/TaskList/TaskList.jsx` and register the route in
[routes.tsx](../../routes/routes.tsx), same as every other component here.

---

## Provided

```js
const SEED_TASKS = [
    { id: 1, title: "Renew domain", done: false },
    { id: 2, title: "Rotate API keys", done: true },
    { id: 3, title: "Write postmortem", done: false },
];
```

---

## Task 1 — Render the list

Render every seed task.

| Element             | `data-testid`      |
| ------------------- | ------------------ |
| List container      | `task-list`        |
| One row             | `task-item-{id}`   |
| Title text          | `task-title-{id}`  |
| Done checkbox       | `task-toggle-{id}` |
| Empty-state message | `task-list-empty`  |

Acceptance:

- `task-list` contains exactly one `task-item-{id}` per task, in seed order.
- `task-toggle-{id}` is checked iff that task's `done` is `true`.
- Toggling a checkbox flips that task's `done` and nothing else's.
- When there are zero tasks, render `task-list-empty` and no `task-list` rows.

---

## Task 2 — Add tasks

<details>
<summary>Reveal when Task 1 passes</summary>

Add a form above the list.

| Element       | `data-testid`     |
| ------------- | ----------------- |
| Text input    | `new-task-input`  |
| Submit button | `new-task-submit` |

Acceptance:

- Submitting appends a new task with `done: false` to the **end** of the list.
- The input clears after a successful submit.
- Whitespace-only input is rejected: no task added, input keeps its value, no crash.
- Submitting via Enter inside the input works, not just the button click.
- New ids must not collide with seed ids.

</details>

---

## Task 3 — Load from an API

<details>
<summary>Reveal when Task 2 passes</summary>

Drop `SEED_TASKS`. Load the list from
`https://jsonplaceholder.typicode.com/todos?_limit=5` on mount. Map the response:
`{ id, title, completed }` → `{ id, title, done }`.

| Element       | `data-testid` |
| ------------- | ------------- |
| Loading state | `loading`     |
| Error state   | `error`       |
| Retry button  | `retry`       |

Acceptance:

- `loading` is present while the request is in flight and gone after it settles.
- On a non-2xx response or a network failure, render `error` and a working `retry`.
- `retry` re-issues the request and clears the previous error.
- Everything from Tasks 1 and 2 still works against the fetched data.
- No state update after unmount.

</details>

---

## Task 4 — Inline edit

<details>
<summary>Reveal when Task 3 passes — budget half your remaining time</summary>

Clicking a task's title turns it into a text input seeded with the current title.

| Element    | `data-testid`          |
| ---------- | ---------------------- |
| Edit input | `task-edit-input-{id}` |

Acceptance:

- Click on `task-title-{id}` replaces it with `task-edit-input-{id}`, focused, with the
  current title as its value.
- Enter commits. Blur commits. Escape reverts to the original title.
- An empty or whitespace-only value is rejected — revert, do not delete the task.
- Only one task can be in edit mode at a time. Opening a second closes the first,
  committing it.
- The done checkbox still toggles while a row is being edited.

</details>

---

## Time budget

| Task  | Minutes | Running |
| ----- | ------- | ------- |
| 1     | 8       | 8       |
| 2     | 12      | 20      |
| 3     | 15      | 35      |
| 4     | 30      | 65      |
| Slack | 5       | 70      |

If Task 1 takes you 20 minutes you have already failed. The first three are meant to be
burst through; Task 4 is where the score is.

---

## Self-review

Run `/interview-review TaskList` after the timer stops, then check these yourself:

- Did Task 4 force you to reshape state you wrote in Task 1? Why?
- Did you re-render every row when one row changed?
- Is the edit input controlled by a draft value, separate from the committed title?
- Would a screen reader user be able to add and edit a task?

<details>
<summary>The trap (read only after your attempt)</summary>

**This problem scores your Task 1 state shape, not your Task 4 code.**

The seductive Task 1 move is to keep tasks in an array and mutate by index, or to track
`done` in a separate `Set` of completed ids because it feels tidy. Both are fine through
Task 2. Task 3 breaks index-based updates the moment ids come from the server, and Task 4
breaks the split representation, because now you have per-row transient state — which row
is editing, and its uncommitted draft — that has to live somewhere and stay in sync with
two arrays.

What survives: one array of task objects, updated immutably and addressed by `id`, plus
exactly two extra pieces of state at the parent — `editingId` and `draft`. That is the
whole answer, and you either write it in the first ten minutes or you pay for it in the
last thirty.

The other half of the score is that you never rewrote anything. CodeSignal's escalation is
a refactorability test wearing a todo app.

</details>
