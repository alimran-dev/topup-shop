import { useEffect, useState } from "react";
import useAuth from "../../../hooks/useAuth";
import toast from 'react-hot-toast';
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";


const DailyCoinClaim = () => {

    const [show, setShow] = useState(false);
    const [coin, setCoin] = useState(0);
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();
    const axiosPrivate = useAxiosPrivate();

    useEffect(() => {
        setLoading(true);

        axiosPrivate.get("/coins/daily").then((res) => {
            // console.log(res.data);
            setShow(res.data.success || false);
            setCoin(res.data.daily || 0);
            setLoading(false);
        }).catch(err => {
            // console.log(err);
            setLoading(false);
            toast.error(err.response?.data?.message || "Failed to load data!");
        });
    }, [axiosPrivate]);

    // coin claim fn
    const handleClaimCoin = async () => {

        setLoading(true);

        axiosPrivate.patch("/coins/daily", { email: user?.email }).then((res) => {
            // console.log(res.data);
            setShow(res.data.success || false);
            setLoading(false);
            toast.success('Coin Claimed!');
        }).catch(err => {
            // console.log(err);
            setLoading(false);
            toast.error(err.response?.data?.message || "Something Went Wrong!")
        });
    };


    if (loading) {
        <div className="text-center py-8">Loading...</div>
    }

    return (
        <>
            {
                user && show &&
                <div className="flex justify-between items-center gap-3 bg-slate-100 border rounded-full p-2">
                    <p className="ml-3">
                        <span>Collect Coins</span>
                        <span className="ml-2 text-primary text-xs font-semibold">+{coin}</span>
                    </p>
                    <button onClick={handleClaimCoin} className="button !rounded-full">Claim</button>
                </div>
            }
        </>
    );
};

export default DailyCoinClaim;