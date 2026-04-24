import { useState, useMemo } from "react";
import { Button, Card, Checkbox, Input, Chip, Spinner } from "@heroui/react";
import {
  useChunk,
  useChunkValue,
  useAsyncChunk,
  useMutation,
} from "stunk/react";
import {
  filterChunk,
  totalCount,
  completedCount,
  tasksChunk,
  addTaskMutation,
  deleteTaskMutation,
  toggleTaskMutation,
  completeAll,
} from "./store/tasks-store";

export default function App() {
  const [input, setInput] = useState("");
  const [filter, setFilter] = useChunk(filterChunk);
  const { data, loading, error, reload } = useAsyncChunk(tasksChunk);
  const total = useChunkValue(totalCount);
  const completed = useChunkValue(completedCount);

  const { mutate: addTask, loading: adding } = useMutation(addTaskMutation);
  const { mutate: deleteTask, loading: deleting } =
    useMutation(deleteTaskMutation);
  const { mutate: toggleTask, loading: toggling } =
    useMutation(toggleTaskMutation);

  const mutating = deleting || toggling;

  const tasks = useMemo(() => {
    if (!data) return [];
    if (filter === "active") return data.filter((t) => !t.completed);
    if (filter === "done") return data.filter((t) => t.completed);
    return data;
  }, [data, filter]);

  async function handleAdd() {
    const title = input.trim();
    if (!title) return;
    setInput("");
    await addTask(title);
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">Failed to load tasks.</p>
          <Button variant="primary" onPress={reload}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">taskr</h1>
          <p className="text-gray-500 text-sm mt-1">
            Powered by Stunk — atomic state management
          </p>
        </div>

        {/* Stats */}
        <div className="flex gap-3 mb-6">
          <Chip variant="secondary">{total} tasks</Chip>
          <Chip variant="soft" color="success">
            {completed} completed
          </Chip>
        </div>

        {/* Add Task */}
        <Card className="mb-6 p-4">
          <div className="flex gap-3">
            <Input
              placeholder="Add a new task..."
              aria-label="New task"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              className="flex-1"
            />
            <Button variant="primary" onPress={handleAdd} isDisabled={adding}>
              {adding ? <Spinner size="sm" color="current" /> : "Add"}
            </Button>
          </div>
        </Card>

        {/* Filters */}
        <div className="flex gap-2 mb-4">
          {(["all", "active", "done"] as const).map((f) => (
            <Button
              key={f}
              size="sm"
              variant={filter === f ? "primary" : "ghost"}
              onPress={() => setFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Button>
          ))}
        </div>

        {/* Task List */}
        <div
          className={`flex flex-col gap-3 mb-6 transition-opacity duration-200 ${mutating ? "opacity-50 pointer-events-none" : ""}`}
        >
          {loading ? (
            <div className="flex justify-center py-8">
              <Spinner />
            </div>
          ) : tasks.length === 0 ? (
            <p className="text-center text-gray-400 py-8">No tasks here.</p>
          ) : (
            tasks.map((task) => (
              <Card key={task.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      isSelected={task.completed}
                      onChange={() => toggleTask(task.id)}
                    />
                    <span
                      className={
                        task.completed
                          ? "line-through text-gray-400"
                          : "text-gray-800"
                      }
                    >
                      {task.title}
                    </span>
                  </div>
                  <Button
                    size="sm"
                    variant="danger-soft"
                    onPress={() => deleteTask(task.id)}
                  >
                    Delete
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Complete All */}
        <Button variant="outline" className="w-full" onPress={completeAll}>
          Complete All
        </Button>
      </div>
    </div>
  );
}
