import PropTypes from "prop-types";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

// Builds a windowed page list like: 1 … 4 5 6 … 20
const buildPages = (current, total) => {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const pages = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  if (start > 2) pages.push("...");
  for (let p = start; p <= end; p++) pages.push(p);
  if (end < total - 1) pages.push("...");
  pages.push(total);
  return pages;
};

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (!totalPages || totalPages < 2) return null;

  const pages = buildPages(currentPage, totalPages);

  const go = (page) => {
    if (page < 1 || page > totalPages || page === currentPage) return;
    onPageChange(page);
  };

  const baseBtn =
    "min-w-[34px] h-[34px] px-2 flex items-center justify-center rounded-md border text-sm font-semibold transition-colors";

  return (
    <div className="flex items-center justify-center gap-1.5 flex-wrap py-4">
      <button
        type="button"
        onClick={() => go(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Previous page"
        className={`${baseBtn} border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed`}
      >
        <FaChevronLeft className="text-xs" />
      </button>

      {pages.map((page, idx) =>
        page === "..." ? (
          <span key={`gap-${idx}`} className="px-1 text-gray-400 select-none">
            …
          </span>
        ) : (
          <button
            key={page}
            type="button"
            onClick={() => go(page)}
            aria-current={page === currentPage ? "page" : undefined}
            className={`${baseBtn} ${
              page === currentPage
                ? "bg-gradient-to-r from-primary to-secondary text-white border-transparent"
                : "border-gray-300 hover:border-primary"
            }`}
          >
            {page}
          </button>
        )
      )}

      <button
        type="button"
        onClick={() => go(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Next page"
        className={`${baseBtn} border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed`}
      >
        <FaChevronRight className="text-xs" />
      </button>
    </div>
  );
};

Pagination.propTypes = {
  currentPage: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
};

export default Pagination;
