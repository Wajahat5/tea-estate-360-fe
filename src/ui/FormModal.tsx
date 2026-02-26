import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import type {
  CreateLabourerRequest,
  Labourer,
  UpdateLabourerRequest
} from "../types/api";

type GardenOption = {
  gardenid: string;
  name: string;
};

type FormModalProps = {
  isOpen: boolean;
  isSubmitting: boolean;
  mode: "create" | "update";
  gardens: GardenOption[];
  labourer?: Labourer;
  onClose: () => void;
  onCreate: (payload: CreateLabourerRequest) => Promise<void>;
  onUpdate: (payload: UpdateLabourerRequest) => Promise<void>;
};

type LabourerFormState = {
  name: string;
  type: "permanent" | "casual" | "temporary";
  gardenid: string;
  married_status: string;
  gender: "male" | "female" | "other";
  address_details: string;
};

const createInitialState: LabourerFormState = {
  name: "",
  type: "permanent",
  gardenid: "",
  married_status: "false",
  gender: "male",
  address_details: ""
};

export const FormModal = ({
  isOpen,
  isSubmitting,
  mode,
  gardens,
  labourer,
  onClose,
  onCreate,
  onUpdate
}: FormModalProps) => {
  const [formData, setFormData] = useState<LabourerFormState>(createInitialState);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setFormData(createInitialState);
      setError(null);
      return;
    }

    if (mode === "update" && labourer) {
      setFormData({
        name: labourer.name || "",
        type: labourer.type || "permanent",
        gardenid: labourer.gardenid || "",
        married_status: labourer.married_status || "false",
        gender: labourer.gender || "male",
        address_details: labourer.address_details || ""
      });
    } else {
      setFormData(createInitialState);
    }
  }, [isOpen, mode, labourer]);

  const initialUpdateSnapshot = useMemo(() => {
    if (mode !== "update" || !labourer) {
      return null;
    }

    return {
      name: labourer.name || "",
      type: labourer.type || "permanent",
      married_status: labourer.married_status || "false",
      gender: labourer.gender || "male",
      address_details: labourer.address_details || ""
    };
  }, [mode, labourer]);

  const canSubmit = useMemo(() => {
    if (mode === "create") {
      return (
        formData.name.trim().length > 0 &&
        formData.gardenid.length > 0 &&
        formData.address_details.trim().length > 0
      );
    }

    if (!initialUpdateSnapshot) {
      return false;
    }

    const hasNameUpdate =
      formData.name.trim() !== initialUpdateSnapshot.name && formData.name.trim().length > 0;
    const hasTypeUpdate = formData.type !== initialUpdateSnapshot.type;
    const hasMarriedStatusUpdate =
      formData.married_status !== initialUpdateSnapshot.married_status;
    const hasGenderUpdate = formData.gender !== initialUpdateSnapshot.gender;
    const hasAddressUpdate =
      formData.address_details.trim() !== initialUpdateSnapshot.address_details &&
      formData.address_details.trim().length > 0;

    return (
      hasNameUpdate ||
      hasTypeUpdate ||
      hasMarriedStatusUpdate ||
      hasGenderUpdate ||
      hasAddressUpdate
    );
  }, [formData, initialUpdateSnapshot, mode]);

  if (!isOpen) {
    return null;
  }

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setFormData((previous) => ({
      ...previous,
      [name]: value
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    try {
      if (mode === "create") {
        await onCreate({
          name: formData.name.trim(),
          type: formData.type,
          gardenid: formData.gardenid,
          married_status: formData.married_status,
          gender: formData.gender,
          address_details: formData.address_details.trim()
        });
        return;
      }

      if (!labourer || !initialUpdateSnapshot) {
        setError("Labourer details are missing.");
        return;
      }
      if (!labourer.labourerid) {
        setError("Labourer id is missing. Please refresh and try again.");
        return;
      }

      const payload: UpdateLabourerRequest = {
        labourerid: labourer.labourerid
      };

      if (
        formData.name.trim() !== initialUpdateSnapshot.name &&
        formData.name.trim().length > 0
      ) {
        payload.name = formData.name.trim();
      }
      if (formData.type !== initialUpdateSnapshot.type) {
        payload.type = formData.type;
      }
      if (formData.married_status !== initialUpdateSnapshot.married_status) {
        payload.married_status = formData.married_status;
      }
      if (formData.gender !== initialUpdateSnapshot.gender) {
        payload.gender = formData.gender;
      }
      if (
        formData.address_details.trim() !== initialUpdateSnapshot.address_details &&
        formData.address_details.trim().length > 0
      ) {
        payload.address_details = formData.address_details.trim();
      }

      await onUpdate(payload);
    } catch (submitError) {
      setError((submitError as Error).message || "Failed to submit labourer form.");
    }
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="Labourer form">
      <div className="modal-card">
        <div className="panel-header">
          <h2 className="panel-title">
            {mode === "create" ? "Create labourer" : "Update labourer"}
          </h2>
          <button type="button" className="link-button" onClick={onClose}>
            Close
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <label className="field-label">
            Name
            <input
              className="field-input"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter labourer name"
            />
          </label>

          <label className="field-label">
            Type
            <select
              className="field-input"
              name="type"
              value={formData.type}
              onChange={handleChange}
            >
              <option value="permanent">Permanent</option>
              <option value="casual">Casual</option>
              {mode === "update" && <option value="temporary">Temporary</option>}
            </select>
          </label>

          {mode === "create" && (
            <label className="field-label">
              Garden
              <select
                className="field-input"
                name="gardenid"
                value={formData.gardenid}
                onChange={handleChange}
              >
                <option value="">Select garden</option>
                {gardens.map((garden) => (
                  <option key={garden.gardenid} value={garden.gardenid}>
                    {garden.name}
                  </option>
                ))}
              </select>
            </label>
          )}

          <label className="field-label">
            Married status
            <select
              className="field-input"
              name="married_status"
              value={formData.married_status}
              onChange={handleChange}
            >
              <option value="true">Married</option>
              <option value="false">Unmarried / Widowed</option>
            </select>
          </label>

          <label className="field-label">
            Gender
            <select
              className="field-input"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </label>

          <label className="field-label">
            Address details
            <textarea
              className="field-input"
              name="address_details"
              value={formData.address_details}
              onChange={handleChange}
              rows={3}
              placeholder="Enter address details"
            />
          </label>

          {error && <p className="field-error">{error}</p>}

          <button
            className="primary-button"
            type="submit"
            disabled={isSubmitting || !canSubmit}
          >
            {isSubmitting
              ? mode === "create"
                ? "Creating..."
                : "Updating..."
              : mode === "create"
                ? "Create labourer"
                : "Update labourer"}
          </button>
        </form>
      </div>
    </div>
  );
};
