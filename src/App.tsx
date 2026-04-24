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
  const allCompleted = total > 0 && completed === total;

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

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") handleAdd();
    if (e.key === "Escape") setInput("");
  }

  const emptyMessages: Record<string, string> = {
    all: "No tasks yet. Add one above.",
    active: "No active tasks. You're all caught up!",
    done: "No completed tasks yet. Get to work!",
  };

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
              onKeyDown={handleKeyDown}
              className="flex-1"
            />
            <Button
              variant="primary"
              onPress={handleAdd}
              isDisabled={adding || !input.trim()}
            >
              {adding ? <Spinner size="sm" color="current" /> : "Add"}
            </Button>
          </div>
        </Card>

        {/* Filters + Undo/Redo */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-2">
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
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="ghost"
              isDisabled={!filterChunk.canUndo?.()}
              onPress={() => filterChunk.undo()}
            >
              Undo
            </Button>
            <Button
              size="sm"
              variant="ghost"
              isDisabled={!filterChunk.canRedo?.()}
              onPress={() => filterChunk.redo()}
            >
              Redo
            </Button>
          </div>
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
            <p className="text-center text-gray-400 py-8">
              {emptyMessages[filter]}
            </p>
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
        <Button
          variant="outline"
          className="w-full"
          isDisabled={allCompleted || total === 0}
          onPress={completeAll}
        >
          {allCompleted ? "All done!" : "Complete All"}
        </Button>
      </div>
    </div>
  );
}
