import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import toast from "react-hot-toast";



const RedeemClaimedList = () => {

    const { id } = useParams();
    const [list, setList] = useState([]);
    const [loading, setLoading] = useState(false);
    const axiosPrivate = useAxiosPrivate();

    // load claimed list
    useEffect(() => {
        setLoading(true);
        const fetchData = async () => {
            const res = await axiosPrivate.get(`/redeem/claimedBy?id=${id}`);
            // console.log(res.data);
            if (res.data) {
                setList(res?.data?.claimedBy);
                setLoading(false);
            }
            else {
                toast.error('Something went wrong!');
                setLoading(false);
            }
        }
        fetchData();
    }, [axiosPrivate, id])

    return (
        <div>
            <h2 className="title">Claimed List</h2>
            {
                loading ?
                    <div className="py-10 text-center">Loading...</div>
                    :
                    <>
                        {
                            list?.length == 0 ?
                                <div className="py-10 text-center">No Data Found!</div>
                                :
                                <div className="max-w-screen-md mx-auto">
                                    {
                                        list?.map((item, idx) =>
                                            <div key={item?._id || idx} className={`${idx % 2 ? "bg-slate-100" : "bg-slate-200"} py-2`}>
                                                Name
                                            </div>
                                        )
                                    }
                                </div>
                        }
                    </>
            }
        </div>
    );
};

export default RedeemClaimedList;