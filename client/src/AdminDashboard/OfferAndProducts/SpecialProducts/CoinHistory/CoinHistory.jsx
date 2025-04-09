import { useEffect, useState } from "react";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import toast from "react-hot-toast";
import InfiniteScroll from "react-infinite-scroll-component";
import InfinityLoader from "../../../../components/InfinityLoader";
import Coin from "../../../../components/reusuable/Coin/Coin";



const AdminCoinHistory = () => {

    const [historyData, setHistoryData] = useState([]);
    const [totalData, setTotalData] = useState(0);
    const [loading, setLoading] = useState(true);
    const [searchEmail, setSearchEmail] = useState("");
    const limit = 5;
    const page = Math.ceil(historyData.length / limit + 1);
    const axiosPrivate = useAxiosPrivate();


    const fetchData = async () => {
        try {
            const res = await axiosPrivate.get(`/coins/history?page=${page}&limit=${limit}&email=${searchEmail}`);
            // console.log(res.data, "---------data");
            setHistoryData([...historyData, ...res.data.history]);
            setTotalData(res.data?.totalHistory || 0)
        }
        catch (err) {
            // console.log(err);
            toast.error(err?.response?.data?.message || "Error Fetching Data!")
        }
        finally {
            setLoading(false);
        }
    };

    const fetchMoreData = () => {
        if (totalData > historyData?.length) {
            fetchData();
        }
    };

    useEffect(() => {
        setHistoryData([]);
        fetchData();
    }, [searchEmail]);


    // page apear from top
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    if (loading) {
        return <div className="py-8 text-center">Loading...</div>
    }

    return (
        <div className="max-w-2xl mx-auto">
            <h2 className="title">Coin History</h2>

            {/* user email for filter */}
            <div className="">
                <label className="input-label">Search By Email</label>
                <input
                    type="text"
                    className="input"
                    placeholder="User's email"
                    onChange={(e) => setSearchEmail(e.target.value)}
                />
            </div>

            {/* all history */}
            {
                historyData?.length == 0 ?
                    <div className={`${loading && "hidden"} py-8 text-center`}>No Data Found!</div>
                    :
                    <div className="py-4">
                        <InfiniteScroll
                            dataLength={historyData.length}
                            hasMore={historyData.length < totalData}
                            next={fetchMoreData}
                            loader={<InfinityLoader />}
                        >
                            <div className="space-y-3">
                                {historyData.map((item) => (
                                    <div key={item?._id} className="flex justify-between items-center bg-slate-100 px-4 py-2 rounded-sm">
                                        <div>
                                            <div className="flex items-center gap-2 text-sm pb-1">
                                                <span>{item?.email}</span>
                                                <span className="mt-1"><Coin /> {item?.amount}</span>
                                            </div>
                                            <p className="text-sm">{item?.name}</p>
                                        </div>
                                        <div>
                                            <div className={`badge ${item?.status == "pending" ? "badge-error" : "badge-success"} text-white capitalize`}>
                                                {item?.status}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </InfiniteScroll>
                    </div>
            }

        </div>
    );
};

export default AdminCoinHistory;