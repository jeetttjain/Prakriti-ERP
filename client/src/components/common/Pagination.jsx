/**
 * Global Pagination controls.
 * @component
 * @param {Object} props Props
 * @param {number} props.currentPage Active page index
 * @param {number} props.totalPages Total page indices
 * @param {Function} props.onPageChange Selected index shift callback
 */
export default function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  return (
    <div className="pagination-wrapper" role="navigation" aria-label="Pagination Navigation">
      <button
        type="button"
        className="btn btn-secondary btn-sm"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        aria-label="Goto Previous Page"
      >
        Previous
      </button>
      <span className="pagination-info" aria-live="polite">
        Page {currentPage} of {totalPages}
      </span>
      <button
        type="button"
        className="btn btn-secondary btn-sm"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        aria-label="Goto Next Page"
      >
        Next
      </button>
    </div>
  );
}
