import { useState } from "react";
import useAuth from "../../../hooks/useAuth";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import toast from 'react-hot-toast';


const ClaimRedeemCode = () => {

    const [btnLoading, setBtnLoading] = useState(false);
    const { user, setUser } = useAuth();
    const axiosPrivate = useAxiosPrivate();



    // redeem code claim fn
    const handleClaimRedeemCode = async (e) => {

        e.preventDefault()
        setBtnLoading(true);

        const code = { code: e.target.code.value };

        console.log(code);


        try {
            const res = await axiosPrivate.patch("/redeem/check", code);
            console.log("redeem-------------", res.data);
        } catch (error) {
            // console.error("Error fetching claimed codes:", error);
            toast.error(error.response.data.message || "Something Went Wrong!")
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
                    <input type="text" name="code" className="input !rounded-full" placeholder="Type Redeem Code..." />
                    <button type="submit" className="absolute top-2 right-2 bg-primary px-5 py-1 text-white rounded-full" disabled={btnLoading}>
                        {btnLoading ? "Loading..." : "Claim"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ClaimRedeemCode;