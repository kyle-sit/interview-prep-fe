# Claude Code tips

Personal notes for working in this repo. Not loaded into context — a reference for me,
not instructions for Claude.

## Project skills

Defined in `.claude/skills/`. Both are read-only — they report, they don't edit.

- **`/interview-review [target]`** — reviews a practice component the way an interviewer
  would: state shape, re-render cost, decomposition, correctness under change, a11y,
  React 19 idioms. Grades findings Blocking / Worth fixing / Nit.
- **`/tech-debt`** — sweeps for doc drift, orphaned components, CSS class collisions,
  convention drift, TODOs, tooling health. Prioritized list, no fixes.

`/interview-review` takes a target in several forms:

```
/interview-review BlogPost                  # by name (case-insensitive, also matches route path/label)
/interview-review src/components/BlogPost/  # by folder
/interview-review BlogInput.jsx Blog…jsx    # specific files
/interview-review src/components/**/*.jsx   # glob
/interview-review                           # most recently changed component
```

It always reads the whole component folder for context but scopes findings to the files
named. Unmatched targets fail loudly rather than falling back to the default.

## Built-in commands worth remembering

- **`/code-review`** — reviews the diff for bugs. Effort levels `low`→`max`; `--fix`
  applies findings; `--comment` posts to a PR. Different from `/interview-review`, which
  is a component-design lens rather than a bug hunt.
- **`/simplify`** — quality-only pass on changed code: reuse, simplification, efficiency.
  Applies fixes. Does _not_ hunt bugs.
- **`/security-review`** — security review of pending changes on the branch.
- **`/hooks`** — UI menu to review, edit, or disable hooks. Also reloads config, which is
  the fix when a hook edit isn't taking effect.
- **`/config`** — simple settings: theme, model, editor mode, verbosity.
- **`/run`** — launches the dev server and drives the app to confirm a change works for
  real.
- **`/loop`** — repeats a prompt or command on an interval. Omit the interval to let
  Claude self-pace. Loop up to 3 days.
- **`/init`** — regenerates CLAUDE.md from the codebase.

`ultracode` in a prompt opts that turn into multi-agent orchestration. Expensive — worth
it for broad audits, not for ordinary edits.

## Subagents

A subagent is a fresh Claude with its own context window. Useful when the work would
otherwise flood the main conversation — sweeping many files to answer one question, or
running several independent jobs at once.

Built-in types:

- **`Explore`** — read-only search across many files. Returns the conclusion, not the
  file dumps. Say how wide to go ("medium", "very thorough").
- **`Plan`** — designs an implementation strategy; returns steps, key files, trade-offs.
- **`general-purpose`** — multi-step research and execution when the target isn't known
  up front.
- **`claude-code-guide`** — questions about Claude Code, the Agent SDK, or the Claude API.
- **`claude`** — catch-all when nothing more specific fits.

How they behave:

- **Background by default.** You get a notification when one finishes. Ask for a
  foreground run only when the very next step depends on the result.
- **Their report isn't shown to you** — Claude summarizes it. If a detail matters, say so
  in the request.
- **Spawn several in one message and they run concurrently.** Sequential requests do not.
- **`SendMessage` continues an existing agent** with its context intact; a fresh spawn
  starts from nothing. `ListAgents` shows who's running.
- **`isolation: "worktree"`** gives each agent its own worktree so parallel edits don't
  collide. Only worth the setup cost when they genuinely write at the same time.

Custom agents live in `.claude/agents/*.md` — frontmatter sets the model, reasoning
effort, and allowed tools. None defined in this repo yet; the two project skills cover
what we'd otherwise want an agent for.

## Agent teams and orchestration

For work too big for one agent, `Workflow` runs a script that fans out across many —
deterministic control flow (loops, conditionals, fan-out) rather than Claude deciding
each step.

- **Opt-in only.** It won't run unless you ask, because it can spawn dozens of agents and
  burn a lot of tokens. Trigger with "use a workflow", or the `ultracode` keyword to make
  it the default for a turn.
- **Common shapes:** parallel readers over subsystems then a synthesis; N independent
  designs scored by judges; find-then-adversarially-verify so weak findings die before
  they reach you; loop-until-dry for unknown-size discovery.
- **Watch progress** with `/workflows`.

## Worktrees

Not a slash command — Claude only creates one when you say so explicitly. "Start a
worktree", "work in a worktree", "create a worktree" all trigger it; asking for a branch
or a bugfix does not. To leave: "exit the worktree", then keep or remove.

```
claude --worktree          # launch a session straight into a fresh worktree
```

Behavior:

- Creates the worktree under `.claude/worktrees/` on a new branch and switches the session
  into it.
- Base ref follows the `worktree.baseRef` setting: `fresh` (default) branches from
  `origin/<default-branch>`; `head` branches from current local HEAD, which is what you
  want to keep unpushed work.
- On exit, `remove` refuses if there are uncommitted files or unmerged commits, unless
  changes are explicitly discarded. `keep` leaves the branch and directory intact.
- If the session ends while still inside one, you get prompted to keep or remove.
- Subagents can each run in their own worktree (`isolation: "worktree"`) so parallel
  agents editing the same files don't collide. Costs setup time and disk per agent — only
  worth it when they genuinely write concurrently.

**Worth configuring here before using one:** a fresh worktree has no `node_modules`, so
`npm run dev` fails until you reinstall. Symlinking avoids that:

```json
{ "worktree": { "symlinkDirectories": ["node_modules"] } }
```

Also add `.claude/worktrees/` to `.gitignore` — otherwise worktree directories show up as
untracked noise in `git status`.

## Hooks in this repo

A `Stop` hook in `.claude/settings.local.json` plays a chime when Claude finishes a turn:

```
ffmpeg … -i /System/Library/Sounds/Hero.aiff -af "volume=8" -f audiotoolbox -audio_device_index 4 -
```

Things learned setting it up, worth not rediscovering:

- **Audio must be routed explicitly.** The default output is a Bluetooth soundbar whose
  link sleeps when idle, so the first `afplay` is consumed waking it and any chime under
  ~2s vanishes entirely. `-audio_device_index 4` targets the MacBook speakers, which never
  sleep — no primer needed.
- **That index is positional** across all audio devices, including two DisplayLink USB
  ones that only `system_profiler` reports. Undocking can shift it. If the chime starts
  coming from the wrong place, that's why. Name-based alternative:
  `SwitchAudioSource -s "MacBook Pro Speakers" -t output`.
- **Exit codes lie.** `afplay`, `say`, and `osascript beep` all return 0 while producing
  no sound. Timing the call is the only reliable check — though note `afplay` carries ~2s
  of fixed overhead here, so duration alone doesn't prove playback either.
- `display notification` is silently dropped on this machine even with Script Editor
  notifications enabled. `display dialog` works but is modal and steals focus.

Change the sound by swapping the filename (anything in `/System/Library/Sounds/`). Past
~4×, `volume=` clips rather than getting louder — use a hotter file like `Sosumi` or
`Basso` instead of a bigger number.

## Settings scope

| File                          | Scope                  | Git        |
| ----------------------------- | ---------------------- | ---------- |
| `~/.claude/settings.json`     | All projects           | —          |
| `.claude/settings.json`       | This project, shared   | committed  |
| `.claude/settings.local.json` | This project, personal | gitignored |

Hooks and permissions here live in `settings.local.json`, so they don't follow the repo.

Permission prompts append a one-off `Bash(...)` entry per unique command, which
accumulates fast during debugging. `/fewer-permission-prompts` scans transcripts and
proposes a sensible allowlist; pruning by hand periodically is also fine.
