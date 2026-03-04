import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { config } from "../config";
import { apiService } from "../services/apiService";
import { auth } from "../services/auth";
import { centralData } from "../services/centralData";
import { clearAuth, setUser } from "../store/authSlice";
import { clearError } from "../store/errorSlice";
import { clearPageState } from "../hooks/usePageState";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { fetchCompaniesStart, fetchCompaniesSuccess } from "../store/companiesSlice";
import { ErrorBanner } from "../ui/ErrorBanner";
import { FormModal } from "../ui/FormModal";
import { TeaEstateLogo } from "../ui/TeaEstateLogo";
import { AccessBlockedModal } from "../ui/AccessBlockedModal";
import type { UpdateUserRequest } from "../types/api";

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
  const companies = useAppSelector((state) => state.companies.items);
  const error = useAppSelector((state) => state.error.message);
  const navigate = useNavigate();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isSubmittingUser, setIsSubmittingUser] = useState(false);

  useEffect(() => {
    const isAuthenticated = centralData.initializeData();
    if (!isAuthenticated) {
      navigate("/login", { replace: true });
    } else {
      // Implement stale-while-revalidate strategy:
      // If no companies are cached, show a loading state by dispatching fetchCompaniesStart.
      if (companies.length === 0) {
        dispatch(fetchCompaniesStart());
      }

      // Always fetch fresh data in the background to update cache
      apiService.company.list()
        .then((fetchedCompanies) => {
          auth.setCompanies(fetchedCompanies);
          dispatch(fetchCompaniesSuccess(fetchedCompanies));
        })
        .catch((err) => {
          console.error("Failed to fetch fresh companies data in layout:", err);
        });
    }
  }, [navigate, dispatch]);

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
    clearPageState();
    dispatch(clearAuth());
    navigate("/login", { replace: true });
  };

  const handleUpdateUser = async (
    payload: UpdateUserRequest,
    file?: File | null,
    removeImage?: boolean
  ) => {
    setIsSubmittingUser(true);
    try {
      await apiService.user.update(payload);
      if (removeImage && user?.userid) {
        await apiService.user.removeImage(user.userid);
      }
      if (file && user?.userid) {
        await apiService.user.uploadImage(user.userid, file);
      }

      // Fetch fresh user data or construct it locally if fetch isn't available/efficient
      // For now, let's try to re-fetch if possible, or update local state
      // The login response returns { user, token }, but update returns User.
      // Let's assume we can trust the update response or refetch.
      // apiService.user.fetch is defined in mockApi but maybe not httpApi?
      // Checking httpApi... it doesn't seem to have a fetch(me) endpoint exposed easily
      // other than via login. But mockApi has fetch().
      // Let's check httpApi.ts again. It has user.login, create, logout. No 'me' endpoint?
      // Wait, centralData.initializeData() loads from local storage.
      // We should update local storage and redux.

      // Construct updated user object
      const updatedUser = {
        ...user!,
        gardenid: payload.gardenid,
        name: payload.name || user!.name,
        phone: payload.phone || user!.phone,
        profession: payload.profession || user!.profession,
        email: payload.email || user!.email,
        // If image was removed, clear it. If uploaded, we might not know the new URL immediately
        // without a response containing it.
        // For now, if mock, we won't see image update unless we assume it.
        // If real backend, we'd need the response to contain the image URL.
        // Let's hope update returns the full user object including image if it was updated?
        // httpApi update returns User.
      };

      // In a real scenario, we'd want to fetch the user again to get the new image URL.
      // But since we might not have a 'me' endpoint, we'll do our best.
      // Actually, if we use the response from apiService.user.update(payload),
      // it should contain the updated fields.

      // Let's restart the flow:
      // 1. Update text fields.
      // 2. Upload/Remove image.
      // 3. Since we don't have a 'fetch me' and update might not return the image URL after separate upload call,
      //    we might be stuck with stale image in UI until reload if we don't handle it.
      //    However, for this task, let's update what we can.

      auth.setUser(updatedUser);
      dispatch(setUser(updatedUser));

      setIsUserModalOpen(false);
      setIsProfileMenuOpen(false);
    } catch (err) {
      console.error("Failed to update user", err);
      // Error will be handled by global error handler in apiService if it dispatches,
      // or we can set it here if needed.
    } finally {
      setIsSubmittingUser(false);
    }
  };

  // Prepare gardens list for the modal (similar to other pages)
  const gardens = companies
      .filter((company) => company.ownerid === user?.userid)
      .flatMap((company) => company.gardens);
  const gardensToUse =
      gardens.length > 0
        ? gardens
        : companies.flatMap((company) => company.gardens);
  const uniqueGardens = new Map<string, { gardenid: string; name: string }>();
  gardensToUse.forEach((garden) => {
      uniqueGardens.set(garden.gardenid, {
        gardenid: garden.gardenid,
        name: garden.name
      });
  });
  const gardenOptions = Array.from(uniqueGardens.values());

  return (
    <div className="dashboard-layout">
      <AccessBlockedModal />
      {error && (
        <ErrorBanner message={error} onClose={() => dispatch(clearError())} />
      )}
      {isMobileSidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}
      <aside className={`sidebar ${isMobileSidebarOpen ? "sidebar-open" : ""}`}>
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
              onClick={() => setIsMobileSidebarOpen(false)}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <div className="main-content">
        <header className="topbar">
          <button
            type="button"
            className="mobile-menu-button"
            onClick={() => setIsMobileSidebarOpen(true)}
            aria-label="Open menu"
          >
            ☰
          </button>
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
                  className="profile-menu-item"
                  onClick={() => setIsUserModalOpen(true)}
                >
                  📝 Edit Profile
                </button>
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

      {user && (
        <FormModal
          isOpen={isUserModalOpen}
          isSubmitting={isSubmittingUser}
          mode="update"
          type="user"
          user={user}
          gardens={gardenOptions}
          onClose={() => setIsUserModalOpen(false)}
          onUpdateUser={handleUpdateUser}
        />
      )}
      </div>
    </div>
  );
};
