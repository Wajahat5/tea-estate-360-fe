import { FormEvent, useState, useMemo } from "react";
import { apiService } from "../services/apiService";
import { useAppSelector } from "../store/hooks";
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
  const [gardenid, setGardenid] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [labourers, setLabourers] = useState<Labourer[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Tab State
  const [activeTab, setActiveTab] = useState<"info" | "attendance" | "payrole">("info");

  // Attendance State
  const [selectedLabourerIds, setSelectedLabourerIds] = useState<string[]>([]);
  const [attendanceDate, setAttendanceDate] = useState("");
  // Record of extra & type inputs for the UI map
  const [attendanceInputs, setAttendanceInputs] = useState<Record<string, { extra: string; type: string }>>({});
  // API presence array: stores "present", "absent", "-" mapped to labourer id
  const [attendancePresence, setAttendancePresence] = useState<Record<string, string>>({});
  const [attendanceTotal, setAttendanceTotal] = useState(0);

  // Payroll State
  const [payrollYear, setPayrollYear] = useState<string>(new Date().getFullYear().toString());
  const [payrollMonth, setPayrollMonth] = useState<string>((new Date().getMonth() + 1).toString().padStart(2, "0"));
  const [payrollPart, setPayrollPart] = useState<"1" | "2">("1");
  const [payrollData, setPayrollData] = useState<Record<string, { total_earned: number; status: "paid" | "unpaid" | "-" }>>({});
  const [payrollTotal, setPayrollTotal] = useState(0);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "update">("create");
  const [selectedLabourer, setSelectedLabourer] = useState<Labourer | undefined>(
    undefined
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

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
        gardenid,
        date: attendanceDate
      });

      const newInputs: Record<string, { extra: string; type: string }> = {};
      const newPresence: Record<string, string> = {};

      if (resp && resp.data) {
        resp.data.forEach(item => {
          newPresence[item.labourerid] = item.status;
          newInputs[item.labourerid] = { extra: item.extra.toString(), type: item.type };
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
      const data = selectedLabourerIds.map(id => ({
        labourerid: id,
        status: attendancePresence[id] || "present",
        extra: Number(attendanceInputs[id]?.extra || 0),
        type: attendanceInputs[id]?.type || "hr"
      }));

      await apiService.earnings.addAttendance({
        gardenid,
        date: attendanceDate,
        data
      });
      setSuccessMessage("Attendance added successfully");
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
      const data = selectedLabourerIds.map(id => ({
        labourerid: id,
        status: attendancePresence[id] || "present",
        extra: Number(attendanceInputs[id]?.extra || 0),
        type: attendanceInputs[id]?.type || "hr"
      }));

      await apiService.earnings.updateAttendance({
        gardenid,
        date: attendanceDate,
        data
      });
      setSuccessMessage("Attendance updated successfully");
    } catch (err) {
      setError((err as Error).message || "Failed to update attendance");
    } finally {
      setLoading(false);
    }
  };


  const handleFetchPayroll = async () => {
    setLoading(true);
    setError(null);
    try {
      const resp = await apiService.earnings.batchFetch({
        gardenid,
        year: payrollYear,
        month: payrollMonth,
        part: payrollPart,
        labourers: labourers.map(l => l.labourerid)
      });

      const newData: Record<string, { total_earned: number; status: "paid" | "unpaid" | "-" }> = {};
      if (resp && resp.data) {
        resp.data.forEach((item: any) => {
          newData[item.labourerid] = { total_earned: item.total_earned, status: item.status || "unpaid" };
        });
      }

      setPayrollData(newData);
      setSuccessMessage("Payroll fetched successfully");
    } catch (err) {
      setError((err as Error).message || "Failed to fetch payroll");
    } finally {
      setLoading(false);
    }
  };

  const handleAddPayment = async () => {
    if (selectedLabourerIds.length === 0) return;
    setLoading(true);
    setError(null);
    try {
      await apiService.earnings.addPayment({
        gardenid,
        year: payrollYear,
        month: payrollMonth,
        part: payrollPart,
        labourerids: selectedLabourerIds
      });
      setSuccessMessage("Payments added successfully");
      await handleFetchPayroll();
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
      await apiService.earnings.deletePayment({
        gardenid,
        year: payrollYear,
        month: payrollMonth,
        part: payrollPart,
        labourerids: selectedLabourerIds
      });
      setSuccessMessage("Payments deleted successfully");
      await handleFetchPayroll();
    } catch (err) {
      setError((err as Error).message || "Failed to delete payment");
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
        </div>
      )}

      {hasSearched && labourers.length === 0 && (
        <NoResults message="No labourers found for the selected garden." />
      )}

      {labourers.length > 0 && activeTab === "info" && (
        <div className="panel request-group-panel">
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
              {labourers.filter((l) => l.name.toLowerCase().includes(searchQuery.toLowerCase())).map((l) => (
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


      {labourers.length > 0 && activeTab === "attendance" && (
        <div className="panel request-group-panel">
          <div className="panel-header" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center', justifyContent: 'space-between' }}>
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
                          setSelectedLabourerIds(labourers.map(l => l.labourerid));
                        } else {
                          setSelectedLabourerIds([]);
                        }
                      }}
                      checked={selectedLabourerIds.length > 0 && selectedLabourerIds.length === labourers.length}
                    />
                  </th>
                  <th>Name</th>
                  <th>Presence</th>
                  <th>Extra</th>
                  <th>Type</th>
                </tr>
              </thead>
              <tbody>
                {labourers.map((l) => (
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
                      <select
                        className="field-input"
                        style={{ margin: 0, padding: '4px 8px' }}
                        value={attendancePresence[l.labourerid] || "-"}
                        onChange={(e) => setAttendancePresence(prev => ({ ...prev, [l.labourerid]: e.target.value }))}
                      >
                        <option value="-">-</option>
                        <option value="present">Present</option>
                        <option value="absent">Absent</option>
                      </select>
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


      {labourers.length > 0 && activeTab === "payrole" && (
        <div className="panel request-group-panel">
          <div className="panel-header" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center', justifyContent: 'space-between' }}>
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
              <button className="primary-button" onClick={handleFetchPayroll} disabled={loading}>
                Fetch
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
                          setSelectedLabourerIds(labourers.map(l => l.labourerid));
                        } else {
                          setSelectedLabourerIds([]);
                        }
                      }}
                      checked={selectedLabourerIds.length > 0 && selectedLabourerIds.length === labourers.length}
                    />
                  </th>
                  <th>Name</th>
                  <th>Total Earned</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {labourers.map((l) => (
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
