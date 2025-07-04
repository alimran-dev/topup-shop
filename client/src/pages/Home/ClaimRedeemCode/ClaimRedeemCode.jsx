import { useState } from "react";
import useAuth from "../../../hooks/useAuth";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import toast from 'react-hot-toast';
import { useNavigate } from "react-router-dom";


const ClaimRedeemCode = () => {

    const [btnLoading, setBtnLoading] = useState(false);
    const { user, setUser } = useAuth();
    const axiosPrivate = useAxiosPrivate();
    const navigate = useNavigate();


    // redeem code claim fn
    const handleClaimRedeemCode = async (e) => {

        e.preventDefault()
        setBtnLoading(true);

        const code = { code: e.target.code.value };
        // console.log(code);

        // if user is not varified
        if (!user?.isVerified) {
            setBtnLoading(false);
            toast.error("Please Verify Your Email!");
            navigate("/myAccount")
            return;
        }

        // api call
        try {
            const res = await axiosPrivate.patch("/redeem/check", code);
            if (res?.data?.success) {
                toast.success(res?.data?.message || "Code Clamined!");
                if(res?.data?.type==="balance"){
                    setUser({...user,balance: user?.balance+res?.data?.amount})
                }else if(res?.data?.type==="coin"){
                    setUser({...user,coins: user?.coins+res?.data?.amount});
                }
            }
            else {
                toast.error("Something Went Wrong!");
            }
        } catch (error) {
            // console.error("Error fetching claimed codes:", error);
            toast.error(error.response.data.message || "Something Went Wrong!");
        } finally {
            setBtnLoading(false);
        }
    };


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