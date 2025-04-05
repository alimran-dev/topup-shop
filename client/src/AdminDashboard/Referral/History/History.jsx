import { useEffect, useState } from "react";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import InfiniteScroll from "react-infinite-scroll-component";
import InfinityLoader from "../../../components/InfinityLoader";
import Coin from "../../../components/reusuable/Coin/Coin";


const History = () => {

    const [historyData, setHistoryData] = useState([]);
    const [totalData, setTotalData] = useState(0);
    const [loading, setloading] = useState(false);
    const [email, setEmail] = useState('');
    const limit = 10;
    const page = Math.ceil(historyData.length / limit + 1);
    const axiosPrivate = useAxiosPrivate();


    const fetchData = async () => {
        try {
            const res = await axiosPrivate.get(`/coins/history?page=${page}&limit=${limit}&email=${email}`);
            console.log(res.data);
            setHistoryData([...historyData, ...res.data.history]);
            setTotalData(res.data?.totalHistory || 0)
        }
        catch (err) {
            console.log(err);
        }
        finally {
            setloading(false);
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
    }, [email]);


    if (loading) {
        return <div className="py-8 text-center">Loading...</div>
    }

    return (
        <div>
            <h2 className="title">Referral History</h2>

            {/* user email for filter */}
            <div className="max-w-xl mx-auto">
                <label className="input-label">User{"'"}s Email</label>
                <input type="email" className="input" onChange={(e) => setEmail(e.target.value)} placeholder="User's Email" />
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
                            <div className="max-w-2xl mx-auto space-y-3">
                                {historyData.map((item) => (
                                    <div key={item?._id} className="flex justify-between items-center bg-slate-100 px-4 py-2 rounded-sm">
                                        <div>
                                            <p>{item?.email}</p>
                                            <div className="flex items-center gap-2 text-xs">
                                                <span>{item?.name}</span>
                                                <span><Coin />{item?.amount}</span>
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