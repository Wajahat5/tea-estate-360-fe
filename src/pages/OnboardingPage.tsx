import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiService } from "../services/apiService";
import { useAppSelector, useAppDispatch } from "../store/hooks";
import { fetchCompaniesFailure, fetchCompaniesStart, fetchCompaniesSuccess } from "../store/companiesSlice";
import { auth } from "../services/auth";
import type { SearchCompanyResponse } from "../types/api";

export const OnboardingPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const [mode, setMode] = useState<"choice" | "create_company_email" | "create_company_otp" | "create_company_details" | "create_garden" | "join_garden">("choice");

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [companyDetails, setCompanyDetails] = useState({
    name: "",
    state: "",
    district: "",
    pincode: "",
    labourer_daily_wage: 0,
    labourer_extrawage_per_kg: 0,
    labourer_extrawage_per_hr: 0
  });
  const [gardenDetails, setGardenDetails] = useState({
    name: "",
    state: "",
    district: "",
    pincode: ""
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchCompanyResponse[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSendCode = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await apiService.company.sendCode({ email });
      if (res.success) {
        setCompanyId(res.companyid);
        setMode("create_company_otp");
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await apiService.company.verifyCode({ email, code: otp });
      if (res.success) {
        setCompanyId(res.companyid);
        setMode("create_company_details");
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCompany = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await apiService.company.create({
        companyid: companyId,
        ...companyDetails
      });
      setMode("create_garden");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGarden = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await apiService.garden.create({
        companyid: companyId,
        ...gardenDetails
      });

      // Fetch user's company and gardens to update state
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

      navigate("/dashboard");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchCompany = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const results = await apiService.company.searchByName(searchQuery);
      setSearchResults(results);
      setHasSearched(true);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinGarden = async (gardenid: string) => {
    setLoading(true);
    setError(null);
    try {
      await apiService.user.joinGarden({ gardenid });
      navigate("/dashboard");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-columns" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f5f7fb" }}>
      <div className="auth-panel" style={{ maxWidth: "500px", width: "100%", background: "white", padding: "32px", borderRadius: "16px", boxShadow: "0 10px 25px rgba(0,0,0,0.05)" }}>

        {mode === "choice" && (
          <div>
            <h2 className="auth-title" style={{ textAlign: "center", marginTop: 0 }}>Welcome, {user?.name}!</h2>
            <p style={{ textAlign: "center", color: "#6b7280", marginBottom: "24px" }}>What would you like to do next?</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <button
                className="primary-button"
                style={{ padding: "16px", fontSize: "16px" }}
                onClick={() => setMode("create_company_email")}
              >
                🏢 Create a New Company
              </button>
              <button
                className="secondary-button"
                style={{ padding: "16px", fontSize: "16px" }}
                onClick={() => setMode("join_garden")}
              >
                🌱 Join an Existing Garden
              </button>
            </div>
          </div>
        )}

        {mode === "create_company_email" && (
          <div>
            <h2 className="auth-title">Verify Company Email</h2>
            <form onSubmit={handleSendCode} className="auth-form">
              <label className="field-label">
                Company Email
                <input className="field-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </label>
              {error && <p className="field-error">{error}</p>}
              <button className="primary-button" type="submit" disabled={loading}>
                {loading ? "Sending..." : "Send Verification Code"}
              </button>
              <button type="button" className="link-button" onClick={() => setMode("choice")}>Back</button>
            </form>
          </div>
        )}

        {mode === "create_company_otp" && (
          <div>
            <h2 className="auth-title">Enter Verification Code</h2>
            <p style={{ color: "#6b7280", fontSize: "14px" }}>Code sent to {email}</p>
            <form onSubmit={handleVerifyCode} className="auth-form">
              <label className="field-label">
                Code
                <input className="field-input" type="text" value={otp} onChange={(e) => setOtp(e.target.value)} required />
              </label>
              {error && <p className="field-error">{error}</p>}
              <button className="primary-button" type="submit" disabled={loading}>
                {loading ? "Verifying..." : "Verify Code"}
              </button>
              <button type="button" className="link-button" onClick={() => setMode("create_company_email")}>Back</button>
            </form>
          </div>
        )}

        {mode === "create_company_details" && (
          <div>
            <h2 className="auth-title">Company Details</h2>
            <form onSubmit={handleCreateCompany} className="auth-form">
              <label className="field-label">
                Company Name
                <input className="field-input" type="text" value={companyDetails.name} onChange={(e) => setCompanyDetails({...companyDetails, name: e.target.value})} required />
              </label>
              <div style={{ display: "flex", gap: "10px" }}>
                <label className="field-label" style={{ flex: 1 }}>
                  State
                  <input className="field-input" type="text" value={companyDetails.state} onChange={(e) => setCompanyDetails({...companyDetails, state: e.target.value})} required />
                </label>
                <label className="field-label" style={{ flex: 1 }}>
                  District
                  <input className="field-input" type="text" value={companyDetails.district} onChange={(e) => setCompanyDetails({...companyDetails, district: e.target.value})} required />
                </label>
              </div>
              <label className="field-label">
                Pincode
                <input className="field-input" type="text" value={companyDetails.pincode} onChange={(e) => setCompanyDetails({...companyDetails, pincode: e.target.value})} required />
              </label>
              {error && <p className="field-error">{error}</p>}
              <button className="primary-button" type="submit" disabled={loading}>
                {loading ? "Saving..." : "Create Company"}
              </button>
            </form>
          </div>
        )}

        {mode === "create_garden" && (
          <div>
            <h2 className="auth-title">Create First Garden</h2>
            <form onSubmit={handleCreateGarden} className="auth-form">
              <label className="field-label">
                Garden Name
                <input className="field-input" type="text" value={gardenDetails.name} onChange={(e) => setGardenDetails({...gardenDetails, name: e.target.value})} required />
              </label>
              <div style={{ display: "flex", gap: "10px" }}>
                <label className="field-label" style={{ flex: 1 }}>
                  State
                  <input className="field-input" type="text" value={gardenDetails.state} onChange={(e) => setGardenDetails({...gardenDetails, state: e.target.value})} required />
                </label>
                <label className="field-label" style={{ flex: 1 }}>
                  District
                  <input className="field-input" type="text" value={gardenDetails.district} onChange={(e) => setGardenDetails({...gardenDetails, district: e.target.value})} required />
                </label>
              </div>
              <label className="field-label">
                Pincode
                <input className="field-input" type="text" value={gardenDetails.pincode} onChange={(e) => setGardenDetails({...gardenDetails, pincode: e.target.value})} required />
              </label>
              {error && <p className="field-error">{error}</p>}
              <button className="primary-button" type="submit" disabled={loading}>
                {loading ? "Saving..." : "Create Garden & Finish"}
              </button>
            </form>
          </div>
        )}

        {mode === "join_garden" && (
          <div>
            <h2 className="auth-title">Join a Garden</h2>
            <form onSubmit={handleSearchCompany} className="auth-form" style={{ marginBottom: "20px" }}>
              <label className="field-label">
                Company Name
                <div style={{ display: "flex", gap: "8px" }}>
                  <input className="field-input" style={{ flex: 1 }} type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="e.g. Green Leaf Estates" required />
                  <button className="primary-button" type="submit" style={{ marginTop: 0 }} disabled={loading}>Search</button>
                </div>
              </label>
            </form>

            {error && <p className="field-error">{error}</p>}

            {hasSearched && searchResults.length === 0 && (
              <p style={{ color: "#6b7280", textAlign: "center" }}>No companies found.</p>
            )}

            {searchResults.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px", maxHeight: "300px", overflowY: "auto" }}>
                {searchResults.map((company) => (
                  <div key={company.companyid} style={{ border: "1px solid #e5e7eb", borderRadius: "12px", padding: "12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                      {company.image ? (
                        <img src={company.image} alt="" style={{ width: "40px", height: "40px", borderRadius: "8px", objectFit: "cover" }} />
                      ) : (
                        <div style={{ width: "40px", height: "40px", borderRadius: "8px", background: "#e5e7eb" }}></div>
                      )}
                      <div>
                        <div style={{ fontWeight: 600 }}>{company.name}</div>
                        <div style={{ fontSize: "12px", color: "#6b7280" }}>{company.address?.district}, {company.address?.state}</div>
                      </div>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      {company.gardens.map(garden => (
                        <div key={garden.gardenid} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#f9fafb", padding: "8px 12px", borderRadius: "8px" }}>
                          <span style={{ fontSize: "14px", fontWeight: 500 }}>{garden.name}</span>
                          <button className="secondary-button sm-button" onClick={() => handleJoinGarden(garden.gardenid)} disabled={loading}>Join</button>
                        </div>
                      ))}
                      {company.gardens.length === 0 && (
                        <span style={{ fontSize: "13px", color: "#9ca3af", fontStyle: "italic" }}>No gardens found.</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button type="button" className="link-button" style={{ display: "block", marginTop: "16px", width: "100%", textAlign: "center" }} onClick={() => setMode("choice")}>Back</button>
          </div>
        )}

      </div>
    </div>
  );
};
