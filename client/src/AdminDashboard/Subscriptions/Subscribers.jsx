import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { FaPause, FaPlay, FaBan } from "react-icons/fa";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import Pagination from "../../components/reusuable/Pagination/Pagination";

const LIMIT = 10;

const statusBadge = (status) => {
  const map = {
    active: "badge-success",
    suspended: "badge-warning",
    expired: "badge-ghost",
    cancelled: "badge-error",
  };
  return map[status] || "badge-ghost";
};

const formatDate = (date) =>
  date ? new Date(date).toLocaleDateString("en-GB") : "—";

const VERB = { suspend: "suspended", resume: "resumed", cancel: "cancelled" };

const ACTION_META = {
  suspend: {
    label: "Suspend",
    Icon: FaPause,
    iconClass: "text-amber-500",
    btnClass: "bg-amber-500 hover:bg-amber-600",
  },
  resume: {
    label: "Resume",
    Icon: FaPlay,
    iconClass: "text-green-500",
    btnClass: "bg-green-500 hover:bg-green-600",
  },
  cancel: {
    label: "Cancel",
    Icon: FaBan,
    iconClass: "text-red-500",
    btnClass: "bg-red-500 hover:bg-red-600",
  },
};

const Subscribers = () => {
  const [items, setItems] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [page, setPage] = useState(1);
  const [types, setTypes] = useState([]);
  const [typeFilter, setTypeFilter] = useState("");
  const [emailSearch, setEmailSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionTarget, setActionTarget] = useState(null); // { sub, action }
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const actionDialogRef = useRef(null);
  const axiosPrivate = useAxiosPrivate();

  const fetchList = (pageToUse) => {
    const params = new URLSearchParams({ page: pageToUse, limit: LIMIT });
    if (typeFilter) params.set("typeId", typeFilter);
    if (emailSearch) params.set("email", emailSearch);
    if (statusFilter) params.set("status", statusFilter);
    return axiosPrivate.get(`/subscription/admin/subscribers?${params}`);
  };

  useEffect(() => {
    axiosPrivate
      .get("/subscription/admin/types")
      .then((res) => setTypes(res.data || []))
      .catch(() => toast.error("Failed to load types!"));
  }, [axiosPrivate]);

  useEffect(() => {
    setLoading(true);
    fetchList(page)
      .then((res) => {
        setItems(res.data?.items || []);
        setTotalItems(res.data?.totalItems || 0);
      })
      .catch(() => toast.error("Failed to load subscribers!"))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [axiosPrivate, page, typeFilter, emailSearch, statusFilter]);

  const openActionDialog = (sub, action) => {
    setActionTarget({ sub, action });
    setNote("");
    setSubmitting(false);
    actionDialogRef.current?.showModal();
  };

  const confirmAction = () => {
    if (!actionTarget) return;
    const { sub, action } = actionTarget;
    setSubmitting(true);
    axiosPrivate
      .post("/subscription/admin/actions", {
        id: sub._id,
        action,
        note: note.trim(),
      })
      .then((res) => {
        if (res.data?.success) {
          toast.success(`Subscription ${VERB[action]} successfully!`);
          actionDialogRef.current?.close();
          setActionTarget(null);
          setPage(1);
          fetchList(1)
            .then((r) => {
              setItems(r.data?.items || []);
              setTotalItems(r.data?.totalItems || 0);
            })
            .catch(() => toast.error("Failed to refresh!"));
        }
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || "Action failed!");
        actionDialogRef.current?.close();
        setActionTarget(null);
        // row may be stale (transition guard rejected) — refresh to show real state
        fetchList(page)
          .then((r) => {
            setItems(r.data?.items || []);
            setTotalItems(r.data?.totalItems || 0);
          })
          .catch(() => {});
      })
      .finally(() => setSubmitting(false));
  };

  const showActionButtons = (sub) => {
    const { effectiveStatus } = sub;
    return (
      <div className="flex flex-wrap items-center gap-2">
        {(effectiveStatus === "active" || effectiveStatus === "expired") && (
          <>
            <button
              className="px-3 py-1 rounded-md bg-amber-500 text-white text-xs font-semibold"
              onClick={() => openActionDialog(sub, "suspend")}
            >
              Suspend
            </button>
            <button
              className="px-3 py-1 rounded-md bg-red-500 text-white text-xs font-semibold"
              onClick={() => openActionDialog(sub, "cancel")}
            >
              Cancel
            </button>
          </>
        )}
        {effectiveStatus === "suspended" && (
          <>
            <button
              className="px-3 py-1 rounded-md bg-green-500 text-white text-xs font-semibold"
              onClick={() => openActionDialog(sub, "resume")}
            >
              Resume
            </button>
            <button
              className="px-3 py-1 rounded-md bg-red-500 text-white text-xs font-semibold"
              onClick={() => openActionDialog(sub, "cancel")}
            >
              Cancel
            </button>
          </>
        )}
        {effectiveStatus === "cancelled" && (
          <span className="text-xs text-gray-400">Cancelled</span>
        )}
      </div>
    );
  };

  const totalPages = Math.max(1, Math.ceil(totalItems / LIMIT));
  const actionMeta = actionTarget ? ACTION_META[actionTarget.action] : null;

  const renderActionBody = () => {
    if (!actionTarget || !actionMeta) return null;
    const { sub, action } = actionTarget;
    const { label, Icon, iconClass, btnClass } = actionMeta;
    return (
      <>
        <h3 className="font-bold text-lg flex items-center gap-2">
          <Icon className={iconClass} />
          {label} Subscription
        </h3>
        <div className="mt-3 text-sm space-y-1.5 text-gray-600">
          <p>
            User: <span className="text-gray-900 font-medium">{sub.email}</span>
          </p>
          <p>
            Type: <span className="text-gray-900">{sub.typeName}</span>
          </p>
          <p className="flex items-center gap-2">
            Current status:{" "}
            <span className={`badge badge-sm ${statusBadge(sub.effectiveStatus)}`}>
              {sub.effectiveStatus}
            </span>
          </p>
          <p>
            Expires: <span className="text-gray-900">{formatDate(sub.expiresAt)}</span>
          </p>
        </div>
        <label className="block text-sm font-semibold mt-4">
          Note (optional)
        </label>
        <textarea
          className="input mt-1 min-h-[90px] resize-y"
          placeholder="e.g. Bounced payment, requested by user, policy violation..."
          value={note}
          maxLength={300}
          onChange={(e) => setNote(e.target.value)}
        />
        <p className="text-xs text-gray-400 mt-1">
          Will be shown in both admin and user subscription history.
        </p>
        <div className="flex justify-end gap-2 mt-4">
          <button
            className="px-4 py-2 rounded-md bg-slate-100 text-gray-700 font-semibold hover:bg-slate-200"
            onClick={() => actionDialogRef.current?.close()}
          >
            Cancel
          </button>
          <button
            className={`px-5 py-2 rounded-md text-white font-semibold ${btnClass} disabled:opacity-50 disabled:cursor-not-allowed`}
            disabled={submitting}
            onClick={confirmAction}
          >
            {submitting ? "Processing..." : label}
          </button>
        </div>
      </>
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-4">
      <h2 className="title !text-xl md:!text-4xl">Subscribers</h2>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 my-5">
        <select
          className="input"
          value={typeFilter}
          onChange={(e) => {
            setTypeFilter(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All Types</option>
          {types.map((type) => (
            <option key={type._id} value={type._id}>
              {type.name}
            </option>
          ))}
        </select>
        <input
          type="text"
          className="input"
          placeholder="Search by email..."
          value={emailSearch}
          onChange={(e) => {
            setEmailSearch(e.target.value);
            setPage(1);
          }}
        />
        <select
          className="input"
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="expired">Expired</option>
          <option value="suspended">Suspended</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Desktop table */}
      {loading ? (
        <p className="py-6 text-center text-gray-400">Loading...</p>
      ) : items.length === 0 ? (
        <p className="py-6 text-center text-gray-400">No subscribers found.</p>
      ) : (
        <>
          <div className="hidden md:block overflow-x-auto border border-slate-200 rounded-md shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr className="border-b border-slate-200 text-left">
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Expires At</th>
                  <th className="py-3 px-4">Days Left</th>
                  <th className="py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((sub) => (
                  <tr key={sub._id} className="border-b border-slate-100">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {sub.user?.photo && (
                          <img
                            src={sub.user.photo}
                            alt={sub.user.name || sub.email}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        )}
                        <span>{sub.user?.name || "—"}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">{sub.email}</td>
                    <td className="py-3 px-4">{sub.typeName}</td>
                    <td className="py-3 px-4">
                      <span className={`badge ${statusBadge(sub.effectiveStatus)}`}>
                        {sub.effectiveStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4">{formatDate(sub.expiresAt)}</td>
                    <td className="py-3 px-4">
                      {sub.effectiveStatus === "active" ? sub.daysRemaining : "—"}
                    </td>
                    <td className="py-3 px-4">{showActionButtons(sub)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {items.map((sub) => (
              <div
                key={sub._id}
                className="p-3 border border-slate-200 shadow-md rounded-md space-y-2"
              >
                <div className="flex justify-between items-start gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    {sub.user?.photo && (
                      <img
                        src={sub.user.photo}
                        alt={sub.user.name || sub.email}
                        className="w-9 h-9 rounded-full object-cover shrink-0"
                      />
                    )}
                    <div className="min-w-0">
                      <p className="font-semibold truncate">
                        {sub.user?.name || "—"}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {sub.email}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`badge ${statusBadge(sub.effectiveStatus)}`}
                  >
                    {sub.effectiveStatus}
                  </span>
                </div>
                <div className="text-sm text-gray-500 space-y-1">
                  <p>
                    Type: <span className="text-gray-900">{sub.typeName}</span>
                  </p>
                  <p>
                    Expires:{" "}
                    <span className="text-gray-900">
                      {formatDate(sub.expiresAt)}
                    </span>
                  </p>
                  {sub.effectiveStatus === "active" && (
                    <p>
                      Days left:{" "}
                      <span className="text-gray-900 font-semibold">
                        {sub.daysRemaining}
                      </span>
                    </p>
                  )}
                </div>
                <div className="pt-1">{showActionButtons(sub)}</div>
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

      {/* Custom action dialog with optional note */}
      <dialog ref={actionDialogRef} className="modal">
        <div className="modal-box bg-white max-w-md">
          <form method="dialog">
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
              ✕
            </button>
          </form>
          {renderActionBody()}
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </div>
  );
};

export default Subscribers;
