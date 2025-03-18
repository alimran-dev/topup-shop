import { useEffect, useState } from "react";
import useAuth from "../../../hooks/useAuth";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";



const ClaimRedeemCode = () => {

    const [loading, setLoading] = useState(false);
    const [btnLoading, setBtnLoading] = useState(false);
    const { user, setUser } = useAuth();
    const axiosPrivate = useAxiosPrivate();


    useEffect(() => {
        const fetchData= async () => {

        };

        fetchData();
    }, []);


    // redeem code claim fn
    const handleClaimRedeemCode = async () => {
        setBtnLoading(true);
        try {
            const res = await axiosPrivate.get(`/redeem/check`);
            console.log("redeem-------------", res.data);

            // setClaimedCodes(res.data);
        } catch (error) {
            console.error("Error fetching claimed codes:", error);
        } finally {
            setBtnLoading(false);
        }
    };


    // console.log(user);



    return (
        <div className={`${!user && "hidden"} md:mt-8 p-4 bg-slate-100 rounded-md`}>
            <h2 className="text-center text-primary text-base md:text-xl font-bold mb-2 uppercase">Claim Redeem Code</h2>
            <form onSubmit={handleClaimRedeemCode}>
                <div className="relative">
                    <input type="text" className="input !rounded-full" placeholder="Type Redeem Code..." />
                    <button type="submit" className="absolute top-2 right-2 bg-primary px-5 py-1 text-white rounded-full" disabled={btnLoading}>
                        {btnLoading ? "Loading..." : "Claim"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ClaimRedeemCode;