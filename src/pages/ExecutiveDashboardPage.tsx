import { useState, useEffect } from "react";
import { apiService } from "../services/apiService";
import { useAppSelector } from "../store/hooks";

export const ExecutiveDashboardPage = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const user = useAppSelector((state) => state.auth.user);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Find a valid gardenId
        const gardenId = user?.gardens?.[0]?.gardenid || "";
        if (!gardenId) return;

        // This expects the endpoint to be available in apiService.
        // The instructions mentioned building views calling:
        // GET /dashboard/executive?gardenId=...
        // We will just do a fetch directly or via apiService if defined.
        if (apiService.dashboard?.getExecutive) {
          const res = await apiService.dashboard.getExecutive(gardenId);
          setData(res);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  return (
    <div className="page-container">
      <header className="page-header">
        <h1 className="page-title">Executive Dashboard</h1>
        <p className="page-subtitle">High-level insights and analytics.</p>
      </header>

      <div className="panel">
        <div className="panel-header">
          <h2 className="panel-title">Overview</h2>
        </div>
        <div className="panel-body">
          {loading ? (
            <p>Loading...</p>
          ) : data ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="stat-card p-4 border rounded-lg shadow-sm">
                <h3 className="text-gray-500">Total Revenue</h3>
                <p className="text-2xl font-bold">${data.totalRevenue || 0}</p>
              </div>
              <div className="stat-card p-4 border rounded-lg shadow-sm">
                <h3 className="text-gray-500">Operating Expenses</h3>
                <p className="text-2xl font-bold">${data.operatingExpenses || 0}</p>
              </div>
              <div className="stat-card p-4 border rounded-lg shadow-sm">
                <h3 className="text-gray-500">Net Margin</h3>
                <p className="text-2xl font-bold">{data.netMargin || "0%"}</p>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No data available.</p>
          )}
        </div>
      </div>
    </div>
  );
};
