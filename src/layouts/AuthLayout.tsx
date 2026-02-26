import { Outlet } from "react-router-dom";
import { TeaEstateLogo } from "../ui/TeaEstateLogo";

export const AuthLayout = () => {
  return (
    <div className="auth-layout">
      <div className="auth-card-container">
        <div className="auth-card">
          <TeaEstateLogo />
          <Outlet />
        </div>
      </div>
    </div>
  );
};
