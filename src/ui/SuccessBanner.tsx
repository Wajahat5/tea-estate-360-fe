type SuccessBannerProps = {
  message: string;
  onClose?: () => void;
};

export const SuccessBanner = ({ message, onClose }: SuccessBannerProps) => {
  return (
    <div className="success-banner" role="status" aria-live="polite">
      <span>{message}</span>
      {onClose && (
        <button
          type="button"
          className="success-banner-close"
          onClick={onClose}
          aria-label="Close success message"
        >
          x
        </button>
      )}
    </div>
  );
};
