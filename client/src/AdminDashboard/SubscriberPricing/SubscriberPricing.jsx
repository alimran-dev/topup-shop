import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";

const SERVER_LABELS = {
  unipin: "UniPin",
  my: "Shell MY",
  sg: "Shell SG",
  indo: "Indo",
};

const SubscriberPricing = () => {
  const [types, setTypes] = useState([]);
  const [servers, setServers] = useState([]);
  const [loading, setLoading] = useState(true);
  // drafts[server][unitKey][typeId] = "" | number-string
  const [drafts, setDrafts] = useState({});
  const [savingKey, setSavingKey] = useState(""); // `${server}|${unitKey}`
  const axiosPrivate = useAxiosPrivate();

  useEffect(() => {
    axiosPrivate
      .get("/subscriber-prices/admin")
      .then((res) => {
        setTypes(res.data?.types || []);
        setServers(res.data?.servers || []);
        // Seed the input drafts from saved prices so every form field shows
        // the current value on load (not just after a Save).
        const seeded = {};
        for (const group of res.data?.servers || []) {
          for (const unit of group.units || []) {
            if (unit.prices && Object.keys(unit.prices).length) {
              const perUnit = {};
              for (const [typeId, value] of Object.entries(unit.prices)) {
                perUnit[typeId] = String(value);
              }
              seeded[group.server] = {
                ...(seeded[group.server] || {}),
                [unit.unitKey]: perUnit,
              };
            }
          }
        }
        setDrafts(seeded);
      })
      .catch(() => toast.error("Failed to load subscriber pricing!"))
      .finally(() => setLoading(false));
  }, [axiosPrivate]);

  const setDraft = (server, unitKey, typeId, value) => {
    setDrafts((prev) => ({
      ...prev,
      [server]: {
        ...prev[server],
        [unitKey]: {
          ...(prev[server]?.[unitKey] || {}),
          [typeId]: value,
        },
      },
    }));
  };

  const rowKey = (server, unitKey) => `${server}|${unitKey}`;

  const saveRow = (server, unit) => {
    const key = rowKey(server, unit.unitKey);
    const prices = {};
    let hasValue = false;
    for (const type of types) {
      const val = drafts[server]?.[unit.unitKey]?.[type._id];
      if (val !== "" && val != null) hasValue = true;
      prices[type._id] = val === "" || val == null ? null : Number(val);
    }
    // Guard against wiping a priced row with one all-blank Save: blanking
    // every field means "no subscriber price for any type" — require an
    // explicit confirm so it is never accidental.
    const hasExistingPrices = unit.prices && Object.keys(unit.prices).length > 0;
    if (!hasValue && hasExistingPrices) {
      if (
        !window.confirm(
          "Remove all subscriber prices for this unit? The item will fall back to normal prices."
        )
      ) {
        return;
      }
    }
    setSavingKey(key);
    axiosPrivate
      .put("/subscriber-prices/admin", {
        server,
        unitKey: unit.unitKey,
        name: unit.name,
        prices,
      })
      .then((res) => {
        toast.success("Subscriber price saved!");
        // merge the authoritative prices back so other unsaved rows survive
        setDrafts((prev) => {
          const merged = { ...(prev[server]?.[unit.unitKey] || {}) };
          for (const [typeId, value] of Object.entries(res.data?.prices || {})) {
            merged[typeId] = String(value);
          }
          return {
            ...prev,
            [server]: { ...prev[server], [unit.unitKey]: merged },
          };
        });
      })
      .catch((err) =>
        toast.error(err?.response?.data?.message || "Failed to save price!")
      )
      .finally(() => setSavingKey(""));
  };

  const renderPriceInputs = (server, unit) => {
    const key = rowKey(server, unit.unitKey);
    return (
      <div className="flex flex-wrap items-center gap-2">
        {types.map((type) => (
          <div key={type._id} className="flex flex-col">
            <label className="text-[10px] uppercase tracking-wide text-gray-500 mb-0.5">
              {type.name}
            </label>
            <input
              type="number"
              min="0"
              step="any"
              placeholder="Normal price"
              className="input w-28"
              value={drafts[server]?.[unit.unitKey]?.[type._id] ?? ""}
              onChange={(e) =>
                setDraft(server, unit.unitKey, type._id, e.target.value)
              }
            />
          </div>
        ))}
        <button
          className="px-4 py-2 rounded-md bg-gradient-to-r from-primary to-secondary text-white text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed mt-4"
          disabled={savingKey === key}
          onClick={() => saveRow(server, unit)}
        >
          {savingKey === key ? "Saving..." : "Save"}
        </button>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-4">
      <h2 className="bg-gradient-to-r from-primary to-secondary w-fit text-xl md:text-2xl lg:text-3xl font-bold bg-clip-text text-transparent text-center py-2 mx-auto px-2 md:px-5 capitalize">
        Subscriber Pricing
      </h2>
      <p className="text-xs text-gray-500 mt-1 mb-5 max-w-2xl mx-auto text-center">
        Per-unit subscriber prices for auto topup (UniPin, Shell MY/SG, Indo).
        The unit list is exactly the option-add combo modal's list — same
        units, same names, no more no less. Every combo item's subscriber
        price is calculated automatically as the sum of its units × quantity.
        Prices are separate per subscription type. Leave a field blank to keep
        the normal price.
      </p>

      {loading ? (
        <p className="py-6 text-center text-gray-400">Loading...</p>
      ) : servers.length === 0 ? (
        <p className="py-6 text-center text-gray-400">No units found.</p>
      ) : (
        servers.map((group) => (
          <div key={group.server} className="mb-8">
            <h3 className="flex items-center gap-2 text-lg font-bold mb-3">
              <span className="badge bg-primary text-white border-primary">
                {SERVER_LABELS[group.server] || group.server}
              </span>
              <span className="text-sm font-normal text-gray-500">
                {group.units.length} unit{group.units.length === 1 ? "" : "s"}
              </span>
            </h3>

            {/* Desktop table — combo-modal style (bordered cells) */}
            <div className="hidden md:block overflow-x-auto rounded-md">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="border-2 border-primary w-1/3 py-2 pl-3 text-left">
                      Package
                    </th>
                    {types.map((type) => (
                      <th
                        key={type._id}
                        className="border-2 border-primary py-2 text-center"
                      >
                        {type.name} Price (৳)
                      </th>
                    ))}
                    <th className="border-2 border-primary w-24 py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {group.units.map((unit) => (
                    <tr key={unit.unitKey}>
                      <td className="border-2 border-primary py-2 pl-3">
                        <p className="font-medium">{unit.name}</p>
                        <p className="text-xs text-gray-400">{unit.unitKey}</p>
                        <p className="text-[10px] text-gray-400 line-clamp-1">
                          {unit.usedBy.length
                            ? unit.usedBy.join(", ")
                            : "Not used by any current option"}
                        </p>
                      </td>
                      {types.map((type) => (
                        <td
                          key={type._id}
                          className="border-2 border-primary py-1 text-center"
                        >
                          <input
                            type="number"
                            min="0"
                            step="any"
                            placeholder="Normal price"
                            className="w-24 text-center border border-slate-300 rounded px-1 py-1 focus:outline-none focus:border-primary"
                            value={
                              drafts[group.server]?.[unit.unitKey]?.[type._id] ??
                              ""
                            }
                            onChange={(e) =>
                              setDraft(
                                group.server,
                                unit.unitKey,
                                type._id,
                                e.target.value
                              )
                            }
                          />
                        </td>
                      ))}
                      <td className="border-2 border-primary py-1 text-center">
                        <button
                          className="px-3 py-1.5 rounded bg-gradient-to-r from-primary to-secondary text-white text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={
                            savingKey === rowKey(group.server, unit.unitKey)
                          }
                          onClick={() => saveRow(group.server, unit)}
                        >
                          {savingKey === rowKey(group.server, unit.unitKey)
                            ? "Saving..."
                            : "Save"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden space-y-3">
              {group.units.map((unit) => (
                <div
                  key={unit.unitKey}
                  className="p-3 border-2 border-primary shadow-md rounded-md space-y-2"
                >
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <p className="font-semibold">{unit.name}</p>
                      <p className="text-xs text-gray-400">{unit.unitKey}</p>
                    </div>
                    <span className="text-[10px] uppercase text-gray-400 bg-slate-100 rounded px-2 py-0.5">
                      {SERVER_LABELS[group.server] || group.server}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-2">
                    {unit.usedBy.length
                      ? unit.usedBy.join(", ")
                      : "Not used by any current option"}
                  </p>
                  {renderPriceInputs(group.server, unit)}
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default SubscriberPricing;
