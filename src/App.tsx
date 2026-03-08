import { Navigate, Route, Routes } from "react-router-dom";
import { AuthLayout } from "./layouts/AuthLayout";
import { DashboardLayout } from "./layouts/DashboardLayout";
import { LoginPage } from "./pages/LoginPage";
import { SignupPage } from "./pages/SignupPage";
import { OnboardingPage } from "./pages/OnboardingPage";
import { DashboardPage } from "./pages/DashboardPage";
import { LabourersPage } from "./pages/LabourersPage";
import { RequestsPage } from "./pages/RequestsPage";
import { ExpensesPage } from "./pages/ExpensesPage";
import { TasksPage } from "./pages/TasksPage";
import { CompaniesPage } from "./pages/CompaniesPage";
import { GardensPage } from "./pages/GardensPage";
import { EmployeesPage } from "./pages/EmployeesPage";
import { SettingsPage } from "./pages/SettingsPage";
import { AuctionPage } from "./pages/AuctionPage";
import { ExecutiveDashboardPage } from "./pages/ExecutiveDashboardPage";
import { InventoryPage } from "./pages/InventoryPage";
import { AssetsPage } from "./pages/AssetsPage";

export const App = () => {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
      </Route>

      <Route path="/onboarding" element={<OnboardingPage />} />

      <Route element={<DashboardLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/companies" element={<CompaniesPage />} />
        <Route path="/gardens" element={<GardensPage />} />
        <Route path="/labourers" element={<LabourersPage />} />
        <Route path="/employees" element={<EmployeesPage />} />
        <Route path="/requests" element={<RequestsPage />} />
        <Route path="/expenses" element={<ExpensesPage />} />
        <Route path="/tasks" element={<TasksPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/auction" element={<AuctionPage />} />
        <Route path="/executive-dashboard" element={<ExecutiveDashboardPage />} />
        <Route path="/inventory" element={<InventoryPage />} />
        <Route path="/assets" element={<AssetsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};
