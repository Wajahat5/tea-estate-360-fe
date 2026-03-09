import { useState } from "react";
import { apiService } from "../services/apiService";
import { useOwnedGardens } from "../hooks/useOwnedGardens";

export const InventoryPage = () => {
  const gardens = useOwnedGardens();
  const [itemForm, setItemForm] = useState({ gardenId: "", name: "", category: "", unit: "", costPerUnit: "" });
  const [usageForm, setUsageForm] = useState({ materialId: "", sectionId: "", quantityUsed: "" });

  const handleItemSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiService.inventory.createItem(itemForm);
      alert("Item Created");
    } catch (err) {
      alert("Error creating item");
    }
  };

  const handleUsageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiService.inventory.recordUsage(usageForm);
      alert("Usage Logged");
    } catch (err) {
      alert("Error logging usage");
    }
  };

  return (
    <div className="page-container">
      <header className="page-header">
        <h1 className="page-title">Inventory & Operations</h1>
        <p className="page-subtitle">Track items, modern material usage, nursery batches, and weather.</p>
      </header>

      <div className="panel mb-6">
        <div className="panel-header">
          <h2 className="panel-title">Add Material / Item</h2>
        </div>
        <form onSubmit={handleItemSubmit} className="p-4 border-b bg-gray-50 grid grid-cols-2 gap-4">
          <select className="field-input" value={itemForm.gardenId} onChange={e => setItemForm({...itemForm, gardenId: e.target.value})} required>
            <option value="">Select Garden</option>
            {gardens.map(g => <option key={g.gardenid} value={g.gardenid}>{g.name}</option>)}
          </select>
          <input className="field-input" placeholder="Item Name" required value={itemForm.name} onChange={e => setItemForm({...itemForm, name: e.target.value})} />
          <input className="field-input" placeholder="Category" required value={itemForm.category} onChange={e => setItemForm({...itemForm, category: e.target.value})} />
          <input className="field-input" placeholder="Unit (e.g. Kg, Liters)" required value={itemForm.unit} onChange={e => setItemForm({...itemForm, unit: e.target.value})} />
          <input className="field-input" type="number" placeholder="Cost Per Unit" required value={itemForm.costPerUnit} onChange={e => setItemForm({...itemForm, costPerUnit: e.target.value})} />
          <div className="col-span-2 flex justify-end">
            <button type="submit" className="primary-button">Add Item</button>
          </div>
        </form>
      </div>

      <div className="panel mb-6">
        <div className="panel-header">
          <h2 className="panel-title">Record Material Usage</h2>
        </div>
        <form onSubmit={handleUsageSubmit} className="p-4 border-b bg-gray-50 grid grid-cols-2 gap-4">
          <input className="field-input" placeholder="Material ID" required value={usageForm.materialId} onChange={e => setUsageForm({...usageForm, materialId: e.target.value})} />
          <input className="field-input" placeholder="Section ID (Optional)" value={usageForm.sectionId} onChange={e => setUsageForm({...usageForm, sectionId: e.target.value})} />
          <input className="field-input" type="number" placeholder="Quantity Used" required value={usageForm.quantityUsed} onChange={e => setUsageForm({...usageForm, quantityUsed: e.target.value})} />
          <div className="col-span-2 flex justify-end">
            <button type="submit" className="primary-button">Log Usage</button>
          </div>
        </form>
      </div>
    </div>
  );
};
