import { FormEvent, useState, useMemo } from "react";
import { apiService } from "../services/apiService";
import { useAppSelector } from "../store/hooks";
import { usePageState } from "../hooks/usePageState";
import type {
  CreateLabourerRequest,
  Labourer,
  UpdateLabourerRequest
} from "../types/api";
import { FormModal } from "../ui/FormModal";
import { NoResults } from "../ui/NoResults";
import { SuccessBanner } from "../ui/SuccessBanner";

export const LabourersPage = () => {
  const companies = useAppSelector((state) => state.companies.items);
  const user = useAppSelector((state) => state.auth.user);
  const [gardenid, setGardenid] = usePageState("labourers_gardenid", "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = usePageState("labourers_hasSearched", false);
  const [labourers, setLabourers] = usePageState<Labourer[]>("labourers_list", []);
  const [searchQuery, setSearchQuery] = usePageState("labourers_searchQuery", "");

  // Tab State
  const [activeTab, setActiveTab] = usePageState<"info" | "attendance" | "payrole" | "leaves">("labourers_activeTab", "info");

  // Attendance State
  const [selectedLabourerIds, setSelectedLabourerIds] = usePageState<string[]>("labourers_selectedIds", []);
  const [attendanceDate, setAttendanceDate] = usePageState("labourers_attendanceDate", "");
  // Record of extra & type inputs for the UI map
  const [attendanceInputs, setAttendanceInputs] = usePageState<Record<string, { extra: string; type: string }>>("labourers_attendanceInputs", {});
  // API presence array: stores "present", "absent", "-" mapped to labourer id
  const [attendancePresence, setAttendancePresence] = usePageState<Record<string, string>>("labourers_attendancePresence", {});

  // Payroll State
  const [payrollYear, setPayrollYear] = usePageState<string>("labourers_payrollYear", new Date().getFullYear().toString());
  const [payrollMonth, setPayrollMonth] = usePageState<string>("labourers_payrollMonth", (new Date().getMonth() + 1).toString().padStart(2, "0"));
  const [payrollPart, setPayrollPart] = usePageState<"1" | "2">("labourers_payrollPart", "1");
  const [payrollData, setPayrollData] = usePageState<Record<string, { total_earned: number; status: "paid" | "unpaid" | "-" }>>("labourers_payrollData", {});

  const totalAmountToPay = useMemo(() => {
    return labourers.reduce((total, l) => {
      const earned = payrollData[l.labourerid]?.total_earned || 0;
      return total + earned;
    }, 0);
  }, [labourers, payrollData]);

  // Leaves State
  const [leavesDate, setLeavesDate] = usePageState("labourers_leavesDate", "");
  const [leavesData, setLeavesData] = usePageState<Record<string, number>>("labourers_leavesData", {});
  const [leaveInputs, setLeaveInputs] = usePageState<Record<string, { start: string; end: string; reason: string }>>("labourers_leaveInputs", {});

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "update">("create");
  const [selectedLabourer, setSelectedLabourer] = useState<Labourer | undefined>(
    undefined
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const filteredLabourers = useMemo(() => {
    if (!searchQuery) return labourers;
    return labourers.filter((l) => l.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [labourers, searchQuery]);

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

  const loadLabourers = async (gid: string) => {
    setLoading(true);
    try {
      const data = await apiService.labourer.fetch({ gardenid: gid });
      setLabourers(data);
      setHasSearched(true);
    } catch (fetchError) {
      setError((fetchError as Error).message || "Failed to fetch labourers");
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
    await loadLabourers(gardenid);
  };

  const handleCreateLabourer = async (payload: CreateLabourerRequest) => {
    setIsSubmitting(true);
    setError(null);
    try {
      await apiService.labourer.create(payload);
      if (gardenid) {
        await loadLabourers(gardenid);
      }
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
      if (gardenid) {
        await loadLabourers(gardenid);
      }
      setIsModalOpen(false);
      setSuccessMessage("Labourer updated successfully");
    } catch (updateError) {
      throw new Error((updateError as Error).message || "Failed to update labourer");
    } finally {
      setIsSubmitting(false);
    }
  };


  const handleFetchAttendance = async () => {
    if (!attendanceDate) return;
    setLoading(true);
    setError(null);
    try {
      const resp = await apiService.earnings.fetchAttendance({
        labourerids: labourers.map(l => l.labourerid),
        date: attendanceDate
      });

      const newInputs: Record<string, { extra: string; type: string }> = {};
      const newPresence: Record<string, string> = {};

      if (Array.isArray(resp)) {
        labourers.forEach((l, i) => {
          newPresence[l.labourerid] = resp[i] ? "present" : "-";
          newInputs[l.labourerid] = { extra: "", type: "hr" };
        });
      } else if (resp && resp.data) {
        resp.data.forEach((item: any) => {
          newPresence[item.labourerid] = item.status;
          newInputs[item.labourerid] = { extra: item.extra?.toString() || "", type: item.type || "hr" };
        });
      }

      setAttendanceInputs(newInputs);
      setAttendancePresence(newPresence);
      setSuccessMessage("Attendance fetched successfully");
    } catch (err) {
      setError((err as Error).message || "Failed to fetch attendance");
    } finally {
      setLoading(false);
    }
  };

  const handleAddAttendance = async () => {
    if (!attendanceDate || selectedLabourerIds.length === 0) return;
    setLoading(true);
    setError(null);
    try {
      const data = selectedLabourerIds
        .map(id => ({
          labourerid: id,
          extra: Number(attendanceInputs[id]?.extra || 0),
          type: attendanceInputs[id]?.type || "hr"
        }));

      await apiService.earnings.addAttendance({
        date: attendanceDate,
        labourers: data
      });
      setSuccessMessage("Attendance added successfully");
      // Optionally re-fetch attendance to update the display
      await handleFetchAttendance();
    } catch (err) {
      setError((err as Error).message || "Failed to add attendance");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAttendance = async () => {
    if (!attendanceDate || selectedLabourerIds.length === 0) return;
    setLoading(true);
    setError(null);
    try {
      const data = selectedLabourerIds
        .map(id => ({
          labourerid: id,
          extra: Number(attendanceInputs[id]?.extra || 0),
          type: attendanceInputs[id]?.type || "hr"
        }));

      await apiService.earnings.updateAttendance({
        date: attendanceDate,
        labourers: data
      });
      setSuccessMessage("Attendance updated successfully");
      // Optionally re-fetch attendance to update the display
      await handleFetchAttendance();
    } catch (err) {
      setError((err as Error).message || "Failed to update attendance");
    } finally {
      setLoading(false);
    }
  };

  const getCompanyIdByGardenId = (gid: string) => {
    return gardens.find(g => g.gardenid === gid)?.companyid || companies[0]?.companyid || "";
  };

  const handleFetchPayroll = async () => {
    if (selectedLabourerIds.length === 0) return;
    setLoading(true);
    setError(null);
    try {
      const resp = await apiService.earnings.batchFetch({
        companyid: getCompanyIdByGardenId(gardenid),
        year: payrollYear,
        month: payrollMonth,
        part: payrollPart,
        labourerids: selectedLabourerIds
      });

      const newData = { ...payrollData };
      if (Array.isArray(resp)) {
        resp.forEach((item: any) => {
           newData[item.labourerid] = {
             total_earned: item.total_earned,
             status: newData[item.labourerid]?.status || "-"
           };
        });
      }

      setPayrollData(newData);
    } catch (err) {
      setError((err as Error).message || "Failed to fetch payroll");
    } finally {
      setLoading(false);
    }
  };

  const handleFetchPaymentStatus = async () => {
    if (labourers.length === 0) return;
    setLoading(true);
    setError(null);
    try {
      const ymp = `${payrollYear}-${payrollMonth}-${payrollPart}`;
      const labourerids = labourers.map(l => l.labourerid);
      const resp = await apiService.earnings.fetchPaymentStatus({
        labourerids,
        ymp
      });

      const newData = { ...payrollData };
      if (Array.isArray(resp)) {
        labourerids.forEach((id, index) => {
           newData[id] = {
             total_earned: newData[id]?.total_earned || 0,
             status: resp[index] ? "paid" : "unpaid"
           };
        });
      }

      setPayrollData(newData);
      setSuccessMessage("Payment status fetched successfully");
    } catch (err) {
      setError((err as Error).message || "Failed to fetch payment status");
    } finally {
      setLoading(false);
    }
  };

  const handleAddPayment = async () => {
    if (selectedLabourerIds.length === 0) return;
    setLoading(true);
    setError(null);
    try {
      const ymp = `${payrollYear}-${payrollMonth}-${payrollPart}`;
      const amounts = selectedLabourerIds.map(id => payrollData[id]?.total_earned || 0);

      await apiService.earnings.addPayment({
        labourerids: selectedLabourerIds,
        ymp,
        amounts
      });

      setSuccessMessage("Payments added successfully");
      await handleFetchPaymentStatus();
    } catch (err) {
      setError((err as Error).message || "Failed to add payment");
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePayment = async () => {
    if (selectedLabourerIds.length === 0) return;
    setLoading(true);
    setError(null);
    try {
      const ymp = `${payrollYear}-${payrollMonth}-${payrollPart}`;
      await apiService.earnings.deletePayment({
        companyid: getCompanyIdByGardenId(gardenid),
        labourerids: selectedLabourerIds,
        ymp
      });
      setSuccessMessage("Payments deleted successfully");
      await handleFetchPaymentStatus();
    } catch (err) {
      setError((err as Error).message || "Failed to delete payment");
    } finally {
      setLoading(false);
    }
  };

  const handleFetchLeaves = async () => {
    if (!leavesDate) {
      setError("Please select a date to fetch leaves.");
      return;
    }
    if (selectedLabourerIds.length === 0) {
      setError("Please select at least one labourer to fetch leaves for.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const newLeavesData: Record<string, number> = { ...leavesData };
      for (const id of selectedLabourerIds) {
        const resp = await apiService.labourer.fetchAvailableLeaves(id, leavesDate);
        newLeavesData[id] = resp.leaves;
      }
      setLeavesData(newLeavesData);
      setSuccessMessage("Leaves fetched successfully");
    } catch (err) {
      setError((err as Error).message || "Failed to fetch leaves");
    } finally {
      setLoading(false);
    }
  };

  const handleAddLeave = async (labourerid: string) => {
    const inputs = leaveInputs[labourerid];
    if (!inputs?.start || !inputs?.end || !inputs?.reason) {
      setError("Please fill in start date, end date, and reason to add leave.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await apiService.labourer.addLeave({
        labourerid,
        start: inputs.start,
        end: inputs.end,
        reason: inputs.reason
      });
      setSuccessMessage("Leave added successfully");
      setLeaveInputs((prev) => ({
        ...prev,
        [labourerid]: { start: "", end: "", reason: "" }
      }));
      // Optionally refetch leaves if leavesDate is set
      if (leavesDate) {
        await handleFetchLeaves();
      }
    } catch (err) {
      setError((err as Error).message || "Failed to add leave");
    } finally {
      setLoading(false);
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
          <h2 className="panel-title">Filter Labourers</h2>
          <button
            type="button"
            className="primary-button"
            onClick={() => {
              setModalMode("create");
              setSelectedLabourer(undefined);
              setIsModalOpen(true);
            }}
          >
            Create Labourer
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

      {hasSearched && (
        <div className="panel-tabs">
          <button
            className={`tab-button ${activeTab === "info" ? "active" : ""}`}
            onClick={() => setActiveTab("info")}
          >
            Info
          </button>
          <button
            className={`tab-button ${activeTab === "attendance" ? "active" : ""}`}
            onClick={() => setActiveTab("attendance")}
          >
            Attendance
          </button>
          <button
            className={`tab-button ${activeTab === "payrole" ? "active" : ""}`}
            onClick={() => setActiveTab("payrole")}
          >
            Payrole
          </button>
          <button
            className={`tab-button ${activeTab === "leaves" ? "active" : ""}`}
            onClick={() => setActiveTab("leaves")}
          >
            Leaves
          </button>
        </div>
      )}

      {hasSearched && labourers.length === 0 && (
        <NoResults message="No labourers found for the selected garden." />
      )}

      {labourers.length > 0 && (
        <div className="panel request-group-panel" style={{ display: activeTab === "info" ? 'block' : 'none' }}>
          <div className="panel-header" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center', justifyContent: 'space-between' }}>
            <input
              type="text"
              className="field-input"
              placeholder="Search by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ maxWidth: '300px', margin: 0 }}
            />
          </div>
          <div style={{ overflowX: 'auto' }}>
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
              {filteredLabourers.map((l) => (
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
        </div>
      )}


      {labourers.length > 0 && (
        <div className="panel request-group-panel" style={{ display: activeTab === "attendance" ? 'block' : 'none' }}>
          <div className="panel-header" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center', justifyContent: 'space-between' }}>
            <input
              type="text"
              className="field-input"
              placeholder="Search by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ maxWidth: '300px', margin: 0 }}
            />
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <label className="field-label" style={{ marginBottom: 0 }}>
                Date:
                <input
                  type="date"
                  className="field-input"
                  value={attendanceDate}
                  onChange={(e) => setAttendanceDate(e.target.value)}
                  style={{ marginLeft: '8px', marginBottom: 0 }}
                />
              </label>
              <button className="primary-button" onClick={handleFetchAttendance} disabled={loading || !attendanceDate}>
                Fetch
              </button>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="primary-button" onClick={handleAddAttendance} disabled={loading || selectedLabourerIds.length === 0}>
                Add Selected
              </button>
              <button className="primary-button" onClick={handleUpdateAttendance} disabled={loading || selectedLabourerIds.length === 0}>
                Update Selected
              </button>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>
                    <input
                      type="checkbox"
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedLabourerIds(filteredLabourers.map(l => l.labourerid));
                        } else {
                          setSelectedLabourerIds([]);
                        }
                      }}
                      checked={selectedLabourerIds.length > 0 && selectedLabourerIds.length === filteredLabourers.length}
                    />
                  </th>
                  <th>Name</th>
                  <th>Presence</th>
                  <th>Extra</th>
                  <th>Type</th>
                </tr>
              </thead>
              <tbody>
                {filteredLabourers.map((l) => (
                  <tr key={l.labourerid}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedLabourerIds.includes(l.labourerid)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedLabourerIds(prev => [...prev, l.labourerid]);
                          } else {
                            setSelectedLabourerIds(prev => prev.filter(id => id !== l.labourerid));
                          }
                        }}
                      />
                    </td>
                    <td>{l.name}</td>
                    <td>
                      <span>
                        {attendancePresence[l.labourerid] || "-"}
                      </span>
                    </td>
                    <td>
                      <input
                        type="number"
                        className="field-input"
                        style={{ margin: 0, padding: '4px 8px', width: '80px' }}
                        value={attendanceInputs[l.labourerid]?.extra || ""}
                        onChange={(e) => setAttendanceInputs(prev => ({
                          ...prev,
                          [l.labourerid]: { ...prev[l.labourerid], extra: e.target.value, type: prev[l.labourerid]?.type || "hr" }
                        }))}
                        placeholder="0"
                      />
                    </td>
                    <td>
                      <select
                        className="field-input"
                        style={{ margin: 0, padding: '4px 8px' }}
                        value={attendanceInputs[l.labourerid]?.type || "hr"}
                        onChange={(e) => setAttendanceInputs(prev => ({
                          ...prev,
                          [l.labourerid]: { ...prev[l.labourerid], type: e.target.value, extra: prev[l.labourerid]?.extra || "" }
                        }))}
                      >
                        <option value="hr">hr</option>
                        <option value="kg">kg</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {labourers.length > 0 && (
        <div className="panel request-group-panel" style={{ display: activeTab === "leaves" ? 'block' : 'none' }}>
          <div className="panel-header" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center', justifyContent: 'space-between' }}>
            <input
              type="text"
              className="field-input"
              placeholder="Search by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ maxWidth: '300px', margin: 0 }}
            />
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <label className="field-label" style={{ marginBottom: 0 }}>
                Date:
                <input
                  type="date"
                  className="field-input"
                  value={leavesDate}
                  onChange={(e) => setLeavesDate(e.target.value)}
                  style={{ marginLeft: '8px', marginBottom: 0 }}
                />
              </label>
              <button className="primary-button" onClick={handleFetchLeaves} disabled={loading || !leavesDate}>
                Fetch Leaves
              </button>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>
                    <input
                      type="checkbox"
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedLabourerIds(filteredLabourers.map(l => l.labourerid));
                        } else {
                          setSelectedLabourerIds([]);
                        }
                      }}
                      checked={selectedLabourerIds.length > 0 && selectedLabourerIds.length === filteredLabourers.length}
                    />
                  </th>
                  <th>Name</th>
                  <th>Available Leaves</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Reason</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredLabourers.map((l) => (
                  <tr key={l.labourerid}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedLabourerIds.includes(l.labourerid)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedLabourerIds(prev => [...prev, l.labourerid]);
                          } else {
                            setSelectedLabourerIds(prev => prev.filter(id => id !== l.labourerid));
                          }
                        }}
                      />
                    </td>
                    <td>{l.name}</td>
                    <td>{leavesData[l.labourerid] !== undefined ? leavesData[l.labourerid] : "-"}</td>
                    <td>
                      <input
                        type="date"
                        className="field-input"
                        style={{ margin: 0, padding: '4px 8px' }}
                        value={leaveInputs[l.labourerid]?.start || ""}
                        onChange={(e) => setLeaveInputs(prev => ({
                          ...prev,
                          [l.labourerid]: { ...prev[l.labourerid], start: e.target.value, reason: prev[l.labourerid]?.reason || "", end: prev[l.labourerid]?.end || "" }
                        }))}
                      />
                    </td>
                    <td>
                      <input
                        type="date"
                        className="field-input"
                        style={{ margin: 0, padding: '4px 8px' }}
                        value={leaveInputs[l.labourerid]?.end || ""}
                        onChange={(e) => setLeaveInputs(prev => ({
                          ...prev,
                          [l.labourerid]: { ...prev[l.labourerid], end: e.target.value, reason: prev[l.labourerid]?.reason || "", start: prev[l.labourerid]?.start || "" }
                        }))}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        className="field-input"
                        placeholder="Reason"
                        style={{ margin: 0, padding: '4px 8px' }}
                        value={leaveInputs[l.labourerid]?.reason || ""}
                        onChange={(e) => setLeaveInputs(prev => ({
                          ...prev,
                          [l.labourerid]: { ...prev[l.labourerid], reason: e.target.value, start: prev[l.labourerid]?.start || "", end: prev[l.labourerid]?.end || "" }
                        }))}
                      />
                    </td>
                    <td>
                      <button
                        type="button"
                        className="primary-button"
                        style={{ padding: '4px 12px' }}
                        onClick={() => handleAddLeave(l.labourerid)}
                        disabled={loading || !leaveInputs[l.labourerid]?.start || !leaveInputs[l.labourerid]?.end || !leaveInputs[l.labourerid]?.reason}
                      >
                        Add Leave
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}


      {labourers.length > 0 && (
        <div className="panel request-group-panel" style={{ display: activeTab === "payrole" ? 'block' : 'none' }}>
          <div className="panel-header" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <input
                type="text"
                className="field-input"
                placeholder="Search by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ maxWidth: '300px', margin: 0 }}
              />
              <div style={{ fontWeight: "bold", marginLeft: "10px", color: "#374151" }}>
                Total amount to pay: ₹{totalAmountToPay}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <select className="field-input" value={payrollYear} onChange={e => setPayrollYear(e.target.value)} style={{ margin: 0 }}>
                {Array.from({length: 5}, (_, i) => new Date().getFullYear() - i).map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
              <select className="field-input" value={payrollMonth} onChange={e => setPayrollMonth(e.target.value)} style={{ margin: 0 }}>
                {Array.from({length: 12}, (_, i) => (i + 1).toString().padStart(2, '0')).map(month => (
                  <option key={month} value={month}>{month}</option>
                ))}
              </select>
              <select className="field-input" value={payrollPart} onChange={e => setPayrollPart(e.target.value as "1" | "2")} style={{ margin: 0 }}>
                <option value="1">1st Part</option>
                <option value="2">2nd Part</option>
              </select>
              <button className="primary-button" onClick={handleFetchPayroll} disabled={loading || selectedLabourerIds.length === 0}>
                Fetch Earnings
              </button>
              <button className="primary-button" onClick={handleFetchPaymentStatus} disabled={loading}>
                Fetch Status
              </button>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="primary-button" onClick={handleAddPayment} disabled={loading || selectedLabourerIds.length === 0}>
                Add Payment
              </button>
              <button className="primary-button" onClick={handleDeletePayment} disabled={loading || selectedLabourerIds.length === 0} style={{ backgroundColor: '#ef4444' }}>
                Delete Payment
              </button>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>
                    <input
                      type="checkbox"
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedLabourerIds(filteredLabourers.map(l => l.labourerid));
                        } else {
                          setSelectedLabourerIds([]);
                        }
                      }}
                      checked={selectedLabourerIds.length > 0 && selectedLabourerIds.length === filteredLabourers.length}
                    />
                  </th>
                  <th>Name</th>
                  <th>Total Earned</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredLabourers.map((l) => (
                  <tr key={l.labourerid}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedLabourerIds.includes(l.labourerid)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedLabourerIds(prev => [...prev, l.labourerid]);
                          } else {
                            setSelectedLabourerIds(prev => prev.filter(id => id !== l.labourerid));
                          }
                        }}
                      />
                    </td>
                    <td>{l.name}</td>
                    <td>{payrollData[l.labourerid]?.total_earned || 0}</td>
                    <td>
                      <span className={`status-badge ${payrollData[l.labourerid]?.status === 'paid' ? 'status-paid' : 'status-unpaid'}`}>
                        {payrollData[l.labourerid]?.status || "-"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

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
