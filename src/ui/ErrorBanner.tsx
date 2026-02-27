import "./ErrorBanner.css";

type ErrorBannerProps = {
  message: string;
  onClose?: () => void;
};

export const ErrorBanner = ({ message, onClose }: ErrorBannerProps) => {
  return (
    <div className="error-banner" role="alert" aria-live="assertive">
      <span>{message}</span>
      {onClose && (
        <button
          type="button"
          className="error-banner-close"
          onClick={onClose}
          aria-label="Close error message"
        >
          x
        </button>
      )}
    </div>
  );
};
