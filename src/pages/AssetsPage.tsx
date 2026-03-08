import { useState } from "react";
import { apiService } from "../services/apiService";
import { useOwnedGardens } from "../hooks/useOwnedGardens";

export const AssetsPage = () => {
  const gardens = useOwnedGardens();
  const [assetForm, setAssetForm] = useState({ gardenId: "", name: "", equipmentType: "" });
  const [maintenanceForm, setMaintenanceForm] = useState({ equipmentId: "", maintenanceType: "", cost: "", maintenanceDate: "" });

  const handleAssetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiService.assets.createEquipment(assetForm);
      alert("Asset Created");
    } catch (err) {
      alert("Error creating asset");
    }
  };

  const handleMaintenanceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiService.assets.recordMaintenance(maintenanceForm);
      alert("Maintenance Logged");
    } catch (err) {
      alert("Error logging maintenance");
    }
  };

  return (
    <div className="page-container">
      <header className="page-header">
        <h1 className="page-title">Assets & Machinery</h1>
        <p className="page-subtitle">Track machines, vehicles, and breakdown maintenance.</p>
      </header>

      <div className="panel mb-6">
        <div className="panel-header">
          <h2 className="panel-title">Add Asset</h2>
        </div>
        <form onSubmit={handleAssetSubmit} className="p-4 border-b bg-gray-50 grid grid-cols-2 gap-4">
          <select className="field-input" value={assetForm.gardenId} onChange={e => setAssetForm({...assetForm, gardenId: e.target.value})} required>
            <option value="">Select Garden</option>
            {gardens.map(g => <option key={g.gardenid} value={g.gardenid}>{g.name}</option>)}
          </select>
          <input className="field-input" placeholder="Asset Name" required value={assetForm.name} onChange={e => setAssetForm({...assetForm, name: e.target.value})} />
          <input className="field-input" placeholder="Equipment Type" required value={assetForm.equipmentType} onChange={e => setAssetForm({...assetForm, equipmentType: e.target.value})} />
          <div className="col-span-2 flex justify-end">
            <button type="submit" className="primary-button">Add Asset</button>
          </div>
        </form>
      </div>

      <div className="panel mb-6">
        <div className="panel-header">
          <h2 className="panel-title">Log Maintenance</h2>
        </div>
        <form onSubmit={handleMaintenanceSubmit} className="p-4 border-b bg-gray-50 grid grid-cols-2 gap-4">
          <input className="field-input" placeholder="Equipment ID" required value={maintenanceForm.equipmentId} onChange={e => setMaintenanceForm({...maintenanceForm, equipmentId: e.target.value})} />
          <input className="field-input" placeholder="Maintenance Type" required value={maintenanceForm.maintenanceType} onChange={e => setMaintenanceForm({...maintenanceForm, maintenanceType: e.target.value})} />
          <input className="field-input" type="number" placeholder="Cost (₹)" required value={maintenanceForm.cost} onChange={e => setMaintenanceForm({...maintenanceForm, cost: e.target.value})} />
          <input className="field-input" type="date" required value={maintenanceForm.maintenanceDate} onChange={e => setMaintenanceForm({...maintenanceForm, maintenanceDate: e.target.value})} />
          <div className="col-span-2 flex justify-end">
            <button type="submit" className="primary-button">Log Maintenance</button>
          </div>
        </form>
      </div>
    </div>
  );
};
