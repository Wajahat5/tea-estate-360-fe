import { FormEvent, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiService } from "../services/apiService";
import { auth } from "../services/auth";
import { centralData } from "../services/centralData";
import { setAuth } from "../store/authSlice";
import {
  fetchCompaniesFailure,
  fetchCompaniesStart,
  fetchCompaniesSuccess
} from "../store/companiesSlice";
import { useAppDispatch } from "../store/hooks";

export const LoginPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (centralData.initializeData()) {
      navigate("/companies", { replace: true });
    }
  }, [navigate]);
  const [phone, setPhone] = useState("+91");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const loginResponse = await apiService.user.login({ phone, password });
      if (loginResponse.token) {
        auth.setToken(loginResponse.token);
      }
      auth.setUser(loginResponse.user);
      dispatch(
        setAuth({
          token: loginResponse.token,
          user: loginResponse.user
        })
      );
      dispatch(fetchCompaniesStart());
      try {
        const companies = await apiService.company.list();
        auth.setCompanies(companies);
        dispatch(fetchCompaniesSuccess(companies));
      } catch (companyError) {
        dispatch(
          fetchCompaniesFailure(
            (companyError as Error).message || "Failed to fetch companies"
          )
        );
      }
      navigate("/companies");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-columns">
      <div className="auth-panel">
        <h2 className="auth-title">Login</h2>
        <form onSubmit={handleSubmit} className="auth-form">
          <label className="field-label">
            Email / Phone
            <input
              className="field-input"
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+9170xxxxxxx"
              required
            />
          </label>
          <label className="field-label">
            Password
            <input
              className="field-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
          {error && <p className="field-error">{error}</p>}
          <button className="primary-button" type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>
        <button
          type="button"
          className="link-button"
          onClick={() => navigate("/signup")}
        >
          New here? Create an account
        </button>
      </div>
    </div>
  );
};
