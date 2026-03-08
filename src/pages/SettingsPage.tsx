import { useState } from "react";

export const SettingsPage = () => {
  return (
    <div className="page-container">
      <header className="page-header">
        <h1 className="page-title">Admin Settings</h1>
        <p className="page-subtitle">Configure organization parameters and holidays.</p>
      </header>

      <div className="panel mb-6">
        <div className="panel-header">
          <h2 className="panel-title">Government Wages</h2>
          <button className="button button-primary">Update Wages</button>
        </div>
        <div className="panel-body">
          <p className="text-gray-500 mb-4">Set the baseline wage criteria per year.</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="field-label">Daily Wage</label>
              <input type="number" className="field-input" placeholder="0.00" disabled />
            </div>
            <div>
              <label className="field-label">Extra Wage (Kg)</label>
              <input type="number" className="field-input" placeholder="0.00" disabled />
            </div>
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">
          <h2 className="panel-title">Holidays</h2>
          <button className="button button-primary">Add Holiday</button>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Description</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={3} className="text-center py-8 text-gray-500">
                No holidays configured.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
