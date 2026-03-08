const fs = require('fs');

let appContent = fs.readFileSync('src/App.tsx', 'utf8');
if (!appContent.includes('SettingsPage')) {
  appContent = appContent.replace(
    'import { EmployeesPage } from "./pages/EmployeesPage";',
    `import { EmployeesPage } from "./pages/EmployeesPage";
import { SettingsPage } from "./pages/SettingsPage";
import { AuctionPage } from "./pages/AuctionPage";
import { ExecutiveDashboardPage } from "./pages/ExecutiveDashboardPage";
import { InventoryPage } from "./pages/InventoryPage";
import { AssetsPage } from "./pages/AssetsPage";`
  );

  appContent = appContent.replace(
    '<Route path="/tasks" element={<TasksPage />} />',
    `<Route path="/tasks" element={<TasksPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/auction" element={<AuctionPage />} />
        <Route path="/executive-dashboard" element={<ExecutiveDashboardPage />} />
        <Route path="/inventory" element={<InventoryPage />} />
        <Route path="/assets" element={<AssetsPage />} />`
  );

  fs.writeFileSync('src/App.tsx', appContent);
}

let dlContent = fs.readFileSync('src/layouts/DashboardLayout.tsx', 'utf8');
if (!dlContent.includes('Settings')) {
  dlContent = dlContent.replace(
    '{ to: "/tasks", label: "To-Dos" }',
    `{ to: "/tasks", label: "To-Dos" },
  { to: "/settings", label: "Settings" },
  { to: "/auction", label: "Auction" },
  { to: "/executive-dashboard", label: "Executive Dash" },
  { to: "/inventory", label: "Inventory" },
  { to: "/assets", label: "Assets" }`
  );
  fs.writeFileSync('src/layouts/DashboardLayout.tsx', dlContent);
}
