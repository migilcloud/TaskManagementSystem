import { useState } from "react";

const emptyTask = {
  title: "",
  description: "",
  priority: "medium",
  status: "pending",
  category: "General",
  due_date: "",
};

function getInitialTask(initialTask) {
  if (!initialTask) return emptyTask;

  return {
    title: initialTask.title || "",
    description: initialTask.description || "",
    priority: initialTask.priority || "medium",
    status: initialTask.status || "pending",
    category: initialTask.category || "General",
    due_date: initialTask.due_date || "",
  };
}

function normalizeTask(task) {
  return {
    title: task.title.trim(),
    description: task.description.trim(),
    priority: task.priority,
    status: task.status,
    category: task.category.trim() || "General",
    due_date: task.due_date || "",
  };
}

function TaskForm({
  initialTask,
  onCancel,
  onSubmit,
  submitLabel = "Add Task",
}) {
  const [task, setTask] = useState(() => getInitialTask(initialTask));
  const originalTask = getInitialTask(initialTask);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setTask((currentTask) => ({
      ...currentTask,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!task.title.trim()) return;

    onSubmit({
      ...task,
      title: task.title.trim(),
      description: task.description.trim(),
      category: task.category.trim() || "General",
      due_date: task.due_date || null,
    });

    if (!initialTask) {
      setTask(emptyTask);
    }
  };

  const handleCancel = () => {
    const hasUnsavedChanges =
      initialTask &&
      JSON.stringify(normalizeTask(task)) !==
        JSON.stringify(normalizeTask(originalTask));

    if (
      hasUnsavedChanges &&
      !window.confirm("Discard your unsaved changes?")
    ) {
      return;
    }

    onCancel();
  };

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <div className="form-grid">
        <label>
          <span>Title</span>
          <input
            type="text"
            name="title"
            placeholder="Prepare project update"
            value={task.title}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          <span>Category</span>
          <input
            type="text"
            name="category"
            placeholder="Work, Personal, School"
            value={task.category}
            onChange={handleChange}
          />
        </label>

        <label>
          <span>Priority</span>
          <select
            name="priority"
            value={task.priority}
            onChange={handleChange}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </label>

        <label>
          <span>Status</span>
          <select
            name="status"
            value={task.status}
            onChange={handleChange}
          >
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </label>

        <label>
          <span>Due date</span>
          <input
            type="date"
            name="due_date"
            value={task.due_date}
            onChange={handleChange}
          />
        </label>
      </div>

      <label>
        <span>Description</span>
        <textarea
          name="description"
          placeholder="Add useful context, blockers, or next steps"
          value={task.description}
          onChange={handleChange}
        />
      </label>

      <div className="form-actions">
        {onCancel && (
          <button
            className="secondary-btn"
            type="button"
            onClick={handleCancel}
          >
            Cancel
          </button>
        )}

        <button className="add-task-btn" type="submit">
          {submitLabel}
        </button>
      </div>
    </form>
  );
}

export default TaskForm;
