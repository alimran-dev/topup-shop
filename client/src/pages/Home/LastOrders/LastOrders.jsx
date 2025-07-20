import { useEffect, useState } from "react";
import useAxiosPublic from "../../../hooks/useAxiosPublic";
import Avatar from "../../../components/reusuable/Avatar/Avatar";
import UserName from "../../../components/reusuable/UserName/UserName";

const LastOrders = () => {
    const [lastOrders, setLastOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const axiosPublic = useAxiosPublic();

    useEffect(() => {
        const fetchLastOrders = async () => {
            setLoading(true);
            try {
                const { data } = await axiosPublic.get("/order/last");
                setLastOrders(data);
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
            <div className="p-5 bg-slate-50 rounded-md">
                {
                    loading ?
                        <div className="text-center py-5">Loading...</div>
                        :
                        <>
                            {lastOrders?.length > 0 ? (
                                lastOrders?.map((order) => (
                                    <div key={order?._id} className="flex justify-between items-center text-xs md:text-sm py-3 border-b">
                                        <div className="col-span-2 md:col-span-1 flex items-center gap-2">
                                            {
                                                order?.photo ?
                                                    <img src={order?.photo} className="w-10 h-10 object-cover rounded-full" alt={order?.name} />
                                                    :
                                                    <Avatar />
                                            }
                                            <div>
                                            <UserName name={order?.name} isVerified={order?.isVerified} iconClass="w-4 h-4" />
                                                <p className="text-center text-[10px] text-xs">
                                                    {order?.package} {order?.quantity ? `[x${order?.quantity}]`: ""} - {order?.type==="balance" ? `৳${order?.price}`:<span className="text-green-500 font-semibold">Free</span>}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex justify-end">
                                            <div className={`${order?.status === 'pending' ? 'bg-yellow-500' : order?.status === 'complete' ? 'bg-green-500' : order?.status === 'cancelled' ? 'bg-red-500' : 'bg-gray-300'} px-3 py-1 w-20 text-center text-white capitalize rounded-full text-[10px]`}>
                                                • {order?.status}
                                            </div>
                                        </div>

                                    </div>
                                ))
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
