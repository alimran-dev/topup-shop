import { useEffect, useState } from "react";
import useAxiosPublic from "../../../hooks/useAxiosPublic";
import Avatar from "../../../components/reusuable/Avatar/Avatar";

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
                                    <div key={order?._id} className="grid grid-cols-4 md:grid-cols-3 items-center text-xs md:text-sm py-2 border-b">
                                        <div className="col-span-2 md:col-span-1 flex items-center gap-2">
                                            {
                                                order?.photo ?
                                                    <img src={order?.photo} className="w-10 h-10 object-cover rounded-full" alt={order?.name} />
                                                    :
                                                    <Avatar />
                                            }
                                            <p>{order?.name}</p>
                                        </div>
                                        <div className="text-center">{order?.package}</div>
                                        <div className="flex justify-end items-center gap-1">
                                            ৳{order?.price}
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
