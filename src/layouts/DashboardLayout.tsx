import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { config } from "../config";
import { apiService } from "../services/apiService";
import { auth } from "../services/auth";
import { centralData } from "../services/centralData";
import { clearAuth } from "../store/authSlice";
import { clearError } from "../store/errorSlice";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { ErrorBanner } from "../ui/ErrorBanner";
import { TeaEstateLogo } from "../ui/TeaEstateLogo";

const navItems = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/companies", label: "Companies" },
  { to: "/labourers", label: "Labourers" },
  { to: "/employees", label: "Employees" },
  { to: "/requests", label: "Requests" },
  { to: "/expenses", label: "Expenses" },
  { to: "/tasks", label: "To-Dos" }
];

export const DashboardLayout = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const error = useAppSelector((state) => state.error.message);
  const navigate = useNavigate();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  useEffect(() => {
    const isAuthenticated = centralData.initializeData();
    if (!isAuthenticated) {
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "NA";

  const handleLogout = async () => {
    setIsProfileMenuOpen(false);
    if (!config.shouldUseMockAPIs && apiService.user.logout) {
      try {
        await apiService.user.logout();
      } catch {
        // swallow logout errors and still clear local state
      }
    }
    auth.clear();
    dispatch(clearAuth());
    navigate("/login", { replace: true });
  };

  return (
    <div className="dashboard-layout">
      {error && (
        <ErrorBanner message={error} onClose={() => dispatch(clearError())} />
      )}
      <aside className="sidebar">
        <div className="sidebar-header">
          <TeaEstateLogo />
        </div>
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                ["sidebar-link", isActive ? "sidebar-link-active" : ""].join(
                  " "
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <div className="main-content">
        <header className="topbar">
          <div />
          <div className="topbar-user-wrapper">
            <button
              type="button"
              className="topbar-user"
              onClick={() => setIsProfileMenuOpen((open) => !open)}
            >
              {user?.image ? (
                <img src={user.image} alt={user.name} className="avatar-image" />
              ) : (
                <div className="avatar-circle">{initials}</div>
              )}
              <div className="topbar-user-info">
                <span className="topbar-user-name">{user?.name || "Unknown User"}</span>
                <span className="topbar-user-role">
                  {user?.profession || "No role"}
                </span>
              </div>
            </button>
            {isProfileMenuOpen && (
              <div className="profile-menu">
                <div className="profile-menu-header">
                  {user?.image ? (
                    <img src={user.image} alt={user.name} className="avatar-image avatar-image-sm" />
                  ) : (
                    <div className="avatar-circle avatar-circle-sm">{initials}</div>
                  )}
                  <div className="profile-menu-user">
                    <span className="profile-menu-name">{user?.name || "Unknown User"}</span>
                    <span className="profile-menu-email">{user?.email || "No email"}</span>
                    <span className="profile-menu-email">{user?.phone || "No phone"}</span>
                  </div>
                </div>
                <button
                  type="button"
                  className="profile-menu-item profile-menu-logout"
                  onClick={handleLogout}
                >
                  Log out
                </button>
              </div>
            )}
          </div>
        </header>
        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
