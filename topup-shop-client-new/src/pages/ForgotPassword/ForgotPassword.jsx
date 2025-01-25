import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAxiosPublic from "../../hooks/useAxiosPublic";
import toast from 'react-hot-toast';


const ForgotPassword = () => {
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const axiosPublic = useAxiosPublic();
    const navigate = useNavigate();


    // check email fn
    const handleEmailSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            const response = await axiosPublic.patch(`/user/forget?email=${email}`);

            if (response.data.success) {
                setStep(2);
                setLoading(false);
            } else {
                setError("Email not found!");
                setLoading(false);
            }
        } catch (err) {
            setError("Something went wrong!");
            setLoading(false);
        }
    };

    // otp fn
    const handleOtpSubmit = async (e) => {

        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            const response = await axiosPublic.patch(`/user/forget?email=${email}&otp=${otp}`);

            if (response.data.success) {
                setStep(3);
                setLoading(false);
            } else {
                setError("Invalid OTP");
                setLoading(false);
            }
        } catch (err) {
            setError("Something went wrong!");
            setLoading(false);
        }
    };

    // new pass fn
    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        if (newPassword !== confirmPassword) {
            setError("Passwords do not match.");
            setLoading(false);
            return;
        }
        try {
            const response = await axiosPublic.patch(`/user/forget?email=${email}&otp=${otp}&newPassword=${newPassword}`);

            if (response.data.success) {
                toast.success('Password reset successful!');
                navigate('/login');
                setLoading(false);
                setEmail("");
                setOtp("");
                setNewPassword("");
                setConfirmPassword("");
            } else {
                setError("Failed to reset password.");
                setLoading(false);
            }
        } catch (err) {
            setError("Something went wrong. Please try again.");
            setLoading(false);
        }
    };

    return (
        <div className="space-y-5 max-w-xl mx-auto p-5 ">
            <h2 className="title ">
                Forgot Password
            </h2>

            {/* step progress bar */}
            <div>
                <ul className="steps w-full">
                    <li className={`step after:!bg-primary after:!text-white`}>Email</li>
                    <li className={`step ${step >= 2 ? "before:!bg-primary after:!bg-primary after:!text-white" : "before:!bg-slate-300 after:!bg-slate-300 after:!text-black"}`}>OTP</li>
                    <li className={`step ${step >= 3 ? "before:!bg-primary after:!bg-primary after:!text-white" : "before:!bg-slate-300 after:!bg-slate-300 after:!text-black"}`}>Password</li>
                </ul>
            </div>

            {/* error message */}
            {error && <p className="text-red-500 text-center font-bold">{error}</p>}

            {/* step 1 / check email */}
            {step === 1 && (
                <form onSubmit={handleEmailSubmit} className="space-y-4">
                    <label className="input-label">
                        Email:
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="input mt-1"
                            placeholder="Your email"
                            required
                        />
                    </label>
                    <button
                        type="submit"
                        className="button block mx-auto"
                        disabled={loading}
                    >
                        {loading ? "Please Wait" : "Check Email"}
                    </button>
                </form>
            )}

            {/* step 1 / check otp */}
            {step === 2 && (
                <form onSubmit={handleOtpSubmit} className="space-y-4">
                    <label className="input-label">
                        OTP:
                        <input
                            type="number"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            className="input mt-1"
                            placeholder="Otp"
                            required
                        />
                    </label>
                    <button
                        type="submit"
                        className="button block mx-auto"
                        disabled={loading}
                    >
                        {loading ? "Please Wait" : "Verify OTP"}
                    </button>
                </form>
            )}

            {/* step 1 / set new password */}
            {step === 3 && (
                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                    <label className="input-label">
                        New Password:
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="input mt-1"
                            placeholder="New password"
                            required
                        />
                    </label>
                    <label className="input-label">
                        Confirm Password:
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm password"
                            className="input mt-1"
                            required
                        />
                    </label>
                    <button
                        type="submit"
                        className="button block mx-auto"
                        disabled={loading}
                    >
                        {loading ? "Please Wait" : " Reset Password"}
                    </button>
                </form>
            )}
        </div>
    );
};

export default ForgotPassword;
