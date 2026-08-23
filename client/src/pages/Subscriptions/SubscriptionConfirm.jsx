import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import useAuth from "../../hooks/useAuth";
import Loader from "../../components/Loader";

const formatDuration = (pkg) => {
  const n = pkg.duration;
  const unit = pkg.durationUnit === "months" ? "Month" : "Day";
  return `${n} ${unit}${n === 1 ? "" : "s"}`;
};

const formatDate = (date) =>
  date ? new Date(date).toLocaleDateString("en-GB") : "";

const SubscriptionConfirm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const axiosPrivate = useAxiosPrivate();
  const { user, setUser } = useAuth();

  // location.state is null when the page is opened directly (new tab,
  // bookmark, shared link) — redirect to the catalog.
  const { package: pkg, typeName } = location.state || {};

  const [currentSub, setCurrentSub] = useState(null);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // What happens to the current subscription if there is one
  useEffect(() => {
    if (!pkg) {
      navigate("/subscriptions", { replace: true });
      return;
    }
    axiosPrivate
      .get("/subscription/my")
      .then((res) => {
        const subs = res.data?.subscriptions || [];
        const found = subs.find((s) => s.typeId === pkg.typeId);
        setCurrentSub(
          found && found.effectiveStatus !== "cancelled" ? found : null
        );
      })
      .catch(() => {})
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pkg]);

  if (loading) {
    return <Loader isLoading={true} />;
  }

  const handleConfirm = () => {
    if (!agreed) {
      toast.error("Please agree to the terms and conditions!");
      return;
    }
    setSubmitting(true);
    axiosPrivate
      .post("/subscription/purchase", {
        packageId: pkg._id,
        email: user?.email,
        agreed,
      })
      .then((res) => {
        if (res.data?.success) {
          toast.success("Subscription purchased successfully!");
          setUser({
            ...user,
            hasActiveSubscription: true,
            // winning-tier theme (server-computed) — applies instantly
            subscriptionTheme: res.data.subscriptionTheme,
            balance: user?.balance - res.data.price,
            spent: (user?.spent || 0) + res.data.price,
          });
          navigate("/mySubscription");
        } else {
          toast.error(res.data?.message || "Purchase failed!");
        }
      })
      .catch((err) => {
        const message =
          err?.response?.data?.error || err?.response?.data?.message;
        if (message?.toLowerCase().includes("balance")) {
          const restAmount = Math.ceil(pkg.price - (user?.balance || 0));
          navigate("/addBalance/method", {
            state: { amount: Math.max(restAmount, 0), from: "confirmPurchase" },
          });
        } else {
          toast.error(message || "Purchase failed!");
        }
      })
      .finally(() => setSubmitting(false));
  };

  if (!pkg) return null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h2 className="text-xl md:text-3xl uppercase bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent font-bold text-center">
        Confirm Subscription Purchase
      </h2>

      {/* package summary */}
      <div className="border-2 border-slate-200 border-b-4 border-b-primary rounded-xl p-5 mt-6">
        <span className="text-xs font-semibold uppercase tracking-wide text-secondary">
          {typeName || pkg.typeName}
        </span>
        <h3 className="text-lg font-bold mt-1">{pkg.name}</h3>
        <p className="text-sm text-gray-500 mt-1">{formatDuration(pkg)}</p>
        <div className="flex justify-between items-center mt-3">
          <p className="text-2xl font-bold text-secondary">৳{pkg.price}</p>
          <p className="text-sm text-gray-500">
            Balance: ৳{user?.balance || 0}
          </p>
        </div>
        {currentSub && (
          <p className="text-sm mt-3 p-3 bg-slate-50 border border-slate-200 rounded-md">
            You already have an active subscription of this type (expires{" "}
            {formatDate(currentSub.expiresAt)}). This purchase will{" "}
            <span className="font-semibold">extend</span> it by{" "}
            {pkg.durationDays} days.
          </p>
        )}
      </div>

      {/* terms & conditions */}
      <div className="mt-6">
        <label className="text-sm font-semibold">Terms &amp; Conditions</label>
        <div
          className="rich-text-output max-h-[40vh] overflow-y-auto border border-slate-200 rounded-md p-3 mt-2"
          dangerouslySetInnerHTML={{ __html: pkg.termsAndConditions || "" }}
        />
        <label className="flex items-start gap-2 cursor-pointer mt-4">
          <input
            type="checkbox"
            className="checkbox checkbox-sm checked:border-primary [--chkbg:rgb(var(--theme-primary))] [--chkfg:#fff] mt-0.5"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
          />
          <span className="text-sm">
            I agree to the terms and conditions
          </span>
        </label>
      </div>

      <button
        className="w-full bg-gradient-to-r from-primary to-secondary text-white font-semibold rounded-md py-2.5 mt-5 disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={submitting || !agreed}
        onClick={handleConfirm}
      >
        {submitting ? "Processing..." : `Confirm Purchase — ৳${pkg.price}`}
      </button>
    </div>
  );
};

export default SubscriptionConfirm;
