import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { apiService } from "../services/apiService";
import { useAppSelector } from "../store/hooks";
import type {
  DashboardAlertsResponse,
  DashboardGardenBreakdownResponse,
  DashboardOverviewResponse,
  DashboardQuery,
  DashboardRecentActivityResponse,
  DashboardTrendsResponse
} from "../types/api";
import { NoResults } from "../ui/NoResults";

const getDefaultDateRange = () => {
  const now = new Date();
  const from = new Date(now.getFullYear(), now.getMonth(), 1);
  const to = now;
  const format = (date: Date) => date.toISOString().slice(0, 10);
  return { from: format(from), to: format(to) };
};

export const DashboardPage = () => {
  const companies = useAppSelector((state) => state.companies.items);
  const user = useAppSelector((state) => state.auth.user);
  const defaultRange = getDefaultDateRange();

  const [gardenid, setGardenid] = useState("");
  const [from, setFrom] = useState(defaultRange.from);
  const [to, setTo] = useState(defaultRange.to);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [overview, setOverview] = useState<DashboardOverviewResponse | null>(null);
  const [trends, setTrends] = useState<DashboardTrendsResponse | null>(null);
  const [recentActivity, setRecentActivity] =
    useState<DashboardRecentActivityResponse | null>(null);
  const [alerts, setAlerts] = useState<DashboardAlertsResponse | null>(null);
  const [gardenBreakdown, setGardenBreakdown] =
    useState<DashboardGardenBreakdownResponse | null>(null);

  const gardens = useMemo(() => {
    const ownedGardens = companies
      .filter((company) => company.ownerid === user?.userid)
      .flatMap((company) => company.gardens);
    const gardensToUse =
      ownedGardens.length > 0
        ? ownedGardens
        : companies.flatMap((company) => company.gardens);
    const unique = new Map<string, { gardenid: string; name: string }>();
    gardensToUse.forEach((garden) => {
      unique.set(garden.gardenid, {
        gardenid: garden.gardenid,
        name: garden.name
      });
    });
    return Array.from(unique.values());
  }, [companies, user?.userid]);

  const loadDashboard = useCallback(async (query: DashboardQuery) => {
    setLoading(true);
    setError(null);
    try {
      const [overviewRes, trendsRes, recentRes, alertsRes, breakdownRes] =
        await Promise.all([
          apiService.dashboard.overview(query),
          apiService.dashboard.trends(query),
          apiService.dashboard.recentActivity({ ...query, limit: 20 }),
          apiService.dashboard.alerts(query),
          apiService.dashboard.gardenBreakdown(query)
        ]);
      setOverview(overviewRes);
      setTrends(trendsRes);
      setRecentActivity(recentRes);
      setAlerts(alertsRes);
      setGardenBreakdown(breakdownRes);
    } catch (fetchError) {
      setError((fetchError as Error).message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!from || !to) {
      setError("From and to dates are required.");
      return;
    }
    const query: DashboardQuery = {
      from,
      to
    };
    if (gardenid) {
      query.gardenid = gardenid;
    }
    await loadDashboard(query);
  };

  useEffect(() => {
    void loadDashboard({ from: defaultRange.from, to: defaultRange.to });
  }, [defaultRange.from, defaultRange.to, loadDashboard]);

  return (
    <div>
      <h1 className="page-title">Dashboard</h1>
      <div className="panel">
        <div className="panel-header">
          <h2 className="panel-title">Dashboard Filters</h2>
        </div>
        <form onSubmit={handleSubmit} className="request-filters-form">
          <label className="field-label">
            Garden
            <select
              className="field-input"
              value={gardenid}
              onChange={(event) => setGardenid(event.target.value)}
            >
              <option value="">All gardens</option>
              {gardens.map((garden) => (
                <option key={garden.gardenid} value={garden.gardenid}>
                  {garden.name}
                </option>
              ))}
            </select>
          </label>
          <label className="field-label">
            From
            <input
              className="field-input"
              type="date"
              value={from}
              onChange={(event) => setFrom(event.target.value)}
              required
            />
          </label>
          <label className="field-label">
            To
            <input
              className="field-input"
              type="date"
              value={to}
              onChange={(event) => setTo(event.target.value)}
              required
            />
          </label>
          <button className="primary-button" type="submit" disabled={loading}>
            {loading ? "Loading..." : "Load Dashboard"}
          </button>
        </form>
        {error && <p className="field-error">{error}</p>}
      </div>

      {!overview && !loading && (
        <NoResults
          title="Dashboard not loaded"
          message="Choose filters and click Load Dashboard."
        />
      )}

      {overview && (
        <>
          <div className="grid-cards">
            <div className="stat-card">
              <span className="stat-card-label">Total Labourers</span>
              <span className="stat-card-value">
                {overview.kpis.total_labourers.toLocaleString()}
              </span>
            </div>
            <div className="stat-card">
              <span className="stat-card-label">Total Employees</span>
              <span className="stat-card-value">
                {overview.kpis.total_employees.toLocaleString()}
              </span>
            </div>
            <div className="stat-card">
              <span className="stat-card-label">Wages Paid</span>
              <span className="stat-card-value">
                Rs {overview.kpis.wages_paid.toLocaleString()}
              </span>
            </div>
            <div className="stat-card">
              <span className="stat-card-label">Wages Due</span>
              <span className="stat-card-value">
                Rs {overview.kpis.wages_due.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="panel request-group-panel">
            <div className="panel-header">
              <h2 className="panel-title">Quick Status</h2>
            </div>
            <table className="table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Requests under review</td>
                  <td>{overview.quick_status.requests.under_review}</td>
                </tr>
                <tr>
                  <td>Requests approved</td>
                  <td>{overview.quick_status.requests.approved}</td>
                </tr>
                <tr>
                  <td>Expenses unpaid</td>
                  <td>{overview.quick_status.expenses.unpaid}</td>
                </tr>
                <tr>
                  <td>Expenses paid</td>
                  <td>{overview.quick_status.expenses.paid}</td>
                </tr>
                <tr>
                  <td>Tasks not started</td>
                  <td>{overview.quick_status.tasks.not_started}</td>
                </tr>
                <tr>
                  <td>Tasks in progress</td>
                  <td>{overview.quick_status.tasks.under_progress}</td>
                </tr>
                <tr>
                  <td>Tasks completed</td>
                  <td>{overview.quick_status.tasks.completed}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </>
      )}

      {trends && (
        <div className="panel request-group-panel">
          <div className="panel-header">
            <h2 className="panel-title">Trends</h2>
          </div>
          <table className="table">
            <thead>
              <tr>
                <th>Metric</th>
                <th>Latest Point</th>
              </tr>
            </thead>
            <tbody>
              {trends.series.map((series) => {
                const latest = series.points[series.points.length - 1];
                return (
                  <tr key={series.key}>
                    <td>{series.label}</td>
                    <td>{JSON.stringify(latest || {})}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {recentActivity && (
        <div className="panel request-group-panel">
          <div className="panel-header">
            <h2 className="panel-title">Recent Activity</h2>
          </div>
          {recentActivity.items.length === 0 ? (
            <NoResults message="No recent activity in selected scope." />
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Title</th>
                  <th>Garden</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {recentActivity.items.map((item) => (
                  <tr key={item.id}>
                    <td>{item.type}</td>
                    <td>{item.title}</td>
                    <td>{item.garden_name}</td>
                    <td>{item.status}</td>
                    <td>{item.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {alerts && (
        <div className="panel request-group-panel">
          <div className="panel-header">
            <h2 className="panel-title">Alerts</h2>
          </div>
          {alerts.alerts.length === 0 ? (
            <NoResults message="No alerts for selected scope." />
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Severity</th>
                  <th>Title</th>
                  <th>Description</th>
                  <th>Count</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {alerts.alerts.map((alert) => (
                  <tr key={alert.code}>
                    <td>{alert.code}</td>
                    <td>{alert.severity}</td>
                    <td>{alert.title}</td>
                    <td>{alert.description}</td>
                    <td>{alert.count ?? "-"}</td>
                    <td>{alert.amount ?? "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {gardenBreakdown && (
        <div className="panel request-group-panel">
          <div className="panel-header">
            <h2 className="panel-title">Garden Breakdown</h2>
          </div>
          {gardenBreakdown.gardens.length === 0 ? (
            <NoResults message="No garden breakdown data found." />
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Garden</th>
                  <th>Labourers</th>
                  <th>Employees</th>
                  <th>Attendance</th>
                  <th>Wages Paid</th>
                  <th>Wages Due</th>
                  <th>Expenses Paid</th>
                  <th>Expenses Unpaid</th>
                </tr>
              </thead>
              <tbody>
                {gardenBreakdown.gardens.map((garden) => (
                  <tr key={garden.gardenid}>
                    <td>{garden.garden_name}</td>
                    <td>{garden.labourers}</td>
                    <td>{garden.employees}</td>
                    <td>{garden.attendance}</td>
                    <td>{garden.wages_paid}</td>
                    <td>{garden.wages_due}</td>
                    <td>{garden.expenses_paid}</td>
                    <td>{garden.expenses_unpaid}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};
