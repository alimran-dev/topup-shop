import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import Pagination from "../../components/reusuable/Pagination/Pagination";

const LIMIT = 10;

const eventLabel = (eventType) =>
  ({
    purchase: "Purchase",
    suspend: "Suspend",
    resume: "Resume",
    cancel: "Cancel",
  }[eventType] || eventType);

const eventBadge = (eventType) =>
  ({
    purchase: "bg-primary text-white border-primary",
    suspend: "badge-warning",
    resume: "badge-success",
    cancel: "badge-error",
  }[eventType] || "badge-ghost");

const formatDate = (date) =>
  date ? new Date(date).toLocaleDateString("en-GB") : "—";

const SubscriptionHistory = () => {
  const [items, setItems] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [page, setPage] = useState(1);
  const [eventType, setEventType] = useState("");
  const [email, setEmail] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedAgreement, setSelectedAgreement] = useState(null);
  const modalRef = useRef(null);
  const axiosPrivate = useAxiosPrivate();

  useEffect(() => {
    const params = new URLSearchParams({ page, limit: LIMIT });
    if (eventType) params.set("eventType", eventType);
    if (email) params.set("email", email);
    if (fromDate) params.set("from", fromDate);
    if (toDate) params.set("to", toDate);

    setLoading(true);
    axiosPrivate
      .get(`/subscription/admin/history?${params}`)
      .then((res) => {
        setItems(res.data?.items || []);
        setTotalItems(res.data?.totalItems || 0);
      })
      .catch(() => toast.error("Failed to load history!"))
      .finally(() => setLoading(false));
  }, [axiosPrivate, page, eventType, email, fromDate, toDate]);

  const showAgreement = (agreement) => {
    setSelectedAgreement(agreement);
    modalRef.current?.showModal();
  };

  const totalPages = Math.max(1, Math.ceil(totalItems / LIMIT));

  return (
    <div className="max-w-6xl mx-auto px-4">
      <h2 className="title !text-xl md:!text-4xl">Subscription History</h2>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 my-5">
        <select
          className="input"
          value={eventType}
          onChange={(e) => {
            setEventType(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All Events</option>
          <option value="purchase">Purchase</option>
          <option value="suspend">Suspend</option>
          <option value="resume">Resume</option>
          <option value="cancel">Cancel</option>
        </select>
        <input
          type="text"
          className="input"
          placeholder="Search by email..."
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setPage(1);
          }}
        />
        <input
          type="date"
          className="input"
          value={fromDate}
          max={toDate || undefined}
          onChange={(e) => {
            setFromDate(e.target.value);
            setPage(1);
          }}
        />
        <input
          type="date"
          className="input"
          value={toDate}
          min={fromDate || undefined}
          disabled={!fromDate}
          onChange={(e) => {
            setToDate(e.target.value);
            setPage(1);
          }}
        />
      </div>

      {/* Desktop table */}
      {loading ? (
        <p className="py-6 text-center text-gray-400">Loading...</p>
      ) : items.length === 0 ? (
        <p className="py-6 text-center text-gray-400">No history found.</p>
      ) : (
        <>
          <div className="hidden md:block overflow-x-auto border border-slate-200 rounded-md shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr className="border-b border-slate-200 text-left">
                  <th className="py-3 px-4">Date &amp; Time</th>
                  <th className="py-3 px-4">Event</th>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Details</th>
                  <th className="py-3 px-4">Note</th>
                  <th className="py-3 px-4">Agreed T&amp;C</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item._id} className="border-b border-slate-100">
                    <td className="py-3 px-4">{formatDate(item.createdAt)}</td>
                    <td className="py-3 px-4">
                      <span className={`badge ${eventBadge(item.eventType)}`}>
                        {eventLabel(item.eventType)}
                      </span>
                    </td>
                    <td className="py-3 px-4">{item.email}</td>
                    <td className="py-3 px-4">{item.typeName}</td>
                    <td className="py-3 px-4">
                      {item.eventType === "purchase" ? (
                        <div>
                          <p className="font-medium">{item.packageName}</p>
                          <p className="text-xs text-gray-500">
                            ৳{item.price} · {item.durationDays} days
                          </p>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-500">
                          by {item.adminEmail || "admin"}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">{item.note || "—"}</td>
                    <td className="py-3 px-4">
                      {item.agreement ? (
                        <button
                          className="text-primary hover:opacity-70 text-xs font-semibold"
                          onClick={() => showAgreement(item.agreement)}
                        >
                          View T&amp;C
                        </button>
                      ) : (
                        "—"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {items.map((item) => (
              <div
                key={item._id}
                className="p-3 border border-slate-200 shadow-md rounded-md space-y-2"
              >
                <div className="flex justify-between items-start gap-2">
                  <span className={`badge ${eventBadge(item.eventType)}`}>
                    {eventLabel(item.eventType)}
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatDate(item.createdAt)}
                  </span>
                </div>
                <div className="text-sm text-gray-500 space-y-1">
                  <p>
                    <span className="text-gray-900 font-medium">
                      {item.typeName}
                    </span>{" "}
                    · {item.email}
                  </p>
                  {item.eventType === "purchase" ? (
                    <>
                      <p>
                        <span className="text-gray-900 font-medium">
                          {item.packageName}
                        </span>{" "}
                        · ৳{item.price} · {item.durationDays} days
                      </p>
                      {item.agreement && (
                        <button
                          className="text-primary hover:opacity-70 text-xs font-semibold"
                          onClick={() => showAgreement(item.agreement)}
                        >
                          View Agreed T&amp;C
                        </button>
                      )}
                    </>
                  ) : (
                    <p className="text-xs">
                      by {item.adminEmail || "admin"}
                      {item.note ? ` · ${item.note}` : ""}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />

      {/* Agreed T&C modal */}
      <dialog ref={modalRef} className="modal">
        <div className="modal-box bg-white max-w-2xl">
          <form method="dialog">
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
              ✕
            </button>
          </form>
          <h3 className="font-bold text-lg mb-1">
            Agreed Terms &amp; Conditions
          </h3>
          <p className="text-xs text-gray-500 mb-4">
            {selectedAgreement?.packageName} · agreed on{" "}
            {formatDate(selectedAgreement?.agreedAt)}
          </p>
          <div
            className="rich-text-output max-h-[60vh] overflow-y-auto"
            dangerouslySetInnerHTML={{
              __html: selectedAgreement?.termsAndConditions || "",
            }}
          />
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </div>
  );
};

export default SubscriptionHistory;
