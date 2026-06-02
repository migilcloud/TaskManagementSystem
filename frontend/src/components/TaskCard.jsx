import TaskForm from "./TaskForm";

const statusLabels = {
  pending: "Pending",
  in_progress: "In Progress",
  completed: "Completed",
};

function formatDate(dateValue) {
  if (!dateValue) return "No due date";

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${dateValue}T00:00:00`));
}

function isOverdue(task) {
  if (!task.due_date || task.status === "completed") return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return new Date(`${task.due_date}T00:00:00`) < today;
}

function TaskCard({
  task,
  editing,
  onEdit,
  onCancelEdit,
  onDelete,
  onStatusChange,
  onUpdate,
}) {
  if (editing) {
    return (
      <article className="task-card editing">
        <TaskForm
          initialTask={task}
          onCancel={onCancelEdit}
          onSubmit={(updatedTask) => onUpdate(task.id, updatedTask)}
          submitLabel="Save Changes"
        />
      </article>
    );
  }

  const overdue = isOverdue(task);

  return (
    <article className={`task-card ${overdue ? "overdue" : ""}`}>
      <div className="task-card-header">
        <div>
          <h3>{task.title}</h3>
          <div className="task-meta">
            <span className={`status-pill ${task.status}`}>
              {statusLabels[task.status] || "Pending"}
            </span>
            <span className={`priority-pill ${task.priority}`}>
              {task.priority || "medium"} priority
            </span>
            <span>{task.category || "General"}</span>
          </div>
        </div>

        <select
          className="status-select"
          value={task.status || "pending"}
          onChange={(event) => onStatusChange(task, event.target.value)}
          aria-label={`Change status for ${task.title}`}
        >
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {task.description && <p>{task.description}</p>}

      <div className="task-footer">
        <span className={overdue ? "due-date overdue-text" : "due-date"}>
          {overdue ? "Overdue: " : "Due: "}
          {formatDate(task.due_date)}
        </span>

        <div className="task-actions">
          <button className="edit-btn" type="button" onClick={onEdit}>
            Edit
          </button>
          <button
            className="delete-btn"
            type="button"
            onClick={() => onDelete(task.id)}
          >
            Delete
          </button>
        </div>
      </div>
    </article>
  );
}

export default TaskCard;
