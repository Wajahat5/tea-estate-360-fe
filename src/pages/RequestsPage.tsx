import { FormEvent, useMemo, useState } from "react";
import { apiService } from "../services/apiService";
import { useAppSelector } from "../store/hooks";
import type { RequestsFetchItem } from "../types/api";
import { NoResults } from "../ui/NoResults";

const STATUS_OPTIONS = ["under_review", "approved"] as const;

export const RequestsPage = () => {
  const companies = useAppSelector((state) => state.companies.items);
  const user = useAppSelector((state) => state.auth.user);
  const [gardenid, setGardenid] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [status, setStatus] = useState<(typeof STATUS_OPTIONS)[number]>(
    "under_review"
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [requests, setRequests] = useState<RequestsFetchItem[]>([]);

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
      const data = await apiService.requests.listByFilters(
        gardenid,
        from,
        to,
        status
      );
      setRequests(data);
      setHasSearched(true);
    } catch (fetchError) {
      setError((fetchError as Error).message || "Failed to fetch requests");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="page-title">Requests</h1>
      <div className="panel">
        <div className="panel-header">
          <h2 className="panel-title">Filter Requests</h2>
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
          <label className="field-label">
            Status
            <select
              className="field-input"
              value={status}
              onChange={(event) =>
                setStatus(event.target.value as (typeof STATUS_OPTIONS)[number])
              }
            >
              {STATUS_OPTIONS.map((statusOption) => (
                <option key={statusOption} value={statusOption}>
                  {statusOption}
                </option>
              ))}
            </select>
          </label>
          <button className="primary-button" type="submit" disabled={loading}>
            {loading ? "Fetching..." : "Submit"}
          </button>
        </form>
        {error && <p className="field-error">{error}</p>}
      </div>

      {hasSearched && requests.length === 0 && (
        <NoResults message="No requests found for the selected filters." />
      )}

      {requests.length > 0 && (
        <div className="panel request-group-panel">
          <div className="panel-header">
            <h2 className="panel-title">Requests</h2>
          </div>
          <table className="table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Date</th>
                <th>Status</th>
                <th>Points</th>
                <th>Labourers</th>
                <th>Employees</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((request) => (
                <tr key={request._id}>
                  <td>{request.title}</td>
                  <td>{request.date}</td>
                  <td>
                    <span
                      className={
                        request.status === "approved"
                          ? "badge badge-pill-green"
                          : "badge badge-pill-slate"
                      }
                    >
                      {request.status}
                    </span>
                  </td>
                  <td>{request.points.join(", ")}</td>
                  <td>
                    {(request.labourers || [])
                      .map((labourer) => labourer.name)
                      .join(", ") || "-"}
                  </td>
                  <td>
                    {(request.employees || [])
                      .map((employee) => employee.name)
                      .join(", ") || "-"}
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
