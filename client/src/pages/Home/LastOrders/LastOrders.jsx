import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaChevronRight } from "react-icons/fa";
import useAxiosPublic from "../../../hooks/useAxiosPublic";
import Avatar from "../../../components/reusuable/Avatar/Avatar";
import UserName from "../../../components/reusuable/UserName/UserName";

const statusClass = (status) =>
  status === "pending"
    ? "bg-yellow-500"
    : status === "complete"
      ? "bg-green-500"
      : status === "cancelled"
        ? "bg-red-500"
        : "bg-gray-300";

const LastOrders = () => {
    const [lastOrders, setLastOrders] = useState([]);
    const [showPrice, setShowPrice] = useState(true);
    const [loading, setLoading] = useState(false);
    const axiosPublic = useAxiosPublic();

    useEffect(() => {
        const fetchLastOrders = async () => {
            setLoading(true);
            try {
                const { data } = await axiosPublic.get("/order/last");
                setLastOrders(data?.orders || []);
                setShowPrice(data?.showPrice !== false);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching last orders:", error);
                setLoading(false);
            }
        };
        fetchLastOrders();
    }, [axiosPublic]);

    return (
        <div className="max-w-5xl mx-auto pb-8">
            <h2 className="title">Last Orders</h2>
            <div className="p-3 sm:p-5 bg-slate-50 rounded-md">
                {
                    loading ?
                        <div className="text-center py-5">Loading...</div>
                        :
                        <>
                            {lastOrders?.length > 0 ? (
                                <div className="space-y-2">
                                    {lastOrders?.map((order) => {
                                        const colors = order?.highlightColors;
                                        // Orders whose owner has an active subscription get the
                                        // themed highlight and link to the subscriptions page.
                                        const subscribed = !!colors;
                                        const row = (
                                            <>
                                                {order?.photo ?
                                                    <img src={order?.photo} className="w-10 h-10 object-cover rounded-full shrink-0" alt={order?.name} />
                                                    :
                                                    <Avatar className="shrink-0" />
                                                }
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-1.5 min-w-0">
                                                        <UserName name={order?.name} isVerified={order?.isVerified} iconClass="w-4 h-4" nameClass="truncate" />
                                                        {subscribed && (
                                                            <span
                                                                className="badge shrink-0 text-white text-[9px] sm:text-[10px] font-bold uppercase px-1.5 py-0.5"
                                                                style={{ backgroundColor: colors.primaryColor }}
                                                            >
                                                                {colors.typeName}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="truncate text-gray-600 mt-0.5">
                                                        {order?.package}{order?.quantity ? ` [x${order?.quantity}]` : ""} - {showPrice ? (order?.type === "balance" ? `৳${order?.price}` : <span className="text-green-500 font-semibold">Free</span>) : <span>*****</span>}
                                                    </p>
                                                </div>
                                                <span className={`shrink-0 px-2.5 py-1 whitespace-nowrap text-white capitalize rounded-full text-[10px] ${statusClass(order?.status)}`}>
                                                    • {order?.status}
                                                </span>
                                                {subscribed && (
                                                    <FaChevronRight className="shrink-0 text-primary text-xs" />
                                                )}
                                            </>
                                        );
                                        const cardClass = `flex items-center gap-2 sm:gap-3 rounded-lg py-2.5 px-3 text-xs md:text-sm border ${
                                            subscribed
                                                ? "cursor-pointer hover:opacity-90 active:scale-[0.99] transition"
                                                : "border-transparent"
                                        }`;
                                        const cardStyle = subscribed ? {
                                            borderColor: colors.primaryColor,
                                            background: `linear-gradient(100deg, ${colors.primaryColor}40 0%, ${colors.primaryColor}14 55%, transparent 100%)`,
                                            boxShadow: `0 2px 10px -2px ${colors.primaryColor}55`,
                                        } : undefined;
                                        return subscribed ? (
                                            <Link key={order?._id} to="/subscriptions" title="View subscription plans" className={cardClass} style={cardStyle}>
                                                {row}
                                            </Link>
                                        ) : (
                                            <div key={order?._id} className={cardClass} style={cardStyle}>
                                                {row}
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <p className="text-center text-gray-500 py-5">No recent orders</p>
                            )}
                        </>
                }
            </div>
        </div>
    );
};

export default LastOrders;
