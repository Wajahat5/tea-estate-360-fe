type AlertModalProps = {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export const AlertModal = ({
  isOpen,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel
}: AlertModalProps) => {
  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <div className="modal-card">
        <div className="panel-header">
          <h2 id="alert-dialog-title" className="panel-title">
            {title}
          </h2>
          <button type="button" className="link-button" onClick={onCancel}>
            x
          </button>
        </div>
        <div className="modal-body">
          <p id="alert-dialog-description">{message}</p>
        </div>
        <div className="modal-footer" style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "20px" }}>
          <button type="button" className="secondary-button" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button type="button" className="primary-button" onClick={onConfirm} style={{ backgroundColor: "#ef4444" }}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
