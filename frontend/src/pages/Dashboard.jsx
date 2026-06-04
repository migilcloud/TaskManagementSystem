import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import API from "../api/api";

import TaskForm from "../components/TaskForm";
import TaskCard from "../components/TaskCard";

import "../styles/dashboard.css";

const statusLabels = {
  all: "All",
  pending: "Pending",
  in_progress: "In Progress",
  completed: "Completed",
};

function isOverdue(task) {
  if (!task.due_date || task.status === "completed") return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return new Date(`${task.due_date}T00:00:00`) < today;
}

function Dashboard() {
  const navigate = useNavigate();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [sortBy, setSortBy] = useState("due_date");

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem("token");

    return {
      Authorization: `Bearer ${token}`,
    };
  }, []);

  const handleAuthError = useCallback((error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      navigate("/");
      return;
    }

    setMessage(error.response?.data?.detail || "Something went wrong.");
  }, [navigate]);

  const loadTasks = useCallback(async () => {
    setLoading(true);

    try {
      const response = await API.get("/tasks/", {
        headers: getAuthHeaders(),
      });

      setTasks(response.data.tasks || []);
      setMessage("");
    } catch (error) {
      handleAuthError(error);
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders, handleAuthError]);

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate("/");
      return;
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadTasks();
  }, [loadTasks, navigate]);

  const addTask = async (task) => {
    try {
      await API.post("/tasks/", task, {
        headers: getAuthHeaders(),
      });

      await loadTasks();
      setMessage("Task added.");
    } catch (error) {
      handleAuthError(error);
    }
  };

  const updateTask = async (id, task) => {
    try {
      await API.put(`/tasks/${id}`, task, {
        headers: getAuthHeaders(),
      });

      setEditingTaskId(null);
      await loadTasks();
      setMessage("Task updated.");
    } catch (error) {
      handleAuthError(error);
    }
  };

  const deleteTask = async (id) => {
    const confirmed = window.confirm("Delete this task?");
    if (!confirmed) return;

    try {
      await API.delete(`/tasks/${id}`, {
        headers: getAuthHeaders(),
      });

      await loadTasks();
      setMessage("Task deleted.");
    } catch (error) {
      handleAuthError(error);
    }
  };

  const changeTaskStatus = async (task, status) => {
    await updateTask(task.id, {
      title: task.title,
      description: task.description || "",
      status,
      priority: task.priority || "medium",
      category: task.category || "General",
      due_date: task.due_date || null,
    });
  };

  const filteredTasks = useMemo(() => {
    const query = search.trim().toLowerCase();

    return tasks
      .filter((task) => {
        const matchesSearch =
          !query ||
          task.title?.toLowerCase().includes(query) ||
          task.description?.toLowerCase().includes(query) ||
          task.category?.toLowerCase().includes(query);

        const matchesStatus =
          statusFilter === "all" || task.status === statusFilter;

        const matchesPriority =
          priorityFilter === "all" || task.priority === priorityFilter;

        return matchesSearch && matchesStatus && matchesPriority;
      })
      .sort((firstTask, secondTask) => {
        if (sortBy === "priority") {
          const priorityOrder = { high: 0, medium: 1, low: 2 };

          return (
            (priorityOrder[firstTask.priority] ?? 1) -
            (priorityOrder[secondTask.priority] ?? 1)
          );
        }

        if (sortBy === "status") {
          return (firstTask.status || "").localeCompare(
            secondTask.status || ""
          );
        }

        const firstDate = firstTask.due_date || "9999-12-31";
        const secondDate = secondTask.due_date || "9999-12-31";

        return firstDate.localeCompare(secondDate);
      });
  }, [priorityFilter, search, sortBy, statusFilter, tasks]);

  const stats = useMemo(() => {
    return {
      total: tasks.length,
      pending: tasks.filter((task) => task.status === "pending").length,
      inProgress: tasks.filter((task) => task.status === "in_progress").length,
      completed: tasks.filter((task) => task.status === "completed").length,
      overdue: tasks.filter(isOverdue).length,
    };
  }, [tasks]);

  const logout = () => {
    const confirmed = window.confirm("Are you sure you want to logout?");
    if (!confirmed) return;

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/");
  };

  return (
    <main className="dashboard">
      <header className="dashboard-header">
        <div>
          <p className="eyebrow">Task Management System</p>
          <h1>My Tasks</h1>
        </div>

        <button className="logout-btn" type="button" onClick={logout}>
          Logout
        </button>
      </header>

      <section className="task-stats" aria-label="Task summary">
        <div>
          <span>{stats.total}</span>
          Total
        </div>
        <div>
          <span>{stats.pending}</span>
          Pending
        </div>
        <div>
          <span>{stats.inProgress}</span>
          In Progress
        </div>
        <div>
          <span>{stats.completed}</span>
          Completed
        </div>
        <div className={stats.overdue ? "danger-stat" : ""}>
          <span>{stats.overdue}</span>
          Overdue
        </div>
      </section>

      <section className="panel">
        <h2>Add Task</h2>
        <TaskForm onSubmit={addTask} />
      </section>

      <section className="dashboard-controls" aria-label="Task controls">
        <input
          type="search"
          placeholder="Search title, description, or category"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          aria-label="Filter by status"
        >
          {Object.entries(statusLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>

        <select
          value={priorityFilter}
          onChange={(event) => setPriorityFilter(event.target.value)}
          aria-label="Filter by priority"
        >
          <option value="all">All Priorities</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>

        <select
          value={sortBy}
          onChange={(event) => setSortBy(event.target.value)}
          aria-label="Sort tasks"
        >
          <option value="due_date">Due Date</option>
          <option value="priority">Priority</option>
          <option value="status">Status</option>
        </select>
      </section>

      {message && <p className="dashboard-message">{message}</p>}

      <section className="task-list">
        {loading ? (
          <p className="empty-state">Loading tasks...</p>
        ) : filteredTasks.length === 0 ? (
          <p className="empty-state">No tasks match your current view.</p>
        ) : (
          filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              editing={editingTaskId === task.id}
              onEdit={() => setEditingTaskId(task.id)}
              onCancelEdit={() => setEditingTaskId(null)}
              onDelete={deleteTask}
              onStatusChange={changeTaskStatus}
              onUpdate={updateTask}
            />
          ))
        )}
      </section>
    </main>
  );
}

export default Dashboard;
