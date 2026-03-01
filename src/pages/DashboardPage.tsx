import { useEffect, useState } from "react";
import { apiService } from "../services/apiService";
import type { DashboardSummaryResponse } from "../types/api";

export const DashboardPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<DashboardSummaryResponse["data"] | null>(null);

  useEffect(() => {
    const loadSummary = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiService.dashboard.summary();
        if (response.success) {
          setSummary(response.data);
        } else {
          setError(response.message || "Failed to load dashboard summary");
        }
      } catch (fetchError) {
        setError((fetchError as Error).message || "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };
    loadSummary();
  }, []);

  if (loading) {
    return <div style={{ padding: "20px" }}>Loading dashboard...</div>;
  }

  if (error) {
    return <div className="field-error" style={{ padding: "20px" }}>{error}</div>;
  }

  if (!summary) {
    return null;
  }

  return (
    <div>
      <h1 className="page-title">Dashboard</h1>

      <div className="grid-cards">
        <div className="stat-card">
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "20px" }}>👥</span>
            <span className="stat-card-label">Labourers</span>
          </div>
          <span className="stat-card-value">{summary.totalLabourers.toLocaleString()}</span>
          {/* Visual placeholder for chart/graph as per design image */}
          <div style={{ height: "40px", background: "linear-gradient(90deg, #ecfdf3 0%, #dcfce7 100%)", borderRadius: "8px", marginTop: "12px", width: "60%" }}></div>
        </div>

        <div className="stat-card">
           <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "20px" }}>👤</span>
            <span className="stat-card-label">Employees</span>
          </div>
          <span className="stat-card-value">{summary.totalEmployees.toLocaleString()}</span>
           <div style={{ display: "flex", alignItems: "end", gap: "4px", height: "40px", marginTop: "12px", justifyContent: "flex-end" }}>
              <div style={{ width: "8px", height: "10%", background: "#15803d", borderRadius: "2px", opacity: 0.6 }}></div>
              <div style={{ width: "8px", height: "30%", background: "#15803d", borderRadius: "2px", opacity: 0.7 }}></div>
              <div style={{ width: "8px", height: "50%", background: "#15803d", borderRadius: "2px", opacity: 0.8 }}></div>
              <div style={{ width: "8px", height: "70%", background: "#15803d", borderRadius: "2px", opacity: 0.9 }}></div>
              <div style={{ width: "8px", height: "90%", background: "#15803d", borderRadius: "2px" }}></div>
           </div>
        </div>

        <div className="stat-card">
           <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "20px" }}>📋</span>
            <span className="stat-card-label">Review Requests</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "8px" }}>
            <span className="stat-card-value" style={{ fontSize: "24px" }}>{summary.totalReviewRequests}</span>
          </div>
        </div>

        <div className="stat-card">
           <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "20px" }}>👛</span>
            <span className="stat-card-label">Unpaid Expenses</span>
          </div>
           <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "8px" }}>
             <span className="stat-card-value" style={{ fontSize: "24px" }}>{summary.totalUnpaidExpenses}</span>
           </div>
        </div>

        <div className="stat-card">
          <span className="stat-card-label">Not Started Tasks</span>
          <span className="stat-card-value" style={{ fontSize: "24px", marginTop: "8px", display: "block" }}>{summary.totalNotStartedTasks}</span>
           <div style={{ height: "6px", background: "#e5e7eb", borderRadius: "3px", marginTop: "16px", overflow: "hidden" }}>
             <div style={{ height: "100%", width: "20%", background: "#9ca3af" }}></div>
           </div>
        </div>

        <div className="stat-card">
          <span className="stat-card-label">In Progress Tasks</span>
          <span className="stat-card-value" style={{ fontSize: "24px", marginTop: "8px", display: "block" }}>{summary.totalInProgressTasks}</span>
          <div style={{ height: "6px", background: "#e5e7eb", borderRadius: "3px", marginTop: "16px", overflow: "hidden" }}>
             <div style={{ height: "100%", width: "60%", background: "#15803d" }}></div>
           </div>
        </div>
      </div>
    </div>
  );
};
