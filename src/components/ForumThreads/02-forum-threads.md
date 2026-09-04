# Problem 2 — Forum Threads

**Format:** 4 tasks · 70 minutes · each task builds on the last
**Modeled on:** the Reddit frontend CodeSignal reported on Glassdoor — "building a small
forum application in React," followed by a discussion of improvements and scaling.
**Scored by:** a headless browser that expands threads, types replies, and asserts on the
resulting DOM tree.

---

## Rules of engagement

- 70-minute timer, unpaused between tasks.
- Read only Task 1 up front. Reveal each next task when you reach it.
- MDN and the React docs only.
- Styling is not scored, but nesting depth must be _visible_ — indent replies.
- Named `data-testid`s must match exactly.

Build it at `src/components/ForumThreads/ForumThreads.jsx` and register the route in
[routes.tsx](../../routes/routes.tsx).

---

## Provided

```js
const SEED_THREADS = [
    {
        id: 1,
        title: "Vite build is slow on CI",
        author: "dana",
        replies: [
            {
                id: 11,
                author: "sam",
                body: "Are you caching node_modules?",
                replies: [{ id: 111, author: "dana", body: "Yes.", replies: [] }],
            },
            { id: 12, author: "kai", body: "Check your sourcemap setting.", replies: [] },
        ],
    },
    { id: 2, title: "Prettier vs ESLint in 2026", author: "kai", replies: [] },
];
```

Reply nesting is arbitrarily deep. Do not assume two levels.

---

## Task 1 — Thread list

| Element        | `data-testid`        |
| -------------- | -------------------- |
| List container | `thread-list`        |
| One thread row | `thread-{id}`        |
| Title          | `thread-title-{id}`  |
| Author         | `thread-author-{id}` |
| Reply count    | `thread-count-{id}`  |

Acceptance:

- One `thread-{id}` per thread, in seed order.
- `thread-count-{id}` shows the **total** number of replies at every depth, not just
  direct children. Thread 1 shows `3`.
- A thread with no replies shows `0`.

---

## Task 2 — Expand and collapse

<details>
<summary>Reveal when Task 1 passes</summary>

Clicking a thread title expands it to show its full reply tree.

| Element         | `data-testid`       |
| --------------- | ------------------- |
| Reply node      | `reply-{id}`        |
| Reply body      | `reply-body-{id}`   |
| Reply author    | `reply-author-{id}` |
| Collapse toggle | `reply-toggle-{id}` |

Acceptance:

- Replies render nested at arbitrary depth, each visually indented by depth.
- Collapsed by default. Clicking `thread-title-{id}` toggles the whole thread.
- `reply-toggle-{id}` collapses that subtree only — the node stays, its descendants hide.
- Multiple threads can be expanded at once; collapsing one does not touch another.
- Collapse state survives re-render.

</details>

---

## Task 3 — Load from an API

<details>
<summary>Reveal when Task 2 passes</summary>

Drop `SEED_THREADS`. On mount, fetch
`https://jsonplaceholder.typicode.com/posts?_limit=4` for threads and
`https://jsonplaceholder.typicode.com/comments?postId={id}` for each thread's replies.

The comments endpoint returns a **flat** list — `{ id, postId, name, email, body }` — with
no parent linkage. Nest them: treat every comment as a direct reply to its thread, except
that any comment whose `body` contains `"@"` followed by another comment's `id` in the
same thread is a reply to that comment.

| Element       | `data-testid` |
| ------------- | ------------- |
| Loading state | `loading`     |
| Error state   | `error`       |
| Retry button  | `retry`       |

Acceptance:

- `loading` is present until every request settles; `error` + working `retry` on failure.
- Reply counts and nesting from Tasks 1 and 2 are correct against the fetched shape.
- A comment referencing an id not in its thread falls back to being a top-level reply.
- No state update after unmount.

</details>

---

## Task 4 — Post a reply

<details>
<summary>Reveal when Task 3 passes — budget half your remaining time</summary>

Every thread and every reply gets a reply box.

| Element        | `data-testid`        |
| -------------- | -------------------- |
| Reply input    | `reply-input-{id}`   |
| Reply submit   | `reply-submit-{id}`  |
| Pending marker | `reply-pending-{id}` |

Acceptance:

- Submitting inserts the new reply as the **last child of that node**, at the correct
  depth, and expands the subtree if collapsed.
- The new reply appears immediately, carrying `reply-pending-{id}`, before the request
  resolves.
- POST to `https://jsonplaceholder.typicode.com/comments`. On success, drop the pending
  marker and swap in the server-assigned id. On failure, remove the reply and surface
  `error`.
- Ancestor reply counts update — replying at depth 3 increments `thread-count-{id}`.
- Whitespace-only replies are rejected.
- Two reply boxes can hold different drafts at the same time.

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

Run `/interview-review ForumThreads` after the timer stops, then ask yourself:

- How many lines did Task 4 change? If it was more than about twenty, why?
- Does your recursive component re-render every node when one leaf changes?
- Where does collapse state live, and does it leak across threads?
- If a thread had 5,000 replies, what breaks first?

<details>
<summary>The trap (read only after your attempt)</summary>

**Recursion is the visible problem. The real one is your data structure.**

Task 1's nested `replies` array invites you to keep the tree as-is and write a recursive
`<Reply>` component. That is correct and it works beautifully through Task 3. Task 4 then
asks you to insert a node at arbitrary depth and update every ancestor's count — and with
a nested tree, immutable insertion means recursively rebuilding the spine on every
keystroke-committed reply, plus a second recursive walk to recompute counts.

The shape that makes Task 4 nearly free is **normalization**: one flat
`{ [id]: { id, parentId, body, author } }` map plus a `childIds` index. Insert is
`O(1)`. Ancestor counts are a `while (parentId)` walk. Rendering still recurses, but from
`childIds`.

You do not need to guess this in Task 1 — the honest senior move is to build the nested
version, notice the pain the moment Task 4 lands, and normalize deliberately in about five
minutes rather than fighting recursive spreads for twenty-five. Recognizing _when_ to
change representation is the thing being scored.

The stated follow-up on the real Reddit screen was "improvements and how it could scale."
That is your cue to name virtualization, memoized subtree components, and pagination of
deep threads — out loud, even if you never write them.

</details>
