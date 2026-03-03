import { FormEvent, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiService } from "../services/apiService";
import { auth } from "../services/auth";
import { centralData } from "../services/centralData";
import { useAppDispatch } from "../store/hooks";
import { setAuth } from "../store/authSlice";

export const SignupPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (centralData.initializeData()) {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("+91");
  const [profession, setProfession] = useState("owner");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const response = await apiService.user.create({
        name,
        phone,
        profession,
        password
      });

      // Auto-login after signup
      if (response.token) {
        auth.setToken(response.token);
      }
      auth.setUser(response.user);
      dispatch(
        setAuth({
          token: response.token,
          user: response.user
        })
      );

      navigate("/onboarding");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-columns">
      <div className="auth-panel">
        <h2 className="auth-title">Sign Up</h2>
        <form onSubmit={handleSubmit} className="auth-form">
          <label className="field-label">
            Name
            <input
              className="field-input"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </label>
          <label className="field-label">
            Phone
            <input
              className="field-input"
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </label>
          <label className="field-label">
            Profession
            <select
              className="field-input"
              value={profession}
              onChange={(e) => setProfession(e.target.value)}
            >
              <option value="owner">Owner</option>
              <option value="manager">Manager</option>
              <option value="accountant">Accountant</option>
            </select>
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
            {loading ? "Creating account..." : "Sign Up"}
          </button>
        </form>
        <button
          type="button"
          className="link-button"
          onClick={() => navigate("/login")}
        >
          Already have an account? Log in
        </button>
      </div>
    </div>
  );
};
