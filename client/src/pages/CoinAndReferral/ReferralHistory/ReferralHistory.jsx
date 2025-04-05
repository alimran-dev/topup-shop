import { useEffect, useState } from "react";
import Coin from "../../../components/reusuable/Coin/Coin";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import toast from "react-hot-toast";
import useAuth from "../../../hooks/useAuth";
import InfiniteScroll from "react-infinite-scroll-component";
import InfinityLoader from "../../../components/InfinityLoader";


const ReferralHistory = () => {

    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalHistory, setTotalHistory] = useState(0);
    const axiosPrivate = useAxiosPrivate();
    const { user } = useAuth();
    const limit = 10;
    const page = Math.ceil(history.length / limit + 1);



    const fetchHistory = async () => {
        try {
            const res = await axiosPrivate.get(`/user/refer/history?page=${page}&limit=${limit}&referredBy=${user?.email}&referredTo=${user?.email}`);
            console.log(res.data);
            setHistory([...history, ...res.data.history]);
            setTotalHistory(res.data.totalRef);
        } catch (err) {
            toast.error("Failed to load products.");
        } finally {
            setLoading(false);
        }
    };


    const getMoreOrders = () => {
        if (history.length < totalHistory) {
            fetchHistory();
        }
    };
    useEffect(() => {
        setHistory([]);
        fetchHistory();
    }, [axiosPrivate]);


    // page apear from top
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    console.log(history);



    if (loading) {
        return <div className="py-8 text-center">Loading...</div>
    }

    return (
        <div className="max-w-5xl mx-auto px-4 py-3 md:py-6 border border-slate-300 rounded-md">
            <h3 className="title">Referral History</h3>

            {
                history?.length == 0 ?
                    <div className="py-8 text-center">No Data Found!</div>
                    :
                    <InfiniteScroll
                        dataLength={history.length}
                        next={getMoreOrders}
                        hasMore={history.length < totalHistory}
                        loader={<InfinityLoader />}
                    >
                        <div className="grid grid-cols-1 gap-4">
                            {history?.length > 0 &&
                                history.map((item) => (
                                    <div key={item?._id} className="bg-slate-100 px-4 py-2 flex justify-between items-center text-xs md:text-sm">
                                        <div>
                                            <div className="text-center pb-1">Refered By: {item?.referredBy}</div>
                                            <div className="flex items-center gap-1">
                                                <Coin />
                                                {item?.coinReferTo}
                                            </div>
                                        </div>
                                        <div className={`badge ${item?.status == "success" ? "badge-success" : "badge-error"} text-white capitalize text-[10px] md:text-xs`}>
                                            {item?.status}
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </InfiniteScroll>
            }

        </div>
    );
};

export default ReferralHistory;