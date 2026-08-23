import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import Loader from "../../components/Loader";
import InfinityLoader from "../../components/InfinityLoader";
import InfiniteScroll from "react-infinite-scroll-component";
import { Link } from "react-router-dom";

const statusBadge = (status) => {
  const map = {
    active: "badge-success",
    suspended: "badge-warning",
    expired: "badge-ghost",
    cancelled: "badge-error",
  };
  return map[status] || "badge-ghost";
};

const eventLabel = (eventType) =>
  ({
    purchase: "Purchase",
    suspend: "Suspend",
    resume: "Resume",
    cancel: "Cancel",
  }[eventType] || eventType);

const formatDate = (date) =>
  date ? new Date(date).toLocaleDateString("en-GB") : "—";

const LIMIT = 5;

const MySubscription = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [history, setHistory] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAgreement, setSelectedAgreement] = useState(null);
  const modalRef = useRef(null);
  const axiosPrivate = useAxiosPrivate();

  const page = Math.ceil(history.length / LIMIT + 1);

  const getHistory = () => {
    axiosPrivate
      .get(`/subscription/my/history?page=${page}&limit=${LIMIT}`)
      .then((res) => {
        setHistory([...history, ...(res.data?.items || [])]);
        setTotalItems(res.data?.totalItems || 0);
      })
      .catch(() => toast.error("Failed to load history!"));
  };

  const getMoreHistory = () => {
    if (history.length < totalItems) {
      getHistory();
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    Promise.all([
      axiosPrivate.get("/subscription/my"),
      axiosPrivate.get(`/subscription/my/history?page=1&limit=${LIMIT}`),
    ])
      .then(([myRes, historyRes]) => {
        setSubscriptions(myRes.data?.subscriptions || []);
        setHistory(historyRes.data?.items || []);
        setTotalItems(historyRes.data?.totalItems || 0);
      })
      .catch(() => toast.error("Failed to load subscription data!"))
      .finally(() => setIsLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [axiosPrivate]);

  const showAgreement = (agreement) => {
    setSelectedAgreement(agreement);
    modalRef.current?.showModal();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Loader isLoading={isLoading} />

      <h2 className="text-xl md:text-3xl uppercase bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent font-bold text-center">
        My Subscription
      </h2>

      {/* current subscriptions */}
      <div className="mt-8">
        <h3 className="text-lg font-bold mb-3">Current Subscriptions</h3>
        {subscriptions.length === 0 && (
          <div className="h-full w-full flex flex-col items-center justify-center gap-2 border border-slate-200 rounded-lg py-10">
            <span className="text-2xl font-medium text-gray-400">
              No Subscription Yet
            </span>
            <Link
              to={"/subscriptions"}
              className="border-2 border-primary px-4 py-0.5 rounded font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"
            >
              Subscribe
            </Link>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {subscriptions.map((sub) => (
            <div
              key={sub._id}
              className="border-2 border-slate-200 border-b-4 border-b-primary rounded-xl p-5"
            >
              <div className="flex justify-between items-start gap-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-secondary">
                    {sub.typeName}
                  </p>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {sub.lastPackageName}
                  </p>
                </div>
                <span className={`badge ${statusBadge(sub.effectiveStatus)}`}>
                  {sub.effectiveStatus}
                </span>
              </div>
              <div className="mt-3 text-sm space-y-1 text-gray-600">
                <p>
                  Started:{" "}
                  <span className="text-gray-900">
                    {formatDate(sub.startedAt)}
                  </span>
                </p>
                <p>
                  Expires:{" "}
                  <span className="text-gray-900">
                    {formatDate(sub.expiresAt)}
                  </span>
                </p>
                {sub.effectiveStatus === "active" && (
                  <p>
                    Days remaining:{" "}
                    <span className="text-gray-900 font-semibold">
                      {sub.daysRemaining}
                    </span>
                  </p>
                )}
                {sub.effectiveStatus === "suspended" && sub.suspendedAt && (
                  <p className="text-warning">
                    Suspended on {formatDate(sub.suspendedAt)}
                  </p>
                )}
                {sub.effectiveStatus === "cancelled" && sub.cancelledAt && (
                  <p className="text-error">
                    Cancelled on {formatDate(sub.cancelledAt)}
                  </p>
                )}
              </div>
              {/* active subs can extend (purchase extends expiry from
                  max(now, expiresAt)); suspended is excluded — admin must
                  resume before the user can buy again */}
              {(sub.effectiveStatus === "active" ||
                sub.effectiveStatus === "cancelled" ||
                sub.effectiveStatus === "expired") && (
                <Link
                  to="/subscriptions"
                  className="block text-center bg-gradient-to-r from-primary to-secondary text-white text-sm font-semibold rounded-md py-1.5 mt-4"
                >
                  {sub.effectiveStatus === "active"
                    ? "Extend"
                    : sub.effectiveStatus === "cancelled"
                    ? "Buy Again"
                    : "Renew"}
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* purchase & action history */}
      <div className="mt-10">
        <h3 className="text-lg font-bold mb-3">Subscription History</h3>
        <InfiniteScroll
          dataLength={history.length}
          next={getMoreHistory}
          hasMore={history.length < totalItems}
          loader={<InfinityLoader />}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {history.map((item, idx) => (
              <div
                key={item._id || idx}
                className="border border-slate-200 rounded-xl p-4"
              >
                <div className="flex justify-between items-center gap-2">
                  <span
                    className={`badge ${
                      item.eventType === "purchase"
                        ? "bg-primary text-white border-primary"
                        : item.eventType === "suspend"
                        ? "badge-warning"
                        : item.eventType === "resume"
                        ? "badge-success"
                        : "badge-error"
                    }`}
                  >
                    {eventLabel(item.eventType)}
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatDate(item.createdAt)}
                  </span>
                </div>
                <div className="mt-2 text-sm text-gray-600">
                  <p>
                    <span className="text-gray-900 font-medium">
                      {item.typeName}
                    </span>
                  </p>
                  {item.eventType === "purchase" ? (
                    <>
                      <p>
                        {item.packageName} · ৳{item.price} ·{" "}
                        {item.durationDays} days
                      </p>
                      {item.agreement && (
                        <button
                          className="text-primary hover:opacity-70 text-xs font-semibold mt-1"
                          onClick={() => showAgreement(item.agreement)}
                        >
                          View Agreed T&amp;C
                        </button>
                      )}
                    </>
                  ) : (
                    <>
                      <p className="text-xs text-gray-500">
                        {item.note ? `Note: ${item.note}` : "by admin"}
                      </p>
                      {item.newExpiresAt && (
                        <p className="text-xs text-gray-500">
                          Expires: {formatDate(item.newExpiresAt)}
                        </p>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </InfiniteScroll>
        {history.length === 0 && !isLoading && (
          <div className="h-full w-full flex flex-col items-center justify-center gap-2 border border-slate-200 rounded-lg py-10">
            <span className="text-2xl font-medium text-gray-400">
              No History Data
            </span>
          </div>
        )}
      </div>

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

export default MySubscription;
