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
          <div className="companies-grid">
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
                  const garden = company.gardens.find((g) => g.gardenid === gid);
                  if (garden) {
                    setModalMode("update");
                    setModalType("garden");
                    setSelectedGardenId(gid);
                    setSelectedCompanyIdForGarden(company.companyid);
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
        type={modalType as any}
        company={selectedCompany}
        gardenData={
          modalType === "garden" && modalMode === "update" && selectedGardenId
            ? companies
                .flatMap((c) => c.gardens)
                .find((g) => g.gardenid === selectedGardenId)
            : undefined
        }
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
