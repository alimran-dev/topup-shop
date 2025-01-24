import { useState } from "react";
// import useAxiosPublic from "../../hooks/useAxiosPublic";

const ForgotPassword = () => {
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    // const axiosPublic = useAxiosPublic();


    // check email fn
    const handleEmailSubmit = async (e) => {

        setStep(2);

        e.preventDefault();
        setError("");
        // try {
        //     const response = await axiosPublic.get("/auth/check-email", { email });
        //     if (response.data.success) {
        //         setStep(2);
        //     } else {
        //         setError("Email not found!");
        //     }
        // } catch (err) {
        //     setError("Something went wrong. Please try again.");
        // }
    };

    // otp fn
    const handleOtpSubmit = async (e) => {

        setStep(3);

        e.preventDefault();
        setError("");
        // try {
        //     const response = await axiosPublic.get("/auth/verify-otp", { email, otp });
        //     if (response.data.success) {
        //         setStep(3);
        //     } else {
        //         setError("Invalid OTP. Please try again.");
        //     }
        // } catch (err) {
        //     setError("Something went wrong. Please try again.");
        // }
    };

    // new pass fn
    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setError("");
        if (newPassword !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }
        // try {
        //     const response = await axiosPublic.patch("/auth/reset-password", {
        //         email,
        //         newPassword,
        //     });
        //     if (response.data.success) {
        //         alert("Password reset successful. Please log in with your new password.");
        //         setStep(1);
        //         setEmail("");
        //         setOtp("");
        //         setNewPassword("");
        //         setConfirmPassword("");
        //     } else {
        //         setError("Failed to reset password.");
        //     }
        // } catch (err) {
        //     setError("Something went wrong. Please try again.");
        // }
    };

    return (
        <div className="space-y-5 max-w-xl mx-auto p-5 ">
            <h2 className="title ">
                Forgot Password
            </h2>

            {/* step progress bar */}
            <div>
                <ul className="steps w-full">
                    <li className={`step ${step >= 1 ? "step-primary" : ""}`}>Email</li>
                    <li className={`step ${step >= 2 ? "step-primary" : ""}`}>OTP</li>
                    <li className={`step ${step === 3 ? "step-primary" : ""}`}>Password</li>
                </ul>
            </div>

            {/* step 1 / check email */}
            {error && <p className="text-red-500 text-center">{error}</p>}
            {step === 1 && (
                <form onSubmit={handleEmailSubmit} className="space-y-4">
                    <label className="input-label">
                        Email:
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="input mt-1"
                            required
                        />
                    </label>
                    <button
                        type="submit"
                        className="button block mx-auto"
                    >
                        Check Email
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
                            required
                        />
                    </label>
                    <button
                        type="submit"
                        className="button block mx-auto"
                    >
                        Verify OTP
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
                            required
                        />
                    </label>
                    <label className="input-label">
                        Confirm Password:
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="input mt-1"
                            required
                        />
                    </label>
                    <button
                        type="submit"
                        className="button block mx-auto"
                    >
                        Reset Password
                    </button>
                </form>
            )}
        </div>
    );
};

export default ForgotPassword;
