import PropTypes from "prop-types";
import { useState } from "react";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import toast from 'react-hot-toast';


const VerifyUser = ({ user }) => {

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const axiosPrivate = useAxiosPrivate();

    const handleSendOtp = async() => {

        document.getElementById('verify_user').showModal();

        try{
            const res = await axiosPrivate.patch('/user/verify', {email: user?.email});
            if(res.data.success){
                document.getElementById('verify_user').showModal();
            }
            else{
                toast.error("Something Went Wrong!");
            }
        }
        catch(err){
            toast.error("Something Went Wrong!");
        }
    };


    // check otp fn
    const handleCheckOtp = async(e) => {

        e.preventDefault();
        setLoading(true);
        setError("");

        const payload = {
            email: user?.email,
            otp: e.target.otp.value,
        };

        try{
            const res = await axiosPrivate.patch('/user/verify', payload);
            if(res.data.success){
                setLoading(false);
                document.getElementById('verify_user').close();
                toast.success("Verified Successfully!");
                window.location.reload();
            }
            else{
                setLoading(false);
                setError("Invalid OTP");
            }
        }
        catch(err){
            setLoading(false);
            setError("Something Went Wrong!");
        }
    };


    return (
        <div>
            <button onClick={handleSendOtp} className={`${user?.isVerified ? 'hidden' : 'text-xs text-blue-600 hover:underline'}`}>Verify Now</button>
            <dialog id="verify_user" className="modal">
                <div className="modal-box bg-white">
                    <form method="dialog">
                        {/* if there is a button in form, it will close the modal */}
                        <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
                    </form>
                    <h3 className="font-bold text-lg">Verify Account</h3>
                    <p className="py-4">An OTP sent to your email</p>
                    <form onSubmit={handleCheckOtp}>
                        <input type="number" name="otp" className="input" placeholder="Type OTP here" />
                        {error && <p className="text-red-600 font-semibold py-2 text-center">{error}</p>}
                        <button className="block mx-auto button mt-4" disabled={loading}>
                            {loading ? "Please Wait" : "Submit"}
                        </button>
                    </form>
                </div>
            </dialog>
        </div>
    );
};

VerifyUser.propTypes = {
    user: PropTypes.shape({
        isVerified: PropTypes.bool.isRequired,
        email: PropTypes.string.isRequired,
    }).isRequired,
};

export default VerifyUser;