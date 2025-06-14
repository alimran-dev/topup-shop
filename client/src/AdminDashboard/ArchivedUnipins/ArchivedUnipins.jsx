import { useEffect, useState } from "react";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import toast from 'react-hot-toast';
import InfiniteScroll from "react-infinite-scroll-component";
import InfinityLoader from "../../components/InfinityLoader";
import OrderCard from "../Orders/OrderCard";


const ArchivedUnipins = () => {

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [totalOrders, setTotalOrders] = useState(0);
    const [searchText, setSearchText] = useState("");
    const axiosPrivate = useAxiosPrivate();
    const limit = 5;
    const page = Math.ceil(orders.length / limit + 1);


    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await axiosPrivate.get(`/order/archived?page=${page}&limit=${limit}&search=${searchText}`);
            // console.log(res.data), "------------res";
            setOrders(res?.data?.orders || []);
            setTotalOrders(res?.data?.totalOrders || 0);
        }
        catch (err) {
            console.log("Error Fetching Unipin Order", err);
            toast.error("Failed to load!")
        }
        finally {
            setLoading(false);
        }
    };


    const fetchMoreData = () => {
        if (totalOrders > orders.length) {
            fetchData();
        }
    };

    useEffect(() => {
        setOrders([]);
        fetchData();
    }, [searchText]);


    // page apear from top
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);


    // console.log(orders);



    return (
        <div>
            <h2 className="title">Archived Unipins</h2>
            <form className="max-w-xl mx-auto">
                <label htmlFor="" className="input-label">Search By Unipin</label>
                <input type="text" onChange={(e) => setSearchText(e.target.value)} className="input" value={searchText} placeholder="Type Unipin" />
            </form>

            {
                loading ?
                    <div className="py-8 text-center">Loading...</div>
                    :
                    <>
                        {
                            orders?.length == 0 ?
                                <div className="py-8 text-center">No Data Found!</div>
                                :
                                <>
                                    <InfiniteScroll
                                        dataLength={orders.length}
                                        hasMore={orders.length < totalOrders}
                                        next={fetchMoreData}
                                        loader={<InfinityLoader />}
                                    >
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            {orders.map((order) => (
                                                <OrderCard
                                                    order={order}
                                                    orders={orders}
                                                    setOrders={setOrders}
                                                    fromPending={false}
                                                    totalOrders={totalOrders}
                                                    setTotalOrders={setTotalOrders}
                                                    key={order._id}
                                                />
                                            ))}
                                        </div>
                                    </InfiniteScroll>
                                </>
                        }
                    </>
            }
        </div>
    );
};

export default ArchivedUnipins; 