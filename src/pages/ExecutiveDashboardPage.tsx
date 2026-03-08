import React, { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { apiService } from "../services/apiService";
import { setError } from "../store/errorSlice";

export const ExecutiveDashboardPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const [selectedGardenId, setSelectedGardenId] = useState("");
  const [executiveData, setExecutiveData] = useState<any>(null);
  const [yieldIntelligence, setYieldIntelligence] = useState<any>(null);
  const [costPerKgData, setCostPerKgData] = useState<any>(null);

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

  useEffect(() => {
    if (selectedGardenId) {
      const fetchData = async () => {
        try {
          const [execRes, yieldRes, costRes] = await Promise.all([
            (apiService.dashboard as any).executive(selectedGardenId),
            apiService.analytics.teaYieldIntelligence(selectedGardenId),
            apiService.reports.costPerKg(selectedGardenId)
          ]);
          setExecutiveData(execRes);
          setYieldIntelligence(yieldRes);
          setCostPerKgData(costRes);
        } catch (error: any) {
          dispatch(setError(error.message));
        }
      };
      fetchData();
    } else {
      setExecutiveData(null);
      setYieldIntelligence(null);
      setCostPerKgData(null);
    }
  }, [selectedGardenId, dispatch]);

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Executive Dashboard</h1>
        <div className="header-actions">
          <select
            className="form-input"
            value={selectedGardenId}
            onChange={(e) => setSelectedGardenId(e.target.value)}
          >
            <option value="">Select Garden</option>
            {gardenOptions.map((g) => (
              <option key={g.gardenid} value={g.gardenid}>
                {g.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {!selectedGardenId && (
        <div className="card">
          <p>Please select a garden to view the executive dashboard.</p>
        </div>
      )}

      {selectedGardenId && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <div className="card">
            <h3>Executive Summary</h3>
            <pre style={{ background: "#f4f4f4", padding: "10px", borderRadius: "5px" }}>
              {JSON.stringify(executiveData, null, 2)}
            </pre>
          </div>

          <div className="card">
            <h3>Tea Yield Intelligence</h3>
            <pre style={{ background: "#f4f4f4", padding: "10px", borderRadius: "5px" }}>
              {JSON.stringify(yieldIntelligence, null, 2)}
            </pre>
          </div>

          <div className="card" style={{ gridColumn: "span 2" }}>
            <h3>Cost Per Kg Report</h3>
            <pre style={{ background: "#f4f4f4", padding: "10px", borderRadius: "5px" }}>
              {JSON.stringify(costPerKgData, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
