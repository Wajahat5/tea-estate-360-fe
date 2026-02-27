import { FormEvent, useMemo, useState } from "react";
import { apiService } from "../services/apiService";
import { useAppSelector } from "../store/hooks";
import type { Expense } from "../types/api";
import { AlertModal } from "../ui/AlertModal";
import { FormModal } from "../ui/FormModal";
import { NoResults } from "../ui/NoResults";
import { SuccessBanner } from "../ui/SuccessBanner";

const STATUS_OPTIONS = ["paid", "unpaid"] as const;

export const ExpensesPage = () => {
  const companies = useAppSelector((state) => state.companies.items);
  const user = useAppSelector((state) => state.auth.user);
  const [gardenid, setGardenid] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [status, setStatus] = useState<(typeof STATUS_OPTIONS)[number]>("unpaid");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [expenses, setExpenses] = useState<Expense[]>([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "update">("create");
  const [selectedExpense, setSelectedExpense] = useState<Expense | undefined>(
    undefined
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | undefined>(
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

  const loadExpenses = async (
    gid: string,
    f: string,
    t: string,
    s: (typeof STATUS_OPTIONS)[number]
  ) => {
    setLoading(true);
    try {
      const data = await apiService.expenses.listByFilters(gid, f, t, s);
      setExpenses(data);
      setHasSearched(true);
    } catch (fetchError) {
      setError((fetchError as Error).message || "Failed to fetch expenses");
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
    await loadExpenses(gardenid, from, to, status);
  };

  const handleCreateExpense = async (payload: Expense) => {
    setIsSubmitting(true);
    setError(null);
    try {
      await apiService.expenses.create(payload);
      if (gardenid && from && to) {
        await loadExpenses(gardenid, from, to, status);
      }
      setIsModalOpen(false);
      setSuccessMessage("Expense created successfully");
    } catch (createError) {
      throw new Error((createError as Error).message || "Failed to create expense");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateExpense = async (
    payload: Expense,
    file?: File | null,
    removeImage?: boolean
  ) => {
    setIsSubmitting(true);
    setError(null);
    try {
      await apiService.expenses.update(payload);
      if (removeImage) {
        await apiService.expenses.removeImage(payload.expenseid);
      }
      if (file) {
        // expenses supports multiple files but FormModal currently handles single file for consistency
        // or we can just send it as an array if needed.
        // The API `uploadImages` expects `File[]`.
        await apiService.expenses.uploadImages(payload.expenseid, [file]);
      }
      if (gardenid && from && to) {
        await loadExpenses(gardenid, from, to, status);
      }
      setIsModalOpen(false);
      setSuccessMessage("Expense updated successfully");
    } catch (updateError) {
      throw new Error((updateError as Error).message || "Failed to update expense");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteExpense = async () => {
    if (!expenseToDelete) return;
    setError(null);
    try {
      await apiService.expenses.delete(expenseToDelete.expenseid);

      if (gardenid && from && to) {
        await loadExpenses(gardenid, from, to, status);
      }
      setIsAlertOpen(false);
      setSuccessMessage("Expense deleted successfully");
    } catch (deleteError) {
      setError((deleteError as Error).message || "Failed to delete expense");
      setIsAlertOpen(false);
    }
  };

  const handleToggleStatus = async (expense: Expense) => {
    setError(null);
    const newStatus = expense.status === "paid" ? "unpaid" : "paid";
    try {
      await apiService.expenses.changeStatus([expense.expenseid], newStatus);
      if (gardenid && from && to) {
        await loadExpenses(gardenid, from, to, status);
      }
      setSuccessMessage(`Expense marked as ${newStatus}`);
    } catch (toggleError) {
      setError((toggleError as Error).message || "Failed to update expense status");
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

      <h1 className="page-title">Expenses</h1>
      <div className="panel">
        <div className="panel-header">
          <h2 className="panel-title">Filter Expenses</h2>
          <button
            type="button"
            className="primary-button"
            onClick={() => {
              setModalMode("create");
              setSelectedExpense(undefined);
              setIsModalOpen(true);
            }}
          >
            Create Expense
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

      {hasSearched && expenses.length === 0 && (
        <NoResults message="No expenses found for the selected filters." />
      )}

      {expenses.length > 0 && (
        <div className="panel request-group-panel">
          <div className="panel-header">
            <h2 className="panel-title">Expense records</h2>
          </div>
          <table className="table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Title</th>
                <th>Date</th>
                <th>Request</th>
                <th>Items</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((expense) => (
                <tr key={expense.expenseid}>
                  <td>
                    {expense.image ? (
                      <img
                        src={expense.image}
                        alt={expense.title}
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
                  <td>{expense.title}</td>
                  <td>{expense.date}</td>
                  <td>{expense.req_id ?? "-"}</td>
                  <td>{expense.points.join(", ")}</td>
                  <td>{expense.amount ?? 0}</td>
                  <td>
                    <button
                      type="button"
                      className={`badge ${
                        expense.status === "paid" ? "badge-pill-green" : "badge-pill-amber"
                      }`}
                      style={{ border: "none", cursor: "pointer", fontSize: "0.8rem" }}
                      title={`Click to mark as ${expense.status === "paid" ? "unpaid" : "paid"}`}
                      onClick={() => handleToggleStatus(expense)}
                    >
                      {expense.status}
                    </button>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="icon-action-button"
                      title="Edit expense"
                      aria-label={`Edit ${expense.title}`}
                      onClick={() => {
                        setModalMode("update");
                        setSelectedExpense(expense);
                        setIsModalOpen(true);
                      }}
                    >
                      📝
                    </button>
                    <button
                      type="button"
                      className="icon-action-button"
                      title="Delete expense"
                      aria-label={`Delete ${expense.title}`}
                      onClick={() => {
                        setExpenseToDelete(expense);
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
        type="expense"
        gardens={gardens}
        expense={selectedExpense}
        onClose={() => setIsModalOpen(false)}
        onCreateExpense={handleCreateExpense}
        onUpdateExpense={handleUpdateExpense}
      />

      <AlertModal
        isOpen={isAlertOpen}
        title="Delete Expense"
        message={`Are you sure you want to delete expense "${expenseToDelete?.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDeleteExpense}
        onCancel={() => setIsAlertOpen(false)}
      />
    </div>
  );
};
