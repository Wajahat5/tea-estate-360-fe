import { useState } from "react";

export const AssetsPage = () => {
  return (
    <div className="page-container">
      <header className="page-header">
        <h1 className="page-title">Assets & Machinery</h1>
        <p className="page-subtitle">Track machines, vehicles, and breakdown maintenance.</p>
      </header>

      <div className="panel">
        <div className="panel-header flex justify-between items-center">
          <h2 className="panel-title">Asset Tracker</h2>
          <div className="flex space-x-2">
            <button className="button button-secondary">Log Breakdown</button>
            <button className="button button-primary">Add Asset</button>
          </div>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>Asset Name</th>
              <th>Category</th>
              <th>Status</th>
              <th>Last Maintenance</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={4} className="text-center py-8 text-gray-500">
                No assets found.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
