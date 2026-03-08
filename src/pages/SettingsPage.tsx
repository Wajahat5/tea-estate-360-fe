import React, { useState } from "react";
import { apiService } from "../services/apiService";
import { useAppDispatch } from "../store/hooks";
import { setError } from "../store/errorSlice";

export const SettingsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const [govtWage, setGovtWage] = useState({ year: new Date().getFullYear(), dailyWage: "", extraWageKg: "", extraWageHr: "" });
  const [holiday, setHoliday] = useState({ date: "", description: "" });
  const [isSubmittingWage, setIsSubmittingWage] = useState(false);
  const [isSubmittingHoliday, setIsSubmittingHoliday] = useState(false);

  const handleWageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingWage(true);
    try {
      await apiService.admin.setGovtWage({
        year: Number(govtWage.year),
        dailyWage: Number(govtWage.dailyWage),
        extraWageKg: Number(govtWage.extraWageKg),
        extraWageHr: Number(govtWage.extraWageHr)
      });
      alert("Govt Wages updated successfully!");
    } catch (error: any) {
      dispatch(setError(error.message));
    } finally {
      setIsSubmittingWage(false);
    }
  };

  const handleHolidaySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingHoliday(true);
    try {
      await apiService.admin.addHoliday({
        date: holiday.date,
        description: holiday.description
      });
      alert("Holiday added successfully!");
      setHoliday({ date: "", description: "" });
    } catch (error: any) {
      dispatch(setError(error.message));
    } finally {
      setIsSubmittingHoliday(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Admin Settings</h1>
      </div>

      <div className="card" style={{ marginBottom: "2rem" }}>
        <h3>Govt Wages</h3>
        <form onSubmit={handleWageSubmit} style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginTop: "1rem" }}>
          <div>
            <label className="form-label">Year</label>
            <input type="number" className="form-input" value={govtWage.year} onChange={(e) => setGovtWage({ ...govtWage, year: Number(e.target.value) })} required />
          </div>
          <div>
            <label className="form-label">Daily Wage (₹)</label>
            <input type="number" step="0.01" className="form-input" value={govtWage.dailyWage} onChange={(e) => setGovtWage({ ...govtWage, dailyWage: e.target.value })} required />
          </div>
          <div>
            <label className="form-label">Extra Wage / Kg (₹)</label>
            <input type="number" step="0.01" className="form-input" value={govtWage.extraWageKg} onChange={(e) => setGovtWage({ ...govtWage, extraWageKg: e.target.value })} required />
          </div>
          <div>
            <label className="form-label">Extra Wage / Hr (₹)</label>
            <input type="number" step="0.01" className="form-input" value={govtWage.extraWageHr} onChange={(e) => setGovtWage({ ...govtWage, extraWageHr: e.target.value })} required />
          </div>
          <div style={{ display: "flex", alignItems: "flex-end" }}>
            <button type="submit" className="button button-primary" disabled={isSubmittingWage}>
              {isSubmittingWage ? "Saving..." : "Save Wages"}
            </button>
          </div>
        </form>
      </div>

      <div className="card">
        <h3>Holidays</h3>
        <form onSubmit={handleHolidaySubmit} style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginTop: "1rem" }}>
          <div>
            <label className="form-label">Date</label>
            <input type="date" className="form-input" value={holiday.date} onChange={(e) => setHoliday({ ...holiday, date: e.target.value })} required />
          </div>
          <div style={{ flex: 1, minWidth: "200px" }}>
            <label className="form-label">Description</label>
            <input type="text" className="form-input" value={holiday.description} onChange={(e) => setHoliday({ ...holiday, description: e.target.value })} required />
          </div>
          <div style={{ display: "flex", alignItems: "flex-end" }}>
            <button type="submit" className="button button-primary" disabled={isSubmittingHoliday}>
              {isSubmittingHoliday ? "Adding..." : "Add Holiday"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
