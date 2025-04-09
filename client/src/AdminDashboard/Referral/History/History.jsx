import { useEffect, useState } from "react";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import InfiniteScroll from "react-infinite-scroll-component";
import InfinityLoader from "../../../components/InfinityLoader";
import Coin from "../../../components/reusuable/Coin/Coin";
import toast from "react-hot-toast";


const History = () => {

    const [historyData, setHistoryData] = useState([]);
    const [totalData, setTotalData] = useState(0);
    const [loading, setLoading] = useState(true);
    const limit = 5;
    const page = Math.ceil(historyData.length / limit + 1);
    const axiosPrivate = useAxiosPrivate();
    const [formData, setFormData] = useState({
        referedBy: "",
        referTo: "",
    });


    const fetchData = async () => {
        try {
            const res = await axiosPrivate.get(`/user/refer/history?page=${page}&limit=${limit}&referredBy=${formData?.referedBy}&referredTo=${formData?.referTo}`);
            // console.log(res.data, "---------data");
            setHistoryData([...historyData, ...res.data.history]);
            setTotalData(res.data?.totalRef || 0)
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

    const handleSubmit = (e) => {
        e.preventDefault();

        const data = {
            referedBy: e.target.referedBy.value,
            referTo: e.target.referTo.value
        };

        setFormData(data)
        setHistoryData([]);
        // fetchData();
    };

    useEffect(() => {
        setHistoryData([]);
        fetchData();
    }, [formData]);


    // page apear from top
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    if (loading) {
        return <div className="py-8 text-center">Loading...</div>
    }

    return (
        <div>
            <h2 className="title">Referral History</h2>

            {/* Filter form */}
            <form
                onSubmit={handleSubmit}
                className="max-w-xl mx-auto flex flex-col md:flex-row items-center"
            >
                <div className="flex-1 grid grid-cols-2 gap-4">
                    <div>
                        <label className="input-label">Referred By</label>
                        <input
                            type="text"
                            name="referedBy"
                            className="input"
                            placeholder="Referred by..."
                        />
                    </div>
                    <div>
                        <label className="input-label">Referred To</label>
                        <input
                            type="text"
                            name="referTo"
                            className="input"
                            placeholder="Refer to..."
                        />
                    </div>
                </div>
                <button
                    type="submit"
                    className="button mt-4 md:mt-10 md:ml-5"
                >
                    Search
                </button>
            </form>

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
                            <div className="max-w-2xl mx-auto space-y-3">
                                {historyData.map((item) => (
                                    <div key={item?._id} className="flex justify-between items-center bg-slate-100 px-4 py-2 rounded-sm">
                                        <div>
                                            <div className="flex items-center gap-2 text-xs pb-1">
                                                <span className="font-semibold">Refer From:</span>
                                                <span>{item?.referredBy}</span>
                                                <span className="mt-1"><Coin /> {item?.coinReferFrom}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs">
                                                <span className="font-semibold">Refer To:</span>
                                                <span>{item?.referredTo}</span>
                                                <span className="mt-1"><Coin /> {item?.coinReferTo}</span>
                                            </div>
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

export default History;