import { useCallback, useEffect, useMemo, useState } from "react";
import { apiService } from "../services/apiService";
import { useAppSelector } from "../store/hooks";
import type {
  CreateLabourerRequest,
  Labourer,
  UpdateLabourerRequest
} from "../types/api";
import { FormModal } from "../ui/FormModal";
import { SuccessBanner } from "../ui/SuccessBanner";

export const LabourersPage = () => {
  const companies = useAppSelector((state) => state.companies.items);
  const user = useAppSelector((state) => state.auth.user);
  const [labourers, setLabourers] = useState<Labourer[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "update">("create");
  const [selectedLabourer, setSelectedLabourer] = useState<Labourer | undefined>(
    undefined
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [gardenid, setGardenid] = useState("");

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

  const loadLabourers = useCallback(async () => {
    try {
      const data = await apiService.labourer.fetch(gardenid ? { gardenid } : {});
      setLabourers(data);
    } catch (fetchError) {
      setError((fetchError as Error).message || "Failed to fetch labourers");
    }
  }, [gardenid]);

  useEffect(() => {
    loadLabourers();
  }, [loadLabourers]);

  const handleCreateLabourer = async (payload: CreateLabourerRequest) => {
    setIsSubmitting(true);
    setError(null);
    try {
      await apiService.labourer.create(payload);
      await loadLabourers();
      setIsModalOpen(false);
      setSuccessMessage("Labourer created successfully");
    } catch (createError) {
      throw new Error((createError as Error).message || "Failed to create labourer");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateLabourer = async (
    payload: UpdateLabourerRequest,
    file?: File | null,
    removeImage?: boolean
  ) => {
    setIsSubmitting(true);
    setError(null);
    try {
      await apiService.labourer.update(payload);
      if (removeImage) {
        await apiService.labourer.removeImage(payload.labourerid);
      }
      if (file) {
        await apiService.labourer.uploadImage(payload.labourerid, file);
      }
      await loadLabourers();
      setIsModalOpen(false);
      setSuccessMessage("Labourer updated successfully");
    } catch (updateError) {
      throw new Error((updateError as Error).message || "Failed to update labourer");
    } finally {
      setIsSubmitting(false);
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

      <h1 className="page-title">Labourers</h1>
      <div className="panel">
        <div className="panel-header">
          <h2 className="panel-title">All labourers</h2>
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <select
              className="field-input"
              value={gardenid}
              onChange={(e) => setGardenid(e.target.value)}
              style={{ width: "200px" }}
            >
              <option value="">All Gardens</option>
              {gardens.map((g) => (
                <option key={g.gardenid} value={g.gardenid}>
                  {g.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="primary-button"
              onClick={() => {
                setModalMode("create");
                setSelectedLabourer(undefined);
                setIsModalOpen(true);
              }}
              style={{ marginTop: 0 }}
            >
              Create Labourer
            </button>
          </div>
        </div>
        {error && <p className="field-error">{error}</p>}
        <table className="table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Type</th>
              <th>Gender</th>
              <th>Marital Status</th>
              <th>Address</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {labourers.map((l) => (
              <tr key={l.labourerid}>
                <td>
                  {l.image ? (
                    <img
                      src={l.image}
                      alt={l.name}
                      style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "50%",
                        objectFit: "cover"
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "50%",
                        background: "#e5e7eb"
                      }}
                    />
                  )}
                </td>
                <td>{l.name}</td>
                <td>{l.type}</td>
                <td>{l.gender}</td>
                <td>{l.married_status === "true" ? "Married" : "Unmarried / Widowed"}</td>
                <td>{l.address_details}</td>
                <td>
                  <button
                    type="button"
                    className="icon-action-button"
                    title="Edit labourer"
                    aria-label={`Edit ${l.name}`}
                    onClick={() => {
                      setModalMode("update");
                      setSelectedLabourer(l);
                      setIsModalOpen(true);
                    }}
                  >
                    📝
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <FormModal
        isOpen={isModalOpen}
        isSubmitting={isSubmitting}
        mode={modalMode}
        type="labourer"
        gardens={gardens}
        labourer={selectedLabourer}
        onClose={() => setIsModalOpen(false)}
        onCreateLabourer={handleCreateLabourer}
        onUpdateLabourer={handleUpdateLabourer}
      />
    </div>
  );
};
