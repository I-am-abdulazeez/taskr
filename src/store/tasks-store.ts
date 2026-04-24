import { chunk, computed, batch } from "stunk"

export type Task = {
  id: string
  title: string
  completed: boolean
}

export type Filter = "all" | "active" | "done"

// Chunks
export const tasksChunk = chunk<Task[]>([
  { id: "1", title: "Read Stunk docs", completed: true },
  { id: "2", title: "Build something cool", completed: false },
  { id: "3", title: "Ship it", completed: false },
  { id: "4", title: "Tell the world", completed: false },
])

export const filterChunk = chunk<Filter>("all")

// Derived
export const totalCount = tasksChunk.derive((tasks) => tasks.length)

export const completedCount = tasksChunk.derive(
  (tasks) => tasks.filter((t) => t.completed).length
)

export const filteredTasks = computed(() => {
  const tasks = tasksChunk.get()
  const filter = filterChunk.get()

  if (filter === "active") return tasks.filter((t) => !t.completed)
  if (filter === "done") return tasks.filter((t) => t.completed)
  return tasks
})

// Actions
export function addTask(title: string) {
  const trimmed = title.trim()
  if (!trimmed) return

  tasksChunk.set((prev) => [
    ...prev,
    { id: crypto.randomUUID(), title: trimmed, completed: false },
  ])
}

export function toggleTask(id: string) {
  tasksChunk.set((prev) =>
    prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
  )
}

export function deleteTask(id: string) {
  tasksChunk.set((prev) => prev.filter((t) => t.id !== id))
}

export function completeAll() {
  batch(() => {
    tasksChunk.set((prev) => prev.map((t) => ({ ...t, completed: true })))
    filterChunk.set("all")
  })
}
