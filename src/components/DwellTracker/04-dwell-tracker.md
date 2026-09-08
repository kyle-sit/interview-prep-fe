# Problem 4 — Dwell Tracker

**Format:** 4 tasks · 70 minutes · each task builds on the last
**Modeled on:** the Flexport CodeSignal task reported on Blind — "a React component where
a timer starts when hovering inside a div and stops when the pointer moves out." That
one-line prompt is Task 1 here, verbatim in spirit. **Tasks 2–4 are my extrapolation**,
not a reported problem: they escalate the seed the way the corroborated sets do.
**Scored by:** a headless browser that moves the pointer, advances fake timers, hides the
tab, and asserts on rendered text.

---

## Rules of engagement

- 70-minute timer, unpaused between tasks.
- Read only Task 1 up front. Reveal each next task when you reach it.
- MDN and the React docs only.
- Styling is not scored, but hover targets need enough size to actually point at.
- Named `data-testid`s must match exactly.

Build it at `src/components/DwellTracker/DwellTracker.jsx` and register the route in
[routes.tsx](../../routes/routes.tsx).

---

## Provided

The cards. Paste these in — they are static config, not data, and Tasks 1 and 2 need no
network at all.

```js
const CARDS = [
    { id: 1, label: "Rates" },
    { id: 2, label: "Bookings" },
    { id: 3, label: "Customs" },
    { id: 4, label: "Tracking" },
];
```

For Task 3 onward, a dev-server backend at [mocks/dwellApi.ts](../../../mocks/dwellApi.ts).
Ignore it until then.

| Request                               | Returns                              |
| ------------------------------------- | ------------------------------------ |
| `GET /api/dwell`                      | `{ "1": 0, "2": 0, "3": 0, "4": 0 }` |
| `POST /api/dwell/{cardId}` — `{ ms }` | every card's totals, after the write |
| `?fail=1` on either                   | 500                                  |

Totals persist for the life of the dev server, so a page reload should show the time
accumulated before it.

---

## Task 1 — One hover timer

A single div. The clock runs while the pointer is inside it and stops when the pointer
leaves.

| Element         | `data-testid`  |
| --------------- | -------------- |
| Hover target    | `hover-target` |
| Elapsed readout | `elapsed`      |
| Status readout  | `status`       |
| Reset button    | `reset`        |

Acceptance:

- `elapsed` starts at `00:00.0` and renders as `mm:ss.d` — minutes, seconds, tenths.
- The readout advances at least every 100ms while the pointer is inside.
- Leaving freezes the readout. Re-entering **resumes from where it stopped**, it does not
  restart at zero.
- `status` reads `idle` or `tracking`.
- `reset` zeroes the elapsed time and works whether or not the pointer is inside. If it
  is inside, tracking continues from zero.
- No timer keeps running after the component unmounts.

---

## Task 2 — Many targets

<details>
<summary>Reveal when Task 1 passes</summary>

Render one hover target per entry in `CARDS`, each with its own independent clock.

| Element          | `data-testid`       |
| ---------------- | ------------------- |
| One card         | `card-{id}`         |
| Card elapsed     | `card-elapsed-{id}` |
| Card status      | `card-status-{id}`  |
| Card reset       | `card-reset-{id}`   |
| Total across all | `total-elapsed`     |
| Reset all        | `reset-all`         |

Acceptance:

- Each card accumulates only its own dwell time.
- At most one card is `tracking` at a time. Moving the pointer directly from one card to
  another stops the first and starts the second, with no double-counted overlap.
- Sweeping the pointer across all four cards quickly must not leave a card stuck in
  `tracking` after the pointer has left it.
- `total-elapsed` always equals the sum of every card's elapsed time, to the tenth.
- `card-reset-{id}` zeroes one card. `reset-all` zeroes every card.

</details>

---

## Task 3 — Persist it

<details>
<summary>Reveal when Task 2 passes</summary>

Dwell time now survives a reload. Load from `GET /api/dwell` on mount; write back with
`POST /api/dwell/{cardId}` carrying `{ ms }`.

| Element       | `data-testid` |
| ------------- | ------------- |
| Loading state | `loading`     |
| Error state   | `error`       |
| Retry button  | `retry`       |
| Sync status   | `sync-status` |

Acceptance:

- On mount, `loading` is present until the request settles; cards start at their saved
  totals, not at zero. On failure, render `error` and a working `retry`.
- A card's total is written **when the pointer leaves it**, not on every tick.
- `sync-status` reads `idle`, `saving`, or `saved`.
- The value written is the card's total at the moment the pointer left. If the pointer
  re-enters and leaves again before the first write resolves, the second write must not
  save a smaller number than the first — no out-of-order clobbering.
- A rejected save (append `?fail=1` to the POST) renders `error` and leaves the
  on-screen total intact. It is not rolled back.
- Leaving a card and immediately unmounting still flushes that card's time.

</details>

---

## Task 4 — Only count real attention

<details>
<summary>Reveal when Task 3 passes — budget half your remaining time</summary>

Hovering with the tab in the background is not attention. The clock must stop for it.

| Element       | `data-testid`   |
| ------------- | --------------- |
| Paused marker | `paused`        |
| Session log   | `session-log`   |
| One log row   | `log-entry-{n}` |
| Most-dwelled  | `top-card`      |

Acceptance:

- When the tab is hidden (`document.visibilitychange`) or the window loses focus, every
  clock stops and `paused` renders. Time spent hidden is never counted.
- On return, if the pointer is still inside a card, that card resumes automatically.
- Every completed dwell — pointer enters then leaves, or a pause interrupts one — appends
  one row to `session-log`, oldest first, showing the card label and that stretch's
  duration in `mm:ss.d`.
- A dwell split by a pause produces **two** rows, not one, and their durations sum to the
  uninterrupted time.
- `top-card` shows the label of the card with the highest total. Ties break by lowest id.
  It updates live, not only on pointer-leave.
- The Task 2 invariant still holds: `total-elapsed` equals the sum of the cards, and now
  also equals the sum of every row in `session-log`.

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

Run `/interview-review DwellTracker` after the timer stops, then ask yourself:

- How many intervals are running with four cards on screen? Should it be four, or one?
- Is your elapsed time stored, or computed from timestamps? What happens to a stored
  counter if a tick is late by 40ms, sixty times?
- Does your pointer-leave handler close over a stale total?
- Task 4 added a second reason to stop the clock. How many places did you have to edit?

<details>
<summary>The trap (read only after your attempt)</summary>

**Task 1 asks you to build a timer. The set is testing whether you built a state machine.**

The reflex answer to the Flexport prompt is a counter: `setInterval` on mouse-enter,
`setElapsed((e) => e + 100)` on each tick, `clearInterval` on mouse-leave. It demos
perfectly and it is wrong in two ways that stay invisible until later tasks.

First, **intervals drift**. `setInterval(fn, 100)` does not fire every 100ms; it fires
late, and the lateness accumulates silently. By Task 2 your `total-elapsed` no longer
equals the sum of the cards, and you will lose real minutes hunting a rounding bug that is
actually a design bug. The shape that holds: store `startedAt` (a timestamp) and
`accumulated` (ms banked from previous stretches). Elapsed is
`accumulated + (now - startedAt)`, computed at render. The interval exists only to force a
re-render — it is a heartbeat, never the source of truth. Delete it and the numbers stay
correct, just frozen.

Second, and this is what Task 4 is built to punish: in the reflex version, **the
start/stop math lives inside the mouse handlers**. That is fine while hovering is the only
reason a clock runs. Task 4 adds a second, orthogonal reason — the tab has to be visible —
and now "is this card running?" is `hovered && visible`, a two-input condition that your
handlers cannot express. If you glued the math to `onMouseEnter`/`onMouseLeave`, you
rewrite the component. If you wrote two `start(id)` / `stop(id)` transitions that bank
elapsed time into `accumulated`, then `visibilitychange` just calls the same `stop`, and
Task 4 is roughly fifteen lines.

That is the whole set: a timer is a derived value over a state machine with one clock, not
a number you increment. Same lesson as [03](../TicketQueue/03-ticket-queue.md) — one source of truth,
everything else derived — reached from the opposite direction.

The Task 3 out-of-order-write requirement is the small trap. Two saves in flight can
resolve in either order, so guard with a per-card sequence number or a ref holding the
latest value, and flush from a cleanup that reads a ref rather than a captured closure.

</details>
