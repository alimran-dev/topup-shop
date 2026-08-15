import { useState } from "react";
import PropTypes from "prop-types";
import { FaFilter } from "react-icons/fa";

// Sort + numeric range filters for an item-listing service.
// Filter values are held as a local draft and only applied on "Apply",
// so typing a range does not fire a request per keystroke.
const ItemFilters = ({ statLabels, bounds, sort, setSort, onApply, onReset }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState({});

  const setField = (key, value) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  const handleApply = () => {
    onApply(draft);
    setIsOpen(false);
  };

  const handleReset = () => {
    setDraft({});
    onReset();
  };

  const hasItems = bounds?.count > 0;

  const renderRange = (label, minKey, maxKey, range) => (
    <div key={minKey}>
      <label className="block text-xs font-semibold text-gray-600 mb-1 capitalize">
        {label}
        {range && (
          <span className="text-gray-400 font-normal">
            {" "}
            ({range.min} - {range.max})
          </span>
        )}
      </label>
      <div className="flex items-center gap-1">
        <input
          type="number"
          className="border border-gray-300 rounded px-2 py-1 text-sm w-full"
          placeholder={range ? `${range.min}` : "Min"}
          value={draft[minKey] ?? ""}
          onChange={(e) => setField(minKey, e.target.value)}
        />
        <span className="text-gray-400">-</span>
        <input
          type="number"
          className="border border-gray-300 rounded px-2 py-1 text-sm w-full"
          placeholder={range ? `${range.max}` : "Max"}
          value={draft[maxKey] ?? ""}
          onChange={(e) => setField(maxKey, e.target.value)}
        />
      </div>
    </div>
  );

  return (
    <div className="border rounded-md">
      {/* toolbar */}
      <div className="flex items-center justify-between gap-2 p-2 md:p-3">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          disabled={!hasItems}
          className="flex items-center gap-1.5 border border-gray-300 rounded px-3 py-1.5 text-sm font-semibold disabled:opacity-50"
        >
          <FaFilter className="text-xs" /> Filter
        </button>

        <div className="flex items-center gap-2">
          <label className="text-sm font-semibold text-gray-600 hidden md:block">
            Sort:
          </label>
          <select
            className="border border-gray-300 rounded px-2 py-1.5 text-sm"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="default">Default</option>
            <option value="priceAsc">Price: Low to High</option>
            <option value="priceDesc">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* filter panel */}
      {isOpen && hasItems && (
        <div className="border-t p-3 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {statLabels?.map((label, idx) =>
              renderRange(
                label,
                `stat${idx + 1}Min`,
                `stat${idx + 1}Max`,
                bounds?.stats?.[idx]
              )
            )}
            {renderRange("Price", "priceMin", "priceMax", bounds?.price)}
          </div>
          <div className="flex items-center gap-2 justify-end">
            <button
              type="button"
              onClick={handleReset}
              className="border border-gray-300 px-4 py-1.5 rounded text-sm font-semibold"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="bg-gradient-to-r from-[#FA6023] to-[#E61C55] text-white px-4 py-1.5 rounded text-sm font-semibold"
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

ItemFilters.propTypes = {
  statLabels: PropTypes.arrayOf(PropTypes.string),
  bounds: PropTypes.object,
  sort: PropTypes.string.isRequired,
  setSort: PropTypes.func.isRequired,
  onApply: PropTypes.func.isRequired,
  onReset: PropTypes.func.isRequired,
};

export default ItemFilters;
