import React, { useState } from "react";
import { useAppDispatch } from "../store/hooks";
import { apiService } from "../services/apiService";
import { setError } from "../store/errorSlice";

export const InventoryPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const [activeTab, setActiveTab] = useState("items");

  const [item, setItem] = useState({ name: "", category: "", unit: "" });
  const [vendor, setVendor] = useState({ name: "", contact: "" });
  const [issue, setIssue] = useState({ itemId: "", sectionId: "", quantity: "", date: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleItemSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await apiService.inventory.addItem({ name: item.name, category: item.category, unit: item.unit });
      alert("Item added successfully");
      setItem({ name: "", category: "", unit: "" });
    } catch(err: any) {
      dispatch(setError(err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVendorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await apiService.inventory.addVendor({ name: vendor.name, contact: vendor.contact });
      alert("Vendor added successfully");
      setVendor({ name: "", contact: "" });
    } catch(err: any) {
      dispatch(setError(err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleIssueSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await apiService.inventory.issue({
        itemId: issue.itemId,
        sectionId: issue.sectionId,
        quantity: Number(issue.quantity),
        date: issue.date
      });
      alert("Item issued successfully");
      setIssue({ itemId: "", sectionId: "", quantity: "", date: "" });
    } catch(err: any) {
      dispatch(setError(err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Inventory Management</h1>
      </div>

      <div className="tabs" style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button className={`tab-btn ${activeTab === "items" ? "active" : ""}`} onClick={() => setActiveTab("items")}>Items</button>
        <button className={`tab-btn ${activeTab === "vendors" ? "active" : ""}`} onClick={() => setActiveTab("vendors")}>Vendors</button>
        <button className={`tab-btn ${activeTab === "issues" ? "active" : ""}`} onClick={() => setActiveTab("issues")}>Issues</button>
      </div>

      <div className="card">
        {activeTab === "items" && (
          <div>
            <h3>Add Inventory Item</h3>
            <form onSubmit={handleItemSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <input type="text" placeholder="Item Name" className="form-input" value={item.name} onChange={(e) => setItem({...item, name: e.target.value})} required />
              <input type="text" placeholder="Category" className="form-input" value={item.category} onChange={(e) => setItem({...item, category: e.target.value})} required />
              <input type="text" placeholder="Unit (e.g. Kg, Liters)" className="form-input" value={item.unit} onChange={(e) => setItem({...item, unit: e.target.value})} required />
              <button type="submit" className="button button-primary" disabled={isSubmitting}>Save Item</button>
            </form>
          </div>
        )}

        {activeTab === "vendors" && (
          <div>
            <h3>Add Vendor</h3>
            <form onSubmit={handleVendorSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <input type="text" placeholder="Vendor Name" className="form-input" value={vendor.name} onChange={(e) => setVendor({...vendor, name: e.target.value})} required />
              <input type="text" placeholder="Contact Info" className="form-input" value={vendor.contact} onChange={(e) => setVendor({...vendor, contact: e.target.value})} required />
              <button type="submit" className="button button-primary" disabled={isSubmitting}>Save Vendor</button>
            </form>
          </div>
        )}

        {activeTab === "issues" && (
          <div>
            <h3>Issue Item to Section</h3>
            <form onSubmit={handleIssueSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <input type="text" placeholder="Item ID" className="form-input" value={issue.itemId} onChange={(e) => setIssue({...issue, itemId: e.target.value})} required />
              <input type="text" placeholder="Section ID" className="form-input" value={issue.sectionId} onChange={(e) => setIssue({...issue, sectionId: e.target.value})} required />
              <input type="number" placeholder="Quantity" className="form-input" value={issue.quantity} onChange={(e) => setIssue({...issue, quantity: e.target.value})} required />
              <input type="date" className="form-input" value={issue.date} onChange={(e) => setIssue({...issue, date: e.target.value})} required />
              <button type="submit" className="button button-primary" disabled={isSubmitting}>Issue Item</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
