import { FormEvent, useMemo, useState } from "react";
import { apiService } from "../services/apiService";
import { useAppSelector } from "../store/hooks";
import type { MaintenanceRequest, RequestsFetchItem } from "../types/api";
import { AlertModal } from "../ui/AlertModal";
import { FormModal } from "../ui/FormModal";
import { NoResults } from "../ui/NoResults";
import { SuccessBanner } from "../ui/SuccessBanner";

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

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "update">("create");
  const [selectedRequest, setSelectedRequest] = useState<
    MaintenanceRequest | undefined
  >(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [requestToDelete, setRequestToDelete] = useState<RequestsFetchItem | undefined>(
    undefined
  );

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

  const loadRequests = async (
    gid: string,
    f: string,
    t: string,
    s: (typeof STATUS_OPTIONS)[number]
  ) => {
    setLoading(true);
    try {
      const data = await apiService.requests.listByFilters(gid, f, t, s);
      setRequests(data);
      setHasSearched(true);
    } catch (fetchError) {
      setError((fetchError as Error).message || "Failed to fetch requests");
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
    await loadRequests(gardenid, from, to, status);
  };

  const handleCreateRequest = async (payload: MaintenanceRequest) => {
    setIsSubmitting(true);
    setError(null);
    try {
      await apiService.requests.create(payload);
      if (gardenid && from && to) {
        await loadRequests(gardenid, from, to, status);
      }
      setIsModalOpen(false);
      setSuccessMessage("Request created successfully");
    } catch (createError) {
      throw new Error((createError as Error).message || "Failed to create request");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateRequest = async (payload: MaintenanceRequest) => {
    setIsSubmitting(true);
    setError(null);
    try {
      await apiService.requests.update(payload);
      if (gardenid && from && to) {
        await loadRequests(gardenid, from, to, status);
      }
      setIsModalOpen(false);
      setSuccessMessage("Request updated successfully");
    } catch (updateError) {
      throw new Error((updateError as Error).message || "Failed to update request");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteRequest = async () => {
    if (!requestToDelete) return;
    setError(null);
    try {
      if ('delete' in apiService.requests) {
         // @ts-expect-error delete is dynamically added
         await apiService.requests.delete(requestToDelete._id);
      } else {
         throw new Error("Delete operation not supported");
      }

      if (gardenid && from && to) {
        await loadRequests(gardenid, from, to, status);
      }
      setIsAlertOpen(false);
      setSuccessMessage("Request deleted successfully");
    } catch (deleteError) {
      setError((deleteError as Error).message || "Failed to delete request");
      setIsAlertOpen(false);
    }
  };

  const handleToggleStatus = async (request: RequestsFetchItem) => {
    setError(null);
    const newStatus = request.status === "under_review" ? "approved" : "under_review";
    try {
      if ('changeStatus' in apiService.requests) {
        // @ts-expect-error changeStatus is dynamically added
        await apiService.requests.changeStatus([request._id], newStatus);
        if (gardenid && from && to) {
          await loadRequests(gardenid, from, to, status);
        }
        setSuccessMessage(`Request status updated to ${newStatus}`);
      } else {
        throw new Error("Change status operation not supported");
      }
    } catch (toggleError) {
      setError((toggleError as Error).message || "Failed to update request status");
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

      <h1 className="page-title">Requests</h1>
      <div className="panel">
        <div className="panel-header">
          <h2 className="panel-title">Filter Requests</h2>
          <button
            type="button"
            className="primary-button"
            onClick={() => {
              setModalMode("create");
              setSelectedRequest(undefined);
              setIsModalOpen(true);
            }}
          >
            Create Request
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
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((request) => (
                <tr key={request._id}>
                  <td>{request.title}</td>
                  <td>{request.date}</td>
                  <td>
                    <button
                      type="button"
                      className={`badge ${
                        request.status === "approved"
                          ? "badge-pill-green"
                          : "badge-pill-slate"
                      }`}
                      style={{ border: "none", cursor: "pointer", fontSize: "0.8rem" }}
                      title={`Click to change status to ${
                        request.status === "under_review" ? "approved" : "under_review"
                      }`}
                      onClick={() => handleToggleStatus(request)}
                    >
                      {request.status}
                    </button>
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
                  <td>
                    <button
                      type="button"
                      className="icon-action-button"
                      title="Edit request"
                      aria-label={`Edit ${request.title}`}
                      onClick={() => {
                        setModalMode("update");
                        const reconstructedRequest: MaintenanceRequest = {
                          requestid: request._id,
                          date: request.date,
                          gardenid: request.gardenid,
                          title: request.title,
                          model_name: "labourer",
                          ids: [
                            ...(request.labourers || []).map((l) => l._id),
                            ...(request.employees || []).map((e) => e._id)
                          ],
                          points: request.points,
                          status: request.status
                        };
                        setSelectedRequest(reconstructedRequest);
                        setIsModalOpen(true);
                      }}
                    >
                      📝
                    </button>
                    <button
                      type="button"
                      className="icon-action-button"
                      title="Delete request"
                      aria-label={`Delete ${request.title}`}
                      onClick={() => {
                        setRequestToDelete(request);
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
      )}

      <FormModal
        isOpen={isModalOpen}
        isSubmitting={isSubmitting}
        mode={modalMode}
        type="request"
        gardens={gardens}
        request={selectedRequest}
        onClose={() => setIsModalOpen(false)}
        onCreateRequest={handleCreateRequest}
        onUpdateRequest={handleUpdateRequest}
      />

      <AlertModal
        isOpen={isAlertOpen}
        title="Delete Request"
        message={`Are you sure you want to delete request "${requestToDelete?.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDeleteRequest}
        onCancel={() => setIsAlertOpen(false)}
      />
    </div>
  );
};
