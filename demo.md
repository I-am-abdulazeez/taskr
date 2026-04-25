# taskr — Stunk Demo Script

> Builder Submit · 1 hour · @dev_azeez

---

## Before You Go On Stage

- [ ] Repo cloned and dependencies installed (`pnpm install`)
- [ ] `pnpm dev` runs clean on `main`
- [ ] All 5 branches exist and are committed
- [ ] Browser open at `localhost:5173`
- [ ] Slides open and ready
- [ ] `localStorage` cleared (DevTools → Application → Clear site data)

---

## Repo Branch Map

| Branch | What's there |
| --- | --- |
| `demo/01-setup` | Static UI shell, no state |
| `demo/02-chunks` | chunk, computed, derive, batch, React hooks |
| `demo/03-async` | asyncChunk, mutation, fake API |
| `demo/04-middleware` | persist + history composed on filterChunk |
| `demo/05-final` | Polish — empty states, disabled states, keyboard UX |
| `main` | Everything merged, fully working |

---

## Timing Guide

| Time | What you're doing |
| --- | --- |
| 0:00 – 0:05 | Slides 1–2 (intro + what is Stunk) |
| 0:05 – 0:10 | Slide 3–4 (the problem + the solution) |
| 0:10 – 0:12 | Slide 5 — "Enough slides. Let's see it work." |
| 0:12 – 0:20 | demo/01-setup — walk the static UI |
| 0:20 – 0:33 | demo/02-chunks — chunk, computed, derive, batch |
| 0:33 – 0:45 | demo/03-async — asyncChunk + mutation |
| 0:45 – 0:53 | demo/04-middleware — persist + history |
| 0:53 – 0:58 | demo/05-final — polish walkthrough |
| 0:58 – 1:00 | Close strong |

---

## Slide Talking Points

### Slide 1 — Title

> "This is Stunk. 4kb, zero dependencies, framework agnostic.
> I built it because state management should not be this hard."

### Slide 2 — What is Stunk?

> "A lightweight, reactive state management library built on atomic principles.
> You break state into independent chunks. You subscribe to exactly what matters.
> No boilerplate, no magic — just pure reactivity."

### Slide 3 — The Problem

> "Right now if you want state management in React you're installing Zustand for global state,
> TanStack Query for async, and some history library for undo/redo.
> That's 3 packages, 3 mental models, 3 things to configure and keep in sync.
> Why?"

### Slide 4 — The Solution

> "Stunk ships all of this in one package.
> chunk for sync state. asyncChunk for async. mutation for side effects.
> persist and history as middleware. All composable, all reactive."

### Slide 5 — Transition

> "Enough slides. Let's see it work."
> — switch to browser —

---

## demo/01-setup — Static UI Shell

```bash
git checkout demo/01-setup
```

> "This is taskr. A simple task manager — but we're going to use it
> to walk through every core concept in Stunk.
> Right now it's completely static. Hardcoded data, no state, nothing moves.
> Let's bring it to life."

**Point out:**

- The layout — header, stats, add input, filters, task list
- HeroUI components — clean, no custom CSS needed
- Nothing is wired yet

---

## demo/02-chunks — Sync State

```bash
git checkout demo/02-chunks
```

> "First thing we need is state. In Stunk, the primitive is called a chunk."

**Open `src/store.ts` in editor. Walk through it top to bottom.**

```ts
// A chunk is just a reactive container
const tasksChunk = chunk<Task[]>([...])
const filterChunk = chunk<Filter>("all")
```

> "A chunk holds any value. You read it, you set it, you subscribe to it.
> That's it. No reducers, no actions, no boilerplate."

```ts
// derive — reactive, read-only, single source
const totalCount = tasksChunk.derive((tasks) => tasks.length)
const completedCount = tasksChunk.derive((tasks) => tasks.filter(t => t.completed).length)
```

> "derive creates a read-only chunk from a single source.
> Whenever tasksChunk changes, these update automatically."

```ts
// computed — tracks multiple chunks
const filteredTasks = computed(() => {
  const tasks = tasksChunk.get()
  const filter = filterChunk.get()
  ...
})
```

> "computed is for when you need to derive from multiple chunks.
> It tracks every chunk that calls .get() during execution — automatically."

```ts
// batch — one notification for multiple updates
export function completeAll() {
  batch(() => {
    tasksChunk.set((prev) => prev.map((t) => ({ ...t, completed: true })))
    filterChunk.set("all")
  })
}
```

> "batch groups multiple updates into a single notification.
> Without it, two set() calls = two re-renders. With it, one."

**Switch to browser. Demo:**

- Add a task → stats update live
- Toggle complete → count updates
- Switch filters → list updates
- Hit Complete All → everything checks off in one update

> "All of this — reactive, automatic, no Provider, no context, no boilerplate."

**Open `src/App.tsx`. Show the hooks.**

```ts
const [filter, setFilter] = useChunk(filterChunk)   // like useState, but global
const tasks = useChunkValue(filteredTasks)            // read-only subscription
const total = useChunkValue(totalCount)
```

> "useChunk gives you the value and a setter — just like useState.
> useChunkValue is for read-only derived chunks.
> The component subscribes automatically and re-renders only when its chunk changes."

---

## demo/03-async — Async State

```bash
git checkout demo/03-async
```

> "Real apps fetch data. Let's wire up a fake API and see how Stunk handles async."

**Open `src/api.ts` briefly.**

> "This is just a fake API — real delays, real data shape. Nothing special here."

**Open `src/store.ts`. Show asyncChunk.**

```ts
export const tasksChunk = asyncChunk(fetchTasks)
```

> "asyncChunk wraps any async function. It gives you data, loading, error,
> and lastFetched out of the box. No manual state juggling."

**Open browser. Refresh the page. Show the spinner, then tasks load.**

> "On mount it fetches automatically. loading is true, spinner shows,
> data arrives, list renders. One line of config."

**Show mutation.**

```ts
export const addTaskMutation = mutation(
  async (title: string) => createTask(title),
  { invalidates: [tasksChunk] }
)
```

> "mutation wraps any async side effect. When it succeeds,
> it automatically reloads tasksChunk — no queryClient, no query keys,
> just pass the chunk directly."

**In browser — add a task. Show the spinner in the button, then list refreshes.**

> "The button spins while the request is in flight.
> When it resolves, tasksChunk reloads and the list updates.
> Delete works the same way — list dims while the request runs."

**Show useAsyncChunk and useMutation in App.tsx.**

```ts
const { data, loading, error, reload } = useAsyncChunk(tasksChunk)
const { mutate: addTask, loading: adding } = useMutation(addTaskMutation)
```

> "useAsyncChunk gives you the full async state reactively.
> useMutation gives you mutate, loading, error, and isSuccess."

---

## demo/04-middleware — Middleware

```bash
git checkout demo/04-middleware
```

> "Last concept — middleware. Stunk ships persist and history out of the box.
> And they compose."

**Open `src/store.ts`. Show the composition.**

```ts
const _filterChunk = chunk<Filter>("all")
const _persistedFilter = persist(_filterChunk, { key: "taskr-filter" })
export const filterChunk = history(_persistedFilter)
```

> "persist wraps the chunk and syncs it to localStorage automatically.
> history wraps that and adds undo/redo.
> Two lines. No plugins, no config files."

**In browser:**

- Switch filter to Active → refresh page → filter is restored
- Switch All → Active → Done → hit Undo → Undo again

> "Filter survives a page refresh. And we get full undo/redo history
> on top of persistence — because they're just composed wrappers."

---

## demo/05-final — Polish

```bash
git checkout demo/05-final
```

> "Last thing — small UX polish. Nothing new to Stunk, just the app feeling complete."

**Point out quickly:**

- Add button disabled when input is empty
- Escape key clears the input
- Undo/Redo disabled when there's no history
- Complete All disabled when everything is done, label changes to "All done!"
- Empty state messages are context-aware per filter

> "This is what the app looks like when it's actually ready to ship."

---

## Closing Line

> "Stunk is in active development — we're approaching stable release.
> If you want atomic state without the overhead,
> check it out at stunk.dev.
> The docs are live, the API is stable, and contributions are welcome.
> Thank you."

---

## Emergency Fallback

If anything breaks on any branch:

```bash
git checkout main
pnpm dev
```

`main` has everything merged and working. Walk through the code from there.

---

## Key Things to Remember

- chunk → reactive container. read with `.get()`, write with `.set()`
- derive → single source, read-only, auto-updates
- computed → multiple sources, read-only, auto-tracks dependencies
- batch → group updates, one notification
- asyncChunk → async fetching, built-in loading/error/data
- mutation → async side effects, auto-invalidates chunks
- persist → localStorage sync, wraps any chunk
- history → undo/redo, wraps any chunk
- All middleware composes — `history(persist(chunk))`
