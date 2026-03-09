import React, { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { apiService } from "../services/apiService";
import { setError } from "../store/errorSlice";
import type { BoughtLeafSupplier, BoughtLeafPrice, BoughtLeafLog, BoughtLeafAnalytics } from "../types/api";

export const BoughtLeafPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const companies = useAppSelector((state) => state.companies.items);

  const gardens = user?.gardens && user.gardens.length > 0
    ? user.gardens.map(g => ({ gardenid: g.gardenid, name: (g as any).name || g.gardenid }))
    : companies
      .filter((company) => company.ownerid === user?.userid)
      .flatMap((company) => company.gardens);

  const uniqueGardens = new Map<string, { gardenid: string; name: string }>();
  gardens.forEach((garden) => {
      uniqueGardens.set(garden.gardenid, {
        gardenid: garden.gardenid,
        name: garden.name
      });
  });
  const gardenOptions = Array.from(uniqueGardens.values());

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
    <div style={{ marginBottom: "1rem" }}>
      <label className="field-label">Assign to Gardens (Multi-Select):</label>
      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", padding: "10px", border: "1px solid var(--border)", borderRadius: "var(--radius-md)" }}>
      {gardenOptions.map(g => (
        <label key={g.gardenid} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={state.gardenIds.includes(g.gardenid)}
            onChange={() => handleGardenToggle(setter, state, g.gardenid)}
          />
          {g.name}
        </label>
      ))}
      </div>
    </div>
  );

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Bought Leaf (STG) Module</h1>
      </div>

      <div className="panel-header" style={{ borderBottom: 'none', paddingBottom: 0 }}>
        <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border)', width: '100%' }}>
          <button className={`tab-btn ${activeTab === "supplier" ? "active" : ""}`} onClick={() => setActiveTab("supplier")}>Suppliers</button>
          <button className={`tab-btn ${activeTab === "price" ? "active" : ""}`} onClick={() => setActiveTab("price")}>Rate Cards</button>
          <button className={`tab-btn ${activeTab === "log" ? "active" : ""}`} onClick={() => setActiveTab("log")}>Daily Logging</button>
          <button className={`tab-btn ${activeTab === "analytics" ? "active" : ""}`} onClick={() => setActiveTab("analytics")}>Analytics</button>
        </div>
      </div>

      <div className="panel" style={{ marginTop: '1rem' }}>
        <div className="panel-body">
          {activeTab === "supplier" && (
            <div>
              <h2 className="panel-title" style={{marginBottom: '1rem'}}>Suppliers Directory</h2>

              <div className="table-responsive" style={{ marginBottom: '2rem' }}>
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
                    {suppliers.length === 0 && <tr><td colSpan={4} style={{textAlign: 'center'}}>No suppliers found.</td></tr>}
                    {suppliers.map((s, idx) => (
                      <tr key={idx}>
                        <td>{s.supplierCode}</td>
                        <td>{s.name}</td>
                        <td>{s.phone}</td>
                        <td>
                          {s.gardenIds.map(gid => {
                             const gname = gardenOptions.find(g => g.gardenid === gid)?.name || gid;
                             return <span key={gid} className="badge" style={{marginRight: '4px', background: '#e0e0e0', color: '#333', padding: '2px 6px', borderRadius: '4px', fontSize: '12px'}}>{gname}</span>;
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <h2 className="panel-title" style={{marginBottom: '1rem'}}>Add External Supplier</h2>
              <form onSubmit={handleSupplierSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
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
                </div>
                <MultiSelectGardens state={supplier} setter={setSupplier} />
                <button type="submit" className="button button-primary" disabled={isSubmitting}>Save Supplier</button>
              </form>
            </div>
          )}

          {activeTab === "price" && (
            <div>
              <h2 className="panel-title" style={{marginBottom: '1rem'}}>Set Bought Leaf Price (Rate Card)</h2>
              <form onSubmit={handlePriceSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div className="field-group">
                    <label className="field-label">Effective Date</label>
                    <input type="date" className="field-input" value={price.effectiveDate} onChange={(e) => setPrice({...price, effectiveDate: e.target.value})} required />
                  </div>
                  <div className="field-group">
                    <label className="field-label">Price Per Kg (₹)</label>
                    <input type="number" step="0.01" className="field-input" value={price.pricePerKg} onChange={(e) => setPrice({...price, pricePerKg: Number(e.target.value)})} required />
                  </div>
                </div>
                <MultiSelectGardens state={price} setter={setPrice} />
                <button type="submit" className="button button-primary" disabled={isSubmitting}>Set Price</button>
              </form>
            </div>
          )}

          {activeTab === "log" && (
            <div>
              <h2 className="panel-title" style={{marginBottom: '1rem'}}>Record Daily Delivery Log</h2>
              <form onSubmit={handleLogSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
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
                </div>
                <MultiSelectGardens state={log} setter={setLog} />
                <button type="submit" className="button button-primary" disabled={isSubmitting}>Record Log</button>
              </form>
            </div>
          )}

          {activeTab === "analytics" && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2 className="panel-title">Analytics Dashboard</h2>
                <select className="field-input" style={{ width: '250px' }} value={selectedGardenId} onChange={(e) => setSelectedGardenId(e.target.value)}>
                  <option value="">Select Garden...</option>
                  {gardenOptions.map((g) => (<option key={g.gardenid} value={g.gardenid}>{g.name}</option>))}
                </select>
              </div>

              {!selectedGardenId && <p style={{color: 'var(--text-secondary)'}}>Select a garden to load analytics...</p>}

              {selectedGardenId && analyticsData && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="card" style={{ padding: '1rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', background: 'var(--surface-50)' }}>
                    <h3 style={{ margin: '0 0 10px 0', fontSize: '14px', color: 'var(--text-secondary)' }}>Total Bought Weight</h3>
                    <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{analyticsData.totalBoughtWeight} Kg</div>
                  </div>
                  <div className="card" style={{ padding: '1rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', background: 'var(--surface-50)' }}>
                    <h3 style={{ margin: '0 0 10px 0', fontSize: '14px', color: 'var(--text-secondary)' }}>Total Bought Cost</h3>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--danger)' }}>₹{analyticsData.totalBoughtCost}</div>
                  </div>
                  <div className="card" style={{ padding: '1rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', background: 'var(--surface-50)' }}>
                    <h3 style={{ margin: '0 0 10px 0', fontSize: '14px', color: 'var(--text-secondary)' }}>Avg Cost Per Kg</h3>
                    <div style={{ fontSize: '24px', fontWeight: 'bold' }}>₹{analyticsData.averageBoughtCostPerKg} / Kg</div>
                  </div>
                  <div className="card" style={{ padding: '1rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', background: 'var(--surface-50)' }}>
                    <h3 style={{ margin: '0 0 10px 0', fontSize: '14px', color: 'var(--text-secondary)' }}>Overall Conversion Ratio</h3>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--primary)' }}>{analyticsData.factoryContext?.overallConversionRatio}</div>
                  </div>

                  <div className="card" style={{ gridColumn: 'span 2', padding: '1rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
                    <h3 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>Supplier Leaderboard</h3>
                    <table className="table" style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr>
                          <th style={{ borderBottom: '2px solid var(--border)', padding: '8px' }}>Supplier Name</th>
                          <th style={{ borderBottom: '2px solid var(--border)', padding: '8px' }}>Total Supplied (Kg)</th>
                          <th style={{ borderBottom: '2px solid var(--border)', padding: '8px' }}>Avg Quality Score</th>
                        </tr>
                      </thead>
                      <tbody>
                        {analyticsData.supplierRanking?.map((r, i) => (
                          <tr key={i}>
                            <td style={{ padding: '8px', borderBottom: '1px solid var(--border)' }}>{r.name}</td>
                            <td style={{ padding: '8px', borderBottom: '1px solid var(--border)' }}>{r.totalSuppliedKg}</td>
                            <td style={{ padding: '8px', borderBottom: '1px solid var(--border)' }}>{r.averageQualityScore} / 10</td>
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
