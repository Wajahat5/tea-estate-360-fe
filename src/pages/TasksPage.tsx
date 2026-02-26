import { FormEvent, useMemo, useState } from "react";
import { apiService } from "../services/apiService";
import { useAppSelector } from "../store/hooks";
import type { Task } from "../types/api";
import { NoResults } from "../ui/NoResults";

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

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    if (!gardenid || !from || !to) {
      setError("Garden, from date, and to date are required.");
      return;
    }
    setLoading(true);
    try {
      const data = await apiService.tasks.listByFilters(gardenid, from, to);
      setTasks(data);
      setHasSearched(true);
    } catch (fetchError) {
      setError((fetchError as Error).message || "Failed to fetch tasks");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="page-title">To-Dos</h1>
      <div className="panel">
        <div className="panel-header">
          <h2 className="panel-title">Filter Tasks</h2>
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
          <div className="panel-header">
            <h2 className="panel-title">Tasks</h2>
          </div>
          <table className="table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Date</th>
                <th>Points</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => (
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
