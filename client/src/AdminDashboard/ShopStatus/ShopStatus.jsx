import { useEffect, useState } from "react";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import Loader from "../../components/Loader";
import { HiStatusOnline } from "react-icons/hi";
import { MdOutlineErrorOutline } from "react-icons/md";

const ShopStatus = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const axiosPrivate = useAxiosPrivate();

  useEffect(() => {
    axiosPrivate
      .get("/auto/status")
      .then((res) => {
        setData(res.data);
        setIsLoading(false);
      })
      .catch((err) => {
        setError(err?.response?.data?.message || "Failed to fetch status");
        setIsLoading(false);
      });
  }, [axiosPrivate]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const statusData = data?.data;

  const StatusRow = ({ label, value, isBadge, isLast }) => (
    <div className={`flex justify-between items-center ${isLast ? "" : "border-b pb-3"}`}>
      <span className="text-gray-600 font-medium">{label}</span>
      {isBadge ? (
        <span
          className={`font-semibold px-3 py-1 rounded-full text-sm ${
            value === "active" || value === false
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {typeof value === "boolean" ? (value ? "Yes" : "No") : value}
        </span>
      ) : (
        <span className="text-gray-900 font-semibold">{value}</span>
      )}
    </div>
  );

  const SectionCard = ({ title, icon, children }) => (
    <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
      <div className="bg-gradient-to-r from-primary to-secondary px-6 py-4">
        <h2 className="text-white text-xl font-semibold flex items-center gap-2">
          {icon}
          {title}
        </h2>
      </div>
      <div className="p-6 space-y-3">{children}</div>
    </div>
  );

  return (
    <div>
      <Loader isLoading={isLoading} />

      <h1 className="text-center text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text mb-8">
        Auto Status
      </h1>

      {error && (
        <div className="max-w-md mx-auto bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <MdOutlineErrorOutline className="text-5xl text-red-500 mx-auto mb-3" />
          <p className="text-red-600 text-lg font-medium">{error}</p>
        </div>
      )}

      {!isLoading && !error && statusData && (
        <div className="max-w-2xl mx-auto space-y-6">
          <SectionCard
            title="Account Overview"
            icon={<HiStatusOnline className="text-2xl" />}
          >
            <StatusRow label="Name" value={statusData.name} />
            <StatusRow
              label="Account Status"
              value={statusData.account_status}
              isBadge
            />
            <StatusRow label="Expiry Date" value={statusData.expiry_date} />
            <StatusRow
              label="Expired"
              value={statusData.is_expired}
              isBadge
              isLast
            />
          </SectionCard>

          <SectionCard title="Credits" icon={null}>
            <StatusRow label="Max Limit" value={statusData.credits.max_limit} />
            <StatusRow
              label="Limit Left"
              value={statusData.credits.limit_left}
            />
            <StatusRow
              label="Used This Month"
              value={statusData.credits.used_this_month}
              isLast
            />
          </SectionCard>

          <SectionCard title="Less is More Glitch" icon={null}>
            <StatusRow
              label="Max Limit"
              value={statusData.less_is_more_glitch.max_limit}
            />
            <StatusRow
              label="Limit Left"
              value={statusData.less_is_more_glitch.limit_left}
            />
            <StatusRow
              label="Used This Month"
              value={statusData.less_is_more_glitch.used_this_month}
            />
            <StatusRow
              label="Normal Fallback Multiplier"
              value={statusData.less_is_more_glitch.normal_fallback_multiplier}
              isLast
            />
          </SectionCard>
        </div>
      )}
    </div>
  );
};

export default ShopStatus;