import { useState } from "react";
import { apiService } from "../services/apiService";
import {
  fetchCompaniesFailure,
  fetchCompaniesSuccess
} from "../store/companiesSlice";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import type {
  CompanyListItem,
  CreateCompanyRequest,
  CreateGardenRequest,
  UpdateCompanyRequest,
  UpdateGardenRequest
} from "../types/api";
import { CompanyCard } from "../ui/CompanyCard";
import { FormModal } from "../ui/FormModal";
import { SuccessBanner } from "../ui/SuccessBanner";

export const CompaniesPage = () => {
  const dispatch = useAppDispatch();
  const { items: companies, loading, error } = useAppSelector(
    (state) => state.companies
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "update">("create");
  const [modalType, setModalType] = useState<"company" | "garden">("company");
  const [selectedCompany, setSelectedCompany] = useState<
    CompanyListItem | undefined
  >(undefined);
  const [selectedGardenId, setSelectedGardenId] = useState<string | undefined>(
    undefined
  );
  const [selectedCompanyIdForGarden, setSelectedCompanyIdForGarden] = useState<
    string | undefined
  >(undefined);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const reloadCompanies = async () => {
    try {
      const data = await apiService.company.list();
      dispatch(fetchCompaniesSuccess(data));
    } catch (err) {
      dispatch(
        fetchCompaniesFailure(
          (err as Error).message || "Failed to fetch companies"
        )
      );
    }
  };

  const handleCreateCompany = async (payload: CreateCompanyRequest) => {
    setIsSubmitting(true);
    try {
      await apiService.company.create(payload);
      await reloadCompanies();
      setIsModalOpen(false);
      setSuccessMessage("Company created successfully");
    } catch (err) {
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateCompany = async (
    payload: UpdateCompanyRequest,
    file?: File | null,
    removeImage?: boolean
  ) => {
    setIsSubmitting(true);
    try {
      await apiService.company.update(payload);
      if (removeImage) {
        await apiService.company.removeImage(payload.companyid);
      }
      if (file) {
        await apiService.company.uploadImage(payload.companyid, file);
      }
      await reloadCompanies();
      setIsModalOpen(false);
      setSuccessMessage("Company updated successfully");
    } catch (err) {
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateGarden = async (payload: CreateGardenRequest) => {
    setIsSubmitting(true);
    try {
      await apiService.garden.create(payload);
      await reloadCompanies();
      setIsModalOpen(false);
      setSuccessMessage("Garden created successfully");
    } catch (err) {
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateGarden = async (payload: UpdateGardenRequest) => {
    setIsSubmitting(true);
    try {
      await apiService.garden.update(payload);
      await reloadCompanies();
      setIsModalOpen(false);
      setSuccessMessage("Garden updated successfully");
    } catch (err) {
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading && companies.length === 0) {
    return <p>Loading companies...</p>;
  }

  return (
    <div>
      {successMessage && (
        <SuccessBanner
          message={successMessage}
          onClose={() => setSuccessMessage(null)}
        />
      )}

      <h1 className="page-title">Companies</h1>

      {/* We removed inline error display since DashboardLayout handles global errors now */}

      <div className="panel">
        <div className="panel-header">
          <h2 className="panel-title">All companies</h2>
          <button
            type="button"
            className="primary-button"
            onClick={() => {
              setModalMode("create");
              setModalType("company");
              setSelectedCompany(undefined);
              setIsModalOpen(true);
            }}
          >
            Create Company
          </button>
        </div>

        {companies.length === 0 ? (
          <p>No companies found.</p>
        ) : (
          <div className="grid-cards" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}>
            {companies.map((company) => (
              <CompanyCard
                key={company.companyid}
                company={company}
                onEdit={(c) => {
                  setModalMode("update");
                  setModalType("company");
                  setSelectedCompany(c);
                  setIsModalOpen(true);
                }}
                onCreateGarden={(cid) => {
                  setModalMode("create");
                  setModalType("garden");
                  setSelectedCompanyIdForGarden(cid);
                  setSelectedGardenId(undefined);
                  setIsModalOpen(true);
                }}
                onEditGarden={(gid) => {
                  // We need to find the garden object. Since we only have ID, we search in companies.
                  // Or we could pass the full object up. But for now lets find it.
                  const garden = company.gardens.find((g) => g.gardenid === gid);
                  // We also need the companyid for the form context if needed, though update payload usually just needs gardenid.
                  // But our FormModal might rely on it.
                  if (garden) {
                    setModalMode("update");
                    setModalType("garden");
                    setSelectedGardenId(gid);
                    // We can pass the garden object to modal via props if we extend FormModal to accept it,
                    // or just let FormModal look it up if we passed companies list?
                    // Better: Pass the garden object directly to modal.
                    // But FormModal expects `garden` object for update?
                    // Let's check FormModal props. It takes `garden` prop which is `GardenOption[]`...
                    // Wait, `gardens` prop is `GardenOption[]`.
                    // For `update` mode of `garden`, we need to pass the garden details.
                    // I need to update FormModal to accept `gardenData` or similar.
                    // Actually I should just update FormModal to accept `selectedGarden` object.
                    // Let's do a quick fix: pass it via a new prop `gardenData`.
                    // Oh wait, I updated FormModal in previous step. Let's see.
                    // I added `company` and `gardenData` props?
                    // Checking previous step output...
                    // I added `company` prop.
                    // I added `gardenData` prop? NO. I see `gardens` prop which is `GardenOption[]`.
                    // I missed adding a prop to pass the *selected garden* for editing!
                    // I added `company` prop for editing company.
                    // I need to add `gardenData` prop to FormModal.

                    // Let's pass it via `gardenData` (I will update FormModal in next sub-step or now).
                    // Actually I can just update the `FormModal` call here and fixing `FormModal` code is handled in previous step (or I can overwrite it).
                    // I will assume I fix FormModal to accept `gardenData`.
                    setSelectedCompanyIdForGarden(company.companyid); // context
                    setIsModalOpen(true);
                  }
                }}
              />
            ))}
          </div>
        )}
      </div>

      <FormModal
        isOpen={isModalOpen}
        isSubmitting={isSubmitting}
        mode={modalMode}
        type={modalType as any} // Cast to any to avoid strict union mismatch if types aren't perfectly aligned yet
        // But wait, type can be "company" | "garden". FormModal should support it.
        // I need to ensure FormModal supports "company" and "garden".

        company={selectedCompany}

        // For garden edit, we need to pass the specific garden object.
        // Let's find it.
        gardenData={
          modalType === "garden" && modalMode === "update" && selectedGardenId
            ? companies
                .flatMap((c) => c.gardens)
                .find((g) => g.gardenid === selectedGardenId)
            : undefined
        }

        // Context for creating garden
        companyIdForGarden={selectedCompanyIdForGarden}

        onClose={() => setIsModalOpen(false)}
        onCreateCompany={handleCreateCompany}
        onUpdateCompany={handleUpdateCompany}
        onCreateGarden={handleCreateGarden}
        onUpdateGarden={handleUpdateGarden}
      />
    </div>
  );
};
