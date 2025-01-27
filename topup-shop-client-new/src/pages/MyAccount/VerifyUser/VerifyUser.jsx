import PropTypes from "prop-types";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";


const VerifyUser = ({ user }) => {

    const axiosPrivate = useAxiosPrivate();

    const handleSendOtp = async() => {

        try{
            const res = await axiosPrivate.post('/', {email: user?.email});
            console.log(res.data);
            document.getElementById('verify_user').showModal();
        }
        catch(err){
            // toast.error("Something Went Wrong!");
        }
    }

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
                    <form>
                        <input type="number" className="input" placeholder="Type OTP here" />
                        <button className="block mx-auto button mt-4">Submit</button>
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