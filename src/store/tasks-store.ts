import { chunk, batch } from "stunk"
import { asyncChunk, mutation } from "stunk/query"
import { history, persist } from "stunk/middleware"
import { fetchTasks, createTask, removeTask, toggleTask } from "../api/tasks-api"

export type Task = {
  id: string
  title: string
  completed: boolean
}

export type Filter = "all" | "active" | "done"

const _filterChunk = chunk<Filter>("all")
const _persistedFilter = persist(_filterChunk, { key: "taskr-filter" })
export const filterChunk = history(_persistedFilter)

export const tasksChunk = asyncChunk(fetchTasks)

export const totalCount = tasksChunk.derive(
  (state) => state.data?.length ?? 0
)

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
