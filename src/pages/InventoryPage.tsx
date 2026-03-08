import { useState } from "react";

export const InventoryPage = () => {
  return (
    <div className="page-container">
      <header className="page-header">
        <h1 className="page-title">Inventory & Stock</h1>
        <p className="page-subtitle">Track vendors, items, and purchase orders.</p>
      </header>

      <div className="panel">
        <div className="panel-header flex justify-between items-center">
          <h2 className="panel-title">Items</h2>
          <div className="flex space-x-2">
            <button className="button button-secondary">Vendors</button>
            <button className="button button-primary">Add Item</button>
          </div>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>Item Name</th>
              <th>SKU</th>
              <th>Quantity</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={5} className="text-center py-8 text-gray-500">
                Inventory is empty.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
