type NoResultsProps = {
  title?: string;
  message?: string;
};

export const NoResults = ({
  title = "No results found",
  message = "Try changing the filters and submit again."
}: NoResultsProps) => {
  return (
    <div className="no-results">
      <h3 className="no-results-title">{title}</h3>
      <p className="no-results-message">{message}</p>
    </div>
  );
};
