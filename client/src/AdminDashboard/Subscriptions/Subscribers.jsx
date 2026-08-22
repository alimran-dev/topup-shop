import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
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
  date ? new Date(date).toLocaleString() : "—";

const Subscribers = () => {
  const [items, setItems] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [page, setPage] = useState(1);
  const [types, setTypes] = useState([]);
  const [typeFilter, setTypeFilter] = useState("");
  const [emailSearch, setEmailSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const axiosPrivate = useAxiosPrivate();

  useEffect(() => {
    axiosPrivate
      .get("/subscription/admin/types")
      .then((res) => setTypes(res.data || []))
      .catch(() => toast.error("Failed to load types!"));
  }, [axiosPrivate]);

  useEffect(() => {
    const params = new URLSearchParams({ page, limit: LIMIT });
    if (typeFilter) params.set("typeId", typeFilter);
    if (emailSearch) params.set("email", emailSearch);
    if (statusFilter) params.set("status", statusFilter);

    setLoading(true);
    axiosPrivate
      .get(`/subscription/admin/subscribers?${params}`)
      .then((res) => {
        setItems(res.data?.items || []);
        setTotalItems(res.data?.totalItems || 0);
      })
      .catch(() => toast.error("Failed to load subscribers!"))
      .finally(() => setLoading(false));
  }, [axiosPrivate, page, typeFilter, emailSearch, statusFilter]);

  const handleAction = (sub, action) => {
    const label = action === "suspend" ? "suspend" : action === "resume" ? "resume" : "cancel";
    Swal.fire({
      title: "Are you sure?",
      text: `You are about to ${label} the subscription of ${sub.email}.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: label.charAt(0).toUpperCase() + label.slice(1),
    }).then((result) => {
      if (!result.isConfirmed) return;
      axiosPrivate
        .post("/subscription/admin/actions", { id: sub._id, action })
        .then((res) => {
          if (res.data?.success) {
            toast.success(
              `Subscription ${
                action === "suspend"
                  ? "suspended"
                  : action === "resume"
                  ? "resumed"
                  : "cancelled"
              } successfully!`
            );
            setPage(1);
            // force refetch
            const params = new URLSearchParams({ page: 1, limit: LIMIT });
            if (typeFilter) params.set("typeId", typeFilter);
            if (emailSearch) params.set("email", emailSearch);
            if (statusFilter) params.set("status", statusFilter);
            axiosPrivate
              .get(`/subscription/admin/subscribers?${params}`)
              .then((r) => {
                setItems(r.data?.items || []);
                setTotalItems(r.data?.totalItems || 0);
              })
              .catch(() => toast.error("Failed to refresh!"));
          }
        })
        .catch((err) =>
          toast.error(err?.response?.data?.message || "Action failed!")
        );
    });
  };

  const showActionButtons = (sub) => {
    const { effectiveStatus } = sub;
    return (
      <div className="flex items-center gap-2">
        {(effectiveStatus === "active" || effectiveStatus === "expired") && (
          <>
            <button
              className="px-3 py-1 rounded-md bg-warning text-white text-xs font-semibold"
              onClick={() => handleAction(sub, "suspend")}
            >
              Suspend
            </button>
            <button
              className="px-3 py-1 rounded-md bg-red-500 text-white text-xs font-semibold"
              onClick={() => handleAction(sub, "cancel")}
            >
              Cancel
            </button>
          </>
        )}
        {effectiveStatus === "suspended" && (
          <>
            <button
              className="px-3 py-1 rounded-md bg-success text-white text-xs font-semibold"
              onClick={() => handleAction(sub, "resume")}
            >
              Resume
            </button>
            <button
              className="px-3 py-1 rounded-md bg-red-500 text-white text-xs font-semibold"
              onClick={() => handleAction(sub, "cancel")}
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

      {/* Table */}
      <div className="overflow-x-auto border border-slate-200 rounded-md shadow-sm">
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
            {loading && (
              <tr>
                <td colSpan={7} className="py-6 text-center text-gray-400">
                  Loading...
                </td>
              </tr>
            )}
            {!loading && items.length === 0 && (
              <tr>
                <td colSpan={7} className="py-6 text-center text-gray-400">
                  No subscribers found.
                </td>
              </tr>
            )}
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

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />
    </div>
  );
};

export default Subscribers;
