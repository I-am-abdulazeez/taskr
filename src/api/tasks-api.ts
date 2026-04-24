import type { Task } from "../store/tasks-store"

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms))

const _tasks: Task[] = [
  { id: "1", title: "Read Stunk docs", completed: true },
  { id: "2", title: "Build something cool", completed: false },
  { id: "3", title: "Ship it", completed: false },
  { id: "4", title: "Tell the world", completed: false },
]

export async function fetchTasks(): Promise<Task[]> {
  await delay(800)
  return [..._tasks]
}

export async function createTask(title: string): Promise<Task> {
  await delay(400)
  const task: Task = { id: crypto.randomUUID(), title, completed: false }
  _tasks.push(task)
  return task
}

export async function removeTask(id: string): Promise<void> {
  await delay(300)
  const index = _tasks.findIndex((t) => t.id === id)
  if (index !== -1) _tasks.splice(index, 1)
}

export async function toggleTask(id: string): Promise<Task> {
  await delay(300)
  const task = _tasks.find((t) => t.id === id)
  if (!task) throw new Error("Task not found")
  task.completed = !task.completed
  return { ...task }
}
