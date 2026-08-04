/**
 * Reusable loading spinner.
 * @component
 */
export default function LoadingSpinner() {
  return (
    <div className="spinner-container" role="status" aria-label="Loading contents">
      <div className="loading-spinner"></div>
    </div>
  );
}
