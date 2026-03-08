import React, { useState } from "react";
import { useAppDispatch } from "../store/hooks";
import { apiService } from "../services/apiService";
import { setError } from "../store/errorSlice";

export const AssetsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const [activeTab, setActiveTab] = useState("assets");

  const [asset, setAsset] = useState({ name: "", type: "", purchaseDate: "" });
  const [breakdown, setBreakdown] = useState({ assetId: "", date: "", description: "" });
  const [resolve, setResolve] = useState({ breakdownId: "", cost: "", resolutionDate: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAssetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await apiService.assets.add({ name: asset.name, type: asset.type, purchaseDate: asset.purchaseDate });
      alert("Asset added successfully");
      setAsset({ name: "", type: "", purchaseDate: "" });
    } catch(err: any) {
      dispatch(setError(err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBreakdownSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await apiService.assets.addBreakdown({ assetId: breakdown.assetId, date: breakdown.date, description: breakdown.description });
      alert("Breakdown logged successfully");
      setBreakdown({ assetId: "", date: "", description: "" });
    } catch(err: any) {
      dispatch(setError(err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResolveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await apiService.assets.resolveBreakdown({
        breakdownId: resolve.breakdownId,
        cost: Number(resolve.cost),
        resolutionDate: resolve.resolutionDate
      });
      alert("Breakdown resolved successfully");
      setResolve({ breakdownId: "", cost: "", resolutionDate: "" });
    } catch(err: any) {
      dispatch(setError(err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Assets & Machinery</h1>
      </div>

      <div className="tabs" style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button className={`tab-btn ${activeTab === "assets" ? "active" : ""}`} onClick={() => setActiveTab("assets")}>Add Asset</button>
        <button className={`tab-btn ${activeTab === "breakdowns" ? "active" : ""}`} onClick={() => setActiveTab("breakdowns")}>Log Breakdown</button>
        <button className={`tab-btn ${activeTab === "resolutions" ? "active" : ""}`} onClick={() => setActiveTab("resolutions")}>Resolve Breakdown</button>
      </div>

      <div className="card">
        {activeTab === "assets" && (
          <div>
            <h3>Add New Asset / Machine</h3>
            <form onSubmit={handleAssetSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <input type="text" placeholder="Asset Name" className="form-input" value={asset.name} onChange={(e) => setAsset({...asset, name: e.target.value})} required />
              <input type="text" placeholder="Asset Type (e.g. Tractor, Dryer)" className="form-input" value={asset.type} onChange={(e) => setAsset({...asset, type: e.target.value})} required />
              <input type="date" className="form-input" value={asset.purchaseDate} onChange={(e) => setAsset({...asset, purchaseDate: e.target.value})} required />
              <button type="submit" className="button button-primary" disabled={isSubmitting}>Save Asset</button>
            </form>
          </div>
        )}

        {activeTab === "breakdowns" && (
          <div>
            <h3>Log a Breakdown</h3>
            <form onSubmit={handleBreakdownSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <input type="text" placeholder="Asset ID" className="form-input" value={breakdown.assetId} onChange={(e) => setBreakdown({...breakdown, assetId: e.target.value})} required />
              <input type="text" placeholder="Description of problem" className="form-input" value={breakdown.description} onChange={(e) => setBreakdown({...breakdown, description: e.target.value})} required />
              <input type="date" className="form-input" value={breakdown.date} onChange={(e) => setBreakdown({...breakdown, date: e.target.value})} required />
              <button type="submit" className="button button-primary" disabled={isSubmitting}>Log Breakdown</button>
            </form>
          </div>
        )}

        {activeTab === "resolutions" && (
          <div>
            <h3>Resolve a Breakdown</h3>
            <form onSubmit={handleResolveSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <input type="text" placeholder="Breakdown ID" className="form-input" value={resolve.breakdownId} onChange={(e) => setResolve({...resolve, breakdownId: e.target.value})} required />
              <input type="number" placeholder="Repair Cost" className="form-input" value={resolve.cost} onChange={(e) => setResolve({...resolve, cost: e.target.value})} required />
              <input type="date" className="form-input" value={resolve.resolutionDate} onChange={(e) => setResolve({...resolve, resolutionDate: e.target.value})} required />
              <button type="submit" className="button button-primary" disabled={isSubmitting}>Resolve</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
