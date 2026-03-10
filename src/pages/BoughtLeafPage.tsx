import React, { useState, useEffect } from "react";
import { useAppDispatch } from "../store/hooks";
import { useOwnedGardens } from "../hooks/useOwnedGardens";
import { apiService } from "../services/apiService";
import { setError } from "../store/errorSlice";
import type { BoughtLeafSupplier, BoughtLeafPrice, BoughtLeafLog, BoughtLeafAnalytics } from "../types/api";

export const BoughtLeafPage: React.FC = () => {
  const dispatch = useAppDispatch();

  const gardenOptions = useOwnedGardens();

  const [activeTab, setActiveTab] = useState("supplier");
  const [selectedGardenId, setSelectedGardenId] = useState("");

  // Fake lists since mock api doesn't have list methods immediately accessible here
  const [suppliers, setSuppliers] = useState<BoughtLeafSupplier[]>([]);

  const [supplier, setSupplier] = useState<BoughtLeafSupplier>({ name: "", phone: "", address: "", supplierCode: "", gardenIds: [] });
  const [price, setPrice] = useState<BoughtLeafPrice>({ effectiveDate: "", pricePerKg: 0, gardenIds: [] });
  const [log, setLog] = useState<BoughtLeafLog>({ supplierId: "", grossWeight: 0, deductionWeight: 0, qualityScore: 0, vehicleNo: "", date: "", gardenIds: [] });
  const [analyticsData, setAnalyticsData] = useState<BoughtLeafAnalytics | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (activeTab === "analytics" && selectedGardenId) {
      const fetchAnalytics = async () => {
        try {
          const res = await apiService.stg.getAnalytics(selectedGardenId);
          setAnalyticsData(res);
        } catch (error: any) {
          dispatch(setError(error.message));
        }
      };
      fetchAnalytics();
    }
  }, [activeTab, selectedGardenId, dispatch]);

  const handleGardenToggle = (setter: any, stateObj: any, id: string) => {
    const newIds = stateObj.gardenIds.includes(id)
      ? stateObj.gardenIds.filter((gid: string) => gid !== id)
      : [...stateObj.gardenIds, id];
    setter({ ...stateObj, gardenIds: newIds });
  };

  const handleSupplierSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (supplier.gardenIds.length === 0) return alert("Select at least one garden.");
    setIsSubmitting(true);
    try {
      const newSup = await apiService.stg.addSupplier(supplier);
      setSuppliers([...suppliers, newSup]);
      alert("Supplier added successfully");
      setSupplier({ name: "", phone: "", address: "", supplierCode: "", gardenIds: [] });
    } catch(err: any) {
      dispatch(setError(err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePriceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (price.gardenIds.length === 0) return alert("Select at least one garden.");
    setIsSubmitting(true);
    try {
      await apiService.stg.setPrice(price);
      alert("Price Rate Card Set!");
      setPrice({ effectiveDate: "", pricePerKg: 0, gardenIds: [] });
    } catch(err: any) {
      dispatch(setError(err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (log.gardenIds.length === 0) return alert("Select at least one garden.");
    setIsSubmitting(true);
    try {
      await apiService.stg.addLog({
        ...log,
        date: log.date ? new Date(log.date).toISOString() : undefined,
      });
      alert("Bought Leaf Logged!");
      setLog({ supplierId: "", grossWeight: 0, deductionWeight: 0, qualityScore: 0, vehicleNo: "", date: "", gardenIds: [] });
    } catch(err: any) {
      dispatch(setError(err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  const MultiSelectGardens = ({ state, setter }: { state: any, setter: any }) => (
    <div className="mb-4 col-span-2">
      <label className="field-label block mb-2">Assign to Gardens (Multi-Select):</label>
      <div className="flex gap-2 flex-wrap p-2 border border-[var(--border)] rounded-[var(--radius-md)] bg-white">
      {gardenOptions.map(g => (
        <label key={g.gardenid} className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={state.gardenIds.includes(g.gardenid)}
            onChange={() => handleGardenToggle(setter, state, g.gardenid)}
          />
          <span className="text-sm">{g.name}</span>
        </label>
      ))}
      </div>
    </div>
  );

  return (
    <div className="page-container">
      <header className="page-header">
        <h1 className="page-title">Bought Leaf (STG) Module</h1>
        <p className="page-subtitle">Manage suppliers, pricing, and daily leaf deliveries.</p>
      </header>

      <div className="panel-tabs">
        <button className={`tab-button ${activeTab === 'supplier' ? 'active' : ''}`} onClick={() => setActiveTab('supplier')}>Suppliers</button>
        <button className={`tab-button ${activeTab === 'price' ? 'active' : ''}`} onClick={() => setActiveTab('price')}>Rate Cards</button>
        <button className={`tab-button ${activeTab === 'log' ? 'active' : ''}`} onClick={() => setActiveTab('log')}>Daily Logging</button>
        <button className={`tab-button ${activeTab === 'analytics' ? 'active' : ''}`} onClick={() => setActiveTab('analytics')}>Analytics</button>
      </div>

      <div className="panel mb-6">
        <div className="panel-body">
          {activeTab === "supplier" && (
            <div>
              <div className="panel-header mb-4">
                <h2 className="panel-title">Suppliers Directory</h2>
              </div>
              <div className="table-responsive mb-8">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Code</th>
                      <th>Name</th>
                      <th>Phone</th>
                      <th>Assigned Gardens</th>
                    </tr>
                  </thead>
                  <tbody>
                    {suppliers.length === 0 && <tr><td colSpan={4} className="text-center p-4 text-[var(--text-secondary)]">No suppliers found.</td></tr>}
                    {suppliers.map(s => (
                      <tr key={s.supplierCode}>
                        <td>{s.supplierCode}</td>
                        <td>{s.name}</td>
                        <td>{s.phone}</td>
                        <td>
                          {s.gardenIds.map(gid => {
                             const gname = gardenOptions.find(g => g.gardenid === gid)?.name || gid;
                             return <span key={gid} className="badge bg-gray-200 text-gray-800 px-2 py-1 rounded text-xs mr-1">{gname}</span>;
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="panel-header mb-4">
                <h2 className="panel-title">Add External Supplier</h2>
              </div>
              <form onSubmit={handleSupplierSubmit} className="grid grid-cols-2 gap-4">
                <div className="field-group">
                  <label className="field-label">Supplier Name</label>
                  <input type="text" className="field-input" value={supplier.name} onChange={(e) => setSupplier({...supplier, name: e.target.value})} required />
                </div>
                <div className="field-group">
                  <label className="field-label">Supplier Code (Unique)</label>
                  <input type="text" className="field-input" value={supplier.supplierCode} onChange={(e) => setSupplier({...supplier, supplierCode: e.target.value})} required />
                </div>
                <div className="field-group">
                  <label className="field-label">Phone</label>
                  <input type="text" className="field-input" value={supplier.phone} onChange={(e) => setSupplier({...supplier, phone: e.target.value})} required />
                </div>
                <div className="field-group">
                  <label className="field-label">Address</label>
                  <input type="text" className="field-input" value={supplier.address} onChange={(e) => setSupplier({...supplier, address: e.target.value})} required />
                </div>
                <MultiSelectGardens state={supplier} setter={setSupplier} />
                <div className="col-span-2 flex justify-end">
                  <button type="submit" className="primary-button" disabled={isSubmitting}>Save Supplier</button>
                </div>
              </form>
            </div>
          )}

          {activeTab === "price" && (
            <div>
              <div className="panel-header mb-4">
                <h2 className="panel-title">Set Bought Leaf Price (Rate Card)</h2>
              </div>
              <form onSubmit={handlePriceSubmit} className="grid grid-cols-2 gap-4">
                <div className="field-group">
                  <label className="field-label">Effective Date</label>
                  <input type="date" className="field-input" value={price.effectiveDate} onChange={(e) => setPrice({...price, effectiveDate: e.target.value})} required />
                </div>
                <div className="field-group">
                  <label className="field-label">Price Per Kg (₹)</label>
                  <input type="number" step="0.01" className="field-input" value={price.pricePerKg} onChange={(e) => setPrice({...price, pricePerKg: Number(e.target.value)})} required />
                </div>
                <MultiSelectGardens state={price} setter={setPrice} />
                <div className="col-span-2 flex justify-end">
                  <button type="submit" className="primary-button" disabled={isSubmitting}>Set Price</button>
                </div>
              </form>
            </div>
          )}

          {activeTab === "log" && (
            <div>
              <div className="panel-header mb-4">
                <h2 className="panel-title">Record Daily Delivery Log</h2>
              </div>
              <form onSubmit={handleLogSubmit} className="grid grid-cols-2 gap-4">
                <div className="field-group">
                  <label className="field-label">Supplier ID</label>
                  <input type="text" className="field-input" value={log.supplierId} onChange={(e) => setLog({...log, supplierId: e.target.value})} required />
                </div>
                <div className="field-group">
                  <label className="field-label">Date</label>
                  <input type="datetime-local" className="field-input" value={log.date} onChange={(e) => setLog({...log, date: e.target.value})} />
                </div>
                <div className="field-group">
                  <label className="field-label">Vehicle Number</label>
                  <input type="text" className="field-input" value={log.vehicleNo} onChange={(e) => setLog({...log, vehicleNo: e.target.value})} required />
                </div>
                <div className="field-group">
                  <label className="field-label">Gross Weight (Kg)</label>
                  <input type="number" className="field-input" value={log.grossWeight} onChange={(e) => setLog({...log, grossWeight: Number(e.target.value)})} required />
                </div>
                <div className="field-group">
                  <label className="field-label">Deduction Weight (Kg)</label>
                  <input type="number" className="field-input" value={log.deductionWeight} onChange={(e) => setLog({...log, deductionWeight: Number(e.target.value)})} required />
                </div>
                <div className="field-group">
                  <label className="field-label">Quality Score (1-10)</label>
                  <input type="number" step="0.1" className="field-input" value={log.qualityScore} onChange={(e) => setLog({...log, qualityScore: Number(e.target.value)})} required />
                </div>
                <MultiSelectGardens state={log} setter={setLog} />
                <div className="col-span-2 flex justify-end">
                  <button type="submit" className="primary-button" disabled={isSubmitting}>Record Log</button>
                </div>
              </form>
            </div>
          )}

          {activeTab === "analytics" && (
            <div>
              <div className="panel-header mb-4 flex justify-between items-center">
                <h2 className="panel-title">Analytics Dashboard</h2>
                <select className="field-input" style={{ width: '250px' }} value={selectedGardenId} onChange={(e) => setSelectedGardenId(e.target.value)}>
                  <option value="">Select Garden...</option>
                  {gardenOptions.map((g) => (<option key={g.gardenid} value={g.gardenid}>{g.name}</option>))}
                </select>
              </div>

              {!selectedGardenId && <p className="text-[var(--text-secondary)]">Select a garden to load analytics...</p>}

              {selectedGardenId && analyticsData && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="panel p-4 bg-[var(--surface-50)]">
                    <h3 className="text-sm text-[var(--text-secondary)] mb-2">Total Bought Weight</h3>
                    <div className="text-2xl font-bold">{analyticsData.totalBoughtWeight} Kg</div>
                  </div>
                  <div className="panel p-4 bg-[var(--surface-50)]">
                    <h3 className="text-sm text-[var(--text-secondary)] mb-2">Total Bought Cost</h3>
                    <div className="text-2xl font-bold text-[var(--danger)]">₹{analyticsData.totalBoughtCost}</div>
                  </div>
                  <div className="panel p-4 bg-[var(--surface-50)]">
                    <h3 className="text-sm text-[var(--text-secondary)] mb-2">Avg Cost Per Kg</h3>
                    <div className="text-2xl font-bold">₹{analyticsData.averageBoughtCostPerKg} / Kg</div>
                  </div>
                  <div className="panel p-4 bg-[var(--surface-50)]">
                    <h3 className="text-sm text-[var(--text-secondary)] mb-2">Overall Conversion Ratio</h3>
                    <div className="text-2xl font-bold text-[var(--primary)]">{analyticsData.factoryContext?.overallConversionRatio}</div>
                  </div>

                  <div className="panel col-span-2 p-4">
                    <h3 className="text-base mb-2">Supplier Leaderboard</h3>
                    <table className="table w-full text-left">
                      <thead>
                        <tr>
                          <th className="border-b-2 border-[var(--border)] p-2">Supplier Name</th>
                          <th className="border-b-2 border-[var(--border)] p-2">Total Supplied (Kg)</th>
                          <th className="border-b-2 border-[var(--border)] p-2">Avg Quality Score</th>
                        </tr>
                      </thead>
                      <tbody>
                        {analyticsData.supplierRanking?.map((r, i) => (
                          <tr key={i}>
                            <td className="p-2 border-b border-[var(--border)]">{r.name}</td>
                            <td className="p-2 border-b border-[var(--border)]">{r.totalSuppliedKg}</td>
                            <td className="p-2 border-b border-[var(--border)]">{r.averageQualityScore} / 10</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
