import { FormEvent, useMemo, useState } from "react";
import { apiService } from "../services/apiService";
import { useAppSelector } from "../store/hooks";
import type {
  CreateEmployeeRequest,
  Employee,
  UpdateEmployeeRequest
} from "../types/api";
import { AlertModal } from "../ui/AlertModal";
import { FormModal } from "../ui/FormModal";
import { NoResults } from "../ui/NoResults";
import { SuccessBanner } from "../ui/SuccessBanner";

export const EmployeesPage = () => {
  const companies = useAppSelector((state) => state.companies.items);
  const user = useAppSelector((state) => state.auth.user);
  const [gardenid, setGardenid] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "update">("create");
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | undefined>(
    undefined
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | undefined>(
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

  const loadEmployees = async (gid: string) => {
    setLoading(true);
    try {
      const data = await apiService.employee.listByGarden(gid);
      setEmployees(data);
      setHasSearched(true);
    } catch (fetchError) {
      setError((fetchError as Error).message || "Failed to fetch employees");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    if (!gardenid) {
      setError("Garden is required.");
      return;
    }
    await loadEmployees(gardenid);
  };

  const handleCreateEmployee = async (payload: CreateEmployeeRequest) => {
    setIsSubmitting(true);
    setError(null);
    try {
      await apiService.employee.create(payload);
      if (gardenid) {
        await loadEmployees(gardenid);
      }
      setIsModalOpen(false);
      setSuccessMessage("Employee created successfully");
    } catch (createError) {
      throw new Error((createError as Error).message || "Failed to create employee");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateEmployee = async (payload: UpdateEmployeeRequest) => {
    setIsSubmitting(true);
    setError(null);
    try {
      await apiService.employee.update(payload);
      if (gardenid) {
        await loadEmployees(gardenid);
      }
      setIsModalOpen(false);
      setSuccessMessage("Employee updated successfully");
    } catch (updateError) {
      throw new Error((updateError as Error).message || "Failed to update employee");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteEmployee = async () => {
    if (!employeeToDelete) return;
    setError(null);
    try {
      await apiService.employee.delete(employeeToDelete.employeeid);

      if (gardenid) {
        await loadEmployees(gardenid);
      }
      setIsAlertOpen(false);
      setSuccessMessage("Employee deleted successfully");
    } catch (deleteError) {
      setError((deleteError as Error).message || "Failed to delete employee");
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

      <h1 className="page-title">Employees</h1>
      <div className="panel">
        <div className="panel-header">
          <h2 className="panel-title">Filter Employees</h2>
          <button
            type="button"
            className="primary-button"
            onClick={() => {
              setModalMode("create");
              setSelectedEmployee(undefined);
              setIsModalOpen(true);
            }}
          >
            Create Employee
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
          <button className="primary-button" type="submit" disabled={loading}>
            {loading ? "Fetching..." : "Submit"}
          </button>
        </form>
        {error && <p className="field-error">{error}</p>}
      </div>

      {hasSearched && employees.length === 0 && (
        <NoResults message="No employees found for the selected garden." />
      )}

      {employees.length > 0 && (
        <div className="panel request-group-panel">
          <div className="panel-header">
            <h2 className="panel-title">Employees</h2>
          </div>
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Profession</th>
                <th>Phone</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((employee) => (
                <tr key={employee.employeeid}>
                  <td>{employee.name}</td>
                  <td>{employee.profession}</td>
                  <td>{employee.phone}</td>
                  <td>
                    <button
                      type="button"
                      className="icon-action-button"
                      title="Edit employee"
                      aria-label={`Edit ${employee.name}`}
                      onClick={() => {
                        setModalMode("update");
                        setSelectedEmployee(employee);
                        setIsModalOpen(true);
                      }}
                    >
                      📝
                    </button>
                    <button
                      type="button"
                      className="icon-action-button"
                      title="Delete employee"
                      aria-label={`Delete ${employee.name}`}
                      onClick={() => {
                        setEmployeeToDelete(employee);
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
        type="employee"
        gardens={gardens}
        employee={selectedEmployee}
        onClose={() => setIsModalOpen(false)}
        onCreateEmployee={handleCreateEmployee}
        onUpdateEmployee={handleUpdateEmployee}
      />

      <AlertModal
        isOpen={isAlertOpen}
        title="Delete Employee"
        message={`Are you sure you want to delete employee ${employeeToDelete?.name}? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDeleteEmployee}
        onCancel={() => setIsAlertOpen(false)}
      />
    </div>
  );
};
