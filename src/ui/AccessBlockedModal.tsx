import { useAppDispatch, useAppSelector } from "../store/hooks";
import { setAuth } from "../store/authSlice"; // if we need to interact, but mostly just view.

export const AccessBlockedModal = () => {
  const isBlocked = useAppSelector((state) => state.auth.isBlocked);

  if (!isBlocked) return null;

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" style={{ zIndex: 9999 }}>
      <div className="modal-card" style={{ maxWidth: "400px", textAlign: "center", padding: "32px 24px" }}>
        <div style={{ fontSize: "48px", marginBottom: "16px" }}>⏳</div>
        <h2 className="auth-title" style={{ marginTop: 0, marginBottom: "12px" }}>Access Pending</h2>
        <p style={{ color: "#4b5563", lineHeight: "1.5", margin: 0 }}>
          You have to wait until your garden join request is accepted to be able to use the application.
        </p>
      </div>
    </div>
  );
};
