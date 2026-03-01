import { FormEvent, useMemo, useState } from "react";
import { apiService } from "../services/apiService";
import { useAppSelector } from "../store/hooks";
import type { CreateTaskRequest, Task, UpdateTaskRequest } from "../types/api";
import { AlertModal } from "../ui/AlertModal";
import { FormModal } from "../ui/FormModal";
import { NoResults } from "../ui/NoResults";
import { SuccessBanner } from "../ui/SuccessBanner";

export const TasksPage = () => {
  const companies = useAppSelector((state) => state.companies.items);
  const user = useAppSelector((state) => state.auth.user);
  const [gardenid, setGardenid] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "update">("create");
  const [selectedTask, setSelectedTask] = useState<Task | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | undefined>(undefined);

  const gardens = useMemo(() => {
    const ownedGardens = companies
      .filter((company) => company.ownerid === user?.userid)
      .flatMap((company) => company.gardens);
    const gardensToUse =
      ownedGardens.length > 0
        ? ownedGardens
        : companies.flatMap((company) => company.gardens);
    const unique = new Map<string, { gardenid: string; name: string }>();
    gardensToUse.forEach((garden) => {
      unique.set(garden.gardenid, {
        gardenid: garden.gardenid,
        name: garden.name
      });
    });
    return Array.from(unique.values());
  }, [companies, user?.userid]);

  const loadTasks = async (gid: string, f: string, t: string) => {
    setLoading(true);
    try {
      const data = await apiService.tasks.listByFilters(gid, f, t);
      setTasks(data);
      setHasSearched(true);
    } catch (fetchError) {
      setError((fetchError as Error).message || "Failed to fetch tasks");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    if (!gardenid || !from || !to) {
      setError("Garden, from date, and to date are required.");
      return;
    }
    await loadTasks(gardenid, from, to);
  };

  const handleCreateTask = async (payload: CreateTaskRequest) => {
    setIsSubmitting(true);
    setError(null);
    try {
      await apiService.tasks.create(payload);
      if (gardenid && from && to) {
        await loadTasks(gardenid, from, to);
      }
      setIsModalOpen(false);
      setSuccessMessage("Task created successfully");
    } catch (createError) {
      throw new Error((createError as Error).message || "Failed to create task");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateTask = async (payload: UpdateTaskRequest) => {
    setIsSubmitting(true);
    setError(null);
    try {
      await apiService.tasks.update(payload);
      if (gardenid && from && to) {
        await loadTasks(gardenid, from, to);
      }
      setIsModalOpen(false);
      setSuccessMessage("Task updated successfully");
    } catch (updateError) {
      throw new Error((updateError as Error).message || "Failed to update task");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTask = async () => {
    if (!taskToDelete) return;
    setError(null);
    try {
      await apiService.tasks.delete(taskToDelete.taskid);

      if (gardenid && from && to) {
        await loadTasks(gardenid, from, to);
      }
      setIsAlertOpen(false);
      setSuccessMessage("Task deleted successfully");
    } catch (deleteError) {
      setError((deleteError as Error).message || "Failed to delete task");
      setIsAlertOpen(false);
    }
  };

  return (
    <div>
      {successMessage && (
        <SuccessBanner
          message={successMessage}
          onClose={() => setSuccessMessage(null)}
        />
      )}

      <h1 className="page-title">To-Dos</h1>
      <div className="panel">
        <div className="panel-header">
          <h2 className="panel-title">Filter Tasks</h2>
          <button
            type="button"
            className="primary-button"
            onClick={() => {
              setModalMode("create");
              setSelectedTask(undefined);
              setIsModalOpen(true);
            }}
          >
            Create Task
          </button>
        </div>
        <form onSubmit={handleSubmit} className="request-filters-form">
          <label className="field-label">
            Garden
            <select
              className="field-input"
              value={gardenid}
              onChange={(event) => setGardenid(event.target.value)}
              required
            >
              <option value="">Select garden</option>
              {gardens.map((garden) => (
                <option key={garden.gardenid} value={garden.gardenid}>
                  {garden.name}
                </option>
              ))}
            </select>
          </label>
          <label className="field-label">
            From
            <input
              className="field-input"
              type="date"
              value={from}
              onChange={(event) => setFrom(event.target.value)}
              required
            />
          </label>
          <label className="field-label">
            To
            <input
              className="field-input"
              type="date"
              value={to}
              onChange={(event) => setTo(event.target.value)}
              required
            />
          </label>
          <button className="primary-button" type="submit" disabled={loading}>
            {loading ? "Fetching..." : "Submit"}
          </button>
        </form>
        {error && <p className="field-error">{error}</p>}
      </div>

      {hasSearched && tasks.length === 0 && (
        <NoResults message="No tasks found for the selected filters." />
      )}

      {tasks.length > 0 && (
        <div className="panel request-group-panel">
          <div className="panel-header" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 className="panel-title">Tasks</h2>
            <input
              type="text"
              className="field-input"
              placeholder="Search by title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ maxWidth: '300px', margin: 0 }}
            />
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Date</th>
                  <th>Points</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {tasks.filter((t) => t.title.toLowerCase().includes(searchQuery.toLowerCase())).map((task) => (
                <tr key={task.taskid}>
                  <td>{task.title}</td>
                  <td>{task.date}</td>
                  <td>{task.points.join(", ")}</td>
                  <td>
                    <span
                      className={
                        task.status === "completed"
                          ? "badge badge-pill-green"
                          : task.status === "under_progress"
                          ? "badge badge-pill-amber"
                          : "badge badge-pill-slate"
                      }
                    >
                      {task.status.replace("_", " ")}
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="icon-action-button"
                      title="Edit task"
                      aria-label={`Edit ${task.title}`}
                      onClick={() => {
                        setModalMode("update");
                        setSelectedTask(task);
                        setIsModalOpen(true);
                      }}
                    >
                      📝
                    </button>
                    <button
                      type="button"
                      className="icon-action-button"
                      title="Delete task"
                      aria-label={`Delete ${task.title}`}
                      onClick={() => {
                        setTaskToDelete(task);
                        setIsAlertOpen(true);
                      }}
                      style={{ marginLeft: "8px" }}
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <FormModal
        isOpen={isModalOpen}
        isSubmitting={isSubmitting}
        mode={modalMode}
        type="task"
        gardens={gardens}
        task={selectedTask}
        onClose={() => setIsModalOpen(false)}
        onCreateTask={handleCreateTask}
        onUpdateTask={handleUpdateTask}
      />

      <AlertModal
        isOpen={isAlertOpen}
        title="Delete Task"
        message={`Are you sure you want to delete task "${taskToDelete?.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDeleteTask}
        onCancel={() => setIsAlertOpen(false)}
      />
    </div>
  );
};
