# Problem 3 — Ticket Queue

**Format:** 4 tasks · 70 minutes · each task builds on the last
**Modeled on:** the effect-lifecycle half of these screens — the Flexport CodeSignal task
(a timer that starts on mouse-enter and stops on mouse-leave, reported on Blind) and the
HRT assessment described as "build some UI, not complex but time-consuming."
**Scored by:** a headless browser that types into filters, waits on timers, and asserts on
rows.

---

## Rules of engagement

- 70-minute timer, unpaused between tasks.
- Read only Task 1 up front. Reveal each next task when you reach it.
- MDN and the React docs only.
- Styling is not scored.
- Named `data-testid`s must match exactly.

Build it at `src/components/TicketQueue/TicketQueue.jsx` and register the route in
[routes.tsx](../../routes/routes.tsx).

---

## Provided

A dev-server backend at [mocks/ticketApi.ts](../../../mocks/ticketApi.ts). It holds state
across requests and mutates on its own, which is the point. Eight tickets seeded.

| Request                                        | Returns                        |
| ---------------------------------------------- | ------------------------------ |
| `GET /api/tickets`                             | every ticket                   |
| `POST /api/tickets/status` — `{ ids, status }` | every ticket, after the update |
| `?fail=1` on either                            | 500                            |

A ticket is `{ id, title, requester, status, age }`. Statuses are `open`, `pending`,
`closed`. Every `GET /api/tickets` ages open tickets by one minute — that is what makes
the polling in Task 3 visible. Closing more than three tickets in one request is rejected
with a 400.

---

## Task 1 — Render the queue

Load once on mount from `GET /api/tickets`.

| Element       | `data-testid`        |
| ------------- | -------------------- |
| Table body    | `ticket-list`        |
| One row       | `ticket-{id}`        |
| Title cell    | `ticket-title-{id}`  |
| Status badge  | `ticket-status-{id}` |
| Age cell      | `ticket-age-{id}`    |
| Loading state | `loading`            |
| Empty state   | `ticket-list-empty`  |

Acceptance:

- Rows sorted by `age` descending — oldest first.
- `ticket-age-{id}` renders as `"4m"` under an hour, else `"1h 30m"`.
- `loading` present only while the initial request is in flight.
- Zero tickets renders `ticket-list-empty`.

---

## Task 2 — Search and filter

<details>
<summary>Reveal when Task 1 passes</summary>

| Element         | `data-testid`   |
| --------------- | --------------- |
| Search input    | `search-input`  |
| Status dropdown | `status-filter` |
| Result count    | `result-count`  |

Acceptance:

- Search matches `title` **or** `requester`, case-insensitively, on a substring.
- Search is debounced by 300ms. Typing "refund" one character at a time must not filter
  until 300ms after the last keystroke, and the input itself must stay responsive
  throughout.
- `status-filter` has an "All" option plus one per status.
- Search and status filter compose — both apply at once.
- `result-count` shows the number of currently visible rows.
- Filtering to nothing renders `ticket-list-empty`.
- Sort order from Task 1 is preserved within the filtered set.

</details>

---

## Task 3 — Live updates

<details>
<summary>Reveal when Task 2 passes</summary>

Poll `GET /api/tickets` every 5 seconds.

| Element        | `data-testid`  |
| -------------- | -------------- |
| Polling toggle | `poll-toggle`  |
| Last-updated   | `last-updated` |

Acceptance:

- Rows update in place as ages change. `loading` must **not** reappear on poll ticks —
  it is for the initial load only.
- `poll-toggle` starts and stops polling. Toggling off then on does not leave two
  intervals running.
- The active search text and status filter survive every poll. A poll landing mid-typing
  must not clear the input or reset the debounce.
- `last-updated` shows the time of the most recent successful poll.
- A failed poll leaves the last good data on screen — do not blank the table.
- The interval is cleared on unmount.

</details>

---

## Task 4 — Bulk status change

<details>
<summary>Reveal when Task 3 passes — budget half your remaining time</summary>

| Element        | `data-testid`    |
| -------------- | ---------------- |
| Row checkbox   | `select-{id}`    |
| Select-all     | `select-all`     |
| Selected count | `selected-count` |
| Bulk action    | `bulk-status`    |
| Apply button   | `bulk-apply`     |
| Error banner   | `error`          |

Acceptance:

- `select-all` selects and clears **only the currently visible rows**, never rows hidden
  by the filter.
- `select-all` is checked when every visible row is selected, indeterminate when some are,
  unchecked when none are.
- Changing the filter must not silently drop selections on rows that scrolled out of
  view — `selected-count` counts every selected ticket, visible or not.
- `bulk-apply` POSTs `{ ids, status }` to `/api/tickets/status` and reflects the result.
- The bulk-close rejection (more than 3 ids) renders `error` and leaves every row's
  status unchanged.
- Selection is cleared after a successful apply, kept after a failure.
- Polling continues throughout and must not clobber an in-flight bulk update.

</details>

---

## Time budget

| Task  | Minutes | Running |
| ----- | ------- | ------- |
| 1     | 10      | 10      |
| 2     | 15      | 25      |
| 3     | 15      | 40      |
| 4     | 25      | 65      |
| Slack | 5       | 70      |

---

## Self-review

Run `/interview-review TicketQueue` after the timer stops, then ask yourself:

- How many `useState` calls do you have? How many are derived values that shouldn't be
  state at all?
- Does every `useEffect` return a cleanup? Does each one have the right dependencies?
- Does your polling callback see the current filter, or the one from first render?
- What happens if a poll resolves after a bulk update that touched the same rows?

<details>
<summary>The trap (read only after your attempt)</summary>

**Three traps, one per escalation, and they compound.**

_Task 2 — derived state._ The reflex is `const [filtered, setFiltered] = useState([])`
plus an effect that recomputes it. It works, and then Task 3's poll updates `tickets`
while `filtered` holds stale rows, and you are debugging a sync bug instead of writing
Task 4. Filtered rows are a **derivation** of `tickets + query + status`. Compute them
during render. The only thing the debounce owns is a separate `debouncedQuery` state — the
input stays controlled by an undebounced value, or typing lags.

_Task 3 — stale closures._ An interval that refetches `/api/tickets` and calls `setTickets`
inside an effect with `[]` deps captures the first render's scope forever. Add the filter
to the deps and you tear down and recreate the interval on every keystroke, resetting the
5s clock. The fix is that the poll should not need the filter at all — it only replaces
`tickets`, and the filter re-derives itself. That's the same insight as Task 2, and if you
got Task 2 right, Task 3 costs you almost nothing.

_Task 4 — selection identity._ Storing selection as an array of row indices, or as the
selected ticket _objects_, dies the moment a poll returns new object references or the
filter reorders rows. Store `Set<id>`. Then "select all visible" is a set union with the
derived visible ids, indeterminate is a size comparison, and the requirement that hidden
selections survive filtering is free rather than a special case.

The pattern across all three: **one source of truth (`tickets`), everything else derived.**
Every trap here is the same mistake wearing a different hat, which is exactly how these
escalations are built — they are not four problems, they are one decision tested four
times.

</details>
