import { useState } from "react";
import { apiService } from "../services/apiService";
import { auth } from "../services/auth";
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
  const user = useAppSelector((state) => state.auth.user);
  const { items: companies, loading, error } = useAppSelector(
    (state) => state.companies
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "update">("create");
  const [modalType, setModalType] = useState<"company" | "garden" | "company_flow">("company");
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
      auth.setCompanies(data);
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

  const handleCreateCompanyFlow = async (companyPayload: CreateCompanyRequest, gardenPayload: CreateGardenRequest) => {
    setIsSubmitting(true);
    try {
      await apiService.company.create(companyPayload);
      await apiService.garden.create(gardenPayload);
      await reloadCompanies();
      setIsModalOpen(false);
      setSuccessMessage("Company and Garden created successfully");
    } catch (err) {
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProcessRequest = async (action: "accept" | "reject", userid: string, gardenid: string, companyid: string) => {
    try {
      await apiService.company.processRequest({ action, userid, gardenid, companyid });
      await reloadCompanies();
      setSuccessMessage(`Request ${action}ed successfully.`);
    } catch (err) {
      // Error handled globally
    }
  };

  if (loading && companies.length === 0) {
    return <p>Loading companies...</p>;
  }

  // Aggregate access requests across all owned companies
  const accessRequests = companies.flatMap(company =>
    (company.access_requests || []).map(req => ({
      ...req,
      companyid: company.companyid,
      companyName: company.name,
      gardenName: company.gardens.find(g => g.gardenid === req.gardenid)?.name || req.gardenid
    }))
  );

  if (user?.profession !== 'owner' && companies.length === 0) {
    // If not an owner and blocked, the DashboardLayout will render AccessBlockedModal.
    // We can just return empty here to avoid showing "All companies" header underneath the modal.
    return null;
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

      {accessRequests.length > 0 && (
        <div className="panel" style={{ marginBottom: "24px" }}>
          <div className="panel-header">
            <h2 className="panel-title">Join Requests</h2>
          </div>
          <table className="table">
            <thead>
              <tr>
                <th>Request Details</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {accessRequests.map((req, idx) => (
                <tr key={`${req.userid}-${req.gardenid}-${idx}`}>
                  <td>User {req.userid} wants to join {req.gardenName} of {req.companyName}</td>
                  <td>
                    <button className="primary-button sm-button" onClick={() => handleProcessRequest("accept", req.userid, req.gardenid, req.companyid)} style={{ marginRight: "8px", marginTop: 0 }}>Accept</button>
                    <button className="secondary-button sm-button" onClick={() => handleProcessRequest("reject", req.userid, req.gardenid, req.companyid)} style={{ marginTop: 0 }}>Reject</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="panel">
        <div className="panel-header">
          <h2 className="panel-title">All companies</h2>
          {user?.profession === 'owner' && (
            <button
              type="button"
              className="primary-button"
              onClick={() => {
                setModalMode("create");
                setModalType("company_flow");
                setSelectedCompany(undefined);
                setIsModalOpen(true);
              }}
            >
              Create Company
            </button>
          )}
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
        onCreateCompanyFlow={handleCreateCompanyFlow}
      />
    </div>
  );
};
