import { useState } from "react";
import { apiService } from "../services/apiService";

export const SettingsPage = () => {
  const [wageForm, setWageForm] = useState({ year: new Date().getFullYear(), dailyWage: "", extraWageKg: "", extraWageHr: "" });
  const [holidayForm, setHolidayForm] = useState({ date: "", description: "" });

  const handleWageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiService.admin.setGovtWage(wageForm);
      alert("Wages Updated");
    } catch (err) {
      alert("Error updating wages");
    }
  };

  const handleHolidaySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiService.admin.addHoliday(holidayForm);
      alert("Holiday Added");
    } catch (err) {
      alert("Error adding holiday");
    }
  };

  return (
    <div className="page-container">
      <header className="page-header">
        <h1 className="page-title">Admin Settings</h1>
        <p className="page-subtitle">Configure organization parameters and holidays.</p>
      </header>

      <div className="panel mb-6">
        <div className="panel-header">
          <h2 className="panel-title">Government Wages</h2>
        </div>
        <form onSubmit={handleWageSubmit} className="p-4 border-b bg-gray-50 grid grid-cols-2 gap-4">
          <input className="field-input" type="number" placeholder="Year" required value={wageForm.year} onChange={e => setWageForm({...wageForm, year: Number(e.target.value)})} />
          <input className="field-input" type="number" placeholder="Daily Wage (₹)" required value={wageForm.dailyWage} onChange={e => setWageForm({...wageForm, dailyWage: e.target.value})} />
          <input className="field-input" type="number" placeholder="Extra Wage / Kg (₹)" required value={wageForm.extraWageKg} onChange={e => setWageForm({...wageForm, extraWageKg: e.target.value})} />
          <input className="field-input" type="number" placeholder="Extra Wage / Hr (₹)" required value={wageForm.extraWageHr} onChange={e => setWageForm({...wageForm, extraWageHr: e.target.value})} />
          <div className="col-span-2 flex justify-end">
            <button type="submit" className="primary-button">Update Wages</button>
          </div>
        </form>
      </div>

      <div className="panel mb-6">
        <div className="panel-header">
          <h2 className="panel-title">Add Holiday</h2>
        </div>
        <form onSubmit={handleHolidaySubmit} className="p-4 border-b bg-gray-50 grid grid-cols-2 gap-4">
          <input className="field-input" type="date" required value={holidayForm.date} onChange={e => setHolidayForm({...holidayForm, date: e.target.value})} />
          <input className="field-input" placeholder="Description" required value={holidayForm.description} onChange={e => setHolidayForm({...holidayForm, description: e.target.value})} />
          <div className="col-span-2 flex justify-end">
            <button type="submit" className="primary-button">Add Holiday</button>
          </div>
        </form>
      </div>
    </div>
  );
};
