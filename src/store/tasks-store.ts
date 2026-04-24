import { chunk, batch } from "stunk"
import { asyncChunk, mutation } from "stunk/query"
import { fetchTasks, createTask, removeTask, toggleTask } from "../api/tasks-api"

export type Task = {
  id: string
  title: string
  completed: boolean
}

export type Filter = "all" | "active" | "done"

export const filterChunk = chunk<Filter>("all")

export const tasksChunk = asyncChunk(fetchTasks)

export const filteredTasks = tasksChunk.derive((state) => {
  const tasks = state.data ?? []
  const filter = filterChunk.get()
  if (filter === "active") return tasks.filter((t) => !t.completed)
  if (filter === "done") return tasks.filter((t) => t.completed)
  return tasks
})

export const totalCount = tasksChunk.derive((state) => state.data?.length ?? 0)

export const completedCount = tasksChunk.derive(
  (state) => state.data?.filter((t) => t.completed).length ?? 0
)

export const addTaskMutation = mutation(
  async (title: string) => createTask(title),
  { invalidates: [tasksChunk] }
)

export const deleteTaskMutation = mutation(
  async (id: string) => removeTask(id),
  { invalidates: [tasksChunk] }
)

export const toggleTaskMutation = mutation(
  async (id: string) => toggleTask(id),
  { invalidates: [tasksChunk] }
)

export function completeAll() {
  batch(() => {
    tasksChunk.mutate((current) =>
      (current ?? []).map((t) => ({ ...t, completed: true }))
    )
    filterChunk.set("all")
  })
}
