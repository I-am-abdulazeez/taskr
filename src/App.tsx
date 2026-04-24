import { Button, Card, Checkbox, Input, Chip } from "@heroui/react";

const TASKS = [
  { id: "1", title: "Read Stunk docs", completed: true },
  { id: "2", title: "Build something cool", completed: false },
  { id: "3", title: "Ship it", completed: false },
  { id: "4", title: "Tell the world", completed: false },
];

export default function App() {
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
          <Chip variant="secondary">4 tasks</Chip>
          <Chip variant="soft" color="success">
            1 completed
          </Chip>
        </div>

        {/* Add Task */}
        <Card className="mb-6 p-4">
          <div className="flex gap-3">
            <Input
              placeholder="Add a new task..."
              aria-label="New task"
              className="flex-1"
            />
            <Button variant="primary">Add</Button>
          </div>
        </Card>

        {/* Filters */}
        <div className="flex gap-2 mb-4">
          {["All", "Active", "Done"].map((f) => (
            <Button
              key={f}
              size="sm"
              variant={f === "All" ? "primary" : "ghost"}
            >
              {f}
            </Button>
          ))}
        </div>

        {/* Task List */}
        <div className="flex flex-col gap-3 mb-6">
          {TASKS.map((task) => (
            <Card key={task.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Checkbox isSelected={task.completed} />
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
                <Button size="sm" variant="danger-soft">
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* Complete All */}
        <Button variant="outline" className="w-full">
          Complete All
        </Button>
      </div>
    </div>
  );
}
